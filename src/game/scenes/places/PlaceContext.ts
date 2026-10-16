import type Phaser from 'phaser';
import type { Npc } from '../../entities/Npc';
import type { Player } from '../../entities/Player';
import type { InteractionManager } from '../../systems/InteractionManager';
import type { Direction } from '../../types';
import type { BuiltWorld } from '../../world/WorldBuilder';

/** Was die Szenarien in Salon, Café und Schule von der Szene brauchen. */
export interface PlaceContext {
  scene: Phaser.Scene;
  player: Player;
  interactions: InteractionManager;
  world: BuiltWorld;
  /** „Weniger Bewegung“ aktiv */
  calm: boolean;
  setBusy(on: boolean): void;
  isBusy(): boolean;
}

/** Ein eingerichteter Ort mit eigener Logik. */
export interface Place {
  update?(time: number, delta: number): void;
  destroy(): void;
}

/** In welche Richtung muss die Figur schauen, um die Spielerin anzusehen? */
export function faceToward(npc: Npc, target: { x: number; y: number }): Direction {
  const dx = target.x - npc.x;
  const dy = target.y - npc.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}

/** Plauder-Interaktion, die der Figur folgt. Gibt eine Funktion zum Nachführen zurück. */
export function addChat(ctx: PlaceContext, npc: Npc, id: string, playerName: string): () => void {
  const item = {
    id,
    x: npc.x,
    y: npc.y + 10,
    radius: 78,
    label: `Mit ${npc.def.name} plaudern 💬`,
    action: () => {
      npc.face(faceToward(npc, ctx.player));
      npc.chat(playerName);
    },
  };
  ctx.interactions.add(item);
  return () => {
    item.x = npc.x;
    item.y = npc.y + 10;
  };
}

/** Lässt eine Figur in Ruhezeiten zwischen ein paar Punkten umhergehen. */
export function idleWander(ctx: PlaceContext, npc: Npc, spots: { x: number; y: number; facing: Direction }[], everyMs = 6500): () => void {
  let index = 0;
  const timer = ctx.scene.time.addEvent({
    delay: everyMs,
    loop: true,
    callback: () => {
      if (ctx.isBusy() || npc.busy) return;
      index = (index + 1) % spots.length;
      const spot = spots[index];
      void npc.walkTo([spot], spot.facing);
    },
  });
  return () => timer.remove();
}
