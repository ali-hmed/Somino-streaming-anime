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

    // Fetch all necessary data on the server
    const [anime, relatedAnime, animeRelations] = await Promise.all([
        fetchAnimeInfo(id),
        fetchRelatedAnime(id),
        fetchAnimeRelations(id)
    ]);

    if (!anime) {
        return (
            <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-6 text-center">
                    <img src="/miku-not-found.png" alt="Not Found" className="w-64 h-auto opacity-50" />
                    <h1 className="text-xl font-black text-white/40 tracking-widest uppercase">Anime not found</h1>
                </div>
            </div>
        );
    }

    // Prepare sidebar data
    const sidebarRelations = animeRelations?.map((rel: any) => ({
        ...rel,
        name: rel.title?.english || rel.title?.romaji || rel.title || 'Unknown',
        image: rel.image || anime.image
    })).slice(0, 6) || [];

    const recommended = relatedAnime || [];

    return (
        <main className="min-h-screen bg-[#0b0b0c] text-white/90 font-sans selection:bg-primary/30">
            <Navbar />

            {/* main content container */}
            <div className="container mx-auto px-4 pt-24 md:pt-32 pb-12 max-w-[1320px]">
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
