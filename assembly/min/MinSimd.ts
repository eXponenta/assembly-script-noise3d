export function MinSimd(data: Float32Array): f32 {
    const MV: f32 = f32(Number.MAX_VALUE);
    const ptr = changetype<usize>(data.buffer);

    let res: f32 = MV;
    let vRes: v128 = f32x4(MV, MV, MV, MV);
    let vData: v128;

    const vectors = 4 * (data.length >> 2);
    const singles = data.length - vectors;

    for(let i = 0; i < vectors; i += 4 ) {
        vData = v128.load(ptr + i * 4);
        
        vRes = f32x4.min(vRes, vData);
    }

    res = min<f32>(res, f32x4.extract_lane(vRes, 0));
    res = min<f32>(res, f32x4.extract_lane(vRes, 1));
    res = min<f32>(res, f32x4.extract_lane(vRes, 2));
    res = min<f32>(res, f32x4.extract_lane(vRes, 3));

    for(let i = 0; i < singles; i++) {
        res = min<f32>(res, unchecked(data[i + vectors]));
    }

    return  res;
}
