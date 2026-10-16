import { Npc } from '../../entities/Npc';
import { NPCS } from '../../npc/npcs';
import { audio, saves, tasks } from '../../services';
import { getUI } from '../../ui';
import { type SalonService, accessoryName, salonMenu } from '../../ui/activities';
import { SALON_CHAIRS_X, SALON_CHAIR_Y } from '../../world/interiors';
import { floatIcon, iconShower, sparkleBurst, wait } from '../effects';
import { type Place, type PlaceContext, addChat, idleWander } from './PlaceContext';

/** Gang vor den Stühlen, auf dem Lina läuft. */
const AISLE_Y = 420;
const HOME = { x: 1200, y: 380 };

const WORK_ICONS: Record<SalonService, string[]> = {
  cut: ['✂️', '💇‍♀️', '✨'],
  color: ['🎨', '🌈', '✨'],
  style: ['🎀', '💖', '✨'],
  wash: ['🫧', '💨', '💧'],
};

const WORK_TEXT: Record<SalonService, string> = {
  cut: 'Schnipp, schnapp – jetzt wird geschnitten! ✂️',
  color: 'Ich mische deine neue Farbe … 🎨',
  style: 'Ein bisschen Haarschmuck, und fertig! 🎀',
  wash: 'Erst waschen, dann schön föhnen! 🫧',
};

const TIPS = [
  'In der Zeitschrift steht: „Zöpfe sind diesen Sommer total angesagt!“ 💇‍♀️',
  'In der Zeitschrift steht: „Glitzer passt zu jeder Frisur!“ ✨',
  'In der Zeitschrift steht: „Lockenkopf-Tag ist jeden Tag!“ 🌀',
  'In der Zeitschrift steht: „Zweifarbige Haare – der große Trend!“ 🖤🤍',
];

/**
 * Friseursalon: drei Stühle. Setzt sich Samya, kommt Lina, fragt nach dem Wunsch,
 * frisiert (schneiden, färben, Haarschmuck oder waschen & föhnen) und geht zurück.
 */
export function setupSalon(ctx: PlaceContext): Place {
  const { scene, player, interactions, calm } = ctx;
  const ui = getUI();
  const name = saves.playerName;
  const lina = new Npc(scene, NPCS.hairdresser, HOME.x, HOME.y, 'left');
  const followChat = addChat(ctx, lina, 'npc-lina', name);
  const stopWander = idleWander(ctx, lina, [
    { ...HOME, facing: 'left' },
    { x: 1110, y: 480, facing: 'down' },
    { x: 1250, y: 650, facing: 'up' },
  ]);

  SALON_CHAIRS_X.forEach((x, i) => {
    interactions.add({ id: `seat-${i}`, x, y: SALON_CHAIR_Y + 42, radius: 82, label: 'Auf den Stuhl setzen 💺', action: () => void haircut(i) });
  });
  interactions.add({
    id: 'magazines',
    x: 230,
    y: 690,
    radius: 95,
    label: 'Zeitschrift lesen 📖',
    action: () => {
      audio.play('interact');
      ui.toast.show(TIPS[Math.floor(Math.random() * TIPS.length)]);
    },
  });
  interactions.add({
    id: 'hair-shelf',
    x: 1250,
    y: 628,
    radius: 110,
    label: 'Haarpflege ansehen 🧴',
    action: () => {
      audio.play('interact');
      ui.toast.show('Shampoo mit Erdbeerduft, Glitzerspray und Regenbogen-Spülung – hier riecht alles so gut! 🍓');
    },
  });

  const walkAisle = (target: { x: number; y: number }, facing: 'left' | 'down' | 'up' | 'right') =>
    lina.walkTo([{ x: lina.x, y: AISLE_Y }, { x: target.x, y: AISLE_Y }, target], facing);

  async function haircut(chair: number): Promise<void> {
    if (ctx.isBusy()) return;
    ctx.setBusy(true);
    const x = SALON_CHAIRS_X[chair];
    // Sitzfläche liegt höher als der Fuß des Stuhls; Tiefe knapp vor dem Stuhl
    player.sitAt(x, SALON_CHAIR_Y - 14, SALON_CHAIR_Y + 1);
    audio.play('interact');
    lina.say(`Hallo ${name}! Ich komme sofort! 💕`, 2200);
    const side = { x: x + 68, y: SALON_CHAIR_Y + 18 };
    await walkAisle(side, 'left');
    lina.say('Was darf es heute sein? 💇‍♀️', 2600);
    await wait(scene, calm ? 100 : 400);

    const before = saves.avatar;
    const result = await salonMenu(ui.activity, before, saves.owns, name);
    if (!result) {
      lina.say('Kein Problem! Komm jederzeit wieder 💕', 2600);
      await wait(scene, 600);
      finish(chair);
      return;
    }

    lina.say(WORK_TEXT[result.service], 3000);
    const headY = SALON_CHAIR_Y - 94;
    const steps = calm ? 3 : 6;
    for (let step = 0; step < steps; step++) {
      audio.play(result.service === 'cut' ? 'snip' : 'pour');
      lina.face(step % 2 === 0 ? 'left' : 'up');
      const icons = WORK_ICONS[result.service];
      floatIcon(scene, x + (step % 2 === 0 ? -26 : 26), headY, icons[step % icons.length], calm);
      await wait(scene, 480);
      // Mitten in der Arbeit erscheint der neue Look
      if (step === Math.floor(steps / 2)) {
        ui.applyAvatar(result.avatar);
        sparkleBurst(scene, x, headY + 10, calm);
      }
    }
    lina.face('left');
    audio.play('sparkle');
    if (result.glitter) iconShower(scene, x, headY, ['✨', '💫', '⭐'], calm, 8, 60);
    tasks.report('haircut');
    lina.say(`Fertig! Du siehst wunderschön aus, ${name}! 💖`, 3200);
    ui.toast.show(doneText(result.service, result.avatar.hairAccessory));
    await wait(scene, calm ? 600 : 1500);
    finish(chair);
  }

  function finish(chair: number): void {
    const x = SALON_CHAIRS_X[chair];
    player.standUp(x, SALON_CHAIR_Y + 46, 'down');
    // Nicht sofort wieder „Hinsetzen“ anbieten
    interactions.suppressUntilLeft(`seat-${chair}`);
    ctx.setBusy(false);
    void walkAisle(HOME, 'left');
  }

  function doneText(service: SalonService, accessory: string | null): string {
    switch (service) {
      case 'cut':
        return `Deine neue Frisur ist fertig, ${name}! ✂️💖`;
      case 'color':
        return 'Wow, deine neue Haarfarbe leuchtet! 🌈';
      case 'style':
        return accessory ? `${accessoryName(accessory)} – sieht zauberhaft aus! 🎀` : 'Ganz natürlich – auch schön! 💖';
      default:
        return 'Frisch gewaschen und geföhnt – deine Haare duften nach Erdbeeren! 🍓';
    }
  }

  return {
    update: () => followChat(),
    destroy: () => {
      stopWander();
      lina.destroy();
    },
  };
}
