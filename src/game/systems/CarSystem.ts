import type Phaser from 'phaser';
import { TextureKeys } from '../assets/assetKeys';
import { ASSET_SCALE } from '../config/constants';
import type { Rect, Vec2 } from '../types';
import type { Lane } from '../world/cityLayout';

interface Car {
  sprite: Phaser.GameObjects.Image;
  lane: Lane;
  speed: number;
  x: number;
}

/** Halbe Autolänge und Abmessungen der Kollisionsfläche (Welt-Einheiten). */
const HALF_LENGTH = 72;
const BODY_DEPTH = 30;
/** So weit vor dem Auto muss die Fahrbahn frei sein. */
const SAFETY_DISTANCE = 150;
const LANE_TOLERANCE = 46;
const WRAP_MARGIN = 140;

const TEXTURES = [TextureKeys.CarPink, TextureKeys.CarMint, TextureKeys.CarYellow];

/**
 * Autos fahren auf ihren Spuren durch die Stadt und halten an,
 * sobald die Spielfigur vor ihnen steht – es passiert nie etwas.
 */
export class CarSystem {
  private readonly cars: Car[] = [];

  constructor(
    scene: Phaser.Scene,
    lanes: Lane[],
    private readonly worldWidth: number,
    private readonly getPlayer: () => Vec2,
  ) {
    lanes.forEach((lane, i) => {
      const x = ((i * 0.37 + 0.15) % 1) * worldWidth;
      const sprite = scene.add
        .image(x, lane.y, TEXTURES[i % TEXTURES.length])
        .setOrigin(0.5, 86 / 96)
        .setScale(1 / ASSET_SCALE)
        .setFlipX(lane.direction < 0)
        .setDepth(lane.y);
      this.cars.push({ sprite, lane, speed: 95 + (i % 3) * 18, x });
    });
  }

  update(deltaMs: number): void {
    const dt = Math.min(deltaMs, 100) / 1000;
    const player = this.getPlayer();
    for (const car of this.cars) {
      const dir = car.lane.direction;
      const front = car.x + dir * HALF_LENGTH;
      const ahead = (player.x - front) * dir;
      const inLane = Math.abs(player.y - car.lane.y) < LANE_TOLERANCE;
      const blocked = inLane && ahead > -HALF_LENGTH && ahead < SAFETY_DISTANCE;
      if (!blocked) car.x += dir * car.speed * dt;
      if (dir > 0 && car.x > this.worldWidth + WRAP_MARGIN) car.x = -WRAP_MARGIN;
      if (dir < 0 && car.x < -WRAP_MARGIN) car.x = this.worldWidth + WRAP_MARGIN;
      car.sprite.x = car.x;
    }
  }

  /** Kollisionsflächen der Autos (für den CollisionManager). */
  solids(): Rect[] {
    return this.cars.map((car) => ({ x: car.x - HALF_LENGTH, y: car.lane.y - BODY_DEPTH, w: HALF_LENGTH * 2, h: BODY_DEPTH }));
  }
}
