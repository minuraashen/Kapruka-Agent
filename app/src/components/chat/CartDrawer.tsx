import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useT } from "@/lib/i18n";
import { themeStyles } from "@/pages/Home";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const cart = useChatStore(s => s.cart);
  const removeFromCart = useChatStore(s => s.removeFromCart);
  const setCart = useChatStore(s => s.setCart);
  const theme = useChatStore(s => s.theme || "light");
  const { t } = useT();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const styles = themeStyles[theme] || themeStyles.light;

  const updateQty = (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCart(newCart);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-[#0f172a]/35 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-md flex-col shadow-2xl backdrop-blur-xl transition-colors duration-500 ${styles.cartDrawerBg}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b p-5 ${
              theme === 'midnight' ? 'border-white/10' : 'border-blue-100/70'
            }`}>
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-[#2563eb]" />
                <h2
                  className={`text-lg font-bold`}
                  style={{ fontFamily: "Quicksand, sans-serif" }}
                >
                  {t("cart.title")}
                </h2>
                <span className={`text-sm ${theme === 'midnight' ? 'text-slate-400' : 'text-[#6870a7]'}`}>
                  ({t("cart.items", { n: cart.length })})
                </span>
              </div>
              <button
                onClick={onClose}
                className={`flex h-8 w-8 items-center justify-center rounded-2xl transition-colors ${
                  theme === 'midnight' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-blue-50 text-slate-700 hover:bg-blue-100'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className={`flex h-full flex-col items-center justify-center text-center ${
                  theme === 'midnight' ? 'text-slate-400' : 'text-[#6870a7]'
                }`}>
                  <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">{t("cart.empty")}</p>
                  <p className="text-xs mt-1">
                    {t("cart.emptyHint")}
                  </p>
                </div>
              ) : (
                cart.map(item => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className={`flex items-center gap-3 rounded-2xl border p-3 ${
                      theme === 'midnight' ? 'border-white/10 bg-slate-900/60' : 'border-blue-100 bg-[#f3f7ff]'
                    }`}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className={`truncate text-sm font-medium ${theme === 'midnight' ? 'text-slate-100' : 'text-[#10133f]'}`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm font-bold ${theme === 'midnight' ? 'text-indigo-400' : 'text-[#2563eb]'}`}>
                        LKR {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.productId, -1)}
                        className={`flex h-7 w-7 items-center justify-center rounded-xl shadow-sm transition-shadow hover:shadow ${
                          theme === 'midnight' ? 'bg-slate-800 border border-white/10 text-white hover:bg-slate-700' : 'bg-white text-slate-800'
                        }`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className={`text-sm font-semibold w-5 text-center ${theme === 'midnight' ? 'text-white' : 'text-slate-800'}`}>
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, 1)}
                        className={`flex h-7 w-7 items-center justify-center rounded-xl shadow-sm transition-shadow hover:shadow ${
                          theme === 'midnight' ? 'bg-slate-800 border border-white/10 text-white hover:bg-slate-700' : 'bg-white text-slate-800'
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        theme === 'midnight' ? 'bg-red-500/20 hover:bg-red-500/35 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-400'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className={`border-t p-5 ${
                theme === 'midnight' ? 'border-white/10 bg-slate-900/40' : 'border-blue-100/70 bg-white/60'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm ${theme === 'midnight' ? 'text-slate-400' : 'text-[#6870a7]'}`}>{t("cart.total")}</span>
                  <span
                    className="text-xl font-bold"
                    style={{ fontFamily: "Quicksand, sans-serif" }}
                  >
                    LKR {total.toLocaleString()}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    useChatStore.getState().setState("checkout");
                  }}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#6d5dfc] to-[#1992ff] py-3.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-shadow hover:shadow-xl"
                >
                  {t("cart.checkout")}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
