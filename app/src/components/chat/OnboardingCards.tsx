import { motion } from "framer-motion";
import { Gift, ShoppingBag, PackageSearch, Wand2 } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.25 },
  },
} as const;

const cardVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.92 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

interface OnboardingCardsProps {
  onSendMessage: (msg: string) => void;
  onOpenGenie: () => void;
}

export default function OnboardingCards({ onSendMessage, onOpenGenie }: OnboardingCardsProps) {
  const setState = useChatStore(s => s.setState);
  const setIntent = useChatStore(s => s.setIntent);
  const { t, p } = useT();

  const cards = [
    {
      id: "gift",
      icon: Gift,
      title: t("onb.giftTitle"),
      description: t("onb.giftDesc"),
      color: "from-[#482880] to-[#6d5dfc]",
      shadow: "shadow-purple-500/20",
      onClick: () => {
        setState("gift_mode");
        setIntent("gift");
        onSendMessage(p("onbGift"));
      },
    },
    {
      id: "shop",
      icon: ShoppingBag,
      title: t("onb.shopTitle"),
      description: t("onb.shopDesc"),
      color: "from-[#6c1c96] to-[#eab308]",
      shadow: "shadow-purple-500/20",
      onClick: () => {
        setState("shop_mode");
        setIntent("shop");
        onSendMessage(p("onbShop"));
      },
    },
    {
      id: "track",
      icon: PackageSearch,
      title: t("onb.trackTitle"),
      description: t("onb.trackDesc"),
      color: "from-[#1b0d39] to-[#482880]",
      shadow: "shadow-purple-950/20",
      onClick: () => {
        setState("track_mode");
        setIntent("track");
        onSendMessage(p("onbTrack"));
      },
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-2xl space-y-3 px-2"
    >
      {/* Featured: Gift Genie banner */}
      <motion.button
        variants={cardVariants}
        whileHover={{ scale: 1.02, y: -3, boxShadow: "0 22px 44px rgba(72, 40, 128, 0.22)" }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenGenie}
        className="flex w-full cursor-pointer items-center gap-3 rounded-[20px] bg-gradient-to-br from-[#482880] via-[#6d5dfc] to-[#1992ff] p-3.5 text-white shadow-lg shadow-purple-500/25 transition-all duration-200"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Wand2 className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="text-left">
          <h3 className="text-sm font-bold" style={{ fontFamily: "Quicksand, sans-serif" }}>
            {t("onb.genieTitle")}
          </h3>
          <p className="text-[11px] leading-relaxed opacity-90">{t("onb.genieDesc")}</p>
        </div>
      </motion.button>

      {/* Three modes */}
      <div className="grid grid-cols-3 gap-2.5">
        {cards.map(card => (
          <motion.button
            key={card.id}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -3, boxShadow: "0 22px 44px rgba(72, 40, 128, 0.18)" }}
            whileTap={{ scale: 0.98 }}
            onClick={card.onClick}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-[18px] bg-gradient-to-br p-3.5 text-white shadow-md transition-all duration-200 ${card.color} ${card.shadow}`}
          >
            <card.icon className="h-6 w-6" strokeWidth={1.5} />
            <div className="text-center">
              <h3 className="text-[13px] font-bold" style={{ fontFamily: "Quicksand, sans-serif" }}>
                {card.title}
              </h3>
              <p className="hidden text-[11px] leading-relaxed opacity-90 sm:block">{card.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
