"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

export type WatchlistToastStatus = 'Watching' | 'Completed' | 'Planned' | 'On-Hold' | 'Dropped' | 'Removed' | null;

interface WatchlistToastProps {
    status: WatchlistToastStatus;
    animeTitle?: string;
    onClose: () => void;
}

const STATUS_CONFIG: Record<
    Exclude<WatchlistToastStatus, null>,
    { label: string; iconColor: string }
> = {
    Watching:  { label: "Saved to 'Watching' list.",       iconColor: '#53CCB8' },
    Completed: { label: "Saved to 'Completed' list.",      iconColor: '#34d399' },
    Planned:   { label: "Saved to 'Plan to Watch' list.",  iconColor: '#a78bfa' },
    'On-Hold': { label: "Saved to 'On-Hold' list.",        iconColor: '#f59e0b' },
    Dropped:   { label: "Saved to 'Dropped' list.",        iconColor: '#fb7185' },
    Removed:   { label: "Removed from your watchlist.",    iconColor: '#9ca3af' },
};

export default function WatchlistToast({ status, animeTitle, onClose }: WatchlistToastProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const cfg = status ? STATUS_CONFIG[status] : null;

    return createPortal(
        <AnimatePresence>
            {status && cfg && (
                <motion.div
                    key={status}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="fixed bottom-6 right-5 z-[9999] flex items-center gap-2.5 pl-3 pr-2.5 py-2.5 rounded-full bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                    style={{ maxWidth: 320 }}
                >
                    {/* Checkmark icon */}
                    <CheckCircle2
                        size={16}
                        strokeWidth={2.5}
                        style={{ color: cfg.iconColor }}
                        className="shrink-0"
                    />

                    {/* Message */}
                    <span className="text-[11.5px] font-semibold text-white/80 whitespace-nowrap">
                        {cfg.label}
                    </span>

                    {/* Progress line at bottom */}
                    <motion.div
                        className="absolute bottom-0 left-0 h-[2px] rounded-full"
                        style={{ backgroundColor: cfg.iconColor }}
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 3, ease: "linear" }}
                    />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="text-white/30 hover:text-white/70 transition-colors shrink-0 ml-0.5"
                    >
                        <X size={13} strokeWidth={2.5} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
