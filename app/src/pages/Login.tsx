import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { User, Mail, ShoppingBag, Sparkles } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const loginStore = useChatStore(s => s.login);
  const theme = useChatStore(s => s.theme || "light");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      loginStore({ name: name.trim(), email: email.trim() });
      navigate("/");
    }, 800); // Small delay for mock login feel
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginStore({ name: "Guest", email: "guest@kapruka.com" });
      navigate("/");
    }, 600);
  };

  return (
    <div className="relative flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[#482880] px-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#120726] via-[#482880] to-[#facc15]/20" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border p-8 shadow-2xl backdrop-blur-2xl transition-colors duration-500 ${
          theme === "midnight"
            ? "border-white/10 bg-slate-950/45 text-white shadow-black/40"
            : "border-white/60 bg-white/25 text-[#10133f] shadow-[#283b82]/10"
        }`}
      >
        {/* Decorative elements */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#6d5dfc]/10 blur-xl" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[#1992ff]/10 blur-xl" />

        {/* Logo Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
            }}
            className="flex items-center justify-center mb-4"
          >
            <img 
              src="/kapruka-logo.png" 
              alt="Kapruka Logo" 
              className="h-12 w-auto object-contain rounded-xl shadow-lg border border-white/10"
            />
          </motion.div>
          
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            Welcome to Kapruka Kiki
          </h2>
          <p
            className={`mt-1.5 text-xs font-semibold ${
              theme === "midnight" ? "text-slate-400" : "text-[#5f67a8]"
            }`}
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            Your dynamic AI shopping companion
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs font-semibold text-red-500"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className={`text-xs font-bold ${
                theme === "midnight" ? "text-slate-300" : "text-[#38406f]"
              }`}
            >
              Your Name
            </label>
            <div className="relative flex items-center">
              <User
                className={`absolute left-4 h-4 w-4 ${
                  theme === "midnight" ? "text-slate-500" : "text-[#9098bd]"
                }`}
              />
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. John Doe"
                disabled={isLoading}
                className={`w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm focus:outline-none transition-all duration-300 ${
                  theme === "midnight"
                    ? "border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20"
                    : "border-white/70 bg-white/80 text-[#10133f] placeholder-[#9098bd] focus:border-[#6d5dfc]/50 focus:ring-1 focus:ring-[#6d5dfc]/10"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className={`text-xs font-bold ${
                theme === "midnight" ? "text-slate-300" : "text-[#38406f]"
              }`}
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail
                className={`absolute left-4 h-4 w-4 ${
                  theme === "midnight" ? "text-slate-500" : "text-[#9098bd]"
                }`}
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                disabled={isLoading}
                className={`w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm focus:outline-none transition-all duration-300 ${
                  theme === "midnight"
                    ? "border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20"
                    : "border-white/70 bg-white/80 text-[#10133f] placeholder-[#9098bd] focus:border-[#6d5dfc]/50 focus:ring-1 focus:ring-[#6d5dfc]/10"
                }`}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full rounded-2xl bg-gradient-to-r from-[#482880] to-[#6d5dfc] py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/35 flex items-center justify-center gap-2 ${
              isLoading ? "cursor-wait opacity-80" : ""
            }`}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Let&apos;s Start Shopping
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center justify-between gap-3 opacity-60">
          <div className={`h-[1px] flex-1 ${theme === 'midnight' ? 'bg-white/10' : 'bg-slate-300'}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Or</span>
          <div className={`h-[1px] flex-1 ${theme === 'midnight' ? 'bg-white/10' : 'bg-slate-300'}`} />
        </div>

        {/* Guest Access Button */}
        <button
          onClick={handleGuestLogin}
          disabled={isLoading}
          className={`w-full rounded-2xl border py-3.5 text-xs font-bold transition-all duration-300 ${
            theme === "midnight"
              ? "border-white/10 bg-slate-900/40 text-slate-300 hover:bg-slate-900/60"
              : "border-white/60 bg-white/50 text-[#4f5b91] hover:bg-white/80"
          }`}
        >
          Continue as Guest
        </button>
      </motion.div>
    </div>
  );
}
