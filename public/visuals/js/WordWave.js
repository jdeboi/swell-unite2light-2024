const fadeT = 5000;
const MAXLIFE = 10000;
const DEFAULTSPACING = 10;
const TXTSIZE = 13;

class WordWave {
  constructor(txt, ypos, seed, id) {
    this.ypos = ypos;
    this.seed = seed;
    this.txt = txt;
    this.id = id;
    this.hasStarted = false;
    this.prevYpos = 0;
    this.endTime = 0;
    this.stopped = false;

    randomSeed(this.id * 2);
    this.maxHeight = height * 0.62 - this.id * 15;
    this.startTime = random(MAXLIFE * 0.8);

    this.setStartX(this.txt);
    //	this.col = color(255,50)
    this.txtHeights = [];
    for (let i = 0; i < txt.length; i++) {
      this.txtHeights.push({
        y: 100000,
        isGone: false,
        fadeStart: 0,
        isFading: false,
      });
    }
  }

  setStartX(txt) {
    randomSeed(this.id * 2);
    textSize(TXTSIZE);
    let txtW = DEFAULTSPACING * txt.length; //textWidth(this.txt);
    let rsz = width - txtW;
    if (rsz < 0) {
      rsz = 10;
    }
    this.startX = random(rsz);
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

  reset() {
    this.hasStarted = true;
    this.stopped = false;
    this.startTime = millis() + random(MAXLIFE * 0.8);

    this.setStartX(this.txt);

    for (let i = 0; i < this.txt.length; i++) {
      this.txtHeights[i].y = 100000;
      this.txtHeights[i].isGone = false;
      this.txtHeights[i].fadeStart = 0;
      this.txtHeights[i].isFading = false;
    }
  }

  allGone() {
    if (this.stopped) {
      return true;
    }
    for (let i = 0; i < this.txt.length; i++) {
      if (!this.txtHeights[i].isGone) return false;
    }
    this.stopped = true;
    this.endTime = millis();
    return true;
  }

  display(letterSpacing = DEFAULTSPACING) {
    // if (!this.hasStarted) return;
    randomSeed(this.id);
    for (let i = 0; i < this.txt.length; i++) {
      this.displayWaveLetter(i, letterSpacing);
    }
  }

  update(noiseScaler, noiseSpeed, waveSpeed, letterSpacing = DEFAULTSPACING) {
    // if (!this.hasStarted) return;
    randomSeed(this.id);
    for (let i = 0; i < this.txt.length; i++) {
      this.updateWaveLetter(
        i,
        letterSpacing,
        noiseScaler,
        noiseSpeed,
        waveSpeed
      );
    }
  }

  getXPos(i, letterSpacing) {
    return this.startX + i * letterSpacing;
  }

  setOverTime() {
    if (millis() - this.startTime > MAXLIFE) {
      return true;
    }

    return false;
  }

  setWord(word) {
    this.txt = word;
    this.txtHeights = [];
    for (let i = 0; i < this.txt.length; i++) {
      this.txtHeights.push({
        y: 100000,
        isGone: false,
        fadeStart: 0,
        isFading: false,
      });
    }
    this.reset();
  }

  setWordFadeout() {
    for (let i = 0; i < this.txt.length; i++) {
      if (!this.txtHeights[i].isFading) {
        this.txtHeights[i].isFading = true;
        this.txtHeights[i].fadeStart = millis();
      }
    }
  }

  recycleWord() {
    if (this.allGone()) {
      if (millis() - this.endTime > 4000) {
        this.reset();
      }
    }
  }

  updateWaveLetter(i, letterSpacing, noiseScaler, noiseSpeed, waveSpeed) {
    if (millis() - this.startTime > 15000) {
      if (!this.txtHeights[i].isFading) {
        this.txtHeights[i].isFading = true;
        this.txtHeights[i].fadeStart = millis();
      }
    }
    if (this.txtHeights[i].isGone) return;
    let x = this.getXPos(i, letterSpacing);
    let y = this.getY(x, noiseScaler, noiseSpeed, waveSpeed);

    this.txtHeights[i].y = y + 10;
    const maxH = this.maxHeight;
    if (this.txtHeights[i].y < maxH) {
      this.txtHeights[i].y = maxH;
      if (!this.txtHeights[i].isFading) {
        this.txtHeights[i].isFading = true;
        this.txtHeights[i].fadeStart = millis();
      }
    } else if (
      this.txtHeights[i].isFading &&
      millis() - this.txtHeights[i].fadeStart > fadeT
    ) {
      this.txtHeights[i].isGone = true;
    }
  }

  displayWaveLetter(i, letterSpacing) {
    // if (!this.hasStarted) {
    //   return;
    // }
    if (this.txtHeights[i].isGone) {
      return;
    }

    if (this.txtHeights[i].isFading) {
      const col = map(
        millis() - this.txtHeights[i].fadeStart,
        0,
        fadeT,
        255,
        0,
        true
      );

      fill(col);
    } else {
      fill(255);
    }

    let x = this.getXPos(i, letterSpacing);
    textSize(TXTSIZE);
    text(this.txt[i], x, this.txtHeights[i].y);
  }
}
