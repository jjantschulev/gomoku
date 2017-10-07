function addGame (name, userCount, id) {
  var btn = '<div data-id="'+id+'" onclick="joinGame(this)" class="join_btn"><p><i class="material-icons">add_circle</i></p></div>';
  if(game != null){
    if(game.id == id){
      btn = '<div data-id="'+id+'" onclick="leaveGame(this)" class="leave_btn"><p><i class="material-icons">cancel</i></p></div>';
    }
  }

  document.getElementById('online_games').innerHTML +=
    '<div class="game_card">'+
    '<div class="game_card_name"><p>'+name+'</p></div>'+
    '<div class="players_connected"><p>'+userCount+'</p></div>'+
    btn+
    '<div data-id="'+id+'" onclick="deleteGame(this)" class="remove_btn"><p><i class="material-icons">delete</i></p></div>'+
    '</div>';
}

function clearGames() {
  document.getElementById('online_games').innerHTML = '';
}


function toggleSettings () {
  var state = document.getElementById('settings').style.display;
  if(state == "none"){
    inSettings = true;
    document.getElementById('settings').style.display = 'block';
  }else{
    inSettings = false;
    document.getElementById('settings').style.display = 'none';
  }
}
