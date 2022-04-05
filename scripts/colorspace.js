let rgb = new RGB(0, 0, 0);
let sliderR, sliderG, sliderB;

let hsv = new HSV(0, 0, 0);
let sliderH, sliderS, sliderV;

let yiq = new YIQ(0, 0, 0);
let sliderY, sliderI, sliderQ;

let custom = new CustomSpace(0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1);
let sliderVal1, sliderVal2, sliderVal3;
let displayCustomSpace = false;

let height = 280;

class ColorSpace {
    constructor(name1, lower1, upper1, name2, lower2, upper2,
        name3, lower3, upper3) {
            this.name1 = name1;
            this.lower1 = lower1;
            this.upper1 = upper1;
            
            this.name2 = name2;
            this.lower2 = lower2;
            this.upper2 = upper2;
            
            this.name3 = name3;
            this.lower3 = lower3;
            this.upper3 = upper3;
        }
}

// Function to position relevant elements in a row for a color space
function createColorRow(height, colorSpace, slider1, slider2, slider3) {
    let p1 = createP(colorSpace.name1);
    p1.position(9, height);
    p1.id(colorSpace.name1);
    slider1.position(5, height + 30);
    let p1range = createP(colorSpace.lower1 + ' - ' + colorSpace.upper1);
    p1range.position(9, height + 30);
    p1range.id(colorSpace.name1 + ' Range');

    let p2 = createP(colorSpace.name2);
    p2.position(142, height);
    p2.id(colorSpace.name2);
    slider2.position(138, height + 30);
    let p2range = createP(colorSpace.lower2 + ' - ' + colorSpace.upper2);
    p2range.position(142, height + 30);
    p2range.id(colorSpace.name2 + ' Range');
    
    let p3 = createP(colorSpace.name3);
    p3.position(275, height);
    p3.id(colorSpace.name3);
    slider3.position(271, height + 30);
    let p3range = createP(colorSpace.lower3 + ' - ' + colorSpace.upper3);
    p3range.position(275, height + 30);
    p3range.id(colorSpace.name3 + ' Range');
}

function setup() {
    createCanvas(400, 200);
    background(0);

    // Create sliders and labels for each color space

    // RGB
    rgbSpace = new ColorSpace('Red', '0', '255', 'Green', '0', '255',
        'Blue', '0', '255');
    sliderR = createSlider(0, 255);
    sliderG = createSlider(0, 255);
    sliderB = createSlider(0, 255);
    createColorRow(height, rgbSpace, sliderR, sliderG, sliderB);
    sliderR.input(() => {
        rgb.r = sliderR.value() / 255;
        rgbValUpdate();
    });
    sliderG.input(() => {
        rgb.g = sliderG.value() / 255;
        rgbValUpdate();
    });
    sliderB.input(() => {
        rgb.b = sliderB.value() / 255;
        rgbValUpdate();
    });

    // HSV
    hsvSpace = new ColorSpace('Hue', '0', '360', 'Saturation', '0', '100',
        'Value', '0', '100');
    sliderH = createSlider(0, 360);
    sliderS = createSlider(0, 100);
    sliderV = createSlider(0, 100);
    createColorRow(height + 65, hsvSpace, sliderH, sliderS, sliderV);
    sliderH.input(() => {
        hsv.h = sliderH.value();
        hsvValUpdate();
    });
    sliderS.input(() => {
        hsv.s = sliderS.value() / 100;
        hsvValUpdate();
    });
    sliderV.input(() => {
        hsv.v = sliderV.value() / 100;
        hsvValUpdate();
    });

    // YIQ
    yiqSpace = new ColorSpace('Y', '0', '1', 'I', '-0.5226', '0.5226',
        'Q', '-0.5957', '0.5957');
    sliderY = createSlider(0, 1, 0, 0);
    sliderI = createSlider(-0.5226, 0.5226, 0, 0);
    sliderQ = createSlider(-0.5957, 0.5957, 0, 0);
    createColorRow(height + 130, yiqSpace, sliderY, sliderI, sliderQ);
    sliderY.input(() => {
        yiq.y = sliderY.value();
        yiqValUpdate();
    });
    sliderI.input(() => {
        yiq.i = sliderI.value();
        yiqValUpdate();
    });
    sliderQ.input(() => {
        yiq.q = sliderQ.value();
        yiqValUpdate();
    });

    // Custom
    customSpace = new ColorSpace('Value 1', '0', '1', 'Value 2', '0', '1',
        'Value 3', '0', '1');
    sliderVal1 = createSlider(0, 1, 0, 0);
    sliderVal2 = createSlider(0, 1, 0, 0);
    sliderVal3 = createSlider(0, 1, 0, 0);
    createColorRow(height + 195, customSpace, sliderVal1, sliderVal2, sliderVal3);
    sliderVal1.input(() => {
        custom.v1 = sliderVal1.value();
        customValUpdate();
    });
    sliderVal2.input(() => {
        custom.v2 = sliderVal2.value();
        customValUpdate();
    });
    sliderVal3.input(() => {
        custom.v3 = sliderVal3.value();
        customValUpdate();
    });

    // Set the initial color to orange
    rgb = new RGB(0.87, 0.45, 0.04);
    rgbValUpdate();
    rgbSliderUpdate();

    noLoop();
}

