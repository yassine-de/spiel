import { seededRandom } from '../utils/math';

/** Ereignisse im Spiel, die eine Aufgabe erfüllen können. */
export type TaskEvent =
  | 'visit-park'
  | 'visit-rewe'
  | 'visit-home'
  | 'visit-toystore'
  | 'visit-boutique'
  | 'discover'
  | 'fountain'
  | 'try-on'
  | 'visit-salon'
  | 'visit-cafe'
  | 'visit-school'
  | 'haircut'
  | 'cake'
  | 'cafe-treat'
  | 'school-quiz'
  | 'painting'
  | 'music';

export interface TaskDef {
  id: string;
  title: string;
  reward: number;
  event: TaskEvent;
  /** Nur anbieten, wenn es noch unentdeckte Orte gibt */
  needsUndiscovered?: boolean;
}

/**
 * Kleine Tagesaufgaben – bewusst ohne Kaufaufträge (kein Kaufdruck).
 * „Sprich mit drei Figuren“ kommt mit den Figuren in Phase 6 dazu.
 */
export const TASK_POOL: TaskDef[] = [
  { id: 'park', title: 'Besuche den Stadtpark', reward: 20, event: 'visit-park' },
  { id: 'rewe', title: 'Besuche den Supermarkt', reward: 20, event: 'visit-rewe' },
  { id: 'discover', title: 'Entdecke einen neuen Ort', reward: 40, event: 'discover', needsUndiscovered: true },
  { id: 'fountain', title: 'Bestaune den Brunnen', reward: 15, event: 'fountain' },
  { id: 'home', title: 'Besuche dein Haus', reward: 15, event: 'visit-home' },
  { id: 'toystore', title: 'Schau im Spielzeugladen vorbei', reward: 15, event: 'visit-toystore' },
  { id: 'tryon', title: 'Probiere in der Boutique etwas an', reward: 20, event: 'try-on' },
  { id: 'haircut', title: 'Lass dir im Friseursalon die Haare machen', reward: 25, event: 'haircut' },
  { id: 'cake', title: 'Verziere im Café einen Kuchen', reward: 20, event: 'cake' },
  { id: 'quiz', title: 'Löse an der Tafel ein Rätsel', reward: 25, event: 'school-quiz' },
  { id: 'painting', title: 'Male in der Schule ein Bild', reward: 20, event: 'painting' },
  { id: 'music', title: 'Spiel ein Lied auf dem Xylophon', reward: 15, event: 'music' },
];

export const TASKS_PER_DAY = 3;

export function getTask(id: string): TaskDef | null {
  return TASK_POOL.find((t) => t.id === id) ?? null;
}

/** Lokales Datum als „JJJJ-MM-TT“ (der Tag wechselt um Mitternacht auf dem Gerät). */
export function localDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Wählt die Aufgaben des Tages – für dasselbe Datum immer dieselben. */
export function pickDailyTasks(dateKey: string, hasUndiscovered: boolean): string[] {
  const pool = TASK_POOL.filter((t) => hasUndiscovered || !t.needsUndiscovered);
  const rand = seededRandom(hash(dateKey));
  const shuffled = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, TASKS_PER_DAY).map((t) => t.id);
}
