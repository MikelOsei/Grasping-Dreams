let eegDataArray = [];
let usedEEGs = [];

let eegData; // current participant data file
let numChannels; // number of electrodes (channels) available in this EEG
let numSamples; // number of data points per channel

let playPos = 0;
const samplesPerFrame = 15; 

function startRandomEEG() {
  // choosing an EEG at random, then removing it from options so it's not revisited until the whole cycle is done
  let index = floor(random(eegDataArray.length));
  usedEEGs.push(eegDataArray[index]);
  eegDataArray.splice(index, 1);

  eegData = usedEEGs.at(-1);
  numChannels = eegData.n_channels;
  numSamples = eegData.data[0].length;
 
  distributeBandPowers(); 
  createParticles(); // scene.js
  playPos = 0;

  // swapping the empty and used arrays to restart the experience infinitely
  if (eegDataArray.length == 0)
    [eegDataArray, usedEEGs] = [usedEEGs, eegDataArray];
}

let alpha;
let beta;
let delta;
let theta;

function distributeBandPowers(ch = 0) {
  // band powers are average values over a specific brain region that 
  //     essentially tells us the activity levels in that part of the brain.
  // for this display, I'm examining the pre-frontal cortex (fp1 or fp2 in EEG electrodes),
  //     which is responsible for: planning ahead, decision-making and emotional regulation among many more functions.
  alpha = eegData.band_powers.alpha[ch];
  beta = eegData.band_powers.beta[ch];
  delta = eegData.band_powers.delta[ch];
  theta = eegData.band_powers.theta[ch];

  // calculating how many particles should be assigned to a band power.
  let total = alpha + beta + delta + theta;

  alpha *= numParticles / total;
  beta *= numParticles / total;
  theta *= numParticles / total;
  delta *= numParticles / total;
}

function updatePlayPosition() {
    // var for keeping track of where we are in the EEG data
    playPos = (playPos + samplesPerFrame) % numSamples; 
}
