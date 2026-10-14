import Phaser from 'phaser';
import { GROUND_TILESET, TextureKeys } from '../assets/assetKeys';
import { ASSET_SCALE, DEPTH, TILE_SIZE } from '../config/constants';
import type { CollisionManager } from '../systems/CollisionManager';
import type { Rect } from '../types';
import { type WorldLayout, createLayoutCollisions } from './cityLayout';
import { PROPS, propFootprint, type PlacedProp } from './props';

export interface BuiltWorld {
  width: number;
  height: number;
  collisions: CollisionManager;
  /** Zugriff auf platzierte Objekte mit `id` (z. B. für Interaktionen). */
  objects: Map<string, { prop: PlacedProp; image: Phaser.GameObjects.Image }>;
  solids: Rect[];
}

export interface BuildOptions {
  reducedMotion: boolean;
}


/** Baut eine Spielwelt aus Layout-Daten: Bodenkacheln, Objekte, Beschriftungen, Kollisionen. */
export function buildWorld(scene: Phaser.Scene, layout: WorldLayout, options: BuildOptions): BuiltWorld {
  const width = layout.cols * TILE_SIZE;
  const height = layout.rows * TILE_SIZE;

  // Boden als Tilemap: sehr effizient, nur sichtbare Kacheln werden gezeichnet.
  const px = GROUND_TILESET.tilePx;
  const map = scene.make.tilemap({ data: layout.tiles, tileWidth: px, tileHeight: px });
  const tileset = map.addTilesetImage('ground', TextureKeys.GroundTiles, px, px, GROUND_TILESET.extrude, GROUND_TILESET.extrude * 2);
  if (!tileset) throw new Error('Boden-Tileset konnte nicht erstellt werden');
  map.createLayer(0, tileset, 0, 0)?.setScale(TILE_SIZE / px).setDepth(DEPTH.ground);

  const collisions = createLayoutCollisions(layout);
  const objects: BuiltWorld['objects'] = new Map();
  const solids: Rect[] = [];

  for (const prop of layout.props) {
    const def = PROPS[prop.type];
    const scale = def.scale ?? 1;
    const depth = def.layer === 'wall' ? DEPTH.wallDecor : def.layer === 'floor' ? DEPTH.floorDecor : prop.y;
    const image = scene.add
      .image(prop.x, prop.y, def.texture)
      .setOrigin(0.5, def.originY)
      .setScale(scale / ASSET_SCALE)
      .setDepth(depth);

    const rect = propFootprint(prop);
    if (rect) solids.push(rect);

    def.labels?.forEach((slot, index) => {
      const text = prop.labels?.[index] ?? slot.text;
      if (!text) return;
      scene.add
        .text(prop.x + (slot.offsetX ?? 0) * scale, prop.y + slot.offsetY * scale, text, {
          fontFamily: 'Fredoka, sans-serif',
          fontStyle: '600',
          fontSize: `${slot.fontSize * ASSET_SCALE}px`,
          color: slot.color,
          align: 'center',
          lineSpacing: -6,
          wordWrap: { width: slot.maxWidth * scale * ASSET_SCALE },
        })
        .setOrigin(0.5)
        .setScale(1 / ASSET_SCALE)
        .setDepth(depth + 0.01);
    });

    if (!options.reducedMotion) addAmbient(scene, prop, image, def.ambient);
    else if (def.ambient === 'flag') addFlag(scene, prop, false);

    if (prop.id) objects.set(prop.id, { prop, image });
  }

  solids.push(...(layout.solids ?? []));
  return { width, height, collisions, objects, solids };
}

/** Kleine, dezente Umgebungsanimationen. */
function addAmbient(scene: Phaser.Scene, prop: PlacedProp, image: Phaser.GameObjects.Image, ambient: string | undefined): void {
  switch (ambient) {
    case 'sway':
      scene.tweens.add({
        targets: image,
        angle: { from: -0.8, to: 0.8 },
        duration: 2600 + (prop.x % 900),
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1,
        delay: prop.y % 1200,
      });
      break;
    case 'sparkle':
      // Glitzer über dem Brunnenwasser
      for (let i = 0; i < 3; i++) {
        const sparkle = scene.add
          .image(prop.x - 60 + i * 60, prop.y - 60 - (i % 2) * 20, TextureKeys.Sparkle)
          .setScale(0.35 / ASSET_SCALE)
          .setAlpha(0)
          .setDepth(prop.y + 1);
        scene.tweens.add({ targets: sparkle, alpha: 0.9, duration: 700, yoyo: true, repeat: -1, repeatDelay: 900 + i * 500, delay: i * 650 });
      }
      break;
    case 'shine': {
      const shine = scene.add
        .image(prop.x - 20, prop.y - 70, TextureKeys.WaterShine)
        .setScale(1 / ASSET_SCALE)
        .setAlpha(0.3)
        .setDepth(prop.y + 1);
      scene.tweens.add({ targets: shine, alpha: 0.9, x: prop.x + 10, duration: 2200, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
      break;
    }
    case 'flag':
      addFlag(scene, prop, true);
      break;
    default:
      break;
  }
}

function addFlag(scene: Phaser.Scene, prop: PlacedProp, animate: boolean): void {
  const flag = scene.add
    .image(prop.x + 3, prop.y - 186, TextureKeys.Flag)
    .setOrigin(0, 0.1)
    .setScale(1 / ASSET_SCALE)
    .setDepth(prop.y + 0.5);
  if (animate) {
    scene.tweens.add({ targets: flag, scaleX: 0.86 / ASSET_SCALE, duration: 900, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  }
}
