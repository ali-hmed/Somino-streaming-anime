"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
    MessageSquare, Send, User, X, Reply, Trash2, 
    Loader2, MessageCircle, ThumbsUp, ThumbsDown, 
    MoreHorizontal, Link2, ChevronDown, ChevronUp, Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import AuthModal from './AuthModal';
import { timeAgo } from '@/utils/dateUtils';
import { getRankByXP, getRankByName } from '@/utils/rankUtils';
import UserAvatar from './UserAvatar';
import { API_URL } from '@/lib/api';

interface CommentType {
    _id: string;
    episodeId: string;
    userId: string;
    username?: string;
    avatar?: string;
    frame?: string;
    rank?: string;
    power?: number;
    rankPosition?: number;
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
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    const { user, isAuthenticated } = useAuthStore();

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
            setIsAuthModalOpen(true);
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
                const newComment = data.data;
                setComment("");
                setReplyingTo(null);
                setIsInputFocused(false);

                // Update state locally to avoid full fetch
                if (!newComment.parentCommentId) {
                    setComments(prev => [newComment, ...prev]);
                } else {
                    setComments(prev => prev.map(main => {
                        if (main._id === newComment.parentCommentId) {
                            return {
                                ...main,
                                replies: [...(main.replies || []), newComment]
                            };
                        }
                        return main;
                    }));
                    // Expand the replies if they were collapsed
                    setExpandedReplies(prev => ({ ...prev, [newComment.parentCommentId]: true }));
                }
            }
        } catch (error) {
            console.error("Post comment error:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleVote = async (commentId: string, type: 'like' | 'dislike', commentAuthorId: string) => {
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
            return;
        }

        if (user?._id === commentAuthorId) return;

        try {
            const res = await fetch(`${API_URL}/comments/${commentId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ type })
            });

            const data = await res.json();
            if (data.success) {
                fetchComments();
            }
        } catch (error) {
            console.error("Vote error:", error);
        }
    };

    const handleUpdate = async (commentId: string) => {
        if (!editValue.trim()) return;
        try {
            const res = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ text: editValue })
            });

            const data = await res.json();
            if (data.success) {
                setEditingId(null);
                setEditValue("");
                fetchComments();
            }
        } catch (error) {
            console.error("Update comment error:", error);
        }
    };

    const handleDelete = async () => {
        if (!commentToDelete) return;
        try {
            const res = await fetch(`${API_URL}/comments/${commentToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            if (res.ok) fetchComments();
            setIsDeleteModalOpen(false);
            setCommentToDelete(null);
        } catch (error) {
            console.error("Delete comment error:", error);
        }
    };

    const CommentItem = ({ item, isReply = false, mainId }: { item: CommentType, isReply?: boolean, mainId: string }) => {
        const isLiked = user?._id && item.likedBy?.includes(user._id);
        const isDisliked = user?._id && item.dislikedBy?.includes(user._id);
        const isAuthor = user?._id === item.userId;

        return (
            <div id={`comment-${item._id}`} className="group flex gap-4 mt-6">
                {/* Avatar */}
                <Link href={`/user/${item.username}`} className="shrink-0 transition-transform active:scale-95">
                    <UserAvatar user={item} size={isReply ? 'sm' : 'lg'} />
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <Link href={`/user/${item.username}`} className="text-[13px] font-bold text-white hover:text-white/80 transition-colors">
                            @{item.username?.toLowerCase() || 'user'}
                        </Link>
                        <span className="text-[12px] text-white/40">{mounted ? timeAgo(item.createdAt) : '...'}</span>
                        
                        {item.role && item.role.toLowerCase() !== 'user' && (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                item.role.toLowerCase() === 'owner' ? 'bg-[#FFB941] text-black' : 
                                item.role.toLowerCase() === 'admin' ? 'bg-[#EF4444] text-white' : 'bg-white/10 text-white/60'
                            }`}>
                                {item.role}
                            </span>
                        )}

                        <div className="ml-auto relative opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(activeDropdown === item._id ? null : item._id);
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <MoreHorizontal size={18} />
                            </button>

                            <AnimatePresence>
                                {activeDropdown === item._id && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 top-full mt-2 w-32 bg-[#181818] rounded-md shadow-2xl z-50 border border-white/5 py-1"
                                    >
                                        {isAuthor && (
                                            <button 
                                                onClick={() => {
                                                    setEditingId(item._id);
                                                    setEditValue(item.text);
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-[13px] flex items-center gap-3 hover:bg-white/5 transition-colors"
                                            >
                                                <Pencil size={14} /> Edit
                                            </button>
                                        )}
                                        {(isAuthor || user?.role === 'admin' || user?.role === 'owner') && (
                                            <button 
                                                onClick={() => {
                                                    setCommentToDelete(item._id);
                                                    setIsDeleteModalOpen(true);
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full px-4 py-2 text-left text-[13px] flex items-center gap-3 hover:bg-white/5 text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {editingId === item._id ? (
                        <div className="flex flex-col gap-2 mt-2">
                            <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-primary py-1 text-[14px] text-white outline-none resize-none min-h-[40px]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[12px] font-bold hover:bg-white/10 rounded-full transition-colors">Cancel</button>
                                <button onClick={() => handleUpdate(item._id)} className="px-3 py-1.5 text-[12px] font-bold bg-primary text-black rounded-full transition-all">Save</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[14px] text-white leading-relaxed mb-2 break-words">
                            {item.text}
                        </p>
                    )}

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => handleVote(item._id, 'like', item.userId)}
                                className={`p-1.5 hover:bg-white/10 rounded-full transition-colors ${isLiked ? 'text-primary' : 'text-white'}`}
                            >
                                <ThumbsUp size={16} strokeWidth={isLiked ? 2.5 : 2} className={isLiked ? 'fill-primary' : ''} />
                            </button>
                            <span className="text-[12px] text-white/60 font-medium">{item.likes || ''}</span>
                        </div>

                        <button 
                            onClick={() => handleVote(item._id, 'dislike', item.userId)}
                            className={`p-1.5 hover:bg-white/10 rounded-full transition-colors ${isDisliked ? 'text-white' : 'text-white'}`}
                        >
                            <ThumbsDown size={16} strokeWidth={isDisliked ? 2.5 : 2} className={isDisliked ? 'fill-white' : ''} />
                        </button>

                        <button 
                            onClick={() => {
                                setReplyingTo({ id: item._id, username: item.username || 'user', mainId });
                                setIsInputFocused(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-[12px] font-bold text-white px-3 py-1.5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            Reply
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 py-6">
            {/* Input Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <span className="text-[20px] font-black">{comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0)} Comments</span>
                </div>

                <div className="flex gap-4">
                    <UserAvatar user={user} size="lg" />
                    <div className="flex-1 min-w-0">
                        <div className="relative group">
                            {replyingTo && (
                                <div className="absolute -top-7 left-0 flex items-center gap-2 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md mb-2">
                                    <Reply size={10} className="text-primary" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-wider">Replying to @{replyingTo.username}</span>
                                    <button onClick={() => setReplyingTo(null)} className="text-primary hover:text-primary/70 transition-colors">
                                        <X size={10} />
                                    </button>
                                </div>
                            )}
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onFocus={() => setIsInputFocused(true)}
                                placeholder="Add a comment..."
                                className="w-full bg-transparent border-b border-white/10 py-2 text-[14px] text-white outline-none resize-none min-h-[40px] transition-all focus:border-primary/50"
                            />
                            <motion.div 
                                initial={false}
                                animate={{ scaleX: isInputFocused ? 1 : 0 }}
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-center transition-transform"
                            />
                        </div>

                        <AnimatePresence>
                            {isInputFocused && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center justify-end gap-2 mt-2 overflow-hidden"
                                >
                                    <button 
                                        onClick={() => {
                                            setIsInputFocused(false);
                                            setComment("");
                                            setReplyingTo(null);
                                        }}
                                        className="px-4 py-2 text-[14px] font-bold hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSend}
                                        disabled={!comment.trim() || isPosting}
                                        className="px-4 py-2 bg-primary text-black text-[14px] font-bold rounded-full disabled:bg-white/5 disabled:text-white/20 transition-all"
                                    >
                                        {replyingTo ? 'Reply' : 'Comment'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="flex flex-col gap-2">
                {comments.map((main) => (
                    <div key={main._id} className="flex flex-col">
                        <CommentItem item={main} mainId={main._id} />
                        
                        {main.replies && main.replies.length > 0 && (
                            <div className="ml-14">
                                <button 
                                    onClick={() => setExpandedReplies(prev => ({ ...prev, [main._id]: !prev[main._id] }))}
                                    className="flex items-center gap-2 text-[14px] font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-full transition-all mt-1"
                                >
                                    {expandedReplies[main._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    {main.replies.length} {main.replies.length === 1 ? 'reply' : 'replies'}
                                </button>

                                <AnimatePresence>
                                    {expandedReplies[main._id] && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex flex-col overflow-hidden"
                                        >
                                            {main.replies.map(reply => (
                                                <CommentItem key={reply._id} item={reply} isReply={true} mainId={main._id} />
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-black/20"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="relative w-full max-w-[280px] bg-[#212121] rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <h3 className="text-[16px] font-bold text-white mb-2">Delete comment</h3>
                            <p className="text-[13px] text-white/50 mb-6">Delete your comment permanently?</p>
                            
                            <div className="flex justify-end gap-5">
                                <button 
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="text-[13px] font-bold text-[#3ea6ff] hover:text-[#3ea6ff]/80 transition-all uppercase tracking-wide"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="text-[13px] font-bold text-[#3ea6ff] hover:text-[#3ea6ff]/80 transition-all uppercase tracking-wide"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WatchComments;
