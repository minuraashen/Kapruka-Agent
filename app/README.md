---
title: Kapruka Agent
emoji: 👀
colorFrom: yellow
colorTo: indigo
sdk: docker
app_port: 3000
pinned: false
license: mit
short_description: AI Chat Agent for Kapruka Online Shopping Store
---

# Kapruka Kiki — AI Shopping Assistant

[![Live Demo](https://img.shields.io/badge/Live%20Demo-HF%20Space-FF6C37?style=for-the-badge&logo=huggingface&logoColor=white)](https://minuraashen-kapruka-agent.hf.space)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://github.com/minuraashen/Kapruka-Agent/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

A beautiful, full-screen conversational AI shopping assistant for **Kapruka** — Sri Lanka's largest e-commerce platform. Built for the **Kapruka Agent Challenge 2026**.

> 🌐 **Live:** [https://minuraashen-kapruka-agent.hf.space](https://minuraashen-kapruka-agent.hf.space)
> 📦 **Source:** [github.com/minuraashen/Kapruka-Agent](https://github.com/minuraashen/Kapruka-Agent)

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

## What Kiki Does

Chat in natural language (English, Sinhala, or Tanglish) to:
- **Discover products** — AI searches the Kapruka catalog and shows visual cards
- **Send gifts** — Gift Genie guides you (who / occasion / budget) to the perfect gift
- **Check delivery** — real-time quotes for any Sri Lankan city
- **Complete checkout** — full guest checkout with a Kapruka pay link
- **Track orders** — live order status

## Architecture

### Frontend
- **React 19 + TypeScript + Vite 7**
- **Tailwind CSS v3 + shadcn/ui** for styling
- **Framer Motion** for animations
- **Zustand** for state management (persisted to localStorage)
- **Raw WebGL** animated gradient background (simplex noise shader)
- Three themes: Light / Midnight / Sunset

### Backend
- **Hono + tRPC 11** — fully stateless (no database)
- **`@modelcontextprotocol/sdk`** — connects to Kapruka MCP
- **OpenRouter** (OpenAI-compatible) — LLM with function calling + fallback chain

### Kapruka MCP Tools
| Tool | Purpose |
|------|---------|
| `kapruka_search_products` | Search catalog by keyword |
| `kapruka_get_product` | Get product details + image |
| `kapruka_list_categories` | Browse categories |
| `kapruka_list_delivery_cities` | List delivery cities |
| `kapruka_check_delivery` | Delivery availability & fee |
| `kapruka_create_order` | Guest checkout → pay link |
| `kapruka_track_order` | Track order status |

## Running Locally

```bash
cd app
npm install
cp .env.example .env   # fill in LLM_API_KEY from openrouter.ai
npm run dev            # http://localhost:3000
```

### Environment Variables
```env
LLM_API_KEY=sk-or-...
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=openai/gpt-oss-120b:free,openai/gpt-oss-20b:free,openrouter/free
```

No database required — the app is fully stateless.

## Docker

```bash
docker build -t kiki .
docker run -e LLM_API_KEY=sk-or-... -p 3000:3000 kiki
```

## Key Features

- **Typewriter message reveal** — simulated streaming for a lively feel
- **Product Carousel** — animated horizontal scroll with real images
- **Gift Genie** — 3-tap guided gift flow
- **Festival Chips** — Avurudu / Vesak / Christmas / Birthday shortcuts
- **Voice input** — Web Speech API, language-aware (si-LK / en-US)
- **EN / සිංහල i18n** — full chrome + agent replies in Sinhala
- **LLM fallback chain** — auto-retries next model on HTTP 429

## Rate Limits
- Kapruka MCP: 60 req/min per IP, 30 orders/hour
- 30s read cache + exponential backoff built in

## License

MIT © 2026 Minura Ashen — see [LICENSE](https://github.com/minuraashen/Kapruka-Agent/blob/main/LICENSE)
