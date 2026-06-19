import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const cart = useChatStore(s => s.cart);
  const removeFromCart = useChatStore(s => s.removeFromCart);
  const setCart = useChatStore(s => s.setCart);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

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
            className="fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-md flex-col bg-white/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-blue-100/70 p-5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-[#2563eb]" />
                <h2
                  className="text-lg font-bold text-[#10133f]"
                  style={{ fontFamily: "Quicksand, sans-serif" }}
                >
                  Your Cart
                </h2>
                <span className="text-sm text-[#6870a7]">
                  ({cart.length} items)
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-50 transition-colors hover:bg-blue-100"
              >
                <X className="h-4 w-4 text-[#10133f]" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-[#6870a7]">
                  <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Your cart is empty</p>
                  <p className="text-xs mt-1">
                    Add items from the product carousel!
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
                    className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-[#f3f7ff] p-3"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-medium text-[#10133f]">
                        {item.name}
                      </h3>
                      <p className="text-sm font-bold text-[#2563eb]">
                        LKR {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.productId, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-white shadow-sm transition-shadow hover:shadow"
                      >
                        <Minus className="h-3 w-3 text-[#10133f]" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-white shadow-sm transition-shadow hover:shadow"
                      >
                        <Plus className="h-3 w-3 text-[#10133f]" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-blue-100/70 bg-white/60 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#6870a7]">Total</span>
                  <span
                    className="text-xl font-bold text-[#10133f]"
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
                  Proceed to Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
