import React from 'react';
import Navbar from '@/components/Navbar';
import { Send, Mail } from 'lucide-react';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar />

            <div className="container mx-auto max-w-[600px] px-4 pt-32 md:pt-44">
                {/* Simple Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-display font-black text-white tracking-tight mb-2">
                        contact us
                    </h1>
                    <p className="text-white/30 text-xs font-medium">
                        Have a question or feedback? Send us a message below.
                    </p>
                </div>

                {/* Minimalist Form Card */}
                <div className="bg-[#1a1a1e] border border-white/5 p-6 rounded-[6px] shadow-2xl relative overflow-hidden group">
                    {/* Subtle Gradient Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                    <form className="space-y-4 relative z-10">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-white/20 ml-1">Email</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full bg-white/5 border border-white/5 rounded-[4px] px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/30 focus:bg-white/[0.07] transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-white/20 ml-1">Subject</label>
                            <input
                                type="text"
                                placeholder="What is this about?"
                                className="w-full bg-white/5 border border-white/5 rounded-[4px] px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/30 focus:bg-white/[0.07] transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-white/20 ml-1">Message</label>
                            <textarea
                                rows={6}
                                placeholder="Write your message here..."
                                className="w-full bg-white/5 border border-white/5 rounded-[6px] px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/30 focus:bg-white/[0.07] transition-all resize-none"
                            />
                        </div>

                        <button
                            type="button"
                            className="w-full bg-primary hover:bg-primary-hover text-black font-black text-sm py-4 rounded-[6px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
                        >
                            <Send size={16} strokeWidth={3} />
                            send message
                        </button>
                    </form>
                </div>

                {/* Minimal Footer Info */}
                <div className="mt-8 flex items-center justify-center gap-2 text-white/20">
                    <Mail size={12} />
                    <span className="text-[10px] font-bold tracking-wider">support@somino.site</span>
                </div>
            </div>
        </main>
    );
}
