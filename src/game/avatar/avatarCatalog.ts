import type {
  AvatarConfig,
  BodyType,
  ColorOption,
  EyeShape,
  Expression,
  HairStyle,
  ItemCategory,
  MouthShape,
  NamedOption,
  WearableItem,
} from './avatarTypes';

/* ------------------------------------------------------------------ */
/* Körper und Gesicht                                                  */
/* ------------------------------------------------------------------ */

export const BODY_TYPES: NamedOption<BodyType>[] = [
  { id: 'girl', name: 'Mädchen' },
  { id: 'boy', name: 'Junge' },
];

export const SKIN_TONES: ColorOption[] = [
  { id: 'skin-1', name: 'Hell', color: '#ffe3d1' },
  { id: 'skin-2', name: 'Pfirsich', color: '#f7cfb0' },
  { id: 'skin-3', name: 'Honig', color: '#eab58e' },
  { id: 'skin-4', name: 'Karamell', color: '#d49a6c' },
  { id: 'skin-5', name: 'Zimt', color: '#ae7650' },
  { id: 'skin-6', name: 'Kakao', color: '#835437' },
  { id: 'skin-7', name: 'Schokolade', color: '#5f3b26' },
];

export const EYE_SHAPES: NamedOption<EyeShape>[] = [
  { id: 'round', name: 'Rund' },
  { id: 'sparkle', name: 'Glitzer' },
  { id: 'happy', name: 'Lachend' },
  { id: 'gentle', name: 'Sanft' },
];

export const EYE_COLORS: ColorOption[] = [
  { id: 'eyes-brown', name: 'Braun', color: '#6b4130' },
  { id: 'eyes-blue', name: 'Blau', color: '#3f7fd6' },
  { id: 'eyes-green', name: 'Grün', color: '#3e9a5c' },
  { id: 'eyes-hazel', name: 'Haselnuss', color: '#a8742f' },
  { id: 'eyes-gray', name: 'Grau', color: '#6f7a8c' },
  { id: 'eyes-violet', name: 'Violett', color: '#8a5ad6' },
];

export const MOUTHS: NamedOption<MouthShape>[] = [
  { id: 'smile', name: 'Lächeln' },
  { id: 'grin', name: 'Lachen' },
  { id: 'cat', name: 'Katzenmund' },
  { id: 'wow', name: 'Staunen' },
];

export const EXPRESSIONS: NamedOption<Expression>[] = [
  { id: 'happy', name: 'Fröhlich' },
  { id: 'excited', name: 'Aufgeregt' },
  { id: 'calm', name: 'Ruhig' },
  { id: 'brave', name: 'Mutig' },
];

/* ------------------------------------------------------------------ */
/* Haare                                                               */
/* ------------------------------------------------------------------ */

export const HAIR_STYLES: NamedOption<HairStyle>[] = [
  { id: 'long', name: 'Lange Haare' },
  { id: 'bob', name: 'Bob' },
  { id: 'pigtails', name: 'Zöpfe' },
  { id: 'ponytail', name: 'Pferdeschwanz' },
  { id: 'buns', name: 'Haarknoten' },
  { id: 'curly', name: 'Locken' },
  { id: 'short', name: 'Kurz' },
  { id: 'spiky', name: 'Strubbelig' },
];

export const HAIR_COLORS: ColorOption[] = [
  { id: 'hair-black', name: 'Schwarz', color: '#2f2530' },
  { id: 'hair-brown', name: 'Braun', color: '#6b4130' },
  { id: 'hair-blond', name: 'Blond', color: '#f0c96a' },
  { id: 'hair-red', name: 'Rot', color: '#c8532f' },
  { id: 'hair-pink', name: 'Rosa', color: '#ff9cc8' },
  { id: 'hair-purple', name: 'Lila', color: '#a487f0' },
  { id: 'hair-blackwhite', name: 'Schwarz-Weiß', color: '#26232b', color2: '#f4f1f4' },
];

/* ------------------------------------------------------------------ */
/* Kleidung und Accessoires                                            */
/* ------------------------------------------------------------------ */

