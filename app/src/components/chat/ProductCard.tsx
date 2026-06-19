import { motion } from "framer-motion";
import { Plus, ExternalLink, ImageOff, Check } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import type { Product } from "@/store/chatStore";

interface Props {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, index, onAddToCart }: Props) {
  const name = product.name || "Product";
  const price = product.price || 0;
  const currency = product.currency || "LKR";
  const image = product.image || "";
  const inStock = product.in_stock !== false;

  const inCart = useChatStore(s =>
    s.cart.some(c => c.productId === product.product_id)
  );

  return (
    <motion.div
      initial={{ y: 40, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 22,
        delay: index * 0.06,
      }}
      whileHover={{ y: -6 }}
      className="group flex w-[230px] shrink-0 snap-start flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white/90 shadow-lg shadow-blue-500/10 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-500/20 sm:w-[248px]"
    >
      <div className="relative h-[180px] w-full overflow-hidden bg-gradient-to-br from-[#eff6ff] to-[#efe7ff]">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              el.parentElement
                ?.querySelector("[data-fallback]")
                ?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div
          data-fallback
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#2563eb]/40 ${
            image ? "hidden" : ""
          }`}
        >
          <ImageOff className="h-9 w-9" />
          <span className="text-[10px] font-medium">No preview</span>
        </div>

        {product.category && (
          <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold capitalize text-[#2563eb] shadow-sm backdrop-blur">
            {product.category}
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3
          className="mb-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-[#10133f]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {name}
        </h3>

        <div className="mb-3 flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-[#2563eb]">
            {currency} {price.toLocaleString()}
          </p>
          {inStock && product.stock_label && (
            <span className="text-[10px] font-medium text-emerald-600">
              {product.stock_label}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAddToCart(product)}
            disabled={!inStock}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              !inStock
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : inCart
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-gradient-to-r from-[#1d4ed8] to-[#6d5dfc] text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
            }`}
          >
            {inCart ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add
              </>
            )}
          </motion.button>

          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              title="View on Kapruka"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-[#f3f7ff] text-[#2563eb] transition-colors hover:bg-blue-100"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