// Functions to update each color space's values

function rgbValUpdate() {
    rgbLabelUpdate();
    hsv = rgb.toHSV();
    hsvSliderUpdate();
    yiq = rgb.toYIQ();
    yiqSliderUpdate();
    custom.fromRGB(rgb.r, rgb.g, rgb.b);
    customSliderUpdate();
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

function hsvValUpdate() {
    rgb = hsv.toRGB();
    rgbSliderUpdate();
    yiq = rgb.toYIQ();
    yiqSliderUpdate();
    custom.fromRGB(rgb.r, rgb.g, rgb.b);
    customSliderUpdate();
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

function yiqValUpdate() {
    rgb = yiq.toRGB();
    rgbSliderUpdate();
    hsv = rgb.toHSV();
    hsvSliderUpdate();
    custom.fromRGB(rgb.r, rgb.g, rgb.b);
    customSliderUpdate();
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

function customValUpdate() {
    rgb = custom.toRGB();
    rgbSliderUpdate();
    hsv = rgb.toHSV();
    hsvSliderUpdate();
    yiq = rgb.toYIQ();
    yiqSliderUpdate();
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

// Functions to update each slider's position and label

function rgbSliderUpdate() {
    sliderR.value(rgb.r * 255);
    sliderG.value(rgb.g * 255);
    sliderB.value(rgb.b * 255);
    rgbLabelUpdate();
}

function rgbLabelUpdate() {
    let red = sliderR.value();
    let green = sliderG.value();
    let blue = sliderB.value();

    document.getElementById('Red').innerHTML = 'Red: ' + red;
    document.getElementById('Green').innerHTML = 'Green: ' + green;
    document.getElementById('Blue').innerHTML = 'Blue: ' + blue;
}

function hsvSliderUpdate() {
    sliderH.value(hsv.h);
    sliderS.value(hsv.s * 100);
    sliderV.value(hsv.v * 100);
    hsvLabelUpdate();
}

function hsvLabelUpdate() {
    let hue = sliderH.value();
    let sat = sliderS.value();
    let value = sliderV.value();

    document.getElementById('Hue').innerHTML = 'Hue: ' + hue;
    document.getElementById('Saturation').innerHTML = 'Saturation: ' + sat;
    document.getElementById('Value').innerHTML = 'Value: ' + value;
}

function yiqSliderUpdate() {
    sliderY.value(yiq.y);
    sliderI.value(yiq.i);
    sliderQ.value(yiq.q);
    yiqLabelUpdate();
}

function yiqLabelUpdate() {
    // Limit the values' decimal precision
    let y = +sliderY.value().toFixed(4);
    let i = +sliderI.value().toFixed(4);
    let q = +sliderQ.value().toFixed(4);

    document.getElementById('Y').innerHTML = 'Y: ' + y;
    document.getElementById('I').innerHTML = 'I: ' + i;
    document.getElementById('Q').innerHTML = 'Q: ' + q;
}

function customSliderUpdate() {
    sliderVal1.value(custom.v1);
    sliderVal2.value(custom.v2);
    sliderVal3.value(custom.v3);
    customLabelUpdate();
}

function customLabelUpdate() {
    // Limit the values' decimal precision
    let v1 = +sliderVal1.value().toFixed(4);
    let v2 = +sliderVal2.value().toFixed(4);
    let v3 = +sliderVal3.value().toFixed(4);

    document.getElementById('Value 1').innerHTML = 'Value 1: ' + v1;
    document.getElementById('Value 2').innerHTML = 'Value 2: ' + v2;
    document.getElementById('Value 3').innerHTML = 'Value 3: ' + v3;
}

// Functionality for displaying the custom color space

// TODO