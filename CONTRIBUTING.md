# Contributing to Kapruka Kiki

Thank you for your interest in contributing! Kiki is a conversational AI shopping assistant for [Kapruka](https://www.kapruka.com) built for the Kapruka Agent Challenge 2026.

## Getting Started

1. **Fork** the repository on [GitHub](https://github.com/minuraashen/Kapruka-Agent).
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Kapruka-Agent.git
   cd Kapruka-Agent/app
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Fill in LLM_API_KEY from https://openrouter.ai/keys
   ```
5. **Start the dev server**:
   ```bash
   npm run dev   # http://localhost:3000
   ```

## Project Structure

- `app/api/` — Hono + tRPC backend, MCP integration, agent loop
- `app/src/` — React 19 frontend (components, store, i18n)
- See [README.md](README.md) for the full file map.

## Development Workflow

### Branching
- `main` — stable, deployable
- `feature/<name>` — new features
- `fix/<name>` — bug fixes

### Code Style
- **TypeScript** is mandatory (no `any` unless absolutely necessary)
- Run `npm run check` (tsc) before opening a PR
- Format with `npm run format` (Prettier)
- Lint with `npm run lint` (ESLint)

### Running Tests
```bash
npm run test   # vitest
```

## How to Contribute

### Reporting Bugs
Open a [GitHub Issue](https://github.com/minuraashen/Kapruka-Agent/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS info
- Console errors (if any)

### Suggesting Features
Open an issue with the `enhancement` label. Describe the use case and how it fits the Kapruka shopping context.

### Submitting Pull Requests
1. Create a branch off `main`: `git checkout -b feature/my-feature`
2. Make your changes, keeping commits focused
3. Run `npm run check && npm run format && npm run test`
4. Open a PR against `main` — fill in the PR template

## Key Areas for Contribution

| Area | What's Needed |
|------|--------------|
| City autocomplete | Dropdown using `kapruka_list_delivery_cities` in checkout form |
| Sinhala translations | Improve/expand `src/lib/i18n.ts` `si` dictionary |
| Accessibility | ARIA labels, keyboard navigation, focus management |
| Tests | Integration tests for the agent loop and Markdown parsers |
| Performance | Code-splitting for WebGL/checkout; 30fps cap on gradient shader |
| Voice input | Improve `si-LK` speech recognition accuracy |

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
