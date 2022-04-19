let rgb = new RGBColor(0, 0, 0);
let sliderR, sliderG, sliderB;

let hsv = new HSVColor(0, 0, 0);
let sliderH, sliderS, sliderV;

let yiq = new YIQColor(0, 0, 0);
let sliderY, sliderI, sliderQ;

let custom = new CustomSpaceColor(0, 0, 0, [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
let sliderVal1, sliderVal2, sliderVal3;
let customSpaceDisplayed = false;

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

    // Display the 'Instructions' tab by default
    document.getElementById('Instructions').style.display = "block";

    // Create sliders and labels for each color space

    // RGB
    let rgbSpace = new ColorSpace('Red', '0', '255', 'Green', '0', '255',
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
    let hsvSpace = new ColorSpace('Hue', '0', '360', 'Saturation', '0', '100',
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
    let yiqSpace = new ColorSpace('Y', '0', '1', 'I', '-0.5226', '0.5226',
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
    let customSpace = new ColorSpace('Value 1', '0', '1', 'Value 2', '0', '1',
        'Value 3', '0', '1');
    sliderVal1 = createSlider(0, 1, 0, 0);
    sliderVal2 = createSlider(0, 1, 0, 0);
    sliderVal3 = createSlider(0, 1, 0, 0);
    // Note - if a new color space is added, it should be above this one
    // Be sure to adjust height here and in the updateRanges function below
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

    // Hide the custom space by default, users can turn it on with checkbox
    hideCustomSpace();

    // Set the initial color to orange
    rgb = new RGBColor(0.87, 0.45, 0.04);
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
    hsvLabelUpdate();
    rgb = hsv.toRGB();
    rgbSliderUpdate();
    yiq = rgb.toYIQ();
    yiqSliderUpdate();
    custom.fromRGB(rgb.r, rgb.g, rgb.b);
    customSliderUpdate();
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

function yiqValUpdate() {
    yiqLabelUpdate();
    rgb = yiq.toRGB();
    rgbSliderUpdate();
    hsv = rgb.toHSV();
    hsvSliderUpdate();
    custom.fromRGB(rgb.r, rgb.g, rgb.b);
    customSliderUpdate();
    background(rgb.r * 255, rgb.g * 255, rgb.b * 255);
}

function customValUpdate() {
    customLabelUpdate();
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

function customSpaceVisibilityChange() {
    let displayCustomSpaceCheckbox = document.getElementById('display-custom');
    if(displayCustomSpaceCheckbox.checked) { showCustomSpace(); }
    else { hideCustomSpace(); }
}

function inputIsNaNorWrong(vals, inputType) {
    let error = false;

    // Check for non-numbers and empty slots
    vals.forEach(val => {
        if(isNaN(val)) {
            document.getElementById(inputType + '-error-msg').innerHTML = 
                "Error: Please make sure you have entered numeric values in each slot.";
            error = true;
        }
    });

    // Check for invalid ranges (lower > upper)
    if(inputType == 'ranges') {
        for(let i = 0; i < vals.length; i += 2) {
            if(vals[i] >= vals[i + 1]) {
                document.getElementById('ranges-error-msg').innerHTML = 
                    "Error: Ensure that each lower bound is less than its upper bound.";
                error = true;
            }
        }
    }

    // Return true only if errors were found; if no errors, clear the error message
    if(error) {
        return true;
    } else {
        document.getElementById(inputType + '-error-msg').innerHTML = "";
        return false;
    }
}

function updateMatrix() {
    // Gather latest matrix values
    let mat00 = parseFloat(document.getElementById('mat00').value);
    let mat01 = parseFloat(document.getElementById('mat01').value);
    let mat02 = parseFloat(document.getElementById('mat02').value);
    let mat10 = parseFloat(document.getElementById('mat10').value);
    let mat11 = parseFloat(document.getElementById('mat11').value);
    let mat12 = parseFloat(document.getElementById('mat12').value);
    let mat20 = parseFloat(document.getElementById('mat20').value);
    let mat21 = parseFloat(document.getElementById('mat21').value);
    let mat22 = parseFloat(document.getElementById('mat22').value);

    // If any of the values are not numbers, update error message and return
    let vals = [mat00, mat01, mat02, mat10, mat11, mat12, mat20, mat21, mat22];
    if(inputIsNaNorWrong(vals, 'matrix')) { return; }

    // Update the matrix (and correspondingly the inverse matrix)
    custom.mat = [[mat00, mat01, mat02], [mat10, mat11, mat12], [mat20, mat21, mat22]];
    custom.matInv = math.inv(custom.mat);

    // Refresh the custom color space's values based on current RGB
    custom.fromRGB(rgb.r, rgb.g, rgb.b);
    customSliderUpdate();
}

function updateRanges() {
    // Gather latest range values
    let lower1 = parseFloat(document.getElementById('range1-lower').value);
    let upper1 = parseFloat(document.getElementById('range1-upper').value);
    let lower2 = parseFloat(document.getElementById('range2-lower').value);
    let upper2 = parseFloat(document.getElementById('range2-upper').value);
    let lower3 = parseFloat(document.getElementById('range3-lower').value);
    let upper3 = parseFloat(document.getElementById('range3-upper').value);

    // If any of the values are not numbers, update error message and return
    let vals = [lower1, upper1, lower2, upper2, lower3, upper3];
    if(inputIsNaNorWrong(vals, 'ranges')) { return; }

    // Remove the previous sliders and labels
    sliderVal1.remove();
    sliderVal2.remove();
    sliderVal3.remove();
    let labels = getCustomSpaceLabels();
    labels.forEach(label => label.remove());

    // Recreate the sliders and labels with the new range info
    let customSpace = new ColorSpace('Value 1', String(lower1), String(upper1), 'Value 2',
        String(lower2), String(upper2), 'Value 3', String(lower3), String(upper3));
    sliderVal1 = createSlider(lower1, upper1, 0, 0);
    sliderVal2 = createSlider(lower2, upper2, 0, 0);
    sliderVal3 = createSlider(lower3, upper3, 0, 0);
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

    // Update the new custom color space with the current RGB value
    custom.fromRGB(rgb.r, rgb.g, rgb.b);
    customSliderUpdate();

    // Hide the new sliders and labels if they were previously hidden
    if(!customSpaceDisplayed) { hideCustomSpace(); }
}

function getCustomSpaceLabels() {
    let elements = [];
    elements.push(document.getElementById('Value 1'));
    elements.push(document.getElementById('Value 2'));
    elements.push(document.getElementById('Value 3'));
    elements.push(document.getElementById('Value 1 Range'));
    elements.push(document.getElementById('Value 2 Range'));
    elements.push(document.getElementById('Value 3 Range'));
    return elements;
}

function hideCustomSpace() {
    customSpaceDisplayed = false;

    // Hide the sliders with p5 function
    sliderVal1.hide();
    sliderVal2.hide();
    sliderVal3.hide();

    // Collect remaining elements and hide by setting their display property
    let elements = getCustomSpaceLabels();
    elements.forEach(element => element.style.visibility = 'hidden');
}

function showCustomSpace() {
    customSpaceDisplayed = true;

    // Show the sliders with p5 function
    sliderVal1.show();
    sliderVal2.show();
    sliderVal3.show();

    // Collect remaining elements and show by setting their display property
    let elements = getCustomSpaceLabels();
    elements.forEach(element => element.style.visibility = 'visible');
}