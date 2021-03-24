var sequenceTable = document.getElementById("sequence-table-body");
var emptySequence = document.getElementById("sequence-template")
  .firstElementChild.firstElementChild;
var emptyVariable = document.getElementById("variable-data-template")
  .firstElementChild;

var uiSequences = [];
var sequenceNameCount = 1;

function addNewSequence() {
  let newSequence = emptySequence.cloneNode(true);
  let node = sequenceTable.appendChild(newSequence);

  node.getElementsByClassName("sequence-name")[0].textContent =
    "Sequence #" + sequenceNameCount;
  sequenceNameCount += 1;

  let seqUI = new SequenceUI();
  seqUI.parentNode = node;
  seqUI.octaveNode = node.getElementsByClassName("octave-shift-container")[0];
  seqUI.keyNode = node.getElementsByClassName("key-container")[0];
  seqUI.waveNode = node.getElementsByClassName("wave-type-container")[0];
  seqUI.volumeNode = node.getElementsByClassName("volume-container")[0];
  seqUI.ctx = node
    .getElementsByClassName("sequence-canvas")[0]
    .getContext("2d");
  seqUI.startCanvas();
  let keyDropdownMenu = seqUI.keyNode.getElementsByClassName(
    "dropdown-menu"
  )[0];
  for (let i = 0; i < Util.baseNotesNames.length; i++) {
    if (i == 0)
      seqUI.keyNode.getElementsByClassName("dropdown-toggle")[0].textContent =
        Util.baseNotesNames[0] + " major";
    keyDropdownMenu.innerHTML +=
      "<a class='dropdown-item' onclick='keyButton(this)'>" +
      Util.baseNotesNames[i] +
      " major" +
      "</a>";
    keyDropdownMenu.innerHTML +=
      "<a class='dropdown-item' onclick='keyButton(this)'>" +
      Util.baseNotesNames[i] +
      " minor" +
      "</a>";
  }

  uiSequences.push(seqUI);

  addVariableToSequence(seqUI, "note");
  ResetAndPlay();
  
  document.getElementById("removeAllButton").style.visibility = "visible";
  return seqUI;
}

function addVariableToSequence(seqUI, variableName) {
  let newSequence = seqUI.sequence;
  let isNew = !(variableName in newSequence.expressions);
  newSequence.expressions[variableName] = 0;
  newSequence.initial_scope[variableName] = "0";

  if (isNew) {
    let newVariable = emptyVariable.cloneNode(true);
    let varNode = seqUI.parentNode
      .getElementsByClassName("variable-buttons")[0]
      .appendChild(newVariable);
    seqUI.variableNodes[variableName] = varNode;
  }
  updateSequenceVariables(seqUI);
}

function addVariableToSequenceInit(seqUI, variableName, expression, initial) {
  let newSequence = seqUI.sequence;
  let isNew = !(variableName in newSequence.expressions);
  newSequence.expressions[variableName] = expression;
  newSequence.initial_scope[variableName] = initial;

  if (isNew) {
    let newVariable = emptyVariable.cloneNode(true);
    let varNode = seqUI.parentNode
      .getElementsByClassName("variable-buttons")[0]
      .appendChild(newVariable);
    seqUI.variableNodes[variableName] = varNode;
  }
  updateSequenceVariables(seqUI);
}

function updateSequenceVariables(seqUI) {
  let names = Object.keys(seqUI.variableNodes);
  for (let i = 0; i < names.length; i++) {
    let variableName = names[i];
    let varNode = seqUI.variableNodes[variableName];
    varNode.getElementsByClassName("initial-text")[0].textContent =
      "Initial " + variableName + ": ";
    varNode.getElementsByClassName("next-text")[0].textContent =
      "Next " + variableName + ": ";
    varNode.getElementsByClassName("initial-value")[0].textContent =
      seqUI.sequence.initial_scope[variableName];
    varNode.getElementsByClassName("next-value")[0].textContent =
      seqUI.sequence.expressions[variableName];
  }
  ResetAndPlay();
}

function removeSequenceButton(buttonElement) {
  let node = findParentNodeWithClass(buttonElement, "sequence-row");
  let seqUI = findSequenceUI(node);
  if (seqUI) {
    const index = uiSequences.indexOf(seqUI);
    if (index > -1) {
      console.log("Removing sequence");
      uiSequences.splice(index, 1);
    }
    node.remove();
    ResetAndPlay();
  }
}

function removeAllSequences() {
  document.getElementById("removeAllButton").style.visibility = "hidden";
  let nodes = document
    .getElementById("sequence-table-body")
    .getElementsByClassName("sequence-row");
  while (nodes.length > 0) {
    let node = nodes[0];
    node.remove();
  }
  uiSequences = [];
  StopIfPlay();
}

function loadPreset(n) {
  let state = null;
  if (state) loadState(state);
}

