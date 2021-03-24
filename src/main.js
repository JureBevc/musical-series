var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var mainInterval = null;
var playButton = document.getElementById("playButton");
var bpmRange = document.getElementById("bpmRange");
var volumeRange = document.getElementById("volumeRange");
var sequenceTable = document.getElementById("sequence-table-body");

var started = false;
var playing = false;

var currentBPM = 120;
var globalVolume = 0.5;

var note_index = 0;

function playNote(type, frequency, noteVolume, duration, fadeOut) {
  // create Oscillator node
  var oscillator = audioCtx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.value = frequency; // value in hertz

  // Fade out
  let gainCtx = audioCtx.createGain();
  gainCtx.gain.linearRampToValueAtTime(
    0.00001,
    audioCtx.currentTime + fadeOut
  );

  //Volume;
  let volumeCtx = audioCtx.createGain();
  volumeCtx.gain.value = globalVolume * noteVolume;

  // Connect and play
  oscillator.connect(gainCtx);
  gainCtx.connect(volumeCtx);
  volumeCtx.connect(audioCtx.destination);
  oscillator.start(0);

  setTimeout(function () {
    oscillator.stop();
  }, duration);
}

var seq = new Sequence();
//seq.init({ a: "b", b: "c", c: "a+b", next_note: "c" }, { "a": 0, "b": 1, "c": 1, "next_note": 1});
seq.init({ next_note: "note_index % 3" }, { note: 1 });

var sequences = [];
function resetSequenceState() {
  sequences = [];
  for (let i = 0; i < uiSequences.length; i++) {
    sequences.push(uiSequences[i]);
    uiSequences[i].extractParams();
    uiSequences[i].sequence.initWithSelf();
  }
  note_index = 0;
}

function PlayNotes() {
  for (let i = 0; i < sequences.length; i++) {
    let seqUI = sequences[i];
    let s = seqUI.sequence.next_iter(note_index);
    let sAbs = Math.abs(s);
    seqUI.canvasParticles.unshift({
      x: 0,
      y: (sAbs % seqUI.keyTypeOffsets.length) / seqUI.keyTypeOffsets.length,
      w: 50,
      h: 1 / seqUI.keyTypeOffsets.length,
      v: s,
    });

    if (s >= 0) {
      let frequency = Util.numberToNote(
        Math.round(s),
        seqUI.octaveOffset,
        Util.noteFromName(seqUI.keyBaseName),
        seqUI.keyTypeOffsets
      );
      playNote(seqUI.waveType, frequency, seqUI.volume, 1000, 0.3);
    }
  }
  note_index = note_index + 1;
}

function VolumeChange() {
  globalVolume = volumeRange.value / 100;
  SetUrlParams();
}

function BPMChange() {
  currentBPM = bpmRange.value;
  if (playing) {
    if (mainInterval) clearInterval(mainInterval);
    mainInterval = window.setInterval(PlayNotes, Util.bpmToMillis(currentBPM));
  }
  SetUrlParams();
}

function ResetAndPlay() {
  resetSequenceState();
  SetUrlParams();
  if (!playing) return;
  if (mainInterval) clearInterval(mainInterval);
  mainInterval = window.setInterval(PlayNotes, Util.bpmToMillis(currentBPM));
}

function SetUrlParams() {
  console.log("Saving state...");
  let param = encodeURIComponent(getStateString());
  let arg = "?state=" + param;
  window.history.replaceState(null, null, arg);
}

function LoadStateFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if(urlParams.has("state")){
    console.log("Loading state from url...");
    let state = urlParams.get("state");
    loadState(state);
  }
}

function StopIfPlay() {
  SetUrlParams();
  if (!started) return;
  if (playing) {
    playing = false;
    if (mainInterval) clearInterval(mainInterval);
    playButton.textContent = "Play";
  }
}

function PlayButtonClick() {
  if (!started) return;
  if (playing) {
    playing = false;
    if (mainInterval) clearInterval(mainInterval);
    playButton.textContent = "Play";
  } else {
    resetSequenceState();
    playing = true;
    mainInterval = window.setInterval(PlayNotes, Util.bpmToMillis(currentBPM));
    playButton.textContent = "Stop";
  }
}

function init() {
  bpmRange.value = currentBPM;
  volumeRange.value = globalVolume * 100;
  LoadStateFromUrl();
  VolumeChange();
  BPMChange();
}

function start() {
  started = true;
}

init();
start();
