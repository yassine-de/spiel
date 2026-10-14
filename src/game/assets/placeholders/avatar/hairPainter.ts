/**
 * PLATZHALTER-Avatar: Frisuren (8 Stile × 3 Ansichten), Haarschmuck und Hüte.
 * Haare glänzen (Verlauf + Lichtband); Konturen sind nur zart angedeutet.
 */
import type { HairStyle } from '../../../avatar/avatarTypes';
import { createCanvas, ellipsePath, fillAndStroke, heartPath, rgba, roundRectPath, shade } from '../canvasUtils';
import { ear, showsEars } from './bodyPainter';
import { FRAME_H, FRAME_W, type Frame } from './frame';

const OUTLINE = 2.2;

/** Glänzende Haarfüllung: oben heller, unten dunkler. */
function hairGradient(l: CanvasRenderingContext2D, f: Frame, base: string): CanvasGradient {
  const g = l.createLinearGradient(0, f.headY - 52, 0, f.shoulderY + 34);
  g.addColorStop(0, shade(base, 0.14));
  g.addColorStop(0.45, base);
  g.addColorStop(1, shade(base, -0.22));
  return g;
}

function hairEdge(f: Frame): string {
  return rgba(shade(f.look.hair, -0.45), 0.6);
}

function glossFill(l: CanvasRenderingContext2D, f: Frame, base = f.look.hair): void {
  fillAndStroke(l, hairGradient(l, f, base), hairEdge(f), OUTLINE);
}

function hairFill(f: Frame): void {
  glossFill(f.ctx, f);
}

function backHairFill(f: Frame): void {
  glossFill(f.ctx, f, shade(f.look.hair, -0.1));
}

function tie(f: Frame, x: number, y: number): void {
  ellipsePath(f.ctx, x, y, 5.5, 5.5);
  fillAndStroke(f.ctx, '#ff7eb6', '#d9558f', 2.5);
}

/** Zopf/Pferdeschwanz als Tropfenform, hängt von (x, y) in Richtung `dir`. */
function tail(f: Frame, x: number, y: number, dir: number, length: number, width = 26): void {
  const { ctx } = f;
  ctx.beginPath();
  ctx.moveTo(x - dir * 4, y - 6);
  ctx.quadraticCurveTo(x + dir * (width + 6), y + length * 0.25, x + dir * (width * 0.55), y + length);
  ctx.quadraticCurveTo(x + dir * 2, y + length * 0.85, x - dir * 4, y + 8);
  ctx.closePath();
  backHairFill(f);
  ctx.strokeStyle = rgba(shade(f.look.hair, -0.3), 0.5);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + dir * 6, y + 6);
  ctx.quadraticCurveTo(x + dir * (width * 0.7), y + length * 0.4, x + dir * (width * 0.5), y + length - 8);
  ctx.stroke();
}

function bun(f: Frame, x: number, y: number): void {
  const { ctx } = f;
  ellipsePath(ctx, x, y, 19, 18);
  hairFill(f);
  ctx.strokeStyle = rgba(shade(f.look.hair, -0.3), 0.5);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(x + 1, y + 1, 9, Math.PI * 0.2, Math.PI * 1.6);
  ctx.stroke();
}

const CURLS_FRONT: [number, number, number][] = [
  [-48, -6, 18], [48, -6, 18], [-52, 16, 17], [52, 16, 17], [-48, 38, 16], [48, 38, 16], [-36, 56, 14], [36, 56, 14],
];
const CURLS_SIDE: [number, number, number][] = [
  [26, -34, 18], [42, -12, 18], [48, 12, 17], [44, 36, 16], [32, 56, 14], [12, 60, 12],
];

function curls(f: Frame, list: [number, number, number][], dark = true): void {
  const { ctx, cx, headY } = f;
  for (const [dx, dy, r] of list) {
    ellipsePath(ctx, cx + dx, headY + dy, r, r);
    if (dark) backHairFill(f);
    else hairFill(f);
  }
}

/* ------------------------------------------------------------------ */
/* Haare hinter dem Körper (erste Ebene)                               */
/* ------------------------------------------------------------------ */

