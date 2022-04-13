let level = 1, levelLabel = 'Level 1', maxLevel = 5;
let sliders = [];
let coordThresh = 2, angleThresh = 5, scaleThresh = 0.2;

// Position class used to keep track of transformed coordinates
// Based on this solution:
// https://github.com/ChristerNilsson/Transformer/blob/master/js/transformer.js
class Position {
    constructor(x, y, angle, scaleX, scaleY) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }

    translatePos(x, y) {
        this.x += this.scaleX * x * cos(this.angle) - this.scaleY * y * sin(this.angle);
        this.y += this.scaleY * y * cos(this.angle) + this.scaleX * x * sin(this.angle);
    }

    rotatePos(angle) {
        this.angle = (this.angle + angle) % 360;
    }

    scalePos(x, y) {
        this.scaleX *= x;
        this.scaleY *= y;
    }

    approxEqualTo(otherPos) {
        let coordsMatch = abs(this.x - otherPos.x) < coordThresh
            && abs(this.y - otherPos.y) < coordThresh;
        let anglesMatch = abs(this.angle - otherPos.angle) < angleThresh
            || 360 - abs(this.angle - otherPos.angle) < angleThresh;
        let scalesMatch = abs(this.scaleX - otherPos.scaleX) < scaleThresh
            && abs(this.scaleY - otherPos.scaleY) < scaleThresh;
        return (coordsMatch && anglesMatch && scalesMatch);
    }
}

function setup() {
    // Display the 'Instructions' tab by default
    document.getElementById('Instructions').style.display = "block";

    angleMode(DEGREES);
    setUpAxis();

    // Set up level navigation buttons and a label to display the current level

    let pLevel = createP(levelLabel);
    pLevel.position(185, 470);
    pLevel.id('level-label');

    let bPrevious = createButton('Previous');
    bPrevious.position(8, 486);
    bPrevious.mousePressed(() => {
        if(level == maxLevel) { bNext.show(); }
        level -= 1;
        document.getElementById('level-label').innerHTML = 'Level ' + level;
        if(level == 1) { bPrevious.hide(); }
        changeLevel();
    });
    bPrevious.hide();

    let bNext = createButton('Next');
    bNext.position(365, 486);
    bNext.mousePressed(() => {
        if(level == 1) { bPrevious.show(); }
        level += 1;
        document.getElementById('level-label').innerHTML = 'Level ' + level;
        if(level == maxLevel) { bNext.hide(); }
        changeLevel();
    });

    // Start the user off at level 1
    level1();

    document.getElementById('val-1').setAttribute('min', 1);

    noLoop();
}

// Functions to add to and update the sequence of transforms on 'Instructions' tab

function setupInput(num, min, max, label) {
    let val = document.getElementById('val-' + num);
    val.style.visibility = 'visible';
    val.setAttribute('min', min);
    val.setAttribute('max', max);
    val.value = "";
    
    let valLabel = document.getElementById('val-' + num + '-label');
    valLabel.style.visibility = 'visible';
    valLabel.innerHTML = label + ':';
}

function hideInput(num) {
    let val = document.getElementById('val-' + num);
    val.style.visibility = 'hidden';
    val.value = "";

    let valLabel = document.getElementById('val-' + num + '-label');
    valLabel.style.visibility = 'hidden';
}

function addTranslation() {
    // TODO clamp translation values to fit to canvas based on current position
    setupInput('1', -200, 200, 'X');
    setupInput('2', -200, 200, 'Y');
}

function addRotation() {
    setupInput('1', -360, 360, 'Angle (degrees)');
    hideInput('2');
}

function addScaling() {
    setupInput('1', -3, 3, 'X');
    setupInput('2', -3, 3, 'Y');
}

function updateVal1() {
    let val = parseFloat(document.getElementById('val-1').value);
    // TODO
}

function updateVal2() {
    let val = parseFloat(document.getElementById('val-2').value);
    // TODO
}

function updateTransforms(transforms) {
    let str = "";
    transforms.forEach(transform => {
        str += transform[0] + "(" + transform[1];
        if(transform.length == 3) { str += ", " + transform[2]; }
        str += ") * ";
    });

    let sequence = document.getElementById('sequence');
    if(str == "") { sequence.innerHTML = "None!"; }
    else { sequence.innerHTML = str + "HOUSE"; }
}

// Level changing and specific level implementation functions

