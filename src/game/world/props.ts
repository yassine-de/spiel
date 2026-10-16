import { TextureKeys, type TextureKey } from '../assets/assetKeys';
import type { Rect } from '../types';
import { BUILDINGS, type BuildingId, type LabelSlot, buildingOriginY } from './buildings';

const STATIC_PROPS = {
  // Natur und Stadtmobiliar
  treeGreen: { texture: TextureKeys.TreeGreen, originY: 318 / 336, footprint: { w: 30, h: 18 }, ambient: 'sway' },
  treePink: { texture: TextureKeys.TreePink, originY: 318 / 336, footprint: { w: 30, h: 18 }, ambient: 'sway' },
  bush: { texture: TextureKeys.Bush, originY: 116 / 132, footprint: { w: 76, h: 24 } },
  flowersPink: { texture: TextureKeys.FlowersPink, originY: 80 / 96 },
  flowersLilac: { texture: TextureKeys.FlowersLilac, originY: 80 / 96 },
  lamp: { texture: TextureKeys.Lamp, originY: 306 / 320, footprint: { w: 18, h: 12 } },
  bench: { texture: TextureKeys.Bench, originY: 138 / 156, footprint: { w: 108, h: 26 } },
  fountain: { texture: TextureKeys.Fountain, originY: 330 / 340, footprint: { w: 190, h: 72 }, ambient: 'sparkle' },
  sign: {
    texture: TextureKeys.Sign,
    originY: 228 / 240,
    footprint: { w: 110, h: 12 },
    scale: 1.55,
    labels: [{ text: '', offsetY: -72, maxWidth: 126, fontSize: 24, color: '#a2457a' }],
  },
  pond: { texture: TextureKeys.Pond, originY: 158 / 170, footprint: { w: 250, h: 96 }, ambient: 'shine' },
  playground: { texture: TextureKeys.Playground, originY: 176 / 190, footprint: { w: 236, h: 56 } },
  fence: { texture: TextureKeys.Fence, originY: 50 / 56, footprint: { w: 130, h: 12 } },
  hedge: { texture: TextureKeys.Hedge, originY: 62 / 70, footprint: { w: 190, h: 30 } },
  mailbox: { texture: TextureKeys.Mailbox, originY: 72 / 76, footprint: { w: 16, h: 10 } },
  cafeTable: { texture: TextureKeys.CafeTable, originY: 120 / 130, footprint: { w: 96, h: 22 } },
  carts: { texture: TextureKeys.Carts, originY: 72 / 80, footprint: { w: 116, h: 24 } },
  flagpole: { texture: TextureKeys.Flagpole, originY: 196 / 200, footprint: { w: 14, h: 10 }, ambient: 'flag' },
  flowerBed: { texture: TextureKeys.FlowerBed, originY: 56 / 64, footprint: { w: 124, h: 24 } },
  // Innenräume: Wanddekoration (Ursprung oben)
  wallWindow: { texture: TextureKeys.WallWindow, originY: 0, layer: 'wall' },
  boardRewe: {
    texture: TextureKeys.BoardRewe,
    originY: 0,
    layer: 'wall',
    labels: [{ text: 'REWE', offsetY: 40, maxWidth: 280, fontSize: 44, color: '#ffffff' }],
  },
  boardBoutique: {
    texture: TextureKeys.BoardBoutique,
    originY: 0,
    layer: 'wall',
    labels: [{ text: "Samya's Boutique", offsetY: 35, maxWidth: 400, fontSize: 30, color: '#d9558f' }],
  },
  boardPoster: {
    texture: TextureKeys.BoardPoster,
    originY: 0,
    layer: 'wall',
    labels: [{ text: '', offsetY: 38, maxWidth: 360, fontSize: 28, color: '#d9558f' }],
  },
  // Innenräume: Möbel
  shelfGroceries: { texture: TextureKeys.ShelfGroceries, originY: 152 / 160, footprint: { w: 160, h: 40 } },
  shelfToys: { texture: TextureKeys.ShelfToys, originY: 152 / 160, footprint: { w: 160, h: 40 } },
  shelfBooks: { texture: TextureKeys.ShelfBooks, originY: 152 / 160, footprint: { w: 160, h: 40 } },
  cooler: { texture: TextureKeys.Cooler, originY: 162 / 170, footprint: { w: 150, h: 40 } },
  fruitStand: { texture: TextureKeys.FruitStand, originY: 92 / 100, footprint: { w: 160, h: 40 } },
  counter: { texture: TextureKeys.Counter, originY: 112 / 120, footprint: { w: 210, h: 50 } },
  clothesRack: { texture: TextureKeys.ClothesRack, originY: 152 / 160, footprint: { w: 150, h: 30 } },
  displayTable: { texture: TextureKeys.DisplayTable, originY: 84 / 90, footprint: { w: 150, h: 36 } },
  mirror: { texture: TextureKeys.Mirror, originY: 152 / 160, footprint: { w: 50, h: 16 } },
  plant: { texture: TextureKeys.Plant, originY: 104 / 110, footprint: { w: 44, h: 16 } },
  rug: { texture: TextureKeys.Rug, originY: 0.5, layer: 'floor' },
  sofa: { texture: TextureKeys.Sofa, originY: 122 / 130, footprint: { w: 220, h: 50 } },
  coffeeTable: { texture: TextureKeys.CoffeeTable, originY: 72 / 80, footprint: { w: 120, h: 30 } },
  tv: { texture: TextureKeys.Tv, originY: 132 / 140, footprint: { w: 150, h: 36 } },
  bigTeddy: { texture: TextureKeys.BigTeddy, originY: 132 / 140, footprint: { w: 90, h: 30 } },
  exitMat: { texture: TextureKeys.ExitMat, originY: 0.5, layer: 'floor' },
  // Samyas Haus
  bed: { texture: TextureKeys.Bed, originY: 180 / 190, footprint: { w: 230, h: 100 } },
  nightstand: { texture: TextureKeys.Nightstand, originY: 122 / 130, footprint: { w: 64, h: 24 } },
  wardrobe: { texture: TextureKeys.Wardrobe, originY: 198 / 210, footprint: { w: 184, h: 40 } },
  toyBox: { texture: TextureKeys.ToyBox, originY: 112 / 120, footprint: { w: 120, h: 30 } },
  fridge: { texture: TextureKeys.Fridge, originY: 190 / 200, footprint: { w: 94, h: 34 } },
  kitchenCounter: { texture: TextureKeys.KitchenCounter, originY: 178 / 190, footprint: { w: 308, h: 50 } },
  diningTable: { texture: TextureKeys.DiningTable, originY: 128 / 140, footprint: { w: 212, h: 46 } },
  partitionHigh: { texture: TextureKeys.PartitionHigh, originY: 1, footprint: { w: 28, h: 360 } },
  partitionLow: { texture: TextureKeys.PartitionLow, originY: 1, footprint: { w: 28, h: 144 } },
  roomBoard: {
    texture: TextureKeys.RoomBoard,
    originY: 0,
    layer: 'wall',
    labels: [{ text: '', offsetY: 24, maxWidth: 200, fontSize: 22, color: '#c2477f' }],
  },
  // Friseursalon
  boardSalon: {
    texture: TextureKeys.BoardSalon,
    originY: 0,
    layer: 'wall',
    labels: [{ text: 'Friseursalon ✂️', offsetY: 32, maxWidth: 270, fontSize: 30, color: '#2f9c84' }],
  },
  salonMirror: { texture: TextureKeys.SalonMirror, originY: 0, layer: 'wall' },
  salonChair: { texture: TextureKeys.SalonChair, originY: 122 / 130, footprint: { w: 84, h: 22 } },
  salonTrolley: { texture: TextureKeys.SalonTrolley, originY: 102 / 110, footprint: { w: 62, h: 20 } },
  hairShelf: { texture: TextureKeys.HairShelf, originY: 152 / 160, footprint: { w: 160, h: 40 } },
  magazineTable: { texture: TextureKeys.MagazineTable, originY: 72 / 80, footprint: { w: 110, h: 26 } },
  // Café
  boardCafe: {
    texture: TextureKeys.BoardCafe,
    originY: 0,
    layer: 'wall',
    labels: [{ text: 'Café ☕', offsetY: 32, maxWidth: 210, fontSize: 32, color: '#8a5a3c' }],
  },
  menuBoard: {
    texture: TextureKeys.MenuBoard,
    originY: 0,
    layer: 'wall',
    labels: [
      { text: 'Speisekarte', offsetY: 40, maxWidth: 180, fontSize: 24, color: '#ffffff' },
      { text: '☕ 🥤 🧁 🥞 🍨', offsetY: 80, maxWidth: 180, fontSize: 22, color: '#ffe9a8' },
    ],
  },
  cupShelf: { texture: TextureKeys.CupShelf, originY: 0, layer: 'wall' },
  cafeCounter: { texture: TextureKeys.CafeCounter, originY: 142 / 150, footprint: { w: 390, h: 60 } },
  cafeTableRound: { texture: TextureKeys.CafeTableRound, originY: 82 / 90, footprint: { w: 92, h: 24 } },
  cafeChair: { texture: TextureKeys.CafeChair, originY: 92 / 100, footprint: { w: 56, h: 16 } },
  cakeStation: { texture: TextureKeys.CakeStation, originY: 122 / 130, footprint: { w: 200, h: 40 } },
  // Schule
  blackboard: {
    texture: TextureKeys.Blackboard,
    originY: 0,
    layer: 'wall',
    labels: [
      { text: 'Hallo Samya! 🌟', offsetY: 52, maxWidth: 380, fontSize: 34, color: '#ffffff' },
      { text: '3 + 4 = ?', offsetY: 96, maxWidth: 300, fontSize: 26, color: '#ffe9a8' },
    ],
  },
  alphabetPoster: { texture: TextureKeys.AlphabetPoster, originY: 0, layer: 'wall' },
  pictureFrame: { texture: TextureKeys.PictureFrame, originY: 0, layer: 'wall' },
  schoolDesk: { texture: TextureKeys.SchoolDesk, originY: 72 / 80, footprint: { w: 104, h: 22 } },
  schoolChair: { texture: TextureKeys.SchoolChair, originY: 82 / 90, footprint: { w: 50, h: 14 } },
  teacherDesk: { texture: TextureKeys.TeacherDesk, originY: 122 / 130, footprint: { w: 196, h: 40 } },
  easel: { texture: TextureKeys.Easel, originY: 152 / 160, footprint: { w: 70, h: 20 } },
  xylophoneTable: { texture: TextureKeys.XylophoneTable, originY: 92 / 100, footprint: { w: 146, h: 24 } },
} satisfies Record<string, PropDef>;