export function drawHairBack(f: Frame): void {
  if (f.view === 'back') return;
  const { ctx, cx, headY, shoulderY } = f;
  const side = f.view === 'side';
  const style = f.look.config.hairStyle;
  switch (style) {
    case 'long':
      if (side) roundRectPath(ctx, cx - 22, headY - 24, 72, shoulderY + 22 - (headY - 24), 30);
      else roundRectPath(ctx, cx - 48, headY - 24, 96, shoulderY + 24 - (headY - 24), 34);
      backHairFill(f);
      break;
    case 'bob':
      if (side) roundRectPath(ctx, cx - 20, headY - 22, 72, 70, [30, 30, 20, 20]);
      else roundRectPath(ctx, cx - 53, headY - 22, 106, 72, [36, 36, 22, 22]);
      backHairFill(f);
      break;
    case 'pigtails':
      if (side) tail(f, cx + 40, headY + 14, 1, 58);
      else {
        tail(f, cx - 46, headY + 16, -1, 58);
        tail(f, cx + 46, headY + 16, 1, 58);
      }
      break;
    case 'ponytail':
      if (side) tail(f, cx + 40, headY - 26, 1, 86, 32);
      else tail(f, cx + 34, headY - 30, 1, 70, 24);
      break;
    case 'buns':
      if (side) bun(f, cx + 22, headY - 42);
      else {
        bun(f, cx - 36, headY - 38);
        bun(f, cx + 36, headY - 38);
      }
      break;
    case 'curly':
      curls(f, side ? CURLS_SIDE : CURLS_FRONT);
      break;
    default:
      break;
  }
}

/* ------------------------------------------------------------------ */
/* Haare über dem Kopf                                                 */
/* ------------------------------------------------------------------ */

type Cut = 'bangs' | 'center' | 'side' | 'spiky';

const CUT_BY_STYLE: Record<HairStyle, Cut> = {
  long: 'bangs',
  bob: 'bangs',
  pigtails: 'center',
  ponytail: 'side',
  buns: 'bangs',
  curly: 'bangs',
  short: 'side',
  spiky: 'spiky',
};

function capShape(style: HairStyle): { dy: number; rx: number; ry: number } {
  if (style === 'short' || style === 'spiky') return { dy: -10, rx: 49, ry: 40 };
  if (style === 'ponytail') return { dy: -8, rx: 50, ry: 43 };
  return { dy: -6, rx: 51, ry: 45 };
}

/** Schneidet das Gesichtsfenster (Vorderansicht) aus der Haar-Ebene. */
function cutFrontWindow(l: CanvasRenderingContext2D, cut: Cut, cx: number, y: number): void {
  l.globalCompositeOperation = 'destination-out';
  l.beginPath();
  l.moveTo(cx - 38, y + 90);
  switch (cut) {
    case 'center':
      l.lineTo(cx - 38, y + 4);
      l.quadraticCurveTo(cx - 30, y - 18, cx - 2, y - 22);
      l.lineTo(cx + 2, y - 22);
      l.quadraticCurveTo(cx + 30, y - 18, cx + 38, y + 4);
      break;
    case 'side':
      l.lineTo(cx - 38, y - 16);
      l.quadraticCurveTo(cx + 6, y - 24, cx + 38, y - 2);
      break;
    case 'spiky':
      l.lineTo(cx - 38, y - 4);
      for (let i = 1; i <= 8; i++) l.lineTo(cx - 38 + i * 9.5, i % 2 === 0 ? y - 4 : y - 16);
      break;
    default:
      l.lineTo(cx - 38, y - 2);
      l.quadraticCurveTo(cx - 32, y - 18, cx - 19, y - 7);
      l.quadraticCurveTo(cx - 10, y - 21, cx + 2, y - 8);
      l.quadraticCurveTo(cx + 14, y - 21, cx + 24, y - 7);
      l.quadraticCurveTo(cx + 34, y - 17, cx + 38, y - 2);
  }
  l.lineTo(cx + 38, y + 90);
  l.closePath();
  l.fill();
  l.globalCompositeOperation = 'source-over';
}