export const ITEMS: WearableItem[] = [
  // T-Shirts
  { id: 'top-tshirt-heart', name: 'Herz-Shirt', category: 'tshirt', variant: 'tshirt', color: '#ff8fc2', pattern: 'heart' },
  { id: 'top-tshirt-star', name: 'Stern-Shirt', category: 'tshirt', variant: 'tshirt', color: '#8fdccf', pattern: 'star' },
  { id: 'top-tshirt-stripes', name: 'Streifen-Shirt', category: 'tshirt', variant: 'tshirt', color: '#ffd36e', pattern: 'stripes' },
  { id: 'top-tshirt-sky', name: 'Himmel-Shirt', category: 'tshirt', variant: 'tshirt', color: '#8fc4ff', pattern: 'none' },
  // Pullover
  { id: 'top-hoodie-split', name: 'Samyas Hoodie', category: 'pullover', variant: 'hoodie', color: '#f7b8cc', color2: '#2b2b33', pattern: 'none' },
  { id: 'top-pullover-lilac', name: 'Flieder-Pulli', category: 'pullover', variant: 'pullover', color: '#b9a2f5', pattern: 'none' },
  { id: 'top-pullover-rainbow', name: 'Regenbogen-Pulli', category: 'pullover', variant: 'pullover', color: '#ffc2dc', pattern: 'rainbow' },
  { id: 'top-pullover-mint', name: 'Mint-Pulli', category: 'pullover', variant: 'pullover', color: '#9be0c1', pattern: 'heart' },
  // Jacken
  { id: 'top-jacket-denim', name: 'Jeansjacke', category: 'jacket', variant: 'jacket', color: '#7f9ee0', pattern: 'none' },
  { id: 'top-jacket-pink', name: 'Rosa Jacke', category: 'jacket', variant: 'jacket', color: '#ff9cc8', pattern: 'none' },
  // Kleider
  { id: 'dress-pink', name: 'Rosa Kleid', category: 'dress', variant: 'dress', color: '#ff9cc8', pattern: 'dots' },
  { id: 'dress-blue', name: 'Blaues Kleid', category: 'dress', variant: 'dress', color: '#8fb8ff', pattern: 'none' },
  { id: 'dress-sun', name: 'Sonnenkleid', category: 'dress', variant: 'dress', color: '#ffd36e', pattern: 'heart' },
  // Röcke
  { id: 'bottom-skirt-lilac', name: 'Flieder-Rock', category: 'skirt', variant: 'skirt', color: '#a99bff' },
  { id: 'bottom-skirt-tutu', name: 'Tüllrock', category: 'skirt', variant: 'tutu', color: '#ffb3d5' },
  { id: 'bottom-skirt-mint', name: 'Mint-Rock', category: 'skirt', variant: 'skirt', color: '#8fdccf' },
  // Hosen
  { id: 'bottom-joggers-split', name: 'Samyas Jogginghose', category: 'pants', variant: 'joggers', color: '#f7b8cc', color2: '#2b2b33' },
  { id: 'bottom-pants-jeans', name: 'Jeans', category: 'pants', variant: 'pants', color: '#6f8fd8' },
  { id: 'bottom-pants-pink', name: 'Rosa Hose', category: 'pants', variant: 'pants', color: '#ff9cc8' },
  { id: 'bottom-shorts-blue', name: 'Shorts', category: 'pants', variant: 'shorts', color: '#7fa8e8' },
  // Schuhe
  { id: 'shoes-sneakers-chunky', name: 'Dicke Sneaker', category: 'shoes', variant: 'chunky', color: '#ffffff', color2: '#f7a8c4' },
  { id: 'shoes-sneakers-white', name: 'Weiße Turnschuhe', category: 'shoes', variant: 'sneakers', color: '#ffffff' },
  { id: 'shoes-sneakers-pink', name: 'Rosa Turnschuhe', category: 'shoes', variant: 'sneakers', color: '#ff8fc2' },
  { id: 'shoes-boots-brown', name: 'Stiefel', category: 'shoes', variant: 'boots', color: '#b98563' },
  { id: 'shoes-ballerinas-red', name: 'Ballerinas', category: 'shoes', variant: 'ballerinas', color: '#ff6f8f' },
  // Brillen
  { id: 'glasses-round', name: 'Runde Brille', category: 'glasses', variant: 'round', color: '#8a5a3c' },
  { id: 'glasses-heart', name: 'Herz-Sonnenbrille', category: 'glasses', variant: 'heart', color: '#ff5fa2' },
  // Schleifen und Haarbänder
  { id: 'bow-pink', name: 'Rosa Schleife', category: 'bow', variant: 'bow', color: '#ff5fa2' },
  { id: 'bow-mint', name: 'Mint-Schleife', category: 'bow', variant: 'bow', color: '#5fcfb0' },
  { id: 'headband-pink', name: 'Rosa Haarband', category: 'headband', variant: 'headband', color: '#ff7eb6' },
  { id: 'headband-lilac', name: 'Lila Haarband', category: 'headband', variant: 'headband', color: '#a487f0' },
  // Hüte
  { id: 'hat-sun', name: 'Sonnenhut', category: 'hat', variant: 'sunhat', color: '#f6d58e' },
  { id: 'hat-cap', name: 'Basecap', category: 'hat', variant: 'cap', color: '#7fa8e8' },
  { id: 'hat-beanie', name: 'Mütze', category: 'hat', variant: 'beanie', color: '#ff8fc2' },
  // Taschen
  { id: 'bag-heart', name: 'Herz-Handtasche', category: 'bag', variant: 'heart', color: '#ff7eb6' },
  { id: 'bag-star', name: 'Stern-Täschchen', category: 'bag', variant: 'star', color: '#ffd36e' },
];

