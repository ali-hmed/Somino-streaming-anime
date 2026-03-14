import React from 'react';
import {
    fetchAnimeInfo,
    fetchEpisodeStreamingLinks,
    fetchEpisodeDetails,
    fetchRelatedAnime,
    fetchAnimeRelations
} from '@/lib/consumet';
import { getTitle, Episode } from '@/types/anime';
import Navbar from '@/components/Navbar';
import WatchContent from '@/components/WatchContent';

export async function generateMetadata({ params }: { params: Promise<{ id: string, episodeId: string }> }) {
    const { id } = await params;
    const anime = await fetchAnimeInfo(id);
    if (!anime) return { title: 'Somino - Streaming' };

    const title = getTitle(anime.title);

    return {
        title: `Watching ${title} - Somino`,
        description: `Stream ${title} on Somino. High quality anime streaming for free.`,
    };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string, episodeId: string }> }) {
    const { id, episodeId } = await params;

    // Fetch primary anime info (this includes related and recommended lists)
    const anime = await fetchAnimeInfo(id);

    if (!anime) {
        return (
            <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-6 text-center">
                    <img src="/miku-not-found.png" alt="Not Found" className="w-64 h-auto opacity-50" />
                    <h1 className="text-xl font-black text-white/40 tracking-widest uppercase">Anime not found</h1>
                </div>
            </div>
        );
    }

    // 1. Prepare Sidebar Relations (from anime.relations which has structural types)
    const sidebarRelations = (anime.relations || []).map((rel: any) => ({
        id: rel.entry.mal_id?.toString(),
        name: rel.entry.name,
        image: rel.entry.image,
        type: rel.entry.type,
        relationType: rel.relation || 'Related',
        subEpisodes: rel.entry.subEpisodes || rel.entry.episodes || 0,
        dubEpisodes: rel.entry.dubEpisodes || 0
    })).slice(0, 10);

    // 2. Prepare Recommended (deduplicated against relations)
    const relationIds = new Set(sidebarRelations.map(r => r.id));
    const recommended = (anime.recommended || [])
        .filter((rec: any) => rec.id !== id && !relationIds.has(rec.id))
        .slice(0, 18);

    return (
        <main className="min-h-screen bg-background text-white/90 font-sans selection:bg-primary/30 relative">
            <Navbar />

            {/* Blurred Background Hero */}
            <div className="absolute inset-x-0 top-0 h-[950px] md:h-[950px] overflow-hidden pointer-events-none border-b border-white/[0.04] z-0">
                <img
                    src={anime.cover || anime.image}
                    alt=""
                    className="w-full h-full object-cover blur-[8px] scale-125 opacity-60"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-background/50" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background/95" />
            </div>

            {/* main content container */}
            <div className="container mx-auto px-4 pt-24 md:pt-32 pb-12 max-w-[1500px] relative z-10">
                <WatchContent
                    id={id}
                    initialEpisodeId={episodeId}
                    anime={anime}
                    recommended={recommended}
                    sidebarRelations={sidebarRelations}
                />
            </div>
        </main>
    );
}
