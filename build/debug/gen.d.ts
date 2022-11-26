/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/noise/createNoiseInstance
 * @param size `u32`
 * @returns `assembly/noise/Noise`
 */
export declare function createNoiseInstance(size: number): __Internref4;
/**
 * assembly/noise/getAll
 * @param instance `assembly/noise/Noise`
 * @returns `~lib/staticarray/StaticArray<f32>`
 */
export declare function getAll(instance: __Internref4): ArrayLike<number>;
/**
 * assembly/noise/dispose
 * @param instance `assembly/noise/Noise`
 */
export declare function dispose(instance: __Internref4): void;
/** assembly/noise/Noise */
declare class __Internref4 extends Number {
  private __nominal4: symbol;
  private __nominal0: symbol;
}
