import type { AvatarConfig } from '../avatar/avatarTypes';
import { drawAvatarThumbnail } from '../assets/placeholders/avatar/avatarPainter';
import { audio, input, playClick, saves, tasks } from '../services';
import { type ShoppingCart, cartTotal } from '../shop/economy';
import { MARKET_SECTIONS, type MarketSection, type Product, type ShopId, getProduct, productsOf } from '../shop/products';
import { button, formatCoins, h } from './dom';
import { COIN_SVG, Icons } from './icons';
import { productImage, slotOf, wearing } from './productImage';

export interface ShopOpenOptions {
  shop: ShopId;
  /** Abteilung im Supermarkt */
  section?: MarketSection;
  /** An der Kasse: Bezahlen ist möglich */
  checkout?: boolean;
  /** Warenkorb dieses Ladenbesuchs (Supermarkt) */
  cart?: ShoppingCart;
}

export interface ShopServices {
  /** Avatar dauerhaft ändern (speichern + Spielfigur neu zeichnen) */
  applyAvatar: (avatar: AvatarConfig) => void;
  /** Münzanzeige im HUD aktualisieren */
  refreshCoins: () => void;
  /** Kurze Meldung oben anzeigen */
  toast: (message: string, durationMs?: number) => void;
}

const TITLES: Record<ShopId, string> = {
  boutique: "Samya's Boutique",
  rewe: 'REWE',
  toystore: 'Spielzeugladen',
};

const NOT_ENOUGH = (name: string) => `Oh ${name}, dafür fehlen dir noch ein paar Münzen! 💕`;

function price(value: number): HTMLElement {
  return h('span', { class: 'price' }, h('span', { class: 'price-coin', html: COIN_SVG }), h('span', { text: formatCoins(value) }));
}

/**
 * Ladenfenster für Boutique, Supermarkt und Spielzeugladen.
 * Anprobieren ist nur vorübergehend – erst „Kaufen“ macht ein Teil dauerhaft zu Samyas.
 */
export class ShopPanel {
  readonly el: HTMLElement;
  private readonly title: HTMLElement;
  private readonly coins: HTMLElement;
  private readonly side: HTMLElement;
  private readonly tabs: HTMLElement;
  private readonly grid: HTMLElement;
  private options: ShopOpenOptions = { shop: 'boutique' };
  private selected: string | null = null;
  /** Anprobierter Look (nur Vorschau) */
  private tryOn: AvatarConfig | null = null;
  private visible = false;
  private onClose: (() => void) | null = null;

  constructor(
    parent: HTMLElement,
    private readonly services: ShopServices,
  ) {
    this.title = h('h2', { class: 'shop-title' });
    this.coins = h('span', { class: 'shop-coins' });
    this.side = h('section', { class: 'shop-side' });
    this.tabs = h('div', { class: 'shop-tabs', attrs: { role: 'tablist' } });
    this.grid = h('div', { class: 'shop-grid' });
    this.el = h(
      'div',
      { class: 'shop-panel', attrs: { hidden: '', role: 'dialog' } },
      h(
        'div',
        { class: 'shop-card' },
        h(
          'header',
          { class: 'shop-header' },
          this.title,
          h('div', { class: 'shop-header-right' }, this.coins, button({ label: 'Schließen', icon: Icons.close, variant: 'icon', onPress: () => this.close() })),
        ),
        h('div', { class: 'shop-body' }, this.side, h('section', { class: 'shop-main' }, this.tabs, this.grid)),
      ),
    );
    parent.append(this.el);
  }

  get isOpen(): boolean {
    return this.visible;
  }

  open(options: ShopOpenOptions, onClose?: () => void): void {
    this.options = options;
    this.onClose = onClose ?? null;
    this.tryOn = null;
    this.selected = null;
    this.title.textContent = TITLES[options.shop];
    this.el.dataset.shop = options.shop;
    this.visible = true;
    this.el.hidden = false;
    input.block('shop');
    audio.play('open');
    this.render();
  }

  close(): void {
    if (!this.visible) return;
    this.visible = false;
    this.el.hidden = true;
    // Anprobieren war nur vorübergehend
    this.tryOn = null;
    input.unblock('shop');
    audio.play('close');
    this.onClose?.();
  }

  /* ---------------- Darstellung ---------------- */

  private render(): void {
    this.coins.replaceChildren(price(saves.coins));
    this.renderTabs();
    this.renderGrid();
    this.renderSide();
  }

  private products(): Product[] {
    return productsOf(this.options.shop, this.options.shop === 'rewe' ? this.options.section ?? 'produce' : undefined);
  }

