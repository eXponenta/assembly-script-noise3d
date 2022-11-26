// The entry file of your WebAssembly module.

export function add(a: i32, b: i32): StaticArray<number> {
  return [a, b, a + b];
}
