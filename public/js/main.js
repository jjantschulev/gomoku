var board;
var game = null;
var myTurn = false;
var lightPiece;
var darkPiece;
var pieces = [];
var connected = false;
var connectionImage;
var inSettings = false;
var playing = connected && !inSettings;

var view;
var mX = 0, mY = 0, pmX = 0, pmY = 0;

function preload() {
  lightPiece = loadImage('./assets/light.png');
  darkPiece = loadImage('./assets/dark.png');
  connectionImage = loadImage('./assets/please_connect.png');
}


function setup () {
  createCanvas(800, 800);
  view = new View();
  board = new Board();
  toggleSettings();
}

function draw () {
  playing = connected && !inSettings;
  background(40);
  if(playing){
    view.update();

    board.showBoard();
    for (var i = pieces.length-1; i >= 0; i--) {
      pieces[i].show();
      pieces[i].update();
    }
  }else{
    image(connectionImage, 0, 0, width, height);
  }

}


function mousePressed () {
  makeMove();
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
