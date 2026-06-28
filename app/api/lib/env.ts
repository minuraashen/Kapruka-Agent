import "dotenv/config";

// ── LLM provider fallback chain ────────────────────────────────────────────
// The agent calls free LLM providers in order, falling through to the next on a
// rate-limit/error. Every provider here exposes an OpenAI-compatible endpoint,
// so a single client shape works for all of them. Using *different* providers
// (not just different models) gives independent rate-limit buckets, which is the
// biggest reliability win on free tiers.
//
// Preferred config (cross-provider):
//   LLM_PROVIDERS=groq|qwen/qwen3-32b, openrouter|qwen/qwen3.6-plus:free
//   GROQ_API_KEY=...   OPENROUTER_API_KEY=...
//
// Legacy single-provider config (still supported if LLM_PROVIDERS is unset):
//   LLM_BASE_URL, LLM_API_KEY, LLM_MODEL (comma-separated model fallbacks)

export interface LlmProvider {
  label: string; // short name for logs, e.g. "groq"
  baseUrl: string;
  apiKey: string;
  model: string;
}

// Built-in OpenAI-compatible base URLs and the env var holding each key. A base
// URL can be overridden per provider with <NAME>_BASE_URL (e.g. GROQ_BASE_URL).
const PROVIDER_REGISTRY: Record<string, { baseUrl: string; keyEnv: string }> = {
  groq: { baseUrl: "https://api.groq.com/openai/v1", keyEnv: "GROQ_API_KEY" },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    keyEnv: "OPENROUTER_API_KEY",
  },
};

function buildProviders(): LlmProvider[] {
  const raw = (process.env.LLM_PROVIDERS || "").trim();

  if (raw) {
    return raw
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        // Split on the FIRST "|" only — model slugs can contain ":" and "/".
        const sep = entry.indexOf("|");
        const name = (sep === -1 ? entry : entry.slice(0, sep))
          .trim()
          .toLowerCase();
        const model = sep === -1 ? "" : entry.slice(sep + 1).trim();
        const reg = PROVIDER_REGISTRY[name];
        if (!reg) {
          throw new Error(
            `Unknown LLM provider "${name}" in LLM_PROVIDERS. ` +
              `Known providers: ${Object.keys(PROVIDER_REGISTRY).join(", ")}.`
          );
        }
        const baseUrl =
          process.env[`${name.toUpperCase()}_BASE_URL`] || reg.baseUrl;
        const apiKey = process.env[reg.keyEnv] || "";
        return { label: name, baseUrl, apiKey, model };
      })
      .filter((p) => p.model);
  }

  // Legacy single-provider fallback chain.
  const baseUrl = process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1";
  const apiKey = process.env.LLM_API_KEY || "";
  return (process.env.LLM_MODEL || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((model) => ({ label: "llm", baseUrl, apiKey, model }));
}

// The app is fully stateless — conversation history and cart live on the client
// and are sent with each request. No database, no ORM, no migrations.
export const env = {
  appId: process.env.APP_ID || "",
  appSecret: process.env.APP_SECRET || "",
  isProduction: process.env.NODE_ENV === "production",
  // Ordered fallback chain across (possibly different) providers.
  llmProviders: buildProviders(),
};
