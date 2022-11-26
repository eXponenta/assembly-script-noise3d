import assert from "assert";
import { MinBasic, MinBits, MinSimd} from "../build/release/gen.js";

const data = new Float32Array(100_000 + 3).map((_, i) => Math.random() * 10000.0);

const test = (func, data) => {
    const start = performance.now();

    let res = 0;

    for(let i = 0; i < 1000; i ++) {
        res += func(data);
    }

    res /= 1000;

    const time = performance.now() - start;

    console.log(func.name, res, time);
}

const MinMath = (data) => {
    let mf = Number.MAX_VALUE;

    for(let i = 0; i < data.length; i ++) {
        const f = data[i];
        if (mf > f) {
            mf = f;
        }
    }

    return mf;
}

test(MinMath, data);

test(MinBasic, data);

test(MinBits, data);

test(MinSimd, data);

