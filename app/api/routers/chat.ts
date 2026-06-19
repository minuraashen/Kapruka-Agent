import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { callKaprukaTool } from "../lib/mcp-client";
import { getDb } from "../queries/connection";
import { chatMessages, chatSessions } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import OpenAI from "openai";
import { env } from "../lib/env";

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
    timeout: 20000,
  });
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

const SYSTEM_PROMPT = `You are Kiki, a warm, witty, and helpful AI shopping assistant for Kapruka — Sri Lanka's largest e-commerce platform. You help customers discover products, send gifts, and complete purchases.

Your personality:
- Friendly and warm like a helpful friend
- A bit playful and witty — use light humor
- Enthusiastic about finding the perfect gift or product
- Patient and thorough when collecting order details
- Use Sri Lankan context naturally (mentioning cities, occasions like Avurudu, etc.)

Guidelines:
- Always show products with images when available
- Guide users step by step through checkout
- Before creating an order, you MUST collect: recipient name, address, city, phone, delivery date, sender name and email
- Offer to add gift messages for gift orders
- Default currency is LKR (Sri Lankan Rupees)
- If a product has variants, ask which one they prefer
- When showing search results, highlight the top 3-5 most relevant items
- For delivery, remind users that cakes/flowers need a product_id for perishable checks

Keep responses concise but warm. Use occasional emojis sparingly. Don't be overly formal.`;

export const chatRouter = createRouter({
  sendMessage: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const openrouter = getLlmClient();

      // Ensure session exists
      const existingSession = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.sessionId, input.sessionId));

      if (existingSession.length === 0) {
        await db.insert(chatSessions).values({
          sessionId: input.sessionId,
          state: "onboarding",
        });
      }

      // Store user message
      await db.insert(chatMessages).values({
        sessionId: input.sessionId,
        role: "user",
        content: input.message,
      });

      // Get recent messages for context
      const recentMessages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(20);

      const messagesForAI: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentMessages.reverse().map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      // Call OpenRouter with OpenAI-compatible function calling.
      let assistantContent = "";
      let functionCalls: Array<{
        name: string;
        arguments: Record<string, unknown>;
        result?: unknown;
      }> = [];

      // Up to 5 iterations of tool calling
      for (let i = 0; i < 5; i++) {
        let response: OpenAI.Chat.ChatCompletion;

        try {
          response = await openrouter.chat.completions.create({
            model: env.llmModel,
            messages: messagesForAI,
            tools: TOOLS,
            tool_choice: "auto",
            temperature: 0.8,
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error("[LLM] Chat completion failed:", errorMsg);
          assistantContent = getLlmErrorMessage(error);
          break;
        }

        const message = response.choices[0].message;

        if (message.content) {
          assistantContent += message.content;
        }

        if (message.tool_calls && message.tool_calls.length > 0) {
          // Add assistant's tool call request to messages
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

          // Execute each tool call
          for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

            try {
              const result = await callKaprukaTool(
                functionName,
                functionArgs,
                functionName !== "kapruka_create_order"
              );

              functionCalls.push({
                name: functionName,
                arguments: functionArgs,
                result,
              });

              // Add tool result to messages
              messagesForAI.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
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

          // Continue loop to let AI process tool results
          continue;
        }

        // No tool calls, we're done
        break;
      }

      // Store assistant message
      const metadata = functionCalls.length > 0 ? { functionCalls } : undefined;
      await db.insert(chatMessages).values({
        sessionId: input.sessionId,
        role: "assistant",
        content: assistantContent || "Let me help you with that!",
        metadata,
      });

      return {
        message: assistantContent || "Let me help you with that!",
        functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
      };
    }),

  getHistory: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId))
        .orderBy(chatMessages.createdAt);

      return messages;
    }),

  getSession: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const sessions = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.sessionId, input.sessionId));

      return sessions[0] || null;
    }),

  updateSessionState: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        state: z.string(),
        intent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(chatSessions)
        .set({
          state: input.state,
          intent: input.intent,
          updatedAt: new Date(),
        })
        .where(eq(chatSessions.sessionId, input.sessionId));

      return { success: true };
    }),
});
