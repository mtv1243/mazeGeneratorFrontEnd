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

        // for manual aldous maze generation
        this.manualAldousMaze = [];
        this.manualAldousCurrent;

        // for manual DFS maze creation
        this.dfsStack = [];
        this.dfsMaze = [];

        // for manual wilsons maze generation
        this.wilsonsMaze = [];
        this.wilsonsOptions = [];
        this.wilsonsRoot;
        this.wilsonsPath = [];

        this.manualWilsonsInit();

    }

    findVert(id) {
        return this.adjList[id] ? this.adjList[id] : -1;
    }

    printNeighbors() {
        this.adjList.forEach((vert) => {
            console.log(vert.id, vert.neighbors);
        })
    }

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

    // step by step example of the depth first search maze creation
    manualDfs(src=0) {

        // if all vertices are in the maze
        if(this.dfsMaze.length === this.adjList.length) {
            alert("All vertices are in the maze!");
            return;
        }

        // if the stack is empty
        // this should only evaluate to true the first time this is called
        if(this.dfsStack.length === 0) {
            this.dfsStack.push(src);
            this.dfsMaze.push(src);
        }

        // pop off last vert added to stack
        // this is LIFO
        let currentVertId = this.dfsStack.pop();
        let currentVert = this.adjList[currentVertId];
        let hasValidNeighbors = false;

        // if a neighbor has not been visited, change validNeighbors to true
        currentVert.neighbors.forEach(n=>{ 
            if(!this.dfsMaze.includes(n)) {
                hasValidNeighbors = true;
            }
        })

        // if currentVert has unvisited neighbors
        if(hasValidNeighbors) {
            
            // add current to stack
            this.dfsStack.push(currentVert.id);

            // find unvisited neighbors of current, hold in new array
            let validNeighbors = currentVert.neighbors.filter(n => !this.dfsMaze.includes(n));

            // grab random valid neighbor
            let nextVert = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
            // create edge between current and next
            this.createEdge(currentVertId, nextVert);
            // push to stack and mark as visited
            this.dfsStack.push(nextVert);
            this.dfsMaze.push(nextVert);
        }
    }

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

    // step by step example of the Aldous/Broder algorithm
    manualAldous() {

        if(this.manualAldousCurrent === undefined) {
            this.manualAldousCurrent = this.adjList[Math.floor(Math.random() * this.adjList.length)].id;
            this.manualAldousMaze.push(this.manualAldousCurrent);
        }
        
        // while any cells are not in maze
        if(this.manualAldousMaze.length === this.adjList.length) {
            alert("All vertices are in the maze!");
            return
        }

        let currentVert = this.manualAldousCurrent;
        
        // choose random neighbor of currentVert and travel to it
        let r = Math.floor(Math.random() * this.adjList[currentVert].neighbors.length);
        let neighbor = this.adjList[currentVert].neighbors[r];


        // if neighbor not in maze, add it to maze and create edge
        if(this.manualAldousMaze.indexOf(neighbor) === -1) {
            this.createEdge(currentVert, neighbor);
            this.manualAldousMaze.push(neighbor);
        } 
        this.manualAldousCurrent = neighbor;

    }

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

    manualWilsonsInit() {
        for(let i = 0; i < this.totalVerts; i++) {
            let vert = new Vertex(i, this.edgeLength);
            this.adjList.push(vert);

            this.wilsonsOptions.push(i);
        }

        // choose random vert to start with, remove from options
        let randVert = Math.floor(Math.random() * this.wilsonsOptions.length);
        this.wilsonsMaze.push(randVert);
        this.wilsonsOptions.splice(randVert, 1);

        this.wilsonsRoot = this.wilsonsOptions[Math.floor(Math.random() * this.wilsonsOptions.length)];
        
    }

    manualWilsonsAddPathToMaze(randNeighbor){
        // add path to maze
        this.wilsonsPath.forEach(el => { 
            this.wilsonsMaze.push(el);
            this.wilsonsOptions.splice(this.wilsonsOptions.indexOf(el), 1);
        });
        
        // add randNeighbor to path AFTER path added to maze because
        // randNeighbor is already in maze, according to the if statement above
        this.wilsonsPath.push(randNeighbor);

        // make the necessary edges along the path
        for (let i=0; i<this.wilsonsPath.length-1; i++) {
            this.createEdge(this.wilsonsPath[i], this.wilsonsPath[i+1]);
        }

        this.wilsonsPath = [];
        this.wilsonsRoot = this.wilsonsOptions[Math.floor(Math.random() * this.wilsonsOptions.length)];

    }

    maualWilsonsWalk() {
            
        // get random neighbor of last in path
        let step = this.wilsonsPath[this.wilsonsPath.length - 1];

        let randNeighbor = this.adjList[step].neighbors[Math.floor(Math.random() * this.adjList[step].neighbors.length)];
        
        // is neighbor in maze?
        if(this.wilsonsMaze.indexOf(randNeighbor) !== -1) {

            this.manualWilsonsAddPathToMaze(randNeighbor);
            return;
        }

        // is neighbor in path?
        if(this.wilsonsPath.indexOf(randNeighbor) !== -1) {
            // if yes,
            // remove all from path after neighbor
            this.wilsonsPath.splice(this.wilsonsPath.indexOf(randNeighbor) + 1);

            if(this.wilsonsPath.length <= 0) {
                return;
            }
        } else {
            // step to the random neighbor
            this.wilsonsPath.push(randNeighbor);
        }
    }

    // step by step through Wilson's Algorithm
    manualWilsons() {

        if(this.wilsonsMaze.length === this.adjList.length) {
            alert("All vertices are in the maze!");
            return;
        } else if(this.wilsonsMaze.length < this.adjList.length) {
            if(this.wilsonsPath.length === 0) {
                this.wilsonsPath.push(this.wilsonsRoot);
            }
            this.maualWilsonsWalk();
        }    
    }

    // also known as "Loop erased walk" method
    createMazeWilsons() {

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
            
            // select any vert not in visited and perform random walk until you encounter a vert in the visited
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
}