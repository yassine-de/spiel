/** Lernspiele in der Schule: Rechen-Rätsel, Wörter-Spiel, Xylophon. */

export interface Question {
  prompt: string;
  /** Großes Bild über der Frage (Emoji), optional */
  picture?: string;
  answers: string[];
  correct: number;
  /** Zum Abzählen: a Bildchen plus/minus b Bildchen */
  visual?: { a: number; b: number; plus: boolean; icon: string };
}

type Rand = () => number;

const int = (rand: Rand, min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

function shuffle<T>(list: T[], rand: Rand): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Drei Antworten: die richtige und zwei nahe, verschiedene, nicht negative Nachbarn. */
function numberAnswers(result: number, rand: Rand): { answers: string[]; correct: number } {
  const options = new Set<number>([result]);
  const offsets = shuffle([-2, -1, 1, 2, 3], rand);
  for (const offset of offsets) {
    if (options.size >= 3) break;
    const value = result + offset;
    if (value >= 0) options.add(value);
  }
  const answers = shuffle([...options], rand);
  return { answers: answers.map(String), correct: answers.indexOf(result) };
}

/** Rechenaufgaben für die Grundschule: Plus und Minus bis 20, nie negativ. */
export function mathQuestions(rand: Rand, count = 5): Question[] {
  const fruits = ['🍎', '🍓', '⭐', '🌸', '🎈'];
  return Array.from({ length: count }, () => {
    const plus = rand() < 0.6;
    let a = int(rand, 1, 10);
    let b = int(rand, 1, 10);
    if (!plus && b > a) [a, b] = [b, a];
    const result = plus ? a + b : a - b;
    const icon = fruits[int(rand, 0, fruits.length - 1)];
    return { prompt: `${a} ${plus ? '+' : '−'} ${b} = ?`, visual: { a, b, plus, icon }, ...numberAnswers(result, rand) };
  });
}

/** Bild → richtiges Wort (zum Lesenlernen). */
export const WORD_PUZZLES: { picture: string; word: string; others: [string, string] }[] = [
  { picture: '🍎', word: 'Apfel', others: ['Ampel', 'Affe'] },
  { picture: '🐱', word: 'Katze', others: ['Kette', 'Tasse'] },
  { picture: '🌞', word: 'Sonne', others: ['Sahne', 'Tonne'] },
  { picture: '🐶', word: 'Hund', others: ['Mund', 'Hand'] },
  { picture: '🏠', word: 'Haus', others: ['Maus', 'Hase'] },
  { picture: '🌳', word: 'Baum', others: ['Raum', 'Bein'] },
  { picture: '🐟', word: 'Fisch', others: ['Tisch', 'Fuchs'] },
  { picture: '🚗', word: 'Auto', others: ['Oma', 'Ente'] },
  { picture: '🌙', word: 'Mond', others: ['Mund', 'Monat'] },
  { picture: '🎈', word: 'Ballon', others: ['Banane', 'Biene'] },
  { picture: '🦆', word: 'Ente', others: ['Ende', 'Erde'] },
  { picture: '🐭', word: 'Maus', others: ['Haus', 'Mais'] },
];

export function wordQuestions(rand: Rand, count = 5): Question[] {
  return shuffle(WORD_PUZZLES, rand)
    .slice(0, count)
    .map((p) => {
      const answers = shuffle([p.word, ...p.others], rand);
      return { prompt: 'Welches Wort passt zum Bild?', picture: p.picture, answers, correct: answers.indexOf(p.word) };
    });
}

/** Münzen für ein Rätsel: 2 pro Aufgabe, die beim ersten Versuch richtig war. */
export function quizReward(firstTry: number): number {
  return Math.max(0, Math.floor(firstTry)) * 2;
}

/* ---------------- Xylophon ---------------- */

export interface Bar {
  note: string;
  freq: number;
  color: string;
}

/** C-Dur-Tonleiter (c'' bis c'''), Farben wie auf echten Kinder-Xylophonen. */
export const XYLOPHONE: Bar[] = [
  { note: 'C', freq: 523.25, color: '#ff6f6f' },
  { note: 'D', freq: 587.33, color: '#ffa86f' },
  { note: 'E', freq: 659.25, color: '#ffd36e' },
  { note: 'F', freq: 698.46, color: '#8fdc8f' },
  { note: 'G', freq: 783.99, color: '#6fc3d6' },
  { note: 'A', freq: 880.0, color: '#6f9de8' },
  { note: 'H', freq: 987.77, color: '#a98bf5' },
  { note: 'C', freq: 1046.5, color: '#ff8fc2' },
];

/** „Alle meine Entchen“ (Volkslied) als Stab-Nummern; jeder Ton mit Länge in Vierteln. */
export const SONG: { title: string; notes: [number, number][] } = {
  title: 'Alle meine Entchen 🦆',
  notes: [
    [0, 1], [1, 1], [2, 1], [3, 1], [4, 2], [4, 2],
    [5, 1], [5, 1], [5, 1], [5, 1], [4, 4],
    [5, 1], [5, 1], [5, 1], [5, 1], [4, 4],
    [3, 1], [3, 1], [3, 1], [3, 1], [2, 2], [2, 2],
    [1, 1], [1, 1], [1, 1], [1, 1], [0, 4],
  ],
};

/** Prüft beim Nachspielen den nächsten Ton; gibt den neuen Fortschritt zurück (0 bei Fehler = neu anfangen). */
export function nextSongStep(progress: number, bar: number): number {
  const expected = SONG.notes[progress]?.[0];
  if (expected === undefined) return progress;
  if (bar === expected) return progress + 1;
  // Ein falscher Ton: noch einmal ab diesem Ton versuchen (kein Neustart – das wäre frustrierend)
  return progress;
}

/* ---------------- Bücherregal ---------------- */

export const FUN_FACTS: string[] = [
  'Wusstest du? Ein Schmetterling schmeckt mit seinen Füßen! 🦋',
  'Wusstest du? Kraken haben drei Herzen! 🐙',
  'Wusstest du? Ein Regenbogen hat sieben Farben! 🌈',
  'Wusstest du? Bienen tanzen, um ihren Freundinnen den Weg zu Blumen zu zeigen! 🐝',
  'Wusstest du? Giraffen schlafen nur ganz kurz – oft nur ein paar Minuten! 🦒',
  'Wusstest du? Die Sonne ist so groß, dass die Erde über eine Million Mal hineinpassen würde! ☀️',
  'Wusstest du? Elefanten können mit ihren Füßen „hören“! 🐘',
  'Wusstest du? Pinguine schenken sich manchmal schöne Steine! 🐧',
];
