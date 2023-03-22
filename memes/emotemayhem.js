const fs = require("fs");
let arr = [];
let entries = fs.readdirSync("D:/Developer/Projects/celestetools/memes/emotemayhem", { withFileTypes: true });

for (const entry of entries) {
	arr.push(entry.name);
}

fs.writeFileSync("D:/Developer/Projects/celestetools/memes/emotemayhem.json", JSON.stringify(arr));