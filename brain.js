class Brain {
  constructor(generation, numConnections, senses, debug) {
    this.senses = senses;
    //Input, internal, ouput
    this.nodeTypes = [
      ["popDensFor", "disRB", "disLB", "disUB", "disDB", "age"],
      ["n0", "n1", "n2", "n3"],
      ["movU", "movD", "movR", "movL", "movRand"]
    ];
    //Structure:[fromNode, weight, toNode,...]
    this.totalConnections = generation == 0 ? new Array(numConnections * 3) : [];
    this.connections = new Array(this.totalConnections.length);
    this.activeNodes = new p5.TypedDict();
    if (generation == 0) this.build(generation, numConnections);
    this.debug = debug;
  }

  build(generation, numConnections, debug) {
    
    let inputs = this.nodeTypes[0].concat(this.nodeTypes[1]);
    let outputs = this.nodeTypes[2];

    for (let i = 0; i < this.totalConnections.length; i += 3) {
      if (generation == 0) {
        
        let fromType = random(inputs);
        let toType = random(outputs);

        let isInternalFrom = this.nodeTypes[1].indexOf(fromType) >= 0? true : false;
        let isInternalTo = this.nodeTypes[1].indexOf(fromType) >= 0? true : false;
        
        this.totalConnections[i] = new Node(fromType, isInternalFrom);
        this.totalConnections[i + 1] = random(-2, 2);
        this.totalConnections[i + 2] = new Node(toType, isInternalTo);
      }
      //If output/internal node has already been used, update node dictionary so there are no repeats
      let fromNode = this.totalConnections[i];
      let weight = this.totalConnections[i + 1];
      let toNode = this.totalConnections[i + 2];

      if (
        this.activeNodes.hasKey(fromNode.type)
      ) {
        this.connections[i] = this.activeNodes.get(fromNode.type);
        this.connections[i].hasOutput = true;
      } else {
        fromNode.hasOutput = true;
        this.activeNodes.create(fromNode.type, fromNode);
        this.connections[i] = fromNode;
      }

      if (this.activeNodes.hasKey(toNode.type)) {
        this.connections[i + 2] = this.activeNodes.get(toNode.type);
        toNode = this.connections[i + 2].numInputs++;
      } else {
        toNode.numInputs++;
        this.activeNodes.create(toNode.type, toNode);
        this.connections[i + 2] = toNode;
      }
      
      this.connections[i + 1] = weight;
    }
    
    //Prune internal neurons (and connections) that don't output to anything
    this.prune();
  }

  think() {
    //Clear inputs and values for a fresh thought
    this.clear();
    //Calculate input values
    let popDensFor;
    let disRB;
    let disLB;
    let disUB;
    let disDB;
    let age;

    this.senses.update();
    for (let i = 0; i < this.connections.length; i += 3) {
      let fromNode = this.connections[i];
      let weight = this.connections[i + 1];
      let toNode = this.connections[i + 2];

      //Set input neuron value
      if (fromNode.type == "popDensFor")
        fromNode.value = this.senses.popDensFor;
      if (fromNode.type == "disRB") fromNode.value = this.senses.disRB;
      if (fromNode.type == "disLB") fromNode.value = this.senses.disLB;
      if (fromNode.type == "disUB") fromNode.value = this.senses.disUB;
      if (fromNode.type == "disDB") fromNode.value = this.senses.disDB;
      if (fromNode.type == "age") fromNode.value = this.senses.age;
    }

    //loop through active nodes and combine signals to give output values. First send input signals. Then send internals that have the least number of inputs
    let cnt = 0;
    let fire = true;
    while (fire) {
      fire = false;
      for (let i = 0; i < this.connections.length; i += 3) {
        let fromNode = this.connections[i];
        let weight = this.connections[i + 1];
        let toNode = this.connections[i + 2];

        if (!fromNode.isInternal && cnt == 0) {
          fromNode.fire(weight, toNode);
          fire = true;
        }
        if (
          fromNode.isInternal &&
          fromNode.numInputs == fromNode.signals.length &&
          fromNode.signals.length !== 0 &&
          fromNode.value == null
        ) {
          fromNode.fire(weight, toNode);
          fire = true;
        }
      }
      cnt++;
    }

    //Calculate any loops, letting them go three iterations
    for (let l = 0; l < 3; l++) {
      for (let i = 0; i < this.connections.length; i += 3) {
        let fromNode = this.connections[i];
        let weight = this.connections[i + 1];
        let toNode = this.connections[i + 2];

        if (fromNode.type == toNode.type) {
          fromNode.combineSignals();
          fromNode.fire(weight, toNode);
        }

        if (fromNode.signals.length !== 0 && fromNode.isInternal) {
          fromNode.combineSignals();
          fromNode.fire(weight, toNode);
        }
      }
    }

    //Finally, calculate output nodes
    for (let i = 0; i < this.connections.length; i += 3) {
      let fromNode = this.connections[i];
      let weight = this.connections[i + 1];
      let toNode = this.connections[i + 2];

      if (
        toNode.value == null &&
        toNode.signals.length !== 0 &&
        !toNode.isInternal
      ) {
        toNode.combineSignals();
      }
    }
  }

  clear() {
    for (let i = 0; i < this.connections.length; i += 3) {
      let fromNode = this.connections[i];
      let toNode = this.connections[i + 2];

      fromNode.value = null;
      fromNode.signals = [];
      toNode.value = null;
      toNode.signals = [];
    }
  }

  prune() {
    //this.totalConnections = Array.from(this.connections);
    for (let n = 0; n < 2; n++) {
      for (let i = 0; i < this.connections.length; i += 3) {
        let fromNode = this.connections[i];
        let toNode = this.connections[i + 2];

        //If node has no input, prune it also
        if (fromNode.isInternal && fromNode.numInputs == 0) {
          toNode.numInputs -= 1;
          this.connections.splice(i, 3);
          //console.log(n + " pruned (no inputs) " + fromNode.type);
          i -= 3;
        } else if (toNode.isInternal && !toNode.hasOutput) {
          toNode.numInputs -= 1;
          this.connections.splice(i, 3);
          //console.log(n + " pruned (no output) " + toNode.type);
          i -= 3;
        } else if (
          fromNode == toNode &&
          (!fromNode.hasOutput || !toNode.hasOutput)
        ) {
          toNode.numInputs -= 1;
          this.connections.splice(i, 3);
          //console.log(n + " pruned " + toNode.type + " short circuit");
        }
      }
    }
  }
}
