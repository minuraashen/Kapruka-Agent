import { motion } from "framer-motion";
import { Sparkles, Flame, TreePine, Cake } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

const festivals = [
  { id: "avurudu", labelKey: "festival.avurudu", promptKey: "festAvurudu", icon: Sparkles, color: "from-[#f59e0b] to-[#ef4444]" },
  { id: "vesak", labelKey: "festival.vesak", promptKey: "festVesak", icon: Flame, color: "from-[#3b82f6] to-[#8b5cf6]" },
  { id: "christmas", labelKey: "festival.christmas", promptKey: "festChristmas", icon: TreePine, color: "from-[#10b981] to-[#059669]" },
  { id: "birthday", labelKey: "festival.birthday", promptKey: "festBirthday", icon: Cake, color: "from-[#ec4899] to-[#8b5cf6]" },
];

export default function FestivalChips({ onSend }: { onSend: (prompt: string) => void }) {
  const theme = useChatStore((s) => s.theme || "light");
  const { t, p } = useT();
  const dark = theme === "midnight";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mx-auto w-full max-w-2xl px-2"
    >
      <p className={`mb-2 text-center text-xs font-semibold ${dark ? "text-slate-400" : "text-[#745f9e]"}`}>
        {t("festival.title")}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {festivals.map((f) => (
          <motion.button
            key={f.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSend(p(f.promptKey))}
            className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${f.color} px-3.5 py-2 text-xs font-bold text-white shadow-md`}
          >
            <f.icon className="h-3.5 w-3.5" />
            {t(f.labelKey)}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
