/**
 * Web Audio API synthesizer for MIMO sound effects and procedural ambient audio.
 * 100% client-side, zero external audio asset dependencies.
 */

class SoundSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public enabled: boolean = true;
  public masterVolume: number = 0.8;
  public sfxEnabled: boolean = true;
  public ambientEnabled: boolean = false;

  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public setSfxEnabled(val: boolean) {
    this.sfxEnabled = val;
    this.enabled = val;
  }

  public setAmbientEnabled(val: boolean) {
    this.ambientEnabled = val;
    if (val) {
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  // Soft procedural ambient room drone / gentle purr tone
  public startAmbient() {
    if (!this.ambientEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      if (this.ambientGain) return; // Already running

      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.04 * this.masterVolume, now + 2.0);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(58, now); // Warm room resonance

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(82, now); // Gentle purr overtone

      this.ambientOsc1.connect(this.ambientGain);
      this.ambientOsc2.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
    } catch {}
  }

  public stopAmbient() {
    if (this.ambientGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1.0);
      setTimeout(() => {
        try {
          this.ambientOsc1?.stop();
          this.ambientOsc2?.stop();
          this.ambientOsc1?.disconnect();
          this.ambientOsc2?.disconnect();
          this.ambientGain?.disconnect();
        } catch {}
        this.ambientOsc1 = null;
        this.ambientOsc2 = null;
        this.ambientGain = null;
      }, 1050);
    }
  }

  // Playful meow sound
  playMeow(pitchMultiplier: number = 1.0) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 540 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq * 0.8, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  // Deep purr rumble
  playPurr() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const sfxGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, now);

      mod.type = 'sine';
      mod.frequency.setValueAtTime(24, now);
      modGain.gain.setValueAtTime(25, now);

      mod.connect(osc.frequency);

      sfxGain.gain.setValueAtTime(0.001, now);
      sfxGain.gain.linearRampToValueAtTime(0.2, now + 0.2);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(sfxGain);
      sfxGain.connect(this.masterGain);

      mod.start(now);
      osc.start(now);
      mod.stop(now + 0.95);
      osc.stop(now + 0.95);
    } catch {}
  }

  // Eating crunch sounds
  playCrunch() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      for (let i = 0; i < 3; i++) {
        const time = this.ctx.currentTime + (i * 0.12);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180 + Math.random() * 80, time);
        osc.frequency.exponentialRampToValueAtTime(60, time + 0.08);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.1);
      }
    } catch {}
  }

  // Playful toy pounce pop
  playPounce() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Brushing / Grooming soft textured sound
  playBrush() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      for (let i = 0; i < 2; i++) {
        const time = now + (i * 0.15);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260 + i * 40, time);
        osc.frequency.linearRampToValueAtTime(180, time + 0.12);

        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.15);
      }
    } catch {}
  }

  // Soft tactile button tap
  playClick() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // Scold reaction (short startled warning tone)
  playScoldReaction() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch {}
  }

  // Sleep yawn chime
  playSleepChime() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      [330, 294, 262].forEach((freq, idx) => {
        const time = now + (idx * 0.2);
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(time);
        osc.stop(time + 0.45);
      });
    } catch {}
  }

  // Water fountain bubbling / flowing trickle
  playWaterStream() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      [580, 720, 640, 810].forEach((freq, idx) => {
        const time = now + (idx * 0.08);
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.25, time + 0.06);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.07, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(time);
        osc.stop(time + 0.14);
      });
    } catch {}
  }

  // Crisp cat grass chewing
  playGrassCrunch() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      [360, 420, 390].forEach((freq, idx) => {
        const time = now + (idx * 0.1);
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(time);
        osc.stop(time + 0.08);
      });
    } catch {}
  }

  // Scratching post rope friction
  playScratch() {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      [180, 240, 210, 260].forEach((freq, idx) => {
        const time = now + (idx * 0.06);
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.07, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(time);
        osc.stop(time + 0.06);
      });
    } catch {}
  }
}

export const sounds = new SoundSynth();
