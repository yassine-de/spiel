/**
 * Inhalte der Spiele und Aktionen in Friseursalon, Café und Schule.
 * Jede Funktion öffnet das ActivityPanel und liefert das Ergebnis (oder null, wenn abgebrochen).
 */
import {
  CAFE_MENU,
  CAKE_BASES,
  CAKE_FROSTINGS,
  CAKE_TOPPINGS,
  type CakeDesign,
  DEFAULT_CAKE,
  MAX_TOPPINGS,
  toggleTopping,
} from '../activities/cafe';
import { type Question, SONG, XYLOPHONE, nextSongStep } from '../activities/school';
import { drawAvatarThumbnail } from '../assets/placeholders/avatar/avatarPainter';
import { ellipsePath, heartPath, roundRectPath, shade, starPath } from '../assets/placeholders/canvasUtils';
import { HAIR_COLORS, HAIR_STYLES, type Ownership, SLOT_CATEGORIES, applyChoice, getItem, isAvailable, itemsInCategories } from '../avatar/avatarCatalog';
import type { AvatarConfig } from '../avatar/avatarTypes';
import { audio, playClick } from '../services';
import { seededRandom } from '../utils/math';
import type { ActivityPanel } from './ActivityPanel';
import { button, formatCoins, h } from './dom';
import { COIN_SVG } from './icons';

function chip(label: string, selected: boolean, onPress: () => void, extra?: Node): HTMLButtonElement {
  const el = h('button', { class: `act-chip${selected ? ' is-selected' : ''}`, attrs: { type: 'button', 'aria-pressed': String(selected) } }, extra ?? null, h('span', { text: label }));
  el.addEventListener('click', () => {
    playClick();
    onPress();
  });
  return el;
}

function section(title: string, ...children: Node[]): HTMLElement {
  return h('section', { class: 'act-section' }, h('h3', { class: 'act-section-title', text: title }), ...children);
}

function coinPrice(value: number): HTMLElement {
  return h('span', { class: 'price' }, h('span', { class: 'price-coin', html: COIN_SVG }), h('span', { text: formatCoins(value) }));
}

/* ------------------------------------------------------------------ */
/* Friseursalon                                                        */
/* ------------------------------------------------------------------ */

export type SalonService = 'cut' | 'color' | 'style' | 'wash';

export interface SalonResult {
  avatar: AvatarConfig;
  service: SalonService;
  glitter: boolean;
}

export function salonMenu(panel: ActivityPanel, current: AvatarConfig, owns: Ownership, name: string): Promise<SalonResult | null> {
  return panel.ask<SalonResult>(
    `Was darf es sein, ${name}?`,
    (done) => {
      let look: AvatarConfig = { ...current };
      let glitter = false;
      const preview = h('canvas', { class: 'salon-preview', attrs: { width: '240', height: '240', role: 'img', 'aria-label': 'Vorschau der neuen Frisur' } });
      const styles = h('div', { class: 'act-options' });
      const colors = h('div', { class: 'act-options' });
      const extras = h('div', { class: 'act-options' });
      const accessories = [null, ...itemsInCategories(SLOT_CATEGORIES.hairAccessory).filter((item) => isAvailable(item.id, owns))];

      const render = () => {
        drawAvatarThumbnail(preview, look, 'head');
        styles.replaceChildren(
          ...HAIR_STYLES.map((style) => {
            const thumb = h('canvas', { class: 'act-thumb', attrs: { width: '96', height: '96', 'aria-hidden': 'true' } });
            drawAvatarThumbnail(thumb, applyChoice(look, 'hairStyle', style.id), 'head');
            return chip(style.name, look.hairStyle === style.id, () => {
              look = applyChoice(look, 'hairStyle', style.id);
              render();
            }, thumb);
          }),
        );
        colors.replaceChildren(
          ...HAIR_COLORS.map((color) => {
            const swatch = h('span', {
              class: 'act-swatch',
              attrs: { style: `--swatch: ${color.color2 ? `linear-gradient(90deg, ${color.color} 50%, ${color.color2} 50%)` : color.color}` },
            });
            return chip(color.name, look.hairColor === color.id, () => {
              look = applyChoice(look, 'hairColor', color.id);
              render();
            }, swatch);
          }),
        );
        extras.replaceChildren(
          ...accessories.map((item) =>
            chip(item ? item.name : 'Ohne Haarschmuck', look.hairAccessory === (item?.id ?? null), () => {
              look = applyChoice(look, 'hairAccessory', item?.id ?? null);
              render();
            }),
          ),
          chip('Glitzer-Spray ✨', glitter, () => {
            glitter = !glitter;
            render();
          }),
        );
      };
      render();

      const confirm = () => {
        const service: SalonService =
          look.hairStyle !== current.hairStyle ? 'cut' : look.hairColor !== current.hairColor ? 'color' : look.hairAccessory !== current.hairAccessory ? 'style' : 'wash';
        playClick();
        done({ avatar: look, service, glitter });
      };
      return h(
        'div',
        { class: 'salon-layout' },
        h('div', { class: 'salon-left' }, preview, h('p', { class: 'act-hint', text: 'Lina zeigt dir hier, wie es aussehen wird. Nichts gewählt? Dann gibt es Waschen & Föhnen! 💨' })),
        h(
          'div',
          { class: 'salon-right' },
          section('Frisur ✂️', styles),
          section('Haarfarbe 🎨', colors),
          section('Extras 🎀', extras),
          h(
            'div',
            { class: 'act-actions' },
            button({ label: 'Doch nicht', variant: 'ghost', onPress: () => done(null) }, playClick),
            button({ label: 'Los geht’s! ✂️', onPress: confirm }),
          ),
        ),
      );
    },
    'salon-card',
  );
}

