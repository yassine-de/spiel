import { h } from './dom';

/** Nur mit `?debug` in der Adresse aktiv: FPS-Anzeige und Testzugriff für Browser-Tests. */
export const DEBUG_ENABLED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');

export class DebugOverlay {
  private readonly el: HTMLElement;
  private lastUpdate = 0;

  constructor(parent: HTMLElement) {
    this.el = h('div', { class: 'debug-overlay' });
    parent.append(this.el);
  }

  update(time: number, lines: Record<string, string | number>): void {
    if (time - this.lastUpdate < 250) return;
    this.lastUpdate = time;
    this.el.textContent = Object.entries(lines)
      .map(([k, v]) => `${k}: ${v}`)
      .join('  ·  ');
  }
}
