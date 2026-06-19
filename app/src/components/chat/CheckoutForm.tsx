import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Gift, Calendar, MapPin, User, Mail, Phone, Truck, Check } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { trpc } from "@/providers/trpc";

export default function CheckoutForm() {
  const cart = useChatStore((s) => s.cart);
  const setState = useChatStore((s) => s.setState);
  const setCart = useChatStore((s) => s.setCart);

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    payUrl?: string;
    orderNumber?: string;
  } | null>(null);

  const [form, setForm] = useState({
    recipientName: "",
    recipientAddress: "",
    recipientCity: "",
    recipientPhone: "",
    recipientEmail: "",
    deliveryDate: "",
    deliveryInstructions: "",
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    giftMessage: "",
  });

  const createOrder = trpc.kapruka.createOrder.useMutation();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const result = await createOrder.mutateAsync({
        cart: cart.map((item) => ({
          product_id: item.productId,
          quantity: item.qty,
        })),
        recipient: {
          name: form.recipientName,
          address: form.recipientAddress,
          city: form.recipientCity,
          phone: form.recipientPhone,
          email: form.recipientEmail || undefined,
        },
        delivery: {
          date: form.deliveryDate,
          instructions: form.deliveryInstructions || undefined,
        },
        sender: {
          name: form.senderName,
          email: form.senderEmail,
          phone: form.senderPhone || undefined,
        },
        gift_message: form.giftMessage || undefined,
      });

      const resultData = result as Record<string, unknown>;
      setOrderResult({
        payUrl: (resultData.pay_url as string) || (resultData.payment_url as string),
        orderNumber: (resultData.order_number as string) || (resultData.order_id as string),
      });
      setCart([]);
      setStep(3);
    } catch (error) {
      console.error("Order creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { label: "Recipient", icon: User },
    { label: "Delivery", icon: Truck },
    { label: "Sender", icon: CreditCard },
  ];

  if (orderResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto p-6 rounded-[28px] bg-white/90 backdrop-blur-sm shadow-xl border border-white/50 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3
          className="text-xl font-bold text-[#020333] mb-2"
          style={{ fontFamily: "Quicksand, sans-serif" }}
        >
          Order Created!
        </h3>
        <p className="text-sm text-[#727288] mb-4">
          {orderResult.orderNumber
            ? `Order #${orderResult.orderNumber}`
            : "Your order has been placed successfully."}
        </p>
        {orderResult.payUrl && (
          <a
            href={orderResult.payUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-[#ff7b89] to-[#ff8e72] text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Pay Now
          </a>
        )}
        <button
          onClick={() => {
            setOrderResult(null);
            setState("onboarding");
          }}
          className="block mx-auto mt-4 text-sm text-[#ff7b89] hover:underline"
        >
          Back to Chat
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-5 rounded-[28px] bg-white/90 backdrop-blur-sm shadow-xl border border-white/50"
    >
      {/* Stepper */}
      <div className="flex items-center justify-between mb-6 px-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step
                  ? "bg-[#ff7b89] text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <s.icon className="w-4 h-4" />
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 rounded ${
                  i < step ? "bg-[#ff7b89]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Recipient */}
      {step === 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <h3
            className="text-lg font-bold text-[#020333] mb-4"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            Recipient Details
          </h3>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="text"
              placeholder="Full Name *"
              value={form.recipientName}
              onChange={(e) => updateField("recipientName", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="text"
              placeholder="Address *"
              value={form.recipientAddress}
              onChange={(e) => updateField("recipientAddress", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="text"
              placeholder="City * (e.g., Colombo, Kandy)"
              value={form.recipientCity}
              onChange={(e) => updateField("recipientCity", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={form.recipientPhone}
              onChange={(e) => updateField("recipientPhone", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="email"
              placeholder="Email (optional)"
              value={form.recipientEmail}
              onChange={(e) => updateField("recipientEmail", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20"
            />
          </div>
        </motion.div>
      )}

      {/* Step 1: Delivery */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <h3
            className="text-lg font-bold text-[#020333] mb-4"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            Delivery Details
          </h3>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="date"
              value={form.deliveryDate}
              onChange={(e) => updateField("deliveryDate", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20"
            />
          </div>
          <div className="relative">
            <Truck className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="text"
              placeholder="Delivery Instructions (optional)"
              value={form.deliveryInstructions}
              onChange={(e) =>
                updateField("deliveryInstructions", e.target.value)
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20"
            />
          </div>
          <div className="relative">
            <Gift className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <textarea
              placeholder="Gift Message (optional)"
              value={form.giftMessage}
              onChange={(e) => updateField("giftMessage", e.target.value)}
              rows={3}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20 resize-none"
            />
          </div>
        </motion.div>
      )}

      {/* Step 2: Sender */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <h3
            className="text-lg font-bold text-[#020333] mb-4"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            Your Details
          </h3>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="text"
              placeholder="Your Name *"
              value={form.senderName}
              onChange={(e) => updateField("senderName", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="email"
              placeholder="Your Email *"
              value={form.senderEmail}
              onChange={(e) => updateField("senderEmail", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="tel"
              placeholder="Your Phone (optional)"
              value={form.senderPhone}
              onChange={(e) => updateField("senderPhone", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b89]/20"
            />
          </div>

          {/* Order Summary */}
          <div className="mt-4 p-4 rounded-xl bg-[#fdf6f6] border border-[#ff7b89]/10">
            <h4 className="text-sm font-semibold text-[#020333] mb-2">
              Order Summary
            </h4>
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-xs mb-1"
              >
                <span className="text-[#727288]">
                  {item.name} x{item.qty}
                </span>
                <span className="text-[#020333]">
                  LKR {(item.price * item.qty).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="border-t border-[#ff7b89]/10 mt-2 pt-2 flex justify-between font-bold">
              <span className="text-[#020333]">Total</span>
              <span className="text-[#ff7b89]">LKR {total.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 rounded-full bg-gray-100 text-[#020333] font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Back
          </motion.button>
        )}
        {step < 2 ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep(step + 1)}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#ff7b89] to-[#ff8e72] text-white font-semibold text-sm shadow-lg shadow-[#ff7b89]/25"
          >
            Continue
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#020333] to-[#1a1a4e] text-white font-semibold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Place Order
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
