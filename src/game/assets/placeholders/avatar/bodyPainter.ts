/**
 * PLATZHALTER-Avatar: Körper, Kleidung, Gesicht und Brille – im weichen 3D-Stil
 * (Licht von oben links, plastische Verläufe, zarte Kanten).
 */
import type { Pattern, WearableItem } from '../../../avatar/avatarTypes';
import { ellipsePath, heartPath, rgba, roundRectPath, shade, sparklePath, starPath } from '../canvasUtils';
import { type Arm, type Box, type Frame, along, armGeometry, itemColor, legGeometry, limb, splitPaint, volume } from './frame';

const INK = '#2b1b22';
const LACES = '#a3a1aa';

const softEdge = (color: string, alpha = 0.55) => rgba(shade(color, -0.42), alpha);

function ball(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, edge = true): void {
  volume(ctx, () => ellipsePath(ctx, x, y, rx, ry), color, { x: x - rx, y: y - ry, w: rx * 2, h: ry * 2 }, edge);
}

function line(ctx: CanvasRenderingContext2D, color: string, width: number, points: [number, number][]): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.stroke();
}

/** Legt nach einem deckenden Muster die plastische Schattierung wieder darüber. */
function sheen(ctx: CanvasRenderingContext2D, path: () => void, box: Box): void {
  ctx.save();
  path();
  ctx.clip();
  const g = ctx.createLinearGradient(box.x, box.y, box.x + box.w * 0.8, box.y + box.h);
  g.addColorStop(0, 'rgba(255,255,255,0.22)');
  g.addColorStop(0.5, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(40,20,50,0.16)');
  ctx.fillStyle = g;
  ctx.fillRect(box.x - 2, box.y - 2, box.w + 4, box.h + 4);
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Beine und Schuhe                                                    */
/* ------------------------------------------------------------------ */

/** Sitzen von vorne: Unterschenkel nach unten, Oberschenkel als verkürzte Rundung zum Betrachter. */
function drawSittingLegs(f: Frame): void {
  const { ctx, look } = f;
  const bottom = look.bottom;
  const variant = bottom?.category === 'pants' ? bottom.variant : null;
  for (const leg of legGeometry(f)) {
    const out = leg.hipX < f.cx ? -1 : 1;
    const kneeX = leg.hipX + out * 3;
    const kneeY = f.hipY + 10;
    const ankleY = leg.footY - 8;
    const pants = bottom && (variant === 'pants' || variant === 'joggers') ? itemColor(bottom, leg.side) : null;
    const thigh = pants ?? (bottom && variant === 'shorts' ? itemColor(bottom, leg.side) : look.skin);
    const shin = pants ?? look.skin;
    if (variant === 'joggers' && pants) {
      limb(ctx, kneeX, kneeY, leg.footX, ankleY - 6, 18, shin);
      limb(ctx, leg.footX, ankleY - 6, leg.footX, ankleY, 13, shade(shin, -0.1));
    } else {
      limb(ctx, kneeX, kneeY, leg.footX, ankleY + (pants ? 2 : 0), pants ? 16 : 12, shin);
    }
    ball(ctx, (leg.hipX + kneeX) / 2, f.hipY + 5, pants || variant === 'shorts' ? 11 : 9.5, 9, thigh);
  }
}

export function drawLegs(f: Frame): void {
  const { ctx, look } = f;
  const bottom = look.bottom;
  const variant = bottom?.category === 'pants' ? bottom.variant : null;
  if (f.pose.sit && f.view === 'front') {
    drawSittingLegs(f);
    return;
  }
  for (const leg of legGeometry(f)) {
    const tint = (c: string) => (leg.far ? shade(c, -0.15) : c);
    const hipY = f.hipY + 2;
    const ankleY = leg.footY - 8;
    const skin = tint(look.skin);
    if (bottom && variant === 'joggers') {
      // Weite Jogginghose mit Bündchen am Knöchel
      const color = tint(itemColor(bottom, leg.side));
      const [kx, ky] = along(leg.hipX, hipY, leg.footX, ankleY, 0.55);
      const [bx, by] = along(leg.hipX, hipY, leg.footX, ankleY, 0.84);
      limb(ctx, leg.hipX, hipY, kx, ky, 18, color);
      limb(ctx, kx, ky, bx, by, 19, color);
      limb(ctx, bx, by, leg.footX, ankleY, 13, shade(color, -0.1));
      line(ctx, rgba(shade(color, -0.35), 0.5), 1.4, [[leg.footX - 5, ankleY - 3], [leg.footX + 5, ankleY - 3]]);
    } else if (bottom && variant === 'pants') {
      limb(ctx, leg.hipX, hipY, leg.footX, ankleY + 2, 16, tint(itemColor(bottom, leg.side)));
    } else if (bottom && variant === 'shorts') {
      limb(ctx, leg.hipX, hipY, leg.footX, ankleY, 12, skin);
      const [kx, ky] = along(leg.hipX, hipY, leg.footX, ankleY, 0.4);
      limb(ctx, leg.hipX, hipY, kx, ky, 17, tint(itemColor(bottom, leg.side)));
    } else {
      limb(ctx, leg.hipX, hipY, leg.footX, ankleY, 12, skin);
    }
  }
}

/** Sneaker: Sohle, Obermaterial, farbige Seitenteile und Schnürung. */
function sneaker(f: Frame, x: number, y: number, upper: string, accent: string, soleH: number, chunky: boolean): void {
  const { ctx } = f;
  const sole = upper === '#ffffff' || chunky ? '#f6f3f6' : '#ffffff';
  if (f.view === 'side') {
    const len = chunky ? 32 : 27;
    const toe = x - len * 0.58;
    const heel = x + len * 0.42;
    const upperPath = () => {
      ctx.beginPath();
      ctx.moveTo(heel, y - soleH + 1);
      ctx.lineTo(heel, y - soleH - 10);
      ctx.quadraticCurveTo(heel - 6, y - soleH - 13, x - 1, y - soleH - 10);
      ctx.quadraticCurveTo(toe, y - soleH - 7, toe, y - soleH + 1);
      ctx.closePath();
    };
    volume(ctx, upperPath, upper, { x: toe, y: y - soleH - 13, w: len, h: 14 });
    ctx.save();
    upperPath();
    ctx.clip();
    ellipsePath(ctx, x - 3, y - soleH - 1, 9, 4);
    ctx.fillStyle = accent;
    ctx.fill();
    ellipsePath(ctx, heel - 1, y - soleH - 6, 4.5, 8);
    ctx.fill();
    ctx.restore();
    for (let i = 0; i < 3; i++) line(ctx, LACES, 1.6, [[x - 7 + i * 3.5, y - soleH - 11 + i * 0.6], [x - 4 + i * 3.5, y - soleH - 7 + i * 0.6]]);
    volume(ctx, () => roundRectPath(ctx, toe - 1, y - soleH, len + 2, soleH + 1, soleH / 2), sole, { x: toe, y: y - soleH, w: len, h: soleH });
    if (chunky) line(ctx, accent, 1.6, [[toe + 3, y - soleH / 2], [heel - 2, y - soleH / 2]]);
    return;
  }
  const half = chunky ? 13 : 10.5;
  const upperPath = () => ellipsePath(ctx, x, y - soleH - 3, half - 1, 8.5);
  volume(ctx, upperPath, upper, { x: x - half, y: y - soleH - 12, w: half * 2, h: 17 });
  ctx.save();
  upperPath();
  ctx.clip();
  ctx.fillStyle = accent;
  for (const s of [-1, 1]) {
    ellipsePath(ctx, x + s * (half - 2), y - soleH - 1, 4.5, 6);
    ctx.fill();
  }
  ctx.restore();
  if (f.view === 'front') {
    for (let i = 0; i < 3; i++) line(ctx, LACES, 1.6, [[x - 4, y - soleH - 9 + i * 2.6], [x + 4, y - soleH - 9 + i * 2.6]]);
  } else {
    roundRectPath(ctx, x - 3, y - soleH - 11, 6, 7, 2);
    ctx.fillStyle = accent;
    ctx.fill();
  }
  volume(ctx, () => roundRectPath(ctx, x - half, y - soleH, half * 2, soleH + 1, soleH / 2), sole, { x: x - half, y: y - soleH, w: half * 2, h: soleH });
  if (chunky) line(ctx, accent, 1.6, [[x - half + 3, y - soleH / 2], [x + half - 3, y - soleH / 2]]);
}

export function drawShoes(f: Frame): void {
  const { ctx } = f;
  const shoe = f.look.shoes;
  for (const leg of legGeometry(f)) {
    const dim = (c: string) => (leg.far ? shade(c, -0.12) : c);
    const color = dim(shoe.color);
    const x = leg.footX + leg.toe;
    const y = leg.footY;
    if (shoe.variant === 'chunky') {
      sneaker(f, x, y, color, dim(shoe.color2 ?? '#ff9cc8'), 8, true);
    } else if (shoe.variant === 'boots') {
      volume(ctx, () => roundRectPath(ctx, leg.footX - 8, y - 28, 16, 24, 5), color, { x: leg.footX - 8, y: y - 28, w: 16, h: 24 });
      volume(ctx, () => roundRectPath(ctx, leg.footX - 9, y - 30, 18, 7, 3), shade(color, 0.18), { x: leg.footX - 9, y: y - 30, w: 18, h: 7 });
      const fx = f.view === 'side' ? x - 3 : x;
      ball(ctx, fx, y - 3, f.view === 'side' ? 14 : 11, 6.5, color);
      roundRectPath(ctx, fx - (f.view === 'side' ? 14 : 11), y - 1, f.view === 'side' ? 28 : 22, 3, 1.5);
      ctx.fillStyle = shade(color, -0.35);
      ctx.fill();
    } else if (shoe.variant === 'ballerinas') {
      ball(ctx, f.view === 'side' ? x - 2 : x, y - 1, f.view === 'side' ? 12 : 10, 5.5, color);
      if (f.view !== 'back') ball(ctx, x + (f.view === 'side' ? -7 : 0), y - 4, 3, 2.5, '#ffffff', false);
    } else {
      const accent = shoe.color === '#ffffff' ? '#ffb3d1' : shade(shoe.color, 0.45);
      sneaker(f, x, y, color, dim(accent), 5, false);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Arme                                                                */
/* ------------------------------------------------------------------ */

const LONG_SLEEVES = new Set(['pullover', 'hoodie', 'jacket']);

function drawArm(f: Frame, arm: Arm): void {
  const { ctx, look } = f;
  const tint = (c: string) => (arm.far ? shade(c, -0.15) : c);
  const top = look.top;
  const skin = tint(look.skin);
  limb(ctx, arm.sx, arm.sy, arm.hx, arm.hy, 11, skin);
  ball(ctx, arm.hx, arm.hy + 1, 6.5, 7, skin);
  const sleeve = tint(itemColor(top, arm.side));
  if (LONG_SLEEVES.has(top.variant)) {
    const [ex, ey] = along(arm.sx, arm.sy, arm.hx, arm.hy, 0.7);
    const [cx, cy] = along(arm.sx, arm.sy, arm.hx, arm.hy, 0.8);
    limb(ctx, arm.sx, arm.sy, ex, ey, 15, sleeve);
    limb(ctx, ex, ey, cx, cy, 13.5, shade(sleeve, -0.08));
  } else if (top.variant === 'dress') {
    ball(ctx, arm.sx, arm.sy + 2, 9, 8, sleeve);
  } else {
    const [ex, ey] = along(arm.sx, arm.sy, arm.hx, arm.hy, 0.36);
    limb(ctx, arm.sx, arm.sy, ex, ey, 16, sleeve);
  }
}

export function drawFarArm(f: Frame): void {
  for (const arm of armGeometry(f)) if (arm.far) drawArm(f, arm);
}

export function drawArms(f: Frame): void {
  for (const arm of armGeometry(f)) if (!arm.far) drawArm(f, arm);
}

/* ------------------------------------------------------------------ */
/* Oberteil                                                            */
/* ------------------------------------------------------------------ */

function torso(f: Frame): { path: () => void; box: Box } {
  const { ctx } = f;
  const side = f.view === 'side';
  const top = f.shoulderY;
  const bottom = f.hipY + 8;
  const sh = side ? 16 : 25;
  const bh = side ? 15 : 23;
  const x0 = side ? f.cx + 1 : f.cx;
  const mid = (top + bottom) / 2;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(x0 - sh + 10, top);
    ctx.lineTo(x0 + sh - 10, top);
    ctx.quadraticCurveTo(x0 + sh, top, x0 + sh, top + 10);
    ctx.quadraticCurveTo(x0 + sh - 3, mid, x0 + bh, bottom - 5);
    ctx.quadraticCurveTo(x0 + bh, bottom, x0 + bh - 5, bottom);
    ctx.lineTo(x0 - bh + 5, bottom);
    ctx.quadraticCurveTo(x0 - bh, bottom, x0 - bh, bottom - 5);
    ctx.quadraticCurveTo(x0 - sh + 3, mid, x0 - sh, top + 10);
    ctx.quadraticCurveTo(x0 - sh, top, x0 - sh + 10, top);
    ctx.closePath();
  };
  return { path, box: { x: x0 - sh, y: top, w: sh * 2, h: bottom - top } };
}

function patternFill(f: Frame, pattern: Pattern, base: string, area: Box, clip: () => void): void {
  const { ctx } = f;
  if (pattern === 'none') return;
  ctx.save();
  clip();
  ctx.clip();
  const light = shade(base, 0.5);
  if (pattern === 'stripes') {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (let y = area.y + 6; y < area.y + area.h; y += 10) ctx.fillRect(area.x - 2, y, area.w + 4, 4);
  } else if (pattern === 'rainbow') {
    const bands = ['#ff9cc8', '#ffbf8a', '#ffe28a', '#9be0c1', '#8fc4ff', '#c3a8f5'];
    const band = area.h / bands.length;
    bands.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(area.x - 2, area.y + i * band, area.w + 4, band + 0.5);
    });
  } else if (pattern === 'dots') {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let y = area.y + 6; y < area.y + area.h; y += 11) {
      for (let x = area.x + ((y / 11) % 2 ? 4 : 9); x < area.x + area.w; x += 11) {
        ellipsePath(ctx, x, y, 2.4, 2.4);
        ctx.fill();
      }
    }
  } else if (f.view === 'front' && (pattern === 'heart' || pattern === 'star')) {
    const cy = f.shoulderY + 22;
    if (pattern === 'heart') heartPath(ctx, f.cx, cy, 15);
    else starPath(ctx, f.cx, cy, 8.5);
    ctx.fillStyle = light;
    ctx.fill();
  }
  ctx.restore();
  sheen(ctx, clip, area);
}

export function drawTop(f: Frame): void {
  const { ctx } = f;
  const top = f.look.top;
  const { path, box } = torso(f);
  splitPaint(f, top, (color) => {
    volume(ctx, path, color, box);
    patternFill(f, top.pattern ?? 'none', color, box, path);
  });

  if (top.variant === 'pullover' || top.variant === 'hoodie') {
    // Bündchen
    const band = { x: box.x + 1, y: f.hipY, w: box.w - 2, h: 9 };
    splitPaint(f, top, (color) =>
      volume(ctx, () => roundRectPath(ctx, band.x, band.y, band.w, band.h, 4.5), shade(color, -0.07), band),
    );
  }
  if (top.variant === 'hoodie') drawHoodieDetails(f);
  if (top.variant === 'jacket') drawJacketDetails(f, box);
  if (f.view === 'front' && top.variant !== 'jacket' && top.variant !== 'hoodie') {
    // Halsausschnitt
    ctx.strokeStyle = softEdge(top.color, 0.7);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(f.cx, f.shoulderY + 1, 8, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
}

/** Kapuze, Kordeln und weiße Taschenschlitze. */
function drawHoodieDetails(f: Frame): void {
  const { ctx, cx, shoulderY, hipY } = f;
  const top = f.look.top;
  const white = '#ffffff';
  if (f.view === 'front') {
    splitPaint(f, top, (color) => {
      ball(ctx, cx, shoulderY + 1, 21, 9, shade(color, 0.04));
      ellipsePath(ctx, cx, shoulderY, 12, 5.5);
      ctx.fillStyle = shade(color, -0.45);
      ctx.fill();
    });
    for (const s of [-1, 1]) {
      line(ctx, rgba('#000000', 0.12), 3.2, [[cx + s * 5, shoulderY + 6], [cx + s * 6.5, shoulderY + 25]]);
      line(ctx, white, 2.2, [[cx + s * 5, shoulderY + 5], [cx + s * 6.5, shoulderY + 24]]);
      ball(ctx, cx + s * 6.5, shoulderY + 26, 1.8, 2.4, '#e4e2e8', false);
      line(ctx, white, 2.6, [[cx + s * 19, hipY - 16], [cx + s * 13, hipY - 3]]);
    }
  } else if (f.view === 'back') {
    splitPaint(f, top, (color) => {
      volume(ctx, () => {
        ctx.beginPath();
        ctx.moveTo(cx - 20, shoulderY);
        ctx.quadraticCurveTo(cx - 22, shoulderY + 26, cx, shoulderY + 30);
        ctx.quadraticCurveTo(cx + 22, shoulderY + 26, cx + 20, shoulderY);
        ctx.closePath();
      }, shade(color, 0.04), { x: cx - 22, y: shoulderY, w: 44, h: 30 });
    });
    line(ctx, rgba('#000000', 0.15), 1.6, [[cx, shoulderY + 2], [cx, shoulderY + 28]]);
  } else {
    const color = itemColor(top, f.mirrored ? 'right' : 'left');
    ball(ctx, cx + 14, shoulderY + 6, 9, 12, shade(color, 0.04));
    line(ctx, white, 2.2, [[cx - 12, shoulderY + 6], [cx - 13, shoulderY + 23]]);
    line(ctx, white, 2.6, [[cx - 9, hipY - 15], [cx - 3, hipY - 3]]);
  }
}

function drawJacketDetails(f: Frame, r: Box): void {
  const { ctx, cx, shoulderY, hipY } = f;
  const color = f.look.top.color;
  const dark = softEdge(color, 0.7);
  if (f.view === 'front') {
    // Offene Jacke: helles Shirt in der Mitte, Revers, Knöpfe
    volume(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(cx - 7, shoulderY + 2);
      ctx.lineTo(cx + 7, shoulderY + 2);
      ctx.lineTo(cx + 5, hipY + 6);
      ctx.lineTo(cx - 5, hipY + 6);
      ctx.closePath();
    }, '#ffffff', { x: cx - 7, y: shoulderY, w: 14, h: hipY - shoulderY + 6 });
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * 7, shoulderY + 2);
      ctx.lineTo(cx + side * 16, shoulderY + 2);
      ctx.lineTo(cx + side * 8, shoulderY + 22);
      ctx.closePath();
      ctx.fillStyle = shade(color, -0.12);
      ctx.fill();
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    for (const y of [shoulderY + 26, shoulderY + 38]) ball(ctx, cx - 10, y, 2.2, 2.2, '#ffe08a', false);
  } else {
    line(ctx, dark, 1.6, [[r.x + 4, r.y + r.h - 8], [r.x + r.w - 4, r.y + r.h - 8]]);
  }
}

/* ------------------------------------------------------------------ */
/* Handtasche                                                          */
/* ------------------------------------------------------------------ */

export function drawBag(f: Frame): void {
  const item = f.look.bag;
  if (!item) return;
  const { ctx } = f;
  const arm = armGeometry(f).filter((a) => !a.far);
  const hand = f.view === 'side' ? arm[0] : f.view === 'front' ? arm[1] : arm[0];
  const x = hand.hx;
  const y = hand.hy + 13;
  ctx.strokeStyle = shade(item.color, -0.25);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 8);
  ctx.quadraticCurveTo(x, y - 20, x + 7, y - 8);
  ctx.stroke();
  volume(ctx, () => roundRectPath(ctx, x - 11, y - 8, 22, 18, 6), item.color, { x: x - 11, y: y - 8, w: 22, h: 18 });
  if (f.view !== 'back') {
    if (item.variant === 'star') starPath(ctx, x, y + 1, 5.5);
    else heartPath(ctx, x, y + 1, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
}

/* ------------------------------------------------------------------ */
/* Unterteil (Rock, Hose, Kleid)                                       */
/* ------------------------------------------------------------------ */

function wavySkirt(f: Frame, top: number, length: number, topHalf: number, bottomHalf: number, item: WearableItem, waves = 4): void {
  const { ctx, cx } = f;
  const bottom = top + length;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx - topHalf, top);
    ctx.lineTo(cx + topHalf, top);
    ctx.lineTo(cx + bottomHalf, bottom);
    for (let i = 0; i < waves; i++) {
      const x1 = cx + bottomHalf - ((i + 0.5) * 2 * bottomHalf) / waves;
      const x2 = cx + bottomHalf - ((i + 1) * 2 * bottomHalf) / waves;
      ctx.quadraticCurveTo(x1, bottom + 7, x2, bottom);
    }
    ctx.closePath();
  };
  const box = { x: cx - bottomHalf, y: top, w: bottomHalf * 2, h: length + 7 };
  volume(ctx, path, item.color, box);
  patternFill(f, item.pattern === 'heart' || item.pattern === 'star' ? 'dots' : (item.pattern ?? 'none'), item.color, box, path);
  // Falten
  for (const k of [-0.45, 0, 0.45]) {
    line(ctx, rgba(shade(item.color, -0.3), 0.35), 2.4, [[cx + k * topHalf + 1, top + 5], [cx + k * bottomHalf + 1, bottom - 1]]);
    line(ctx, rgba('#ffffff', 0.35), 1.6, [[cx + k * topHalf - 2, top + 5], [cx + k * bottomHalf - 3, bottom - 2]]);
  }
}

