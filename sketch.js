let video;
let threshold = 15;
let hitcount = 0;
let lastHitCount = 0;
let hitRate = 0;
let outputBarHeight = 40;
let brightest = 0;

// Request portrait orientation from rear camera
let constraints = {
  audio: false,
  video: {
    facingMode: { exact: "environment" },
    width: { ideal: 480 },
    height: { ideal: 720 },
  },
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);

  video = createCapture(VIDEO, constraints, () => {
    console.log("Camera ready:", video.width, video.height);
  });

  video.hide();

  // Track hits per second
  setInterval(() => {
    hitRate = hitcount - lastHitCount;
    lastHitCount = hitcount;
  }, 1000);

  textFont("monospace");
}

function draw() {
  if (!video.loadedmetadata) return;
  video.loadPixels();

  // Clear and redraw the HUD bar
  fill(0);
  noStroke();
  rect(0, 0, width, outputBarHeight);

  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text("Hits: " + hitcount, 10, outputBarHeight / 2);
  text("Rate: " + hitRate + " /sec", 150, outputBarHeight / 2);
  text("Brightest: " + brightest.toFixed(1), 320, outputBarHeight / 2);

  // Calculate the grid cell size
  let cellW = width / video.width;
  let cellH = (height - outputBarHeight) / video.height;

  // Loop through pixels
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
        let sx = x * cellW;
        let sy = y * cellH + outputBarHeight;

        fill(255, 5); // semi-transparent hit dot
        noStroke();
        rect(sx, sy, cellW, cellH);

        hitcount++;
      }
    }
  }
}
