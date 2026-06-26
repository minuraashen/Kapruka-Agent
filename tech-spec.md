# Kapruka Kiki — Technical Specification

## Dependencies

### Production (Frontend)
| Package | Version | Purpose |
|---------|---------|---------| 
| react | ^19 | UI framework |
| react-dom | ^19 | React DOM renderer |
| react-router | ^7 | Client-side routing (`/` chat, `/login` optional) |
| framer-motion | ^12 | Animation library (chat bubbles, carousel stagger, transitions) |
| lucide-react | ^0.562 | Icon library |
| @trpc/client | ^11 | tRPC client for type-safe API calls |
| @trpc/react-query | ^11 | tRPC React integration |
| @tanstack/react-query | ^5 | Data fetching and caching |
| superjson | ^2 | JSON serialization (Dates, etc.) |
| zustand | ^5 | Lightweight state management (chat state machine + persist) |
| date-fns | ^4 | Date formatting utilities |
| react-hook-form | ^7 | Form state management (checkout) |
| @hookform/resolvers | ^5 | Zod resolver for react-hook-form |
| embla-carousel-react | ^8 | Carousel component |
| next-themes | ^0.4 | Theme management |
| sonner | ^2 | Toast notifications |
| clsx / tailwind-merge | latest | Conditional class utilities |

### Production (Backend)
| Package | Version | Purpose |
|---------|---------|---------| 
| hono | ^4 | Lightweight HTTP framework |
| @hono/node-server | ^1 | Hono Node.js adapter |
| @trpc/server | ^11 | tRPC server |
| @modelcontextprotocol/sdk | ^1.29 | Official MCP client SDK for connecting to Kapruka |
| openai | ^6 | OpenAI API client (used against OpenRouter, OpenAI-compatible) |
| zod | ^4 | Schema validation (tRPC inputs) |
| superjson | ^2 | JSON serialization |
| dotenv | ^17 | Environment variables |

> **Note:** There is no database. The app is fully stateless — conversation history is owned by the
> client (Zustand + localStorage) and sent with each `chat.sendMessage` request.

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------| 
| typescript | ~5.9 | Type checking |
| vite | ^7 | Build tool (with `@hono/vite-dev-server` for integrated API dev) |
| @hono/vite-dev-server | ^0.19 | Runs Hono API in the same Vite dev process |
| tailwindcss | ^3 | Utility CSS |
| @types/react | ^19 | React type definitions |
| esbuild | ^0.27 | Server bundle (backend production build) |
| vitest | ^4 | Testing framework |
| prettier | ^3 | Code formatting |

### External Services
- **Kapruka MCP**: `https://mcp.kapruka.com/mcp` — Streamable HTTP, no auth required
- **OpenRouter**: `https://openrouter.ai/api/v1` — OpenAI-compatible LLM API (free and paid models)
- **No database** — fully stateless backend

---

## Component Inventory

### Layout
| Component | Source | Reuse |
|-----------|--------|-------|
| GradientBackground | Custom (WebGL) | Singleton — fixed behind everything; theme-aware color palettes |
| ChatHeader | Custom | Singleton — sticky top bar with branding, theme picker, language toggle, new chat |
| ChatInputBar | Custom | Singleton — fixed bottom bar with text input, voice button, send |

### Sections / Chat States
| Component | Source | Reuse |
|-----------|--------|-------|
| OnboardingCards | Custom | Once — 3 intent cards (Gift, Shop, Track) |
| GiftGenie | Custom | Conditional — 3-tap guided flow (who / occasion / budget) |
| ProductCarousel | Custom | Reusable — horizontal scroll-snap product cards |
| CartDrawer | Custom | Singleton — slide-out cart panel with checkout entry |
| CheckoutForm | Custom | Conditional — 3-step stepper (recipient → delivery → sender) |
| DeliveryCard | Custom | Conditional — delivery availability + fee display |
| OrderTrackingCard | Custom | Conditional — order status display |
| OrderConfirmationCard | Custom | Conditional — order confirmed + Pay Now link |