/**
 * Grundausstattung: steht im Avatar-Editor immer zur Verfügung.
 * Alle anderen Kleidungsstücke gibt es in Samya's Boutique.
 */
export const BASE_ITEM_IDS: ReadonlySet<string> = new Set([
  'top-hoodie-split',
  'bottom-joggers-split',
  'shoes-sneakers-chunky',
  'top-tshirt-heart',
  'top-tshirt-star',
  'top-pullover-lilac',
  'bottom-skirt-lilac',
  'bottom-pants-jeans',
  'shoes-sneakers-white',
  'glasses-round',
  'bow-pink',
  'headband-pink',
  'hat-cap',
]);

/** Darf dieses Teil getragen werden? (Grundausstattung oder gekauft) */
export type Ownership = (itemId: string) => boolean;
export const baseItemsOnly: Ownership = () => false;

export function isAvailable(itemId: string | null, owns: Ownership): boolean {
  return itemId === null || BASE_ITEM_IDS.has(itemId) || owns(itemId);
}

const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

export function getItem(id: string | null | undefined): WearableItem | null {
  return id ? (ITEM_BY_ID.get(id) ?? null) : null;
}

export function itemsInCategories(categories: readonly ItemCategory[]): WearableItem[] {
  return ITEMS.filter((item) => categories.includes(item.category));
}

/** Welche Kategorien in welchen Avatar-Platz gehören. */
export const SLOT_CATEGORIES = {
  top: ['tshirt', 'pullover', 'jacket', 'dress'],
  bottom: ['skirt', 'pants'],
  shoes: ['shoes'],
  glasses: ['glasses'],
  hairAccessory: ['bow', 'headband'],
  hat: ['hat'],
  bag: ['bag'],
} as const satisfies Record<string, readonly ItemCategory[]>;

export type ItemSlot = keyof typeof SLOT_CATEGORIES;

/* ------------------------------------------------------------------ */
/* Voreinstellungen                                                    */
/* ------------------------------------------------------------------ */

export const BODY_PRESETS: Record<BodyType, Pick<AvatarConfig, 'hairStyle' | 'top' | 'bottom' | 'shoes' | 'hairAccessory' | 'hat'>> = {
  // Samyas Look: Hoodie und Jogginghose in Rosa/Schwarz, dicke Sneaker
  girl: {
    hairStyle: 'long',
    top: 'top-hoodie-split',
    bottom: 'bottom-joggers-split',
    shoes: 'shoes-sneakers-chunky',
    hairAccessory: null,
    hat: null,
  },
  boy: {
    hairStyle: 'short',
    top: 'top-tshirt-star',
    bottom: 'bottom-pants-jeans',
    shoes: 'shoes-sneakers-white',
    hairAccessory: null,
    hat: null,
  },
};

export const DEFAULT_AVATAR: Readonly<AvatarConfig> = Object.freeze({
  body: 'girl',
  skin: 'skin-1',
  eyeShape: 'round',
  eyeColor: 'eyes-brown',
  mouth: 'smile',
  expression: 'happy',
  hairColor: 'hair-blackwhite',
  glasses: null,
  bag: null,
  ...BODY_PRESETS.girl,
});

/* ------------------------------------------------------------------ */
/* Prüfung gespeicherter Daten                                         */
/* ------------------------------------------------------------------ */

function oneOf<T extends string>(value: unknown, options: readonly { id: T }[], fallback: T): T {
  return options.some((o) => o.id === value) ? (value as T) : fallback;
}

function slotItem(value: unknown, slot: ItemSlot, fallback: string): string {
  const item = getItem(typeof value === 'string' ? value : null);
  return item && (SLOT_CATEGORIES[slot] as readonly ItemCategory[]).includes(item.category) ? item.id : fallback;
}

/** Fehlendes Feld → Standard; ausdrücklich `null` → „ohne“; ungültig → „ohne“. */
function optionalSlotItem(value: unknown, slot: ItemSlot, fallback: string | null): string | null {
  if (value === undefined) return fallback;
  if (value === null) return null;
  const id = slotItem(value, slot, '');
  return id === '' ? null : id;
}

/**
 * Macht aus beliebigen (evtl. alten oder kaputten) Daten eine gültige Avatar-Konfiguration.
 * Ungültige Felder fallen einzeln auf den Standard zurück.
 */
