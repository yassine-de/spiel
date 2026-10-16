import type { Settings } from '../../storage/settingsStore';

export type SoundName = 'click' | 'interact' | 'sparkle' | 'open' | 'close' | 'coin' | 'purchase' | 'oops' | 'add' | 'snip' | 'pour' | 'cheer' | 'correct';

interface Note {
  freq: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

/**
 * Kleine Soundeffekte, direkt im Browser erzeugt (Web Audio, keine Audiodateien
 * und damit keine Lizenzfragen). Musik und weitere Effekte folgen in Phase 8.
 * Der AudioContext startet erst nach der ersten Berührung, wie Browser es verlangen.
 */
export class AudioManager {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private volume = 0.7;
  private muted = false;

  applySettings(settings: Readonly<Settings>): void {
    this.volume = settings.sfxVolume;
    this.muted = settings.muted;
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(this.effectiveVolume, this.context.currentTime, 0.02);
    }
  }

  /** Muss aus einem Touch-/Klick-/Tastatur-Ereignis heraus aufgerufen werden. */
  unlock(): void {
    if (!this.context) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      try {
        this.context = new Ctor();
      } catch {
        return;
      }
      this.master = this.context.createGain();
      this.master.gain.value = this.effectiveVolume;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') void this.context.resume().catch(() => undefined);
  }

  play(name: SoundName): void {
    if (this.muted || this.volume <= 0 || !this.context || this.context.state !== 'running') return;
    switch (name) {
      case 'click':
        this.notes([{ freq: 880, start: 0, duration: 0.07, gain: 0.35 }]);
        break;
      case 'open':
        this.notes([
          { freq: 660, start: 0, duration: 0.08, gain: 0.3 },
          { freq: 990, start: 0.06, duration: 0.1, gain: 0.25 },
        ]);
        break;
      case 'close':
        this.notes([
          { freq: 880, start: 0, duration: 0.07, gain: 0.25 },
          { freq: 587, start: 0.05, duration: 0.09, gain: 0.25 },
        ]);
        break;
      case 'interact':
        this.notes([
          { freq: 784, start: 0, duration: 0.12, type: 'triangle', gain: 0.4 },
          { freq: 1175, start: 0.09, duration: 0.18, type: 'triangle', gain: 0.35 },
        ]);
        break;
      case 'coin':
        this.notes([
          { freq: 988, start: 0, duration: 0.08, type: 'square', gain: 0.12 },
          { freq: 1319, start: 0.07, duration: 0.25, type: 'square', gain: 0.12 },
        ]);
        break;
      case 'add':
        this.notes([{ freq: 1047, start: 0, duration: 0.09, type: 'triangle', gain: 0.35 }]);
        break;
      case 'purchase':
        this.notes(
          [784, 988, 1175, 1568].map((freq, i) => ({ freq, start: i * 0.08, duration: 0.2, type: 'triangle' as OscillatorType, gain: 0.3 })),
        );
        break;
      case 'oops':
        this.notes([
          { freq: 523, start: 0, duration: 0.14, type: 'triangle', gain: 0.3 },
          { freq: 440, start: 0.12, duration: 0.2, type: 'triangle', gain: 0.3 },
        ]);
        break;
      case 'snip':
        // Schere: zwei kurze, helle Klicks
        this.notes([
          { freq: 2400, start: 0, duration: 0.035, type: 'square', gain: 0.06 },
          { freq: 3100, start: 0.07, duration: 0.03, type: 'square', gain: 0.05 },
        ]);
        break;
      case 'pour':
        this.notes([0, 1, 2, 3, 4, 5].map((i) => ({ freq: 420 + i * 70, start: i * 0.06, duration: 0.09, type: 'sine' as OscillatorType, gain: 0.12 })));
        break;
      case 'correct':
        this.notes([
          { freq: 1047, start: 0, duration: 0.12, type: 'triangle', gain: 0.32 },
          { freq: 1568, start: 0.1, duration: 0.22, type: 'triangle', gain: 0.3 },
        ]);
        break;
      case 'cheer':
        this.notes(
          [523, 659, 784, 1047, 784, 1047].map((freq, i) => ({ freq, start: i * 0.1, duration: 0.22, type: 'triangle' as OscillatorType, gain: 0.28 })),
        );
        break;
      case 'sparkle':
        this.notes(
          [1319, 1568, 1976, 2637].map((freq, i) => ({
            freq,
            start: i * 0.07,
            duration: 0.22,
            type: 'sine' as OscillatorType,
            gain: 0.22,
          })),
        );
        break;
    }
  }

  /** Ein einzelner, warmer Ton (z. B. Xylophon). */
  tone(freq: number, duration = 0.6): void {
    if (this.muted || this.volume <= 0 || !this.context || this.context.state !== 'running') return;
    this.notes([
      { freq, start: 0, duration, type: 'sine', gain: 0.4 },
      { freq: freq * 4, start: 0, duration: duration * 0.25, type: 'sine', gain: 0.08 },
    ]);
  }

  private get effectiveVolume(): number {
    return this.muted ? 0 : this.volume;
  }

  private notes(notes: Note[]): void {
    const ctx = this.context;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type ?? 'sine';
      osc.frequency.value = note.freq;
      const t0 = now + note.start;
      const peak = note.gain ?? 0.3;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.duration);
      osc.connect(gain).connect(master);
      osc.start(t0);
      osc.stop(t0 + note.duration + 0.02);
    }
  }
}
