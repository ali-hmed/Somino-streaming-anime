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
        id: "hell-mode",
        title: "Hell Mode: The Hardcore Gamer Dominates",
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176412-r9pI5K1u2y1T.jpg",
        genre: ["Action", "Adventure", "Fantasy"],
        episodes: 12,
        status: "Ongoing",
        description: "A hardcore gamer is reincarnated into a fantasy world with the 'Hell Mode' difficulty setting."
    },
    {
        id: "solo-leveling",
        title: "Solo Leveling",
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-6iwfHJS4U4S7.jpg",
        genre: ["Action", "Adventure", "Fantasy"],
        episodes: 12,
        status: "Completed"
    },
    {
        id: "one-piece",
        title: "One Piece",
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg",
        genre: ["Action", "Adventure", "Comedy"],
        episodes: 1155,
        status: "Ongoing"
    },
    {
        id: "jujutsu-kaisen",
        title: "Jujutsu Kaisen",
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEF9mZ.jpg",
        genre: ["Action", "Supernatural"],
        episodes: 24,
        status: "Completed"
    },
    {
        id: "demon-slayer",
        title: "Demon Slayer: Kimetsu no Yaiba",
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0Clmgfk.jpg",
        genre: ["Action", "Fantasy"],
        episodes: 26,
        status: "Completed"
    },
    {
        id: "spy-x-family",
        title: "SPY x FAMILY",
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-9THeY8y8zW6O.jpg",
        genre: ["Comedy", "Action"],
        episodes: 25,
        status: "Completed"
    }
];
