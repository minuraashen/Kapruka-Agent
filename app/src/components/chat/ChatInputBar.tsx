import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cake, Flower2, Gift, Loader2, Mic, PackageSearch, Send } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

interface Props {
  onSend: (text?: string) => void;
}

export default function ChatInputBar({ onSend }: Props) {
  const inputText = useChatStore(s => s.inputText);
  const setInputText = useChatStore(s => s.setInputText);
  const isLoading = useChatStore(s => s.isLoading);
  const hasMessages = useChatStore(s => s.messages.length > 1);
  const theme = useChatStore(s => s.theme || "light");
  const { t, p, lang } = useT();

  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognition =
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : undefined;
  const voiceSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  const QUICK_PROMPTS = [
    { icon: Gift, label: t("quick.gift"), prompt: p("quickGift") },
    { icon: Cake, label: t("quick.cake"), prompt: p("quickCake") },
    { icon: Flower2, label: t("quick.flowers"), prompt: p("quickFlowers") },
    { icon: PackageSearch, label: t("quick.track"), prompt: p("track") },
  ];

  const inputThemes = {
    light: {
      barBg: "border-t border-white/50 bg-white/35",
      quickBtn: "border-white/70 bg-white/70 text-[#482880] hover:bg-white",
      formBg: "border-white/70 bg-white/85 shadow-purple-500/10",
      inputColor: "text-[#1b0a33] placeholder-[#948ca6]",
    },
    midnight: {
      barBg: "border-t border-white/10 bg-black/35",
      quickBtn: "border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800",
      formBg: "border-white/10 bg-slate-900/80 shadow-black/40",
      inputColor: "text-white placeholder-slate-400",
    },
    sunset: {
      barBg: "border-t border-white/40 bg-white/25",
      quickBtn: "border-white/50 bg-white/50 text-[#854d3e] hover:bg-white",
      formBg: "border-white/60 bg-white/80 shadow-orange-500/5",
      inputColor: "text-[#5c2a1c] placeholder-[#c59a8f]",
    },
  };

  const ts = inputThemes[theme] || inputThemes.light;

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

  const toggleVoice = () => {
    if (!voiceSupported) return;
    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* noop */
      }
      setListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = lang === "si" ? "si-LK" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join("");
      setInputText(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
      className={`sticky bottom-0 z-40 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4 transition-colors duration-500 ${ts.barBg}`}
    >
      <div className="mx-auto max-w-3xl">
        {!hasMessages && (
          <div className="mb-2 flex flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map(item => (
              <button
                key={item.label}
                type="button"
                disabled={isLoading}
                onClick={() => onSend(item.prompt)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold shadow-sm transition-colors disabled:opacity-50 ${ts.quickBtn}`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`flex items-center gap-2 rounded-[22px] border p-2 shadow-lg backdrop-blur transition-colors duration-500 ${ts.formBg}`}
        >
          {voiceSupported && (
            <motion.button
              type="button"
              onClick={toggleVoice}
              whileTap={{ scale: 0.92 }}
              title={listening ? t("input.voiceStop") : t("input.voiceStart")}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                listening
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : theme === "midnight"
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-[#482880]/10 text-[#482880] hover:bg-[#482880]/20"
              }`}
            >
              {listening ? (
                <motion.span
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Mic className="h-5 w-5" />
                </motion.span>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </motion.button>
          )}

          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? t("input.voiceStop") : t("input.placeholder")}
            disabled={isLoading}
            className={`min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50 ${ts.inputColor}`}
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
                : "bg-gradient-to-r from-[#482880] to-[#6d5dfc] text-white shadow-purple-500/25 hover:shadow-xl"
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
          {t("input.footer")}
        </p>
      </div>
    </motion.div>
  );
}
