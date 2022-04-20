// Global values to control flow of polygon fill algorithm
let clearAT = false, updateAT = false, sortAT = false,
    incScanLine = false, updateXvals = false, autoplayShape = false;
let autoplaySpeed = 500;
let vtxs = [];

class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class EdgeBucket {
    constructor(yMax, x, slopeInv) {
        this.yMax = yMax;           // the edge's large y-value
        this.x = x;                 // the current value of x
        this.slopeInv = slopeInv;   // 1/m value for edge
    }
}

// The user-provided set of custom vertices (filled with a default)
let customVtxs = [new Vertex(10, 10), new Vertex(30, 10), 
    new Vertex(20, 30)];
let numCustomVtxs = 3;

function resetFlowVars() {
    clearAT = false;
    updateAT = false;
    sortAT = false;
    incScanLine = false;
    updateXvals = false;
    autoplayShape = false;
}

// Set background and draw a grid
function drawGrid() {
    background(153, 189, 255);
    for(let i = 0; i < 400; i += 10) {
        stroke('white');
        line(i, 0, i, 400);
        line(0, i, 400, i);
    }
}

function setup() {
    createCanvas(400, 400);
    drawGrid();
    
    // Display the 'Instructions' tab by default
    document.getElementById('Instructions').style.display = "block";

    // Custom shape, simple for this algo
    let shape1Button = createButton('Shape 1');
    shape1Button.position(10, 487);
    shape1Button.mousePressed(async () => {
        vtxs = [new Vertex(10, 10), new Vertex(15, 5), new Vertex(30, 20),
            new Vertex(30, 35), new Vertex(15, 20), new Vertex(10, 25)];
        clear();
        drawGrid();
        resetFlowVars();
        previewShape();
        await polyfill(vtxs);
    });

    // 4-pointed star
    let shape2Button = createButton('Shape 2');
    shape2Button.position(85, 487);
    shape2Button.mousePressed(async () => {
        vtxs = [new Vertex(10, 10), new Vertex(20, 15), new Vertex(30, 10),
            new Vertex(25, 20), new Vertex(30, 30), new Vertex(20, 25),
            new Vertex(10, 30), new Vertex(15, 20)];
        clear();
        drawGrid();
        resetFlowVars();
        previewShape();
        await polyfill(vtxs);
    });

    // Star shape
    let shape3Button = createButton('Shape 3');
    shape3Button.position(160, 487);
    shape3Button.mousePressed(async () => {
        vtxs = [new Vertex(10, 3), new Vertex(20, 10), new Vertex(30, 3),
            new Vertex(26, 15), new Vertex(36, 23), new Vertex(24, 23),
            new Vertex(20, 36), new Vertex(16, 23), new Vertex(3, 23),
            new Vertex(13, 15)];
        clear();
        drawGrid();
        resetFlowVars();
        previewShape();
        await polyfill(vtxs);
    });

    // Custom shape
    let customShapeButton = createButton('Custom Shape');
    customShapeButton.position(235, 487);
    customShapeButton.mousePressed(async () => {
        vtxs = customVtxs;
        clear();
        drawGrid();
        resetFlowVars();
        previewShape();
        await polyfill(vtxs);
    });

    // Buttons to control flow of algorithm
    // Always check if the previous button has been selected
    //      in order to enforce the order of flow

    let removeEdgesButton = createButton('Remove Edges');
    removeEdgesButton.position(10, 520);
    removeEdgesButton.mousePressed(() => {
        clearAT = true;
    });

    let addEdgesButton = createButton('Add Edges');
    addEdgesButton.position(120, 520);
    addEdgesButton.mousePressed(() => {
        if(clearAT) { updateAT = true; }
    });

    let reorderALButton = createButton('Reorder Active List');
    reorderALButton.position(205, 520);
    reorderALButton.mousePressed(() => {
        if(updateAT) { sortAT = true; }
    });

    let incrementScanLineButton = createButton('Increment Scan Line');
    incrementScanLineButton.position(10, 544);
    incrementScanLineButton.mousePressed(() => {
        if(sortAT) { incScanLine = true; }
    });
    
    let updateXValuesButton = createButton('Update X Values');
    updateXValuesButton.position(150, 544);
    updateXValuesButton.mousePressed(() => {
        if(incScanLine) { updateXvals = true; }
    });

    let completeShapeButton = createButton('Complete Shape');
    completeShapeButton.position(10, 577);
    completeShapeButton.mousePressed(() => {
        autoplayShape = true;
        clearAT = true;
        updateAT = true;
        sortAT = true;
        incScanLine = true;
        updateXvals = true;
    });
    
    speedSliderLabel = createP('Speed:');
    speedSliderLabel.position(140, 562);

    speedSlider = createSlider(0, 1000, 500, 100);
    speedSlider.position(185, 577);
    speedSlider.input(() => {
        // "Reverse" the slider so that it represents increasing speed
        autoplaySpeed = 1000 - speedSlider.value();
    });

    noLoop();
}

