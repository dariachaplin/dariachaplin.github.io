let sliders = [];

function setup() {
    angleMode(DEGREES);
    setUpAxis();

    // Display the 'Instructions' tab by default
    document.getElementById('Instructions').style.display = "block";

    // Placeholder-ish code to simulate a simple level

    let target = [["T", 75, 0], ["T", 0, 75]];
    let house = [["T", 0, 0], ["T", 0, 0]]
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

// Compare the user's transforms with target transforms
// Return true only if they are (approximately) the same
function sameTransforms(house, target) {
    if(house.length != target.length) { return false; }

    let cur1, cur2;
    let thresh = 5;

    for( let i = 0; i < house.length; i++) {
        cur1 = house[i];
        cur2 = target[i];

        // Compare transformation type
        if(cur1[0] != cur2[0]) { return false; }

        // Compare first parameter
        if(abs(cur1[1] - cur2[1]) > thresh) { return false; }

        // Compare second parameter, if there is one
        if(cur1[0] != "R" && abs(cur1[2] - cur2[2]) > thresh) { return false; }
    }

    return true;
}

// Perform the given list of transforms to prepare for drawing
function performTransforms(lst) {
    if(lst.length == 0) { return; }

    let cur;
    for(let i = 0; i < lst.length; i++) {
        cur = lst[i];
        switch(cur[0]) {
            case "T":
                translate(cur[1], cur[2]);
                break;
            case "R":
                // TODO Check whether angle needs to be negated
                rotate(cur[1]);
                break;
            case "S":
                scale(cur[1], cur[2]);
                break;
        }
    }
}

// Redraw both houses to reflect updates to transforms
function transformHouse(house, target) {
    // Clear houses and reset origin to 200, 200
    clear();
    setUpAxis();
    translate(200, 200);

    // Redraw current target house
    performTransforms(target);
    fill('dimgrey');
    square(-25, -25, 50);
    fill('darkgrey');
    rect(0, 0, 15, 25);
    fill('grey');
    triangle(-25, -25, 25, -25, 0, -50);

    // Reset origin to 200, 200 again
    resetMatrix();
    translate(200, 200);

    // Apply current transformations and redraw main house
    performTransforms(house);
    fill('blue');
    square(-25, -25, 50);
    fill('limegreen');
    rect(0, 0, 15, 25);
    fill('red');
    triangle(-25, -25, 25, -25, 0, -50);

    // Draw a star if the transformed house lines up with the target
    if(sameTransforms(house, target)) {
        star();
        sliders[0].remove();
        sliders[1].remove();
    }
}