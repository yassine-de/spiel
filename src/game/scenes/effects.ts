import type Phaser from 'phaser';
import { TextureKeys } from '../assets/assetKeys';
import { ASSET_SCALE, DEPTH } from '../config/constants';

/**
 * Kleine Effekte für Spielszenen (Herzchen, Noten, Glitzer).
 * Bei „Weniger Bewegung“ erscheinen sie kurz, ohne zu fliegen.
 */

/** Ein Emoji, das aufsteigt und verblasst. */
export function floatIcon(scene: Phaser.Scene, x: number, y: number, icon: string, calm: boolean, delay = 0): void {
  const text = scene.add
    .text(x, y, icon, { fontSize: `${26 * ASSET_SCALE}px` })
    .setOrigin(0.5)
    .setScale(1 / ASSET_SCALE)
    .setDepth(DEPTH.overlay - 20)
    .setAlpha(0);
  scene.tweens.add({
    targets: text,
    alpha: { from: 1, to: 0 },
    y: calm ? y : y - 46,
    x: calm ? x : x + (Math.random() - 0.5) * 30,
    duration: calm ? 900 : 1300,
    delay,
    ease: 'Sine.Out',
    onComplete: () => text.destroy(),
  });
}

/** Mehrere Emojis nacheinander rund um einen Punkt. */
export function iconShower(scene: Phaser.Scene, x: number, y: number, icons: string[], calm: boolean, count = 6, spread = 40): void {
  for (let i = 0; i < count; i++) {
    floatIcon(scene, x + (Math.random() - 0.5) * spread, y + (Math.random() - 0.5) * spread * 0.5, icons[i % icons.length], calm, i * 160);
  }
}

/** Glitzer-Wolke (z. B. wenn die neue Frisur fertig ist). */
export function sparkleBurst(scene: Phaser.Scene, x: number, y: number, calm: boolean): void {
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 34 + (i % 2) * 18;
    const sparkle = scene.add
      .image(x, y, TextureKeys.Sparkle)
      .setScale(0.4 / ASSET_SCALE)
      .setDepth(DEPTH.overlay - 20);
    scene.tweens.add({
      targets: sparkle,
      x: calm ? x : x + Math.cos(angle) * distance,
      y: calm ? y : y + Math.sin(angle) * distance,
      alpha: { from: 1, to: 0 },
      scale: calm ? 0.4 / ASSET_SCALE : 0.15 / ASSET_SCALE,
      duration: 700,
      ease: 'Sine.Out',
      onComplete: () => sparkle.destroy(),
    });
  }
}

/** Wartet im Spieltakt (pausiert mit der Szene). */
export function wait(scene: Phaser.Scene, ms: number): Promise<void> {
  return new Promise((resolve) => scene.time.delayedCall(ms, resolve));
}
