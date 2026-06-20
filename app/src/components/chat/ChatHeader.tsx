import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingCart, Sun, Moon, Sunrise, ChevronDown, Menu } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { themeStyles } from "@/pages/Home";

interface Props {
  onNewChat: () => void;
  onOpenCart: () => void;
  onOpenMenu: () => void;
}

export default function ChatHeader({ onNewChat, onOpenCart, onOpenMenu }: Props) {
  const cart = useChatStore(s => s.cart);
  const theme = useChatStore(s => s.theme || "light");
  const setTheme = useChatStore(s => s.setTheme);
  
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

        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] shadow-lg shadow-blue-500/20">
          <img
            src="/kiki-avatar.png"
            alt="Kiki"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1
              className={`text-base font-bold sm:text-lg transition-colors ${styles.headerTitle}`}
              style={{ fontFamily: "Quicksand, sans-serif" }}
            >
              Kapruka Kiki
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <p className={`hidden text-xs sm:block transition-colors ${styles.headerSub}`}>
            Sri Lanka shopping &amp; gifting assistant
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
            <span className="hidden md:inline capitalize">{theme}</span>
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
                    { id: "light" as const, label: "Light Glow", icon: Sun, color: "text-amber-500" },
                    { id: "midnight" as const, label: "Midnight", icon: Moon, color: "text-indigo-400" },
                    { id: "sunset" as const, label: "Sunset Coral", icon: Sunrise, color: "text-orange-500" },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setThemeOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                        theme === t.id
                          ? theme === 'midnight' ? 'bg-white/10 text-white' : 'bg-blue-50 text-[#2563eb]'
                          : theme === 'midnight' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <t.icon className={`h-3.5 w-3.5 ${t.color}`} />
                      {t.label}
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
          <span className="hidden sm:inline">New chat</span>
        </button>

        <motion.button
          onClick={onOpenCart}
          animate={isBouncing ? { scale: [1, 1.25, 0.95, 1], rotate: [0, -8, 8, 0], boxShadow: "0 0 15px rgba(37,99,235,0.4)" } : {}}
          transition={{ duration: 0.45 }}
          className={`relative flex h-10 items-center gap-2 rounded-2xl shadow-sm transition-all duration-300 ${styles.cartBtn}`}
        >
          <ShoppingCart className="h-4 w-4 text-[#2563eb]" />
          {cartCount > 0 && (
            <span className="text-sm font-semibold text-[#2563eb]">
              {cartCount}
            </span>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
