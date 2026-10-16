import { Modal } from './Modal';

/**
 * Fenster für Spiele und Aktionen in Salon, Café und Schule.
 * `ask` zeigt einen Inhalt und wartet auf ein Ergebnis; Schließen über das X ergibt null.
 */
export class ActivityPanel extends Modal {
  private readonly titleEl: HTMLElement;
  private readonly card: HTMLElement;
  private settle: ((value: null) => void) | null = null;

  constructor(parent: HTMLElement) {
    super(parent, '', { className: 'activity-card' });
    this.titleEl = this.el.querySelector('.modal-title')!;
    this.card = this.el.querySelector('.modal-card')!;
    this.onClose = () => {
      const settle = this.settle;
      this.settle = null;
      settle?.(null);
    };
  }

  /**
   * `build` erhält `done` (Ergebnis melden und schließen) und `onEnd`
   * (Aufräumen beim Schließen, z. B. laufende Timer stoppen).
   */
  ask<T>(
    title: string,
    build: (done: (value: T | null) => void, onEnd: (cleanup: () => void) => void) => HTMLElement,
    className = '',
  ): Promise<T | null> {
    // Ein noch offenes Spiel endet ohne Ergebnis
    this.settle?.(null);
    this.settle = null;
    return new Promise<T | null>((resolve) => {
      let finished = false;
      const cleanups: (() => void)[] = [];
      const done = (value: T | null) => {
        if (finished) return;
        finished = true;
        this.settle = null;
        for (const cleanup of cleanups) cleanup();
        resolve(value);
        this.hide();
      };
      this.titleEl.textContent = title;
      this.card.className = `modal-card activity-card ${className}`.trim();
      this.card.setAttribute('aria-label', title);
      this.body.replaceChildren(build(done, (cleanup) => cleanups.push(cleanup)));
      this.settle = (value) => done(value);
      this.show();
    });
  }

  /** Schließt ein offenes Spiel ohne Ergebnis (z. B. beim Verlassen des Raums). */
  cancel(): void {
    if (this.isOpen) this.hide();
  }
}
