import {
    F3, G3, G3_2, G3_3,
    TABLE,
    GRAD,
} from './constants';

const _vG3 = f32x4.splat(f32(G3));
const _vG3_2 = f32x4.splat(f32(G3_2));
const _vG3_3 = f32x4.splat(f32(G3_3) - 1);

const _vijk1_0 = f32x4(1, 0, 0, 0);
const _vijk2_0 = f32x4(1, 1, 0, 0);

const _vijk1_1 = f32x4(1, 0, 0, 0);
const _vijk2_1 = f32x4(1, 0, 1, 0);

const _vijk1_2 = f32x4(0, 0, 1, 0);
const _vijk2_2 = f32x4(1, 0, 1, 0);

const _vijk1_3 = f32x4(0, 0, 1, 0);
const _vijk2_3 = f32x4(0, 1, 1, 0);

const _vijk1_4 = f32x4(0, 1, 0, 0);
const _vijk2_4 = f32x4(0, 1, 1, 0);

const _vijk1_5 = f32x4(0, 1, 0, 0);
const _vijk2_5 = f32x4(1, 1, 0, 0);

@inline function to_string_f32(v: v128): String {
    return (
        f32x4.extract_lane(v, 0).toString(10) + ',' + 
        f32x4.extract_lane(v, 1).toString(10) + ',' + 
        f32x4.extract_lane(v, 2).toString(10)
    );
}
// sum lines between
// return line entry
@inline function hor_sum_f32(v: v128): f32 {
    return f32x4.extract_lane(v, 0) + f32x4.extract_lane(v, 1) + f32x4.extract_lane(v, 2)
}

