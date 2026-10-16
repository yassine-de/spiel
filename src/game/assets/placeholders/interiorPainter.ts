/**
 * PLATZHALTER: Innenräume – Wände und Möbel.
 * Gezeichnet in Welt-Einheiten auf einer @2x-Leinwand.
 */
import { seededRandom } from '../../utils/math';
import { ellipsePath, fillAndStroke, flower, groundShadow, heartPath, roundRectPath, shade, sparklePath, starPath } from './canvasUtils';
import { unitCanvas } from './cityPainter';

/** Höhe der Rückwand in Welt-Einheiten (ein Wandstück ist 128 breit). */
export const WALL_HEIGHT = 176;

export type WallStyle = 'home' | 'boutique' | 'market' | 'toys' | 'bedroom' | 'kitchen' | 'salon' | 'cafe' | 'school';

export function paintWall(style: WallStyle): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(128, WALL_HEIGHT);
  const h = WALL_HEIGHT;
  switch (style) {
    case 'home':
      ctx.fillStyle = '#fff3e6';
      ctx.fillRect(0, 0, 128, h);
      ctx.fillStyle = '#ffd6e3';
      for (let y = 18; y < h - 30; y += 24) {
        for (let x = (y / 24) % 2 ? 12 : 0; x < 128; x += 24) {
          heartPath(ctx, x + 6, y, 7);
          ctx.fill();
        }
      }
      break;
    case 'boutique':
      for (let x = 0; x < 128; x += 32) {
        ctx.fillStyle = '#ffe4ef';
        ctx.fillRect(x, 0, 16, h);
        ctx.fillStyle = '#fff7fa';
        ctx.fillRect(x + 16, 0, 16, h);
      }
      break;
    case 'market':
      ctx.fillStyle = '#f2f3f8';
      ctx.fillRect(0, 0, 128, h);
      ctx.fillStyle = '#ffffff';
      for (let y = h * 0.5; y < h - 20; y += 16) {
        for (let x = 0; x < 128; x += 16) {
          ctx.fillRect(x + 1, y + 1, 14, 14);
        }
      }
      ctx.fillStyle = '#e8484e';
      ctx.fillRect(0, h * 0.46, 128, 6);
      break;
    case 'bedroom': {
      ctx.fillStyle = '#efe6ff';
      ctx.fillRect(0, 0, 128, h);
      const rand = seededRandom(23);
      for (let i = 0; i < 7; i++) {
        const x = 10 + rand() * 108;
        const y = 16 + rand() * (h - 60);
        if (i % 3 === 0) {
          // Mond
          ctx.fillStyle = '#fff3c4';
          ellipsePath(ctx, x, y, 7, 7);
          ctx.fill();
          ctx.fillStyle = '#efe6ff';
          ellipsePath(ctx, x + 3, y - 2, 6, 6);
          ctx.fill();
        } else {
          starPath(ctx, x, y, 5);
          ctx.fillStyle = i % 2 ? '#ffffff' : '#ffd6e8';
          ctx.fill();
        }
      }
      break;
    }
    case 'kitchen':
      ctx.fillStyle = '#f4fffa';
      ctx.fillRect(0, 0, 128, h);
      ctx.fillStyle = '#d6f5ea';
      for (let y = h * 0.42; y < h - 20; y += 16) {
        for (let x = (y / 16) % 2 ? 0 : 8; x < 128; x += 16) ctx.fillRect(x + 1, y + 1, 7, 7);
      }
      ctx.fillStyle = '#8fdccf';
      ctx.fillRect(0, h * 0.4, 128, 5);
      break;
    case 'salon':
      // Mintfarbene Tapete mit feinem Rautenmuster
      ctx.fillStyle = '#e3f6f0';
      ctx.fillRect(0, 0, 128, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 1.5;
      for (let x = -128; x < 256; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.moveTo(x + h, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffc2dc';
      for (let y = 16; y < h - 30; y += 32) {
        for (let x = (y / 32) % 2 ? 16 : 0; x < 128; x += 32) {
          ellipsePath(ctx, x, y, 2.2, 2.2);
          ctx.fill();
        }
      }
      break;
    case 'cafe': {
      // Oben warmer Putz, unten Holzvertäfelung
      ctx.fillStyle = '#fbf0dd';
      ctx.fillRect(0, 0, 128, h);
      const rand = seededRandom(41);
      ctx.fillStyle = 'rgba(160,110,70,0.18)';
      for (let i = 0; i < 10; i++) {
        ellipsePath(ctx, rand() * 128, 14 + rand() * (h * 0.4), 2.5, 1.6);
        ctx.fill();
      }
      const top = h * 0.52;
      const wood = ctx.createLinearGradient(0, top, 0, h);
      wood.addColorStop(0, '#b9825a');
      wood.addColorStop(1, '#94603f');
      ctx.fillStyle = wood;
      ctx.fillRect(0, top, 128, h - top);
      ctx.fillStyle = 'rgba(60,30,15,0.18)';
      for (let x = 0; x < 128; x += 16) ctx.fillRect(x, top, 1.5, h - top);
      ctx.fillStyle = '#d9a77c';
      ctx.fillRect(0, top - 4, 128, 6);
      break;
    }
    case 'school':
      // Hellgelbe Wand, grüner Sockel mit Leiste
      ctx.fillStyle = '#fff6d8';
      ctx.fillRect(0, 0, 128, h);
      ctx.fillStyle = '#cfe8c6';
      ctx.fillRect(0, h * 0.58, 128, h * 0.42);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, h * 0.58 - 4, 128, 5);
      ctx.fillStyle = 'rgba(80,120,70,0.12)';
      for (let x = 0; x < 128; x += 32) ctx.fillRect(x, h * 0.58, 1.5, h * 0.42);
      break;
    case 'toys': {
      ctx.fillStyle = '#e4f3ff';
      ctx.fillRect(0, 0, 128, h);
      const rand = seededRandom(17);
      const colors = ['#fff1a8', '#ffffff', '#ffd6e8'];
      for (let i = 0; i < 6; i++) {
        starPath(ctx, 10 + rand() * 108, 14 + rand() * (h - 60), 6);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
      }
      const bands = ['#ff9cc8', '#ffbf8a', '#ffe28a', '#9be0c1', '#8fc4ff'];
      bands.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(0, h - 44 + i * 4, 128, 4);
      });
      break;
    }
  }
  // Stuckleiste oben, Sockelleiste unten
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(0, 0, 128, 8);
  ctx.fillStyle = 'rgba(160, 120, 170, 0.25)';
  ctx.fillRect(0, 8, 128, 2);
  ctx.fillStyle = '#e9dcf5';
  ctx.fillRect(0, h - 18, 128, 18);
  ctx.fillStyle = '#c9b6e6';
  ctx.fillRect(0, h - 18, 128, 3);
  return canvas;
}

