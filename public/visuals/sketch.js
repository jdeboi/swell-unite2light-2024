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
let wall;

let pMapper;
let quadMap;
let pg;

const frameScaler = 1;

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
  wall = loadImage("assets/wall.png");
  beach = new Beach();
  qrcode = loadImage("assets/qrcode.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  const aspect = 16 / 10;
  // Calculate the width and height while maintaining the 16:10 aspect ratio
  let w, h;

  if (windowWidth / windowHeight > aspect) {
    // Window is wider than the 16:10 ratio, so fit the height
    h = windowHeight;
    w = h * aspect;
  } else {
    // Window is taller than the 16:10 ratio, so fit the width
    w = windowWidth;
    h = w / aspect;
  }
  pg = createGraphics(w, h);
  console.log(w, h);

  textFont(font);
  pg.textFont(font);

  noiseSeed(2);
  textFont(font, 50);

  pMapper = createProjectionMapper(this);
  quadMap = pMapper.createQuadMap(pg.width, pg.height);
  pMapper.load("assets/map.json");

  let latestSubmission = submissions[lastProcessSubmission];
  for (let i = 0; i < 3; i++) {
    latestSubmission.colors[i] = color(latestSubmission.colorVals[i]);
    collective.colors[i] = color(collective.colorVals[i]);
  }

  socket = io();

  socket.on("startProcessing", () => {
    // console.log("start processing");
    // changeMode(PROCESSING);
  });

  socket.on("submissionError", () => {
    console.log("processing");
    changeMode(ERROR);
  });

  socket.on("newSubmission", (data) => {
    // console.log("New submission received", data);
    processSubmission(data);
  });

  socket.on("collectiveData", (data) => {
    // console.log("New collective received", data);
    processCollective(data);
  });

  socket.on("newCollective", (data) => {
    console.log("New collective received", data);
    processCollective(data);
  });

  qrcode = invertImage(qrcode);

  sun = new Sun(pg.width / 2, pg.height * 0.23, 80);
  beach.init();
  colors = [color(88, 91, 255), color(237, 12, 255), color(114, 238, 255)];

  backgroundGrad = new Gradient(colors, 0, 0, -200, pg.width, pg.height, false);

  // circleGrad = new Gradient(colors, width / 2, 200, 0, 300, 300, true, 100);
  centerGrad = new Gradient(
    colors,
    pg.width / 2 - 100,
    0,
    0,
    200,
    pg.height,
    true,
    100
  );

  textDisplay = new TextDisplay(pg.width / 2, pg.height * 0.39, 40);
}

function draw() {
  background(0);
  // image(wall, -width / 2, -height / 2, wall.width * 0.5, wall.height * 0.5);
  noStroke();
  //const pg = this;
  pg.push();
  pg.background(0);
  // pg.translate(-pg.width / 2, -pg.height / 2);
  backgroundGrad.display(pg);

  // circleGrad.drawCircleGradient(colors, this);

  centerGrad.display(pg);
  sun.display(pg);

  switch (mode) {
    case PROCESSING:
      displayProcessingSubmission(pg);
      break;
    case COLLECTIVE:
      displayCollective(pg);
      break;
    case SUBMISSION:
      displaySubmission(pg);
      break;
    case ERROR:
      displayError(pg);
      break;
    default:
      displayCollective(pg);
      break;
  }

  // displayFrameRate(pg);

  const sz = 80;
  const bord = 5;
  displayQRCode(
    pg,
    pg.width / 2 - sz / 2 - bord,
    sun.y - sz / 2 - bord,
    sz,
    bord
  );

  // displayModeText();
  checkForNewSubmission();
  pg.pop();

  // push();
  // translate(-width / 2, -height / 2);
  // image(pg, 0, 0);
  // pop();
  quadMap.displayTexture(pg);

  // push();
  // translate(-width / 2, -height / 2);
  // fill("red");
  // rect(0, 0, pg.width, pg.height);
  // pop();
}

