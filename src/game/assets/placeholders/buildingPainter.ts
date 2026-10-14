/**
 * PLATZHALTER: Gebäude aus einer Beschreibung (BuildingVisual) zeichnen.
 * Gezeichnet wird in Welt-Einheiten; die Leinwand ist @2x (ASSET_SCALE).
 * Schilder-Texte kommen nicht aus der Grafik, sondern als Text aus der Szene.
 *
 * Stil: möglichst echte Materialien (Klinker, Putz, Holzverkleidung, Naturstein),
 * Dachziegel, Fenster mit Laibung, Fensterbank und Spiegelung, Holztüren mit
 * Kassetten. Licht kommt von oben links; Dachkanten und Markisen werfen Schatten.
 */
import { ASSET_SCALE } from '../../config/constants';
import { createCanvas, ellipsePath, fillAndStroke, flower, groundShadow, heartPath, rgba, roundRectPath, shade, starPath } from './canvasUtils';

export type DisplayContent = 'dresses' | 'toys' | 'groceries' | 'cups' | 'mirrors' | 'curtains';

/** Material der Fassade. */
export type WallMaterial = 'brick' | 'plaster' | 'siding' | 'stone';

export interface BuildingVisual {
  /** Breite der Fassade */
  width: number;
  /** Höhe der Fassade (ohne Dach) */
  wallHeight: number;
  roof: 'gable' | 'flat';
  roofHeight: number;
  wall: string;
  material: WallMaterial;
  /** Farbe von Fensterrahmen, Gesimsen und Ecken (Standard: Weiß) */
  trim?: string;
  roofColor: string;
  /** Fenster im Obergeschoss (0 = eingeschossig) */
  upperWindows: number;
  /** Fenster neben der Tür im Erdgeschoss (links und rechts je eins), Inhalt */
  display: DisplayContent;
  /** Große Schaufenster statt normaler Fenster */
  bigDisplay?: boolean;
  door: { style: 'arch' | 'shop' | 'glass'; color: string; width: number };
  awning?: string[];
  /** Schildfläche auf der Fassade (Mitte, Abstand zum Fuß) */
  sign?: { width: number; height: number; fromBase: number; fill: string; border: string };
  /** Schild quer über der Tür (für „Bald geöffnet“ usw.) – zeigt deutlich: geschlossen */
  doorSign?: { width: number };
  /** Schild neben der Tür (Haus) */
  plate?: { offsetX: number; fromBase: number; width: number; height: number };
  chimney?: boolean;
  clock?: boolean;
  heartWindow?: boolean;
  /** farbiges Band oben an der Fassade (z. B. Supermarkt) */
  topBand?: string;
}

export const BUILDING_MARGIN = { side: 30, top: 20, bottom: 26 } as const;

export function buildingCanvasSize(v: BuildingVisual): { width: number; height: number; baseY: number } {
  const baseY = BUILDING_MARGIN.top + v.roofHeight + v.wallHeight;
  return { width: v.width + BUILDING_MARGIN.side * 2, height: baseY + BUILDING_MARGIN.bottom, baseY };
}

export interface BuildingMetrics {
  /** Höhe der Tür */
  doorHeight: number;
  /** Abstand der Erdgeschoss-Oberkante vom Fußpunkt */
  groundFloorTop: number;
  /** Mittelpunkt des Türschilds über dem Fußpunkt */
  doorSignCenter: number;
}

/** Maße, die Grafik und Beschriftung gemeinsam brauchen. */
export function buildingMetrics(v: BuildingVisual): BuildingMetrics {
  const groundFloorTop = v.upperWindows > 0 ? v.wallHeight * 0.5 : v.wallHeight - (v.topBand ? 22 : 0);
  const doorHeight = Math.min(118, (groundFloorTop - 14) * 0.78);
  return { doorHeight, groundFloorTop, doorSignCenter: 14 + doorHeight * 0.62 };
}

const PLINTH_H = 14;
const STONE = '#d9d4cb';
const MORTAR = '#d6cfc4';

/** Reproduzierbarer Zufall: jedes Gebäude sieht bei jedem Start gleich aus. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;

/** Rechteck mit Lichtkante oben links und Schattenkante unten rechts. */
function bevel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, depth = 1.5, light = 0.35, dark = 0.3): void {
  ctx.fillStyle = `rgba(255,255,255,${light})`;
  ctx.fillRect(x, y, w, depth);
  ctx.fillRect(x, y, depth, h);
  ctx.fillStyle = `rgba(30,20,20,${dark})`;
  ctx.fillRect(x, y + h - depth, w, depth);
  ctx.fillRect(x + w - depth, y, depth, h);
}

