import { describe, expect, it } from 'vitest';
import { CollisionManager } from '../src/game/systems/CollisionManager';

const box = (x: number, y: number) => ({ x, y, w: 20, h: 10 });

describe('CollisionManager', () => {
  it('bewegt frei, wenn nichts im Weg ist', () => {
    const c = new CollisionManager({ x: 0, y: 0, w: 1000, h: 1000 });
    const r = c.move(box(100, 100), 30, -20);
    expect(r).toEqual({ x: 130, y: 80, blockedX: false, blockedY: false });
  });

  it('stoppt an einem Hindernis (rechts)', () => {
    const c = new CollisionManager({ x: 0, y: 0, w: 1000, h: 1000 });
    c.addSolid({ x: 150, y: 50, w: 50, h: 100 });
    const r = c.move(box(100, 100), 100, 0);
    expect(r.x).toBe(130); // 150 - Breite 20
    expect(r.blockedX).toBe(true);
  });

  it('stoppt an einem Hindernis (oben) und gleitet seitlich weiter', () => {
    const c = new CollisionManager({ x: 0, y: 0, w: 1000, h: 1000 });
    c.addSolid({ x: 0, y: 50, w: 1000, h: 20 });
    const r = c.move(box(100, 100), 15, -60);
    expect(r.y).toBe(70);
    expect(r.x).toBe(115);
    expect(r.blockedY).toBe(true);
    expect(r.blockedX).toBe(false);
  });

  it('tunnelt bei großen Schritten nicht durch dünne Wände', () => {
    const c = new CollisionManager({ x: 0, y: 0, w: 1000, h: 1000 });
    c.addSolid({ x: 200, y: 0, w: 4, h: 1000 });
    const r = c.move(box(100, 100), 400, 0);
    expect(r.x).toBeLessThanOrEqual(180);
  });

  it('hält die Figur innerhalb der Weltgrenzen', () => {
    const c = new CollisionManager({ x: 0, y: 0, w: 500, h: 400 });
    expect(c.move(box(10, 10), -100, -100)).toMatchObject({ x: 0, y: 0, blockedX: true, blockedY: true });
    expect(c.move(box(470, 380), 100, 100)).toMatchObject({ x: 480, y: 390 });
  });

  it('meldet Kollisionen', () => {
    const c = new CollisionManager({ x: 0, y: 0, w: 500, h: 500 });
    c.addSolid({ x: 100, y: 100, w: 50, h: 50 });
    expect(c.collides(box(120, 120))).toBe(true);
    expect(c.collides(box(0, 0))).toBe(false);
    expect(c.collides(box(-5, 0))).toBe(true);
  });
});
