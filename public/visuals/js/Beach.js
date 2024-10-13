class Beach {
  constructor() {
    this.waves = [];
    this.started = false;
    this.bg = 255;
    this.osc;
  }

  init() {
    //this.sand = createGraphics(width, height);
    //   this.makeSand();
    this.makeWaves();
    this.setWordWaves();
    // this.sand.filter(BLUR, 1);
    this.osc = new p5.Noise("brown");
    this.osc.start();
    this.osc.amp(0);
  }

  setWordWaves() {
    for (let i = 0; i < this.waves.length; i++) {
      let submission = submissions[lastProcessSubmission - i].text;
      this.waves[i].setWord(submission);
    }
  }

  clearWordWaves() {
    for (let w of this.waves) {
      w.clearWord();
    }
  }

  setSubmissionWord(submission) {
    this.waves[0].setWord(submission);
  }

  display(disturbance, waveSpeed, waveBounceSpeed, pg) {
    this.bg = lerp(this.bg, 0, 0.005);
    this.osc.amp(0.2 - cos((frameCount * frameScaler) / 100) / 15);
    //   image(this.sand, 0, 0);
    for (let w of this.waves) {
      w.show(pg, disturbance, waveSpeed);
      w.move(waveBounceSpeed);
    }
    //   background(0, this.bg);
  }

  recycleWords() {
    for (let w of this.waves) {
      w.recycleWord();
    }
  }

  makeWaves() {
    for (let i = 0; i < 7; i++) {
      let ypos = height / 2;
      let seed = (i * TAU) / 7;
      this.waves.push(new Wave(ypos, seed, i));
    }
  }
}
