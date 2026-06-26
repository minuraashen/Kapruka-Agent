# Kapruka Kiki — AI Shopping Assistant

[![Live Demo](https://img.shields.io/badge/Live%20Demo-HF%20Space-FF6C37?style=for-the-badge&logo=huggingface&logoColor=white)](https://minuraashen-kapruka-agent.hf.space)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

A beautiful, full-screen conversational shopping experience powered by the Kapruka MCP — Sri Lanka's largest e-commerce platform. Built for the **Kapruka Agent Challenge 2026**.

> 🌐 **Live:** [https://minuraashen-kapruka-agent.hf.space](https://minuraashen-kapruka-agent.hf.space)

---

## Web UI of Working Agent

<table>
  <tr>
    <td align="center" width="50%">
      <br/><sup><b>Splash screen — English</b></sup>
      <img src="app/public/assets/home-eng.png" alt="Kiki splash screen in English" width="100%"/>
    </td>
    <td align="center" width="50%">
      <br/><sub><b>Splash screen — සිංහල</b></sub>
      <img src="app/public/assets/home-sin.png" alt="Kiki splash screen in Sinhala" width="95%"/>
    </td>
  </tr>
  <tr>
      <br/><sub><b>Chat UI — onboarding, Gift Genie &amp; festival chips</b></sub>
      <img src="app/public/assets/chat-ui.png" alt="Chat UI with onboarding cards, Gift Genie, and festival chips" width="100%"/>
  </tr>
  <tr>
      <br/><sub><b>AI response with live product carousel</b></sub>
      <img src="app/public/assets/chat-response.png" alt="AI response with product carousel showing birthday cakes and gifts" width="100%"/>
  </tr>
</table>

---

## What You're Building

Kiki is an AI shopping assistant that helps customers:
- **Discover products** through natural conversation
- **Send gifts** with guided gift-finding flow (Gift Genie)
- **Track orders** in real-time
- **Complete checkout** end-to-end with guest checkout and pay links

## Architecture

### Frontend
- **React 19 + TypeScript + Vite 7**
- **Tailwind CSS v3 + shadcn/ui** for styling
- **Framer Motion** for animations (spring physics, staggered entrances)
- **Zustand** for state management (chat state machine, cart, messages — persisted to localStorage)
- **Raw WebGL** for the animated gradient background (simplex noise shader)
- **Full-screen chat UI** with immersive conversation flow

### Backend
- **Hono + tRPC 11** for type-safe API routes
- **Stateless** — no database; conversation history is owned by the client and sent with each request
- **MCP Client SDK** (`@modelcontextprotocol/sdk`) for connecting to Kapruka
- **OpenAI-compatible LLM API** (via OpenRouter) with function calling for AI orchestration

### Kapruka MCP Integration
All 7 Kapruka MCP tools are exposed through tRPC and mapped to OpenAI function definitions:

| Tool | Purpose |
|------|---------| 
| `kapruka_search_products` | Search the catalog by keyword |
| `kapruka_get_product` | Get product details by ID |
| `kapruka_list_categories` | Browse product categories |
| `kapruka_list_delivery_cities` | Find delivery cities |
| `kapruka_check_delivery` | Check delivery availability & pricing |
| `kapruka_create_order` | Guest checkout with pay link |
| `kapruka_track_order` | Track existing orders |

## File Structure

```
app/
├── api/
│   ├── lib/
│   │   ├── mcp-client.ts          # MCP client connection to Kapruka (singleton, cache, retry)
│   │   ├── kapruka-parse.ts       # Markdown → structured data (products, delivery, orders)
│   │   ├── env.ts                 # Environment variable loading
│   │   ├── http.ts                # HTTP utility helpers
│   │   └── vite.ts                # Vite dev-server integration helper
│   ├── routers/
│   │   ├── kapruka.ts             # tRPC router for all 7 MCP tools (manual checkout paths)
│   │   └── chat.ts                # AI agent loop with OpenAI function calling
│   ├── router.ts                  # Main tRPC router (ping, kapruka, chat)
│   ├── boot.ts                    # Hono server entry
│   ├── context.ts                 # tRPC context
│   └── middleware.ts              # tRPC middleware
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatHeader.tsx          # Sticky top bar with branding + theme/language toggle
│   │   │   ├── ChatBubble.tsx          # Animated message bubbles with typewriter reveal
│   │   │   ├── OnboardingCards.tsx     # 3 intent cards (Gift, Shop, Track)
│   │   │   ├── ProductCard.tsx         # Product card with add-to-cart + quick view
│   │   │   ├── ProductCarousel.tsx     # Horizontal scrollable carousel
│   │   │   ├── ProductQuickView.tsx    # Expanded product detail overlay
│   │   │   ├── ChatInputBar.tsx        # Text input + send + voice input button
│   │   │   ├── CartDrawer.tsx          # Slide-out cart panel
│   │   │   ├── CheckoutForm.tsx        # Multi-step checkout form (recipient, delivery, sender)
│   │   │   ├── DeliveryCard.tsx        # Delivery availability + fee card
│   │   │   ├── OrderTrackingCard.tsx   # Order status tracking card
│   │   │   ├── OrderConfirmationCard.tsx # Order confirmed + Pay Now card
│   │   │   ├── ThinkingIndicator.tsx   # Predictive "thinking" status chips
│   │   │   ├── FestivalChips.tsx       # Seasonal shortcut chips (Avurudu, Vesak, etc.)
│   │   │   ├── GiftGenie.tsx           # 3-tap guided gift flow (who / occasion / budget)
│   │   │   └── SuggestionChips.tsx     # Contextual suggestion chips
│   │   └── effects/
│   │       └── GradientBackground.tsx  # WebGL animated gradient (simplex noise shader)
│   ├── pages/
│   │   ├── Home.tsx               # Main chat page — orchestrates the entire UI
│   │   └── Login.tsx              # Optional personalization (name) — not an auth gate
│   ├── store/
│   │   └── chatStore.ts           # Zustand store (state machine, cart, messages, theme, language)
│   ├── lib/
│   │   ├── i18n.ts                # EN / Sinhala dictionaries + useT() hook
│   │   └── utils.ts               # Utility helpers
│   ├── hooks/
│   │   └── use-mobile.ts          # Mobile viewport detection hook
│   └── providers/
│       └── trpc.tsx               # tRPC client setup (httpBatchLink + superjson)
├── public/
│   └── kiki-avatar.png            # Kiki mascot image
├── .env.example                   # Environment variable template
├── Dockerfile                     # Docker image for alternate hosting
└── package.json
```

## Chat State Machine

```
[SPLASH] → Let's Shop button → [ONBOARDING]
  ├── Send a Gift → [GIFT_MODE] → product search → [PRODUCT_DISCOVERY] → cart → [CHECKOUT]
  ├── Shop for Myself → [SHOP_MODE] → product search → [PRODUCT_DISCOVERY] → cart → [CHECKOUT]
  └── Track an Order → [TRACK_MODE] → order status → [ORDER_STATUS]
```

## AI Orchestration Flow

1. User sends a message via `trpc.chat.sendMessage`
2. Backend receives `{ messages, cart, language }` — the full recent history from the client
3. The configured OpenAI-compatible LLM receives the message with all 7 Kapruka tools as function definitions
4. AI decides which tool(s) to call (or responds directly) — up to 5 loop iterations to chain tools
5. Backend executes tools via the MCP client, wrapping each tool's arguments in
   the `{ params: ... }` envelope the Kapruka MCP expects, with retry/backoff on
   rate-limits and a 30s read cache
6. The MCP returns **Markdown** (not JSON). For product tools the backend parses
   that Markdown into structured products and enriches the top results with
   images (via `kapruka_get_product`) so the UI can render real cards
7. AI generates a natural language response; it is returned to the frontend alongside
   parsed `functionCalls` (products, delivery, tracking, order)
8. Frontend renders text (typewriter reveal) + rich UI components (inline product carousels,
   delivery cards, order confirmation cards, checkout form)

## Setup

### Required Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# LLM via OpenRouter (https://openrouter.ai/) — use a tool-calling-capable model:
LLM_API_KEY=sk-or-...
LLM_BASE_URL=https://openrouter.ai/api/v1
# Comma-separated fallback chain — if first model returns 429, agent tries the next:
LLM_MODEL=openai/gpt-oss-120b:free,openai/gpt-oss-20b:free,openrouter/free
```

**No database required.** The app is fully stateless — conversation history lives in the
browser (Zustand + localStorage) and is sent with each request.

The agent uses OpenAI-compatible function calling against OpenRouter. Free models
that worked at build time: `openai/gpt-oss-120b:free`, `openai/gpt-oss-20b:free`,
`openrouter/free` (auto-routing).

> ⚠️ **Free models rate-limit aggressively (HTTP 429).** The backend retries with
> backoff across the fallback chain, but for a reliable judged demo, point `LLM_MODEL`
> at a small paid model (e.g. `openai/gpt-4o-mini`) on the same OpenRouter key.

### Development

```bash
cd app
npm install
npm run dev        # Start dev server at http://localhost:3000
```

### Step-by-Step Run

1. `cd app` — all commands run from the `app/` directory.
2. Install dependencies: `npm install`.
3. Create `.env` with `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL`.
4. Start the app: `npm run dev`.
5. Open `http://localhost:3000` and send a chat message to verify the Kapruka MCP flow.
6. For production: `npm run build` then `npm start`.

### Production Build

```bash
npm run build      # Build React frontend + esbuild server bundle (dist/boot.js)
npm start          # Start production server
```

## Key Design Features

1. **Animated Gradient Background** — WebGL shader with simplex noise creating organic, breathing brand colors; three themes (Light / Midnight / Sunset)
2. **Typewriter Message Reveal** — Simulated streaming: new assistant messages type out character by character
3. **Product Carousel** — Horizontal scroll-snap with staggered entrance animations and quick-view overlay
4. **Gift Genie** — 3-tap guided flow (who / occasion / budget) composing a rich search prompt
5. **Festival Chips** — Seasonal shortcuts (Avurudu, Vesak, Christmas, Birthday) on-brand for Sri Lanka
6. **Kiki Character** — Custom AI-generated mascot avatar (transparent PNG)
7. **Full Cart System** — Cart management with quantity controls, CartDrawer, and multi-step checkout
8. **Multi-step Checkout** — 3-step stepper (recipient → delivery → sender) with gift toggle + live gift-card preview
9. **EN / Sinhala i18n** — Full chrome localization plus agent replies in Sinhala

## Rate Limits

Kapruka MCP free tier:
- 60 requests/minute per IP
- 30 orders/hour per IP
- Guest checkout: 60-minute pay link with locked prices

The backend implements a **30s read cache** and **exponential backoff** on 429 responses.
`LLM_MODEL` accepts a comma-separated fallback chain so a rate-limited LLM never kills a turn.

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS v3, shadcn/ui, Framer Motion, Zustand |
| Backend | Hono, tRPC 11, stateless (no DB) |
| AI | OpenRouter (OpenAI-compatible) with function calling — free model fallback chain |
| E-commerce | Kapruka MCP (`@modelcontextprotocol/sdk`) — 7 tools |
| 3D/Effects | Raw WebGL (simplex noise gradient shader) |

## Scoring Alignment (Kapruka Rubric)

| Category | How Kiki Delivers |
|----------|------------------|
| Experience & Polish (30) | Full-screen immersive chat, WebGL gradient, spring animations, glassmorphism |
| Visual Richness (20) | Product cards with images, horizontal carousel, quick view, Kiki avatar, color-coded states |
| Personality (15) | Warm, witty Sri Lankan context-aware AI persona with "aiya/akki" energy |
| Usefulness (15) | Gift Genie, product discovery, delivery quoting, end-to-end checkout |
| End-to-end Completeness (15) | Discovery → cart → delivery check → guest checkout → pay link |
| Creativity (5) | State machine-driven UI, WebGL background, Gift Genie, festival chips, Sinhala i18n |

**Bonus points**: Multi-item cart, delivery date picker, gift messaging, Tanglish + Sinhala support

---

## License

Distributed under the [MIT License](LICENSE). © 2026 Minura Ashen.

## Acknowledgements

- [Kapruka](https://www.kapruka.com) — Sri Lanka's largest e-commerce platform, for the public MCP server
- [OpenRouter](https://openrouter.ai) — free LLM API gateway
- [shadcn/ui](https://ui.shadcn.com) — accessible, composable UI primitives
- [Hugging Face Spaces](https://huggingface.co/spaces) — free Docker hosting

