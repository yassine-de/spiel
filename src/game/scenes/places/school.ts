import type Phaser from 'phaser';
import { FUN_FACTS, type Question, mathQuestions, quizReward, wordQuestions } from '../../activities/school';
import { DEPTH } from '../../config/constants';
import { Npc } from '../../entities/Npc';
import { NPCS } from '../../npc/npcs';
import { audio, saves, tasks } from '../../services';
import { localDateKey } from '../../tasks/dailyTasks';
import type { Direction } from '../../types';
import { getUI } from '../../ui';
import { drawingPad, quiz, xylophone } from '../../ui/activities';
import { CHAIR_BEHIND, SCHOOL_DESKS } from '../../world/interiors';
import { loadDrawing, saveDrawing } from '../../../storage/drawingStore';
import { iconShower, sparkleBurst } from '../effects';
import { type Place, type PlaceContext, addChat, idleWander } from './PlaceContext';

const BOARD_SPOT = { x: 560, y: 250 };
/** Samyas Bild im Rahmen an der Wand (Mitte der Papierfläche, Größe in Welt-Einheiten) */
const PICTURE = { x: 1110, y: 98, w: 122, h: 81 };
const DRAWING_TEXTURE = 'school-drawing';

const PRAISE = ['Ganz toll gemacht! 🌟', 'Du bist ja eine richtige Rechenkönigin! 👑', 'Prima! Du lernst so schnell! 📚', 'Super, ich bin stolz auf dich! 💖'];

/**
 * Schule: Rechen-Rätsel an der Tafel, Wörter-Spiel an der Schulbank,
 * Malecke (das Bild hängt danach an der Wand), Xylophon mit Lied und ein Bücherregal.
 * Für Rätsel gibt es ein paar Münzen (mit Tageslimit).
 */