export function drawBottom(f: Frame): void {
  const { ctx, cx, look } = f;
  const side = f.view === 'side';
  const top = f.hipY - 6;
  if (!look.bottom) {
    // Kleid: längerer, weiter Rock in der Farbe des Oberteils
    wavySkirt(f, top - 2, 34, side ? 18 : 25, side ? 30 : 40, look.top, 5);
    return;
  }
  const item = look.bottom;
  if (item.variant === 'tutu') {
    const lighter = { ...item, color: shade(item.color, 0.35) };
    wavySkirt(f, top, 26, side ? 20 : 27, side ? 32 : 42, lighter, 6);
    wavySkirt(f, top, 20, side ? 18 : 25, side ? 28 : 37, item, 5);
    return;
  }
  if (item.variant === 'skirt') {
    wavySkirt(f, top, 26, side ? 18 : 25, side ? 27 : 34, item);
    return;
  }
  // Hose/Shorts/Jogginghose: Hüftteil (die Beine kommen aus drawLegs)
  const w = side ? 32 : 46;
  const box = { x: cx - w / 2 + (side ? 1 : 0), y: top, w, h: 20 };
  splitPaint(f, item, (color) => volume(ctx, () => roundRectPath(ctx, box.x, box.y, box.w, box.h, [5, 5, 10, 10]), color, box));
}

