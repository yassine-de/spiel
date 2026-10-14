/**
 * PLATZHALTER-Avatar: gemeinsame Maße, Geometrie und Schattierung für alle Ebenen.
 * Ein Frame ist 144 × 224 px (@2x), die Füße stehen bei y = 210.
 *
 * Stil: weiche 3D-Optik – Licht von oben links, plastische Rundungen,
 * nur zarte Kanten statt dicker Konturen.
 */
import { EYE_COLORS, HAIR_COLORS, SKIN_TONES, colorOf, getItem } from '../../../avatar/avatarCatalog';
import type { AvatarConfig, WearableItem } from '../../../avatar/avatarTypes';
import { CHARACTER_SHEET } from '../../assetKeys';
import { rgba, shade } from '../canvasUtils';

export const FRAME_W = CHARACTER_SHEET.frameWidth;
export const FRAME_H = CHARACTER_SHEET.frameHeight;
export const FEET_Y = CHARACTER_SHEET.footY - 6;

/** Der Kopf wird etwas kleiner gezeichnet (Proportionen wie bei 3D-Spielfiguren). */
export const HEAD_SCALE = 0.9;

/** Ansicht: vorne, Seite (nach links – rechts wird gespiegelt), hinten. */
export type View = 'front' | 'side' | 'back';

/** Körperseite aus Sicht der Figur (für zweifarbige Kleidung und Haare). */
export type BodySide = 'right' | 'left';

export interface Pose {
  /** -1..1: welches Bein vorne ist */
  stride: number;
  /** vertikales Wippen des Oberkörpers */
  bob: number;
}

/** Spalte 0 = Stehen, Spalten 1–4 = Laufzyklus. */
export const POSES: Pose[] = [
  { stride: 0, bob: 0 },
  { stride: 1, bob: 1 },
  { stride: 0, bob: -3 },
  { stride: -1, bob: 1 },
  { stride: 0, bob: -3 },
];

/** Aufgelöste Farben und Kleidungsstücke eines Avatars. */
export interface Look {
  config: AvatarConfig;
  skin: string;
  hair: string;
  /** Zweite Haarfarbe (zweifarbige Frisur, linke Kopfseite) oder null */
  hair2: string | null;
  hairStroke: string;
  eyes: string;
  top: WearableItem;
  /** null, wenn ein Kleid getragen wird */
  bottom: WearableItem | null;
  shoes: WearableItem;
  glasses: WearableItem | null;
  hairAccessory: WearableItem | null;
  hat: WearableItem | null;
  bag: WearableItem | null;
}

export function resolveLook(config: AvatarConfig): Look {
  const hairOption = HAIR_COLORS.find((o) => o.id === config.hairColor) ?? HAIR_COLORS[0];
  const hair = hairOption.color;
  const top = getItem(config.top)!;
  return {
    config,
    skin: colorOf(SKIN_TONES, config.skin),
    hair,
    hair2: hairOption.color2 ?? null,
    hairStroke: shade(hair, -0.38),
    eyes: colorOf(EYE_COLORS, config.eyeColor),
    top,
    bottom: top.category === 'dress' ? null : getItem(config.bottom),
    shoes: getItem(config.shoes)!,
    glasses: getItem(config.glasses),
    hairAccessory: getItem(config.hairAccessory),
    hat: getItem(config.hat),
    bag: getItem(config.bag),
  };
}

export interface Frame {
  ctx: CanvasRenderingContext2D;
  view: View;
  /** true bei Blick nach rechts (die Zeichnung wird gespiegelt) */
  mirrored: boolean;
  pose: Pose;
  look: Look;
  cx: number;
  headY: number;
  shoulderY: number;
  hipY: number;
}

export function createFrame(ctx: CanvasRenderingContext2D, view: View, pose: Pose, look: Look, mirrored = false): Frame {
  return {
    ctx,
    view,
    mirrored,
    pose,
    look,
    cx: FRAME_W / 2,
    headY: FEET_Y - 146 + pose.bob,
    shoulderY: FEET_Y - 98 + pose.bob,
    hipY: FEET_Y - 54 + pose.bob,
  };
}

/** Drehpunkt für die Kopf-Skalierung (Kinn/Hals). */
export function headPivot(f: Frame): { x: number; y: number } {
  return { x: f.cx, y: f.headY + 46 };
}

/* ------------------------------------------------------------------ */
/* Zweifarbige Teile                                                   */
/* ------------------------------------------------------------------ */

/** Welche Körperseite sieht man in der Seitenansicht? */
export function visibleSide(f: Frame): BodySide {
  return f.mirrored ? 'right' : 'left';
}

/** Körperseite an einer x-Position der Zeichnung (vorne/hinten). */
export function sideAtX(f: Frame, x: number): BodySide {
  if (f.view === 'side') return visibleSide(f);
  const leftOfCenter = x < f.cx;
  return f.view === 'front' ? (leftOfCenter ? 'right' : 'left') : leftOfCenter ? 'left' : 'right';
}

/** Farbe eines Kleidungsstücks auf einer Körperseite (color = rechts, color2 = links). */
export function itemColor(item: WearableItem, side: BodySide): string {
  return side === 'left' && item.color2 ? item.color2 : item.color;
}

/** Zeichnet eine Fläche zweifarbig: links/rechts der Mittellinie je nach Körperseite. */
export function splitPaint(f: Frame, item: WearableItem, paint: (color: string) => void): void {
  if (!item.color2 || f.view === 'side') {
    paint(itemColor(item, visibleSide(f)));
    return;
  }
  const { ctx, cx } = f;
  for (const half of [-1, 1]) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(half < 0 ? 0 : cx, 0, half < 0 ? cx : FRAME_W - cx, FRAME_H);
    ctx.clip();
    paint(itemColor(item, sideAtX(f, cx + half)));
    ctx.restore();
  }
}