/** Weicher Schlagschatten nach unten (unter Gesimsen, Fensterbänken, Markisen). */
function dropShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha = 0.28): void {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `rgba(30,20,30,${alpha})`);
  g.addColorStop(1, 'rgba(30,20,30,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

export function paintBuilding(v: BuildingVisual): HTMLCanvasElement {
  const size = buildingCanvasSize(v);
  const { canvas, ctx } = createCanvas(size.width * ASSET_SCALE, size.height * ASSET_SCALE);
  ctx.scale(ASSET_SCALE, ASSET_SCALE);
  const rand = seeded(v.width * 31 + v.wallHeight * 7 + v.roofHeight * 3 + v.wall.length);
  const trim = v.trim ?? '#f7f5f0';
  const x0 = BUILDING_MARGIN.side;
  const x1 = x0 + v.width;
  const cx = (x0 + x1) / 2;
  const base = size.baseY;
  const wallTop = base - v.wallHeight;

  groundShadow(ctx, cx, base + 6, v.width / 2 + 26, 18, 0.3);

  // Fassade mit Material, Licht von links und Schatten unter der Dachkante
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, wallTop, v.width, v.wallHeight);
  ctx.clip();
  paintWall(ctx, v.material, v.wall, x0, wallTop, v.width, v.wallHeight, rand);
  const side = ctx.createLinearGradient(x0, 0, x1, 0);
  side.addColorStop(0, 'rgba(255,255,255,0.10)');
  side.addColorStop(0.6, 'rgba(255,255,255,0)');
  side.addColorStop(1, 'rgba(20,10,30,0.10)');
  ctx.fillStyle = side;
  ctx.fillRect(x0, wallTop, v.width, v.wallHeight);
  dropShadow(ctx, x0, wallTop, v.width, v.roof === 'gable' ? 26 : 16, 0.32);
  ctx.restore();
  if (v.material !== 'brick' && v.material !== 'stone') cornerTrim(ctx, v, trim, x0, x1, wallTop, base);
  ctx.strokeStyle = 'rgba(40,30,30,0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x0, wallTop, v.width, v.wallHeight);

  if (v.topBand) {
    const g = ctx.createLinearGradient(0, wallTop, 0, wallTop + 22);
    g.addColorStop(0, shade(v.topBand, 0.12));
    g.addColorStop(1, shade(v.topBand, -0.1));
    ctx.fillStyle = g;
    ctx.fillRect(x0, wallTop, v.width, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x0, wallTop + 1, v.width, 1.5);
    dropShadow(ctx, x0, wallTop + 22, v.width, 8, 0.25);
  }

  // Sockel aus Naturstein
  plinth(ctx, x0 - 3, base - PLINTH_H, v.width + 6, PLINTH_H + 2, rand);

  drawRoof(ctx, v, x0, x1, wallTop, trim, rand);

  // Obergeschoss
  const metrics = buildingMetrics(v);
  const groundFloorTop = base - metrics.groundFloorTop;
  if (v.upperWindows > 0) {
    const winW = Math.min(64, (v.width - 40) / v.upperWindows - 18);
    const gap = (v.width - winW * v.upperWindows) / (v.upperWindows + 1);
    for (let i = 0; i < v.upperWindows; i++) {
      window_(ctx, v, x0 + gap + i * (winW + gap), wallTop + v.wallHeight * 0.1, winW, v.wallHeight * 0.26, 'curtains', { flowerBox: true, shop: false, trim });
    }
    // Gesims zwischen den Etagen
    ctx.fillStyle = trim;
    ctx.fillRect(x0 - 2, groundFloorTop - 5, v.width + 4, 6);
    bevel(ctx, x0 - 2, groundFloorTop - 5, v.width + 4, 6, 1.2, 0.5, 0.25);
    dropShadow(ctx, x0, groundFloorTop + 1, v.width, 7, 0.22);
  }

  // Erdgeschoss: Tür in der Mitte, Fenster links und rechts
  const doorH = metrics.doorHeight;
  const doorW = v.door.width;
  const sideSpace = (v.width - doorW) / 2;
  const winH = v.bigDisplay ? doorH * 0.86 : doorH * 0.6;
  const winW = v.bigDisplay ? sideSpace - 34 : Math.min(84, sideSpace - 40);
  const winY = base - PLINTH_H - doorH + (v.bigDisplay ? doorH * 0.08 : 8);
  for (const s of [-1, 1]) {
    const wx = s < 0 ? x0 + (sideSpace - winW) / 2 : x1 - (sideSpace + winW) / 2;
    window_(ctx, v, wx, winY, winW, winH, v.display, { flowerBox: !v.bigDisplay, shop: !!v.bigDisplay, trim });
  }
  drawDoor(ctx, v, cx, base - PLINTH_H, doorW, doorH, trim);
  if (v.doorSign) {
    const y = base - metrics.doorSignCenter;
    ctx.strokeStyle = '#6d6a66';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 30, y - 17);
    ctx.lineTo(cx, y - 30);
    ctx.lineTo(cx + 30, y - 17);
    ctx.stroke();
    board(ctx, cx - v.doorSign.width / 2, y - 17, v.doorSign.width, 34, '#fbf3e4', '#b98a62');
  }

  if (v.awning) drawAwning(ctx, v.awning, x0 + 6, x1 - 6, base - PLINTH_H - doorH - 30);

  if (v.sign) {
    const s = v.sign;
    const sx = cx - s.width / 2;
    const sy = base - s.fromBase - s.height / 2;
    dropShadow(ctx, sx + 4, sy + s.height, s.width - 4, 7, 0.25);
    roundRectPath(ctx, sx, sy, s.width, s.height, Math.min(12, s.height / 2));
    const g = ctx.createLinearGradient(0, sy, 0, sy + s.height);
    g.addColorStop(0, shade(s.fill, 0.08));
    g.addColorStop(1, shade(s.fill, -0.06));
    fillAndStroke(ctx, g, s.border, 3.5);
    roundRectPath(ctx, sx + 4, sy + 3, s.width - 8, 3, 1.5);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }
  if (v.plate) {
    const p = v.plate;
    board(ctx, cx + p.offsetX - p.width / 2, base - p.fromBase - p.height / 2, p.width, p.height, '#fbf3e4', '#b98a62');
  }
  return canvas;
}