export function paintWallWindow(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(110, 90);
  roundRectPath(ctx, 5, 5, 100, 80, 12);
  fillAndStroke(ctx, '#ffffff', '#c9a7ef', 3);
  roundRectPath(ctx, 12, 12, 86, 66, 8);
  const sky = ctx.createLinearGradient(0, 12, 0, 78);
  sky.addColorStop(0, '#bfe6ff');
  sky.addColorStop(1, '#e8f7ff');
  ctx.fillStyle = sky;
  ctx.fill();
  ellipsePath(ctx, 40, 40, 16, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#ffc2dc';
  for (const side of [0, 1]) {
    const sx = side === 0 ? 12 : 98;
    const dir = side === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(sx, 12);
    ctx.lineTo(sx + dir * 26, 12);
    ctx.quadraticCurveTo(sx + dir * 8, 45, sx + dir * 18, 78);
    ctx.lineTo(sx, 78);
    ctx.closePath();
    ctx.fill();
  }
  return canvas;
}

/** Rahmen für Poster/Schilder an der Wand (Text kommt aus der Szene). */
export function paintWallBoard(fill: string, border: string, width: number, height: number): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(width, height);
  roundRectPath(ctx, 3, 3, width - 6, height - 6, Math.min(16, height / 3));
  fillAndStroke(ctx, fill, border, 4);
  return canvas;
}

export type ShelfGoods = 'groceries' | 'toys' | 'books';

