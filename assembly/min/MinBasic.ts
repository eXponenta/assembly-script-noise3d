export function MinBasic(data: Float32Array): f32 {
    let mf: f32 = f32(Number.MAX_VALUE);

    for(let i = 0; i < data.length; i ++) {
        const f = unchecked(data[i]);
        mf = min<f32>(f, mf);
    }

    return mf;
}
