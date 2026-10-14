import type { Direction, Rect, Vec2 } from '../types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * Wandelt die Auslenkung eines Joysticks (in Pixeln) in einen Bewegungsvektor
 * mit Länge 0..1 um. Innerhalb der Totzone ist der Vektor 0; danach wird
 * weich von 0 auf 1 skaliert, damit kleine Bewegungen fein steuerbar bleiben.
 */
export function joystickVector(dx: number, dy: number, radius: number, deadZone = 0.15): Vec2 {
  const distance = Math.hypot(dx, dy);
  if (radius <= 0 || distance === 0) return { x: 0, y: 0 };
  const raw = Math.min(distance / radius, 1);
  if (raw < deadZone) return { x: 0, y: 0 };
  const strength = (raw - deadZone) / (1 - deadZone);
  return { x: (dx / distance) * strength, y: (dy / distance) * strength };
}

/**
 * Bestimmt die Blickrichtung aus einem Bewegungsvektor. Die bisherige Richtung
 * wird bei fast diagonaler Bewegung beibehalten, damit die Figur nicht flackert.
 */
export function directionFromVector(v: Vec2, current: Direction): Direction {
  const ax = Math.abs(v.x);
  const ay = Math.abs(v.y);
  if (ax === 0 && ay === 0) return current;
  const currentIsHorizontal = current === 'left' || current === 'right';
  const hysteresis = 1.2;
  const horizontal = currentIsHorizontal ? ax * hysteresis >= ay : ax > ay * hysteresis;
  if (horizontal) return v.x < 0 ? 'left' : 'right';
  return v.y < 0 ? 'up' : 'down';
}

/** Reduziert einen Vektor auf seine dominante Achse (4-Wege-Bewegung). */
export function snapToFourWay(v: Vec2): Vec2 {
  if (Math.abs(v.x) >= Math.abs(v.y)) return { x: v.x, y: 0 };
  return { x: 0, y: v.y };
}

/** Kleiner deterministischer Zufallsgenerator (Mulberry32) für reproduzierbare Welten. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
