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
  X,
  LogOut,
} from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import type {
  ChatMessage,
  Product,
  DeliveryInfo,
  TrackingInfo,
  OrderInfo,
} from "@/store/chatStore";
import { trpc } from "@/providers/trpc";
import { useT } from "@/lib/i18n";
import GradientBackground from "@/components/effects/GradientBackground";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatBubble from "@/components/chat/ChatBubble";
import OnboardingCards from "@/components/chat/OnboardingCards";
import ProductCarousel from "@/components/chat/ProductCarousel";
import ChatInputBar from "@/components/chat/ChatInputBar";
import CartDrawer from "@/components/chat/CartDrawer";
import CheckoutForm from "@/components/chat/CheckoutForm";
import DeliveryCard from "@/components/chat/DeliveryCard";
import OrderTrackingCard from "@/components/chat/OrderTrackingCard";
import OrderConfirmationCard from "@/components/chat/OrderConfirmationCard";
import ThinkingIndicator from "@/components/chat/ThinkingIndicator";
import GiftGenie from "@/components/chat/GiftGenie";
import FestivalChips from "@/components/chat/FestivalChips";

interface NavItem {
  icon: typeof Compass;
  label: string;
  prompt: string;
}

function SplashScreen({ onStart }: { onStart: () => void }) {
  const { t } = useT();
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
              "linear-gradient(135deg, #10133f 0%, #2563eb 50%, #6d5dfc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          KIKI
        </h1>
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
          className="absolute -right-6 -top-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] text-white shadow-lg shadow-indigo-500/30 sm:-right-8 sm:-top-8 sm:h-20 sm:w-20"
        >
          <Sparkles className="h-6 w-6 sm:h-9 sm:w-9" />
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center text-sm font-semibold text-[#5f67a8] sm:text-base"
        style={{ fontFamily: "Quicksand, sans-serif" }}
      >
        {t("splash.tagline")}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="rounded-full bg-gradient-to-r from-[#482880] to-[#6d5dfc] px-8 py-4 text-lg font-bold text-white shadow-xl shadow-purple-500/30 transition-shadow hover:shadow-2xl mt-8"
        style={{ fontFamily: "Quicksand, sans-serif" }}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {t("splash.cta")}
        </span>
      </motion.button>
    </motion.div>
  );
}

