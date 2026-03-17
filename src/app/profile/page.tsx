"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, UserCheck, Key, Pencil, Calendar, Image as ImageIcon, X, ArrowRight } from "lucide-react";
import ImageSelectModal from "@/components/ImageSelectModal";

export default function ProfilePage() {
    const { user, isAuthenticated, login } = useAuthStore();
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: user?.username || "",
        displayName: user?.displayName || "",
        aboutMe: user?.aboutMe || "",
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

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState("");
    const [pwSuccess, setPwSuccess] = useState("");

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
                displayName: user.displayName || "",
                aboutMe: user.aboutMe || "",
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
                    if (fresh.username !== user.username || fresh.avatar !== user.avatar || fresh.banner !== user.banner || fresh.displayName !== user.displayName || fresh.aboutMe !== user.aboutMe) {
                        login({ ...fresh, token: user.token });

                        setFormData({
                            username: fresh.username || "",
                            displayName: fresh.displayName || "",
                            aboutMe: fresh.aboutMe || "",
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        isEdited.current = true;
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'avatar') setAvatarPreview(e.target.value);
        if (e.target.name === 'banner') setBannerPreview(e.target.value);
    };


    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPwError("New passwords do not match");
            return;
        }

        setPwLoading(true);
        setPwError("");
        setPwSuccess("");

        try {
            const envUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app';
            const ACTUAL_API = envUrl.includes('railway') && window.location.hostname === 'localhost'
                ? 'http://localhost:3030'
                : envUrl;
            const BASE_URL = ACTUAL_API + '/api/v1';

            const res = await fetch(`${BASE_URL}/auth/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();
            if (data.success) {
                setPwSuccess("Password updated successfully!");
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setTimeout(() => setIsPasswordModalOpen(false), 2000);
            } else {
                setPwError(data.message || "Failed to update password");
            }
        } catch (err: any) {
            setPwError("Connection error. Please try again.");
        } finally {
            setPwLoading(false);
        }
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
                    displayName: formData.displayName,
                    aboutMe: formData.aboutMe,
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
            <div className="max-w-[640px] mx-auto mb-6 space-y-4">
                {error && (
                    <div className="p-4 rounded-lg text-[13px] font-semibold"
                        style={{ background: "rgba(255,80,80,0.08)", color: "#f87171" }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-4 rounded-lg text-[13px] font-semibold"
                        style={{ background: "rgba(83,204,184,0.08)", color: "var(--primary)" }}>
                        {success}
                    </div>
                )}
            </div>

            {/* Edit Profile Box */}
            <div className="max-w-[640px] mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-5 rounded-full" style={{ background: "var(--primary)" }} />
                    <h2 className="text-[18px] md:text-[22px] font-black text-white tracking-tight">Edit Profile</h2>
                </div>

                <div className="rounded-xl overflow-hidden border border-white/[0.05] shadow-2xl" style={{ background: "var(--surface)" }}>
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
                    <div className="p-6 md:p-8 pt-12 md:pt-16">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-white ml-1">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        placeholder="Add your display name"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        className="w-full rounded-lg py-2.5 px-4 text-[14px] font-medium text-white outline-none border border-white/5 bg-[#121212] focus:border-white/20 transition-all placeholder:text-white/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-white ml-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full rounded-lg py-2.5 px-4 text-[14px] font-medium text-white outline-none border border-white/5 bg-[#121212] focus:border-white/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-white ml-1">
                                        About Me
                                    </label>
                                    <textarea
                                        name="aboutMe"
                                        rows={4}
                                        placeholder="Tell us about yourself..."
                                        value={formData.aboutMe}
                                        onChange={handleChange}
                                        className="w-full rounded-lg py-2.5 px-4 text-[14px] font-medium text-white outline-none border border-white/5 bg-[#121212] focus:border-white/20 transition-all resize-none placeholder:text-white/20"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 ml-1">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="email"
                                                name="email"
                                                disabled={user.emailChanged}
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full rounded-lg py-2.5 px-4 text-[14px] font-medium outline-none border border-white/5 transition-all ${user.emailChanged ? "cursor-not-allowed text-white/20" : "bg-[#121212] focus:border-white/20"}`}
                                                style={{ background: user.emailChanged ? "#0a0a0a" : "" }}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {user.emailChanged ? (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold bg-white/5 text-white/40 border border-white/5">
                                                        <span>Immutable</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                                                        <UserCheck size={12} strokeWidth={2.5} />
                                                        <span>Verified</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 ml-1">
                                            Member Since
                                        </label>
                                        <div className="flex items-center gap-3 rounded-lg py-2.5 px-4 border border-white/5 bg-[#121212]">
                                            <Calendar size={16} className="text-white/20" />
                                            <span className="text-[12px] font-semibold text-white/60">
                                                {formatJoinDate(joinedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="space-y-6 pt-6 border-t border-white/5">
                                <div className="space-y-1">
                                    <h3 className="text-[16px] font-bold text-white">Password</h3>
                                    <p className="text-[13px] text-white/40 font-medium">Changing your password will sign you out from all other known devices.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="px-6 py-2.5 rounded-lg bg-white text-black text-[14px] font-bold hover:bg-white/90 transition-all active:scale-95"
                                >
                                    Change Password
                                </button>
                            </div>

                            {/* Account Removal */}
                            <div className="space-y-6 pt-6 border-t border-white/5">
                                <div className="space-y-1">
                                    <h3 className="text-[16px] font-bold text-white">Account Removal</h3>
                                    <p className="text-[13px] text-white/40 font-medium">
                                        Your account will be permanently deleted 7 days after requesting removal. 
                                        If you sign in again before the 7 days are up, the deletion will be cancelled.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="px-6 py-2.5 rounded-lg bg-[#1a1a1a] border border-red-500/10 text-red-500/80 text-[14px] font-bold hover:bg-red-500/[0.05] transition-all active:scale-95"
                                >
                                    Delete Account
                                </button>
                            </div>

                            <div className="pt-6 flex flex-col md:flex-row gap-4 border-t border-white/5">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 font-black text-[14px] py-2.5 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/10"
                                    style={{ background: "var(--primary)", color: "#000" }}
                                >
                                    {isLoading
                                        ? <><Loader2 className="animate-spin" size={18} /> Processing...</>
                                        : "Save Changes"
                                    }
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-8 font-bold text-[14px] py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 hover:bg-white/5 border border-white/5 text-white/60 hover:text-white"
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

            {/* Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsPasswordModalOpen(false)} />
                    <div className="relative w-full max-w-[440px] bg-[#1e1f25] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-white mb-2">Update Password</h3>
                            <p className="text-white/40 text-[13px] mb-8 font-medium">Reset your account security credentials.</p>

                            {pwError && (
                                <div className="mb-6 p-3 rounded-xl bg-red-400/5 border border-red-400/10 text-red-400 text-[12px] font-bold">
                                    {pwError}
                                </div>
                            )}
                            {pwSuccess && (
                                <div className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/10 text-primary text-[12px] font-bold">
                                    {pwSuccess}
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                                        className="w-full bg-[#15161a] border border-white/[0.05] rounded-lg py-3.5 px-5 text-white text-[14px] outline-none focus:border-primary/40 transition-all font-bold"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                                        className="w-full bg-[#15161a] border border-white/[0.05] rounded-lg py-3.5 px-5 text-white text-[14px] outline-none focus:border-primary/40 transition-all font-bold"
                                        placeholder="Min 6 characters"
                                        minLength={6}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                                        className="w-full bg-[#15161a] border border-white/[0.05] rounded-lg py-3.5 px-5 text-white text-[14px] outline-none focus:border-primary/40 transition-all font-bold"
                                        placeholder="Must match"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={pwLoading}
                                        className="flex-1 bg-primary text-black h-14 rounded-lg font-black text-[14px] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {pwLoading ? <Loader2 className="animate-spin" size={18} /> : "Update Security"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsPasswordModalOpen(false)}
                                        className="px-6 h-14 rounded-lg font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all text-[14px]"
                                    >
                                        Back
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
