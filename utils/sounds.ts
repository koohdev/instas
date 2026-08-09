// Utility to generate soft, high-quality audio WAV Data URIs for use-sound hook

function createWavDataUri(
  freqStart: number,
  freqEnd: number,
  durationSec: number,
  volume: number = 0.15,
  type: 'click' | 'tick' | 'chime' = 'click'
): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new Int16Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;
    
    // Frequency sweep
    const freq = freqStart + (freqEnd - freqStart) * Math.pow(progress, 0.6);
    
    // Envelopes for ultra-soft feedback
    let env = 0;
    if (type === 'tick') {
      // Very brief soft wooden tap
      env = Math.sin(Math.PI * progress) * Math.exp(-progress * 14);
    } else if (type === 'chime') {
      // Soft gentle warm chime
      env = Math.sin(Math.PI * Math.min(1, progress * 1.5)) * Math.exp(-progress * 3);
    } else {
      // Soft bubble click
      env = Math.sin(Math.PI * Math.min(1, progress * 2.5)) * Math.exp(-progress * 6);
    }
    
    let sample = Math.sin(2 * Math.PI * freq * t);
    if (type === 'chime') {
      sample = 0.65 * sample + 0.35 * Math.sin(2 * Math.PI * freq * 1.5 * t);
    } else if (type === 'click') {
      sample = 0.85 * sample + 0.15 * Math.sin(2 * Math.PI * freq * 0.5 * t);
    }
    
    const val = sample * env * volume;
    buffer[i] = Math.max(-32768, Math.min(32767, Math.floor(val * 32767)));
  }

  // Standard WAV header
  const wavHeader = new Uint8Array(44);
  const dataLen = numSamples * 2;
  const fileLen = 36 + dataLen;

  wavHeader[0] = 0x52; wavHeader[1] = 0x49; wavHeader[2] = 0x46; wavHeader[3] = 0x46; // RIFF
  wavHeader[4] = fileLen & 0xff; wavHeader[5] = (fileLen >> 8) & 0xff;
  wavHeader[6] = (fileLen >> 16) & 0xff; wavHeader[7] = (fileLen >> 24) & 0xff;
  wavHeader[8] = 0x57; wavHeader[9] = 0x41; wavHeader[10] = 0x56; wavHeader[11] = 0x45; // WAVE
  wavHeader[12] = 0x66; wavHeader[13] = 0x6d; wavHeader[14] = 0x74; wavHeader[15] = 0x20; // fmt 
  wavHeader[16] = 16; wavHeader[17] = 0; wavHeader[18] = 0; wavHeader[19] = 0; // Subchunk1Size
  wavHeader[20] = 1; wavHeader[21] = 0; // AudioFormat (1 = PCM)
  wavHeader[22] = 1; wavHeader[23] = 0; // Mono
  wavHeader[24] = sampleRate & 0xff; wavHeader[25] = (sampleRate >> 8) & 0xff;
  wavHeader[26] = (sampleRate >> 16) & 0xff; wavHeader[27] = (sampleRate >> 24) & 0xff;
  const byteRate = sampleRate * 2;
  wavHeader[28] = byteRate & 0xff; wavHeader[29] = (byteRate >> 8) & 0xff;
  wavHeader[30] = (byteRate >> 16) & 0xff; wavHeader[31] = (byteRate >> 24) & 0xff;
  wavHeader[32] = 2; wavHeader[33] = 0; // BlockAlign
  wavHeader[34] = 16; wavHeader[35] = 0; // BitsPerSample
  wavHeader[36] = 0x64; wavHeader[37] = 0x61; wavHeader[38] = 0x74; wavHeader[39] = 0x61; // data
  wavHeader[40] = dataLen & 0xff; wavHeader[41] = (dataLen >> 8) & 0xff;
  wavHeader[42] = (dataLen >> 16) & 0xff; wavHeader[43] = (dataLen >> 24) & 0xff;

  const combined = new Uint8Array(44 + dataLen);
  combined.set(wavHeader, 0);
  combined.set(new Uint8Array(buffer.buffer), 44);

  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

// 1. Soft click audio data URI (warm, gentle pop/tap)
export const SOFT_CLICK_URI = createWavDataUri(380, 240, 0.04, 0.15, 'click');

// 2. Soft slide tick audio data URI (increased volume and punchy tick for sliding)
export const SOFT_SLIDE_URI = createWavDataUri(580, 340, 0.03, 0.38, 'tick');

// 3. Soft chime audio data URI (warm two-tone harmonic chime)
export const SOFT_CHIME_URI = createWavDataUri(440, 660, 0.18, 0.20, 'chime');
