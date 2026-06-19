import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

export default function ChatHeader() {
  const cart = useChatStore((s) => s.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="sticky top-0 z-50 flex h-16 items-center justify-between px-4 md:px-6 backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff7b89] to-[#ffea76] flex items-center justify-center shadow-lg shadow-[#ff7b89]/30 overflow-hidden">
          <img src="/kiki-avatar.png" alt="Kiki" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-[#020333]" style={{ fontFamily: "Quicksand, sans-serif" }}>
            Kapruka
          </h1>
          <span className="text-sm font-semibold text-[#ff7b89]" style={{ fontFamily: "Quicksand, sans-serif" }}>
            Kiki
          </span>
        </div>
      </div>

      {cartCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff7b89]/10 border border-[#ff7b89]/20"
        >
          <ShoppingCart className="w-4 h-4 text-[#ff7b89]" />
          <span className="text-sm font-semibold text-[#ff7b89]">{cartCount}</span>
        </motion.div>
      )}
    </motion.header>
  );
}
