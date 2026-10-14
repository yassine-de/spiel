/**
 * PLATZHALTER: Stadt-Objekte (Teich, Spielplatz, Zäune, Autos …).
 * Gezeichnet in Welt-Einheiten auf einer @2x-Leinwand.
 */
import { ASSET_SCALE } from '../../config/constants';
import { seededRandom } from '../../utils/math';
import { createCanvas, ellipsePath, fillAndStroke, flower, groundShadow, heartPath, roundRectPath, shade } from './canvasUtils';

/** Leinwand in Welt-Einheiten (intern @2x). */
export function unitCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const result = createCanvas(width * ASSET_SCALE, height * ASSET_SCALE);
  result.ctx.scale(ASSET_SCALE, ASSET_SCALE);
  return result;
}

export function paintPond(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(300, 170);
  ellipsePath(ctx, 150, 92, 140, 66);
  fillAndStroke(ctx, '#c9e8b8', '#9fcf8f', 3);
  ellipsePath(ctx, 150, 90, 124, 54);
  const water = ctx.createRadialGradient(120, 75, 10, 150, 90, 130);
  water.addColorStop(0, '#d8f4ff');
  water.addColorStop(1, '#8fcfee');
  fillAndStroke(ctx, water, '#6fb5d8', 3);
  // Seerosen
  for (const [x, y, r] of [[96, 98, 14], [196, 76, 12], [170, 116, 10]] as const) {
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, 0, 0.3, Math.PI * 2 - 0.2);
    ctx.lineTo(x, y);
    ctx.closePath();
    fillAndStroke(ctx, '#7fcf86', '#5aa866', 1.5);
  }
  flower(ctx, 100, 94, 5, '#ffc4de');
  // Steine am Rand
  for (const [x, y] of [[34, 104], [262, 82], [210, 146], [70, 140]] as const) {
    ellipsePath(ctx, x, y, 12, 8);
    fillAndStroke(ctx, '#e6e0f0', '#b9acd4', 1.5);
  }
  return canvas;
}

/** Glanzlicht für den Teich (wird animiert). */
export function paintWaterShine(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(120, 40);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 3;
  for (const [x, y, rx] of [[40, 16, 26], [84, 26, 18]] as const) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, 6, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
  return canvas;
}

export function paintPlayground(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(260, 190);
  groundShadow(ctx, 130, 170, 120, 16, 0.2);
  // Sandkasten-Fläche
  ellipsePath(ctx, 130, 160, 118, 26);
  fillAndStroke(ctx, '#f6e2b8', '#e2c48e', 2);
  // Schaukel
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#ff8fb8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(20, 166);
  ctx.lineTo(40, 40);
  ctx.lineTo(60, 166);
  ctx.moveTo(120, 166);
  ctx.lineTo(100, 40);
  ctx.lineTo(80, 166);
  ctx.stroke();
  ctx.strokeStyle = '#d9608d';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(34, 40);
  ctx.lineTo(106, 40);
  ctx.stroke();
  ctx.strokeStyle = '#9b8fc9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 42);
  ctx.lineTo(60, 116);
  ctx.moveTo(80, 42);
  ctx.lineTo(80, 116);
  ctx.stroke();
  roundRectPath(ctx, 54, 114, 32, 8, 3);
  fillAndStroke(ctx, '#8fdccf', '#5fb3a6', 2);
  // Rutsche
  roundRectPath(ctx, 196, 70, 10, 100, 4);
  fillAndStroke(ctx, '#b9a2f5', '#8a6ccc', 2);
  roundRectPath(ctx, 230, 70, 10, 100, 4);
  fillAndStroke(ctx, '#b9a2f5', '#8a6ccc', 2);
  for (let y = 86; y < 166; y += 18) {
    ctx.fillStyle = '#8a6ccc';
    ctx.fillRect(204, y, 28, 4);
  }
  roundRectPath(ctx, 190, 62, 56, 14, 5);
  fillAndStroke(ctx, '#ffd36e', '#e0b84e', 2);
  ctx.beginPath();
  ctx.moveTo(196, 70);
  ctx.quadraticCurveTo(150, 90, 136, 160);
  ctx.lineTo(156, 162);
  ctx.quadraticCurveTo(168, 100, 206, 80);
  ctx.closePath();
  fillAndStroke(ctx, '#ffb3d1', '#e07ca8', 2.5);
  return canvas;
}

