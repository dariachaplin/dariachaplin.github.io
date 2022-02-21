let rgb = new RGB(0, 0, 0);
let sliderR, sliderG, sliderB;

let hsv = new HSV(0, 0, 0);
let sliderH, sliderS, sliderV;

let yiq = new YIQ(0, 0, 0);
let sliderY, sliderI, sliderQ;

// let lab = new LAB(0, 0, 0);
// TODO - figure out LAB ?

function setup() {
    createCanvas(400, 400);
    background(0);

    sliderR = createSlider(0, 255);
    sliderR.position(0, 400);
    sliderR.input(() => {
        rgb.r = sliderR.value() / 255;
        rgbValUpdate();
    });

    sliderG = createSlider(0, 255);
    sliderG.position(133, 400);
    sliderG.input(() => {
        rgb.g = sliderG.value() / 255;
        rgbValUpdate();
    });

    sliderB = createSlider(0, 255);
    sliderB.position(266, 400);
    sliderB.input(() => {
        rgb.b = sliderB.value() / 255;
        rgbValUpdate();
    });

    sliderH = createSlider(0, 360);
    sliderH.position(0, 420);
    sliderH.input(() => {
        hsv.h = sliderH.value();
        hsvValUpdate();
    });

    sliderS = createSlider(0, 100);
    sliderS.position(133, 420);
    sliderS.input(() => {
        hsv.s = sliderS.value() / 100;
        hsvValUpdate();
    });

    sliderV = createSlider(0, 100);
    sliderV.position(266, 420);
    sliderV.input(() => {
        hsv.v = sliderV.value() / 100;
        hsvValUpdate();
    });

    sliderY = createSlider(0, 1, 0, 0);
    sliderY.position(0, 440);
    sliderY.input(() => {
        yiq.y = sliderY.value();
        yiqValUpdate();
    });

    sliderI = createSlider(-0.5226, 0.5226, 0, 0);
    sliderI.position(133, 440);
    sliderI.input(() => {
        yiq.i = sliderI.value();
        yiqValUpdate();
    });

    sliderQ = createSlider(-0.5957, 0.5957, 0, 0);
    sliderQ.position(266, 440);
    sliderQ.input(() => {
        yiq.q = sliderQ.value();
        yiqValUpdate();
    });

    rgb = new RGB(0.87, 0.45, 0.04);
    rgbValUpdate();
    rgbSliderUpdate();

    noLoop();
}

function rgbValUpdate() {
    hsv = rgb.toHSV();
    hsvSliderUpdate();
    yiq = rgb.toYIQ();
    yiqSliderUpdate();
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

function hsvValUpdate() {
    rgb = hsv.toRGB();
    rgbSliderUpdate();
    yiq = rgb.toYIQ();
    yiqSliderUpdate();
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

function yiqValUpdate() {
    rgb = yiq.toRGB();
    rgbSliderUpdate();
    hsv = rgb.toHSV();
    hsvSliderUpdate();
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

function rgbSliderUpdate() {
    console.log(rgb.r);
    console.log(rgb.g);
    console.log(rgb.b);
    sliderR.value(rgb.r * 255);
    sliderG.value(rgb.g * 255);
    sliderB.value(rgb.b * 255);
}

function hsvSliderUpdate() {
    sliderH.value(hsv.h);
    sliderS.value(hsv.s * 100);
    sliderV.value(hsv.v * 100);
}

function yiqSliderUpdate() {
    sliderY.value(yiq.y);
    sliderI.value(yiq.i);
    sliderQ.value(yiq.q);
}
