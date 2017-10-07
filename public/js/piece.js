function Piece(rows, cols, col) {
  if(col == 2){
    this.image = lightPiece;
  }else if(col == 1){
    this.image = darkPiece;
  }
  this.cols = cols;
  this.rows = rows;
  this.x = cols * GRID_SIZE;
  this.y = rows * GRID_SIZE;

  this.r = GRID_SIZE;

  this.show = function () {
    
    image(this.image, this.x, this.y, this.r, this.r);
  }

  this.update = function () {

  }

}
