import { motion } from "framer-motion";
import { Gift, ShoppingBag, PackageSearch } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

const cards = [
  {
    id: "gift",
    icon: Gift,
    title: "Send a Gift",
    description: "Find the perfect gift for someone special",
    color: "from-[#ff7b89] to-[#ff8e72]",
    shadow: "shadow-[#ff7b89]/25",
    intent: "gift_mode" as const,
    message: "I'd like to send a gift to someone!",
  },
  {
    id: "shop",
    icon: ShoppingBag,
    title: "Shop for Myself",
    description: "Browse and buy products for yourself",
    color: "from-[#ffa53b] to-[#ffea76]",
    shadow: "shadow-[#ffa53b]/25",
    intent: "shop_mode" as const,
    message: "I want to shop for something!",
  },
  {
    id: "track",
    icon: PackageSearch,
    title: "Track an Order",
    description: "Check the status of your existing order",
    color: "from-[#8c3a64] to-[#ff7b89]",
    shadow: "shadow-[#8c3a64]/25",
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

export default function OnboardingCards({ onSendMessage }: OnboardingCardsProps) {
  const setState = useChatStore((s) => s.setState);
  const setIntent = useChatStore((s) => s.setIntent);

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
      className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto px-2"
    >
      {cards.map((card) => (
        <motion.button
          key={card.id}
          variants={cardVariants}
          whileHover={{
            scale: 1.05,
            skewX: -2,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleClick(card)}
          className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-[24px] bg-gradient-to-br ${card.color} ${card.shadow} shadow-lg text-white cursor-pointer transition-all duration-200`}
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