export function paintFence(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(130, 56);
  groundShadow(ctx, 65, 50, 62, 5, 0.15);
  for (let x = 6; x < 128; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 50);
    ctx.lineTo(x, 14);
    ctx.lineTo(x + 6, 6);
    ctx.lineTo(x + 12, 14);
    ctx.lineTo(x + 12, 50);
    ctx.closePath();
    fillAndStroke(ctx, '#ffffff', '#d6c7e6', 2);
  }
  for (const y of [22, 40]) {
    roundRectPath(ctx, 2, y, 126, 6, 3);
    fillAndStroke(ctx, '#fdfaff', '#d6c7e6', 1.5);
  }
  return canvas;
}

export function paintHedge(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(196, 70);
  groundShadow(ctx, 98, 60, 96, 9, 0.2);
  roundRectPath(ctx, 6, 18, 184, 44, 20);
  fillAndStroke(ctx, '#86d08f', '#5aa866', 3);
  const rand = seededRandom(5);
  for (let i = 0; i < 9; i++) {
    ellipsePath(ctx, 20 + i * 20, 22 + rand() * 6, 14, 12);
    ctx.fillStyle = '#9adba0';
    ctx.fill();
  }
  for (let i = 0; i < 4; i++) flower(ctx, 30 + i * 44 + rand() * 10, 34 + rand() * 12, 4.5, ['#ffffff', '#ffc4de'][i % 2]);
  return canvas;
}

export function paintMailbox(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(40, 76);
  groundShadow(ctx, 20, 70, 14, 4, 0.2);
  roundRectPath(ctx, 17, 34, 6, 38, 2);
  fillAndStroke(ctx, '#b98563', '#8a6248', 1.5);
  roundRectPath(ctx, 4, 10, 32, 28, [14, 14, 4, 4]);
  fillAndStroke(ctx, '#ff8fb8', '#d9608d', 2);
  heartPath(ctx, 20, 24, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  return canvas;
}

export function paintCafeTable(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(110, 130);
  groundShadow(ctx, 55, 120, 46, 8, 0.2);
  // Stühle
  for (const x of [16, 94]) {
    roundRectPath(ctx, x - 9, 88, 18, 30, 5);
    fillAndStroke(ctx, '#c9a7ef', '#8a6ccc', 1.5);
  }
  // Tisch
  roundRectPath(ctx, 52, 86, 6, 32, 2);
  fillAndStroke(ctx, '#9b8fc9', '#6b5aa0', 1.5);
  ellipsePath(ctx, 55, 86, 26, 7);
  fillAndStroke(ctx, '#ffffff', '#c9a7ef', 2);
  // Schirm
  roundRectPath(ctx, 53, 24, 4, 64, 2);
  fillAndStroke(ctx, '#ffffff', '#c9a7ef', 1);
  ctx.beginPath();
  ctx.moveTo(8, 34);
  ctx.quadraticCurveTo(55, -6, 102, 34);
  ctx.closePath();
  fillAndStroke(ctx, '#8fdccf', '#5fb3a6', 2);
  ctx.fillStyle = '#ffffff';
  for (const [a, b] of [[30, 44], [66, 80]] as const) {
    ctx.beginPath();
    ctx.moveTo(55, 10);
    ctx.lineTo(a, 33);
    ctx.lineTo(b, 33);
    ctx.closePath();
    ctx.fill();
  }
  // Tasse
  roundRectPath(ctx, 48, 76, 10, 8, 2);
  fillAndStroke(ctx, '#ffd6e8', '#e07ca8', 1);
  return canvas;
}

export function paintCarts(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(120, 80);
  groundShadow(ctx, 60, 72, 54, 6, 0.18);
  for (let i = 2; i >= 0; i--) {
    const x = 10 + i * 22;
    ctx.strokeStyle = '#9aa3bd';
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, 28, 56, 32, 4);
    ctx.fillStyle = 'rgba(220, 225, 240, 0.85)';
    ctx.fill();
    ctx.stroke();
    for (let gx = x + 8; gx < x + 56; gx += 8) {
      ctx.beginPath();
      ctx.moveTo(gx, 30);
      ctx.lineTo(gx, 58);
      ctx.stroke();
    }
    ctx.strokeStyle = '#ff6f8f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 56, 28);
    ctx.lineTo(x + 66, 18);
    ctx.stroke();
    for (const wx of [x + 8, x + 48]) {
      ellipsePath(ctx, wx, 66, 4, 4);
      fillAndStroke(ctx, '#6b6f86', '#4a4e60', 1);
    }
  }
  return canvas;
}

