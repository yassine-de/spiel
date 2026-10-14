export interface Interactable {
  id: string;
  x: number;
  y: number;
  /** Abstand in Welt-Einheiten, ab dem die Aktion angeboten wird. */
  radius: number;
  /** Text auf dem Interaktionsbutton, z. B. „Schild lesen“. */
  label: string;
  action: () => void;
}

/** Mindestabstand zwischen zwei Auslösungen, verhindert versehentliches Doppeltippen. */
const TRIGGER_COOLDOWN_MS = 350;

/**
 * Findet das nächstgelegene Objekt, mit dem die Spielfigur gerade interagieren kann.
 * Der Interaktionsbutton erscheint nur, wenn es tatsächlich eine Aktion gibt.
 */
export class InteractionManager {
  private readonly items = new Map<string, Interactable>();
  private current: Interactable | null = null;
  /** Objekte, die erst wieder angeboten werden, wenn die Figur ihren Bereich verlassen hat. */
  private readonly suppressed = new Set<string>();
  private lastTrigger = -Infinity;

  constructor(
    private readonly onChange: (item: Interactable | null) => void,
    private readonly now: () => number = () => performance.now(),
  ) {}

  add(item: Interactable): void {
    this.items.set(item.id, item);
  }

  remove(id: string): void {
    this.items.delete(id);
    this.suppressed.delete(id);
    if (this.current?.id === id) {
      this.current = null;
      this.onChange(null);
    }
  }

  /**
   * Bietet ein Objekt erst wieder an, nachdem die Figur seinen Bereich verlassen hat.
   * Verhindert z. B., dass man nach dem Verlassen eines Gebäudes sofort wieder hineingeht.
   */
  suppressUntilLeft(id: string): void {
    this.suppressed.add(id);
  }

  get active(): Interactable | null {
    return this.current;
  }

  update(px: number, py: number): void {
    let best: Interactable | null = null;
    let bestDistance = Infinity;
    for (const item of this.items.values()) {
      const distance = Math.hypot(item.x - px, item.y - py);
      if (this.suppressed.has(item.id)) {
        if (distance > item.radius) this.suppressed.delete(item.id);
        continue;
      }
      if (distance <= item.radius && distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    }
    if (best !== this.current) {
      this.current = best;
      this.onChange(best);
    }
  }

  /** Führt die aktuelle Aktion aus. Gibt true zurück, wenn etwas passiert ist. */
  trigger(): boolean {
    if (!this.current) return false;
    const time = this.now();
    if (time - this.lastTrigger < TRIGGER_COOLDOWN_MS) return false;
    this.lastTrigger = time;
    this.current.action();
    return true;
  }

  clear(): void {
    this.items.clear();
    this.suppressed.clear();
    if (this.current) {
      this.current = null;
      this.onChange(null);
    }
  }
}
