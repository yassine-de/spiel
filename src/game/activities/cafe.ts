/** Speisekarte und Kuchen-Werkstatt im Café. */

export interface MenuItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  /** Was Ben beim Servieren sagt */
  serve: string;
}

export const CAFE_MENU: MenuItem[] = [
  { id: 'cocoa', name: 'Kakao mit Sahne', emoji: '☕', price: 4, serve: 'Ein heißer Kakao mit extra Sahne!' },
  { id: 'shake', name: 'Erdbeer-Milchshake', emoji: '🥤', price: 5, serve: 'Ein rosa Erdbeer-Shake – mit Strohhalm!' },
  { id: 'juice', name: 'Apfelsaft', emoji: '🧃', price: 3, serve: 'Frischer Apfelsaft, schön kalt!' },
  { id: 'muffin', name: 'Schoko-Muffin', emoji: '🧁', price: 4, serve: 'Ein Schoko-Muffin, noch ganz warm!' },
  { id: 'pancakes', name: 'Pfannkuchen mit Beeren', emoji: '🥞', price: 6, serve: 'Pfannkuchen mit Beeren und Puderzucker!' },
  { id: 'icecream', name: 'Regenbogen-Eis', emoji: '🍨', price: 5, serve: 'Ein Regenbogen-Eis mit Streuseln!' },
];

export function getMenuItem(id: string): MenuItem | null {
  return CAFE_MENU.find((item) => item.id === id) ?? null;
}

/* ---------------- Kuchen verzieren ---------------- */

export interface CakeOption {
  id: string;
  name: string;
  color: string;
}

export const CAKE_BASES: CakeOption[] = [
  { id: 'vanilla', name: 'Vanille', color: '#fff1c4' },
  { id: 'chocolate', name: 'Schoko', color: '#8a5a3c' },
  { id: 'strawberry', name: 'Erdbeer', color: '#ffc2d6' },
];

export const CAKE_FROSTINGS: CakeOption[] = [
  { id: 'pink', name: 'Rosa', color: '#ff9cc8' },
  { id: 'white', name: 'Sahne', color: '#ffffff' },
  { id: 'chocolate', name: 'Schoko', color: '#6b4130' },
  { id: 'mint', name: 'Minze', color: '#9be0c1' },
  { id: 'lilac', name: 'Flieder', color: '#c9b6f0' },
];

export type CakeTopping = 'sprinkles' | 'strawberries' | 'candles' | 'hearts' | 'stars';

export const CAKE_TOPPINGS: { id: CakeTopping; name: string; emoji: string }[] = [
  { id: 'sprinkles', name: 'Streusel', emoji: '🌈' },
  { id: 'strawberries', name: 'Erdbeeren', emoji: '🍓' },
  { id: 'candles', name: 'Kerzen', emoji: '🕯️' },
  { id: 'hearts', name: 'Herzen', emoji: '💖' },
  { id: 'stars', name: 'Sterne', emoji: '⭐' },
];

export const MAX_TOPPINGS = 3;

export interface CakeDesign {
  base: string;
  frosting: string;
  toppings: CakeTopping[];
}

export const DEFAULT_CAKE: CakeDesign = { base: 'vanilla', frosting: 'pink', toppings: ['strawberries'] };

/** Schaltet eine Deko an/aus – höchstens MAX_TOPPINGS gleichzeitig (die älteste fällt weg). */
export function toggleTopping(design: CakeDesign, topping: CakeTopping): CakeDesign {
  if (design.toppings.includes(topping)) return { ...design, toppings: design.toppings.filter((t) => t !== topping) };
  const toppings = [...design.toppings, topping];
  return { ...design, toppings: toppings.slice(Math.max(0, toppings.length - MAX_TOPPINGS)) };
}

/** Lustiger Name für den fertigen Kuchen. */
export function cakeName(design: CakeDesign): string {
  const base = CAKE_BASES.find((b) => b.id === design.base)?.name ?? 'Vanille';
  const topping = design.toppings.length > 0 ? CAKE_TOPPINGS.find((t) => t.id === design.toppings[0])?.name : null;
  return topping ? `${base}-Kuchen mit ${topping}` : `${base}-Kuchen`;
}
