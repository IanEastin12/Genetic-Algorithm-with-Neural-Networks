class Genome {
  constructor(mom, dad) {
    this.p1 = mom;
    this.p2 = dad;
    this.childGenome = new p5.TypedDict();
    this.keys = [];
    this.activeNodes = new p5.TypedDict();
  }

  recombine() {
    let con1 = this.p1.brain.totalConnections;
    let con2 = this.p2.brain.totalConnections;
    let chrom1 = new p5.TypedDict();
    let chrom2 = new p5.TypedDict();

    //Turn total connections into a key (fromNode, toNode)/value (weight) dictionary
    for (let gene = 0; gene < con1.length; gene += 3) {
      let k = [con1[gene].type, con1[gene + 2].type];
      if (!chrom1.hasKey(k)) {
        chrom1.create(k, con1[gene + 1]);
      }
    }
    
    for (let gene = 0; gene < con2.length; gene += 3) {
      let k = [con2[gene].type, con2[gene + 2].type];
      if (!chrom2.hasKey(k)) {
        chrom2.create(k, con2[gene + 1]);
      }
    }

    //Recombine parents' genes to child
    //1. If connections are the same, mix parent weight
    //2. If unique, 50 % chance to inclue
    let length = con1.length > con2.length ? con1.length : con2.length;
    for (let gene = 0; gene < length; gene += 3) {
      let k1 =
        gene >= con1.length ? null : [con1[gene].type, con1[gene + 2].type];

      if (!this.childGenome.hasKey(k1)) {
        if (
          chrom2.hasKey(k1) &&
          k1 !== null &&
          con1[gene + 1] !== undefined &&
          con2[gene + 1] !== undefined
        ) {
          let weight = 0.5 * con1[gene + 1] + 0.5 * con2[gene + 1];
          this.childGenome.create(k1, weight);
          this.keys.push(k1);
        } else if (k1 !== null && con1[gene + 1] !== undefined) {
          let rand = random(1);
          if (rand < 0.5 && this.keys.length <= numCon) {
            this.childGenome.create(k1, con1[gene + 1]);
            this.keys.push(k1);
          }
        }
      }
      let k2 =
        gene >= con2.length ? null : [con2[gene].type, con2[gene + 2].type];

      if (!this.childGenome.hasKey(k2)) {
        if (
          chrom1.hasKey(k2) &&
          k2 !== null &&
          con2[gene + 1] !== undefined &&
          con1[gene + 1] !== undefined
        ) {
          let weight = 0.5 * con1[gene + 1] + 0.5 * con2[gene + 1];
          this.childGenome.create(k2, weight);
          this.keys.push(k2);
        } else if (k2 !== null && con2[gene + 1] !== undefined) {
          let rand = random(1);
          if (rand < 0.5 && this.keys.length <= numCon) {
            this.childGenome.create(k2, con2[gene + 1]);
            this.keys.push(k2);
          }
        }
      }
    }
  }

  createBrain(generation, senses, debug) {
    this.keys = this.keys.filter(
      (item, index) => this.keys.indexOf(item) === index
    );
   
    let brain = new Brain(generation, numCon, senses, debug);
    brain.totalConnections = new Array(this.keys.length * 3);

    for (let i = 0; i < this.keys.length; i++) {
      let index = i * 3;
      let fromNode, weight, toNode;

      if (this.activeNodes.hasKey(this.keys[i][0])) {
        fromNode = this.activeNodes.get(this.keys[i][0]);
      } else {
        let isInternal =
          this.keys[i][0] == "n1" || this.keys[i][0] == "n2" ? true : false;
        this.activeNodes.create(
          this.keys[i][0],
          new Node(this.keys[i][0], isInternal)
        );
        fromNode = this.activeNodes.get(this.keys[i][0]);
      }
      if (this.activeNodes.hasKey(this.keys[i][1])) {
        toNode = this.activeNodes.get(this.keys[i][1]);
      } else {
        let isInternal =
          this.keys[i][1] == "n1" || this.keys[i][1] == "n2" ? true : false;
        this.activeNodes.create(
          this.keys[i][1],
          new Node(this.keys[i][1], isInternal)
        );
        toNode = this.activeNodes.get(this.keys[i][1]);
      }
      weight = this.childGenome.get(this.keys[i]);

      let chance = muteRate / (numCon * 3);

      brain.totalConnections[index] = (random(1) < chance)? this.mutate("fromNode", brain): fromNode;
      brain.totalConnections[index + 1] = (random(1) < chance)? this.mutate("weight", brain): weight;
      brain.totalConnections[index + 2] = (random(1) < chance)? this.mutate("toNode", brain): toNode;
    }
    brain.build(generation);
    return brain;
  }

  mutate(gene, brain) {
    let inputs = brain.nodeTypes[0].concat(brain.nodeTypes[1]);
    let outputs = brain.nodeTypes[2];

    let fromType = random(inputs);
        let toType = random(outputs);

        let isInternalFrom = brain.nodeTypes[1].indexOf(fromType) >= 0? true : false;
        let isInternalTo = brain.nodeTypes[1].indexOf(fromType) >= 0? true : false;
    
    let fromNode = new Node(fromType, isInternalFrom);
    let weight = random(-2, 2);
    let toNode = new Node(toType, isInternalTo);
    
    if(gene == "fromNode") return fromNode;
    if(gene == "weight") return weight;
    if(gene == "toNode") return toNode;
    
  }
  
}
