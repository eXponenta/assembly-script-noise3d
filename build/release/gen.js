async function instantiate(module, imports = {}) {
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
        })();
      },
      seed() {
        // ~lib/builtins/seed() => f64
        return (() => {
          // @external.js
          return Date.now() * Math.random();
        })();
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    initWithTable(table, ms) {
      // assembly/noize3D/index/initWithTable(~lib/typedarray/Uint8Array, u32) => void
      table = __lowerTypedArray(Uint8Array, 7, 0, table) || __notnull();
      exports.initWithTable(table, ms);
    },
    getSampleAtPoint(x, y, z, simd) {
      // assembly/noize3D/index/getSampleAtPoint(f32, f32, f32, bool) => f32
      simd = simd ? 1 : 0;
      return exports.getSampleAtPoint(x, y, z, simd);
    },
    getSamplesAtBlock(ox, oy, oz, sx, sy, sz, scale, simd) {
      // assembly/noize3D/index/getSamplesAtBlock(i32, i32, i32, u32, u32, u32, f32, bool) => usize
      simd = simd ? 1 : 0;
      return exports.getSamplesAtBlock(ox, oy, oz, sx, sy, sz, scale, simd) >>> 0;
    },
    getPreallocPtr() {
      // assembly/noize3D/index/getPreallocPtr() => usize
      return exports.getPreallocPtr() >>> 0;
    },
  }, exports);
  function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __lowerTypedArray(constructor, id, align, values) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, 1)) >>> 0,
      header = exports.__new(12, id) >>> 0,
      memoryU32 = new Uint32Array(memory.buffer);
    memoryU32[header + 0 >>> 2] = buffer;
    memoryU32[header + 4 >>> 2] = buffer;
    memoryU32[header + 8 >>> 2] = length << align;
    new constructor(memory.buffer, buffer, length).set(values);
    exports.__unpin(buffer);
    return header;
  }
  function __notnull() {
    throw TypeError("value must not be null");
  }
  return adaptedExports;
}
export const {
  memory,
  init,
  initWithTable,
  getSampleAtPoint,
  getSamplesAtBlock,
  getPreallocPtr
} = await (async url => instantiate(
  await (async () => {
    try { return await globalThis.WebAssembly.compileStreaming(globalThis.fetch(url)); }
    catch { return globalThis.WebAssembly.compile(await (await import("node:fs/promises")).readFile(url)); }
  })(), {
  }
))(new URL("gen.wasm", import.meta.url));
