import Phaser from 'phaser';
import { SCENES } from '../config/constants';

/** Wartet, bis die Spielschrift geladen ist, damit Schilder sofort richtig aussehen. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.Boot);
  }

  create(): void {
    const fonts = Promise.all([
      document.fonts.load('600 32px Fredoka'),
      document.fonts.load('700 32px Fredoka'),
    ]).catch(() => undefined);
    const timeout = new Promise((resolve) => window.setTimeout(resolve, 2500));
    void Promise.race([fonts, timeout]).then(() => this.scene.start(SCENES.Preload));
  }
}
