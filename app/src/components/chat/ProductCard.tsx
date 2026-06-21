import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ExternalLink, ImageOff, Check } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import type { Product } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

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

  const theme = useChatStore(s => s.theme || "light");
  const { t: tr } = useT();
  const [imageLoaded, setImageLoaded] = useState(false);

  const inCart = useChatStore(s =>
    s.cart.some(c => c.productId === product.product_id)
  );

  const cardThemes = {
    light: {
      card: "border-white/70 bg-white/90 shadow-blue-500/10 text-[#10133f]",
      title: "text-[#10133f]",
      price: "text-[#2563eb]",
      detailBtn: "border-blue-100 bg-[#f3f7ff] text-[#2563eb] hover:bg-blue-100",
      glow: "hover:border-[#6d5dfc]/50 hover:shadow-xl hover:shadow-blue-500/20",
    },
    midnight: {
      card: "border-white/10 bg-slate-900/90 shadow-black/40 text-white",
      title: "text-slate-100",
      price: "text-indigo-400",
      detailBtn: "border-white/10 bg-slate-800 text-slate-200 hover:bg-slate-700",
      glow: "hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/20",
    },
    sunset: {
      card: "border-white/75 bg-white/90 shadow-orange-500/5 text-[#5c2a1c]",
      title: "text-[#5c2a1c]",
      price: "text-[#ea580c]",
      detailBtn: "border-orange-100 bg-[#fff5f2] text-[#ea580c] hover:bg-orange-100",
      glow: "hover:border-[#ea580c]/50 hover:shadow-xl hover:shadow-orange-500/15",
    },
  };

  const t = cardThemes[theme] || cardThemes.light;

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
      className={`group flex w-[170px] shrink-0 snap-start flex-col overflow-hidden rounded-[18px] border transition-all duration-300 sm:w-[188px] ${t.card} ${t.glow}`}
    >
      <div className={`relative h-[132px] w-full overflow-hidden ${
        theme === 'midnight' ? 'bg-slate-950' : 'bg-gradient-to-br from-[#eff6ff] to-[#efe7ff]'
      }`}>
        {/* Skeleton Shimmer */}
        {image && !imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
        )}

        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onError={e => {
              setImageLoaded(true);
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
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1 ${
            theme === "midnight" ? "text-slate-500" : "text-slate-400"
          } ${image ? "hidden" : ""}`}
        >
          <ImageOff className="h-9 w-9" />
          <span className="text-[10px] font-medium">{tr("cart.noPreview")}</span>
        </div>

        {product.category && (
          <span className={`absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold capitalize shadow-sm ${t.price}`}>
            {product.category}
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
              {tr("cart.outOfStock")}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <h3
          className={`mb-1 line-clamp-2 min-h-[2.1rem] text-[12px] font-semibold leading-snug transition-colors ${t.title}`}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {name}
        </h3>

        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className={`text-[15px] font-bold transition-colors ${t.price}`}>
            {currency} {price.toLocaleString()}
          </p>
          {inStock && product.stock_label && (
            <span className="text-[9px] font-medium text-emerald-600">
              {product.stock_label}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAddToCart(product)}
            disabled={!inStock}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-semibold transition-all ${
              !inStock
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : inCart
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-gradient-to-r from-[#1d4ed8] to-[#6d5dfc] text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
            }`}
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5" />
                {tr("cart.added")}
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                {tr("cart.add")}
              </>
            )}
          </motion.button>

          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              title="View on Kapruka"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${t.detailBtn}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
