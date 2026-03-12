"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, User, X, Reply, Trash2, Loader2, MessageCircle, ThumbsUp, ThumbsDown, MoreHorizontal, Link2, EyeOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import AuthModal from './AuthModal';
import { timeAgo } from '@/utils/dateUtils';
import { getRankByXP, getRankByName } from '@/utils/rankUtils';

interface CommentType {
    _id: string;
    episodeId: string;
    userId: string;
    username?: string;
    avatar?: string;
    rank?: string;
    power?: number;
    role?: string;
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
    animeId: string;
    animeTitle: string;
    animeImage: string;
    episodeNumber: number;
}

const WatchComments = ({ episodeId, animeId, animeTitle, animeImage, episodeNumber }: WatchCommentsProps) => {
    const [mounted, setMounted] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<CommentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: string, username: string, mainId: string } | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isInputExpanded, setIsInputExpanded] = useState(false);

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

    // Auto-scroll to comment from hash
    useEffect(() => {
        if (!isLoading && comments.length > 0) {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#comment-')) {
                const element = document.getElementById(hash.substring(1));
                if (element) {
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('bg-primary/5');
                        setTimeout(() => element.classList.remove('bg-primary/5'), 3000);
                    }, 500);
                }
            }
        }
    }, [isLoading, comments]);

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
                    parentCommentId: replyingTo?.mainId || null,
                    animeId,
                    animeTitle,
                    animeImage,
                    episodeNumber
                })
            });

            const data = await res.json();
            if (data.success) {
                setComment("");
                setReplyingTo(null);
                setIsInputExpanded(false);
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

    const handleVote = async (commentId: string, type: 'like' | 'dislike', commentAuthorId: string) => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        if (user?._id === commentAuthorId) {
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
            <div id={`comment-${item._id}`} className={`group flex gap-3 ${isReply ? 'ml-12 mt-6' : 'mt-8'} scroll-mt-32 relative`}>
                {/* Avatar */}
                <Link href={`/user/${item.username}`} className={`shrink-0 rounded-full bg-card overflow-hidden ${isReply ? 'w-8 h-8' : 'w-10 h-10 md:w-11 md:h-11'}`}>
                    {item.avatar ? (
                        <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User className="w-1/2 h-1/2 text-white/5" />
                        </div>
                    )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1">
                            {(() => {
                                // Priority 1: Check by Power (XP)
                                let rank = getRankByXP(item.power ?? 0);
                                // Priority 2: Fallback to Rank Name
                                if (!rank && item.rank) {
                                    rank = getRankByName(item.rank);
                                }
                                
                                const rankIcon = rank?.icon;
                                let nameColor = rank?.color || '#ffffff';
                                if (item.role?.toLowerCase() === 'admin') nameColor = '#EF4444';
                                if (item.role?.toLowerCase() === 'owner') nameColor = '#FFB941';

                                return (
                                    <>
                                        {rankIcon && (
                                            <img
                                                src={rankIcon}
                                                width={18}
                                                height={18}
                                                alt="rank icon"
                                                className="object-contain shrink-0"
                                            />
                                        )}
                                        <Link 
                                            href={`/user/${item.username}`} 
                                            className="text-[13px] font-bold cursor-pointer hover:no-underline uppercase transition-colors"
                                            style={{ color: nameColor }}
                                        >
                                            {item.username || 'User'}
                                        </Link>
                                    </>
                                );
                            })()}
                            
                            {/* Role Title Badge */}
                            {item.role && item.role.toLowerCase() !== 'user' && (
                                <span className={`px-1.5 py-0.5 rounded-[4px] text-[7px] uppercase font-black tracking-widest border ${
                                    item.role.toLowerCase() === 'owner'
                                        ? 'text-[#FFB941] bg-[#FFB941]/10 border-[#FFB941]/30'
                                        : item.role.toLowerCase() === 'admin'
                                        ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30'
                                        : item.role.toLowerCase() === 'moderator'
                                        ? 'text-primary bg-primary/10 border-primary/30'
                                        : 'text-white/40 bg-white/5 border-white/10'
                                }`}>
                                    {item.role}
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] text-white/20 font-medium">
                            {mounted ? timeAgo(item.createdAt) : '...'}
                        </span>
                    </div>

                    <p className="text-[14px] text-white/80 leading-relaxed break-words whitespace-pre-wrap mb-2">
                        {item.text}
                    </p>

                    {/* Action Bar */}
                    <div className="flex items-center gap-4">
                        {!isReply && (
                            <button
                                onClick={() => {
                                    setReplyingTo({ id: item._id, username: item.username || 'User', mainId });
                                    setIsInputExpanded(true);
                                    document.getElementById('comment-input-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-white/30 hover:text-white transition-colors"
                            >
                                <Reply size={12} className="scale-x-[-1]" />
                                Reply
                            </button>
                        )}

                        <button
                            onClick={() => handleVote(item._id, 'like', item.userId)}
                            disabled={user?._id === item.userId}
                            className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-primary' : 'text-white/30 hover:text-white'} ${user?._id === item.userId ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <ThumbsUp size={12} className={isLiked ? 'fill-primary' : ''} />
                            <span className="text-[11px] font-bold">{item.likes > 0 ? item.likes : ''}</span>
                        </button>

                        <button
                            onClick={() => handleVote(item._id, 'dislike', item.userId)}
                            disabled={user?._id === item.userId}
                            className={`flex items-center gap-1.5 transition-colors ${isDisliked ? 'text-primary' : 'text-white/30 hover:text-white'} ${user?._id === item.userId ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <ThumbsDown size={12} className={isDisliked ? 'fill-primary' : ''} />
                            <span className="text-[11px] font-bold">{item.dislikes > 0 ? item.dislikes : ''}</span>
                        </button>

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
                                        className="absolute top-full left-0 mt-2 w-40 bg-[#181818] rounded-[4px] z-50 overflow-hidden py-1"
                                    >
                                        <button
                                            onClick={() => handleCopyLink(item._id)}
                                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors text-left"
                                        >
                                            <Link2 size={13} /> Copy Link
                                        </button>
                                        {user?._id === item.userId && (
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] font-medium text-red-500/80 hover:bg-red-500/10 transition-colors mt-1 text-left"
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
        <div className="space-y-6 h-full">
            <div className="bg-sidebar rounded-[6px] overflow-hidden flex flex-col lg:max-h-[1050px]">
                {/* Header */}
                <div className="px-6 py-5 flex items-center gap-4">
                    <h2 className="text-[20px] font-bold text-white tracking-tight">Comments</h2>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-[4px] bg-card">
                        <span className="text-[12px] font-black text-primary">
                            {comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0)}
                        </span>
                        <span className="text-[6px] font-bold text-white/20 uppercase tracking-widest">Total</span>
                    </div>
                </div>

                {/* Input Area */}
                <div id="comment-input-area" className="px-6 pb-8">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center shrink-0 overflow-hidden">
                            {mounted && user?.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-white/5" />
                            )}
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="relative group">
                                {replyingTo && (
                                    <div className="absolute bottom-full left-0 mb-2 flex items-center gap-2 bg-primary/10 px-2.5 py-1 rounded-[4px]">
                                        <span className="text-[9px] font-black text-primary uppercase tracking-wider">Replying to {replyingTo.username}</span>
                                        <button onClick={() => setReplyingTo(null)} className="text-white/40 hover:text-white transition-colors">
                                            <X size={10} />
                                        </button>
                                    </div>
                                )}
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={mounted ? (isAuthenticated ? "Leave a comment" : "Join the discussion...") : "Loading..."}
                                    disabled={!mounted || isPosting}
                                    onFocus={() => setIsInputExpanded(true)}
                                    className={`w-full bg-card rounded-[4px] px-4 py-2.5 text-[14px] text-white placeholder-white/10 focus:outline-none focus:bg-card/80 transition-all resize-none ${isInputExpanded ? 'min-h-[80px]' : 'min-h-[44px]'}`}
                                />
                                {mounted && !isAuthenticated && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[4px] cursor-pointer" onClick={() => setIsAuthModalOpen(true)}>
                                        <button className="px-6 py-2 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform active:scale-95">
                                            Login to comment
                                        </button>
                                    </div>
                                )}
                            </div>

                            <AnimatePresence>
                                {mounted && isAuthenticated && (isInputExpanded || comment.trim().length > 0) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        className="flex items-center justify-end gap-3 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => {
                                                setIsInputExpanded(false);
                                                setComment("");
                                                setReplyingTo(null);
                                            }}
                                            className="px-4 py-2 text-white/30 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            disabled={!comment.trim() || isPosting}
                                            className="px-8 py-2.5 bg-primary text-white font-black text-[11px] tracking-widest uppercase rounded-[4px] flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                                        >
                                            {isPosting ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                                            Send
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div className="px-6 py-8 flex-1 overflow-y-auto custom-scrollbar">
                    {!mounted || isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-1">
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
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                            <MessageSquare size={32} className="mb-4" />
                            <h3 className="text-[14px] font-black uppercase tracking-widest">No comments</h3>
                        </div>
                    )}
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
