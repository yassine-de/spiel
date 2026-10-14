import type { InputState } from '../input/InputState';
import { joystickVector } from '../utils/math';
import { h } from './dom';

/**
 * Virtueller Joystick unten links.
 * Er erscheint dort, wo der Daumen den linken Bildschirmbereich berührt,
 * und kehrt beim Loslassen an seine Ruheposition zurück.
 * Mehrere Finger gleichzeitig (Joystick + Interaktionsbutton) funktionieren.
 */
export class VirtualJoystick {
  readonly el: HTMLElement;
  private readonly base: HTMLElement;
  private readonly knob: HTMLElement;
  private pointerId: number | null = null;
  private centerX = 0;
  private centerY = 0;
  private radius = 1;

  constructor(private readonly input: InputState) {
    this.knob = h('div', { class: 'joystick-knob' });
    this.base = h('div', { class: 'joystick-base' }, this.knob);
    this.el = h('div', { class: 'joystick-zone', attrs: { 'aria-hidden': 'true' } }, this.base);

    this.el.addEventListener('pointerdown', this.onDown);
    this.el.addEventListener('pointermove', this.onMove);
    this.el.addEventListener('pointerup', this.onUp);
    this.el.addEventListener('pointercancel', this.onUp);
    this.el.addEventListener('lostpointercapture', this.onUp);
    input.onReset(() => this.release());
  }

  private readonly onDown = (event: PointerEvent): void => {
    if (this.pointerId !== null || this.input.isBlocked) return;
    event.preventDefault();
    this.pointerId = event.pointerId;
    try {
      this.el.setPointerCapture(event.pointerId);
    } catch {
      // Ältere Browser: Bewegung funktioniert trotzdem innerhalb der Zone.
    }

    // Joystick unter den Daumen verschieben (bleibt vollständig sichtbar).
    const zone = this.el.getBoundingClientRect();
    const home = this.homeCenter();
    const half = this.base.offsetWidth / 2;
    this.radius = half * 0.62;
    this.centerX = clamp(event.clientX, zone.left + half, zone.right - half);
    this.centerY = clamp(event.clientY, zone.top + half, zone.bottom - half);
    this.base.style.transform = `translate(${this.centerX - home.x}px, ${this.centerY - home.y}px)`;
    this.el.classList.add('is-active');
    this.update(event);
  };

  private readonly onMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    event.preventDefault();
    this.update(event);
  };

  private readonly onUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.release();
  };

  private update(event: PointerEvent): void {
    const dx = event.clientX - this.centerX;
    const dy = event.clientY - this.centerY;
    const distance = Math.hypot(dx, dy);
    const limit = distance > this.radius ? this.radius / distance : 1;
    this.knob.style.transform = `translate(${dx * limit}px, ${dy * limit}px)`;
    const v = joystickVector(dx, dy, this.radius);
    this.input.setJoystick(v.x, v.y);
  }

  /** Ruheposition: Mittelpunkt der Basis ohne Verschiebung. */
  private homeCenter(): { x: number; y: number } {
    const previous = this.base.style.transform;
    this.base.style.transform = '';
    const rect = this.base.getBoundingClientRect();
    this.base.style.transform = previous;
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  release(): void {
    if (this.pointerId !== null) {
      try {
        this.el.releasePointerCapture(this.pointerId);
      } catch {
        // bereits freigegeben
      }
    }
    this.pointerId = null;
    this.base.style.transform = '';
    this.knob.style.transform = '';
    this.el.classList.remove('is-active');
    this.input.setJoystick(0, 0);
  }
}

function clamp(value: number, min: number, max: number): number {
  return max < min ? (min + max) / 2 : Math.min(max, Math.max(min, value));
}
