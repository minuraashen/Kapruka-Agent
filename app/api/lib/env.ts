import "dotenv/config";

// LLM_MODEL may be a single id or a comma-separated fallback chain, e.g.
// "openai/gpt-oss-120b:free,openai/gpt-oss-20b:free,openrouter/free".
// On a 429 (free models rate-limit hard) the agent falls through to the next
// model in the list instead of failing — zero-cost resilience for a live demo.
const rawModels = process.env.LLM_MODEL || "";
const llmModels = rawModels
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// The app is fully stateless — conversation history and cart live on the
// client and are sent with each request. No database is required to run or
// deploy. DATABASE_URL is kept purely optional for legacy/seed scripts.
export const env = {
  appId: process.env.APP_ID || "",
  appSecret: process.env.APP_SECRET || "",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL || "",
  llmApiKey: process.env.LLM_API_KEY || "",
  llmBaseUrl: process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1",
  // First model is the primary; the rest are automatic fallbacks.
  llmModel: llmModels[0] || "",
  llmModels,
};
