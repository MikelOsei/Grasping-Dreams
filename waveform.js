const waveColors = {
  Fp1: [100, 220, 255],
  Fp2: [120, 200, 255],
  F3: [150, 180, 255],
  F4: [180, 150, 255],
  C3: [220, 130, 255],
  C4: [255, 120, 220],
  P3: [255, 140, 160],
  P4: [255, 180, 120],
  O1: [255, 200, 200],
  O2: [255, 200, 200],
};

function drawWaveform(x, y, gapRad = 150) {
  if (!eegData?.data) return;
  push();
  fill(5, 10, 60, 70);
  noStroke();
  circle(x, y, gapRad * 2);
  pop();

  const numChannels = eegData.n_channels;
  const ringPoints = 220; // number of eeg datapoints on the ring

  push();
  translate(x, y);

  noFill();
  strokeWeight(1.5);

  for (let ch = 0; ch < numChannels; ch++) {
    let chName = eegData.ch_names[ch];
    let col = waveColors[chName] || [255];
    stroke(col);

    // custom shape for each wave ring
    beginShape();
    for (let i = 0; i < ringPoints; i++) {
      let pt = eegData.data[ch][playPos + i];

      // fit the point onto the waveform
      let angle = map(i, 0, ringPoints, 0, 2*PI);
      // based on the alpha band, waves either appear denser or more sparse
      //    calmer people will have smoother lines + waveforms, while alert waveforms look more "frantic"
      let spacing = map(alpha, 0, numParticles, 15, 60, true);
      let baseRad = 30 + ch * spacing;

      // add extra jump/jitteriness to anxious/alert participants
      let jitter = map(beta, 0, numParticles, 20, 80, true);
      
      let realR = baseRad + pt * jitter;
      let maxR = 20 + (numChannels * spacing) + jitter;

      // scaling to fit waves into the gap made by the particles
      let r = (realR / maxR) * gapRad; 
      let px = cos(angle) * r;
      let py = sin(angle) * r;
      vertex(px, py);
    }
    endShape(CLOSE);
  }

  // pulse var for wave's focal point
  const pulse = eegData.data[0][playPos];
  const focalPt = map(theta, 0, numParticles, 5, 20);
  fill(255, 150);
  noStroke();
  circle(0, 0, focalPt + pulse * 10);

  pop();
}