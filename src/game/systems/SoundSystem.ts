type SoundCue =
  | 'ticket'
  | 'coffee'
  | 'powerup'
  | 'stress'
  | 'alert'
  | 'win'
  | 'lose'
  | 'safe-break'
  | 'kitchen'
  | 'meeting'
  | 'director';

type SoundPattern = {
  frequencies: number[];
  duration: number;
  gap: number;
  gain: number;
  wave: OscillatorType;
};

const PATTERNS: Record<SoundCue, SoundPattern> = {
  ticket: { frequencies: [740, 1040], duration: 0.13, gap: 0.1, gain: 0.09, wave: 'square' },
  coffee: { frequencies: [440, 660, 990], duration: 0.12, gap: 0.09, gain: 0.07, wave: 'square' },
  powerup: { frequencies: [392, 784, 1175], duration: 0.16, gap: 0.12, gain: 0.075, wave: 'triangle' },
  stress: { frequencies: [160], duration: 0.18, gap: 0, gain: 0.065, wave: 'sawtooth' },
  alert: { frequencies: [260, 190, 260], duration: 0.18, gap: 0.16, gain: 0.075, wave: 'sawtooth' },
  win: { frequencies: [523, 659, 784, 1047], duration: 0.2, gap: 0.16, gain: 0.08, wave: 'square' },
  lose: { frequencies: [330, 247, 165], duration: 0.24, gap: 0.2, gain: 0.08, wave: 'sawtooth' },
  'safe-break': { frequencies: [523, 659, 784], duration: 0.2, gap: 0.18, gain: 0.05, wave: 'sine' },
  kitchen: { frequencies: [330, 440, 660, 880], duration: 0.11, gap: 0.08, gain: 0.065, wave: 'square' },
  meeting: { frequencies: [220, 220], duration: 0.32, gap: 0.42, gain: 0.075, wave: 'sawtooth' },
  director: { frequencies: [196, 392, 784], duration: 0.22, gap: 0.16, gain: 0.07, wave: 'triangle' },
};

export class SoundSystem {
  private context: AudioContext | null = null;
  private enabled = true;

  get isEnabled(): boolean {
    return this.enabled;
  }

  toggle(): void {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.unlock();
    }
  }

  unlock(): void {
    this.context ??= new AudioContext();
    void this.context.resume();
  }

  dispose(): void {
    if (this.context) {
      void this.context.close();
      this.context = null;
    }
  }

  play(cue: SoundCue): void {
    if (!this.enabled) {
      return;
    }

    this.unlock();
    const context = this.context;
    if (!context) {
      return;
    }
    const startAt = context.currentTime;

    const pattern = PATTERNS[cue];
    pattern.frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const noteStart = startAt + index * pattern.gap;
      const noteEnd = noteStart + pattern.duration;

      oscillator.type = pattern.wave;
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(pattern.gain, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd);
    });
  }
}
