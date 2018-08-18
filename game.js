var board;
var turn = 'hound';
var animalHTMLElements = [];

function newBoard(fox) {
    let grid = new Grid(8, 8);
    let node = grid.getNode(2, 0);
}

class Grid {
    //Creates the chessboard
    constructor(width, height) {
        this.grid = new Array(height);
        this.width = width;
        this.height = height;

        let walkable = true;
        for (let y = 0; y < height; y++) {
            let row = new Array(width);
            for (let x = 0; x < width; x++) {
                row[x] = new Node(x, y, walkable);
                walkable = !walkable;
            }
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
            let node = this.getNode(x + 1, y - 1)
            if (node.walkable) {
                neighbours.push(node);
            }
        }
        // get left under node
        if (x - 1 >= 0 && y + 1 <= this.height - 1) {
            let node = this.getNode(x - 1, y + 1)
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

}