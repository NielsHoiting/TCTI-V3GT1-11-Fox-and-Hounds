let engine;
function newGame() {
    engine = new Engine(document.getElementById("fox-player").value,
        document.getElementById("hounds-player").value,
        document.getElementById('board'));
}

function next() {
    if(!engine.checkWon() || engine.checkLoose()) {
        engine.next();
        setTimeout(next(), 100);
    }
}

class Engine {
    constructor (fox, hounds, board) {
        this.grid = new Grid(8, 8);
        this.board = new Board(board);
        this.grid.setHounds();
        this.grid.setFox(0);
        this.turn = 'fox';
        this.currentState = new State(this.grid, this.turn);
        this.board.draw(this.currentState);
    }

    next() {
        let state = this.currentState.getNextMove();
        this.currentState = state;
        this.turn = state.turn;
        this.board.draw(this.currentState);
    }

    // Check if fox has reached endNodes;
    checkWon() {
        let fox = this.currentState.grid.getFox();
        return fox.y === 0;
    }

    // Check if fox has no neighbours left
    checkLoose() {
        let fox = this.currentState.grid.getFox();
        if (!this.currentState.grid.getNeighbors(fox).length) {
            return true;
        }
    }
}

class Board {
    constructor(boardElement) {
        this.element = boardElement;
    }

    draw (state) {
        while(this.element.firstChild){
            this.element.removeChild(this.element.firstChild);
        }

        let grid = state.grid.getGrid();
        let gridObject = state.grid;
        for (let y = 0; y < gridObject.height; y++) {
            for (let x = 0; x < gridObject.width; x++) {
                if (grid[y][x].animal) {
                    let animalElement = document.createElement('div');
                    animalElement.style = 'left: ' + x * 75 + 'px; top: ' + y * 75 + 'px;';
                    animalElement.className = grid[y][x].animal;
                    animalElement.dataset.x = x;
                    animalElement.dataset.y = y;
                    animalElement.onclick = function(item) {
                        //engine.selectAnimal()
                        //this.selectAnimal();
                        let x = item.path[0].dataset.x,
                            y = item.path[0].dataset.y;
                        selectAnimal(x, y);
                    };

                    this.element.appendChild(animalElement);
                }
            }
        }
    }

    selectAnimal(x, y) {
        console.log(state, x, y);
    }
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

class State {
    // Turn is who is able to do a move after this state.
    constructor(grid, turn) {
        this.grid = grid;
        this.turn = turn;
    }

    getNextMove() {
        let possibleMoves = this.getPossibleStates();
        let bestMove = {value: null, state: []};
        for (let i = 0; i < possibleMoves.length; i++) {
            //TODO: simplify
            if (this.turn === 'hound') {
                let value = State.getValue(possibleMoves[i], 0, 4);
                if (!bestMove.value || value > bestMove.value) {
                    bestMove.value = value;
                    bestMove.state = [possibleMoves[i]];
                }
                if (bestMove.value === value) {
                    bestMove.state.push(possibleMoves[i]);
                }
            } else {
                let value = State.getValue(possibleMoves[i], 0, 4);
                if (!bestMove.value || value < bestMove.value) {
                    bestMove.value = value;
                    bestMove.state.push(possibleMoves[i]);
                }
                if (bestMove.value === value) {
                    bestMove.state.push(possibleMoves[i]);
                }
            }
        }
        return bestMove.state[Math.floor(Math.random() * bestMove.state.length)];
    }

    getPossibleStates() {
        // get the nodes that can move this round
        let states = [],
            nodes = this.turn === 'fox' ? [this.grid.getFox()] : this.grid.getHounds();
        for (let i = 0; i < nodes.length; i++) {
            let neighbours = this.grid.getNeighbors(nodes[i]);
            for (let j = 0; j < neighbours.length; j++) {
                let clonedGrid = this.grid.clone();
                clonedGrid.moveNode(nodes[i], neighbours[j]);
                let state = new State(clonedGrid);
                state.turn = this.turn === 'fox' ? 'hound' : 'fox';
                states.push(state);
            }
        }
        return states;
    }

    static getValue(state, depth, maxDepth) {
        //When max depth is reached we wanna calculate the min/max value for each end state.
        if (depth === maxDepth) {
            // TODO: use all finish nodes for calc.
            // TODO: check if we should give lowest or highest value back of all nodes.
            let value = state.turn = 'hound' ? -Infinity : Infinity;
            let endNode = state.grid.getNode(1, 0);

            let path = PathFinder.aStar(state.grid.fox, endNode, state.grid);

            if (path.length) {
                return path.length;
            } else {
                //TODO: always infinty? or do we need -Infinity?
                return Infinity;
            }
        }

        // if turn is hound we wanna maximize
        if (state.turn === 'hound') {
            return State.getMaxValue(state, depth, maxDepth);
        } else {
            return State.getMinValue(state, depth, maxDepth);
        }
    }

    static getMaxValue(state, dept, maxDepth) {
        let possibleStates = state.getPossibleStates(state.turn);
        let value = -Infinity;
        for (let i = 0; i < possibleStates.length; i++) {
            possibleStates[i].turn = state.turn === 'fox' ? 'hound' : 'fox';
            value = Math.max(value, State.getValue(possibleStates[i], dept + 1, maxDepth));
        }
        return value;
    }

    static getMinValue(state, dept, maxDepth) {
        let possibleStates = state.getPossibleStates(state.turn);
        let value = -Infinity;
        for (let i = 0; i < possibleStates.length; i++) {
            possibleStates[i].turn = state.turn === 'fox' ? 'hound' : 'fox';
            value = Math.min(value, State.getValue(possibleStates[i], dept + 1, maxDepth));
        }
        return value;
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
            node;
        
        // Distance from start
        startNode.g = 0;
        // Distance from start plus estimated distance to end;
        startNode.f = 0;
        startNode.opened = true;
        openList.push(startNode);

        while (openList.length) {
            // Getting the node that has the lowest estimated path from the openList
            node = openList.pop();
            node.closed = true;

            let neighbours = clonedGrid.getNeighbors(node);

            if (node.x === endNode.x && node.y === endNode.y) {
                let path = [];
                while(node.parent) {
                    path.push(node);
                    node = node.parent;
                }
                path.push(node);
                return path;
            }

            for (let n = 0; n < neighbours.length; n++) {
                let neighbour = neighbours[n];
                if (neighbour.closed) {
                    continue;
                }
                // The distance of this from the start of this neighbour is the current node + 1.
                let g = node.g + 1;
                // If this neighbour has not been opened this g score will be the best we found yet. OR
                // this node is already opened so check if the new path is faster than the old.
                if (!neighbour.opened || g < neighbour.g) {
                    // In both cases we wanna set the current node as parent. Because its the fastest way to get to this neighbour.
                    neighbour.parent = node;
                    // Set or update to the fastest distance from startNode to neighbour we have seen so far.
                    neighbour.g = g;
                    // Set the estimated distance to the end node for calculating the f value.
                    neighbour.h = manhattanDistance(neighbour, endNode);
                    // f is distance from start plus estimated distance to end
                    neighbour.f = neighbour.g + neighbour.h;

                    if(!neighbour.opened) {
                        openList.push(neighbour);
                        neighbour.opened = true;
                    } else {
                        replaceOpenList(neighbour);
                    }
                }
            }

            // Sorting list so the lowest f is up.
            openList.sort(function (a, b) {
                return b.f - a.f
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
            let dx = Math.abs(startNode.x - endNode.x);
            let dy = Math.abs(startNode.y - endNode.y);
            return dx + dy;
        }

        return [];
    }
}