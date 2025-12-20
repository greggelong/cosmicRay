let video;
let cellsz;
let threshold = 55;
let hitcount = 0;
let brightest = 0;
let gotVideoSize = false;
let outputBarHeight = 40;
let startTime;

let activeW, activeH;
let offsetX, offsetY;

// --- SYNTH CLICK ---
let osc;
let env;
let lastClickTime = 0;
let clickInterval = 120; // ms between clicks

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  textFont("monospace");
  textSize(16);
  stroke(255, 0, 0);

  video = createCapture(VIDEO);
  video.hide();

  // --- SOUND SETUP ---
  osc = new p5.Oscillator("square");
  osc.start();
  osc.amp(0);

  env = new p5.Envelope();
  env.setADSR(0.001, 0.03, 0, 0.02); // sharp click
  env.setRange(0.3, 0);

  startTime = millis();
}

function draw() {
  if (!video.loadedmetadata) return;

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
  text("Hits: " + hitcount, 10, outputBarHeight / 2);
  text("Rate: " + hitsPerMinute.toFixed(1) + " /min", 150, outputBarHeight / 2);
  text("Brightest: " + brightest.toFixed(1), 350, outputBarHeight / 2);

  // Active area border
  noFill();
  stroke(0, 0, 255);
  strokeWeight(2);
  rect(offsetX, offsetY, activeW, activeH);

  // Scan pixels
  for (let y = 0; y < video.height; y++) {
    for (let x = 0; x < video.width; x++) {
      let i = (x + y * video.width) * 4;
      let r = video.pixels[i];
      let g = video.pixels[i + 1];
      let b = video.pixels[i + 2];
      let brightnessValue = (r + g + b) / 3;

      if (brightnessValue > brightest) {
        brightest = brightnessValue;
      }

      if (brightnessValue > threshold) {
        // --- SYNTH CLICK (THROTTLED) ---
        let now = millis();
        if (now - lastClickTime > clickInterval) {
          // map brightness to pitch (optional but nice)
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

// --- REQUIRED USER GESTURE FOR AUDIO ---
function mousePressed() {
  userStartAudio();
}
