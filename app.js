const PORT = 5000;
var express = require('express');
var app = express();
var server = app.listen(PORT, function(){console.log('gobang server running on port : ' + PORT);});
app.use(express.static('public'));

var io = require('socket.io')(server);
var games = [];


io.on('connection', function (socket) {
  var clientIp = socket.request.connection.remoteAddress;
  console.log('new client from: '+clientIp);
  socket.emit('games_update', games);


  socket.on('new_game', function (gameName) {
    var newGame = {
      id: createID(),
      name: gameName,
      players: [],
      turn: 0,
    }
    games.push(newGame);
    io.sockets.emit('games_update', games);
  });

  socket.on('join_game', function (gameID) {
    var game;
    if(findGameById(gameID) != null){
      game = games[findGameById(gameID)];
      if(game.players.length < 2 && game.players.indexOf(socket.id) == -1){
        game.players.push(socket.id);
        io.sockets.emit('games_update', games);
        socket.emit('joinAllowed', true, game.id);
      }else{
        socket.emit('joinAllowed', false, game.id);
      }
    }

  });

  socket.on('leave_game', function (gameID) {
    var game;
    if(findGameById(gameID) != null){
      game = games[findGameById(gameID)];
      game.players.splice(game.players.indexOf(socket.id), 1);
      io.sockets.emit('games_update', games);
    }
  });

  socket.on('remove_game', function (gameID) {
    if(findGameById(gameID) != null){
      games.splice(findGameById(gameID), 1);
      io.sockets.emit('games_update', games);
    }
  });

  socket.on('disconnect', function () {
    for (var i = 0; i < games.length; i++) {
      for (var j = games[i].players.length -1; j >= 0; j--){
        if(games[i].players[j] == socket.id){
          games[i].players.splice(j, 1);
        }
      }
    }
    io.sockets.emit('games_update', games);
  });
});

function createID() {
  var chars = 'abcdefghijklmnopqrstuvwxyz12345678901234567890';
  var newId = '';
  for (var i = 0; i < 6; i++) {
    newId += chars[Math.floor(Math.random()*chars.length)];
  }
  return newId;
}

function findGameById(id){
  var index = null;
  for (var i = 0; i < games.length; i++) {
    if(games[i].id == id){
      index = i;
    }
  }
  return index;
}
