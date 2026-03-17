import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { AVATAR_PRESETS, BANNER_PRESETS } from '@/lib/imagePresets';

interface ImageSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string, type: 'avatar' | 'banner') => void;
    onCustomUploadClick: (type: 'avatar' | 'banner') => void;
    initialTab?: 'avatar' | 'banner';
}

export default function ImageSelectModal({
    isOpen,
    onClose,
    onSelect,
    onCustomUploadClick,
    initialTab = 'avatar'
}: ImageSelectModalProps) {
    const [tab, setTab] = useState<'avatar' | 'banner'>(initialTab);
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>("Attack on Titan");

    if (!isOpen) return null;

    const data = tab === 'avatar' ? AVATAR_PRESETS : BANNER_PRESETS;

    const toggleAccordion = (anime: string) => {
        setExpandedAccordion(prev => prev === anime ? null : anime);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-[500px] max-h-[85vh] flex flex-col rounded-[24px] overflow-hidden border border-white/[0.08]"
                        style={{ background: "#0c0d10", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
                    >
                        {/* Header */}
                        <div className="px-6 py-6 border-b border-white/[0.04] shrink-0">
                            <button
                                onClick={onClose}
                                className="absolute right-5 top-5 text-white/40 hover:text-white transition-colors z-10 p-1"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                            <h2 className="text-[22px] font-bold text-white text-center tracking-tight mb-5">Select Image</h2>
                            
                            {/* Tabs */}
                            <div className="flex bg-[#1a1b20] p-1 rounded-xl relative z-10">
                                <button
                                    onClick={() => setTab('avatar')}
                                    className={`flex-1 py-2.5 text-[14px] font-bold rounded-lg transition-all ${
                                        tab === 'avatar' 
                                        ? 'bg-white text-black shadow-sm' 
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    Avatar
                                </button>
                                <button
                                    onClick={() => setTab('banner')}
                                    className={`flex-1 py-2.5 text-[14px] font-bold rounded-lg transition-all ${
                                        tab === 'banner' 
                                        ? 'bg-white text-black shadow-sm' 
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    Banner
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
                            {tab === 'avatar' ? (
                                data.map((category) => (
                                    <div key={category.anime} className="border-b border-white/[0.04] last:border-0 pb-1">
                                        <button
                                            onClick={() => toggleAccordion(category.anime)}
                                            className="w-full flex items-center justify-between py-4 px-2 text-left group"
                                        >
                                            <span className="text-[14px] font-bold text-white/80 group-hover:text-white transition-colors">
                                                {category.anime}
                                            </span>
                                            {expandedAccordion === category.anime ? (
                                                <ChevronUp size={16} className="text-white/40 group-hover:text-white transition-colors" />
                                            ) : (
                                                <ChevronDown size={16} className="text-white/40 group-hover:text-white transition-colors" />
                                            )}
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {expandedAccordion === category.anime && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-2 pb-6 grid gap-4 grid-cols-4 sm:grid-cols-5">
                                                        {category.images.map((img, idx) => (
                                                            <motion.button
                                                                whileHover={{ scale: 1.08 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                key={idx}
                                                                onClick={() => {
                                                                    onSelect(img, tab);
                                                                    onClose();
                                                                }}
                                                                className="relative overflow-hidden group aspect-square rounded-full border border-transparent hover:border-primary/50 transition-colors shadow-lg bg-white/5"
                                                            >
                                                                <img 
                                                                    src={img} 
                                                                    alt={`${category.anime} avatar ${idx}`} 
                                                                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                                                    loading="lazy"
                                                                    referrerPolicy="no-referrer"
                                                                />
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))
                            ) : (
                                <div className="grid grid-cols-2 gap-4 pb-2">
                                    {data.flatMap(category => category.images.map((img, idx) => (
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            key={`${category.anime}-${idx}`}
                                            onClick={() => {
                                                onSelect(img, tab);
                                                onClose();
                                            }}
                                            className="relative overflow-hidden group aspect-[16/9] rounded-[16px] outline outline-2 outline-transparent hover:outline-white/30 transition-all shadow-lg bg-white/5"
                                        >
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                                            <img 
                                                src={img} 
                                                alt={`${category.anime} banner ${idx}`} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                loading="lazy"
                                                referrerPolicy="no-referrer"
                                            />
                                        </motion.button>
                                    )))}
                                </div>
                            )}
                        </div>

                        {/* Custom Upload Button at Bottom */}
                        <div className="p-5 border-t border-white/[0.04] bg-[#0c0d10] shrink-0">
                            <button
                                onClick={() => {
                                    onCustomUploadClick(tab);
                                    onClose();
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all text-[14px] font-bold"
                            >
                                <Upload size={18} />
                                Upload Custom {tab === 'avatar' ? 'Avatar' : 'Banner'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