function changeLevel() {
    // Clear out previous level's sliders
    sliders.forEach(slider => slider.remove());
    sliders = [];

    // Clear out input boxes
    hideInput('1');
    hideInput('2');

    if(level == 1) { level1(); }
    else if(level == 2) { level2(); }
    else if(level == 3) { level3(); }
    else if(level == 4) { level4(); }
    else if(level == 5) { level5(); }
}

function level1() {
    let target = [["T", -45, -100]];
    let house = [["T", 0, 0], ["T", 0, 0]];
    transformHouse(house, target);

    s1 = createSlider(-200, 200);
    s1.value(0);
    s1.position(9, 510);
    s1.input(() => {
        house[0][1] = s1.value();
        transformHouse(house, target);
    });
    sliders.push(s1);

    s2 = createSlider(-200, 200);
    s2.value(0);
    s2.position(150, 510);
    s2.input(() => {
        house[1][2] = s2.value();
        transformHouse(house, target);
    });
    sliders.push(s2);
}

function level2() {
    let target = [["T", 100, 100], ["R", 90]];
    let house = [];
    transformHouse(house, target);
}

function level3() {
    let target = [["T", -100, 0], ["S", 2, 2]];
    let house = [];
    transformHouse(house, target);
}

function level4() {
    let target = [["S", 1.5, 1], ["R", 180], ["T", -45, 50]];
    let house = [];
    transformHouse(house, target);
}

function level5() {
    let target = [["R", 30], ["S", 3, 1], ["T", 30, 0], ["R", -60]];
    let house = [];
    transformHouse(house, target);
}

// Functions to perform transformations and check for solution matches

// Set up gray canvas and axis (with origin at 200, 200)
function setUpAxis() {
    createCanvas(400, 400);
    background(210, 210, 210);
    stroke('black');
    line(200, 10, 200, 390);
    line(10, 200, 390, 200);
    noStroke();
}

// Draw star on house to indicate success
// Vertices from:
// stackoverflow.com/questions/53799599/how-to-draw-a-star-shape-in-processingjs
function star() {
    push();
    fill('white');
    stroke('black');
    beginShape();
    vertex(0, -50);
    vertex(14, -20);
    vertex(47, -15);
    vertex(23, 7);
    vertex(29, 40);
    vertex(0, 25);
    vertex(-29, 40);
    vertex(-23, 7);
    vertex(-47, -15);
    vertex(-14, -20);
    endShape(CLOSE);
    pop();
}

// Perform the given list of transforms to prepare for drawing
// Return the transformed position
function performTransforms(lst) {
    let pos = new Position(0, 0, 0, 1, 1);

    if(lst.length == 0) { return pos; }

    let cur;
    for(let i = 0; i < lst.length; i++) {
        cur = lst[i];
        switch(cur[0]) {
            case "T":
                // Negate y-translations (p5.js canvas origin is top left)
                translate(cur[1], -cur[2]);
                pos.translatePos(cur[1], -cur[2]);
                break;
            case "R":
                // Negate angle (p5.js does positive rotations clockwise)
                rotate(-cur[1]);
                pos.rotatePos(-cur[1]);
                break;
            case "S":
                scale(cur[1], cur[2]);
                pos.scalePos(cur[1], cur[2]);
                break;
        }
    }

    return pos;
}

// Redraw both houses to reflect updates to transforms
function transformHouse(house, target) {
    // Clear houses and reset origin to 200, 200
    clear();
    setUpAxis();
    translate(200, 200);

    // Redraw current target house
    push();
    let targetPos = performTransforms(target);
    fill('dimgrey');
    square(-25, -25, 50);
    fill('darkgrey');
    rect(0, 0, 15, 25);
    fill('grey');
    triangle(-25, -25, 25, -25, 0, -50);
    pop();

    // Apply current transformations and redraw main house
    push();
    let mainPos = performTransforms(house);
    updateTransforms(house);
    console.log(mainPos); // TODO remove after debugging complete
    fill('blue');
    square(-25, -25, 50);
    fill('limegreen');
    rect(0, 0, 15, 25);
    fill('red');
    triangle(-25, -25, 25, -25, 0, -50);
    pop();

    // Draw a star if the transformed house lines up with the target
    if(mainPos.approxEqualTo(targetPos)) {
        star();
        sliders.forEach(slider => slider.remove());
        sliders = [];
    }
}