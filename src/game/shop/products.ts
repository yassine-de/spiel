import { getItem } from '../avatar/avatarCatalog';
import type { ItemCategory } from '../avatar/avatarTypes';

export type ShopId = 'boutique' | 'rewe' | 'toystore';

/** Kategorien im Inventar (Spielkonzept Abschnitt 17). */
export type InventoryCategory = 'clothing' | 'shoes' | 'accessories' | 'food' | 'toys';

export const INVENTORY_CATEGORIES: { id: InventoryCategory; name: string }[] = [
  { id: 'clothing', name: 'Kleidung' },
  { id: 'shoes', name: 'Schuhe' },
  { id: 'accessories', name: 'Accessoires' },
  { id: 'food', name: 'Lebensmittel' },
  { id: 'toys', name: 'Spielzeug' },
];

/** Abteilungen im Supermarkt. */
export type MarketSection = 'produce' | 'cooler' | 'pantry';

export const MARKET_SECTIONS: { id: MarketSection; name: string }[] = [
  { id: 'produce', name: 'Obst & Gemüse' },
  { id: 'cooler', name: 'Kühlregal' },
  { id: 'pantry', name: 'Vorratsregal' },
];

export interface Product {
  /** Eindeutige ID; bei Kleidung identisch mit der ID des tragbaren Teils */
  id: string;
  name: string;
  price: number;
  category: InventoryCategory;
  shop: ShopId;
  description: string;
  /** Einzigartige Dinge kann man nur einmal besitzen (Kleidung, Spielzeug). */
  unique: boolean;
  section?: MarketSection;
  /** Kuscheltier (für die besondere Kauf-Nachricht) */
  plush?: boolean;
}

const CLOTHING_CATEGORY: Record<ItemCategory, InventoryCategory> = {
  tshirt: 'clothing',
  pullover: 'clothing',
  jacket: 'clothing',
  dress: 'clothing',
  skirt: 'clothing',
  pants: 'clothing',
  shoes: 'shoes',
  glasses: 'accessories',
  bow: 'accessories',
  headband: 'accessories',
  hat: 'accessories',
  bag: 'accessories',
};

/** Boutique-Artikel: [Kleidungs-ID, Preis, Beschreibung]. Der Name kommt aus dem Avatar-Katalog. */
const BOUTIQUE: [string, number, string][] = [
  ['dress-pink', 120, 'Ein rosa Kleid mit weißen Pünktchen – perfekt zum Drehen!'],
  ['dress-blue', 120, 'Ein himmelblaues Kleid, so luftig wie eine Sommerwolke.'],
  ['dress-sun', 110, 'Ein sonnengelbes Kleid mit kleinen Herzen.'],
  ['top-jacket-denim', 100, 'Eine coole Jeansjacke mit goldenen Knöpfen.'],
  ['top-jacket-pink', 100, 'Eine kuschelige rosa Jacke für kühle Tage.'],
  ['top-tshirt-stripes', 50, 'Ein fröhliches T-Shirt mit gelben Streifen.'],
  ['top-tshirt-sky', 45, 'Ein weiches T-Shirt in Himmelblau.'],
  ['top-pullover-rainbow', 90, 'Ein Pullover in allen Farben des Regenbogens.'],
  ['top-pullover-mint', 80, 'Ein mintgrüner Pulli mit einem Herz.'],
  ['bottom-skirt-tutu', 70, 'Ein Tüllrock zum Tanzen wie eine Ballerina.'],
  ['bottom-skirt-mint', 60, 'Ein mintgrüner Rock mit Wellen-Saum.'],
  ['bottom-pants-pink', 60, 'Eine bequeme rosa Hose.'],
  ['bottom-shorts-blue', 45, 'Kurze Hosen für warme Sommertage.'],
  ['shoes-sneakers-pink', 70, 'Rosa Turnschuhe zum Rennen und Hüpfen.'],
  ['shoes-boots-brown', 90, 'Warme Stiefel für Pfützen und Herbstlaub.'],
  ['shoes-ballerinas-red', 75, 'Rote Ballerinas mit kleiner Schleife.'],
  ['glasses-heart', 55, 'Eine Sonnenbrille mit Herz-Gläsern.'],
  ['bag-heart', 80, 'Eine Handtasche mit Herz – da passt alles Wichtige hinein.'],
  ['bag-star', 65, 'Ein kleines Täschchen mit einem Stern.'],
  ['headband-lilac', 30, 'Ein lila Haarband mit Herz.'],
  ['bow-mint', 30, 'Eine mintgrüne Schleife für die Haare.'],
  ['hat-sun', 65, 'Ein Sonnenhut mit rosa Band.'],
  ['hat-beanie', 50, 'Eine warme Mütze mit Bommel.'],
];

