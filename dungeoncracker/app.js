// ============================================================
// Dungeon Cracker — Web GUI
// Uses Web Workers for non-blocking parallel computation.
// ============================================================

// We still import init + prepare_crack_wasm on the main thread
// for the lightweight "prepare" step. Heavy work goes to workers.
import init, { prepare_crack_wasm } from './dungeon_cracker.js';

// ----- Tile definitions -----
// Index order matches Java: 0=mossy, 1=cobble, 2=air, 3=unknown, 4=unknown_solid
const TILE_NAMES  = ['mossy', 'cobble', 'air', 'unknown', 'unknown_solid'];
const TILE_IMAGES = TILE_NAMES.map(n => `assets/${n}.png`);
const TILE_COUNT  = TILE_NAMES.length;

// ----- Floor sizes -----
const FLOOR_SIZES = [
    { label: '9 by 9', key: '9x9', xMin: 0, zMin: 0, xMax: 9, zMax: 9 },
    { label: '7 by 9', key: '7x9', xMin: 1, zMin: 0, xMax: 8, zMax: 9 },
    { label: '9 by 7', key: '9x7', xMin: 0, zMin: 1, xMax: 9, zMax: 8 },
    { label: '7 by 7', key: '7x7', xMin: 1, zMin: 1, xMax: 8, zMax: 8 },
];
let floorSizeIndex = 0;

// ----- State -----
const floorData = Array.from({ length: 9 }, () => new Uint8Array(9).fill(4));

let wasmReady  = false;
let running    = false;
let lastResult = null;

// Worker pool
const NUM_WORKERS = Math.max(1, navigator.hardwareConcurrency || 4);
let workers = [];
let workersReady = 0;

// ----- DOM refs -----
const gridEl       = document.getElementById('floor-grid');
const btnFloorSize = document.getElementById('btn-floor-size');
const btnClear     = document.getElementById('btn-clear-floor');
const btnCrack     = document.getElementById('btn-crack');
const statusSection = document.getElementById('status-section');
const statusText    = document.getElementById('status-text');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressBar   = document.getElementById('progress-bar');
const resultsSection = document.getElementById('results-section');

// ----- Build floor grid -----
const cells = [];

for (let z = 0; z < 9; z++) {
    cells[z] = [];
    for (let x = 0; x < 9; x++) {
        const cell = document.createElement('div');
        cell.className = 'floor-cell';
        cell.innerHTML = `<img src="${TILE_IMAGES[4]}" alt="">`;
        cell.dataset.z = z;
        cell.dataset.x = x;

        cell.addEventListener('click', (e) => {
            e.preventDefault();
            cycleCell(z, x, 1);
        });
        cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            cycleCell(z, x, -1);
        });

        gridEl.appendChild(cell);
        cells[z][x] = cell;
    }
}

function cycleCell(z, x, dir) {
    const cur = floorData[z][x];
    const next = ((cur + dir) % TILE_COUNT + TILE_COUNT) % TILE_COUNT;
    floorData[z][x] = next;
    cells[z][x].querySelector('img').src = TILE_IMAGES[next];
}

// ----- Floor size -----
function updateFloorSize() {
    const fs = FLOOR_SIZES[floorSizeIndex];
    btnFloorSize.textContent = `Floor Size: ${fs.label}`;
    for (let z = 0; z < 9; z++) {
        for (let x = 0; x < 9; x++) {
            const visible = x >= fs.xMin && x < fs.xMax && z >= fs.zMin && z < fs.zMax;
            cells[z][x].classList.toggle('hidden', !visible);
        }
    }
}

btnFloorSize.addEventListener('click', () => {
    floorSizeIndex = (floorSizeIndex + 1) % FLOOR_SIZES.length;
    updateFloorSize();
});
updateFloorSize();

// ----- Clear floor -----
btnClear.addEventListener('click', () => {
    for (let z = 0; z < 9; z++) {
        for (let x = 0; x < 9; x++) {
            floorData[z][x] = 4;
            cells[z][x].querySelector('img').src = TILE_IMAGES[4];
        }
    }
    floorSizeIndex = 0;
    updateFloorSize();
});

