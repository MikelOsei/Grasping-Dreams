const numParticles = 20000;
let particles = [];

function createParticles() {
  for (let i = 0; i < numParticles; i++) {
    // initialize our particles with rand. position, and base pixel size
    particles[i] = {
      x: random(-width, width),
      y: random(-height, height),
      px: 0.5,
    };

    // color-coding each particle based on the pre-calculated band powers.
    // band powers: relative metrics telling us what parts of our brain are most active.
    //    calculated in eegHelpers.js
    let transparency = 0;
    // source: https://nhahealth.com/brainwaves-the-language/
    if (i < alpha) {
      // alpha: strong when relaxed, or auto-pilot, awake but not engaged - light blue, white
      particles[i].col = random() < 0.5 ? [173, 216, 230] : [210, 210, 255]
      transparency = random(30, 100)
    } else if (i < alpha + beta) {
      // beta: strong when active/alert, planning, anxious or focused on something - yellow-orange, orange
      particles[i].col = random() < 0.5 ? [255, 120, 80] : [255, 150, 60]
      transparency = random(150, 210);
    } else if (i < alpha + beta + theta) {
      // theta: strong for light sleep, daydreaming, meditation, creative thinking, focus - pink, purple
      particles[i].col = random() < 0.5 ? [205, 172, 183] : [200, 162, 200]
      transparency = random(100, 200);
    } else {
      // delta: strong for rest, deep sleep, drowsiness, unconscious rest - deep blue, purple
      particles[i].col = random() < 0.5 ? [100, 80, 190] : [100, 80, 190]
      transparency = random(170, 200);
    }

    particles[i].col.push(transparency);
  }
}

function updateParticles() {
  push();
  for (let i = 0; i < numParticles; i++) {
    let particle = particles[i];

    // calculating next value of particle based on perlin noise, offsetting by 10 to avoid emptiness
    let a = noise(particle.x / width + 10, particle.y / height + 10) * 4;
    // using the val to get the next direction of the pixel based on time
    let vx = 0.7 * cos(PI * a) + 0.4 * cos(frameCount / 500);
    let vy = sin(PI * a);

    // pushing away particles if hand is on screen
    predictions.forEach((hand) => {
      // multiplying by 4 to re-scale from compressed video size.
      let centerX = hand.keypoints[9].x * 4;
      let centerY = ((hand.keypoints[9].y + hand.keypoints[0].y) / 2) * 4;

      let dx = particle.x - centerX;
      let dy = particle.y - centerY;
      let distance = dist(particle.x, particle.y, centerX, centerY);

      // pixel distance around hand
      // taking the distance between tip of thumb [4] and pinky [20] to calculate the size of the "bubble"
      let space = max(abs(hand.keypoints[4].y - hand.keypoints[20].y) / 2 * 4, 150); 
      if (distance < space) {
        let force = (space - distance) / PI;
        vx += (dx / distance) * force * 2;
        vy += (dy / distance) * force * 2;
      }
    });

    // update particle position
    particle.x += vx;
    particle.y += vy;
    // particle grows as its on the screen for longer
    particle.px += 0.1;
    particle.px = min(particle.px, 5);

    if (
      random() < 0.02 ||
      particle.x < -width ||
      particle.x > width ||
      particle.y < -height ||
      particle.y > height
    ) {
      // reset the particle on the screen if OOBs
      // randomness for a twinkling effect
      particles[i] = {
        x: random(-width, width),
        y: random(-height, height),
        px: 0.5,
        col: particle.col,
      };
    }

    strokeWeight(2 * a);
    stroke(particle.col);
    point(particle.x, particle.y);
  }
  pop();
}