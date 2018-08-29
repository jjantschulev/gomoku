const socket_io = require("socket.io");
const http = require("http");
const gomoku = require('./gomoku.js');
const mysql = require("mysql");
const mysqlConfig = require("./mysqlConfig.js");
var server = http.createServer().listen(3013, err => { if (err) throw err; console.log("Gomoku Running on port 3013") });
var io = socket_io(server, { pingInterval: 500, pingTimeout: 1000 });

var conn = mysql.createConnection(mysqlConfig.mysqlConfig);
conn.connect(err => {
    if (err) throw err;
    console.log("Connected to database!");
});


var games = [];
var usersConnected = [];

io.on('connection', (socket) => {

    socket.on('register', (dataJson) => {
        var data = JSON.parse(dataJson);
        usersConnected.push({
            username: data.name,
            usertag: data.tag,
            socketId: socket.id,
            userId: data.id,
        });
        socket.emit('registered');
    })

    socket.on('createAccount', (username) => {
        // Generate user TAG
        if (username.length <= 2) return;
        var usertag = 1;
        conn.query(`SELECT * FROM users WHERE username = '${username}' ORDER BY tag DESC;`, (err, data) => {
            if (err) throw err;
            if (data.length > 0) {
                usertag = data[0].tag + 1;
            }
            conn.query(`INSERT INTO users (username, tag) VALUES ('${username}', '${usertag}')`);
            console.log("Success. Account created: " + username + '#' + usertag);
            socket.emit('successfulAccountCreation', {
                name: username,
                tag: usertag,
                id: username + '#' + usertag,
            });
        });

    });

    socket.on('getFriends', (userDataJson) => {
        var userData = JSON.parse(userDataJson);
        conn.query(`SELECT * FROM friends WHERE user1 = '${userData.id}'; `, (err, data) => {
            if (err) throw err;
            var friends = [];
            data.forEach(item => {
                var userInfo = getUserNameAndTag(item.user2);
                friends.push({
                    state: item.state,
                    userInfo: {
                        name: userInfo.username,
                        tag: userInfo.usertag,
                        id: userInfo.username + '#' + userInfo.usertag,
                    },
                });
            });
            socket.emit('returnFriends', friends);
        });
    });

    socket.on('newFriend', (userDataJson, newFriendId) => {
        var userData = JSON.parse(userDataJson);
        var newFriendInfo = getUserNameAndTag(newFriendId);
        // Check if newfriend exists;
        if (userData.id == newFriendId) {
            socket.emit("newFriendError", "You can't be friends with youself.");
            return;
        }

        getUserIdFromInfo(newFriendInfo.username, newFriendInfo.usertag, (err, result) => {
            if (err) throw err;
            if (result.length == 1) {
                // Checking if these people are already friends
                conn.query(`SELECT * FROM friends WHERE user1 = '${userData.id}' AND user2 = '${newFriendId}';`, (err, data) => {
                    if (err) throw err;
                    if (data.length > 0) {
                        socket.emit('newFriendError', "You are already friends with this person");
                    } else {
                        // Insert new friend record into database
                        conn.query(`INSERT INTO friends (user1, user2, state) VALUES ('${userData.id}', '${newFriendId}', 0);`)
                        conn.query(`INSERT INTO friends (user1, user2, state) VALUES ('${newFriendId}', '${userData.id}', 1);`)
                        // Send back new friend data, so user can insert it into the scroll view
                        socket.emit('newFriendSuccess', {
                            userInfo: {
                                name: newFriendInfo.username,
                                tag: newFriendInfo.usertag,
                                id: newFriendInfo.username + '#' + newFriendInfo.usertag,
                            },
                            state: 0,
                        });
                        // Send new friend data to other person
                        var connectedFriend = getConnectedUserById(newFriendId);
                        if (connectedFriend) {
                            io.sockets.connected[connectedFriend.socketId].emit('newFriendRequest', {
                                userInfo: {
                                    name: userData.name,
                                    tag: userData.tag,
                                    id: userData.name + '#' + userData.tag,
                                },
                                state: 1,
                            });
                        }
                    }
                })
            } else {
                // The new friend does not exist. Maybe a typo???
                socket.emit('newFriendError', "This user does not exist. Maybe a typo?")
            }
        });
    });

    socket.on('acceptFriend', (userInfoJson, friendInfoJson) => {
        var userData = JSON.parse(userInfoJson);
        var friendData = JSON.parse(friendInfoJson);
        conn.query(`UPDATE friends SET state = 2 WHERE user1 = '${userData.id}' AND user2 = '${friendData.id}';`);
        conn.query(`UPDATE friends SET state = 2 WHERE user1 = '${friendData.id}' AND user2 = '${userData.id}';`);
        socket.emit('friendAccepted', friendData);
        var connectedFriend = getConnectedUserById(friendData.id);
        if (connectedFriend) {
            io.sockets.connected[connectedFriend.socketId].emit('friendAccepted', userData);
        }
    });

    socket.on('deleteFriend', (userInfoJson, friendInfoJson) => {
        var userData = JSON.parse(userInfoJson);
        var friendData = JSON.parse(friendInfoJson);
        conn.query(`DELETE FROM friends WHERE user1 = '${userData.id}' AND user2 = '${friendData.id}';`);
        conn.query(`DELETE FROM friends WHERE user1 = '${friendData.id}' AND user2 = '${userData.id}';`);
        socket.emit('friendDeleted', friendData);
        var connectedFriend = getConnectedUserById(friendData.id);
        if (connectedFriend) {
            io.sockets.connected[connectedFriend.socketId].emit('friendDeleted', userData);
        }
    });

    socket.on('newGame', (player1Json, player2Json) => {
        var player1 = JSON.parse(player1Json);
        var player2 = JSON.parse(player2Json);
        var newGame = {
            players: [player1, player2],
            turn: 0,
            state: 0,
            winners: [],
            board: create2DArray(21, 21),
        }
        games.push(newGame);
    });

    socket.on('getGames', (userJson) => {
        var user = JSON.parse(userJson);
        var gamesForUser = [];
        games.forEach(game => {
            if (game.players.indexOf(user) != -1) {
                gamesForUser.push(game);
            }
        });
        socket.emit('returnGames', gamesForUser);
    });

    socket.on('gameMove', (gameJson, x, y) => {
        var game = JSON.parse(gameJson);
        game = gomoku.gameLogic(game, x, y);
        for (var i = 0; i < game.players.length; i++) {
            io.sockets.connected[game.players[i].id].emit("gameMove", game);
        }
    });
    socket.on('removeGame', (gameJson) => {
        var game = JSON.parse(gameJson);
        if (games.indexOf(game) != -1) {
            games.splice(games.indexOf(game), 1);
            for (var i = 0; i < game.players.length; i++) {
                io.sockets.connected[game.players[i].id].emit("gameRemoved", game);
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

function getUserIdFromInfo(username, usertag, callback) {
    conn.query(`SELECT id FROM users WHERE username = '${username}' AND tag = '${usertag}';`, (err, result) => {
        if (err) throw err;
        callback(err, result);
    });
}

function getUserNameAndTag(string) {
    return {
        username: string.substring(0, string.lastIndexOf('#')),
        usertag: parseInt(string.substring(string.lastIndexOf('#') + 1, string.length)),
    }
}

function getConnectedUserById(string) {
    for (var i = 0; i < usersConnected.length; i++) {
        if (usersConnected[i].userId == string) {
            return usersConnected[i];
        }
    }
}
function create2DArray(numRows, numColumns) {
    let array = new Array(numRows);
    for (let i = 0; i < numColumns; i++) {
        array[i] = new Array(numColumns);
    }
    return array;
}
