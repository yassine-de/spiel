import { describe, expect, it } from 'vitest';
import { BASE_ITEM_IDS, DEFAULT_AVATAR, enforceOwnership, getItem, isAvailable, randomAvatar } from '../src/game/avatar/avatarCatalog';
import { ShoppingCart, cartTotal, checkout } from '../src/game/shop/economy';
import { PRODUCTS, getProduct, productsOf } from '../src/game/shop/products';
import { TASK_POOL, TASKS_PER_DAY, localDateKey, pickDailyTasks } from '../src/game/tasks/dailyTasks';
import { TaskManager } from '../src/game/tasks/TaskManager';
import type { KeyValueStore } from '../src/storage/safeStorage';
import { SAVE_KEY, SaveManager } from '../src/storage/saveManager';
import { seededRandom } from '../src/game/utils/math';

function memoryStore(initial: Record<string, string> = {}) {
  const data: Record<string, string> = { ...initial };
  const store: KeyValueStore = {
    get: (k) => data[k] ?? null,
    set: (k, v) => {
      data[k] = v;
      return true;
    },
    remove: (k) => {
      delete data[k];
    },
  };
  return { data, store };
}

const now = () => '2026-10-14T12:00:00.000Z';

function freshSave(): SaveManager {
  const saves = new SaveManager(memoryStore().store, now);
  saves.create({ ...DEFAULT_AVATAR });
  return saves;
}

describe('Produktkatalog', () => {
  it('erfüllt die Mindestmengen des Spielkonzepts', () => {
    expect(productsOf('boutique').length).toBeGreaterThanOrEqual(12);
    expect(productsOf('rewe').length).toBeGreaterThanOrEqual(12);
    expect(productsOf('toystore').length).toBeGreaterThanOrEqual(10);
  });

  it('jedes Produkt hat ID, Name, Preis, Kategorie und Beschreibung; IDs sind eindeutig', () => {
    const ids = new Set<string>();
    for (const p of PRODUCTS) {
      expect(p.id && p.name && p.description && p.category).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect(ids.has(p.id), p.id).toBe(false);
      ids.add(p.id);
    }
  });

  it('enthält die Beispiele aus dem Spielkonzept', () => {
    const names = PRODUCTS.map((p) => p.name);
    for (const name of ['Rosa Kleid', 'Blaues Kleid', 'Jeansjacke', 'Stiefel', 'Herz-Handtasche', 'Herz-Sonnenbrille']) expect(names).toContain(name);
    for (const name of ['Äpfel', 'Bananen', 'Erdbeeren', 'Milch', 'Brot', 'Käse', 'Saft', 'Eis', 'Schokolade', 'Kekse', 'Wasser', 'Pizza']) {
      expect(names).toContain(name);
    }
    for (const name of ['Teddybär', 'Einhorn', 'Puppe', 'Spielzeugauto', 'Puzzle', 'Ball', 'Kuschelhase', 'Roboter', 'Bauklötze', 'Spielzeugküche']) {
      expect(names).toContain(name);
    }
  });

  it('Boutique verkauft nur, was nicht ohnehin Grundausstattung ist', () => {
    for (const p of productsOf('boutique')) {
      expect(getItem(p.id), p.id).not.toBeNull();
      expect(BASE_ITEM_IDS.has(p.id), p.id).toBe(false);
    }
  });
});

