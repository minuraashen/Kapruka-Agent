import "dotenv/config";

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
  llmModel: process.env.LLM_MODEL || "",
};
