/**
 * PLATZHALTER: Prozedural gezeichnete Umgebungsgrafiken (Boden, Bäume, Brunnen, …).
 * Alle Grafiken sind @2x (siehe ASSET_SCALE) und werden ersetzt,
 * sobald echte Grafiken im assetManifest eingetragen sind.
 */
import { GROUND_TILESET, GROUND_TILE_COUNT, GroundTile, type GroundTileId } from '../assetKeys';
import { seededRandom } from '../../utils/math';
import {
  createCanvas,
  ellipsePath,
  fillAndStroke,
  flower,
  groundShadow,
  heartPath,
  rgba,
  roundRectPath,
  shade,
  sparklePath,
} from './canvasUtils';

/* ------------------------------------------------------------------ */
/* Bodenkacheln                                                        */
/* ------------------------------------------------------------------ */

const T = GROUND_TILESET.tilePx;

export function paintGroundTileset(): HTMLCanvasElement {
  const e = GROUND_TILESET.extrude;
  const cell = T + e * 2;
  const { canvas, ctx } = createCanvas(cell * GROUND_TILE_COUNT, cell);
  for (let id = 0; id < GROUND_TILE_COUNT; id++) {
    const tile = paintGroundTile(id as GroundTileId);
    const x0 = id * cell;
    ctx.drawImage(tile, x0 + e, e);
    // Ränder um `extrude` Pixel nach außen verlängern (verhindert Nahtlinien)
    ctx.drawImage(tile, 0, 0, 1, T, x0, e, e, T);
    ctx.drawImage(tile, T - 1, 0, 1, T, x0 + e + T, e, e, T);
    ctx.drawImage(canvas, x0, e, cell, 1, x0, 0, cell, e);
    ctx.drawImage(canvas, x0, e + T - 1, cell, 1, x0, e + T, cell, e);
  }
  return canvas;
}

function paintGroundTile(id: GroundTileId): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(T, T);
  const rand = seededRandom(1000 + id * 77);
  switch (id) {
    case GroundTile.Grass:
      grass(ctx, rand, '#b6e7a2', 10);
      break;
    case GroundTile.GrassFlowers:
      grass(ctx, rand, '#b6e7a2', 6);
      for (let i = 0; i < 3; i++) {
        const colors = ['#ffffff', '#ffc4de', '#fff1a8'];
        flower(ctx, 20 + rand() * 88, 20 + rand() * 88, 6, colors[i % colors.length]);
      }
      break;
    case GroundTile.GrassLight:
      grass(ctx, rand, '#c0ecad', 5);
      break;
    case GroundTile.Plaza:
      plaza(ctx);
      break;
    case GroundTile.Sidewalk:
      sidewalk(ctx);
      break;
    case GroundTile.Road:
      road(ctx, rand);
      break;
    case GroundTile.RoadLine:
      road(ctx, rand);
      roundRectPath(ctx, 20, 59, 88, 10, 5);
      ctx.fillStyle = '#fffaf0';
      ctx.fill();
      break;
    case GroundTile.Crosswalk:
      road(ctx, rand);
      ctx.fillStyle = '#fdfbf6';
      for (const x of [16, 80]) {
        roundRectPath(ctx, x, 4, 32, T - 8, 6);
        ctx.fill();
      }
      break;
    case GroundTile.CurbAboveRoad:
      sidewalk(ctx);
      curb(ctx, T - 18);
      break;
    case GroundTile.CurbBelowRoad:
      sidewalk(ctx);
      curb(ctx, 0);
      break;
    case GroundTile.ParkPath:
      parkPath(ctx, rand);
      break;
    case GroundTile.WoodFloor:
      woodFloor(ctx);
      break;
    case GroundTile.CheckerFloor:
      checkerFloor(ctx, '#ffffff', '#e9ecf5');
      break;
    case GroundTile.PinkTileFloor:
      checkerFloor(ctx, '#fff1f7', '#ffdcec');
      break;
    case GroundTile.CarpetFloor:
      carpetFloor(ctx, rand);
      break;
    case GroundTile.KitchenFloor:
      checkerFloor(ctx, '#ffffff', '#d6f5ea');
      break;
  }
  return canvas;
}

