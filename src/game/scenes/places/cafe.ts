import Phaser from 'phaser';
import { cakeName, getMenuItem } from '../../activities/cafe';
import { ASSET_SCALE } from '../../config/constants';
import { Npc } from '../../entities/Npc';
import { NPCS } from '../../npc/npcs';
import { audio, saves, tasks } from '../../services';
import { getUI } from '../../ui';
import { cafeMenu, cakeDesigner } from '../../ui/activities';
import { CAFE_TABLES, CHAIR_BEHIND } from '../../world/interiors';
import { floatIcon, iconShower, sparkleBurst, wait } from '../effects';
import { type Place, type PlaceContext, idleWander } from './PlaceContext';

/** Bens Plätze hinter der Theke (weit genug hinten, damit man ihn über der Theke sieht). */
const HOME = { x: 704, y: 262 };
/** Neben der Kaffeemaschine bzw. der Vitrine – nicht dahinter, sonst wäre er verdeckt */
const MACHINE = { x: 908, y: 262 };
const VITRINE = { x: 500, y: 262 };

interface Treat {
  emoji: string;
  name: string;
}

/**
 * Café: An der Theke bestellen (kostet ein paar Münzen), Ben bereitet alles zu.
 * Am Tisch wird gegessen und getrunken. Kuchen verzieren ist kostenlos.
 */
export function setupCafe(ctx: PlaceContext): Place {
  const { scene, player, interactions, calm } = ctx;
  const ui = getUI();
  const name = saves.playerName;
  const ben = new Npc(scene, NPCS.barista, HOME.x, HOME.y, 'down');
  const stopWander = idleWander(ctx, ben, [
    { ...HOME, facing: 'down' },
    { ...VITRINE, facing: 'right' },
    { ...HOME, facing: 'down' },
    { ...MACHINE, facing: 'left' },
  ]);
  /** Was Samya gerade in der Hand hält */
  let treat: Treat | null = null;

  interactions.add({ id: 'order', x: HOME.x, y: 402, radius: 135, label: 'Bestellen ☕', action: () => void order() });
  interactions.add({ id: 'cake-station', x: 1110, y: 682, radius: 105, label: 'Kuchen verzieren 🎂', action: () => void decorate() });
  CAFE_TABLES.forEach((table, i) => {
    interactions.add({ id: `table-${i}`, x: table.x, y: table.y + 24, radius: 88, label: 'Hinsetzen 🪑', action: () => void sit(i) });
  });

  async function order(): Promise<void> {
    if (ctx.isBusy()) return;
    if (treat) {
      ben.face('down');
      ben.say(`Du hast doch schon ${treat.emoji}! Setz dich an einen Tisch und genieß es 😊`);
      return;
    }
    ctx.setBusy(true);
    await ben.walkTo([HOME], 'down');
    ben.say(`Hallo ${name}! Was möchtest du? 😊`, 2400);
    const id = await cafeMenu(ui.activity, saves.coins);
    const item = id ? getMenuItem(id) : null;
    if (!item) {
      ben.say('Bis gleich! 👋', 2000);
      ctx.setBusy(false);
      return;
    }
    if (!saves.spend(item.price)) {
      audio.play('oops');
      ui.toast.show(`Oh ${name}, dafür fehlen dir noch ein paar Münzen! 💕`);
      ctx.setBusy(false);
      return;
    }
    audio.play('coin');
    ui.refreshCoins();
    ben.say('Kommt sofort! ☕', 1800);
    await ben.walkTo([MACHINE], 'left');
    for (let i = 0; i < 3; i++) {
      audio.play('pour');
      floatIcon(scene, 860 + (i - 1) * 14, 200, i === 1 ? item.emoji : '💨', calm);
      await wait(scene, 520);
    }
    await ben.walkTo([HOME], 'down');
    floatIcon(scene, HOME.x, HOME.y - 70, item.emoji, calm);
    audio.play('add');
    ben.say(`${item.serve} Bitte schön, ${name}! 🪑`, 3400);
    treat = { emoji: item.emoji, name: item.name };
    ui.toast.show(`Du hast ${item.name} ${item.emoji}! Such dir einen Tisch aus.`);
    ctx.setBusy(false);
  }

  async function decorate(): Promise<void> {
    if (ctx.isBusy()) return;
    ctx.setBusy(true);
    const design = await cakeDesigner(ui.activity);
    if (design) {
      const cake = cakeName(design);
      treat = { emoji: '🎂', name: cake };
      audio.play('sparkle');
      sparkleBurst(scene, 1110, 540, calm);
      tasks.report('cake');
      ben.face('down');
      ben.say('Wow, was für ein Kunstwerk! Lass ihn dir schmecken! 🎂', 3400);
      ui.toast.show(`Dein ${cake} ist fertig! Setz dich an einen Tisch 🪑`);
    }
    ctx.setBusy(false);
  }

  async function sit(index: number): Promise<void> {
    if (ctx.isBusy()) return;
    ctx.setBusy(true);
    const table = CAFE_TABLES[index];
    const chairY = table.y - CHAIR_BEHIND;
    player.sitAt(table.x, chairY - 8, chairY + 0.5);
    audio.play('interact');
    if (treat) {
      const current = treat;
      treat = null;
      const plate = scene.add
        .text(table.x, table.y - 58, current.emoji, { fontSize: `${30 * ASSET_SCALE}px` })
        .setOrigin(0.5)
        .setScale(1 / ASSET_SCALE)
        .setDepth(table.y + 1);
      await wait(scene, 500);
      for (let i = 0; i < 3; i++) {
        audio.play('add');
        floatIcon(scene, table.x + (i - 1) * 18, chairY - 96, ['😋', '💖', '✨'][i], calm);
        scene.tweens.add({ targets: plate, scale: (1 - (i + 1) * 0.25) / ASSET_SCALE, duration: 300, ease: Phaser.Math.Easing.Sine.Out });
        await wait(scene, 700);
      }
      plate.destroy();
      iconShower(scene, table.x, chairY - 90, ['💖', '😋'], calm, 4);
      tasks.report('cafe-treat');
      ui.toast.show(`Mmmh, ${current.name} war superlecker! 😋`);
    } else {
      ui.toast.show('Gemütlich hier! An der Theke kannst du dir etwas Leckeres bestellen ☕');
      await wait(scene, 1200);
    }
    await wait(scene, calm ? 300 : 900);
    // Seitlich neben dem Tisch aufstehen (dort ist immer Platz)
    player.standUp(table.x + 80, table.y - 8, 'down');
    interactions.suppressUntilLeft(`table-${index}`);
    ctx.setBusy(false);
  }

  return {
    destroy: () => {
      stopWander();
      ben.destroy();
    },
  };
}
