import type { AvatarConfig } from '../avatar/avatarTypes';
import { audio, playClick, saves } from '../services';
import { INVENTORY_CATEGORIES, type InventoryCategory, getProduct } from '../shop/products';
import { button, h } from './dom';
import { Modal } from './Modal';
import { productImage, slotOf, wearing } from './productImage';

/** Vom Haus gesetzt, solange Samya zu Hause ist: Spielzeug aufstellen und wegräumen. */
export interface PlacementHandlers {
  place: (productId: string) => boolean;
  remove: (productId: string) => void;
}

/** Plätze, die man auch leer lassen kann (Accessoires). */
const OPTIONAL_SLOTS = new Set(['glasses', 'hairAccessory', 'hat', 'bag']);

/**
 * Inventar: alles Gekaufte, sortiert nach Kategorien.
 * Kleidung an- und ablegen, Lebensmittel essen, Spielzeug zu Hause aufstellen.
 */
export class InventoryPanel extends Modal {
  private readonly tabs: HTMLElement;
  private readonly grid: HTMLElement;
  private category: InventoryCategory = 'clothing';
  /** Nur zu Hause gesetzt */
  placement: PlacementHandlers | null = null;
  /** Kurze Rückmeldung (Toast) */
  notify: (message: string) => void = () => undefined;

  constructor(
    parent: HTMLElement,
    private readonly applyAvatar: (avatar: AvatarConfig) => void,
  ) {
    super(parent, 'Inventar', { className: 'inventory-card' });
    this.tabs = h('div', { class: 'inventory-tabs', attrs: { role: 'tablist' } });
    this.grid = h('div', { class: 'inventory-grid' });
    this.body.append(this.tabs, this.grid);
  }

  override show(): void {
    this.render();
    super.show();
  }

  /** Öffnet das Inventar bei einer bestimmten Kategorie (z. B. Kühlschrank → Lebensmittel). */
  openAt(category: InventoryCategory): void {
    this.category = category;
    this.show();
  }

  private render(): void {
    const counts = new Map<InventoryCategory, number>();
    for (const [id, quantity] of Object.entries(saves.inventory)) {
      const product = getProduct(id);
      if (product) counts.set(product.category, (counts.get(product.category) ?? 0) + quantity);
    }
    this.tabs.replaceChildren(
      ...INVENTORY_CATEGORIES.map((cat) => {
        const count = counts.get(cat.id) ?? 0;
        const el = h(
          'button',
          {
            class: `inventory-tab${cat.id === this.category ? ' is-active' : ''}`,
            attrs: { type: 'button', role: 'tab', 'aria-selected': String(cat.id === this.category) },
          },
          h('span', { text: cat.name }),
          count > 0 ? h('span', { class: 'inventory-tab-count', text: String(count) }) : null,
        );
        el.addEventListener('click', () => {
          playClick();
          this.category = cat.id;
          this.render();
        });
        return el;
      }),
    );

    const items = Object.entries(saves.inventory)
      .map(([id, quantity]) => ({ product: getProduct(id), quantity }))
      .filter((entry) => entry.product?.category === this.category);

    if (items.length === 0) {
      this.grid.replaceChildren(h('p', { class: 'inventory-empty', text: 'Hier ist noch nichts – vielleicht entdeckst du bald etwas Schönes! ✨' }));
      return;
    }

    this.grid.replaceChildren(
      ...items.map(({ product, quantity }) => {
        const p = product!;
        const card = h(
          'div',
          { class: 'inventory-item' },
          productImage(p.id, saves.avatar),
          h('span', { class: 'product-name', text: p.name }),
          quantity > 1 ? h('span', { class: 'product-badge', text: `${quantity}×` }) : null,
        );
        const action = this.wearAction(p.id) ?? this.useAction(p.id, p.name, p.category);
        if (action) card.append(action);
        return card;
      }),
    );
  }

  /** Anziehen / Ablegen für Kleidung; andere Dinge haben (noch) keine Aktion. */
  private wearAction(itemId: string): HTMLElement | null {
    const slot = slotOf(itemId);
    if (!slot) return null;
    const avatar = saves.avatar;
    const worn = avatar[slot] === itemId;
    if (!worn) {
      return button({ label: 'Anziehen', variant: 'secondary', onPress: () => this.change(wearing(avatar, itemId)) }, playClick);
    }
    if (OPTIONAL_SLOTS.has(slot)) {
      return button({ label: 'Ablegen', variant: 'secondary', onPress: () => this.change({ ...avatar, [slot]: null }) }, playClick);
    }
    return h('span', { class: 'inventory-worn', text: 'Trägst du ✓' });
  }

  /** Essen (Lebensmittel) oder Aufstellen/Wegräumen (Spielzeug, nur zu Hause). */
  private useAction(id: string, name: string, category: InventoryCategory): HTMLElement | null {
    if (category === 'food') {
      return button(
        {
          label: 'Essen',
          variant: 'secondary',
          onPress: () => {
            if (!saves.consume(id)) return;
            audio.play('sparkle');
            this.notify(`Mmh, ${name} – lecker! 😋`);
            this.render();
          },
        },
        playClick,
      );
    }
    if (category !== 'toys') return null;
    const placed = id in saves.placements;
    const handlers = this.placement;
    if (placed && handlers) {
      return button({ label: 'Wegräumen', variant: 'secondary', onPress: () => (handlers.remove(id), this.render()) }, playClick);
    }
    if (placed) return h('span', { class: 'inventory-worn', text: 'Steht im Haus ✓' });
    if (handlers) {
      return button(
        {
          label: 'Hier aufstellen',
          variant: 'secondary',
          onPress: () => {
            if (handlers.place(id)) this.hide();
          },
        },
        playClick,
      );
    }
    return null;
  }

  private change(avatar: AvatarConfig): void {
    this.applyAvatar(avatar);
    this.render();
  }
}

