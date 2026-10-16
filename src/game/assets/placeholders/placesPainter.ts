/**
 * PLATZHALTER: Einrichtung von Friseursalon, Café und Schule.
 * Gezeichnet in Welt-Einheiten auf einer @2x-Leinwand (unitCanvas).
 * Fußpunkt der Möbel ist jeweils 8 Einheiten über der Unterkante (Platz für den Schatten).
 */
import { seededRandom } from '../../utils/math';
import { ellipsePath, fillAndStroke, flower, groundShadow, heartPath, rgba, roundRectPath, shade, sparklePath, starPath } from './canvasUtils';
import { unitCanvas } from './cityPainter';

/** Abgerundeter Kasten mit weichem Licht von oben links. */
function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | [number, number, number, number], color: string, edge = 1.6): void {
  roundRectPath(ctx, x, y, w, h, r);
  const g = ctx.createLinearGradient(x, y, x + w * 0.4, y + h);
  g.addColorStop(0, shade(color, 0.16));
  g.addColorStop(1, shade(color, -0.12));
  fillAndStroke(ctx, g, rgba(shade(color, -0.45), 0.7), edge);
}

function ball(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, edge = 1.2): void {
  ellipsePath(ctx, x, y, rx, ry);
  const g = ctx.createRadialGradient(x - rx * 0.35, y - ry * 0.4, 0.5, x, y, Math.max(rx, ry) * 1.1);
  g.addColorStop(0, shade(color, 0.35));
  g.addColorStop(1, shade(color, -0.15));
  fillAndStroke(ctx, g, rgba(shade(color, -0.45), 0.6), edge);
}

function chrome(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 3): void {
  roundRectPath(ctx, x, y, w, h, r);
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, '#f4f6f8');
  g.addColorStop(0.45, '#b9bfc7');
  g.addColorStop(1, '#7d848e');
  fillAndStroke(ctx, g, 'rgba(70,75,85,0.6)', 1);
}

function glass(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.12, y + h);
  ctx.lineTo(x + w * 0.3, y + h);
  ctx.lineTo(x + w * 0.55, y);
  ctx.lineTo(x + w * 0.37, y);
  ctx.closePath();
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* Friseursalon                                                        */
/* ------------------------------------------------------------------ */

/** Friseurstuhl (von vorne): hohe Rückenlehne, Armlehnen, Chromfuß. Sitzfläche ≈ 26 über dem Boden. */
export function paintSalonChair(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(110, 130);
  const foot = 122;
  groundShadow(ctx, 55, foot, 40, 7, 0.25);
  // Fuß und Säule
  ellipsePath(ctx, 55, foot - 3, 30, 6);
  ctx.fillStyle = '#8b929c';
  ctx.fill();
  chrome(ctx, 26, foot - 9, 58, 7, 3.5);
  chrome(ctx, 49, foot - 30, 12, 24, 2);
  // Fußstütze
  chrome(ctx, 34, foot - 16, 42, 5, 2.5);
  const leather = '#f28ab2';
  // Rückenlehne mit Kopfstütze
  box(ctx, 22, 18, 66, 72, 20, leather);
  box(ctx, 34, 6, 42, 20, 10, shade(leather, -0.05));
  // Ziernähte
  ctx.strokeStyle = rgba('#ffffff', 0.45);
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 3]);
  roundRectPath(ctx, 29, 25, 52, 58, 15);
  ctx.stroke();
  ctx.setLineDash([]);
  // Sitzfläche
  box(ctx, 16, foot - 44, 78, 18, 8, shade(leather, 0.06));
  // Armlehnen
  for (const x of [8, 86]) {
    box(ctx, x, foot - 58, 16, 30, 7, shade(leather, -0.08));
    chrome(ctx, x + 2, foot - 60, 12, 5, 2.5);
  }
  return canvas;
}

