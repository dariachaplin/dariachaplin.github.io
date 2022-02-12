let rgb = new RGB(0, 0, 0);
let hsv = new HSV(0, 0, 0);
let yiq = new YIQ(0, 0, 0);

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

    // Temporary code - just for testing RGB/YIQ conversion
    yiq.y = 0.51;
    yiq.i = 0.01;
    yiq.q = -0.18;
    rgb = yiq.toRGB();
    rgbUpdate();

    noLoop();
}

function rgbUpdate() {
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

