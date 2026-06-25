import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ExternalLink, ImageOff, Check, ShoppingBag } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import type { Product } from "@/store/chatStore";
import { useT } from "@/lib/i18n";

interface Props {
  product: Product | null;
  onClose: () => void;
}

// An in-chat product detail modal so the journey never leaves Kiki. Opens from
// a product card; supports a quantity stepper and add-to-cart.
export default function ProductQuickView({ product, onClose }: Props) {
  const theme = useChatStore(s => s.theme || "light");
  const addToCart = useChatStore(s => s.addToCart);
  const inCart = useChatStore(s =>
    product ? s.cart.some(c => c.productId === product.product_id) : false
  );
  const { t } = useT();
  const dark = theme === "midnight";
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);

  const open = Boolean(product);

  const handleAdd = () => {
    if (!product) return;
    addToCart({
      productId: product.product_id,
      name: product.name,
      price: product.price || 0,
      qty,
      image: product.image,
    });
  };

  const inStock = product?.in_stock !== false;

  return (
    <AnimatePresence>
      {open && product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-[#0f172a]/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className={`fixed left-1/2 top-1/2 z-[90] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[26px] border shadow-2xl ${
              dark ? "border-white/10 bg-slate-900 text-slate-100" : "border-white/70 bg-white text-[#10133f]"
            }`}
          >
            {/* Image */}
            <div className={`relative h-56 w-full ${dark ? "bg-slate-950" : "bg-gradient-to-br from-[#eff6ff] to-[#efe7ff]"}`}>
              {product.image && !imgError ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
                  <ImageOff className="h-10 w-10" />
                  <span className="text-xs">{t("cart.noPreview")}</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"
              >
                <X className="h-4 w-4" />
              </button>
              {product.category && (
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold capitalize text-[#482880] shadow-sm">
                  {product.category}
                </span>
              )}
              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-semibold text-white">
                    {t("cart.outOfStock")}
                  </span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="space-y-3 p-5">
              <h3 className="text-lg font-bold leading-snug" style={{ fontFamily: "Quicksand, sans-serif" }}>
                {product.name}
              </h3>
              <p className="text-2xl font-bold text-[#6d5dfc]">
                {(product.currency || "LKR")} {(product.price || 0).toLocaleString()}
              </p>

              {product.description && (
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide opacity-50">
                    {t("qv.about")}
                  </p>
                  <p className="max-h-28 overflow-y-auto text-sm leading-relaxed opacity-80">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity + add */}
              <div className="flex items-center gap-3 pt-1">
                <div className={`flex items-center gap-3 rounded-2xl border px-2 py-1.5 ${dark ? "border-white/10" : "border-[#482880]/15"}`}>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className={`flex h-7 w-7 items-center justify-center rounded-xl ${dark ? "bg-slate-800 hover:bg-slate-700" : "bg-[#f3f0fb] hover:bg-[#e9e3f8]"}`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className={`flex h-7 w-7 items-center justify-center rounded-xl ${dark ? "bg-slate-800 hover:bg-slate-700" : "bg-[#f3f0fb] hover:bg-[#e9e3f8]"}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={!inStock}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all ${
                    !inStock
                      ? "cursor-not-allowed bg-gray-200 text-gray-400"
                      : inCart
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-gradient-to-r from-[#482880] to-[#6d5dfc] text-white shadow-md shadow-purple-500/20 hover:shadow-lg"
                  }`}
                >
                  {inCart ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                  {inCart ? t("cart.added") : t("cart.add")}
                </motion.button>
              </div>

              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 pt-1 text-xs font-medium text-[#6d5dfc] hover:underline"
                >
                  {t("qv.viewOnKapruka")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