/** Großer Wandspiegel mit Lampen-Rahmen und Ablage (Wanddeko, Ursprung oben). */
export function paintSalonMirror(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(130, 150);
  roundRectPath(ctx, 10, 6, 110, 120, [52, 52, 10, 10]);
  fillAndStroke(ctx, '#f6efe4', '#c9b08a', 3);
  roundRectPath(ctx, 20, 16, 90, 102, [44, 44, 6, 6]);
  const g = ctx.createLinearGradient(20, 16, 110, 118);
  g.addColorStop(0, '#f2fbff');
  g.addColorStop(0.5, '#cfe7f2');
  g.addColorStop(1, '#a9cbe0');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  roundRectPath(ctx, 20, 16, 90, 102, [44, 44, 6, 6]);
  ctx.clip();
  glass(ctx, 20, 16, 90, 102);
  ctx.restore();
  // Glühbirnen rund um den Spiegel
  const bulbs: [number, number][] = [[14, 70], [14, 100], [116, 70], [116, 100], [30, 26], [100, 26], [65, 9]];
  for (const [x, y] of bulbs) {
    const glow = ctx.createRadialGradient(x, y, 0.5, x, y, 9);
    glow.addColorStop(0, 'rgba(255,240,180,0.9)');
    glow.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 9, y - 9, 18, 18);
    ball(ctx, x, y, 4, 4, '#fff6cf', 0.8);
  }
  // Ablage mit Kamm, Bürste, Spray
  box(ctx, 4, 126, 122, 10, 3, '#e8dccb');
  box(ctx, 18, 112, 8, 16, 2, '#ff8fb8');
  box(ctx, 16, 108, 12, 5, 2, '#ffffff');
  box(ctx, 34, 120, 26, 6, 2, '#8fc4ff');
  ctx.strokeStyle = '#5f7fa8';
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(36 + i * 3.4, 121);
    ctx.lineTo(36 + i * 3.4, 116);
    ctx.stroke();
  }
  box(ctx, 96, 106, 12, 22, 4, '#b9a2f5');
  box(ctx, 99, 101, 6, 6, 2, '#f4f6f8');
  return canvas;
}

/** Rollwagen der Friseurin mit Föhn, Scheren und Sprühflaschen. */
export function paintSalonTrolley(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(90, 110);
  const foot = 102;
  groundShadow(ctx, 45, foot, 34, 6, 0.22);
  for (const x of [18, 72]) {
    ball(ctx, x, foot - 4, 5, 5, '#5c616b');
  }
  box(ctx, 12, 30, 66, 66, 8, '#ffffff');
  for (const y of [46, 64, 82]) {
    ctx.fillStyle = 'rgba(120,110,140,0.25)';
    ctx.fillRect(16, y, 58, 2);
    ball(ctx, 45, y - 8, 3, 2, '#d0d4da');
  }
  box(ctx, 8, 24, 74, 8, 3, '#f28ab2');
  // Föhn
  box(ctx, 16, 6, 28, 13, 6, '#b9a2f5');
  box(ctx, 22, 15, 8, 12, 3, '#9c86d9');
  // Sprühflaschen
  box(ctx, 52, 6, 10, 19, 3, '#9be0c1');
  box(ctx, 54, 2, 6, 6, 2, '#ffffff');
  box(ctx, 66, 10, 9, 15, 3, '#ffd36e');
  return canvas;
}

/** Regal mit Haarpflege (Shampoo, Spülung, Bürsten). */
export function paintHairShelf(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(170, 160);
  groundShadow(ctx, 85, 152, 80, 8, 0.2);
  box(ctx, 8, 8, 154, 144, 8, '#f6efe4');
  roundRectPath(ctx, 16, 14, 138, 132, 4);
  ctx.fillStyle = '#e9dccb';
  ctx.fill();
  const rand = seededRandom(91);
  const colors = ['#ff8fb8', '#9be0c1', '#b9a2f5', '#ffd36e', '#8fc4ff', '#ffffff'];
  for (let shelf = 0; shelf < 3; shelf++) {
    const y = 54 + shelf * 44;
    box(ctx, 12, y, 146, 7, 2, '#d8c3a5', 1.2);
    for (let x = 22; x < 140; x += 18) {
      const h = 18 + rand() * 12;
      const c = colors[Math.floor(rand() * colors.length)];
      box(ctx, x, y - h, 12, h, 4, c, 1.1);
      box(ctx, x + 3, y - h - 5, 6, 6, 2, '#ffffff', 0.8);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(x + 2, y - h * 0.6, 8, 3);
    }
  }
  return canvas;
}

