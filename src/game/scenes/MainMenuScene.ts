import Phaser from 'phaser';
import { CHARACTER_SHEET, TextureKeys } from '../assets/assetKeys';
import { ASSET_SCALE, SCENES } from '../config/constants';
import { idleAnimKey, walkAnimKey } from '../entities/characterAnimations';
import { audio, keyboard, reducedMotion, saveLoadStatus, saves } from '../services';
import { getUI } from '../ui';
import type { AvatarSceneData } from './AvatarCreatorScene';
import { MenuBackdrop } from './MenuBackdrop';
import { fitCamera, onResize, viewSize } from './sceneUtils';

let recoveryNoticeShown = false;

/** Hauptmenü mit lebendigem Hintergrund: Wolken ziehen, der Avatar spaziert über die Hügel. */
export class MainMenuScene extends Phaser.Scene {
  private backdrop!: MenuBackdrop;
  private figure!: Phaser.GameObjects.Sprite;
  private calm = false;
  private leaving = false;

  constructor() {
    super(SCENES.MainMenu);
  }

  create(): void {
    const ui = getUI();
    this.calm = reducedMotion();
    this.leaving = false;

    this.layoutCamera();
    this.backdrop = new MenuBackdrop(this, { scrolling: true, trees: true, hearts: true, calm: this.calm });
    this.figure = this.add
      .sprite(0, 0, TextureKeys.Player)
      .setOrigin(0.5, CHARACTER_SHEET.footY / CHARACTER_SHEET.frameHeight)
      .setScale(1.25 / ASSET_SCALE)
      .setDepth(5);
    this.figure.play(this.calm ? idleAnimKey(TextureKeys.Player, 'down') : walkAnimKey(TextureKeys.Player, 'right'));
    this.layout();
    onResize(this, () => this.layout());

    ui.mainMenu.show();
    ui.mainMenuHandlers = {
      onPlay: () => (saves.hasSave ? this.leave(SCENES.City) : this.leave(SCENES.AvatarCreator, { mode: 'create', returnTo: 'world' })),
      onAvatar: () =>
        this.leave(SCENES.AvatarCreator, saves.hasSave ? { mode: 'edit', returnTo: 'menu' } : { mode: 'create', returnTo: 'world' }),
      onSettings: () => ui.settings.show(),
    };
    keyboard.onPause = null;
    this.events.once('shutdown', () => ui.mainMenu.hide());
    this.cameras.main.fadeIn(this.calm ? 0 : 350, 255, 240, 246);

    if (saveLoadStatus === 'recovered' && !recoveryNoticeShown) {
      recoveryNoticeShown = true;
      ui.toast.show(`Huch! Dein alter Spielstand ließ sich nicht öffnen. Wir fangen neu an, ${saves.playerName}! 💖`, 6000);
    }
  }

  private leave(target: string, data?: AvatarSceneData): void {
    if (this.leaving) return;
    this.leaving = true;
    audio.unlock();
    getUI().mainMenu.hide();
    if (this.calm) {
      this.scene.start(target, data);
      return;
    }
    const camera = this.cameras.main;
    camera.fadeOut(300, 255, 240, 246);
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(target, data));
  }

  private layoutCamera(): void {
    fitCamera(this);
    const { width, height } = viewSize(this);
    this.cameras.main.centerOn(width / 2, height / 2);
  }

  private layout(): void {
    this.layoutCamera();
    this.backdrop.layout();
    const { width, height } = viewSize(this);
    this.figure.setPosition(width * 0.5, height - 34);
  }

  override update(_time: number, delta: number): void {
    this.backdrop.update(delta);
  }
}