function displayModeText(pg) {
  pg.fill(0);
  pg.textSize(20);
  pg.noStroke();
  pg.text(mode, 100, 100);
}

function displayProcessingSubmission(pg) {
  if (millis() - modeTime > 20000) {
    // too much time has passed
    changeMode(ERROR);
    return;
  }
  transitionColors(nextColors);
  sun.displayRays(pg, 0);
  beach.display(0, 0.5, 0.5, pg);
  textDisplay.displayMessage("processing submission", pg);
}

function displaySubmission(pg) {
  let dt = millis() - modeTime;
  if (textDisplay.isFinished && dt > 10000) {
    changeMode(COLLECTIVE);
    finishedDisplayingSubmission();
    return;
  }
  const submission = getSubmissionToProcess();

  transitionColors(submission.colors);
  sun.displayRays(pg, 0);

  beach.display(
    submission.disturbance,
    submission.waveSpeed,
    submission.waveSpeed,
    pg
  );

  textDisplay.displayPrompt(pg);

  pg.push();
  // translate(0, 60);
  textDisplay.displaySubmission(pg);
  pg.pop();
}

function displayCollective(pg) {
  transitionColors(collective.colors);

  beach.display(
    collective.disturbance,
    collective.waveSpeed,
    collective.waveSpeed,
    pg
  );
  beach.recycleWords();

  textDisplay.displayPrompt(pg);
  // pg.push();
  // pg.translate(0, 47);
  textDisplay.displaySubmit(pg);
  // pg.pop();
}

function displayError() {
  if (millis() - modeTime > 6000) {
    // reset back to collective
    changeMode(COLLECTIVE);
    return;
  }
  transitionColors(nextColors);
  sun.displayRays(pg, 0);
  beach.display(0, 0.5, 0.5, pg);
  textDisplay.displayMessage("error processing", pg);
}

function displayFrameRate(pg) {
  pg.fill(255, 0, 0);
  pg.noStroke();
  pg.textFont(font, 14);
  pg.text("FPS: " + round(frameRate()), 20, 20);
}

function mousePressed() {
  randomizeColors();
  startColorTransition();
}

function displayQRCode(pg, x, y, sz, bord = 10) {
  pg.push();
  pg.translate(x, y);

  pg.translate(bord, bord);
  // fill(255, 0, 0, 10);
  // noStroke();
  pg.noFill();
  pg.stroke(255, 255 / 2 + (255 / 2) * sin((frameCount * frameScaler) / 30));
  pg.strokeWeight(3);
  pg.rect(-bord, -bord, sz + bord * 2, sz + bord * 2, 10);

  pg.image(qrcode, 0, 0, sz, sz);
  pg.pop();
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
  // console.log("initializing submission");
  setNextSubmission();
  beach.clearWordWaves();
  let latestSubmission = submissions[lastProcessSubmission];
  textDisplay.txt = latestSubmission.text;
  textDisplay.startSubmission();
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

// function keyPressed() {
//   // if (key == "p") {
//   //   terrain.printColorHex();
//   // }

//   if (key == "c") {
//     changeMode(COLLECTIVE);
//   } else if (key == "s") {
//     changeMode(SUBMISSION);
//   } else if (key == "p") {
//     changeMode(PROCESSING);
//   } else if (key == "e") {
//     changeMode(ERROR);
//   }
// }

function keyPressed() {
  switch (key) {
    case "c":
      pMapper.toggleCalibration();
      break;
    case "f":
      let fs = fullscreen();
      fullscreen(!fs);
      break;
    case "l":
      pMapper.load("assets/map.json");
      break;

    case "s":
      pMapper.save("map.json");
      break;
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sun.x = pg.width / 2;
  sun.y = pg.height * 0.23;
  backgroundGrad.w = pg.width;
  backgroundGrad.h = pg.height;
  centerGrad.x = pg.width / 2 - 100;
  centerGrad.h = pg.height;
  textDisplay.x = pg.width / 2;
  textDisplay.y = pg.height * 0.39;
}