function grass(ctx: CanvasRenderingContext2D, rand: () => number, base: string, blades: number): void {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, T, T);
  for (let i = 0; i < 6; i++) {
    ellipsePath(ctx, 14 + rand() * 100, 14 + rand() * 100, 10 + rand() * 12, 6 + rand() * 6);
    ctx.fillStyle = rgba('#d6f5c6', 0.45);
    ctx.fill();
  }
  ctx.strokeStyle = shade(base, -0.16);
  ctx.lineWidth = 2.5;
  for (let i = 0; i < blades; i++) {
    const x = 10 + rand() * 108;
    const y = 12 + rand() * 104;
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 6);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 4, y - 7);
    ctx.stroke();
  }
}

function plaza(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#ead3c0';
  ctx.fillRect(0, 0, T, T);
  const size = 32;
  for (let row = 0; row < 4; row++) {
    const offset = row % 2 === 0 ? 0 : -size / 2;
    for (let col = -1; col < 5; col++) {
      const x = col * size + offset;
      const y = row * size;
      roundRectPath(ctx, x + 2, y + 2, size - 4, size - 4, 7);
      ctx.fillStyle = (row + col) % 3 === 0 ? '#f6e3d4' : '#f9ecdf';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 5);
      ctx.lineTo(x + size - 10, y + 5);
      ctx.stroke();
    }
  }
}

function sidewalk(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#d9d3e8';
  ctx.fillRect(0, 0, T, T);
  for (const x of [0, 64]) {
    for (const y of [0, 64]) {
      roundRectPath(ctx, x + 3, y + 3, 58, 58, 8);
      ctx.fillStyle = '#ebe7f5';
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + 10, y + 7, 40, 3);
    }
  }
}

function curb(ctx: CanvasRenderingContext2D, y: number): void {
  ctx.fillStyle = '#c5bdd9';
  ctx.fillRect(0, y, T, 18);
  ctx.fillStyle = '#f5f2fb';
  ctx.fillRect(0, y + (y === 0 ? 12 : 0), T, 5);
}

function parkPath(ctx: CanvasRenderingContext2D, rand: () => number): void {
  ctx.fillStyle = '#f2dfc0';
  ctx.fillRect(0, 0, T, T);
  for (let i = 0; i < 22; i++) {
    ellipsePath(ctx, 6 + rand() * 116, 6 + rand() * 116, 2 + rand() * 3, 1.5 + rand() * 2);
    ctx.fillStyle = rand() > 0.5 ? 'rgba(190, 150, 110, 0.35)' : 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
  }
}

function woodFloor(ctx: CanvasRenderingContext2D): void {
  const planks = ['#e8c39e', '#e2b991', '#ecc9a6', '#e4bd96'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = planks[i];
    ctx.fillRect(0, i * 32, T, 32);
    ctx.fillStyle = 'rgba(150, 100, 60, 0.35)';
    ctx.fillRect(0, i * 32 + 30, T, 2);
    const seam = (i % 2 === 0 ? 40 : 96);
    ctx.fillRect(seam, i * 32, 2, 30);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, i * 32 + 2, T, 2);
  }
}

function checkerFloor(ctx: CanvasRenderingContext2D, a: string, b: string): void {
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? a : b;
      ctx.fillRect(col * 64, row * 64, 64, 64);
    }
  }
  ctx.strokeStyle = 'rgba(160, 150, 190, 0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 62, 62);
  ctx.strokeRect(65, 65, 62, 62);
}