  private renderTabs(): void {
    if (this.options.shop !== 'rewe') {
      this.tabs.replaceChildren();
      this.tabs.hidden = true;
      return;
    }
    this.tabs.hidden = false;
    const current = this.options.section ?? 'produce';
    this.tabs.replaceChildren(
      ...MARKET_SECTIONS.map((section) => {
        const el = h('button', {
          class: `shop-tab${section.id === current ? ' is-active' : ''}`,
          text: section.name,
          attrs: { type: 'button', role: 'tab', 'aria-selected': String(section.id === current) },
        });
        el.addEventListener('click', () => {
          playClick();
          this.options = { ...this.options, section: section.id };
          this.renderTabs();
          this.renderGrid();
        });
        return el;
      }),
    );
  }

  private renderGrid(): void {
    const avatar = this.tryOn ?? saves.avatar;
    const cart = this.options.cart;
    this.grid.replaceChildren(
      ...this.products().map((product) => {
        const owned = product.unique && saves.owns(product.id);
        const inCart = cart?.quantityOf(product.id) ?? 0;
        const card = h(
          'button',
          {
            class: `product-card${this.selected === product.id ? ' is-selected' : ''}${owned ? ' is-owned' : ''}`,
            attrs: { type: 'button', 'aria-label': `${product.name}, ${product.price} Münzen${owned ? ', gekauft' : ''}` },
          },
          productImage(product.id, avatar),
          h('span', { class: 'product-name', text: product.name }),
          owned ? h('span', { class: 'product-owned', text: '✓ Gekauft' }) : price(product.price),
          inCart > 0 ? h('span', { class: 'product-badge', text: `${inCart}×` }) : null,
        );
        card.addEventListener('click', () => this.onProduct(product));
        return card;
      }),
    );
  }

  private renderSide(): void {
    if (this.options.shop === 'rewe') this.renderCart();
    else this.renderDetail();
  }

  /** Boutique und Spielzeugladen: Spiegel bzw. großes Bild + Details + Kaufen. */
  private renderDetail(): void {
    const isBoutique = this.options.shop === 'boutique';
    const product = this.selected ? getProduct(this.selected) : null;
    const parts: (HTMLElement | null)[] = [];

    if (isBoutique) {
      const mirror = h('canvas', { class: 'shop-mirror', attrs: { width: '288', height: '448', 'aria-label': 'Spiegel' } });
      drawAvatarThumbnail(mirror, this.tryOn ?? saves.avatar, 'full');
      parts.push(h('div', { class: 'shop-mirror-frame' }, mirror));
    } else if (product) {
      parts.push(productImage(product.id, saves.avatar, 'shop-hero'));
    }

    if (!product) {
      parts.push(
        h('p', {
          class: 'shop-hint',
          text: isBoutique ? 'Tippe auf ein Kleidungsstück – dann kannst du es anprobieren! 👗' : 'Tippe auf ein Spielzeug, um es dir anzusehen! 🧸',
        }),
      );
      this.side.replaceChildren(...parts.filter((p): p is HTMLElement => p !== null));
      return;
    }

    parts.push(
      h('div', { class: 'shop-detail' }, h('h3', { class: 'shop-detail-name', text: product.name }), price(product.price)),
      h('p', { class: 'shop-detail-text', text: product.description }),
    );

    const actions = h('div', { class: 'shop-actions' });
    const owned = saves.owns(product.id);
    if (isBoutique) {
      const triedOn = this.tryOn !== null && this.isWornIn(this.tryOn, product.id);
      if (!owned) {
        actions.append(
          triedOn
            ? button({ label: 'Ausziehen', variant: 'secondary', onPress: () => this.resetTryOn() }, playClick)
            : button({ label: 'Anprobieren', icon: Icons.sparkle, variant: 'secondary', onPress: () => this.tryOnProduct(product) }, playClick),
        );
      }
    }
    if (owned) {
      const worn = isBoutique && this.isWornIn(saves.avatar, product.id);
      if (isBoutique && !worn) {
        actions.append(button({ label: 'Anziehen', icon: Icons.shirt, onPress: () => this.wear(product.id) }, playClick));
      } else {
        actions.append(h('span', { class: 'shop-owned-note', text: worn ? 'Trägst du gerade ✓' : 'Schon in deinem Inventar ✓' }));
      }
    } else {
      actions.append(button({ label: `Kaufen`, icon: Icons.bag, onPress: () => this.buy(product) }));
    }
    parts.push(actions);
    this.side.replaceChildren(...parts.filter((p): p is HTMLElement => p !== null));
  }

