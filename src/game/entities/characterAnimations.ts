import type Phaser from 'phaser';
import { CHARACTER_SHEET } from '../assets/assetKeys';
import type { Direction } from '../types';

export function idleAnimKey(texture: string, direction: Direction): string {
  return `${texture}-idle-${direction}`;
}

export function walkAnimKey(texture: string, direction: Direction): string {
  return `${texture}-walk-${direction}`;
}

/** Legt Steh- und Laufanimationen für ein Figuren-Spritesheet an (einmal pro Textur). */
export function createCharacterAnimations(anims: Phaser.Animations.AnimationManager, texture: string): void {
  CHARACTER_SHEET.rows.forEach((direction, row) => {
    const first = row * CHARACTER_SHEET.columns;
    if (!anims.exists(idleAnimKey(texture, direction))) {
      anims.create({
        key: idleAnimKey(texture, direction),
        frames: [{ key: texture, frame: first + CHARACTER_SHEET.idleColumn }],
      });
    }
    if (!anims.exists(walkAnimKey(texture, direction))) {
      anims.create({
        key: walkAnimKey(texture, direction),
        frames: CHARACTER_SHEET.walkColumns.map((column) => ({ key: texture, frame: first + column })),
        frameRate: 9,
        repeat: -1,
      });
    }
  });
}
