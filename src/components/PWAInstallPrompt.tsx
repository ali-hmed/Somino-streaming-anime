"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "somino_pwa_dismissed";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if user previously dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so the page loads first
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm"
        >
          <div
            className="relative flex items-center gap-4 rounded-2xl px-5 py-4 border border-white/[0.06]"
            style={{
              background:
                "linear-gradient(135deg, rgba(18,18,18,0.98) 0%, rgba(22,22,22,0.98) 100%)",
              backdropFilter: "blur(24px)",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(83,204,184,0.08)",
            }}
          >
            {/* Icon */}
            <div
              className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(83,204,184,0.08)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/favicon.png"
                alt="Somino"
                className="w-8 h-8 object-contain rounded-lg"
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-white leading-tight">
                Install Somino
              </p>
              <p className="text-[11px] text-white/40 mt-0.5 leading-snug">
                Add to home screen for the best experience
              </p>
            </div>

            {/* Install Button */}
            <button
              onClick={handleInstall}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, #53CCB8 0%, #3EB8A4 100%)",
                color: "#000",
              }}
            >
              <Download size={12} strokeWidth={3} />
              Install
            </button>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            >
              <X size={10} strokeWidth={3} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
