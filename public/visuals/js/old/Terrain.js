// class Terrain {
//   constructor(
//     x,
//     y,
//     z,
//     w,
//     h,
//     scale,
//     colors,
//     waveSpeed = 0,
//     amplitude = 0,
//     turbidity = 0
//   ) {
//     this.x = x;
//     this.y = y;
//     this.z = z;
//     this.w = w; // Width of the terrain
//     this.h = h; // Height of the terrain
//     this.scale = scale; // Scale determines the density of the grid
//     this.cols = this.w / this.scale;
//     this.rows = this.h / this.scale;
//     this.terrain = []; // 2D array to store the height values
//     this.flying = 0;
//     this.waveSpeed = waveSpeed;
//     this.amplitude = amplitude;
//     this.turbidity = turbidity;
//     this.colors = [...colors];

//     // Initialize the terrain array
//     for (let x = 0; x < this.cols; x++) {
//       this.terrain[x] = [];
//       for (let y = 0; y < this.rows; y++) {
//         this.terrain[x][y] = 0; // Default height
//       }
//     }
//   }

//   // Update the terrain heights using Perlin noise
//   update(
//     waveSpeed,
//     amplitude,
//     turbidity,
//     shouldConstrain = true,
//     isMountain = false
//   ) {
//     let flyingSpeed = map(waveSpeed, -1, 1, 0.08, -0.08, shouldConstrain);
//     let waveAmplitude = map(amplitude, 0, 1, 0, 200, shouldConstrain);
//     let offset = map(turbidity, 0, 1, 0, 0.2, shouldConstrain);
//     this.flying -= flyingSpeed; // Controls the "movement" of the waves
//     let yoff = this.flying;

//     for (let y = 0; y < this.rows; y++) {
//       let xoff = 0;

//       let maxDist = dist(0, 0, 0, this.rows);

//       for (let x = 0; x < this.cols; x++) {
//         let distToEdge = Math.min(dist(0, 0, x, 0), dist(0, 0, 0, y));
//         let falloff = map(distToEdge, 0, maxDist, 1, 0); // Radial falloff from center to edge

//         // Generate Perlin noise value for each point
//         let noiseVal = map(
//           noise(xoff, yoff),
//           0,
//           1,
//           isMountain ? 0 : -waveAmplitude,
//           waveAmplitude
//         );

//         if (isMountain) {
//           noiseVal *= pow(falloff, 2);
//         }

//         this.terrain[x][y] = noiseVal;
//         xoff += offset; // Increment the x direction
//       }
//       yoff += offset; // Increment the y direction
//     }
//   }

//   // Display the terrain
//   display(pg, isMountain = false) {
//     pg.push();
//     pg.rotateX(PI / 3); // Rotate to get a better view of the "waves"
//     pg.translate(-width / 2, -height / 2); // Move the terrain to the center of the canvas

//     // if (isMountain) {
//     //   pg.translate(0, 100, -100);
//     // }
//     pg.translate(this.x, this.y, this.z);

//     pg.stroke(200);
//     pg.noFill();

//     // Draw the terrain as a series of triangles
//     for (let y = 0; y < this.rows - 1; y++) {
//       let percent = map(y, 0, this.rows - 1, 0, 1);
//       let c = Gradient.lerpColors(this.colors, percent);
//       let alphaVal = map(y, 0, this.rows - 1, 255, 150);
//       let cAlpha = color(
//         red(c),
//         green(c),
//         blue(c),
//         isMountain ? 255 : alphaVal
//       );
//       pg.beginShape(TRIANGLE_STRIP); // Triangle strips for efficient rendering
//       for (let x = 0; x < this.cols; x++) {
//         pg.fill(cAlpha);
//         pg.noStroke();
//         pg.vertex(x * this.scale, y * this.scale, this.terrain[x][y]);
//         pg.vertex(x * this.scale, (y + 1) * this.scale, this.terrain[x][y + 1]);
//       }
//       pg.endShape();
//     }
//     pg.pop();
//   }

//   updateColor(index, col) {
//     if (index < 0) {
//       // Correctly wrap the negative index
//       let newIndex =
//         (this.colors.length + (index % this.colors.length)) %
//         this.colors.length;
//       this.colors[newIndex] = col;
//     } else {
//       this.colors[index % this.colors.length] = col;
//     }
//   }

//   printColorHex() {
//     Gradient.printColorHex(this.colors);
//   }
// }