describe('Münzen und Einkauf', () => {
  it('rechnet Summen richtig', () => {
    expect(cartTotal([{ productId: 'food-apples', quantity: 3 }, { productId: 'food-pizza', quantity: 1 }])).toBe(3 * 4 + 8);
  });

  it('zieht Münzen genau ab und legt Dinge ins Inventar', () => {
    const result = checkout([{ productId: 'food-milk', quantity: 2 }], 100, {});
    expect(result).toMatchObject({ ok: true, total: 6, coins: 94, inventory: { 'food-milk': 2 } });
  });

  it('zu wenig Münzen: nichts passiert, nie negativ', () => {
    const result = checkout([{ productId: 'toy-kitchen', quantity: 1 }], 149, {});
    expect(result).toEqual({ ok: false, reason: 'not-enough-coins', total: 150 });
  });

  it('einzigartige Dinge kann man nicht doppelt kaufen', () => {
    expect(checkout([{ productId: 'dress-pink', quantity: 1 }], 999, { 'dress-pink': 1 })).toMatchObject({ ok: false, reason: 'already-owned' });
    expect(checkout([{ productId: 'toy-teddy', quantity: 2 }], 999, {})).toMatchObject({ ok: false, reason: 'already-owned' });
  });

  it('alles oder nichts: ein Fehler verhindert den ganzen Einkauf', () => {
    const result = checkout([{ productId: 'food-apples', quantity: 1 }, { productId: 'gibt-es-nicht', quantity: 1 }], 999, {});
    expect(result.ok).toBe(false);
  });

  it('leerer Warenkorb und ungültige Mengen werden abgelehnt', () => {
    expect(checkout([], 999, {})).toMatchObject({ ok: false, reason: 'empty' });
    expect(checkout([{ productId: 'food-apples', quantity: -2 }], 999, {})).toMatchObject({ ok: false, reason: 'invalid-quantity' });
  });

  it('Warenkorb: hinzufügen, entfernen, Höchstmenge', () => {
    const cart = new ShoppingCart();
    for (let i = 0; i < 12; i++) cart.add('food-bread');
    expect(cart.quantityOf('food-bread')).toBe(9);
    cart.remove('food-bread');
    expect(cart.count).toBe(8);
    expect(cart.total).toBe(32);
    cart.clear();
    expect(cart.items).toEqual([]);
  });

  it('SaveManager: Kauf wird gespeichert und übersteht einen Neustart', () => {
    const { store } = memoryStore();
    const saves = new SaveManager(store, now);
    saves.create({ ...DEFAULT_AVATAR });
    expect(saves.purchase([{ productId: 'toy-teddy', quantity: 1 }]).ok).toBe(true);
    expect(saves.purchase([{ productId: 'toy-teddy', quantity: 1 }]).ok).toBe(false);
    const reloaded = new SaveManager(store, now);
    reloaded.load();
    expect(reloaded.coins).toBe(920);
    expect(reloaded.owns('toy-teddy')).toBe(true);
  });

  it('SaveManager: Münzen werden auch bei vielen Käufen nie negativ', () => {
    const saves = freshSave();
    for (let i = 0; i < 200; i++) saves.purchase([{ productId: 'food-pizza', quantity: 1 }]);
    expect(saves.coins).toBeGreaterThanOrEqual(0);
    expect(saves.coins).toBe(1000 - 99 * 8);
    expect(saves.quantityOf('food-pizza')).toBe(99);
  });
});

describe('Besitz von Kleidung', () => {
  it('Grundausstattung ist immer verfügbar, Boutique-Teile erst nach dem Kauf', () => {
    const owns = (id: string) => id === 'dress-blue';
    expect(isAvailable('top-tshirt-heart', owns)).toBe(true);
    expect(isAvailable('dress-blue', owns)).toBe(true);
    expect(isAvailable('dress-pink', owns)).toBe(false);
  });

  it('nicht gekaufte Teile werden durch die Grundausstattung ersetzt', () => {
    const avatar = enforceOwnership({ ...DEFAULT_AVATAR, top: 'dress-pink', hat: 'hat-sun', bag: 'bag-heart' }, () => false);
    expect(avatar.top).toBe(DEFAULT_AVATAR.top);
    expect(avatar.hat).toBeNull();
    expect(avatar.bag).toBeNull();
  });

  it('„Überrasch mich!“ wählt nur verfügbare Kleidung', () => {
    const rand = seededRandom(5);
    for (let i = 0; i < 100; i++) {
      const avatar = randomAvatar(rand);
      for (const slot of ['top', 'bottom', 'shoes', 'glasses', 'hairAccessory', 'hat', 'bag'] as const) {
        expect(isAvailable(avatar[slot], () => false), `${slot}=${avatar[slot]}`).toBe(true);
      }
    }
  });

  it('Spielstand: angezogene Teile müssen gekauft sein', () => {
    const saves = freshSave();
    saves.setAvatar({ ...DEFAULT_AVATAR, top: 'dress-pink' });
    expect(saves.avatar.top).toBe(DEFAULT_AVATAR.top);
    saves.purchase([{ productId: 'dress-pink', quantity: 1 }]);
    saves.setAvatar({ ...DEFAULT_AVATAR, top: 'dress-pink' });
    expect(saves.avatar.top).toBe('dress-pink');
  });

  it('Update auf Version 3: bisher getragene Boutique-Kleidung bleibt geschenkt', () => {
    const v2 = { version: 2, avatar: { ...DEFAULT_AVATAR, top: 'dress-blue', shoes: 'shoes-boots-brown', hat: 'hat-cap' }, coins: 500 };
    const { store } = memoryStore({ [SAVE_KEY]: JSON.stringify(v2) });
    const saves = new SaveManager(store, now);
    expect(saves.load()).toBe('loaded');
    expect(saves.avatar.top).toBe('dress-blue');
    expect(saves.avatar.shoes).toBe('shoes-boots-brown');
    expect(saves.owns('dress-blue')).toBe(true);
    expect(saves.owns('hat-cap')).toBe(false); // Grundausstattung, nicht im Inventar
    expect(saves.coins).toBe(500);
  });
});