### Reusable Components
| Component | Source | Reuse |
|-----------|--------|-------|
| ChatBubble | Custom | Per-message — typewriter reveal for new messages, instant for history |
| ProductCard | Custom | Per-product — card with hover effects, add-to-cart, quick view trigger |
| ProductQuickView | Custom | On-demand — expanded product detail overlay |
| FestivalChips | Custom | Contextual — seasonal shortcut chips (Avurudu, Vesak, Christmas, Birthday) |
| SuggestionChips | Custom | Contextual — conversation suggestion chips |
| ThinkingIndicator | Custom | Singleton — predictive "thinking" status chips during loading |

### Hooks
| Hook | Purpose |
|------|---------|
| useChatStore | Zustand store — full conversation state (FSM, messages, cart, theme, language) |
| useT / i18n | EN/Sinhala localization — `t(key)` for chrome, `p(key)` for agent prompts |
| use-mobile | Mobile viewport detection |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Gradient Background (blob morph) | Raw WebGL | Fullscreen fragment shader with simplex noise + brand color stops per theme. Canvas fixed at z-index -1. | 🔒 High |
| Message Bubble Entrance | Framer Motion | `scale: [0, 1.1, 1]` + `rotateZ: [5, -2, 0]` with `type: "spring"`, `stiffness: 300`, `damping: 15`. Per-bubble triggered on mount. | Medium |
| Typewriter Text Reveal | JS interval | New assistant messages reveal 7 chars per ~18ms tick with a blinking cursor. History messages render instantly. | Medium |
| Product Carousel Stagger | Framer Motion | Parent `variants` with `staggerChildren: 0.1`. Children animate `y: [50, 0]`, `opacity: [0, 1]`, `scale: [0.9, 1]`. | Medium |
| Island Card Hover | CSS Transitions | `transform: skewX(-5deg) scale(1.05)` on hover with `box-shadow` deepening. Pure CSS `:hover` + `transition`. | Low |
| Background Gradient Transition | WebGL Uniform | Smooth color palette shifts by animating a "mood" uniform passed to the shader, interpolating between theme color sets. | Medium |
| Voice Input Orb | Framer Motion | `animate={{ scale: 1.5 }}` on mic active. | Low |

---

## State & Logic Plan

### Chat State Machine (Zustand)
The conversation follows a finite state machine with 8 states:

```
[SPLASH] → click "Let's Go"
  │
  ▼
[ONBOARDING] → show 3 intent cards (gift / shop / track)
  │
  ├───► [GIFT_MODE] ──► [PRODUCT_DISCOVERY] ──► [CHECKOUT]
  │
  ├───► [SHOP_MODE] ──► [PRODUCT_DISCOVERY] ──► [CHECKOUT]
  │
  └───► [TRACK_MODE] ──► [ORDER_STATUS]
```

Each state determines:
- Which UI components render (carousel, forms, chips, GiftGenie)
- The background gradient "mood" (theme-driven color palette)
- The AI system prompt context (what tools to prioritize, language hint, live cart)

### AI Orchestration (Backend — OpenAI Function Calling via OpenRouter)
The backend is **stateless**. Each request receives `{ messages, cart, language }` from the client:

1. Backend builds system prompt (Kiki personality + cart context + language hint)
2. Sends to LLM (OpenRouter) with all 7 Kapruka tool definitions
3. LLM decides to call a function (e.g. `kapruka_search_products`)
4. Backend executes the tool via MCP client (with `{params}` wrap), gets Markdown back
5. Parses Markdown → structured data (`kapruka-parse.ts`), feeds text back to LLM
6. Loop repeats up to 5 times (tool chaining)
7. Returns `{ message, functionCalls }` — text for the bubble, structured data for cards

**LLM fallback chain**: `LLM_MODEL` is a comma-separated list. On HTTP 429, the agent
automatically tries the next model in the chain (up to 3 retries with linear backoff).

**Tool mapping**: Each Kapruka MCP tool maps 1:1 to an OpenAI function definition:
- `kapruka_search_products` → find products
- `kapruka_get_product` → get product details (also used for image enrichment)
- `kapruka_list_categories` → browse categories
- `kapruka_list_delivery_cities` → find delivery cities
- `kapruka_check_delivery` → check delivery availability
- `kapruka_create_order` → create guest checkout order
- `kapruka_track_order` → track existing order