/* ------------------------------------------------------------------ */
/* Café                                                                */
/* ------------------------------------------------------------------ */

export function cafeMenu(panel: ActivityPanel, coins: number): Promise<string | null> {
  return panel.ask<string>(
    'Speisekarte ☕',
    (done) =>
      h(
        'div',
        { class: 'cafe-menu' },
        h('p', { class: 'act-hint' }, 'Was möchtest du? Du hast ', coinPrice(coins), ' Münzen.'),
        h(
          'div',
          { class: 'menu-grid' },
          ...CAFE_MENU.map((item) => {
            const affordable = item.price <= coins;
            const el = h(
              'button',
              { class: `menu-item${affordable ? '' : ' is-disabled'}`, attrs: { type: 'button', ...(affordable ? {} : { 'aria-disabled': 'true' }) } },
              h('span', { class: 'menu-emoji', text: item.emoji, attrs: { 'aria-hidden': 'true' } }),
              h('span', { class: 'menu-name', text: item.name }),
              coinPrice(item.price),
              affordable ? null : h('span', { class: 'menu-note', text: 'Zu wenig Münzen' }),
            );
            el.addEventListener('click', () => {
              if (!affordable) {
                audio.play('oops');
                return;
              }
              playClick();
              done(item.id);
            });
            return el;
          }),
        ),
      ),
    'cafe-card',
  );
}

