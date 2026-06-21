import { motion } from "framer-motion";
import { PackageSearch, CheckCircle2, Circle } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import type { TrackingInfo } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

export default function OrderTrackingCard({ tracking }: { tracking: TrackingInfo }) {
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
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#482880]/15 to-[#6d5dfc]/10 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#482880]/20 text-[#6d5dfc]">
          <PackageSearch className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide opacity-60">{t("track.title")}</p>
          <p className="truncate text-sm font-bold">
            {tracking.orderNumber ? `${t("track.order")} #${tracking.orderNumber}` : t("track.title")}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 text-sm">
        {tracking.status && (
          <div className="mb-3 flex items-center justify-between">
            <span className="opacity-60">{t("track.status")}</span>
            <span className="rounded-full bg-[#6d5dfc]/15 px-2.5 py-0.5 text-xs font-bold capitalize text-[#6d5dfc]">
              {tracking.status}
            </span>
          </div>
        )}

        {tracking.steps && tracking.steps.length > 0 && (
          <ol className="relative space-y-3 pl-1">
            {tracking.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                {step.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 opacity-40" />
                )}
                <span className={`leading-snug ${step.done ? "font-medium" : "opacity-70"}`}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        )}

        {!tracking.status && (!tracking.steps || tracking.steps.length === 0) && (
          <p className="text-xs leading-relaxed opacity-75">
            {t("track.title")} — {tracking.orderNumber || ""}
          </p>
        )}
      </div>
    </motion.div>
  );
}
