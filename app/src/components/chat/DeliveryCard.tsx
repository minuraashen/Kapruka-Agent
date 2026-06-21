import { motion } from "framer-motion";
import { Truck, CheckCircle2, XCircle, MapPin, CalendarDays } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import type { DeliveryInfo } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

export default function DeliveryCard({ delivery }: { delivery: DeliveryInfo }) {
  const theme = useChatStore((s) => s.theme || "light");
  const { t } = useT();
  const dark = theme === "midnight";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`my-2 w-full max-w-sm overflow-hidden rounded-[22px] border shadow-lg ${
        dark ? "border-white/10 bg-slate-900/85 text-slate-100" : "border-white/70 bg-white/90 text-[#10133f]"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-3 ${
          delivery.available
            ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/10"
            : "bg-gradient-to-r from-rose-500/15 to-orange-500/10"
        }`}
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
            delivery.available ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"
          }`}
        >
          <Truck className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide opacity-60">{t("delivery.title")}</p>
          <p className="flex items-center gap-1.5 text-sm font-bold">
            {delivery.available ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t("delivery.available")}
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-rose-500" />
                {t("delivery.unavailable")}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-2 px-4 py-3 text-sm">
        {delivery.city && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 opacity-60">
              <MapPin className="h-3.5 w-3.5" /> {t("delivery.to")}
            </span>
            <span className="font-semibold capitalize">{delivery.city}</span>
          </div>
        )}
        {delivery.date && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 opacity-60">
              <CalendarDays className="h-3.5 w-3.5" /> {t("delivery.date")}
            </span>
            <span className="font-semibold">{delivery.date}</span>
          </div>
        )}
        {typeof delivery.fee === "number" && delivery.fee > 0 && (
          <div className="flex items-center justify-between">
            <span className="opacity-60">{t("delivery.fee")}</span>
            <span className="font-bold text-emerald-500">
              {delivery.currency || "LKR"} {delivery.fee.toLocaleString()}
            </span>
          </div>
        )}
        {delivery.note && !delivery.city && !delivery.fee && (
          <p className="text-xs leading-relaxed opacity-75">{delivery.note}</p>
        )}
      </div>
    </motion.div>
  );
}
