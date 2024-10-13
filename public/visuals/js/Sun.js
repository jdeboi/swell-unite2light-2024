class Sun {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;

    this.topColor = color(255, 255, 0);
    this.bottomColor = color(255, 100, 0);
  }

  display(pg) {
    pg.colorMode(RGB, 255);
    pg.noStroke();

    // Draw the gradient by drawing many thin horizontal lines within the circle
    for (let i = -this.r; i <= this.r; i++) {
      // Calculate the y-coordinate of the current line
      let yOffset = this.y + i;

      // Calculate the corresponding color by interpolating between topColor and bottomColor
      let inter = map(i, -this.r, this.r, 0, 1); // Map i to a value between 0 and 1
      let c = lerpColor(this.topColor, this.bottomColor, inter);

      // Calculate the width of the current line (using Pythagoras to keep it circular)
      let lineLength = sqrt(this.r * this.r - i * i);

      // Set the fill color and draw a horizontal line
      pg.fill(c);
      pg.rect(this.x - lineLength, yOffset, lineLength * 2, 1); // Draw the line horizontally
    }
    // this.displayRays(alphaVal);
  }

  displayRays(pg, alphaVal = 1) {
    let maxRadius = 600;
    let numArcs = maxRadius / 20;

    pg.push();
    pg.translate(this.x, this.y);
    for (let i = 0; i < numArcs; i++) {
      let radius = map(i, 0, numArcs - 1, 80, maxRadius);
      let startAngle = 10 * sin(frameCount * frameScaler / 500 + i * 0.2); // Rotating at different speeds
      let endAngle = startAngle + map(i, 0, numArcs - 1, 60, 120); // Varied arc size

      let inter = map(i, 0, numArcs, 0, 1); // Map i to a value between 0 and 1
      let c = lerpColor(this.topColor, this.bottomColor, inter);

      //   stroke(red(c), green(c), blue(c), map(i, 0, numArcs, 0, 30));
      pg.stroke(255, map(i, 0, numArcs * 0.6, 50, 0, true));
      pg.strokeWeight(10);
      pg.noFill();
      pg.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle);
    }
    pg.pop();
  }
}
