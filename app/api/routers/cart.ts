import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { carts } from "@db/schema";
import { eq } from "drizzle-orm";

export const cartRouter = createRouter({
  get: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId));

      if (result.length === 0) {
        return { items: [] };
      }

      return { items: result[0].items as Array<{ productId: string; name: string; price: number; qty: number; image?: string }> };
    }),

  add: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        qty: z.number().default(1),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId));

      const newItem = {
        productId: input.productId,
        name: input.name,
        price: input.price,
        qty: input.qty,
        image: input.image,
      };

      if (existing.length === 0) {
        await db.insert(carts).values({
          sessionId: input.sessionId,
          items: [newItem],
        });
      } else {
        const items = existing[0].items as Array<typeof newItem>;
        const existingItem = items.find((i) => i.productId === input.productId);
        if (existingItem) {
          existingItem.qty += input.qty;
        } else {
          items.push(newItem);
        }
        await db
          .update(carts)
          .set({ items, updatedAt: new Date() })
          .where(eq(carts.sessionId, input.sessionId));
      }

      return { success: true };
    }),

  remove: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        productId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId));

      if (existing.length > 0) {
        const items = (existing[0].items as Array<{ productId: string }>).filter(
          (i) => i.productId !== input.productId
        );
        await db
          .update(carts)
          .set({ items, updatedAt: new Date() })
          .where(eq(carts.sessionId, input.sessionId));
      }

      return { success: true };
    }),

  updateQty: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        productId: z.string(),
        qty: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId));

      if (existing.length > 0) {
        const items = existing[0].items as Array<{ productId: string; qty: number }>;
        const item = items.find((i) => i.productId === input.productId);
        if (item) {
          item.qty = input.qty;
        }
        await db
          .update(carts)
          .set({ items, updatedAt: new Date() })
          .where(eq(carts.sessionId, input.sessionId));
      }

      return { success: true };
    }),

  clear: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(carts)
        .set({ items: [], updatedAt: new Date() })
        .where(eq(carts.sessionId, input.sessionId));

      return { success: true };
    }),
});
