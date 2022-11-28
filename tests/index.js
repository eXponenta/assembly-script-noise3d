import { initWithTable, getSampleAtPoint, getPreallocPtr, getSamplesAtBlock, memory } from "../build/release/gen.js";
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

    const MAX_D = 0.00001//Math.pow(1, -5);

    console.log(`Pos: ${x}, ${y}, ${z}`, a, b, Math.floor(Math.log10(d)));

    if (d > MAX_D) {
        throw new Error(`Delta should be less ${MAX_D}, actual ${d}`);
    }
}

console.log('Test error:-------');
for(let i = 0; i < 100; i ++) {
    testError(
        50 - Math.random() * 100 | 0,
        50 - Math.random() * 100 | 0,
        50 - Math.random() * 100 | 0,
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
                data[index ++] = getSampleAtPoint_js(x - size, y, z);
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
                data[index ++] = getSampleAtPoint(x - size, y, z, 0);
            }
        }     
    }

    return data;
}

const liftF32 = (ptr) => {
    const memoryU32 = new Uint32Array(memory.buffer);

    return new Float32Array(
        memory.buffer,
        memoryU32[ptr + 4 >>> 2],
        memoryU32[ptr + 8 >>> 2] / 4
    )
};

const preAllocatedPtr = getPreallocPtr();
const preallocData = liftF32(preAllocatedPtr);

const genChunkJSWasm = (size) => {
    getSamplesAtBlock(-size,0,0, size, size, size, 1, 0);

    return preallocData;
}

const genChunkJSWasmSimd = (size) => {
    return getSamplesAtBlock(-size,0,0, size, size, size, 1, 1);
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


