const fs = require("fs");
var matchups = require("./generate.json");

str = '<div id="rounds">';

let i = 1;
let p = 0;
for (let round of matchups) {
    str += '\n<div id="m' + i + '" class="matchup">';
    for (let pair of round) {
        let [p1, p2] = pair;
        let [u1, u2] = pair;
        if (u1 == "Burnt") u1 = "BurntFlightlessBird";
        lastif = "";
        if (p == 12) lastif = ' class="last"';
        str += '\n<div' + lastif + '><img src="pfps/' + p1 + '.png" class="pfp"> <span class="username">' + u1 + '</span>\n<br><img src="pfps/' + p2 + '.png" class="pfp"> <span class="username">' + u2 + '</span></div>';
        p++
    }
    p = 0;
    str += "\n</div>"
    i++;
}
str += "\n</div>"

fs.writeFileSync("./generate.html", str, "utf-8");