/* ------------------------------------------------------------------ */
/* Kopf                                                                */
/* ------------------------------------------------------------------ */

const STYLES_WITH_EARS = new Set(['short', 'spiky', 'ponytail', 'buns']);

export function showsEars(f: Frame): boolean {
  return STYLES_WITH_EARS.has(f.look.config.hairStyle);
}

export function ear(ctx: CanvasRenderingContext2D, x: number, y: number, skin: string): void {
  ball(ctx, x, y, 7, 9, skin);
  ellipsePath(ctx, x, y + 1, 3, 4.5);
  ctx.fillStyle = rgba(shade(skin, -0.3), 0.45);
  ctx.fill();
}

export function drawHead(f: Frame): void {
  const { ctx, cx, headY, look } = f;
  const side = f.view === 'side';
  // Hals mit Schatten unter dem Kinn
  const neck = { x: cx - (side ? 6 : 7), y: headY + 30, w: side ? 13 : 14, h: 20 };
  volume(ctx, () => roundRectPath(ctx, neck.x, neck.y, neck.w, neck.h, 5), shade(look.skin, -0.06), neck);
  ellipsePath(ctx, cx, headY + 42, 9, 5);
  ctx.fillStyle = rgba(shade(look.skin, -0.5), 0.25);
  ctx.fill();
  if (!side && showsEars(f)) {
    ear(ctx, cx - 45, headY + 14, look.skin);
    ear(ctx, cx + 45, headY + 14, look.skin);
  }
  const hx = side ? cx - 2 : cx;
  const rx = side ? 44 : 46;
  ball(ctx, hx, headY, rx, 43, look.skin);
  if (side) {
    // Nase
    ball(ctx, hx - rx + 1, headY + 17, 4.5, 5, look.skin, false);
  }
}

