function Piece(rows, cols, light) {
  if(light){
    this.image = lightPiece;
  }else{
    this.image = darkPiece;
  }
  this.cols = cols;
  this.rows = rows;
  this.x = cols * board.gridSize;
  this.y = rows * board.gridSize;

  this.r = board.gridSize;

  this.show = function () {
    image(this.image, this.x, this.y, this.r, this.r);
  }

  this.update = function () {
    if(mouseIsPressed){
      if(mouseX >= this.x && mouseX <= this.x + this.r){
        if(mouseY >= this.y && mouseY <= this.y + this.r){
          this.delete();
        }
      }
    }
  }

  this.delete = function() {
    pieces.splice(pieces.indexOf(this), 1);
  }

}
