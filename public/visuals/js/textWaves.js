function displayTextAroundCircle(str, radius, letterSpacing = 14) {
  let totalArcLength = 0; // Accumulator for the arc length
  push();
  // rotate(frameCount * 0.01);
  let startAngle = PI;

  // while (totalArcLength < 2 * PI * radius) {
  push();
  rotate(0.005 * radius);

  for (let i = 0; i < str.length; i++) {
    if (totalArcLength > 2*radius*PI) {
      break;
    }
    // Calculate the angle for each letter based on its position along the circle
    let angle = startAngle - totalArcLength / radius; // Subtract to rotate clockwise

    // Calculate the x and y positions for the letter along the circumference
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    let z = grid.getZ(x, y);
   
    // Rotate each letter to match the circle's curvature
    let rotationAngle = angle + HALF_PI; // Rotate to align with the circle

    // Display each character at the calculated position
    push();
    translate(x, y, z);
    rotate(rotationAngle + PI); // Rotate 180 degrees to make text upright
    text(str[i], 0, 0);
    pop();

    // Increment the arc length by letterSpacing for the next character
    totalArcLength += letterSpacing;
  }
  pop();
  // }
  pop();
}

function displayCircleText() {
  push();
  rotateX(PI / 3);

  fill(255); // (r, g, b)
  displayTextAroundCircle("Circular Text Wrap", circleSize, 15);
  displayTextAroundCircle("Circular Text Wrap", circleSize * 0.75, 15);
  displayTextAroundCircle("Circular Text Wrap", circleSize * 0.5, 15);

  pop();
}

function displayWaves() {
  noFill();
  strokeWeight(5);

  push();
  rotateX(PI / 3);
  translate(0, 0, -3);
  stroke(0, 64, 128); // (r, g, b)
  circle(0, 0, circleSize*2); // (x, y, size) -- big circle
  circle(0, 0, circleSize * 0.75*2); // decreases size by 25% -- medium circle
  circle(0, 0, circleSize * 0.5*2); // decreases size by 50% -- small circle
  pop();
}

function displaySubmission(str) {
  push();
  fill(0, 64, 128);
  noStroke();

  let radius = circleSize * 0.55; // Adjust the radius to fit within the medium circle
  let angleStep = TWO_PI / str.length; // Determines how much to rotate per character


  for (let i = 0; i < str.length; i++) {
    let angle = i * angleStep;
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;

    // Rotate each letter to match the angle
    push();
    translate(x, y);
    rotate(angle + HALF_PI); // Rotate the letter to follow the curve
    text(str[i], 0, 0);
    pop();
  }

  pop();
}

function displayTextAlongPath(str, points, letterSpacing = 14) {
  let totalLength = 0;
  let segmentLengths = [];

  // Calculate the length of each segment and the total path length
  for (let i = 0; i < points.length - 1; i++) {
    let p1 = points[i];
    let p2 = points[i + 1];
    let segLength = dist(p1.x, p1.y, p2.x, p2.y);
    segmentLengths.push(segLength);
    totalLength += segLength;
  }

  let currentDistance = 0;
  let pointIndex = 0;

  for (let i = 0; i < str.length; i++) {
    // Ensure that the current distance along the path stays within the current segment
    while (currentDistance > segmentLengths[pointIndex]) {
      currentDistance -= segmentLengths[pointIndex];
      pointIndex++;
    }

    // Interpolate between two points to find the position for the current letter
    let p1 = points[pointIndex];
    let p2 = points[pointIndex + 1];

    let t = currentDistance / segmentLengths[pointIndex];
    let x = lerp(p1.x, p2.x, t);
    let y = lerp(p1.y, p2.y, t);

    // Calculate the angle for the rotation of each character
    let angle = atan2(p2.y - p1.y, p2.x - p1.x);

    // Draw each character at the computed position and rotate it to align with the path
    push();
    translate(x, y);
    rotate(angle);
    fill(255);
    text(str[i], 0, 0);
    pop();

    // Move to the next character position by the fixed distance (letterSpacing)
    currentDistance += letterSpacing;
  }
}

function displayTextOnSineWaveWithRotation(
  str,
  amplitude,
  phase,
  letterSpacing = 14
) {
  let x = 0; // Start at x = 0 and move right by letterSpacing for each letter
  let wavelength = 100; // Adjust this value to control the wavelength of the sine wave
  let k = TWO_PI / wavelength; // Angular frequency of the wave

  for (let i = 0; i < str.length; i++) {
    // Calculate y based on the sine wave equation
    let y = amplitude * sin(k * x + phase);

    // Calculate the derivative (slope) of the sine wave at this point
    let slope = amplitude * k * cos(k * x + phase);

    // Use atan2 to calculate the angle of the tangent based on the slope
    let angle = atan2(slope, 1); // The '1' is the horizontal distance between letters (constant)

    // Display each letter at the calculated (x, y) position and rotate it
    push();
    fill(255);
    translate(x, y);
    rotate(angle); // Rotate the letter to be tangent to the curve
    text(str[i], 0, 0);
    pop();

    // Move to the next letter's position by the fixed spacing
    x += letterSpacing;
  }
}

function displayFramerate() {
  push();
  translate(-width/2, -height/2);
  fill(255);
  text(round(frameRate()), 40, 40);
  pop();
}