// Color in a 10x10 area of the grid, x and y are bottom left coordinate
function colorBigPixel(x, y) {
    x *= 10;
    y *= 10;

    stroke('black');
    fill('black');
    square(x, 400 - (y + 10), 10);
}

function createEdgeTable(v) {
    const edgeTable = new Map();
    let x1, y1, x2, y2, invSlope, edges;

    for(let i = 0; i < v.length; i++) {
        // Point values for this and previous index
        x1 = v[i].x;
        y1 = v[i].y;
        x2 = v[(i + 1) % v.length].x;
        y2 = v[(i + 1) % v.length].y;

        // Ignore horizontal edges
        if(y1 != y2) {
            // Set the vertex with the higher y-value as x2/y2 vars
            if(y1 > y2) {
                [x1, x2] = [x2, x1];
                [y1, y2] = [y2, y1];
            }

            // Set slope to 0 for vertical lines
            if(x1 == x2) { invSlope = 0; }
            else { invSlope = (x2 - x1) / (y2 - y1); }

            // Create edge bucket and store in edge table based on min y-value
            curEdge = new EdgeBucket(y2, x1, invSlope);
            if(edgeTable.has(y1)) {
                // Update existing vector of edge buckets
                edges = edgeTable.get(y1);
                edges.push(curEdge);
                edgeTable.set(y1, edges);
            } else {
                // Add a new table entry
                edges = [curEdge];
                edgeTable.set(y1, edges);
            }
        }
    }

    return edgeTable;
}

function sortActiveList(activeList) {
    let minIdx, smallerX, equalX, smallerInvSlope;

    // Selection sort, with added conditions to sort by x as well as 1/m
    for(let i = 0; i < activeList.length; i++) {
        minIdx = i;

        for(let j = i + 1; j < activeList.length; j++) {
            smallerX = activeList[j].x < activeList[minIdx].x;
            equalX = activeList[j].x === activeList[minIdx].y;
            smallerInvSlope = activeList[j].invSlope
                < activeList[minIdx].invSlope;
            if(smallerX || (equalX && smallerInvSlope)) { minIdx = j; }
        }

        // Swap to put the selected smallest value in the current slot
        temp = activeList[minIdx];
        activeList[minIdx] = activeList[i];
        activeList[i] = temp;
    }

    return activeList;
}

// Sleep function used to wait for user input on control flow buttons
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Post the latest Active List data to the 'Data Structures' tab
function updateActiveList(activeList) {
    let element = document.getElementById('Active List');
    element.innerHTML = "<i>Y Max, X, 1/m</i>";

    for(let i = 0; i < activeList.length; i++) {
        let edge = activeList[i];
        element.innerHTML += "<p>" + +edge.yMax.toFixed(3) + ", " 
            + +edge.x.toFixed(3) + ", " + +edge.slopeInv.toFixed(3) + "</p>";
    }
}

// Post the latest Edge Table data to the 'Data Structures' tab
function updateEdgeTable(edgeTable) {
    let element = document.getElementById('Edge Table');
    element.innerHTML = "<i>Y Max, X, 1/m<br></i>";
    let keys = Array.from(edgeTable.keys()).sort(function(a,b) {return a - b;});

    for(let i = 0; i < keys.length; i++) {
        element.innerHTML += "<p><u>" + keys[i] + "</u>:</p>";
        let buckets = edgeTable.get(keys[i]);
        for(let j = 0; j < buckets.length; j++) {
            let edge = buckets[j];
            element.innerHTML += "<p>" + +edge.yMax.toFixed(3) + ", " 
            + +edge.x.toFixed(3) + ", " + +edge.slopeInv.toFixed(3) + "</p>";
        }
    }
}

// Post the updated Scan Line y-value to the 'Data Structures' tab
function updateScanLine(y) {
    let element = document.getElementById('Current Scan Line');
    if(y == -1) { element.innerHTML = ""; }
    else { element.innerHTML = "Current Scan Line: " + y; }
}

