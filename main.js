const NUM_PARTICIPANTS = 47;

let timerStart;

let model;
let predictions = [];

let p = {
  bgTransparency: 4,
  bgTransparencyMin: 0,
  bgTransparencyMax: 50,

  showCamera: false,
};


function preload() {
  // loading all the pre-processed EEG files.
  for (i = 0; i < NUM_PARTICIPANTS; i++)
    eegDataArray.push(loadJSON(`data/participant${i + 1}.json`));

  model = ml5.handPose({
      flipped: true,
      maxHands: 10,
      modelType: "full",
    }, () => console.log("hand model loaded"),
  );
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  frameRate(30);
  colorMode(RGB)

  settingsGui = createSettingsGui(p, { callback: paramChanged, load: false });
  settingsGui.setPosition(10, 10);

  video = createCapture(VIDEO, { flipped: true });
  // scaled down for efficiency/better runtime
  video.size(width / 4, height / 4); 
  video.hide();

  model.detectStart(video, (results) => {
    predictions = results;
  });

  startRandomEEG(); // eegHelpers.js
  timerStart = millis();
}

function draw() {
  if (!eegData || !eegData.data) return;
  
  push();
  background(5, 20, 70, p.bgTransparency);

  predictions.forEach((hand, i) => {
    const centerX = hand.keypoints[9].x * 4; // base of middle finger
    const centerY = ((hand.keypoints[9].y + hand.keypoints[0].y) / 2) * 4; // average on the y-axis between the base of ring finger [9] and base of palm [0]
    let gapSize = max(abs(hand.keypoints[4].y - hand.keypoints[20].y) / 2 * 4, 150);

    drawWaveform(centerX, centerY, gapSize); // waveform.js
  });
  pop();

  filter(BLUR, 0.15);
  updateParticles(); // particle.js
  updatePlayPosition(); // eegHelpers.js

  // auto-advance after ~45sec
  const currentTime = millis();
  if (currentTime - timerStart >= 45000) {
    startRandomEEG();
    timerStart = currentTime;
  }

  if (p.showCamera) image(video, width * (3/4), height*(3/4))
}

function keyPressed() {
  // force skip to next brain scan
  if (key == " " || key == "ArrowRight") startRandomEEG();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(width / 4, height / 4);
}

function paramChanged() {}