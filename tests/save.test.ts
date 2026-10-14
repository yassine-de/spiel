import { describe, expect, it } from 'vitest';
import { DEFAULT_AVATAR } from '../src/game/avatar/avatarCatalog';
import type { KeyValueStore } from '../src/storage/safeStorage';
import { SAVE_BACKUP_KEY, SAVE_KEY, SAVE_VERSION, SaveManager, START_COINS, migrate } from '../src/storage/saveManager';

function memoryStore(initial: Record<string, string> = {}, failWrites = false) {
  const data: Record<string, string> = { ...initial };
  const store: KeyValueStore = {
    get: (k) => data[k] ?? null,
    set: (k, v) => {
      if (failWrites) return false;
      data[k] = v;
      return true;
    },
    remove: (k) => {
      delete data[k];
    },
  };
  return { data, store };
}

const fixedNow = () => '2026-10-14T12:00:00.000Z';

describe('SaveManager', () => {
  it('ohne Spielstand: leer, mit Standardwerten', () => {
    const { store } = memoryStore();
    const saves = new SaveManager(store, fixedNow);
    expect(saves.load()).toBe('empty');
    expect(saves.hasSave).toBe(false);
    expect(saves.playerName).toBe('Samya');
    expect(saves.coins).toBe(START_COINS);
  });

  it('speichert den Avatar und lädt ihn nach einem Neustart wieder', () => {
    const { store, data } = memoryStore();
    const avatar = { ...DEFAULT_AVATAR, hairStyle: 'curly' as const, hairColor: 'hair-purple' };
    expect(new SaveManager(store, fixedNow).create(avatar)).toBe(true);
    expect(JSON.parse(data[SAVE_KEY]).version).toBe(SAVE_VERSION);

    const reloaded = new SaveManager(store, fixedNow);
    expect(reloaded.load()).toBe('loaded');
    expect(reloaded.avatar).toEqual(avatar);
    expect(reloaded.coins).toBe(1000);
    expect(reloaded.playerName).toBe('Samya');
  });

  it('Avatar später ändern', () => {
    const { store } = memoryStore();
    const saves = new SaveManager(store, fixedNow);
    saves.create({ ...DEFAULT_AVATAR });
    saves.setAvatar({ ...DEFAULT_AVATAR, glasses: 'glasses-round' });
    const reloaded = new SaveManager(store, fixedNow);
    reloaded.load();
    expect(reloaded.avatar.glasses).toBe('glasses-round');
  });

  it('kaputter Spielstand blockiert nicht und wird gesichert', () => {
    const { store, data } = memoryStore({ [SAVE_KEY]: '{kaputt' });
    const saves = new SaveManager(store, fixedNow);
    expect(saves.load()).toBe('recovered');
    expect(saves.hasSave).toBe(false);
    expect(data[SAVE_BACKUP_KEY]).toBe('{kaputt');
    expect(data[SAVE_KEY]).toBeUndefined();
  });

  it('Spielstand ohne Avatar gilt als kaputt', () => {
    const { store } = memoryStore({ [SAVE_KEY]: JSON.stringify({ version: 1, coins: 5 }) });
    expect(new SaveManager(store, fixedNow).load()).toBe('recovered');
  });

  it('Spielstand einer neueren Spielversion wird nicht überschrieben, sondern gesichert', () => {
    const raw = JSON.stringify({ version: SAVE_VERSION + 1, avatar: DEFAULT_AVATAR });
    const { store, data } = memoryStore({ [SAVE_KEY]: raw });
    expect(new SaveManager(store, fixedNow).load()).toBe('recovered');
    expect(data[SAVE_BACKUP_KEY]).toBe(raw);
  });

  it('repariert ungültige Felder: keine negativen Münzen, gültiger Name', () => {
    const raw = JSON.stringify({ version: 1, avatar: { ...DEFAULT_AVATAR, skin: '???' }, coins: -50, playerName: '   ' });
    const { store } = memoryStore({ [SAVE_KEY]: raw });
    const saves = new SaveManager(store, fixedNow);
    expect(saves.load()).toBe('loaded');
    expect(saves.coins).toBe(START_COINS);
    expect(saves.playerName).toBe('Samya');
    expect(saves.avatar.skin).toBe(DEFAULT_AVATAR.skin);
  });

  it('meldet, wenn nicht gespeichert werden kann – das Spiel läuft weiter', () => {
    const { store } = memoryStore({}, true);
    const saves = new SaveManager(store, fixedNow);
    expect(saves.create({ ...DEFAULT_AVATAR })).toBe(false);
    expect(saves.lastWriteFailed).toBe(true);
    expect(saves.hasSave).toBe(true);
  });

  it('Zurücksetzen löscht Spielstand und Sicherung', () => {
    const { store, data } = memoryStore({ [SAVE_BACKUP_KEY]: 'alt' });
    const saves = new SaveManager(store, fixedNow);
    saves.create({ ...DEFAULT_AVATAR });
    saves.reset();
    expect(saves.hasSave).toBe(false);
    expect(data[SAVE_KEY]).toBeUndefined();
    expect(data[SAVE_BACKUP_KEY]).toBeUndefined();
  });
});