### Client-Side State (Zustand + localStorage)
- `chatStore.ts` is the single source of truth for: `state`, `sessionId`, `messages`, `cart`, `inputText`, `isLoading`, `intent`, `theme` (`light | midnight | sunset`), `language` (`en | si`), `user`.
- `partialize` persists `sessionId, state, messages, cart, intent, theme, language, user` to localStorage.
- The full `messages` array is persisted so a page refresh keeps the conversation, and the agent
  always receives the correct history on the next request.

### Cart Management (Client-side)
- Cart is a Zustand array: `[{ productId, name, price, qty, image }]`
- Persisted to localStorage via `zustand/middleware`
- Sent with every `chat.sendMessage` so the agent sees the live cart
- tRPC manual endpoints (`kapruka.createOrder`, `kapruka.checkDelivery`) also accept cart data directly

---

## MCP Integration Architecture

### Connection Strategy
The backend uses the official `@modelcontextprotocol/sdk` npm package to create an MCP client
that connects to Kapruka's Streamable HTTP endpoint:

```typescript
// api/lib/mcp-client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const mcpClient = new Client({ name: "kiki", version: "1.0.0" });
await mcpClient.connect(new StreamableHTTPClientTransport(new URL("https://mcp.kapruka.com/mcp")));
```

### Key Implementation Details
1. **Singleton + de-duplication**: `getMcpClient()` caches one client and de-dupes concurrent connects via a shared promise. On failure it resets for fresh retry.
2. **The `{params}` wrap**: Every Kapruka tool requires `{ arguments: { params: args } }`. Centralized in `callKaprukaTool`.
3. **Markdown responses**: The MCP returns human-readable Markdown, not JSON. `normalizeToolResult` extracts text from the MCP envelope.
4. **30s read cache**: Keyed by `tool + JSON(args)` — repeated searches within a turn are free.
5. **Rate-limit retry**: Exponential backoff (1s, 2s, 4s); honors `Retry-in` hints from the MCP.
6. **Image enrichment**: `kapruka_search_products` results lack images; `enrichProductsWithImages` calls `get_product` with bounded concurrency (5-worker pool) for all shown products.

### Tool Proxy Pattern
Instead of exposing MCP directly to the frontend, the backend:
1. Discovers available tools via `mcpClient.listTools()`
2. Registers each tool as an OpenAI function definition
3. When the LLM requests a tool call, executes `mcpClient.callTool(name, { params: args })`
4. Parses Markdown results into typed structs (`kapruka-parse.ts`)
5. Feeds Markdown text back to the LLM; attaches structured data to `functionCalls` for the UI

### Rate Limiting
- Kapruka: 60 req/min per IP, 30 orders/hour per IP
- 30s TTL cache for all product reads
- Exponential backoff on 429 responses

---

## Other Key Decisions

### No Auth Required
Guest checkout is fully supported by Kapruka. The app does not require user login. `/login` is an optional "personalization" screen (user name only) — never an auth gate.

### No Database
Originally the app had Drizzle ORM + MySQL. This was removed:
- The backend is fully stateless; conversation history lives in the client
- `DATABASE_URL` is no longer needed
- Eliminates a class of sync bug where DB and client state diverged on refresh

### Multi-language Support
The UI strings live in `src/lib/i18n.ts` — a flat dictionary with `en` and `si` maps plus
`localizedPrompts`. `language` is stored in Zustand and sent to the agent so Kiki replies in
Sinhala while the full chrome is localized.

### Currency
Default to LKR. The MCP supports multi-currency; the backend passes through the user's selected currency where supported.

### Deployment
- **Single fullstack deployment** — Hono serves both the built React app and the API
- **Environment variables needed**: `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`
- **No Kapruka API key** needed (public MCP)
- **No database** to provision
- See [`DEPLOY.md`](../DEPLOY.md) for step-by-step Render.com and Docker instructions