/* ------------------------------------------------------------------ */
/* Materialien                                                         */
/* ------------------------------------------------------------------ */

function paintWall(ctx: CanvasRenderingContext2D, material: WallMaterial, color: string, x: number, y: number, w: number, h: number, rand: Rand): void {
  switch (material) {
    case 'brick':
      return brick(ctx, color, x, y, w, h, rand);
    case 'siding':
      return siding(ctx, color, x, y, w, h, rand);
    case 'stone':
      return stone(ctx, color, x, y, w, h, rand);
    default:
      return plaster(ctx, color, x, y, w, h, rand);
  }
}

/** Klinker im Läuferverband. */
function brick(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number, rand: Rand): void {
  ctx.fillStyle = MORTAR;
  ctx.fillRect(x, y, w, h);
  const bh = 8;
  const bw = 22;
  const joint = 1.4;
  for (let row = 0; y + row * bh < y + h; row++) {
    const by = y + h - (row + 1) * bh;
    const offset = row % 2 === 0 ? 0 : bw / 2;
    for (let bx = x - offset; bx < x + w; bx += bw) {
      ctx.fillStyle = shade(color, (rand() - 0.5) * 0.22);
      ctx.fillRect(bx + joint / 2, by + joint / 2, bw - joint, bh - joint);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(bx + joint / 2, by + joint / 2, bw - joint, 1);
      ctx.fillStyle = 'rgba(40,10,10,0.14)';
      ctx.fillRect(bx + joint / 2, by + bh - joint / 2 - 1, bw - joint, 1);
    }
  }
}

/** Glatter Putz mit feiner Körnung. */
function plaster(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number, rand: Rand): void {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, shade(color, 0.06));
  g.addColorStop(1, shade(color, -0.04));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  const dots = Math.round((w * h) / 90);
  for (let i = 0; i < dots; i++) {
    ctx.fillStyle = rand() < 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(60,40,30,0.07)';
    ctx.fillRect(x + rand() * w, y + rand() * h, 1, 1);
  }
  // leichte Verschmutzung über dem Sockel
  const dirt = ctx.createLinearGradient(0, y + h - 30, 0, y + h);
  dirt.addColorStop(0, 'rgba(90,70,50,0)');
  dirt.addColorStop(1, 'rgba(90,70,50,0.10)');
  ctx.fillStyle = dirt;
  ctx.fillRect(x, y + h - 30, w, 30);
}

/** Waagerechte Holzverkleidung (Stülpschalung). */
function siding(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number, rand: Rand): void {
  const board = 11;
  for (let by = y; by < y + h; by += board) {
    ctx.fillStyle = shade(color, (rand() - 0.5) * 0.05);
    ctx.fillRect(x, by, w, board);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(x, by + 1, w, 1.2);
    ctx.fillStyle = 'rgba(40,30,20,0.2)';
    ctx.fillRect(x, by + board - 2, w, 2);
    // Brettstöße
    for (let k = 0; k < Math.round(w / 140); k++) {
      const jx = x + rand() * w;
      ctx.fillStyle = 'rgba(40,30,20,0.16)';
      ctx.fillRect(jx, by + 1, 1, board - 2);
    }
  }
}

/** Naturstein in unregelmäßigen Lagen. */
function stone(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number, rand: Rand): void {
  ctx.fillStyle = shade(color, -0.18);
  ctx.fillRect(x, y, w, h);
  for (let by = y + h; by > y - 20; ) {
    const rowH = 15 + Math.round(rand() * 5);
    by -= rowH;
    for (let bx = x - rand() * 20; bx < x + w; ) {
      const bw = 24 + rand() * 24;
      ctx.fillStyle = shade(color, (rand() - 0.5) * 0.16);
      roundRectPath(ctx, bx + 1, by + 1, bw - 2, rowH - 2, 2.5);
      ctx.fill();
      bevel(ctx, bx + 1.5, by + 1.5, bw - 3, rowH - 3, 1.2, 0.22, 0.16);
      bx += bw;
    }
  }
}

function plinth(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rand: Rand): void {
  ctx.fillStyle = '#9d978e';
  ctx.fillRect(x, y, w, h);
  for (let bx = x; bx < x + w; ) {
    const bw = Math.min(40 + rand() * 30, x + w - bx);
    ctx.fillStyle = shade('#a8a298', (rand() - 0.5) * 0.12);
    ctx.fillRect(bx + 0.8, y + 0.8, bw - 1.6, h - 1.6);
    bevel(ctx, bx + 0.8, y + 0.8, bw - 1.6, h - 1.6, 1.2, 0.3, 0.2);
    bx += bw;
  }
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(x, y, w, 1.5);
}

/** Helle Eckbretter bzw. Eckputz an Putz- und Holzfassaden. */
function cornerTrim(ctx: CanvasRenderingContext2D, v: BuildingVisual, trim: string, x0: number, x1: number, top: number, base: number): void {
  const w = v.material === 'siding' ? 8 : 10;
  for (const x of [x0, x1 - w]) {
    ctx.fillStyle = trim;
    ctx.fillRect(x, top, w, base - top - PLINTH_H);
    bevel(ctx, x, top, w, base - top - PLINTH_H, 1.2, 0.45, 0.18);
    if (v.material === 'plaster') {
      ctx.fillStyle = 'rgba(60,50,40,0.14)';
      for (let y = top + 18; y < base - PLINTH_H; y += 18) ctx.fillRect(x, y, w, 1);
    }
  }
}

