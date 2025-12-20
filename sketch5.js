let video;
let cellsz;
let threshold = 55;
let hitcount = 0;
let brightest = 0;
let gotVideoSize = false;
let outputBarHeight = 60;
let startTime;

let activeW, activeH;
let offsetX, offsetY;

// --- SYNTH CLICK ---
let osc;
let env;
let lastClickTime = 0;
let clickInterval = 120;

// --- UI ---
let thresholdSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  textFont("monospace");
  textSize(16);

  video = createCapture(VIDEO);
  video.hide();

  // --- SOUND ---
  osc = new p5.Oscillator("square");
  osc.start();
  osc.amp(0);

  env = new p5.Envelope();
  env.setADSR(0.001, 0.03, 0, 0.02);
  env.setRange(0.3, 0);

  // --- THRESHOLD SLIDER ---
  thresholdSlider = createSlider(0, 255, threshold, 1);
  thresholdSlider.position(10, 30);
  thresholdSlider.style("width", "200px");

  startTime = millis();
}

function draw() {
  if (!video.loadedmetadata) return;

  threshold = thresholdSlider.value();

  if (!gotVideoSize) {
    cellsz = min(
      width / video.width,
      (height - outputBarHeight) / video.height
    );
    activeW = video.width * cellsz;
    activeH = video.height * cellsz;
    offsetX = (width - activeW) / 2;
    offsetY = outputBarHeight + (height - outputBarHeight - activeH) / 2;
    gotVideoSize = true;
  }

  video.loadPixels();

  // HUD
  let elapsedMinutes = (millis() - startTime) / 60000;
  let hitsPerMinute = hitcount / max(elapsedMinutes, 0.0001);

  fill(0);
  noStroke();
  rect(0, 0, width, outputBarHeight);

  fill(255);
  textAlign(LEFT, CENTER);
  text("Hits: " + hitcount, 10, 15);
  text("Rate: " + hitsPerMinute.toFixed(1) + " /min", 150, 15);
  text("Brightest: " + brightest.toFixed(1), 350, 15);
  text("Threshold: " + threshold, 600, 15);

  // Active area
  noFill();
  stroke(0, 0, 255);
  strokeWeight(2);
  rect(offsetX, offsetY, activeW, activeH);

  // Scan
  for (let y = 0; y < video.height; y++) {
    for (let x = 0; x < video.width; x++) {
      let i = (x + y * video.width) * 4;
      let r = video.pixels[i];
      let g = video.pixels[i + 1];
      let b = video.pixels[i + 2];
      let brightnessValue = (r + g + b) / 3;

      brightest = max(brightest, brightnessValue);

      if (brightnessValue > threshold) {
        // --- CLICK ---
        let now = millis();
        if (now - lastClickTime > clickInterval) {
          let freq = map(brightnessValue, threshold, 255, 400, 1200);
          osc.freq(freq);
          env.play(osc);
          lastClickTime = now;
        }

        let sx = offsetX + x * cellsz;
        let sy = offsetY + y * cellsz;
        let sz = map(brightnessValue, threshold - 1, 255, cellsz, 60);

        fill(255, 255, 0, sz);
        stroke(255, 0, 0, 180);
        strokeWeight(1);
        ellipse(sx, sy, cellsz + sz, cellsz + sz);

        hitcount++;
      }
    }
  }
}

// Required for audio
function mousePressed() {
  userStartAudio();
}
