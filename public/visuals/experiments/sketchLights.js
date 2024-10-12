let lights = []; // Array to store light objects
let noiseOffsets = []; // Array to store noise offsets for each light
let grainTexture;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // Initialize WEBGL canvas
  noStroke(); // Disable stroke for cleaner visuals
  grainTexture = loadImage("assets/grain.jpg");

  // Initialize light properties (color and initial positions)
  lights = [
    {
      color: [255, 0, 0],
      xOffset: random(10),
      yOffset: random(10),
      zOffset: random(10),
    }, // Red
    {
      color: [0, 255, 0],
      xOffset: random(10),
      yOffset: random(10),
      zOffset: random(10),
    }, // Green
    {
      color: [0, 0, 255],
      xOffset: random(10),
      yOffset: random(10),
      zOffset: random(10),
    }, // Blue
    {
      color: [155, 155, 0],
      xOffset: random(10),
      yOffset: random(10),
      zOffset: random(10),
    }, // Yellow
    {
      color: [0, 100, 100],
      xOffset: random(10),
      yOffset: random(10),
      zOffset: random(10),
    }, // Magenta
    {
      color: [0, 255, 255],
      xOffset: random(10),
      yOffset: random(10),
      zOffset: random(10),
    }, // Cyan
  ];

  // Initialize noise offsets for each light
  for (let i = 0; i < lights.length; i++) {
    noiseOffsets.push({ x: random(10), y: random(10), z: random(10) });
    let spacing = 300;
    lights[i].x = random(-spacing, spacing);
    lights[i].y = random(-spacing, spacing);
  }
}

function draw() {
  background(255); // Set the background to white

  // Basic ambient light to brighten the scene slightly
  ambientLight(0, 40, 40); // Dim ambient light for subtle background illumination

  // Update and draw each light
  let lightDistance = 20; // Distance of lights above the plane
  let intensity = 1; // Intensity of the lights

  for (let i = 0; i < lights.length; i++) {
    let light = lights[i];
    let offset = noiseOffsets[i];

    // Calculate light positions using noise
    let spacing = 500;
    // let lightX =
    //   light.x +
    //   noise(offset.x) * spacing -
    //   spacing / 2 +
    //   50 * sin(frameCount * 0.01); // Scale noise to a range
    // let lightY =
    //   light.y +
    //   noise(offset.y) * spacing -
    //   spacing / 2 +
    //   50 * sin(frameCount * 0.01);

    let lightX =
      light.x + 100 * sin(frameCount * 0.04 + light.x + noise(offset.x)); // Scale noise to a range
    let lightY =
      light.y + 100 * cos(frameCount * 0.03 + light.y + noise(offset.y));
    let lightZ = lightDistance;

    // Set the point light with calculated positions
    pointLight(
      light.color[0] * intensity,
      light.color[1] * intensity,
      light.color[2] * intensity,
      lightX,
      lightY,
      lightZ
    );

    // Update noise offsets to animate movement over time
    offset.x += 0.01;
    offset.y += 0.01;

    push();
    translate(lightX, lightY, lightZ);
    //sphere(20);
    pop();
  }

  // Draw the white plane
  translate(0, 0, -150); // Position the plane slightly back
  ambientMaterial(0, 255, 255); // Set the material to interact with lights
  plane(width * 0.8, height * 0.8); // Draw the plane

  addGrainTexture();
}

function addGrainTexture() {
  // Use blendMode to overlay the grain texture
  blendMode(MULTIPLY); // Use multiply blending for a grainy effect
  // Draw the grain texture once, cover the canvas
  push();
  translate(-width / 2, -height / 2, 0);
  image(grainTexture, 0, 0, width, height);

  pop();

  blendMode(BLEND); // Reset to default blend mode
}
