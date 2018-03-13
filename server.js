const app = require('express')();
const http = require('http').Server(app);
var io = require('socket.io')(http);

const port = 5000;
const x_coord = [-1, -1, -1, 0, 0, 1, 1, 1];
const y_coord = [-1, 0, 1, -1, 1, -1, 0, 1];

var games = {};


function displayBoard(board) {
    process.stdout.write('=================================================\n');
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            process.stdout.write((board[i][j]).toString());
        }
        process.stdout.write('\n');
    }
    process.stdout.write('=================================================\n');
}

function incrementNeighbors(board, x, y) {
    for (let i = x - 1; i < (x + 2); i++) {
        for (let j = y - 1; j < (y + 2); j++) {
            if (i >= 0 && i < 16 && j >= 0 && j < 16) {
                if (typeof board[i][j] == 'number')
                    board[i][j] += 1;
            }
        }
    }
    return board;
}

function generateBoard() {
    let board = [];
    for (let i = 0; i < 16; i++) {
        board.push([]);
        for (let j = 0; j < 16; j++) {
            board[i].push(0);
        }
    }

    var mine_set = new Set();
    while (mine_set.size < 40) {
        let i = Math.floor(Math.random() * 16);
        let j = Math.floor(Math.random() * 16);
        if (!mine_set.has(`${i},${j}`)) {
            board[i][j] = 'X';
            mine_set.add(`${i},${j}`);
            board = incrementNeighbors(board, i, j);
        }
    }
    displayBoard(board);
    return board;
}

function fill(x, y, board) {
    var coord_set = new Set([`${x},${y}`]);
    var coord_stack = [];
    coord_stack.push([x, y]);
    while (coord_stack.length > 0) {
        var coord = coord_stack.pop();
        let x = parseInt(coord[0]);
        let y = parseInt(coord[1]);
        if (board[x][y] !== 0) {
            continue;
        }
        for (var i = 0; i < 8; i++) {
            var new_x_coord = x + x_coord[i];
            var new_y_coord = y + y_coord[i];
            if (new_x_coord >= 0 && new_x_coord < 16 && new_y_coord >= 0 && new_y_coord < 16 && !coord_set.has(`${new_x_coord},${new_y_coord}`)) {
                coord_stack.push([new_x_coord, new_y_coord]);
                coord_set.add(`${new_x_coord},${new_y_coord}`);
            }
        }
    }
    coord_set.forEach(coord => coord_stack.push(coord));
    return coord_stack;

}

function getUnflaggedNeighbours(x, y, flags_placed, board) {
    var neighbours_to_reveal = [];
    var flag_count = 0;
    var mine_count = 0;
    for (var i = 0; i < 8; i++) {
        var new_x = x + x_coord[i];
        var new_y = y + y_coord[i];
        if (new_x >= 0 && new_x < 16 && new_y >= 0 && new_y < 16) {
            if (flags_placed.includes(`${new_x},${new_y}`)) {
                flag_count++;
            } else {
                if(board[new_x][new_y] === 'X'){
                    mine_count++;
                    neighbours_to_reveal.push(`${new_x},${new_y}`);
                } else {
                    neighbours_to_reveal.unshift(`${new_x},${new_y}`);
                }
            }
        }
    }

    if (board[x][y] === flag_count) {
        return [neighbours_to_reveal, mine_count];
    } else {
        return false;
    }
}

function getMines(board) {
    var mine_coords = [];
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            if (board[i][j] === 'X') {
                mine_coords.push([i, j]);
            }
        }
    }
    return mine_coords;
}

function checkClick(x, y, board, socket) {
    x = parseInt(x);
    y = parseInt(y);
    if (board[x][y] === 'X') {
        io.to(socket.id).emit('mine', getMines(board), x, y);
    } else if (board[x][y] === 0) {
        var coord_with_values = fill(x, y, board).map(coord => {
            var row = parseInt(coord.split(',')[0]);
            var col = parseInt(coord.split(',')[1]);
            return [row, col, board[row][col]];
        });
        io.to(socket.id).emit('fill', coord_with_values);
    } else {
        io.to(socket.id).emit('single', board[x][y], x, y);
    }
}


app.get('/api/hello', (req, res) => {
    res.send({ express: 'Hello From Express' });
});

io.on('connection', (socket) => {
    console.log('a user connected with id' + socket.id);
    games[socket.id] = generateBoard();

    socket.on('disconnect', function () {
        console.log('user disconnected');
        delete games[socket.id];
    });

    socket.on('click', (x, y) => {
        console.log(`${socket.id} ${x} ${y}`);
        checkClick(x, y, games[socket.id], socket);
    });

    socket.on('new-game', () => {
        games[socket.id] = generateBoard();
        io.to(socket.id).emit('new-game');
    });

    socket.on('add-flag', (x, y) => {
        io.to(socket.id).emit('add-flag', x, y);
    });

    socket.on('remove-flag', (x, y) => {
        io.to(socket.id).emit('remove-flag', x, y);
    });

    socket.on('reveal-neighbours', (x, y, flags_placed) => {
        var neighbours = getUnflaggedNeighbours(x, y, flags_placed, games[socket.id]);
        if (neighbours) {
            for (var i in neighbours[0]) {
                let x = neighbours[0][i].split(',')[0];
                let y = neighbours[0][i].split(',')[1];
                checkClick(x, y, games[socket.id], socket);
            }
            if(neighbours[1] > 0){

            }
        }
    });

});

http.listen(port, () => console.log(`Listening on port ${port}`));