  /** Supermarkt: Warenkorb mit Mengen, Summe und – an der Kasse – Bezahlen. */
  private renderCart(): void {
    const cart = this.options.cart;
    if (!cart) return;
    const lines = cart.items;
    const rows = lines.map((line) => {
      const product = getProduct(line.productId)!;
      const minus = button({ label: `${product.name}: eins weniger`, icon: Icons.minus, variant: 'icon', onPress: () => this.changeCart(product.id, -1) }, playClick);
      const plus = button({ label: `${product.name}: eins mehr`, icon: Icons.plus, variant: 'icon', onPress: () => this.changeCart(product.id, 1) }, playClick);
      return h(
        'li',
        { class: 'cart-row' },
        productImage(product.id, saves.avatar, 'cart-image'),
        h('span', { class: 'cart-name', text: product.name }),
        h('span', { class: 'cart-qty' }, minus, h('span', { class: 'cart-count', text: String(line.quantity) }), plus),
        price(product.price * line.quantity),
      );
    });
    const total = cartTotal(lines);
    const footer = h('div', { class: 'cart-footer' }, h('span', { class: 'cart-total-label', text: 'Zusammen' }), price(total));
    let action: HTMLElement;
    if (lines.length === 0) {
      action = h('p', { class: 'shop-hint', text: 'Tippe auf ein Produkt, um es in den Warenkorb zu legen 🛒' });
    } else if (this.options.checkout) {
      action = button({ label: 'Bezahlen', icon: Icons.cart, onPress: () => this.payCart() });
    } else {
      action = h('p', { class: 'shop-hint', text: 'Bezahlen kannst du vorne an der Kasse 🛒' });
    }
    this.side.replaceChildren(
      h('h3', { class: 'cart-title' }, h('span', { class: 'btn-glyph', html: Icons.cart }), h('span', { text: this.options.checkout ? 'Kasse' : 'Warenkorb' })),
      lines.length > 0 ? h('ul', { class: 'cart-list' }, ...rows) : h('div', { class: 'cart-empty' }),
      footer,
      action,
    );
  }

  /* ---------------- Aktionen ---------------- */

  private onProduct(product: Product): void {
    if (this.options.shop === 'rewe') {
      this.changeCart(product.id, 1);
      return;
    }
    playClick();
    this.selected = product.id;
    this.renderGrid();
    this.renderSide();
  }

  private changeCart(productId: string, delta: number): void {
    const cart = this.options.cart;
    if (!cart) return;
    if (delta > 0) {
      cart.add(productId);
      audio.play('add');
    } else {
      cart.remove(productId);
    }
    this.renderGrid();
    this.renderCart();
  }

  private isWornIn(avatar: AvatarConfig, itemId: string): boolean {
    const slot = slotOf(itemId);
    return slot !== null && avatar[slot] === itemId;
  }

  private tryOnProduct(product: Product): void {
    this.tryOn = wearing(this.tryOn ?? saves.avatar, product.id);
    tasks.report('try-on');
    this.renderSide();
  }

  private resetTryOn(): void {
    this.tryOn = null;
    this.renderSide();
  }

  private wear(itemId: string): void {
    this.services.applyAvatar(wearing(saves.avatar, itemId));
    this.tryOn = null;
    this.renderGrid();
    this.renderSide();
  }

  private buy(product: Product): void {
    const name = saves.playerName;
    const result = saves.purchase([{ productId: product.id, quantity: 1 }]);
    if (!result.ok) {
      this.failed(result.reason);
      return;
    }
    audio.play('purchase');
    this.services.refreshCoins();
    if (this.options.shop === 'boutique') {
      // Was angeprobiert war, zieht Samya gleich an.
      if (this.tryOn && this.isWornIn(this.tryOn, product.id)) this.wear(product.id);
      this.services.toast(`Wow, ${name}! Das steht dir fantastisch! 💖`);
    } else if (product.plush && Math.random() < 0.5) {
      this.services.toast(`${name}, dein neuer Kuschelfreund wartet auf dich! 🧸`);
    } else {
      this.services.toast(`Juhu! ${product.name} gehört jetzt dir! 🎉`);
    }
    this.render();
  }

  private payCart(): void {
    const cart = this.options.cart;
    if (!cart) return;
    const result = saves.purchase(cart.items);
    if (!result.ok) {
      this.failed(result.reason);
      return;
    }
    cart.clear();
    audio.play('purchase');
    this.services.refreshCoins();
    this.services.toast(`Super gemacht, ${saves.playerName}! Dein Einkauf ist fertig! 🛍️`);
    this.render();
  }

  private failed(reason: string): void {
    audio.play('oops');
    if (reason === 'not-enough-coins') this.services.toast(NOT_ENOUGH(saves.playerName));
    else if (reason === 'already-owned') this.services.toast('Das hast du schon! ✓');
    else if (reason === 'too-many') this.services.toast('So viel passt nicht in deine Tasche! 😊');
    this.render();
  }
}
