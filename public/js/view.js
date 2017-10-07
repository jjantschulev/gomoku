function View() {

  this.zoom = 1;
  this.x = (BOARD_COLS * GRID_SIZE * this.zoom /2) - width /2;
  this.y = (BOARD_ROWS * GRID_SIZE * this.zoom /2) - height /2;


  this.update = function() {
    this.grmp();
    if(touchIsDown){
      this.x += ptouchX - touchX;
      this.y += ptouchY - touchY;
    }
    // translate(width/2, height/2);
    this.x = constrain(this.x, 0, BOARD_COLS * GRID_SIZE * this.zoom - width);
    this.y = constrain(this.y, 0, BOARD_ROWS * GRID_SIZE * this.zoom - height);
    translate(-this.x, -this.y);
    scale(this.zoom);

  }

  this.grmp = function () {
    mX = (mouseX + this.x) / this.zoom;
    mY = (mouseY + this.y) / this.zoom;
    pmX = (pmouseX + this.x) / this.zoom;
    pmY = (pmouseY + this.y) / this.zoom;
  }

  this.setZoom = function () {
    if(width > height){
      //landscape
      this.zoom = width / (BOARD_COLS * GRID_SIZE);
    }else{
      this.zoom = height / (BOARD_ROWS * GRID_SIZE);
    }
  }

  this.setZoom();

}
