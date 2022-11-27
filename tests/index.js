import { initWithTable, getSampleAtPoint, getTable, getGrad, getSamplesAtBlock } from "../build/release/gen.js";
import { createNoise3D, buildPermutationTable } from 'simplex-noise'

const RND_TABLE = buildPermutationTable(Math.random);

const getFixedRandom = () => {
    let index = 0;

    return () => RND_TABLE[(index++) % RND_TABLE.length] / 255;
}

// with this we can generate same table
const getSampleAtPoint_js = createNoise3D(getFixedRandom());

// again gen a table how in noise
const table = buildPermutationTable(getFixedRandom());

initWithTable(table, 200 * 200 * 200);

const tmpF32 = new Float32Array([0]);

const testError = (x, y, z) => {
    const a = getSampleAtPoint(x, y, z, 0);
    const tmp =  getSampleAtPoint_js(x, y, z);
    tmpF32[0] = tmp;
    const b = tmpF32[0];

    const d = Math.abs(a - b);

    const MAX_D = Math.pow(1, -5);

    console.log(`Pos: ${x}, ${y}, ${z}`, a, b, Math.floor(Math.log10(d)));

    if (d > MAX_D) {
        throw new Error(`Delta should be less ${MAX_D}, actual ${d}`);
    }
}

console.log('Test error:-------');
for(let i = 0; i < 100; i ++) {
    testError(
        Math.random() * 100 | 0,
        Math.random() * 100 | 0,
        Math.random() * 100 | 0,
    )
}

const testPerf = (func, size) => {
    const start = performance.now();

    const data = func(size);

    const delta = performance.now() - start;

    console.log(`${func.name} runs:`, delta, data[size / 2 | 0]);

    return delta;
}

const genChunkJS = (size) => {
    const data = new Float32Array(size * size * size);

    let index = 0;

    for(let x = 0; x < size; x ++) {
        for(let y = 0; y < size; y ++) {
            for(let z = 0; z < size; z ++) {
                data[index ++] = getSampleAtPoint_js(x, y, z);
            }
        }     
    }

    return data;
}

const genChunkWasmExternal = (size) => {
    const data = new Float32Array(size * size * size);

    let index = 0;

    for(let x = 0; x < size; x ++) {
        for(let y = 0; y < size; y ++) {
            for(let z = 0; z < size; z ++) {
                data[index ++] = getSampleAtPoint(x, y, z, 0);
            }
        }     
    }

    return data;
}

const genChunkJSWasm = (size) => {
    return getSamplesAtBlock(0,0,0, size, size, size, 1, 0);
}

const genChunkJSWasmSimd = (size) => {
    return getSamplesAtBlock(0,0,0, size, size, size, 1, 1);
}

const tests = {
    genChunkJS,
    genChunkWasmExternal,
    genChunkJSWasm,
    genChunkJSWasmSimd,
};


const testWithSize = (size) => {
    console.log('Test perf: ----', size);

    const res = []

    for(const key in tests) {
        res.push({
            key,
            result: testPerf(tests[key], size)
        });
    }

    res.sort((a, b) => a.result - b.result);

    console.log("Results:", res);
}


testWithSize(10);
testWithSize(50);
testWithSize(100);
testWithSize(200);
//testWithSize(400);

