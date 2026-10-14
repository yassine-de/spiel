import { applyChoice, getItem, SLOT_CATEGORIES, type ItemSlot } from '../avatar/avatarCatalog';
import type { AvatarConfig, ItemCategory } from '../avatar/avatarTypes';
import { drawAvatarThumbnail, type ThumbRegion } from '../assets/placeholders/avatar/avatarPainter';
import { drawItemIcon } from '../assets/placeholders/itemIconPainter';
import { h } from './dom';

/** In welchen Avatar-Platz gehört ein Kleidungsstück? */
export function slotOf(itemId: string): ItemSlot | null {
  const item = getItem(itemId);
  if (!item) return null;
  for (const [slot, categories] of Object.entries(SLOT_CATEGORIES) as [ItemSlot, readonly ItemCategory[]][]) {
    if (categories.includes(item.category)) return slot;
  }
  return null;
}

const REGION_BY_SLOT: Record<ItemSlot, ThumbRegion> = {
  top: 'body',
  bottom: 'legs',
  shoes: 'feet',
  glasses: 'head',
  hairAccessory: 'head',
  hat: 'head',
  bag: 'body',
};

/** Der Avatar mit diesem Kleidungsstück (für Vorschau und Anprobieren). */
export function wearing(avatar: AvatarConfig, itemId: string): AvatarConfig {
  const slot = slotOf(itemId);
  return slot ? applyChoice(avatar, slot, itemId as never) : avatar;
}

const PIXELS = Math.min(2, Math.max(1, Math.round(window.devicePixelRatio || 1))) * 80;

/**
 * Produktbild: Kleidung wird direkt an Samyas Avatar gezeigt,
 * Lebensmittel und Spielzeug als eigenes Bild.
 */
export function productImage(productId: string, avatar: AvatarConfig, className = 'product-image'): HTMLCanvasElement {
  const canvas = h('canvas', { class: className, attrs: { width: String(PIXELS), height: String(PIXELS), 'aria-hidden': 'true' } });
  const slot = slotOf(productId);
  if (slot) {
    drawAvatarThumbnail(canvas, wearing(avatar, productId), REGION_BY_SLOT[slot]);
  } else {
    drawItemIcon(canvas, productId);
  }
  return canvas;
}
