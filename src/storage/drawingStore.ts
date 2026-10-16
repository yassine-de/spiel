import { STORAGE_PREFIX } from '../game/config/constants';
import { type KeyValueStore, safeStorage } from './safeStorage';

/** Samyas Bild aus der Malecke der Schule (als kleines PNG, getrennt vom Spielstand). */
export const DRAWING_KEY = `${STORAGE_PREFIX}:drawing`;
/** Größere Daten werden nicht gespeichert (Schutz für den Browser-Speicher). */
const MAX_LENGTH = 400_000;

export function loadDrawing(storage: KeyValueStore = safeStorage): string | null {
  const data = storage.get(DRAWING_KEY);
  return data && data.startsWith('data:image/png;base64,') && data.length <= MAX_LENGTH ? data : null;
}

export function saveDrawing(data: string, storage: KeyValueStore = safeStorage): boolean {
  if (!data.startsWith('data:image/png;base64,') || data.length > MAX_LENGTH) return false;
  return storage.set(DRAWING_KEY, data);
}

export function clearDrawing(storage: KeyValueStore = safeStorage): void {
  storage.remove(DRAWING_KEY);
}
