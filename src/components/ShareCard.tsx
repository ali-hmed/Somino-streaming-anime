"use client";

import React from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const ShareCard = () => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.origin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="w-full px-1">
            <div className="w-full relative overflow-hidden group">
                {/* Background with Ambient Glow */}
                <div className="absolute inset-0 bg-card/60 backdrop-blur-sm rounded-[4px]" />

                <div className="relative flex items-center justify-between py-0 h-18">
                    {/* Left: Text Content */}
                    <div className="flex items-center flex-1 min-w-0 h-full relative">
                        {/* Circular GIF Thumbnail (No space on left) */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0 group/video cursor-pointer">
                            <div className="absolute inset-0 bg-card rounded-full overflow-hidden">
                                <img
                                    src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NWh1dXM4azU0dDVxMTQ3a20wbnZ5d3hpOGlnamVpdGozMHI2b3U4MyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/vRHKYJFbMNapxHnp6x/giphy.gif"
                                    alt="Anime"
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-0.5 min-w-0 ml-5">
                            <h2 className="text-[14px] font-black text-white whitespace-nowrap">
                                Enjoying Somino?
                            </h2>
                            <p className="text-[10px] sm:text-[12px] text-white/40 font-medium truncate">
                                Share it and let others know!
                            </p>
                        </div>
                    </div>

                    {/* Right: Controls (Compact) */}
                    <div className="flex items-center gap-4 pr-6">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-full transition-all group whitespace-nowrap"
                        >
                            <span className="text-[10px] font-black text-primary tracking-tight">{copied ? 'copied!' : 'Copy Link'}</span>
                            {copied ? <Check size={10} className="text-[#2ECC71]" /> : <Copy size={10} className="text-primary/60 group-hover:text-primary transition-colors" />}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShareCard;
