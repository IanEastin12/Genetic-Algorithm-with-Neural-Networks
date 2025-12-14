const e = 2.71828;

let cells;
let creatures = [];
let numCreatures = 1000;
let numCon = 10;

let r = 40;
let w = 128;
let h = 128;
let cnvs1;
let cnvs2;
let drawnCons;
let drawnNodes;
let creature;

let maxGen = 1000;
let generation = 0;
let maxStep = 300;
let step = 0;
let survival;
let muteRate = 0.02;

function setup() {
  cnvs1 = createCanvas(w + 200, h * 3);
  //cnvs2 = createCanvas(400, 400);
  background(225);
  cells = create2DArray(h);
  drawnNodes = new p5.TypedDict();
  drawnCons = new p5.TypedDict();

  //creature = new Creature(0, createVector(200, 200), cells);
  //creature.brain.totalConnections = [new Node("popDensFor", false), 0.5, new Node("n1", true), new Node("n2", true), 0.5, new Node("n1", true), new Node("n2", true), 0.5, new Node("movR", false), new Node("n1", false), 0.5, new Node("n2", false), new Node("n1", false), 0.5, new Node("n1", false)];
  //creature.brain.build(1, 4, true);
  //creature.brain.think();

  for (let i = 0; i < numCreatures; i++) {
    let pos = createVector(floor(random(w)), floor(random(h)));
    cells[floor(pos.y)][floor(pos.x)] = 1;
    creatures[i] = new Creature(0, pos, cells);
  }
  noLoop();
}

function draw() {
  if (generation <= maxGen) {
    if (step <= maxStep) {
      background(255);
      line(w, 0, w, h);
      line(0, h, w, h);

      for (let c of creatures) {
        c.brain.think();
        c.act();
        push();
        strokeWeight(1);
        stroke(0, 0, 0);
        point(c.pos.x, c.pos.y);
        pop();
      }

      drawBrain(creatures[0], 0, h, width, 2 * h);
      drawStats();
      step++;
    } else {
      nextGeneration();
      step = 0;
      generation++;
    }
  }
}

function drawBrain(individual, transX, transY, boundX, boundY) {
  let connections = individual.brain.connections;
  push();
  translate(transX, transY);
  for (let i = 0; i < connections.length; i += 3) {
    let isLoop = false;
    //Initialize random neuron positions
    let xOff = r / 2;
    let yOff = r / 2;
    let x1 = random(xOff, boundX - xOff);
    let y1 = random(yOff, boundY - yOff);
    let x2 = random(xOff, boundX - xOff);
    let y2 = random(yOff, boundY - yOff);
    let fromNode = connections[i];
    let toNode = connections[i + 2];

    //Calculate color based of value
    let fromCol = color(255, 0, 0);
    let toCol = color(0, 255, 0);
    let c1 =
      fromNode.value == null
        ? color(255, 16, 240)
        : lerpColor(fromCol, toCol, (fromNode.value + 1) / 2);
    let c2 =
      toNode.value == null
        ? color(255, 16, 240)
        : lerpColor(fromCol, toCol, (toNode.value + 1) / 2);

    //If neuron has already been drawn, don't draw again
    let k1 = [fromNode.type, toNode.type];
    let k2 = [toNode.type, fromNode.type];
    if (drawnCons.hasKey(k2)) {
      isLoop = true;
    } else if (!drawnCons.hasKey(k1)) {
      drawnCons.create(k1, 0);
    }
    if (drawnNodes.hasKey(fromNode.type)) {
      x1 = drawnNodes.get(fromNode.type).x;
      y1 = drawnNodes.get(fromNode.type).y;
    } else {
      drawnNodes.create(fromNode.type, createVector(x1, y1));
    }
    if (drawnNodes.hasKey(toNode.type)) {
      x2 = drawnNodes.get(toNode.type).x;
      y2 = drawnNodes.get(toNode.type).y;
    } else {
      drawnNodes.create(toNode.type, createVector(x2, y2));
    }

    if (isLoop && fromNode.type !== toNode.type) {
      noFill();
      bezier(x1, y1, x1 + r, y1 + r, x2 + r, y2 + r, x2, y2);
    }

    if (fromNode.type == toNode.type) {
      noFill();
      circle(x1 + r / 2, y1 + r / 2, r);
    }

    textAlign(CENTER);
    stroke(0);
    line(x1, y1, x2, y2);
    //if (individual.debug) console.log(fromNode.value);
    fill(c1);
    circle(x1, y1, r);
    fill(255);
    text(fromNode.type, x1, y1);
    //if (individual.debug) console.log(toNode.value);
    fill(c2);
    circle(x2, y2, r);
    fill(255);
    text(toNode.type, x2, y2);
  }
  pop();
}

