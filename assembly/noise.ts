export class Noise {
    public maxSize: u32 = 0;

    public buffer: StaticArray<f32>;

    constructor(maxSize: u32) {
        this.buffer = new StaticArray<f32>(maxSize);
    }

    getAll(): StaticArray<f32> {
        return this.buffer;
    }
}

export function createNoiseInstance (size: u32): Noise {
    return new Noise(size);
}

export function getAll(instance: Noise): StaticArray<f32> {
    return instance.getAll();
}

export function dispose(instance: Noise): void {
    //   
}