/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/noise/createNoiseInstance
 * @param size `u32`
 * @returns `assembly/impl/INoize/INoize`
 */
export declare function createNoiseInstance(size: number): __Internref4;
/**
 * assembly/noise/getAll
 * @param instance `assembly/impl/INoize/INoize`
 * @returns `~lib/staticarray/StaticArray<f32>`
 */
export declare function getAll(instance: __Internref4): ArrayLike<number>;
/**
 * assembly/noise/dispose
 * @param instance `assembly/impl/INoize/INoize`
 */
export declare function dispose(instance: __Internref4): void;
/**
 * assembly/min/MinBasic/MinBasic
 * @param data `~lib/typedarray/Float32Array`
 * @returns `f32`
 */
export declare function MinBasic(data: Float32Array): number;
/**
 * assembly/min/MinBits/MinBits
 * @param data `~lib/typedarray/Float32Array`
 * @returns `f32`
 */
export declare function MinBits(data: Float32Array): number;
/**
 * assembly/min/MinSimd/MinSimd
 * @param data `~lib/typedarray/Float32Array`
 * @returns `f32`
 */
export declare function MinSimd(data: Float32Array): number;
/** assembly/impl/INoize/INoize */
declare class __Internref4 extends Number {
  private __nominal4: symbol;
  private __nominal0: symbol;
}
