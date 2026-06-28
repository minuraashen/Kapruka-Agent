import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import {
  callKaprukaTool,
  enrichProductsWithImages,
  listKaprukaTools,
} from "../lib/mcp-client";
import {
  extractMarkdown,
  parseSearchResults,
  parseProductDetail,
  parseOrderResult,
  parseDeliveryResult,
  parseTrackingResult,
} from "../lib/kapruka-parse";
import OpenAI from "openai";
import { env, type LlmProvider } from "../lib/env";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// One OpenAI client per (baseUrl + key), reused across requests.
const clientCache = new Map<string, OpenAI>();

function getClientFor(provider: LlmProvider): OpenAI {
  const cacheKey = `${provider.baseUrl}::${provider.apiKey}`;
  let client = clientCache.get(cacheKey);
  if (!client) {
    client = new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl,
      // We run our own retry/backoff + cross-provider fallback below, so disable
      // the SDK's built-in retries to avoid compounding the wait on a 429.
      maxRetries: 0,
      timeout: 30000,
    });
    clientCache.set(cacheKey, client);
  }
  return client;
}

function getStatus(error: unknown): number | undefined {
  return error && typeof error === "object"
    ? (error as { status?: number }).status
    : undefined;
}

// Call the LLM across the configured cross-provider fallback chain. A provider
// that 429s (or otherwise errors) is retried with backoff, then we fall through
// to the next provider in env.llmProviders. Because the chain spans different
// providers (e.g. Groq → OpenRouter), each has its own rate-limit bucket — the
// zero-cost substitute for a paid model.
async function createChatCompletion(
  body: Omit<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming, "model">
): Promise<OpenAI.Chat.ChatCompletion> {
  const providers = env.llmProviders;
  if (providers.length === 0) {
    throw new Error(
      'No LLM providers configured. Set LLM_PROVIDERS (e.g. "groq|qwen/qwen3-32b") ' +
        "with the matching <PROVIDER>_API_KEY, or the legacy LLM_API_KEY/LLM_MODEL."
    );
  }

  let lastError: unknown;

  for (let p = 0; p < providers.length; p++) {
    const provider = providers[p];
    const tag = `${provider.label}:${provider.model}`;

    if (!provider.apiKey) {
      console.warn(`[LLM] ${tag}: no API key configured; skipping`);
      lastError = new Error(`Missing API key for provider "${provider.label}".`);
      continue;
    }

    const client = getClientFor(provider);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await client.chat.completions.create({
          ...body,
          model: provider.model,
        });
      } catch (error) {
        lastError = error;
        const status = getStatus(error);
        // Rate-limited: back off and retry the same provider a couple of times…
        if (status === 429 && attempt < 2) {
          const delay = 1200 * (attempt + 1);
          console.warn(`[LLM] 429 on ${tag}; retry in ${delay}ms`);
          await sleep(delay);
          continue;
        }
        // …otherwise stop and fall through to the next provider in the chain.
        console.warn(
          `[LLM] ${tag} failed (${status ?? "no status"}); ` +
            (p < providers.length - 1
              ? "falling back to next provider"
              : "no more providers")
        );
        break;
      }
    }
  }

  throw lastError ?? new Error("All configured LLM providers failed.");
}

function getLlmErrorMessage(error: unknown) {
  const status = getStatus(error);

  if (status === 429) {
    return "All configured LLM providers are rate-limited right now. Please wait a moment and try again.";
  }

  if (status === 401) {
    return "An LLM provider rejected its API key. Please check the provider API keys in `.env`.";
  }

  return "The AI service is unavailable right now. Please check the server logs and LLM settings in `.env`.";
}

// MCP tool schemas are the single source of truth. We fetch them from the MCP
// server at runtime and convert to OpenAI's function-calling format instead of
// hand-duplicating them here (which silently drifts when the MCP server changes).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>;

// Inline every `#/$defs/...` reference so the schema we hand the model is fully
// self-contained — free models handle plain inline JSON Schema more reliably
// than $ref/$defs indirection.
function dereference(
  schema: JsonSchema,
  defs: Record<string, JsonSchema>
): JsonSchema {
  if (Array.isArray(schema)) {
    return schema.map((s) => dereference(s, defs)) as unknown as JsonSchema;
  }
  if (!schema || typeof schema !== "object") return schema;

  if (typeof schema.$ref === "string") {
    const name = schema.$ref.replace("#/$defs/", "");
    return dereference(defs[name] ?? {}, defs);
  }

  const out: JsonSchema = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === "$defs") continue;
    out[key] = dereference(value as JsonSchema, defs);
  }
  return out;
}

