import { PLAYER_SPEED, SNAP_MOVEMENT_TO_FOUR_DIRECTIONS } from '../config/constants';
import { Player } from '../entities/Player';
import type { InputState } from '../input/InputState';
import { directionFromVector, snapToFourWay } from '../utils/math';
import type { CollisionManager } from './CollisionManager';

/** Größter berücksichtigter Zeitschritt – verhindert Sprünge nach Rucklern. */
const MAX_DELTA_MS = 100;

/** Liest die Eingabe, bewegt die Figur mit Kollisionsprüfung und wählt die Animation. */
export class PlayerController {
  constructor(
    private readonly player: Player,
    private readonly collisions: CollisionManager,
    private readonly input: InputState,
  ) {}

  update(deltaMs: number): void {
    const dt = Math.min(deltaMs, MAX_DELTA_MS) / 1000;
    let v = this.input.movement;
    if (SNAP_MOVEMENT_TO_FOUR_DIRECTIONS) v = snapToFourWay(v);
    const strength = Math.min(1, Math.hypot(v.x, v.y));

    if (strength < 0.01) {
      this.player.animate(false, this.player.facing, 0);
      return;
    }

    const facing = directionFromVector(v, this.player.facing);
    const start = { x: this.player.x, y: this.player.y };
    const box = this.player.footprint();
    const result = this.collisions.move(box, v.x * PLAYER_SPEED * dt, v.y * PLAYER_SPEED * dt);
    const next = Player.positionFromFootprint({ ...box, x: result.x, y: result.y });
    this.player.setPosition(next.x, next.y);

    const moved = Math.hypot(next.x - start.x, next.y - start.y) > 0.05;
    this.player.animate(moved, facing, strength);
  }
}
