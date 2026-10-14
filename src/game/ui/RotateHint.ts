import { PLAYER_NAME } from '../config/constants';
import { input } from '../services';
import { h } from './dom';
import { Icons } from './icons';

/**
 * Freundlicher Hinweis, wenn ein Touch-Gerät hochkant gehalten wird.
 * Die Ausrichtung wird nicht erzwungen; solange der Hinweis sichtbar ist,
 * ist die Steuerung pausiert.
 */
export class RotateHint {
  private readonly el: HTMLElement;
  private readonly query = window.matchMedia('(orientation: portrait) and (pointer: coarse)');

  constructor(parent: HTMLElement) {
    this.el = h(
      'div',
      { class: 'rotate-hint', attrs: { hidden: '', role: 'alert' } },
      h(
        'div',
        { class: 'rotate-card' },
        h('div', { class: 'rotate-phone', html: Icons.phone, attrs: { 'aria-hidden': 'true' } }),
        h('p', { class: 'rotate-text', text: `Dreh dein Handy, ${PLAYER_NAME}! So kannst du deine Stadt noch besser entdecken! 💖` }),
      ),
    );
    parent.append(this.el);
    this.query.addEventListener('change', () => this.update());
    this.update();
  }

  private update(): void {
    const portrait = this.query.matches;
    this.el.hidden = !portrait;
    if (portrait) input.block('rotate');
    else input.unblock('rotate');
  }
}