let toolsCache: OpenAI.Chat.ChatCompletionTool[] | null = null;

// Build the OpenAI tool list from the live MCP definitions. The MCP wraps every
// tool's arguments under a single `params` object, so we unwrap that level here —
// the model then produces flat arguments and callKaprukaTool re-wraps them.
async function getTools(): Promise<OpenAI.Chat.ChatCompletionTool[]> {
  if (toolsCache) return toolsCache;

  const { tools } = await listKaprukaTools();
  toolsCache = tools.map((tool) => {
    const schema = (tool.inputSchema ?? {}) as JsonSchema;
    const defs = (schema.$defs ?? {}) as Record<string, JsonSchema>;
    const paramsSchema = schema.properties?.params;
    const parameters = paramsSchema
      ? dereference(paramsSchema, defs)
      : { type: "object", properties: {} };

    return {
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: parameters as Record<string, unknown>,
      },
    };
  });

  return toolsCache;
}

const BASE_SYSTEM_PROMPT = `You are Kiki, a warm, witty, and helpful AI shopping assistant for Kapruka — Sri Lanka's largest e-commerce platform. You help customers discover products, send gifts, and complete purchases. Today's date is ${new Date().toISOString().slice(0, 10)}.

Your personality:
- Friendly and warm like a helpful friend ("aiya/akki" energy, never pushy)
- A bit playful and witty — use light humor
- Enthusiastic about finding the perfect gift or product
- Patient and thorough when collecting order details
- Use Sri Lankan context naturally (cities like Colombo, Kandy, Galle; occasions like Avurudu, Vesak, Christmas, birthdays)

Language:
- Reply in the language the customer uses. If they write in Sinhala (සිංහල) reply in Sinhala. If they write in Tanglish/Singlish (Sinhala in English letters, e.g. "mata cake ekak ganna ona"), match that style warmly.
- Default to English when the customer writes in English.

Guidelines:
- The product search results you receive already render as beautiful visual cards in the UI, so DON'T re-list every product as text. Instead, briefly introduce them ("Here are a few lovely options 🍫") and add a helpful opinion or recommendation about the top pick.
- When the customer is undecided, help them compare: contrast 2–3 options on price, occasion-fit, or wow-factor and confidently recommend one. Guide them from "I'm not sure" to "add to cart".
- The customer has a live cart in the UI (shown to you below when non-empty). When they say things like "checkout", "buy these", or "order what's in my cart", use exactly those cart items — do not invent products or ask them to re-list what they already added.
- Before creating an order, you MUST collect: recipient name, address, city, phone, delivery date, plus sender name and email.
- You MUST call kapruka_check_delivery for the recipient's city and chosen delivery date (passing product_id for cakes/flowers) and confirm delivery is available BEFORE calling kapruka_create_order. If delivery isn't available, suggest an alternative date or city.
- Always confirm a short order summary (items, recipient, city, date, total) before calling kapruka_create_order.
- Proactively offer to add a gift message for gift orders.
- Default currency is LKR (Sri Lankan Rupees). Always format prices like "LKR 6,850".
- If you're unsure what someone wants, ask one focused question rather than guessing.

Keep responses concise but warm. Use a few tasteful emojis. Don't be overly formal, and never dump raw JSON or IDs at the customer.`;

function buildSystemPrompt(
  language: "en" | "si",
  cart: Array<{ product_id: string; name: string; price: number; quantity: number }>
): string {
  let prompt = BASE_SYSTEM_PROMPT;

  if (language === "si") {
    prompt +=
      "\n\nThe customer's interface is currently set to Sinhala (සිංහල). Prefer replying in clear, friendly, everyday Sinhala unless they explicitly write to you in English.";
  }

  if (cart.length > 0) {
    const lines = cart
      .map(
        (item) =>
          `- ${item.name} (ID: ${item.product_id}) × ${item.quantity} — LKR ${(
            item.price * item.quantity
          ).toLocaleString()}`
      )
      .join("\n");
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    prompt += `\n\nThe customer's CURRENT CART (from the UI) contains:\n${lines}\nCart total: LKR ${total.toLocaleString()}\nIf they want to check out, use exactly these items.`;
  }

  return prompt;
}