/** Schneidet das Gesichtsfenster (Seitenansicht) mit weicher Haarlinie vor dem Ohr. */
function cutSideWindow(l: CanvasRenderingContext2D, cx: number, y: number, short: boolean): void {
  l.globalCompositeOperation = 'destination-out';
  l.beginPath();
  l.moveTo(cx - 60, y + 90);
  l.lineTo(cx - 60, y - 2);
  l.quadraticCurveTo(cx - 48, y - 16, cx - 36, y - 6);
  l.quadraticCurveTo(cx - 24, y - 20, cx - 12, y - 6);
  if (short) {
    l.quadraticCurveTo(cx + 2, y + 2, cx + 6, y + 30);
    l.lineTo(cx + 10, y + 90);
  } else {
    l.quadraticCurveTo(cx - 2, y + 4, cx - 2, y + 22);
    l.quadraticCurveTo(cx - 2, y + 38, cx + 6, y + 46);
    l.lineTo(cx + 6, y + 90);
  }
  l.closePath();
  l.fill();
  l.globalCompositeOperation = 'source-over';
}

function spikes(l: CanvasRenderingContext2D, f: Frame, cx: number, top: number): void {
  for (let i = -2; i <= 2; i++) {
    l.beginPath();
    l.moveTo(cx + i * 18 - 11, top + 10);
    l.lineTo(cx + i * 21, top - 12 + Math.abs(i) * 4);
    l.lineTo(cx + i * 18 + 11, top + 10);
    l.closePath();
    glossFill(l, f);
  }
}

function curlyBumps(l: CanvasRenderingContext2D, f: Frame, cx: number, cy: number): void {
  for (let i = 0; i <= 6; i++) {
    const angle = Math.PI + (Math.PI * i) / 6;
    ellipsePath(l, cx + Math.cos(angle) * 44, cy + Math.sin(angle) * 40, 14, 14);
    glossFill(l, f);
  }
}

/** Glanzband auf dem Oberkopf (wie bei glatten, glänzenden Haaren). */
function shine(l: CanvasRenderingContext2D, cx: number, cy: number): void {
  l.lineCap = 'round';
  l.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  l.lineWidth = 9;
  l.beginPath();
  l.ellipse(cx, cy + 2, 36, 30, 0, Math.PI * 1.12, Math.PI * 1.62);
  l.stroke();
  l.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  l.lineWidth = 3;
  l.beginPath();
  l.ellipse(cx, cy + 2, 36, 30, 0, Math.PI * 1.18, Math.PI * 1.42);
  l.stroke();
}

function drawCap(f: Frame): void {
  const { cx, headY, view } = f;
  const style = f.look.config.hairStyle;
  const shape = capShape(style);
  const capX = view === 'side' ? cx + 2 : cx;
  const capY = headY + shape.dy;
  const { canvas, ctx: l } = createCanvas(FRAME_W, FRAME_H);
  if (style === 'curly') curlyBumps(l, f, capX, capY);
  if (style === 'spiky') spikes(l, f, capX, capY - shape.ry);
  ellipsePath(l, capX, capY, shape.rx, shape.ry);
  glossFill(l, f);
  if (style === 'spiky') {
    // Innenkonturen der Strähnen überdecken
    ellipsePath(l, capX, capY, shape.rx - 2, shape.ry - 2);
    l.fillStyle = hairGradient(l, f, f.look.hair);
    l.fill();
  }
  shine(l, capX, capY);
  if (view === 'front') cutFrontWindow(l, CUT_BY_STYLE[style], cx, headY);
  if (view === 'side') cutSideWindow(l, cx, headY, style === 'short' || style === 'spiky');
  f.ctx.drawImage(canvas, 0, 0);
  if (view === 'front' && CUT_BY_STYLE[style] === 'center') {
    f.ctx.strokeStyle = hairEdge(f);
    f.ctx.lineWidth = 2.5;
    f.ctx.beginPath();
    f.ctx.moveTo(cx, headY - 22);
    f.ctx.lineTo(cx, headY - 44);
    f.ctx.stroke();
  }
}

