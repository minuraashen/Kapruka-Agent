# Kiki — Kapruka AI Shopping Agent · Technical Implementation Report

> A deep, interview-ready explanation of **what** this project is, **how** every part works, **why** each decision was made, and the **trade-offs** behind them. Read this top to bottom and you can defend any part of the codebase in an interview.

---

## 1. What the project is

**Kiki** is a full-screen, conversational AI shopping assistant for **Kapruka** (Sri Lanka's largest e-commerce platform). A user chats in natural language (English, Sinhala, or Tanglish), and the agent discovers products, quotes delivery, builds a cart, and takes them all the way to a working guest checkout — rendering everything as rich visual cards instead of walls of text.

It was built for a hackathon whose rubric rewards: **experience & polish (30)**, **visual richness (20)**, **personality (15)**, **usefulness (15)**, **end-to-end completeness (15)**, **creativity (5)**, plus bonuses for **multi-item carts, delivery-date constraints, gift messaging, Tanglish, and Sinhala**.

The product catalog, delivery network, and order creation are all provided by **Kapruka's public MCP server** (`https://mcp.kapruka.com/mcp`). The app itself owns the conversation, the UI, and the agent orchestration.

---

## 2. High-level architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          BROWSER (SPA)                            │
│  React 19 + Vite + Tailwind + framer-motion + Zustand            │
│                                                                  │
│  Home.tsx ── orchestrates chat UI                                │
│   ├─ ChatBubble (typewriter streaming, markdown, action chips)   │
│   ├─ ProductCarousel / ProductCard                               │
│   ├─ DeliveryCard / OrderTrackingCard / OrderConfirmationCard    │
│   ├─ OnboardingCards / FestivalChips / GiftGenie                 │
│   ├─ CartDrawer / CheckoutForm                                   │
│   └─ ThinkingIndicator                                           │
│                                                                  │
│  Zustand store (chatStore.ts) ── messages, cart, language,       │
│      theme, user  ── persisted to localStorage                   │
│                                                                  │
│         │  tRPC client (httpBatchLink + superjson)               │
└─────────┼────────────────────────────────────────────────────────┘
          │  POST /api/trpc/chat.sendMessage  { messages, cart, language }
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SERVER (Hono + tRPC)                          │
│                                                                  │
│  chat.sendMessage ── the AGENT LOOP                               │
│   1. Build system prompt (+ cart context + language hint)         │
│   2. Call LLM with tool definitions (OpenRouter, function-calling)│
│   3. If LLM requests tools → execute via MCP → feed results back  │
│   4. Repeat up to 5 times → return final message + functionCalls  │
│                                                                  │
│  mcp-client.ts ── singleton MCP connection, {params} wrap,       │
│      30s cache, rate-limit retry, image enrichment               │
│  kapruka-parse.ts ── Markdown → structured data (cards)          │
│                                                                  │
│  NO DATABASE. Fully stateless.                                    │
└─────────┬───────────────────────────────────┬────────────────────┘
          │ OpenAI-compatible HTTP            │ MCP (StreamableHTTP)
          ▼                                   ▼
   OpenRouter (LLM, free model)        mcp.kapruka.com  (catalog,
   gpt-oss-120b:free                    delivery, orders)
```

**One-sentence summary:** A React SPA talks to a stateless Hono/tRPC backend; the backend runs an LLM function-calling loop where the "tools" are Kapruka MCP calls, parses the Markdown those tools return into structured data, and the frontend renders that data as animated cards.

---

## 3. Tech stack and why

| Layer | Choice | Why |
|---|---|---|
| UI framework | **React 19** | Component model, ecosystem |
| Build/dev | **Vite 7** | Fast HMR; `@hono/vite-dev-server` runs the API in the same dev process |
| Styling | **Tailwind CSS 3** + shadcn/ui (Radix) | Rapid, consistent styling; accessible primitives |
| Animation | **framer-motion** | Declarative spring animations for the "alive" feel |
| State | **Zustand** (+ `persist`) | Tiny, no boilerplate, localStorage persistence in one line |
| API | **tRPC 11** + **superjson** | End-to-end TypeScript types from server to client, no codegen |
| Server | **Hono** | Lightweight, edge-style; runs via `@hono/node-server` in prod |
| LLM | **OpenRouter** via the **OpenAI SDK** | OpenAI-compatible function-calling; free models available |
| Tools/data | **Model Context Protocol SDK** | Kapruka exposes its catalog/orders as an MCP server |
| Background FX | **Custom WebGL shader** | Animated brand gradient (simplex noise) |
| Routing | **react-router 7** | `/` (chat) and `/login` (optional) |

**Key point for interviews:** the app is *thin*. The "business logic" (catalog, pricing, delivery rules, order creation) lives in Kapruka's MCP. Our job is **orchestration + UX**: turn a chat message into the right sequence of tool calls and render the results beautifully.

---

## 4. The agent loop (the heart of the backend)

File: [`app/api/routers/chat.ts`](app/api/routers/chat.ts)

The agent is an **LLM function-calling loop**. We do *not* hardcode "if user says X, call tool Y" — the LLM decides which tools to call.

### Tool definitions
Seven tools are declared in OpenAI function-calling JSON schema (`TOOLS`), each mirroring a Kapruka MCP tool:
`kapruka_search_products`, `kapruka_get_product`, `kapruka_list_categories`, `kapruka_list_delivery_cities`, `kapruka_check_delivery`, `kapruka_create_order`, `kapruka_track_order`.

### The loop (pseudocode)
```
messages = [systemPrompt(language, cart), ...clientHistory]
for i in 0..5:
    response = LLM.chat(messages, tools=TOOLS, tool_choice="auto")
    if response has tool_calls:
        append assistant tool-call message
        for each tool_call:
            raw   = callKaprukaTool(name, args)      # MCP round-trip
            parsed = parseByToolType(raw)            # Markdown → structured
            record functionCall { name, args, result: parsed }
            append tool-result message (the Markdown text, for the model)
        continue            # let the model read results and decide next step
    else:
        break               # model produced a final natural-language answer
return { message, functionCalls }
```

### Why this shape
- **Up to 5 iterations** lets the model chain tools (e.g. `list_delivery_cities` → `check_delivery` → `create_order`) within one user turn.
- The model is given the **Markdown text** of each tool result (human-readable, what it reasons over), while the **structured parse** is attached to `functionCalls` for the *UI* to render. Two audiences, two formats, from one MCP call.
- **Retry on HTTP 429** (free models rate-limit hard): up to 3 attempts with linear backoff inside each LLM call.

### The system prompt (personality + guardrails)
`BASE_SYSTEM_PROMPT` defines Kiki's voice (warm, witty, "aiya/akki" energy), language rules (mirror the user; Sinhala/Tanglish aware), and **hard rules**:
- Don't re-list products as text (the UI shows cards).
- Use the **live cart** when the user says "checkout".
- **Must** call `kapruka_check_delivery` and confirm availability **before** `kapruka_create_order`.
- Always confirm an order summary first; format prices `LKR 6,850`.

`buildSystemPrompt(language, cart)` appends two dynamic blocks:
1. If `language === "si"`, a hint to prefer Sinhala.
2. If the cart is non-empty, a rendered list of cart items + total, so the agent literally sees what the user added.

---

## 5. Stateless backend (a key architectural decision)

**The backend holds no state. No database.**

- `chat.sendMessage` input is `{ messages, cart, language }` — the client sends the **entire recent conversation** (last 16 turns), the **live cart**, and the **UI language** on every request.
- The server builds the LLM context from that payload, runs the loop, and returns.

### Why this matters (interview gold)
- **Trivial to deploy and scale:** no DB to provision, no migrations, no connection pool; any instance can serve any request (horizontally scalable, serverless-friendly).
- **Single source of truth:** the conversation lives in the client (Zustand + localStorage). Earlier the app stored history in MySQL *and* the client, which caused a bug where a refresh wiped the visible chat while the agent still "remembered" — because the two stores diverged. Going stateless **eliminated that whole class of bug**.
- **Trade-off:** the client must send history each call (slightly larger requests), and there's no server-side analytics/audit log. For a demo, that's a good trade. In production you'd add an append-only event log *without* making it the source of truth for the live UI.

This was a refactor: the original had Drizzle ORM + MySQL (`DATABASE_URL` was *required* at boot). We made `DATABASE_URL` optional, removed the DB-backed cart router and chat-history endpoints, and moved history to the client.

---

## 6. The MCP integration (where the real data comes from)

File: [`app/api/lib/mcp-client.ts`](app/api/lib/mcp-client.ts)

Kapruka exposes its platform as an **MCP server**. We connect with the official SDK over **StreamableHTTP** transport.

Critical implementation details (each was learned the hard way):

1. **Singleton connection with connect de-duplication.** The agent loop fires several tool calls; `getMcpClient()` caches one client and de-dupes concurrent connects via a shared promise. On failure it resets so the next call retries fresh.

2. **The `{params}` wrap.** Every Kapruka tool expects its arguments nested under a single `params` key: `client.callTool({ name, arguments: { params: args } })`. Miss this and every call fails. This is centralized in `callKaprukaTool` so no caller forgets it.

3. **Markdown, not JSON.** The MCP returns human-readable **Markdown** (e.g. `**1. Royal Chocolate Cake**  ID: ` + "`CAKE…`" + `  LKR 6,850 · In stock`). `normalizeToolResult` digs the text out of the MCP envelope (`structuredContent` or `content[].text`).

4. **30-second read cache** keyed by `tool + JSON(args)` — repeated searches/detail lookups within a turn are free.

5. **Rate-limit retry with server hints.** If the MCP says "Retry in 2s", we honor it; otherwise exponential backoff (1s, 2s, 4s).

### Image enrichment (a subtle but important piece)
`kapruka_search_products` results **do not include images** — only `kapruka_get_product` does. So after a search we call `get_product` for each shown product and merge in the image + blurb.

- `enrichProductsWithImages(products, max=24, concurrency=5)` enriches **every** displayed product with **bounded concurrency** (a 5-worker pool), so all cards get images without firing 24 simultaneous MCP calls (which would trip rate limits).
- **History of this code:** it started enriching the first 12, was lowered to 6 for speed (which made trailing cards image-less — a real bug we caught in testing), then changed to "enrich all shown, bounded concurrency" — the correct fix.

---

## 7. The Markdown → structured-data pipeline (visual richness)

File: [`app/api/lib/kapruka-parse.ts`](app/api/lib/kapruka-parse.ts)

Because the MCP returns Markdown, we parse it into typed objects so the UI can render cards. This is the bridge between "wall of text" and "beautiful UI."

| Parser | Input (MCP Markdown) | Output |
|---|---|---|
| `parseSearchResults` | numbered product list | `ParsedProduct[]` (id, name, price, currency, stock, url) |
| `parseProductDetail` | single product page | one `ParsedProduct` **with image** |
| `parseDeliveryResult` | `## Delivery to Colombo 03 …` | `{ available, city, date, fee, currency, note }` |
| `parseTrackingResult` | order status text | `{ orderNumber, status, steps[] }` |
| `parseOrderResult` | order confirmation | `{ orderNumber, payUrl, total, currency }` |

These are **regex-based parsers**. Trade-off: brittle if the MCP changes its Markdown format, but pragmatic given there's no JSON API. Each parser keeps the original `raw` text as a fallback so a card never renders empty.

**Two bugs we found and fixed by testing the live MCP:**
1. An error response (`Error (city_not_found): Unknown city 'Colombo'`) was parsed as `available: true` — a green "delivery available" card for an error. Fixed by treating `error / unknown city / not found` as unavailable.
2. A valid quote (`flat rate LKR 300`, title `## Delivery to Colombo 03 on …`) wasn't extracting the fee/city because the keyword and amount sat on different lines. Fixed with a title-line city parser and a currency-amount fallback.

> Interview note: the live network needs **exact** city names (`Colombo 03`, not `Colombo`). The agent path handles this by calling `list_delivery_cities` first; the manual checkout form is the weak spot (it sends the raw typed city) — a known limitation, fix = a city autocomplete.

---

## 8. Frontend state management

File: [`app/src/store/chatStore.ts`](app/src/store/chatStore.ts) — a single Zustand store with `persist` middleware.

Holds: `state` (a UI state machine: `splash | onboarding | gift_mode | … | checkout | order_status`), `sessionId`, `messages`, `cart`, `inputText`, `isLoading`, `intent`, `theme` (`light | midnight | sunset`), `language` (`en | si`), `user`.

**`partialize`** persists only `sessionId, state, messages, cart, intent, theme, language, user` to localStorage. Persisting `messages` is what makes a page refresh keep the conversation (and keeps client and agent in sync, since the agent reads history from the client).

**Message shape** (`ChatMessage`) carries `metadata` that drives the rich UI:
```ts
metadata: {
  functionCalls?,           // raw tool calls (audit)
  products?: Product[],     // → ProductCarousel
  delivery?: DeliveryInfo,  // → DeliveryCard
  tracking?: TrackingInfo,  // → OrderTrackingCard
  order?: OrderInfo,        // → OrderConfirmationCard
  actions?: string[],       // tool names → "actions taken" chips
}
```

---

## 9. The request → render data flow (end-to-end)

This is the single most important flow to be able to narrate:

1. User types a message in `ChatInputBar` → `Home.handleSend()`.
2. `handleSend` reads **fresh** state via `useChatStore.getState()` (not the closure) to get the latest cart/history, and POSTs `{ messages, cart, language }` to `chat.sendMessage`.
3. Server runs the agent loop → returns `{ message, functionCalls }`.
4. `handleSend` walks `functionCalls` and extracts structured results into the new assistant message's `metadata` (products / delivery / tracking / order / actions). On `create_order` it flips the state machine to `order_status`.
5. The message is added to the store with a `streamingId` set to its id.
6. `ChatBubble` sees `streaming` and **types the text out** (simulated streaming). While typing, the rich cards are **held back** (`cardsReady = msg.id !== streamingId`).
7. On stream completion, `streamingId` clears → the carousel/cards **slide in** beneath the finished text, and the view scrolls to bottom.

---

## 10. "Simulated streaming" + perceived liveness

The free LLM and the tool loop make true token streaming fragile, so we fake the *feel* reliably:

- **Typewriter reveal** ([`ChatBubble.tsx`](app/src/components/chat/ChatBubble.tsx)): when a fresh assistant message arrives, it reveals 7 chars per ~18ms tick, with a blinking cursor. History messages render instantly.
- **Predictive thinking chips** ([`ThinkingIndicator.tsx`](app/src/components/chat/ThinkingIndicator.tsx)): during the request, it infers the likely action from the user's last message ("Checking delivery…", "Looking up your order…", "Searching the catalog…") and cycles warm status lines.
- **Real "actions taken" chips**: after the reply, small chips ("Searched catalog", "Checked delivery") are derived from the **actual** tool calls in `functionCalls`.

So the *predictive* part is cosmetic, but the *post-hoc* chips are grounded in real tool usage. This was a deliberate choice over true SSE streaming: **reliability on a rate-limited free model** beat token-level fidelity.

---

## 11. Internationalization (EN ⇄ සිංහල)

File: [`app/src/lib/i18n.ts`](app/src/lib/i18n.ts)

- A flat dictionary keyed by string id, with `en` and `si` maps, plus `localizedPrompts` (so the user's own chat bubble matches the UI language when they click a quick action).
- `useT()` returns `{ t, p, lang }`: `t(key, vars)` for chrome strings (with `{var}` interpolation), `p(key)` for localized agent prompts.
- The header has an **EN/සිං toggle**; `language` lives in the store and is also sent to the agent so **Kiki replies in Sinhala** while the **whole chrome** (sidebar, header, onboarding, checkout, cards) is localized.
- This is the rubric's biggest differentiator ("almost no one will attempt Sinhala"). The Sinhala was written for **natural, conversational phrasing**, not literal word-by-word translation.

---

## 12. Checkout (closing the loop)

There are **two** paths, now unified on the same cart:

1. **Conversational** — the agent collects details across the chat and calls `kapruka_create_order`; the result renders as an `OrderConfirmationCard` with a **Pay Now** link.
2. **Manual** — `CartDrawer` → "Proceed to Checkout" opens `CheckoutForm`, a 3-step stepper (recipient → delivery → sender) that calls `kapruka.createOrder` directly. It runs a **delivery check** before the final step, supports a **gift toggle** with templates + a live gift-card preview, and shows the structured order result.

**Bug fixed here:** the form originally read `result.pay_url` as JSON, but `create_order` returns Markdown — so Pay Now never appeared. Fix: the `createOrder` router now parses the Markdown server-side and returns structured `{ orderNumber, payUrl }`.

> The MCP `create_order` is read-to-write and places a *real* guest order returning a 60-min pay URL. In testing we deliberately **did not** place live orders (verified the parse/return by code instead).

---

## 13. Performance work (and the "why")

- **Removed `backdrop-filter: blur()` from scrolling content.** Bubbles and cards used `backdrop-blur-sm`; combined with an always-animating WebGL gradient behind them, the browser re-blurred every element on every scroll frame → jank. Their backgrounds were already ~90% opaque, so removing the blur was free visually and fixed scroll lag. Blur is kept only on the **static** frame (panel/header/input/sidebars).
- **Bounded-concurrency image enrichment** (§6) — fast *and* complete.
- **DPR-capped WebGL** background (`min(devicePixelRatio, 1.5)`).
- Remaining lever: throttle the WebGL gradient to ~30fps (it's the root enabler of the blur cost).

---

## 14. File-by-file map

**Backend (`app/api`)**
- `boot.ts` — Hono app; mounts tRPC at `/api/trpc`; serves static files + listens in prod.
- `router.ts` — root tRPC router (`ping`, `kapruka`, `chat`).
- `routers/chat.ts` — the agent loop + tool definitions + system prompt.
- `routers/kapruka.ts` — thin tRPC wrappers over MCP tools (used by the manual checkout form); `createOrder`/`checkDelivery`/`trackOrder` return *parsed* structured data.
- `lib/mcp-client.ts` — MCP connection, `{params}` wrap, cache, retry, image enrichment.
- `lib/kapruka-parse.ts` — all Markdown → structured parsers.
- `lib/env.ts` — env (LLM keys; `DATABASE_URL` optional/unused).

**Frontend (`app/src`)**
- `App.tsx` — routes (`/` chat, `/login` optional; **no auth gate**).
- `pages/Home.tsx` — the whole chat surface orchestration.
- `pages/Login.tsx` — optional "personalize your name" screen.
- `store/chatStore.ts` — Zustand store (+ persist).
- `lib/i18n.ts` — EN/Sinhala dictionaries + `useT()`.
- `providers/trpc.tsx` — tRPC React client (httpBatchLink + superjson).
- `components/chat/*` — ChatBubble, ChatHeader, ChatInputBar (with voice input), ProductCard, ProductCarousel, CartDrawer, CheckoutForm, OnboardingCards, FestivalChips, GiftGenie, DeliveryCard, OrderTrackingCard, OrderConfirmationCard, ThinkingIndicator.
- `components/effects/GradientBackground.tsx` — WebGL simplex-noise brand gradient.
- `components/ui/*` — shadcn/ui (Radix) primitives.

---

## 15. Creativity / bonus features

- **Gift Genie** — a 3-tap guided flow (who / occasion / budget) that composes a rich search prompt.
- **Festival chips** — Avurudu / Vesak / Christmas / Birthday seasonal shortcuts (on-brand for Sri Lanka).
- **Voice input** — Web Speech API mic in the input bar, language-aware (`si-LK` / `en-US`), gracefully hidden where unsupported.
- **Three themes** — Light / Midnight / Sunset, with a live-morphing WebGL gradient per theme.
- **Tanglish + Sinhala** conversation support.

---

## 16. Known limitations / "what would you do differently" (interview honesty)

1. **Free LLM** (`gpt-oss-120b:free`) rate-limits (429) and adds latency (~25–30s/turn). For a judged demo a small paid model (e.g. `gpt-4o-mini`) is far more reliable. This is a known, deliberate constraint.
2. **Not yet deployed** — runs on localhost; needs a stable public URL.
3. **Regex Markdown parsers** are brittle to MCP format changes (mitigated by `raw` fallbacks).
4. **Manual checkout city** must match exact MCP city names — needs an autocomplete using `list_delivery_cities`.
5. **Agent sometimes double-searches** (one call with a guessed `category` returns 0, then a correct call) — wasteful; fix with a prompt guardrail to confirm categories via `list_categories`.
6. **No real auth/payment** — "login" is a cosmetic personalization; payment is the MCP's guest pay URL.
7. **~590 kB JS bundle**, no code-splitting — could lazy-load the WebGL/checkout.
8. **Predictive thinking chips** aren't tied to real-time tool execution (a true-streaming backend would fix this).

---

## 17. Likely interview questions (with crisp answers)

**Q. Walk me through what happens when a user asks "show me birthday cakes."**
Client POSTs `{messages, cart, language}` → server builds the system prompt → LLM returns a `tool_call` for `kapruka_search_products` → we call the MCP (`{params}` wrap), get Markdown, `parseSearchResults`, then `enrichProductsWithImages` (bounded concurrency) → feed the Markdown back to the LLM → it writes a friendly summary → we return `{message, functionCalls}` → the client extracts `products` into the message metadata → `ChatBubble` types the text, then the `ProductCarousel` slides in.

**Q. Why no database?**
To make it stateless and trivially deployable, and to remove a class of sync bugs. The conversation is the client's responsibility (Zustand + localStorage) and is sent with each request. Trade-off: bigger requests, no server-side history; acceptable for a demo, and you'd add an append-only log (not the source of truth) for production.

**Q. How does the agent "decide" to call a tool?**
It's LLM function-calling. We declare tool JSON schemas and let the model choose (`tool_choice: "auto"`), looping up to 5 times so it can chain tools (cities → delivery → order). We don't hardcode intent routing.

**Q. The MCP returns Markdown — how do you get rich cards?**
We parse the Markdown into typed structs server-side (`kapruka-parse.ts`), attach them to `functionCalls[].result`, and the client renders dedicated card components. The model gets the Markdown (to reason over); the UI gets the structured data (to render).

**Q. How is streaming implemented?**
Simulated: a client-side typewriter reveal plus predictive "thinking" chips, with real "actions taken" chips derived from actual tool calls. We chose this over SSE for reliability on a rate-limited free model.

**Q. Why was scrolling laggy and how did you fix it?**
`backdrop-filter: blur()` on every scrolling bubble/card, re-blurred each frame against an animated WebGL background. Removed blur from scrolling content (backgrounds were already ~90% opaque), kept it on static frame elements.

**Q. How do you support Sinhala end-to-end?**
A full i18n dictionary localizes all chrome via `useT()`, the language is stored and sent to the agent so Kiki *replies* in Sinhala, and prompts are localized so the user's own messages match the UI language.

**Q. How does the cart stay consistent with the agent?**
The live cart (Zustand) is sent with every request and injected into the system prompt, so when the user says "checkout," the agent uses the exact cart items rather than re-deriving them from chat — this unified two previously-disconnected checkout paths.

---

## 18. How to run it

```bash
cd app
npm install
# .env needs: LLM_API_KEY (OpenRouter), LLM_MODEL, LLM_BASE_URL
npm run dev        # Vite + Hono on http://localhost:3000
```
No database required. `npm run build` produces the client bundle + an esbuild server bundle (`dist/boot.js`); `npm start` runs it in production mode.
