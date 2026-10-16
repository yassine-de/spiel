import { BASE_ITEM_IDS, DEFAULT_AVATAR, enforceOwnership, getItem, sanitizeAvatar } from '../game/avatar/avatarCatalog';
import type { AvatarConfig } from '../game/avatar/avatarTypes';
import { PLAYER_NAME, STORAGE_PREFIX } from '../game/config/constants';
import { type CartLine, type Inventory, type PurchaseResult, checkout } from '../game/shop/economy';
import { MAX_STACK, getProduct } from '../game/shop/products';
import { getTask } from '../game/tasks/dailyTasks';
import { safeStorage, type KeyValueStore } from './safeStorage';

/**
 * Spielstand – versioniert, fehlertolerant, nur lokal im Browser.
 *
 * Neue Felder in späteren Phasen (Inventar, Position, Aufgaben …):
 * SAVE_VERSION erhöhen und in MIGRATIONS eine Funktion ergänzen,
 * die alte Spielstände auf das neue Format bringt.
 */
export const SAVE_VERSION = 5;
export const SAVE_KEY = `${STORAGE_PREFIX}:save`;
/** Unlesbare Spielstände werden hier aufbewahrt statt gelöscht. */
export const SAVE_BACKUP_KEY = `${STORAGE_PREFIX}:save-backup`;
export const START_COINS = 1000;
/** So viele Münzen lassen sich pro Tag mit Spielen (z. B. in der Schule) verdienen. */
export const ACTIVITY_COINS_PER_DAY = 30;

export interface SaveData {
  version: number;
  createdAt: string;
  updatedAt: string;
  playerName: string;
  avatar: AvatarConfig;
  coins: number;
  /** Letzte Position in der Stadt (Fußpunkt); null = Startpunkt */
  cityPosition: { x: number; y: number } | null;
  /** IDs der schon entdeckten Orte */
  discovered: string[];
  /** Gekaufte Dinge: Produkt-ID → Menge */
  inventory: Record<string, number>;
  /** Tagesaufgaben des aktuellen Tages */
  tasks: DailyTaskState | null;
  /** Im Haus aufgestellte Spielzeuge: Produkt-ID → Position (Fußpunkt) */
  placements: Record<string, { x: number; y: number }>;
  /** Heute mit Spielen verdiente Münzen (Tageslimit) */
  activityCoins: { date: string; earned: number } | null;
}

export interface DailyTaskState {
  /** Lokales Datum „JJJJ-MM-TT“ */
  date: string;
  ids: string[];
  done: string[];
}

export type LoadStatus = 'empty' | 'loaded' | 'recovered';

type RawData = Record<string, unknown>;
export type Migration = (data: RawData) => RawData;

/** MIGRATIONS[n] wandelt einen Spielstand von Version n in Version n + 1 um. */
export const MIGRATIONS: Record<number, Migration> = {
  // Version 1 → 2 (Phase 3): Stadtposition und entdeckte Orte
  1: (data) => ({ ...data, cityPosition: null, discovered: [] }),
  // Version 2 → 3 (Phase 4): Inventar und Tagesaufgaben.
  // Kleidung, die bisher frei war und jetzt in der Boutique verkauft wird, bleibt geschenkt.
  2: (data) => {
    const avatar = (typeof data.avatar === 'object' && data.avatar !== null ? data.avatar : {}) as Record<string, unknown>;
    const inventory: Record<string, number> = {};
    for (const slot of ['top', 'bottom', 'shoes', 'glasses', 'hairAccessory', 'hat']) {
      const id = avatar[slot];
      if (typeof id === 'string' && getItem(id) && !BASE_ITEM_IDS.has(id) && getProduct(id)) inventory[id] = 1;
    }
    return { ...data, inventory, tasks: null };
  },
  // Version 3 → 4 (Phase 5): aufgestellte Spielzeuge im Haus
  3: (data) => ({ ...data, placements: {} }),
  // Version 4 → 5: Münzen aus Spielen in Friseursalon, Café und Schule (Tageslimit)
  4: (data) => ({ ...data, activityCoins: null }),
};

