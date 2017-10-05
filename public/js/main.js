var board;
var game;
var myTurn = false;
var lightPiece;
var darkPiece;
var pieces = [];
var connected = false;
var connectionImage;
var inSettings = false;
var playing = connected && !inSettings;

function preload() {
  lightPiece = loadImage('./assets/light.png');
  darkPiece = loadImage('./assets/dark.png');
  connectionImage = loadImage('./assets/please_connect.png');
}


function setup () {
  createCanvas(800, 800);
  board = new Board();
  for (var i = 0; i < 15; i++) {
    pieces.push(new Piece(floor(random(20)), floor(random(20)), random(1) < 0.5));
  }

  toggleSettings();
}

function draw () {
  playing = connected && !inSettings;
  background(40);
  if(playing){
    board.showBoard();
    for (var i = pieces.length-1; i >= 0; i--) {
      pieces[i].show();
      pieces[i].update();
    }
  }else{
    image(connectionImage, 0, 0, width, height);
  }

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