/** Holzschild mit Rahmen und Schrauben. */
function board(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, frame: string): void {
  dropShadow(ctx, x + 3, y + h, w - 3, 6, 0.22);
  roundRectPath(ctx, x, y, w, h, 8);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, shade(fill, 0.3));
  g.addColorStop(1, shade(fill, -0.05));
  fillAndStroke(ctx, g, frame, 3);
  for (const sx of [x + 7, x + w - 7]) {
    ellipsePath(ctx, sx, y + h / 2, 1.8, 1.8);
    ctx.fillStyle = shade(frame, -0.2);
    ctx.fill();
  }
}

/* ------------------------------------------------------------------ */
/* Dach                                                                */
/* ------------------------------------------------------------------ */

function drawRoof(ctx: CanvasRenderingContext2D, v: BuildingVisual, x0: number, x1: number, wallTop: number, trim: string, rand: Rand): void {
  const cx = (x0 + x1) / 2;
  if (v.roof === 'flat') {
    // Attika mit Abdeckung
    const top = wallTop - v.roofHeight;
    const g = ctx.createLinearGradient(0, top, 0, wallTop);
    g.addColorStop(0, shade(v.roofColor, 0.1));
    g.addColorStop(1, shade(v.roofColor, -0.08));
    ctx.fillStyle = g;
    ctx.fillRect(x0 - 6, top, x1 - x0 + 12, v.roofHeight + 4);
    ctx.strokeStyle = 'rgba(40,30,30,0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x0 - 6, top, x1 - x0 + 12, v.roofHeight + 4);
    dropShadow(ctx, x0, wallTop + 4, x1 - x0, 10, 0.3);
    ctx.fillStyle = '#dcd9d4';
    ctx.fillRect(x0 - 10, top - 5, x1 - x0 + 20, 7);
    bevel(ctx, x0 - 10, top - 5, x1 - x0 + 20, 7, 1.2, 0.6, 0.25);
    dropShadow(ctx, x0 - 6, top + 2, x1 - x0 + 12, 6, 0.25);
    if (v.clock) clock(ctx, cx, top - 4);
    return;
  }
  const top = wallTop - v.roofHeight;
  const inset = Math.min(60, v.roofHeight * 0.75);
  const bottom = wallTop + 6;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(x0 - 16, bottom);
    ctx.lineTo(x1 + 16, bottom);
    ctx.lineTo(x1 - inset, top);
    ctx.lineTo(x0 + inset, top);
    ctx.closePath();
  };
  if (v.chimney) chimney(ctx, x1 - inset - 50, top - 26, 26, 50, rand);
  path();
  ctx.fillStyle = shade(v.roofColor, -0.3);
  ctx.fill();
  ctx.save();
  path();
  ctx.clip();
  roofTiles(ctx, v.roofColor, x0 - 20, top, x1 - x0 + 40, bottom - top, rand);
  // Licht von links, Schatten zur rechten Dachseite
  const light = ctx.createLinearGradient(x0, 0, x1, 0);
  light.addColorStop(0, 'rgba(255,255,255,0.14)');
  light.addColorStop(0.5, 'rgba(255,255,255,0)');
  light.addColorStop(1, 'rgba(20,10,20,0.16)');
  ctx.fillStyle = light;
  ctx.fillRect(x0 - 20, top, x1 - x0 + 40, bottom - top);
  ctx.restore();
  // Ortgang (seitliche Dachkanten) und First
  ctx.strokeStyle = shade(v.roofColor, -0.4);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x0 - 16, bottom);
  ctx.lineTo(x0 + inset, top);
  ctx.moveTo(x1 + 16, bottom);
  ctx.lineTo(x1 - inset, top);
  ctx.stroke();
  roundRectPath(ctx, x0 + inset - 4, top - 4, x1 - x0 - inset * 2 + 8, 8, 4);
  const ridge = ctx.createLinearGradient(0, top - 4, 0, top + 4);
  ridge.addColorStop(0, shade(v.roofColor, 0.1));
  ridge.addColorStop(1, shade(v.roofColor, -0.3));
  ctx.fillStyle = ridge;
  ctx.fill();
  // Traufbrett und Dachrinne
  ctx.fillStyle = trim;
  ctx.fillRect(x0 - 20, wallTop + 2, x1 - x0 + 40, 7);
  bevel(ctx, x0 - 20, wallTop + 2, x1 - x0 + 40, 7, 1, 0.5, 0.2);
  const gutter = ctx.createLinearGradient(0, wallTop + 8, 0, wallTop + 13);
  gutter.addColorStop(0, '#c9ccd1');
  gutter.addColorStop(1, '#8a8f97');
  roundRectPath(ctx, x0 - 22, wallTop + 8, x1 - x0 + 44, 5, 2.5);
  ctx.fillStyle = gutter;
  ctx.fill();
  if (v.heartWindow) {
    const wy = top + v.roofHeight * 0.48;
    ellipsePath(ctx, cx, wy, 22, 22);
    fillAndStroke(ctx, trim, 'rgba(40,30,30,0.35)', 1.5);
    ellipsePath(ctx, cx, wy, 17, 17);
    ctx.fillStyle = glassGradient(ctx, wy - 17, wy + 17);
    ctx.fill();
    heartPath(ctx, cx, wy + 1, 20);
    fillAndStroke(ctx, '#ffb3d1', '#e07ca8', 1.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, wy, 13, Math.PI * 1.1, Math.PI * 1.4);
    ctx.stroke();
  }
  if (v.clock) clock(ctx, cx, top + v.roofHeight * 0.5);
}

