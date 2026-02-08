let video;
let cellsz;
let threshold = 35;
let hitcount = 0;
let gotVideoSize = false;
let outputBarHeight = 60;

// --- RIPPLE BUFFERS ---
let cols, rows;
let current = [];
let previous = [];
let dampening = 0.95;
let rippleLayer;

// --- TEST MODE & UI ---
let testCheckbox;
let thresholdSlider;

// --- SOUND ---
let osc, env;
let lastClickTime = 0;
let clickInterval = 50; // Faster interval for particle bursts

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  video = createCapture(VIDEO);
  video.hide();

  // Sound Setup
  osc = new p5.Oscillator("square");
  osc.start();
  osc.amp(0);
  env = new p5.Envelope();
  env.setADSR(0.001, 0.03, 0, 0.02);
  env.setRange(0.3, 0);

  // UI Elements
  thresholdSlider = createSlider(0, 255, threshold, 1);
  thresholdSlider.position(10, 35);

  testCheckbox = createCheckbox(" Simulate Particle Hits (Test Mode)", false);
  testCheckbox.position(220, 32);
  testCheckbox.style("color", "#FFFFFF");
}

function draw() {
  if (!video.loadedmetadata) return;

  if (!gotVideoSize) {
    cellsz = min(
      width / video.width,
      (height - outputBarHeight) / video.height,
    );
    cols = video.width;
    rows = video.height;
    for (let i = 0; i < cols; i++) {
      current[i] = new Array(rows).fill(0);
      previous[i] = new Array(rows).fill(0);
    }
    rippleLayer = createGraphics(cols, rows);
    gotVideoSize = true;
  }

  background(0);
  threshold = thresholdSlider.value();

  // 1. INPUT PROCESSING
  if (testCheckbox.checked()) {
    // SIMULATION MODE: ~10 hits per second
    // frameRate is usually 60, so 1/6 chance per frame provides ~10 hits/sec
    if (random(1) < 0.16) {
      let rx = floor(random(1, cols - 1));
      let ry = floor(random(1, rows - 1));
      triggerHit(rx, ry, 255);
    }
  } else {
    // REAL WORLD MODE: Video Analysis
    video.loadPixels();
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        let i = (x + y * video.width) * 4;
        let bV =
          (video.pixels[i] + video.pixels[i + 1] + video.pixels[i + 2]) / 3;
        if (bV > threshold) {
          triggerHit(x, y, bV);
        }
      }
    }
  }

  // 2. WATER PHYSICS CALCULATION
  updateRipples();

  // 3. RENDER & POST-PROCESSING
  let displayW = video.width * cellsz;
  let displayH = video.height * cellsz;

  push();
  translate(
    width / 2 - displayW / 2,
    height / 2 - displayH / 2 + outputBarHeight / 2,
  );
  image(rippleLayer, 0, 0, displayW, displayH);

  // High Contrast "Op-Art" Filter
  filter(THRESHOLD, 0.15);
  pop();

  drawHUD();
}

function triggerHit(x, y, val) {
  previous[x][y] = 255;

  let now = millis();
  if (now - lastClickTime > clickInterval) {
    osc.freq(map(val, 0, 255, 200, 1200));
    env.play(osc);
    lastClickTime = now;
    hitcount++;
  }
}

function updateRipples() {
  rippleLayer.loadPixels();
  for (let i = 1; i < cols - 1; i++) {
    for (let j = 1; j < rows - 1; j++) {
      current[i][j] =
        (previous[i - 1][j] +
          previous[i + 1][j] +
          previous[i][j - 1] +
          previous[i][j + 1]) /
          2 -
        current[i][j];

      current[i][j] = current[i][j] * dampening;

      let index = (i + j * cols) * 4;
      let val = current[i][j];
      rippleLayer.pixels[index] = val;
      rippleLayer.pixels[index + 1] = val;
      rippleLayer.pixels[index + 2] = val;
      rippleLayer.pixels[index + 3] = 255;
    }
  }
  rippleLayer.updatePixels();

  let temp = previous;
  previous = current;
  current = temp;
}

function drawHUD() {
  fill(0);
  noStroke();
  rect(0, 0, width, outputBarHeight);
  fill(255);
  textSize(14);
  text(
    `PARTICLE DETECTOR | Hits: ${hitcount} | Mode: ${testCheckbox.checked() ? "TESTING" : "LIVE"}`,
    10,
    20,
  );
}

function mousePressed() {
  userStartAudio();
}
