class SequenceUI {
  parentNode = null;
  variableNodes = {};
  sequence = new Sequence();
  keyNode = null;
  octaveNode = null;
  waveNode = null;
  volumeNode = null;
  octaveOffset = 0;
  keyName = "C major";
  keyBaseName = "C";
  keyTypeOffsets = Util.majorOffsets;
  waveType = "sine";
  volume = 1;
  ctx = null;
  oldTime = new Date().getTime();

  variableNameFromVariableNode(variableNode) {
    let names = Object.keys(this.variableNodes);
    for (let i = 0; i < names.length; i++) {
      if (this.variableNodes[names[i]] == variableNode) return names[i];
    }
    return null;
  }

  extractParams() {
    this.octaveOffset = parseInt(
      this.octaveNode.getElementsByClassName("dropdown-toggle")[0].textContent
    );

    this.keyName = this.keyNode.getElementsByClassName(
      "dropdown-toggle"
    )[0].textContent;

    this.waveType = this.waveNode
      .getElementsByClassName("dropdown-toggle")[0]
      .textContent.trim();
    
    this.volume = this.volumeNode.getElementsByTagName("input")[0].value / 100;

    this.keyBaseName = this.keyName.split(" ")[0];
    if (this.keyName.split(" ")[1] == "major") {
      this.keyTypeOffsets = Util.majorOffsets;
    } else if (this.keyName.split(" ")[1] == "minor") {
      this.keyTypeOffsets = Util.minorOffsets;
    }
  }

  updateVolume(value) {
    this.volume = value / 100;
  }

  saveToString() {
    var vars = [];
    let varNames = Object.keys(this.sequence.initial_scope);
    for (let i = 0; i < varNames.length; i++) {
      let varName = varNames[i];
      vars.push({
        name: varName,
        expression: this.sequence.expressions[varName],
        initial_scope: this.sequence.initial_scope[varName],
      });
    }

    var obj = {
      variableNodes: vars,
      octaveOffset: this.octaveOffset,
      keyName: this.keyName,
      waveType: this.waveType,
      volume: this.volume,
    };
    var str = JSON.stringify(obj);
    return btoa(str);
  }

  loadFromString(s) {
    var str = atob(s);
    var obj = JSON.parse(str);
    //this.variableNodes = obj.variableNodes;
    this.octaveOffset = obj.octaveOffset;
    this.keyName = obj.keyName;
    this.waveType = obj.waveType;
    this.volume = obj.volume;
    console.log("Volume load " + this.volume);
    this.keyBaseName = this.keyName.split(" ")[0];
    if (this.keyName.split(" ")[1] == "major") {
      this.keyTypeOffsets = Util.majorOffsets;
    } else if (this.keyName.split(" ")[1] == "minor") {
      this.keyTypeOffsets = Util.minorOffsets;
    }

    this.octaveNode.getElementsByClassName("dropdown-toggle")[0].textContent =
      "" + this.octaveOffset;
    this.keyNode.getElementsByClassName(
      "dropdown-toggle"
    )[0].textContent = this.keyName;
    
    this.waveNode.getElementsByClassName(
      "dropdown-toggle"
    )[0].textContent = this.waveType;
    this.volumeNode.getElementsByTagName("input")[0].value = this.volume * 100;

    for (let i = 0; i < obj.variableNodes.length; i++) {
      addVariableToSequenceInit(
        this,
        obj.variableNodes[i].name,
        obj.variableNodes[i].expression,
        obj.variableNodes[i].initial_scope
      );
    }
  }

  canvasParticles = [];
  startCanvas() {
    this.oldTime = new Date().getTime();
    this.ctx.font = "14px Tahoma";
    let seqRef = this;
    window.requestAnimationFrame(function () {
      seqRef.canvasUpdateLoop(seqRef);
    });
  }

  canvasUpdateLoop(seqRef) {
    // Calculate frame time
    let newTime = new Date().getTime();
    let timeDelta = (newTime - seqRef.oldTime) / 1000;
    let fps = 1000 / (newTime - seqRef.oldTime);
    seqRef.oldTime = newTime;

    let c = seqRef.ctx;
    let w = c.canvas.width;
    let h = c.canvas.height;
    c.fillStyle = "#000000";
    c.clearRect(0, 0, w, h);

    for (let i = 0; i < seqRef.canvasParticles.length; i++) {
      seqRef.canvasParticles[i].x += timeDelta * 200;
      let p = seqRef.canvasParticles[i];
      c.fillStyle = p.v >= 0 ? "#5cb85c" : "#324535";
      c.fillRect(p.x - p.w, h - p.y * h, p.w, -p.h * h + 5);
      c.fillStyle = "#f7f7f7";
      if (p.v > 999) {
        c.fillText(
          "..." + (Math.round(p.v) % 1000),
          p.x - p.w + 2,
          h - p.y * h - 3
        );
      } else {
        c.fillText(
          "" + Math.round(p.v * 100) / 100,
          p.x - p.w + 2,
          h - p.y * h - 3
        );
      }
    }

    if (seqRef.canvasParticles.length > 0) {
      if (
        seqRef.canvasParticles[seqRef.canvasParticles.length - 1].x -
          seqRef.canvasParticles[seqRef.canvasParticles.length - 1].w >
        w
      ) {
        seqRef.canvasParticles.pop();
      }
    }

    // Next loop
    window.requestAnimationFrame(function () {
      seqRef.canvasUpdateLoop(seqRef);
    });
  }
}
