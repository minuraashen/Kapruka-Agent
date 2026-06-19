# Kapruka Kiki — AI Shopping Assistant

A beautiful, full-screen conversational shopping experience powered by the Kapruka MCP — Sri Lanka's largest e-commerce platform. Built for the **Kapruka Agent Challenge 2026**.

## What You're Building

Kiki is an AI shopping assistant that helps customers:
- **Discover products** through natural conversation
- **Send gifts** with guided gift-finding flow
- **Track orders** in real-time
- **Complete checkout** end-to-end with guest checkout and pay links

## Architecture

### Frontend
- **React 19 + TypeScript + Vite**
- **Tailwind CSS + shadcn/ui** for styling
- **Framer Motion** for animations (spring physics, staggered entrances)
- **Zustand** for state management (chat state machine, cart, messages)
- **Raw WebGL** for the animated gradient background (simplex noise shader)
- **Full-screen chat UI** with immersive conversation flow

### Backend
- **Hono + tRPC** for type-safe API routes
- **Drizzle ORM + MySQL** for data persistence
- **MCP Client SDK** (`@modelcontextprotocol/sdk`) for connecting to Kapruka
- **OpenAI-compatible LLM API** with function calling for AI orchestration

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
├── api/
│   ├── lib/
│   │   └── mcp-client.ts          # MCP client connection to Kapruka
│   ├── routers/
│   │   ├── kapruka.ts             # tRPC router for all 7 MCP tools
│   │   ├── chat.ts                # AI chat with OpenAI function calling
│   │   └── cart.ts                # Cart management
│   ├── router.ts                  # Main tRPC router registration
│   ├── boot.ts                    # Hono server entry
│   └── middleware.ts              # tRPC middleware
├── db/
│   └── schema.ts                  # Database tables (sessions, messages, carts, orders)
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatHeader.tsx     # Sticky top bar with branding
│   │   │   ├── ChatBubble.tsx     # Animated message bubbles
│   │   │   ├── OnboardingCards.tsx # 3 intent cards (Gift, Shop, Track)
│   │   │   ├── ProductCard.tsx    # Product card with add-to-cart
│   │   │   ├── ProductCarousel.tsx # Horizontal scrollable carousel
│   │   │   ├── ChatInputBar.tsx   # Text input + send button
│   │   │   ├── CartDrawer.tsx     # Slide-out cart panel
│   │   │   └── CheckoutForm.tsx   # Multi-step checkout form
│   │   └── effects/
│   │       └── GradientBackground.tsx # WebGL animated gradient
│   ├── pages/
│   │   └── Home.tsx               # Main chat page with state machine
│   ├── store/
│   │   └── chatStore.ts           # Zustand store (state machine, cart, messages)
│   └── providers/
│       └── trpc.tsx               # tRPC client setup
├── public/
│   └── kiki-avatar.png            # Kiki mascot image
└── design.md                      # Full design PRD
```

## Chat State Machine

```
[SPLASH] → Let's Shop button → [ONBOARDING]
  ├── Send a Gift → [GIFT_MODE] → product search → [PRODUCT_DISCOVERY] → cart → [CHECKOUT]
  ├── Shop for Myself → [SHOP_MODE] → product search → [PRODUCT_DISCOVERY] → cart → [CHECKOUT]
  └── Track an Order → [TRACK_MODE] → order status
```

## AI Orchestration Flow

1. User sends a message via `trpc.chat.sendMessage`
2. Backend stores the message and builds the conversation context
3. The configured OpenAI-compatible LLM receives the message with all 7 Kapruka tools as function definitions
4. AI decides which tool(s) to call (or responds directly)
5. Backend executes tools via the MCP client, feeds results back to AI
6. AI generates a natural language response with tool results
7. Response stored and returned to frontend
8. Frontend renders text + rich UI components (product carousel, checkout form)

## Setup

### Required Environment Variables

Add these to your `.env` file:

```env
# Already provided by the platform:
DATABASE_URL=mysql://...
APP_ID=...
APP_SECRET=...

# You need to add one LLM provider configuration:
# Option 1: any OpenAI-compatible provider
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.1-70b-versatile

# Option 2: OpenAI fallback
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

Suggested free-tier-compatible providers:
- Groq: https://console.groq.com/
- OpenRouter: https://openrouter.ai/
- Local Ollama: `http://localhost:11434/v1` with a local model

### Database

```bash
npm run db:push    # Sync schema to database
```

### Development

```bash
npm install
npm run dev        # Start dev server at http://localhost:3000
```

### Step-by-Step Run

1. Install dependencies with `npm install` inside the `app` folder.
2. Create `.env` with `DATABASE_URL` and one LLM provider config.
3. Run `npm run db:push` to create or update the schema.
4. Start the app with `npm run dev`.
5. Open `http://localhost:3000` and send a chat message to verify the Kapruka MCP flow.
6. For production, run `npm run build` and then `npm start`.

### Production Build

```bash
npm run build      # Build frontend + backend
npm start          # Start production server
```

## Key Design Features

1. **Animated Gradient Background** — WebGL shader with simplex noise creating organic, breathing brand colors
2. **Isometric Message Entrances** — Spring-physics animations for chat bubbles
3. **Product Carousel** — Horizontal scroll-snap with staggered entrance animations
4. **Kiki Character** — Custom AI-generated mascot avatar (transparent PNG)
5. **Cart System** — Full cart management with quantity controls and checkout flow
6. **Multi-step Checkout** — Beautiful expanding form with stepper for recipient, delivery, and sender details

## Rate Limits

Kapruka MCP free tier:
- 60 requests/minute per IP
- 30 orders/hour per IP
- Guest checkout: 60-minute pay link with locked prices

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Zustand |
| Backend | Hono, tRPC 11, Drizzle ORM, MySQL |
| AI | OpenAI GPT-4o-mini with function calling |
| E-commerce | Kapruka MCP (7 tools) |
| 3D/Effects | Raw WebGL (gradient shader) |

## Scoring Alignment (Kapruka Rubric)

| Category | How Kiki Delivers |
|----------|------------------|
| Experience & Polish (30) | Full-screen immersive chat, WebGL gradient, spring animations, glassmorphism |
| Visual Richness (20) | Product cards with images, horizontal carousel, Kiki avatar, color-coded states |
| Personality (15) | Warm, witty Sri Lankan context-aware AI persona |
| Usefulness (15) | Guided gift finding, product discovery, delivery quoting, end-to-end checkout |
| End-to-end Completeness (15) | Discovery → cart → delivery → guest checkout → pay link |
| Creativity (5) | State machine-driven UI, WebGL background, isometric animations |

**Bonus points**: Multi-item cart, delivery date picker, gift messaging support
