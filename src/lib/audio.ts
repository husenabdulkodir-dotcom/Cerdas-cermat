// Web Audio API Synthesizer Sound Effects (100% Offline & Reliable)
function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    return new AudioContextClass();
  } catch {
    return null;
  }
}

export function playBuzzerSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Multi-tone attention bell
    const freqs = [587.33, 880, 1174.66]; // D5, A5, D6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      
      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.4, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.85);
    });
  } catch (e) {
    console.error(e);
  }
}

export function playTickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {
    console.error(e);
  }
}

export function playTimesUpSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Game show wrong/timeout buzzer
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.6);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);
  } catch (e) {
    console.error(e);
  }
}

export function playRevealSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Major chord chime fanfare (C5 - E5 - G5 - C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  } catch (e) {
    console.error(e);
  }
}

export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Ascending victory chord: G4, C5, E5, G5, C6
    const freqs = [392.00, 523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.4, now + idx * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.95);
    });
  } catch (e) {
    console.error(e);
  }
}

export function playWrongSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Distinctive two-tone buzzer: "Tet-Tot"
    const tones = [
      { freq: 160, start: 0, dur: 0.22 },
      { freq: 125, start: 0.28, dur: 0.45 }
    ];

    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(t.freq, now + t.start);

      gain.gain.setValueAtTime(0, now + t.start);
      gain.gain.linearRampToValueAtTime(0.4, now + t.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur + 0.05);
    });
  } catch (e) {
    console.error(e);
  }
}

export function playEnvelopeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Swoosh and shimmer chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  } catch (e) {
    console.error(e);
  }
}

export function playClueSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    console.error(e);
  }
}

export function playFanfareLongSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Grand celebratory fanfare: C4, G4, C5, E5, G5, C6 triumph
    const sequence = [
      { f: 523.25, d: 0.15, s: 0 },
      { f: 523.25, d: 0.15, s: 0.16 },
      { f: 523.25, d: 0.15, s: 0.32 },
      { f: 659.25, d: 0.35, s: 0.48 },
      { f: 523.25, d: 0.15, s: 0.85 },
      { f: 659.25, d: 0.15, s: 1.02 },
      { f: 783.99, d: 0.60, s: 1.20 },
      { f: 1046.50, d: 1.20, s: 1.82 },
    ];

    sequence.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.s);

      gain.gain.setValueAtTime(0, now + note.s);
      gain.gain.linearRampToValueAtTime(0.4, now + note.s + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.s + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.s);
      osc.stop(now + note.s + note.d + 0.05);
    });
  } catch (e) {
    console.error(e);
  }
}

export function playApplauseSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Generate crowd applause using multiple randomized burst noise impulses
    const bufferSize = ctx.sampleRate * 2.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Pinkish noise with rhythmic clapping modulation
      const white = Math.random() * 2 - 1;
      const env = Math.sin((i / bufferSize) * Math.PI);
      const clapPulse = Math.sin(i / 1500) > 0.6 ? 1.8 : 0.6;
      data[i] = white * env * clapPulse * 0.35;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(1.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.6, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 2.55);
  } catch (e) {
    console.error(e);
  }
}

export function playDrumrollSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Fast snare roll accelerating into a cymbal hit
    const rollDuration = 2.0;
    const bufferSize = ctx.sampleRate * rollDuration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const rate = 30 + progress * 70; // accelerating hits
      const hit = Math.sin((i / ctx.sampleRate) * rate * Math.PI * 2) > 0.4 ? 1 : 0;
      data[i] = (Math.random() * 2 - 1) * hit * Math.pow(progress, 1.5) * 0.4;
    }

    const roll = ctx.createBufferSource();
    roll.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.7, now + rollDuration);

    roll.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    roll.start(now);
    roll.stop(now + rollDuration);

    // Final crash hit at the end of drumroll
    setTimeout(() => {
      try {
        const crashNow = ctx.currentTime;
        const crashOsc = ctx.createOscillator();
        const crashGain = ctx.createGain();
        crashOsc.type = 'triangle';
        crashOsc.frequency.setValueAtTime(400, crashNow);
        crashOsc.frequency.exponentialRampToValueAtTime(80, crashNow + 0.6);
        crashGain.gain.setValueAtTime(0.6, crashNow);
        crashGain.gain.exponentialRampToValueAtTime(0.001, crashNow + 0.8);
        crashOsc.connect(crashGain);
        crashGain.connect(ctx.destination);
        crashOsc.start(crashNow);
        crashOsc.stop(crashNow + 0.85);
      } catch {}
    }, rollDuration * 1000);
  } catch (e) {
    console.error(e);
  }
}

let activeChantStop: (() => void) | null = null;

export function playChantSample(onEnd?: () => void) {
  if (activeChantStop) {
    activeChantStop();
    activeChantStop = null;
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Melodic chant / recitation tune for audio questions
    // Bayati / Hijaz inspired scale melody
    const notes = [
      { f: 293.66, d: 0.6, s: 0 },      // D4
      { f: 311.13, d: 0.5, s: 0.65 },   // Eb4
      { f: 369.99, d: 0.7, s: 1.20 },   // F#4
      { f: 392.00, d: 0.8, s: 1.95 },   // G4
      { f: 369.99, d: 0.5, s: 2.80 },   // F#4
      { f: 311.13, d: 0.6, s: 3.35 },   // Eb4
      { f: 293.66, d: 1.2, s: 4.00 },   // D4 (sustained)
    ];

    const nodes: { osc: OscillatorNode; gain: GainNode }[] = [];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.s);

      gain.gain.setValueAtTime(0, now + note.s);
      gain.gain.linearRampToValueAtTime(0.3, now + note.s + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.s + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.s);
      osc.stop(now + note.s + note.d);
      nodes.push({ osc, gain });
    });

    const timerId = setTimeout(() => {
      activeChantStop = null;
      if (onEnd) onEnd();
    }, 5300);

    activeChantStop = () => {
      clearTimeout(timerId);
      nodes.forEach(n => {
        try {
          n.gain.gain.setValueAtTime(0, ctx.currentTime);
          n.osc.stop();
        } catch {}
      });
    };
  } catch (e) {
    console.error(e);
  }
}

export function stopChantSample() {
  if (activeChantStop) {
    activeChantStop();
    activeChantStop = null;
  }
}

