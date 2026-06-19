import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  json,
  float,
} from "drizzle-orm/mysql-core";

export const chatSessions = mysqlTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
  state: varchar("state", { length: 32 }).notNull().default("onboarding"),
  intent: varchar("intent", { length: 32 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  role: varchar("role", { length: 16 }).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const carts = mysqlTable("carts", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  items: json("items").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  kaprukaOrderNumber: varchar("kapruka_order_number", { length: 64 }),
  payUrl: text("pay_url"),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  totalAmount: float("total_amount"),
  currency: varchar("currency", { length: 8 }).default("LKR"),
  recipientName: varchar("recipient_name", { length: 255 }),
  recipientAddress: text("recipient_address"),
  recipientCity: varchar("recipient_city", { length: 128 }),
  deliveryDate: varchar("delivery_date", { length: 32 }),
  giftMessage: text("gift_message"),
  items: json("items").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
