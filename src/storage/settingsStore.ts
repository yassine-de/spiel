import { STORAGE_PREFIX } from '../game/config/constants';
import { safeStorage, type KeyValueStore } from './safeStorage';

export type ReducedMotionSetting = 'auto' | 'on' | 'off';
export type QualitySetting = 'auto' | 'high' | 'low';

export interface Settings {
  /** Lautstärke der Soundeffekte, 0..1 */
  sfxVolume: number;
  muted: boolean;
  reducedMotion: ReducedMotionSetting;
  quality: QualitySetting;
}

export const SETTINGS_VERSION = 1;
export const SETTINGS_KEY = `${STORAGE_PREFIX}:settings`;

export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({
  sfxVolume: 0.7,
  muted: false,
  reducedMotion: 'auto',
  quality: 'auto',
});

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Liest gespeicherte Einstellungen. Jedes Feld wird einzeln geprüft:
 * Ungültige oder fehlende Werte fallen auf den Standard zurück,
 * kaputte Daten blockieren das Spiel nie.
 */
export function parseSettings(raw: string | null): Settings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
  if (typeof data !== 'object' || data === null) return { ...DEFAULT_SETTINGS };
  const d = data as Record<string, unknown>;
  const volume =
    typeof d.sfxVolume === 'number' && Number.isFinite(d.sfxVolume)
      ? Math.min(1, Math.max(0, d.sfxVolume))
      : DEFAULT_SETTINGS.sfxVolume;
  return {
    sfxVolume: volume,
    muted: typeof d.muted === 'boolean' ? d.muted : DEFAULT_SETTINGS.muted,
    reducedMotion: pick(d.reducedMotion, ['auto', 'on', 'off'], DEFAULT_SETTINGS.reducedMotion),
    quality: pick(d.quality, ['auto', 'high', 'low'], DEFAULT_SETTINGS.quality),
  };
}

export function serializeSettings(settings: Settings): string {
  return JSON.stringify({ version: SETTINGS_VERSION, ...settings });
}

type Listener = (settings: Readonly<Settings>, previous: Readonly<Settings>) => void;

export class SettingsStore {
  private settings: Settings;
  private readonly listeners = new Set<Listener>();

  constructor(private readonly storage: KeyValueStore = safeStorage) {
    this.settings = parseSettings(storage.get(SETTINGS_KEY));
  }

  get(): Readonly<Settings> {
    return this.settings;
  }

  update(patch: Partial<Settings>): void {
    const previous = this.settings;
    this.settings = parseSettings(JSON.stringify({ ...previous, ...patch }));
    this.storage.set(SETTINGS_KEY, serializeSettings(this.settings));
    for (const listener of this.listeners) listener(this.settings, previous);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
