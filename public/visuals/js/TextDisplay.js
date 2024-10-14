const MAXWIDTH_WORDS = 300;

class TextDisplay {
  constructor(x, y, sz = 20) {
    this.txt = "abc";
    this.collectiveTxt = "def";
    this.startTime = millis();
    this.isFinished = false;
    this.phraseIndex = 0;
    this.x = x;
    this.y = y;
    this.sz = sz;
    this.startedSubmission = false;
  }

  displayPrompt(pg) {
    pg.push();
    pg.translate(this.x, this.y);
    pg.textSize(this.sz);
    pg.fill(255);
    pg.textAlign(CENTER, CENTER);
    pg.text("I dream of a climate future where...", 0, 0);
    pg.pop();
  }

  displayMessage(txt, pg, isFlashing = false) {
    const txtSz = 20;
    let alphaVal = 255;
    if (isFlashing) {
      alphaVal = 255 / 2 + (255 / 2) * sin((frameCount * frameScaler) / 30);
    }

    pg.textSize(txtSz);

    pg.push();
    pg.translate(this.x, this.y + 55);

    pg.fill(0, map(alphaVal, 0, 255, 0, 100));
    pg.noStroke();
    pg.rectMode(CENTER);
    pg.rect(0, 5, 300, txtSz + 16, txtSz);

    pg.fill(255, alphaVal);
    pg.textAlign(CENTER, CENTER);
    pg.text(txt, 0, 0);
    pg.pop();
  }

  displaySubmit(pg) {
    const txt = "scan QR code to respond";
    this.displayMessage(txt, pg, true);
  }

  displayCollective(pg) {
    this.displayBG(true, pg);
  }

  displaySubmission(pg) {
    if (this.startedSubmission && !this.isFinished) {
      this.displayBG(false, pg);
    }
  }

  display(isCollective, pg) {
    pg.push();
    pg.translate(this.x, this.y + 60);
    pg.textSize(this.sz);
    pg.fill(255);
    pg.textAlign(CENTER, CENTER);
    let words;
    if (isCollective) {
      words = this.getWords(this.collectiveTxt);
    } else {
      words = this.getWords(this.txt);
    }

    if (words) {
      pg.text(words, 0, 0);
    }
    pg.pop();
  }

  displayBG(isCollective, pg) {
    pg.push();
    // translate(this.x, this.y + 60);
    //pg.translate(0, 70);
    let words;
    if (isCollective) {
      words = this.getWords(this.collectiveTxt);
    } else {
      words = this.getWords(this.txt);
    }

    if (words) {
      this.displayMessage(words, pg);
    }
    pg.pop();
  }

  getWords(txt) {
    if (!txt) {
      return "";
    }

    textSize(this.sz / 2);
    const batchTime = 2000; // 4 seconds
    const currentTime = millis() - this.startTime;

    // Calculate how many batches of words should be displayed so far
    const batchNumber = floor(currentTime / batchTime);

    // Get all words as an array
    const words = txt.split(" ");

    let displayedWords = [];
    let currentWidth = 0;

    // Calculate which batch of words to display
    for (let i = 0; i < words.length; i++) {
      let wordWidth = textWidth(words[i] + " "); // Measure the width of the word plus a space
      if (currentWidth + wordWidth <= MAXWIDTH_WORDS * 0.44) {
        displayedWords.push(words[i]);
        currentWidth += wordWidth;
      } else {
        break; // Stop if the current line exceeds the max width
      }
    }

    // Every 4 seconds, display the next batch of words
    const numWordsInBatch = displayedWords.length;
    const wordsToShow = words.slice(
      batchNumber * numWordsInBatch,
      (batchNumber + 1) * numWordsInBatch
    );

    if (wordsToShow.length == 0) {
      this.isFinished = true;
      this.startedSubmission = false;
      // this.nextWord();
      return "";
    }

    return wordsToShow.join(" ");
  }

  startSubmission() {
    this.isFinished = false;
    this.startTime = millis();
    this.startedSubmission = true;
  }

  nextWord() {
    this.txt = phrases[this.phraseIndex++];
    this.startTime = millis();
  }

  getLetters() {
    const msPerLetter = 100;
    const msPerStr = msPerLetter * this.txt.length;
    const dt = this.startTime + msPerStr;

    if (dt < this.startTime) {
      return "";
    }

    let numLetters = floor(
      map(millis(), this.startTime, dt, 0, this.txt.length, true)
    );
    return this.txt.substring(0, numLetters);
  }
}