function sanitizeActivityCoins(value: unknown): { date: string; earned: number } | null {
  if (typeof value !== 'object' || value === null) return null;
  const { date, earned } = value as Record<string, unknown>;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (typeof earned !== 'number' || !Number.isFinite(earned)) return null;
  return { date, earned: Math.max(0, Math.min(ACTIVITY_COINS_PER_DAY, Math.floor(earned))) };
}

/** Nur gekaufte Spielzeuge können aufgestellt sein. */
function sanitizePlacements(value: unknown, inventory: Record<string, number>): Record<string, { x: number; y: number }> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const result: Record<string, { x: number; y: number }> = {};
  for (const [id, raw] of Object.entries(value as Record<string, unknown>)) {
    const position = sanitizePosition(raw);
    if (position && getProduct(id)?.category === 'toys' && (inventory[id] ?? 0) > 0) result[id] = position;
  }
  return result;
}

function sanitizeInventory(value: unknown): Record<string, number> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const result: Record<string, number> = {};
  for (const [id, raw] of Object.entries(value as Record<string, unknown>)) {
    const product = getProduct(id);
    if (!product || typeof raw !== 'number' || !Number.isFinite(raw)) continue;
    const quantity = Math.floor(raw);
    if (quantity < 1) continue;
    result[id] = product.unique ? 1 : Math.min(MAX_STACK, quantity);
  }
  return result;
}

function sanitizeTasks(value: unknown): DailyTaskState | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return null;
  const ids = sanitizeIds(v.ids).filter((id) => getTask(id));
  const done = sanitizeIds(v.done).filter((id) => ids.includes(id));
  return { date: v.date, ids, done };
}

const MAX_DISCOVERED = 100;

function sanitizePosition(value: unknown): { x: number; y: number } | null {
  if (typeof value !== 'object' || value === null) return null;
  const { x, y } = value as Record<string, unknown>;
  return typeof x === 'number' && typeof y === 'number' && Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function sanitizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids = value.filter((v): v is string => typeof v === 'string' && v.length > 0 && v.length <= 40);
  return [...new Set(ids)].slice(0, MAX_DISCOVERED);
}

/** Bringt einen Spielstand auf die aktuelle Version; null, wenn das nicht geht. */
export function migrate(raw: RawData, migrations: Record<number, Migration> = MIGRATIONS, target = SAVE_VERSION): RawData | null {
  let version = typeof raw.version === 'number' && Number.isInteger(raw.version) ? raw.version : 0;
  if (version > target) return null;
  let data = raw;
  while (version < target) {
    const step = migrations[version];
    if (!step) return null;
    data = step(data);
    version += 1;
    data = { ...data, version };
  }
  return data;
}

/** Prüft alle Felder; ohne Avatar ist ein Spielstand nicht brauchbar. */
export function sanitizeSave(data: RawData, now: string): SaveData | null {
  if (typeof data.avatar !== 'object' || data.avatar === null) return null;
  const coins = typeof data.coins === 'number' && Number.isFinite(data.coins) && data.coins >= 0 ? Math.floor(data.coins) : START_COINS;
  const name = typeof data.playerName === 'string' ? data.playerName.trim().slice(0, 20) : '';
  const inventory = sanitizeInventory(data.inventory);
  return {
    version: SAVE_VERSION,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : now,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : now,
    playerName: name || PLAYER_NAME,
    avatar: enforceOwnership(sanitizeAvatar(data.avatar), (id) => (inventory[id] ?? 0) > 0),
    coins,
    cityPosition: sanitizePosition(data.cityPosition),
    discovered: sanitizeIds(data.discovered),
    inventory,
    tasks: sanitizeTasks(data.tasks),
    placements: sanitizePlacements(data.placements, inventory),
    activityCoins: sanitizeActivityCoins(data.activityCoins),
  };
}

export class SaveManager {
  private data: SaveData | null = null;
  /** true, wenn der letzte Speicherversuch fehlgeschlagen ist (z. B. privater Modus). */
  lastWriteFailed = false;

