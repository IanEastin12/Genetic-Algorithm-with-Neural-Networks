class Senses {
  constructor(position, cells) {
    this.display = false;
    this.pos = position;
    this.prevPos = position;
    this.cells = cells;
    this.popDensFor = this.calcPopDense();
    this.age = 2 * step / maxStep - 1;
    //Normalize, flip, and put between -1 and 1
    this.disRB = 1 - 2 * (w - this.pos.x) / w;
    this.disLB = 1 - 2 * this.pos.x / w;
    this.disDB = 1 - 2 * (h - this.pos.y) / h;
    this.disUB = 1 - 2 * this.pos.y / h;
  }
  
  calcPopDense() {
    let cnt = 0;
    let dir = p5.Vector.sub(this.pos, this.prevPos);
    let size = 5;
    let r = dir.y * size + this.pos.y;
    let c = dir.x * size + this.pos.x;
    for (let row = r - size; row < r + size; row++) {
      for (let col = c - size; col < c + size; col++) {
        if (row < h &&
            row >= 0 &&
            col < w &&
            row >= 0 &&
            this.cells[row][col] == 1) cnt++;
        if(this.display) {
          push();
          stroke(0, 255, 0);
          point(col, row);
          pop();
        }
        
      }
    }
    return 2 * (cnt / (size * size)) - 1;
  }
  
  update() {
    this.popDensFor = this.calcPopDense();
    this.disRB = 1 - 2 * (w - this.pos.x) / w;
    this.disLB = 1 - 2 * this.pos.x / w;
    this.disDB = 1 - 2 * (h - this.pos.y) / h;
    this.disUB =  1 - 2 * this.pos.y / h;
    this.age = 2 * step / maxStep - 1;
  }
}