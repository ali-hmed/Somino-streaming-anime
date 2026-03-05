"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const loginStore = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const BASE_URL = 'https://somino-backend.vercel.app/api/v1';
            const endpoint = isLogin ? '/auth/login' : '/auth/signup';

            const res = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(isLogin ? {
                    email: formData.email,
                    password: formData.password
                } : formData)
            });

            const data = await res.json();

            if (data.success) {
                loginStore(data.data);
                onClose();
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 15 }}
                    className="relative w-full max-w-[340px] bg-[#0f1012] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden p-6"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full text-white/20 hover:text-white hover:bg-white/5 transition-all z-10"
                    >
                        <X size={18} />
                    </button>

                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-6 mt-1">
                        <img src="/Somino-lg.png" alt="Somino" className="h-7 object-contain" />
                    </div>

                    {/* Title Section */}
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-black text-white tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Get Started'}
                        </h2>
                        <p className="text-white/30 text-[11px] mt-1 font-medium">
                            {isLogin ? 'Login to your account' : 'Join the community'}
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {!isLogin && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3.5 flex items-center text-white/10 group-focus-within:text-primary transition-colors">
                                    <User size={16} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full bg-white/[0.02] border border-white/5 focus:border-primary/30 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-white placeholder-white/5 outline-none transition-all"
                                    placeholder="Username"
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3.5 flex items-center text-white/10 group-focus-within:text-primary transition-colors">
                                <Mail size={16} />
                            </div>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white/5 focus:border-primary/30 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-white placeholder-white/5 outline-none transition-all"
                                placeholder="Email Address"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3.5 flex items-center text-white/10 group-focus-within:text-primary transition-colors">
                                <Lock size={16} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white/5 focus:border-primary/30 rounded-xl py-2.5 pl-10 pr-10 text-[13px] text-white placeholder-white/5 outline-none transition-all"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-white/5 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:brightness-105 disabled:opacity-50 text-[#0f1012] font-black text-[12px] uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-3 shadow-lg shadow-primary/5"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={14} />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-5 border-t border-white/5 text-center flex flex-col gap-2.5">
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-wider">
                            {isLogin ? "No account?" : "Have an account?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-primary hover:underline transition-colors font-black"
                            >
                                {isLogin ? 'Join now' : 'Log in'}
                            </button>
                        </p>
                        {isLogin && (
                            <button className="text-white/20 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                                Forgot Password?
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
