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

  // Master Emotion-Aware Meow Dispatcher
  playEmotionalMeow(emotion: string, gender: string = 'female') {
    const pitchMultiplier = gender === 'male' ? 0.88 : 1.18;
    switch (emotion) {
      case 'happy':
        this.playHappyMeow(pitchMultiplier);
        break;
      case 'curious':
        this.playCuriousMeow(pitchMultiplier);
        break;
      case 'affectionate':
        this.playAffectionateMeow(pitchMultiplier);
        break;
      case 'hungry':
      case 'eating':
        this.playHungryMeow(pitchMultiplier);
        break;
      case 'scared':
        this.playScaredMeow(pitchMultiplier);
        break;
      case 'angry':
        this.playAngryMeow(pitchMultiplier);
        break;
      case 'playing':
        this.playPlayingChirp(pitchMultiplier);
        break;
      case 'sleeping':
        this.playSleepyMeow(pitchMultiplier);
        break;
      default:
        this.playCasualMeow(pitchMultiplier);
        break;
    }
  }

  // 1. Happy Meow: Upbeat, chirpy rising-and-falling trill ("mrr-eww!")
  playHappyMeow(pitchMultiplier: number = 1.0) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Vibrato LFO for feline chirpy trill
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(22, now);
      lfoGain.gain.setValueAtTime(16 * pitchMultiplier, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.type = 'triangle';
      const baseFreq = 500 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.55, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, now + 0.36);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.42);
      osc.stop(now + 0.42);
    } catch {}
  }

  // 2. Curious Meow: Inquisitive upward questioning inflection ("meow?")
  playCuriousMeow(pitchMultiplier: number = 1.0) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 450 * pitchMultiplier;
      // Dips slightly at the start ("m"), then sweeps sharply upward ("-eow?")
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.92, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.68, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.19, now + 0.06);
      gain.gain.setValueAtTime(0.18, now + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.34);
    } catch {}
  }

  // 3. Affectionate Meow: Soft rolling purr-trill ("prrr-meep!")
  playAffectionateMeow(pitchMultiplier: number = 1.0) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;

      // Layer A: Low purr undertone
      const purrOsc = this.ctx.createOscillator();
      const purrMod = this.ctx.createOscillator();
      const purrModGain = this.ctx.createGain();
      const purrGain = this.ctx.createGain();

      purrOsc.type = 'sine';
      purrOsc.frequency.setValueAtTime(82, now);
      purrMod.frequency.setValueAtTime(26, now);
      purrModGain.gain.setValueAtTime(24, now);
      purrMod.connect(purrOsc.frequency);

      purrGain.gain.setValueAtTime(0.001, now);
      purrGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      purrGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      purrOsc.connect(purrGain);
      purrGain.connect(this.masterGain);

      // Layer B: Sweet melodic meow trill
      const meowOsc = this.ctx.createOscillator();
      const meowGain = this.ctx.createGain();
      meowOsc.type = 'triangle';
      const baseFreq = 410 * pitchMultiplier;
      meowOsc.frequency.setValueAtTime(baseFreq, now);
      meowOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.48, now + 0.15);
      meowOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, now + 0.45);

      meowGain.gain.setValueAtTime(0.001, now);
      meowGain.gain.linearRampToValueAtTime(0.16, now + 0.08);
      meowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      meowOsc.connect(meowGain);
      meowGain.connect(this.masterGain);

      purrMod.start(now);
      purrOsc.start(now);
      meowOsc.start(now);

      purrMod.stop(now + 0.6);
      purrOsc.stop(now + 0.6);
      meowOsc.stop(now + 0.52);
    } catch {}
  }

  // 4. Hungry Meow: Plaintive, demanding food meow ("nyaa-aa-ooww")
  playHungryMeow(pitchMultiplier: number = 1.0) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      // Formant filter for distinctive nasal "nya" feline cry
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1180, now);
      filter.Q.setValueAtTime(2.2, now);

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      const baseFreq = 430 * pitchMultiplier;
      // Climbing demand, holding, then mournful dip
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.58, now + 0.18);
      osc1.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + 0.38);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.88, now + 0.62);

      osc2.frequency.setValueAtTime(baseFreq * 1.01, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.18);
      osc2.frequency.linearRampToValueAtTime(baseFreq * 1.52, now + 0.38);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.89, now + 0.62);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
      gain.gain.setValueAtTime(0.17, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.68);
      osc2.stop(now + 0.68);
    } catch {}
  }

  // 5. Scared Meow: High-pitched startled yowl / squeak ("ee-eep!")
  playScaredMeow(pitchMultiplier: number = 1.0) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Rapid frightened tremor LFO
      const tremolo = this.ctx.createOscillator();
      const tremoloGain = this.ctx.createGain();
      tremolo.frequency.setValueAtTime(36, now);
      tremoloGain.gain.setValueAtTime(28 * pitchMultiplier, now);
      tremolo.connect(tremoloGain);
      tremoloGain.connect(osc.frequency);

      osc.type = 'triangle';
      const baseFreq = 840 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.52, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.masterGain);

      tremolo.start(now);
      osc.start(now);
      tremolo.stop(now + 0.26);
      osc.stop(now + 0.26);
    } catch {}
  }

  // 6. Angry Meow: Irritable growling snarl & sharp hiss ("grrr-oww!")
  playAngryMeow(pitchMultiplier: number = 1.0) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;

      // Raspy growl oscillator
      const growlOsc = this.ctx.createOscillator();
      const growlMod = this.ctx.createOscillator();
      const growlModGain = this.ctx.createGain();
      const growlGain = this.ctx.createGain();

      growlOsc.type = 'sawtooth';
      const baseFreq = 190 * pitchMultiplier;
      growlOsc.frequency.setValueAtTime(baseFreq, now);
      growlOsc.frequency.linearRampToValueAtTime(baseFreq * 1.8, now + 0.22);
      growlOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.48);

      growlMod.frequency.setValueAtTime(20, now);
      growlModGain.gain.setValueAtTime(45, now);
      growlMod.connect(growlOsc.frequency);

      growlGain.gain.setValueAtTime(0.001, now);
      growlGain.gain.linearRampToValueAtTime(0.2, now + 0.06);
      growlGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      growlOsc.connect(growlGain);
      growlGain.connect(this.masterGain);

      // Breath hiss noise burst
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.12;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1800, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      growlMod.start(now);
      growlOsc.start(now);
      noise.start(now);

      growlMod.stop(now + 0.52);
      growlOsc.stop(now + 0.52);
      noise.stop(now + 0.22);
    } catch {}
  }

  // 7. Playing Chirp: Energetic double chirrup ("mrr-rp! mrr-rp!")
  playPlayingChirp(pitchMultiplier: number = 1.0) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      // Two staccato chirps
      [0, 0.12].forEach((offset, idx) => {
        const time = now + offset;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        const startF = (520 + idx * 80) * pitchMultiplier;
        osc.frequency.setValueAtTime(startF, time);
        osc.frequency.exponentialRampToValueAtTime(startF * 1.55, time + 0.08);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.18, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(time);
        osc.stop(time + 0.1);
      });
    } catch {}
  }

  // 8. Sleepy Meow: Soft, drowsy low sigh ("mww-aah...")
  playSleepyMeow(pitchMultiplier: number = 1.0) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 440 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + 0.48);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {}
  }

  // 9. Casual / Default Meow: Natural balanced feline meow ("meow")
  playCasualMeow(pitchMultiplier: number = 1.0) {
    this.playMeow(pitchMultiplier);
  }

  // Standard classic meow
  playMeow(pitchMultiplier: number = 1.0) {
    if (!this.enabled || !this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 520 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq * 0.85, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.07);
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