/** Rückansicht: Haare liegen über Kopf und Rücken. */
function drawBackView(f: Frame): void {
  const { ctx, cx, headY, shoulderY } = f;
  const style = f.look.config.hairStyle;
  const strands = (from: number, to: number) => {
    ctx.strokeStyle = rgba(shade(f.look.hair, -0.3), 0.45);
    ctx.lineWidth = 2.5;
    for (const offset of [-22, 0, 22]) {
      ctx.beginPath();
      ctx.moveTo(cx + offset * 0.6, headY - 30);
      ctx.quadraticCurveTo(cx + offset * 1.1, (from + to) / 2, cx + offset, to);
      ctx.stroke();
    }
  };
  if (style === 'curly') curls(f, CURLS_FRONT, false);
  if (style === 'long') {
    roundRectPath(ctx, cx - 48, headY - 12, 96, shoulderY + 26 - (headY - 12), 34);
    hairFill(f);
  }
  if (style === 'bob') {
    roundRectPath(ctx, cx - 53, headY - 14, 106, 64, [30, 30, 22, 22]);
    hairFill(f);
  }
  const shape = capShape(style);
  if (style === 'spiky') spikes(ctx, f, cx, headY + shape.dy - shape.ry);
  if (style === 'curly') curlyBumps(ctx, f, cx, headY + shape.dy);
  ellipsePath(ctx, cx, headY + shape.dy, shape.rx, shape.ry);
  hairFill(f);
  if (style === 'long') {
    roundRectPath(ctx, cx - 46, headY - 4, 92, shoulderY + 22 - (headY - 4), 32);
    ctx.fillStyle = hairGradient(ctx, f, f.look.hair);
    ctx.fill();
    strands(headY, shoulderY + 16);
  }
  if (style === 'bob') {
    roundRectPath(ctx, cx - 50, headY - 4, 100, 50, [28, 28, 20, 20]);
    ctx.fillStyle = hairGradient(ctx, f, f.look.hair);
    ctx.fill();
    strands(headY, headY + 42);
  }
  if (style === 'pigtails') {
    tail(f, cx - 44, headY + 16, -1, 58);
    tail(f, cx + 44, headY + 16, 1, 58);
    tie(f, cx - 44, headY + 16);
    tie(f, cx + 44, headY + 16);
  }
  if (style === 'ponytail') {
    ctx.beginPath();
    ctx.moveTo(cx - 10, headY - 24);
    ctx.quadraticCurveTo(cx - 24, headY + 30, cx, shoulderY + 16);
    ctx.quadraticCurveTo(cx + 24, headY + 30, cx + 10, headY - 24);
    ctx.closePath();
    hairFill(f);
    tie(f, cx, headY - 24);
  }
  if (style === 'buns') {
    bun(f, cx - 36, headY - 38);
    bun(f, cx + 36, headY - 38);
  }
  shine(ctx, cx, headY + shape.dy);
}

export function drawHairFront(f: Frame): void {
  if (f.view === 'back') {
    drawBackView(f);
    return;
  }
  drawCap(f);
  const { cx, headY } = f;
  const style = f.look.config.hairStyle;
  if (f.view === 'side' && showsEars(f)) ear(f.ctx, cx + 6, headY + 14, f.look.skin);
  if (style === 'pigtails') {
    if (f.view === 'side') tie(f, cx + 40, headY + 14);
    else {
      tie(f, cx - 46, headY + 16);
      tie(f, cx + 46, headY + 16);
    }
  }
  if (style === 'ponytail' && f.view === 'side') tie(f, cx + 40, headY - 26);
}

/* ------------------------------------------------------------------ */
/* Haarschmuck                                                         */
/* ------------------------------------------------------------------ */

function bow(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  const stroke = shade(color, -0.3);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + side * 20, y - 18, x + side * 20, y);
    ctx.quadraticCurveTo(x + side * 20, y + 16, x, y);
    ctx.closePath();
    fillAndStroke(ctx, color, stroke, 3);
  }
  ellipsePath(ctx, x, y, 6, 6);
  fillAndStroke(ctx, shade(color, 0.2), stroke, 3);
}

