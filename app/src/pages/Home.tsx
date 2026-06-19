import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShoppingCart } from "lucide-react";
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
      className="fixed inset-0 z-40 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ y: -100, opacity: 0, rotateX: 30, rotateZ: -15 }}
        animate={{ y: 0, opacity: 1, rotateX: 30, rotateZ: -15 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative"
        style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
      >
        <h1
          className="text-[20vw] md:text-[15vw] font-bold leading-none select-none"
          style={{
            fontFamily: "Quicksand, sans-serif",
            background: "linear-gradient(180deg, #ffea76, #ffa53b, #ff7b89, #8c3a64)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 30px 60px rgba(255, 123, 137, 0.3)",
          }}
        >
          KIKI
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-[#020333]/60 text-sm mt-4 mb-8"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Your AI Shopping Assistant for Sri Lanka
      </motion.p>

      <motion.button
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="px-8 py-4 rounded-full bg-gradient-to-r from-[#ff7b89] to-[#ff8e72] text-white font-bold text-lg shadow-xl shadow-[#ff7b89]/30 hover:shadow-2xl transition-shadow"
        style={{ fontFamily: "Quicksand, sans-serif" }}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Let&apos;s Shop!
        </span>
      </motion.button>
    </motion.div>
  );
}

export default function Home() {
  const state = useChatStore((s) => s.state);
  const setState = useChatStore((s) => s.setState);
  const sessionId = useChatStore((s) => s.sessionId);
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const inputText = useChatStore((s) => s.inputText);
  const setInputText = useChatStore((s) => s.setInputText);
  const setIsLoading = useChatStore((s) => s.setIsLoading);
  const addToCart = useChatStore((s) => s.addToCart);
  const displayedProducts = useChatStore((s) => s.displayedProducts);
  const setDisplayedProducts = useChatStore((s) => s.setDisplayedProducts);
  const cart = useChatStore((s) => s.cart);
  const isLoading = useChatStore((s) => s.isLoading);

  const [cartOpen, setCartOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedProducts]);

  // Initial greeting
  useEffect(() => {
    if (state === "onboarding" && messages.length === 0) {
      addMessage({
        id: Date.now(),
        sessionId,
        role: "assistant",
        content:
          "Hey there! I'm Kiki, your personal shopping assistant for Kapruka! What would you like to do today?",
        createdAt: new Date(),
      });
    }
  }, [state]);

  const handleSend = useCallback(
    async (overrideText?: string) => {
      const text = overrideText || inputText.trim();
      if (!text) return;

      // Add user message
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

        // Add assistant message
        addMessage({
          id: Date.now() + 1,
          sessionId,
          role: "assistant",
          content: response.message,
          metadata: response.functionCalls
            ? { functionCalls: response.functionCalls }
            : undefined,
          createdAt: new Date(),
        });

        // Extract products from function call results
        if (response.functionCalls && response.functionCalls.length > 0) {
          for (const fc of response.functionCalls) {
            if (
              fc.name === "kapruka_search_products" &&
              fc.result
            ) {
              try {
                const result = fc.result as Record<string, unknown>;
                // Handle different response formats
                const products =
                  (result.products as Product[]) ||
                  (result.results as Product[]) ||
                  (Array.isArray(result) ? result : []);

                if (products.length > 0) {
                  setDisplayedProducts(products);
                  setState("product_discovery");
                }
              } catch {
                // ignore parse errors
              }
            }
            if (fc.name === "kapruka_create_order") {
              setState("order_status");
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        addMessage({
          id: Date.now() + 1,
          sessionId,
          role: "assistant",
          content:
            "Oops! Something went wrong. Let me try again — what were you looking for?",
          createdAt: new Date(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, sessionId, addMessage, setInputText, setIsLoading, sendMessageMutation, setDisplayedProducts, setState]
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      const productId = product.product_id || product.id || "";
      const name = product.name || product.title || "Product";
      const price = product.price || 0;
      const image = product.image || product.images?.[0];

      addToCart({ productId, name, price, qty: 1, image });

      addMessage({
        id: Date.now(),
        sessionId,
        role: "assistant",
        content: `Great choice! I've added **${name}** to your cart. Want to add more items or proceed to checkout?`,
        createdAt: new Date(),
      });
    },
    [addToCart, sessionId, addMessage]
  );

  const handleStart = useCallback(() => {
    setState("onboarding");
  }, [setState]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <GradientBackground />

      <AnimatePresence mode="wait">
        {state === "splash" ? (
          <SplashScreen key="splash" onStart={handleStart} />
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full relative"
          >
            <ChatHeader />

            {/* Floating cart button */}
            {cart.length > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCartOpen(true)}
                className="fixed top-20 right-4 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg border border-[#ff7b89]/20 flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 text-[#ff7b89]" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff7b89] text-white text-xs flex items-center justify-center font-bold">
                    {cart.reduce((s, i) => s + i.qty, 0)}
                  </span>
                )}
              </motion.button>
            )}

            {/* Chat Area */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{ scrollBehavior: "smooth" }}
            >
              {/* Messages */}
              {messages.map((msg, index) => (
                <ChatBubble key={msg.id} message={msg} index={index} />
              ))}

              {/* Onboarding Cards */}
              {state === "onboarding" && messages.length > 0 && (
                <OnboardingCards onSendMessage={handleSend} />
              )}

              {/* Product Carousel */}
              {displayedProducts.length > 0 &&
                (state === "product_discovery" ||
                  state === "gift_mode" ||
                  state === "shop_mode") && (
                  <ProductCarousel
                    products={displayedProducts}
                    onAddToCart={handleAddToCart}
                  />
                )}

              {/* Checkout Form */}
              {state === "checkout" && <CheckoutForm />}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 px-4 py-3 rounded-[20px] bg-white/80 backdrop-blur-sm border border-white/50">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-[#ff7b89]"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        className="w-2 h-2 rounded-full bg-[#ffa53b]"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        className="w-2 h-2 rounded-full bg-[#8c3a64]"
                      />
                    </div>
                    <span className="text-xs text-[#727288] ml-1">
                      Kiki is thinking...
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            <ChatInputBar onSend={handleSend} />
            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