export const themeStyles = {
  light: {
    outerBg: "bg-[#d8d2e8]",
    cardBg: "border-white/60 bg-white/25",
    mainBg: "bg-gradient-to-br from-white/60 via-[#f5f2fa]/50 to-[#e8e4f5]/50",
    sidebarBg: "border-r border-white/50 bg-white/40",
    sidebarText: "text-[#482880] hover:bg-[#482880]/10 hover:text-[#482880]",
    sidebarTitle: "text-[#482880]",
    sidebarSub: "text-[#745f9e]",
    sparklesBg: "from-[#482880] via-[#6d5dfc] to-[#eab308]",
    chatBg: "border border-[#482880]/15 bg-white/90 text-[#1b0a33]",
    headerBg: "border-b border-white/60 bg-white/45",
    headerTitle: "text-[#482880]",
    headerSub: "text-[#745f9e]",
    newChatBtn: "bg-[#482880]/10 text-[#482880] hover:bg-[#482880]/20",
    inputBarBg: "border-t border-white/50 bg-white/35",
    inputBg: "border border-[#482880]/20 bg-white/85 text-[#1b0a33] placeholder-[#948ca6]",
    cartBtn: "border border-[#482880]/20 bg-white/70 text-[#482880] hover:bg-white",
    cartDrawerBg: "bg-white/95 text-[#1b0a33]",
  },
  midnight: {
    outerBg: "bg-[#0e0a1a]",
    cardBg: "border-white/10 bg-black/40",
    mainBg: "bg-gradient-to-br from-black/45 via-[#171126]/40 to-[#0e0a1a]/45",
    sidebarBg: "border-r border-white/10 bg-black/30",
    sidebarText: "text-[#d4cbef] hover:bg-[#482880]/30 hover:text-white",
    sidebarTitle: "text-white",
    sidebarSub: "text-[#a89dc7]",
    sparklesBg: "from-[#482880] via-[#2f135b] to-[#1c073a]",
    chatBg: "border border-white/10 bg-[#161026]/90 text-slate-100",
    headerBg: "border-b border-white/10 bg-black/30",
    headerTitle: "text-white",
    headerSub: "text-[#a89dc7]",
    newChatBtn: "bg-white/10 text-white hover:bg-white/20",
    inputBarBg: "border-t border-white/10 bg-black/35",
    inputBg: "border border-white/10 bg-[#110b1f]/80 text-white placeholder-[#8d82b0]",
    cartBtn: "border border-white/10 bg-slate-900/60 text-[#eab308] hover:bg-slate-900/85",
    cartDrawerBg: "bg-[#110a1f]/95 text-slate-100",
  },
  sunset: {
    outerBg: "bg-[#ffece5]",
    cardBg: "border-white/60 bg-white/20",
    mainBg: "bg-gradient-to-br from-white/50 via-[#fff9f7]/40 to-[#ffeae5]/40",
    sidebarBg: "border-r border-white/40 bg-white/30",
    sidebarText: "text-[#5c2a1c] hover:bg-[#482880]/10 hover:text-[#482880]",
    sidebarTitle: "text-[#482880]",
    sidebarSub: "text-[#856157]",
    sparklesBg: "from-[#482880] via-[#ea580c] to-[#ffd200]",
    chatBg: "border border-[#482880]/20 bg-white/90 text-[#30150d]",
    headerBg: "border-b border-white/40 bg-white/30",
    headerTitle: "text-[#482880]",
    headerSub: "text-[#856157]",
    newChatBtn: "bg-white/50 text-[#482880] hover:bg-white",
    inputBarBg: "border-t border-white/40 bg-white/25",
    inputBg: "border border-white/65 bg-white/80 text-[#30150d] placeholder-[#c5a69f]",
    cartBtn: "border border-white/40 bg-white/60 text-[#ea580c] hover:bg-white",
    cartDrawerBg: "bg-white/95 text-[#30150d]",
  },
};

