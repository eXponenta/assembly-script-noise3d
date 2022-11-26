export abstract class INoize {
    public maxSize: u32;
    public buffer: StaticArray<f32>;

    constructor(maxSize: u32) {
        this.maxSize = maxSize;
        this.buffer = new StaticArray(maxSize);
    }

    abstract getAll(): StaticArray<f32>;

    abstract generate(
        posX: u32,
        posY: u32,
        posZ: u32,
        stepX: u32, 
        stepY: u32,
        stepZ: u32,
        countX: u32,
        countY: u32,
        countZ: u32
    ): void;

    abstract generateFixed(posX: u32, posY: u32, posZ: u32, step: u32, count: u32): void;
}