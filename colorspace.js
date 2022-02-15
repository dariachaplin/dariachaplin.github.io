let rgb = new RGB(0, 0, 0);
let hsv = new HSV(0, 0, 0);
let yiq = new YIQ(0, 0, 0);
let lab = new LAB(0, 0, 0);

function setup() {
    createCanvas(400, 400);
    background(0);

    let sliderR = createSlider(0, 1);
    sliderR.input(() => {
        rgb.r = sliderR.value();
        rgbUpdate();
    });

    let sliderG = createSlider(0, 1);
    sliderG.input(() => {
        rgb.g = sliderG.value();
        rgbUpdate();
    });

    let sliderB = createSlider(0, 1);
    sliderB.input(() => {
        rgb.b = sliderB.value();
        rgbUpdate();
    });

    // Temporary code - just for testing conversion functions
    lab.l = 78.94;
    lab.a = -33.16;
    lab.b = 34.98;
    xyz = lab.toXYZ();
    console.log(xyz.x);
    console.log(xyz.y);
    console.log(xyz.z);
    rgb = xyz.toRGB();
    console.log(rgb.r);
    console.log(rgb.g);
    console.log(rgb.b);
    rgbUpdate();

    rgb = new RGB(105, 160, 48);
    xyz = rgb.toXYZ();
    console.log(xyz.x);
    console.log(xyz.y);
    console.log(xyz.z);

    noLoop();
}

function rgbUpdate() {
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

