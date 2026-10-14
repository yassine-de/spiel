import { playClick } from '../services';
import { button, h } from './dom';
import { Icons } from './icons';

export interface MainMenuHandlers {
  onPlay: () => void;
  onSettings: () => void;
  onAvatar: () => void;
}

export class MainMenu {
  readonly el: HTMLElement;

  constructor(parent: HTMLElement, handlers: MainMenuHandlers) {
    this.el = h(
      'div',
      { class: 'screen main-menu', attrs: { hidden: '' } },
      h(
        'div',
        { class: 'menu-layout' },
        h(
          'div',
          { class: 'menu-title-block' },
          h(
            'h1',
            { class: 'game-title' },
            h('span', { class: 'title-line-1', text: "Samya's" }),
            h('span', { class: 'title-line-2', text: 'World' }),
          ),
          h('p', { class: 'menu-subtitle', text: 'Deine eigene bunte Stadt 💖' }),
        ),
        h(
          'div',
          { class: 'menu-buttons' },
          button({ label: 'Spielen', icon: Icons.play, onPress: handlers.onPlay }, playClick),
          button({ label: 'Avatar gestalten', icon: Icons.brush, variant: 'secondary', onPress: handlers.onAvatar }, playClick),
          button({ label: 'Einstellungen', icon: Icons.gear, variant: 'secondary', onPress: handlers.onSettings }, playClick),
        ),
      ),
      h('div', { class: 'menu-footer', text: `Version ${__APP_VERSION__} · Phase 5 · mit Platzhaltergrafiken` }),
    );
    parent.append(this.el);
  }

  show(): void {
    this.el.hidden = false;
  }

  hide(): void {
    this.el.hidden = true;
  }
}
