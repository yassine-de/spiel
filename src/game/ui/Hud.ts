import { drawAvatarThumbnail } from '../assets/placeholders/avatar/avatarPainter';
import type { AvatarConfig } from '../avatar/avatarTypes';
import { input, playClick } from '../services';
import { button, formatCoins, h } from './dom';
import { COIN_SVG, Icons } from './icons';
import { VirtualJoystick } from './VirtualJoystick';

export interface HudHandlers {
  onPause: () => void;
  onSettings: () => void;
  onAvatar: () => void;
  onInventory: () => void;
  onTasks: () => void;
  onWardrobe: () => void;
  onHome: () => void;
}

/** Spieloberfläche: Avatar & Name, Münzen, Menü-Buttons, Joystick, Interaktionsbutton. */
export class Hud {
  readonly el: HTMLElement;
  readonly joystick: VirtualJoystick;
  private readonly coinValue: HTMLElement;
  private readonly interact: HTMLElement;
  private readonly interactLabel: HTMLElement;
  private readonly portrait: HTMLCanvasElement;
  private readonly name: HTMLElement;
  private readonly homeButton: HTMLButtonElement;

  constructor(parent: HTMLElement, handlers: HudHandlers) {
    this.joystick = new VirtualJoystick(input);
    this.coinValue = h('span', { class: 'coin-value' });
    this.interactLabel = h('span', { class: 'interact-label' });

    const interactButton = h('button', {
      class: 'interact-btn',
      html: Icons.hand,
      attrs: { type: 'button', 'aria-label': 'Aktion ausführen' },
    });
    interactButton.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      input.requestInteract();
    });
    // Tastatur-Aktivierung (Enter auf dem fokussierten Button)
    interactButton.addEventListener('click', (event) => {
      if (event.detail === 0) input.requestInteract();
    });
    this.interact = h('div', { class: 'interact', attrs: { 'aria-live': 'polite' } }, this.interactLabel, interactButton);

    this.portrait = h('canvas', { class: 'avatar-portrait', attrs: { width: '112', height: '112', 'aria-hidden': 'true' } });
    this.name = h('span', { class: 'player-name' });
    // Tipp auf das eigene Bild öffnet den Avatar-Editor
    const badge = h(
      'button',
      { class: 'avatar-badge', attrs: { type: 'button', 'aria-label': 'Avatar bearbeiten', title: 'Avatar bearbeiten' } },
      this.portrait,
      this.name,
      h('span', { class: 'avatar-badge-edit', html: Icons.brush, attrs: { 'aria-hidden': 'true' } }),
    );
    badge.addEventListener('click', (event) => {
      playClick();
      handlers.onAvatar();
      if (event.detail > 0) badge.blur();
    });

    this.el = h(
      'div',
      { class: 'hud', attrs: { hidden: '' } },
      h(
        'div',
        { class: 'hud-top-left' },
        badge,
        button({ label: 'Kleidung', icon: Icons.shirt, variant: 'icon', onPress: handlers.onWardrobe }, playClick),
        (this.homeButton = button({ label: 'Nach Hause', icon: Icons.home, variant: 'icon', onPress: handlers.onHome }, playClick)),
      ),
      h(
        'div',
        { class: 'hud-top-right' },
        h('div', { class: 'coins', attrs: { 'aria-label': 'Münzen' } }, h('span', { class: 'coin-icon', html: COIN_SVG }), this.coinValue),
        button({ label: 'Inventar', icon: Icons.bag, variant: 'icon', onPress: handlers.onInventory }, playClick),
        button({ label: 'Aufgaben', icon: Icons.list, variant: 'icon', onPress: handlers.onTasks }, playClick),
        button({ label: 'Einstellungen', icon: Icons.gear, variant: 'icon', onPress: handlers.onSettings }, playClick),
        button({ label: 'Pause', icon: Icons.pause, variant: 'icon', onPress: handlers.onPause }, playClick),
      ),
      this.joystick.el,
      this.interact,
    );
    parent.append(this.el);
  }

  show(): void {
    this.el.hidden = false;
  }

  hide(): void {
    this.el.hidden = true;
    this.joystick.release();
    this.setInteraction(null);
  }

  setPlayer(name: string, avatar: AvatarConfig): void {
    this.name.textContent = name;
    drawAvatarThumbnail(this.portrait, avatar, 'head');
  }

  /** Der „Nach Hause“-Button erscheint nur, wenn Samya nicht schon zu Hause ist. */
  setHomeVisible(visible: boolean): void {
    this.homeButton.hidden = !visible;
  }

  setCoins(value: number): void {
    const changed = this.coinValue.textContent !== '' && this.coinValue.textContent !== formatCoins(value);
    this.coinValue.textContent = formatCoins(value);
    if (changed) {
      const pill = this.coinValue.parentElement;
      pill?.classList.remove('is-bump');
      void pill?.offsetWidth;
      pill?.classList.add('is-bump');
    }
  }

  /** Zeigt den Interaktionsbutton nur, wenn wirklich eine Aktion möglich ist. */
  setInteraction(label: string | null): void {
    if (label) this.interactLabel.textContent = label;
    this.interact.classList.toggle('is-visible', label !== null);
  }
}

