import { describe, expect, it } from 'vitest';
import { CAFE_MENU, CAKE_TOPPINGS, type CakeDesign, DEFAULT_CAKE, MAX_TOPPINGS, cakeName, toggleTopping } from '../src/game/activities/cafe';
import { SONG, WORD_PUZZLES, XYLOPHONE, mathQuestions, nextSongStep, quizReward, wordQuestions } from '../src/game/activities/school';
import { sanitizeAvatar } from '../src/game/avatar/avatarCatalog';
import { NPCS } from '../src/game/npc/npcs';
import { TASK_POOL } from '../src/game/tasks/dailyTasks';
import { seededRandom } from '../src/game/utils/math';

describe('Rechen-Rätsel', () => {
  it('Aufgaben sind lösbar: richtige Antwort dabei, drei verschiedene, nie negativ', () => {
    const rand = seededRandom(42);
    for (let round = 0; round < 40; round++) {
      for (const q of mathQuestions(rand)) {
        const [a, op, b] = q.prompt.split(' ');
        const result = op === '+' ? Number(a) + Number(b) : Number(a) - Number(b);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(20);
        expect(q.answers[q.correct]).toBe(String(result));
        expect(new Set(q.answers).size).toBe(3);
        expect(q.answers.every((x) => Number(x) >= 0)).toBe(true);
        expect(q.visual).toEqual({ a: Number(a), b: Number(b), plus: op === '+', icon: expect.any(String) });
      }
    }
  });

  it('Belohnung: 2 Münzen pro Aufgabe beim ersten Versuch', () => {
    expect(quizReward(5)).toBe(10);
    expect(quizReward(0)).toBe(0);
    expect(quizReward(-1)).toBe(0);
  });
});

describe('Wörter-Spiel', () => {
  it('das richtige Wort ist genau einmal dabei', () => {
    const questions = wordQuestions(seededRandom(7), 5);
    expect(questions).toHaveLength(5);
    for (const q of questions) {
      const puzzle = WORD_PUZZLES.find((p) => p.picture === q.picture)!;
      expect(q.answers[q.correct]).toBe(puzzle.word);
      expect(new Set(q.answers).size).toBe(3);
    }
    expect(new Set(questions.map((q) => q.picture)).size).toBe(5);
  });
});

describe('Xylophon', () => {
  it('acht Stäbe, aufsteigende Töne', () => {
    expect(XYLOPHONE).toHaveLength(8);
    for (let i = 1; i < XYLOPHONE.length; i++) expect(XYLOPHONE[i].freq).toBeGreaterThan(XYLOPHONE[i - 1].freq);
  });

  it('Nachspielen: richtige Töne gehen weiter, falsche nicht – bis zum Ende', () => {
    let progress = 0;
    expect(nextSongStep(progress, 7)).toBe(0);
    for (const [bar] of SONG.notes) progress = nextSongStep(progress, bar);
    expect(progress).toBe(SONG.notes.length);
    expect(SONG.notes.every(([bar]) => bar >= 0 && bar < XYLOPHONE.length)).toBe(true);
  });
});

describe('Café', () => {
  it('Speisekarte: eindeutige Einträge mit kleinen Preisen', () => {
    expect(new Set(CAFE_MENU.map((m) => m.id)).size).toBe(CAFE_MENU.length);
    expect(CAFE_MENU.every((m) => Number.isInteger(m.price) && m.price > 0 && m.price <= 10)).toBe(true);
  });

  it('Kuchen: höchstens drei Dekos, an- und abwählbar', () => {
    let cake: CakeDesign = { ...DEFAULT_CAKE, toppings: [] };
    for (const t of CAKE_TOPPINGS) cake = toggleTopping(cake, t.id);
    expect(cake.toppings).toHaveLength(MAX_TOPPINGS);
    const first = cake.toppings[0];
    cake = toggleTopping(cake, first);
    expect(cake.toppings).not.toContain(first);
    expect(cakeName({ base: 'chocolate', frosting: 'pink', toppings: ['strawberries'] })).toBe('Schoko-Kuchen mit Erdbeeren');
    expect(cakeName({ base: 'vanilla', frosting: 'pink', toppings: [] })).toBe('Vanille-Kuchen');
  });
});

describe('Figuren und Aufgaben', () => {
  it('Lina, Ben und Frau Sonnenschein haben gültiges Aussehen', () => {
    for (const npc of Object.values(NPCS)) expect(sanitizeAvatar(npc.avatar), npc.name).toEqual(npc.avatar);
  });

  it('neue Tagesaufgaben für Salon, Café und Schule – ohne Kaufauftrag', () => {
    for (const id of ['haircut', 'cake', 'quiz', 'painting', 'music']) expect(TASK_POOL.some((t) => t.id === id), id).toBe(true);
    expect(TASK_POOL.every((t) => !/kauf|bestell/i.test(t.title))).toBe(true);
  });
});
