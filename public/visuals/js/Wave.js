let waveId = 0;

class Wave {
  constructor(ypos, seed, id) {
    this.ypos = ypos;
    this.seed = seed;
    this.col = color("rgba(2,45,39,0.35)");
    this.id = id;
    this.word = new WordWave("", ypos, seed, id);
    //	this.col = color(255,50)
  }

  show(disturbance, waveSp, col = this.col) {
    let noiseScaler = map(disturbance, 0, 1, 0, 300, true);
    let noiseSpeed = 300; //map(mouseX, 0, width, 10, 300);
    let waveSpeed = map(waveSp, 0, 1, 200, 10, true);
    push();
    blendMode(ADD);
    fill(col);
    let foam = map(this.ypos, 0, height, 30, 0);
    // stroke(255, 255, 255, 2 * foam);
    strokeWeight(foam / 5);
    beginShape();
    curveVertex(-0.25 * width, 1.2 * height);
    curveVertex(-0.25 * width, 1.2 * height);
    curveVertex(-0.25 * width, this.ypos);
    for (let x = -0.25 * width; x < 1.25 * width; x += width / 10) {
      let y = this.getY(x, noiseScaler, noiseSpeed, waveSpeed);
      curveVertex(x, y);
    }
    curveVertex(1.25 * width, 1.2 * height);
    curveVertex(1.25 * width, 1.2 * height);
    endShape();
    fill(255);

    this.word.update(noiseScaler, noiseSpeed, waveSpeed);
    this.word.display();
    pop();
  }

  recycleWord() {
    this.word.recycleWord();
  }

  setWord(word) {
    this.word.setWord(word);
  }

  clearWord() {
    this.word.setWordFadeout();
  }

  getY(x, noiseScaler, noiseSpeed, waveSpeed) {
    let y = this.ypos;
    y +=
      (height / 7) *
      sin(
        -frameCount / waveSpeed +
          this.seed +
          (3 * this.ypos + x / (7 + 3 * sin(frameCount / 300))) / 150
      );

    let noiseY = noise(
      this.ypos / (height / 2),
      this.seed / 20 - frameCount / noiseSpeed + x / (height / 1.5)
    );
    noiseY = noiseScaler * map(noiseY, 0, 1, -1, 1);

    y += noiseY;
    return y;
  }

  move(waveBounceSpeed) {
    let waveBounce = map(waveBounceSpeed, 0, 1, 1200, 120);
    this.ypos =
      1.4 * height -
      abs(sin(this.seed + frameCount / waveBounce) * ((7 * height) / 8));
    this.word.ypos = this.ypos;
  }
}
