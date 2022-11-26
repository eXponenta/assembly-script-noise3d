import { INoize } from "./INoize";

export class SimdNoise extends INoize {
    getAll(): StaticArray<f32> {
        return this.buffer;
    }

    generate(
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

    }

    generateFixed(posX: u32, posY: u32, posZ: u32, step: u32, count: u32): void {
        this.generate(
            posX, posY, posZ,
            step, step, step,
            count, count, count
        );
    }
}