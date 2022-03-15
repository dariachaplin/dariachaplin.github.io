function setup() {
    createCanvas(400, 400);
    background(153, 189, 255);

    // Custom shape
    vtxs = [new Vertex(130, 100), new Vertex(270, 100), new Vertex(290, 120), new Vertex(250, 200),
        new Vertex(230, 200), new Vertex(200, 300), new Vertex(200, 300),
        new Vertex(170, 200), new Vertex(150, 200), new Vertex(110, 120)];
    
    // Class slides example
    // vtxs = [new Vertex(20, 30), new Vertex(70, 10), new Vertex(130, 50), new Vertex(130, 110), new Vertex(70, 70), new Vertex(20, 90)];

    // Star shape
    // vtxs = [new Vertex(100, 33), new Vertex(200, 108), new Vertex(300, 33),
    //     new Vertex(263, 156), new Vertex(366, 233), new Vertex(240, 233),
    //     new Vertex(200, 366), new Vertex(160, 233), new Vertex(33, 233),
    //     new Vertex(136, 156)];

    // 4-pointed star
    // vtxs = [new Vertex(100, 100), new Vertex(200, 150), new Vertex(300, 100),
    //     new Vertex(250, 200), new Vertex(300, 300), new Vertex(200, 250),
    //     new Vertex(100, 300), new Vertex(150, 200)];

    polyfill(vtxs);

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

// TODO - temporary function to simulate step-by-step nature
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
        for(let i = 0; i < activeList.length; i++) {
            if(activeList[i].yMax <= y) {
                activeList.splice(i, 1);
            }
        }
        updateActiveList(activeList);

        // Move all buckets from the current edge table to active list
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
        if(activeList.length > 0) { activeList = sortActiveList(activeList); }
        updateActiveList(activeList);

        // Fill pixels on scan line y using pairs of x coords from active list
        let x1, x2;
        for(let i = 0; i < activeList.length - 1; i += 2) {
            x1 = ceil(activeList[i].x);
            x2 = floor(activeList[i + 1].x);
            for(let j = x1; j < x2; j++) {
                stroke(0, 0, 0);
                point(j, 400 - y); // Swap the y value to account for 
            }
            await sleep(300); // TODO remove after temporary use
        }

        // Increment y and update x values in active list
        y++;
        for(let i = 0; i < activeList.length; i++) {
            // Can skip over vertical edges
            if(activeList[i].invSlope != 0) {
                activeList[i].x += activeList[i].slopeInv;
            }
        }
        updateActiveList(activeList);
    }
}