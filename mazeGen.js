// const util = require("util");

class Vertex {
    constructor(id, edgeLength) {
        this.id = id;
        this.neighbors = [];
        this.edges = [];
        this.edgeLength = edgeLength;
        this.totalVerts = edgeLength * edgeLength;
        
        // north neighbor
        // is vert not on top row
        if( this.id > (edgeLength - 1) ) {
            this.neighbors.push(id - edgeLength);
        }

        // east neighbor
        // is vert not on right col
        // is id !== one less than multiple of edgeLength
        if( ((this.id + 1) % edgeLength) !== 0 ) {
            this.neighbors.push(id + 1);
        }

        // south neighbor
        // is vert on bottom row
        if( this.id < edgeLength * (edgeLength-1) ) {
            this.neighbors.push(id + edgeLength);
        }

        // west neighbor
        // is vert on right col
        // is id multiple of edgeLength
        if( (this.id % edgeLength) !== 0 ) {
            this.neighbors.push(id - 1);
        }
    }

}

class Graph {
    constructor(edgeLength=2){
        this.edgeLength = edgeLength;
        this.totalVerts = edgeLength * edgeLength;
        this.adjList = [];

        for(let i = 0; i < this.totalVerts; i++) {
            let vert = new Vertex(i, edgeLength);
            this.adjList.push(vert);
        }
    }

    findVert(id) {
        return this.adjList[id] ? this.adjList[id] : -1;
    }

    // for debugging
    printNeighbors() {
        this.adjList.forEach((vert) => {
            console.log(vert.id, vert.neighbors);
        })
    }

    // for debugging
    printEdges() {
        this.adjList.forEach((vert) => {
            console.log(vert.id, vert.edges);
        })
    }

    createEdge(vert1Id, vert2Id) {
        if(!this.findVert(vert1Id) || !this.findVert(vert2Id)) {
            return console.log("one or both verts do not exist");
        }

        this.adjList[vert1Id].edges.push(vert2Id);
        this.adjList[vert2Id].edges.push(vert1Id);
    }

    // default start at top left corner
    createMazeDfsIter(src = 0) {

        let stack = [src];
        let visited = [src];

        // while there are items in stack
        while(stack.length > 0) {
            // pop off last vert added to stack
            // this is LIFO
            let currentVertId = stack.pop();
            let currentVert = this.adjList[currentVertId];
            let hasValidNeighbors = false;

            // if a neighbor has not been visited, change validNeighbors to true
            currentVert.neighbors.forEach(n=>{ 
                if(!visited.includes(n)) {
                    hasValidNeighbors = true;
                }
            })

            // if currentVert has unvisited neighbors
            if(hasValidNeighbors) {
                
                // add current to stack
                stack.push(currentVert.id);

                // find unvisited neighbors of current, hold in new array
                let validNeighbors = currentVert.neighbors.filter(n => !visited.includes(n));

                // grab random valid neighbor
                let nextVert = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
                // create edge between current and next
                this.createEdge(currentVertId, nextVert);
                // push to stack and mark as visited
                stack.push(nextVert);
                visited.push(nextVert);
            }
        }   
    }

    visualize() {
        let binaryEdges = [];

        // for each vert in adjList
        for (let i=0; i<this.totalVerts; i++){

            // find potential neighbors
            // does not matter if they are valid neighbors, must have all four numbers
            let north = i - this.edgeLength;
            let east = i + 1;
            let south = i + this.edgeLength;
            let west = i - 1;
            let row = Math.floor(i / this.edgeLength);

            // get the edges of the current vert
            let currentEdges = this.adjList[i].edges;

            // create container of binary edges
            let currentBinaryEdges = [];

            // console.log("currentVert: ", this.adjList[i].id);
            // console.log("currentEdges: ", currentEdges);

            if(!binaryEdges[row]){
                binaryEdges[row]=[];
            } 

            // does each neighbor exist in current edges?
            // check north
            if(currentEdges.indexOf(north) !== -1) {
                currentBinaryEdges.push(1);
            } else {
                currentBinaryEdges.push(0);
            }

            // check east
            if(currentEdges.indexOf(east) !== -1) {
                currentBinaryEdges.push(1);
            } else {
                currentBinaryEdges.push(0);
            }

            // check south
            if(currentEdges.indexOf(south) !== -1) {
                currentBinaryEdges.push(1);
            } else {
                currentBinaryEdges.push(0);
            }

            // check west
            if(currentEdges.indexOf(west) !== -1) {
                currentBinaryEdges.push(1);
            } else {
                currentBinaryEdges.push(0);
            }

            binaryEdges[row].push(currentBinaryEdges);
        }
        return binaryEdges;
    }

    // the simplest and most inefficient method
    createMazeAldous() {
        // pick random vertex, add to maze
        let currentVert = this.adjList[Math.floor(Math.random() * this.adjList.length)];
        let maze = [currentVert.id];
        
        // while any cells are not in maze
        while(maze.length < this.adjList.length) {

            // choose random neighbor of currentVert and travel to it
            let r = Math.floor(Math.random() * currentVert.neighbors.length);
            let neighbor = currentVert.neighbors[r];

            // if neighbor not in maze, add it to maze and create edge
            if(maze.indexOf(neighbor) === -1) {
                this.createEdge(currentVert.id, neighbor);
                maze.push(neighbor);
            } 
            currentVert = this.adjList[neighbor];
        }
    }

    // most efficient and most complicated method
    // also known as "Loop erased walk" method
    createMazeWilsons() {

        /**
         * randomly add cell to visited
         * pick another random, unvisited cell
         * walk randomly from second random cell
         *  if walk to cell already in path, erase the loop
         *  if new cell is in visited
         *      add edges along the path
         * pick new random unvisited cell
         */

        let maze = [];
        let options = [];
        // populate the options array with ints from 0 to length of adjacency list
        // this is a mutable stand-in for the adjList
        for(let i=0;i<this.adjList.length;i++) {
            options[i] = i;
        }

        // choose random vert to start with, remove from options
        let randVert = Math.floor(Math.random() * options.length);
        maze.push(randVert);
        options.splice(randVert, 1);

        // performs the loop erased walk
        while(maze.length < this.adjList.length) {
            
            // select any vert not in maze and perform random walk until you encounter a vert in the maze
            let root = options[Math.floor(Math.random() * options.length)];
            let path = [root];

            // performs the walk
            while(true) {
                
                // get random neighbor of last in path
                let step = path[path.length - 1];

                let randNeighbor = this.adjList[step].neighbors[Math.floor(Math.random() * this.adjList[step].neighbors.length)];
                
                // is neighbor in maze?
                if(maze.indexOf(randNeighbor) !== -1) {

                    // add path to maze
                    path.forEach(el => { 
                        maze.push(el);
                        options.splice(options.indexOf(el), 1);
                    });
                    
                    // add randNeighbor to path AFTER path added to maze
                    // randNeighbor is already in maze, according to the if statement above
                    path.push(randNeighbor);

                    // make the necessary edges along the path
                    for (let i=0; i<path.length-1; i++) {
                        this.createEdge(path[i], path[i+1]);
                    }

                    // break
                    break;
                } 
                // is neighbor in path?
                if(path.indexOf(randNeighbor) !== -1) {
                    // if yes,
                    // remove all from path after neighbor
                    // this erases the loop in the path
                    path.splice(path.indexOf(randNeighbor)+1);

                    if(path.length <= 0) {
                        break;
                    }
                } else {
                    // step to the random neighbor
                    path.push(randNeighbor);
                }
                    
                
            }
        }
    }
}
