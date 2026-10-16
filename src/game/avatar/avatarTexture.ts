import Phaser from 'phaser';
import { CHARACTER_SHEET, TextureKeys } from '../assets/assetKeys';
import { paintAvatarSheet, paintAvatarSitting } from '../assets/placeholders/avatar/avatarPainter';
import { addSpriteSheetFrames } from '../assets/textureRegistry';
import type { AvatarConfig } from './avatarTypes';

/** Schlüssel der Sitz-Textur zu einem Figuren-Spritesheet. */
export function sittingTextureKey(key: string): string {
  return `${key}-sit`;
}

/** Zeichnet eine Leinwand in eine (vorhandene) Canvas-Textur – an Ort und Stelle, wenn möglich. */
function putCanvas(textures: Phaser.Textures.TextureManager, key: string, source: HTMLCanvasElement, sheet: boolean): void {
  const existing = textures.exists(key) ? textures.get(key) : null;
  if (existing instanceof Phaser.Textures.CanvasTexture && existing.width === source.width && existing.height === source.height) {
    existing.clear();
    existing.draw(0, 0, source);
    return;
  }
  if (existing) textures.remove(existing);
  const texture = textures.addCanvas(key, source);
  if (texture && sheet) addSpriteSheetFrames(texture, CHARACTER_SHEET.frameWidth, CHARACTER_SHEET.frameHeight);
}

/**
 * Erzeugt bzw. aktualisiert das Spritesheet einer Figur aus der Avatar-Konfiguration
 * (dazu ein Sitzbild). Die Texturen werden an Ort und Stelle neu gezeichnet – Sprites
 * und Animationen, die sie schon verwenden, zeigen sofort den neuen Look.
 */
export function applyAvatarTexture(textures: Phaser.Textures.TextureManager, avatar: AvatarConfig, key: string = TextureKeys.Player): void {
  putCanvas(textures, key, paintAvatarSheet(avatar), true);
  putCanvas(textures, sittingTextureKey(key), paintAvatarSitting(avatar), false);
}
