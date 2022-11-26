import { INoize } from "./impl/INoize";

// non simd
import { BasicNoise } from "./impl/BasicNoize";

// simd
import { SimdNoise } from "./impl/SimdNoise";

export function createNoiseInstance (size: u32): INoize {
    // this is compile skip flags
    // code inside this block is compile time processed
    if (ASC_FEATURE_SIMD) {
        return new SimdNoise(size);
    } else {
        return new BasicNoise(size)
    }
}

export function generate(
    instance: INoize,

    posX: u32,
    posY: u32,
    posZ: u32,
    stepX: u32, 
    stepY: u32,
    stepZ: u32,
    countX: u32,
    countY: u32,
    countZ: u32
): void {
    instance.generate(
        posX, posY, posZ,
        stepX, stepY, stepZ,
        countX, countY, countZ,
    );
}

export function generateFixed(
    instance: INoize,

    posX: u32, posY: u32, posZ: u32, step: u32, count: u32
): void {
    
    instance.generateFixed(posX, posY, posZ, step, count);
}

export function getAll(instance: INoize): StaticArray<f32> {

    return instance.getAll();
}

export function dispose(instance: INoize): void {
    //   
}