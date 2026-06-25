# Deploying Kiki for free (no credit card)

Kiki is one Node service that serves both the built React app and the API, so a
single free web service is all you need. The app is stateless (no database).

## Recommended: Render free tier + UptimeRobot

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy-ready"
git push
```

### 2. Create the service on Render
- Go to <https://render.com> → sign in with GitHub (no card needed).
- **New → Blueprint**, pick this repo. Render reads [`render.yaml`](render.yaml)
  and pre-fills everything (root dir `app`, build, start, health check).
- In the service's **Environment** tab, set the one secret:
  - `LLM_API_KEY` = your OpenRouter key (free, from <https://openrouter.ai/keys>)
- Deploy. First build takes a few minutes; you'll get a URL like
  `https://kiki-kapruka.onrender.com`.

### 3. Keep it warm (beats the free-tier cold start)
Free services spin down after ~15 min idle (≈50s cold start). Stop that:
- Create a free monitor at <https://uptimerobot.com>.
- Monitor type **HTTP(s)**, URL `https://YOUR-APP.onrender.com/api/health`,
  interval **5 minutes**. That keeps the instance awake through judging.

## Alternative hosts (Docker)
[`app/Dockerfile`](app/Dockerfile) builds a portable image for:
- **Hugging Face Spaces** (Docker Space — free, no card). Add to the Space
  README front-matter: `app_port: 3000`.
- **Fly.io / Koyeb / Railway** — point them at `app/Dockerfile`.

For any host, set these env vars:
| Var | Value |
|---|---|
| `NODE_ENV` | `production` |
| `LLM_API_KEY` | your OpenRouter key |
| `LLM_BASE_URL` | `https://openrouter.ai/api/v1` |
| `LLM_MODEL` | `openai/gpt-oss-120b:free,openai/gpt-oss-20b:free,openrouter/free` |
| `PORT` | injected by the host (the server reads it) |

## Reliability notes (zero-cost)
- **`LLM_MODEL` is a fallback chain.** If the first free model returns 429, the
  agent automatically tries the next — so a rate limit doesn't kill a turn.
- **MCP warms on boot**, so the first real message skips the connect handshake.
- **`/api/health`** is a lightweight liveness check for the uptime pinger.
