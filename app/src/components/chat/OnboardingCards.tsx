import { motion } from "framer-motion";
import { Gift, ShoppingBag, PackageSearch } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

const cards = [
  {
    id: "gift",
    icon: Gift,
    title: "Send a Gift",
    description: "Find the perfect gift for someone special",
    color: "from-[#6d5dfc] to-[#1992ff]",
    shadow: "shadow-blue-500/20",
    intent: "gift_mode" as const,
    message: "I'd like to send a gift to someone!",
  },
  {
    id: "shop",
    icon: ShoppingBag,
    title: "Shop for Myself",
    description: "Browse and buy products for yourself",
    color: "from-[#0ea5e9] to-[#38bdf8]",
    shadow: "shadow-cyan-500/20",
    intent: "shop_mode" as const,
    message: "I want to shop for something!",
  },
  {
    id: "track",
    icon: PackageSearch,
    title: "Track an Order",
    description: "Check the status of your existing order",
    color: "from-[#7c3aed] to-[#a78bfa]",
    shadow: "shadow-violet-500/20",
    intent: "track_mode" as const,
    message: "I'd like to track my order",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
} as const;

const cardVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.9 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

interface OnboardingCardsProps {
  onSendMessage: (msg: string) => void;
}

export default function OnboardingCards({
  onSendMessage,
}: OnboardingCardsProps) {
  const setState = useChatStore(s => s.setState);
  const setIntent = useChatStore(s => s.setIntent);

  const handleClick = (card: (typeof cards)[0]) => {
    setState(card.intent);
    setIntent(card.id);
    onSendMessage(card.message);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-2 sm:flex-row"
    >
      {cards.map(card => (
        <motion.button
          key={card.id}
          variants={cardVariants}
          whileHover={{
            scale: 1.03,
            y: -3,
            boxShadow: "0 22px 44px rgba(37, 99, 235, 0.18)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleClick(card)}
          className={`flex-1 cursor-pointer rounded-[24px] bg-gradient-to-br ${card.color} ${card.shadow} flex flex-col items-center gap-3 p-5 text-white shadow-lg transition-all duration-200`}
        >
          <card.icon className="w-8 h-8" strokeWidth={1.5} />
          <div className="text-center">
            <h3
              className="font-bold text-sm mb-1"
              style={{ fontFamily: "Quicksand, sans-serif" }}
            >
              {card.title}
            </h3>
            <p className="text-xs opacity-90 leading-relaxed">
              {card.description}
            </p>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
