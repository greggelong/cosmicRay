let video;
let cellsz;
let threshold = 55;
let hitcount = 0;
let brightest = 0;
let gotVideoSize = false;
let outputBarHeight = 40;
let startTime;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  video = createCapture(VIDEO);
  video.hide(); // Hide the default video element
  background(0);
  textFont("monospace");
  textSize(16);
  stroke(255, 0, 0);

  startTime = millis(); // Start time for hit rate calculation
}

function draw() {
  if (!video.loadedmetadata) return;

  // Calculate square cell size once
  if (!gotVideoSize) {
    cellsz = min(
      width / video.width,
      (height - outputBarHeight) / video.height
    );
    console.log("Video size:", video.width, video.height);
    console.log("Cell size:", cellsz);
    gotVideoSize = true;
  }

  video.loadPixels();

  // Calculate hits per minute
  let elapsedMinutes = (millis() - startTime) / 60000;
  let hitsPerMinute = hitcount / elapsedMinutes;

  // Draw HUD bar
  fill(0);
  rect(0, 0, width, outputBarHeight);
  fill(255);
  textAlign(LEFT, CENTER);
  text("Hits: " + hitcount, 10, outputBarHeight / 2);
  text("Rate: " + hitsPerMinute.toFixed(1) + " /min", 150, outputBarHeight / 2);
  text("Brightest: " + brightest.toFixed(1), 350, outputBarHeight / 2);

  // Loop through the pixels and accumulate hits
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
        let sx = x * cellsz;
        let sy = y * cellsz + outputBarHeight;
        let sz = map(brightnessValue, threshold - 1, 255, cellsz, 60);
        fill(255, 255, 0, sz); // Slight alpha to accumulate hits visually
        ellipse(sx, sy, cellsz + sz, cellsz + sz);
        hitcount++;
      }
    }
  }
}
