var board;
var turn = 'hound';
var animalHTMLElements = [];

function newBoard(fox) {
    let grid = new Grid(8, 8);
    let node = grid.getNode(3, 2);
    node.walkable = false;
    node = grid.getNode(5, 2);
    node.walkable = false;
    node = grid.getNode(7, 2);
    node.walkable = false;

    PathFinder.aStar(grid.getNode(5, 0), grid.getNode(6, 7), grid)
}

class Grid {
    //Creates the chessboard
    constructor(width, height) {
        this.grid = new Array(height);
        this.width = width;
        this.height = height;

        let walkable = false;
        for (let y = 0; y < height; y++) {
            let row = new Array(width);
            for (let x = 0; x < width; x++) {
                row[x] = new Node(x, y, walkable);
                walkable = !walkable;
            }
            walkable = !walkable;
            this.grid[y] = row;
        }
    }

    // Gets node for given x, y.
    getNode(x, y) {
        return this.grid[y][x];
    }

    // Returns list with neighbour nodes.
    getNeighbors(node) {
        let x = node.x,
            y = node.y,
            neighbours = [];

        // get left above node
        if (x - 1 >= 0 && y -1 >= 0) {
            let node =  this.getNode(x - 1, y - 1);
            if (node.walkable) {
                neighbours.push(node);
            }
        }
        // get right above node
        if (x + 1 <= this.width - 1 && y -1 >= 0) {
            let node = this.getNode(x + 1, y - 1);
            if (node.walkable) {
                neighbours.push(node);
            }
        }
        // get left under node
        if (x - 1 >= 0 && y + 1 <= this.height - 1) {
            let node = this.getNode(x - 1, y + 1);
            if (node.walkable) {
                neighbours.push(node);
            }
        }
        // get right under node
        if (x + 1 <= this.width - 1 && y + 1 <= this.height - 1) {
            let node = this.getNode(x + 1, y + 1);
            if (node.walkable) {
                neighbours.push(node);
            }
        }
        return neighbours;
    }
}

class Node {
    constructor(x, y, walkable, animal) {
        this.x = x;
        this.y = y;
        this.walkable = walkable;
    }
}

class PathFinder {
    static aStar (startNode, endNode, grid) {
        let openList = [],
            closedList = [],
            node,
            neighbours,
            i, neighbour, a, b, ng;

        openList.push(startNode);

        while (openList.length) {
            node = openList.pop();
            node.closed = true;

            node.g = 0;
            node.f = 0;

            if (node === endNode) {
                let path = [];
                while(node.parent && node !== startNode) {
                    node = node.parent;
                    path.push(node);
                }
                return path;
            }

            neighbours = grid.getNeighbors(node);

            for (i = 0; i < neighbours.length; i++) {
                // neighbour g
                neighbour = neighbours[i];
                a = neighbour.x - node.x;
                b = neighbour.y - node.y;
                ng = node.g + Math.sqrt(a*a + b*b);

                if (!neighbour.opened || ng < neighbour.g) {
                    neighbour.g = ng;
                    neighbour.h = manhattanDistance(neighbour, endNode);
                    neighbour.f = neighbour.g + neighbour.h;
                    neighbour.parent = node;
                    if (!neighbour.opened) {
                        neighbour.opened = true;
                        openList.push(neighbour)
                    } else {
                        replaceOpenList(neighbour)
                    }
                }
            }

            // Sorting list
            openList.sort(function(a, b){
                return a.f - b.f
            });
        }

        function replaceOpenList(node) {
            for (let i = 0; i < openList.length; i++) {
                if (openList[i].x === node.x && openList[i].y === node.y) {
                    openList[i] = node;
                }
            }
        }

        function manhattanDistance(startNode, endNode) {
            let dx = Math.abs(startNode.x, endNode.x);
            let dy = Math.abs(startNode.y, endNode.y);
            return dx + dy;
        }
    }
}