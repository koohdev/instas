const fs = require('fs');
const path = require('path');

function createWavHeader(numSamples, sampleRate = 44100) {
  const buffer = Buffer.alloc(44);
  const dataSize = numSamples * 2; // 16-bit mono

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (mono)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

function generateSound(filename, durationMs, sampleGenerator) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const samples = new Int16Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;
    let sample = sampleGenerator(t, progress, i, numSamples);
    
    // Quick smooth attack (1.5ms) and release (4ms)
    const attack = Math.min(1, i / (sampleRate * 0.0015));
    const release = Math.min(1, (numSamples - i) / (sampleRate * 0.004));
    sample *= (attack * release);

    sample = Math.max(-1, Math.min(1, sample));
    samples[i] = Math.floor(sample * 32767);
  }

  const header = createWavHeader(numSamples, sampleRate);
  const dataBuffer = Buffer.from(samples.buffer);
  const fullBuffer = Buffer.concat([header, dataBuffer]);

  const outputDir = path.join(__dirname, '../public/sounds');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, filename), fullBuffer);
  console.log(`Generated ${filename} (${fullBuffer.length} bytes)`);
}

// Crisp, audible, warm mechanical button tap (30ms)
// Primary punchy pitch: 750Hz pitch drop to 300Hz with 400Hz warmth layer
generateSound('click.wav', 30, (t, progress) => {
  const freq1 = 750 * Math.exp(-progress * 3);
  const freq2 = 380 * Math.exp(-progress * 2);
  const env = Math.exp(-progress * 12);
  
  const tone1 = Math.sin(2 * Math.PI * freq1 * t);
  const tone2 = Math.sin(2 * Math.PI * freq2 * t) * 0.4;
  
  return (tone1 + tone2) * env * 0.70;
});

// Crisp toggle switch tap (25ms)
generateSound('toggle.wav', 25, (t, progress) => {
  const freq = 550 + 250 * progress;
  const env = Math.exp(-progress * 10);
  const tone = Math.sin(2 * Math.PI * freq * t);
  return tone * env * 0.65;
});

console.log('Audible click sound generated successfully!');
