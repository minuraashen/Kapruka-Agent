# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes    |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, email **minuraashen@gmail.com** with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

You can expect an acknowledgement within **48 hours** and a resolution within **7 days** for critical issues.

## Scope

This project is a demo application built for a hackathon. Key security notes:

- **No user data is stored server-side** — the backend is fully stateless.
- **No real payment processing** — order creation delegates to Kapruka's guest pay link.
- **API keys** (`LLM_API_KEY`) are server-side only and never exposed to the client.
- **No authentication** — the app is designed for anonymous guest shopping.

## Out of Scope

- Denial-of-service attacks against the free-tier deployment
- Rate-limiting of the public Kapruka MCP (this is Kapruka's infrastructure)
- Issues in third-party dependencies (report those upstream)
