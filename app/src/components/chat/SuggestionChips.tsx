import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ChatMessage } from "@/store/chatStore";
import { useChatStore } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

interface Props {
  message: ChatMessage;
  onSend: (prompt: string) => void;
}

interface Suggestion {
  labelKey: string;
  promptKey: string;
}

// Derive contextual follow-up chips from what the agent just did, so the user
// always has an obvious next step ("I'm not sure" → "add to cart" → checkout).
// Fully client-side, so it localizes through the same i18n dictionaries.
function deriveSuggestions(
  message: ChatMessage,
  cartCount: number
): Suggestion[] {
  const meta = message.metadata;
  const out: Suggestion[] = [];

  if (meta?.order) {
    out.push({ labelKey: "suggest.trackthis", promptKey: "sgTrackThis" });
    out.push({ labelKey: "suggest.shopmore", promptKey: "sgShopMore" });
    return out;
  }

  if (meta?.tracking) {
    out.push({ labelKey: "suggest.shopmore", promptKey: "sgShopMore" });
    return out;
  }

  if (meta?.delivery) {
    if (meta.delivery.available && cartCount > 0) {
      out.push({ labelKey: "suggest.checkout", promptKey: "sgCheckout" });
    }
    if (!meta.delivery.available) {
      out.push({ labelKey: "suggest.changedate", promptKey: "sgChangeDate" });
    }
    out.push({ labelKey: "suggest.giftmsg", promptKey: "sgGiftMsg" });
    return out;
  }

  if (meta?.products && meta.products.length > 0) {
    if (meta.products.length > 1) {
      out.push({ labelKey: "suggest.compare", promptKey: "sgCompare" });
      out.push({ labelKey: "suggest.cheaper", promptKey: "sgCheaper" });
    }
    out.push({ labelKey: "suggest.delivery", promptKey: "sgDelivery" });
    if (cartCount > 0) {
      out.push({ labelKey: "suggest.checkout", promptKey: "sgCheckout" });
    }
    return out;
  }

  // Generic fallback (e.g. the greeting) — gentle entry points.
  if (cartCount > 0) {
    out.push({ labelKey: "suggest.checkout", promptKey: "sgCheckout" });
  }
  out.push({ labelKey: "suggest.gifts", promptKey: "gifts" });
  out.push({ labelKey: "suggest.cakes", promptKey: "quickCake" });
  out.push({ labelKey: "suggest.track", promptKey: "track" });
  return out;
}

export default function SuggestionChips({ message, onSend }: Props) {
  const theme = useChatStore((s) => s.theme || "light");
  const cartCount = useChatStore((s) => s.cart.reduce((n, c) => n + c.qty, 0));
  const isLoading = useChatStore((s) => s.isLoading);
  const { t, p } = useT();
  const dark = theme === "midnight";

  const suggestions = deriveSuggestions(message, cartCount).slice(0, 4);
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="flex flex-wrap gap-2 pl-11 pt-1"
    >
      {suggestions.map((s, i) => (
        <motion.button
          key={s.labelKey}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18 + i * 0.05 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          disabled={isLoading}
          onClick={() => onSend(p(s.promptKey))}
          className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 ${
            dark
              ? "border-white/10 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
              : "border-[#482880]/15 bg-white/80 text-[#482880] hover:bg-white"
          }`}
        >
          {t(s.labelKey)}
          <ArrowRight className="h-3 w-3 opacity-50 transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      ))}
    </motion.div>
  );
}