export function drawHairAccessory(f: Frame): void {
  const item = f.look.hairAccessory;
  if (!item) return;
  const { ctx, cx, headY } = f;
  if (item.variant === 'bow') {
    const x = f.view === 'front' ? cx + 34 : f.view === 'side' ? cx + 28 : cx - 34;
    bow(ctx, x, headY - 36, item.color);
    return;
  }
  // Haarband
  ctx.lineCap = 'round';
  const stroke = (draw: () => void) => {
    ctx.strokeStyle = shade(item.color, -0.3);
    ctx.lineWidth = 11;
    draw();
    ctx.stroke();
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 7;
    draw();
    ctx.stroke();
  };
  if (f.view === 'side') {
    stroke(() => {
      ctx.beginPath();
      ctx.moveTo(cx - 16, headY - 46);
      ctx.quadraticCurveTo(cx + 16, headY - 42, cx + 18, headY + 4);
    });
  } else {
    stroke(() => {
      ctx.beginPath();
      ctx.ellipse(cx, headY - 4, 50, 44, 0, Math.PI * 1.12, Math.PI * 1.88);
    });
  }
  if (f.view === 'front') {
    heartPath(ctx, cx - 24, headY - 41, 15);
    fillAndStroke(ctx, shade(item.color, 0.35), shade(item.color, -0.3), 2.5);
  }
}

/* ------------------------------------------------------------------ */
/* Hüte                                                                */
/* ------------------------------------------------------------------ */

function dome(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, Math.PI, Math.PI * 2);
  ctx.closePath();
}

export function drawHat(f: Frame): void {
  const item = f.look.hat;
  if (!item) return;
  const { ctx, cx, headY } = f;
  const side = f.view === 'side';
  const x = side ? cx + 2 : cx;
  const color = item.color;
  const stroke = shade(color, -0.32);

  if (item.variant === 'sunhat') {
    ellipsePath(ctx, x, headY - 28, side ? 62 : 64, side ? 11 : 14);
    fillAndStroke(ctx, color, stroke, OUTLINE);
    dome(ctx, x + (side ? 2 : 0), headY - 30, side ? 40 : 44, 32);
    fillAndStroke(ctx, shade(color, 0.08), stroke, OUTLINE);
    ctx.strokeStyle = '#ff8fc2';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x - (side ? 38 : 42), headY - 36);
    ctx.quadraticCurveTo(x, headY - 30, x + (side ? 42 : 42), headY - 36);
    ctx.stroke();
    if (!side) {
      heartPath(ctx, x + 26, headY - 38, 14);
      fillAndStroke(ctx, '#ffffff', '#ff8fc2', 2);
    }
    return;
  }

  if (item.variant === 'cap') {
    dome(ctx, x, headY - 24, side ? 49 : 50, 36);
    fillAndStroke(ctx, color, stroke, OUTLINE);
    ctx.strokeStyle = shade(color, -0.15);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, headY - 60);
    ctx.lineTo(x, headY - 26);
    ctx.stroke();
    ellipsePath(ctx, x, headY - 60, 4, 3);
    fillAndStroke(ctx, shade(color, -0.1), stroke, 2);
    if (f.view === 'front') {
      ellipsePath(ctx, x, headY - 22, 42, 10);
      fillAndStroke(ctx, shade(color, -0.12), stroke, OUTLINE);
    } else if (side) {
      ellipsePath(ctx, x - 46, headY - 25, 26, 7);
      fillAndStroke(ctx, shade(color, -0.12), stroke, OUTLINE);
    }
    return;
  }

  // Mütze mit Bommel
  dome(ctx, x, headY - 22, side ? 51 : 53, 46);
  fillAndStroke(ctx, color, stroke, OUTLINE);
  roundRectPath(ctx, x - (side ? 52 : 54), headY - 32, side ? 104 : 108, 18, 9);
  fillAndStroke(ctx, shade(color, -0.1), stroke, 3);
  ctx.strokeStyle = shade(color, -0.25);
  ctx.lineWidth = 2;
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 11, headY - 29);
    ctx.lineTo(x + i * 11, headY - 17);
    ctx.stroke();
  }
  ellipsePath(ctx, x + (side ? 6 : 0), headY - 64, 12, 12);
  fillAndStroke(ctx, shade(color, 0.45), stroke, 3);
}
