function newBoard(fox) {
    let grid = new Grid(8, 8);
    grid.setFox(2);
    grid.setHounds();
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

    // Returns the grid object.
    getGrid() {
        return this.grid;
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
        if (x - 1 >= 0 && y - 1 >= 0) {
            let node = this.getNode(x - 1, y - 1);
            if (node.walkable) {
                neighbours.push(node);
            }
        }
        // get right above node
        if (x + 1 <= this.width - 1 && y - 1 >= 0) {
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

    // Setting fox on the x coordinate, only uneven x allowed. (0, 2, 4, 6).
    setFox(x) {
        if (x % 2 === 0) {
            let node = this.getNode(x, 7);
            node.walkable = false;
            node.animal = 'fox';
            this.fox = node;
        }
    }
    // Get the fox node.
    getFox() {
        return this.fox;
    }

    // Set hounds, hounds always start at the same coordinates.
    setHounds() {
        this.hounds = [];
        for (let x = 1; x < 8; x += 2) {
            let node = this.getNode(x, 0);
            node.walkable = false;
            node.animal = 'hound';
            this.hounds.push(node);
        }
    }
    // Get the hound nodes.
    getHounds() {
        return this.hounds;
    }

    // This function moves an animal
    moveNode(fromNode, toNode) {
        // We we will use the coordinates instead of the objects.
        let x = fromNode.x,
            y = fromNode.y,
            animal = fromNode.animal;
        fromNode = this.getNode(fromNode.x, fromNode.y);
        toNode = this.getNode(toNode.x, toNode.y);
        toNode.animal = animal;
        toNode.walkable = false;
        // Updating quick reference to fox or hounds
        if (animal === 'fox') {
            this.fox = toNode;
        } else {
            let hounds = this.getHounds();
            for (let i = 0; i < hounds.length; i++) {
                if(hounds[i].x === fromNode.x && hounds[i].y === fromNode.y) {
                    hounds[i] = toNode;
                }
            }
        }
        delete fromNode.animal;
        fromNode.walkable = true;
    }

    // Clone of grid.
    clone() {
        let width = this.width,
            height = this.height,
            gridObject = new Grid(width, height),
            grid = gridObject.getGrid(),
            fox = this.getFox(),
            hounds = this.getHounds();

        // setting fox and quick reference
        grid[fox.y][fox.x].animal = 'fox';
        grid[fox.y][fox.x].walkable = false;
        gridObject.fox = grid[fox.y][fox.x];

        // setting hounds and quick reference
        gridObject.hounds = [];
        for (let i = 0; i < hounds.length; i++) {
            grid[hounds[i].y][hounds[i].x].animal = 'hound';
            grid[hounds[i].y][hounds[i].x].walkable = false;
            gridObject.hounds.push(grid[hounds[i].y][hounds[i].x]);
        }
        return gridObject;
    }
}

class Node {
    constructor(x, y, walkable) {
        this.x = x;
        this.y = y;
        this.walkable = walkable;
    }
}

class PathFinder {
    static aStar(startNode, endNode, grid) {
        let clonedGrid = grid.clone();
        let openList = [],
            node,
            neighbours,
            i, neighbour, a, b, ng;

        openList.push(startNode);

        while (openList.length) {
            node = openList.pop();
            node.closed = true;

            node.g = 0;
            node.f = 0;

            if (node.x === endNode.x && node.y === endNode.y) {
                let path = [];
                while (node.parent && node !== startNode) {
                    node = node.parent;
                    path.push(node);
                }
                return path;
            }

            neighbours = clonedGrid.getNeighbors(node);

            for (i = 0; i < neighbours.length; i++) {
                // neighbour g
                neighbour = neighbours[i];
                a = neighbour.x - node.x;
                b = neighbour.y - node.y;
                ng = node.g + Math.sqrt(a * a + b * b);

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
            openList.sort(function (a, b) {
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

class State {
    constructor(grid, turn, maxDepth, depth) {
        this.grid = grid;
        this.turn = turn;
        this.heuristic = this.calculateHeuristic();
        if (maxDepth && depth < maxDepth) {
            this.possibleStates = this.getPossibleStates(depth, maxDepth)
        }
    }

    calculateHeuristic() {
        // Calculate the shortest way of the fox to the upper 4 nodes (1, 0) (3, 0), (5, 0), (7, 0)
        // TODO: make the heuristic more advanced?
        let h = Infinity;
        for (let x = 1; x < 8; x += 2) {
            let endNode = this.grid.getNode(x, 0);
            let path = PathFinder.aStar(this.grid.fox, endNode, this.grid);
            h = path && path.length < h ? path.length : h;
        }
        return h;
    }

    getPossibleStates(depth, maxDepth) {
        // get the nodes that can move this round
        let states = [],
            nodes = this.turn === 'fox' ? [this.grid.getFox()] : this.grid.getHounds();
        for (let i = 0; i < nodes.length; i++) {
            let neighbours = this.grid.getNeighbors(nodes[i]);
            for (let j = 0; j < neighbours.length; j++) {
                let clonedGrid = this.grid.clone();
                clonedGrid.moveNode(nodes[i], neighbours[j]);
                let state = new State(clonedGrid, this.turn === 'fox' ? 'hound' : 'fox', maxDepth, depth + 1);
                states.push(state);
            }
        }
        return states;
    }
}