import type { Rect } from '../types';
import { rectsOverlap } from '../utils/math';

export interface MoveResult {
  x: number;
  y: number;
  blockedX: boolean;
  blockedY: boolean;
}

/** Größter Einzelschritt; größere Bewegungen werden unterteilt, damit nichts „durchtunnelt“. */
const MAX_STEP = 8;

/**
 * Einfache, robuste Kollisionsprüfung mit Rechtecken.
 * Hindernisse sind die Bodenflächen („Footprints“) von Gebäuden, Bäumen usw.
 * Bewegungen werden je Achse getrennt aufgelöst, so gleitet die Figur an Wänden entlang.
 */
export class CollisionManager {
  private readonly solids: Rect[] = [];
  private readonly dynamicSources: Array<() => Rect[]> = [];

  constructor(private readonly bounds: Rect) {}

  addSolid(rect: Rect): void {
    this.solids.push({ ...rect });
  }

  /** Bewegliche Hindernisse (z. B. Autos), werden bei jeder Bewegung neu abgefragt. */
  addDynamicSource(source: () => Rect[]): void {
    this.dynamicSources.push(source);
  }

  private allSolids(): Rect[] {
    if (this.dynamicSources.length === 0) return this.solids;
    return [...this.solids, ...this.dynamicSources.flatMap((source) => source())];
  }

  get solidCount(): number {
    return this.solids.length;
  }

  collides(box: Rect): boolean {
    if (!this.insideBounds(box)) return true;
    return this.allSolids().some((solid) => rectsOverlap(box, solid));
  }

  /** Bewegt eine Box (x/y = linke obere Ecke) um dx/dy und stoppt an Hindernissen. */
  move(box: Rect, dx: number, dy: number): MoveResult {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / MAX_STEP));
    const current = { ...box };
    const solids = this.allSolids();
    let blockedX = false;
    let blockedY = false;
    for (let i = 0; i < steps; i++) {
      if (!blockedX) blockedX = this.stepAxis(current, dx / steps, 'x', solids);
      if (!blockedY) blockedY = this.stepAxis(current, dy / steps, 'y', solids);
    }
    return { x: current.x, y: current.y, blockedX, blockedY };
  }

  /** Bewegt `box` entlang einer Achse; gibt true zurück, wenn ein Hindernis im Weg war. */
  private stepAxis(box: Rect, delta: number, axis: 'x' | 'y', solids: Rect[]): boolean {
    if (delta === 0) return false;
    const size = axis === 'x' ? box.w : box.h;
    let next = box[axis] + delta;
    let blocked = false;

    const boundsStart = this.bounds[axis];
    const boundsEnd = boundsStart + (axis === 'x' ? this.bounds.w : this.bounds.h);
    if (next < boundsStart) {
      next = boundsStart;
      blocked = true;
    } else if (next + size > boundsEnd) {
      next = boundsEnd - size;
      blocked = true;
    }

    const probe: Rect = { ...box, [axis]: next };
    for (const solid of solids) {
      if (!rectsOverlap(probe, solid)) continue;
      const solidStart = solid[axis];
      const solidSize = axis === 'x' ? solid.w : solid.h;
      next = delta > 0 ? solidStart - size : solidStart + solidSize;
      probe[axis] = next;
      blocked = true;
    }

    box[axis] = next;
    return blocked;
  }

  private insideBounds(box: Rect): boolean {
    const b = this.bounds;
    return box.x >= b.x && box.y >= b.y && box.x + box.w <= b.x + b.w && box.y + box.h <= b.y + b.h;
  }
}
