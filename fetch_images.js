const fs = require('fs');

async function fetchCharacterImage(search) {
    const query = `
    query ($search: String) {
        Character (search: $search) {
            name { full }
            image { large }
        }
    }
    `;

    const variables = { search };

    const url = 'https://graphql.anilist.co';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.data.Character?.image?.large || null;
    } catch(e) {
        return null;
    }
}

async function fetchMediaBanner(search) {
    const query = `
    query ($search: String) {
        Media (search: $search, type: ANIME) {
            title { romaji }
            bannerImage
        }
    }
    `;

    const variables = { search };

    const url = 'https://graphql.anilist.co';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.data.Media?.bannerImage || null;
    } catch(e) {
        return null;
    }
}

async function run() {
    const chars = {
        "Attack on Titan": ["Eren Yeager", "Mikasa Ackerman", "Armin Arlert", "Levi", "Erwin Smith", "Hange Zoe", "Jean Kirstein", "Sasha Blouse", "Connie Springer", "Reiner Braun", "Annie Leonhart", "Zeke Yeager"],
        "Mushoku Tensei: Jobless Reincarnation": ["Rudeus Greyrat", "Eris Boreas Greyrat", "Sylphiette", "Roxy Migurdia"],
        "Jujutsu Kaisen": ["Yuji Itadori", "Megumi Fushiguro", "Nobara Kugisaki", "Satoru Gojo", "Sukuna", "Suguru Geto", "Maki Zenin", "Toge Inumaki", "Yuta Okkotsu", "Toji Fushiguro"],
        "Demon Slayer": ["Tanjiro Kamado", "Nezuko Kamado", "Zenitsu Agatsuma", "Inosuke Hashibira", "Kyojuro Rengoku", "Giyu Tomioka", "Shinobu Kocho", "Tengen Uzui"],
        "Sakamoto Days": ["Taro Sakamoto", "Shin Asakura", "Lu Xiaotian"],
        "Wind Breaker": ["Haruka Sakura", "Hayato Suo", "Akihiko Nirei", "Kyotaro Sugishita"],
        "Kaiju No.8": ["Kafka Hibino", "Reno Ichikawa", "Kikoru Shinomiya", "Mina Ashiro", "Soshiro Hoshina"]
    };

    const media = ["Attack on Titan", "Mushoku Tensei: Jobless Reincarnation", "Jujutsu Kaisen", "Demon Slayer", "Sakamoto Days", "Wind Breaker", "Kaiju No.8", "Chainsaw Man", "One Piece", "Bleach", "Naruto Shippuden"];

    const avatarData = [];
    for (const [anime, charNames] of Object.entries(chars)) {
        const images = [];
        for (const name of charNames) {
            console.log("Fetching", name);
            const img = await fetchCharacterImage(name);
            if (img) images.push(img);
        }
        avatarData.push({ anime, images });
    }

    const bannerData = [];
    for (const title of media) {
        console.log("Fetching banner", title);
        const img = await fetchMediaBanner(title);
        if (img) bannerData.push({ anime: title, images: [img] });
    }

    const output = `
export const AVATAR_PRESETS = ${JSON.stringify(avatarData, null, 4)};
export const BANNER_PRESETS = ${JSON.stringify(bannerData.filter(d => d.images[0]), null, 4)};
`;

    fs.writeFileSync('src/lib/imagePresets.ts', output);
}

run();
