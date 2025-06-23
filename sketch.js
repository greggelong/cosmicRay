let video;
let threshold = 25; // brightness threshold
let hitcount = 0;
let output;
let cnv;
let brightest = 0;
var constraints = {
  audio: false,
  video: {
    facingMode: {
      exact: "environment",
    },
  },
  //video: {
  //facingMode: "user"
  //}
};
function setup() {
  cnv = createCanvas(640, 480); //
  let cx = (windowWidth - cnv.width) / 2;
  let cy = (windowHeight - cnv.height) / 2;
  cnv.position(cx, cy);
  pixelDensity(1); // ensures consistency across screens
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // hide the HTML video element
  background(0);
  output = createP("output");
  strokeWeight(1);
  stroke(255);
}

function draw() {
  video.loadPixels();

  // We don’t clear background — we want to accumulate hits

  for (let y = 0; y < video.height; y++) {
    for (let x = 0; x < video.width; x++) {
      let i = (x + y * video.width) * 4; // index into pixels[] array

      let r = video.pixels[i];
      let g = video.pixels[i + 1];
      let b = video.pixels[i + 2];

      let brightnessValue = (r + g + b) / 3;
      if (brightnessValue > brightest) brightest = brightnessValue;

      if (brightnessValue > threshold) {
        let sz = map(brightnessValue, threshold - 1, 255, 2, 30);

        fill(255, 20);
        hitcount++;
        rect(x, y, sz, sz); // scale up drawing
      }
    }
  }
  output.html("hit count: " + hitcount + " " + brightest);
}
