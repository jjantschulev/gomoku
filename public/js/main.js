var game = null;
var myTurn = false;
var lightPiece;
var darkPiece;
var pieces = [];
var connected = false;
var inSettings = false;
var playing = connected && !inSettings;

var view;
var mX = 0, mY = 0, pmX = 0, pmY = 0;

function preload() {
  lightPiece = loadImage('./assets/light.png');
  darkPiece = loadImage('./assets/dark.png');
}


function setup () {
  createCanvas(windowWidth, windowHeight);
  view = new View();
  board = new Board();
  toggleSettings();
}

function draw () {
  if(game!=null){
    playing = connected && !inSettings && game.players.length == 2;
  }else{
    playing = false;
  }
  background(0);
  fill(245);
  textAlign(CENTER, CENTER);
  textSize(40);

  if(playing){
    view.update();

    board.showBoard();
    for (var i = pieces.length-1; i >= 0; i--) {
      pieces[i].show();
      pieces[i].update();
    }
  }else if (connected) {
    text('Waiting for other players...', width/2, height/2);
  }else{
    text('Please connect to game', width/2, height/2);
  }

}

var mDownX;
var mDownY;
function mousePressed () {
  mDownX = mouseX;
  mDownY = mouseY;
  ptouchX = touchX;
  ptouchY = touchY;
}

function mouseReleased() {
  if (dist(mDownX, mDownY, mouseX, mouseY) < 10) {
    makeMove();
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  view.setZoom();
}





window.onkeydown = function (e) {
  var k = e.key;
  if(k == 'Escape'){
    toggleSettings();
  }
}

function createID() {
  var chars = 'abcdefghijklmnopqrstuvwxyz12345678901234567890';
  var newId = '';
  for (var i = 0; i < 6; i++) {
    newId += chars[Math.floor(Math.random()*chars.length)];
  }
  return newId;
}
