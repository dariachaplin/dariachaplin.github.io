let rgb = new RGB(0, 0, 0);
let sliderR, sliderG, sliderB;

let hsv = new HSV(0, 0, 0);
let sliderH, sliderS, sliderV;

let yiq = new YIQ(0, 0, 0);
let sliderY, sliderI, sliderQ;

// let lab = new LAB(0, 0, 0);
// TODO - figure out LAB ?

let height = 280;

function setup() {
    createCanvas(400, 200);
    background(0);

    // Create sliders and labels for each color space

    let redP = createP('Red');
    redP.position(9, height);
    sliderR = createSlider(0, 255);
    sliderR.position(5, height + 30);
    sliderR.input(() => {
        rgb.r = sliderR.value() / 255;
        rgbValUpdate();
    });

    let greenP = createP('Green');
    greenP.position(142, height);
    sliderG = createSlider(0, 255);
    sliderG.position(138, height + 30);
    sliderG.input(() => {
        rgb.g = sliderG.value() / 255;
        rgbValUpdate();
    });

    let blueP = createP('Blue');
    blueP.position(275, height);
    sliderB = createSlider(0, 255);
    sliderB.position(271, height + 30);
    sliderB.input(() => {
        rgb.b = sliderB.value() / 255;
        rgbValUpdate();
    });

    let hueP = createP('Hue');
    hueP.position(9, height + 40);
    sliderH = createSlider(0, 360);
    sliderH.position(5, height + 70);
    sliderH.input(() => {
        hsv.h = sliderH.value();
        hsvValUpdate();
    });

    let satP = createP('Saturation');
    satP.position(142, height + 40);
    sliderS = createSlider(0, 100);
    sliderS.position(138, height + 70);
    sliderS.input(() => {
        hsv.s = sliderS.value() / 100;
        hsvValUpdate();
    });

    let valueP = createP('Value');
    valueP.position(275, height + 40);
    sliderV = createSlider(0, 100);
    sliderV.position(271, height + 70);
    sliderV.input(() => {
        hsv.v = sliderV.value() / 100;
        hsvValUpdate();
    });

    let yP = createP('Y');
    yP.position(9, height + 80);
    sliderY = createSlider(0, 1, 0, 0);
    sliderY.position(5, height + 110);
    sliderY.input(() => {
        yiq.y = sliderY.value();
        yiqValUpdate();
    });

    let iP = createP('I');
    iP.position(142, height + 80);
    sliderI = createSlider(-0.5226, 0.5226, 0, 0);
    sliderI.position(138, height + 110);
    sliderI.input(() => {
        yiq.i = sliderI.value();
        yiqValUpdate();
    });

    let qP = createP('Q');
    qP.position(275, height + 80);
    sliderQ = createSlider(-0.5957, 0.5957, 0, 0);
    sliderQ.position(271, height + 110);
    sliderQ.input(() => {
        yiq.q = sliderQ.value();
        yiqValUpdate();
    });

    // Set the initial color to orange

    rgb = new RGB(0.87, 0.45, 0.04);
    rgbValUpdate();
    rgbSliderUpdate();

    noLoop();
}

// Functions to update each color space's values

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

// Functions to update each slider's position

function rgbSliderUpdate() {
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

// Handle tab clicks for info panel
function openTab(event, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
  }