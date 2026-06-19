import { motion } from "framer-motion";
import { User } from "lucide-react";
import type { ReactNode } from "react";
import type { ChatMessage } from "@/store/chatStore";

interface Props {
  message: ChatMessage;
  index: number;
}

// Minimal, safe inline Markdown: **bold**, *italic*, `code`, and [text](url).
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((https?:\/\/[^\s)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[2] !== undefined) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[4] !== undefined) {
      nodes.push(<em key={key++}>{match[4]}</em>);
    } else if (match[6] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-black/5 px-1 py-0.5 text-[0.85em]"
        >
          {match[6]}
        </code>
      );
    } else if (match[8] !== undefined && match[9] !== undefined) {
      nodes.push(
        <a
          key={key++}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-2"
        >
          {match[8]}
        </a>
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function MarkdownText({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        const isBullet = /^[-*•]\s+/.test(trimmed);
        if (isBullet) {
          return (
            <div key={i} className="flex gap-2">
              <span className="select-none opacity-60">•</span>
              <span>{renderInline(trimmed.replace(/^[-*•]\s+/, ""))}</span>
            </div>
          );
        }
        return (
          <div key={i} className={line.length === 0 ? "h-2" : undefined}>
            {renderInline(line)}
          </div>
        );
      })}
    </>
  );
}

export default function ChatBubble({ message, index }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
        delay: Math.min(index * 0.04, 0.3),
      }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[90%] gap-2.5 md:max-w-[78%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-[#111827] to-[#30376f]"
              : "bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9]"
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <img
              src="/kiki-avatar.png"
              alt="Kiki"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div
          className={`px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "rounded-[18px] rounded-tr-md bg-gradient-to-br from-[#2563eb] to-[#6d5dfc] text-white shadow-blue-500/20"
              : "rounded-[18px] rounded-tl-md border border-white/70 bg-white/90 text-[#151a43] backdrop-blur-sm"
          }`}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <MarkdownText content={message.content} />
        </div>
      </div>
    </motion.div>
  );
}