describe('Tagesaufgaben', () => {
  it('jeden Tag dieselbe Auswahl, an verschiedenen Tagen unterschiedlich', () => {
    expect(pickDailyTasks('2026-10-14', true)).toEqual(pickDailyTasks('2026-10-14', true));
    expect(pickDailyTasks('2026-10-14', true)).toHaveLength(TASKS_PER_DAY);
    const days = new Set(['2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17'].map((d) => pickDailyTasks(d, true).join()));
    expect(days.size).toBeGreaterThan(1);
  });

  it('„Entdecke einen neuen Ort“ nur, wenn es noch etwas zu entdecken gibt', () => {
    for (let d = 1; d <= 28; d++) {
      expect(pickDailyTasks(`2026-02-${String(d).padStart(2, '0')}`, false)).not.toContain('discover');
    }
  });

  it('enthält keine Kaufaufträge (kein Kaufdruck)', () => {
    expect(TASK_POOL.every((t) => !/kauf/i.test(t.title))).toBe(true);
  });

  it('Belohnung gibt es nur einmal pro Tag – auch nach Neuladen', () => {
    const { store } = memoryStore();
    const date = new Date(2026, 9, 14, 10);
    const saves = new SaveManager(store, now);
    saves.create({ ...DEFAULT_AVATAR });
    const manager = new TaskManager(saves, () => true, () => date);
    const today = manager.today();
    const first = today[0].task;
    const completed: string[] = [];
    manager.onCompleted((t) => completed.push(t.id));
    manager.report(first.event);
    manager.report(first.event);
    expect(completed).toEqual([first.id]);
    expect(saves.coins).toBe(1000 + first.reward);

    const reloaded = new SaveManager(store, now);
    reloaded.load();
    const again = new TaskManager(reloaded, () => true, () => date);
    again.report(first.event);
    expect(reloaded.coins).toBe(1000 + first.reward);
    expect(again.today().find((s) => s.task.id === first.id)?.done).toBe(true);
  });

  it('am nächsten Tag gibt es neue Aufgaben', () => {
    const saves = freshSave();
    let date = new Date(2026, 9, 14, 23, 50);
    const manager = new TaskManager(saves, () => true, () => date);
    const first = manager.today()[0].task;
    manager.report(first.event);
    date = new Date(2026, 9, 15, 0, 10);
    expect(manager.today().every((s) => !s.done)).toBe(true);
    expect(saves.dailyTasks?.date).toBe(localDateKey(date));
  });

  it('Ereignisse ohne passende Aufgabe ändern nichts', () => {
    const saves = freshSave();
    const manager = new TaskManager(saves, () => true, () => new Date(2026, 9, 14));
    const todays = new Set(manager.today().map((s) => s.task.event));
    const other = TASK_POOL.find((t) => !todays.has(t.event))!;
    manager.report(other.event);
    expect(saves.coins).toBe(1000);
  });
});

describe('Produktbilder', () => {
  it('jedes Lebensmittel und Spielzeug hat ein eigenes Bild', async () => {
    const { hasItemIcon } = await import('../src/game/assets/placeholders/itemIconPainter');
    for (const p of PRODUCTS.filter((p) => p.category === 'food' || p.category === 'toys')) {
      expect(hasItemIcon(p.id), p.id).toBe(true);
    }
    expect(getProduct('toy-teddy')?.plush).toBe(true);
  });
});
