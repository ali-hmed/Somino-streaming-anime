"use client";

import React, { useState, useEffect } from "react";
import { getUserSettings, saveUserSettings, UserSettings } from "@/lib/settings";
import { Check, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        setSettings(getUserSettings());
    }, []);

    const handleToggle = (key: keyof UserSettings) => {
        if (!settings) return;
        const newVal = !settings[key];
        const updated = { ...settings, [key]: newVal };
        setSettings(updated);
        saveUserSettings({ [key]: newVal });
        showSuccess();
    };

    const handleSelect = (key: keyof UserSettings, value: string) => {
        if (!settings) return;
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        saveUserSettings({ [key]: value });
        showSuccess();
    };

    const showSuccess = () => {
        setSuccessMsg("Settings saved automatically");
        setTimeout(() => setSuccessMsg(""), 2000);
    };

    if (!settings) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full" style={{ background: "var(--primary)" }} />
                    <h2 className="text-[17px] font-bold text-white">App Settings</h2>
                </div>
                {successMsg && (
                    <div className="text-[11px] font-bold text-primary animate-pulse">
                        {successMsg}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Playback Settings */}
                <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <h3 className="text-[14px] font-bold text-white mb-6 uppercase tracking-wider opacity-60">Playback</h3>

                    <div className="space-y-6">
                        {/* Auto Play */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-[14px] font-bold text-white">Auto Play</h4>
                                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Automatically start video when page loads</p>
                            </div>
                            <button
                                onClick={() => handleToggle('autoPlay')}
                                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.autoPlay ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300 ${settings.autoPlay ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Auto Next */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-[14px] font-bold text-white">Auto Next</h4>
                                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Automatically play next episode when current one ends</p>
                            </div>
                            <button
                                onClick={() => handleToggle('autoNext')}
                                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.autoNext ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300 ${settings.autoNext ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preference Settings */}
                <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <h3 className="text-[14px] font-bold text-white mb-6 uppercase tracking-wider opacity-60">Preferences</h3>

                    <div className="space-y-8">
                        {/* Default Category */}
                        <div>
                            <h4 className="text-[14px] font-bold text-white mb-4">Preferred Language</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {['sub', 'dub'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleSelect('preferredCategory', cat)}
                                        className={`py-3 rounded-xl text-[12px] font-bold border transition-all ${settings.preferredCategory === cat ? 'bg-primary border-primary text-[#0f1012]' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                                    >
                                        {cat.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preferred Server */}
                        <div>
                            <h4 className="text-[14px] font-bold text-white mb-4">Default Server</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'megaPlay', name: 'Server 1' },
                                    { id: 'vidWish', name: 'Server 2' }
                                ].map((srv) => (
                                    <button
                                        key={srv.id}
                                        onClick={() => handleSelect('lastServer', srv.id)}
                                        className={`py-3 rounded-xl text-[12px] font-bold border transition-all ${settings.lastServer === srv.id ? 'bg-primary border-primary text-[#0f1012]' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                                    >
                                        {srv.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