/** Biberschwanz-Ziegel: von unten nach oben, damit obere Reihen die unteren überlappen. */
function roofTiles(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number, rand: Rand): void {
  const rowH = 12;
  const tileW = 18;
  const rows = Math.ceil(h / rowH) + 1;
  for (let r = rows; r >= 0; r--) {
    const ty = y + r * rowH - 4;
    const offset = r % 2 === 0 ? 0 : tileW / 2;
    for (let tx = x - offset; tx < x + w; tx += tileW) {
      const c = shade(color, (rand() - 0.5) * 0.18 + (r / rows - 0.5) * -0.08);
      ctx.beginPath();
      ctx.moveTo(tx + 0.6, ty);
      ctx.lineTo(tx + tileW - 0.6, ty);
      ctx.lineTo(tx + tileW - 0.6, ty + rowH * 1.05);
      ctx.quadraticCurveTo(tx + tileW / 2, ty + rowH * 1.55, tx + 0.6, ty + rowH * 1.05);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, ty, 0, ty + rowH * 1.4);
      g.addColorStop(0, shade(c, -0.12));
      g.addColorStop(0.5, c);
      g.addColorStop(1, shade(c, 0.1));
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = rgba(shade(color, -0.5), 0.35);
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
  }
}

function chimney(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rand: Rand): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  brick(ctx, '#a4513a', x, y, w, h, rand);
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, 'rgba(255,255,255,0.1)');
  g.addColorStop(1, 'rgba(20,10,10,0.25)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.fillStyle = '#8f8a84';
  ctx.fillRect(x - 3, y - 5, w + 6, 6);
  bevel(ctx, x - 3, y - 5, w + 6, 6, 1, 0.45, 0.25);
}

function clock(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ellipsePath(ctx, x + 1.5, y + 2, 24, 24);
  ctx.fillStyle = 'rgba(30,20,30,0.25)';
  ctx.fill();
  ellipsePath(ctx, x, y, 24, 24);
  const rim = ctx.createLinearGradient(x - 24, y - 24, x + 24, y + 24);
  rim.addColorStop(0, '#f1d58a');
  rim.addColorStop(1, '#a8823a');
  ctx.fillStyle = rim;
  ctx.fill();
  ellipsePath(ctx, x, y, 19, 19);
  fillAndStroke(ctx, '#fffdf6', '#8a6a2e', 1.2);
  ctx.fillStyle = '#4a4040';
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i;
    ctx.fillRect(x + Math.cos(a) * 15 - 1, y + Math.sin(a) * 15 - 1, 2, 2);
  }
  ctx.strokeStyle = '#2f2a2a';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 13);
  ctx.moveTo(x, y);
  ctx.lineTo(x + 9, y + 4);
  ctx.stroke();
}

/* ------------------------------------------------------------------ */
/* Markise                                                             */
/* ------------------------------------------------------------------ */

