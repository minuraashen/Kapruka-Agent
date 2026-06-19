import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const cart = useChatStore((s) => s.cart);
  const removeFromCart = useChatStore((s) => s.removeFromCart);
  const setCart = useChatStore((s) => s.setCart);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const updateQty = (productId: string, delta: number) => {
    const newCart = cart.map((item) => {
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#ff7b89]" />
                <h2
                  className="text-lg font-bold text-[#020333]"
                  style={{ fontFamily: "Quicksand, sans-serif" }}
                >
                  Your Cart
                </h2>
                <span className="text-sm text-[#727288]">
                  ({cart.length} items)
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-[#020333]" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#727288]">
                  <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Your cart is empty</p>
                  <p className="text-xs mt-1">
                    Add items from the product carousel!
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#fdf6f6] border border-[#ff7b89]/10"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#020333] truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm font-bold text-[#ff7b89]">
                        LKR {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.productId, -1)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow transition-shadow"
                      >
                        <Minus className="w-3 h-3 text-[#020333]" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, 1)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow transition-shadow"
                      >
                        <Plus className="w-3 h-3 text-[#020333]" />
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
              <div className="p-5 border-t border-gray-100 bg-white/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#727288]">Total</span>
                  <span
                    className="text-xl font-bold text-[#020333]"
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
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ff7b89] to-[#ff8e72] text-white font-semibold shadow-lg shadow-[#ff7b89]/25 hover:shadow-xl transition-shadow"
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
