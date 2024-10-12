class TwinklingStar {
    constructor(x, y, maxSize, minSize) {
      this.x = x;
      this.y = y;
      this.maxSize = maxSize;
      this.minSize = minSize;
      this.size = random(minSize, maxSize);
      this.brightness = random(100, 255);
      this.twinkleSpeed = random(0.01, 0.05);
      this.twinkleOffset = random(TWO_PI);
    }
  
    update() {
      // Calculate the new brightness based on a sine wave function
      this.brightness = map(sin(frameCount * this.twinkleSpeed + this.twinkleOffset), -1, 1, 100, 255);
    }
  
    display() {
      noStroke();
      fill(this.brightness);
      ellipse(this.x, this.y, this.size);
    }
  }