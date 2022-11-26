export function MinBits(data: Float32Array): f32 {
    let mf: f32 = f32(Number.MAX_VALUE);

    for(let i = 0; i < data.length; i ++) {
        const f = unchecked(data[i]);
        const b = u32(-u32(f > mf));

        const f_i32: i32 = reinterpret<i32>(f);
        const mf_i32: i32 = reinterpret<i32>(mf);

        mf = reinterpret<f32>((b & mf_i32) | (~b & f_i32));
    }

    return mf;
}
