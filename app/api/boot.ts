import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Lightweight health check — used by a free uptime pinger (e.g. UptimeRobot)
// to keep the free host warm and avoid cold starts during judging.
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  // Warm the MCP connection on boot so the first judge message doesn't pay the
  // connect handshake on top of the (already slow) free-model latency.
  void import("./lib/mcp-client")
    .then(({ getMcpClient }) => getMcpClient())
    .catch((e) => console.warn("[MCP] warm-up failed:", e?.message ?? e));

  const port = Number.parseInt(process.env.PORT || "3000", 10);
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