export function paintFlagpole(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(30, 200);
  groundShadow(ctx, 15, 194, 12, 4, 0.2);
  roundRectPath(ctx, 12, 10, 6, 186, 3);
  fillAndStroke(ctx, '#e6e0f0', '#9c8fbf', 1.5);
  ellipsePath(ctx, 15, 9, 6, 6);
  fillAndStroke(ctx, '#ffe08a', '#d9b04e', 1.5);
  return canvas;
}

export function paintFlag(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(80, 52);
  ctx.beginPath();
  ctx.moveTo(2, 4);
  ctx.quadraticCurveTo(40, -4, 76, 6);
  ctx.lineTo(76, 44);
  ctx.quadraticCurveTo(40, 36, 2, 46);
  ctx.closePath();
  fillAndStroke(ctx, '#8fc4ff', '#5f8fd6', 2);
  heartPath(ctx, 38, 24, 22);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  return canvas;
}

export function paintFlowerBed(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(130, 64);
  groundShadow(ctx, 65, 56, 62, 7, 0.18);
  roundRectPath(ctx, 4, 30, 122, 26, 8);
  fillAndStroke(ctx, '#d9b99b', '#b08a68', 2);
  ellipsePath(ctx, 65, 30, 58, 10);
  ctx.fillStyle = '#8fd69a';
  ctx.fill();
  const colors = ['#ff8fb8', '#fff1a8', '#c9a7ef', '#ffffff', '#ffb38a'];
  for (let i = 0; i < 9; i++) flower(ctx, 14 + i * 13, 24 + (i % 2) * 8, 6.5, colors[i % colors.length]);
  return canvas;
}

/** Auto in Seitenansicht, fährt nach rechts (nach links = gespiegelt). */
export function paintCar(body: string): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(170, 96);
  groundShadow(ctx, 85, 88, 76, 9, 0.25);
  const stroke = shade(body, -0.3);
  // Karosserie
  ctx.beginPath();
  ctx.moveTo(12, 70);
  ctx.lineTo(12, 50);
  ctx.quadraticCurveTo(14, 38, 32, 36);
  ctx.lineTo(52, 34);
  ctx.quadraticCurveTo(64, 10, 92, 10);
  ctx.lineTo(112, 10);
  ctx.quadraticCurveTo(132, 12, 140, 34);
  ctx.quadraticCurveTo(160, 38, 160, 54);
  ctx.lineTo(160, 70);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 10, 0, 74);
  g.addColorStop(0, shade(body, 0.25));
  g.addColorStop(1, body);
  fillAndStroke(ctx, g, stroke, 2.5);
  // Fenster
  for (const [a, b] of [[60, 96], [102, 132]] as const) {
    ctx.beginPath();
    ctx.moveTo(a, 34);
    ctx.quadraticCurveTo(a + 4, 18, a + 16, 17);
    ctx.lineTo(b - 6, 17);
    ctx.quadraticCurveTo(b, 22, b + 2, 34);
    ctx.closePath();
    fillAndStroke(ctx, '#dff4ff', stroke, 2);
  }
  // Scheinwerfer, Herz-Aufkleber
  ellipsePath(ctx, 154, 48, 5, 4);
  fillAndStroke(ctx, '#fff3b0', '#d9b04e', 1.5);
  heartPath(ctx, 86, 50, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fill();
  // Räder
  for (const x of [44, 128]) {
    ellipsePath(ctx, x, 72, 15, 15);
    fillAndStroke(ctx, '#4a4e60', '#2f3242', 2);
    ellipsePath(ctx, x, 72, 6, 6);
    fillAndStroke(ctx, '#e6e8f2', '#9aa3bd', 1.5);
  }
  return canvas;
}
