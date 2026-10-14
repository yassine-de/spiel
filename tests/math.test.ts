import { describe, expect, it } from 'vitest';
import { directionFromVector, joystickVector, rectsOverlap, seededRandom, snapToFourWay } from '../src/game/utils/math';

describe('joystickVector', () => {
  it('liefert 0 in der Totzone', () => {
    expect(joystickVector(5, 0, 100)).toEqual({ x: 0, y: 0 });
  });

  it('begrenzt die Stärke auf 1', () => {
    const v = joystickVector(500, 0, 100);
    expect(v.x).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0);
  });

  it('behält die Richtung bei', () => {
    const v = joystickVector(-60, 60, 100);
    expect(v.x).toBeLessThan(0);
    expect(v.y).toBeGreaterThan(0);
    expect(Math.abs(v.x)).toBeCloseTo(Math.abs(v.y));
  });

  it('skaliert weich nach der Totzone', () => {
    const half = joystickVector(0, -57.5, 100, 0.15);
    expect(half.y).toBeCloseTo(-0.5, 2);
  });

  it('kommt mit Radius 0 zurecht', () => {
    expect(joystickVector(10, 10, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe('directionFromVector', () => {
  it('erkennt alle vier Richtungen', () => {
    expect(directionFromVector({ x: 0, y: -1 }, 'down')).toBe('up');
    expect(directionFromVector({ x: 0, y: 1 }, 'up')).toBe('down');
    expect(directionFromVector({ x: -1, y: 0 }, 'down')).toBe('left');
    expect(directionFromVector({ x: 1, y: 0 }, 'down')).toBe('right');
  });

  it('behält die Richtung ohne Bewegung', () => {
    expect(directionFromVector({ x: 0, y: 0 }, 'left')).toBe('left');
  });

  it('flackert bei Diagonalen nicht', () => {
    expect(directionFromVector({ x: 0.7, y: 0.72 }, 'right')).toBe('right');
    expect(directionFromVector({ x: 0.72, y: 0.7 }, 'down')).toBe('down');
  });
});

describe('snapToFourWay', () => {
  it('behält nur die dominante Achse', () => {
    expect(snapToFourWay({ x: 0.9, y: 0.3 })).toEqual({ x: 0.9, y: 0 });
    expect(snapToFourWay({ x: 0.2, y: -0.8 })).toEqual({ x: 0, y: -0.8 });
  });
});

describe('rectsOverlap', () => {
  it('erkennt Überlappung und Berührung', () => {
    expect(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
    expect(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
  });
});

describe('seededRandom', () => {
  it('ist reproduzierbar', () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    for (let i = 0; i < 5; i++) expect(a()).toBe(b());
  });
});
