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
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    createNoiseInstance(size) {
      // assembly/noise/createNoiseInstance(u32) => assembly/impl/INoize/INoize
      return __liftInternref(exports.createNoiseInstance(size) >>> 0);
    },
    getAll(instance) {
      // assembly/noise/getAll(assembly/impl/INoize/INoize) => ~lib/staticarray/StaticArray<f32>
      instance = __lowerInternref(instance) || __notnull();
      return __liftStaticArray(pointer => new Float32Array(memory.buffer)[pointer >>> 2], 2, exports.getAll(instance) >>> 0);
    },
    dispose(instance) {
      // assembly/noise/dispose(assembly/impl/INoize/INoize) => void
      instance = __lowerInternref(instance) || __notnull();
      exports.dispose(instance);
    },
    MinBasic(data) {
      // assembly/min/MinBasic/MinBasic(~lib/typedarray/Float32Array) => f32
      data = __lowerTypedArray(Float32Array, 7, 2, data) || __notnull();
      return exports.MinBasic(data);
    },
    MinBits(data) {
      // assembly/min/MinBits/MinBits(~lib/typedarray/Float32Array) => f32
      data = __lowerTypedArray(Float32Array, 7, 2, data) || __notnull();
      return exports.MinBits(data);
    },
    MinSimd(data) {
      // assembly/min/MinSimd/MinSimd(~lib/typedarray/Float32Array) => f32
      data = __lowerTypedArray(Float32Array, 7, 2, data) || __notnull();
      return exports.MinSimd(data);
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
  function __liftStaticArray(liftElement, align, pointer) {
    if (!pointer) return null;
    const
      length = new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> align,
      values = new Array(length);
    for (let i = 0; i < length; ++i) values[i] = liftElement(pointer + (i << align >>> 0));
    return values;
  }
  class Internref extends Number {}
  const registry = new FinalizationRegistry(__release);
  function __liftInternref(pointer) {
    if (!pointer) return null;
    const sentinel = new Internref(__retain(pointer));
    registry.register(sentinel, pointer);
    return sentinel;
  }
  function __lowerInternref(value) {
    if (value == null) return 0;
    if (value instanceof Internref) return value.valueOf();
    throw TypeError("internref expected");
  }
  const refcounts = new Map();
  function __retain(pointer) {
    if (pointer) {
      const refcount = refcounts.get(pointer);
      if (refcount) refcounts.set(pointer, refcount + 1);
      else refcounts.set(exports.__pin(pointer), 1);
    }
    return pointer;
  }
  function __release(pointer) {
    if (pointer) {
      const refcount = refcounts.get(pointer);
      if (refcount === 1) exports.__unpin(pointer), refcounts.delete(pointer);
      else if (refcount) refcounts.set(pointer, refcount - 1);
      else throw Error(`invalid refcount '${refcount}' for reference '${pointer}'`);
    }
  }
  function __notnull() {
    throw TypeError("value must not be null");
  }
  return adaptedExports;
}
export const {
  memory,
  createNoiseInstance,
  getAll,
  dispose,
  MinBasic,
  MinBits,
  MinSimd
} = await (async url => instantiate(
  await (async () => {
    try { return await globalThis.WebAssembly.compileStreaming(globalThis.fetch(url)); }
    catch { return globalThis.WebAssembly.compile(await (await import("node:fs/promises")).readFile(url)); }
  })(), {
  }
))(new URL("gen.wasm", import.meta.url));
