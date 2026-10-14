import { describe, expect, it } from 'vitest';
import {
  BASE_ITEM_IDS,
  BODY_PRESETS,
  DEFAULT_AVATAR,
  EYE_COLORS,
  EYE_SHAPES,
  EXPRESSIONS,
  HAIR_COLORS,
  HAIR_STYLES,
  ITEMS,
  MOUTHS,
  SKIN_TONES,
  applyChoice,
  getItem,
  randomAvatar,
  sanitizeAvatar,
} from '../src/game/avatar/avatarCatalog';
import { seededRandom } from '../src/game/utils/math';

describe('Avatar-Katalog erfüllt das Spielkonzept', () => {
  it('mindestens 6 Hautfarben und 8 Frisuren', () => {
    expect(SKIN_TONES.length).toBeGreaterThanOrEqual(6);
    expect(HAIR_STYLES.length).toBeGreaterThanOrEqual(8);
  });

  it('alle geforderten Haarfarben (plus Samyas Schwarz-Weiß)', () => {
    const names = HAIR_COLORS.map((c) => c.name);
    for (const name of ['Schwarz', 'Braun', 'Blond', 'Rot', 'Rosa', 'Lila']) expect(names).toContain(name);
    expect(HAIR_COLORS.find((c) => c.id === 'hair-blackwhite')?.color2).toBeDefined();
  });

  it('Samyas Look ist Grundausstattung und Standard für neue Spiele', () => {
    expect(DEFAULT_AVATAR.hairColor).toBe('hair-blackwhite');
    expect(DEFAULT_AVATAR.top).toBe('top-hoodie-split');
    expect(DEFAULT_AVATAR.bottom).toBe('bottom-joggers-split');
    expect(DEFAULT_AVATAR.shoes).toBe('shoes-sneakers-chunky');
    for (const id of ['top-hoodie-split', 'bottom-joggers-split', 'shoes-sneakers-chunky']) {
      expect(BASE_ITEM_IDS.has(id), id).toBe(true);
    }
    // Zweigeteilt: Rosa und Schwarz
    expect(getItem('top-hoodie-split')?.color2).toBeDefined();
    expect(getItem('bottom-joggers-split')?.color2).toBeDefined();
  });

  it('Gesicht: Augenform, Augenfarbe, Mund, Ausdruck', () => {
    expect(EYE_SHAPES.length).toBeGreaterThan(1);
    expect(EYE_COLORS.length).toBeGreaterThan(1);
    expect(MOUTHS.length).toBeGreaterThan(1);
    expect(EXPRESSIONS.length).toBeGreaterThan(1);
  });

  it('alle Kleidungs- und Accessoire-Kategorien sind vorhanden', () => {
    const categories = new Set(ITEMS.map((i) => i.category));
    for (const c of ['tshirt', 'pullover', 'dress', 'skirt', 'pants', 'shoes', 'glasses', 'bow', 'headband', 'hat']) {
      expect(categories.has(c as never)).toBe(true);
    }
  });

  it('alle IDs sind eindeutig', () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Standard-Avatar und Voreinstellungen sind gültig', () => {
    expect(sanitizeAvatar(DEFAULT_AVATAR)).toEqual(DEFAULT_AVATAR);
    for (const preset of Object.values(BODY_PRESETS)) {
      expect(getItem(preset.top)).not.toBeNull();
      expect(getItem(preset.bottom)).not.toBeNull();
      expect(getItem(preset.shoes)).not.toBeNull();
    }
  });
});

describe('sanitizeAvatar', () => {
  it('ersetzt ungültige Felder einzeln', () => {
    const avatar = sanitizeAvatar({ ...DEFAULT_AVATAR, skin: 'grün', hairStyle: 'irokese', hairColor: 'hair-pink' });
    expect(avatar.skin).toBe(DEFAULT_AVATAR.skin);
    expect(avatar.hairStyle).toBe(DEFAULT_AVATAR.hairStyle);
    expect(avatar.hairColor).toBe('hair-pink');
  });

  it('lässt keine Kleidung im falschen Platz zu', () => {
    const avatar = sanitizeAvatar({ ...DEFAULT_AVATAR, top: 'shoes-boots-brown', shoes: 'top-tshirt-star', hat: 'bow-pink' });
    expect(avatar.top).toBe(DEFAULT_AVATAR.top);
    expect(avatar.shoes).toBe(DEFAULT_AVATAR.shoes);
    expect(avatar.hat).toBeNull();
  });

  it('übersteht völlig kaputte Daten', () => {
    expect(sanitizeAvatar(null)).toEqual(DEFAULT_AVATAR);
    expect(sanitizeAvatar('abc')).toEqual(DEFAULT_AVATAR);
  });

  it('Hut und Haarschmuck gleichzeitig: Haarschmuck fällt weg', () => {
    const avatar = sanitizeAvatar({ ...DEFAULT_AVATAR, hat: 'hat-sun', hairAccessory: 'bow-pink' });
    expect(avatar.hat).toBe('hat-sun');
    expect(avatar.hairAccessory).toBeNull();
  });
});

describe('applyChoice', () => {
  it('Junge/Mädchen setzt passende Frisur und Kleidung, Farben bleiben', () => {
    const start = { ...DEFAULT_AVATAR, hairColor: 'hair-red', skin: 'skin-5' };
    const boy = applyChoice(start, 'body', 'boy');
    expect(boy.hairStyle).toBe(BODY_PRESETS.boy.hairStyle);
    expect(boy.bottom).toBe(BODY_PRESETS.boy.bottom);
    expect(boy.hairColor).toBe('hair-red');
    expect(boy.skin).toBe('skin-5');
  });

  it('Hut entfernt Haarschmuck und umgekehrt', () => {
    const withHat = applyChoice({ ...DEFAULT_AVATAR, hairAccessory: 'bow-pink' }, 'hat', 'hat-cap');
    expect(withHat.hairAccessory).toBeNull();
    const withBow = applyChoice(withHat, 'hairAccessory', 'bow-mint');
    expect(withBow.hat).toBeNull();
    expect(withBow.hairAccessory).toBe('bow-mint');
  });

  it('Unterteil zum Kleid wechselt zurück zum Shirt', () => {
    const dress = applyChoice({ ...DEFAULT_AVATAR }, 'top', 'dress-blue');
    expect(dress.top).toBe('dress-blue');
    const pants = applyChoice(dress, 'bottom', 'bottom-pants-jeans');
    expect(getItem(pants.top)?.category).not.toBe('dress');
    expect(pants.bottom).toBe('bottom-pants-jeans');
  });
});

describe('randomAvatar', () => {
  it('erzeugt immer gültige Avatare', () => {
    const rand = seededRandom(99);
    for (let i = 0; i < 200; i++) {
      const avatar = randomAvatar(rand);
      expect(sanitizeAvatar(avatar)).toEqual(avatar);
    }
  });
});