function carpetFloor(ctx: CanvasRenderingContext2D, rand: () => number): void {
  ctx.fillStyle = '#e3d6ff';
  ctx.fillRect(0, 0, T, T);
  const colors = ['#ffffff', '#ffd6e8', '#fff1a8'];
  for (let i = 0; i < 4; i++) {
    sparklePath(ctx, 16 + rand() * 96, 16 + rand() * 96, 7);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
  }
}

function road(ctx: CanvasRenderingContext2D, rand: () => number): void {
  ctx.fillStyle = '#9ea4bd';
  ctx.fillRect(0, 0, T, T);
  for (let i = 0; i < 28; i++) {
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(60,60,90,0.1)';
    ellipsePath(ctx, 4 + rand() * 120, 4 + rand() * 120, 1.5 + rand() * 2, 1.5 + rand() * 2);
    ctx.fill();
  }
}

/* ------------------------------------------------------------------ */
/* Pflanzen                                                            */
/* ------------------------------------------------------------------ */

interface TreePalette {
  leaves: string;
  blossom?: string;
}

export function paintTree(palette: TreePalette, seed: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(256, 336);
  const rand = seededRandom(seed);
  groundShadow(ctx, 128, 314, 74, 20, 0.24);

  // Stamm
  ctx.beginPath();
  ctx.moveTo(108, 318);
  ctx.quadraticCurveTo(118, 260, 116, 196);
  ctx.lineTo(140, 196);
  ctx.quadraticCurveTo(138, 260, 148, 318);
  ctx.quadraticCurveTo(128, 326, 108, 318);
  const bark = ctx.createLinearGradient(108, 0, 148, 0);
  bark.addColorStop(0, '#c99a77');
  bark.addColorStop(1, '#a87a5a');
  fillAndStroke(ctx, bark, '#8a6248', 4);

  // Baumkrone: erst Kontur, dann Füllung, dann Glanzlichter
  const blobs: [number, number, number][] = [
    [128, 128, 84],
    [70, 160, 56],
    [186, 160, 56],
    [96, 196, 50],
    [160, 196, 50],
    [80, 104, 46],
    [176, 104, 46],
    [128, 72, 54],
  ];
  const dark = shade(palette.leaves, -0.3);
  ctx.fillStyle = dark;
  for (const [x, y, r] of blobs) {
    ellipsePath(ctx, x, y, r + 4, r + 4);
    ctx.fill();
  }
  for (const [x, y, r] of blobs) {
    ellipsePath(ctx, x, y, r, r);
    const gradient = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    gradient.addColorStop(0, shade(palette.leaves, 0.25));
    gradient.addColorStop(1, palette.leaves);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  ctx.fillStyle = rgba('#ffffff', 0.3);
  for (const [x, y, r] of [[96, 70, 22], [146, 52, 14], [62, 128, 14]] as const) {
    ellipsePath(ctx, x, y, r, r * 0.7);
    ctx.fill();
  }
  if (palette.blossom) {
    for (let i = 0; i < 9; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = 20 + rand() * 70;
      flower(ctx, 128 + Math.cos(angle) * dist * 1.2, 135 + Math.sin(angle) * dist, 8, palette.blossom, '#fff6c8');
    }
  }
  return canvas;
}

export function paintBush(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(192, 132);
  groundShadow(ctx, 96, 116, 84, 14, 0.2);
  const blobs: [number, number, number][] = [
    [96, 66, 46],
    [50, 84, 34],
    [142, 84, 34],
    [70, 96, 30],
    [124, 96, 30],
  ];
  ctx.fillStyle = '#5fae74';
  for (const [x, y, r] of blobs) {
    ellipsePath(ctx, x, y, r + 4, r + 4);
    ctx.fill();
  }
  for (const [x, y, r] of blobs) {
    ellipsePath(ctx, x, y, r, r);
    const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, 2, x, y, r);
    gradient.addColorStop(0, '#a6e3a8');
    gradient.addColorStop(1, '#7fcc8c');
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  for (const [x, y] of [[70, 60], [118, 52], [100, 92], [146, 80], [48, 86]] as const) {
    ellipsePath(ctx, x, y, 5, 5);
    fillAndStroke(ctx, '#ff8fb8', '#d9608d', 2);
  }
  return canvas;
}

export function paintFlowerPatch(colors: string[], seed: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(144, 96);
  const rand = seededRandom(seed);
  groundShadow(ctx, 72, 80, 64, 12, 0.12);
  ctx.fillStyle = '#7fcf86';
  for (let i = 0; i < 9; i++) {
    const x = 20 + rand() * 104;
    const y = 56 + rand() * 26;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rand() - 0.5) * 1.2);
    ellipsePath(ctx, 0, 0, 12, 5);
    fillAndStroke(ctx, '#86d68c', '#5aa866', 2);
    ctx.restore();
  }
  const positions: [number, number][] = [
    [30, 52],
    [62, 40],
    [96, 50],
    [118, 64],
    [48, 70],
    [84, 72],
  ];
  positions.forEach(([x, y], i) => {
    ctx.strokeStyle = '#5aa866';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 4, y + 18);
    ctx.stroke();
    flower(ctx, x, y, 11, colors[i % colors.length]);
  });
  return canvas;
}

