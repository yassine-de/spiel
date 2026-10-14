import type Phaser from 'phaser';
import type { AssetEntry } from './assetManifest';

/** Lädt alle Assets mit Datei über den Phaser-Loader. */
export function queueAssetFiles(loader: Phaser.Loader.LoaderPlugin, assets: AssetEntry[]): void {
  for (const asset of assets) {
    if (!asset.file) continue;
    if (asset.kind === 'spritesheet') {
      loader.spritesheet(asset.key, asset.file, {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight,
        margin: asset.margin ?? 0,
        spacing: asset.spacing ?? 0,
      });
    } else {
      loader.image(asset.key, asset.file);
    }
  }
}

/** Teilt eine Textur in nummerierte Einzelbilder (Zeile für Zeile). */
export function addSpriteSheetFrames(texture: Phaser.Textures.Texture, frameWidth: number, frameHeight: number, margin = 0, spacing = 0): void {
  const source = texture.source[0];
  const columns = Math.floor((source.width - margin * 2 + spacing) / (frameWidth + spacing));
  const rows = Math.floor((source.height - margin * 2 + spacing) / (frameHeight + spacing));
  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      texture.add(index++, 0, margin + col * (frameWidth + spacing), margin + row * (frameHeight + spacing), frameWidth, frameHeight);
    }
  }
}

/**
 * Erzeugt für jedes fehlende Asset den Platzhalter.
 * Gibt die Schlüssel zurück, für die Platzhalter verwendet werden.
 */
export function createMissingPlaceholders(textures: Phaser.Textures.TextureManager, assets: AssetEntry[]): string[] {
  const used: string[] = [];
  for (const asset of assets) {
    if (textures.exists(asset.key)) continue;
    const texture = textures.addCanvas(asset.key, asset.placeholder());
    if (!texture) continue;
    if (asset.kind === 'spritesheet') {
      addSpriteSheetFrames(texture, asset.frameWidth, asset.frameHeight, asset.margin, asset.spacing);
    }
    used.push(asset.key);
  }
  return used;
}
