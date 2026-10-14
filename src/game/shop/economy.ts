import { MAX_STACK, getProduct } from './products';

/** Inventar: Produkt-ID → Menge. */
export type Inventory = Readonly<Record<string, number>>;

export interface CartLine {
  productId: string;
  quantity: number;
}

export type PurchaseFailure = 'empty' | 'unknown-product' | 'invalid-quantity' | 'already-owned' | 'too-many' | 'not-enough-coins';

export type PurchaseResult =
  | { ok: true; total: number; coins: number; inventory: Record<string, number> }
  | { ok: false; reason: PurchaseFailure; total: number };

/** Fasst gleiche Produkte zusammen und entfernt leere Zeilen. */
export function normalizeCart(lines: readonly CartLine[]): CartLine[] {
  const merged = new Map<string, number>();
  for (const line of lines) merged.set(line.productId, (merged.get(line.productId) ?? 0) + line.quantity);
  return [...merged].filter(([, q]) => q !== 0).map(([productId, quantity]) => ({ productId, quantity }));
}

export function cartTotal(lines: readonly CartLine[]): number {
  return normalizeCart(lines).reduce((sum, line) => sum + (getProduct(line.productId)?.price ?? 0) * Math.max(0, line.quantity), 0);
}

/**
 * Prüft einen Einkauf vollständig und rechnet ihn ab – alles oder nichts.
 * Münzen werden nie negativ, einzigartige Dinge kann man nicht doppelt kaufen.
 */
export function checkout(lines: readonly CartLine[], coins: number, inventory: Inventory): PurchaseResult {
  const cart = normalizeCart(lines);
  const total = cartTotal(cart);
  if (cart.length === 0) return { ok: false, reason: 'empty', total };
  const next: Record<string, number> = { ...inventory };
  for (const line of cart) {
    const product = getProduct(line.productId);
    if (!product) return { ok: false, reason: 'unknown-product', total };
    if (!Number.isInteger(line.quantity) || line.quantity < 1) return { ok: false, reason: 'invalid-quantity', total };
    const owned = next[product.id] ?? 0;
    if (product.unique && (owned > 0 || line.quantity > 1)) return { ok: false, reason: 'already-owned', total };
    if (owned + line.quantity > MAX_STACK) return { ok: false, reason: 'too-many', total };
    next[product.id] = owned + line.quantity;
  }
  if (!Number.isFinite(coins) || total > coins) return { ok: false, reason: 'not-enough-coins', total };
  return { ok: true, total, coins: coins - total, inventory: next };
}

/** Warenkorb für einen Ladenbesuch (wird nicht gespeichert). */
export class ShoppingCart {
  private readonly lines = new Map<string, number>();

  add(productId: string, maxQuantity = 9): void {
    this.lines.set(productId, Math.min(maxQuantity, (this.lines.get(productId) ?? 0) + 1));
  }

  remove(productId: string): void {
    const quantity = (this.lines.get(productId) ?? 0) - 1;
    if (quantity > 0) this.lines.set(productId, quantity);
    else this.lines.delete(productId);
  }

  quantityOf(productId: string): number {
    return this.lines.get(productId) ?? 0;
  }

  get items(): CartLine[] {
    return [...this.lines].map(([productId, quantity]) => ({ productId, quantity }));
  }

  get count(): number {
    return [...this.lines.values()].reduce((sum, q) => sum + q, 0);
  }

  get total(): number {
    return cartTotal(this.items);
  }

  clear(): void {
    this.lines.clear();
  }
}