export function sanitizeAvatar(raw: unknown): AvatarConfig {
  const d = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const D = DEFAULT_AVATAR;
  const avatar: AvatarConfig = {
    body: oneOf(d.body, BODY_TYPES, D.body),
    skin: oneOf(d.skin, SKIN_TONES, D.skin),
    eyeShape: oneOf(d.eyeShape, EYE_SHAPES, D.eyeShape),
    eyeColor: oneOf(d.eyeColor, EYE_COLORS, D.eyeColor),
    mouth: oneOf(d.mouth, MOUTHS, D.mouth),
    expression: oneOf(d.expression, EXPRESSIONS, D.expression),
    hairStyle: oneOf(d.hairStyle, HAIR_STYLES, D.hairStyle),
    hairColor: oneOf(d.hairColor, HAIR_COLORS, D.hairColor),
    top: slotItem(d.top, 'top', D.top),
    bottom: slotItem(d.bottom, 'bottom', D.bottom),
    shoes: slotItem(d.shoes, 'shoes', D.shoes),
    glasses: optionalSlotItem(d.glasses, 'glasses', D.glasses),
    hairAccessory: optionalSlotItem(d.hairAccessory, 'hairAccessory', D.hairAccessory),
    hat: optionalSlotItem(d.hat, 'hat', D.hat),
    bag: optionalSlotItem(d.bag, 'bag', D.bag),
  };
  // Hut und Haarschmuck schließen sich aus
  if (avatar.hat && avatar.hairAccessory) avatar.hairAccessory = null;
  return avatar;
}

/**
 * Wendet eine Auswahl im Editor an und hält die Kombination stimmig:
 * - Wechsel Mädchen/Junge setzt passende Frisur und Kleidung (Farben bleiben).
 * - Hut und Haarschmuck schließen sich gegenseitig aus.
 * - Wer zum Kleid ein Unterteil wählt, bekommt wieder ein T-Shirt.
 */
export function applyChoice<K extends keyof AvatarConfig>(avatar: AvatarConfig, key: K, value: AvatarConfig[K]): AvatarConfig {
  let next: AvatarConfig = { ...avatar, [key]: value };
  if (key === 'body' && value !== avatar.body) {
    next = { ...next, ...BODY_PRESETS[value as BodyType] };
  }
  if (key === 'hat' && value) next.hairAccessory = null;
  if (key === 'hairAccessory' && value) next.hat = null;
  if (key === 'bottom' && getItem(avatar.top)?.category === 'dress') {
    next.top = BODY_PRESETS[avatar.body].top;
  }
  return sanitizeAvatar(next);
}

/**
 * Ersetzt Kleidung, die (noch) nicht gekauft wurde, durch die Grundausstattung.
 * Schützt davor, Boutique-Artikel ohne Kauf zu tragen.
 */
export function enforceOwnership(avatar: AvatarConfig, owns: Ownership): AvatarConfig {
  const next = { ...avatar };
  const preset = BODY_PRESETS[avatar.body];
  if (!isAvailable(next.top, owns)) next.top = preset.top;
  if (!isAvailable(next.bottom, owns)) next.bottom = preset.bottom;
  if (!isAvailable(next.shoes, owns)) next.shoes = preset.shoes;
  for (const slot of ['glasses', 'hairAccessory', 'hat', 'bag'] as const) {
    if (!isAvailable(next[slot], owns)) next[slot] = null;
  }
  return next;
}

/** Zufälliger Avatar für den „Überrasch mich!“-Button (nur verfügbare Kleidung). */
export function randomAvatar(random: () => number = Math.random, owns: Ownership = baseItemsOnly): AvatarConfig {
  const pick = <T>(list: readonly T[]): T => list[Math.floor(random() * list.length)];
  const pickId = (slot: ItemSlot) =>
    pick(itemsInCategories(SLOT_CATEGORIES[slot]).filter((item) => isAvailable(item.id, owns))).id;
  const maybe = (slot: ItemSlot, chance: number) => (random() < chance ? pickId(slot) : null);
  const hat = maybe('hat', 0.25);
  return sanitizeAvatar({
    body: pick(BODY_TYPES).id,
    skin: pick(SKIN_TONES).id,
    eyeShape: pick(EYE_SHAPES).id,
    eyeColor: pick(EYE_COLORS).id,
    mouth: pick(MOUTHS).id,
    expression: pick(EXPRESSIONS).id,
    hairStyle: pick(HAIR_STYLES).id,
    hairColor: pick(HAIR_COLORS).id,
    top: pickId('top'),
    bottom: pickId('bottom'),
    shoes: pickId('shoes'),
    glasses: maybe('glasses', 0.25),
    hat,
    hairAccessory: hat ? null : maybe('hairAccessory', 0.5),
    bag: itemsInCategories(['bag']).some((item) => owns(item.id)) ? maybe('bag', 0.4) : null,
  });
}

export function colorOf(options: ColorOption[], id: string): string {
  return (options.find((o) => o.id === id) ?? options[0]).color;
}
