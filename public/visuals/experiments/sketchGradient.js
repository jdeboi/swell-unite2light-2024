let colors; // Declare colors globally
let grainTexture; // Variable to hold the grain texture image

function preload() {
  // Load the grain texture image
  grainTexture = loadImage("assets/grain.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // Initial colors setup
  colors = [
    color(255, 0, 0), // Red
    color(0, 255, 0), // Green
    color(0, 0, 255), // Blue
    color(255, 255, 0), // Yellow
  ];
}

function draw() {
  background(0); // Clear the background each frame

  // Draw the animated gradient
  drawLinearGradient(colors, 0, 0, width, height, true);
  //   drawLinearGradient(colors, 220, 100, 100, 400, false);

  // Add grain texture on top of the gradient
  addGrainTexture();
}

function drawLinearGradient(
  colors,
  x = 0,
  y = 0,
  w = width,
  h = height,
  invert = false
) {
  let extendedColors = [...colors, colors[0]]; // Create a local extended array
  let segmentHeight = h / (extendedColors.length - 1);
  let offset = (frameCount * 2) % h;

  push();
  translate(x, y);
  if (invert) {
    scale(1, -1);
    translate(0, -h);
  }

  // Loop through each segment and draw lines to create the gradient
  for (let i = 0; i < extendedColors.length - 1; i++) {
    let c1 = extendedColors[i];
    let c2 = extendedColors[i + 1];
    for (let _y = 0; _y < segmentHeight; _y++) {
      let inter = map(_y, 0, segmentHeight, 0, 1);
      let c = lerpColor(c1, c2, inter);
      let animatedY = _y + i * segmentHeight + offset;
      if (animatedY < 0) animatedY += h;
      animatedY %= h;

      stroke(c);
      line(0, animatedY, w, animatedY);
    }
  }

  pop();
}

function addGrainTexture() {
  // Use blendMode to overlay the grain texture
  blendMode(MULTIPLY); // Use multiply blending for a grainy effect
  // Draw the grain texture once, cover the canvas
  image(grainTexture, 0, 0, width / 2, height / 2);
  image(grainTexture, 0, height / 2, width / 2, height / 2);
  image(grainTexture, width / 2, 0, width / 2, height / 2);
  image(grainTexture, width / 2, height / 2, width / 2, height / 2);

  blendMode(BLEND); // Reset to default blend mode
}
