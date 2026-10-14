import { h } from './dom';

interface Pending {
  message: string;
  durationMs: number;
}

/**
 * Sanft ein- und ausgeblendete Hinweise oben in der Mitte.
 * Blockiert nie die Steuerung (pointer-events: none).
 *
 * - `show(…)` zeigt sofort (Rückmeldung auf eine Aktion).
 * - `queue(…)` wartet, bis der aktuelle Hinweis gelesen wurde (z. B. Aufgaben, Entdeckungen).
 */
export class Toast {
  private readonly el: HTMLElement;
  private readonly text: HTMLElement;
  private readonly pending: Pending[] = [];
  private hideTimer: number | undefined;
  private nextTimer: number | undefined;
  private visible = false;

  constructor(parent: HTMLElement) {
    this.text = h('span', { class: 'toast-text' });
    this.el = h('div', { class: 'toast', attrs: { role: 'status', 'aria-live': 'polite' } }, this.text);
    parent.append(this.el);
  }

  get isVisible(): boolean {
    return this.visible;
  }

  show(message: string, durationMs = 4000): void {
    window.clearTimeout(this.hideTimer);
    window.clearTimeout(this.nextTimer);
    this.text.textContent = message;
    this.el.classList.remove('is-visible');
    // Neustart der Einblend-Animation
    void this.el.offsetWidth;
    this.el.classList.add('is-visible');
    this.visible = true;
    this.hideTimer = window.setTimeout(() => this.finish(), durationMs);
  }

  queue(message: string, durationMs = 4000): void {
    if (!this.visible && this.pending.length === 0) {
      this.show(message, durationMs);
      return;
    }
    if (this.pending.length < 5) this.pending.push({ message, durationMs });
  }

  /** Blendet aus und verwirft wartende Hinweise (z. B. beim Szenenwechsel). */
  hide(): void {
    this.pending.length = 0;
    window.clearTimeout(this.hideTimer);
    window.clearTimeout(this.nextTimer);
    this.el.classList.remove('is-visible');
    this.visible = false;
  }

  private finish(): void {
    this.el.classList.remove('is-visible');
    this.visible = false;
    const next = this.pending.shift();
    // Kurze Pause, damit der Wechsel sichtbar ist
    if (next) this.nextTimer = window.setTimeout(() => this.show(next.message, next.durationMs), 450);
  }
}
