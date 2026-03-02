const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) walkDir(dirPath, callback);
        else callback(dirPath);
    });
}

function processContent(content) {
    let newContent = content;
    // Replace lowercase/uppercase/capitalize inside className=" " or className=' ' or className={` `}

    // Simplistic approach: just match any className and remove those keywords inside
    newContent = newContent.replace(/className=(["'{`])([^>]*?)(["'}])/g, function (match, p1, p2, p3) {
        // remove lowercase, uppercase, capitalize from the class list
        let newP2 = p2.replace(/\b(lowercase|uppercase|capitalize)\b/g, '').replace(/\s+/g, ' ').trim();
        return `className=${p1}${newP2}${p3}`;
    });

    const wordsToCapitalize = ['add to list', 'watch now', 'more seasons', 'recently added', 'characters', 'recommendations', 'most popular', 'synopsis', 'trailer', 'comments', 'alternative titles', 'basic info', 'statistics', 'episodes', 'score', 'rank', 'popularity', 'members', 'favorites', 'home', 'details', 'studio', 'demographics', 'genre', 'duration', 'rating'];

    function toTitleCase(str) { // properly keep < and >
        let s = str.replace(/[<>]/g, '');
        return ">" + s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') + "<";
    }

    wordsToCapitalize.forEach(word => {
        // regex to match ">word<" ignoring case and spaces
        let regex = new RegExp('>\\s*' + word + '\\s*<', 'gi');
        newContent = newContent.replace(regex, (match) => {
            return toTitleCase(match);
        });
    });

    return newContent;
}

walkDir('./src', function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let original = content;

        content = processContent(content);

        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed', filePath);
        }
    }
});
