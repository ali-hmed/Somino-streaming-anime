"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, User, X, Reply, Trash2, Loader2, MessageCircle, ThumbsUp, ThumbsDown, MoreHorizontal, Link2, EyeOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import AuthModal from './AuthModal';
import { timeAgo } from '@/utils/dateUtils';

interface CommentType {
    _id: string;
    episodeId: string;
    userId: string;
    username?: string;
    avatar?: string;
    parentCommentId: string | null;
    text: string;
    createdAt: string;
    likes: number;
    dislikes: number;
    likedBy: string[];
    dislikedBy: string[];
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
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

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

    const handleVote = async (commentId: string, type: 'like' | 'dislike') => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        try {
            // Optimistic update
            const updateVoteInList = (list: CommentType[]): CommentType[] => {
                return list.map(c => {
                    if (c._id === commentId) {
                        const isLiking = type === 'like';
                        const userId = user?._id || '';
                        let { likes, dislikes, likedBy, dislikedBy } = c;

                        likedBy = likedBy || [];
                        dislikedBy = dislikedBy || [];

                        if (isLiking) {
                            if (likedBy.includes(userId)) {
                                likedBy = likedBy.filter(id => id !== userId);
                                likes--;
                            } else {
                                likedBy.push(userId);
                                likes++;
                                if (dislikedBy.includes(userId)) {
                                    dislikedBy = dislikedBy.filter(id => id !== userId);
                                    dislikes--;
                                }
                            }
                        } else {
                            if (dislikedBy.includes(userId)) {
                                dislikedBy = dislikedBy.filter(id => id !== userId);
                                dislikes--;
                            } else {
                                dislikedBy.push(userId);
                                dislikes++;
                                if (likedBy.includes(userId)) {
                                    likedBy = likedBy.filter(id => id !== userId);
                                    likes--;
                                }
                            }
                        }
                        return { ...c, likes, dislikes, likedBy, dislikedBy };
                    }
                    if (c.replies) {
                        return { ...c, replies: updateVoteInList(c.replies) };
                    }
                    return c;
                });
            };

            setComments(prev => updateVoteInList(prev));

            const res = await fetch(`${API_URL}/comments/${commentId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ type })
            });

            const data = await res.json();
            if (!data.success) {
                fetchComments();
            }
        } catch (error) {
            console.error("Vote error:", error);
            fetchComments();
        }
    };

    const handleCopyLink = (commentId: string) => {
        const url = `${window.location.origin}${window.location.pathname}#comment-${commentId}`;
        navigator.clipboard.writeText(url);
        // Simple alert or native notification
    };

    const CommentItem = ({ item, isReply = false, mainId }: { item: CommentType, isReply?: boolean, mainId: string }) => {
        const isLiked = user?._id && item.likedBy?.includes(user._id);
        const isDisliked = user?._id && item.dislikedBy?.includes(user._id);

        return (
            <div id={`comment-${item._id}`} className={`group flex gap-4 ${isReply ? 'ml-12 mt-6' : 'mt-8'} scroll-mt-32`}>
                {/* Avatar */}
                <div className={`shrink-0 rounded-full border-2 border-white/5 overflow-hidden bg-[#1a1b20] ${isReply ? 'w-10 h-10' : 'w-12 h-12 md:w-14 md:h-14'}`}>
                    {item.avatar ? (
                        <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User className="w-1/2 h-1/2 text-white/10" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-[8px] text-primary">★</span>
                            </div>
                            <span className="text-[14px] font-bold text-primary group-hover:text-primary/80 transition-colors cursor-pointer">
                                {item.username || 'Gringo'}
                            </span>
                        </div>
                        <span className="bg-white/5 text-white/40 text-[9px] font-black px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-tighter">
                            Somino
                        </span>
                        <span className="text-[12px] text-white/20 font-medium ml-1">
                            {mounted ? timeAgo(item.createdAt) : '...'}
                        </span>
                    </div>

                    <p className="text-[14px] text-white/80 leading-relaxed break-words whitespace-pre-wrap py-0.5">
                        {item.text}
                    </p>

                    {/* Action Bar */}
                    <div className="flex items-center gap-6 pt-1">
                        {!isReply && (
                            <button
                                onClick={() => {
                                    setReplyingTo({ id: item._id, username: item.username || 'User', mainId });
                                    document.getElementById('comment-input-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className="flex items-center gap-1.5 text-[12px] font-bold text-white/50 hover:text-white transition-colors"
                            >
                                <Reply size={14} className="scale-x-[-1]" />
                                Reply
                            </button>
                        )}

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleVote(item._id, 'like')}
                                className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                            >
                                <ThumbsUp size={16} className={isLiked ? 'fill-primary' : ''} />
                                {item.likes > 0 && <span className="text-[12px] font-bold">{item.likes}</span>}
                            </button>

                            <button
                                onClick={() => handleVote(item._id, 'dislike')}
                                className={`flex items-center gap-1.5 transition-colors ${isDisliked ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                            >
                                <ThumbsDown size={16} className={isDisliked ? 'fill-primary' : ''} />
                                {item.dislikes > 0 && <span className="text-[12px] font-bold">{item.dislikes}</span>}
                            </button>
                        </div>

                        {/* More Dropdown */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(activeDropdown === item._id ? null : item._id);
                                }}
                                className="flex items-center gap-1 text-[12px] font-bold text-white/50 hover:text-white transition-colors"
                            >
                                <MoreHorizontal size={14} />
                                More
                            </button>

                            <AnimatePresence>
                                {activeDropdown === item._id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#1f2026] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5"
                                    >
                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                                            <EyeOff size={14} /> Hide
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                                            <AlertTriangle size={14} /> Mark Spoil
                                        </button>
                                        <button
                                            onClick={() => handleCopyLink(item._id)}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                                        >
                                            <Link2 size={14} /> Copy Link
                                        </button>
                                        {user?._id === item.userId && (
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5 mt-1"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Comment Section Main Box */}
            <div className="bg-[#141519]/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="space-y-0">

                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white tracking-tight uppercase">Comments</h2>
                                <p className="text-[10px] font-bold text-white/20 tracking-wider">SHARE YOUR THOUGHTS</p>
                            </div>
                            <span className="bg-primary/20 text-primary text-[11px] font-black px-3 py-1 rounded-full border border-primary/20 ml-2">
                                {comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0)}
                            </span>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div id="comment-input-area" className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1a1b20] border-2 border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                {mounted && user?.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-white/10" />
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="relative group">
                                    {replyingTo && (
                                        <div className="absolute bottom-full left-0 mb-3 flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-lg">
                                            <span className="text-[10px] font-black text-primary uppercase">Replying to {replyingTo.username}</span>
                                            <button onClick={() => setReplyingTo(null)} className="text-white/40 hover:text-white transition-colors px-1">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={mounted ? (isAuthenticated ? "What are your thoughts?" : "Please log in to leave a message...") : "Crunching data..."}
                                        disabled={!mounted || isPosting}
                                        className="w-full min-h-[70px] bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all resize-none shadow-inner group-hover:bg-white/[0.04]"
                                    />
                                    {mounted && !isAuthenticated && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-2xl cursor-pointer" onClick={() => setIsAuthModalOpen(true)}>
                                            <button className="px-8 py-3 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform active:scale-95 shadow-xl">
                                                Login to post
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {mounted && isAuthenticated && (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            <p className="text-[10px] font-bold text-white/20 tracking-wider uppercase">
                                                Respect the community
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleSend}
                                            disabled={!comment.trim() || isPosting}
                                            className="px-8 py-3 bg-primary text-white font-black text-[11px] tracking-widest uppercase rounded-xl flex items-center gap-2 transition-all hover:scale-[102%] active:scale-95 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(255,107,38,0.3)]"
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
                                    className="mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md relative overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Login Required</h3>
                                            <p className="text-[12px] font-medium text-white/50 leading-relaxed">Join the discussion by logging into your account.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="px-6 py-3 bg-white text-black font-black text-[11px] tracking-widest uppercase rounded-xl shadow-lg hover:bg-white/90 transition-colors" onClick={() => setIsAuthModalOpen(true)}>Login</button>
                                            <button onClick={() => setShowLoginPrompt(false)} className="p-3 text-white/20 hover:text-white transition-colors"><X size={18} /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Comments List */}
                    <div className="p-6 md:p-10">
                        {!mounted || isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <p className="mt-4 text-[11px] font-bold text-white/20 tracking-widest uppercase">Fetching thoughts...</p>
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
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                                    <MessageSquare size={32} className="text-white/10" />
                                </div>
                                <h3 className="text-sm font-black text-white/40 tracking-widest uppercase mb-2">Silence is golden</h3>
                                <p className="text-[11px] font-bold text-white/10 tracking-wider">BE THE FIRST TO START THE CONVERSATION!</p>
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
