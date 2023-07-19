import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { marked } from "marked";

const template = fs.readFileSync("template.html", "utf-8");

const embedRegex = /\!\[\[(?<name>[A-Za-z1-9\.]+)\]\]/g;

const readdirOpts = {
    withFileTypes: true
};
const res = fs.readdirSync(".", readdirOpts);

parseFiles(res);

/**
 * parse files recursively
 * @param {fs.Dirent[]} entries 
 */
async function parseFiles(entries, dir = ".") {
    for (const entry of entries) {
        if (entry.isDirectory() && entry.name.toLowerCase() != "node_modules") {
            let subdir = path.join(dir, entry.name);
            let recRes = await fsp.readdir(subdir, readdirOpts);
            await parseFiles(recRes, subdir);
            continue;
        }
        if (entry.name.endsWith(".md")) {
            let filepath = path.join(dir, entry.name);
            let outputpath = filepath.substring(0, filepath.length - 2) + "html";
            let contents = await fsp.readFile(filepath, "utf-8");
            let html = template.replace("MARKDOWN_GOES_HERE", marked(replaceEmbeds(contents)));
            await fsp.writeFile(outputpath, html, "utf-8");
        }
    }
}

function replaceEmbeds(markdown) {
    let output = "";
    let match;
    let last = 0;
    while ((match = embedRegex.exec(markdown)) != null) {
        let start = match.index;
        let end = start + match[0].length;
        let name = match.groups["name"];
        output += markdown.substring(last, start);
        let embed;
        if (name.substring(name.lastIndexOf(".") + 1).toLowerCase() == "mp4") {
            embed = '<br><video src="' + name + '" controls></video><br>';
        } else {
            embed = '<br><img src="' + name + '"><br>';
        }
        output += embed;
        last = end;
    }
    return output;
}