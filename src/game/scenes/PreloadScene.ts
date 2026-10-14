import Phaser from 'phaser';
import { TextureKeys } from '../assets/assetKeys';
import { applyAvatarTexture } from '../avatar/avatarTexture';
import { ASSETS } from '../assets/assetManifest';
import { createMissingPlaceholders, queueAssetFiles } from '../assets/textureRegistry';
import { SCENES } from '../config/constants';
import { createCharacterAnimations } from '../entities/characterAnimations';
import { saves } from '../services';
import { getUI } from '../ui';

/** Lädt echte Grafiken (falls vorhanden) und erzeugt für alles andere Platzhalter. */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.Preload);
  }

  preload(): void {
    const ui = getUI();
    this.load.on('progress', (value: number) => ui.loading.setProgress(value * 0.8));
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`[Assets] Datei konnte nicht geladen werden, Platzhalter wird genutzt: ${file.src}`);
    });
    queueAssetFiles(this.load, ASSETS);
  }

  create(): void {
    const ui = getUI();
    const placeholders = createMissingPlaceholders(this.textures, ASSETS);
    if (placeholders.length > 0) {
      console.info(`[Assets] PLATZHALTER-Grafiken aktiv (${placeholders.length}): ${placeholders.join(', ')}`);
    }
    applyAvatarTexture(this.textures, saves.avatar);
    createCharacterAnimations(this.anims, TextureKeys.Player);
    ui.loading.setProgress(1);
    ui.loading.hide();
    this.scene.start(SCENES.MainMenu);
  }
}
