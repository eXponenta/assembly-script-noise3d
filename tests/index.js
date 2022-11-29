import { initWithTable, getSampleAtPoint, getPreallocPtr, getSamplesAtBlock, memory } from "../build/debug/gen.js";
import { createNoise3D, buildPermutationTable } from 'simplex-noise'
import { createNoise3DOpt } from './optimizedNoise.js';

const RND_TABLE = buildPermutationTable(Math.random);

const getFixedRandom = () => {
    let index = 0;

    return () => RND_TABLE[(index++) % RND_TABLE.length] / 255;
}

// with this we can generate same table
const getSampleAtPoint_js = createNoise3D(getFixedRandom());
const getSampleAtLine_js = createNoise3DOpt(getFixedRandom());

// again gen a table how in noise
const table = buildPermutationTable(getFixedRandom());

initWithTable(table, 200 * 200 * 200);

const tmpF32 = new Float32Array([0]);

const scale = 1/12.5;

const testError = (x, y, z) => {
    const a = getSampleAtPoint(x, y, z, 1);
    const tmp =  getSampleAtPoint_js(x, y, z);
    tmpF32[0] = tmp;
    const b = tmpF32[0];

    const d = Math.abs(a - b);

    const MAX_D = 0.0001//Math.pow(1, -5);

    console.log(`Pos: ${x}, ${y}, ${z}`, a, b, Math.floor(Math.log10(d)));

    if (d > MAX_D) {
        throw new Error(`Delta should be less ${MAX_D}, actual ${d}`);
    }
}

const testErrorLine = (x0, y, z, scale, steps) => {
    let res = new Float64Array(steps);
    getSampleAtLine_js(x0, y, z, scale, steps, res, 0);
    for (let i = 0; i < steps; i++) {
        let x = x0 + i * scale;
        const a = res[i];
        const b =  getSampleAtPoint(x, y, z, 0);
        const d = Math.abs(a - b);

        const MAX_D = 0.0001//Math.pow(1, -5);

        console.log(`Pos: ${x}, ${y}, ${z}, scale ${scale}, step ${i}`, a, b, Math.floor(Math.log10(d)));
        if (d > MAX_D) {
            throw new Error(`Delta should be less ${MAX_D}, actual ${d}`);
        }
    }
}

testError(10, 3, 30);

console.log('Test error:-------');
for(let i = 0; i < 100; i ++) {
    testError(
        Math.random() * 100 | 0,
        Math.random() * 100 | 0,
        Math.random() * 100 | 0,
    )
}

/*testErrorLine(10, 3, 30, 1/12.5, 10);

console.log('Test error:-------');
for(let i = 0; i < 100; i ++) {
    testErrorLine(
        Math.random() * 100 | 0,
        Math.random() * 100 | 0,
        Math.random() * 100 | 0,
        1/12.5, 10
    )
}*/

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

    let x0 = -size;
    for(let z = 0; z < size; z ++) {
        for(let y = 0; y < size; y ++) {
            for(let x = 0; x < size; x ++) {
                data[index ++] = getSampleAtPoint_js((x + x0) * scale, y * scale, z * scale);
            }
        }     
    }

    return data;
}

const genChunkJSOpt = (size) => {
    const data = new Float64Array(size * size * size);

    let index = 0;

    let x0 = - size;
    for(let z = 0; z < size; z ++) {
        for(let y = 0; y < size; y ++) {
            getSampleAtLine_js(x0 * scale, y * scale, z * scale, scale, size, data, index);
            index += size;
        }
    }

    return data;
}

const genChunkWasmExternal = (size) => {
    const data = new Float32Array(size * size * size);

    let index = 0;
    let x0 = -size;
    for(let z = 0; z < size; z ++) {
        for(let y = 0; y < size; y ++) {
            for(let x = 0; x < size; x ++) {
                data[index ++] = getSampleAtPoint((x + x0) * scale, y * scale, z * scale, 0);
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
    getSamplesAtBlock(-size,0,0, size, size, size, scale, 0);

    return preallocData;
}

const genChunkJSWasmSimd = (size) => {
    return getSamplesAtBlock(-size,0,0, size, size, size, scale, 1);
}

const tests = {
    genChunkJS,
    genChunkJSOpt,
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


//testWithSize(10);
for(let i = 0; i < 100; i ++) {
    //testWithSize(50);
}

//testWithSize(100);
//testWithSize(200);
//testWithSize(400);


