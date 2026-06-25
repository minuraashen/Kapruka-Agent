import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { callKaprukaTool, enrichProductsWithImages } from "../lib/mcp-client";
import {
  extractMarkdown,
  parseSearchResults,
  parseProductDetail,
  parseOrderResult,
  parseDeliveryResult,
  parseTrackingResult,
} from "../lib/kapruka-parse";
import OpenAI from "openai";
import { env } from "../lib/env";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getLlmClient() {
  if (!env.llmApiKey || !env.llmModel) {
    throw new Error(
      "Missing LLM configuration. Set LLM_API_KEY and LLM_MODEL for OpenRouter."
    );
  }

  return new OpenAI({
    apiKey: env.llmApiKey,
    baseURL: env.llmBaseUrl,
    maxRetries: 1,
    timeout: 30000,
  });
}

function getStatus(error: unknown): number | undefined {
  return error && typeof error === "object"
    ? (error as { status?: number }).status
    : undefined;
}

// Call the LLM across the configured free-model fallback chain. A free model
// that 429s (or otherwise errors) is retried with backoff, then we fall through
// to the next model in env.llmModels. This is the zero-cost substitute for a
// paid model: if one free model is rate-limited, another usually answers.
async function createChatCompletion(
  client: OpenAI,
  body: Omit<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming, "model">
): Promise<OpenAI.Chat.ChatCompletion> {
  const models = env.llmModels.length > 0 ? env.llmModels : [env.llmModel];
  let lastError: unknown;

  for (let m = 0; m < models.length; m++) {
    const model = models[m];
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await client.chat.completions.create({ ...body, model });
      } catch (error) {
        lastError = error;
        const status = getStatus(error);
        // Rate-limited: back off and retry the same model a couple of times…
        if (status === 429 && attempt < 2) {
          const delay = 1200 * (attempt + 1);
          console.warn(`[LLM] 429 on ${model}; retry in ${delay}ms`);
          await sleep(delay);
          continue;
        }
        // …otherwise stop retrying this model and fall through to the next one.
        console.warn(
          `[LLM] ${model} failed (${status ?? "no status"}); ` +
            (m < models.length - 1 ? "falling back to next model" : "no more models")
        );
        break;
      }
    }
  }

  throw lastError ?? new Error("All configured LLM models failed.");
}

function getLlmErrorMessage(error: unknown) {
  const status = error && typeof error === "object" ? (error as { status?: number }).status : undefined;

  if (status === 429) {
    return "OpenRouter is rate-limiting the selected free model right now. Please wait a bit and try again, or switch `LLM_MODEL` to another free OpenRouter model.";
  }

  if (status === 401) {
    return "OpenRouter rejected the configured API key. Please check `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL` in `.env`.";
  }

  return "OpenRouter is unavailable right now. Please check the server logs and LLM settings in `.env`.";
}

// Tool definitions for OpenAI-compatible function calling.
const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "kapruka_search_products",
      description:
        "Search the Kapruka catalog by keyword with optional category, price range, stock filter, and sorting. Returns a list of matching products with images, prices, and URLs.",
      parameters: {
        type: "object",
        properties: {
          q: { type: "string", description: "Search keyword (e.g., 'chocolate cake', 'flowers', 'gift box')" },
          category: { type: "string", description: "Category name to filter by" },
          min_price: { type: "number", description: "Minimum price in LKR" },
          max_price: { type: "number", description: "Maximum price in LKR" },
          in_stock_only: { type: "boolean", description: "Only show in-stock items" },
          sort: { type: "string", enum: ["relevance", "price_asc", "price_desc", "newest"], description: "Sort order" },
          limit: { type: "number", description: "Number of results (default 10, max 30)" },
          currency: { type: "string", default: "LKR" },
        },
        required: ["q"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kapruka_get_product",
      description: "Get full details for a specific product by ID including images, variants, shipping info.",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string" },
          currency: { type: "string", default: "LKR" },
        },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kapruka_list_categories",
      description: "List all top-level product categories available on Kapruka.",
      parameters: {
        type: "object",
        properties: {
          depth: { type: "number", description: "How many levels of subcategories to include" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kapruka_list_delivery_cities",
      description: "Search Kapruka's delivery network for cities. Returns matching city names.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "City name or partial name (e.g., 'Colombo', 'Kandy')" },
          limit: { type: "number" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kapruka_check_delivery",
      description: "Check if delivery is available to a city on a specific date. Returns delivery fee and availability.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string" },
          delivery_date: { type: "string", description: "Date in YYYY-MM-DD format" },
          product_id: { type: "string", description: "Optional product ID for perishable items (cakes/flowers)" },
        },
        required: ["city", "delivery_date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kapruka_create_order",
      description:
        "Create a guest checkout order. Returns a click-to-pay URL valid for 60 minutes. Do NOT call this until ALL required fields are collected from the user.",
      parameters: {
        type: "object",
        properties: {
          cart: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product_id: { type: "string" },
                quantity: { type: "number" },
              },
              required: ["product_id", "quantity"],
            },
          },
          recipient: {
            type: "object",
            properties: {
              name: { type: "string" },
              address: { type: "string" },
              city: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
            },
            required: ["name", "address", "city", "phone"],
          },
          delivery: {
            type: "object",
            properties: {
              date: { type: "string" },
              instructions: { type: "string" },
            },
            required: ["date"],
          },
          sender: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
            },
            required: ["name", "email"],
          },
          gift_message: { type: "string" },
          currency: { type: "string", default: "LKR" },
        },
        required: ["cart", "recipient", "delivery", "sender"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kapruka_track_order",
      description: "Track an existing Kapruka order by order number.",
      parameters: {
        type: "object",
        properties: {
          order_number: { type: "string" },
        },
        required: ["order_number"],
      },
    },
  },
];

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
      const openrouter = getLlmClient();

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

        // Free OpenRouter models rate-limit aggressively — retry with backoff
        // and fall through the configured free-model chain on failure.
        try {
          response = await createChatCompletion(openrouter, {
            messages: messagesForAI,
            tools: TOOLS,
            tool_choice: "auto",
            temperature: 0.8,
          });
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error("[LLM] Chat completion failed:", errorMsg);
          assistantContent = getLlmErrorMessage(error);
        }

        if (!response) break;

        const message = response.choices[0].message;

        if (message.content) {
          assistantContent += message.content;
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

        break;
      }

      return {
        message: assistantContent || "Let me help you with that!",
        functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
      };
    }),
});
