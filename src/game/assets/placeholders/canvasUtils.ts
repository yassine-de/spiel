/**
 * Hilfsfunktionen für die prozeduralen PLATZHALTER-Grafiken.
 * Diese Dateien werden überflüssig, sobald echte Grafiken vorliegen.
 */

export function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D wird nicht unterstützt');
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  return { canvas, ctx };
}

/** Hellt (amount > 0) oder dunkelt (amount < 0) eine Hex-Farbe ab. */
export function shade(hex: string, amount: number): string {
  const value = hex.replace('#', '');
  const num = parseInt(value.length === 3 ? value.replace(/(.)/g, '$1$1') : value, 16);
  const channel = (shift: number) => {
    const c = (num >> shift) & 0xff;
    const target = amount < 0 ? 0 : 255;
    return Math.round(c + (target - c) * Math.abs(amount));
  };
  const r = channel(16);
  const g = channel(8);
  const b = channel(0);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function rgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(num >> 16) & 0xff}, ${(num >> 8) & 0xff}, ${num & 0xff}, ${alpha})`;
}

/** Abgerundetes Rechteck als Pfad (eigene Umsetzung für ältere iOS-Versionen). */
export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number | [number, number, number, number],
): void {
  const [tl, tr, br, bl] = typeof radius === 'number' ? [radius, radius, radius, radius] : radius;
  const clampR = (r: number) => Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + clampR(tl), y);
  ctx.lineTo(x + w - clampR(tr), y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + clampR(tr));
  ctx.lineTo(x + w, y + h - clampR(br));
  ctx.quadraticCurveTo(x + w, y + h, x + w - clampR(br), y + h);
  ctx.lineTo(x + clampR(bl), y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - clampR(bl));
  ctx.lineTo(x, y + clampR(tl));
  ctx.quadraticCurveTo(x, y, x + clampR(tl), y);
  ctx.closePath();
}

export function ellipsePath(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void {
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
}

/** Füllt den aktuellen Pfad und zeichnet eine weiche, dunklere Kontur. */
export function fillAndStroke(ctx: CanvasRenderingContext2D, fill: string | CanvasGradient, stroke?: string, lineWidth = 4): void {
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/** Weicher Bodenschatten. */
export function groundShadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, alpha = 0.2): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const gradient = ctx.createRadialGradient(0, 0, rx * 0.2, 0, 0, rx);
  gradient.addColorStop(0, `rgba(60, 40, 90, ${alpha})`);
  gradient.addColorStop(0.7, `rgba(60, 40, 90, ${alpha * 0.7})`);
  gradient.addColorStop(1, 'rgba(60, 40, 90, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Herzform mit Mittelpunkt (cx, cy) und Breite size. */
export function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.9);
  ctx.bezierCurveTo(cx - s * 1.3, cy + s * 0.05, cx - s * 0.75, cy - s * 0.95, cx, cy - s * 0.35);
  ctx.bezierCurveTo(cx + s * 0.75, cy - s * 0.95, cx + s * 1.3, cy + s * 0.05, cx, cy + s * 0.9);
  ctx.closePath();
}

/** Vierzackiger Glitzerstern. */
export function sparklePath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const inner = r * 0.28;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : inner;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** Kleine Blume mit fünf Blütenblättern. */
export function flower(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, petal: string, center = '#ffe28a'): void {
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    ellipsePath(ctx, cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62, r * 0.5, r * 0.5);
    fillAndStroke(ctx, petal, shade(petal, -0.18), Math.max(1, r * 0.14));
  }
  ellipsePath(ctx, cx, cy, r * 0.36, r * 0.36);
  fillAndStroke(ctx, center, shade(center, -0.25), Math.max(1, r * 0.12));
}

/** Fünfzackiger Stern. */
export function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
