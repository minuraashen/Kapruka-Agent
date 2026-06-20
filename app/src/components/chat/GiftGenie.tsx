import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Wand2, ChevronLeft } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

interface Props {
  onComplete: (prompt: string) => void;
  onCancel: () => void;
}

// A 3-tap guided flow that composes a rich gift search prompt for Kiki.
export default function GiftGenie({ onComplete, onCancel }: Props) {
  const theme = useChatStore((s) => s.theme || "light");
  const { t } = useT();
  const dark = theme === "midnight";

  const [step, setStep] = useState(0);
  const [who, setWho] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);

  const whoOptions = ["mother", "father", "partner", "friend", "child", "colleague"];
  const occasionOptions = [
    "birthday",
    "anniversary",
    "thankyou",
    "getwell",
    "congrats",
    "justbecause",
  ];
  const budgetOptions = ["low", "mid", "high"];

  const questions = [t("genie.q1"), t("genie.q2"), t("genie.q3")];

  const handleBudget = (budgetKey: string) => {
    const prompt = t("genie.promptTemplate", {
      who: t(`genie.who.${who}`),
      occasion: t(`genie.occasion.${occasion}`),
      budget: t(`genie.budget.${budgetKey}`),
    });
    onComplete(prompt);
  };

  const chip = (label: string, onClick: () => void, active = false) => (
    <button
      key={label}
      onClick={onClick}
      className={`rounded-2xl border px-3.5 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "border-transparent bg-gradient-to-r from-[#482880] to-[#6d5dfc] text-white shadow-md"
          : dark
            ? "border-white/10 bg-slate-800/70 text-slate-200 hover:bg-slate-700"
            : "border-violet-100 bg-white/80 text-[#482880] hover:bg-violet-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      className={`mx-auto w-full max-w-xl overflow-hidden rounded-[26px] border shadow-2xl backdrop-blur-xl ${
        dark ? "border-white/10 bg-slate-900/90 text-slate-100" : "border-white/70 bg-white/90 text-[#10133f]"
      }`}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-[#482880] via-[#6d5dfc] to-[#1992ff] px-5 py-4 text-white">
        <Wand2 className="absolute -right-1 -top-1 h-16 w-16 opacity-15" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ fontFamily: "Quicksand, sans-serif" }}>
                {t("genie.title")}
              </p>
              <p className="text-[11px] text-white/80">{t("genie.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="mb-3 flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg opacity-60 hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <h3 className="text-base font-bold" style={{ fontFamily: "Quicksand, sans-serif" }}>
            {questions[step]}
          </h3>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {step === 0 &&
              whoOptions.map((o) =>
                chip(t(`genie.who.${o}`), () => {
                  setWho(o);
                  setStep(1);
                }, who === o)
              )}
            {step === 1 &&
              occasionOptions.map((o) =>
                chip(t(`genie.occasion.${o}`), () => {
                  setOccasion(o);
                  setStep(2);
                }, occasion === o)
              )}
            {step === 2 && budgetOptions.map((o) => chip(t(`genie.budget.${o}`), () => handleBudget(o)))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
