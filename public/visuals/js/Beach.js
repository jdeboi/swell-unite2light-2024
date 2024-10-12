class Beach {
  constructor() {
    this.waves = [];
    this.started = false;
    this.bg = 255;
    this.osc;
  }

  init() {
    this.sand = createGraphics(width, height);
    //   this.makeSand();
    this.makeWaves();
    this.setWordWaves();
    this.sand.filter(BLUR, 1);
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

  display(disturbance, waveSpeed, waveBounceSpeed) {
    this.bg = lerp(this.bg, 0, 0.005);
    this.osc.amp(0.2 - cos(frameCount / 100) / 15);
    //   image(this.sand, 0, 0);
    for (let w of this.waves) {
      w.show(disturbance, waveSpeed);
      w.move(waveBounceSpeed);
    }
    //   background(0, this.bg);
  }

  recycleWords() {
    for (let w of this.waves) {
      w.recycleWord();
    }
  }

  polygon(x, y, radius, npoints) {
    let angle = TWO_PI / npoints;
    this.sand.beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius;
      let sy = y + sin(a) * radius * 0.95;
      this.sand.vertex(sx, sy);
    }
    this.sand.endShape(CLOSE);
  }

  makeWaves() {
    for (let i = 0; i < 7; i++) {
      let ypos = height / 2;
      let seed = (i * TAU) / 7;
      this.waves.push(new Wave(ypos, seed, i));
    }
  }
}