function LeftSidebar({
  navItems,
  onSendMessage,
  onNewChat,
  styles,
  user,
  logout,
  theme,
}: {
  navItems: NavItem[];
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
  styles: typeof themeStyles.light;
  user: { name: string; email: string } | null;
  logout: () => void;
  theme: string;
}) {
  const { t } = useT();
  return (
    <aside className={`hidden w-[200px] shrink-0 flex-col border-r px-4 py-5 backdrop-blur-2xl lg:flex ${styles.sidebarBg}`}>
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#482880] to-[#facc15]/60 shadow-lg shadow-purple-500/20">
          <img src="/kiki-avatar.png" alt="Kiki" className="h-full w-full object-cover" />
        </div>
        <div>
          <p
            className={`text-sm font-bold ${styles.sidebarTitle}`}
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            Kiki
          </p>
          <p className={`text-[11px] font-medium ${styles.sidebarSub}`}>Kapruka AI</p>
        </div>
      </div>

      <button
        onClick={onNewChat}
        className="mb-4 flex w-full items-center gap-2 rounded-2xl bg-gradient-to-r from-[#482880] to-[#6d5dfc] px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition-shadow hover:shadow-lg"
      >
        <MessageSquarePlus className="h-4 w-4" />
        {t("sidebar.newChat")}
      </button>

      <nav className="mb-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.label}
            onClick={() => onSendMessage(item.prompt)}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${styles.sidebarText}`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className={`rounded-[24px] bg-gradient-to-br ${styles.sparklesBg} p-4 text-white shadow-xl shadow-purple-500/20`}>
        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-2xl bg-white/20">
          <Sparkles className="h-4 w-4" />
        </div>
        <p className="text-xs font-bold">{t("sidebar.liveTitle")}</p>
        <p className="mt-1 text-[10px] leading-relaxed text-white/80">
          {t("sidebar.liveSub")}
        </p>
      </div>

      {/* User Profile */}
      <div className={`mt-auto flex items-center justify-between rounded-2xl border p-2.5 backdrop-blur-md transition-colors ${
        theme === 'midnight' ? 'border-white/10 bg-slate-950/45 text-white' : 'border-purple-100 bg-[#f6f2ff] text-[#10133f]'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#482880] to-[#6d5dfc] text-xs font-bold text-white uppercase">
            {user?.name ? user.name[0] : "G"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold leading-none">{user?.name || t("sidebar.guest")}</p>
            <p className={`truncate text-[9px] mt-0.5 ${theme === 'midnight' ? 'text-slate-400' : 'text-[#745f9e]'}`}>{user?.email || "guest@kapruka.com"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title={t("sidebar.logout")}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors ${
            theme === 'midnight' ? 'hover:bg-white/10 text-slate-400 hover:text-red-400' : 'hover:bg-purple-100 text-slate-600 hover:text-red-500'
          }`}
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}

function HistoryRail({
  prompts,
  onSelect,
  onClearHistory,
  styles,
}: {
  prompts: string[];
  onSelect: (prompt: string) => void;
  onClearHistory: () => void;
  styles: typeof themeStyles.light;
}) {
  const { t } = useT();
  return (
    <aside className={`hidden w-[250px] shrink-0 flex-col border-l px-4 py-5 backdrop-blur-2xl xl:flex ${styles.sidebarBg}`}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2
            className={`text-base font-bold ${styles.sidebarTitle}`}
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            {t("history.title")}
          </h2>
          <p className={`text-xs ${styles.sidebarSub}`}>{t("history.sub")}</p>
        </div>
        <Clock3 className="h-4 w-4 text-[#5d6ff2]" />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {prompts.length === 0 ? (
          <p className={`px-2 text-xs ${styles.sidebarSub}`}>
            {t("history.empty")}
          </p>
        ) : (
          prompts.map((item, index) => (
            <button
              key={`${item}-${index}`}
              onClick={() => onSelect(item)}
              className={`group flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${styles.sidebarText}`}
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/70 text-[#5d6ff2]">
                <Search className="h-3.5 w-3.5" />
              </div>
              <p className="min-w-0 truncate text-xs font-semibold">
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
          {t("history.clear")}
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
  const user = useChatStore(s => s.user);
  const logout = useChatStore(s => s.logout);
  const theme = useChatStore(s => s.theme || "light");

  const { t, p } = useT();

  const [cartOpen, setCartOpen] = useState(false);
  const [genieOpen, setGenieOpen] = useState(false);
  const [streamingId, setStreamingId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const greetingAddedRef = useRef<string | null>(null);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // During the typewriter reveal we get a tick per few characters; smooth-
  // scrolling on every tick causes a jittery "vibrating" feel, so throttle to
  // an instant nudge at most ~10×/sec.
  const lastScrollRef = useRef(0);
  const throttledScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastScrollRef.current > 100) {
      lastScrollRef.current = now;
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const navItems: NavItem[] = [
    { icon: Compass, label: t("sidebar.explore"), prompt: p("explore") },
    { icon: Gift, label: t("sidebar.gifts"), prompt: p("gifts") },
    { icon: ShoppingBag, label: t("sidebar.shop"), prompt: p("shop") },
    { icon: PackageSearch, label: t("sidebar.track"), prompt: p("track") },
  ];

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
        content: t("greeting", { name: user?.name || t("greeting.fallbackName") }),
        createdAt: new Date(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, sessionId, messages.length, addMessage, user?.name]);

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
        // Pull the freshest state so the agent always sees the real cart and
        // the full conversation (the backend is stateless).
        const store = useChatStore.getState();
        const history = store.messages.map(m => ({ role: m.role, content: m.content })).slice(-16);
        const cartPayload = store.cart.map(c => ({
          product_id: c.productId,
          name: c.name,
          price: c.price,
          quantity: c.qty,
        }));

        const response = await sendMessageMutation.mutateAsync({
          messages: history,
          cart: cartPayload,
          language: store.language || "en",
        });

        // Pull rich results out of the agent's real tool calls.
        let products: Product[] | undefined;
        let delivery: DeliveryInfo | undefined;
        let tracking: TrackingInfo | undefined;
        let order: OrderInfo | undefined;
        const actions: string[] = [];

        if (response.functionCalls) {
          for (const fc of response.functionCalls) {
            if (!actions.includes(fc.name)) actions.push(fc.name);
            const result = fc.result as
              | {
                  products?: Product[];
                  product?: Product;
                  delivery?: DeliveryInfo;
                  tracking?: TrackingInfo;
                  order?: OrderInfo;
                }
              | undefined;
            if (fc.name === "kapruka_search_products" && result?.products?.length) {
              products = result.products;
            } else if (fc.name === "kapruka_get_product" && result?.product) {
              products = [result.product];
            } else if (fc.name === "kapruka_check_delivery" && result?.delivery) {
              delivery = result.delivery;
            } else if (fc.name === "kapruka_track_order" && result?.tracking) {
              tracking = result.tracking;
            } else if (fc.name === "kapruka_create_order" && result?.order) {
              order = result.order;
              setState("order_status");
            }
          }
        }

        const assistantId = Date.now() + 1;
        setStreamingId(assistantId);
        addMessage({
          id: assistantId,
          sessionId,
          role: "assistant",
          content: response.message,
          metadata: {
            functionCalls: response.functionCalls,
            products: products?.filter(prod => prod && prod.product_id),
            delivery,
            tracking,
            order,
            actions,
          },
          createdAt: new Date(),
        });
      } catch (error) {
        console.error("Chat error:", error);
        const assistantId = Date.now() + 1;
        setStreamingId(assistantId);
        addMessage({
          id: assistantId,
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
    setGenieOpen(false);
  }, [newChat, setState]);

  const handleGenieComplete = useCallback(
    (prompt: string) => {
      setGenieOpen(false);
      handleSend(prompt);
    },
    [handleSend]
  );

  const historyPrompts = [
    ...new Set(messages.filter(m => m.role === "user").map(m => m.content)),
  ]
    .reverse()
    .slice(0, 12);

  const lastUserMessage =
    [...messages].reverse().find(m => m.role === "user")?.content ?? "";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const styles = themeStyles[theme] || themeStyles.light;
  const showOnboarding = state === "onboarding" && messages.length <= 1 && !genieOpen;

  return (
    <div className={`h-[100dvh] w-screen overflow-hidden transition-colors duration-500 ${styles.outerBg}`}>
      <GradientBackground />

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-[#0f172a]/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed bottom-0 left-0 top-0 z-50 flex w-[260px] flex-col p-5 shadow-2xl backdrop-blur-2xl lg:hidden ${styles.sidebarBg}`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9]">
                    <img src="/kiki-avatar.png" alt="Kiki" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${styles.sidebarTitle}`} style={{ fontFamily: "Quicksand, sans-serif" }}>Kiki</p>
                    <p className={`text-[10px] font-medium ${styles.sidebarSub}`}>Kapruka AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                    theme === 'midnight' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-blue-50 text-slate-700 hover:bg-blue-100'
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNewChat();
                }}
                className="mb-4 flex w-full items-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#6d5dfc] px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
              >
                <MessageSquarePlus className="h-4 w-4" />
                {t("sidebar.newChat")}
              </button>

              <nav className="space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSend(item.prompt);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${styles.sidebarText}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className={`mt-4 rounded-[24px] bg-gradient-to-br ${styles.sparklesBg} p-4 text-white shadow-xl shadow-blue-500/20`}>
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-2xl bg-white/20">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold">{t("sidebar.liveTitle")}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-white/80">
                  {t("sidebar.liveSub")}
                </p>
              </div>

              <div className={`mt-auto flex items-center justify-between rounded-2xl border p-2.5 backdrop-blur-md transition-colors ${
                theme === 'midnight' ? 'border-white/10 bg-slate-950/45 text-white' : 'border-blue-100 bg-[#f3f7ff] text-[#10133f]'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#6d5dfc] text-xs font-bold text-white uppercase">
                    {user?.name ? user.name[0] : "G"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold leading-none">{user?.name || t("sidebar.guest")}</p>
                    <p className={`truncate text-[9px] mt-0.5 ${theme === 'midnight' ? 'text-slate-400' : 'text-[#6870a7]'}`}>{user?.email || "guest@kapruka.com"}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  title={t("sidebar.logout")}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    theme === 'midnight' ? 'hover:bg-white/10 text-slate-400 hover:text-red-400' : 'hover:bg-blue-100 text-slate-600 hover:text-red-500'
                  }`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
            <div className={`flex h-full w-full max-w-[1360px] overflow-hidden shadow-2xl shadow-[#283b82]/20 backdrop-blur-2xl sm:h-[calc(100dvh-2.5rem)] sm:rounded-[32px] sm:border transition-colors duration-500 ${styles.cardBg}`}>
              <LeftSidebar
                navItems={navItems}
                onSendMessage={handleSend}
                onNewChat={handleNewChat}
                styles={styles}
                user={user}
                logout={logout}
                theme={theme}
              />

              <main className={`relative flex min-w-0 flex-1 flex-col transition-colors duration-500 ${styles.mainBg}`}>
                <ChatHeader
                  onNewChat={handleNewChat}
                  onOpenCart={() => setCartOpen(true)}
                  onOpenMenu={() => setMobileMenuOpen(true)}
                />

                <div className="flex-1 space-y-4 overflow-y-auto px-3 py-5 sm:px-8 lg:px-10">
                  {messages.map((msg, index) => {
                    // Hold the rich cards back until the bubble finishes typing,
                    // so they slide in after the text instead of popping in mid-
                    // stream (which looked like a "vibrating" UI).
                    const cardsReady = msg.id !== streamingId;
                    return (
                      <div key={msg.id} className="space-y-2">
                        <ChatBubble
                          message={msg}
                          index={index}
                          streaming={msg.id === streamingId}
                          onStreamDone={() => {
                            setStreamingId(null);
                            scrollToBottom();
                          }}
                          onTick={throttledScroll}
                        />
                        {cardsReady &&
                          msg.metadata?.products &&
                          msg.metadata.products.length > 0 && (
                            <ProductCarousel
                              products={msg.metadata.products}
                              onAddToCart={handleAddToCart}
                            />
                          )}
                        {cardsReady && msg.metadata?.delivery && (
                          <div className="flex justify-start pl-11">
                            <DeliveryCard delivery={msg.metadata.delivery} />
                          </div>
                        )}
                        {cardsReady && msg.metadata?.tracking && (
                          <div className="flex justify-start pl-11">
                            <OrderTrackingCard tracking={msg.metadata.tracking} />
                          </div>
                        )}
                        {cardsReady && msg.metadata?.order && (
                          <div className="flex justify-start pl-11">
                            <OrderConfirmationCard order={msg.metadata.order} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {showOnboarding && (
                    <div className="space-y-5">
                      <OnboardingCards onSendMessage={handleSend} onOpenGenie={() => setGenieOpen(true)} />
                      <FestivalChips onSend={handleSend} />
                    </div>
                  )}

                  <AnimatePresence>
                    {genieOpen && (
                      <GiftGenie onComplete={handleGenieComplete} onCancel={() => setGenieOpen(false)} />
                    )}
                  </AnimatePresence>

                  {state === "checkout" && <CheckoutForm />}

                  {isLoading && <ThinkingIndicator lastUserMessage={lastUserMessage} />}

                  <div ref={chatEndRef} />
                </div>

                <ChatInputBar onSend={handleSend} />
              </main>

              <HistoryRail
                prompts={historyPrompts}
                onSelect={handleSend}
                onClearHistory={handleNewChat}
                styles={styles}
              />
            </div>

            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
