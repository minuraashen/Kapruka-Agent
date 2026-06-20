import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock3,
  Compass,
  Gift,
  MessageSquarePlus,
  PackageSearch,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import type { ChatMessage, Product } from "@/store/chatStore";
import { trpc } from "@/providers/trpc";
import GradientBackground from "@/components/effects/GradientBackground";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatBubble from "@/components/chat/ChatBubble";
import OnboardingCards from "@/components/chat/OnboardingCards";
import ProductCarousel from "@/components/chat/ProductCarousel";
import ChatInputBar from "@/components/chat/ChatInputBar";
import CartDrawer from "@/components/chat/CartDrawer";
import CheckoutForm from "@/components/chat/CheckoutForm";

function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center px-6"
    >
      <motion.div
        initial={{ y: -100, opacity: 0, rotateX: 30, rotateZ: -15 }}
        animate={{ y: 0, opacity: 1, rotateX: 30, rotateZ: -15 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative"
        style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
      >
        <h1
          className="select-none text-[26vw] font-bold leading-none sm:text-[20vw] md:text-[15vw]"
          style={{
            fontFamily: "Quicksand, sans-serif",
            background:
              "linear-gradient(180deg, #dbeafe, #60a5fa, #6d5dfc, #4c1d95)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 30px 60px rgba(37, 99, 235, 0.28)",
          }}
        >
          KIKI
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 mt-4 text-center text-sm text-[#172554]/70"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Your AI shopping assistant for Sri Lanka 🇱🇰
      </motion.p>

      <motion.button
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="rounded-full bg-gradient-to-r from-[#6d5dfc] to-[#1992ff] px-8 py-4 text-lg font-bold text-white shadow-xl shadow-[#4f46e5]/30 transition-shadow hover:shadow-2xl"
        style={{ fontFamily: "Quicksand, sans-serif" }}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Let&apos;s Shop!
        </span>
      </motion.button>
    </motion.div>
  );
}

const navItems = [
  { icon: Compass, label: "Explore", prompt: "Show me popular Kapruka gifts and hampers right now." },
  { icon: Gift, label: "Gifts", prompt: "Help me find a thoughtful gift for someone special." },
  { icon: ShoppingBag, label: "Shop", prompt: "I want to shop for something for myself." },
  { icon: PackageSearch, label: "Track order", prompt: "I'd like to track my order." },
];

function LeftSidebar({
  onSendMessage,
  onNewChat,
}: {
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
}) {
  return (
    <aside className="hidden w-[200px] shrink-0 flex-col border-r border-white/50 bg-white/40 px-4 py-5 backdrop-blur-2xl lg:flex">
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] shadow-lg shadow-blue-500/20">
          <img src="/kiki-avatar.png" alt="Kiki" className="h-full w-full object-cover" />
        </div>
        <div>
          <p
            className="text-sm font-bold text-[#10133f]"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            Kiki
          </p>
          <p className="text-[11px] font-medium text-[#5f67a8]">Kapruka AI</p>
        </div>
      </div>

      <button
        onClick={onNewChat}
        className="mb-4 flex w-full items-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#6d5dfc] px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-shadow hover:shadow-lg"
      >
        <MessageSquarePlus className="h-4 w-4" />
        New chat
      </button>

      <nav className="space-y-1">
        {navItems.map(item => (
          <button
            key={item.label}
            onClick={() => onSendMessage(item.prompt)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-[#38406f] transition-colors hover:bg-white/60 hover:text-[#2563eb]"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-[24px] bg-gradient-to-br from-[#2563eb] via-[#6157f5] to-[#9b5cff] p-4 text-white shadow-xl shadow-blue-500/20">
        <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20">
          <Sparkles className="h-4 w-4" />
        </div>
        <p className="text-sm font-bold">Live Kapruka catalog</p>
        <p className="mt-1 text-xs leading-relaxed text-white/80">
          Real products, real delivery quotes, real guest checkout — powered by
          the Kapruka MCP.
        </p>
      </div>
    </aside>
  );
}

function HistoryRail({
  prompts,
  onSelect,
  onClearHistory,
}: {
  prompts: string[];
  onSelect: (prompt: string) => void;
  onClearHistory: () => void;
}) {
  return (
    <aside className="hidden w-[250px] shrink-0 flex-col border-l border-white/50 bg-white/35 px-4 py-5 backdrop-blur-2xl xl:flex">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2
            className="text-base font-bold text-[#10133f]"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            This chat
          </h2>
          <p className="text-xs text-[#6870a7]">Your recent asks</p>
        </div>
        <Clock3 className="h-4 w-4 text-[#5d6ff2]" />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {prompts.length === 0 ? (
          <p className="px-2 text-xs text-[#777faa]">
            Your questions will show up here as you chat with Kiki.
          </p>
        ) : (
          prompts.map((item, index) => (
            <button
              key={`${item}-${index}`}
              onClick={() => onSelect(item)}
              className="group flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-white/60"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/70 text-[#5d6ff2]">
                <Search className="h-3.5 w-3.5" />
              </div>
              <p className="min-w-0 truncate text-xs font-semibold text-[#252a55]">
                {item}
              </p>
            </button>
          ))
        )}
      </div>

      {prompts.length > 0 && (
        <button
          onClick={onClearHistory}
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white/70 px-4 py-3 text-xs font-semibold text-[#dc2626] shadow-sm transition-colors hover:bg-white"
        >
          <Trash2 className="h-4 w-4" />
          Clear chat
        </button>
      )}
    </aside>
  );
}

export default function Home() {
  const state = useChatStore(s => s.state);
  const setState = useChatStore(s => s.setState);
  const sessionId = useChatStore(s => s.sessionId);
  const messages = useChatStore(s => s.messages);
  const addMessage = useChatStore(s => s.addMessage);
  const inputText = useChatStore(s => s.inputText);
  const setInputText = useChatStore(s => s.setInputText);
  const setIsLoading = useChatStore(s => s.setIsLoading);
  const addToCart = useChatStore(s => s.addToCart);
  const isLoading = useChatStore(s => s.isLoading);
  const newChat = useChatStore(s => s.newChat);

  const [cartOpen, setCartOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const greetingAddedRef = useRef<string | null>(null);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Initial greeting
  useEffect(() => {
    if (
      state !== "splash" &&
      messages.length === 0 &&
      greetingAddedRef.current !== sessionId
    ) {
      greetingAddedRef.current = sessionId;
      addMessage({
        id: Date.now(),
        sessionId,
        role: "assistant",
        content:
          "Ayubowan! 🙏 I'm **Kiki**, your shopping buddy for Kapruka. I can find gifts, cakes, flowers and more — quote delivery anywhere in Sri Lanka, and take you all the way to checkout. What are we shopping for today?",
        createdAt: new Date(),
      });
    }
  }, [state, sessionId, messages.length, addMessage]);

  const handleSend = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? inputText).trim();
      if (!text || isLoading) return;

      const userMsg: ChatMessage = {
        id: Date.now(),
        sessionId,
        role: "user",
        content: text,
        createdAt: new Date(),
      };
      addMessage(userMsg);
      setInputText("");
      setIsLoading(true);

      try {
        const response = await sendMessageMutation.mutateAsync({
          sessionId,
          message: text,
        });

        // Pull any products out of the tool results to render inline cards.
        let products: Product[] | undefined;
        if (response.functionCalls) {
          for (const fc of response.functionCalls) {
            const result = fc.result as
              | { products?: Product[]; product?: Product }
              | undefined;
            if (fc.name === "kapruka_search_products" && result?.products?.length) {
              products = result.products;
            } else if (fc.name === "kapruka_get_product" && result?.product) {
              products = [result.product];
            }
            if (fc.name === "kapruka_create_order") {
              setState("order_status");
            }
          }
        }

        addMessage({
          id: Date.now() + 1,
          sessionId,
          role: "assistant",
          content: response.message,
          metadata: {
            functionCalls: response.functionCalls,
            products: products?.filter(p => p && p.product_id),
          },
          createdAt: new Date(),
        });
      } catch (error) {
        console.error("Chat error:", error);
        addMessage({
          id: Date.now() + 1,
          sessionId,
          role: "assistant",
          content:
            "Oops, something hiccuped on my end. 😅 Mind trying that again in a moment?",
          createdAt: new Date(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      inputText,
      isLoading,
      sessionId,
      addMessage,
      setInputText,
      setIsLoading,
      sendMessageMutation,
      setState,
    ]
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart({
        productId: product.product_id,
        name: product.name,
        price: product.price || 0,
        qty: 1,
        image: product.image,
      });
    },
    [addToCart]
  );

  const handleNewChat = useCallback(() => {
    newChat();
    setState("onboarding");
  }, [newChat, setState]);

  const historyPrompts = [
    ...new Set(messages.filter(m => m.role === "user").map(m => m.content)),
  ]
    .reverse()
    .slice(0, 12);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#b9b8ee]">
      <GradientBackground />

      <AnimatePresence mode="wait">
        {state === "splash" ? (
          <SplashScreen key="splash" onStart={() => setState("onboarding")} />
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative flex h-full items-center justify-center px-0 py-0 sm:px-4 sm:py-5 lg:px-8"
          >
            <div className="flex h-full w-full max-w-[1360px] overflow-hidden border-white/60 bg-white/25 shadow-2xl shadow-[#283b82]/20 backdrop-blur-2xl sm:h-[calc(100dvh-2.5rem)] sm:rounded-[32px] sm:border">
              <LeftSidebar onSendMessage={handleSend} onNewChat={handleNewChat} />

              <main className="relative flex min-w-0 flex-1 flex-col bg-gradient-to-br from-white/60 via-[#f7f7ff]/50 to-[#eaf8ff]/50">
                <ChatHeader
                  onNewChat={handleNewChat}
                  onOpenCart={() => setCartOpen(true)}
                />

                <div className="flex-1 space-y-4 overflow-y-auto px-3 py-5 sm:px-8 lg:px-10">
                  {messages.map((msg, index) => (
                    <div key={msg.id} className="space-y-4">
                      <ChatBubble message={msg} index={index} />
                      {msg.metadata?.products &&
                        msg.metadata.products.length > 0 && (
                          <ProductCarousel
                            products={msg.metadata.products}
                            onAddToCart={handleAddToCart}
                          />
                        )}
                    </div>
                  ))}

                  {state === "onboarding" && messages.length <= 1 && (
                    <OnboardingCards onSendMessage={handleSend} />
                  )}

                  {state === "checkout" && <CheckoutForm />}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                        <div className="flex gap-1">
                          {[0, 0.15, 0.3].map((delay, i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -6, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay }}
                              className="h-2 w-2 rounded-full bg-[#2563eb]"
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-xs text-[#6870a7]">
                          Kiki is thinking…
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                <ChatInputBar onSend={handleSend} />
              </main>

              <HistoryRail
                prompts={historyPrompts}
                onSelect={handleSend}
                onClearHistory={handleNewChat}
              />
            </div>

            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
