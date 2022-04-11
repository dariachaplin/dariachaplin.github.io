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

    // Placeholder-ish code to simulate a simple level

    let target = [["T", 75, 0], ["T", 0, 75], ["S", 2, -0.5], ["R", 30]];
    let house = [["T", 0, 0], ["T", 0, 0], ["S", 1, 1], ["R", 0]];
    transformHouse(house, target);

    s1 = createSlider(-400, 400);
    s1.input(() => {
        house[0][1] = s1.value();
        transformHouse(house, target);
    });
    sliders.push(s1);

    s2 = createSlider(-400, 400);
    s2.input(() => {
        house[1][2] = s2.value();
        transformHouse(house, target);
    });
    sliders.push(s2);

    s3 = createSlider(-3, 3, 0, 0.5);
    s3.input(() => {
        house[2][1] = s3.value();
        transformHouse(house, target);
    });
    sliders.push(s3);

    s4 = createSlider(-3, 3, 0, 0.5);
    s4.input(() => {
        house[2][2] = s4.value();
        transformHouse(house, target);
    });
    sliders.push(s4);

    s5 = createSlider(0, 360);
    s5.input(() => {
        house[3][1] = s5.value();
        transformHouse(house, target);
    });
    sliders.push(s5);

    noLoop();
}

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
                translate(cur[1], cur[2]);
                pos.translatePos(cur[1], cur[2]);
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