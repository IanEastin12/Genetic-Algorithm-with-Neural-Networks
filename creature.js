class Creature {
  constructor(generation, pos, cells, genome, debug) {
    this.genome = (generation == 0)? null: genome;
    this.pos = pos;
    this.cells = cells;
    this.senses = new Senses(this.pos, cells);
    this.brain = (generation == 0)? new Brain(generation, numCon, this.senses): this.genome.createBrain(generation, this.senses, debug);
    this.debug = debug;
  }
  
  act() {
    let connections = this.brain.connections;
    let cells = this.cells;
    let prevPos = this.pos.copy();
    for(let i = 0; i < connections.length; i+=3) {
      let node = connections[i + 2];
      if(node.type == "movR" && (random(-1, 1) < node.value)) {
        this.pos.x++;
        if(this.pos.x >= w || cells[this.pos.y][this.pos.x]) this.pos.x--;
      }
      if(node.type == "movL" && (random(-1, 1) < node.value)) {
        this.pos.x--;
        if(this.pos.x < 0 || cells[this.pos.y][this.pos.x]) this.pos.x++;
      }
      if(node.type == "movD" && (random(-1, 1) < node.value)) {
        this.pos.y++;
        if(this.pos.y >= h || cells[this.pos.y][this.pos.x]) this.pos.y--;
      }
      if(node.type == "movU" && (random(-1, 1) < node.value)) {
        this.pos.y--;
        if(this.pos.y < 0 || cells[this.pos.y][this.pos.x]) this.pos.y++;
      }
      if(node.type == "movRand" && (random(-1, 1) < node.value)) {
        let xOff = round(random(2) - 1);
        let yOff = round(random(2) - 1); 
        this.pos.x += xOff;
        this.pos.y += yOff;
        let isValid;
        if(this.pos.x > w &&
           this.pos.x <= 0 &&
           this.pos.y > h &&
           this.pos.y <= 0) isValid = true;
        if(!isValid || cells[this.pos.y][this.pos.x]) {
          this.pos.x -= xOff;
          this.pos.y -= yOff;
        }
      } 
    }
    
    //if(this.pos.x > w/2 - 2 && this.pos.x < w/2 + 2 && this.pos.y > h/4 && this.pos.y < 3*h/4 && generation >= 50) this.pos.x = w/2 - 3;
    cells[prevPos.y][prevPos.x] = 0;
    cells[this.pos.y][this.pos.x] = 1;
    this.senses.prevPos = prevPos;
    this.senses.pos = this.pos;
    
  }
  
}