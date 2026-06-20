import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Gift,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Truck,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import type { DeliveryInfo } from "@/store/chatStore";
import { trpc } from "@/providers/trpc";
import { useT } from "@/lib/i18n";
import DeliveryCard from "./DeliveryCard";

const GIFT_TEMPLATES = [
  "Happy Birthday! 🎂 Wishing you a wonderful year ahead.",
  "With love and warm wishes ❤️",
  "සුභ උපන් දිනයක්! 🎉",
  "ආදරෙන්, ඔබට සුභ පැතුම්! 🌸",
  "Just thinking of you 💐",
  "Subha upadinayak! Enjoy your day machan 🥳",
];

const GIFT_MESSAGE_MAX = 300;

export default function CheckoutForm() {
  const cart = useChatStore(s => s.cart);
  const setState = useChatStore(s => s.setState);
  const setCart = useChatStore(s => s.setCart);
  const { t } = useT();

  const [step, setStep] = useState(0);
  const [isGift, setIsGift] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
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
  const checkDelivery = trpc.kapruka.checkDelivery.useMutation();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Verify delivery is actually possible before taking the order — fulfils the
  // delivery-date constraint requirement on the manual checkout path too.
  const goToSender = async () => {
    if (form.recipientCity && form.deliveryDate) {
      setCheckingDelivery(true);
      try {
        const res = await checkDelivery.mutateAsync({
          city: form.recipientCity,
          delivery_date: form.deliveryDate,
        });
        setDeliveryInfo(res as DeliveryInfo);
      } catch {
        setDeliveryInfo(null);
      } finally {
        setCheckingDelivery(false);
      }
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const result = await createOrder.mutateAsync({
        cart: cart.map(item => ({
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
        gift_message: isGift && form.giftMessage ? form.giftMessage : undefined,
      });

      // The router now returns structured { orderNumber, payUrl }.
      setOrderResult({
        payUrl: result.payUrl,
        orderNumber: result.orderNumber,
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
    { label: t("checkout.recipient"), icon: User },
    { label: t("checkout.delivery"), icon: Truck },
    { label: t("checkout.sender"), icon: CreditCard },
  ];

  if (orderResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-md rounded-[24px] border border-white/70 bg-white/90 p-6 text-center shadow-xl shadow-blue-500/10 backdrop-blur-sm"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3
          className="text-xl font-bold text-[#020333] mb-2"
          style={{ fontFamily: "Quicksand, sans-serif" }}
        >
          {t("order.created")}
        </h3>
        <p className="text-sm text-[#727288] mb-4">
          {orderResult.orderNumber
            ? t("order.number", { n: orderResult.orderNumber })
            : t("order.placed")}
        </p>
        {orderResult.payUrl && (
          <a
            href={orderResult.payUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-2xl bg-gradient-to-r from-[#6d5dfc] to-[#1992ff] px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition-shadow hover:shadow-xl"
          >
            {t("order.payNow")}
          </a>
        )}
        <button
          onClick={() => {
            setOrderResult(null);
            setState("onboarding");
          }}
          className="mx-auto mt-4 block text-sm text-[#2563eb] hover:underline"
        >
          {t("checkout.backToChat")}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-xl shadow-blue-500/10 backdrop-blur-sm"
    >
      {/* Stepper */}
      <div className="flex items-center justify-between mb-6 px-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step ? "bg-[#2563eb] text-white" : "bg-gray-200 text-gray-400"
              }`}
            >
              <s.icon className="w-4 h-4" />
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 rounded ${i < step ? "bg-[#2563eb]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Recipient */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <h3 className="text-lg font-bold text-[#020333] mb-4" style={{ fontFamily: "Quicksand, sans-serif" }}>
            {t("checkout.recipientDetails")}
          </h3>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="text"
              placeholder={t("checkout.fullName")}
              value={form.recipientName}
              onChange={e => updateField("recipientName", e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-[#f3f7ff] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="text"
              placeholder={t("checkout.address")}
              value={form.recipientAddress}
              onChange={e => updateField("recipientAddress", e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-[#f3f7ff] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="text"
              placeholder={t("checkout.city")}
              value={form.recipientCity}
              onChange={e => updateField("recipientCity", e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-[#f3f7ff] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="tel"
              placeholder={t("checkout.phone")}
              value={form.recipientPhone}
              onChange={e => updateField("recipientPhone", e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-[#f3f7ff] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="email"
              placeholder={t("checkout.emailOpt")}
              value={form.recipientEmail}
              onChange={e => updateField("recipientEmail", e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-[#f3f7ff] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
        </motion.div>
      )}

      {/* Step 1: Delivery */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <h3 className="text-lg font-bold text-[#020333] mb-4" style={{ fontFamily: "Quicksand, sans-serif" }}>
            {t("checkout.deliveryDetails")}
          </h3>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="date"
              value={form.deliveryDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => updateField("deliveryDate", e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-[#f3f7ff] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
          <div className="relative">
            <Truck className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="text"
              placeholder={t("checkout.instructions")}
              value={form.deliveryInstructions}
              onChange={e => updateField("deliveryInstructions", e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-[#f3f7ff] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
          {/* Gift message */}
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-[#faf5ff] to-[#f3f7ff] p-4">
            <button type="button" onClick={() => setIsGift(v => !v)} className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-[#020333]">
                <Gift className="h-4 w-4 text-[#7c3aed]" />
                {t("checkout.sendGift")}
              </span>
              <span className={`relative h-6 w-11 rounded-full transition-colors ${isGift ? "bg-[#7c3aed]" : "bg-gray-300"}`}>
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${isGift ? "translate-x-[22px]" : "translate-x-0.5"}`}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isGift && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#7c3aed]">
                      <Sparkles className="h-3 w-3" />
                      {t("checkout.quickMessages")}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {GIFT_TEMPLATES.map(tpl => (
                        <button
                          type="button"
                          key={tpl}
                          onClick={() => updateField("giftMessage", tpl)}
                          className="rounded-full border border-violet-100 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#5b3aa8] transition-colors hover:bg-white"
                        >
                          {tpl.length > 24 ? `${tpl.slice(0, 22)}…` : tpl}
                        </button>
                      ))}
                    </div>

                    <div>
                      <textarea
                        placeholder={t("checkout.giftPlaceholder")}
                        value={form.giftMessage}
                        maxLength={GIFT_MESSAGE_MAX}
                        onChange={e => updateField("giftMessage", e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-xl border border-violet-100 bg-white/80 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
                      />
                      <div className="mt-1 text-right text-[10px] text-[#9098bd]">
                        {form.giftMessage.length}/{GIFT_MESSAGE_MAX}
                      </div>
                    </div>

                    {form.giftMessage.trim() && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#6157f5] to-[#1992ff] p-4 text-white shadow-lg shadow-violet-500/20"
                      >
                        <Gift className="absolute -right-2 -top-2 h-16 w-16 opacity-15" />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                          {t("checkout.giftCard")}
                        </p>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{form.giftMessage}</p>
                        {form.senderName && (
                          <p className="mt-3 text-xs italic text-white/85">— {form.senderName}</p>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Step 2: Sender */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <h3 className="text-lg font-bold text-[#020333] mb-4" style={{ fontFamily: "Quicksand, sans-serif" }}>
            {t("checkout.yourDetails")}
          </h3>

          {/* Delivery availability result */}
          {deliveryInfo && (
            <div className="flex justify-center">
              <DeliveryCard delivery={deliveryInfo} />
            </div>
          )}

          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="text"
              placeholder={t("checkout.yourName")}
              value={form.senderName}
              onChange={e => updateField("senderName", e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-[#f3f7ff] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="email"
              placeholder={t("checkout.yourEmail")}
              value={form.senderEmail}
              onChange={e => updateField("senderEmail", e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-[#f3f7ff] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-[#727288]" />
            <input
              type="tel"
              placeholder={t("checkout.yourPhone")}
              value={form.senderPhone}
              onChange={e => updateField("senderPhone", e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-[#f3f7ff] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>

          {/* Order Summary */}
          <div className="mt-4 rounded-xl border border-blue-100 bg-[#f3f7ff] p-4">
            <h4 className="text-sm font-semibold text-[#020333] mb-2">{t("checkout.summary")}</h4>
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between text-xs mb-1">
                <span className="text-[#727288]">
                  {item.name} x{item.qty}
                </span>
                <span className="text-[#020333]">LKR {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-blue-100 pt-2 font-bold">
              <span className="text-[#020333]">{t("cart.total")}</span>
              <span className="text-[#2563eb]">LKR {total.toLocaleString()}</span>
            </div>
            {isGift && form.giftMessage.trim() && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-violet-100 bg-white/70 p-2.5 text-xs">
                <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7c3aed]" />
                <div>
                  <span className="font-semibold text-[#5b3aa8]">{t("checkout.giftMessage")}</span>
                  <span className="text-[#5b5b6e]">{form.giftMessage}</span>
                </div>
              </div>
            )}
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
            {t("checkout.back")}
          </motion.button>
        )}
        {step < 2 ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => (step === 1 ? goToSender() : setStep(step + 1))}
            disabled={checkingDelivery}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6d5dfc] to-[#1992ff] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 disabled:opacity-60"
          >
            {checkingDelivery ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("checkout.checkingDelivery")}
              </>
            ) : (
              t("checkout.continue")
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1d4ed8] to-[#6d5dfc] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("checkout.processing")}
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                {t("checkout.placeOrder")}
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
