
var dirs = [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 },
{ x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }]


module.exports.gameLogic = function (game, newX, newY) {
    var turnColor = game.turn == 0 ? 1 : -1;
    var otherColor = game.turn == 0 ? -1 : 1;
    if (game.board[newX][newY] == 0) {
        game.board[newX][newY] = turnColor;
        outerLoop:
        for (var x = 0; x < game.board.length; x++) {
            for (var y = 0; y < game.board[x].length; y++) {
                if (game.board[x][y] == turnColor) {
                    // Check for win:
                    for (var i = 0; i < dirs.length; i++) {
                        var count;
                        for (var n = 0; n < 5; n++) {
                            if (!outOfBounds(x + dirs[i].x * n, y + dirs[i].y * n)) {
                                if (game.board[x + dirs[i].x * n][y + dirs[i].y * n] == turnColor) {
                                    count++;
                                }
                            }
                        }
                        if (count == 5) {
                            game.state = 1;
                            game.winners.push(game.turn);
                            break outerLoop;
                        }
                    }
                }
            }
        }
        // Steal Pieces;
        for (var i = 0; i < dirs.length; i++) {
            otherColorCount = 0;
            for (var n = 1; n < 3; n++) {
                if (!outOfBounds(x + dirs[i].x * n, y + dirs[i].y * n)) {
                    if (game.board[x + dirs[i].x * n][y + dirs[i].y * n] == otherColor) {
                        otherColorCount++;
                    }
                }
            }
            if (!outOfBounds(x + dirs[i].x * 3, y + dirs[i].y * 3)) {
                if (otherColorCount == 2 && game.board[x + dirs[i].x * 3][y + dirs[i].y * 3 == turnColor]) {
                    for (var n = 1; n < 3; n++) {
                        game.board[x + dirs[i].x * n][y + dirs[i].y * n] = 0;
                    }
                }
            }
        }
        game.turn = game.turn == 0 ? 1 : 0;
    }
    return game;
}
function outOfBounds(x, y) {
    if (x < 0 || y < 0 || y >= 21 || y >= 21) {
        return false;
    }
    return true;
}