const REWE: [string, string, number, MarketSection, string][] = [
  ['food-apples', 'Äpfel', 4, 'produce', 'Knackige rote Äpfel.'],
  ['food-bananas', 'Bananen', 4, 'produce', 'Süße gelbe Bananen.'],
  ['food-strawberries', 'Erdbeeren', 6, 'produce', 'Saftige Erdbeeren – lecker!'],
  ['food-carrots', 'Karotten', 3, 'produce', 'Knackige Karotten.'],
  ['food-tomatoes', 'Tomaten', 3, 'produce', 'Rote Tomaten für den Salat.'],
  ['food-milk', 'Milch', 3, 'cooler', 'Frische Milch.'],
  ['food-cheese', 'Käse', 6, 'cooler', 'Ein Stück Käse mit Löchern.'],
  ['food-juice', 'Saft', 4, 'cooler', 'Orangensaft – frisch gepresst.'],
  ['food-yogurt', 'Joghurt', 3, 'cooler', 'Erdbeer-Joghurt.'],
  ['food-icecream', 'Eis', 5, 'cooler', 'Ein Eis mit drei Kugeln.'],
  ['food-pizza', 'Pizza', 8, 'cooler', 'Eine Pizza für den Ofen.'],
  ['food-bread', 'Brot', 4, 'pantry', 'Ein frisches Brot vom Bäcker.'],
  ['food-chocolate', 'Schokolade', 3, 'pantry', 'Eine Tafel Schokolade.'],
  ['food-cookies', 'Kekse', 4, 'pantry', 'Knusprige Kekse.'],
  ['food-water', 'Wasser', 2, 'pantry', 'Eine Flasche Wasser.'],
  ['food-pasta', 'Nudeln', 3, 'pantry', 'Nudeln für ein leckeres Essen.'],
];

const TOYS: [string, string, number, string, boolean][] = [
  ['toy-teddy', 'Teddybär', 80, 'Ein weicher Teddy mit blauer Schleife.', true],
  ['toy-unicorn', 'Einhorn', 120, 'Ein Einhorn mit Regenbogen-Mähne.', true],
  ['toy-bunny', 'Kuschelhase', 70, 'Ein Kuschelhase mit langen Ohren.', true],
  ['toy-doll', 'Puppe', 90, 'Eine Puppe mit rosa Kleid.', false],
  ['toy-car', 'Spielzeugauto', 60, 'Ein flitzeschnelles Spielzeugauto.', false],
  ['toy-puzzle', 'Puzzle', 40, 'Ein Puzzle mit 100 Teilen.', false],
  ['toy-ball', 'Ball', 30, 'Ein bunter Ball zum Spielen.', false],
  ['toy-robot', 'Roboter', 100, 'Ein freundlicher Roboter, der blinkt.', false],
  ['toy-blocks', 'Bauklötze', 50, 'Bunte Bauklötze für hohe Türme.', false],
  ['toy-kitchen', 'Spielzeugküche', 150, 'Eine kleine Küche zum Kochen spielen.', false],
];

export const PRODUCTS: Product[] = [
  ...BOUTIQUE.map(([id, price, description]): Product => {
    const item = getItem(id);
    if (!item) throw new Error(`Unbekanntes Kleidungsstück: ${id}`);
    return { id, name: item.name, price, category: CLOTHING_CATEGORY[item.category], shop: 'boutique', description, unique: true };
  }),
  ...REWE.map(([id, name, price, section, description]): Product => ({
    id,
    name,
    price,
    category: 'food',
    shop: 'rewe',
    section,
    description,
    unique: false,
  })),
  ...TOYS.map(([id, name, price, description, plush]): Product => ({
    id,
    name,
    price,
    category: 'toys',
    shop: 'toystore',
    description,
    unique: true,
    plush,
  })),
];

const PRODUCT_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id: string): Product | null {
  return PRODUCT_BY_ID.get(id) ?? null;
}

export function productsOf(shop: ShopId, section?: MarketSection): Product[] {
  return PRODUCTS.filter((p) => p.shop === shop && (!section || p.section === section));
}

/** Höchstmenge pro Lebensmittel im Inventar. */
export const MAX_STACK = 99;