/* ------------------------------------------------------------------ */
/* Gesicht                                                             */
/* ------------------------------------------------------------------ */

function eye(f: Frame, x: number, y: number, outward: number, small: boolean): void {
  const { ctx, look } = f;
  const shape = look.config.eyeShape;
  const lashes = look.config.body === 'girl';
  const s = (small ? 0.85 : 1) * (shape === 'sparkle' ? 1.1 : 1);
  const ex = 8.5 * s;
  const ey = 11 * s;

  if (shape === 'happy') {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(x, y + 5, ex, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    if (lashes) line(ctx, INK, 2.4, [[x + outward * (ex - 1), y + 1], [x + outward * (ex + 4), y - 3]]);
    return;
  }

  // Augapfel: dunkler Rand, Iris mit Verlauf, Pupille, Glanzlichter
  ellipsePath(ctx, x, y, ex, ey);
  ctx.fillStyle = INK;
  ctx.fill();
  ellipsePath(ctx, x, y + 1, ex - 1.6, ey - 1.8);
  const iris = ctx.createLinearGradient(x, y - ey, x, y + ey);
  iris.addColorStop(0, shade(look.eyes, -0.5));
  iris.addColorStop(0.55, look.eyes);
  iris.addColorStop(1, shade(look.eyes, 0.4));
  ctx.fillStyle = iris;
  ctx.fill();
  ellipsePath(ctx, x, y + 1, ex * 0.42, ey * 0.45);
  ctx.fillStyle = rgba(INK, 0.85);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  if (shape === 'sparkle') {
    sparklePath(ctx, x - ex * 0.3, y - ey * 0.35, 5.5);
    ctx.fill();
  } else {
    ellipsePath(ctx, x - ex * 0.36, y - ey * 0.38, 3.4 * s, 3.8 * s);
    ctx.fill();
  }
  ellipsePath(ctx, x + ex * 0.35, y + ey * 0.42, 1.8 * s, 1.8 * s);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fill();

  if (shape === 'gentle') {
    // Halb geschlossenes Lid: entspannter Blick
    ctx.save();
    ellipsePath(ctx, x, y, ex + 0.5, ey + 0.5);
    ctx.clip();
    ctx.fillStyle = look.skin;
    ctx.fillRect(x - ex - 2, y - ey - 2, ex * 2 + 4, ey * 0.85);
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - ex - 1, y - ey * 0.15);
    ctx.quadraticCurveTo(x, y - ey * 0.45, x + ex + 1, y - ey * 0.15);
    ctx.stroke();
  } else {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y + 1, ex + 1.2, ey + 1.2, 0, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
  }
  if (lashes) {
    const ly = shape === 'gentle' ? y - 2 : y - 6;
    line(ctx, INK, 2.4, [[x + outward * (ex + 0.5), ly], [x + outward * (ex + 5), ly - 4]]);
    line(ctx, INK, 2, [[x + outward * (ex - 1), ly - 4], [x + outward * (ex + 2.5), ly - 9]]);
  }
}

