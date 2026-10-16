import Phaser from 'phaser';
import { ASSET_SCALE, DEPTH } from '../config/constants';
import type { NpcDef } from '../npc/npcs';
import type { Direction, Vec2 } from '../types';
import { Player } from './Player';

/** Gehtempo der Figuren in den Läden (Welt-Einheiten pro Sekunde). */
const NPC_SPEED = 170;
/** Höhe der Sprechblase über dem Fußpunkt. */
const BUBBLE_HEIGHT = 128;

function directionTo(dx: number, dy: number, fallback: Direction): Direction {
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}

/**
 * Eine Figur im Laden (Friseurin, Café-Besitzer, Lehrerin): läuft Wege ab,
 * schaut in eine Richtung und spricht in einer Sprechblase.
 * Sie ist kein Hindernis – so kann sie Samya nie den Weg versperren.
 */
export class Npc {
  readonly body: Player;
  private bubble: Phaser.GameObjects.Container | null = null;
  private bubbleTimer: Phaser.Time.TimerEvent | null = null;
  private walking: Phaser.Tweens.Tween | null = null;
  private walkToken = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly def: NpcDef,
    x: number,
    y: number,
    facing: Direction = 'down',
  ) {
    this.body = new Player(scene, x, y, def.texture);
    this.body.animate(false, facing, 0);
  }

  get x(): number {
    return this.body.x;
  }

  get y(): number {
    return this.body.y;
  }

  get busy(): boolean {
    return this.walking !== null;
  }

  face(direction: Direction): void {
    this.body.animate(false, direction, 0);
  }

  /** Läuft die Punkte nacheinander ab. Ein neuer Weg bricht den alten ab. */
  walkTo(points: Vec2[], finalFacing?: Direction): Promise<void> {
    this.stop();
    const token = ++this.walkToken;
    return new Promise((resolve) => {
      const step = (index: number) => {
        if (token !== this.walkToken) return resolve();
        if (index >= points.length) {
          this.walking = null;
          if (finalFacing) this.face(finalFacing);
          else this.body.animate(false, this.body.facing, 0);
          return resolve();
        }
        const target = points[index];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 1) return step(index + 1);
        this.body.animate(true, directionTo(dx, dy, this.body.facing), 0.7);
        const position = { x: this.x, y: this.y };
        this.walking = this.scene.tweens.add({
          targets: position,
          x: target.x,
          y: target.y,
          duration: (distance / NPC_SPEED) * 1000,
          onUpdate: () => {
            this.body.setPosition(position.x, position.y);
            this.followBubble();
          },
          onComplete: () => step(index + 1),
          onStop: () => resolve(),
        });
      };
      step(0);
    });
  }

  stop(): void {
    this.halt();
    this.body.animate(false, this.body.facing, 0);
  }

  /** Sprechblase über dem Kopf; verschwindet nach `ms` Millisekunden. */
  say(text: string, ms = 3200): void {
    this.clearBubble();
    const label = this.scene.add
      .text(0, 0, text, {
        fontFamily: 'Fredoka, sans-serif',
        fontStyle: '600',
        fontSize: `${17 * ASSET_SCALE}px`,
        color: '#7a3a62',
        align: 'center',
        wordWrap: { width: 230 * ASSET_SCALE },
      })
      .setOrigin(0.5, 1)
      .setScale(1 / ASSET_SCALE);
    const w = label.displayWidth + 22;
    const h = label.displayHeight + 14;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x7a3a62, 0.18);
    bg.fillRoundedRect(-w / 2 + 2, -h + 3, w, h, 14);
    bg.fillStyle(0xffffff, 1);
    bg.lineStyle(2.5, 0xffb3d1, 1);
    bg.fillRoundedRect(-w / 2, -h, w, h, 14);
    bg.strokeRoundedRect(-w / 2, -h, w, h, 14);
    bg.fillTriangle(-8, -1, 8, -1, 0, 9);
    label.setPosition(0, -7);
    this.bubble = this.scene.add.container(0, 0, [bg, label]).setDepth(DEPTH.overlay - 10);
    this.followBubble();
    this.bubbleTimer = this.scene.time.delayedCall(ms, () => this.clearBubble());
  }

  /** Zufälliger Plaudersatz. */
  chat(playerName: string): void {
    const lines = this.def.chatter(playerName);
    this.say(lines[Math.floor(Math.random() * lines.length)]);
  }

  /** Beim Verlassen des Raums: Phaser hat die Sprites dann schon entfernt. */
  destroy(): void {
    this.halt();
    this.clearBubble();
  }

  private halt(): void {
    this.walkToken++;
    const tween = this.walking;
    this.walking = null;
    tween?.stop();
  }

  private followBubble(): void {
    this.bubble?.setPosition(this.x, this.y - BUBBLE_HEIGHT);
  }

  private clearBubble(): void {
    this.bubbleTimer?.remove();
    this.bubbleTimer = null;
    this.bubble?.destroy();
    this.bubble = null;
  }
}
