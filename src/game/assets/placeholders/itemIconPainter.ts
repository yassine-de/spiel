/**
 * PLATZHALTER: Produktbilder für Lebensmittel und Spielzeug.
 * Jedes Bild wird in einem 100 × 100-Raster gezeichnet und auf die Zielgröße skaliert.
 */
import { createCanvas, ellipsePath, fillAndStroke, groundShadow, heartPath, roundRectPath, shade, sparklePath, starPath } from './canvasUtils';
import { unitCanvas } from './cityPainter';

type Painter = (ctx: CanvasRenderingContext2D) => void;

function fruit(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  ellipsePath(ctx, x, y, r, r * 0.95);
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, 1, x, y, r);
  g.addColorStop(0, shade(color, 0.35));
  g.addColorStop(1, color);
  fillAndStroke(ctx, g, shade(color, -0.3), 2.5);
  ctx.strokeStyle = '#8a6248';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - r + 2);
  ctx.lineTo(x + 2, y - r - 7);
  ctx.stroke();
  ctx.save();
  ctx.translate(x + 7, y - r - 4);
  ctx.rotate(-0.5);
  ellipsePath(ctx, 0, 0, 7, 3.5);
  fillAndStroke(ctx, '#7fcf86', '#5aa866', 1.5);
  ctx.restore();
}

function bottle(ctx: CanvasRenderingContext2D, color: string, label: string, liquid: string): void {
  roundRectPath(ctx, 40, 10, 20, 14, 4);
  fillAndStroke(ctx, color, shade(color, -0.3), 2.5);
  ctx.beginPath();
  ctx.moveTo(38, 24);
  ctx.lineTo(62, 24);
  ctx.quadraticCurveTo(74, 32, 74, 44);
  ctx.lineTo(74, 86);
  ctx.quadraticCurveTo(74, 92, 68, 92);
  ctx.lineTo(32, 92);
  ctx.quadraticCurveTo(26, 92, 26, 86);
  ctx.lineTo(26, 44);
  ctx.quadraticCurveTo(26, 32, 38, 24);
  ctx.closePath();
  fillAndStroke(ctx, liquid, shade(liquid, -0.3), 2.5);
  roundRectPath(ctx, 30, 52, 40, 22, 5);
  fillAndStroke(ctx, label, shade(label, -0.2), 2);
}

