const socket_io = require("socket.io");
const http = require("http");
const gomoku = require('./gomoku.js');
const mysql = require("mysql");
const crypto = require("crypto");
const mysqlConfig = require("./mysqlConfig.js");
var server = http.createServer().listen(3013, err => { if (err) throw err; console.log("Gomoku Running on port 3013") });
var io = socket_io(server, { pingInterval: 500, pingTimeout: 5000 });

var conn = mysql.createConnection(mysqlConfig.mysqlConfig);
conn.connect(err => {
    if (err) throw err;
    console.log("Connected to database!");
});


var games = [];
var usersConnected = [];

io.on('connection', (socket) => {

    socket.on("login", (username, password) => {
        var hashedPwd = crypto.createHash('sha256').update(password).digest('hex');
        conn.query(`SELECT * FROM users WHERE username = '${username}';`, (err, data) => {
            if (err) throw err;
            if (data.length > 0) {
                if (data[0].password == hashedPwd) {
                    socket.emit('loginSuccess', [username, password]);
                    usersConnected.push({
                        username: data[0].username,
                        socketId: socket.id,
                    });
                } else {
                    socket.emit('loginError', "Incorrect Password");
                }
            } else {
                socket.emit('loginError', "Username not found");
            }
        });
    });

    socket.on('createAccount', (username, password) => {
        // Validate inputs 
        if (username.length <= 2 || username.length > 100) {
            socket.emit("createAccountError", "Username must be more than 2 and less than 100 characters");
            return;
        }
        if (password.length < 8) {
            socket.emit("createAccountError", "Password must be 8 or more characters");
            return;
        }
        // Check if username already exists
        conn.query(`SELECT * FROM users WHERE username = '${username}';`, (err, data) => {
            if (err) throw err;
            if (data.length == 0) {
                // Username does not exist
                var hashedPwd = crypto.createHash('sha256').update(password).digest('hex');;

                conn.query(`INSERT INTO users (username, password) VALUES ('${username}', '${hashedPwd}')`);
                socket.emit('successfulAccountCreation', [username, password]);

            } else {
                socket.emit("createAccountError", "This username already exists. Please choose a different one.");
            }
        });

    });

    socket.on('deleteAccount', (username) => {

        conn.query(`DELETE FROM users WHERE username = '${username}';`, (err, data) => {
            if (err) throw err;
            if (data.affectedRows > 0) {
                socket.emit("accountDeleted");
            }
        });

    });


    socket.on('getFriends', (userDataJson) => {
        var userData = JSON.parse(userDataJson);
        conn.query(`SELECT * FROM friends WHERE user1 = '${userData.name}'; `, (err, data) => {
            if (err) throw err;
            var friends = [];
            data.forEach(item => {
                friends.push({
                    state: item.state,
                    userInfo: {
                        name: item.user2,
                    },
                });
            });
            socket.emit('returnFriends', friends);
        });
    });

    socket.on('newFriend', (myName, newFriendName) => {
        // Make sure friends are not equal
        if (myName == newFriendName) {
            socket.emit("newFriendError", "You can't be friends with youself.");
            return;
        }

        // Check if newfriend exists;
        conn.query(`SELECT * FROM users WHERE username = '${newFriendName}';`, (err, data) => {
            if (err) throw err;
            if (data.length > 0) {
                conn.query(`SELECT * FROM friends WHERE user1 = '${myName}' AND user2 = '${newFriendName}';`, (err, data) => {
                    if (err) throw err;
                    if (data.length > 0) {
                        socket.emit('newFriendError', "You are already friends with this person");
                    } else {
                        // Insert new friend records into database
                        conn.query(`INSERT INTO friends (user1, user2, state) VALUES ('${myName}', '${newFriendName}', 0);`)
                        conn.query(`INSERT INTO friends (user1, user2, state) VALUES ('${newFriendName}', '${myName}', 1);`)
                        // Send back new friend data, so user can insert it into the scroll view
                        socket.emit('newFriendSuccess', {
                            userInfo: {
                                name: newFriendName,
                            },
                            state: 0,
                        });
                        // Send new friend data to other person
                        var connectedFriend = getConnectedUserByName(newFriendName);
                        if (connectedFriend) {
                            io.sockets.connected[connectedFriend.socketId].emit('newFriendRequest', {
                                userInfo: {
                                    name: userData.name,
                                },
                                state: 1,
                            });
                        }
                    }
                });
            } else {
                socket.emit("newFriendError", "This user does not exist");
            }
        });
    });

    socket.on('acceptFriend', (userInfoJson, friendInfoJson) => {
        var userData = JSON.parse(userInfoJson);
        var friendData = JSON.parse(friendInfoJson);
        conn.query(`UPDATE friends SET state = 2 WHERE user1 = '${userData.name}' AND user2 = '${friendData.name}';`);
        conn.query(`UPDATE friends SET state = 2 WHERE user1 = '${friendData.name}' AND user2 = '${userData.name}';`);
        socket.emit('friendAccepted', friendData);
        var connectedFriend = getConnectedUserByName(friendData.name);
        if (connectedFriend) {
            io.sockets.connected[connectedFriend.socketId].emit('friendAccepted', userData);
        }
    });

    socket.on('deleteFriend', (userInfoJson, friendInfoJson) => {
        var userData = JSON.parse(userInfoJson);
        var friendData = JSON.parse(friendInfoJson);
        conn.query(`DELETE FROM friends WHERE user1 = '${userData.name}' AND user2 = '${friendData.name}';`);
        conn.query(`DELETE FROM friends WHERE user1 = '${friendData.name}' AND user2 = '${userData.name}';`);
        socket.emit('friendDeleted', friendData);
        var connectedFriend = getConnectedUserByName(friendData.name);
        if (connectedFriend) {
            io.sockets.connected[connectedFriend.socketId].emit('friendDeleted', userData);
        }
    });

    socket.on('newGame', (player1Json, player2Json) => {
        var player1 = JSON.parse(player1Json);
        var player2 = JSON.parse(player2Json);
        var newGame = {
            id: generateId(player1.name, player2.name),
            players: [player1, player2],
            turn: 0,
            state: 0,
            winners: [],
            board: create2dArray(21),
        }
        games.push(newGame);
        socket.emit("returnNewGame", newGame);
        var connectedFriend = getConnectedUserByName(player2.name);
        if (connectedFriend) {
            io.sockets.connected[connectedFriend.socketId].emit('returnNewGame', newGame);
        }
    });

    socket.on("resetGame", (gameJson) => {
        var game = JSON.parse(gameJson);
        if (game.state == 1) {
            game.state = 0;
            game.board = create2dArray(21);
            for (var i = 0; i < game.players.length; i++) {
                var connectedPlayer = getConnectedUserByName(game.players[i].name);
                if (connectedPlayer) {
                    io.sockets.connected[connectedPlayer.socketId].emit("gameMove", game);
                }
            }
            games[getIndexFromGameId(game.id)] = game;
        }
    });

    socket.on('getGames', (userJson) => {
        var user = JSON.parse(userJson);
        var gamesForUser = [];
        games.forEach(game => {
            for (var i = 0; i < game.players.length; i++) {
                if (game.players[i].name == user.name) {
                    gamesForUser.push(game);
                }
            }
        });
        socket.emit('returnGames', gamesForUser);
    });

    socket.on('gameMove', (gameJson, x, y) => {
        var game = JSON.parse(gameJson);
        game = gomoku.gameLogic(game, x, y);
        if (game.state == 1) {
            // Game has been won, Record win in database. 
            var winner = game.players[game.winners[game.winners.length - 1]];
        }
        games[getIndexFromGameId(game.id)] = game;
        for (var i = 0; i < game.players.length; i++) {
            var connectedPlayer = getConnectedUserByName(game.players[i].name);
            if (connectedPlayer) {
                io.sockets.connected[connectedPlayer.socketId].emit("gameMove", game);
            }
        }
    });
    socket.on('removeGame', (gameJson) => {
        var game = JSON.parse(gameJson);
        var index = getIndexFromGameId(game.id);
        if (games[index]) {
            games.splice(i, 1);
            for (var i = 0; i < game.players.length; i++) {
                var connectedPlayer = getConnectedUserByName(game.players[i].name);
                if (connectedPlayer) {
                    io.sockets.connected[connectedPlayer.socketId].emit("gameRemoved", game);
                }
            }
        }
    });

    socket.on('disconnect', () => {
        for (var i = 0; i < usersConnected.length; i++) {
            if (usersConnected[i].socketId == socket.id) {
                usersConnected.splice(i, 1);
            }
        }
    });

});

