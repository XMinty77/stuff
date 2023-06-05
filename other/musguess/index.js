import * as id3 from "./id3js/id3.js";

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
rngInput.addEventListener("change", seed);
volumeInput.addEventListener("change", () => audio.volume = Number(volumeInput.value) / 100);
guessInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") revealButton.click();
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

startButton.addEventListener("click", randomize);
revealButton.addEventListener("click", reveal);
scoreAddButton.addEventListener("click", () => scoreSpan.innerText = (++score).toString());
scoreRemButton.addEventListener("click", () => scoreSpan.innerText = (--score).toString());
playButton.addEventListener("click", () => audio.play());
pauseButton.addEventListener("click", () => audio.pause());

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

reload();
seed();

async function reload() {
    let file = fileInput.files[0];
    let entries = await model.getEntries(file);
    dataURLs = [];
    dataID3s = [];
    for (const entry of entries) {
        let blob = await model.getBlob(entry);
        dataURLs.push(URL.createObjectURL(blob));
        dataID3s.push(await id3.fromFile(new File([blob], "music.mp3")));
    }
    window.URLS = dataURLs;
    window.ID3S = dataID3s;

    score = 0;
}

function seed() {
    Math.seedrandom(rngInput.value);
}

function randomize() {
    current = Math.floor(Math.random() * dataURLs.length);
    audio.src = dataURLs[current];
    audio.play();
    guessStart = performance.now();
    clearInterval(guessIntv);
    guessIntv = setInterval(updateTime, 50);
    updateTime();
    answerSpan.innerText = "";
    guessInput.disabled = false;
}

function updateTime() {
    timeSpan.innerText = ((performance.now() - guessStart) / 1000).toFixed(3) + "s";
}

function reveal() {
    clearInterval(guessIntv);
    answerSpan.innerText = dataID3s[current].title;
    guessInput.disabled = true;
}