import { loadMuted, storeMuted } from './state';

/**
 * All sound is synthesised with the Web Audio API: no audio files.
 * iOS only lets audio start from a touch, so `unlock()` is called on every tap.
 */

type Tune = 'studio' | 'show' | 'none';

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

interface Song {
  bpm: number;
  melody: number[][];
  chords: number[][];
  bass: number[];
  drums: boolean;
}

const CHORDS = {
  C: [60, 64, 67],
  G: [59, 62, 67],
  Am: [57, 60, 64],
  F: [57, 60, 65],
};

const SONGS: Record<Exclude<Tune, 'none'>, Song> = {
  studio: {
    bpm: 104,
    melody: [
      [76, 0, 79, 0, 84, 0, 79, 0],
      [74, 0, 79, 0, 83, 0, 79, 81],
      [84, 0, 81, 0, 76, 0, 81, 0],
      [81, 79, 77, 0, 81, 0, 84, 0],
      [76, 79, 84, 0, 88, 0, 84, 0],
      [86, 0, 83, 0, 79, 0, 83, 86],
      [88, 0, 84, 0, 81, 0, 84, 0],
      [81, 0, 84, 0, 83, 0, 79, 0],
    ],
    chords: [CHORDS.C, CHORDS.G, CHORDS.Am, CHORDS.F, CHORDS.C, CHORDS.G, CHORDS.Am, CHORDS.F],
    bass: [48, 43, 45, 41, 48, 43, 45, 41],
    drums: false,
  },
  show: {
    bpm: 128,
    melody: [
      [84, 84, 0, 79, 0, 88, 0, 84],
      [83, 83, 0, 79, 0, 86, 0, 83],
      [81, 81, 0, 76, 0, 84, 0, 81],
      [81, 0, 84, 0, 89, 88, 86, 84],
      [84, 84, 0, 79, 0, 88, 0, 91],
      [86, 86, 0, 83, 0, 91, 0, 86],
      [88, 88, 0, 84, 0, 81, 0, 84],
      [84, 0, 86, 0, 88, 0, 91, 0],
    ],
    chords: [CHORDS.C, CHORDS.G, CHORDS.Am, CHORDS.F, CHORDS.C, CHORDS.G, CHORDS.Am, CHORDS.F],
    bass: [48, 43, 45, 41, 48, 43, 45, 41],
    drums: true,
  },
};

const PENTATONIC = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];

