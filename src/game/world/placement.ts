import type { Direction, Rect, Vec2 } from '../types';
import { rectsOverlap } from '../utils/math';

/** Bodenfläche eines aufgestellten Spielzeugs (Welt-Einheiten). */
export const ITEM_FOOTPRINT = { w: 56, h: 20 } as const;
/** Mindestabstand zwischen zwei aufgestellten Dingen. */
export const ITEM_SPACING = 58;
/** So weit vor der Figur wird ein Spielzeug abgestellt. */
const AHEAD = 64;

export interface PlacementContext {
  /** Boden, auf dem aufgestellt werden darf */
  area: Rect;
  /** Möbel und Wände */
  solids: readonly Rect[];
  /** Schon aufgestellte Dinge */
  occupied: readonly Vec2[];
  /** Freizuhaltende Bereiche (z. B. vor der Haustür) */
  keepClear: readonly { x: number; y: number; r: number }[];
}

export function itemFootprint(p: Vec2): Rect {
  return { x: p.x - ITEM_FOOTPRINT.w / 2, y: p.y - ITEM_FOOTPRINT.h, w: ITEM_FOOTPRINT.w, h: ITEM_FOOTPRINT.h };
}

export function isFreeSpot(p: Vec2, ctx: PlacementContext): boolean {
  const box = itemFootprint(p);
  const a = ctx.area;
  if (box.x < a.x || box.y < a.y || box.x + box.w > a.x + a.w || box.y + box.h > a.y + a.h) return false;
  if (ctx.solids.some((s) => rectsOverlap(box, s))) return false;
  if (ctx.occupied.some((o) => Math.hypot(o.x - p.x, o.y - p.y) < ITEM_SPACING)) return false;
  if (ctx.keepClear.some((k) => Math.hypot(k.x - p.x, k.y - p.y) < k.r)) return false;
  return true;
}

const STEP: Record<Direction, Vec2> = { down: { x: 0, y: 1 }, up: { x: 0, y: -1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

/**
 * Sucht einen Platz direkt vor der Figur (in Blickrichtung), sonst an der Stelle der Figur
 * oder knapp daneben. null, wenn hier wirklich kein Platz ist.
 */
export function findPlacement(player: Vec2, facing: Direction, ctx: PlacementContext): Vec2 | null {
  const dir = STEP[facing];
  const ahead = { x: player.x + dir.x * AHEAD, y: player.y + dir.y * AHEAD + (dir.y < 0 ? 0 : 10) };
  const candidates: Vec2[] = [
    ahead,
    { x: player.x + 44, y: player.y + 8 },
    { x: player.x - 44, y: player.y + 8 },
    { x: player.x, y: player.y + 30 },
  ];
  return candidates.find((c) => isFreeSpot(c, ctx)) ?? null;
}
