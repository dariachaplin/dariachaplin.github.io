class RGB {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    toHSV() {
        let h, s, v;

        let min = Math.min(this.r, this.g, this.b);
        let max = Math.max(this.r, this.g, this.b);
        let delta = max - min;

        if(delta == 0 || max === 0) {
            // Grayscale color, only V component is meaningful
            return new HSV(0, 0, max);
        } else {
            v = max;
            s = delta / max;
        }

        if (this.r === max) {
            // Between yellow and magenta
            h = (this.g - this.b) / delta;
        } else if (this.g === max) {
            // Between cyan and yellow
            h = 2 + (this.b - this.r) / delta;
        } else {
            // Between magenta and cyan
            h = 4 + (this.r - this.g) / delta;
        }

        // Convert hue value to degrees
        h *= 60;
        if(h < 0) { h += 360; }

        return new HSV(h, s, v);
    }

    toYIQ() {
        let y = 0.299 * this.r + 0.587 * this.g + 0.114 * this.b;
        let i = 0.596 * this.r + -0.275 * this.g + -0.321 * this.b;
        let q = 0.212 * this.r + -0.523 * this.g + 0.311 * this.b;

        return new YIQ(y, i, q);
    }

    toXYZ() {
        let x = 0.412453 * this.r + 0.357580 * this.g + 0.180423 * this.b;
        let y = 0.212671 * this.r + 0.715160 * this.g + 0.072169 * this.b;
        let z = 0.019334 * this.r + 0.119193 * this.g + 0.950227 * this.b;

        return new XYZ(x, y, z);
    }
}

class HSV {
    constructor(h, s, v) {
        this.h = h;
        this.s = s;
        this.v = v;
    }

    toRGB() {
        let r, g, b;
        let i, f, p, q, t;

        if(this.s === 0) {
            // Grayscale color, only V component is meaningful
            r = g = b = this.v;
            return new RGB(r, g, b);
        }

        let h_ = this.h / 60; // h_ holds sector of h (0 to 5)
        i = Math.floor(h_);
        f = h_ - i; // Factorial part of h
        p = this.v * (1 - this.s);
        q = this.v * (1 - this.s * f);
        t = this.v * (1 - this.s * (1 - f));

        switch(i) {
            case 0:
                r = this.v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = this.v;
                b = p;
                break;
            case 2:
                r = p;
                g = this.v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = this.v;
                break;
            case 4:
                r = t;
                g = p;
                b = this.v;
                break;
            default:
                r = this.v;
                g = p;
                b = q;
                break;
        }

        return new RGB(r, g, b);
    }
}

class YIQ {
    constructor(y, i, q) {
        this.y = y;
        this.i = i;
        this.q = q;
    }

    toRGB() {
        let r = 1.0 * this.y + 0.956 * this.i + 0.621 * this.q;
        let g = 1.0 * this.y + -0.272 * this.i + -0.647 * this.q;
        let b = 1.0 * this.y + -1.105 * this.i + 1.702 * this.q;

        return new RGB(r, g, b);
    }
}

class XYZ {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    toRGB() {
        let r = 3.240479 * this.x + -1.537150 * this.y + -0.498535 * this.z;
        let g = -0.969256 * this.x + 1.875992 * this.y + 0.041556 * this.z;
        let b = 0.055648 * this.x + -0.204043 * this.y + 1.057311 * this.z;

        return new RGB(r, g, b);
    }

    f(t) {
        if(t > 0.008856) {
            return Math.pow(t, 1/3);
        } else {
            return 7.787 * t + 16.0 / 116.0;
        }
    }

    toLAB() {
        // Using D65 white point, xn = 95.047, yn = 100, zn = 108.883
        // Source (for now): https://en.wikipedia.org/wiki/Illuminant_D65
        let xn = 95.047;
        let yn = 100.0;
        let zn = 108.883;

        let l, a, b;
        if(this.y / yn > 0.008856) {
            l = 116 * Math.pow((this.y / yn), 1/3) - 16;
        } else {
            l = 903.3 * this.y / yn;
        }

        a = 500 * (f(this.x / xn) - f(this.y / yn));
        b = 200 * (f(this.y / yn) - f(this.z / zn));

        return new LAB(l, a, b);
    }
}

class LAB {
    constructor(l, a, b) {
        this.l = l;
        this.a = a;
        this.b = b;
    }

    toXYZ() {
        // Using D65 white point, xn = 95.047, yn = 100, zn = 108.883
        // Source: https://en.wikipedia.org/wiki/Illuminant_D65
        let xn = 95.047;
        let yn = 100.0;
        let zn = 108.883;

        let p = (this.l + 16) / 116.0;
        let x = xn * Math.pow((p + this.a / 500.0), 3);
        let y = yn * Math.pow(p, 3);
        let z = zn * Math.pow((p - this.b / 200.0), 3)

        // This calculation only works for y / yn < 0.008856
        if(y / yn > 0.008856) {
            return new XYZ(x, y, z);
        } else {
            return -1;
        }
    }
}

class CustomSpace {
    // v1, v2, v3 are the color values
    // Matrix to transform RGB to this space is provided by 'mat' variables
    constructor(v1, v2, v3, mat) {
            this.v1 = v1;
            this.v2 = v2;
            this.v3 = v3;
            this.mat = mat;

            // Use math library to calculate inverse of given matrix
            this.matInv = math.inv(this.mat);
    }

    toRGB() {
        let r = this.matInv[0][0] * this.v1 + this.matInv[0][1] * this.v2 + this.matInv[0][2] * this.v3;
        let g = this.matInv[1][0] * this.v1 + this.matInv[1][1] * this.v2 + this.matInv[1][2] * this.v3;
        let b = this.matInv[2][0] * this.v1 + this.matInv[2][1] * this.v2 + this.matInv[2][2] * this.v3;

        return new RGB(r, g, b);
    }

    fromRGB(r, g, b) {
        this.v1 = this.mat[0][0] * r + this.mat[0][1] * g + this.mat[0][2] * b;
        this.v2 = this.mat[1][0] * r + this.mat[1][1] * g + this.mat[1][2] * b;
        this.v3 = this.mat[2][0] * r + this.mat[2][1] * g + this.mat[2][2] * b;
    }
}