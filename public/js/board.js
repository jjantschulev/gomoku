function Board() {
  this.boardSize = 800;
  this.cols = 20;
  this.rows = 20;
  this.gridSize = 40;
  this.board = [];

  this.showBoard = function () {
    noStroke();
    for(var x = 0; x < this.rows; x++){
      for(var y = 0; y < this.rows; y++){
        var xe = x%2==0;
        var ye = y%2==0;
        if(xe&&ye||!xe&&!ye){
          fill(40);
        }else{
          fill(45);
        }
        rect(x*this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
      }
    }
  }


}