describe('migrate', () => {
  it('führt Migrationen Schritt für Schritt aus', () => {
    const migrations = {
      0: (d: Record<string, unknown>) => ({ ...d, coins: 1000 }),
      1: (d: Record<string, unknown>) => ({ ...d, inventory: [] }),
    };
    expect(migrate({ avatar: {} }, migrations, 2)).toEqual({ avatar: {}, coins: 1000, inventory: [], version: 2 });
  });

  it('gibt null zurück, wenn eine Migration fehlt', () => {
    expect(migrate({ version: 0 }, {}, 1)).toBeNull();
  });

  it('lässt aktuelle Spielstände unverändert', () => {
    const data = { version: SAVE_VERSION, avatar: {} };
    expect(migrate(data)).toBe(data);
  });
});

describe('Spielstand Version 1 → 2 (Phase 3)', () => {
  it('alte Spielstände behalten Avatar und Münzen und bekommen Position und Orte', () => {
    const v1 = { version: 1, createdAt: 'x', updatedAt: 'y', playerName: 'Samya', coins: 750, avatar: { ...DEFAULT_AVATAR, hairStyle: 'bob' } };
    const { store } = memoryStore({ [SAVE_KEY]: JSON.stringify(v1) });
    const saves = new SaveManager(store, fixedNow);
    expect(saves.load()).toBe('loaded');
    expect(saves.current?.version).toBe(SAVE_VERSION);
    expect(saves.avatar.hairStyle).toBe('bob');
    expect(saves.coins).toBe(750);
    expect(saves.cityPosition).toBeNull();
    expect(saves.current?.discovered).toEqual([]);
  });

  it('merkt sich Position und entdeckte Orte über einen Neustart', () => {
    const { store } = memoryStore();
    const saves = new SaveManager(store, fixedNow);
    saves.create({ ...DEFAULT_AVATAR });
    saves.setCityPosition(1234.6, 987.2);
    expect(saves.discover('park')).toBe(true);
    expect(saves.discover('park')).toBe(false);
    const reloaded = new SaveManager(store, fixedNow);
    reloaded.load();
    expect(reloaded.cityPosition).toEqual({ x: 1235, y: 987 });
    expect(reloaded.hasDiscovered('park')).toBe(true);
  });

  it('kaputte Positionen und Ortslisten werden repariert', () => {
    const raw = { version: 2, avatar: DEFAULT_AVATAR, cityPosition: { x: 'a', y: 3 }, discovered: ['park', 5, 'park', ''] };
    const { store } = memoryStore({ [SAVE_KEY]: JSON.stringify(raw) });
    const saves = new SaveManager(store, fixedNow);
    expect(saves.load()).toBe('loaded');
    expect(saves.cityPosition).toBeNull();
    expect(saves.current?.discovered).toEqual(['park']);
  });
});

describe('Spielstand Version 4 (Phase 5)', () => {
  it('Spielzeug aufstellen und wegräumen wird gespeichert', () => {
    const { store } = memoryStore();
    const saves = new SaveManager(store, fixedNow);
    saves.create({ ...DEFAULT_AVATAR });
    expect(saves.place('toy-teddy', 100, 200)).toBe(false); // noch nicht gekauft
    saves.purchase([{ productId: 'toy-teddy', quantity: 1 }]);
    expect(saves.place('toy-teddy', 100.4, 200.6)).toBe(true);
    const reloaded = new SaveManager(store, fixedNow);
    reloaded.load();
    expect(reloaded.placements).toEqual({ 'toy-teddy': { x: 100, y: 201 } });
    expect(reloaded.unplace('toy-teddy')).toBe(true);
    expect(reloaded.placements).toEqual({});
  });

  it('nur Spielzeug kann aufgestellt werden', () => {
    const { store } = memoryStore();
    const saves = new SaveManager(store, fixedNow);
    saves.create({ ...DEFAULT_AVATAR });
    saves.purchase([{ productId: 'food-apples', quantity: 1 }]);
    expect(saves.place('food-apples', 1, 1)).toBe(false);
  });

  it('Essen verbraucht genau ein Stück', () => {
    const { store } = memoryStore();
    const saves = new SaveManager(store, fixedNow);
    saves.create({ ...DEFAULT_AVATAR });
    saves.purchase([{ productId: 'food-apples', quantity: 2 }]);
    expect(saves.consume('food-apples')).toBe(true);
    expect(saves.quantityOf('food-apples')).toBe(1);
    expect(saves.consume('food-apples')).toBe(true);
    expect(saves.quantityOf('food-apples')).toBe(0);
    expect(saves.consume('food-apples')).toBe(false);
    expect(saves.consume('toy-teddy')).toBe(false);
  });

  it('Version 3 → 4 und ungültige Aufstellungen werden repariert', () => {
    const v3 = { version: 3, avatar: DEFAULT_AVATAR, inventory: { 'toy-ball': 1 }, tasks: null };
    const { store } = memoryStore({ [SAVE_KEY]: JSON.stringify(v3) });
    const saves = new SaveManager(store, fixedNow);
    expect(saves.load()).toBe('loaded');
    expect(saves.placements).toEqual({});
    const v4 = { version: 4, avatar: DEFAULT_AVATAR, inventory: { 'toy-ball': 1 }, placements: { 'toy-ball': { x: 5, y: 6 }, 'toy-robot': { x: 1, y: 1 }, 'food-milk': { x: 2, y: 2 } } };
    const other = memoryStore({ [SAVE_KEY]: JSON.stringify(v4) });
    const saves4 = new SaveManager(other.store, fixedNow);
    saves4.load();
    expect(saves4.placements).toEqual({ 'toy-ball': { x: 5, y: 6 } });
  });
});