/** Zeichnet einen verzierten Kuchen auf einem Teller. */
export function drawCake(canvas: HTMLCanvasElement, design: CakeDesign): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const hgt = canvas.height;
  ctx.clearRect(0, 0, w, hgt);
  ctx.save();
  ctx.scale(w / 260, hgt / 200);
  const base = CAKE_BASES.find((b) => b.id === design.base) ?? CAKE_BASES[0];
  const frosting = CAKE_FROSTINGS.find((f) => f.id === design.frosting) ?? CAKE_FROSTINGS[0];
  const cx = 130;
  // Teller
  ellipsePath(ctx, cx, 170, 112, 20);
  ctx.fillStyle = '#e8ecf2';
  ctx.fill();
  ellipsePath(ctx, cx, 166, 104, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  // Kuchen (zwei Böden mit Füllung)
  const body = ctx.createLinearGradient(40, 0, 220, 0);
  body.addColorStop(0, shade(base.color, 0.12));
  body.addColorStop(1, shade(base.color, -0.14));
  ellipsePath(ctx, cx, 164, 86, 10);
  ctx.fillStyle = shade(base.color, -0.2);
  ctx.fill();
  roundRectPath(ctx, 44, 84, 172, 80, 14);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.fillStyle = shade(frosting.color, -0.05);
  ctx.fillRect(44, 122, 172, 8);
  // Glasur mit Tropfen
  ctx.beginPath();
  ctx.moveTo(44, 96);
  ctx.quadraticCurveTo(44, 70, cx, 70);
  ctx.quadraticCurveTo(216, 70, 216, 96);
  for (let i = 0; i <= 8; i++) {
    const x = 216 - i * 21.5;
    const drop = i % 2 === 0 ? 18 : 8;
    ctx.quadraticCurveTo(x + 6, 96 + drop, x - 10.75, 98);
  }
  ctx.closePath();
  ctx.fillStyle = frosting.color;
  ctx.fill();
  ctx.strokeStyle = shade(frosting.color, -0.18);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ellipsePath(ctx, cx - 30, 78, 40, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();
  // Deko
  const rand = seededRandom(7);
  for (const topping of design.toppings) {
    switch (topping) {
      case 'sprinkles':
        for (let i = 0; i < 40; i++) {
          ctx.save();
          ctx.translate(60 + rand() * 140, 74 + rand() * 20);
          ctx.rotate(rand() * Math.PI);
          ctx.fillStyle = ['#ff6f8f', '#ffd36e', '#6fc3d6', '#8fdc8f', '#a98bf5', '#ffffff'][i % 6];
          ctx.fillRect(-3, -1, 6, 2.4);
          ctx.restore();
        }
        break;
      case 'strawberries':
        for (const x of [70, 110, 150, 190]) {
          ctx.beginPath();
          ctx.moveTo(x - 9, 72);
          ctx.quadraticCurveTo(x, 58, x + 9, 72);
          ctx.quadraticCurveTo(x, 92, x - 9, 72);
          ctx.fillStyle = '#ff4f6f';
          ctx.fill();
          ctx.fillStyle = '#4e9a3e';
          ctx.fillRect(x - 5, 61, 10, 3);
          ctx.fillStyle = '#ffe9a8';
          for (const [dx, dy] of [[-3, 70], [3, 72], [0, 77]]) ctx.fillRect(x + dx, dy, 1.5, 1.5);
        }
        break;
      case 'candles':
        for (const x of [96, 130, 164]) {
          roundRectPath(ctx, x - 4, 40, 8, 34, 2);
          ctx.fillStyle = ['#8fc4ff', '#ff9cc8', '#ffd36e'][(x / 34) % 3 | 0];
          ctx.fill();
          ellipsePath(ctx, x, 34, 5, 8);
          ctx.fillStyle = '#ffb347';
          ctx.fill();
          ellipsePath(ctx, x, 36, 2.5, 4);
          ctx.fillStyle = '#fff3a8';
          ctx.fill();
        }
        break;
      case 'hearts':
        for (const [x, y] of [[66, 140], [100, 146], [160, 146], [194, 140], [130, 148]]) {
          heartPath(ctx, x, y, 16);
          ctx.fillStyle = '#ff5fa2';
          ctx.fill();
        }
        break;
      case 'stars':
        for (const [x, y] of [[74, 84], [118, 80], [146, 86], [186, 82]]) {
          starPath(ctx, x, y, 7);
          ctx.fillStyle = '#ffd36e';
          ctx.fill();
          ctx.strokeStyle = '#e0a12e';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        break;
    }
  }
  ctx.restore();
}

export function cakeDesigner(panel: ActivityPanel): Promise<CakeDesign | null> {
  return panel.ask<CakeDesign>(
    'Kuchen verzieren 🎂',
    (done) => {
      let design: CakeDesign = { ...DEFAULT_CAKE, toppings: [...DEFAULT_CAKE.toppings] };
      const preview = h('canvas', { class: 'cake-preview', attrs: { width: '520', height: '400', role: 'img', 'aria-label': 'Dein Kuchen' } });
      const bases = h('div', { class: 'act-options' });
      const frostings = h('div', { class: 'act-options' });
      const toppings = h('div', { class: 'act-options' });
      const render = () => {
        drawCake(preview, design);
        bases.replaceChildren(
          ...CAKE_BASES.map((b) =>
            chip(b.name, design.base === b.id, () => {
              design = { ...design, base: b.id };
              render();
            }, h('span', { class: 'act-swatch', attrs: { style: `--swatch: ${b.color}` } })),
          ),
        );
        frostings.replaceChildren(
          ...CAKE_FROSTINGS.map((f) =>
            chip(f.name, design.frosting === f.id, () => {
              design = { ...design, frosting: f.id };
              render();
            }, h('span', { class: 'act-swatch', attrs: { style: `--swatch: ${f.color}` } })),
          ),
        );
        toppings.replaceChildren(
          ...CAKE_TOPPINGS.map((t) =>
            chip(`${t.emoji} ${t.name}`, design.toppings.includes(t.id), () => {
              design = toggleTopping(design, t.id);
              render();
            }),
          ),
        );
      };
      render();
      return h(
        'div',
        { class: 'cake-layout' },
        h('div', { class: 'cake-left' }, preview),
        h(
          'div',
          { class: 'cake-right' },
          section('Teig', bases),
          section('Glasur', frostings),
          section(`Deko (bis zu ${MAX_TOPPINGS})`, toppings),
          h('div', { class: 'act-actions' }, button({ label: 'Fertig! 🎂', onPress: () => done(design) }, playClick)),
        ),
      );
    },
    'cake-card',
  );
}

/* ------------------------------------------------------------------ */
/* Schule: Rätsel                                                      */
/* ------------------------------------------------------------------ */

export interface QuizResult {
  firstTry: number;
  total: number;
}

function countingRow(visual: NonNullable<Question['visual']>): HTMLElement {
  const icons = (n: number, gone = 0) =>
    Array.from({ length: n }, (_, i) => h('span', { class: `count-icon${i >= n - gone ? ' is-gone' : ''}`, text: visual.icon }));
  if (visual.plus) {
    return h('div', { class: 'count-row', attrs: { 'aria-hidden': 'true' } }, h('span', { class: 'count-group' }, ...icons(visual.a)), h('b', { text: '+' }), h('span', { class: 'count-group' }, ...icons(visual.b)));
  }
  return h('div', { class: 'count-row', attrs: { 'aria-hidden': 'true' } }, h('span', { class: 'count-group' }, ...icons(visual.a, visual.b)));
}

export function quiz(panel: ActivityPanel, title: string, questions: Question[]): Promise<QuizResult | null> {
  return panel.ask<QuizResult>(
    title,
    (done, onEnd) => {
      const root = h('div', { class: 'quiz' });
      let index = 0;
      let firstTry = 0;
      let missed = false;
      let timer = 0;
      onEnd(() => window.clearTimeout(timer));

      const showQuestion = () => {
        const q = questions[index];
        missed = false;
        const feedback = h('p', { class: 'quiz-feedback', attrs: { 'aria-live': 'polite' } });
        const answers = h(
          'div',
          { class: 'quiz-answers' },
          ...q.answers.map((answer, i) => {
            const el = h('button', { class: 'quiz-answer', text: answer, attrs: { type: 'button' } });
            el.addEventListener('click', () => {
              if (el.disabled) return;
              if (i === q.correct) {
                audio.play('correct');
                el.classList.add('is-right');
                if (!missed) firstTry++;
                feedback.textContent = ['Super! 🌟', 'Richtig! 🎉', 'Toll gemacht! 💖', 'Klasse! ⭐'][index % 4];
                answers.querySelectorAll('button').forEach((b) => (b.disabled = true));
                timer = window.setTimeout(() => {
                  index++;
                  if (index < questions.length) showQuestion();
                  else showEnd();
                }, 900);
              } else {
                audio.play('oops');
                missed = true;
                el.disabled = true;
                el.classList.add('is-wrong');
                feedback.textContent = 'Fast! Versuch es nochmal 💕';
              }
            });
            return el;
          }),
        );
        const parts: (HTMLElement | null)[] = [
          h('div', { class: 'quiz-progress', text: `Aufgabe ${index + 1} von ${questions.length}` }),
          h('div', { class: 'quiz-dots' }, ...questions.map((_, i) => h('span', { class: `quiz-dot${i < index ? ' is-done' : i === index ? ' is-current' : ''}` }))),
          q.picture ? h('div', { class: 'quiz-picture', text: q.picture, attrs: { 'aria-hidden': 'true' } }) : null,
          q.visual ? countingRow(q.visual) : null,
          h('p', { class: 'quiz-prompt', text: q.prompt }),
          answers,
          feedback,
        ];
        root.replaceChildren(...parts.filter((part): part is HTMLElement => part !== null));
      };

      const showEnd = () => {
        audio.play('cheer');
        const stars = '⭐'.repeat(Math.max(1, firstTry));
        root.replaceChildren(
          h('div', { class: 'quiz-picture', text: '🏆', attrs: { 'aria-hidden': 'true' } }),
          h('p', { class: 'quiz-prompt', text: 'Geschafft!' }),
          h('p', { class: 'quiz-stars', text: stars, attrs: { 'aria-label': `${firstTry} Sterne` } }),
          h('p', { class: 'act-hint', text: `${firstTry} von ${questions.length} Aufgaben beim ersten Versuch richtig.` }),
          h('div', { class: 'act-actions' }, button({ label: 'Fertig ✨', onPress: () => done({ firstTry, total: questions.length }) }, playClick)),
        );
      };

      showQuestion();
      return root;
    },
    'quiz-card',
  );
}

/* ------------------------------------------------------------------ */
/* Schule: Malen                                                       */
/* ------------------------------------------------------------------ */

const PAINT_COLORS = ['#2b1b22', '#ff4f6f', '#ff9cc8', '#ffa86f', '#ffd36e', '#5fbf6a', '#6fc3d6', '#3f7fd6', '#a98bf5', '#8a5a3c'];
/** Größe des gespeicherten Bildes (klein, damit es in den Browser-Speicher passt). */
export const DRAWING_SIZE = { w: 300, h: 200 } as const;

export function drawingPad(panel: ActivityPanel): Promise<string | null> {
  return panel.ask<string>(
    'Malecke 🎨',
    (done) => {
      const canvas = h('canvas', { class: 'paint-canvas', attrs: { width: '600', height: '400', role: 'img', 'aria-label': 'Malfläche' } });
      const ctx = canvas.getContext('2d')!;
      const clear = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };
      clear();
      let color = PAINT_COLORS[1];
      let size = 10;
      let last: { x: number; y: number } | null = null;
      let painted = false;
      const point = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height };
      };
      const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        painted = true;
      };
      canvas.addEventListener('pointerdown', (event) => {
        canvas.setPointerCapture(event.pointerId);
        last = point(event);
        stroke(last, { x: last.x + 0.1, y: last.y });
      });
      canvas.addEventListener('pointermove', (event) => {
        if (!last) return;
        const next = point(event);
        stroke(last, next);
        last = next;
      });
      const end = () => (last = null);
      canvas.addEventListener('pointerup', end);
      canvas.addEventListener('pointercancel', end);

      const palette = h('div', { class: 'paint-palette' });
      const renderPalette = () => {
        palette.replaceChildren(
          ...PAINT_COLORS.map((c) => {
            const el = h('button', { class: `paint-color${c === color ? ' is-selected' : ''}`, attrs: { type: 'button', style: `--swatch: ${c}`, 'aria-label': 'Farbe' } });
            el.addEventListener('click', () => {
              color = c;
              playClick();
              renderPalette();
            });
            return el;
          }),
          chip('Radiergummi', color === '#ffffff', () => {
            color = '#ffffff';
            renderPalette();
          }),
          chip(`Pinsel: ${size > 10 ? 'dick' : 'dünn'}`, false, () => {
            size = size > 10 ? 6 : 18;
            renderPalette();
          }),
        );
      };
      renderPalette();

      const hang = () => {
        if (!painted) {
          audio.play('oops');
          return;
        }
        const small = document.createElement('canvas');
        small.width = DRAWING_SIZE.w;
        small.height = DRAWING_SIZE.h;
        small.getContext('2d')?.drawImage(canvas, 0, 0, small.width, small.height);
        playClick();
        done(small.toDataURL('image/png'));
      };

      return h(
        'div',
        { class: 'paint-layout' },
        canvas,
        palette,
        h(
          'div',
          { class: 'act-actions' },
          button({ label: 'Alles löschen', variant: 'ghost', onPress: () => { clear(); painted = false; } }, playClick),
          button({ label: 'An die Wand hängen 🖼️', onPress: hang }),
        ),
      );
    },
    'paint-card',
  );
}

