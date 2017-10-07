var socket = io(window.location.href);

socket.on('games_update', function (data) {
  console.log('gs');
  clearGames();
  for (var i = 0; i < data.length; i++) {
    addGame(data[i].name, data[i].players.length, data[i].id);
  }
});

socket.on('joinAllowed', function (allowed, id) {
  if(allowed){
    // alert('allowed to join game');
    connected = true;

    for (var i = 0; i < document.getElementsByClassName('game_card').length; i++) {
      if(document.getElementsByClassName('game_card')[i].childNodes[2].getAttribute('data-id') == id){
        document.getElementsByClassName('game_card')[i].childNodes[2].outerHTML = '<div data-id="'+id+'" onclick="leaveGame(this)" class="leave_btn"><p><i class="material-icons">cancel</i></p></div>';
      }
    }
  }else {
    // alert('REJECTED !!??!!?!?!??!');
  }
});

socket.on('game_update', function (g) {
  game = g;
  pieces = [];
  for (var y = 0; y < game.board.length; y++) {
    for (var x = 0; x < game.board[y].length; x++) {
      var val = game.board[y][x];
      if(val > 0){
        pieces.push(new Piece(x, y, val));
      }
    }
  }
  console.log(g);
});

function makeMove () {
  if(game != null && connected && playing){
    if(game.players[game.turn].id == socket.id){
      for(var x = 0; x < BOARD_COLS; x++){
        for(var y = 0; y < BOARD_ROWS; y++){
          if(mX > x*GRID_SIZE && mX < x * GRID_SIZE + GRID_SIZE){
            if(mY > y*GRID_SIZE && mY < y * GRID_SIZE + GRID_SIZE){
              socket.emit('move', x, y, game.id);
            }
          }
        }
      }
    }
  }

}

function submitGame () {
  var inputBox = document.getElementById('game_name');
  if(inputBox.value.length > 2){
    socket.emit('new_game', inputBox.value);
    inputBox.value = "";
  }

}

function deleteGame (item) {
  var id = item.getAttribute('data-id');
  var sure = confirm('Are you sure you want to delete this game. All members will be disconnected');
  if(sure){
    socket.emit('remove_game', id);
  }
}

function joinGame(item) {
  if(!connected){
    var id = item.getAttribute('data-id');
    socket.emit('join_game', id);
  }
}

function leaveGame(item) {
  var id = item.getAttribute('data-id');
  socket.emit('leave_game', id);
  item.outerHTML = '<div data-id="'+id+'" onclick="joinGame(this)" class="join_btn"><p><i class="material-icons">add_circle</i></p></div>';
  connected = false;
  game = null;
}
