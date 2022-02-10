let rgb = new RGB(0, 0, 0);
let hsv = new HSV(0, 0, 0);

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

    // Temporary code - just for testing RGB/HSV conversion
    hsv.h = 167;
    hsv.s = 0.94;
    hsv.v = 0.81;
    rgb = hsv.toRGB();
    rgbUpdate();

    noLoop();
}

function rgbUpdate() {
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

