/**
 * PLATZHALTER: Möbel für Samyas Haus (Schlafzimmer, Küche) und Trennwände.
 * Gezeichnet in Welt-Einheiten auf einer @2x-Leinwand.
 */
import { ellipsePath, fillAndStroke, flower, groundShadow, heartPath, roundRectPath, shade, starPath } from './canvasUtils';
import { unitCanvas } from './cityPainter';

export function paintBed(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(250, 190);
  groundShadow(ctx, 125, 178, 118, 10, 0.2);
  // Kopfteil
  ctx.beginPath();
  ctx.moveTo(14, 96);
  ctx.lineTo(14, 40);
  ctx.quadraticCurveTo(125, -6, 236, 40);
  ctx.lineTo(236, 96);
  ctx.closePath();
  fillAndStroke(ctx, '#f2c29b', '#c38d68', 3);
  heartPath(ctx, 125, 44, 30);
  fillAndStroke(ctx, '#ffb3d1', '#e07ca8', 2);
  // Matratze und Decke (von oben schräg)
  roundRectPath(ctx, 10, 78, 230, 92, 16);
  fillAndStroke(ctx, '#ffffff', '#d6c7e6', 3);
  roundRectPath(ctx, 10, 112, 230, 62, [8, 8, 16, 16]);
  const quilt = ctx.createLinearGradient(0, 112, 0, 174);
  quilt.addColorStop(0, '#ffc2dc');
  quilt.addColorStop(1, '#ff9cc8');
  fillAndStroke(ctx, quilt, '#e07ca8', 3);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  for (let x = 30; x < 230; x += 40) {
    heartPath(ctx, x, 142, 12);
    ctx.fill();
  }
  // Kissen und Kuscheltier
  roundRectPath(ctx, 34, 84, 70, 30, 12);
  fillAndStroke(ctx, '#fff6fb', '#e0c7da', 2);
  for (const x of [178, 202]) {
    ellipsePath(ctx, x, 76, 7, 7);
    fillAndStroke(ctx, '#d9aa7b', '#9a6e4a', 1.5);
  }
  ellipsePath(ctx, 190, 96, 22, 18);
  fillAndStroke(ctx, '#d9aa7b', '#9a6e4a', 2);
  ellipsePath(ctx, 190, 86, 15, 13);
  fillAndStroke(ctx, '#e0b689', '#9a6e4a', 2);
  ctx.fillStyle = '#4a3428';
  for (const [x, y] of [[185, 84], [195, 84], [190, 90]] as const) {
    ellipsePath(ctx, x, y, 1.8, 1.8);
    ctx.fill();
  }
  return canvas;
}

export function paintNightstand(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(80, 130);
  groundShadow(ctx, 40, 122, 34, 6, 0.2);
  roundRectPath(ctx, 8, 66, 64, 56, 8);
  fillAndStroke(ctx, '#f2c29b', '#c38d68', 2.5);
  roundRectPath(ctx, 16, 84, 48, 18, 4);
  fillAndStroke(ctx, '#f7d3b2', '#c38d68', 1.5);
  ellipsePath(ctx, 40, 93, 3, 3);
  ctx.fillStyle = '#c38d68';
  ctx.fill();
  // Lampe
  roundRectPath(ctx, 36, 36, 8, 30, 3);
  fillAndStroke(ctx, '#c9a7ef', '#8a6ccc', 1.5);
  ctx.beginPath();
  ctx.moveTo(22, 40);
  ctx.lineTo(58, 40);
  ctx.lineTo(50, 12);
  ctx.lineTo(30, 12);
  ctx.closePath();
  fillAndStroke(ctx, '#fff1a8', '#e0b84e', 2);
  return canvas;
}