// ----- Validate inputs -----
function validateInputs() {
    const x = document.getElementById('spawner-x').value.trim();
    const y = document.getElementById('spawner-y').value.trim();
    const z = document.getElementById('spawner-z').value.trim();
    const valid = x !== '' && y !== '' && z !== '' &&
                  !isNaN(parseInt(x)) && !isNaN(parseInt(y)) && !isNaN(parseInt(z));
    btnCrack.disabled = !valid || !wasmReady || running;
}

document.getElementById('spawner-x').addEventListener('input', validateInputs);
document.getElementById('spawner-y').addEventListener('input', validateInputs);
document.getElementById('spawner-z').addEventListener('input', validateInputs);

// ----- Init WASM (main thread for prepare) + Workers -----
async function initAll() {
    statusSection.style.display = '';
    statusText.textContent = `Loading WASM module + spawning ${NUM_WORKERS} worker(s)...`;

    try {
        // Init main-thread WASM (for prepare step)
        await init();

        // Spawn workers
        const wasmUrl = new URL('dungeon_cracker_bg.wasm', location.href).href;

        const workerPromises = [];
        for (let i = 0; i < NUM_WORKERS; i++) {
            const w = new Worker('worker.js', { type: 'module' });
            workers.push(w);
            workerPromises.push(new Promise((resolve, reject) => {
                w.onmessage = (e) => {
                    if (e.data.type === 'init_done') resolve();
                    else if (e.data.type === 'error') reject(new Error(e.data.error));
                };
                w.postMessage({ type: 'init', wasmUrl });
            }));
        }

        await Promise.all(workerPromises);

        wasmReady = true;
        statusText.textContent = `Ready. ${NUM_WORKERS} worker(s) available.`;
        validateInputs();
    } catch (e) {
        statusText.textContent = `Init error: ${e}`;
        console.error(e);
    }
}

initAll();

// ----- Crack -----
btnCrack.addEventListener('click', () => {
    if (running) return;
    startCrack();
});