class GameAudio {
  private ctx?: AudioContext;
  private master?: GainNode;
  private musicBus?: GainNode;
  private sfxBus?: GainNode;
  private noise?: AudioBuffer;
  private applauseBuf?: AudioBuffer;
  private muted = loadMuted();
  private tune: Tune = 'none';
  private step = 0;
  private nextTime = 0;
  private timer?: number;
  private popIndex = 0;
  private lastPop = 0;

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    storeMuted(m);
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.02);
  }

  /** Must run inside a touch / click handler the first time. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor: typeof AudioContext | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      try {
        this.ctx = new Ctor();
      } catch {
        return;
      }
      const ctx = this.ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -10;
      limiter.ratio.value = 6;
      this.master.connect(limiter).connect(ctx.destination);
      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0.34;
      this.musicBus.connect(this.master);
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.7;
      this.sfxBus.connect(this.master);
      // one second of white noise, reused for drums, whooshes and applause
      this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      if (this.tune !== 'none') this.startScheduler();
    }
    if (this.ctx.state !== 'running') void this.ctx.resume().catch(() => undefined);
  }

  /** Pause when the app goes to the background, resume when it returns. */
  setActive(active: boolean): void {
    if (!this.ctx) return;
    if (active) void this.ctx.resume().catch(() => undefined);
    else void this.ctx.suspend().catch(() => undefined);
  }

  music(tune: Tune): void {
    if (tune === this.tune) return;
    this.tune = tune;
    this.step = 0;
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
    if (tune !== 'none' && this.ctx) this.startScheduler();
  }

  private startScheduler(): void {
    if (!this.ctx || this.timer) return;
    this.nextTime = this.ctx.currentTime + 0.12;
    this.timer = window.setInterval(() => this.schedule(), 90);
  }

  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx || this.tune === 'none') return;
    if (ctx.state !== 'running') {
      this.nextTime = ctx.currentTime + 0.12;
      return;
    }
    const song = SONGS[this.tune];
    const stepDur = 60 / song.bpm / 2;
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.3) {
      this.playStep(song, this.step, this.nextTime, stepDur);
      this.step = (this.step + 1) % (song.melody.length * 8);
      this.nextTime += stepDur;
    }
  }

  private playStep(song: Song, step: number, t: number, dur: number): void {
    const bar = Math.floor(step / 8);
    const s = step % 8;
    const bus = this.musicBus!;
    const note = song.melody[bar][s];
    if (note) {
      this.tone(midi(note), t, dur * 1.9, song.drums ? 'square' : 'sine', song.drums ? 0.1 : 0.3, bus, song.drums ? 2600 : 0);
      if (!song.drums) this.tone(midi(note + 12), t, dur * 1.2, 'sine', 0.08, bus);
    }
    const chord = song.chords[bar];
    if (song.drums) {
      if (s % 2 === 1) for (const n of chord) this.tone(midi(n + 12), t, dur * 0.8, 'triangle', 0.07, bus);
      this.tone(midi(song.bass[bar] + (s % 2 ? 12 : 0)), t, dur * 0.9, 'triangle', 0.3, bus);
      if (s % 2 === 0) this.kick(t, bus);
      if (s === 2 || s === 6) this.noiseHit(t, 0.11, 1800, 0.22, bus);
      if (s % 2 === 1) this.noiseHit(t, 0.03, 8000, 0.1, bus);
    } else {
      this.tone(midi(chord[[0, 1, 2, 1, 0, 1, 2, 1][s]]), t, dur * 1.6, 'triangle', 0.11, bus);
      if (s === 0 || s === 4) this.tone(midi(song.bass[bar]), t, dur * 3.4, 'sine', 0.3, bus);
    }
  }

  private tone(freq: number, t: number, dur: number, type: OscillatorType, vol: number, bus: AudioNode, lowpass = 0, glideTo = 0): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (lowpass) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = lowpass;
      osc.connect(f).connect(g);
    } else osc.connect(g);
    g.connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private kick(t: number, bus: AudioNode): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(g).connect(bus);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private noiseHit(t: number, dur: number, freq: number, vol: number, bus: AudioNode, type: BiquadFilterType = 'bandpass', sweepTo = 0): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise!;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(bus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  private applauseBuffer(): AudioBuffer {
    if (this.applauseBuf) return this.applauseBuf;
    const ctx = this.ctx!;
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * 3.2);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    const claps = 520;
    for (let c = 0; c < claps; c++) {
      const pos = Math.pow(Math.random(), 0.8) * 2.9;
      const start = Math.floor(pos * sr);
      const env = Math.min(1, pos / 0.25) * Math.max(0, 1 - Math.pow(pos / 3.1, 3));
      const amp = (0.25 + Math.random() * 0.5) * env;
      const n = Math.floor(sr * (0.008 + Math.random() * 0.012));
      for (let i = 0; i < n && start + i < len; i++) d[start + i] += (Math.random() * 2 - 1) * amp * Math.exp((-5 * i) / n);
    }
    this.applauseBuf = buf;
    return buf;
  }

  /** Musical tap that climbs a scale when taps come quickly. */
  pop(): void {
    if (!this.ready()) return;
    const now = performance.now();
    this.popIndex = now - this.lastPop < 900 ? (this.popIndex + 1) % PENTATONIC.length : 0;
    this.lastPop = now;
    const t = this.ctx!.currentTime;
    this.tone(midi(PENTATONIC[this.popIndex]), t, 0.28, 'sine', 0.4, this.sfxBus!);
    this.tone(midi(PENTATONIC[this.popIndex] + 12), t, 0.16, 'triangle', 0.12, this.sfxBus!);
  }

  private ready(): boolean {
    return !!this.ctx && !!this.sfxBus && this.ctx.state === 'running';
  }

  sfx(name: 'tap' | 'tab' | 'select' | 'remove' | 'sparkle' | 'whoosh' | 'fanfare' | 'applause' | 'shutter' | 'cheer' | 'drumroll' | 'magic' | 'pet'): void {
    if (!this.ready()) return;
    const ctx = this.ctx!;
    const bus = this.sfxBus!;
    const t = ctx.currentTime + 0.005;
    switch (name) {
      case 'tap':
        this.tone(620, t, 0.09, 'sine', 0.35, bus, 0, 980);
        break;
      case 'tab':
        this.tone(520, t, 0.07, 'triangle', 0.3, bus, 0, 700);
        break;
      case 'select':
        this.tone(midi(88), t, 0.16, 'sine', 0.36, bus);
        this.tone(midi(93), t + 0.08, 0.26, 'sine', 0.36, bus);
        this.tone(midi(100), t + 0.16, 0.3, 'sine', 0.2, bus);
        break;
      case 'remove':
        this.tone(700, t, 0.16, 'sine', 0.3, bus, 0, 330);
        break;
      case 'sparkle':
        [96, 100, 103, 108, 112].forEach((n, i) => this.tone(midi(n), t + i * 0.05, 0.22, 'sine', 0.2, bus));
        break;
      case 'magic':
        [72, 76, 79, 84, 88, 91, 96, 100].forEach((n, i) => this.tone(midi(n), t + i * 0.045, 0.3, 'triangle', 0.22, bus));
        this.noiseHit(t, 0.5, 1200, 0.12, bus, 'bandpass', 6000);
        break;
      case 'whoosh':
        this.noiseHit(t, 0.7, 300, 0.4, bus, 'bandpass', 2600);
        break;
      case 'fanfare':
        [
          [72, 0, 0.14],
          [72, 0.16, 0.14],
          [72, 0.32, 0.14],
          [76, 0.48, 0.2],
          [79, 0.7, 0.2],
          [84, 0.92, 0.7],
        ].forEach(([n, at, d]) => {
          this.tone(midi(n), t + at, d + 0.1, 'sawtooth', 0.2, bus, 2200);
          this.tone(midi(n - 12), t + at, d + 0.1, 'triangle', 0.22, bus);
        });
        break;
      case 'drumroll':
        for (let i = 0; i < 16; i++) this.noiseHit(t + i * 0.055, 0.05, 900, 0.1 + i * 0.016, bus);
        break;
      case 'applause': {
        const src = ctx.createBufferSource();
        src.buffer = this.applauseBuffer();
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = 1900;
        f.Q.value = 0.5;
        const g = ctx.createGain();
        g.gain.value = 0.75;
        src.connect(f).connect(g).connect(bus);
        src.start(t);
        break;
      }
      case 'cheer':
        [0, 0.22, 0.5].forEach((at, i) => {
          this.tone(700 + i * 120, t + at, 0.24, 'sine', 0.12, bus, 0, 1500 + i * 200);
          this.tone(1500 + i * 200, t + at + 0.24, 0.3, 'sine', 0.12, bus, 0, 1100);
        });
        break;
      case 'shutter':
        this.noiseHit(t, 0.03, 3500, 0.5, bus, 'highpass');
        this.noiseHit(t + 0.08, 0.05, 2500, 0.4, bus, 'highpass');
        this.tone(midi(96), t + 0.1, 0.3, 'sine', 0.18, bus);
        break;
      case 'pet':
        this.tone(900, t, 0.1, 'sine', 0.3, bus, 0, 1400);
        this.tone(1300, t + 0.12, 0.12, 'sine', 0.3, bus, 0, 1000);
        break;
    }
  }
}

export const audio = new GameAudio();