function drawAwning(ctx: CanvasRenderingContext2D, colors: string[], left: number, right: number, y: number): void {
  const h = 26;
  const stripes = Math.max(8, Math.round((right - left) / 24));
  const w = (right - left) / stripes;
  // Schatten der Markise auf der Fassade
  dropShadow(ctx, left + 4, y + h + 4, right - left - 8, 18, 0.3);
  for (let i = 0; i < stripes; i++) {
    const x = left + i * w;
    const color = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.quadraticCurveTo(x + w / 2, y + h + 9, x, y + h);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + h + 8);
    g.addColorStop(0, shade(color, 0.12));
    g.addColorStop(0.75, color);
    g.addColorStop(1, shade(color, -0.18));
    ctx.fillStyle = g;
    ctx.fill();
  }
  // Falz und Halterung
  ctx.fillStyle = 'rgba(30,20,30,0.18)';
  ctx.fillRect(left, y + h - 7, right - left, 1.5);
  ctx.fillStyle = '#7d8189';
  ctx.fillRect(left - 3, y - 4, right - left + 6, 5);
  bevel(ctx, left - 3, y - 4, right - left + 6, 5, 1, 0.5, 0.25);
  ctx.strokeStyle = '#6d7179';
  ctx.lineWidth = 2;
  for (const ax of [left + 4, right - 4]) {
    ctx.beginPath();
    ctx.moveTo(ax, y + 1);
    ctx.lineTo(ax, y + h + 2);
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ */
/* Tür                                                                 */
/* ------------------------------------------------------------------ */

function drawDoor(ctx: CanvasRenderingContext2D, v: BuildingVisual, cx: number, bottom: number, w: number, h: number, trim: string): void {
  const color = v.door.color;
  const top = bottom - h;
  if (v.door.style === 'arch') {
    const r = w / 2;
    const arch = (pad: number) => {
      ctx.beginPath();
      ctx.moveTo(cx - r - pad, bottom);
      ctx.lineTo(cx - r - pad, top + r);
      ctx.arc(cx, top + r, r + pad, Math.PI, 0);
      ctx.lineTo(cx + r + pad, bottom);
      ctx.closePath();
    };
    // Türgewände aus Stein bzw. in Rahmenfarbe
    arch(7);
    fillAndStroke(ctx, v.material === 'brick' ? STONE : trim, 'rgba(40,30,30,0.35)', 1.5);
    // Laibung (tiefer Schatten)
    arch(1);
    ctx.fillStyle = '#3b3230';
    ctx.fill();
    // Türblatt aus Holz, lackiert
    ctx.save();
    arch(-1.5);
    ctx.clip();
    const wood = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    wood.addColorStop(0, shade(color, 0.12));
    wood.addColorStop(1, shade(color, -0.15));
    ctx.fillStyle = wood;
    ctx.fillRect(cx - r + 2, top + 2, w - 2, h);
    ctx.strokeStyle = rgba(shade(color, -0.4), 0.18);
    ctx.lineWidth = 1;
    for (let gx = cx - r + 6; gx < cx + r; gx += 5) {
      ctx.beginPath();
      ctx.moveTo(gx, top);
      ctx.lineTo(gx + 1, bottom);
      ctx.stroke();
    }
    // Oberlicht im Bogen
    ctx.beginPath();
    ctx.arc(cx, top + r + 2, r - 7, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = glassGradient(ctx, top, top + r);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = shade(color, -0.25);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r + 4, top + r + 2);
    ctx.lineTo(cx + r - 4, top + r + 2);
    for (let i = 1; i < 4; i++) {
      const a = Math.PI + (Math.PI * i) / 4;
      ctx.moveTo(cx, top + r + 2);
      ctx.lineTo(cx + Math.cos(a) * (r - 7), top + r + 2 + Math.sin(a) * (r - 7));
    }
    ctx.stroke();
    // Kassetten
    const panelW = (w - 16) / 2;
    const panelTop = top + r + 8;
    const panelH = (bottom - panelTop - 12) / 2;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const px = cx - r + 6 + col * (panelW + 4);
        const py = panelTop + row * (panelH + 4);
        ctx.fillStyle = shade(color, -0.06);
        ctx.fillRect(px, py, panelW, panelH);
        bevel(ctx, px, py, panelW, panelH, 1.5, 0.12, 0.35);
        bevel(ctx, px + 2.5, py + 2.5, panelW - 5, panelH - 5, 1.2, 0.3, 0.15);
      }
    }
    // Türknauf aus Messing
    ellipsePath(ctx, cx + r - 9, bottom - h * 0.42, 3.6, 3.6);
    const knob = ctx.createRadialGradient(cx + r - 10, bottom - h * 0.42 - 1.5, 0.5, cx + r - 9, bottom - h * 0.42, 4);
    knob.addColorStop(0, '#fff3c4');
    knob.addColorStop(1, '#b08a34');
    ctx.fillStyle = knob;
    ctx.fill();
  } else {
    // Ladentür: Aluminiumrahmen mit Glas
    const double = v.door.style === 'glass';
    ctx.fillStyle = '#3b3230';
    ctx.fillRect(cx - w / 2 - 4, top - 4, w + 8, h + 4);
    roundRectPath(ctx, cx - w / 2 - 3, top - 3, w + 6, h + 3, 2);
    const frame = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    frame.addColorStop(0, shade(color, 0.15));
    frame.addColorStop(1, shade(color, -0.2));
    ctx.fillStyle = frame;
    ctx.fill();
    const panes = double ? 2 : 1;
    const pw = (w - 6 * (panes + 1)) / panes;
    for (let i = 0; i < panes; i++) {
      const px = cx - w / 2 + 6 + i * (pw + 6);
      ctx.fillStyle = '#2f3a44';
      ctx.fillRect(px, top + 4, pw, h - 10);
      ctx.fillStyle = glassGradient(ctx, top + 4, bottom - 6);
      ctx.fillRect(px + 1.5, top + 5.5, pw - 2, h - 12);
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, top + 4, pw, h - 10);
      ctx.clip();
      // Blick in den Laden: warmes Licht, angedeutete Regale
      const inside = ctx.createLinearGradient(0, top, 0, bottom);
      inside.addColorStop(0, 'rgba(255,240,210,0.0)');
      inside.addColorStop(1, 'rgba(255,230,190,0.35)');
      ctx.fillStyle = inside;
      ctx.fillRect(px, top + 4, pw, h - 10);
      reflection(ctx, px, top + 4, pw, h - 10);
      ctx.restore();
      bevel(ctx, px, top + 4, pw, h - 10, 1.5, 0.1, 0.35);
      // Griffstange
      const hx = double ? (i === 0 ? px + pw - 6 : px + 4) : px + pw - 7;
      roundRectPath(ctx, hx, bottom - h * 0.6, 3, 26, 1.5);
      ctx.fillStyle = '#d7dbe0';
      ctx.fill();
    }
  }
  // Stufe und Fußmatte
  ctx.fillStyle = '#b9b3aa';
  ctx.fillRect(cx - w / 2 - 12, bottom, w + 24, 8);
  bevel(ctx, cx - w / 2 - 12, bottom, w + 24, 8, 1.2, 0.45, 0.2);
  roundRectPath(ctx, cx - w / 2 - 4, bottom + 1.5, w + 8, 5, 2);
  ctx.fillStyle = '#8c6a48';
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* Fenster                                                             */
/* ------------------------------------------------------------------ */

