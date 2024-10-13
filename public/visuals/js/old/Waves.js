// // How many rows of waves to display

// class Waves {
//   static waveId = 0;
//   constructor(rows = 5, waveMaxHeight = 150) {
//     this.rows = rows;
//     this.waveMaxHeight = waveMaxHeight;
//     this.baseT = 0;
//     this.disturbance = 0.5;
//     this.waveNoise = 0.001;
//     this.waveId = Waves.waveId++;
//   }

//   display() {
//     this.drawWaves(this.rows, this.waveMaxHeight);
//   }

//   update(speedVal, waveH, waveN) {
//     let waveSpeed = map(speedVal, -1, 1, -0.02, 0.02, true);
//     // let waveSpeed = map(mouseX, 0, width, -0.02, 0.02, true);
//     this.baseT += waveSpeed;

//     let waveHeight = map(waveH, 0, 1, 50, 200, true);
//     // let waveHeight = map(mouseX, 0, width, 50, 200, true);
//     this.waveMaxHeight = waveHeight;

//     let waveNoise = map(waveN, 0, 1, 0.001, 0.05, true);
//     // let waveNoise = map(mouseX, 0, width, 0.001, 0.05, true);
//     this.waveNoise = waveNoise;

//     let disturb = 0.5;
//     let disturbance = map(disturb, 0, 1, 0, 1, true);
//     this.disturbance = 0.3; // disturbance;
//   }

//   drawWaves(number, waveMaxHeight) {
//     // Loop through all our rows and draw each wave
//     // We loop "backwards" to draw them one on top of the other
//     // nicely
//     for (let i = number; i >= 0; i--) {
//       this.drawWave(i, number, waveMaxHeight);
//     }
//     // Increment the base time parameter so that the waves move
//   }

//   drawWave(n, rows, waveMaxHeight) {
//     // Calculate the base y for this wave based on an offset from the
//     // bottom of the canvas and subtracting the number of waves
//     // to move up. We're dividing the wave height in order to make the
//     // waves overlap
//     let dy = 10 * sin(frameCount / 100);
//     let baseY = height - (n * waveMaxHeight) / 3 + dy;

//     // Get the starting time parameter for this wave based on the
//     // base time and an offset based on the wave number
//     let baseT2 = this.baseT + 0.2 * sin(frameCount / 50 + this.waveId);
//     let t = baseT2 + n * 100;
//     // We'll start each wave at 0 on the x axis
//     let startX = 0;
//     // Let's start drawing
//     push();
//     // We'll use the HSB model to vary their color more easily
//     colorMode(HSB);
//     // Calculate the hue (0 - 360) based on the wave number, mapping
//     // it to an HSB hue value
//     let hue = map(n, 0, rows, 200, 250);
//     fill(hue, 60, 50, 100);
//     noStroke();
//     // We're using vertex-based drawing
//     beginShape();
//     // Starting vertex!
//     vertex(startX, baseY);
//     // Loop along the x axis drawing vertices for each point
//     // along the noise() function in increments of 10
//     for (let x = startX; x <= width; x += 10) {
//       // Calculate the wave's y based on the noise() function
//       // and the baseY

//       let y = baseY - map(noise(t), 0, 1, 10, waveMaxHeight);
//       // Draw our vertex
//       vertex(x, y);
//       // Increment our time parameter so the wave varies on y
//       t += this.waveNoise;
//     }
//     // Draw the final three vertices to close the shape around
//     // the edges of the canvas
//     vertex(width, baseY);
//     vertex(width, height);
//     vertex(0, height);
//     // Done!
//     endShape();
//   }
// }
