import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  appId: process.env.APP_ID || "",
  appSecret: process.env.APP_SECRET || "",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  llmApiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "",
  llmBaseUrl: process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || "",
  llmModel: process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini",
};
