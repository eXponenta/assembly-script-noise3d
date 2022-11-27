/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/noize3D/index/init
 * @param ms `u32`
 */
export declare function init(ms: number): void;
/**
 * assembly/noize3D/index/initWithTable
 * @param table `~lib/typedarray/Uint8Array`
 * @param ms `u32`
 */
export declare function initWithTable(table: Uint8Array, ms: number): void;
/**
 * assembly/noize3D/index/getSampleAtPoint
 * @param x `f32`
 * @param y `f32`
 * @param z `f32`
 * @param simd `bool`
 * @returns `f32`
 */
export declare function getSampleAtPoint(x: number, y: number, z: number, simd: boolean): number;
/**
 * assembly/noize3D/index/getTable
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function getTable(): ArrayLike<number>;
/**
 * assembly/noize3D/index/getGrad
 * @returns `~lib/staticarray/StaticArray<f32>`
 */
export declare function getGrad(): ArrayLike<number>;
/**
 * assembly/noize3D/index/getSamplesAtBlock
 * @param ox `i32`
 * @param oy `i32`
 * @param oz `i32`
 * @param sx `u32`
 * @param sy `u32`
 * @param sz `u32`
 * @param scale `f32`
 * @param simd `bool`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function getSamplesAtBlock(ox: number, oy: number, oz: number, sx: number, sy: number, sz: number, scale: number, simd: boolean): Float32Array;
