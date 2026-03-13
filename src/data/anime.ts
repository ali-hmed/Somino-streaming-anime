export interface Anime {
    id: string;
    title: string;
    image: string;
    genre: string[];
    episodes: number;
    status: string;
    description?: string;
}

export const trendingAnime: Anime[] = [
    {
        id: "one-piece-100",
        title: "One Piece",
        image: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/bcd84737a03011913bc1d30d041ad263.jpg",
        genre: ["Action", "Adventure", "Comedy"],
        episodes: 1122,
        status: "Ongoing"
    },
    {
        id: "solo-leveling-18751",
        title: "Solo Leveling",
        image: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/693630fbc89ed5ca19e4f509930fca68.jpg",
        genre: ["Action", "Adventure", "Fantasy"],
        episodes: 12,
        status: "Completed"
    },
    {
        id: "jujutsu-kaisen-2nd-season-18485",
        title: "Jujutsu Kaisen Season 2",
        image: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/a1c21d8b67b4a99bc693f26bf8fcd2e5.jpg",
        genre: ["Action", "Supernatural"],
        episodes: 23,
        status: "Completed"
    },
    {
        id: "demon-slayer-kimetsu-no-yaiba-hashira-training-arc-19077",
        title: "Demon Slayer: Hashira Training Arc",
        image: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/f87799ef08b535fa324701ca573a0a65.jpg",
        genre: ["Action", "Fantasy"],
        episodes: 8,
        status: "Completed"
    },
    {
        id: "spy-x-family-season-2-18635",
        title: "SPY x FAMILY Season 2",
        image: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/e0780282143bc556616093d5fb1034c4.jpg",
        genre: ["Comedy", "Action"],
        episodes: 12,
        status: "Completed"
    },
    {
        id: "blue-lock-2nd-season-19293",
        title: "Blue Lock Season 2",
        image: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/69493902996d9294f50965e6f332612a.jpg",
        genre: ["Sports"],
        episodes: 14,
        status: "Ongoing"
    }
];
