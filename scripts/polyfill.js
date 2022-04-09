// Global values to control flow of polygon fill algorithm
let clearAT = false, updateAT = false, sortAT = false,
    incScanLine = false, updateXvals = false, autoplay = false;

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
    autoplay = false;
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
    let vtxs;

    // Custom shape, simple for this algo
    b1 = createButton('Shape 1');
    b1.position(10, 487);
    b1.mousePressed(() => {
        vtxs = [new Vertex(10, 10), new Vertex(15, 5), new Vertex(30, 20),
            new Vertex(30, 35), new Vertex(15, 20), new Vertex(10, 25)];
        clear();
        drawGrid();
        resetFlowVars();
        polyfill(vtxs);
    });

    // 4-pointed star
    b2 = createButton('Shape 2');
    b2.position(85, 487);
    b2.mousePressed(() => {
        vtxs = [new Vertex(10, 10), new Vertex(20, 15), new Vertex(30, 10),
            new Vertex(25, 20), new Vertex(30, 30), new Vertex(20, 25),
            new Vertex(10, 30), new Vertex(15, 20)];
        clear();
        drawGrid();
        resetFlowVars();
        polyfill(vtxs);
    });

    // Star shape
    b3 = createButton('Shape 3');
    b3.position(160, 487);
    b3.mousePressed(() => {
        vtxs = [new Vertex(10, 3), new Vertex(20, 10), new Vertex(30, 3),
            new Vertex(26, 15), new Vertex(36, 23), new Vertex(24, 23),
            new Vertex(20, 36), new Vertex(16, 23), new Vertex(3, 23),
            new Vertex(13, 15)];
        clear();
        drawGrid();
        resetFlowVars();
        polyfill(vtxs);
    });

    // Custom shape
    b0 = createButton('Custom Shape');
    b0.position(235, 487);
    b0.mousePressed(() => {
        vtxs = customVtxs;
        clear();
        drawGrid();
        resetFlowVars();
        polyfill(vtxs);
    })

    // Buttons to control flow of algorithm
    // Always check if the previous button has been selected
    //      in order to enforce the order of flow

    b4 = createButton('Increment Scan Line');
    b4.position(10, 520);
    b4.mousePressed(() => {
        if(sortAT) { incScanLine = true; }
    });
    
    b5 = createButton('Update X');
    b5.position(10, 544);
    b5.mousePressed(() => {
        if(incScanLine) { updateXvals = true; }
    });

    b6 = createButton('Remove Edges');
    b6.position(85, 544);
    b6.mousePressed(() => {
        clearAT = true;
    });

    b7 = createButton('Add Edges');
    b7.position(195, 544);
    b7.mousePressed(() => {
        if(clearAT) { updateAT = true; }
    });

    b8 = createButton('Reorder');
    b8.position(279, 544);
    b8.mousePressed(() => {
        if(updateAT) { sortAT = true; }
    });

    b9 = createButton('Complete Shape');
    b9.position(10, 577);
    b9.mousePressed(() => {
        autoplay = true;
        clearAT = true;
        updateAT = true;
        sortAT = true;
        incScanLine = true;
        updateXvals = true;
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
    element.innerHTML = "<u>Y Max, X, 1/m</u>";

    for(let i = 0; i < activeList.length; i++) {
        let edge = activeList[i];
        element.innerHTML += "<p>" + +edge.yMax.toFixed(3) + ", " 
            + +edge.x.toFixed(3) + ", " + +edge.slopeInv.toFixed(3) + "</p>";
    }
}

// Post the latest Edge Table data to the 'Data Structures' tab
function updateEdgeTable(edgeTable) {
    let element = document.getElementById('Edge Table');
    element.innerHTML = "";
    let keys = Array.from(edgeTable.keys()).sort(function(a,b) {return a - b;});

    for(let i = 0; i < keys.length; i++) {
        element.innerHTML += "<u>" + keys[i] + "</u>:";
        let buckets = edgeTable.get(keys[i]);
        for(let j = 0; j < buckets.length; j++) {
            let edge = buckets[j];
            element.innerHTML += "<p>" + +edge.yMax.toFixed(3) + ", " 
            + +edge.x.toFixed(3) + ", " + +edge.slopeInv.toFixed(3) + "</p>";
        }
    }
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

    // Iterate through the lowest to highest relevant scan lines
    while(y <= upperY) {
        // Discard entries where yMax == y (edge has been completed)
        if(autoplay) { await sleep(1000); }
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
        if(autoplay) { await sleep(1000); }
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
        if(autoplay) { await sleep(1000); }
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
        if(autoplay) { await sleep(1000); }
        while(!incScanLine) { await sleep(300); }
        y++;
        while(!updateXvals) { await sleep(300); }
        for(let i = 0; i < activeList.length; i++) {
            // Can skip over vertical edges
            if(activeList[i].invSlope != 0) {
                activeList[i].x += activeList[i].slopeInv;
            }
        }
        updateActiveList(activeList);

        // Reset the control flow variables if not autoplaying
        if(!autoplay) {
            clearAT = false, updateAT = false, sortAT = false, 
                incScanLine = false, updateXvals = false;
        }
    }
}

// Functionality for adding your own shape

// Attempt to draw the outline of the shape given by the vertices
function previewShape() {
    clear();
    drawGrid();

    stroke('black');
    for(let i = 0; i < customVtxs.length; i++) {
        if(i == customVtxs.length - 1) {
            line(customVtxs[i].x * 10, 400 - customVtxs[i].y * 10, 
                customVtxs[0].x * 10, 400 - customVtxs[0].y * 10);
        } else {
            line(customVtxs[i].x * 10, 400 - customVtxs[i].y * 10, 
                customVtxs[i + 1].x * 10, 400 - customVtxs[i + 1].y * 10);
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