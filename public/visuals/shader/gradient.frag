#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;  // Canvas width and height
uniform float colors[9];  // Flat array for 3 colors (3 * 3 = 9 values)
uniform bool invert;      // Whether to invert the gradient
uniform float alphaVal;   // Alpha value for transparency

void main() {
  vec2 st = gl_FragCoord.xy / resolution;  // Normalized pixel coordinates (0 to 1)
  float posY = st.y;

  // Apply inversion if needed
  if (invert) {
    posY = 1.0 - posY;
  }

  // Extract colors from the uniform array
  vec3 color1 = vec3(colors[0], colors[1], colors[2]);
  vec3 color2 = vec3(colors[3], colors[4], colors[5]);
  vec3 color3 = vec3(colors[6], colors[7], colors[8]);

  // Blend between the two gradient colors based on posY
  vec3 color;
  if (posY < 0.5) {
    float t = posY / 0.5;
    color = mix(color1, color2, t);  // Blend first two colors
  } else {
    float t = (posY - 0.5) / 0.5;
    color = mix(color2, color3, t);  // Blend second and third colors
  }

  // Set the final color with alpha
//   gl_FragColor = vec4(color, alphaVal);
gl_FragColor = vec4(color, 1.0);  // First color
  // gl_FragColor = vec4(colors[1], 1.0);  // Second color
  // gl_FragColor = vec4(colors[2], 1.0);  // Third color
}