  constructor(
    private readonly storage: KeyValueStore = safeStorage,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  load(): LoadStatus {
    const raw = this.storage.get(SAVE_KEY);
    if (raw === null) {
      this.data = null;
      return 'empty';
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return this.recover(raw);
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return this.recover(raw);
    const migrated = migrate(parsed as RawData);
    const clean = migrated ? sanitizeSave(migrated, this.now()) : null;
    if (!clean) return this.recover(raw);
    this.data = clean;
    return 'loaded';
  }

  get current(): Readonly<SaveData> | null {
    return this.data;
  }

  get hasSave(): boolean {
    return this.data !== null;
  }

  get playerName(): string {
    return this.data?.playerName ?? PLAYER_NAME;
  }

  get avatar(): AvatarConfig {
    return this.data?.avatar ?? { ...DEFAULT_AVATAR };
  }

  get coins(): number {
    return this.data?.coins ?? START_COINS;
  }

  /** Legt einen neuen Spielstand an (erster Spielstart). */
  create(avatar: AvatarConfig): boolean {
    const time = this.now();
    this.data = {
      version: SAVE_VERSION,
      createdAt: time,
      updatedAt: time,
      playerName: PLAYER_NAME,
      // Beim ersten Start gibt es nur die Grundausstattung
      avatar: enforceOwnership(sanitizeAvatar(avatar), () => false),
      coins: START_COINS,
      cityPosition: null,
      discovered: [],
      inventory: {},
      tasks: null,
      placements: {},
      activityCoins: null,
    };
    return this.write();
  }

  setAvatar(avatar: AvatarConfig): boolean {
    if (!this.data) return this.create(avatar);
    this.data = { ...this.data, avatar: enforceOwnership(sanitizeAvatar(avatar), this.owns) };
    return this.write();
  }

  /* ---------------- Inventar und Einkauf ---------------- */

  get inventory(): Inventory {
    return this.data?.inventory ?? {};
  }

  /** Besitzt die Spielerin dieses Produkt? (als Funktion nutzbar) */
  readonly owns = (productId: string): boolean => (this.data?.inventory[productId] ?? 0) > 0;

  quantityOf(productId: string): number {
    return this.data?.inventory[productId] ?? 0;
  }

  /** Kauft alles im Warenkorb – oder nichts, wenn etwas nicht passt. */
  purchase(lines: readonly CartLine[]): PurchaseResult {
    if (!this.data) return { ok: false, reason: 'empty', total: 0 };
    const result = checkout(lines, this.data.coins, this.data.inventory);
    if (!result.ok) return result;
    this.data = { ...this.data, coins: result.coins, inventory: result.inventory };
    this.write();
    return result;
  }

  /** Verbraucht ein Lebensmittel (z. B. Essen aus dem Kühlschrank). */
  consume(productId: string): boolean {
    if (!this.data) return false;
    const product = getProduct(productId);
    const quantity = this.data.inventory[productId] ?? 0;
    if (!product || product.category !== 'food' || quantity < 1) return false;
    const inventory = { ...this.data.inventory };
    if (quantity === 1) delete inventory[productId];
    else inventory[productId] = quantity - 1;
    this.data = { ...this.data, inventory };
    this.write();
    return true;
  }

  /** Bezahlt etwas direkt (z. B. im Café). Münzen werden nie negativ. */
  spend(amount: number): boolean {
    if (!this.data || !Number.isInteger(amount) || amount < 0 || amount > this.data.coins) return false;
    this.data = { ...this.data, coins: this.data.coins - amount };
    return this.write();
  }

  /** Noch heute mit Spielen verdienbare Münzen. */
  activityCoinsLeft(date: string): number {
    const state = this.data?.activityCoins;
    return ACTIVITY_COINS_PER_DAY - (state?.date === date ? state.earned : 0);
  }

  /**
   * Belohnung für ein Spiel (Rätsel, Wörter …) – höchstens ACTIVITY_COINS_PER_DAY pro Tag.
   * Gibt die tatsächlich gutgeschriebenen Münzen zurück.
   */
  earnFromActivity(date: string, amount: number): number {
    if (!this.data || !Number.isInteger(amount) || amount <= 0) return 0;
    const granted = Math.min(amount, Math.max(0, this.activityCoinsLeft(date)));
    if (granted === 0) return 0;
    const earned = (this.data.activityCoins?.date === date ? this.data.activityCoins.earned : 0) + granted;
    this.data = { ...this.data, coins: this.data.coins + granted, activityCoins: { date, earned } };
    this.write();
    return granted;
  }

  /* ---------------- Aufgestellte Spielzeuge ---------------- */

  get placements(): Readonly<Record<string, { x: number; y: number }>> {
    return this.data?.placements ?? {};
  }

  place(productId: string, x: number, y: number): boolean {
    if (!this.data || getProduct(productId)?.category !== 'toys' || !this.owns(productId)) return false;
    this.data = { ...this.data, placements: { ...this.data.placements, [productId]: { x: Math.round(x), y: Math.round(y) } } };
    return this.write();
  }

  unplace(productId: string): boolean {
    if (!this.data || !this.data.placements[productId]) return false;
    const placements = { ...this.data.placements };
    delete placements[productId];
    this.data = { ...this.data, placements };
    return this.write();
  }

  /* ---------------- Tagesaufgaben ---------------- */

  get dailyTasks(): DailyTaskState | null {
    return this.data?.tasks ?? null;
  }

  /** Legt die Aufgaben für ein neues Datum an (bestehende des Tages bleiben unverändert). */
  ensureDailyTasks(date: string, pick: () => string[]): DailyTaskState | null {
    if (!this.data) return null;
    if (this.data.tasks?.date === date) return this.data.tasks;
    this.data = { ...this.data, tasks: { date, ids: pick(), done: [] } };
    this.write();
    return this.data.tasks;
  }

  /** Erledigt eine Aufgabe und zahlt die Belohnung aus – höchstens einmal pro Tag. */
  completeTask(date: string, taskId: string): boolean {
    const tasks = this.data?.tasks;
    const task = getTask(taskId);
    if (!this.data || !tasks || !task || tasks.date !== date) return false;
    if (!tasks.ids.includes(taskId) || tasks.done.includes(taskId)) return false;
    this.data = {
      ...this.data,
      coins: this.data.coins + task.reward,
      tasks: { ...tasks, done: [...tasks.done, taskId] },
    };
    this.write();
    return true;
  }

  get cityPosition(): { x: number; y: number } | null {
    return this.data?.cityPosition ?? null;
  }

  hasDiscovered(id: string): boolean {
    return this.data?.discovered.includes(id) ?? false;
  }

  /** Merkt sich einen neuen Ort. Gibt true zurück, wenn er wirklich neu war. */
  discover(id: string): boolean {
    if (!this.data || this.data.discovered.includes(id)) return false;
    this.data = { ...this.data, discovered: [...this.data.discovered, id] };
    this.write();
    return true;
  }

  setCityPosition(x: number, y: number): boolean {
    if (!this.data) return false;
    this.data = { ...this.data, cityPosition: { x: Math.round(x), y: Math.round(y) } };
    return this.write();
  }

  /** Löscht den Spielstand vollständig (nach Bestätigung durch die Spielerin). */
  reset(): void {
    this.storage.remove(SAVE_KEY);
    this.storage.remove(SAVE_BACKUP_KEY);
    this.data = null;
  }

  private write(): boolean {
    if (!this.data) return false;
    this.data = { ...this.data, updatedAt: this.now() };
    const ok = this.storage.set(SAVE_KEY, JSON.stringify(this.data));
    this.lastWriteFailed = !ok;
    return ok;
  }

  private recover(raw: string): LoadStatus {
    this.storage.set(SAVE_BACKUP_KEY, raw);
    this.storage.remove(SAVE_KEY);
    this.data = null;
    return 'recovered';
  }
}
