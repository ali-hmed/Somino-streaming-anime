"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, User, UserCheck, Key, Pencil, Settings, Bell, Heart, PlaySquare, Film, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
    const { user, isAuthenticated, login } = useAuthStore();
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
        avatar: user?.avatar || "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [joinedAt, setJoinedAt] = useState(user?.createdAt || "");

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push("/");
            return;
        }

        // Immediately populate form from the Zustand store (no blank flash)
        setFormData({
            username: user.username || "",
            email: user.email || "",
            avatar: user.avatar || "",
        });
        setJoinedAt(user.createdAt || "");

        // Silently try to refresh from API in the background
        if (!user.token) return;
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://somino-backend.vercel.app') + '/api/v1';
        fetch(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.data) {
                    const fresh = data.data;
                    login({ ...fresh, token: user.token });
                    setFormData({
                        username: fresh.username || user.username || "",
                        email: fresh.email || user.email || "",
                        avatar: fresh.avatar || user.avatar || "",
                    });
                    setJoinedAt(fresh.createdAt || user.createdAt || "");
                }
                // If API fails (bad token), silently keep stored values — no error shown here
            })
            .catch(() => { /* silent — keep stored values */ });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://somino-backend.vercel.app') + '/api/v1';

            const res = await fetch(`${BASE_URL}/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    avatar: formData.avatar
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess("Profile updated successfully!");
                login({
                    ...data.data,
                    token: user?.token || "",
                });
            } else {
                setError(data.message || "Failed to update profile");
            }
        } catch (err: any) {
            setError(err.message || "Connection error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatJoinDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        return date.toISOString().split("T")[0]; // e.g. "2026-03-04"
    };

    if (!isAuthenticated || !user) return <div className="min-h-screen" style={{ background: "var(--background)" }} />;

    return (
        <div className="min-h-screen pb-24" style={{ background: "var(--background)" }}>
            <Navbar />

            {/* Profile Header Banner — sits right below global Navbar (pt-[80px]) */}
            <div className="relative pt-[80px] pb-0 overflow-hidden border-b" style={{ borderColor: "var(--border)" }}>
                {/* Blurred BG using user avatar or fallback */}
                <div
                    className="absolute inset-0 z-0 opacity-15 blur-lg scale-110"
                    style={{
                        backgroundImage: formData.avatar
                            ? `url('${formData.avatar}')`
                            : `linear-gradient(135deg, #53CCB8 0%, #161618 100%)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to top, var(--background) 5%, transparent 80%)" }} />

                <div className="relative z-10 container mx-auto px-4 md:px-8 flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-white mb-5 tracking-wide">
                        Hi, <span style={{ color: "var(--primary)" }}>{user.username}</span>
                    </h1>

                    {/* Tab Navigation */}
                    <div className="flex items-center justify-center overflow-x-auto no-scrollbar border-t w-full" style={{ borderColor: "var(--border)" }}>
                        <div className="flex items-center justify-center gap-1 sm:gap-6 w-full">
                            <button className="flex items-center gap-2 text-[12px] font-bold py-4 px-3 sm:px-3 border-b-2 whitespace-nowrap transition-colors"
                                style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>
                                <User size={15} />
                                <span className="hidden sm:inline">Profile</span>
                            </button>
                            <button className="flex items-center gap-2 text-[12px] font-medium py-4 px-3 sm:px-3 border-b-2 border-transparent whitespace-nowrap transition-colors hover:text-white"
                                style={{ color: "var(--text-muted)" }}>
                                <PlaySquare size={15} />
                                <span className="hidden sm:inline">Continue Watching</span>
                            </button>
                            <button className="flex items-center gap-2 text-[12px] font-medium py-4 px-3 sm:px-3 border-b-2 border-transparent whitespace-nowrap transition-colors hover:text-white"
                                style={{ color: "var(--text-muted)" }}>
                                <Heart size={15} />
                                <span className="hidden sm:inline">Watch List</span>
                            </button>
                            <button className="flex items-center gap-2 text-[12px] font-medium py-4 px-3 sm:px-3 border-b-2 border-transparent whitespace-nowrap transition-colors hover:text-white"
                                style={{ color: "var(--text-muted)" }}>
                                <Bell size={15} />
                                <span className="hidden sm:inline">Notification</span>
                            </button>
                            <button className="flex items-center gap-2 text-[12px] font-medium py-4 px-3 sm:px-3 border-b-2 border-transparent whitespace-nowrap transition-colors hover:text-white"
                                style={{ color: "var(--text-muted)" }}>
                                <Settings size={15} />
                                <span className="hidden sm:inline">Settings</span>
                            </button>
                            <button className="flex items-center gap-2 text-[12px] font-medium py-4 px-3 sm:px-3 border-b-2 border-transparent whitespace-nowrap transition-colors hover:text-white"
                                style={{ color: "var(--text-muted)" }}>
                                <Film size={15} />
                                <span className="hidden sm:inline">MAL</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 md:px-8 mt-10">

                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl text-[13px] font-semibold"
                        style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#f87171" }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 rounded-xl text-[13px] font-semibold"
                        style={{ background: "rgba(83,204,184,0.08)", border: "1px solid rgba(83,204,184,0.2)", color: "var(--primary)" }}>
                        {success}
                    </div>
                )}

                {/* Edit Profile Box */}
                <div>
                    {/* Section heading */}
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-1 h-5 rounded-full" style={{ background: "var(--primary)" }} />
                        <h2 className="text-[17px] font-bold text-white">Edit Profile</h2>
                    </div>

                    <div className="rounded-2xl p-6 sm:p-8 shadow-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <div className="flex flex-col-reverse md:flex-row gap-10">

                            {/* Left: Form */}
                            <div className="flex-1">
                                <form onSubmit={handleSubmit} className="space-y-5">

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                            EMAIL ADDRESS
                                        </label>
                                        <input
                                            type="email"
                                            disabled
                                            value={formData.email}
                                            className="w-full rounded-lg py-2.5 px-4 text-[13px] font-medium outline-none cursor-not-allowed"
                                            style={{ background: "var(--surface-raised)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                                        />
                                        <div className="inline-flex mt-1.5">
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                                                style={{ border: "1px solid rgba(83,204,184,0.3)", color: "var(--primary)" }}>
                                                <UserCheck size={11} strokeWidth={2.5} />
                                                <span>Verified</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Username */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                            YOUR NAME
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full rounded-lg py-2.5 px-4 text-[13px] font-medium text-white outline-none transition-all"
                                            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                                            onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                                            onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                                        />
                                    </div>

                                    {/* Joined */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                            JOINED
                                        </label>
                                        <div className="flex items-center gap-2 rounded-lg py-2.5 px-4"
                                            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                                            <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                                            <span className="text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>
                                                {formatJoinDate(joinedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Avatar URL */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                            AVATAR URL
                                        </label>
                                        <input
                                            type="url"
                                            name="avatar"
                                            value={formData.avatar}
                                            onChange={handleChange}
                                            className="w-full rounded-lg py-2.5 px-4 text-[13px] font-medium text-white outline-none transition-all"
                                            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                                            placeholder="https://example.com/image.jpg"
                                            onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                                            onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                                        />
                                    </div>

                                    {/* Change password link */}
                                    <button type="button" className="flex items-center gap-2 text-[12px] font-medium transition-colors hover:opacity-100 opacity-60 hover:text-white pt-1"
                                        style={{ color: "var(--text-muted)" }}>
                                        <Key size={13} />
                                        Change password
                                    </button>

                                    {/* Save */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full font-bold text-[13px] py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            style={{ background: "var(--primary)", color: "#0f1012" }}
                                        >
                                            {isLoading
                                                ? <><Loader2 className="animate-spin" size={16} /> Saving...</>
                                                : "Save Changes"
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Right: Avatar */}
                            <div className="flex-shrink-0 flex md:block justify-center">
                                <div className="relative">
                                    <div
                                        className="w-[110px] h-[110px] rounded-full overflow-hidden shadow-xl flex items-center justify-center text-4xl font-black"
                                        style={{ background: "var(--surface-raised)", border: "2px solid var(--border)", color: "var(--primary)" }}
                                    >
                                        {formData.avatar ? (
                                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{user.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute bottom-1 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-opacity hover:opacity-80"
                                        style={{ background: "var(--primary)", color: "#0f1012" }}
                                        onClick={() => document.querySelector<HTMLInputElement>('[name="avatar"]')?.focus()}
                                    >
                                        <Pencil size={14} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