function brow(f: Frame, x: number, y: number, outward: number): void {
  const { ctx, look } = f;
  ctx.strokeStyle = rgba(shade(look.hair, -0.25), 0.85);
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  switch (look.config.expression) {
    case 'excited':
      ctx.arc(x, y - 1, 8, Math.PI * 1.15, Math.PI * 1.85);
      break;
    case 'calm':
      ctx.moveTo(x - 6, y);
      ctx.quadraticCurveTo(x, y - 2, x + 6, y);
      break;
    case 'brave':
      ctx.moveTo(x + outward * 7, y - 3);
      ctx.lineTo(x - outward * 6, y + 1);
      break;
    default:
      ctx.arc(x, y + 5, 7, Math.PI * 1.22, Math.PI * 1.78);
  }
  ctx.stroke();
}

function blush(f: Frame, x: number, y: number): void {
  const { ctx } = f;
  const alpha = f.look.config.expression === 'excited' ? 0.5 : 0.34;
  const g = ctx.createRadialGradient(x, y, 1, x, y, 10);
  g.addColorStop(0, `rgba(255, 120, 150, ${alpha})`);
  g.addColorStop(1, 'rgba(255, 120, 150, 0)');
  ctx.fillStyle = g;
  ellipsePath(ctx, x, y, 10, 6.5);
  ctx.fill();
}

