function addGame (name, userCount, id) {
  document.getElementById('online_games').innerHTML +=
    '<div class="game_card">'+
    '<div class="game_card_name"><p>'+name+'</p></div>'+
    '<div class="players_connected"><p>'+userCount+'</p></div>'+
    '<div data-id="'+id+'" onclick="joinGame(this)" class="join_btn"><p><i class="material-icons">add_circle</i></p></div>'+
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
