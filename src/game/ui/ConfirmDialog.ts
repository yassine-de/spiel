import { playClick } from '../services';
import { button, h } from './dom';
import { Modal } from './Modal';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

/** Sicherheitsabfrage vor unumkehrbaren Aktionen (z. B. Spielstand löschen). */
export class ConfirmDialog extends Modal {
  private readonly titleEl: HTMLElement;
  private readonly messageEl: HTMLElement;
  private readonly buttons: HTMLElement;
  private resolve: ((value: boolean) => void) | null = null;

  constructor(parent: HTMLElement) {
    super(parent, 'Sicher?', { closable: false, className: 'confirm-card' });
    this.titleEl = this.el.querySelector('.modal-title')!;
    this.messageEl = h('p', { class: 'confirm-message' });
    this.buttons = h('div', { class: 'menu-buttons' });
    this.body.append(this.messageEl, this.buttons);
    this.onClose = () => this.settle(false);
  }

  ask(options: ConfirmOptions): Promise<boolean> {
    this.settle(false);
    this.titleEl.textContent = options.title;
    this.messageEl.textContent = options.message;
    this.buttons.replaceChildren(
      // Die sichere Wahl steht oben und ist hervorgehoben.
      button({ label: options.cancelLabel, onPress: () => this.finish(false) }, playClick),
      button({ label: options.confirmLabel, variant: 'secondary', onPress: () => this.finish(true) }, playClick),
    );
    this.el.querySelector('.modal-card')?.setAttribute('aria-label', options.title);
    this.show();
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  private finish(value: boolean): void {
    const resolve = this.resolve;
    this.resolve = null;
    this.hide();
    resolve?.(value);
  }

  private settle(value: boolean): void {
    const resolve = this.resolve;
    this.resolve = null;
    resolve?.(value);
  }
}
