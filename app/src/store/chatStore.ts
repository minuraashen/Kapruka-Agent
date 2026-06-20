import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChatState =
  | "splash"
  | "onboarding"
  | "gift_mode"
  | "shop_mode"
  | "track_mode"
  | "product_discovery"
  | "checkout"
  | "order_status";

export interface Product {
  product_id: string;
  name: string;
  price: number;
  currency?: string;
  image?: string;
  description?: string;
  in_stock?: boolean;
  stock_label?: string;
  ships_internationally?: boolean;
  url?: string;
  category?: string;
  vendor?: string;
}

export interface ChatMessage {
  id: number;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    functionCalls?: Array<{
      name: string;
      arguments: Record<string, unknown>;
      result?: unknown;
    }>;
    // Products parsed from a search result, rendered inline as cards.
    products?: Product[];
  };
  createdAt: Date;
}

interface ChatStore {
  // State machine
  state: ChatState;
  setState: (state: ChatState) => void;

  // Session
  sessionId: string;
  newChat: () => void;

  // Messages
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: number, patch: Partial<ChatMessage>) => void;

  // Input
  inputText: string;
  setInputText: (text: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Cart
  cart: Array<{
    productId: string;
    name: string;
    price: number;
    qty: number;
    image?: string;
  }>;
  setCart: (cart: ChatStore["cart"]) => void;
  addToCart: (item: ChatStore["cart"][0]) => void;
  removeFromCart: (productId: string) => void;

  // Intent
  intent: string | null;
  setIntent: (intent: string | null) => void;

  // Theme switcher
  theme: "light" | "midnight" | "sunset";
  setTheme: (theme: "light" | "midnight" | "sunset") => void;

  // Authentication
  user: { name: string; email: string } | null;
  login: (user: { name: string; email: string }) => void;
  logout: () => void;
}

function generateSessionId(): string {
  return "kiki_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      state: "splash",
      setState: (state) => set({ state }),

      sessionId: generateSessionId(),
      newChat: () =>
        set({
          sessionId: generateSessionId(),
          messages: [],
          cart: [],
          intent: null,
          inputText: "",
          state: "onboarding",
        }),

      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set({ messages: [...get().messages, message] }),
      updateMessage: (id, patch) =>
        set({
          messages: get().messages.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        }),

      inputText: "",
      setInputText: (text) => set({ inputText: text }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      cart: [],
      setCart: (cart) => set({ cart }),
      addToCart: (item) => {
        const existing = get().cart.find((c) => c.productId === item.productId);
        if (existing) {
          set({
            cart: get().cart.map((c) =>
              c.productId === item.productId
                ? { ...c, qty: c.qty + item.qty }
                : c
            ),
          });
        } else {
          set({ cart: [...get().cart, item] });
        }
      },
      removeFromCart: (productId) =>
        set({
          cart: get().cart.filter((c) => c.productId !== productId),
        }),

      intent: null,
      setIntent: (intent) => set({ intent }),

      theme: "light",
      setTheme: (theme) => set({ theme }),

      user: null,
      login: (user) => set({ user }),
      logout: () =>
        set({
          user: null,
          sessionId: generateSessionId(),
          messages: [],
          cart: [],
          intent: null,
          inputText: "",
          state: "splash",
        }),
    }),
    {
      name: "kiki-chat",
      partialize: (state) => ({
        sessionId: state.sessionId,
        state: state.state,
        cart: state.cart,
        intent: state.intent,
        theme: state.theme,
        user: state.user,
      }),
    }
  )
);
