// Web Audio API Synthesizer for NEXUS Game Audio

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.bgOsc = null;
    this.bgGain = null;
    this.isPlayingMusic = false;
    this.isMuted = false;
    this.volume = 0.5;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.bgGain) {
      this.bgGain.gain.value = this.isMuted ? 0 : 0.15 * this.volume;
    }
    return this.isMuted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.bgGain && !this.isMuted) {
      this.bgGain.gain.value = 0.15 * this.volume;
    }
  }

  startAmbientMusic() {
    if (this.isPlayingMusic) return;
    this.init();
    this.isPlayingMusic = true;

    // Dark synthwave pulse chord progression: Am -> F -> C -> G
    const notes = [220, 174.61, 261.63, 196]; // A3, F3, C4, G3
    let noteIdx = 0;

    const playBassNote = () => {
      if (!this.isPlayingMusic || this.isMuted) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(notes[noteIdx] / 2, this.ctx.currentTime); // Sub-bass

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 1.8);

        gain.gain.setValueAtTime(0.08 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.9);

        osc.connect(filter);
        filter.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 2);

        noteIdx = (noteIdx + 1) % notes.length;
      } catch (e) {
        console.warn("Audio play error", e);
      }
    };

    playBassNote();
    this.musicInterval = setInterval(playBassNote, 2000);
  }

  stopAmbientMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) clearInterval(this.musicInterval);
  }

  // SFX: Interaction / Button Click
  playClick() {
    if (this.isMuted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // SFX: Proximity Beacon Pulse
  playBeaconPulse() {
    if (this.isMuted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, this.ctx.currentTime + 0.15); // C6

      gain.gain.setValueAtTime(0.12 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  // SFX: Mission Success
  playSuccess() {
    if (this.isMuted) return;
    this.init();
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);

        gain.gain.setValueAtTime(0.15 * this.volume, this.ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.1);
        osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
      });
    } catch (e) {}
  }

  // SFX: Sprint Boost
  playBoost() {
    if (this.isMuted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.1 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
