import { motion } from "framer-motion";
import { PartyPopper, CreditCard } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import type { OrderInfo } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

export default function OrderConfirmationCard({ order }: { order: OrderInfo }) {
  const theme = useChatStore((s) => s.theme || "light");
  const { t } = useT();
  const dark = theme === "midnight";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={`my-2 w-full max-w-sm overflow-hidden rounded-[24px] border shadow-xl backdrop-blur-sm ${
        dark ? "border-white/10 bg-slate-900/90 text-slate-100" : "border-white/70 bg-white/95 text-[#10133f]"
      }`}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7c3aed] via-[#6157f5] to-[#1992ff] px-5 py-5 text-white">
        <PartyPopper className="absolute -right-2 -top-2 h-20 w-20 opacity-15" />
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
          <PartyPopper className="h-5 w-5" />
        </div>
        <p className="text-lg font-bold" style={{ fontFamily: "Quicksand, sans-serif" }}>
          {t("order.created")}
        </p>
        {order.orderNumber && (
          <p className="mt-0.5 text-sm text-white/85">{t("order.number", { n: order.orderNumber })}</p>
        )}
      </div>

      <div className="space-y-3 px-5 py-4">
        {typeof order.total === "number" && order.total > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-60">{t("cart.total")}</span>
            <span className="font-bold">
              {order.currency || "LKR"} {order.total.toLocaleString()}
            </span>
          </div>
        )}
        {order.payUrl ? (
          <a
            href={order.payUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1d4ed8] to-[#6d5dfc] py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-shadow hover:shadow-xl"
          >
            <CreditCard className="h-4 w-4" />
            {t("order.payNow")}
          </a>
        ) : (
          <p className="text-center text-xs opacity-70">{t("order.placed")}</p>
        )}
      </div>
    </motion.div>
  );
}
