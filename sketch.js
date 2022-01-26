let color;
let b1, b2, b3;

function setup() {
  createCanvas(400, 400);
  background(0);
  
  color = 255;
  
  b1 = createButton('Red', 'red');
  b1.position(10, 10);
  b1.mousePressed(makeColorRed);
  
  b2 = createButton('Yellow', 'yellow');
  b2.position(50, 10);
  b2.mousePressed(makeColorYellow);
  
  b3 = createButton('Blue', 'blue');
  b3.position(103, 10);
  b3.mousePressed(makeColorBlue);
  
  noLoop();
}

function makeColorRed() { color = 'red'; }
function makeColorYellow() { color = 'yellow'; }
function makeColorBlue() { color = 'blue'; }

function mouseClicked() {
  fill(color);
  square(mouseX, mouseY, 30);
  return false;
}