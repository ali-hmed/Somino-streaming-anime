"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    userId: CommentUser;
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

    const { user, isAuthenticated } = useAuthStore();
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') + '/api/v1';

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

    useEffect(() => {
        setMounted(true);
        fetchComments();
    }, [fetchComments]);

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
                fetchComments();
            }
        } catch (error) {
            console.error("Post comment error:", error);
        } finally {
            setIsPosting(false);
        }
    };

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

    const CommentItem = ({ item, isReply = false, mainId }: { item: CommentType, isReply?: boolean, mainId: string }) => (
        <div className={`group flex gap-3 md:gap-4 ${isReply ? 'ml-8 md:ml-12 mt-4' : 'mt-8'}`}>
            <div className={`shrink-0 rounded-full border border-white/10 overflow-hidden bg-white/5 ${isReply ? 'w-7 h-7 md:w-8 md:h-8' : 'w-9 h-9 md:w-11 md:h-11'}`}>
                {item.userId.avatar ? (
                    <img src={item.userId.avatar} alt={item.userId.username} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User className="w-1/2 h-1/2 text-white/20" />
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-[14px] font-black text-white/90 truncate">
                        {item.userId.username}
                    </span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-tight">
                        • {mounted ? timeAgo(item.createdAt) : '...'}
                    </span>
                </div>

                <p className="text-[14px] text-white/70 leading-relaxed break-words whitespace-pre-wrap">
                    {item.text}
                </p>

                <div className="flex items-center gap-4 pt-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isReply && (
                        <button
                            onClick={() => {
                                setReplyingTo({ id: item._id, username: item.userId.username, mainId });
                                const inputArea = document.getElementById('comment-input-area');
                                if (inputArea) {
                                    inputArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-black text-white/30 hover:text-primary transition-colors"
                        >
                            <Reply size={12} /> REPLY
                        </button>
                    )}
                    {user?._id === item.userId._id && (
                        <button
                            onClick={() => handleDelete(item._id)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-white/30 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={12} /> DELETE
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // Initial server render must match client render
    // Use the same root class "space-y-8" to match the error report's expectation
    return (
        <div className="space-y-8">
            <div className="bg-[#141519]/40 backdrop-blur-sm rounded-[12px] border border-white/5 overflow-hidden">
                <div className="space-y-0">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <MessageSquare size={20} className="text-primary" />
                            <h2 className="text-lg font-black text-white tracking-tight uppercase">Comments</h2>
                            <span className="bg-white/5 text-white/40 text-[11px] font-black px-3 py-0.5 rounded-full border border-white/5">
                                {comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0)}
                            </span>
                        </div>
                    </div>

                    {/* Comment Input Area */}
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
                                <div className="relative group">
                                    {replyingTo && (
                                        <div className="absolute bottom-full left-0 mb-2 flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg">
                                            <span className="text-[10px] font-black text-primary uppercase">Replying to {replyingTo.username}</span>
                                            <button onClick={() => setReplyingTo(null)} className="text-white/40 hover:text-white transition-colors">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={mounted ? (isAuthenticated ? "Leave a message..." : "Please log in to leave a message...") : "Loading..."}
                                        disabled={!mounted || isPosting}
                                        className="w-full min-h-[50px] bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                                    />
                                    {mounted && !isAuthenticated && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl cursor-pointer" onClick={() => setIsAuthModalOpen(true)}>
                                            <button className="px-6 py-2 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform active:scale-95 shadow-xl">
                                                Login to comment
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {mounted && isAuthenticated && (
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-[10px] font-bold text-white/20 tracking-wider uppercase">
                                            Please be respectful in the comments
                                        </p>
                                        <button
                                            onClick={handleSend}
                                            disabled={!comment.trim() || isPosting}
                                            className="px-6 py-2.5 bg-primary text-white font-black text-[11px] tracking-widest uppercase rounded-xl flex items-center gap-2 transition-all hover:scale-[102%] active:scale-95 disabled:opacity-50"
                                        >
                                            {isPosting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                            Post Comment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <AnimatePresence>
                            {showLoginPrompt && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md relative"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Login Required</h3>
                                            <p className="text-[12px] font-medium text-white/50 leading-relaxed">Join the discussion by logging into your account.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="px-6 py-3 bg-white text-black font-black text-[11px] tracking-widest uppercase rounded-xl" onClick={() => setIsAuthModalOpen(true)}>Login</button>
                                            <button onClick={() => setShowLoginPrompt(false)} className="p-3 text-white/20 hover:text-white"><X size={18} /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Comments List Area */}
                    <div className="p-6">
                        {!mounted || isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="space-y-2">
                                {comments.map((main) => (
                                    <div key={main._id} className="border-b last:border-0 border-white/[0.03] pb-8 last:pb-0">
                                        <CommentItem item={main} mainId={main._id} />
                                        {main.replies && main.replies.map(reply => (
                                            <CommentItem key={reply._id} item={reply} isReply={true} mainId={main._id} />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <h3 className="text-sm font-black text-white/20 tracking-widest uppercase mb-1">No comments yet</h3>
                                <p className="text-[10px] font-bold text-white/10 tracking-wider">BE THE FIRST TO START THE CONVERSATION!</p>
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
