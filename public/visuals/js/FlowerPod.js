class FlowerPod {
  constructor() {
    this.x = 0; //random(300, width - 300);
    this.y = 0; //random(300, height - 300);
    this.z = 0;
    this.rotation = 0;
    this.radius = 150; // random(100, 500);
    this.color = color(random(255), random(255), random(255));
    this.img = null;
    this.content = "";
    this.section = { x: 0, y: 0, width: 0, height: 0 };
  }

  display(pg) {
    if (pg == null) {
      return;
    }
    pg.push();
    pg.textFont(font, 50);

    pg.translate(this.x, this.y, this.z);

    // this.displayContent(pg);
    // this.displayCircleImg(pg);

    if (this.img) {
      //pg.imageMode(CENTER);
      pg.tint(255, 80);
      pg.image(this.img, 0, 0);
      // this.displayImagePopout(pg);
    }

    pg.pop();
  }

  eraseCenter(pg) {
    pg.push();
    pg.erase();
    pg.noStroke();
    pg.fill(255);
    pg.ellipse(0, 0, 50);
    pg.noErase();
    pg.pop();
  }

  displayImagePopout(pg) {
    if (this.section.width > 0 && this.section.height > 0) {
      //pg.imageMode(CENTER);
      pg.push();
      // const dz = 50 + 50 * sin(frameCount * 0.1);
      const dz = 0;
      pg.translate(0, 0, dz);
      pg.noFill();
      pg.stroke(255);
      pg.strokeWeight(5);
      // pg.rect(
      //   this.section.x,
      //   this.section.y,
      //   this.section.width,
      //   this.section.height
      // );

      // image(img, dx, dy, dWidth, dHeight, sx, sy, [sWidth], [sHeight], [fit], [xAlign], [yAlign])
      pg.image(
        this.img,
        this.section.x,
        this.section.y,
        this.section.width,
        this.section.height,
        this.section.x,
        this.section.y,
        this.section.width,
        this.section.height
      );
      pg.pop();
    }
  }

  displayCircleImg(pg) {
    pg.fill(this.color);
    //sphere(this.radius);
    pg.ellipse(0, 0, this.radius * 2 + 10);
    if (this.img) {
      pg.image(this.img, 0, 0, this.radius * 2, this.radius * 2);
    }
  }

  displayContent(pg) {
    if (this.content) {
      pg.fill(255);
      pg.noStroke();
      // center text
      pg.textAlign(CENTER, CENTER);
      pg.textSize(20);
      pg.text(this.content, -this.radius, this.radius + 50, this.radius * 2);
    }
  }

  createCircularImage(originalImg) {
    // Create a square canvas with the same size as the image
    let circleImg = createGraphics(this.radius * 2, this.radius * 2);

    // Draw a circular mask
    circleImg.ellipse(
      this.radius,
      this.radius,
      this.radius * 2,
      this.radius * 2
    );

    // Apply the mask to the original image
    let maskedImg = originalImg.get();
    maskedImg.mask(circleImg);

    return maskedImg;
  }

  setImage(img) {
    this.img = img;
    // this.img = this.createCircularImage(img); // Store the circular image
  }
}
