import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  extractMarkdown,
  parseProductDetail,
  type ParsedProduct,
} from "./kapruka-parse";

let mcpClient: Client | null = null;
let transport: StreamableHTTPClientTransport | null = null;
let connectPromise: Promise<Client> | null = null;

export async function getMcpClient(): Promise<Client> {
  if (mcpClient) return mcpClient;
  // Dedupe concurrent connects (the chat loop fires several tool calls at once).
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    transport = new StreamableHTTPClientTransport(
      new URL("https://mcp.kapruka.com/mcp")
    );
    const client = new Client({ name: "kiki", version: "1.0.0" });
    await client.connect(transport);
    mcpClient = client;
    console.log("[MCP] Connected to Kapruka MCP server");
    return client;
  })();

  try {
    return await connectPromise;
  } catch (error) {
    // Reset so the next call can retry a fresh connection.
    connectPromise = null;
    transport = null;
    mcpClient = null;
    throw error;
  } finally {
    connectPromise = null;
  }
}

export async function closeMcpClient(): Promise<void> {
  if (transport) {
    await transport.close();
    transport = null;
    mcpClient = null;
    console.log("[MCP] Disconnected from Kapruka MCP server");
  }
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function normalizeToolResult(result: unknown): unknown {
  if (!result || typeof result !== "object") {
    return result;
  }

  const structuredContent = (result as { structuredContent?: unknown }).structuredContent;
  if (structuredContent !== undefined) {
    return structuredContent;
  }

  const content = (result as { content?: unknown }).content;
  if (!Array.isArray(content) || content.length === 0) {
    return result;
  }

  const textBlock = content.find(
    (item): item is { text?: string } =>
      Boolean(item && typeof item === "object" && typeof (item as { text?: unknown }).text === "string")
  );

  if (!textBlock?.text) {
    return result;
  }

  return tryParseJson(textBlock.text);
}

// Tool result cache (30s TTL for reads)
const cache = new Map<string, { result: unknown; expiry: number }>();
const CACHE_TTL = 30000;

function getCacheKey(tool: string, args: Record<string, unknown>): string {
  return `${tool}:${JSON.stringify(args)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelayMs(error: unknown, attempt: number): number | null {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const code = (error as { code?: number })?.code;
  const isRateLimited = code === 429 || /rate.?limit|429/i.test(message);
  if (!isRateLimited) return null;

  // The server tells us how long to wait, e.g. "Retry in 2s".
  const hint = message.match(/retry in\s*(\d+)\s*s/i);
  if (hint) return Number(hint[1]) * 1000 + 250;
  // Otherwise back off exponentially: 1s, 2s, 4s.
  return Math.min(1000 * 2 ** attempt, 5000);
}

/**
 * Call a Kapruka MCP tool. The MCP wraps every tool's arguments in a single
 * `params` object, so we do that here centrally. Retries transient rate-limits.
 */
export async function callKaprukaTool(
  toolName: string,
  args: Record<string, unknown>,
  useCache = true
): Promise<unknown> {
  const cacheKey = getCacheKey(toolName, args);

  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.result;
    }
  }

  const MAX_ATTEMPTS = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const client = await getMcpClient();
      const result = await client.callTool(
        { name: toolName, arguments: { params: args } },
        undefined,
        { timeout: 30000 }
      );

      const normalizedResult = normalizeToolResult(result);

      if (useCache) {
        cache.set(cacheKey, {
          result: normalizedResult,
          expiry: Date.now() + CACHE_TTL,
        });
      }

      return normalizedResult;
    } catch (error) {
      lastError = error;
      const delay = getRetryDelayMs(error, attempt);
      if (delay === null || attempt === MAX_ATTEMPTS - 1) break;
      console.warn(
        `[MCP] ${toolName} rate-limited; retrying in ${delay}ms (attempt ${attempt + 1})`
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Search results don't include images, but product details do. Fetch details
 * for the top few products (in parallel) and merge in their image + blurb so
 * the UI can render real product cards.
 */
export async function enrichProductsWithImages(
  products: ParsedProduct[],
  max = 6
): Promise<ParsedProduct[]> {
  const enrichable = products.slice(0, max);

  const enriched = await Promise.all(
    enrichable.map(async (product) => {
      if (!product.product_id) return product;
      try {
        const raw = await callKaprukaTool("kapruka_get_product", {
          product_id: product.product_id,
        });
        const detail = parseProductDetail(extractMarkdown(raw));
        if (!detail) return product;
        return {
          ...product,
          image: detail.image ?? product.image,
          description: detail.description ?? product.description,
          category: detail.category ?? product.category,
          vendor: detail.vendor ?? product.vendor,
        };
      } catch {
        return product;
      }
    })
  );

  return [...enriched, ...products.slice(max)];
}

export async function listKaprukaTools() {
  const client = await getMcpClient();
  return client.listTools();
}
