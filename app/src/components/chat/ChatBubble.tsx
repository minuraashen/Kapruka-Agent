import { motion } from "framer-motion";
import { User } from "lucide-react";
import type { ChatMessage } from "@/store/chatStore";

interface Props {
  message: ChatMessage;
  index: number;
}

export default function ChatBubble({ message, index }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ scale: 0, rotateZ: isUser ? -5 : 5, opacity: 0 }}
      animate={{ scale: 1, rotateZ: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: index * 0.05,
      }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[85%] md:max-w-[70%] gap-2 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center overflow-hidden ${
            isUser
              ? "bg-[#020333]"
              : "bg-gradient-to-br from-[#ff7b89] to-[#ffea76]"
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <img src="/kiki-avatar.png" alt="Kiki" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Bubble */}
        <div
          className={`px-4 py-3 text-sm leading-relaxed shadow-md ${
            isUser
              ? "bg-[#020333] text-white rounded-[20px] rounded-tr-[6px]"
              : "bg-white/90 backdrop-blur-sm text-[#020333] rounded-[20px] rounded-tl-[6px] border border-white/50"
          }`}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    </motion.div>
  );
}
