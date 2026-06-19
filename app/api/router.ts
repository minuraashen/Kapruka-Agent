import { createRouter, publicQuery } from "./middleware";
import { kaprukaRouter } from "./routers/kapruka";
import { chatRouter } from "./routers/chat";
import { cartRouter } from "./routers/cart";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  kapruka: kaprukaRouter,
  chat: chatRouter,
  cart: cartRouter,
});

export type AppRouter = typeof appRouter;
