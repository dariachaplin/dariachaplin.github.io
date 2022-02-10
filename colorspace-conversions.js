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