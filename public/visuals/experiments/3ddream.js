let flowerPods = [];
let socket; // Socket.io client
let bgImg;
let anaglyph;
let recentFlower;
let startImg;
let currentTopIndex = 0; // Index of the topmost flower in the visible set of 5
const maxDreams = 15;
const imgOnView = 10;

function preload() {
  font = loadFont("assets/AdobeClean-Light.otf");
  initializePods(maxDreams);
  startImg = loadImage("assets/dream.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  anaglyph = createAnaglyph(this);
  anaglyph.setDivergence(1);

`  socket = io();

  if (flowerPods.length > 0) {
    recentFlower = flowerPods[0];
  }

  socket.on("newFlower", (data) => {
    console.log("New flower data received:", data);
    loadFlower(data);
  });

  socket.on("dreamUpdated", (data) => {
    console.log("New dream received:");
    loadFlower(data);
  });`
}

function draw() {
  background(0);

  anaglyph.draw(scene);

  // erase();
  fill(255);
  ellipse(0, 0, 50);
  // noErase();

  displayFrameRate();
}

function scene(pg) {
  pg.background(0);
  pg.fill(255);

  pg.push();
  const imgSz = 512;
  pg.translate(-imgSz / 2, -imgSz / 2, -200);

  pg.image(startImg, 0, 0);

  let space = 50;
  let visiblePods = getVisiblePods(); // Get the 5 visible pods by cycling through indexes

  // Draw only the visible pods
  // visiblePods.length
  for (let i = 0; i < 5; i++) {
    pg.translate(0, 0, space);
    pg.tint(100);
    pg.image(startImg, 0, 0);
    // visiblePods[0].display(pg);
  }

  pg.pop();
}

// Get the 5 visible flower pods based on the currentTopIndex
function getVisiblePods() {
  if (flowerPods.length == 0) {
    return [];
  }
  let visiblePods = [];
  for (let i = 0; i < imgOnView; i++) {
    // Calculate the correct index using the top index
    let index = (currentTopIndex + i) % flowerPods.length;
    visiblePods.push(flowerPods[index]);
  }
  return visiblePods;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  anaglyph.resize();
}

// Scroll event to cycle the images by changing the index
function mouseWheel(event) {
  if (flowerPods.length <= imgOnView) return; // If there are less than or equal to 5 images, no cycling

  if (event.deltaY > 0) {
    // Scrolling down: Move the topmost image to the back by incrementing the index
    currentTopIndex = (currentTopIndex + 1) % flowerPods.length;
  } else {
    // Scrolling up: Move the last image to the front by decrementing the index
    currentTopIndex =
      (currentTopIndex - 1 + flowerPods.length) % flowerPods.length;
  }
}

function keyPressed() {
  if (flowerPods.length <= imgOnView) return; // If there are less than or equal to 5 images, no cycling

  if (keyCode === UP_ARROW) {
    // Scrolling down: Move the topmost image to the back by incrementing the index
    currentTopIndex = (currentTopIndex + 1) % flowerPods.length;
  } else if (keyCode === DOWN_ARROW) {
    // Scrolling up: Move the last image to the front by decrementing the index
    currentTopIndex =
      (currentTopIndex - 1 + flowerPods.length) % flowerPods.length;
  }
}

function initializePods(numPods) {
  // Fetch the last 10 flower pods from the database
  fetch(`../api/getRecentFlowers?numPods=${numPods}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("data:", data);
      data.forEach((flower) => {
        loadFlower(flower);
      });
    })
    .catch((err) => console.error("Error fetching recent flowers:", err));
}

function loadFlower(flower) {
  if (flower.imgBase64) {
    const base64Image = `data:image/jpeg;base64,${flower.imgBase64}`;

    const img = loadImage(base64Image, () => {
      const newFlowerPod = new FlowerPod();
      newFlowerPod.setImage(img);
      if (flower.content) {
        newFlowerPod.content = flower.content;
      }
      if (flower.section) {
        newFlowerPod.section = flower.section;
      }

      // Only append if we have less than 10 flowers
      if (flowerPods.length < maxDreams) {
        flowerPods.push(newFlowerPod);
      } else {
        flowerPods.shift(); // Remove the oldest flower pod if the array exceeds 10
        flowerPods.push(newFlowerPod);
      }
      recentFlower = newFlowerPod;
    });
  }
}

function displayFrameRate() {
  fill(255);
  noStroke();
  textFont(font, 14);
  text("FPS: " + round(frameRate()), -width / 2 + 20, -height / 2 + 20);
}
