import { describe, expect, it } from 'vitest';
import { createSafeStorage, type KeyValueStore } from '../src/storage/safeStorage';
import { DEFAULT_SETTINGS, SETTINGS_KEY, SettingsStore, parseSettings, serializeSettings } from '../src/storage/settingsStore';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    get: (k) => data[k] ?? null,
    set: (k, v) => {
      data[k] = v;
      return true;
    },
    remove: (k) => {
      delete data[k];
    },
  };
}

describe('parseSettings', () => {
  it('nutzt Standardwerte ohne gespeicherte Daten', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('übersteht kaputtes JSON', () => {
    expect(parseSettings('{kaputt')).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('42')).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('null')).toEqual(DEFAULT_SETTINGS);
  });

  it('prüft jedes Feld einzeln', () => {
    const parsed = parseSettings(JSON.stringify({ sfxVolume: 7, muted: 'ja', quality: 'low', reducedMotion: 'egal' }));
    expect(parsed.sfxVolume).toBe(1);
    expect(parsed.muted).toBe(DEFAULT_SETTINGS.muted);
    expect(parsed.quality).toBe('low');
    expect(parsed.reducedMotion).toBe(DEFAULT_SETTINGS.reducedMotion);
  });

  it('speichert mit Versionsnummer und liest es wieder ein', () => {
    const s = { ...DEFAULT_SETTINGS, muted: true, sfxVolume: 0.25 };
    const raw = serializeSettings(s);
    expect(JSON.parse(raw).version).toBe(1);
    expect(parseSettings(raw)).toEqual(s);
  });
});

describe('SettingsStore', () => {
  it('lädt, ändert, speichert und benachrichtigt', () => {
    const storage = memoryStore({ [SETTINGS_KEY]: JSON.stringify({ version: 1, muted: true }) });
    const store = new SettingsStore(storage);
    expect(store.get().muted).toBe(true);
    let notified = 0;
    store.subscribe(() => notified++);
    store.update({ quality: 'high' });
    expect(notified).toBe(1);
    expect(JSON.parse(storage.data[SETTINGS_KEY]).quality).toBe('high');
    expect(new SettingsStore(storage).get().quality).toBe('high');
  });

  it('läuft weiter, wenn der Speicher Fehler wirft', () => {
    const throwing = createSafeStorage(() => {
      throw new Error('SecurityError');
    });
    const store = new SettingsStore(throwing);
    expect(store.get()).toEqual(DEFAULT_SETTINGS);
    expect(() => store.update({ muted: true })).not.toThrow();
    expect(store.get().muted).toBe(true);
  });
});