/** Wartesessel-Tisch mit Zeitschriften. */
export function paintMagazineTable(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(130, 80);
  const foot = 72;
  groundShadow(ctx, 65, foot, 56, 6, 0.2);
  for (const x of [24, 102]) chrome(ctx, x, 40, 5, foot - 42, 2);
  ellipsePath(ctx, 65, 38, 58, 16);
  const g = ctx.createLinearGradient(0, 22, 0, 54);
  g.addColorStop(0, 'rgba(235,248,255,0.95)');
  g.addColorStop(1, 'rgba(180,215,232,0.95)');
  fillAndStroke(ctx, g, 'rgba(110,140,160,0.6)', 1.5);
  const mags: [number, number, string, number][] = [[40, 32, '#ff8fb8', -0.2], [72, 34, '#b9a2f5', 0.15], [58, 40, '#ffd36e', -0.05]];
  for (const [x, y, c, a] of mags) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    box(ctx, -13, -8, 26, 16, 2, c, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(-9, -4, 12, 2);
    ellipsePath(ctx, 6, 2, 4, 4);
    ctx.fill();
    ctx.restore();
  }
  return canvas;
}

/* ------------------------------------------------------------------ */
/* Café                                                                */
/* ------------------------------------------------------------------ */

/** Lange Café-Theke mit Kuchenvitrine und Kaffeemaschine. Die Vorderseite ist ≈ 78 hoch. */
export function paintCafeCounter(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(400, 150);
  const foot = 142;
  groundShadow(ctx, 200, foot, 190, 9, 0.24);
  // Vorderseite aus Holz mit Paneelen
  box(ctx, 8, foot - 78, 384, 78, 6, '#a8714c', 2);
  ctx.strokeStyle = 'rgba(60,30,15,0.18)';
  ctx.lineWidth = 1;
  for (let x = 14; x < 390; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, foot - 74);
    ctx.lineTo(x, foot - 4);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    const px = 26 + i * 92;
    roundRectPath(ctx, px, foot - 64, 72, 50, 4);
    ctx.strokeStyle = 'rgba(255,230,200,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  heartPath(ctx, 200, foot - 40, 26);
  ctx.fillStyle = '#ffd6e8';
  ctx.fill();
  // Arbeitsplatte (Marmor)
  roundRectPath(ctx, 2, foot - 88, 396, 14, 5);
  const marble = ctx.createLinearGradient(0, foot - 88, 0, foot - 74);
  marble.addColorStop(0, '#ffffff');
  marble.addColorStop(1, '#ddd9d4');
  fillAndStroke(ctx, marble, 'rgba(120,110,100,0.5)', 1.2);
  // Kuchenvitrine links
  const vx = 30;
  const vy = foot - 140;
  roundRectPath(ctx, vx, vy, 120, 54, 8);
  ctx.fillStyle = 'rgba(220,240,250,0.55)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,150,170,0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const cakes: [number, string, string][] = [[52, '#ffd6e8', '#ff8fb8'], [90, '#7a4a32', '#f6e3c8'], [128, '#fff1c4', '#9be0c1']];
  for (const [x, body, top] of cakes) {
    box(ctx, x - 14, vy + 30, 28, 18, 3, body, 1);
    box(ctx, x - 15, vy + 26, 30, 7, 3, top, 1);
    ball(ctx, x, vy + 23, 3, 3, '#ff4f6f', 0.6);
  }
  ctx.save();
  roundRectPath(ctx, vx, vy, 120, 54, 8);
  ctx.clip();
  glass(ctx, vx, vy, 120, 54);
  ctx.restore();
  // Kaffeemaschine rechts
  const mx = 280;
  box(ctx, mx, foot - 142, 90, 56, 8, '#c9ced5');
  chrome(ctx, mx + 6, foot - 136, 78, 10, 4);
  box(ctx, mx + 14, foot - 120, 18, 12, 3, '#3d3f45', 1);
  box(ctx, mx + 58, foot - 120, 18, 12, 3, '#3d3f45', 1);
  for (const x of [mx + 23, mx + 67]) {
    box(ctx, x - 6, foot - 104, 12, 14, [2, 2, 5, 5] , '#ffffff', 1);
  }
  ball(ctx, mx + 45, foot - 116, 7, 7, '#ff8fb8');
  // Kasse
  box(ctx, 196, foot - 116, 52, 30, 5, '#f6efe4');
  box(ctx, 202, foot - 112, 26, 12, 2, '#bff0d8', 1);
  return canvas;
}

