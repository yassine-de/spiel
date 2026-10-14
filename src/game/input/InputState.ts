import type { Vec2 } from '../types';

/**
 * Zentrale Eingabe: Joystick und Tastatur schreiben hinein, die Spiellogik liest.
 * Solange ein Menü, Dialog oder Hinweis offen ist („Blocker“), liefert sie
 * keine Bewegung – so läuft die Figur nie unbeabsichtigt weiter.
 */
export class InputState {
  private joystick: Vec2 = { x: 0, y: 0 };
  private keyboard: Vec2 = { x: 0, y: 0 };
  private interactQueued = false;
  private readonly blockers = new Set<string>();
  private readonly resetListeners = new Set<() => void>();

  setJoystick(x: number, y: number): void {
    this.joystick = { x, y };
  }

  setKeyboard(x: number, y: number): void {
    this.keyboard = { x, y };
  }

  /** Bewegungsvektor mit Länge 0..1. Der Joystick hat Vorrang vor der Tastatur. */
  get movement(): Vec2 {
    if (this.isBlocked) return { x: 0, y: 0 };
    if (this.joystick.x !== 0 || this.joystick.y !== 0) return { ...this.joystick };
    const { x, y } = this.keyboard;
    const length = Math.hypot(x, y);
    return length > 1 ? { x: x / length, y: y / length } : { x, y };
  }

  requestInteract(): void {
    if (!this.isBlocked) this.interactQueued = true;
  }

  /** Liefert true genau einmal pro Tastendruck. */
  consumeInteract(): boolean {
    const queued = this.interactQueued;
    this.interactQueued = false;
    return queued && !this.isBlocked;
  }

  block(reason: string): void {
    this.blockers.add(reason);
    this.reset();
  }

  unblock(reason: string): void {
    this.blockers.delete(reason);
  }

  get isBlocked(): boolean {
    return this.blockers.size > 0;
  }

  /** Setzt alle Eingaben zurück (z. B. beim Öffnen eines Menüs oder Tab-Wechsel). */
  reset(): void {
    this.joystick = { x: 0, y: 0 };
    this.keyboard = { x: 0, y: 0 };
    this.interactQueued = false;
    for (const listener of this.resetListeners) listener();
  }

  onReset(listener: () => void): () => void {
    this.resetListeners.add(listener);
    return () => this.resetListeners.delete(listener);
  }
}