function create2DArray(dim) {
  let array = new Array(dim);
  for (let i = 0; i < dim; i++) {
    array[i] = new Array(dim).fill(0);
  }
  return array;
}

function mousePressed() {
  console.log(creatures[0].brain);
  /*if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let fs = fullscreen();
    fullscreen(!fs);
  }*/
  loop();
}

function drawStats() {
  textSize(20);
  textAlign(CENTER);
  text(`Generation: ${generation}`, w + 100, 30);
  textSize(14);
  textAlign(LEFT);
  text(`Simulation Step: ${step}`, w + 10, 55);
  let surv;
  if (survival !== undefined) surv = survival.toFixed(2);
  text(`Survival Rate: ${surv}`, w + 10, 75);
  text(`Number of Connections: ${numCon}`, w + 10, 95);
  text(`Number of Internal Neurons: ${4}`, w + 10, 115);
  text(`Mutation Rate: ${muteRate}`, w + 10, 135);
  line(w / 2, 0, w / 2, h);
  if (generation >= 50) rect(w / 2 - 2, h / 4, 4, h / 2);
  /*line(26, 0, 26, h);
  line(38, 0, 38, h);
  line(90, 0, 90, h);
  line(102, 0, 102, h);*/
}

function nextGeneration() {
  let parents = [];
  let prevSurvive = creatures.length;
  let genome;
  let creaturePos = create2DArray(h);
  cells = create2DArray(h);

  //Selection
  for (let c of creatures) {
    if (
      /*c.pos.x > 26 && c.pos.x < 38 ||
       c.pos.x > 90 && c.pos.x < 102*/ c
        .pos.x >
      w / 2
    )
      parents.push(c);
  }

  survival = (100 * parents.length) / prevSurvive;
  prevSurvive = creatures.length;
  creatures = [];
  let numChildren = round(1000 / parents.length);

  //Mating
  //Stick creatures in 2D position grid
  for (let i = 0; i < parents.length; i++) {
    let row = round(parents[i].pos.x);
    let col = round(parents[i].pos.y);
    creaturePos[row][col] = parents[i];
  }

  for (let i = 0; i < parents.length; i++) {
    /*let p1 = parents[round(random(parents.length - 1))];
    let p2 = parents[round(random(parents.length - 1))];*/
    let p1 = parents[i];
    let possibleMates = [];
    let p2;

    //Pick a mate from the neighboring cells
    for (let row = p1.pos.y - 20; row < p1.pos.y + 20; row++) {
      for (let col = p1.pos.x - 20; col < p1.pos.x + 20; col++) {
        if (
          row !== p1.pos.y &&
          col !== p1.pos.x &&
          row >= 0 &&
          row < h &&
          col >= 0 &&
          col < w &&
          creaturePos[row][col] !== 0
        )
          possibleMates.push(creaturePos[row][col]);
      }
    }

    //Parent's child count based on total survival
    if (possibleMates.length !== 0) {
      for (let c = 0; c < numChildren; c++) {
        let index = round(random(possibleMates.length - 1));
        p2 = possibleMates[index];

        genome = new Genome(p1, p2);
        genome.recombine();

        let pos = createVector(floor(random(w)), floor(random(h)));
        cells[floor(pos.y)][floor(pos.x)] = 1;

        if (i == 0) {
          creatures.push(new Creature(1, pos, cells, genome, true));
        } else {
          creatures.push(new Creature(1, pos, cells, genome, false));
        }
      }
    }
  }
}