/** Runder Café-Tisch mit Tischdecke und Blumenvase. */
export function paintCafeTableRound(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(120, 90);
  const foot = 82;
  groundShadow(ctx, 60, foot, 46, 7, 0.22);
  chrome(ctx, 56, 40, 8, foot - 44, 2);
  ellipsePath(ctx, 60, foot - 3, 20, 4);
  ctx.fillStyle = '#7d848e';
  ctx.fill();
  // Tischdecke
  ctx.beginPath();
  ctx.moveTo(10, 30);
  ctx.quadraticCurveTo(60, 18, 110, 30);
  ctx.lineTo(106, 54);
  for (let i = 0; i < 6; i++) ctx.quadraticCurveTo(102 - i * 16, 60, 94 - i * 16, 54);
  ctx.closePath();
  const cloth = ctx.createLinearGradient(0, 20, 0, 60);
  cloth.addColorStop(0, '#ffffff');
  cloth.addColorStop(1, '#f2dbe5');
  fillAndStroke(ctx, cloth, 'rgba(200,120,160,0.6)', 1.3);
  ctx.fillStyle = 'rgba(255,143,184,0.35)';
  for (let x = 18; x < 104; x += 12) ctx.fillRect(x, 38, 6, 6);
  ellipsePath(ctx, 60, 28, 50, 9);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  box(ctx, 53, 8, 14, 18, 4, '#b9e8f5', 1);
  flower(ctx, 56, 6, 5, '#ff8fb8');
  flower(ctx, 66, 4, 4.5, '#fff1a8');
  return canvas;
}

/** Café-Stuhl von vorne (steht hinter dem Tisch). Sitzfläche ≈ 22 über dem Boden. */
export function paintCafeChair(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(80, 100);
  const foot = 92;
  groundShadow(ctx, 40, foot, 28, 5, 0.18);
  for (const x of [14, 62]) box(ctx, x, foot - 26, 5, 26, 2, '#8a5a3c', 1);
  box(ctx, 12, 10, 56, 54, 14, '#c98a5e');
  ctx.strokeStyle = 'rgba(80,40,20,0.35)';
  ctx.lineWidth = 2;
  for (const x of [28, 40, 52]) {
    ctx.beginPath();
    ctx.moveTo(x, 18);
    ctx.lineTo(x, 56);
    ctx.stroke();
  }
  box(ctx, 8, foot - 34, 64, 12, 5, '#ffb3d1');
  return canvas;
}

