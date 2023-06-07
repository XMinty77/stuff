import * as id3 from "./id3js/id3.js";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const model = (() => {
    return {
        getEntries(file, options) {
            return (new zip.ZipReader(new zip.BlobReader(file))).getEntries(options);
        },
        async getBlob(entry, options) {
            return await entry.getData(new zip.BlobWriter(), options);
        },
        async getURL(entry, options) {
            return URL.createObjectURL(await entry.getData(new zip.BlobWriter(), options));
        }
    };
})();

let dataURLs = [];
let dataID3s = [];
let sortedDataURLs = [];
let sortedDataID3s = [];
let current = 0;
let score = 0;
let guessStart = 0;
let guessIntv = 0;

/**
 * @type {HTMLAudioElement}
 */
const audio = document.getElementById("audio");

/**
 * @type {HTMLInputElement}
 */
const fileInput = document.getElementById("upload");
/**
 * @type {HTMLInputElement}
 */
const rngInput = document.getElementById("rng");
/**
 * @type {HTMLInputElement}
 */
const volumeInput = document.getElementById("volume");
/**
 * @type {HTMLInputElement}
 */
const guessInput = document.getElementById("guess");

fileInput.addEventListener("change", reload);
volumeInput.addEventListener("input", () => audio.volume = Number(volumeInput.value) / 100);
(() => audio.volume = Number(volumeInput.value) / 100)();
guessInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") revealButton.click();
});
rngInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") seedButton.click();
});

/**
 * @type {HTMLButtonElement}
 */
const startButton = document.getElementById("randomize");
/**
 * @type {HTMLButtonElement}
 */
const revealButton = document.getElementById("reveal");
/**
 * @type {HTMLButtonElement}
 */
const scoreAddButton = document.getElementById("scoreAdd");
/**
 * @type {HTMLButtonElement}
 */
const scoreRemButton = document.getElementById("scoreRem");
/**
 * @type {HTMLButtonElement}
 */
const playButton = document.getElementById("play");
/**
 * @type {HTMLButtonElement}
 */
const pauseButton = document.getElementById("pause");
/**
 * @type {HTMLButtonElement}
 */
const seedButton = document.getElementById("doseed");

startButton.addEventListener("click", randomize);
revealButton.addEventListener("click", reveal);
scoreAddButton.addEventListener("click", () => scoreSpan.innerText = (++score).toString());
scoreRemButton.addEventListener("click", () => scoreSpan.innerText = (--score).toString());
playButton.addEventListener("click", () => audio.play());
pauseButton.addEventListener("click", () => audio.pause());
seedButton.addEventListener("click", seed);

/**
 * @type {HTMLSpanElement}
 */
const timeSpan = document.getElementById("time");
/**
 * @type {HTMLSpanElement}
 */
const answerSpan = document.getElementById("answer");
/**
 * @type {HTMLSpanElement}
 */
const scoreSpan = document.getElementById("score");
/**
 * @type {HTMLSpanElement}
 */
const statusSpan = document.getElementById("status");

reload();

async function reload() {
    statusSpan.innerText = "Not loaded";
    if (fileInput.files.length == 0) return;
    statusSpan.innerText = "Loading";
    let file = fileInput.files[0];
    let entries = await model.getEntries(file);
    statusSpan.innerText = "Loading (0/" + entries.length + ")";
    dataURLs = [];
    dataID3s = [];
    let count = 0;
    for (const entry of entries) {
        let blob = await model.getBlob(entry);
        dataURLs.push(URL.createObjectURL(blob));
        dataID3s.push({ title: entry.filename.substring(37).replace(".mp3", "") });
        statusSpan.innerText = "Loading (" + (++count).toString() + "/" + entries.length + ")";
    }
    window.URLS = dataURLs;
    window.ID3S = dataID3s;

    score = 0;
    statusSpan.innerText = "Randomizing";
    seed(false);
    statusSpan.innerText = "Loaded";
}

function getrng(max) {
    return Math.floor(Math.random() * max);
}

function seed(doAlert = true) {
    Math.seedrandom(rngInput.value);
    let str = "";
    for (let i = 0; i < 10; i++) {
        str += alphabet[getrng(alphabet.length)];
    }
    sortedDataURLs = [];
    sortedDataID3s = [];
    let copyDataURLs = structuredClone(dataURLs);
    let copyDataID3s = structuredClone(dataID3s);
    for (let i = 0; i < dataURLs.length; i++) {
        let rem = getrng(copyDataURLs.length);
        sortedDataURLs.push(copyDataURLs[rem]);
        sortedDataID3s.push(copyDataID3s[rem]);
        copyDataURLs.splice(rem, 1);
        copyDataID3s.splice(rem, 1);
    }

    window.RNG = sortedDataID3s.map(x => x.title);
    if (doAlert) alert(str);
}

function randomize() {
    current = (current + 1) % sortedDataURLs.length;
    audio.src = sortedDataURLs[current];
    audio.play();
    guessStart = performance.now();
    clearInterval(guessIntv);
    guessIntv = setInterval(updateTime, 50);
    updateTime();
    answerSpan.innerText = "";
    guessInput.disabled = false;
    guessInput.value = "";
    guessInput.focus();
    setTimeout(() => guessInput.focus(), 10);
}

function updateTime() {
    timeSpan.innerText = ((performance.now() - guessStart) / 1000).toFixed(3) + "s";
}

function reveal() {
    clearInterval(guessIntv);
    answerSpan.innerText = sortedDataID3s[current].title;
    guessInput.disabled = true;
    startButton.focus();
    drawImage();
}

async function drawImage() {
    const marginx = 30;
    const marginy = 50;
    const spacey = 10;
    const fontsize = 40;
    let txt = [
        "Guess: " + guessInput.value,
        "Time: " + timeSpan.innerText,
        "Answer: " + sortedDataID3s[current].title
    ];
    let cvs = new OffscreenCanvas(100, fontsize * 2 * 3 + marginy * 2 /*+ spacey * (txt.length - 1)*/);
    let ctx = cvs.getContext("2d");
    ctx.font = "bold " + fontsize + "px serif";
    let measures = txt.map(str => ctx.measureText(str));
    let widest = measures.map(elem => elem.width).reduce((x, y) => Math.max(x, y));
    cvs.width = widest + marginx * 2;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    ctx.fillStyle = "black";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.font = "bold " + fontsize + "px serif";
    txt.forEach((x, i) => ctx.fillText(x, marginx, marginy + i * fontsize * 2 /*+ Math.max(0, (i - 1)) * spacey*/, widest));

    let blob = await cvs.convertToBlob();
    if (!!globalThis.ClipboardItem) {
        navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);
    }// else window.open(URL.createObjectURL(blob), "_blank");
}