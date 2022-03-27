function setup() {
    createCanvas(400, 400);
    background(210, 210, 210);

    // Set up axis (with origin at 200, 200)
    line(200, 10, 200, 390);
    line(10, 200, 390, 200);

    // Create shapes to form a house
    noStroke();
    angleMode(DEGREES);
    translate(200, 200);
    fill('blue');
    square(-25, -25, 50);
    fill('limegreen');
    rect(0, 0, 15, 25);
    fill('red');
    triangle(-25, -25, 25, -25, 0, -50);

    // Target house (placeholder)
    translate(75, 75);
    fill('dimgrey');
    square(-25, -25, 50);
    fill('darkgrey');
    rect(0, 0, 15, 25);
    fill('grey');
    triangle(-25, -25, 25, -25, 0, -50);

    noLoop();
}