/** Tisch zum Kuchenverzieren: Tortenständer, Spritzbeutel, Streusel. */
export function paintCakeStation(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(210, 130);
  const foot = 122;
  groundShadow(ctx, 105, foot, 98, 8, 0.22);
  box(ctx, 10, foot - 60, 190, 60, 6, '#f6efe4', 2);
  for (let i = 0; i < 3; i++) {
    roundRectPath(ctx, 22 + i * 60, foot - 50, 48, 38, 4);
    ctx.strokeStyle = 'rgba(180,150,120,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  box(ctx, 4, foot - 70, 202, 12, 4, '#ffd6e8');
  // Tortenständer mit Torte
  chrome(ctx, 96, foot - 84, 18, 14, 3);
  ellipsePath(ctx, 105, foot - 84, 34, 6);
  ctx.fillStyle = '#e4e8ee';
  ctx.fill();
  box(ctx, 78, foot - 118, 54, 34, 6, '#fff1c4');
  ctx.beginPath();
  ctx.moveTo(78, foot - 108);
  for (let i = 0; i <= 6; i++) ctx.quadraticCurveTo(80 + i * 9 - 4.5, foot - 98, 78 + i * 9, foot - 108);
  ctx.lineTo(132, foot - 118);
  ctx.lineTo(78, foot - 118);
  ctx.closePath();
  ctx.fillStyle = '#ff9cc8';
  ctx.fill();
  for (const [x, c] of [[90, '#ff4f6f'], [105, '#ffd36e'], [120, '#8fc4ff']] as const) ball(ctx, x, foot - 121, 3.5, 3.5, c, 0.6);
  // Spritzbeutel und Streuselgläser
  ctx.save();
  ctx.translate(40, foot - 84);
  ctx.rotate(-0.5);
  ctx.beginPath();
  ctx.moveTo(-8, -10);
  ctx.lineTo(8, -10);
  ctx.lineTo(0, 14);
  ctx.closePath();
  fillAndStroke(ctx, '#ffffff', 'rgba(150,120,140,0.6)', 1.2);
  ctx.restore();
  const rand = seededRandom(5);
  for (const [x, c] of [[156, '#ff8fb8'], [178, '#9be0c1']] as const) {
    box(ctx, x - 9, foot - 92, 18, 22, 4, '#e6f5ff', 1);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = [c, '#ffd36e', '#ffffff'][i % 3];
      ctx.fillRect(x - 6 + rand() * 12, foot - 84 + rand() * 12, 2.5, 1.5);
    }
    box(ctx, x - 9, foot - 96, 18, 5, 2, '#c98a5e', 0.8);
  }
  return canvas;
}

/** Tafel mit Speisekarte (Wanddeko, Text kommt aus der Szene). */
export function paintMenuBoard(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(220, 130);
  box(ctx, 4, 4, 212, 122, 8, '#9a6a48', 2);
  roundRectPath(ctx, 14, 14, 192, 102, 4);
  const g = ctx.createLinearGradient(0, 14, 0, 116);
  g.addColorStop(0, '#3d4a44');
  g.addColorStop(1, '#2c3632');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  roundRectPath(ctx, 22, 22, 176, 86, 4);
  ctx.stroke();
  ctx.setLineDash([]);
  return canvas;
}

/** Wandregal mit Tassen und Kaffeedosen (Wanddeko). */
export function paintCupShelf(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(200, 70);
  box(ctx, 4, 52, 192, 8, 2, '#a8714c', 1.4);
  const colors = ['#ffffff', '#ffd6e8', '#9be0c1', '#ffffff', '#fff1c4', '#c9b6f0'];
  colors.forEach((c, i) => {
    const x = 16 + i * 30;
    box(ctx, x, 32, 18, 20, [2, 2, 7, 7] , c, 1.1);
    ctx.strokeStyle = rgba(shade(c, -0.4), 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 20, 42, 4.5, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  });
  box(ctx, 50, 8, 26, 24, 4, '#c98a5e');
  box(ctx, 124, 10, 22, 22, 4, '#ff8fb8');
  return canvas;
}

/* ------------------------------------------------------------------ */
/* Schule                                                              */
/* ------------------------------------------------------------------ */

/** Große Kreidetafel mit Rahmen und Kreideablage (Wanddeko, Text kommt aus der Szene). */
export function paintBlackboard(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(460, 150);
  box(ctx, 4, 4, 452, 132, 6, '#9a6a48', 2);
  roundRectPath(ctx, 16, 14, 428, 110, 3);
  const g = ctx.createLinearGradient(16, 14, 444, 124);
  g.addColorStop(0, '#3f6b55');
  g.addColorStop(1, '#2d5040');
  ctx.fillStyle = g;
  ctx.fill();
  // Kreidespuren
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 6;
  for (const y of [40, 82]) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.quadraticCurveTo(220, y - 12, 420, y + 6);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 2;
  starPath(ctx, 48, 40, 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(412, 98, 12, 0, Math.PI * 2);
  ctx.stroke();
  // Ablage mit Kreide und Schwamm
  box(ctx, 10, 126, 440, 10, 3, '#b98a62');
  for (const [x, c] of [[60, '#ffffff'], [76, '#ffd36e'], [92, '#ff8fb8']] as const) box(ctx, x, 121, 12, 5, 2, c, 0.8);
  box(ctx, 380, 116, 30, 11, 3, '#ffd36e');
  return canvas;
}

/** Buchstaben-Poster „A B C“ (Wanddeko). */
export function paintAlphabetPoster(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(170, 100);
  box(ctx, 4, 4, 162, 92, 6, '#ffffff', 2);
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const colors = ['#ff6f8f', '#3f7fd6', '#3e9a5c', '#e0a12e', '#8a5ad6'];
  ctx.font = 'bold 30px Fredoka, "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  letters.forEach((l, i) => {
    ctx.fillStyle = colors[i];
    ctx.fillText(l, 22 + i * 31, i % 2 ? 58 : 40);
  });
  heartPath(ctx, 140, 76, 16);
  ctx.fillStyle = '#ff8fb8';
  ctx.fill();
  starPath(ctx, 26, 78, 7);
  ctx.fillStyle = '#ffd36e';
  ctx.fill();
  return canvas;
}

