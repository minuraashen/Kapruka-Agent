import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

interface Props {
  onSend: () => void;
}

export default function ChatInputBar({ onSend }: Props) {
  const inputText = useChatStore((s) => s.inputText);
  const setInputText = useChatStore((s) => s.setInputText);
  const isLoading = useChatStore((s) => s.isLoading);

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
      className="sticky bottom-0 z-50 px-4 py-3 backdrop-blur-xl bg-white/60 border-t border-white/40"
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-2xl mx-auto">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Kiki anything..."
            disabled={isLoading}
            className="w-full px-5 py-3.5 rounded-full bg-white/80 border border-[#ff7b89]/15 text-[#020333] placeholder-[#727288] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/30 focus:border-[#ff7b89]/30 shadow-sm transition-all disabled:opacity-50"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            isLoading || !inputText.trim()
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#ff7b89] to-[#ff8e72] text-white shadow-[#ff7b89]/30 hover:shadow-xl"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
