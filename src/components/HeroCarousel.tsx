"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play, Info, ChevronLeft, ChevronRight, Clock, Calendar, Tv, MessageSquare, Mic } from 'lucide-react';
import { getTitle } from '@/types/anime';

interface HeroCarouselProps {
    animeList: any[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ animeList }) => {
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const list = animeList.slice(0, 8);

    const goTo = useCallback((index: number) => {
        if (isAnimating || index === current) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrent(index);
            setIsAnimating(false);
        }, 400);
    }, [isAnimating, current]);

    const next = useCallback(() => goTo((current + 1) % list.length), [current, list.length, goTo]);
    const prev = useCallback(() => goTo((current - 1 + list.length) % list.length), [current, list.length, goTo]);

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) next();
        if (isRightSwipe) prev();
    };

    useEffect(() => {
        const id = setInterval(next, 7000);
        return () => clearInterval(id);
    }, [next]);

    if (list.length === 0) return null;

    const anime = list[current];
    const title = getTitle(anime.title);

    return (
        <section
            className="relative w-full overflow-hidden h-[60vh] md:h-[max(550px,82vh)] touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >

            {/* Background layers */}
            {list.map((item, i) => (
                <div
                    key={`${item.id}-${i}`}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === current ? 1 : 0, zIndex: 0 }}
                >
                    {/* Blurred ambient bg */}
                    <div
                        className="absolute inset-0 scale-110"
                        style={{
                            backgroundImage: `url(${item.cover || item.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(40px) brightness(0.2)',
                        }}
                    />
                    {/* Dark overlay — lighter on mobile to remove "dark right space" */}
                    <div className="absolute inset-0 bg-[#161618]/70 hidden md:block" />
                    <div className="absolute inset-0 bg-[#161618]/40 block md:hidden" />
                    {/* Strong left gradient — text area */}
                    <div className="absolute inset-0" style={{ zIndex: 1, background: 'linear-gradient(to right, #161618 20%, rgba(22,22,24,0.55) 35%, rgba(22,22,24,0.05) 45%, transparent 100%)' }} />
                    {/* TOP fade — keeps navbar area dark so text is legible */}
                    <div className="absolute top-0 inset-x-0 h-28" style={{ zIndex: 1, background: 'linear-gradient(to bottom, #161618 0%, rgba(22,22,24,0.65) 50%, transparent 100%)' }} />
                    {/* BOTTOM fade — blends into page bg */}
                    <div className="absolute bottom-0 inset-x-0 h-36" style={{ zIndex: 1, background: 'linear-gradient(to top, #161618 0%, rgba(22,22,24,0.6) 55%, transparent 100%)' }} />
                </div>
            ))}

            {/* Character Art */}
            {list.map((item, i) => (
                <div
                    key={`art-${item.id}-${i}`}
                    className="absolute right-0 top-0 h-full transition-all duration-700 pointer-events-none"
                    style={{
                        opacity: i === current ? 1 : 0,
                        zIndex: 2,
                        width: '100%',
                        maxWidth: '1200px',
                    }}
                >
                    <img
                        src={item.cover || item.image}
                        alt=""
                        className="absolute right-0 top-0 h-full w-full object-center md:object-cover object-center md:object-right"
                        style={{
                            /* Mask: fade left, top, and bottom edges — reduced/none on small screens */
                            // maskImage: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'none' : [
                            //     'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 15%, rgba(0,0,0,0.6) 30%, black 50%)',
                            //     'linear-gradient(to bottom, transparent 0%, black 18%)',
                            //     'linear-gradient(to top, transparent 0%, black 18%)',
                            // ].join(', '),
                            WebkitMaskImage: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'none' : [
                                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 15%, rgba(0,0,0,0.6) 30%, black 50%)',
                                'linear-gradient(to bottom, transparent 0%, black 18%)',
                                'linear-gradient(to top, transparent 0%, black 18%)',
                            ].join(', '),
                            maskComposite: 'intersect',

                        }}
                    />
                    {/* TOP fade over image — navbar legibility */}
                    <div
                        className="absolute top-0 inset-x-0 h-24 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to bottom, #161618 0%, rgba(22,22,24,0.55) 55%, transparent 100%)',
                            zIndex: 3,
                        }}
                    />
                    {/* LEFT feathered blend — text area */}
                    <div
                        className="absolute inset-y-0 left-0 w-1/2 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to right, #161618 0%, rgba(22,22,24,0.5) 35%, rgba(22,22,24,0.1) 65%, transparent 100%)',
                            zIndex: 3,
                        }}
                    />
                    {/* BOTTOM fade */}
                    <div
                        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to top, #161618 0%, rgba(22,22,24,0.5) 55%, transparent 100%)',
                            zIndex: 3,
                        }}
                    />
                </div>
            ))}

            {/* Content */}
            <div className="relative z-10 h-full flex items-end pb-12 md:pb-20">
                <div className="container mx-auto px-4 md:px-12">
                    <div className="max-w-[300px] md:max-w-[540px]">

                        {/* Spotlight label — pink, like reference */}
                        <div
                            className="flex items-center gap-2 mb-2 transition-all duration-500"
                            style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(8px)' : 'translateY(0)' }}
                        >
                            <span className="text-primary font-bold text-xs md:text-sm tracking-wide">
                                #{current + 1} Spotlight
                            </span>
                        </div>

                        {/* Title — scaled down slightly for desktop */}
                        <h1
                            className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 leading-[1.1] tracking-tight transition-all duration-500 delay-75 line-clamp-2"
                            style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(10px)' : 'translateY(0)' }}
                        >
                            {title}
                        </h1>

                        {/* Japanese Title / Synonyms — like detail page */}
                        <div
                            className="mb-4 transition-all duration-500 delay-100"
                            style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(10px)' : 'translateY(0)' }}
                        >
                            <p className="text-[11px] md:text-[12px] text-white/40 font-bold tracking-wider truncate">
                                {[anime.japaneseTitle, ...(Array.isArray(anime.synonyms) ? anime.synonyms : [])].filter(Boolean).slice(0, 2).join(' · ')}
                            </p>
                        </div>

                        {/* Info row — hidden on mobile */}
                        <div
                            className="hidden md:flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4 transition-all duration-500 delay-100"
                            style={{ opacity: isAnimating ? 0 : 1 }}
                        >
                            {/* Type */}
                            <span className="flex items-center gap-1 text-white/80 text-xs font-semibold">
                                <Tv size={10} className="text-white/60" />
                                {anime.type || 'TV'}
                            </span>
                            <span className="text-white/20 text-xs">•</span>
                            {/* Duration */}
                            <span className="flex items-center gap-1 text-white/80 text-xs font-semibold">
                                <Clock size={10} className="text-white/60" />
                                {anime.duration?.replace('per ep', '').trim() || '24m'}
                            </span>
                            <span className="text-white/20 text-xs">•</span>
                            {/* Date */}
                            <span className="flex items-center gap-1 text-white/80 text-xs font-semibold">
                                <Calendar size={10} className="text-white/60" />
                                {(() => {
                                    if (anime.year) return anime.year;
                                    if (anime.releaseDate) {
                                        const match = String(anime.releaseDate).match(/\b(19|20)\d{2}\b/);
                                        return match ? match[0] : anime.releaseDate;
                                    }
                                    return anime.premiered || 'TBA';
                                })()}
                            </span>
                            <span className="text-white/20 text-xs">•</span>
                            {/* Outlined media badges */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-[2px] border border-primary/60 text-primary tracking-wider">HD</span>
                                <span className="text-white/20 text-xs">•</span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-[2px] border border-[#FF6E9F]/60 text-[#FF6E9F] tracking-wider flex items-center gap-1">
                                    <MessageSquare size={10} fill="currentColor" />
                                    SUB {anime.totalEpisodes || anime.subEpisodes || '?'}
                                </span>
                                {anime.dubEpisodes > 0 && (
                                    <>
                                        <span className="text-white/20 text-xs">•</span>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-[2px] border border-[#53CCB8]/60 text-[#53CCB8] tracking-wider flex items-center gap-1">
                                            <Mic size={10} fill="currentColor" strokeWidth={3} />
                                            DUB {anime.dubEpisodes}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description — hidden on mobile */}
                        <div
                            className="hidden md:block mb-6 transition-all duration-500 delay-150"
                            style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(8px)' : 'translateY(0)' }}
                        >
                            <p className="text-white/60 text-xs md:text-[13px] leading-relaxed line-clamp-3 max-w-[460px]">
                                {anime.description?.replace(/<[^>]*>/g, '') || 'An extraordinary anime filled with breathtaking action sequences, compelling characters, and an unforgettable story.'}
                            </p>
                        </div>

                        {/* Action Buttons — pill shape, pink Watch Now + dark Detail */}
                        <div
                            className="flex items-center gap-3 transition-all duration-500 delay-200"
                            style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(8px)' : 'translateY(0)' }}
                        >
                            {/* Watch Now — primary teal pill */}
                            <Link
                                href={`/watch/${anime.id}/1`}
                                className="flex items-center gap-2 font-normal text-[11px] px-4 py-1.5 rounded-full transition-all group bg-primary hover:bg-primary-hover text-white"
                            >
                                <Play size={10} className="fill-current group-hover:scale-110 transition-transform" />
                                Watch Now
                            </Link>
                            {/* Detail — dark pill */}
                            <Link
                                href={`/watch/${anime.id}`}
                                className="flex items-center gap-1 font-normal text-[11px] px-4 py-1.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all bg-[#26262b]"
                            >
                                Detail
                                <ChevronRight size={10} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-6 right-4 md:right-12 z-20 flex flex-row items-center gap-2">
                <div className="flex items-center gap-1.5 mr-4">
                    {list.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className="h-1 rounded-full transition-all duration-300 bg-white"
                            style={{ width: i === current ? '20px' : '4px', opacity: i === current ? 1 : 0.2 }}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prev}
                        className="w-10 h-10 rounded-[4px] bg-white/5 border border-white/5 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white hover:bg-primary hover:border-primary transition-all group"
                    >
                        <ChevronLeft size={10} className="group-active:scale-90 transition-transform" />
                    </button>
                    <button
                        onClick={next}
                        className="w-10 h-10 rounded-[4px] bg-white/5 border border-white/5 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white hover:bg-primary hover:border-primary transition-all group"
                    >
                        <ChevronRight size={20} className="group-active:scale-90 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroCarousel;
