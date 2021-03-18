class Util{
    static baseNotesNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    static baseNotes = [52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63];
    static octave = 12;
    
    static majorOffsets = [0,2,4,5,7,9,11,12];
    static minorOffsets = [0,2,3,5,7,8,10,12];

    static noteFromName(note_name){
        let index = this.baseNotesNames.indexOf(note_name);
        if (index >= 0)
            return this.baseNotes[index];
        else{
            console.log("Note not found for name "+ note_name);
            return this.baseNotes[0];
        }
    }

    static bpmToMillis(bpm){
        return 1000 * 60 / bpm;
    }

    static keyFrequency(key){
        return Math.pow(2, (key - 49) / 12) * 440;
    }

    static numberToNote(n, oct, baseNote, keyOffsets){
        let ko = n % keyOffsets.length;
        return this.keyFrequency(baseNote + keyOffsets[ko] + oct * this.octave);
    }
}