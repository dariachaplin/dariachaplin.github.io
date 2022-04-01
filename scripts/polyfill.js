// Global values to control flow of polygon fill algorithm
let clearAT = false, updateAT = false, sortAT = false,
    incScanLine = false, updateXvals = false, autoplay = false;

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

    // Class slides example - scale up for use ?
    // vtxs = [new Vertex(20, 30), new Vertex(70, 10), new Vertex(130, 50), new Vertex(130, 110), new Vertex(70, 70), new Vertex(20, 90)];

    // Custom shape, simple for this algo
    b1 = createButton('Shape 1');
    b1.position(10, 487);
    b1.mousePressed(() => {
        // Custom shape
        // vtxs = [new Vertex(2, 3), new Vertex(7, 1), new Vertex(13, 5), new Vertex(13, 11), new Vertex(7, 7), new Vertex(2, 9)];
        vtxs = [new Vertex(130, 100), new Vertex(270, 100), new Vertex(290, 120),
            new Vertex(250, 200), new Vertex(230, 200), new Vertex(200, 300),
            new Vertex(200, 300), new Vertex(170, 200), new Vertex(150, 200),
            new Vertex(110, 120)];
        clear();
        drawGrid();
        resetFlowVars();
        polyfill(vtxs);
    });

    // 4-pointed star
    b2 = createButton('Shape 2');
    b2.position(85, 487);
    b2.mousePressed(() => {
        vtxs = [new Vertex(100, 100), new Vertex(200, 150), new Vertex(300, 100),
            new Vertex(250, 200), new Vertex(300, 300), new Vertex(200, 250),
            new Vertex(100, 300), new Vertex(150, 200)];
        clear();
        drawGrid();
        resetFlowVars();
        polyfill(vtxs);
    });

    // Star shape
    b3 = createButton('Shape 3');
    b3.position(160, 487);
    b3.mousePressed(() => {
        vtxs = [new Vertex(100, 33), new Vertex(200, 108), new Vertex(300, 33),
            new Vertex(263, 156), new Vertex(366, 233), new Vertex(240, 233),
            new Vertex(200, 366), new Vertex(160, 233), new Vertex(33, 233),
            new Vertex(136, 156)];
        clear();
        drawGrid();
        resetFlowVars();
        polyfill(vtxs);
    });

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

// Color in a 10x10 area of the grid, x and y are bottom left coordinate
function colorBigPixel(x, y) {
    // circle(x + 5, y + 5, 10);
    // Round to nearest big pixel first
    let x_extra = x % 10;
    x = (x_extra < 5.0) ? x - x_extra : x + (10 - x_extra);
    let y_extra = y % 10;
    y = (y_extra < 5.0) ? y - y_extra : y + (10 - y_extra);

    // Now draw
    for(let i = x; i < x + 10; i++) {
        for(let j = y; j < y + 10; j++) {
            point(i, 400 - j); // Adjust y to work with p5 canvas
        }
    }
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

// TODO - improve formatting, document
function updateActiveList(activeList) {
    let element = document.getElementById('Active List');
    element.innerHTML = "<u>Y Max, X, 1/m</u>";

    for(let i = 0; i < activeList.length; i++) {
        let edge = activeList[i];
        element.innerHTML += "<p>" + +edge.yMax.toFixed(3) + ", " 
            + +edge.x.toFixed(3) + ", " + +edge.slopeInv.toFixed(3) + "</p>";
    }
}

// TODO - improve formatting, document
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
        while(!updateAT) { await sleep(300); }
        if(edgeTable.has(y)) {
            let edges = edgeTable.get(y);
            for(let i = 0; i < edges.length; i++) {
                // TODO better way to do this ?
                activeList.push(edges[i]);
            }
            edgeTable.delete(y);
            updateEdgeTable(edgeTable);
        }

        // Sort active list on x (or by 1/m for those with matching x)
        while(!sortAT) { await sleep(300); }
        if(activeList.length > 0) { activeList = sortActiveList(activeList); }
        updateActiveList(activeList);

        // Fill pixels on scan line y using pairs of x coords from active list
        let x1, x2;
        for(let i = 0; i < activeList.length - 1; i += 2) {
            x1 = ceil(activeList[i].x);
            x2 = floor(activeList[i + 1].x);
            for(let j = x1; j < x2; j++) {
                // Shape will be black and outlined in grey
                if(j == x2 || j == x2 - 1) { stroke(100, 100, 100); }
                else { stroke(0, 0, 0); }
                colorBigPixel(j, y);
            }
        }

        // Increment y and update x values in active list
        while(!incScanLine) { await sleep(300); }
        y += 10; // y++;
        while(!updateXvals) { await sleep(300); }
        for(let i = 0; i < activeList.length; i++) {
            // Can skip over vertical edges
            if(activeList[i].invSlope != 0) {
                activeList[i].x += 10 * activeList[i].slopeInv;
                //activeList[i].x += activeList[i].slopeInv;
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