/* ------------------------------------------------------------------ */
/* Geometrie                                                           */
/* ------------------------------------------------------------------ */

export interface Leg {
  hipX: number;
  footX: number;
  footY: number;
  /** hinteres Bein in der Seitenansicht */
  far: boolean;
  /** Versatz der Schuhspitze in Blickrichtung */
  toe: number;
  side: BodySide;
}

export function legGeometry(f: Frame): Leg[] {
  const { cx, pose } = f;
  if (f.view === 'side') {
    const near = visibleSide(f);
    const other: BodySide = near === 'left' ? 'right' : 'left';
    return [
      { hipX: cx + 2, footX: cx + 2 + pose.stride * 13, footY: FEET_Y, far: true, toe: -4, side: other },
      { hipX: cx - 2, footX: cx - 2 - pose.stride * 13, footY: FEET_Y, far: false, toe: -4, side: near },
    ];
  }
  return [-1, 1].map((s) => {
    const lift = Math.max(0, s * pose.stride) * 6;
    const x = cx + s * 10;
    return { hipX: x, footX: x, footY: FEET_Y - lift, far: false, toe: 0, side: sideAtX(f, x) };
  });
}

export interface Arm {
  sx: number;
  sy: number;
  hx: number;
  hy: number;
  far: boolean;
  side: BodySide;
}

export function armGeometry(f: Frame): Arm[] {
  const { cx, shoulderY, pose } = f;
  if (f.view === 'side') {
    const near = visibleSide(f);
    const other: BodySide = near === 'left' ? 'right' : 'left';
    return [
      { sx: cx + 2, sy: shoulderY + 10, hx: cx + 2 - pose.stride * 12, hy: shoulderY + 48, far: true, side: other },
      { sx: cx, sy: shoulderY + 10, hx: cx + pose.stride * 12, hy: shoulderY + 48, far: false, side: near },
    ];
  }
  const swingDir = f.view === 'front' ? -1 : 1;
  return [-1, 1].map((s) => {
    const sx = cx + s * 21;
    return {
      sx,
      sy: shoulderY + 8,
      hx: cx + s * 28,
      hy: shoulderY + 46 + swingDir * s * pose.stride * 5,
      far: false,
      side: sideAtX(f, sx),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Weiche 3D-Schattierung                                              */
/* ------------------------------------------------------------------ */

/**
 * Arm/Bein als runder „Schlauch“: Grundfarbe, Glanzlicht zur Lichtseite (oben links)
 * und Schatten auf der abgewandten Seite – wirkt plastisch statt flach.
 */
export function limb(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number, color: string): void {
  ctx.lineCap = 'round';
  const line = (ox: number, oy: number) => {
    ctx.beginPath();
    ctx.moveTo(x1 + ox, y1 + oy);
    ctx.lineTo(x2 + ox, y2 + oy);
    ctx.stroke();
  };
  ctx.strokeStyle = rgba(shade(color, -0.4), 0.45);
  ctx.lineWidth = width + 2;
  line(0, 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  line(0, 0);
  // Normale zur Lichtseite (nach links/oben)
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  let nx = -(y2 - y1) / len;
  let ny = (x2 - x1) / len;
  if (nx + ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  ctx.strokeStyle = rgba(shade(color, -0.25), 0.55);
  ctx.lineWidth = width * 0.34;
  line(-nx * width * 0.27, -ny * width * 0.27);
  ctx.strokeStyle = rgba(shade(color, 0.3), 0.45);
  ctx.lineWidth = width * 0.24;
  line(nx * width * 0.2, ny * width * 0.2);
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Füllt eine Form plastisch: Verlauf von hell (oben links) nach dunkel (unten rechts),
 * weiches Glanzlicht und eine zarte Kante.
 */
export function volume(ctx: CanvasRenderingContext2D, path: () => void, color: string, box: Box, edge = true): void {
  path();
  const g = ctx.createLinearGradient(box.x, box.y, box.x + box.w * 0.8, box.y + box.h);
  g.addColorStop(0, shade(color, 0.16));
  g.addColorStop(0.55, color);
  g.addColorStop(1, shade(color, -0.2));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  path();
  ctx.clip();
  const hx = box.x + box.w * 0.3;
  const hy = box.y + box.h * 0.22;
  const radius = Math.max(box.w, box.h) * 0.6;
  const light = ctx.createRadialGradient(hx, hy, 1, hx, hy, radius);
  light.addColorStop(0, 'rgba(255,255,255,0.32)');
  light.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = light;
  ctx.fillRect(box.x - 2, box.y - 2, box.w + 4, box.h + 4);
  // Umgebungsschatten an der Unterkante
  const ao = ctx.createLinearGradient(0, box.y + box.h * 0.65, 0, box.y + box.h);
  ao.addColorStop(0, 'rgba(40,20,50,0)');
  ao.addColorStop(1, 'rgba(40,20,50,0.14)');
  ctx.fillStyle = ao;
  ctx.fillRect(box.x - 2, box.y - 2, box.w + 4, box.h + 4);
  ctx.restore();
  if (edge) {
    path();
    ctx.strokeStyle = rgba(shade(color, -0.4), 0.5);
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
}

/** Punkt auf der Strecke a→b bei Anteil t. */
export function along(x1: number, y1: number, x2: number, y2: number, t: number): [number, number] {
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}
