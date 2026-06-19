# Kapruka Kiki — Technical Specification

## Dependencies

### Production (Frontend)
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19 | UI framework |
| react-dom | ^19 | React DOM renderer |
| @react-three/fiber | ^9 | React renderer for Three.js (waveform visualizer) |
| @react-three/drei | ^10 | R3F helpers (not heavily used, but good for future) |
| three | ^0.172 | 3D engine (waveform ring, gradients) |
| framer-motion | ^12 | Animation library (page transitions, chat bubbles, carousel) |
| gsap | ^3 | Advanced timeline animations (isometric text entrance) |
| lucide-react | ^0.468 | Icon library |
| @trpc/client | ^11 | tRPC client for type-safe API calls |
| @trpc/react-query | ^11 | tRPC React integration |
| @tanstack/react-query | ^5 | Data fetching and caching |
| superjson | ^2 | JSON serialization (Dates, etc.) |
| zustand | ^5 | Lightweight state management (chat state machine) |
| react-router | ^7 | Client-side routing (if needed) |

### Production (Backend)
| Package | Version | Purpose |
|---------|---------|---------|
| hono | ^4 | Lightweight HTTP framework |
| @hono/node-server | ^1 | Hono Node.js adapter |
| @trpc/server | ^11 | tRPC server |
| drizzle-orm | ^0.39 | Type-safe ORM |
| mysql2 | ^3 | MySQL driver |
| @anthropic-ai/mcp | ^1 or `mcp` | MCP client SDK for connecting to Kapruka |
| openai | ^4 | OpenAI API client for AI chat |
| zod | ^3 | Schema validation (tRPC inputs) |
| superjson | ^2 | JSON serialization |
| dotenv | ^16 | Environment variables |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5 | Type checking |
| vite | ^6 | Build tool |
| tailwindcss | ^4 | Utility CSS |
| @types/react | ^19 | React type definitions |
| @types/three | ^0.172 | Three.js type definitions |
| drizzle-kit | ^0.30 | Drizzle CLI (db:push, db:generate) |
| tsx | ^4 | TypeScript execution (seed scripts, dev) |
| vitest | ^3 | Testing framework |
| prettier | ^3 | Code formatting |

### External Services
- **Kapruka MCP**: `https://mcp.kapruka.com/mcp` — Streamable HTTP, no auth
- **OpenAI API**: Chat completions with function calling (GPT-4o-mini or GPT-4o)
- **MySQL**: Database for chat history, carts, sessions

---

## Component Inventory

### Layout
| Component | Source | Reuse |
|-----------|--------|-------|
| GradientBackground | Custom (WebGL) | Singleton — fixed behind everything |
| ChatLayout | Custom | Singleton — full-screen flex column |
| ChatHeader | Custom | Singleton — sticky top bar |
| ChatInputBar | Custom | Singleton — fixed bottom bar |

### Sections / Chat States
| Component | Source | Reuse |
|-----------|--------|-------|
| SplashScreen | Custom | Once — 3D isometric KIKI text + "Let's Go" CTA |
| OnboardingPicker | Custom | Once — 3 floating island cards (Gift, Shop, Track) |
| GiftFlow | Custom | Conditional — chip-scroller questions |
| ProductCarousel | Custom | Reusable — horizontal scroll-snap product cards |
| CheckoutFlow | Custom | Conditional — multi-step expanding form card |
| OrderTracker | Custom | Conditional — order status display |

### Reusable Components
| Component | Source | Reuse |
|-----------|--------|-------|
| ChatBubble | Custom | Per-message — text bubbles with isometric pop entrance |
| IslandCard | Custom | Per-option — floating cards with isometric hover |
| ProductCard | Custom | Per-product — 280x200 card with hover skew |
| AudioOrb | Custom | Singleton — expandable microphone button |
| WaveformVisualizer | Custom (R3F) | Singleton — 3D ring of dots behind input |
| IsometricText | Custom (CSS) | Once — 8-face 3D text for splash |
| ChipScroller | Custom | Reusable — horizontal chip list (categories, occasions) |
| DeliveryForm | Custom | Once — recipient details form |
| DatePickerCard | Custom | Once — mini calendar for delivery date |
| SecurePayButton | Custom | Once — animated "Pay Now" button |

### Hooks
| Hook | Purpose |
|------|---------|
| useChatState | Zustand store — conversation FSM (onboarding → shopping → checkout) |
| useAudioRecorder | Web Audio API — microphone input + speech recognition |
| useWaveformState | 'idle' \| 'listening' \| 'thinking' \| 'speaking' — drives visualizer |
| useScrollToBottom | Auto-scroll chat to latest message |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Gradient Background (blob morph) | Raw WebGL | Fullscreen fragment shader with simplex noise + brand color stops. Canvas fixed at z-index -1. | 🔒 High |
| Isometric 3D Text | CSS + GSAP | 8 stacked `.face` divs with `transform-style: preserve-3d`, `rotateX(30deg) rotateZ(-15deg)`. GSAP timeline for entrance "fall" (translateY from -100vh with spring) and exit reverse. | 🔒 High |
| Waveform Ring | React Three Fiber | 120 SphereGeometry dots in a ring. useFrame drives: (a) radial pulse on 'listening', (b) wave displacement on 'speaking', (c) constant slow rotation. | 🔒 High |
| Message Bubble Entrance | Framer Motion | `scale: [0, 1.1, 1]` + `rotateZ: [5, -2, 0]` with `type: "spring"`, `stiffness: 300`, `damping: 15`. Per-bubble triggered on mount. | Medium |
| Island Card Hover | CSS Transitions | `transform: skewX(-5deg) scale(1.05)` on hover with `box-shadow` deepening. Pure CSS `:hover` + `transition`. | Low |
| Product Carousel Stagger | Framer Motion | Parent `variants` with `staggerChildren: 0.1`. Children animate `y: [50, 0]`, `opacity: [0, 1]`, `scale: [0.9, 1]`. | Medium |
| Splash Float | CSS Keyframes | Infinite `translateY` oscillation (0 → -20px → 0 over 6s ease-in-out). Applied to `.isometric-text`. | Low |
| Audio Orb Expand | Framer Motion | `layoutId` or `animate={{ scale: 1.5, borderRadius: 20 }}` on click. Background dims via overlay opacity. | Medium |
| Background Gradient Transition | WebGL Uniform | Smooth color palette shifts by animating a "mood" uniform (0-3) passed to the shader, interpolating between brand color sets. | Medium |