export function paintShelf(goods: ShelfGoods): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(170, 160);
  groundShadow(ctx, 85, 152, 80, 8, 0.2);
  const wood = goods === 'groceries' ? '#e6e8f2' : '#f2c29b';
  const woodStroke = shade(wood, -0.3);
  roundRectPath(ctx, 8, 8, 154, 144, 8);
  fillAndStroke(ctx, wood, woodStroke, 2.5);
  roundRectPath(ctx, 16, 14, 138, 132, 4);
  ctx.fillStyle = shade(wood, -0.12);
  ctx.fill();
  const rand = seededRandom(goods.length * 31);
  for (let shelf = 0; shelf < 3; shelf++) {
    const y = 54 + shelf * 44;
    roundRectPath(ctx, 12, y, 146, 7, 2);
    fillAndStroke(ctx, wood, woodStroke, 1.5);
    let x = 20;
    while (x < 146) {
      const w = goods === 'books' ? 8 + rand() * 6 : 14 + rand() * 8;
      if (x + w > 150) break;
      const h = goods === 'books' ? 22 + rand() * 10 : 18 + rand() * 14;
      drawGood(ctx, goods, x, y, w, h, rand);
      x += w + 3;
    }
  }
  return canvas;
}

function drawGood(ctx: CanvasRenderingContext2D, goods: ShelfGoods, x: number, y: number, w: number, h: number, rand: () => number): void {
  if (goods === 'books') {
    const c = ['#ff8fb8', '#8fc4ff', '#ffd36e', '#9be0c1', '#c9a7ef'][Math.floor(rand() * 5)];
    roundRectPath(ctx, x, y - h, w, h, 2);
    fillAndStroke(ctx, c, shade(c, -0.25), 1.2);
    return;
  }
  if (goods === 'toys') {
    const kind = Math.floor(rand() * 3);
    if (kind === 0) {
      ellipsePath(ctx, x + w / 2, y - 10, 9, 9);
      fillAndStroke(ctx, '#ff8fb8', '#d9608d', 1.2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + w / 2 - 9, y - 11, 18, 3);
    } else if (kind === 1) {
      for (const ex of [-5, 5]) {
        ellipsePath(ctx, x + w / 2 + ex, y - 21, 4, 4);
        fillAndStroke(ctx, '#c99a6b', '#9a6e4a', 1);
      }
      ellipsePath(ctx, x + w / 2, y - 13, 9, 11);
      fillAndStroke(ctx, '#d9aa7b', '#9a6e4a', 1.2);
    } else {
      const c = ['#8fdccf', '#ffd36e', '#b9a2f5'][Math.floor(rand() * 3)];
      roundRectPath(ctx, x, y - 16, w, 16, 3);
      fillAndStroke(ctx, c, shade(c, -0.25), 1.2);
      starPath(ctx, x + w / 2, y - 8, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    return;
  }
  // Lebensmittel: Packungen und Dosen
  const c = ['#ff6f6f', '#ffd36e', '#8fdc8f', '#ffa86f', '#c9a7ef', '#8fc4ff'][Math.floor(rand() * 6)];
  if (rand() > 0.5) {
    roundRectPath(ctx, x, y - h, w, h, 3);
    fillAndStroke(ctx, c, shade(c, -0.25), 1.2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(x + 2, y - h * 0.6, w - 4, 4);
  } else {
    roundRectPath(ctx, x + 1, y - 18, w - 2, 18, 4);
    fillAndStroke(ctx, c, shade(c, -0.25), 1.2);
    ellipsePath(ctx, x + w / 2, y - 18, (w - 2) / 2, 2.5);
    ctx.fillStyle = '#e6e8f2';
    ctx.fill();
  }
}

export function paintCooler(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(160, 170);
  groundShadow(ctx, 80, 162, 76, 7, 0.2);
  roundRectPath(ctx, 8, 6, 144, 156, 10);
  fillAndStroke(ctx, '#f4f6fb', '#a9b2cc', 2.5);
  for (let i = 0; i < 2; i++) {
    const x = 16 + i * 66;
    roundRectPath(ctx, x, 14, 62, 140, 6);
    fillAndStroke(ctx, '#dcf2ff', '#a9b2cc', 2);
    for (let shelf = 0; shelf < 3; shelf++) {
      const y = 52 + shelf * 40;
      ctx.fillStyle = '#b6c3dd';
      ctx.fillRect(x + 4, y, 54, 2);
      for (let b = 0; b < 4; b++) {
        const bx = x + 8 + b * 13;
        if (shelf === 0) {
          // Milchflaschen
          roundRectPath(ctx, bx, y - 24, 9, 24, [3, 3, 2, 2]);
          fillAndStroke(ctx, '#ffffff', '#b6c3dd', 1);
          ctx.fillStyle = '#8fc4ff';
          ctx.fillRect(bx, y - 14, 9, 5);
        } else if (shelf === 1) {
          // Joghurt
          roundRectPath(ctx, bx, y - 12, 10, 12, 2);
          fillAndStroke(ctx, ['#ffd6e8', '#fff1a8'][b % 2], '#d9a7c0', 1);
        } else {
          // Eis
          roundRectPath(ctx, bx - 1, y - 14, 12, 14, 2);
          fillAndStroke(ctx, ['#c9a7ef', '#8fdccf'][b % 2], '#8a6ccc', 1);
        }
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 8, 24);
    ctx.lineTo(x + 18, 44);
    ctx.stroke();
  }
  return canvas;
}

export function paintFruitStand(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(170, 100);
  groundShadow(ctx, 85, 92, 80, 7, 0.2);
  const fruits: [string, string][] = [
    ['#ff5f6f', '#c93a4a'],
    ['#ffe066', '#d9b04e'],
    ['#ff7f9f', '#d9506f'],
  ];
  fruits.forEach(([c, s], i) => {
    const x = 10 + i * 52;
    roundRectPath(ctx, x, 46, 48, 40, 5);
    fillAndStroke(ctx, '#e2b991', '#a87652', 2);
    ctx.fillStyle = '#c99a6b';
    ctx.fillRect(x + 4, 62, 40, 3);
    for (let k = 0; k < 6; k++) {
      const fx = x + 10 + (k % 3) * 14;
      const fy = 44 - Math.floor(k / 3) * 8 + (k % 2) * 2;
      if (i === 1) {
        ctx.beginPath();
        ctx.ellipse(fx, fy, 9, 4, -0.4, 0, Math.PI * 2);
        fillAndStroke(ctx, c, s, 1.2);
      } else {
        ellipsePath(ctx, fx, fy, 6.5, 6.5);
        fillAndStroke(ctx, c, s, 1.2);
        ctx.fillStyle = '#6fbf7d';
        ctx.fillRect(fx - 1, fy - 9, 2, 4);
      }
    }
  });
  return canvas;
}

export function paintCounter(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(220, 120);
  groundShadow(ctx, 110, 112, 104, 8, 0.2);
  roundRectPath(ctx, 8, 46, 204, 64, 8);
  fillAndStroke(ctx, '#ffd6e8', '#e07ca8', 2.5);
  roundRectPath(ctx, 4, 40, 212, 14, 6);
  fillAndStroke(ctx, '#ffffff', '#e07ca8', 2);
  // Förderband
  roundRectPath(ctx, 14, 42, 110, 10, 4);
  fillAndStroke(ctx, '#6b6f86', '#4a4e60', 1.5);
  // Kasse
  roundRectPath(ctx, 140, 14, 60, 34, 6);
  fillAndStroke(ctx, '#e6e8f2', '#9aa3bd', 2);
  roundRectPath(ctx, 148, 20, 30, 14, 3);
  fillAndStroke(ctx, '#bff0d8', '#5fb3a6', 1.5);
  for (let i = 0; i < 3; i++) {
    ellipsePath(ctx, 186, 22 + i * 8, 3, 3);
    ctx.fillStyle = '#ff8fb8';
    ctx.fill();
  }
  heartPath(ctx, 110, 80, 22);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  return canvas;
}

export function paintClothesRack(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(170, 160);
  groundShadow(ctx, 85, 152, 78, 7, 0.2);
  ctx.strokeStyle = '#c9a7ef';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(14, 150);
  ctx.lineTo(14, 20);
  ctx.lineTo(156, 20);
  ctx.lineTo(156, 150);
  ctx.stroke();
  const colors = ['#ff8fc2', '#8fb8ff', '#ffd36e', '#9be0c1', '#b9a2f5', '#ff9f8f'];
  for (let i = 0; i < 6; i++) {
    const x = 30 + i * 22;
    ctx.strokeStyle = '#9a8fb8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, 30);
    ctx.stroke();
    const c = colors[i];
    if (i % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(x - 9, 30);
      ctx.lineTo(x + 9, 30);
      ctx.lineTo(x + 16, 100);
      ctx.lineTo(x - 16, 100);
      ctx.closePath();
    } else {
      roundRectPath(ctx, x - 11, 30, 22, 56, [8, 8, 3, 3]);
    }
    fillAndStroke(ctx, c, shade(c, -0.25), 1.5);
  }
  return canvas;
}

export function paintDisplayTable(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(160, 90);
  groundShadow(ctx, 80, 84, 74, 6, 0.2);
  roundRectPath(ctx, 10, 40, 140, 40, 8);
  fillAndStroke(ctx, '#ffffff', '#e07ca8', 2.5);
  const colors = ['#ff8fc2', '#9be0c1', '#ffd36e', '#b9a2f5'];
  colors.forEach((c, i) => {
    for (let k = 0; k < 3; k++) {
      roundRectPath(ctx, 18 + i * 33, 34 - k * 7, 28, 8, 3);
      fillAndStroke(ctx, shade(c, k * 0.08), shade(c, -0.25), 1.2);
    }
  });
  return canvas;
}

export function paintMirror(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(80, 160);
  groundShadow(ctx, 40, 152, 30, 6, 0.2);
  roundRectPath(ctx, 32, 120, 16, 30, 4);
  fillAndStroke(ctx, '#f2c29b', '#c38d68', 1.5);
  ellipsePath(ctx, 40, 68, 34, 58);
  fillAndStroke(ctx, '#ffb3d1', '#e07ca8', 3);
  ellipsePath(ctx, 40, 68, 26, 50);
  const glass = ctx.createLinearGradient(14, 20, 66, 118);
  glass.addColorStop(0, '#ffffff');
  glass.addColorStop(1, '#cfeaf7');
  ctx.fillStyle = glass;
  ctx.fill();
  sparklePath(ctx, 28, 42, 7);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  return canvas;
}

export function paintPlant(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(70, 110);
  groundShadow(ctx, 35, 104, 24, 5, 0.2);
  roundRectPath(ctx, 16, 66, 38, 36, [4, 4, 10, 10]);
  fillAndStroke(ctx, '#ffb38a', '#d98a5f', 2);
  const leaves: [number, number, number][] = [
    [35, 34, 0],
    [20, 46, -0.7],
    [50, 46, 0.7],
    [26, 26, -0.3],
    [44, 24, 0.3],
  ];
  for (const [x, y, r] of leaves) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r);
    ellipsePath(ctx, 0, 0, 10, 22);
    fillAndStroke(ctx, '#7fcf86', '#5aa866', 1.5);
    ctx.restore();
  }
  return canvas;
}

export function paintRug(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(240, 120);
  ellipsePath(ctx, 120, 60, 114, 54);
  fillAndStroke(ctx, '#ffd6e8', '#ff9cc5', 4);
  ellipsePath(ctx, 120, 60, 92, 40);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.stroke();
  ctx.setLineDash([]);
  heartPath(ctx, 120, 62, 34);
  ctx.fillStyle = '#ffb3d1';
  ctx.fill();
  return canvas;
}

export function paintSofa(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(230, 130);
  groundShadow(ctx, 115, 122, 108, 8, 0.2);
  const c = '#b9a2f5';
  const s = shade(c, -0.3);
  roundRectPath(ctx, 20, 20, 190, 60, 22);
  fillAndStroke(ctx, c, s, 2.5);
  roundRectPath(ctx, 16, 66, 198, 44, 14);
  fillAndStroke(ctx, shade(c, 0.12), s, 2.5);
  for (const x of [6, 190]) {
    roundRectPath(ctx, x, 50, 34, 64, 14);
    fillAndStroke(ctx, c, s, 2.5);
  }
  roundRectPath(ctx, 48, 36, 46, 36, 12);
  fillAndStroke(ctx, '#ffd6e8', '#e07ca8', 2);
  heartPath(ctx, 71, 54, 16);
  ctx.fillStyle = '#ff8fb8';
  ctx.fill();
  roundRectPath(ctx, 140, 36, 46, 36, 12);
  fillAndStroke(ctx, '#fff1a8', '#e0b84e', 2);
  return canvas;
}

export function paintCoffeeTable(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(140, 80);
  groundShadow(ctx, 70, 72, 62, 6, 0.2);
  for (const x of [22, 112]) {
    roundRectPath(ctx, x, 40, 8, 32, 3);
    fillAndStroke(ctx, '#c38d68', '#9a6e52', 1.5);
  }
  ellipsePath(ctx, 70, 38, 62, 18);
  fillAndStroke(ctx, '#f2c29b', '#c38d68', 2.5);
  roundRectPath(ctx, 54, 18, 14, 16, [2, 2, 5, 5]);
  fillAndStroke(ctx, '#ffffff', '#e07ca8', 1.5);
  flower(ctx, 90, 26, 6, '#ff8fb8');
  return canvas;
}

export function paintTv(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(170, 140);
  groundShadow(ctx, 85, 132, 78, 7, 0.2);
  roundRectPath(ctx, 12, 84, 146, 46, 8);
  fillAndStroke(ctx, '#f2c29b', '#c38d68', 2.5);
  for (const x of [26, 92]) {
    roundRectPath(ctx, x, 94, 52, 26, 5);
    fillAndStroke(ctx, '#f7d3b2', '#c38d68', 1.5);
  }
  roundRectPath(ctx, 26, 10, 118, 72, 8);
  fillAndStroke(ctx, '#4a4e60', '#2f3242', 2.5);
  roundRectPath(ctx, 32, 16, 106, 60, 5);
  const screen = ctx.createLinearGradient(32, 16, 138, 76);
  screen.addColorStop(0, '#bfe6ff');
  screen.addColorStop(1, '#ffd6e8');
  ctx.fillStyle = screen;
  ctx.fill();
  heartPath(ctx, 85, 46, 26);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fill();
  return canvas;
}

export function paintBigTeddy(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(120, 140);
  groundShadow(ctx, 60, 132, 46, 7, 0.2);
  const fur = '#d9aa7b';
  const s = '#9a6e4a';
  ellipsePath(ctx, 60, 98, 36, 34);
  fillAndStroke(ctx, fur, s, 2.5);
  for (const x of [32, 88]) {
    ellipsePath(ctx, x, 120, 14, 11);
    fillAndStroke(ctx, fur, s, 2);
  }
  for (const x of [30, 90]) {
    ellipsePath(ctx, x, 26, 13, 13);
    fillAndStroke(ctx, fur, s, 2.5);
    ellipsePath(ctx, x, 26, 6, 6);
    ctx.fillStyle = '#f2c9a0';
    ctx.fill();
  }
  ellipsePath(ctx, 60, 50, 34, 30);
  fillAndStroke(ctx, fur, s, 2.5);
  ellipsePath(ctx, 60, 60, 14, 10);
  ctx.fillStyle = '#f2d4b4';
  ctx.fill();
  ellipsePath(ctx, 60, 55, 5, 3.5);
  ctx.fillStyle = '#4a3428';
  ctx.fill();
  for (const x of [47, 73]) {
    ellipsePath(ctx, x, 46, 4, 4.5);
    ctx.fill();
  }
  heartPath(ctx, 60, 98, 24);
  ctx.fillStyle = '#ff8fb8';
  ctx.fill();
  // Schleife
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(60, 78);
    ctx.lineTo(60 + side * 14, 70);
    ctx.lineTo(60 + side * 14, 86);
    ctx.closePath();
    fillAndStroke(ctx, '#8fc4ff', '#5f8fd6', 1.5);
  }
  return canvas;
}

/** Ausgang am unteren Raumrand: Fußmatte mit Pfeil nach unten. */
export function paintExitMat(): HTMLCanvasElement {
  const { canvas, ctx } = unitCanvas(140, 60);
  roundRectPath(ctx, 6, 8, 128, 44, 12);
  fillAndStroke(ctx, '#ffb3d1', '#e07ca8', 3);
  roundRectPath(ctx, 14, 15, 112, 30, 8);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(56, 22);
  ctx.lineTo(84, 22);
  ctx.lineTo(70, 40);
  ctx.closePath();
  ctx.fill();
  return canvas;
}