export function setupSchool(ctx: PlaceContext): Place {
  const { scene, player, interactions, calm } = ctx;
  const ui = getUI();
  const name = saves.playerName;
  const teacher = new Npc(scene, NPCS.teacher, BOARD_SPOT.x, BOARD_SPOT.y, 'down');
  const followChat = addChat(ctx, teacher, 'npc-teacher', name);
  const stopWander = idleWander(ctx, teacher, [
    { ...BOARD_SPOT, facing: 'down' },
    { x: 850, y: 250, facing: 'down' },
    { x: 704, y: 380, facing: 'down' },
  ], 7000);
  let picture: Phaser.GameObjects.Image | null = null;
  let factIndex = Math.floor(Math.random() * FUN_FACTS.length);

  const stored = loadDrawing();
  if (stored) showPicture(stored, false);

  interactions.add({ id: 'blackboard', x: 704, y: 250, radius: 120, label: 'Rechen-Rätsel lösen 🧮', action: () => void mathQuiz() });
  SCHOOL_DESKS.forEach((desk, i) => {
    interactions.add({ id: `desk-${i}`, x: desk.x, y: desk.y + 28, radius: 66, label: 'Hinsetzen: Wörter-Spiel 📖', action: () => void wordGame(i) });
  });
  interactions.add({ id: 'easel', x: 150, y: 628, radius: 100, label: 'Malen 🎨', action: () => void paint() });
  interactions.add({ id: 'xylophone', x: 1260, y: 628, radius: 110, label: 'Xylophon spielen 🎵', action: () => void music() });
  interactions.add({
    id: 'bookshelf',
    x: 160,
    y: 356,
    radius: 110,
    label: 'Ein Buch lesen 📚',
    action: () => {
      audio.play('interact');
      factIndex = (factIndex + 1) % FUN_FACTS.length;
      ui.toast.show(FUN_FACTS[factIndex], 4500);
    },
  });
  interactions.add({
    id: 'globe',
    x: 1060,
    y: 346,
    radius: 100,
    label: 'Den Globus drehen 🌍',
    action: () => {
      audio.play('interact');
      iconShower(scene, 1100, 200, ['🌍', '✨'], calm, 3, 30);
      ui.toast.show('Die Erde ist rund und dreht sich einmal am Tag um sich selbst! 🌍');
    },
  });

  function goTo(target: { x: number; y: number }, facing: Direction): Promise<void> {
    return teacher.walkTo([target], facing);
  }

  /** Münzen für ein Rätsel gutschreiben (mit Tageslimit) und loben. */
  function reward(firstTry: number): void {
    tasks.report('school-quiz');
    const granted = saves.earnFromActivity(localDateKey(new Date()), quizReward(firstTry));
    teacher.say(PRAISE[Math.floor(Math.random() * PRAISE.length)], 3000);
    if (granted > 0) {
      audio.play('coin');
      ui.refreshCoins();
      ui.toast.show(`Für deine Rätsel bekommst du ${granted} Münzen! 🪙`);
    } else {
      ui.toast.show('Die Rätsel-Münzen für heute hast du schon alle – aber Üben macht trotzdem schlau! 🌟', 4200);
    }
  }

  async function playQuiz(title: string, questions: Question[]): Promise<void> {
    const result = await quiz(ui.activity, title, questions);
    if (result) reward(result.firstTry);
  }

  async function mathQuiz(): Promise<void> {
    if (ctx.isBusy()) return;
    ctx.setBusy(true);
    void goTo({ x: 880, y: 262 }, 'left');
    teacher.say(`Los geht’s, ${name}! Zähl ruhig mit den Bildern 🧮`, 2600);
    await playQuiz('Rechen-Rätsel 🧮', mathQuestions(Math.random));
    ctx.setBusy(false);
  }

  async function wordGame(index: number): Promise<void> {
    if (ctx.isBusy()) return;
    ctx.setBusy(true);
    const desk = SCHOOL_DESKS[index];
    const chairY = desk.y - CHAIR_BEHIND;
    player.sitAt(desk.x, chairY - 8, chairY + 0.5);
    audio.play('interact');
    void goTo({ x: desk.x + 80, y: desk.y - 6 }, 'left');
    teacher.say('Schau dir das Bild an und lies genau! 📖', 2600);
    await playQuiz('Wörter-Spiel 📖', wordQuestions(Math.random));
    player.standUp(desk.x, desk.y + 30, 'down');
    interactions.suppressUntilLeft(`desk-${index}`);
    ctx.setBusy(false);
    void goTo(BOARD_SPOT, 'down');
  }

  async function paint(): Promise<void> {
    if (ctx.isBusy()) return;
    ctx.setBusy(true);
    void goTo({ x: 270, y: 560 }, 'left');
    teacher.say('Male, was du magst! 🎨', 2400);
    const data = await drawingPad(ui.activity);
    if (data) {
      if (!saveDrawing(data)) ui.toast.show('Dein Bild hängt jetzt an der Wand – speichern ging leider nicht. 💕', 4000);
      showPicture(data, true);
      tasks.report('painting');
      audio.play('sparkle');
      teacher.say('Das ist wunderschön! Ich hänge es an die Wand 🖼️', 3200);
      void goTo({ x: 1110, y: 250 }, 'up');
    }
    ctx.setBusy(false);
  }

  async function music(): Promise<void> {
    if (ctx.isBusy()) return;
    ctx.setBusy(true);
    void goTo({ x: 1140, y: 560 }, 'right');
    teacher.say('Ich spiele dir ein Lied vor – dann bist du dran! 🎵', 2800);
    const songDone = await xylophone(ui.activity, (freq) => audio.tone(freq));
    if (songDone) {
      tasks.report('music');
      teacher.say('Bravo! Das klang wunderschön! 👏', 3000);
      iconShower(scene, 1260, 500, ['🎵', '🎶', '💖'], calm, 6, 60);
    }
    ctx.setBusy(false);
  }

  /** Zeigt das gemalte Bild im Rahmen an der Wand. */
  function showPicture(data: string, celebrate: boolean): void {
    const image = new Image();
    image.onload = () => {
      if (!scene.sys.isActive() && !scene.sys.isPaused()) return;
      picture?.destroy();
      picture = null;
      if (scene.textures.exists(DRAWING_TEXTURE)) scene.textures.remove(DRAWING_TEXTURE);
      scene.textures.addImage(DRAWING_TEXTURE, image);
      picture = scene.add.image(PICTURE.x, PICTURE.y, DRAWING_TEXTURE).setDisplaySize(PICTURE.w, PICTURE.h).setDepth(DEPTH.wallDecor + 0.1);
      if (celebrate) sparkleBurst(scene, PICTURE.x, PICTURE.y, calm);
    };
    image.src = data;
  }

  return {
    update: () => followChat(),
    destroy: () => {
      stopWander();
      teacher.destroy();
      picture = null;
    },
  };
}
