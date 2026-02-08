let video;
let cellsz;
let threshold = 35;
let hitcount = 0;
let gotVideoSize = false;
let outputBarHeight = 60;

// --- LAYERS ---
let cols, rows;
let current = [];
let previous = [];
let dampening = 0.98; // Increased for longer lasting ripples
let rippleLayer;
let historyLayer; // The new permanent record layer

// --- UI & TEST ---
let testCheckbox;
let thresholdSlider;
let clearButton;

// --- SOUND ---
let osc, env;
let lastClickTime = 0;
let clickInterval = 50;

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

  // UI
  thresholdSlider = createSlider(0, 255, threshold, 1);
  thresholdSlider.position(10, 35);

  testCheckbox = createCheckbox("TEST MODE", false);
  testCheckbox.position(160, 32);
  testCheckbox.style("color", "#FFF");

  clearButton = createButton("Clear History");
  clearButton.position(350, 32);
  clearButton.mousePressed(() => historyLayer.background(0));
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

    // Init Ripples
    for (let i = 0; i < cols; i++) {
      current[i] = new Array(rows).fill(0);
      previous[i] = new Array(rows).fill(0);
    }

    rippleLayer = createGraphics(cols, rows);
    historyLayer = createGraphics(cols, rows);
    historyLayer.background(0);
    gotVideoSize = true;
  }

  background(0);
  threshold = thresholdSlider.value();

  // 1. INPUT PROCESSING
  if (testCheckbox.checked()) {
    if (random(1) < 0.1) {
      // ~6 hits per second
      triggerHit(floor(random(5, cols - 5)), floor(random(5, rows - 5)), 255);
    }
  } else {
    video.loadPixels();
    for (let y = 5; y < rows - 5; y += 2) {
      // Step for performance
      for (let x = 5; x < cols - 5; x += 2) {
        let i = (x + y * video.width) * 4;
        if (video.pixels[i] > threshold) {
          triggerHit(x, y, video.pixels[i]);
        }
      }
    }
  }

  // 2. PHYSICS & RENDERING
  updateRipples();

  let displayW = video.width * cellsz;
  let displayH = video.height * cellsz;
  let cx = width / 2 - displayW / 2;
  let cy = height / 2 - displayH / 2 + outputBarHeight / 2;

  // Draw History first
  image(historyLayer, cx, cy, displayW, displayH);

  // Draw Ripples on top with Blend Mode
  push();
  blendMode(ADD);
  image(rippleLayer, cx, cy, displayW, displayH);
  pop();

  // Apply the high-contrast Op-Art filter to the combined result
  filter(THRESHOLD, 0.2);

  drawHUD();
}

function triggerHit(x, y, val) {
  // --- BIGGER SPLASH ---
  // Disturb a 5x5 area instead of 1 pixel
  let splashRadius = 4;
  for (let i = -splashRadius; i <= splashRadius; i++) {
    for (let j = -splashRadius; j <= splashRadius; j++) {
      if (x + i > 0 && x + i < cols && y + j > 0 && y + j < rows) {
        previous[x + i][y + j] = 500; // High intensity splash
      }
    }
  }

  // --- RECORD TO HISTORY ---
  // We draw a small circle that stays forever on the history layer
  historyLayer.noStroke();
  historyLayer.fill(150); // Mid-grey so it interacts with ripples
  historyLayer.ellipse(x, y, 3, 3);

  // Sound
  let now = millis();
  if (now - lastClickTime > clickInterval) {
    osc.freq(random(400, 1000));
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
      current[i][j] *= dampening;

      let index = (i + j * cols) * 4;
      let p = current[i][j];
      rippleLayer.pixels[index] = p;
      rippleLayer.pixels[index + 1] = p;
      rippleLayer.pixels[index + 2] = p;
      rippleLayer.pixels[index + 3] = 255;
    }
  }
  rippleLayer.updatePixels();
  [previous, current] = [current, previous]; // Swap
}

function drawHUD() {
  fill(0);
  noStroke();
  rect(0, 0, width, outputBarHeight);
  fill(255);
  text(`COSMIC RECORDER | Hits: ${hitcount} `, 10, 20);
}

function mousePressed() {
  userStartAudio();
}