export function paintWardrobe(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(200, 210);
  groundShadow(ctx, 100, 200, 94, 8, 0.2);
  roundRectPath(ctx, 8, 10, 184, 188, 12);
  fillAndStroke(ctx, '#ffe1ec', '#e07ca8', 3);
  roundRectPath(ctx, 4, 4, 192, 16, 8);
  fillAndStroke(ctx, '#ffc2dc', '#e07ca8', 2);
  for (const x of [18, 102]) {
    roundRectPath(ctx, x, 26, 80, 160, 8);
    fillAndStroke(ctx, '#fff3f8', '#e0a0c0', 2);
    heartPath(ctx, x + 40, 72, 26);
    fillAndStroke(ctx, '#ffb3d1', '#e07ca8', 1.5);
  }
  for (const x of [92, 108]) {
    roundRectPath(ctx, x - 3, 96, 6, 26, 3);
    fillAndStroke(ctx, '#ffe08a', '#d9b04e', 1.5);
  }
  return canvas;
}

export function paintToyBox(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(140, 120);
  groundShadow(ctx, 70, 112, 64, 7, 0.2);
  // Spielzeug schaut heraus
  ellipsePath(ctx, 46, 44, 14, 14);
  fillAndStroke(ctx, '#ff8fb8', '#d9608d', 2);
  starPath(ctx, 92, 40, 14);
  fillAndStroke(ctx, '#fff1a8', '#e0b84e', 2);
  roundRectPath(ctx, 62, 34, 22, 22, 4);
  fillAndStroke(ctx, '#8fdccf', '#5fb3a6', 2);
  // Kiste
  roundRectPath(ctx, 10, 50, 120, 62, 10);
  fillAndStroke(ctx, '#8fc4ff', '#5f8fd6', 3);
  roundRectPath(ctx, 6, 46, 128, 14, 7);
  fillAndStroke(ctx, '#b6d8ff', '#5f8fd6', 2);
  const letters = [
    ['#ff8fb8', 30],
    ['#ffe28a', 70],
    ['#9be0c1', 110],
  ] as const;
  for (const [c, x] of letters) {
    roundRectPath(ctx, x - 13, 70, 26, 26, 5);
    fillAndStroke(ctx, c, shade(c, -0.25), 1.5);
  }
  return canvas;
}

export function paintFridge(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(110, 200);
  groundShadow(ctx, 55, 192, 50, 7, 0.2);
  roundRectPath(ctx, 8, 6, 94, 184, 14);
  fillAndStroke(ctx, '#e8f6ff', '#8fb3d0', 3);
  ctx.strokeStyle = '#8fb3d0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(10, 70);
  ctx.lineTo(100, 70);
  ctx.stroke();
  for (const [y, h] of [[24, 34], [90, 60]] as const) {
    roundRectPath(ctx, 84, y, 7, h, 3);
    fillAndStroke(ctx, '#ffffff', '#8fb3d0', 1.5);
  }
  // Magnete
  heartPath(ctx, 30, 104, 14);
  fillAndStroke(ctx, '#ff8fb8', '#d9608d', 1.5);
  starPath(ctx, 52, 128, 7);
  fillAndStroke(ctx, '#ffe28a', '#d9b04e', 1.5);
  flower(ctx, 30, 150, 6, '#c9a7ef');
  return canvas;
}

