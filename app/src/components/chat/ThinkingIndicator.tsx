import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

// Predicts the likely tool activity from the pending user message and cycles
// through warm status lines, so the wait feels alive even though the backend
// answers in a single round-trip.
function inferSteps(text: string): string[] {
  const lower = text.toLowerCase();
  if (/track|order number|where.*order|ඇණවුම|tracking/.test(lower)) {
    return ["think.track", "think.default"];
  }
  if (/deliver|delivery|ship|බෙදා|fee|colombo|kandy|galle/.test(lower)) {
    return ["think.delivery", "think.search", "think.default"];
  }
  if (/gift|present|surprise|තෑගි|genie|curate/.test(lower)) {
    return ["think.curate", "think.search", "think.default"];
  }
  if (/buy|checkout|order|place|pay|ඇණවුම|චෙක්/.test(lower)) {
    return ["think.order", "think.default"];
  }
  return ["think.search", "think.curate", "think.default"];
}

export default function ThinkingIndicator({ lastUserMessage }: { lastUserMessage: string }) {
  const theme = useChatStore((s) => s.theme || "light");
  const { t } = useT();
  const steps = useMemo(() => inferSteps(lastUserMessage), [lastUserMessage]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
    if (steps.length <= 1) return;
    const id = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, 1400);
    return () => clearInterval(id);
  }, [steps]);

  const dark = theme === "midnight";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
      <div
        className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-sm ${
          dark ? "border-white/10 bg-slate-900/80 text-slate-300" : "border-white/60 bg-white/80 text-[#6870a7]"
        }`}
      >
        <div className="flex gap-1">
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay }}
              className="h-2 w-2 rounded-full bg-[#6d5dfc]"
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={stepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-xs font-medium"
          >
            {t(steps[stepIndex])}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
