import { createRouter, publicQuery } from "./middleware";
import { kaprukaRouter } from "./routers/kapruka";
import { chatRouter } from "./routers/chat";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  kapruka: kaprukaRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
