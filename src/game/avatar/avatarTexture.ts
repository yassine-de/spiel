import Phaser from 'phaser';
import { CHARACTER_SHEET, TextureKeys } from '../assets/assetKeys';
import { paintAvatarSheet } from '../assets/placeholders/avatar/avatarPainter';
import { addSpriteSheetFrames } from '../assets/textureRegistry';
import type { AvatarConfig } from './avatarTypes';

/**
 * Erzeugt bzw. aktualisiert das Spritesheet der Spielfigur aus der Avatar-Konfiguration.
 * Die Textur wird an Ort und Stelle neu gezeichnet – Sprites und Animationen,
 * die sie schon verwenden, zeigen sofort den neuen Look.
 */
export function applyAvatarTexture(textures: Phaser.Textures.TextureManager, avatar: AvatarConfig, key: string = TextureKeys.Player): void {
  const sheet = paintAvatarSheet(avatar);
  const existing = textures.exists(key) ? textures.get(key) : null;
  if (existing instanceof Phaser.Textures.CanvasTexture && existing.width === sheet.width && existing.height === sheet.height) {
    existing.clear();
    existing.draw(0, 0, sheet);
    return;
  }
  if (existing) textures.remove(existing);
  const texture = textures.addCanvas(key, sheet);
  if (texture) addSpriteSheetFrames(texture, CHARACTER_SHEET.frameWidth, CHARACTER_SHEET.frameHeight);
}
