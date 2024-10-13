class ColorWheelPicker {
  constructor(x, y, radius, img) {
    this.x = x; // X position of the center of the color wheel
    this.y = y; // Y position of the center of the color wheel
    this.radius = radius; // Radius of the color wheel
    this.selectedColor = color(255); // Initially selected color (default white)
    this.picking = false; // State to track if a color is being picked
    this.img = img;
  }

  // Display the color wheel
  display() {
    // Create a color wheel using polar coordinates
    if (this.img) {
      image(
        this.img,
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
      );
    } else {
      for (let angle = 0; angle < 360; angle += 1) {
        for (let r = 0; r < this.radius; r++) {
          let col = this.angleToColor(angle, r / this.radius); // Convert angle to color
          let xPos = this.x + cos(radians(angle)) * r;
          let yPos = this.y + sin(radians(angle)) * r;
          stroke(col);
          point(xPos, yPos);
        }
      }
    }

    // Draw a circle to show the currently selected color
    fill(this.selectedColor);
    noStroke();
    ellipse(this.x, this.y + this.radius + 20, 30, 30); // Display the selected color below the wheel
    fill(255);
    text(this.selectedColor, this.x, this.y + this.radius + 20);
  }

  mouseOver() {
    let d = dist(mouseX - width / 2, mouseY - height / 2, this.x, this.y);
    if (d < this.radius) {
      return true;
    }
    return false;
  }

  // Handle mousePressed to pick a color from the wheel
  pickColor() {
    if (this.mouseOver()) {
      const my = mouseY - height / 2;
      const mx = mouseX - width / 2;
      let angle = degrees(atan2(my - this.y, mx - this.x));
      if (angle < 0) angle += 360; // Adjust the angle to a positive value

      let d = dist(mouseX - width / 2, mouseY - height / 2, this.x, this.y);
      let r = d / this.radius; // Normalize the distance to the radius

      // Pick the color based on angle and distance
      this.selectedColor = this.angleToColor(angle, r);
      return this.selectedColor;
    }
    return null;
  }

  // Convert angle and distance to color (HSV to RGB conversion)
  angleToColor(angle, radius) {
    let hueVal = angle; // Hue is determined by the angle
    let saturation = radius; // Saturation is based on distance from center
    let brightness = 1; // Brightness is fixed at 1 (full brightness)
    colorMode(HSB);
    let col = color(hueVal, saturation * 100, brightness * 100);
    colorMode(RGB, 255); // Return to RGB color mode
    return col;
  }
}