/* ------------------------------------------------------------------ */
/* Stadtmobiliar                                                       */
/* ------------------------------------------------------------------ */

export function paintLamp(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(80, 320);
  groundShadow(ctx, 40, 306, 26, 8, 0.22);
  // Sockel
  roundRectPath(ctx, 24, 282, 32, 24, 8);
  fillAndStroke(ctx, '#86c9bf', '#5c9f96', 3);
  // Mast
  roundRectPath(ctx, 34, 90, 12, 196, 6);
  fillAndStroke(ctx, '#a3dcd3', '#5c9f96', 3);
  // Verzierung
  ellipsePath(ctx, 40, 200, 10, 6);
  fillAndStroke(ctx, '#86c9bf', '#5c9f96', 3);
  // Laterne mit warmem Leuchten
  const glow = ctx.createRadialGradient(40, 62, 4, 40, 62, 40);
  glow.addColorStop(0, 'rgba(255, 240, 180, 0.65)');
  glow.addColorStop(1, 'rgba(255, 240, 180, 0)');
  ctx.fillStyle = glow;
  ellipsePath(ctx, 40, 62, 40, 40);
  ctx.fill();
  roundRectPath(ctx, 22, 40, 36, 50, 10);
  const glass = ctx.createLinearGradient(0, 40, 0, 90);
  glass.addColorStop(0, '#fff8d6');
  glass.addColorStop(1, '#ffe08a');
  fillAndStroke(ctx, glass, '#5c9f96', 4);
  ctx.beginPath();
  ctx.moveTo(14, 44);
  ctx.quadraticCurveTo(40, 14, 66, 44);
  ctx.closePath();
  fillAndStroke(ctx, '#86c9bf', '#5c9f96', 3);
  ellipsePath(ctx, 40, 22, 6, 6);
  fillAndStroke(ctx, '#ff9cc5', '#d9709c', 2.5);
  return canvas;
}

export function paintBench(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(240, 156);
  groundShadow(ctx, 120, 138, 108, 14, 0.2);
  const wood = '#f2c29b';
  const woodStroke = '#c38d68';
  const metal = '#9b8fc9';
  // Beine
  for (const x of [34, 196]) {
    roundRectPath(ctx, x, 88, 12, 50, 4);
    fillAndStroke(ctx, metal, shade(metal, -0.3), 3);
  }
  // Rückenlehne
  for (const y of [22, 50]) {
    roundRectPath(ctx, 16, y, 208, 22, 9);
    fillAndStroke(ctx, wood, woodStroke, 3.5);
  }
  // Sitzfläche (von oben schräg sichtbar)
  ctx.beginPath();
  ctx.moveTo(18, 84);
  ctx.lineTo(222, 84);
  ctx.lineTo(232, 108);
  ctx.lineTo(8, 108);
  ctx.closePath();
  fillAndStroke(ctx, shade(wood, 0.1), woodStroke, 3.5);
  roundRectPath(ctx, 8, 106, 224, 12, 5);
  fillAndStroke(ctx, shade(wood, -0.1), woodStroke, 3);
  // Armlehnen
  for (const x of [10, 216]) {
    roundRectPath(ctx, x, 60, 14, 50, 6);
    fillAndStroke(ctx, metal, shade(metal, -0.3), 3);
  }
  heartPath(ctx, 120, 44, 16);
  ctx.fillStyle = '#ff9cc5';
  ctx.fill();
  return canvas;
}

