const fs = require("fs");
var matchups = require("./generate.json");

let discords = {
    "Perl": "p3rlx2",
    "Burnt": "burntflightlessbird",
    "Cactus": "cactussb",
    "Marki": "marki__",
    "Poncle": "poncle",
    "Cosmic": "thecosmicpotato",
    "MathHacker": "mathhacker",
    "Boss": "boss219",
    "Firethief": "firethief1",
    "Nova": "novaspaghetti",
    "Freddie": "freddiestarwars",
    "Raki": "rakittv",
    "Goat": "goatjoat",
    "Simplex": "simplex_g64",
    "Plex": "plexquared",
    "Skun": "skun",
    "Isaac": "isaactayy",
    "Snoo": "snoo23",
    "Idontexist": "i.dontexist",
    "BlueXans": "bluexans",
    "Luffy": "luffy133",
    "Verdal": "verdal",
    "Wojowu": "wojowu",
    "Cork-croc": "je_ne_parle_pas_francais",
    "Tiyo": "tiyo98"
};

str = '<div id="rounds">';

let i = 1;
let p = 0;
for (let round of matchups) {
    str += '\n<div id="m' + i + '" class="matchup">';
    for (let pair of round) {
        let [p1, p2] = pair;
        let [u1, u2] = pair;
        if (p1 == "Cork-Croc") p1 = "JeNeParlePasFrancais";
        if (p2 == "Cork-Croc") p2 = "JeNeParlePasFrancais";
        let d1 = discords[u1];
        let d2 = discords[u2];
        lastif = "";
        if (p == 12) lastif = ' class="last"';
        str += '\n<div' + lastif + '>\n<div class="match-card"><a class="copyuser" data="' + d1 + '"><img src="pfps/' + p1 + '.png" class="pfp"> <span class="username">' + u1 + '</span></a>\n<br><a class="copyuser" data="' + d2 + '"><img src="pfps/' + p2 + '.png" class="pfp"> <span class="username">' + u2 + '</span></a></div>\n</div>';
        p++;
    }
    p = 0;
    str += "\n</div>"
    i++;
}
str += "\n</div>"

fs.writeFileSync("./generate.html", str, "utf-8");