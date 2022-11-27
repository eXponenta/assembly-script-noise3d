export const F3: f32 = 1.0 / 3.0;
export const G3: f32 = 1.0 / 6.0;
export const G3_2: f32 = G3 * 2.0;
export const G3_3: f32 = G3 * 3.0;

export const grad3: StaticArray<f32> = [
    1, 1, 0,
    -1, 1, 0,
    1, -1, 0,

    -1, -1, 0,
    1, 0, 1,
    -1, 0, 1,

    1, 0, -1,
    -1, 0, -1,
    0, 1, 1,

    0, -1, 1,
    0, 1, -1,
    0, -1, -1
];

export const TABLE_SIZE: u32 = 512;

export const TABLE = new StaticArray<u8>(TABLE_SIZE);

// we use f32 for allow use simd computation
// anyway a table not contain float values
export const GRAD = new StaticArray<f32>(TABLE_SIZE * 3);

@inline export function random(): f32 {
    return <f32>Math.random();
}

export function initTableFromHost(table: Uint8Array): void {
    if (table.length !== TABLE_SIZE) {
        throw new Error("Invalid table size, MUST BE 512");
    }

    for(let i: u32 = 0; i < TABLE_SIZE; i++) {
        TABLE[i] = table[i];

        const sub = 3 * (table[i] % 12);
        const ii = i * 3;

        unchecked(GRAD[ii + 0] = grad3[sub + 0]);
        unchecked(GRAD[ii + 1] = grad3[sub + 1]);
        unchecked(GRAD[ii + 2] = grad3[sub + 2]);
    }
}

export function initTables(): void {
    const H: u32 = TABLE_SIZE >> 1;

    for (let i: u8 = 0; i < u8(H - 1); i++) {
        unchecked(TABLE[i] = i);
    }

    for (let i: u32 = 0; i < u32(H - 1); i++) {
      const r = i + u32(random() * (256.0 - f32(i)));
      const aux = unchecked(TABLE[i]);

      unchecked(TABLE[i] = TABLE[r]);
      unchecked(TABLE[r] = aux);
    }

    for (let i: u32 = 256; i < TABLE_SIZE; i++) {
        unchecked(TABLE[i] = TABLE[i - 256]);
    }

    for (let i: u32 = 0; i < TABLE_SIZE; i ++) {
        const sub = 3 * (TABLE[i] % 12);
        const ii = i * 3;

        unchecked(GRAD[ii + 0] = grad3[sub + 0]);
        unchecked(GRAD[ii + 1] = grad3[sub + 1]);
        unchecked(GRAD[ii + 2] = grad3[sub + 2]);
    }
}