export function paintFountain(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(448, 340);
  const cx = 224;
  groundShadow(ctx, cx, 306, 214, 40, 0.2);
  const stone = '#ece4f7';
  const stoneDark = '#b9acd4';

  // Beckenwand (Zylinder)
  ctx.beginPath();
  ctx.ellipse(cx, 268, 200, 62, 0, 0, Math.PI);
  ctx.lineTo(24, 234);
  ctx.ellipse(cx, 234, 200, 62, 0, Math.PI, 0, true);
  ctx.closePath();
  const wall = ctx.createLinearGradient(0, 234, 0, 330);
  wall.addColorStop(0, '#f6f1fc');
  wall.addColorStop(1, '#d9cfee');
  fillAndStroke(ctx, wall, stoneDark, 4);
  // Rand
  ellipsePath(ctx, cx, 234, 200, 62);
  fillAndStroke(ctx, stone, stoneDark, 4);
  // Wasser
  ellipsePath(ctx, cx, 236, 176, 50);
  const water = ctx.createRadialGradient(cx - 40, 220, 10, cx, 236, 180);
  water.addColorStop(0, '#d4f3ff');
  water.addColorStop(1, '#8fd3ef');
  fillAndStroke(ctx, water, '#79bcd8', 3);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  for (const [rx, ry] of [[120, 30], [70, 18]] as const) {
    ctx.beginPath();
    ctx.ellipse(cx, 240, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, 240, rx, ry, 0, Math.PI * 0.1, Math.PI * 0.4);
    ctx.stroke();
  }
  // Mittelsäule
  roundRectPath(ctx, cx - 18, 140, 36, 104, 10);
  fillAndStroke(ctx, stone, stoneDark, 4);
  // Obere Schale
  ctx.beginPath();
  ctx.ellipse(cx, 142, 62, 18, 0, 0, Math.PI);
  ctx.quadraticCurveTo(cx - 40, 172, cx, 172);
  ctx.quadraticCurveTo(cx + 40, 172, cx + 62, 142);
  ctx.closePath();
  fillAndStroke(ctx, stone, stoneDark, 4);
  ellipsePath(ctx, cx, 140, 62, 18);
  fillAndStroke(ctx, '#b6e6f7', stoneDark, 4);
  // Wasserbögen
  ctx.strokeStyle = 'rgba(160, 222, 245, 0.9)';
  ctx.lineWidth = 7;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx, 96);
    ctx.quadraticCurveTo(cx + side * 70, 70, cx + side * 96, 214);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 3;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx, 96);
    ctx.quadraticCurveTo(cx + side * 66, 74, cx + side * 90, 200);
    ctx.stroke();
  }
  // Spitze
  ellipsePath(ctx, cx, 98, 15, 15);
  fillAndStroke(ctx, '#ffb3d1', '#e07ca8', 3);
  ellipsePath(ctx, cx - 4, 93, 4, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fill();
  // Herzen am Beckenrand
  for (const x of [cx - 110, cx, cx + 110]) {
    heartPath(ctx, x, 290, 20);
    fillAndStroke(ctx, '#ffb3d1', '#e07ca8', 2.5);
  }
  return canvas;
}

