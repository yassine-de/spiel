import { h } from './dom';

export class LoadingScreen {
  private readonly el: HTMLElement;
  private readonly bar: HTMLElement;

  constructor(parent: HTMLElement) {
    this.bar = h('div', { class: 'loading-bar-fill' });
    this.el = h(
      'div',
      { class: 'screen loading-screen' },
      h('div', { class: 'loading-title', text: "Samya's World" }),
      h('div', { class: 'loading-bar' }, this.bar),
      h('p', { class: 'loading-text', text: 'Deine Stadt wird vorbereitet …' }),
    );
    parent.append(this.el);
  }

  setProgress(value: number): void {
    this.bar.style.width = `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
  }

  hide(): void {
    this.el.classList.add('is-done');
    window.setTimeout(() => this.el.remove(), 400);
  }

  showError(message: string): void {
    this.el.querySelector('.loading-text')!.textContent = message;
  }
}
