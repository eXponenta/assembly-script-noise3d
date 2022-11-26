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
/** assembly/impl/INoize/INoize */
declare class __Internref4 extends Number {
  private __nominal4: symbol;
  private __nominal0: symbol;
}
