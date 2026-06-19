import { motion } from "framer-motion";
import { Plus, ExternalLink } from "lucide-react";
import type { Product } from "@/store/chatStore";

interface Props {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, index, onAddToCart }: Props) {
  const name = product.name || product.title || "Product";
  const price = product.price || 0;
  const currency = product.currency || "LKR";
  const image = product.image || (product.images?.[0]) || "";
  const inStock = product.in_stock !== false;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: index * 0.08,
      }}
      whileHover={{
        scale: 1.05,
        rotate: -1,
        boxShadow: "0 20px 40px rgba(255, 123, 137, 0.2)",
      }}
      className="flex-shrink-0 w-[260px] bg-white rounded-[28px] p-4 shadow-lg shadow-[#ff7b89]/10 border border-white/60 backdrop-blur-sm transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative w-full h-[170px] rounded-[20px] overflow-hidden mb-3 bg-gradient-to-br from-[#fdf6f6] to-[#ffe4e8]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#ff7b89]/30">
            <ExternalLink className="w-10 h-10" />
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-semibold px-3 py-1 rounded-full bg-black/50">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-1">
        <h3
          className="text-sm font-semibold text-[#020333] mb-1 line-clamp-2 leading-snug"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {name}
        </h3>
        <p className="text-lg font-bold text-[#ff7b89] mb-3">
          {currency} {price.toLocaleString()}
        </p>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAddToCart(product)}
          disabled={!inStock}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            inStock
              ? "bg-[#020333] text-white hover:bg-[#1a1a4e]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Plus className="w-4 h-4" />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
