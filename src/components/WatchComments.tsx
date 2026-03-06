"use client";

import React, { useState } from 'react';
import { MessageSquare, Send, User, LogIn, UserPlus, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import AuthModal from './AuthModal';

const WatchComments = () => {
    const [comment, setComment] = useState("");
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { isAuthenticated: isLoggedIn } = useAuthStore();
    const [comments, setComments] = useState<any[]>([]);

    const handleSend = () => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            return;
        }
        // Actually send comment logic would go here
        console.log("Sending comment:", comment);
        setComment("");
    };

    return (
        <div className="bg-[#141519]/40 backdrop-blur-sm rounded-[12px] border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-primary" />
                    <h2 className="text-lg font-black text-white tracking-tight">Comments</h2>
                    <span className="bg-white/5 text-white/40 text-[10px] font-black px-2 py-0.5 rounded-full border border-white/5">
                        {comments.length}
                    </span>
                </div>
            </div>

            {/* Comment Input */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="relative">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full min-h-[30px] bg-white/[0.03] border border-white/5 rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-[13px] md:text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-[9px] md:text-[10px] font-bold text-white/20 tracking-wider uppercase">
                                Please be respectful in the comments
                            </p>
                            <button
                                onClick={handleSend}
                                className="flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-black text-[10px] md:text-xs transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                                disabled={!comment.trim()}
                            >
                                <Send size={11} className="md:w-3.5 md:h-3.5" /> Post Comment
                            </button>
                        </div>
                    </div>
                </div>

                {/* Login Prompt Modal / Overlay */}
                <AnimatePresence>
                    {showLoginPrompt && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mt-6 p-6 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md relative overflow-hidden group"
                        >
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Authorization Required</h3>
                                    <p className="text-[11px] font-medium text-white/50 leading-relaxed max-w-xs">
                                        You must be logged in to participate in the discussion.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="px-5 py-2.5 bg-white text-black font-black text-[10px] tracking-widest uppercase rounded-lg hover:opacity-90 transition-all active:scale-95 text-center"
                                        onClick={() => setIsAuthModalOpen(true)}
                                    >
                                        Login
                                    </button>
                                    <button
                                        className="px-5 py-2.5 bg-white/10 text-white font-black text-[10px] tracking-widest uppercase rounded-lg hover:bg-white/20 transition-all active:scale-95 border border-white/5 text-center"
                                        onClick={() => setIsAuthModalOpen(true)}
                                    >
                                        Register
                                    </button>
                                    <button
                                        onClick={() => setShowLoginPrompt(false)}
                                        className="p-2.5 text-white/20 hover:text-white transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Comments List */}
            <div className="min-h-[200px] flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
                    <MessageSquare size={24} className="text-white/10" />
                </div>
                <h3 className="text-sm font-black text-white/40 tracking-widest uppercase mb-1">No comments yet</h3>
                <p className="text-[10px] font-bold text-white/20 tracking-wider">BE THE FIRST TO START THE CONVERSATION!</p>
            </div>
        </div>
    );
};

export default WatchComments;