export const chatRouter = createRouter({
  // Stateless: the client sends the recent conversation history, the live cart,
  // and the UI language with every message. No database is involved.
  sendMessage: publicQuery
    .input(
      z.object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          )
          .default([]),
        cart: z
          .array(
            z.object({
              product_id: z.string(),
              name: z.string(),
              price: z.number(),
              quantity: z.number(),
            })
          )
          .default([]),
        language: z.enum(["en", "si"]).default("en"),
      })
    )
    .mutation(async ({ input }) => {
      const tools = await getTools();

      // Keep the prompt bounded — only the most recent turns matter.
      const history = input.messages.slice(-16);

      const messagesForAI: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: buildSystemPrompt(input.language, input.cart) },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      let assistantContent = "";
      const functionCalls: Array<{
        name: string;
        arguments: Record<string, unknown>;
        result?: unknown;
      }> = [];

      // Up to 5 iterations of tool calling
      for (let i = 0; i < 5; i++) {
        let response: OpenAI.Chat.ChatCompletion | undefined;

        // Free models rate-limit aggressively — retry with backoff and fall
        // through the configured cross-provider chain on failure.
        try {
          response = await createChatCompletion({
            messages: messagesForAI,
            tools,
            tool_choice: "auto",
            temperature: 0.8,
          });
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error("[LLM] Chat completion failed:", errorMsg);
          // Only surface the error if we have nothing to show yet; otherwise keep
          // the partial answer (and any product cards already fetched).
          if (!assistantContent) assistantContent = getLlmErrorMessage(error);
        }

        if (!response) break;

        const message = response.choices[0].message;

        // Keep the most recent non-empty assistant text. Some models emit the
        // user-facing message *alongside* the tool call, others only *after* the
        // tool results return. Taking the latest non-empty content (assign, not
        // append) captures either pattern without duplicating text across the
        // tool-calling iterations.
        if (message.content) {
          assistantContent = message.content;
        }

        if (message.tool_calls && message.tool_calls.length > 0) {
          const toolCalls = message.tool_calls as Array<{
            id: string;
            type: string;
            function: { name: string; arguments: string };
          }>;
          messagesForAI.push({
            role: "assistant",
            content: message.content || null,
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: {
                name: tc.function.name,
                arguments: tc.function.arguments,
              },
            })),
          });

          for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            let functionArgs: Record<string, unknown> = {};
            try {
              functionArgs = JSON.parse(toolCall.function.arguments || "{}");
            } catch {
              functionArgs = {};
            }

            try {
              const rawResult = await callKaprukaTool(
                functionName,
                functionArgs,
                functionName !== "kapruka_create_order"
              );

              // The MCP returns Markdown. We parse it into structured data so
              // the UI can render rich cards, while still handing readable text
              // to the model.
              let result: unknown = rawResult;
              let modelContent = extractMarkdown(rawResult);

              if (functionName === "kapruka_search_products") {
                const markdown = extractMarkdown(rawResult);
                const products = await enrichProductsWithImages(
                  parseSearchResults(markdown)
                );
                result = { count: products.length, products, summary: markdown };
                modelContent = markdown;
              } else if (functionName === "kapruka_get_product") {
                const markdown = extractMarkdown(rawResult);
                const product = parseProductDetail(markdown);
                result = { product, summary: markdown };
                modelContent = markdown;
              } else if (functionName === "kapruka_check_delivery") {
                const delivery = parseDeliveryResult(rawResult);
                result = { delivery };
                modelContent = delivery.raw;
              } else if (functionName === "kapruka_track_order") {
                const tracking = parseTrackingResult(rawResult);
                result = { tracking };
                modelContent = tracking.raw;
              } else if (functionName === "kapruka_create_order") {
                const order = parseOrderResult(rawResult);
                result = { order };
                modelContent = order.raw;
              }

              functionCalls.push({
                name: functionName,
                arguments: functionArgs,
                result,
              });

              messagesForAI.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: modelContent,
              });
            } catch (error) {
              const errorMsg =
                error instanceof Error ? error.message : String(error);
              messagesForAI.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ error: errorMsg }),
              });
            }
          }

          continue;
        }

        // No tool calls → this message is the final answer (its content, if any,
        // was already captured above).
        break;
      }

      return {
        message: assistantContent || "Let me help you with that!",
        functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
      };
    }),
});