async function startCrack() {
    const sx = parseInt(document.getElementById('spawner-x').value.trim());
    const sy = parseInt(document.getElementById('spawner-y').value.trim());
    const sz = parseInt(document.getElementById('spawner-z').value.trim());
    const version = document.getElementById('mc-version').value;
    const biome   = document.getElementById('biome').value;
    const fs      = FLOOR_SIZES[floorSizeIndex];

    const flatGrid = new Uint8Array(81);
    for (let z = 0; z < 9; z++) {
        for (let x = 0; x < 9; x++) {
            flatGrid[z * 9 + x] = floorData[z][x];
        }
    }

    running = true;
    btnCrack.textContent = 'Running...';
    btnCrack.classList.add('running');
    btnCrack.disabled = true;
    statusSection.style.display = '';
    resultsSection.style.display = 'none';
    progressBarContainer.style.display = '';
    progressBar.style.width = '0%';

    const t0 = performance.now();

    try {
        // Step 1: Prepare (main thread — fast: parse + LLL + get branch count)
        statusText.textContent = 'Preparing (parsing floor, LLL reduction)...';
        await sleep(10); // yield for UI update

        const prepJson = prepare_crack_wasm(sx, sy, sz, version, biome, fs.key, flatGrid);
        const prep = JSON.parse(prepJson);

        if (prep.error) {
            throw new Error(prep.error);
        }

        const totalBranches = prep.total_branches;
        statusText.textContent = `Prepared: ${prep.dimensions} dims, ${totalBranches} branches, ${prep.info_bits.toFixed(1)} info bits.\nDispatching to ${NUM_WORKERS} worker(s)...`;
        await sleep(10);

        // Step 2: Split branches across workers
        const params = {
            spawnerX: sx, spawnerY: sy, spawnerZ: sz,
            version, biome, floorSize: fs.key,
            floorGrid: Array.from(flatGrid), // plain array for postMessage
        };

        const mergedResult = {
            dungeon_seeds: new Set(),
            structure_seeds: new Set(),
            world_seeds: new Set(),
        };

        if (totalBranches === 0) {
            // No branches — no seeds
            statusText.textContent = 'No valid branches found (0 lattice candidates).';
        } else {
            // Distribute branches: each worker gets ceil(total / numWorkers) branches
            const numWorkers = Math.min(NUM_WORKERS, totalBranches);
            const branchesPerWorker = Math.ceil(totalBranches / numWorkers);
            let completedWorkers = 0;
            let completedBranches = 0;

            const workerPromises = [];
            for (let i = 0; i < numWorkers; i++) {
                const branchStart = i * branchesPerWorker;
                const branchEnd = Math.min(branchStart + branchesPerWorker, totalBranches);

                if (branchStart >= totalBranches) break;

                workerPromises.push(new Promise((resolve, reject) => {
                    const w = workers[i];
                    w.onmessage = (e) => {
                        const msg = e.data;
                        if (msg.type === 'crack_done') {
                            if (msg.result.error) {
                                reject(new Error(msg.result.error));
                                return;
                            }
                            // Merge results
                            for (const s of msg.result.dungeon_seeds)   mergedResult.dungeon_seeds.add(s);
                            for (const s of msg.result.structure_seeds) mergedResult.structure_seeds.add(s);
                            for (const s of msg.result.world_seeds)     mergedResult.world_seeds.add(s);

                            completedWorkers++;
                            completedBranches += (msg.branchEnd - msg.branchStart);
                            const pct = Math.round(100 * completedBranches / totalBranches);
                            progressBar.style.width = pct + '%';
                            statusText.textContent =
                                `Worker ${completedWorkers}/${numWorkers} done. ` +
                                `Branches: ${completedBranches}/${totalBranches} (${pct}%)\n` +
                                `Found so far: ${mergedResult.dungeon_seeds.size} dungeon, ` +
                                `${mergedResult.structure_seeds.size} structure, ` +
                                `${mergedResult.world_seeds.size} world seeds`;
                            resolve();
                        } else if (msg.type === 'error') {
                            reject(new Error(msg.error));
                        }
                    };

                    w.postMessage({
                        type: 'crack',
                        params: { ...params, branchStart, branchEnd }
                    });
                }));
            }

            await Promise.all(workerPromises);
        }

        const elapsed = ((performance.now() - t0) / 1000).toFixed(2);

        lastResult = {
            dungeon_seeds: [...mergedResult.dungeon_seeds],
            structure_seeds: [...mergedResult.structure_seeds],
            world_seeds: [...mergedResult.world_seeds],
        };

        progressBar.style.width = '100%';
        statusText.textContent = `Done in ${elapsed}s using ${Math.min(NUM_WORKERS, totalBranches || 1)} worker(s).\n` +
            `Found ${lastResult.dungeon_seeds.length} dungeon, ` +
            `${lastResult.structure_seeds.length} structure, ` +
            `${lastResult.world_seeds.length} world seeds.`;
        showResults(lastResult);

    } catch (e) {
        const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
        statusText.textContent = `Error: ${e}\nTime: ${elapsed}s`;
        console.error(e);
    } finally {
        running = false;
        btnCrack.textContent = 'Crack Seed';
        btnCrack.classList.remove('running');
        validateInputs();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ----- Results display -----
function showResults(result) {
    resultsSection.style.display = '';
    document.getElementById('dungeon-count').textContent   = result.dungeon_seeds.length;
    document.getElementById('structure-count').textContent  = result.structure_seeds.length;
    document.getElementById('world-count').textContent      = result.world_seeds.length;
    document.getElementById('dungeon-seeds').value   = result.dungeon_seeds.join('\n');
    document.getElementById('structure-seeds').value  = result.structure_seeds.join('\n');
    document.getElementById('world-seeds').value      = result.world_seeds.join('\n');
}

// ----- Copy seeds -----
window.copySeeds = function(type) {
    if (!lastResult) return;
    let seeds;
    if (type === 'dungeon')   seeds = lastResult.dungeon_seeds;
    if (type === 'structure') seeds = lastResult.structure_seeds;
    if (type === 'world')     seeds = lastResult.world_seeds;
    if (seeds) {
        navigator.clipboard.writeText(seeds.join('\n')).catch(err => console.error('Copy failed', err));
    }
};

// ----- Save results -----
window.saveResults = function() {
    if (!lastResult) return;
    let text = 'Dungeon Seeds:\n\n';
    text += lastResult.dungeon_seeds.join('\n') + '\n';
    text += '\nStructure Seeds:\n\n';
    text += lastResult.structure_seeds.join('\n') + '\n';
    text += '\nWorld Seeds:\n\n';
    text += lastResult.world_seeds.join('\n') + '\n';

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dungeon_cracker_results.txt';
    a.click();
    URL.revokeObjectURL(url);
};
