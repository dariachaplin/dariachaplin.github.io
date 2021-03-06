let level = 1, levelLabel = 'Level 1', maxLevel = 5;
let coordThresh = 2, angleThresh = 5, scaleThresh = 0.2;
let transforms = [], targetTransforms = [], curPosition;
let customTransforms = [];

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
    bPrevious.id('prev-button');
    bPrevious.mousePressed(() => {
        if(level == maxLevel) { bNext.show(); }
        level -= 1;
        if(level == 1) { bPrevious.hide(); }
        changeLevel();
    });
    bPrevious.hide();

    let bNext = createButton('Next');
    bNext.position(365, 486);
    bNext.id('next-button');
    bNext.mousePressed(() => {
        if(level == 1) { bPrevious.show(); }
        level += 1;
        if(level == maxLevel) { bNext.hide(); }
        changeLevel();
    });

    // Start the user off at level 1
    level1();

    // Set up the collection of saved levels if there are none
    if(window.localStorage.getItem('saved-levels') === null) {
        window.localStorage.setItem('saved-levels', JSON.stringify([]));
    }

    noLoop();
}

// Functions to add to and update the sequence of transforms on 'Instructions' tab

function startInputLine(transform, num, custom = false) {
    let transformLabel = document.createElement('b');
    transformLabel.setAttribute('id', 'label-' + num);
    transformLabel.innerHTML = transform;
    transformLabel.style.marginRight = '15px';

    let divName = custom ? 'custom-transform-inputs' : 'transform-inputs';
    let inputDiv = document.getElementById(divName);
    inputDiv.appendChild(transformLabel);
}

function setupInput(num, min, max, step, label, custom = false) {
    let valLabel = document.createElement('label');
    valLabel.setAttribute('id', 'val-' + num + '-label');
    valLabel.setAttribute('for', 'val-' + num);
    valLabel.innerHTML = label + ':';
    valLabel.style.marginRight = '10px';
    
    let val = document.createElement('input');
    val.setAttribute('id', 'val-' + num)
    val.setAttribute('type', 'number');
    val.setAttribute('min', min);
    val.setAttribute('max', max);
    val.setAttribute('step', step);
    val.setAttribute('onchange', 'updateValue(\'' + num + '\', ' + custom + ')');
    val.style.marginRight = '20px';
    
    let divName = custom ? 'custom-transform-inputs' : 'transform-inputs';
    let inputDiv = document.getElementById(divName);
    inputDiv.appendChild(valLabel);
    inputDiv.appendChild(val);
}

function endInputLine(num, custom = false) {
    let xButton = document.createElement('button');
    xButton.setAttribute('id', 'delete-' + num);
    xButton.innerHTML = '???';
    xButton.setAttribute('onclick', 'deleteInput(\'' + num + '\', ' + custom + ')');

    let lineBreak = document.createElement('div');
    lineBreak.setAttribute('id', 'break-' + num);
    lineBreak.innerHTML = '&nbsp';

    let divName = custom ? 'custom-transform-inputs' : 'transform-inputs';
    let inputDiv = document.getElementById(divName);
    inputDiv.appendChild(xButton);
    inputDiv.appendChild(lineBreak);
}

function deleteInput(num, custom = false) {
    document.getElementById('label-' + num).remove();
    document.getElementById('val-' + num + '-1').remove();
    document.getElementById('val-' + num + '-1-label').remove();

    // Check that the second input exists (rotations won't have both)
    if(document.getElementById('val-' + num + '-2') !== null) {
        document.getElementById('val-' + num + '-2').remove();
        document.getElementById('val-' + num + '-2-label').remove();
    }

    document.getElementById('delete-' + num).remove();
    document.getElementById('break-' + num).remove();

    // "Remove" from transforms list by replacing with an "X"
    // Doing this in order to avoid issues with deleting elements, would become hard
    //    to properly ID elements and their position in the array
    if(custom) {
        customTransforms[customTransforms.length - 1 - num] = ["X"];
        updateTransforms(custom);
    } else {
        transforms[transforms.length - 1 - num] = ["X"];
        transformHouse(transforms, targetTransforms);
    }
}

function deleteAllInputs(custom = false) {
    let curTransforms = custom ? customTransforms : transforms;
    let len = curTransforms.length;

    for(let i = 0; i < len; i++) {
        if(curTransforms[i][0] != "X") {
            deleteInput(len - 1 - i, custom);
        }
    }
}

function updateValue(num, custom = false) {
    let newVal = document.getElementById('val-' + String(num)).value;
    let row = num.split("-")[0];
    let inputBox = num.split("-")[1];

    if(custom) {
        customTransforms[customTransforms.length - 1 - row][inputBox] 
            = parseFloat(newVal);
        updateTransforms(custom);
    } else {
        transforms[transforms.length - 1 - row][inputBox] 
            = parseFloat(newVal);
        transformHouse(transforms, targetTransforms);
    }
}

function addTranslation(custom = false) {
    // Use current position to clamp X/Y values to the canvas
    let minX = Math.round(-200 + curPosition.x);
    let maxX = Math.round(200 - curPosition.x);
    let minY = Math.round(-200 + curPosition.y);
    let maxY = Math.round(200 - curPosition.y);

    let num = custom ? customTransforms.length : transforms.length;

    startInputLine('T', num, custom);
    setupInput(num + '-1', minX, maxX, 1, 'X', custom);
    setupInput(num + '-2', minY, maxY, 1, 'Y', custom);
    endInputLine(num, custom);

    if(custom) { customTransforms.unshift(['T', 0, 0]); }
    else { transforms.unshift(['T', 0, 0]); }
    updateTransforms(custom);
}

