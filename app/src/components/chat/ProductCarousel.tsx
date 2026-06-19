import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/store/chatStore";

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductCarousel({ products, onAddToCart }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full my-3"
    >
      {/* Navigation Arrows */}
      {products.length > 2 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition-colors border border-white/50"
          >
            <ChevronLeft className="w-4 h-4 text-[#020333]" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition-colors border border-white/50"
          >
            <ChevronRight className="w-4 h-4 text-[#020333]" />
          </button>
        </>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto py-2 px-8 scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)",
          maskImage:
            "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)",
        }}
      >
        {products.map((product, index) => (
          <div key={product.product_id || product.id || index} style={{ scrollSnapAlign: "start" }}>
            <ProductCard
              product={product}
              index={index}
              onAddToCart={onAddToCart}
            />
          </div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
}
