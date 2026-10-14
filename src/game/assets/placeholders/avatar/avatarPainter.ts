/**
 * PLATZHALTER-Avatar: setzt die Figur aus kombinierbaren Ebenen zusammen.
 *
 * Jede Ebene ist eine eigene Zeichenfunktion. Die Reihenfolge in AVATAR_LAYERS
 * bestimmt, was vorne liegt. Sollen später echte Grafiken verwendet werden,
 * wird jede Ebene durch ein Spritesheet im gleichen Raster ersetzt
 * (CHARACTER_SHEET) und in derselben Reihenfolge übereinander gezeichnet.
 */
import type { AvatarConfig } from '../../../avatar/avatarTypes';
import type { Direction } from '../../../types';
import { CHARACTER_SHEET } from '../../assetKeys';
import { createCanvas, shade } from '../canvasUtils';
import { drawArms, drawBag, drawBottom, drawFace, drawFarArm, drawGlasses, drawHead, drawLegs, drawShoes, drawTop } from './bodyPainter';
import {
  type BodySide,
  FRAME_H,
  FRAME_W,
  HEAD_SCALE,
  POSES,
  type Frame,
  type View,
  createFrame,
  headPivot,
  resolveLook,
  sideAtX,
  visibleSide,
} from './frame';
import { drawHairAccessory, drawHairBack, drawHairFront, drawHat } from './hairPainter';

export interface AvatarLayer {
  id: string;
  draw: (frame: Frame) => void;
}

/** Ebenen von hinten nach vorne. */
export const AVATAR_LAYERS: AvatarLayer[] = [
  { id: 'hair-back', draw: drawHairBack },
  { id: 'legs', draw: drawLegs },
  { id: 'shoes', draw: drawShoes },
  { id: 'arm-far', draw: drawFarArm },
  // Unterteil vor dem Oberteil: Shirts und Hoodies fallen über den Bund
  { id: 'bottom', draw: drawBottom },
  { id: 'top', draw: drawTop },
  { id: 'arms', draw: drawArms },
  { id: 'bag', draw: drawBag },
  { id: 'head', draw: drawHead },
  { id: 'face', draw: drawFace },
  { id: 'glasses', draw: drawGlasses },
  { id: 'hair-front', draw: drawHairFront },
  { id: 'hair-accessory', draw: drawHairAccessory },
  { id: 'hat', draw: drawHat },
];

/** Diese Ebenen gehören zum Kopf und werden etwas kleiner gezeichnet (HEAD_SCALE). */
const HEAD_LAYERS = new Set(['hair-back', 'head', 'face', 'glasses', 'hair-front', 'hair-accessory', 'hat']);
const HAIR_LAYERS = new Set(['hair-back', 'hair-front']);

const VIEW_BY_DIRECTION: Record<Direction, View> = { down: 'front', left: 'side', right: 'side', up: 'back' };

function drawLayer(frame: Frame, layer: AvatarLayer): void {
  const { ctx } = frame;
  ctx.save();
  if (HEAD_LAYERS.has(layer.id)) {
    const p = headPivot(frame);
    ctx.translate(p.x, p.y);
    ctx.scale(HEAD_SCALE, HEAD_SCALE);
    ctx.translate(-p.x, -p.y);
  }
  layer.draw(frame);
  ctx.restore();
}

/**
 * Zweifarbige Frisur: Die Ebene wird je Haarfarbe einzeln gezeichnet und an der
 * Mittellinie zusammengesetzt (rechte Kopfseite = 1. Farbe, linke = 2. Farbe).
 */
function drawTwoToneHair(frame: Frame, layer: AvatarLayer, hair2: string): void {
  for (const side of ['right', 'left'] as BodySide[]) {
    if (frame.view === 'side' && visibleSide(frame) !== side) continue;
    const hair = side === 'left' ? hair2 : frame.look.hair;
    const { canvas, ctx } = createCanvas(FRAME_W, FRAME_H);
    drawLayer({ ...frame, ctx, look: { ...frame.look, hair, hairStroke: shade(hair, -0.38) } }, layer);
    if (frame.view !== 'side') {
      ctx.globalCompositeOperation = 'destination-in';
      const leftHalf = sideAtX(frame, frame.cx - 1) === side;
      ctx.fillRect(leftHalf ? 0 : frame.cx, 0, leftHalf ? frame.cx : FRAME_W - frame.cx, FRAME_H);
    }
    frame.ctx.drawImage(canvas, 0, 0);
  }
}

export function paintAvatarFrame(config: AvatarConfig, direction: Direction, column: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(FRAME_W, FRAME_H);
  if (direction === 'right') {
    ctx.translate(FRAME_W, 0);
    ctx.scale(-1, 1);
  }
  const frame = createFrame(ctx, VIEW_BY_DIRECTION[direction], POSES[column] ?? POSES[0], resolveLook(config), direction === 'right');
  for (const layer of AVATAR_LAYERS) {
    const hair2 = frame.look.hair2;
    if (hair2 && HAIR_LAYERS.has(layer.id)) drawTwoToneHair(frame, layer, hair2);
    else drawLayer(frame, layer);
  }
  return canvas;
}

export function paintAvatarSheet(config: AvatarConfig): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(FRAME_W * CHARACTER_SHEET.columns, FRAME_H * CHARACTER_SHEET.rows.length);
  CHARACTER_SHEET.rows.forEach((direction, row) => {
    for (let column = 0; column < CHARACTER_SHEET.columns; column++) {
      ctx.drawImage(paintAvatarFrame(config, direction, column), column * FRAME_W, row * FRAME_H);
    }
  });
  return canvas;
}

/** Bildausschnitte (im Frame-Raster) für Vorschaubilder. */
export const THUMB_REGIONS = {
  full: { x: 0, y: 0, w: FRAME_W, h: FRAME_H },
  head: { x: 12, y: 2, w: 120, h: 120 },
  body: { x: 20, y: 98, w: 104, h: 104 },
  legs: { x: 26, y: 142, w: 92, h: 82 },
  feet: { x: 34, y: 172, w: 76, h: 52 },
} as const;

export type ThumbRegion = keyof typeof THUMB_REGIONS;

/** Zeichnet einen Ausschnitt der Vorderansicht in eine vorhandene Leinwand (zentriert, Seitenverhältnis bleibt). */
export function drawAvatarThumbnail(target: HTMLCanvasElement, config: AvatarConfig, region: ThumbRegion, direction: Direction = 'down', column = 0): void {
  const ctx = target.getContext('2d');
  if (!ctx) return;
  const r = THUMB_REGIONS[region];
  const scale = Math.min(target.width / r.w, target.height / r.h);
  const w = r.w * scale;
  const h = r.h * scale;
  ctx.clearRect(0, 0, target.width, target.height);
  ctx.drawImage(paintAvatarFrame(config, direction, column), r.x, r.y, r.w, r.h, (target.width - w) / 2, (target.height - h) / 2, w, h);
}
