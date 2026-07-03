import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingCart, Sun, Moon, Sunrise, ChevronDown, Menu, Languages, History } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useT } from "@/lib/i18n";
import { themeStyles } from "@/pages/Home";

interface Props {
  onNewChat: () => void;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  onOpenHistory: () => void;
}

export default function ChatHeader({ onNewChat, onOpenCart, onOpenMenu, onOpenHistory }: Props) {
  const cart = useChatStore(s => s.cart);
  const theme = useChatStore(s => s.theme || "light");
  const setTheme = useChatStore(s => s.setTheme);
  const language = useChatStore(s => s.language || "en");
  const setLanguage = useChatStore(s => s.setLanguage);
  const { t } = useT();

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const styles = themeStyles[theme] || themeStyles.light;

  const [themeOpen, setThemeOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`sticky top-0 z-40 flex h-[68px] items-center justify-between border-b px-4 shadow-sm backdrop-blur-xl transition-colors duration-500 md:px-6 ${styles.headerBg}`}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMenu}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-colors lg:hidden ${styles.cartBtn}`}
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#482880] to-[#facc15]/60 shadow-lg shadow-purple-500/20">
          <img
            src="/kiki-avatar.png"
            alt="Kiki"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <img 
              src="/kapruka-logo.png" 
              alt="Kapruka Logo" 
              className="h-5 w-auto object-contain rounded"
            />
            <span 
              className={`text-sm font-bold sm:text-base transition-colors ${styles.headerTitle}`}
              style={{ fontFamily: "Quicksand, sans-serif" }}
            >
              Kiki
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("header.online")}
            </span>
          </div>
          <p className={`hidden text-xs sm:block transition-colors ${styles.headerSub}`}>
            {t("header.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* This chat history palette toggle */}
        <button
          onClick={onOpenHistory}
          title={t("history.title")}
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm transition-colors ${
            theme === "midnight"
              ? "border-white/10 bg-slate-900/60 text-slate-200 hover:bg-slate-900/85"
              : "border-white/60 bg-white/70 text-[#482880] hover:bg-white"
          }`}
        >
          <History className="h-4 w-4" />
        </button>

        {/* Language toggle EN ⇄ සිංහල */}
        <button
          onClick={() => setLanguage(language === "en" ? "si" : "en")}
          title={t("lang.label")}
          className={`flex h-10 items-center gap-1.5 rounded-2xl border px-3 text-xs font-bold shadow-sm transition-colors ${
            theme === "midnight"
              ? "border-white/10 bg-slate-900/60 text-slate-200 hover:bg-slate-900/85"
              : "border-white/60 bg-white/70 text-[#482880] hover:bg-white"
          }`}
        >
          <Languages className="h-3.5 w-3.5" />
          <span>{language === "en" ? "EN" : "සිං"}</span>
        </button>

        {/* Theme Switcher */}
        <div className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className={`flex h-10 items-center gap-1.5 rounded-2xl border px-3 text-xs font-semibold shadow-sm transition-colors ${
              theme === 'midnight' ? 'border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-900/85' : 'border-white/60 bg-white/70 text-slate-700 hover:bg-white'
            }`}
          >
            {theme === "light" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
            {theme === "midnight" && <Moon className="h-3.5 w-3.5 text-indigo-400" />}
            {theme === "sunset" && <Sunrise className="h-3.5 w-3.5 text-orange-500" />}
            <span className="hidden md:inline">{t(`theme.${theme}`)}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>

          <AnimatePresence>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-2 z-50 w-36 rounded-2xl border p-1.5 shadow-xl backdrop-blur-xl ${
                    theme === 'midnight' ? 'border-white/10 bg-slate-950/95 text-slate-200' : 'border-blue-100 bg-white/95 text-slate-800'
                  }`}
                >
                  {[
                    { id: "light" as const, label: t("theme.light"), icon: Sun, color: "text-amber-500" },
                    { id: "midnight" as const, label: t("theme.midnight"), icon: Moon, color: "text-indigo-400" },
                    { id: "sunset" as const, label: t("theme.sunset"), icon: Sunrise, color: "text-orange-500" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setThemeOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                        theme === opt.id
                          ? theme === 'midnight' ? 'bg-white/10 text-white' : 'bg-blue-50 text-[#2563eb]'
                          : theme === 'midnight' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <opt.icon className={`h-3.5 w-3.5 ${opt.color}`} />
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onNewChat}
          className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-300 ${styles.newChatBtn}`}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("header.newChat")}</span>
        </button>

        <motion.button
          onClick={onOpenCart}
          animate={isBouncing ? { scale: [1, 1.25, 0.95, 1], rotate: [0, -8, 8, 0], boxShadow: "0 0 15px rgba(72,40,128,0.4)" } : {}}
          transition={{ duration: 0.45 }}
          className={`relative flex h-10 items-center gap-2 rounded-2xl shadow-sm transition-all duration-300 px-3 ${styles.cartBtn}`}
        >
          <ShoppingCart className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="text-sm font-semibold">
              {cartCount}
            </span>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
