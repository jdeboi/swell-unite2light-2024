let socket;
let font;
let textDisplay;
let waves;
let beach;
let sun;
let centerGrad;
let backgroundGrad;
let circleGrad;
let colors = [];
let nextColors = [];
let transitionStarted = false;
let transitionTime = 0;
let qrcode;

////////////////////
// MODE
const PROCESSING = "processing";
const COLLECTIVE = "collective";
const SUBMISSION = "submission";
const ERROR = "error";
let mode = COLLECTIVE;
let modeTime = 0;
////////////////////

const collective = {
  waveSpeed: 0.3,
  disturbance: 0.5,
  text: "we live in harmony",
  colorVals: ["#ab1234", "#ab12a4", "#ff5566"],
  colors: [],
};

function preload() {
  font = loadFont("assets/AdobeClean-Light.otf");
  beach = new Beach();
  qrcode = loadImage("assets/qrcode.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noiseSeed(2);
  textFont(font, 50);

  let latestSubmission = submissions[lastProcessSubmission];
  for (let i = 0; i < 3; i++) {
    latestSubmission.colors[i] = color(latestSubmission.colorVals[i]);
    collective.colors[i] = color(collective.colorVals[i]);
  }

  socket = io();

  socket.on("startProcessing", () => {
    console.log("start processing");

    // changeMode(PROCESSING);
  });

  socket.on("submissionError", () => {
    console.log("processing");
    changeMode(ERROR);
  });

  socket.on("newSubmission", (data) => {
    console.log("New submission received", data);
    processSubmission(data);
  });

  socket.on("collectiveData", (data) => {
    console.log("New collective received", data);
    processCollective(data);
  });

  socket.on("newCollective", (data) => {
    console.log("New collective received", data);
    processCollective(data);
  });

  qrcode = invertImage(qrcode);

  sun = new Sun(width / 2, height * 0.25, 80);
  beach.init();
  colors = [color(88, 91, 255), color(237, 12, 255), color(114, 238, 255)];

  backgroundGrad = new Gradient(colors, 0, 0, -200, width, height, false);

  // circleGrad = new Gradient(colors, width / 2, 200, 0, 300, 300, true, 100);
  centerGrad = new Gradient(
    colors,
    width / 2 - 100,
    0,
    0,
    200,
    height,
    true,
    100
  );

  textDisplay = new TextDisplay(width / 2, height * 0.45, 40);
}

function draw() {
  background(0);

  backgroundGrad.display(this);

  // circleGrad.drawCircleGradient(colors, this);

  centerGrad.display(this);
  sun.display();

  switch (mode) {
    case PROCESSING:
      displayProcessingSubmission();
      break;
    case COLLECTIVE:
      displayCollective();
      break;
    case SUBMISSION:
      displaySubmission();
      break;
    case ERROR:
      displayError();
      break;
    default:
      displayCollective();
      break;
  }

  displayFrameRate();

  const sz = 80;
  const bord = 5;
  displayQRCode(width / 2 - sz / 2 - bord, sun.y - sz / 2 - bord, sz, bord);

  displayModeText();
  checkForNewSubmission();
}

function displayModeText() {
  fill(0);
  textSize(20);
  noStroke();
  text(mode, 100, 100);
}

function displayProcessingSubmission() {
  if (millis() - modeTime > 20000) {
    // too much time has passed
    changeMode(ERROR);
    return;
  }
  transitionColors(nextColors);
  sun.displayRays(0);
  beach.display(0, 0.5, 0.5);
  textDisplay.displayMessage("processing submission");
}

function displaySubmission() {
  if (millis() - modeTime > 10000) {
    changeMode(COLLECTIVE);
    finishedDisplayingSubmission();
    return;
  }
  const submission = getSubmissionToProcess();

  transitionColors(submission.colors);
  sun.displayRays(0);

  beach.display(
    submission.disturbance,
    submission.waveSpeed,
    submission.waveSpeed
  );

  textDisplay.displayPrompt();

  push();
  // translate(0, 60);
  textDisplay.displaySubmission();
  pop();
}

function displayCollective() {
  transitionColors(collective.colors);

  beach.display(
    collective.disturbance,
    collective.waveSpeed,
    collective.waveSpeed
  );
  beach.recycleWords();

  textDisplay.displayPrompt();
}

function displayError() {
  if (millis() - modeTime > 6000) {
    // reset back to collective
    changeMode(COLLECTIVE);
    return;
  }
  transitionColors(nextColors);
  sun.displayRays(0);
  beach.display(0, 0.5, 0.5);
  textDisplay.displayMessage("error processing");
}

function displayFrameRate() {
  fill(255, 0, 0);
  noStroke();
  textFont(font, 14);
  text("FPS: " + round(frameRate()), 20, 20);
}

function mousePressed() {
  randomizeColors();
  startColorTransition();
}

function displayQRCode(x, y, sz, bord = 10) {
  push();
  translate(x, y);

  translate(bord, bord);
  // fill(255, 0, 0, 10);
  // noStroke();
  noFill();
  stroke(255, 255 / 2 + (255 / 2) * sin(frameCount / 30));
  strokeWeight(3);
  rect(-bord, -bord, sz + bord * 2, sz + bord * 2);

  image(qrcode, 0, 0, sz, sz);
  pop();
}

function randomizeColors() {
  for (let i = 0; i < colors.length; i++) {
    nextColors[i] = color(random(255), random(255), random(255));
  }
}

function startColorTransition() {
  colorMode(RGB, 255);
  randomSeed(frameCount);

  transitionTime = millis();
  transitionStarted = true;
}

function transitionColors(nextColors) {
  if (transitionStarted) {
    let elapsed = millis() - transitionTime;
    if (elapsed < 1000) {
      for (let i = 0; i < colors.length; i++) {
        colors[i] = lerpColor(colors[i], nextColors[i], elapsed / 1000);
      }
    } else {
      transitionStarted = false;
    }
  }
}

function initCollective() {
  beach.setWordWaves();
}

function initProcessing() {
  beach.clearWordWaves();
  const colorVals = ["#000000", "#22ccaa", "#000000"];
  for (let i = 0; i < colorVals.length; i++) {
    nextColors[i] = color(colorVals[i]);
  }
}
function initSubmission() {
  console.log("initializing submission");
  setNextSubmission();
  beach.clearWordWaves();
  let latestSubmission = submissions[lastProcessSubmission];
  textDisplay.txt = latestSubmission.text;
}

function initError() {
  beach.clearWordWaves();
  const colorVals = ["#000000", "#dd2266", "#000000"];
  for (let i = 0; i < colorVals.length; i++) {
    nextColors[i] = color(colorVals[i]);
  }
}

function changeMode(newMode) {
  mode = newMode;
  modeTime = millis();
  switch (mode) {
    case PROCESSING:
      initProcessing();
      break;
    case SUBMISSION:
      initSubmission();
      break;
    case ERROR:
      initError();
      break;
    case COLLECTIVE:
      initCollective();
      break;
    default:
      break;
  }
  startColorTransition();
}

function keyPressed() {
  // if (key == "p") {
  //   terrain.printColorHex();
  // }

  if (key == "c") {
    changeMode(COLLECTIVE);
  } else if (key == "s") {
    changeMode(SUBMISSION);
  } else if (key == "p") {
    changeMode(PROCESSING);
  } else if (key == "e") {
    changeMode(ERROR);
  }
}

function invertImage(img) {
  // Load the pixels
  img.loadPixels();

  // Loop through the pixels X and Y
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      // Calculate the pixel index
      const index = (y * img.width + x) * 4;

      // Get the red, green, and blue values
      const r = img.pixels[index + 0];
      const g = img.pixels[index + 1];
      const b = img.pixels[index + 2];

      // Invert the colors
      img.pixels[index + 0] = 255 - r;
      img.pixels[index + 1] = 255 - g;
      img.pixels[index + 2] = 255 - b;
    }
  }

  // We're finished working with pixels so update them
  img.updatePixels();
  return img;
}
