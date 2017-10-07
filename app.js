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
      board: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    }
    games.push(newGame);
    io.sockets.emit('games_update', games);
  });

  socket.on('join_game', function (gameID) {
    var game;
    if(findGameById(gameID) != null){
      game = games[findGameById(gameID)];
      var alreadyJoined = false;
      for (var i = 0; i < game.players.length; i++) {
        if(game.players[i].id == socket.id){
          alreadyJoined = true;
        }
      }
      if(game.players.length < 2 && !alreadyJoined){
        var avaliableColours = [1, 2];
        for (var i = 0; i < game.players.length; i++) {
          avaliableColours.splice(avaliableColours.indexOf(game.players[i].colour), 1);
        }
        var col = avaliableColours[0];
        game.players.push({id : socket.id, colour: col});
        io.sockets.emit('games_update', games);
        emitGameUpdate(game);
        socket.emit('joinAllowed', true, game.id);
      }else{
        socket.emit('joinAllowed', false, game.id);
      }
    }

  });

  socket.on('move', function (x, y, gameID) {
    var game;
    if(findGameById(gameID) != null){
      var player = null;
      game = games[findGameById(gameID)];
      for (var i = 0; i < game.players.length; i++) {
        if(game.players[i].id == socket.id){
          player = game.players[i];
        }
      }
      if(player != null){
        if(game.board[x][y] == 0){
          game.board[x][y] = player.colour;
          if(game.turn == 0){
            game.turn = 1;
          }else {
            game.turn = 0;
          }
          game = doGameLogic(game);
          emitGameUpdate(game);
        }
      }

    }
  });

  socket.on('leave_game', function (gameID) {
    var game;
    if(findGameById(gameID) != null){
      game = games[findGameById(gameID)];
      var pid = null;
      for (var i = 0; i < game.players.length; i++) {
        if(game.players[i].id == socket.id){
          pid = i;
        }
      }
      if(pid != null){
        game.players.splice(pid, 1);
        io.sockets.emit('games_update', games);
      }
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
        if(games[i].players[j].id == socket.id){
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

function emitGameUpdate(g) {
  for (var i = 0; i < g.players.length; i++) {
    io.to(g.players[i].id).emit('game_update', g);
  }
}

function doGameLogic(g) {
  var game = g;
  return g;
}
