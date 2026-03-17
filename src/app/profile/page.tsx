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
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [joinedAt, setJoinedAt] = useState(user?.createdAt || "");

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
    const [bannerPreview, setBannerPreview] = useState(user?.banner || "");

    const avatarInputRef = React.useRef<HTMLInputElement>(null);
    const bannerInputRef = React.useRef<HTMLInputElement>(null);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imageModalTab, setImageModalTab] = useState<'avatar' | 'banner'>('avatar');

    const handlePresetSelect = (url: string, type: 'avatar' | 'banner') => {
        if (type === 'avatar') {
            setAvatarPreview(url);
            setFormData(prev => ({ ...prev, avatar: url }));
            setAvatarFile(null);
        } else {
            setBannerPreview(url);
            setFormData(prev => ({ ...prev, banner: url }));
            setBannerFile(null);
        }
    };

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
        setAvatarPreview(user.avatar || "");
        setBannerPreview(user.banner || "");

        if (!user.token) return;
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app') + '/api/v1';
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
                    setAvatarPreview(fresh.avatar || user.avatar || "");
                    setBannerPreview(fresh.banner || user.banner || "");
                }
            })
            .catch(() => { });
    }, [isAuthenticated, user, login, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'avatar') setAvatarPreview(e.target.value);
        if (e.target.name === 'banner') setBannerPreview(e.target.value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError("Invalid file type. Only JPG, PNG, and WEBP are allowed.");
            return;
        }


        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'avatar') {
                setAvatarFile(file);
                setAvatarPreview(reader.result as string);
            } else {
                setBannerFile(file);
                setBannerPreview(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const uploadFile = async (file: File, type: 'avatar' | 'banner') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const envUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app';
        // Force localhost if the dev server didn't catch the .env.local update
        const ACTUAL_API = envUrl.includes('railway') && window.location.hostname === 'localhost' 
            ? 'http://localhost:3030' 
            : envUrl;
        const BASE_URL = ACTUAL_API + '/api/v1';
        const res = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user?.token}`
            },
            body: formData
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message || `Failed to upload ${type}`);

        // Return full URL
        const API_BASE = ACTUAL_API;
        return `${API_BASE}${data.data.url}`;
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

            let currentAvatar = formData.avatar;
            let currentBanner = formData.banner;

            // Upload files first if any
            if (avatarFile || bannerFile) {
                setIsUploading(true);
                if (avatarFile) {
                    currentAvatar = await uploadFile(avatarFile, 'avatar');
                }
                if (bannerFile) {
                    currentBanner = await uploadFile(bannerFile, 'banner');
                }
                setIsUploading(false);
            }

            const res = await fetch(`${BASE_URL}/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    avatar: currentAvatar,
                    banner: currentBanner
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
                <div className="flex items-center gap-2 mb-4 md:mb-5">
                    <div className="w-1 h-4 md:h-5 rounded-full" style={{ background: "var(--primary)" }} />
                    <h2 className="text-[14px] md:text-[17px] font-bold text-white">Edit Profile</h2>
                </div>

                <div className="rounded-xl md:rounded-2xl p-5 md:p-8" style={{ background: "var(--surface)" }}>
                    <div className="flex flex-col-reverse md:flex-row gap-6 md:gap-10">

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
                                        BANNER
                                    </label>
                                    <div className="relative group overflow-hidden rounded-lg aspect-[3/1] bg-surface-raised border border-white/5 cursor-pointer"
                                         onClick={() => { setImageModalTab('banner'); setIsImageModalOpen(true); }}>
                                        {bannerPreview ? (
                                            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2">
                                                <ImageIcon size={24} />
                                                <span className="text-[11px] font-bold">Upload Banner</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Upload size={16} className="text-white" />
                                            <span className="text-[12px] font-bold text-white uppercase tracking-wider">Change Banner</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={bannerInputRef}
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => handleFileChange(e, 'banner')}
                                    />
                                    <div className="pt-2">
                                        <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.1em] block mb-1">Or provide URL</label>
                                        <input
                                            type="url"
                                            name="banner"
                                            value={formData.banner}
                                            onChange={handleChange}
                                            className="w-full rounded-lg py-2 px-3 text-[12px] font-medium text-white outline-none transition-all placeholder:text-white/10"
                                            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                                            placeholder="https://example.com/banner.jpg"
                                            onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                                            onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                                        />
                                    </div>
                                </div>

                                <button type="button" className="flex items-center gap-2 text-[11px] md:text-[12px] font-medium transition-colors hover:opacity-100 opacity-60 hover:text-white pt-1"
                                    style={{ color: "var(--text-muted)" }}>
                                    <Key size={12} className="md:w-[13px] md:h-[13px]" />
                                    Change password
                                </button>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading || isUploading}
                                        className="w-full font-bold text-[13px] py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        style={{ background: "var(--primary)", color: "#0f1012" }}
                                    >
                                        {isLoading || isUploading
                                            ? <><Loader2 className="animate-spin" size={16} /> {isUploading ? 'Uploading...' : 'Saving...'}</>
                                            : "Save Changes"
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right: Avatar */}
                        <div className="flex-shrink-0 flex md:block justify-center">
                            <div className="relative group">
                                <div
                                    className="w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden flex items-center justify-center text-4xl md:text-5xl font-black cursor-pointer bg-surface-raised border-2 border-white/5"
                                    onClick={() => { setImageModalTab('avatar'); setIsImageModalOpen(true); }}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <span className="uppercase text-primary/20">{user.username?.[0]}</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Upload size={20} className="text-white" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => handleFileChange(e, 'avatar')}
                                />
                                <button
                                    type="button"
                                    className="absolute bottom-1 right-1 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xl"
                                    style={{ background: "var(--primary)", color: "#0f1012" }}
                                    onClick={() => { setImageModalTab('avatar'); setIsImageModalOpen(true); }}
                                >
                                    <Pencil size={14} strokeWidth={2.5} className="md:w-[16px] md:h-[16px]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImageSelectModal 
                isOpen={isImageModalOpen}
                initialTab={imageModalTab}
                onClose={() => setIsImageModalOpen(false)}
                onSelect={handlePresetSelect}
                onCustomUploadClick={(type) => {
                    if (type === 'avatar') avatarInputRef.current?.click();
                    else bannerInputRef.current?.click();
                }}
            />
        </>
    );
}