---

## State & Logic Plan

### Chat State Machine (Zustand)
The conversation follows a finite state machine with 4 top-level states:

```
[INIT] → splash screen, no auth needed
  │
  ▼ (click "Let's Go")
[ONBOARDING] → show 3 intent cards (gift / shop / track)
  │
  ├───► [GIFT_MODE] ──► [PRODUCT_DISCOVERY] ──► [CHECKOUT]
  │
  ├───► [SHOP_MODE] ──► [PRODUCT_DISCOVERY] ──► [CHECKOUT]
  │
  └───► [TRACK_MODE] ──► [ORDER_STATUS]
```

Each state determines:
- Which UI components render (carousel, forms, chips)
- The background gradient "mood" (0=onboarding/yellow, 1=shopping/coral, 2=checkout/mauve)
- The AI system prompt context (what tools to prioritize)

### AI Orchestration (Backend — OpenAI Function Calling)
The backend maintains the MCP client connection and proxies tool calls:

1. Frontend sends user message via `trpc.chat.sendMessage` (mutation)
2. Backend appends to message history, sends to OpenAI with function definitions
3. OpenAI decides to call a function (e.g., `kapruka_search_products`)
4. Backend executes the tool via the MCP client, returns result to OpenAI
5. OpenAI generates natural language response with tool results
6. Backend streams the response back to frontend (tRPC subscription or SSE)
7. Frontend renders: text bubble + optional UI component (carousel, form)

**Tool mapping**: Each Kapruka MCP tool maps 1:1 to an OpenAI function definition:
- `kapruka_search_products` → find products
- `kapruka_get_product` → get product details
- `kapruka_list_categories` → browse categories
- `kapruka_list_delivery_cities` → find delivery cities
- `kapruka_check_delivery` → check delivery availability
- `kapruka_create_order` → create guest checkout order
- `kapruka_track_order` → track existing order

### Cart Management (Backend + DB)
- Cart stored in DB table (`carts`): sessionId, items (JSON array of {productId, qty, name, price, image}), createdAt
- tRPC endpoints: `cart.add`, `cart.remove`, `cart.get`, `cart.clear`
- Session identified by fingerprint (no auth required for guest checkout)

### Audio Flow
1. User clicks Audio Orb → `useAudioRecorder` starts recording via Web Audio API
2. Frontend sends audio blob to `trpc.chat.transcribe` (backend uses OpenAI Whisper)
3. Transcribed text injected as user message → flows through normal AI pipeline
4. AI response text sent to `trpc.chat.speak` (backend uses OpenAI TTS)
5. Audio URL streamed back to frontend, auto-played
6. Waveform state transitions: idle → listening → thinking → speaking → idle

---

## MCP Integration Architecture

### Connection Strategy
The backend uses the official `@anthropic-ai/mcp` (or `mcp`) npm package to create an MCP client that connects to Kapruka's Streamable HTTP endpoint:

```typescript
// api/lib/mcp-client.ts
import { Client } from "@anthropic-ai/mcp";

const mcpClient = new Client({ name: "kiki", version: "1.0.0" });
await mcpClient.connect(new StreamableHttpTransport("https://mcp.kapruka.com/mcp"));
```

### Tool Proxy Pattern
Instead of exposing MCP directly to the frontend (which would require auth), the backend:
1. Discovers available tools via `mcpClient.listTools()`
2. Registers each tool as an OpenAI function definition (name, description, parameters)
3. When OpenAI requests a tool call, the backend executes `mcpClient.callTool(name, args)`
4. Results are fed back into the conversation

### Rate Limiting
- Kapruka: 60 req/min per IP, 30 orders/hour per IP
- Backend must implement request deduplication and caching (30s TTL for product reads)
- Exponential backoff on 429 responses

---

## Other Key Decisions

### No Auth Required
Guest checkout is fully supported by Kapruka. The app does not require user login. Sessions are tracked via anonymous fingerprint. OAuth/Kimi auth is included in the stack but not used for the core shopping flow.

### Multi-language Support (Future)
The UI strings are extracted to a config object. Sinhala/Tanglish can be added by swapping the string set. The AI system prompt can include "Respond in Sinhala" instructions.

### Currency
Default to LKR. The MCP supports multi-currency via the `currency` parameter. The backend passes through the user's selected currency.

### Deployment
- Frontend + Backend: Single fullstack deployment
- Environment variable needed: `OPENAI_API_KEY`
- No Kapruka API key needed (public MCP)