function glassGradient(ctx: CanvasRenderingContext2D, top: number, bottom: number): CanvasGradient {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, '#9cc3da');
  g.addColorStop(0.45, '#dcedf6');
  g.addColorStop(1, '#7ea4bd');
  return g;
}

/** Schräge Lichtreflexe auf Glas. */
function reflection(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  for (const [start, width] of [[0.15, 0.22], [0.48, 0.08]] as const) {
    ctx.beginPath();
    ctx.moveTo(x + w * start, y + h);
    ctx.lineTo(x + w * (start + width), y + h);
    ctx.lineTo(x + w * (start + width) + h * 0.6, y);
    ctx.lineTo(x + w * start + h * 0.6, y);
    ctx.closePath();
    ctx.fill();
  }
}

interface WindowOptions {
  flowerBox: boolean;
  /** Schaufenster mit schmalem Metallrahmen */
  shop: boolean;
  trim: string;
}

function window_(ctx: CanvasRenderingContext2D, v: BuildingVisual, x: number, y: number, w: number, h: number, content: DisplayContent, o: WindowOptions): void {
  const frameColor = o.shop ? '#5a5f68' : o.trim;
  // Sturz bzw. Faschen
  if (v.material === 'brick') {
    ctx.fillStyle = shade(v.wall, -0.12);
    ctx.fillRect(x - 5, y - 10, w + 10, 9);
    ctx.fillStyle = MORTAR;
    for (let lx = x - 5; lx < x + w + 5; lx += 5) ctx.fillRect(lx, y - 10, 0.9, 9);
    bevel(ctx, x - 5, y - 10, w + 10, 9, 1, 0.12, 0.2);
  } else if (!o.shop) {
    ctx.fillStyle = o.trim;
    ctx.fillRect(x - 6, y - 6, w + 12, h + 8);
    bevel(ctx, x - 6, y - 6, w + 12, h + 8, 1.2, 0.5, 0.2);
  }
  // Fensteröffnung mit Laibung
  ctx.fillStyle = '#3b3230';
  ctx.fillRect(x, y, w, h);
  const gx = x + 4;
  const gy = y + 4;
  const gw = w - 6;
  const gh = h - 6;
  ctx.fillStyle = glassGradient(ctx, gy, gy + gh);
  ctx.fillRect(gx, gy, gw, gh);
  ctx.save();
  ctx.beginPath();
  ctx.rect(gx, gy, gw, gh);
  ctx.clip();
  drawDisplay(ctx, content, gx, gy, gw, gh);
  reflection(ctx, gx, gy, gw, gh);
  // Schatten der Laibung oben und links
  dropShadow(ctx, gx, gy, gw, 7, 0.4);
  const left = ctx.createLinearGradient(gx, 0, gx + 5, 0);
  left.addColorStop(0, 'rgba(30,20,30,0.3)');
  left.addColorStop(1, 'rgba(30,20,30,0)');
  ctx.fillStyle = left;
  ctx.fillRect(gx, gy, 5, gh);
  ctx.restore();
  // Rahmen und Sprossen
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = o.shop ? 2.5 : 3;
  ctx.strokeRect(gx + 1, gy + 1, gw - 2, gh - 2);
  ctx.beginPath();
  if (o.shop) {
    ctx.moveTo(gx + gw / 2, gy);
    ctx.lineTo(gx + gw / 2, gy + gh);
  } else {
    ctx.moveTo(gx + gw / 2, gy);
    ctx.lineTo(gx + gw / 2, gy + gh);
    ctx.moveTo(gx, gy + gh * 0.38);
    ctx.lineTo(gx + gw, gy + gh * 0.38);
  }
  ctx.stroke();
  // Fensterbank mit Schatten
  ctx.fillStyle = o.shop ? '#8d9199' : STONE;
  ctx.fillRect(x - 6, y + h, w + 12, 5);
  bevel(ctx, x - 6, y + h, w + 12, 5, 1, 0.55, 0.25);
  dropShadow(ctx, x - 4, y + h + 5, w + 8, 6, 0.3);
  if (o.flowerBox) {
    const by = y + h + 4;
    const wood = ctx.createLinearGradient(0, by, 0, by + 11);
    wood.addColorStop(0, '#9a6a48');
    wood.addColorStop(1, '#6e4a32');
    ctx.fillStyle = wood;
    ctx.fillRect(x - 3, by, w + 6, 11);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x - 3, by, w + 6, 1.2);
    for (let i = 0; i < Math.round(w / 10); i++) {
      const lx = x + (i * w) / Math.round(w / 10);
      ctx.fillStyle = i % 2 ? '#4e8a3e' : '#5f9e4a';
      ellipsePath(ctx, lx + 4, by - 1, 5, 4);
      ctx.fill();
    }
    const colors = ['#ff8fb8', '#fff1a8', '#c9a7ef', '#ffffff', '#ff6f6f'];
    const n = Math.max(3, Math.round(w / 18));
    for (let i = 0; i < n; i++) flower(ctx, x + 4 + (i * (w - 8)) / (n - 1), by - 3, 4.5, colors[i % colors.length]);
  }
}

