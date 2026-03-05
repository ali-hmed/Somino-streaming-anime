"use client";

import React, { useState } from "react";
import { Link2, Unlink, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";

export default function MALPage() {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = () => {
        setIsConnecting(true);
        // Simulate OAuth flow
        setTimeout(() => {
            setIsConnected(true);
            setIsConnecting(false);
        }, 1500);
    };

    const handleDisconnect = () => {
        setIsConnected(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: "#2e51a2" }} />
                <h2 className="text-[17px] font-bold text-white">MyAnimeList Integration</h2>
            </div>

            <div className="rounded-2xl overflow-hidden border" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="p-8 sm:p-12 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-[#2e51a2] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#2e51a2]/20">
                        <img src="https://myanimelist.net/img/sp/icon/apple-touch-icon-144x144.png" alt="MAL" className="w-12 h-12 brightness-0 invert" />
                    </div>

                    <div className="max-w-md space-y-2">
                        <h3 className="text-xl font-bold text-white">
                            {isConnected ? "Connected to MyAnimeList" : "Sync with MyAnimeList"}
                        </h3>
                        <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            {isConnected
                                ? "Your watch history and watchlist are now being synced automatically with your MAL account."
                                : "Connect your MAL account to automatically sync your watch history, scores, and status across both platforms."}
                        </p>
                    </div>

                    {!isConnected ? (
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="flex items-center gap-3 bg-[#2e51a2] hover:bg-[#254182] text-white px-8 py-3.5 rounded-xl font-bold text-[14px] transition-all disabled:opacity-50"
                        >
                            {isConnecting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Link2 size={18} /> Connect MyAnimeList
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="w-full max-w-sm space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                    <img src="https://cdn.myanimelist.net/images/userimages/default.jpg" alt="User" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[13px] font-bold text-white leading-none mb-1">MAL User</p>
                                    <p className="text-[11px] text-primary flex items-center gap-1 font-bold">
                                        <ShieldCheck size={12} /> Account Linked
                                    </p>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"
                                    title="Disconnect"
                                >
                                    <Unlink size={16} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-bold px-1">
                                <span style={{ color: "var(--text-muted)" }}>Auto-sync is enabled</span>
                                <a href="https://myanimelist.net" target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1 hover:underline">
                                    View on MAL <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <AlertCircle size={14} className="text-yellow-500" />
                        <span>Data is synced every 5 minutes</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2e51a2]" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Sync Status: Idle</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: "Auto Update", desc: "Episodes are marked as watched on MAL automatically." },
                    { title: "One-Click Add", desc: "Add shows to your MAL list directly from Somino." },
                    { title: "Rating Sync", desc: "Your Somino scores are pushed to MyAnimeList profile." }
                ].map((f, i) => (
                    <div key={i} className="p-5 rounded-2xl border" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <h4 className="text-[13px] font-bold text-white mb-2">{f.title}</h4>
                        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