export function paintSign(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(320, 240);
  groundShadow(ctx, 160, 226, 110, 12, 0.2);
  // Pfosten
  for (const x of [70, 238]) {
    roundRectPath(ctx, x, 120, 14, 108, 5);
    fillAndStroke(ctx, '#d9a57c', '#a87652', 3);
  }
  // Tafel
  roundRectPath(ctx, 14, 26, 292, 116, 26);
  fillAndStroke(ctx, '#fff6ea', '#ff9cc5', 8);
  roundRectPath(ctx, 28, 40, 264, 88, 18);
  ctx.strokeStyle = 'rgba(255, 156, 197, 0.45)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.setLineDash([]);
  // Herz oben
  heartPath(ctx, 160, 24, 36);
  fillAndStroke(ctx, '#ff7eb6', '#d9558f', 3.5);
  // Grasbüschel
  for (const x of [62, 96, 228, 262]) {
    ctx.strokeStyle = '#6fbf7d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 8, 220);
    ctx.lineTo(x, 228);
    ctx.lineTo(x + 8, 218);
    ctx.stroke();
  }
  return canvas;
}

/* ------------------------------------------------------------------ */
/* Effekte und Menü                                                    */
/* ------------------------------------------------------------------ */

export function paintShadow(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(96, 32);
  groundShadow(ctx, 48, 16, 46, 14, 0.26);
  return canvas;
}

export function paintSparkle(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(48, 48);
  const glow = ctx.createRadialGradient(24, 24, 2, 24, 24, 22);
  glow.addColorStop(0, 'rgba(255, 250, 210, 0.9)');
  glow.addColorStop(1, 'rgba(255, 250, 210, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 48, 48);
  sparklePath(ctx, 24, 24, 20);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  sparklePath(ctx, 24, 24, 10);
  ctx.fillStyle = '#fff3a6';
  ctx.fill();
  return canvas;
}

export function paintHeart(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(48, 48);
  heartPath(ctx, 24, 25, 40);
  const gradient = ctx.createLinearGradient(0, 6, 0, 44);
  gradient.addColorStop(0, '#ffb3d1');
  gradient.addColorStop(1, '#ff6fae');
  fillAndStroke(ctx, gradient, '#e0558f', 3);
  ellipsePath(ctx, 15, 17, 4, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fill();
  return canvas;
}

export function paintCloud(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(400, 180);
  const blobs: [number, number, number][] = [
    [120, 110, 56],
    [200, 84, 76],
    [286, 110, 56],
    [70, 130, 40],
    [336, 132, 38],
  ];
  ctx.fillStyle = '#e4e8fb';
  for (const [x, y, r] of blobs) {
    ellipsePath(ctx, x, y + 8, r, r);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  for (const [x, y, r] of blobs) {
    ellipsePath(ctx, x, y, r, r);
    ctx.fill();
  }
  roundRectPath(ctx, 40, 120, 330, 48, 24);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  return canvas;
}

export function paintMenuHills(): HTMLCanvasElement {
  const width = 2560;
  const height = 560;
  const { canvas, ctx } = createCanvas(width, height);
  const rand = seededRandom(42);
  const hill = (baseY: number, amplitude: number, waves: number, color: string, phase: number) => {
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 16) {
      const y = baseY + Math.sin((x / width) * Math.PI * 2 * waves + phase) * amplitude;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  hill(170, 60, 2, '#cdeec0', 0.6);
  hill(260, 44, 3, '#b2e59f', 2.1);
  hill(360, 26, 2, '#9edb8d', 4.2);
  for (let i = 0; i < 70; i++) {
    const x = rand() * width;
    const y = 330 + rand() * 210;
    const colors = ['#ffffff', '#ffc4de', '#fff1a8', '#d9c7ff'];
    flower(ctx, x, y, 8 + rand() * 5, colors[i % colors.length]);
  }
  return canvas;
}
