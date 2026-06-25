import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductQuickView from "./ProductQuickView";
import type { Product } from "@/store/chatStore";

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductCarousel({ products, onAddToCart }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
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
      className="relative my-3 w-full"
    >
      {/* Navigation Arrows */}
      {products.length > 2 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/60 bg-white/90 shadow-md backdrop-blur transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4 text-[#2563eb]" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/60 bg-white/90 shadow-md backdrop-blur transition-colors hover:bg-white"
          >
            <ChevronRight className="h-4 w-4 text-[#2563eb]" />
          </button>
        </>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto px-7 py-2"
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
          <div
            key={product.product_id || index}
            style={{ scrollSnapAlign: "start" }}
          >
            <ProductCard
              product={product}
              index={index}
              onAddToCart={onAddToCart}
              onQuickView={setQuickView}
            />
          </div>
        ))}
      </div>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
}
