

export default class Audio {
  constructor() {
    this.ctx = new AudioContext();
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.start(0);

    const amp = this.ctx.createGain();
    amp.gain.value = 0;

    osc.connect(amp);
    amp.connect(this.ctx.destination);

    this.osc = osc;
    this.amp = amp;

    this.activeNotes = [];
  }

  /**
   * Load an audio sample from the specified path, decode it
   * and return the resulting AudioBuffer
   */
  fetchSample(path) {
    return fetch(encodeURIComponent(path))
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.ctx.decodeAudioData(arrayBuffer));
  }

  playSample(buf) {
    const bufSource = this.ctx.createBufferSource();
    bufSource.buffer = buf;
    // create a new gain node and connect the source to it
    const amp = this.ctx.createGain();
    bufSource.connect(amp);
    // connect to output
    amp.connect(this.ctx.destination);
    // set volume
    amp.gain.value = 0.3;
    // play immediately
    bufSource.start(0);
  }

  playNote(freq) {
    this.osc.frequency.value = freq;
    this.amp.gain.value = 1;
    this.activeNotes.push(freq);
    setTimeout(this.endNote.bind(this), 300);
  }

  endNote() {
    this.activeNotes.shift();
    if (this.activeNotes.length === 0) {
      this.amp.gain.value = 0;
    }
  }
}