function drawDisplay(ctx: CanvasRenderingContext2D, content: DisplayContent, x: number, y: number, w: number, h: number): void {
  const bottom = y + h;
  switch (content) {
    case 'curtains': {
      for (const side of [0, 1]) {
        const sx = side === 0 ? x : x + w;
        const dir = side === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(sx, y);
        ctx.lineTo(sx + dir * w * 0.3, y);
        ctx.quadraticCurveTo(sx + dir * w * 0.1, y + h * 0.5, sx + dir * w * 0.2, bottom);
        ctx.lineTo(sx, bottom);
        ctx.closePath();
        const g = ctx.createLinearGradient(sx, 0, sx + dir * w * 0.3, 0);
        g.addColorStop(0, '#f7d2df');
        g.addColorStop(1, '#e8a9c0');
        ctx.fillStyle = g;
        ctx.fill();
      }
      break;
    }
    case 'dresses': {
      const colors = ['#ff8fc2', '#8fb8ff', '#ffd36e', '#b9a2f5'];
      const n = Math.max(2, Math.floor(w / 34));
      for (let i = 0; i < n; i++) {
        const dx = x + ((i + 0.5) * w) / n;
        const top = y + h * 0.2;
        ctx.strokeStyle = '#9a8fb8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dx, top - 8);
        ctx.lineTo(dx, top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dx - 7, top);
        ctx.lineTo(dx + 7, top);
        ctx.lineTo(dx + 15, top + h * 0.5);
        ctx.lineTo(dx - 15, top + h * 0.5);
        ctx.closePath();
        fillAndStroke(ctx, colors[i % colors.length], shade(colors[i % colors.length], -0.25), 1.5);
      }
      break;
    }
    case 'toys': {
      const cx = x + w * 0.3;
      const cy = bottom - h * 0.35;
      for (const [ex, ey] of [[-9, -10], [9, -10]] as const) {
        ellipsePath(ctx, cx + ex, cy + ey, 6, 6);
        fillAndStroke(ctx, '#c99a6b', '#9a6e4a', 1.5);
      }
      ellipsePath(ctx, cx, cy, 13, 12);
      fillAndStroke(ctx, '#d9aa7b', '#9a6e4a', 1.5);
      ellipsePath(ctx, x + w * 0.72, bottom - h * 0.22, 11, 11);
      fillAndStroke(ctx, '#ff8fb8', '#d9608d', 1.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + w * 0.72 - 11, bottom - h * 0.22 - 2, 22, 4);
      const blocks = ['#8fdccf', '#ffd36e', '#b9a2f5'];
      blocks.forEach((c, i) => {
        roundRectPath(ctx, x + w * 0.55 + i * 9, y + h * 0.18 + (i % 2) * 6, 12, 12, 2);
        fillAndStroke(ctx, c, shade(c, -0.25), 1.2);
      });
      starPath(ctx, x + w * 0.15, y + h * 0.22, 7);
      fillAndStroke(ctx, '#fff1a8', '#e0b84e', 1.2);
      break;
    }
    case 'groceries': {
      const colors = ['#ff6f6f', '#ffd36e', '#8fdc8f', '#ffa86f', '#c9a7ef', '#8fc4ff'];
      for (let shelf = 0; shelf < 3; shelf++) {
        const sy = y + h * (0.32 + shelf * 0.3);
        ctx.fillStyle = 'rgba(150, 140, 180, 0.5)';
        ctx.fillRect(x, sy, w, 3);
        for (let i = 0; i < Math.floor(w / 12); i++) {
          roundRectPath(ctx, x + 3 + i * 12, sy - 12, 9, 12, 2);
          ctx.fillStyle = colors[(i + shelf * 2) % colors.length];
          ctx.fill();
        }
      }
      break;
    }
    case 'cups': {
      ctx.fillStyle = 'rgba(200, 150, 110, 0.5)';
      ctx.fillRect(x, bottom - h * 0.35, w, 3);
      for (let i = 0; i < 3; i++) {
        const cx = x + ((i + 0.5) * w) / 3;
        const cy = bottom - h * 0.35 - 9;
        roundRectPath(ctx, cx - 7, cy - 5, 14, 14, [2, 2, 6, 6]);
        fillAndStroke(ctx, ['#ffffff', '#ffd6e8', '#d6f5ea'][i], '#c39272', 1.5);
        ctx.strokeStyle = 'rgba(200, 160, 130, 0.6)';
        ctx.beginPath();
        ctx.moveTo(cx - 2, cy - 9);
        ctx.quadraticCurveTo(cx + 2, cy - 14, cx - 1, cy - 19);
        ctx.stroke();
      }
      ellipsePath(ctx, x + w * 0.5, y + h * 0.28, 9, 9);
      fillAndStroke(ctx, '#f6c9a0', '#c39272', 1.5);
      break;
    }
    case 'mirrors': {
      for (let i = 0; i < 2; i++) {
        const cx = x + ((i + 0.5) * w) / 2;
        ellipsePath(ctx, cx, y + h * 0.42, w * 0.16, h * 0.28);
        fillAndStroke(ctx, '#f4fbff', '#c9a7ef', 2);
      }
      ctx.strokeStyle = '#8a6ccc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + w * 0.5 - 4, bottom - 10, 3.5, 0, Math.PI * 2);
      ctx.arc(x + w * 0.5 + 4, bottom - 10, 3.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }
}