function loadState(state) {
  console.log("Loading state " + state);
  removeAllSequences();
  let decoded = decodeURIComponent(state);
  let spl = decoded.split(",");
  for (let i = 0; i < spl.length; i++) {
    if (i == 0) {
      let p = parseFloat(spl[i]);
      console.log("Volume " + p);
      if (!isNaN(p)) globalVolume = p;
    } else if (i == 1) {
      let p = parseInt(spl[i]);
      console.log("BPM " + p);
      if (!isNaN(p)) currentBPM = p;
    } else {
      let seqUI = addNewSequence();
      seqUI.loadFromString(spl[i].trim());
    }
  }
  bpmRange.value = currentBPM;
  volumeRange.value = globalVolume * 100;
}

function getStateString() {
  let state = globalVolume + "," + currentBPM;
  for (let i = 0; i < uiSequences.length; i++) {
    state += "," + uiSequences[i].saveToString();
  }
  return state;
}

function addNewVariableButton(buttonElement) {
  let node = findParentNodeWithClass(buttonElement, "sequence-row");
  let seqUI = findSequenceUI(node);
  let variableName = prompt("Enter variable name:");
  if (variableName && variableName.trim()) {
    if (seqUI.sequence.expressions[variableName]) {
      alert("Variable already exists.");
      return;
    }
    addVariableToSequence(seqUI, variableName);
    ResetAndPlay();
  } else {
    //console.log("Empty variable name");
  }
}

function removeVariableButton(buttonElement) {
  let node = findParentNodeWithClass(buttonElement, "sequence-row");
  let variableNode = findParentNodeWithClass(buttonElement, "variable-data");
  let seqUI = findSequenceUI(node);

  let variableName = seqUI.variableNameFromVariableNode(variableNode);
  if (variableName) {
    console.log("Removing variable.");
    if (variableName == "note") {
      alert("Cannot remove variable " + variableName);
      return;
    }
    delete seqUI.variableNodes[variableName];
    delete seqUI.sequence.expressions[variableName];
    delete seqUI.sequence.initial_scope[variableName];
    variableNode.remove();
    ResetAndPlay();
  }
}

function changeInitialValue(buttonElement) {
  let node = findParentNodeWithClass(buttonElement, "sequence-row");
  let seqUI = findSequenceUI(node);
  let variableNode = findParentNodeWithClass(buttonElement, "variable-data");
  let variableName = seqUI.variableNameFromVariableNode(variableNode);
  let inputValue = prompt(
    "Initial value for " + variableName + ":",
    seqUI.sequence.initial_scope[variableName]
  );
  if (!inputValue) return;
  let value = math.evaluate(inputValue);
  if (!isNaN(value)) {
    seqUI.sequence.initial_scope[variableName] = value;
    updateSequenceVariables(seqUI);
  }
}

function changeNextValue(buttonElement) {
  let node = findParentNodeWithClass(buttonElement, "sequence-row");
  let seqUI = findSequenceUI(node);
  let variableNode = findParentNodeWithClass(buttonElement, "variable-data");
  let variableName = seqUI.variableNameFromVariableNode(variableNode);
  let inputValue = prompt(
    "Next value for " + variableName + ":",
    seqUI.sequence.expressions[variableName]
  );
  if (!inputValue || !inputValue.trim()) return;
  seqUI.sequence.expressions[variableName] = inputValue.trim();
  updateSequenceVariables(seqUI);
}

function octaveButton(buttonElement) {
  let node = findParentNodeWithClass(buttonElement, "sequence-row");
  let seqUI = findSequenceUI(node);
  let octaveString = buttonElement.textContent;
  seqUI.octaveNode.getElementsByClassName(
    "dropdown-toggle"
  )[0].textContent = octaveString;
  ResetAndPlay();
}

function keyButton(buttonElement) {
  let node = findParentNodeWithClass(buttonElement, "sequence-row");
  let seqUI = findSequenceUI(node);
  let keyString = buttonElement.textContent;
  seqUI.keyNode.getElementsByClassName(
    "dropdown-toggle"
  )[0].textContent = keyString;
  ResetAndPlay();
}

function sequenceVolumeChange(buttonElement) {
  let node = findParentNodeWithClass(buttonElement, "sequence-row");
  let seqUI = findSequenceUI(node);
  seqUI.updateVolume(buttonElement.value);
  SetUrlParams();
}

function waveButton(buttonElement) {
  let node = findParentNodeWithClass(buttonElement, "sequence-row");
  let seqUI = findSequenceUI(node);
  let waveString = buttonElement.textContent;
  seqUI.waveNode.getElementsByClassName(
    "dropdown-toggle"
  )[0].textContent = waveString;
  seqUI.waveType = waveString.trim();
  ResetAndPlay();
}

function findSequenceUI(parentNode) {
  for (var i = 0; i < uiSequences.length; i++) {
    if (uiSequences[i].parentNode == parentNode) return uiSequences[i];
  }
  return null;
}

function findParentNodeWithClass(el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el;
}
