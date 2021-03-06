var width = 960,
    height = 960;

var N = 1 << 0,
    S = 1 << 1,
    W = 1 << 2,
    E = 1 << 3;

var cellSize = 4,
    cellSpacing = 4,
    cellWidth = Math.floor((width - cellSpacing) / (cellSize + cellSpacing)),
    cellHeight = Math.floor((height - cellSpacing) / (cellSize + cellSpacing)),
    cells = generateMaze(cellWidth, cellHeight), // each cell’s edge bits
    distance = 0,
    visited = new Array(cellWidth * cellHeight),
    frontier = [(cellHeight - 1) * cellWidth];

var canvas = d3.select("body").append("canvas")
    .attr("width", width)
    .attr("height", height);

var context = canvas.node().getContext("2d");

context.translate(
  Math.round((width - cellWidth * cellSize - (cellWidth + 1) * cellSpacing) / 2),
  Math.round((height - cellHeight * cellSize - (cellHeight + 1) * cellSpacing) / 2)
);

context.fillStyle = "#fff";
for (var y = 0, i = 0; y < cellHeight; ++y) {
  for (var x = 0; x < cellWidth; ++x, ++i) {
    fillCell(i);
    if (cells[i] & S) fillSouth(i);
    if (cells[i] & E) fillEast(i);
  }
}

d3.timer(function() {
  if (!(n0 = frontier.length)) return true;

  context.fillStyle = d3.hsl(distance++ % 360, 1, .5) + "";

  if (distance & 1) {
    for (var i = 0; i < n0; ++i) {
      fillCell(frontier[i]);
    }
  } else {
    var frontier1 = [],
        i0,
        i1,
        n0;

    for (var i = 0; i < n0; ++i) {
      i0 = frontier[i];
      if (cells[i0] & E && !visited[i1 = i0 + 1]) visited[i1] = true, fillEast(i0), frontier1.push(i1);
      if (cells[i0] & W && !visited[i1 = i0 - 1]) visited[i1] = true, fillEast(i1), frontier1.push(i1);
      if (cells[i0] & S && !visited[i1 = i0 + cellWidth]) visited[i1] = true, fillSouth(i0), frontier1.push(i1);
      if (cells[i0] & N && !visited[i1 = i0 - cellWidth]) visited[i1] = true, fillSouth(i1), frontier1.push(i1);
    }

    frontier = frontier1;
  }
});

function fillCell(i) {
  var x = i % cellWidth, y = i / cellWidth | 0;
  context.fillRect(x * cellSize + (x + 1) * cellSpacing, y * cellSize + (y + 1) * cellSpacing, cellSize, cellSize);
}

function fillEast(i) {
  var x = i % cellWidth, y = i / cellWidth | 0;
  context.fillRect((x + 1) * (cellSize + cellSpacing), y * cellSize + (y + 1) * cellSpacing, cellSpacing, cellSize);
}

function fillSouth(i) {
  var x = i % cellWidth, y = i / cellWidth | 0;
  context.fillRect(x * cellSize + (x + 1) * cellSpacing, (y + 1) * (cellSize + cellSpacing), cellSize, cellSpacing);
}

function generateMaze(width, height) {
  var cells = new Array(width * height), // each cell’s edge bits
      remaining = d3.range(width * height), // cell indexes to visit
      previous = new Array(width * height); // current random walk

  // Add the starting cell.
  var start = remaining.pop();
  cells[start] = 0;

  // While there are remaining cells,
  // add a loop-erased random walk to the maze.
  while (!loopErasedRandomWalk());

  return cells;

  function loopErasedRandomWalk() {
    var i0,
        i1,
        x0,
        y0;

    // Pick a location that’s not yet in the maze (if any).
    do if ((i0 = remaining.pop()) == null) return true;
    while (cells[i0] >= 0);

    // Perform a random walk starting at this location,
    previous[i0] = i0;
    while (true) {
      x0 = i0 % width;
      y0 = i0 / width | 0;

      // picking a legal random direction at each step.
      i1 = Math.random() * 4 | 0;
      if (i1 === 0) { if (y0 <= 0) continue; --y0, i1 = i0 - width; }
      else if (i1 === 1) { if (y0 >= height - 1) continue; ++y0, i1 = i0 + width; }
      else if (i1 === 2) { if (x0 <= 0) continue; --x0, i1 = i0 - 1; }
      else { if (x0 >= width - 1) continue; ++x0, i1 = i0 + 1; }

      // If this new cell was visited previously during this walk,
      // erase the loop, rewinding the path to its earlier state.
      if (previous[i1] >= 0) eraseWalk(i0, i1);

      // Otherwise, just add it to the walk.
      else previous[i1] = i0;

      // If this cell is part of the maze, we’re done walking.
      if (cells[i1] >= 0) {

        // Add the random walk to the maze by backtracking to the starting cell.
        // Also erase this walk’s history to not interfere with subsequent walks.
        while ((i0 = previous[i1]) !== i1) {
          if (i1 === i0 + 1) cells[i0] |= E, cells[i1] |= W;
          else if (i1 === i0 - 1) cells[i0] |= W, cells[i1] |= E;
          else if (i1 === i0 + width) cells[i0] |= S, cells[i1] |= N;
          else cells[i0] |= N, cells[i1] |= S;
          previous[i1] = NaN;
          i1 = i0;
        }

        previous[i1] = NaN;
        return;
      }

      i0 = i1;
    }
  }

  function eraseWalk(i0, i2) {
    var i1;
    do i1 = previous[i0], previous[i0] = NaN, i0 = i1; while (i1 !== i2);
  }
}

d3.select(self.frameElement).style("height", height + "px");