/** Bilderrahmen an der Wand für Samyas gemaltes Bild (Wanddeko). */
export function paintPictureFrame(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(150, 120);
  box(ctx, 4, 4, 142, 112, 6, '#ffd36e', 2);
  roundRectPath(ctx, 14, 14, 122, 92, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,170,120,0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Platzhalter, bis Samya etwas gemalt hat
  ctx.fillStyle = 'rgba(180,170,200,0.55)';
  ctx.font = 'bold 15px Fredoka, "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Dein Bild', 75, 54);
  ctx.fillText('kommt hierhin', 75, 74);
  return canvas;
}

/** Schulbank (von vorne, steht vor dem Stuhl). */
export function paintSchoolDesk(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(120, 80);
  const foot = 72;
  groundShadow(ctx, 60, foot, 50, 6, 0.2);
  for (const x of [16, 98]) chrome(ctx, x, 30, 6, foot - 30, 2);
  box(ctx, 8, 20, 104, 14, 4, '#e8c08e');
  box(ctx, 14, 34, 92, 22, 3, '#9fb7c9');
  // Heft und Stift
  box(ctx, 24, 12, 30, 10, 2, '#ffffff', 1);
  ctx.fillStyle = 'rgba(120,150,200,0.5)';
  ctx.fillRect(28, 15, 22, 1);
  ctx.fillRect(28, 18, 18, 1);
  ctx.save();
  ctx.translate(74, 16);
  ctx.rotate(-0.3);
  box(ctx, -14, -2, 28, 4, 2, '#ffd36e', 0.8);
  ctx.restore();
  return canvas;
}

/** Schulstuhl (von vorne, steht hinter der Bank). Sitzfläche ≈ 22 über dem Boden. */
export function paintSchoolChair(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(70, 90);
  const foot = 82;
  groundShadow(ctx, 35, foot, 24, 5, 0.18);
  for (const x of [12, 54]) chrome(ctx, x, foot - 30, 4, 30, 2);
  box(ctx, 10, 8, 50, 34, 10, '#8fc4ff');
  chrome(ctx, 30, 40, 10, 18, 2);
  box(ctx, 6, foot - 34, 58, 11, 5, '#6fa8e8');
  return canvas;
}