export function paintKitchenCounter(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(320, 190);
  groundShadow(ctx, 160, 182, 150, 8, 0.2);
  // Hängeschränke
  for (const x of [20, 120, 220]) {
    roundRectPath(ctx, x, 6, 80, 46, 8);
    fillAndStroke(ctx, '#d6f5ea', '#5fb3a6', 2.5);
    roundRectPath(ctx, x + 34, 34, 12, 5, 2);
    fillAndStroke(ctx, '#ffe08a', '#d9b04e', 1);
  }
  // Unterschränke
  roundRectPath(ctx, 6, 96, 308, 82, 8);
  fillAndStroke(ctx, '#d6f5ea', '#5fb3a6', 3);
  roundRectPath(ctx, 2, 88, 316, 14, 6);
  fillAndStroke(ctx, '#fff6ea', '#c9a07a', 2);
  for (const x of [16, 116, 216]) {
    roundRectPath(ctx, x, 110, 88, 58, 6);
    fillAndStroke(ctx, '#e6fbf3', '#5fb3a6', 1.5);
  }
  // Herd mit Töpfchen
  roundRectPath(ctx, 120, 78, 80, 12, 4);
  fillAndStroke(ctx, '#6b6f86', '#4a4e60', 1.5);
  roundRectPath(ctx, 136, 56, 46, 26, [4, 4, 8, 8]);
  fillAndStroke(ctx, '#ff8fb8', '#d9608d', 2);
  ctx.strokeStyle = 'rgba(200,200,220,0.8)';
  ctx.lineWidth = 2;
  for (const dx of [148, 160, 172]) {
    ctx.beginPath();
    ctx.moveTo(dx, 52);
    ctx.quadraticCurveTo(dx + 4, 44, dx, 36);
    ctx.stroke();
  }
  // Spüle
  roundRectPath(ctx, 236, 82, 60, 10, 4);
  fillAndStroke(ctx, '#cfe0f0', '#8fb3d0', 1.5);
  ctx.strokeStyle = '#9aa3bd';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(266, 84);
  ctx.lineTo(266, 66);
  ctx.lineTo(256, 66);
  ctx.stroke();
  return canvas;
}

export function paintDiningTable(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(240, 140);
  groundShadow(ctx, 120, 130, 110, 9, 0.2);
  // Stühle hinten
  for (const x of [70, 170]) {
    roundRectPath(ctx, x - 22, 10, 44, 50, 10);
    fillAndStroke(ctx, '#ffd6e8', '#e07ca8', 2);
  }
  // Tisch
  for (const x of [40, 200]) {
    roundRectPath(ctx, x - 5, 70, 10, 54, 3);
    fillAndStroke(ctx, '#c38d68', '#9a6e52', 1.5);
  }
  roundRectPath(ctx, 14, 48, 212, 36, 10);
  fillAndStroke(ctx, '#f2c29b', '#c38d68', 2.5);
  roundRectPath(ctx, 30, 52, 180, 26, 8);
  fillAndStroke(ctx, '#ffffff', '#ffc2dc', 2);
  // Teller und Blumen
  for (const x of [70, 170]) {
    ellipsePath(ctx, x, 64, 16, 7);
    fillAndStroke(ctx, '#ffffff', '#c9b6e6', 1.5);
  }
  roundRectPath(ctx, 113, 50, 14, 16, 4);
  fillAndStroke(ctx, '#c9a7ef', '#8a6ccc', 1.5);
  flower(ctx, 114, 44, 6, '#ff8fb8');
  flower(ctx, 126, 42, 6, '#fff1a8');
  // Stühle vorne
  for (const x of [70, 170]) {
    roundRectPath(ctx, x - 24, 96, 48, 30, 10);
    fillAndStroke(ctx, '#ffc2dc', '#e07ca8', 2);
  }
  return canvas;
}

/** Senkrechte Trennwand zwischen zwei Räumen (von oben gesehen). */
export function paintPartition(height: number): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(36, height);
  roundRectPath(ctx, 4, 2, 28, height - 4, 10);
  const g = ctx.createLinearGradient(4, 0, 32, 0);
  g.addColorStop(0, '#fff6fb');
  g.addColorStop(1, '#f1e1ee');
  fillAndStroke(ctx, g, '#d4b6cf', 2.5);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(10, 8, 4, height - 16);
  return canvas;
}

/** Kleines Schild für den Raumnamen an der Rückwand (Text kommt aus der Szene). */
export function paintRoomBoard(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(220, 48);
  roundRectPath(ctx, 3, 3, 214, 42, 21);
  fillAndStroke(ctx, '#ffffff', '#ffb3d1', 3);
  return canvas;
}
