"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, User, X, Reply, Trash2, Loader2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import AuthModal from './AuthModal';
import { timeAgo } from '@/utils/dateUtils';

interface CommentUser {
    _id: string;
    username: string;
    avatar: string;
}

interface CommentType {
    _id: string;
    episodeId: string;
    userId: string; // ID as string in flattened version
    username?: string;
    avatar?: string;
    parentCommentId: string | null;
    text: string;
    createdAt: string;
    replies?: CommentType[];
}

interface WatchCommentsProps {
    episodeId: string;
}

const WatchComments = ({ episodeId }: WatchCommentsProps) => {
    const [mounted, setMounted] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<CommentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: string, username: string, mainId: string } | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Auth state from store
    const { user, isAuthenticated } = useAuthStore();

    // API URL configuration
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';

    // Fetch comments for the current episode
    const fetchComments = useCallback(async () => {
        if (!episodeId) return;
        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/comments/${episodeId}`);
            const data = await res.json();
            if (data.success) {
                setComments(data.data);
            }
        } catch (error) {
            console.error("Fetch comments error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [episodeId, API_URL]);

    // Mount handling to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
        fetchComments();
    }, [fetchComments]);

    // Handle posting a new comment or reply
    const handleSend = async () => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        if (!comment.trim()) return;

        try {
            setIsPosting(true);
            const res = await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    episodeId,
                    text: comment,
                    parentCommentId: replyingTo?.mainId || null
                })
            });

            const data = await res.json();
            if (data.success) {
                setComment("");
                setReplyingTo(null);
                // Instant update or refresh
                fetchComments();
            }
        } catch (error) {
            console.error("Post comment error:", error);
        } finally {
            setIsPosting(false);
        }
    };

    // Handle deleting a comment
    const handleDelete = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            const res = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            if (res.ok) {
                fetchComments();
            }
        } catch (error) {
            console.error("Delete comment error:", error);
        }
    };

    // Sub-component for individual comment items
    const CommentItem = ({ item, isReply = false, mainId }: { item: CommentType, isReply?: boolean, mainId: string }) => (
        <div className={`group flex gap-3 md:gap-4 ${isReply ? 'ml-8 md:ml-12 mt-4' : 'mt-8'}`}>
            {/* User Avatar */}
            <div className={`shrink-0 rounded-xl border border-white/10 overflow-hidden bg-white/5 relative ${isReply ? 'w-8 h-8' : 'w-10 h-10 md:w-12 md:h-12'}`}>
                {item.avatar ? (
                    <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User className="w-1/2 h-1/2 text-white/20" />
                    </div>
                )}
            </div>

            {/* Comment Body */}
            <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-[14px] font-black text-white/90 truncate uppercase tracking-tight">
                        {item.username || 'User'}
                    </span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-tight">
                        • {mounted ? timeAgo(item.createdAt) : '...'}
                    </span>
                </div>

                <p className="text-[14px] text-white/70 leading-relaxed break-words whitespace-pre-wrap">
                    {item.text}
                </p>

                {/* Actions: Reply and Delete */}
                <div className="flex items-center gap-4 pt-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isReply && (
                        <button
                            onClick={() => {
                                setReplyingTo({ id: item._id, username: item.username || 'User', mainId });
                                document.getElementById('comment-input-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-black text-primary/60 hover:text-primary transition-colors"
                        >
                            <Reply size={12} /> REPLY
                        </button>
                    )}
                    {user?._id === item.userId && (
                        <button
                            onClick={() => handleDelete(item._id)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-white/20 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={12} /> DELETE
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // Root container style must be consistent between SSR and hydration
    return (
        <div className="space-y-8 min-h-[400px]">
            <div className="bg-[#141519]/40 backdrop-blur-sm rounded-[16px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="space-y-0">

                    {/* 1. Header Section */}
                    <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white tracking-tight uppercase">Comments</h2>
                                <p className="text-[10px] font-bold text-white/20 tracking-wider">SHARE YOUR THOUGHTS</p>
                            </div>
                            <span className="bg-white/5 text-primary text-[11px] font-black px-3 py-1 rounded-full border border-white/10 ml-2">
                                {comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0)}
                            </span>
                        </div>
                    </div>

                    {/* 2. Input Section - Wrapped in mounted check for interactive parts */}
                    <div id="comment-input-area" className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                {mounted && user?.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-white/20" />
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="relative">
                                    {replyingTo && (
                                        <div className="absolute bottom-full left-0 mb-3 flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
                                            <span className="text-[10px] font-black text-primary uppercase">Replying to {replyingTo.username}</span>
                                            <button onClick={() => setReplyingTo(null)} className="text-white/40 hover:text-white transition-colors">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={mounted ? (isAuthenticated ? "What are your thoughts?" : "Please log in to comment...") : "Loading conversation..."}
                                        disabled={!mounted || isPosting}
                                        className="w-full min-h-[60px] bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all resize-none shadow-inner"
                                    />
                                    {mounted && !isAuthenticated && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl cursor-pointer" onClick={() => setIsAuthModalOpen(true)}>
                                            <button className="px-8 py-3 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform active:scale-95 shadow-2xl">
                                                Login to post
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {mounted && isAuthenticated && (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                                            <p className="text-[10px] font-bold text-white/20 tracking-wider uppercase">
                                                Be polite and respectful
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleSend}
                                            disabled={!comment.trim() || isPosting}
                                            className="px-8 py-3 bg-primary text-white font-black text-[11px] tracking-widest uppercase rounded-xl flex items-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(255,107,38,0.2)] hover:scale-[102%] active:scale-95 disabled:opacity-50"
                                        >
                                            {isPosting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                            Post Comment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Login Reminder Prompt */}
                        <AnimatePresence>
                            {showLoginPrompt && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 backdrop-blur-md relative overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Authentication Needed</h3>
                                            <p className="text-[12px] font-medium text-white/50 leading-relaxed">Please sign in to join the discussion.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="px-6 py-3 bg-white text-black font-black text-[11px] tracking-widest uppercase rounded-xl hover:shadow-xl transition-all" onClick={() => setIsAuthModalOpen(true)}>Login</button>
                                            <button onClick={() => setShowLoginPrompt(false)} className="p-3 text-white/20 hover:text-white"><X size={18} /></button>
                                        </div>
                                    </div>
                                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 3. Comments List Section */}
                    <div className="p-6 md:p-8">
                        {!mounted || isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <p className="mt-4 text-[11px] font-bold text-white/20 tracking-widest uppercase">Loading comments...</p>
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="divide-y divide-white/[0.03]">
                                {comments.map((main) => (
                                    <div key={main._id} className="pb-8 last:pb-0">
                                        <CommentItem item={main} mainId={main._id} />
                                        {main.replies && main.replies.map(reply => (
                                            <CommentItem key={reply._id} item={reply} isReply={true} mainId={main._id} />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                                    <MessageSquare size={32} className="text-white/10" />
                                </div>
                                <h3 className="text-sm font-black text-white/40 tracking-widest uppercase mb-2">No comments here yet</h3>
                                <p className="text-[11px] font-bold text-white/20 tracking-wider">BE THE FIRST TO BREAK THE SILENCE!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
};

export default WatchComments;
