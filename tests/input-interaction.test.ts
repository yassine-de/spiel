import { describe, expect, it } from 'vitest';
import { InputState } from '../src/game/input/InputState';
import { InteractionManager } from '../src/game/systems/InteractionManager';

describe('InputState', () => {
  it('normalisiert diagonale Tastatureingaben', () => {
    const input = new InputState();
    input.setKeyboard(1, 1);
    expect(Math.hypot(input.movement.x, input.movement.y)).toBeCloseTo(1);
  });

  it('bevorzugt den Joystick', () => {
    const input = new InputState();
    input.setKeyboard(1, 0);
    input.setJoystick(0, -0.5);
    expect(input.movement).toEqual({ x: 0, y: -0.5 });
  });

  it('blockiert Bewegung und Aktionen, solange ein Menü offen ist', () => {
    const input = new InputState();
    let resets = 0;
    input.onReset(() => resets++);
    input.setJoystick(1, 0);
    input.block('pause');
    expect(resets).toBe(1);
    expect(input.movement).toEqual({ x: 0, y: 0 });
    input.requestInteract();
    expect(input.consumeInteract()).toBe(false);
    input.unblock('pause');
    // Nach dem Schließen läuft die Figur nicht von selbst weiter
    expect(input.movement).toEqual({ x: 0, y: 0 });
  });

  it('löst eine Aktion genau einmal aus', () => {
    const input = new InputState();
    input.requestInteract();
    expect(input.consumeInteract()).toBe(true);
    expect(input.consumeInteract()).toBe(false);
  });

  it('bleibt blockiert, bis alle Gründe aufgehoben sind', () => {
    const input = new InputState();
    input.block('a');
    input.block('b');
    input.unblock('a');
    expect(input.isBlocked).toBe(true);
    input.unblock('b');
    expect(input.isBlocked).toBe(false);
  });
});

describe('InteractionManager', () => {
  function setup() {
    let now = 0;
    const changes: (string | null)[] = [];
    const calls: string[] = [];
    const manager = new InteractionManager(
      (item) => changes.push(item?.id ?? null),
      () => now,
    );
    manager.add({ id: 'sign', x: 100, y: 100, radius: 50, label: 'Schild lesen', action: () => calls.push('sign') });
    manager.add({ id: 'fountain', x: 200, y: 100, radius: 80, label: 'Brunnen', action: () => calls.push('fountain') });
    return { manager, changes, calls, advance: (ms: number) => (now += ms) };
  }

  it('bietet nur Aktionen in Reichweite an', () => {
    const { manager, changes } = setup();
    manager.update(500, 500);
    expect(manager.active).toBeNull();
    manager.update(110, 100);
    expect(manager.active?.id).toBe('sign');
    manager.update(110, 100);
    expect(changes).toEqual(['sign']);
  });

  it('wählt das nächstgelegene Objekt', () => {
    const { manager } = setup();
    manager.update(145, 100);
    expect(manager.active?.id).toBe('sign');
    manager.update(160, 100);
    expect(manager.active?.id).toBe('fountain');
  });

  it('verhindert versehentliches Doppelauslösen', () => {
    const { manager, calls, advance } = setup();
    manager.update(100, 100);
    advance(1000);
    expect(manager.trigger()).toBe(true);
    advance(100);
    expect(manager.trigger()).toBe(false);
    advance(400);
    expect(manager.trigger()).toBe(true);
    expect(calls).toEqual(['sign', 'sign']);
  });

  it('tut nichts ohne aktives Objekt', () => {
    const { manager, calls } = setup();
    manager.update(900, 900);
    expect(manager.trigger()).toBe(false);
    expect(calls).toEqual([]);
  });
});