export type StaticPropType = keyof typeof STATIC_PROPS;
export type PropType = StaticPropType | `building-${BuildingId}`;

export interface PropDef {
  texture: TextureKey;
  /** Fußpunkt als Anteil der Texturhöhe (0 = oben, 1 = unten). */
  originY: number;
  /** Kollisionsfläche, unten mittig am Fußpunkt ausgerichtet (Welt-Einheiten). */
  footprint?: { w: number; h: number };
  /** Beschriftungen (Positionen in unskalierten Einheiten). */
  labels?: LabelSlot[];
  /** Darstellungsgröße (1 = normal) */
  scale?: number;
  /** 'floor' = flach auf dem Boden, 'wall' = an der Rückwand; sonst nach y sortiert */
  layer?: 'floor' | 'wall';
  ambient?: 'sway' | 'sparkle' | 'shine' | 'flag';
}

export interface PlacedProp {
  id?: string;
  type: PropType;
  x: number;
  y: number;
  /** Ersetzt die Texte der Beschriftungen (gleiche Reihenfolge wie in PropDef.labels) */
  labels?: string[];
}

function buildingProp(id: BuildingId): PropDef {
  const def = BUILDINGS[id];
  const v = def.visual;
  return {
    texture: def.texture,
    originY: buildingOriginY(def),
    // Kollision über die ganze sichtbare Gebäudetiefe: Niemand läuft „hinter“ eine Fassade.
    footprint: { w: v.width - 8, h: v.wallHeight + v.roofHeight * 0.6 },
    labels: def.labels,
  };
}

export const PROPS: Record<PropType, PropDef> = {
  ...STATIC_PROPS,
  ...(Object.fromEntries(
    (Object.keys(BUILDINGS) as BuildingId[]).map((id) => [`building-${id}`, buildingProp(id)]),
  ) as Record<`building-${BuildingId}`, PropDef>),
};

/** Kollisionsrechteck eines platzierten Objekts (oder null, wenn begehbar). */
export function propFootprint(prop: PlacedProp): Rect | null {
  const footprint = PROPS[prop.type].footprint;
  if (!footprint) return null;
  return { x: prop.x - footprint.w / 2, y: prop.y - footprint.h, w: footprint.w, h: footprint.h };
}
