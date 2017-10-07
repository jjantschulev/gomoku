function Board() {
  this.board = [];

  this.showBoard = function () {
    noStroke();
    for(var x = 0; x < BOARD_COLS; x++){
      for(var y = 0; y < BOARD_ROWS; y++){
        var xe = x%2==0;
        var ye = y%2==0;
        if(xe&&ye||!xe&&!ye){
          fill(40);
        }else{
          fill(45);
        }
        rect(x*GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      }
    }

    // for(var x = 0; x < BOARD_COLS; x++){
    //   for(var y = 0; y < BOARD_ROWS; y++){
    //     if(mX > x*GRID_SIZE && mX < x * GRID_SIZE + GRID_SIZE){
    //       if(mY > y*GRID_SIZE && mY < y * GRID_SIZE + GRID_SIZE){
    //         fill(255);
    //         rect(x*GRID_SIZE, y*GRID_SIZE, GRID_SIZE, GRID_SIZE);
    //       }
    //     }
    //   }
    // }
  }


}
