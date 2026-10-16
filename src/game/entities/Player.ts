import type Phaser from 'phaser';
import { CHARACTER_SHEET, TextureKeys } from '../assets/assetKeys';
import { sittingTextureKey } from '../avatar/avatarTexture';
import { ASSET_SCALE, DEPTH } from '../config/constants';
import type { Direction, Rect } from '../types';
import { idleAnimKey, walkAnimKey } from './characterAnimations';

/** Kollisionsfläche an den Füßen (Welt-Einheiten). */
const FOOTPRINT = { w: 30, h: 14 };

/** Die Spielfigur: Sprite + Schatten. Position = Fußpunkt. */
export class Player {
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Image;
  private readonly texture: string;
  facing: Direction = 'down';
  /** Sitzt die Figur gerade (Stuhl im Salon, Café, Schule)? */
  seated = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = TextureKeys.Player) {
    this.texture = texture;
    this.shadow = scene.add.image(x, y, TextureKeys.Shadow).setScale(0.62 / ASSET_SCALE).setDepth(DEPTH.shadow);
    this.sprite = scene.add
      .sprite(x, y, texture, 0)
      .setOrigin(0.5, CHARACTER_SHEET.footY / CHARACTER_SHEET.frameHeight)
      .setScale(1 / ASSET_SCALE);
    this.setPosition(x, y);
    this.animate(false, this.facing, 1);
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  footprint(x = this.x, y = this.y): Rect {
    return { x: x - FOOTPRINT.w / 2, y: y - FOOTPRINT.h / 2, w: FOOTPRINT.w, h: FOOTPRINT.h };
  }

  /** Umrechnung von Footprint-Ecke zurück zum Fußpunkt. */
  static positionFromFootprint(rect: Rect): { x: number; y: number } {
    return { x: rect.x + FOOTPRINT.w / 2, y: rect.y + FOOTPRINT.h / 2 };
  }

  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.shadow.setPosition(x, y);
    // 2,5D: Wer weiter unten steht, wird weiter vorne gezeichnet.
    this.sprite.setDepth(y);
  }

  /** Spielt Lauf- oder Stehanimation; `speed` 0..1 steuert das Lauftempo. */
  animate(moving: boolean, facing: Direction, speed: number): void {
    if (this.seated) return;
    const key = moving ? walkAnimKey(this.texture, facing) : idleAnimKey(this.texture, facing);
    if (this.sprite.anims.currentAnim?.key !== key) this.sprite.anims.play(key);
    this.sprite.anims.timeScale = moving ? 0.55 + 0.55 * speed : 1;
    this.facing = facing;
  }

  /** Setzt die Figur hin (Sitzbild von vorne). `depth` legt fest, was vor bzw. hinter ihr liegt. */
  sitAt(x: number, y: number, depth: number): void {
    this.seated = true;
    this.sprite.anims.stop();
    this.sprite.setTexture(sittingTextureKey(this.texture));
    this.sprite.setPosition(x, y).setDepth(depth);
    this.shadow.setVisible(false);
    this.facing = 'down';
  }

  /** Steht wieder auf und stellt sich an (x, y). */
  standUp(x: number, y: number, facing: Direction = 'down'): void {
    if (!this.seated) return;
    this.seated = false;
    this.sprite.setTexture(this.texture, 0);
    this.shadow.setVisible(true);
    this.setPosition(x, y);
    this.sprite.anims.play(idleAnimKey(this.texture, facing));
    this.facing = facing;
  }
}
