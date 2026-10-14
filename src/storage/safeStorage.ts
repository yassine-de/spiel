/**
 * Fehlertoleranter Zugriff auf LocalStorage.
 * Im privaten Modus, bei vollem Speicher oder gesperrten Website-Daten
 * werfen Browser Ausnahmen – das Spiel soll dann trotzdem laufen.
 */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): boolean;
  remove(key: string): void;
}

export function createSafeStorage(getBackend: () => Storage | undefined): KeyValueStore {
  return {
    get(key) {
      try {
        return getBackend()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        const backend = getBackend();
        if (!backend) return false;
        backend.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        getBackend()?.removeItem(key);
      } catch {
        // Ignorieren: Ohne Speicher gibt es nichts zu löschen.
      }
    },
  };
}

export const safeStorage = createSafeStorage(() =>
  typeof window !== 'undefined' ? window.localStorage : undefined,
);