function nose(f: Frame, x: number, y: number): void {
  const { ctx, look } = f;
  ellipsePath(ctx, x + 1, y + 1, 2.8, 1.9);
  ctx.fillStyle = rgba(shade(look.skin, -0.45), 0.4);
  ctx.fill();
  ellipsePath(ctx, x - 1, y - 0.8, 1.6, 1.2);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fill();
}

function mouth(f: Frame, x: number, y: number, scale: number): void {
  const { ctx } = f;
  ctx.strokeStyle = '#b4505a';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  switch (f.look.config.mouth) {
    case 'grin':
      ctx.arc(x, y - 3, 6.5 * scale, 0, Math.PI);
      ctx.closePath();
      ctx.fillStyle = '#a63e54';
      ctx.fill();
      ctx.save();
      ctx.clip();
      ellipsePath(ctx, x, y + 3 * scale, 5 * scale, 3.5 * scale);
      ctx.fillStyle = '#ff8fa8';
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(x, y - 3, 6.5 * scale, 0, Math.PI);
      ctx.closePath();
      ctx.lineWidth = 1.8;
      ctx.stroke();
      break;
    case 'cat':
      ctx.arc(x - 3.5 * scale, y - 3, 3.5 * scale, Math.PI * 0.1, Math.PI * 0.95);
      ctx.moveTo(x + 7 * scale, y - 3);
      ctx.arc(x + 3.5 * scale, y - 3, 3.5 * scale, Math.PI * 0.05, Math.PI * 0.9);
      ctx.stroke();
      break;
    case 'wow':
      ellipsePath(ctx, x, y, 3.4 * scale, 4.4 * scale);
      ctx.fillStyle = '#a63e54';
      ctx.fill();
      break;
    default:
      ctx.arc(x, y - 3, 5.5 * scale, Math.PI * 0.18, Math.PI * 0.82);
      ctx.stroke();
  }
}

