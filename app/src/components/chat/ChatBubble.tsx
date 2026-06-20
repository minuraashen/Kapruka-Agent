import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { User, Check } from "lucide-react";
import type { ReactNode } from "react";
import type { ChatMessage } from "@/store/chatStore";
import { useChatStore } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

interface Props {
  message: ChatMessage;
  index: number;
  streaming?: boolean;
  onStreamDone?: () => void;
  onTick?: () => void;
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

const ACTION_LABELS: Record<string, string> = {
  kapruka_search_products: "action.searched",
  kapruka_get_product: "action.product",
  kapruka_check_delivery: "action.delivery",
  kapruka_track_order: "action.track",
  kapruka_create_order: "action.order",
  kapruka_list_categories: "action.categories",
  kapruka_list_delivery_cities: "action.cities",
};

export default function ChatBubble({ message, index, streaming, onStreamDone, onTick }: Props) {
  const isUser = message.role === "user";
  const theme = useChatStore((s) => s.theme || "light");
  const { t } = useT();

  // Simulated streaming: reveal the assistant's text progressively for a live,
  // "typing" feel without backend token streaming.
  const [revealed, setRevealed] = useState(streaming ? "" : message.content);
  const [isTyping, setIsTyping] = useState(Boolean(streaming));
  const doneRef = useRef(onStreamDone);
  const tickRef = useRef(onTick);
  doneRef.current = onStreamDone;
  tickRef.current = onTick;

  useEffect(() => {
    if (!streaming) {
      setRevealed(message.content);
      setIsTyping(false);
      return;
    }
    const full = message.content;
    let i = 0;
    setRevealed("");
    setIsTyping(true);
    const id = setInterval(() => {
      i += 5;
      if (i >= full.length) {
        setRevealed(full);
        setIsTyping(false);
        clearInterval(id);
        doneRef.current?.();
      } else {
        setRevealed(full.slice(0, i));
        tickRef.current?.();
      }
    }, 18);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming, message.content]);

  const actions = message.metadata?.actions ?? [];

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

        <div className="flex flex-col gap-1.5">
          <div
            className={`px-4 py-3 text-sm leading-relaxed shadow-sm backdrop-blur-sm transition-colors duration-500 ${
              isUser
                ? "rounded-[18px] rounded-tr-md bg-gradient-to-br from-[#2563eb] to-[#6d5dfc] text-white shadow-blue-500/20"
                : `rounded-[18px] rounded-tl-md border ${
                    theme === "midnight"
                      ? "border-white/10 bg-slate-900/90 text-slate-100"
                      : theme === "sunset"
                        ? "border-orange-100/40 bg-[#fffbf9]/95 text-[#5c2a1c]"
                        : "border-white/70 bg-white/90 text-[#151a43]"
                  }`
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <MarkdownText content={revealed} />
            {isTyping && (
              <span className="ml-0.5 inline-block h-3.5 w-[2px] -translate-y-[1px] animate-pulse bg-current align-middle" />
            )}
          </div>

          {/* "Actions taken" chips — derived from the agent's real tool calls. */}
          {!isUser && !isTyping && actions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {actions.map((a) => (
                <span
                  key={a}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    theme === "midnight"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-emerald-500/10 text-emerald-700"
                  }`}
                >
                  <Check className="h-2.5 w-2.5" />
                  {t(ACTION_LABELS[a] ?? "action.searched")}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
