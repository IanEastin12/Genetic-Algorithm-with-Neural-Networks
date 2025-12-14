//const e = 2.71828;

class Node {
  constructor(type, isInternal) {
    this.type = type;
    this.isInternal = isInternal;
    this.hasOutput = false;
    this.numInputs = 0;
    this.signals = [];
    this.value = null;
  }
  
  setValue(value) {
    let num = pow(e, value) - pow(e, -value);
    let denom = pow(e, value) + pow(e, -value);
    this.value = num / denom;
  }
  
  //This will recieve a weight * value from another node and push it into the signals array
  fire(weight, toNode) {
    if (this.value == null) this.combineSignals();
    toNode.signals.push(this.value * weight);
  }
  
  combineSignals() {
    let sum = 0;
    for (let i = 0; i < this.signals.length; i++) {
      sum += this.signals[i];
    }
    this.setValue(sum);
  }
}