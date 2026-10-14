import { playClick } from '../services';
import { button, h } from './dom';
import { Icons } from './icons';
import { Modal } from './Modal';

export interface PauseMenuHandlers {
  onResume: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export class PauseMenu extends Modal {
  constructor(parent: HTMLElement, handlers: PauseMenuHandlers) {
    super(parent, 'Pause', { closable: false, className: 'pause-card' });
    this.body.append(
      h(
        'div',
        { class: 'menu-buttons' },
        button({ label: 'Weiterspielen', icon: Icons.play, onPress: handlers.onResume }, playClick),
        button({ label: 'Einstellungen', icon: Icons.gear, variant: 'secondary', onPress: handlers.onSettings }, playClick),
        button({ label: 'Hauptmenü', icon: Icons.home, variant: 'secondary', onPress: handlers.onMainMenu }, playClick),
      ),
    );
  }
}