function getUserInfoFromId(id, callback) {
    conn.query(`SELECT * FROM users WHERE id = '${id}'`, (err, result) => {
        if (err) throw err;
        callback(err, result);
    });
}

function userExists(username, callback) {
    conn.query(`SELECT id FROM users WHERE username = '${username}' AND tag = '${usertag}';`, (err, result) => {
        if (err) throw err;
        callback(err, result);
    });
}


function getConnectedUserByName(string) {
    for (var i = 0; i < usersConnected.length; i++) {
        if (usersConnected[i].username == string) {
            return usersConnected[i];
        }
    }
}
function create2dArray(size) {
    var array = new Array(size);
    for (var i = 0; i < size; i++) {
        array[i] = new Array(size);
        for (var j = 0; j < size; j++) {
            array[i][j] = 0;
        }
    }
    return array;
}

function generateId(n1, n2) {
    var alphabet = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ)(*&^%$#@!-=_+,.<>[]{}";
    var id = "";
    for (var i = 0; i < 64; i++) {
        id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    // Add usernames to game, for more uniqueness
    id += n1;
    id += n2;
    return id;
}

function getIndexFromGameId(gameId) {
    for (var i = 0; i < games.length; i++) {
        if (games[i].id == gameId) {
            return i;
        }
    }
}