"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, UserCheck, Key, Pencil, Calendar, Image as ImageIcon, Upload } from "lucide-react";
import ImageSelectModal from "@/components/ImageSelectModal";

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

    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
    const [bannerPreview, setBannerPreview] = useState(user?.banner || "");

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imageModalTab, setImageModalTab] = useState<'avatar' | 'banner'>('avatar');

    const handlePresetSelect = (url: string, type: 'avatar' | 'banner') => {
        isEdited.current = true;
        if (type === 'avatar') {
            setAvatarPreview(url);
            setFormData(prev => ({ ...prev, avatar: url }));
        } else {
            setBannerPreview(url);
            setFormData(prev => ({ ...prev, banner: url }));
        }
    };

    // Use a ref to track if the user has manually changed something to avoid overwriting edits
    const isEdited = React.useRef(false);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push("/");
            return;
        }

        // Only initialize fields if it's the first load or user ID changed
        // and NOT if the user is currently editing
        if (!isEdited.current) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                avatar: user.avatar || "",
                banner: user.banner || "",
            });
            setJoinedAt(user.createdAt || "");
            setAvatarPreview(user.avatar || "");
            setBannerPreview(user.banner || "");
        }

        if (!user.token) return;

        const envUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app';
        const ACTUAL_API = envUrl.includes('railway') && typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? 'http://localhost:3030'
            : envUrl;
        const BASE_URL = ACTUAL_API + '/api/v1';

        fetch(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.data && !isEdited.current) {
                    const fresh = data.data;
                    // Only update store if data is actually different to avoid unnecessary re-renders
                    if (fresh.username !== user.username || fresh.avatar !== user.avatar || fresh.banner !== user.banner) {
                        login({ ...fresh, token: user.token });

                        setFormData({
                            username: fresh.username || "",
                            email: fresh.email || "",
                            avatar: fresh.avatar || "",
                            banner: fresh.banner || "",
                        });
                        setJoinedAt(fresh.createdAt || "");
                        setAvatarPreview(fresh.avatar || "");
                        setBannerPreview(fresh.banner || "");
                    }
                }
            })
            .catch(() => { });
    }, [isAuthenticated, user?._id]); // Only re-run if auth status or user ID changes

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        isEdited.current = true;
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'avatar') setAvatarPreview(e.target.value);
        if (e.target.name === 'banner') setBannerPreview(e.target.value);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const envUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app';
            // Force localhost if the dev server didn't catch the .env.local update
            const ACTUAL_API = envUrl.includes('railway') && window.location.hostname === 'localhost'
                ? 'http://localhost:3030'
                : envUrl;
            const BASE_URL = ACTUAL_API + '/api/v1';

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
                isEdited.current = false;
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
            <div className="max-w-[720px] mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-5 rounded-full" style={{ background: "var(--primary)" }} />
                    <h2 className="text-[18px] md:text-[22px] font-black text-white tracking-tight">Edit Profile</h2>
                </div>

                <div className="rounded-[24px] overflow-hidden border border-white/[0.05] shadow-2xl" style={{ background: "var(--surface)" }}>
                    {/* Header: Banner + Avatar Overlap */}
                    <div className="relative">
                        {/* Banner */}
                        <div
                            className="w-full aspect-[3/1] md:aspect-[3.5/1] relative cursor-pointer bg-[#15161a] overflow-hidden group/header"
                            onClick={() => { setImageModalTab('banner'); setIsImageModalOpen(true); }}
                        >
                            {bannerPreview ? (
                                <img
                                    src={bannerPreview}
                                    alt="Banner"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/header:scale-105"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-2">
                                    <ImageIcon size={32} strokeWidth={1.5} />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Select Banner</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/header:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/header:opacity-100">
                                <div className="flex items-center gap-2 bg-black/60 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-md translate-y-2 group-hover/header:translate-y-0 transition-transform">
                                    <Pencil size={14} className="text-white" />
                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">Change Header</span>
                                </div>
                            </div>
                        </div>

                        {/* Avatar Overlap */}
                        <div className="absolute -bottom-14 left-6 md:left-10 md:-bottom-16">
                            <div
                                className="relative group/avatar w-[100px] h-[100px] md:w-[140px] md:h-[140px] rounded-full p-1.5 overflow-hidden transition-transform hover:scale-[1.02]"
                                style={{ background: "var(--surface)" }}
                                onClick={() => { setImageModalTab('avatar'); setIsImageModalOpen(true); }}
                            >
                                <div className="w-full h-full rounded-full overflow-hidden relative bg-[#1c1d22]">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-primary/20 bg-primary/5 uppercase">
                                            {user.username?.[0]}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                        <Pencil size={24} className="text-white" strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content: Form */}
                    <div className="p-6 md:p-10 pt-20 md:pt-24">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] ml-1" style={{ color: "var(--text-muted)" }}>
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            disabled
                                            value={formData.email}
                                            className="w-full rounded-xl py-3.5 px-5 text-[14px] font-medium outline-none cursor-not-allowed border border-white/[0.03]"
                                            style={{ background: "#1a1b20", color: "var(--text-muted)" }}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10"
                                                style={{ color: "var(--primary)" }}>
                                                <UserCheck size={12} strokeWidth={2.5} />
                                                <span>Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] ml-1" style={{ color: "var(--text-muted)" }}>
                                        Account Name
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full rounded-xl py-3.5 px-5 text-[14px] font-medium text-white outline-none border border-white/[0.03] focus:border-primary/30 transition-all"
                                        style={{ background: "#1a1b20" }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] ml-1" style={{ color: "var(--text-muted)" }}>
                                        Member Since
                                    </label>
                                    <div className="flex items-center gap-3 rounded-xl py-3.5 px-5 border border-white/[0.03]"
                                        style={{ background: "#1a1b20" }}>
                                        <Calendar size={16} className="text-primary/40" />
                                        <span className="text-[14px] font-semibold text-white/80">
                                            {formatJoinDate(joinedAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-end">
                                    <button type="button" className="flex items-center gap-2 group text-[13px] font-bold px-5 py-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all w-full"
                                        style={{ color: "var(--text-muted)" }}>
                                        <Key size={15} className="group-hover:rotate-12 transition-transform opacity-40 group-hover:opacity-100" />
                                        <span className="group-hover:text-white transition-colors">Security & Password</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col md:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 font-black text-[14px] py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/10"
                                    style={{ background: "var(--primary)", color: "#000" }}
                                >
                                    {isLoading
                                        ? <><Loader2 className="animate-spin" size={18} /> Processing...</>
                                        : "Save Profile Changes"
                                    }
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-8 font-bold text-[14px] py-4 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-white/5 border border-white/5 text-white/60 hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ImageSelectModal
                isOpen={isImageModalOpen}
                initialTab={imageModalTab}
                onClose={() => setIsImageModalOpen(false)}
                onSelect={handlePresetSelect}
            />
        </>
    );
}
