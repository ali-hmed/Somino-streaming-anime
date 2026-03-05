"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { User, Bell, Heart, PlaySquare, Film, Settings } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuthStore();
    const pathname = usePathname();

    if (!isAuthenticated || !user) return null;

    const tabs = [
        { name: "Profile", href: "/profile", icon: User },
        { name: "Continue Watching", href: "/profile/continue-watching", icon: PlaySquare },
        { name: "Watch List", href: "/profile/watch-list", icon: Heart },
        { name: "Notification", href: "/profile/notification", icon: Bell },
        { name: "Settings", href: "/profile/settings", icon: Settings },
        { name: "MAL", href: "/profile/mal", icon: Film },
    ];

    return (
        <div className="min-h-screen pb-24" style={{ background: "var(--background)" }}>
            <Navbar />

            {/* Profile Header Banner */}
            <div className="relative h-[40vh] pt-[80px] overflow-hidden border-b flex flex-col justify-end" style={{ borderColor: "var(--border)" }}>
                {/* Blurred BG using user avatar or fallback */}
                <div
                    className="absolute inset-0 z-0 opacity-15 blur-[5px] scale-110"
                    style={{
                        backgroundImage: user.avatar
                            ? `url('${user.avatar}')`
                            : `linear-gradient(135deg, #53CCB8 0%, #161618 100%)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to top, var(--background) 5%, transparent 80%)" }} />

                <div className="relative z-10 container mx-auto px-4 md:px-8 flex flex-col items-center">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-wide">
                        Hi, <span style={{ color: "var(--primary)" }}>{user.username}</span>
                    </h1>

                    {/* Tab Navigation */}
                    <div className="flex items-center justify-center overflow-x-auto no-scrollbar border-t w-full" style={{ borderColor: "var(--border)" }}>
                        <div className="flex items-center justify-center gap-1 sm:gap-6 w-full">
                            {tabs.map((tab) => {
                                const isActive = pathname === tab.href;
                                return (
                                    <Link
                                        key={tab.name}
                                        href={tab.href}
                                        className="flex items-center gap-2 text-[12px] py-4 px-3 sm:px-3 border-b-2 whitespace-nowrap transition-colors"
                                        style={{
                                            color: isActive ? "var(--primary)" : "var(--text-muted)",
                                            borderColor: isActive ? "var(--primary)" : "transparent",
                                            fontWeight: isActive ? "700" : "500"
                                        }}
                                    >
                                        <tab.icon size={15} />
                                        <span className="hidden sm:inline">{tab.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-3xl mx-auto px-4 md:px-8 mt-10">
                {children}
            </div>
        </div>
    );
}
