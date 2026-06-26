# Changelog

All notable changes to Kapruka Kiki are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-06-26

### Initial release for the Kapruka Agent Challenge 2026

### Added
- **Full-screen conversational chat UI** — splash screen, onboarding intent picker, and persistent chat with typewriter message reveal
- **AI agent loop** — OpenAI-compatible function-calling via OpenRouter with up to 5 tool-chaining iterations per turn
- **All 7 Kapruka MCP tools** — `kapruka_search_products`, `kapruka_get_product`, `kapruka_list_categories`, `kapruka_list_delivery_cities`, `kapruka_check_delivery`, `kapruka_create_order`, `kapruka_track_order`
- **Product discovery** — search results rendered as an animated horizontal carousel with real product images (bounded-concurrency image enrichment via `kapruka_get_product`)
- **Product quick view** — expanded product detail overlay
- **Gift Genie** — 3-tap guided flow (who / occasion / budget) composing a rich search prompt
- **Festival chips** — seasonal shortcut chips (Avurudu, Vesak, Christmas, Birthday)
- **Suggestion chips** — contextual conversation prompts
- **Full cart system** — CartDrawer with quantity controls, persistent via Zustand + localStorage
- **Multi-step checkout form** — 3-step stepper (recipient → delivery → sender) with gift toggle, live gift-card preview, and delivery check before confirm
- **Conversational checkout** — agent collects details across chat and calls `kapruka_create_order`, rendering an `OrderConfirmationCard` with a Pay Now link
- **Order tracking** — `OrderTrackingCard` with status steps
- **EN / Sinhala i18n** — full chrome localization via `src/lib/i18n.ts`; language preference sent to agent so Kiki replies in Sinhala
- **Three themes** — Light / Midnight / Sunset with a live-morphing WebGL gradient
- **WebGL animated gradient background** — simplex noise shader with per-theme color palettes
- **ThinkingIndicator** — predictive "thinking" status chips while the agent processes; real "actions taken" chips derived from actual tool calls after reply
- **Voice input** — Web Speech API mic in the input bar, language-aware (`si-LK` / `en-US`)
- **Stateless backend** — no database; conversation history owned by the client (Zustand + localStorage) and sent with each request
- **LLM fallback chain** — `LLM_MODEL` accepts comma-separated model IDs; agent automatically retries the next on HTTP 429
- **30s read cache** — repeated MCP tool calls within a turn are served from cache
- **Exponential backoff** — rate-limit retry for both LLM and MCP calls
- **Docker support** — `app/Dockerfile` for Hugging Face Spaces, Fly.io, Railway, Koyeb
- **Render.com blueprint** — `render.yaml` for one-click free-tier deployment
- **`/api/health`** endpoint for uptime monitoring

### Architecture decisions
- Removed Drizzle ORM + MySQL (was a source of client/server state sync bugs); replaced with fully stateless design
- Switched from `@anthropic-ai/mcp` to the official `@modelcontextprotocol/sdk`
- Removed `backdrop-filter: blur()` from scrolling content (was causing per-frame re-blur against the animated WebGL background → scroll jank)
- Simulated streaming (client-side typewriter) chosen over true SSE for reliability on rate-limited free models

### Live demo
🌐 [https://minuraashen-kapruka-agent.hf.space](https://minuraashen-kapruka-agent.hf.space)
