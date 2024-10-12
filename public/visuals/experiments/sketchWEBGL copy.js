let terrain;
let textDisplay;
let font;
let backgroundGrad;
let mask;
let mountains;
let buffer;
let invertBuffer;
let colorWheel;
let colors;
let currentIndex = 0;
let selectedColor;
let colorWheelImg;
let centerGrad;
let gradShader;

function preload() {
  font = loadFont("assets/AdobeClean-Light.otf");
  colorWheelImg = loadImage("assets/colorwheel.png");
}
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noiseSeed(2);
  textFont(font, 50);

  //   buffer = createGraphics(width, height, WEBGL);
  //   invertBuffer = createGraphics(width, height, WEBGL);

  colors = [color(88, 91, 255), color(237, 12, 255), color(114, 238, 255)];

  terrain = new Terrain((width - 0.6 * width) / 2, 0, 0, width * 0.6, 800, 30, [
    color(237, 12, 255),
    color(88, 91, 255),
    color(114, 238, 255),
  ]); // width, height, scale
  //   mountains = new Terrain(-width * 0.4, 100, -100, width * 1.6, 300, 40, [
  //     color(237, 12, 255),
  //     color(114, 238, 255),
  //   ]);
  //   mountains.update(0, 3, 0.4, false, true);

  textDisplay = new TextDisplay(0, 0, 50);

  backgroundGrad = new Gradient(
    colors,
    (-width * 1.3) / 2,
    (-height * 1.3) / 2,
    -200,
    width * 1.3,
    height * 1.3,
    false
  );

  centerGrad = new Gradient(
    colors,
    -100,
    -height / 2,
    0,
    200,
    height,
    true,
    100
  );

  colorWheel = new ColorWheelPicker(
    -width / 2 + 120,
    -height / 2 + 200,
    100,
    colorWheelImg
  );
}

function draw() {
  background(0);
  //   buffer.clear(0, 0, 0, 0);
  //   invertBuffer.clear(0, 0, 0, 0);

  backgroundGrad.display(this);

  // Your other drawing logic
  //   mountains.display(this, true);

  terrain.update(0.1, 0.5, 0.3);
  terrain.display(this);

  //   image(buffer, -width / 2, -height / 2);

  //   invertBuffer.filter(INVERT);
  //   let masked;
  //   (masked = invertBuffer.get()).mask(mask);
  //   image(masked, -width / 2, -height / 2);

  // Draw the rest of your elements after the inversion
  textDisplay.display();
  centerGrad.display(this);

  displayFrameRate();

  //   image(mask, -width / 2, -height / 2);

  // Display the color wheel
  //colorWheel.display();

  // Display the gradient using the selected color

  backgroundGrad.display(this);
}

function displayFrameRate() {
  fill(255, 0, 0);
  noStroke();
  textFont(font, 14);
  text("FPS: " + round(frameRate()), -width / 2 + 20, -height / 2 + 20);
}

function mousePressed() {
  // Handle color picking
  let col = colorWheel.pickColor();
  if (col) {
    selectedColor = col; // Store the selected color
    terrain.updateColor(currentIndex, selectedColor);
    console.log(selectedColor);
  }
}

function keyPressed() {
  if (keyCode == UP_ARROW) {
    currentIndex++;
  }
  if (keyCode == DOWN_ARROW) {
    currentIndex--;
    // if (currentIndex < 0) {
    //   currentIndex = grad.colors.length - 1;
    // }
  }

  if (key == "p") {
    terrain.printColorHex();
  }
}
