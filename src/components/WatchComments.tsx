"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
    };

    const CommentItem = ({ item, isReply = false, mainId }: { item: CommentType, isReply?: boolean, mainId: string }) => {
        const isLiked = user?._id && item.likedBy?.includes(user._id);
        const isDisliked = user?._id && item.dislikedBy?.includes(user._id);

        return (
            <div id={`comment-${item._id}`} className={`group flex gap-3 ${isReply ? 'ml-10 mt-5' : 'mt-7'} scroll-mt-32`}>
                {/* Compact Avatar */}
                <div className={`shrink-0 rounded-full border border-white/5 overflow-hidden bg-[#1a1b20] ${isReply ? 'w-8 h-8' : 'w-9 h-9 md:w-10 md:h-10'}`}>
                    {item.avatar ? (
                        <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User className="w-1/2 h-1/2 text-white/5" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                            <div className="w-3.5 h-3.5 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-[7px] text-primary">★</span>
                            </div>
                            <span className="text-[13px] font-bold text-primary group-hover:text-primary/80 transition-colors cursor-pointer leading-none">
                                {item.username || 'User'}
                            </span>
                        </div>
                        <span className="bg-white/5 text-white/30 text-[8px] font-black px-1 py-0.5 rounded border border-white/5 uppercase tracking-tighter leading-none">
                            Somino
                        </span>
                        <span className="text-[11px] text-white/20 font-medium leading-none">
                            {mounted ? timeAgo(item.createdAt) : '...'}
                        </span>
                    </div>

                    <p className="text-[13px] text-white/70 leading-relaxed break-words whitespace-pre-wrap">
                        {item.text}
                    </p>

                    {/* Action Bar - Smaller buttons */}
                    <div className="flex items-center gap-5 pt-0.5">
                        {!isReply && (
                            <button
                                onClick={() => {
                                    setReplyingTo({ id: item._id, username: item.username || 'User', mainId });
                                    document.getElementById('comment-input-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className="flex items-center gap-1 text-[11px] font-bold text-white/40 hover:text-white transition-colors"
                            >
                                <Reply size={12} className="scale-x-[-1]" />
                                Reply
                            </button>
                        )}

                        <div className="flex items-center gap-3.5">
                            <button
                                onClick={() => handleVote(item._id, 'like')}
                                className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-primary' : 'text-white/30 hover:text-white'}`}
                            >
                                <ThumbsUp size={13} className={isLiked ? 'fill-primary' : ''} />
                                {item.likes > 0 && <span className="text-[11px] font-bold">{item.likes}</span>}
                            </button>

                            <button
                                onClick={() => handleVote(item._id, 'dislike')}
                                className={`flex items-center gap-1 transition-colors ${isDisliked ? 'text-primary' : 'text-white/30 hover:text-white'}`}
                            >
                                <ThumbsDown size={13} className={isDisliked ? 'fill-primary' : ''} />
                                {item.dislikes > 0 && <span className="text-[11px] font-bold">{item.dislikes}</span>}
                            </button>
                        </div>

                        {/* More Link */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(activeDropdown === item._id ? null : item._id);
                                }}
                                className="flex items-center gap-1 text-[11px] font-bold text-white/30 hover:text-white transition-colors"
                            >
                                <MoreHorizontal size={13} />
                                More
                            </button>

                            <AnimatePresence>
                                {activeDropdown === item._id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: 5 }}
                                        className="absolute bottom-full left-0 mb-2 w-40 bg-[#1f2026] border border-white/5 rounded-xl shadow-2xl z-50 overflow-hidden py-1"
                                    >
                                        <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors text-left">
                                            <EyeOff size={13} /> Hide
                                        </button>
                                        <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors text-left">
                                            <AlertTriangle size={13} /> Mark Spoil
                                        </button>
                                        <button
                                            onClick={() => handleCopyLink(item._id)}
                                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors text-left"
                                        >
                                            <Link2 size={13} /> Copy Link
                                        </button>
                                        {user?._id === item.userId && (
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] font-medium text-red-500/80 hover:bg-red-500/10 transition-colors border-t border-white/5 mt-1 text-left"
                                            >
                                                <Trash2 size={13} /> Delete
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
            <div className="bg-[#141519]/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                <div className="space-y-0">

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <MessageCircle size={16} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white tracking-tight uppercase">Comments</h2>
                                <p className="text-[9px] font-bold text-white/20 tracking-wider">SHARE YOUR THOUGHTS</p>
                            </div>
                            <span className="bg-primary/20 text-primary text-[10px] font-black px-2.5 py-0.5 rounded-full border border-primary/20 ml-2">
                                {comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0)}
                            </span>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div id="comment-input-area" className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex gap-4">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#1a1b20] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                {mounted && user?.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-white/5" />
                                )}
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="relative group">
                                    {replyingTo && (
                                        <div className="absolute bottom-full left-0 mb-2 flex items-center gap-2 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                                            <span className="text-[9px] font-black text-primary uppercase">Replying to {replyingTo.username}</span>
                                            <button onClick={() => setReplyingTo(null)} className="text-white/40 hover:text-white transition-colors">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    )}
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={mounted ? (isAuthenticated ? "What's on your mind?" : "Join the discussion...") : "Loading..."}
                                        disabled={!mounted || isPosting}
                                        className="w-full min-h-[60px] bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/10 focus:outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all resize-none shadow-inner"
                                    />
                                    {mounted && !isAuthenticated && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-xl cursor-pointer" onClick={() => setIsAuthModalOpen(true)}>
                                            <button className="px-6 py-2 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform active:scale-95">
                                                Login to post
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {mounted && isAuthenticated && (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-primary/60 outline outline-2 outline-primary/20 animate-pulse" />
                                            <p className="text-[9px] font-bold text-white/10 tracking-widest uppercase">
                                                Community Guidelines apply
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleSend}
                                            disabled={!comment.trim() || isPosting}
                                            className="px-6 py-2 bg-primary text-white font-black text-[10px] tracking-widest uppercase rounded-lg flex items-center gap-2 transition-all hover:scale-[102%] active:scale-95 disabled:opacity-50"
                                        >
                                            {isPosting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                            Post
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <AnimatePresence>
                            {showLoginPrompt && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="mt-6 p-5 rounded-xl bg-primary/5 border border-primary/10 backdrop-blur-md relative overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                        <div className="space-y-0.5">
                                            <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Sign in required</h3>
                                            <p className="text-[11px] font-medium text-white/40">You need to be logged in to post a comment.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="px-5 py-2.5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg hover:bg-white/90" onClick={() => setIsAuthModalOpen(true)}>Login</button>
                                            <button onClick={() => setShowLoginPrompt(false)} className="p-2 text-white/20 hover:text-white"><X size={16} /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Comments List */}
                    <div className="p-6 md:p-8">
                        {!mounted || isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="divide-y divide-white/[0.02]">
                                {comments.map((main) => (
                                    <div key={main._id} className="pb-6 last:pb-0">
                                        <CommentItem item={main} mainId={main._id} />
                                        {main.replies && main.replies.map(reply => (
                                            <CommentItem key={reply._id} item={reply} isReply={true} mainId={main._id} />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <MessageSquare size={24} className="text-white/5 mb-4" />
                                <h3 className="text-[13px] font-black text-white/20 tracking-widest uppercase mb-1">No comments yet</h3>
                                <p className="text-[10px] font-bold text-white/10 tracking-wider italic">Be the conversation starter!</p>
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