@inline export function generateSimd(x: f32, y: f32, z: f32): f32 {
    let n0: f32 = 0;
    let n1: f32 = 0;
    let n2: f32 = 0;
    let n3: f32 = 0; // Noise contributions from the four corners

    const gradPtr = changetype<usize>(GRAD);
    const gradSize = <u32>sizeof<f32>();

    // Skew the input space to determine which simplex cell we're in
    const s: f32 = (x + y + z) * f32(F3); // Very nice and simple skew factor for 3D
    const i: f32 = floor(x + s);
    const j: f32 = floor(y + s);
    const k: f32 = floor(z + s);
    const t: f32 = f32(i + j + k) * f32(G3);

    const _vt = f32x4(t, t, t, 0)
    const _vxyz = f32x4(x, y, z, 0);
    const _vijk = f32x4(i, j, k, 0);

    const _vxyz0 = f32x4.sub(_vxyz, f32x4.sub(_vijk, _vt));

    //const X0: f32 = i - t; // Unskew the cell origin back to (x,y,z) space
    //const Y0: f32 = j - t;
    //const Z0: f32 = k - t;
    //const x0: f32 = x - X0; // The x,y,z distances from the cell origin
    //const y0: f32 = y - Y0;
    //const z0: f32 = z - Z0;
    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    let _vijk1: v128;
    let _vijk2: v128;

    //let i1: i32 = 0;
    //let j1: i32 = 0;
    //let k1: i32 = 0; // Offsets for second corner of simplex in (i,j,k) coords
    
    //let i2: i32 = 0;
    //let j2: i32 = 0;
    //let k2: i32 = 0; // Offsets for third corner of simplex in (i,j,k) coords

    const x0 = f32x4.extract_lane(_vxyz0, 0);
    const y0 = f32x4.extract_lane(_vxyz0, 1);
    const z0 = f32x4.extract_lane(_vxyz0, 2);

    //trace('vxyz0:' + to_string_f32(_vxyz0));
    
    if (x0 >= y0) {
        if (y0 >= z0) {
            _vijk1 = _vijk1_0;
            _vijk2 = _vijk2_0;
            //i1 = 1;
            //j1 = 0;
            //k1 = 0;
            //i2 = 1;
            //j2 = 1;
            //k2 = 0;
        } // X Y Z order
        else if (x0 >= z0) {
            _vijk1 = _vijk1_1;
            _vijk2 = _vijk2_1;

            //i1 = 1;
            //j1 = 0;
            //k1 = 0;
            //i2 = 1;
            //j2 = 0;
            //k2 = 1;
        } // X Z Y order
        else {

            _vijk1 = _vijk1_2;
            _vijk2 = _vijk2_2;

            //i1 = 0;
            //j1 = 0;
            //k1 = 1;
            //i2 = 1;
            //j2 = 0;
            //k2 = 1;
        } // Z X Y order
    }
    else { // x0<y0
        if (y0 < z0) {

            _vijk1 = _vijk1_3;
            _vijk2 = _vijk2_3;

            //i1 = 0;
            //j1 = 0;
            //k1 = 1;
            //i2 = 0;
            //j2 = 1;
            //k2 = 1;
        } // Z Y X order
        else if (x0 < z0) {
            _vijk1 = _vijk1_4;
            _vijk2 = _vijk2_4;

            //i1 = 0;
            //j1 = 1;
            //k1 = 0;
            //i2 = 0;
            //j2 = 1;
            //k2 = 1;
        } // Y Z X order
        else {
            _vijk1 = _vijk1_5;
            _vijk2 = _vijk2_5;

            //i1 = 0;
            //j1 = 1;
            //k1 = 0;
            //i2 = 1;
            //j2 = 1;
            //k2 = 0;
        } // Y X Z order
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.

    const _vxyz1 = f32x4.add(f32x4.sub(_vxyz0, _vijk1), _vG3);
 
    //const x1: f32 = x0 - f32(i1) + G3; // Offsets for second corner in (x,y,z) coords
    //const y1: f32 = y0 - f32(j1) + G3;
    //const z1: f32 = z0 - f32(k1) + G3;

    const _vxyz2 = f32x4.add(f32x4.sub(_vxyz0, _vijk2), _vG3_2);

    //const x2: f32 = x0 - f32(i2) + G3_2; // Offsets for third corner in (x,y,z) coords
    //const y2: f32 = y0 - f32(j2) + G3_2;
    //const z2: f32 = z0 - f32(k2) + G3_2;
   
    const _vxyz3 = f32x4.add(_vxyz0, _vG3_3);
   
    // const x3: f32 = x0 - 1.0 + G3_3; // Offsets for last corner in (x,y,z) coords
    // const y3: f32 = y0 - 1.0 + G3_3;
    // const z3: f32 = z0 - 1.0 + G3_3;
    // Work out the hashed gradient indices of the four simplex corners
    const ii: u32 = u32(i) & 255;
    const jj: u32 = u32(j) & 255;
    const kk: u32 = u32(k) & 255;

    const _vxyz0_c = f32x4.mul(_vxyz0, _vxyz0);
    const _vxyz1_c = f32x4.mul(_vxyz1, _vxyz1);
    const _vxyz2_c = f32x4.mul(_vxyz2, _vxyz2);
    const _vxyz3_c = f32x4.mul(_vxyz3, _vxyz3);
    
    const t0: f32 =  0.6 - hor_sum_f32(_vxyz0_c)
    const t1: f32 =  0.6 - hor_sum_f32(_vxyz1_c)
    const t2: f32 =  0.6 - hor_sum_f32(_vxyz2_c)
    const t3: f32 =  0.6 - hor_sum_f32(_vxyz3_c)
    
    // Calculate the contribution from the four corners
    // let t0: f32 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) {
        // n0 = 0.0;
    } else {
        const gi0 = ii + TABLE[jj + TABLE[kk]];

        const _vG = v128.load(gradPtr + gi0 * 3 * 4);
        const _vGS = f32x4.add(_vG, _vxyz0);

        //const G0 = unchecked(GRAD[gi0 * 3]);
        //const G1 = unchecked(GRAD[gi0 * 3 + 1]);
        //const G2 = unchecked(GRAD[gi0 * 3 + 2]);
        
        //t0 *= t0;
        n0 = t0 * t0 * t0 * hor_sum_f32(_vGS) ;//(G0 * x0 + G1 * y0 + G2 * z0);
    }

    // let t1: f32 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) {
        // n1 = 0.0;
    } else {
        const i1 = <u32>f32x4.extract_lane(_vijk1, 0);
        const j1 = <u32>f32x4.extract_lane(_vijk1, 1);
        const k1 = <u32>f32x4.extract_lane(_vijk1, 2);
        
        const gi1 = ii + i1 + TABLE[jj + j1 + TABLE[kk + k1]];

        const _vG = v128.load(gradPtr + gi1 * 3 * 4);
        const _vGS = f32x4.add(_vG, _vxyz1);

        //const G0 = unchecked(GRAD[gi1 * 3]);
        //const G1 = unchecked(GRAD[gi1 * 3 + 1]);
        //const G2 = unchecked(GRAD[gi1 * 3 + 2]);

        //t1 *= t1;
        n1 = t1 * t1 * t1 * hor_sum_f32(_vGS); //(G0 * x1 + G1 * y1 + G2 * z1);
    }

    // let t2: f32 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) {
        // n2 = 0.0;
    } else {
        const i2 = <u32>f32x4.extract_lane(_vijk2, 0);
        const j2 = <u32>f32x4.extract_lane(_vijk2, 1);
        const k2 = <u32>f32x4.extract_lane(_vijk2, 2);

        const gi2 = ii + i2 + TABLE[jj + j2 + TABLE[kk + k2]];

        const _vG = v128.load(gradPtr + gi2 * 3 * 4);
        const _vGS = f32x4.add(_vG, _vxyz2);

        //const G0 = unchecked(GRAD[gi2 * 3]);
        //const G1 = unchecked(GRAD[gi2 * 3 + 1]);
        //const G2 = unchecked(GRAD[gi2 * 3 + 2]);

        //t2 *= t2;
        n2 = t2 * t2 * t2 * hor_sum_f32(_vGS);//(G0 * x2 + G1 * y2 + G2 * z2);
    }

    // let t3: f32 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) {
        // n3 = 0.0;
    } else {
        const gi3 = ii + 1 + TABLE[jj + 1 + TABLE[kk + 1]];

        const _vG = v128.load(gradPtr + gi3 * 3 * 4);
        const _vGS = f32x4.add(_vG, _vxyz3);

        //const G0 = unchecked(GRAD[gi3 * 3]);
        //const G1 = unchecked(GRAD[gi3 * 3 + 1]);
        //const G2 = unchecked(GRAD[gi3 * 3 + 2]);

        // t3 *= t3;
        n3 = t3 * t3 * t3 * hor_sum_f32(_vGS); //(G0 * x3 + G1 * y3 + G2 * z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to stay just inside [-1,1]
    return 32.0 * (n0 + n1 + n2 + n3);
};