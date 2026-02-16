// ============================================================
// Dungeon Cracker — Web Worker
// Each worker loads its own WASM instance and processes a
// range of depth-0 branches.
// ============================================================

// We use importScripts-style loading since workers can't use ES modules
// in all browsers. Instead we use the synchronous init from wasm-pack.

let wasm = null;
let wasmModule = null;

// The worker receives messages:
//   { type: 'init', wasmUrl: '...' }
//   { type: 'prepare', params: { ... } }
//   { type: 'crack', params: { ..., branchStart, branchEnd } }

self.onmessage = async function(e) {
    const msg = e.data;

    if (msg.type === 'init') {
        try {
            // Fetch and compile the WASM module
            const response = await fetch(msg.wasmUrl);
            const bytes = await response.arrayBuffer();
            wasmModule = await WebAssembly.compile(bytes);

            // Import the JS glue — we need to use dynamic import
            const glue = await import('./dungeon_cracker.js');
            wasm = glue;
            await glue.default(wasmModule);

            self.postMessage({ type: 'init_done' });
        } catch (err) {
            self.postMessage({ type: 'error', error: `Init failed: ${err}` });
        }
        return;
    }

    if (msg.type === 'prepare') {
        try {
            const p = msg.params;
            const jsonStr = wasm.prepare_crack_wasm(
                p.spawnerX, p.spawnerY, p.spawnerZ,
                p.version, p.biome, p.floorSize,
                new Uint8Array(p.floorGrid)
            );
            const result = JSON.parse(jsonStr);
            self.postMessage({ type: 'prepare_done', result });
        } catch (err) {
            self.postMessage({ type: 'error', error: `Prepare failed: ${err}` });
        }
        return;
    }

    if (msg.type === 'crack') {
        try {
            const p = msg.params;
            const jsonStr = wasm.crack_dungeon_partial_wasm(
                p.spawnerX, p.spawnerY, p.spawnerZ,
                p.version, p.biome, p.floorSize,
                new Uint8Array(p.floorGrid),
                p.branchStart, p.branchEnd
            );
            const result = JSON.parse(jsonStr);
            self.postMessage({
                type: 'crack_done',
                result,
                branchStart: p.branchStart,
                branchEnd: p.branchEnd
            });
        } catch (err) {
            self.postMessage({ type: 'error', error: `Crack failed: ${err}` });
        }
        return;
    }
};