/* ------------------------------------------------------------------ */
/* Schule: Xylophon                                                    */
/* ------------------------------------------------------------------ */

/** Gibt true zurück, wenn Samya das Lied einmal komplett nachgespielt hat. */
export function xylophone(panel: ActivityPanel, playTone: (freq: number) => void): Promise<boolean | null> {
  return panel.ask<boolean>(
    'Musikecke 🎵',
    (done, onEnd) => {
      let songDone = false;
      /** null = frei spielen, sonst Position im Lied */
      let follow: number | null = null;
      const timers: number[] = [];
      const stopDemo = () => {
        while (timers.length) window.clearTimeout(timers.pop());
      };
      onEnd(stopDemo);
      const info = h('p', { class: 'act-hint', text: 'Tippe auf die Stäbe und spiel, was du möchtest!', attrs: { 'aria-live': 'polite' } });

      const hit = (i: number) => {
        playTone(XYLOPHONE[i].freq);
        const el = bars.children[i] as HTMLElement;
        el.classList.remove('is-hit');
        void el.offsetWidth;
        el.classList.add('is-hit');
      };
      const markNext = () => {
        [...bars.children].forEach((el, i) => el.classList.toggle('is-next', follow !== null && SONG.notes[follow]?.[0] === i));
      };

      const bars = h(
        'div',
        { class: 'xylo-bars' },
        ...XYLOPHONE.map((bar, i) => {
          const el = h('button', { class: 'xylo-bar', text: bar.note, attrs: { type: 'button', style: `--bar: ${bar.color}; --len: ${100 - i * 6}%`, 'aria-label': `Ton ${bar.note}` } });
          el.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            hit(i);
            if (follow === null) return;
            const next = nextSongStep(follow, i);
            if (next === follow) {
              info.textContent = 'Hoppla! Schau, welcher Stab leuchtet 💡';
              return;
            }
            follow = next;
            if (follow >= SONG.notes.length) {
              follow = null;
              songDone = true;
              audio.play('cheer');
              info.textContent = `Bravo! Du hast „${SONG.title}“ gespielt! 🎉`;
            } else {
              info.textContent = `Weiter so! Noch ${SONG.notes.length - follow} Töne 🎶`;
            }
            markNext();
          });
          return el;
        }),
      );

      const demo = () => {
        stopDemo();
        follow = null;
        markNext();
        info.textContent = `Hör gut zu: „${SONG.title}“`;
        let t = 0;
        for (const [bar, beats] of SONG.notes) {
          timers.push(window.setTimeout(() => hit(bar), t));
          t += beats * 330;
        }
        timers.push(window.setTimeout(() => (info.textContent = 'Jetzt du! Tippe auf „Nachspielen“ 🎯'), t));
      };
      const practice = () => {
        stopDemo();
        follow = 0;
        info.textContent = 'Spiel den leuchtenden Stab!';
        markNext();
      };

      return h(
        'div',
        { class: 'xylo-layout' },
        bars,
        info,
        h(
          'div',
          { class: 'act-actions' },
          button({ label: 'Lied vorspielen ▶', variant: 'ghost', onPress: demo }, playClick),
          button({ label: 'Nachspielen 🎯', variant: 'ghost', onPress: practice }, playClick),
          button({ label: 'Fertig', onPress: () => done(songDone) }, playClick),
        ),
      );
    },
    'xylo-card',
  );
}

/** Name eines Haarschmucks (für die Meldung im Salon). */
export function accessoryName(id: string | null): string | null {
  return id ? (getItem(id)?.name ?? null) : null;
}
