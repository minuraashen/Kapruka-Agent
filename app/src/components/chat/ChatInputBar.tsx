import { motion } from "framer-motion";
import { Cake, Flower2, Gift, Loader2, PackageSearch, Send } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

interface Props {
  onSend: (text?: string) => void;
}

const QUICK_PROMPTS = [
  { icon: Gift, label: "Gift ideas", prompt: "Help me find a thoughtful gift under LKR 5000." },
  { icon: Cake, label: "Birthday cake", prompt: "Show me birthday cakes you can deliver in Colombo." },
  { icon: Flower2, label: "Flowers", prompt: "I want to send fresh flowers for an anniversary." },
  { icon: PackageSearch, label: "Track order", prompt: "I'd like to track my order." },
];

export default function ChatInputBar({ onSend }: Props) {
  const inputText = useChatStore(s => s.inputText);
  const setInputText = useChatStore(s => s.setInputText);
  const isLoading = useChatStore(s => s.isLoading);
  const hasMessages = useChatStore(s => s.messages.length > 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
      className="sticky bottom-0 z-40 border-t border-white/50 bg-white/35 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4"
    >
      <div className="mx-auto max-w-3xl">
        {/* Quick prompts — only before the conversation gets going */}
        {!hasMessages && (
          <div className="mb-2 flex flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map(item => (
              <button
                key={item.label}
                type="button"
                disabled={isLoading}
                onClick={() => onSend(item.prompt)}
                className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[12px] font-semibold text-[#3850a8] shadow-sm transition-colors hover:bg-white disabled:opacity-50"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-[22px] border border-white/70 bg-white/85 p-2 shadow-lg shadow-blue-500/10 backdrop-blur"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Kiki for gifts, cakes, flowers… (English / සිංහල / Tanglish)"
            disabled={isLoading}
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[#10133f] placeholder-[#9098bd] focus:outline-none disabled:opacity-50"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
          <motion.button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-colors ${
              isLoading || !inputText.trim()
                ? "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
                : "bg-gradient-to-r from-[#6d5dfc] to-[#1992ff] text-white shadow-blue-500/25 hover:shadow-xl"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </form>
        <p className="mt-2 text-center text-[10px] text-[#5f67a8]/70">
          Kiki shops the live Kapruka catalog · Prices in LKR
        </p>
      </div>
    </motion.div>
  );
}