export function drawFace(f: Frame): void {
  const { ctx, cx, headY } = f;
  ctx.save();
  if (f.view === 'front') {
    blush(f, cx - 28, headY + 25);
    blush(f, cx + 28, headY + 25);
    eye(f, cx - 17, headY + 9, -1, false);
    eye(f, cx + 17, headY + 9, 1, false);
    brow(f, cx - 17, headY - 7, -1);
    brow(f, cx + 17, headY - 7, 1);
    nose(f, cx, headY + 20);
    mouth(f, cx, headY + 29, 1);
  } else if (f.view === 'side') {
    blush(f, cx - 20, headY + 25);
    eye(f, cx - 24, headY + 9, -1, true);
    brow(f, cx - 24, headY - 7, -1);
    mouth(f, cx - 35, headY + 28, 0.7);
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Brille                                                              */
/* ------------------------------------------------------------------ */

export function drawGlasses(f: Frame): void {
  const item = f.look.glasses;
  if (!item || f.view === 'back') return;
  const { ctx, cx, headY } = f;
  const y = headY + 9;
  const frame = item.variant === 'heart' ? shade(item.color, -0.25) : item.color;
  const lens = (x: number, size: number) => {
    if (item.variant === 'heart') {
      heartPath(ctx, x, y + 1, size * 2.2);
      ctx.fillStyle = rgba(item.color, 0.82);
      ctx.fill();
      ctx.strokeStyle = frame;
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ellipsePath(ctx, x - size * 0.35, y - size * 0.25, 2.5, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fill();
    } else {
      ellipsePath(ctx, x, y, size, size);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fill();
      ctx.strokeStyle = frame;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, size - 3.5, Math.PI * 1.1, Math.PI * 1.4);
      ctx.stroke();
    }
  };
  if (f.view === 'front') {
    lens(cx - 17, 12);
    lens(cx + 17, 12);
    ctx.strokeStyle = frame;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(cx - 5, y - 2);
    ctx.quadraticCurveTo(cx, y - 5, cx + 5, y - 2);
    ctx.moveTo(cx - 29, y - 3);
    ctx.lineTo(cx - 44, y - 5);
    ctx.moveTo(cx + 29, y - 3);
    ctx.lineTo(cx + 44, y - 5);
    ctx.stroke();
  } else {
    lens(cx - 25, 11);
    ctx.strokeStyle = frame;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(cx - 14, y - 3);
    ctx.lineTo(cx + 8, y - 6);
    ctx.stroke();
  }
}
