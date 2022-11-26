import assert from "assert";
import { createNoiseInstance, getAll } from "../build/debug/gen.js";

const instance = createNoiseInstance(1000);

console.log("ok", getAll(instance));
