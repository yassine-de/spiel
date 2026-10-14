import type { InputState } from './InputState';

const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const INTERACT = new Set(['Space', 'Enter', 'KeyE']);

/** Tastatursteuerung für Tablets mit Tastatur und zum Testen am Computer. */
export class KeyboardInput {
  private readonly pressed = new Set<string>();
  /** Wird bei Escape / P aufgerufen, z. B. um das Pausemenü zu öffnen. */
  onPause: (() => void) | null = null;

  constructor(private readonly input: InputState) {
    window.addEventListener('keydown', this.handleDown);
    window.addEventListener('keyup', this.handleUp);
    window.addEventListener('blur', this.clear);
    input.onReset(() => this.pressed.clear());
  }

  private readonly handleDown = (event: KeyboardEvent): void => {
    if (isTextField(event.target)) return;
    if (event.code === 'Escape' || event.code === 'KeyP') {
      this.onPause?.();
      return;
    }
    if (INTERACT.has(event.code)) {
      // Leertaste/Enter sollen keine fokussierten Buttons doppelt auslösen.
      if (!event.repeat && !isButton(event.target)) {
        this.input.requestInteract();
        event.preventDefault();
      }
      return;
    }
    if (UP.has(event.code) || DOWN.has(event.code) || LEFT.has(event.code) || RIGHT.has(event.code)) {
      event.preventDefault();
      if (this.input.isBlocked) return;
      this.pressed.add(event.code);
      this.sync();
    }
  };

  private readonly handleUp = (event: KeyboardEvent): void => {
    if (this.pressed.delete(event.code)) this.sync();
  };

  private readonly clear = (): void => {
    this.pressed.clear();
    this.sync();
  };

  private sync(): void {
    const has = (keys: Set<string>) => [...keys].some((k) => this.pressed.has(k));
    const x = (has(RIGHT) ? 1 : 0) - (has(LEFT) ? 1 : 0);
    const y = (has(DOWN) ? 1 : 0) - (has(UP) ? 1 : 0);
    this.input.setKeyboard(x, y);
  }
}

function isTextField(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement && target.type !== 'range' && target.type !== 'checkbox';
}

function isButton(target: EventTarget | null): boolean {
  return target instanceof HTMLButtonElement || target instanceof HTMLInputElement;
}
