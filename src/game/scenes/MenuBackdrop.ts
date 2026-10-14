import Phaser from 'phaser';
import { TextureKeys } from '../assets/assetKeys';
import { ASSET_SCALE } from '../config/constants';
import { viewSize } from './sceneUtils';

interface Drifter {
  obj: Phaser.GameObjects.Image;
  speed: number;
}

export interface BackdropOptions {
  /** Hügel und Bäume ziehen vorbei (Eindruck von Spazierengehen) */
  scrolling: boolean;
  /** Bäume auf den Hügeln */
  trees: boolean;
  /** Aufsteigende Herzen */
  hearts: boolean;
  /** Ruhige Animationen: alles steht still */
  calm: boolean;
}

/** Pastell-Himmel mit Wolken, Hügeln, Bäumen und Herzen – für Hauptmenü und Avatar-Editor. */
export class MenuBackdrop {
  private readonly sky: Phaser.GameObjects.Graphics;
  private readonly hills: Phaser.GameObjects.TileSprite;
  private readonly clouds: Drifter[];
  private readonly trees: Drifter[];
  private readonly hearts: Phaser.GameObjects.Image[];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly options: BackdropOptions,
  ) {
    this.sky = scene.add.graphics().setDepth(-10);
    this.clouds = [0, 1, 2, 3].map((i) => ({
      obj: scene.add.image(0, 0, TextureKeys.Cloud).setScale(0.45 + i * 0.08).setAlpha(0.95).setDepth(-5),
      speed: 8 + i * 4,
    }));
    this.hills = scene.add.tileSprite(0, 0, 100, 280, TextureKeys.MenuHills).setOrigin(0, 1).setTileScale(1 / ASSET_SCALE).setDepth(0);
    const treeKeys = options.trees ? [TextureKeys.TreeGreen, TextureKeys.TreePink, TextureKeys.TreeGreen] : [];
    this.trees = treeKeys.map((key) => ({
      obj: scene.add.image(0, 0, key).setOrigin(0.5, 0.95).setScale(1 / ASSET_SCALE).setDepth(1),
      speed: 40,
    }));
    this.hearts =
      options.hearts && !options.calm
        ? Array.from({ length: 6 }, () => scene.add.image(0, 0, TextureKeys.Heart).setScale(0.4).setAlpha(0).setDepth(6))
        : [];
    this.layout(true);
  }

  layout(initial = false): void {
    const { width, height } = viewSize(this.scene);
    this.sky.clear();
    this.sky.fillGradientStyle(0xbfe6ff, 0xd9ccff, 0xffe3f0, 0xfff1e6, 1);
    this.sky.fillRect(0, 0, width, height);
    this.sky.fillStyle(0xfff6c9, 0.55);
    this.sky.fillCircle(width * 0.86, height * 0.16, 70);
    this.sky.fillStyle(0xfff9de, 0.9);
    this.sky.fillCircle(width * 0.86, height * 0.16, 46);
    this.hills.setPosition(0, height).setSize(width, 280);

    if (initial) {
      this.clouds.forEach((c, i) => c.obj.setPosition(((i + 0.3) / 4) * width, 70 + (i % 2) * 90 + i * 12));
      this.trees.forEach((t, i) => t.obj.setPosition(((i + 0.5) / 3) * width + 120, height - 150 + (i % 2) * 20));
      this.hearts.forEach((heart) => this.resetHeart(heart, true));
    }
  }

  update(deltaMs: number): void {
    if (this.options.calm) return;
    const dt = deltaMs / 1000;
    const { width, height } = viewSize(this.scene);
    for (const cloud of this.clouds) {
      cloud.obj.x -= cloud.speed * dt;
      if (cloud.obj.x < -cloud.obj.displayWidth / 2) cloud.obj.x = width + cloud.obj.displayWidth / 2;
    }
    if (this.options.scrolling) {
      this.hills.tilePositionX += 40 * ASSET_SCALE * dt;
      for (const tree of this.trees) {
        tree.obj.x -= tree.speed * dt;
        if (tree.obj.x < -80) tree.obj.x = width + 80 + Math.random() * 200;
      }
    }
    for (const heart of this.hearts) {
      const speed = heart.getData('speed') as number;
      const phase = (heart.getData('phase') as number) + dt * 2;
      heart.setData('phase', phase);
      heart.y -= speed * dt;
      heart.x += Math.sin(phase) * 0.4;
      heart.setAlpha(Phaser.Math.Clamp((height - heart.y) / 200, 0, 0.75) * Phaser.Math.Clamp(heart.y / 150, 0, 1));
      if (heart.y < -20) this.resetHeart(heart, false);
    }
  }

  private resetHeart(heart: Phaser.GameObjects.Image, initial: boolean): void {
    const { width, height } = viewSize(this.scene);
    heart.setPosition(Phaser.Math.Between(40, Math.max(60, width - 40)), height + Phaser.Math.Between(0, initial ? height : 80));
    heart.setData('speed', Phaser.Math.FloatBetween(18, 34));
    heart.setData('phase', Math.random() * Math.PI * 2);
  }
}