async function polyfill(v) {
    // Set up edge table and active list
    let edgeTable = createEdgeTable(v);
    let activeList = [];
    updateEdgeTable(edgeTable);

    // Find min and max y-values of edge table
    let lowerY = -1, upperY = 0;
    for(let i = 0; i < 400; i++) {
        if(edgeTable.has(i)) {
            if(lowerY == -1) { lowerY = i; }

            // Iterate to find highest y value in available edges
            let localMax = 0;
            let edges = edgeTable.get(i);
            for(let j = 0; j < edges.length; j++) {
                let curYMax = edges[j].yMax;
                localMax = (curYMax > localMax) ? curYMax : localMax;
            }

            upperY = (localMax > upperY) ? localMax : upperY;
        }
    }
    
    let y = (lowerY >= -1) ? lowerY : 0;
    updateScanLine(y);

    // Iterate through the lowest to highest relevant scan lines
    while(y <= upperY) {
        // Discard entries where yMax == y (edge has been completed)
        if(autoplayShape) { await sleep(autoplaySpeed); }
        while(!clearAT) { await sleep(300); }
        let activeListCopy = [];
        for(let i = 0; i < activeList.length; i++) {
            if(activeList[i].yMax > y) {
                activeListCopy.push(activeList[i]);
            }
        }
        activeList = activeListCopy;
        updateActiveList(activeList);

        // Move all buckets from the current edge table to active list
        if(autoplayShape) { await sleep(autoplaySpeed); }
        while(!updateAT) { await sleep(300); }
        if(edgeTable.has(y)) {
            let edges = edgeTable.get(y);
            for(let i = 0; i < edges.length; i++) {
                activeList.push(edges[i]);
            }
            edgeTable.delete(y);
            updateEdgeTable(edgeTable);
        }

        // Sort active list on x (or by 1/m for those with matching x)
        if(autoplayShape) { await sleep(autoplaySpeed); }
        while(!sortAT) { await sleep(300); }
        if(activeList.length > 0) { activeList = sortActiveList(activeList); }
        updateActiveList(activeList);

        // Fill pixels on scan line y using pairs of x coords from active list
        let x1, x2;
        for(let i = 0; i < activeList.length - 1; i += 2) {
            x1 = ceil(activeList[i].x);
            x2 = floor(activeList[i + 1].x);
            for(let j = x1; j < x2; j++) {
                stroke(0, 0, 0, 255);
                colorBigPixel(j, y);
            }
        }

        // Increment y and update x values in active list
        if(autoplayShape) { await sleep(autoplaySpeed); }
        while(!incScanLine) { await sleep(300); }
        y++;
        updateScanLine(y);
        while(!updateXvals) { await sleep(300); }
        for(let i = 0; i < activeList.length; i++) {
            // Can skip over vertical edges
            if(activeList[i].invSlope != 0) {
                activeList[i].x += activeList[i].slopeInv;
            }
        }
        updateActiveList(activeList);

        // Reset the control flow variables if not autoplaying
        if(!autoplayShape) {
            clearAT = false, updateAT = false, sortAT = false, 
                incScanLine = false, updateXvals = false;
        }
    }

    // Clear out scan line display on 'Data Structures' tab
    updateScanLine(-1);
}

// Functionality for adding your own shape

// Attempt to draw the outline of the shape given by the vertices

function previewCustomShape() {
    vtxs = customVtxs;
    previewShape();
}

function previewShape() {
    clear();
    drawGrid();

    stroke('black');
    for(let i = 0; i < vtxs.length; i++) {
        if(i == vtxs.length - 1) {
            line(vtxs[i].x * 10, 400 - vtxs[i].y * 10, 
                vtxs[0].x * 10, 400 - vtxs[0].y * 10);
        } else {
            line(vtxs[i].x * 10, 400 - vtxs[i].y * 10, 
                vtxs[i + 1].x * 10, 400 - vtxs[i + 1].y * 10);
        }
    }
}

// Check that all the relevant vertices have been filled in
function allVtxsFilledIn(vtxs) {
    let error = false;

    vtxs.forEach(vtx => {
        if(vtx === "") {
            document.getElementById('vtxs-error-msg').innerHTML = "Error: "
                + "Please enter values for the first " + numCustomVtxs
                + " vertices, or update the number of vertices.";
            error = true;
        }
    });

    if(error) { return false; }
    else { return true; }
}

// Check that the given vertices are numerical and within bounds
function validVtxs(vtxs) {
    let error = false;

    vtxs.forEach(vtx => {
        if(isNaN(vtx)) {
            document.getElementById('vtxs-error-msg').innerHTML = "Error: "
                + "Please ensure that you have entered numeric values.";
            error = true;
        } else if(vtx < 0 || vtx > 39) {
            document.getElementById('vtxs-error-msg').innerHTML = "Error: "
                + "Please only enter integer values between 0 and 39.";
            error = true;
        }
    });

    if(error) { return false; }
    else { return true; }
}

// Update customVtxs based on the input fields on the "Custom Shape" tab
function updateVtxs() {
    // Check that the correct number of vertices have been filled in
    let vtxStrings = [];
    for(let i = 0; i < numCustomVtxs; i++) {
        vtxStrings.push(document.getElementById('x' + String(i + 1)).value);
        vtxStrings.push(document.getElementById('y' + String(i + 1)).value);
    }
    if(!allVtxsFilledIn(vtxStrings)) { return; }

    // Check that all inputs are numerical and within the bounds
    let vtxs = [];
    vtxStrings.forEach(vtx => vtxs.push(parseInt(vtx)));
    if(!validVtxs(vtxs)) { return; }

    // Once past error checking, clear error message and update vertices
    document.getElementById('vtxs-error-msg').innerHTML = "";
    customVtxs = [];
    for(let i = 0; i < vtxs.length - 1; i += 2) {
        customVtxs.push(new Vertex(vtxs[i], vtxs[i + 1]));
    }
}

// Update the number of vertices the user wants to customize
function updateNumVtxs() {
    numCustomVtxs = document.getElementById('num-vtxs').value;
}