function addRotation(custom = false) {
    let num = custom ? customTransforms.length : transforms.length;

    startInputLine('R', num, custom);
    setupInput(num + '-1', 0, 360, 1, 'Angle (degrees)', custom);
    endInputLine(num, custom);

    if(custom) { customTransforms.unshift(['R', 0]); }
    else { transforms.unshift(['R', 0]); }
    updateTransforms(custom);
}

function addScaling(custom = false) {
    let num = custom ? customTransforms.length : transforms.length;

    startInputLine('S', num, custom);
    setupInput(num + '-1', -3, 3, 0.5, 'X', custom);
    setupInput(num + '-2', -3, 3, 0.5, 'Y', custom);
    endInputLine(num, custom);
    
    if(custom) { customTransforms.unshift(['S', 1, 1]); }
    else { transforms.unshift(['S', 1, 1]); }
    updateTransforms(custom);
}

function updateTransforms(custom = false) {
    let curTransforms = custom ? customTransforms : transforms;
    let str = "";
    curTransforms.forEach(transform => {
        if(transform[0] != "X") {
            str += transform[0] + "(" + transform[1];
            if(transform.length == 3) { str += ", " + transform[2]; }
            str += ") * ";
        }
    });

    let sequence = custom ? document.getElementById('custom-sequence') :
        document.getElementById('sequence');
    if(str == "") { sequence.innerHTML = "None!"; }
    else { sequence.innerHTML = str + "HOUSE"; }
}

// Level changing and specific level implementation functions

function changeLevel() {
    // Clear out input boxes and reset sequence
    deleteAllInputs();
    transforms = [];
    updateTransforms();

    // Update level label
    document.getElementById('level-label').innerHTML = 'Level ' + level;

    if(level == 1) { level1(); }
    else if(level == 2) { level2(); }
    else if(level == 3) { level3(); }
    else if(level == 4) { level4(); }
    else if(level == 5) { level5(); }
}

function level1() {
    targetTransforms = [["T", -45, -100]];
    transformHouse(transforms, targetTransforms);
}

function level2() {
    targetTransforms = [["T", 100, 100], ["R", 90]];
    transformHouse(transforms, targetTransforms);
}

function level3() {
    targetTransforms = [["T", -100, 0], ["S", 2, 2]];
    transformHouse(transforms, targetTransforms);
}

function level4() {
    targetTransforms = [["S", 1.5, 1], ["R", 180], ["T", -45, 50]];
    transformHouse(transforms, targetTransforms);
}

function level5() {
    targetTransforms = [["R", 30], ["S", 3, 1], ["T", 30, 0], ["R", -60]];
    transformHouse(transforms, targetTransforms);
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
    pos = new Position(0, 0, 0, 1, 1);

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
            case "X":
                break;
        }
    }

    curPosition = pos; // Update global storage of the position
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
    updateTransforms();
    fill('blue');
    square(-25, -25, 50);
    fill('limegreen');
    rect(0, 0, 15, 25);
    fill('red');
    triangle(-25, -25, 25, -25, 0, -50);
    pop();

    // Draw a star if the transformed house lines up with the target
    if(mainPos.approxEqualTo(targetPos)) { star(); }
}

// Functionality for adding and/or loading saved custom levels

function toggleCustomPlay() {
    let elements = [];
    elements.push(document.getElementById('prev-button'));
    elements.push(document.getElementById('level-label'));
    elements.push(document.getElementById('next-button'));

    if(document.getElementById('saved-levels-checkbox').checked) {
        elements.forEach(element => { element.style.visibility = 'hidden'; });

        deleteAllInputs();
        transforms = [];

        document.getElementById('load-levels-button').removeAttribute('disabled');
        document.getElementById('level-select').removeAttribute('disabled');
    } else {
        elements.forEach(element => { element.style.visibility = 'visible'; });

        level = 1;
        changeLevel();

        document.getElementById('load-levels-button').setAttribute('disabled', '');
        document.getElementById('level-select').setAttribute('disabled', '');
    }
}

function loadSavedLevels() {
    let savedLevels = JSON.parse(window.localStorage.getItem('saved-levels'));
    let selectionMenu = document.getElementById('level-select');
    selectionMenu.innerHTML = '<option value="">Select one...</option>';
    savedLevels.forEach(level => {
        selectionMenu.innerHTML +=
            '<option value="' + level + '">' + level + '</option>';
    });
}

function selectCustomLevel() {
    // Clear out previous inputs, if any
    deleteAllInputs();
    transforms = [];

    // Load the selected level and set up the initial transforms
    let level = document.getElementById('level-select').value;
    if(level !== "") {
        targetTransforms = JSON.parse(window.localStorage.getItem(level));
        transformHouse(transforms, targetTransforms);
    }
}

function saveCustomLevel() {
    // Save level into local storage and add to list of levels
    let name = document.getElementById('custom-level-name').value;
    window.localStorage.setItem(name, JSON.stringify(customTransforms));
    let savedLevels = JSON.parse(window.localStorage.getItem('saved-levels'));
    if(!savedLevels.includes(name)) { savedLevels.push(name); }
    window.localStorage.setItem('saved-levels', JSON.stringify(savedLevels));
    
    // Clear out all data entered
    document.getElementById('custom-level-name').value = '';
    deleteAllInputs(true);
    customTransforms = [];
}