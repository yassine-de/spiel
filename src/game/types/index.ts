export type Direction = 'down' | 'left' | 'right' | 'up';

export interface Vec2 {
  x: number;
  y: number;
}

/** Achsenparalleles Rechteck, x/y = linke obere Ecke (Welt-Einheiten). */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
