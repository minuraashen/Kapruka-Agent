import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { callKaprukaTool } from "../lib/mcp-client";

export const kaprukaRouter = createRouter({
  searchProducts: publicQuery
    .input(
      z.object({
        q: z.string(),
        category: z.string().optional(),
        min_price: z.number().optional(),
        max_price: z.number().optional(),
        in_stock_only: z.boolean().optional(),
        sort: z.string().optional(),
        limit: z.number().optional(),
        cursor: z.string().optional(),
        currency: z.string().optional().default("LKR"),
      })
    )
    .mutation(async ({ input }) => {
      return callKaprukaTool("kapruka_search_products", input);
    }),

  getProduct: publicQuery
    .input(
      z.object({
        product_id: z.string(),
        currency: z.string().optional().default("LKR"),
      })
    )
    .query(async ({ input }) => {
      return callKaprukaTool("kapruka_get_product", input);
    }),

  listCategories: publicQuery
    .input(z.object({ depth: z.number().optional() }))
    .query(async ({ input }) => {
      return callKaprukaTool("kapruka_list_categories", input);
    }),

  listDeliveryCities: publicQuery
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return callKaprukaTool("kapruka_list_delivery_cities", input);
    }),

  checkDelivery: publicQuery
    .input(
      z.object({
        city: z.string(),
        delivery_date: z.string(),
        product_id: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return callKaprukaTool("kapruka_check_delivery", input);
    }),

  createOrder: publicQuery
    .input(
      z.object({
        cart: z.array(
          z.object({
            product_id: z.string(),
            quantity: z.number(),
          })
        ),
        recipient: z.object({
          name: z.string(),
          address: z.string(),
          city: z.string(),
          phone: z.string(),
          email: z.string().optional(),
        }),
        delivery: z.object({
          date: z.string(),
          instructions: z.string().optional(),
        }),
        sender: z.object({
          name: z.string(),
          email: z.string(),
          phone: z.string().optional(),
        }),
        gift_message: z.string().optional(),
        currency: z.string().optional().default("LKR"),
      })
    )
    .mutation(async ({ input }) => {
      return callKaprukaTool("kapruka_create_order", input, false);
    }),

  trackOrder: publicQuery
    .input(z.object({ order_number: z.string() }))
    .query(async ({ input }) => {
      return callKaprukaTool("kapruka_track_order", input);
    }),
});