/** Lehrerpult mit Globus, Apfel und Büchern. */
export function paintTeacherDesk(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(210, 130);
  const foot = 122;
  groundShadow(ctx, 105, foot, 96, 8, 0.22);
  box(ctx, 10, foot - 66, 190, 66, 6, '#b07a52', 2);
  box(ctx, 22, foot - 56, 70, 46, 4, '#9a6a48', 1.2);
  ball(ctx, 82, foot - 34, 3, 3, '#ffd36e');
  box(ctx, 4, foot - 74, 202, 12, 4, '#c98a5e');
  // Globus
  chrome(ctx, 158, foot - 84, 10, 12, 2);
  ball(ctx, 163, foot - 100, 18, 18, '#6fb6e8');
  ctx.fillStyle = '#7fcf7a';
  for (const [x, y, rx, ry] of [[156, -106, 8, 6], [170, -94, 6, 7], [160, -90, 4, 3]] as const) {
    ellipsePath(ctx, x, foot + y, rx, ry);
    ctx.fill();
  }
  ctx.strokeStyle = '#b9bfc7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(163, foot - 100, 22, Math.PI * 0.6, Math.PI * 1.9);
  ctx.stroke();
  // Apfel und Bücher
  ball(ctx, 112, foot - 82, 9, 8, '#ff4f6f');
  ctx.strokeStyle = '#7a4a32';
  ctx.beginPath();
  ctx.moveTo(112, foot - 90);
  ctx.lineTo(114, foot - 96);
  ctx.stroke();
  for (const [y, c] of [[-80, '#8fc4ff'], [-88, '#ff8fb8'], [-95, '#ffd36e']] as const) box(ctx, 26, foot + y, 52, 8, 2, c, 1);
  return canvas;
}

/** Staffelei mit Papier und Farbtöpfen (Malecke). */
export function paintEasel(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(110, 160);
  const foot = 152;
  groundShadow(ctx, 55, foot, 40, 6, 0.2);
  ctx.strokeStyle = '#a8714c';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(22, foot - 2);
  ctx.lineTo(48, 10);
  ctx.moveTo(88, foot - 2);
  ctx.lineTo(62, 10);
  ctx.moveTo(55, 12);
  ctx.lineTo(55, foot - 10);
  ctx.stroke();
  box(ctx, 16, 96, 78, 6, 2, '#c98a5e');
  box(ctx, 18, 20, 74, 76, 3, '#ffffff', 1.6);
  // angefangenes Bild
  ctx.fillStyle = '#8fd6ff';
  ctx.fillRect(22, 24, 66, 30);
  ball(ctx, 74, 36, 8, 8, '#ffd36e', 0.6);
  ctx.fillStyle = '#7fcf7a';
  ctx.fillRect(22, 70, 66, 22);
  flower(ctx, 36, 70, 6, '#ff8fb8');
  heartPath(ctx, 58, 60, 14);
  ctx.fillStyle = '#ff6f8f';
  ctx.fill();
  // Farbtöpfe
  for (const [x, c] of [[26, '#ff6f8f'], [44, '#3f7fd6'], [62, '#ffd36e'], [80, '#3e9a5c']] as const) {
    box(ctx, x - 6, foot - 14, 12, 12, 3, c, 1);
  }
  return canvas;
}

/** Xylophon auf einem kleinen Tisch (Musikecke). */
export function paintXylophoneTable(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(160, 100);
  const foot = 92;
  groundShadow(ctx, 80, foot, 70, 7, 0.2);
  for (const x of [18, 136]) box(ctx, x, 46, 6, foot - 46, 2, '#a8714c', 1);
  box(ctx, 8, 40, 144, 10, 4, '#c98a5e');
  box(ctx, 16, 14, 128, 28, 6, '#8a5a3c');
  const colors = ['#ff6f6f', '#ffa86f', '#ffd36e', '#8fdc8f', '#6fc3d6', '#6f9de8', '#a98bf5', '#ff8fc2'];
  colors.forEach((c, i) => {
    const h = 26 - i * 1.6;
    box(ctx, 22 + i * 15, 28 - h / 2, 12, h, 3, c, 1);
    ball(ctx, 28 + i * 15, 28 - h / 2 + 3, 1.5, 1.5, '#d0d4da', 0.5);
  });
  // Schlägel
  ctx.strokeStyle = '#e8c08e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(116, 48);
  ctx.lineTo(146, 34);
  ctx.stroke();
  ball(ctx, 147, 33, 4, 4, '#ff8fb8');
  sparklePath(ctx, 14, 10, 6);
  ctx.fillStyle = '#ffd36e';
  ctx.fill();
  return canvas;
}
