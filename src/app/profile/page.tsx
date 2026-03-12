"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, UserCheck, Key, Pencil, Calendar } from "lucide-react";

export default function ProfilePage() {
    const { user, isAuthenticated, login } = useAuthStore();
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
        avatar: user?.avatar || "",
        banner: user?.banner || "",
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

        setFormData({
            username: user.username || "",
            email: user.email || "",
            avatar: user.avatar || "",
            banner: user.banner || "",
        });
        setJoinedAt(user.createdAt || "");

        if (!user.token) return;
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';
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
                        banner: fresh.banner || user.banner || "",
                    });
                    setJoinedAt(fresh.createdAt || user.createdAt || "");
                }
            })
            .catch(() => { });
    }, [isAuthenticated, user?.token, login, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';

            const res = await fetch(`${BASE_URL}/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    avatar: formData.avatar,
                    banner: formData.banner
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
        return date.toISOString().split("T")[0];
    };

    if (!isAuthenticated || !user) return null;

    return (
        <>
            {/* Alerts */}
            {error && (
                <div className="mb-6 p-4 rounded-xl text-[13px] font-semibold"
                    style={{ background: "rgba(255,80,80,0.08)", color: "#f87171" }}>
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-6 p-4 rounded-xl text-[13px] font-semibold"
                    style={{ background: "rgba(83,204,184,0.08)", color: "var(--primary)" }}>
                    {success}
                </div>
            )}

            {/* Edit Profile Box */}
            <div className="max-w-[680px]">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-1 h-5 rounded-full" style={{ background: "var(--primary)" }} />
                    <h2 className="text-[17px] font-bold text-white">Edit Profile</h2>
                </div>

                <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--surface)" }}>
                    <div className="flex flex-col-reverse md:flex-row gap-10">

                        {/* Left: Form */}
                        <div className="flex-1">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                        EMAIL ADDRESS
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        value={formData.email}
                                        className="w-full rounded-lg py-2.5 px-4 text-[13px] font-medium outline-none cursor-not-allowed"
                                        style={{ background: "var(--surface-raised)", color: "var(--text-muted)" }}
                                    />
                                    <div className="inline-flex mt-1.5">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10"
                                            style={{ color: "var(--primary)" }}>
                                            <UserCheck size={11} strokeWidth={2.5} />
                                            <span>Verified</span>
                                        </div>
                                    </div>
                                </div>

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
                                        style={{ background: "var(--surface-raised)" }}
                                        onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                                        onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                        JOINED
                                    </label>
                                    <div className="flex items-center gap-2 rounded-lg py-2.5 px-4"
                                        style={{ background: "var(--surface-raised)" }}>
                                        <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                                        <span className="text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>
                                            {formatJoinDate(joinedAt)}
                                        </span>
                                    </div>
                                </div>

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
                                        placeholder="https://example.com/avatar.jpg"
                                        onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                                        onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                        BANNER URL
                                    </label>
                                    <input
                                        type="url"
                                        name="banner"
                                        value={formData.banner}
                                        onChange={handleChange}
                                        className="w-full rounded-lg py-2.5 px-4 text-[13px] font-medium text-white outline-none transition-all"
                                        style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                                        placeholder="https://example.com/banner.jpg"
                                        onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                                        onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                                    />
                                </div>

                                <button type="button" className="flex items-center gap-2 text-[12px] font-medium transition-colors hover:opacity-100 opacity-60 hover:text-white pt-1"
                                    style={{ color: "var(--text-muted)" }}>
                                    <Key size={13} />
                                    Change password
                                </button>

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
                                    className="w-[110px] h-[110px] rounded-full overflow-hidden flex items-center justify-center text-4xl font-black"
                                    style={{ background: "var(--surface-raised)", border: "2px solid var(--border)", color: "var(--primary)" }}
                                >
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="uppercase">{user.username?.[0]}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="absolute bottom-1 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
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
        </>
    );
}
