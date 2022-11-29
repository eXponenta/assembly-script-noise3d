import { GRAD, initTableFromHost, initTables, TABLE } from "./constants";
import { generate } from "./noize3D";
import { generateSimd } from "./noize3Dsimd";
//import { generateSimd } from "./noize3Dsimd";

export function getTable(): StaticArray<u8> {
    return TABLE;
}

export function getGrad(): StaticArray<f32> {
    return GRAD;
}

let preallocatedResult: Float32Array;

export function init(ms: u32): void {
    initTables();

    preallocatedResult = new Float32Array(ms);
}

export function initWithTable(table: Uint8Array, ms: u32): void {
    initTableFromHost(table);

    preallocatedResult = new Float32Array(ms);
}

export function getPreallocPtr(): usize {
    return changetype<usize>(preallocatedResult);
}

export function getSampleAtPoint(x: f32, y: f32, z: f32, simd: bool): f32 {
    const res = new Float32Array(1);

    if (simd) {
        generateSimd(x, y, z, 1, 1, res, 0);
    } else {
        generate(x, y, z, 1, 1, res, 0);
    }

    return res[0];
}

export function getSamplesAtBlock(
    ox: i32, oy: i32, oz: i32,
    sx: u32, sy: u32, sz: u32,

    scale: f32,

    simd: bool,
): usize {
    const count = sx * sy * sz;

    let res = preallocatedResult;
    if (preallocatedResult.length <= i32(count)) {
        res = new Float32Array(count);
    }

    let y: u32 = 0;
    let z: u32 = 0;
    let index: u32 = 0;

    for(z = 0; z < sz; z ++) {
        for(y = 0; y < sy; y ++) {
            if (simd) {
                generateSimd(
                    f32(ox) * scale,
                    f32(y + oy) * scale,
                    f32(z + oz) * scale,
                    scale,  
                    sx, 
                    res, index
                );

                index += sx;
            } else {
                generate(
                    f32(ox) * scale,
                    f32(y + oy) * scale,
                    f32(z + oz) * scale,
                    scale,  
                    sx, 
                    res, index
                );

                index += sx;
            }
        }
    }

    return changetype<usize>(res);
}