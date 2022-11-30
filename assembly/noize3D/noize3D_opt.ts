import {
    F3, G3, G3_2, G3_3,
    TABLE,
    GRAD,
} from './constants';

@inline export function generateOpt(xStart: f64, y: f64, z: f64, xStep: f64, xSize: u32, resultArray: Float32Array, resultOffset: u32): u32 {
    for (let ind: u32 = 0; ind < xSize; ++ind) {
        let x: f64 = xStart + xStep * ind;
        let n: f64 = 0;
        //let n0: f64 = 0;
        //let n1: f64 = 0;
        //let n2: f64 = 0;
        //let n3: f64 = 0; // Noise contributions from the four corners

        // Skew the input space to determine which simplex cell we're in
        const s: f64 = (x + y + z) * F3; // Very nice and simple skew factor for 3D
        const i: f64 = floor(x + s);
        const j: f64 = floor(y + s);
        const k: f64 = floor(z + s);
        const t: f64 = (i + j + k) * G3;
        const X0: f64 = i - t; // Unskew the cell origin back to (x,y,z) space
        const Y0: f64 = j - t;
        const Z0: f64 = k - t;
        const x0: f64 = x - X0; // The x,y,z distances from the cell origin
        const y0: f64 = y - Y0;
        const z0: f64 = z - Z0;

        // trace(x0.toString(10) + ',' + y0.toString(10) + ',' + z0.toString(10));
        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        let i1: i32 = 0;
        let j1: i32 = 0;
        let k1: i32 = 0; // Offsets for second corner of simplex in (i,j,k) coords
        
        let i2: i32 = 0;
        let j2: i32 = 0;
        let k2: i32 = 0; // Offsets for third corner of simplex in (i,j,k) coords

        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1;
                //j1 = 0;
                //k1 = 0;
                i2 = 1;
                j2 = 1;
                //k2 = 0;
            } // X Y Z order
            else if (x0 >= z0) {
                i1 = 1;
                //j1 = 0;
                //k1 = 0;
                i2 = 1;
                //j2 = 0;
                k2 = 1;
            } // X Z Y order
            else {
                //i1 = 0;
                //j1 = 0;
                k1 = 1;
                i2 = 1;
                //j2 = 0;
                k2 = 1;
            } // Z X Y order
        }
        else { // x0<y0
            if (y0 < z0) {
                //i1 = 0;
                //j1 = 0;
                k1 = 1;
                //i2 = 0;
                j2 = 1;
                k2 = 1;
            } // Z Y X order
            else if (x0 < z0) {
                //i1 = 0;
                j1 = 1;
                //k1 = 0;
                //i2 = 0;
                j2 = 1;
                k2 = 1;
            } // Y Z X order
            else {
                //i1 = 0;
                j1 = 1;
                //k1 = 0;
                i2 = 1;
                j2 = 1;
                //k2 = 0;
            } // Y X Z order
        }

        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        const x1: f64 = x0 - f64(i1) + G3; // Offsets for second corner in (x,y,z) coords
        const y1: f64 = y0 - f64(j1) + G3;
        const z1: f64 = z0 - f64(k1) + G3;

        const x2: f64 = x0 - f64(i2) + G3_2; // Offsets for third corner in (x,y,z) coords
        const y2: f64 = y0 - f64(j2) + G3_2;
        const z2: f64 = z0 - f64(k2) + G3_2;

        const x3: f64 = x0 - 1.0 + G3_3; // Offsets for last corner in (x,y,z) coords
        const y3: f64 = y0 - 1.0 + G3_3;
        const z3: f64 = z0 - 1.0 + G3_3;
        // Work out the hashed gradient indices of the four simplex corners
        const ii: i32 = i32(i) & 255;
        const jj: i32 = i32(j) & 255;
        const kk: i32 = i32(k) & 255;

        let t0: f64 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        let t1: f64 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        let t2: f64 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        let t3: f64 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;

        // trace('t:' + t0.toString(10) + ',' + t1.toString(10) + ',' + t2.toString(10) + ',' + t3.toString(10));
        // Calculate the contribution from the four corners
        if (t0 > 0) {
            const gi0 = ii + unchecked(TABLE[jj + TABLE[kk]]);
            const G0 = unchecked(GRAD[gi0 * 3]);
            const G1 = unchecked(GRAD[gi0 * 3 + 1]);
            const G2 = unchecked(GRAD[gi0 * 3 + 2]);
            
            // trace("g0:" + G0.toString(10) + ',' + G1.toString(10) + ',' + G2.toString());

            t0 *= t0;
            n += t0 * t0 * (G0 * x0 + G1 * y0 + G2 * z0);
        }

        if (t1 > 0) {
            const gi1 = ii + i1 + unchecked(TABLE[jj + j1 + TABLE[kk + k1]]);
            const G0 = unchecked(GRAD[gi1 * 3]);
            const G1 = unchecked(GRAD[gi1 * 3 + 1]);
            const G2 = unchecked(GRAD[gi1 * 3 + 2]);

            t1 *= t1;
            n += t1 * t1 * (G0 * x1 + G1 * y1 + G2 * z1);
        }

        if (t2 > 0) {
            const gi2 = ii + i2 + unchecked(TABLE[jj + j2 + TABLE[kk + k2]]);
            const G0 = unchecked(GRAD[gi2 * 3]);
            const G1 = unchecked(GRAD[gi2 * 3 + 1]);
            const G2 = unchecked(GRAD[gi2 * 3 + 2]);

            t2 *= t2;
            n += t2 * t2 * (G0 * x2 + G1 * y2 + G2 * z2);
        }

        if(t3 > 0.0) {
            const gi3 = ii + 1 + unchecked(TABLE[jj + 1 + TABLE[kk + 1]]);
            const G0 = unchecked(GRAD[gi3 * 3]);
            const G1 = unchecked(GRAD[gi3 * 3 + 1]);
            const G2 = unchecked(GRAD[gi3 * 3 + 2]);

            t3 *= t3;
            n += t3 * t3 * (G0 * x3 + G1 * y3 + G2 * z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to stay just inside [-1,1]
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to stay just inside [-1,1]
        unchecked(resultArray[resultOffset + ind] = f32(32.0 * n));
    }

    return resultOffset;
};