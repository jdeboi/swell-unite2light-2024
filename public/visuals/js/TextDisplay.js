class TextDisplay {
  constructor(x, y, sz = 20) {
    this.txt = phrases[0];
    this.collectiveTxt = phrases[1];
    this.startTime = millis();
    this.isFinished = false;
    this.phraseIndex = 0;
    this.x = x;
    this.y = y;
    this.sz = sz;
  }

  displayPrompt() {
    push();
    translate(this.x, this.y);
    textSize(this.sz);
    fill(255);
    textAlign(CENTER, CENTER);
    text("I dream of a climate future where...", 0, 0);
    pop();
  }

  displayMessage(txt) {
    const alphaVal = 255 / 2 + (255 / 2) * sin(frameCount / 30);

    textSize(this.sz * 0.75);

    push();
    translate(this.x, this.y);

    fill(0, map(alphaVal, 0, 255, 0, 100));
    noStroke();
    rectMode(CENTER);
    rect(0, 8, textWidth(txt) + 36, this.sz + 16, this.sz);

    fill(255, alphaVal);
    textAlign(CENTER, CENTER);
    text(txt, 0, 0);
    pop();
  }

  displayCollective() {
    this.displayBG(true);
  }

  displaySubmission() {
    this.displayBG(false);
  }

  display(isCollective) {
    push();
    translate(this.x, this.y + 60);
    textSize(this.sz);
    fill(255);
    textAlign(CENTER, CENTER);
    let words;
    if (isCollective) {
      words = this.getWords(this.collectiveTxt);
    } else {
      words = this.getWords(this.txt);
    }

    if (words) {
      text(words, 0, 0);
    }
    pop();
  }

  displayBG(isCollective) {
    push();
    // translate(this.x, this.y + 60);
    translate(0, 60);
    let words;
    if (isCollective) {
      words = this.getWords(this.collectiveTxt);
    } else {
      words = this.getWords(this.txt);
    }

    if (words) {
      this.displayMessage(words);
    }
    pop();
  }

  getWords(txt) {
    if (!txt) {
      return "";
    }

    const maxWidth = 600;
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
      if (currentWidth + wordWidth <= maxWidth) {
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
      // this.nextWord();
      return "";
    }

    return wordsToShow.join(" ");
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
