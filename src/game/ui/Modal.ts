import { audio, input } from '../services';
import { button, h } from './dom';
import { Icons } from './icons';

let modalCounter = 0;

/** Grundgerüst für Fenster (Einstellungen, Pause, später Inventar, Shop …). */
export class Modal {
  readonly el: HTMLElement;
  protected readonly body: HTMLElement;
  private readonly blockId = `modal-${++modalCounter}`;
  private visible = false;
  /** Wird nach dem Schließen aufgerufen (auch über das X). */
  onClose: (() => void) | null = null;

  constructor(parent: HTMLElement, title: string, options: { closable?: boolean; className?: string } = {}) {
    const closable = options.closable ?? true;
    this.body = h('div', { class: 'modal-body' });
    const header = h(
      'div',
      { class: 'modal-header' },
      h('h2', { class: 'modal-title', text: title }),
      closable
        ? button({ label: 'Schließen', icon: Icons.close, variant: 'icon', onPress: () => this.hide() })
        : null,
    );
    const card = h('div', { class: `modal-card ${options.className ?? ''}`, attrs: { role: 'dialog', 'aria-label': title } }, header, this.body);
    this.el = h('div', { class: 'modal-backdrop', attrs: { hidden: '' } }, card);
    // Tippen neben das Fenster schließt es nicht – Kinder tippen oft daneben.
    parent.append(this.el);
  }

  get isOpen(): boolean {
    return this.visible;
  }

  show(): void {
    if (this.visible) return;
    this.visible = true;
    input.block(this.blockId);
    this.el.hidden = false;
    // Reflow erzwingen, damit die Einblend-Animation startet – ohne von
    // requestAnimationFrame abzuhängen (das pausiert in Hintergrund-Tabs).
    void this.el.offsetWidth;
    this.el.classList.add('is-open');
    audio.play('open');
  }

  hide(): void {
    if (!this.visible) return;
    this.visible = false;
    input.unblock(this.blockId);
    this.el.classList.remove('is-open');
    this.el.hidden = true;
    audio.play('close');
    this.onClose?.();
  }
}