const PAINTERS: Record<string, Painter> = {
  'food-apples': (ctx) => {
    fruit(ctx, 36, 60, 20, '#ff5f6f');
    fruit(ctx, 64, 62, 20, '#ff7a6f');
  },
  'food-bananas': (ctx) => {
    for (const [dy, rot] of [[0, 0], [8, 0.18], [-8, -0.18]] as const) {
      ctx.save();
      ctx.translate(50, 56 + dy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(-34, -6);
      ctx.quadraticCurveTo(0, 30, 34, -10);
      ctx.quadraticCurveTo(0, 14, -34, -6);
      ctx.closePath();
      fillAndStroke(ctx, '#ffe066', '#d9b04e', 2.5);
      ctx.restore();
    }
  },
  'food-strawberries': (ctx) => {
    for (const [x, y] of [[36, 58], [64, 62]] as const) {
      ctx.beginPath();
      ctx.moveTo(x - 17, y - 10);
      ctx.quadraticCurveTo(x, y - 18, x + 17, y - 10);
      ctx.quadraticCurveTo(x + 14, y + 16, x, y + 22);
      ctx.quadraticCurveTo(x - 14, y + 16, x - 17, y - 10);
      ctx.closePath();
      fillAndStroke(ctx, '#ff4f6a', '#c93a4a', 2.5);
      ctx.fillStyle = '#fff3a6';
      for (const [dx, dy] of [[-6, -2], [5, 0], [-2, 8], [7, 9], [-8, 9]] as const) {
        ellipsePath(ctx, x + dx, y + dy, 1.6, 2.2);
        ctx.fill();
      }
      ellipsePath(ctx, x, y - 13, 10, 4);
      fillAndStroke(ctx, '#7fcf86', '#5aa866', 1.5);
    }
  },
  'food-carrots': (ctx) => {
    for (const [x, rot] of [[38, -0.3], [62, 0.3]] as const) {
      ctx.save();
      ctx.translate(x, 52);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.lineTo(10, -22);
      ctx.lineTo(0, 34);
      ctx.closePath();
      fillAndStroke(ctx, '#ff9a3c', '#d9752a', 2.5);
      for (const dx of [-5, 0, 5]) {
        ctx.strokeStyle = '#5aa866';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(dx, -22);
        ctx.lineTo(dx * 2, -36);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
  'food-tomatoes': (ctx) => {
    for (const [x, y] of [[36, 60], [64, 58]] as const) {
      ellipsePath(ctx, x, y, 19, 17);
      fillAndStroke(ctx, '#ff5a4a', '#c93a3a', 2.5);
      sparklePath(ctx, x, y - 16, 7);
      fillAndStroke(ctx, '#7fcf86', '#5aa866', 1.2);
    }
  },
  'food-milk': (ctx) => {
    ctx.beginPath();
    ctx.moveTo(30, 30);
    ctx.lineTo(50, 14);
    ctx.lineTo(70, 30);
    ctx.lineTo(70, 90);
    ctx.lineTo(30, 90);
    ctx.closePath();
    fillAndStroke(ctx, '#ffffff', '#9aa3bd', 2.5);
    ctx.fillStyle = '#8fc4ff';
    ctx.fillRect(31, 50, 38, 22);
    heartPath(ctx, 50, 61, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  },
  'food-cheese': (ctx) => {
    ctx.beginPath();
    ctx.moveTo(14, 70);
    ctx.lineTo(86, 46);
    ctx.lineTo(86, 76);
    ctx.lineTo(14, 86);
    ctx.closePath();
    fillAndStroke(ctx, '#ffd24d', '#d9a92a', 2.5);
    ctx.beginPath();
    ctx.moveTo(14, 70);
    ctx.lineTo(86, 46);
    ctx.lineTo(60, 36);
    ctx.closePath();
    fillAndStroke(ctx, '#ffe27a', '#d9a92a', 2.5);
    ctx.fillStyle = '#e8b93a';
    for (const [x, y, r] of [[40, 72, 5], [64, 64, 4], [74, 70, 3]] as const) {
      ellipsePath(ctx, x, y, r, r);
      ctx.fill();
    }
  },
  'food-juice': (ctx) => bottle(ctx, '#ff9a3c', '#ffffff', '#ffb347'),
  'food-water': (ctx) => bottle(ctx, '#8fc4ff', '#ffffff', '#dff4ff'),
  'food-yogurt': (ctx) => {
    ctx.beginPath();
    ctx.moveTo(26, 34);
    ctx.lineTo(74, 34);
    ctx.lineTo(68, 88);
    ctx.lineTo(32, 88);
    ctx.closePath();
    fillAndStroke(ctx, '#ffd6e8', '#e07ca8', 2.5);
    ellipsePath(ctx, 50, 34, 26, 7);
    fillAndStroke(ctx, '#ffffff', '#e07ca8', 2.5);
    fruit(ctx, 50, 62, 9, '#ff4f6a');
  },
  'food-icecream': (ctx) => {
    ctx.beginPath();
    ctx.moveTo(34, 52);
    ctx.lineTo(66, 52);
    ctx.lineTo(50, 94);
    ctx.closePath();
    fillAndStroke(ctx, '#e8b277', '#b98348', 2.5);
    for (const [x, y, c] of [[38, 46, '#ffb3d1'], [62, 46, '#c9f0d8'], [50, 30, '#fff3c4']] as const) {
      ellipsePath(ctx, x, y, 15, 14);
      fillAndStroke(ctx, c, shade(c, -0.3), 2.5);
    }
    ellipsePath(ctx, 50, 16, 5, 5);
    fillAndStroke(ctx, '#ff4f6a', '#c93a4a', 1.5);
  },
  'food-pizza': (ctx) => {
    ellipsePath(ctx, 50, 54, 38, 30);
    fillAndStroke(ctx, '#f2c27b', '#c9934e', 3);
    ellipsePath(ctx, 50, 54, 31, 24);
    fillAndStroke(ctx, '#ff7a5a', '#d95a3a', 2);
    ctx.fillStyle = '#fff3c4';
    for (const [x, y] of [[38, 48], [60, 46], [48, 62], [64, 62], [34, 60]] as const) {
      ellipsePath(ctx, x, y, 6, 4);
      ctx.fill();
    }
    ctx.fillStyle = '#c93a4a';
    for (const [x, y] of [[44, 54], [58, 56], [52, 44]] as const) {
      ellipsePath(ctx, x, y, 4, 4);
      ctx.fill();
    }
  },
  'food-bread': (ctx) => {
    ctx.beginPath();
    ctx.moveTo(14, 74);
    ctx.quadraticCurveTo(14, 34, 50, 34);
    ctx.quadraticCurveTo(86, 34, 86, 74);
    ctx.closePath();
    fillAndStroke(ctx, '#e0a865', '#a8723a', 3);
    ctx.strokeStyle = '#a8723a';
    ctx.lineWidth = 3;
    for (const x of [34, 50, 66]) {
      ctx.beginPath();
      ctx.moveTo(x - 6, 50);
      ctx.lineTo(x + 6, 42);
      ctx.stroke();
    }
  },
  'food-chocolate': (ctx) => {
    roundRectPath(ctx, 22, 20, 56, 64, 6);
    fillAndStroke(ctx, '#8a5a3c', '#5c3a26', 2.5);
    ctx.strokeStyle = '#6b4430';
    ctx.lineWidth = 2;
    for (const y of [40, 60]) {
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(76, y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(50, 22);
    ctx.lineTo(50, 82);
    ctx.stroke();
    roundRectPath(ctx, 18, 56, 64, 30, 5);
    fillAndStroke(ctx, '#c9a7ef', '#8a6ccc', 2.5);
    heartPath(ctx, 50, 71, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  },
  'food-cookies': (ctx) => {
    for (const [x, y] of [[38, 46], [62, 60]] as const) {
      ellipsePath(ctx, x, y, 22, 20);
      fillAndStroke(ctx, '#e8b277', '#b98348', 2.5);
      ctx.fillStyle = '#6b4430';
      for (const [dx, dy] of [[-8, -6], [6, -8], [0, 4], [9, 6], [-9, 7]] as const) {
        ellipsePath(ctx, x + dx, y + dy, 2.6, 2.6);
        ctx.fill();
      }
    }
  },
  'food-pasta': (ctx) => {
    roundRectPath(ctx, 26, 16, 48, 74, 6);
    fillAndStroke(ctx, '#fff3c4', '#d9b04e', 2.5);
    roundRectPath(ctx, 30, 40, 40, 30, 5);
    fillAndStroke(ctx, '#8fc4ff', '#5f8fd6', 2);
    ctx.strokeStyle = '#f2c27b';
    ctx.lineWidth = 3;
    for (let x = 36; x <= 64; x += 7) {
      ctx.beginPath();
      ctx.moveTo(x, 46);
      ctx.quadraticCurveTo(x + 3, 55, x, 64);
      ctx.stroke();
    }
  },
  'toy-teddy': (ctx) => {
    const fur = '#d9aa7b';
    const s = '#9a6e4a';
    for (const x of [30, 70]) {
      ellipsePath(ctx, x, 22, 10, 10);
      fillAndStroke(ctx, fur, s, 2.5);
    }
    ellipsePath(ctx, 50, 72, 26, 22);
    fillAndStroke(ctx, fur, s, 2.5);
    ellipsePath(ctx, 50, 38, 24, 21);
    fillAndStroke(ctx, fur, s, 2.5);
    ellipsePath(ctx, 50, 45, 9, 7);
    ctx.fillStyle = '#f2d4b4';
    ctx.fill();
    ctx.fillStyle = '#4a3428';
    for (const [x, y, r] of [[41, 34, 3], [59, 34, 3], [50, 42, 3.5]] as const) {
      ellipsePath(ctx, x, y, r, r);
      ctx.fill();
    }
    heartPath(ctx, 50, 74, 16);
    ctx.fillStyle = '#ff8fb8';
    ctx.fill();
  },
  'toy-bunny': (ctx) => {
    const fur = '#ffffff';
    const s = '#c9b6e6';
    for (const x of [38, 62]) {
      roundRectPath(ctx, x - 7, 4, 14, 36, 7);
      fillAndStroke(ctx, fur, s, 2.5);
      roundRectPath(ctx, x - 3, 10, 6, 24, 3);
      ctx.fillStyle = '#ffd6e8';
      ctx.fill();
    }
    ellipsePath(ctx, 50, 74, 24, 20);
    fillAndStroke(ctx, fur, s, 2.5);
    ellipsePath(ctx, 50, 46, 22, 19);
    fillAndStroke(ctx, fur, s, 2.5);
    ctx.fillStyle = '#4a3428';
    for (const x of [42, 58]) {
      ellipsePath(ctx, x, 44, 3, 3.5);
      ctx.fill();
    }
    heartPath(ctx, 50, 52, 7);
    ctx.fillStyle = '#ff8fb8';
    ctx.fill();
  },
  'toy-unicorn': (ctx) => {
    ellipsePath(ctx, 52, 66, 30, 22);
    fillAndStroke(ctx, '#ffffff', '#c9b6e6', 2.5);
    ellipsePath(ctx, 40, 38, 18, 16);
    fillAndStroke(ctx, '#ffffff', '#c9b6e6', 2.5);
    ctx.beginPath();
    ctx.moveTo(34, 24);
    ctx.lineTo(40, 2);
    ctx.lineTo(46, 24);
    ctx.closePath();
    fillAndStroke(ctx, '#ffe066', '#d9b04e', 2);
    const mane = ['#ff9cc8', '#ffbf8a', '#ffe28a', '#9be0c1', '#8fc4ff'];
    mane.forEach((c, i) => {
      ellipsePath(ctx, 56 + i * 3, 28 + i * 7, 8, 6);
      fillAndStroke(ctx, c, shade(c, -0.25), 1.5);
    });
    ctx.fillStyle = '#4a3428';
    ellipsePath(ctx, 36, 38, 3, 3.5);
    ctx.fill();
    for (const x of [36, 64]) {
      roundRectPath(ctx, x - 5, 80, 10, 14, 4);
      fillAndStroke(ctx, '#ffffff', '#c9b6e6', 2);
    }
  },
  'toy-doll': (ctx) => {
    ctx.beginPath();
    ctx.moveTo(36, 50);
    ctx.lineTo(64, 50);
    ctx.lineTo(76, 90);
    ctx.lineTo(24, 90);
    ctx.closePath();
    fillAndStroke(ctx, '#ff9cc8', '#e07ca8', 2.5);
    ellipsePath(ctx, 50, 32, 20, 20);
    fillAndStroke(ctx, '#f7cfb0', '#d9a07a', 2.5);
    ctx.beginPath();
    ctx.ellipse(50, 26, 22, 16, 0, Math.PI, 0);
    ctx.closePath();
    fillAndStroke(ctx, '#f0c96a', '#c9a24a', 2.5);
    ctx.fillStyle = '#4a3428';
    for (const x of [43, 57]) {
      ellipsePath(ctx, x, 34, 2.5, 3);
      ctx.fill();
    }
    heartPath(ctx, 50, 68, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  },
  'toy-car': (ctx) => {
    ctx.beginPath();
    ctx.moveTo(10, 66);
    ctx.lineTo(10, 52);
    ctx.quadraticCurveTo(12, 44, 24, 44);
    ctx.lineTo(32, 30);
    ctx.lineTo(66, 30);
    ctx.lineTo(76, 44);
    ctx.quadraticCurveTo(90, 46, 90, 56);
    ctx.lineTo(90, 66);
    ctx.closePath();
    fillAndStroke(ctx, '#ff6f6f', '#c93a3a', 2.5);
    roundRectPath(ctx, 36, 34, 26, 12, 3);
    fillAndStroke(ctx, '#dff4ff', '#c93a3a', 2);
    for (const x of [28, 72]) {
      ellipsePath(ctx, x, 68, 10, 10);
      fillAndStroke(ctx, '#4a4e60', '#2f3242', 2);
    }
  },
  'toy-puzzle': (ctx) => {
    const colors = ['#ff9cc8', '#8fc4ff', '#ffe28a', '#9be0c1'];
    colors.forEach((c, i) => {
      const x = 18 + (i % 2) * 34;
      const y = 18 + Math.floor(i / 2) * 34;
      roundRectPath(ctx, x, y, 32, 32, 4);
      fillAndStroke(ctx, c, shade(c, -0.3), 2.5);
      ellipsePath(ctx, x + (i % 2 === 0 ? 32 : 0), y + 16, 6, 6);
      ctx.fillStyle = c;
      ctx.fill();
    });
  },
  'toy-ball': (ctx) => {
    ellipsePath(ctx, 50, 52, 36, 36);
    fillAndStroke(ctx, '#ffffff', '#c9b6e6', 3);
    ctx.save();
    ellipsePath(ctx, 50, 52, 35, 35);
    ctx.clip();
    const stripes = ['#ff8fb8', '#ffe28a', '#8fc4ff'];
    stripes.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(14 + i * 26, 14, 13, 80);
    });
    ctx.restore();
    ellipsePath(ctx, 38, 38, 8, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();
  },
  'toy-robot': (ctx) => {
    ctx.strokeStyle = '#9aa3bd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, 14);
    ctx.lineTo(50, 24);
    ctx.stroke();
    ellipsePath(ctx, 50, 12, 5, 5);
    fillAndStroke(ctx, '#ff8fb8', '#d9608d', 2);
    roundRectPath(ctx, 30, 24, 40, 30, 8);
    fillAndStroke(ctx, '#c9d6f0', '#7f8db0', 2.5);
    ctx.fillStyle = '#5fcfb0';
    for (const x of [42, 58]) {
      ellipsePath(ctx, x, 38, 5, 5);
      ctx.fill();
    }
    roundRectPath(ctx, 26, 56, 48, 34, 8);
    fillAndStroke(ctx, '#b6c6ea', '#7f8db0', 2.5);
    heartPath(ctx, 50, 73, 14);
    ctx.fillStyle = '#ff8fb8';
    ctx.fill();
  },
  'toy-blocks': (ctx) => {
    const blocks: [number, number, string, string][] = [
      [16, 56, '#8fc4ff', 'A'],
      [50, 56, '#ff9cc8', 'B'],
      [33, 22, '#ffe28a', 'C'],
    ];
    for (const [x, y, c, letter] of blocks) {
      roundRectPath(ctx, x, y, 32, 32, 5);
      fillAndStroke(ctx, c, shade(c, -0.3), 2.5);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, x + 16, y + 17);
    }
  },
  'toy-kitchen': (ctx) => {
    roundRectPath(ctx, 14, 30, 72, 60, 6);
    fillAndStroke(ctx, '#ffffff', '#c9b6e6', 2.5);
    roundRectPath(ctx, 14, 22, 72, 12, 4);
    fillAndStroke(ctx, '#ff9cc8', '#e07ca8', 2);
    for (const x of [32, 68]) {
      ellipsePath(ctx, x, 28, 9, 3);
      fillAndStroke(ctx, '#6b6f86', '#4a4e60', 1.5);
    }
    roundRectPath(ctx, 22, 44, 56, 38, 5);
    fillAndStroke(ctx, '#dff4ff', '#9aa3bd', 2);
    starPath(ctx, 50, 63, 9);
    ctx.fillStyle = '#ffe28a';
    ctx.fill();
  },
};

/** Zeichnet das Produktbild (Lebensmittel/Spielzeug) in eine Leinwand beliebiger Größe. */
export function drawItemIcon(canvas: HTMLCanvasElement, id: string): boolean {
  const painter = PAINTERS[id];
  const ctx = canvas.getContext('2d');
  if (!painter || !ctx) return false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(canvas.width / 100, canvas.height / 100);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  painter(ctx);
  ctx.restore();
  return true;
}

export function hasItemIcon(id: string): boolean {
  return id in PAINTERS;
}

/** Textur-Schlüssel für ein aufgestelltes Spielzeug. */
export function itemTextureKey(id: string): string {
  return `item-${id}`;
}

/** Ursprung (Fußpunkt) der Spielzeug-Grafik als Anteil der Höhe. */
export const ITEM_SPRITE_ORIGIN_Y = 78 / 84;

/** Spielzeug als Objekt in der Welt: Produktbild mit Bodenschatten (80 × 84 Einheiten). */
export function paintItemSprite(id: string): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(80, 84);
  groundShadow(ctx, 40, 76, 30, 7, 0.22);
  const { canvas: icon } = createCanvas(140, 140);
  drawItemIcon(icon, id);
  ctx.drawImage(icon, 5, 6, 70, 70);
  return canvas;
}
