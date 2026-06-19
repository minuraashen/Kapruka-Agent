import { motion } from "framer-motion";
import { Plus, ShoppingCart } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

interface Props {
  onNewChat: () => void;
  onOpenCart: () => void;
}

export default function ChatHeader({ onNewChat, onOpenCart }: Props) {
  const cart = useChatStore(s => s.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-white/60 bg-white/40 px-4 shadow-sm backdrop-blur-xl md:px-6"
    >
      <div className="flex items-center gap-3">
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
              className="text-base font-bold text-[#10133f] sm:text-lg"
              style={{ fontFamily: "Quicksand, sans-serif" }}
            >
              Kapruka Kiki
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
          <p className="hidden text-xs text-[#6870a7] sm:block">
            Sri Lanka shopping &amp; gifting assistant
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-2xl bg-white/60 px-3 py-2 text-sm font-semibold text-[#4f5b91] shadow-sm transition-colors hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New chat</span>
        </button>

        <button
          onClick={onOpenCart}
          className="relative flex h-10 items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 shadow-sm transition-colors hover:bg-white"
        >
          <ShoppingCart className="h-4 w-4 text-[#2563eb]" />
          {cartCount > 0 && (
            <span className="text-sm font-semibold text-[#2563eb]">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </motion.header>
  );
}
