import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

let mcpClient: Client | null = null;
let transport: StreamableHTTPClientTransport | null = null;

export async function getMcpClient(): Promise<Client> {
  if (mcpClient) return mcpClient;

  transport = new StreamableHTTPClientTransport(
    new URL("https://mcp.kapruka.com/mcp")
  );

  mcpClient = new Client({ name: "kiki", version: "1.0.0" });
  await mcpClient.connect(transport);
  console.log("[MCP] Connected to Kapruka MCP server");

  return mcpClient;
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

export async function callKaprukaTool(
  toolName: string,
  args: Record<string, unknown>,
  useCache = true
): Promise<unknown> {
  const client = await getMcpClient();
  const cacheKey = getCacheKey(toolName, args);

  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.result;
    }
  }

  const result = await client.callTool(
    { name: toolName, arguments: args },
    undefined,
    { timeout: 30000 }
  );

  const normalizedResult = normalizeToolResult(result);

  if (useCache) {
    cache.set(cacheKey, { result: normalizedResult, expiry: Date.now() + CACHE_TTL });
  }

  return normalizedResult;
}

export async function listKaprukaTools() {
  const client = await getMcpClient();
  return client.listTools();
}
