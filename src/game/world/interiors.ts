import { GroundTile, TextureKeys, type GroundTileId, type TextureKey } from '../assets/assetKeys';
import { WALL_HEIGHT } from '../assets/placeholders/interiorPainter';
import { TILE_SIZE } from '../config/constants';
import type { ShopId } from '../shop/products';
import type { Rect, Vec2 } from '../types';
import type { BuildingId } from './buildings';
import type { WorldLayout } from './cityLayout';
import type { PlacedProp } from './props';

export type InteriorId = 'home' | 'boutique' | 'rewe' | 'toystore' | 'salon' | 'cafe' | 'school';

/** Ein Raum innerhalb eines Gebäudes (nebeneinander, durch Durchgänge verbunden). */
export interface RoomDef {
  /** Raumname (wird an der Rückwand angezeigt) */
  name?: string;
  cols: number;
  floor: GroundTileId;
  wall: TextureKey;
}

export interface InteriorDef {
  id: InteriorId;
  /** Gebäude in der Stadt, zu dem der Innenraum gehört (für die Rückkehr) */
  building: BuildingId;
  rooms: RoomDef[];
  /** Möbel; x-Werte beziehen sich auf das ganze Gebäude */
  props: PlacedProp[];
  welcome: (name: string) => string;
  /** Laden in diesem Raum (Regale öffnen das Ladenfenster) */
  shop?: ShopId;
  /** x-Position der Haustür (Standard: Mitte) */
  exitX?: number;
}

export const ROOM_COLS = 22;
export const ROOM_ROWS = 11;
export const ROOM_HEIGHT = ROOM_ROWS * TILE_SIZE;
export { WALL_HEIGHT };

/** Durchgang in den Trennwänden (y-Bereich). */
export const DOORWAY = { top: 360, bottom: 560 } as const;

export function interiorWidth(def: InteriorDef): number {
  return def.rooms.reduce((sum, room) => sum + room.cols, 0) * TILE_SIZE;
}

/** Ausgang unten (Haustür). */
export function exitPoint(def: InteriorDef): Vec2 {
  return { x: def.exitX ?? interiorWidth(def) / 2, y: ROOM_HEIGHT - 34 };
}

/** Startpunkt nach dem Betreten (etwas über dem Ausgang, Blick nach oben). */
export function spawnPoint(def: InteriorDef): Vec2 {
  return { x: exitPoint(def).x, y: ROOM_HEIGHT - 84 };
}

/** Linke Kante jedes Raums in Welt-Einheiten. */
export function roomStarts(def: InteriorDef): number[] {
  const starts: number[] = [];
  let x = 0;
  for (const room of def.rooms) {
    starts.push(x);
    x += room.cols * TILE_SIZE;
  }
  return starts;
}

const wallTop = 14;
const single = (floor: GroundTileId, wall: TextureKey): RoomDef[] => [{ cols: ROOM_COLS, floor, wall }];

/** Positionen, die Szene und Layout gemeinsam brauchen. */
export const SALON_CHAIRS_X = [420, 704, 988] as const;
export const SALON_CHAIR_Y = 300;
export const CAFE_TABLES: readonly { x: number; y: number }[] = [
  { x: 300, y: 520 },
  { x: 1110, y: 520 },
  { x: 300, y: 664 },
];
/** Stuhl steht so weit hinter dem Tisch. */
export const CHAIR_BEHIND = 34;
export const SCHOOL_DESKS: readonly { x: number; y: number }[] = [400, 560, 850, 1010].flatMap((x) => [
  { x, y: 470 },
  { x, y: 610 },
]);

const SALON: InteriorDef = {
  id: 'salon',
  building: 'salon',
  rooms: single(GroundTile.CheckerFloor, TextureKeys.WallSalon),
  welcome: (name) => `Willkommen im Friseursalon, ${name}! Setz dich auf einen Stuhl ✂️`,
  props: [
    { type: 'wallWindow', x: 150, y: wallTop + 20 },
    { type: 'boardSalon', x: 1228, y: wallTop + 14 },
    ...SALON_CHAIRS_X.flatMap((x, i): PlacedProp[] => [
      { type: 'salonMirror', x, y: wallTop + 4 },
      { id: `chair-${i}`, type: 'salonChair', x, y: SALON_CHAIR_Y },
    ]),
    { id: 'trolley', type: 'salonTrolley', x: 1200, y: 300 },
    { id: 'hair-shelf', type: 'hairShelf', x: 1250, y: 600 },
    { type: 'sofa', x: 230, y: 560 },
    { id: 'magazines', type: 'magazineTable', x: 230, y: 660 },
    { type: 'plant', x: 1340, y: 300 },
    { type: 'plant', x: 70, y: 300 },
  ],
};

const CAFE: InteriorDef = {
  id: 'cafe',
  building: 'cafe',
  rooms: single(GroundTile.WoodFloor, TextureKeys.WallCafe),
  welcome: (name) => `Willkommen im Café, ${name}! Was darf es sein? ☕`,
  props: [
    { type: 'wallWindow', x: 230, y: wallTop + 20 },
    { type: 'boardCafe', x: 704, y: wallTop + 8 },
    { type: 'cupShelf', x: 704, y: wallTop + 92 },
    { type: 'menuBoard', x: 1180, y: wallTop + 22 },
    { id: 'counter', type: 'cafeCounter', x: 704, y: 360 },
    ...CAFE_TABLES.flatMap(({ x, y }, i): PlacedProp[] => [
      { id: `cafe-chair-${i}`, type: 'cafeChair', x, y: y - CHAIR_BEHIND },
      { id: `cafe-table-${i}`, type: 'cafeTableRound', x, y },
    ]),
    { id: 'cake-station', type: 'cakeStation', x: 1110, y: 650 },
    { type: 'plant', x: 80, y: 330 },
    { type: 'plant', x: 1330, y: 330 },
  ],
};

const SCHOOL: InteriorDef = {
  id: 'school',
  building: 'school',
  rooms: single(GroundTile.WoodFloor, TextureKeys.WallSchool),
  welcome: (name) => `Willkommen in der Adolf-Reichwein-Schule, ${name}! 🎒`,
  props: [
    { type: 'wallWindow', x: 110, y: wallTop + 20 },
    { type: 'alphabetPoster', x: 300, y: wallTop + 30 },
    { id: 'blackboard', type: 'blackboard', x: 704, y: wallTop + 8 },
    { id: 'picture', type: 'pictureFrame', x: 1110, y: wallTop + 24 },
    { type: 'wallWindow', x: 1300, y: wallTop + 20 },
    { id: 'bookshelf', type: 'shelfBooks', x: 160, y: 330 },
    { id: 'teacher-desk', type: 'teacherDesk', x: 1060, y: 320 },
    ...SCHOOL_DESKS.flatMap(({ x, y }, i): PlacedProp[] => [
      { id: `school-chair-${i}`, type: 'schoolChair', x, y: y - CHAIR_BEHIND },
      { id: `school-desk-${i}`, type: 'schoolDesk', x, y },
    ]),
    { id: 'easel', type: 'easel', x: 150, y: 600 },
    { id: 'xylophone', type: 'xylophoneTable', x: 1260, y: 600 },
  ],
};

/** Samyas Haus: Schlafzimmer | Wohnzimmer (mit Haustür) | Küche */
const R = 20 * TILE_SIZE;

export const INTERIORS: Record<InteriorId, InteriorDef> = {
  home: {
    id: 'home',
    building: 'home',
    rooms: [
      { name: 'Schlafzimmer', cols: 20, floor: GroundTile.CarpetFloor, wall: TextureKeys.WallBedroom },
      { name: 'Wohnzimmer', cols: 20, floor: GroundTile.WoodFloor, wall: TextureKeys.WallHome },
      { name: 'Küche', cols: 20, floor: GroundTile.KitchenFloor, wall: TextureKeys.WallKitchen },
    ],
    exitX: R * 1.5,
    welcome: (name) => `Willkommen zu Hause, ${name}! 🏠`,
    props: [
      // Schlafzimmer
      { type: 'wallWindow', x: 260, y: wallTop + 20 },
      { id: 'bed', type: 'bed', x: 300, y: 340 },
      { type: 'nightstand', x: 470, y: 300 },
      { id: 'wardrobe', type: 'wardrobe', x: 960, y: 310 },
      { id: 'home-mirror', type: 'mirror', x: 1170, y: 300 },
      { id: 'toybox', type: 'toyBox', x: 140, y: 640 },
      { type: 'rug', x: 660, y: 500 },
      { type: 'plant', x: 70, y: 280 },
      // Wohnzimmer
      { type: 'wallWindow', x: R + 150, y: wallTop + 20 },
      { type: 'wallWindow', x: R + 980, y: wallTop + 20 },
      { type: 'sofa', x: R + 380, y: 300 },
      { id: 'tv', type: 'tv', x: R + 900, y: 280 },
      { type: 'shelfBooks', x: R + 1120, y: 300 },
      { type: 'rug', x: R + 640, y: 480 },
      { type: 'coffeeTable', x: R + 640, y: 480 },
      { type: 'plant', x: R + 90, y: 280 },
      { type: 'plant', x: R + 1180, y: 680 },
      // Küche
      { type: 'wallWindow', x: 2 * R + 900, y: wallTop + 20 },
      { type: 'kitchenCounter', x: 2 * R + 300, y: 300 },
      { id: 'fridge', type: 'fridge', x: 2 * R + 560, y: 300 },
      { type: 'diningTable', x: 2 * R + 820, y: 540 },
      { type: 'plant', x: 2 * R + 1200, y: 280 },
    ],
  },
  boutique: {
    id: 'boutique',
    building: 'boutique',
    shop: 'boutique',
    rooms: single(GroundTile.PinkTileFloor, TextureKeys.WallBoutique),
    welcome: (name) => `Willkommen in deiner Boutique, ${name}! 👗`,
    props: [
      { type: 'boardBoutique', x: 704, y: wallTop + 20 },
      { type: 'clothesRack', x: 230, y: 300 },
      { type: 'clothesRack', x: 420, y: 300 },
      { type: 'clothesRack', x: 230, y: 540 },
      { type: 'mirror', x: 1320, y: 300 },
      { type: 'mirror', x: 1220, y: 300 },
      { type: 'displayTable', x: 704, y: 420 },
      { type: 'counter', x: 1060, y: 560 },
      { type: 'plant', x: 600, y: 260 },
      { type: 'plant', x: 820, y: 260 },
      { type: 'rug', x: 1270, y: 520 },
    ],
  },
  rewe: {
    id: 'rewe',
    building: 'rewe',
    shop: 'rewe',
    rooms: single(GroundTile.CheckerFloor, TextureKeys.WallMarket),
    welcome: (name) => `Willkommen bei REWE, ${name}! 🛒`,
    props: [
      { type: 'boardRewe', x: 704, y: wallTop + 16 },
      { type: 'cooler', x: 1050, y: 300 },
      { type: 'cooler', x: 1230, y: 300 },
      { type: 'shelfGroceries', x: 200, y: 320 },
      { type: 'shelfGroceries', x: 390, y: 320 },
      { type: 'shelfGroceries', x: 200, y: 560 },
      { type: 'shelfGroceries', x: 390, y: 560 },
      { type: 'fruitStand', x: 704, y: 420 },
      { type: 'counter', x: 1100, y: 580 },
      { type: 'plant', x: 1340, y: 600 },
    ],
  },
  toystore: {
    id: 'toystore',
    building: 'toystore',
    shop: 'toystore',
    rooms: single(GroundTile.CarpetFloor, TextureKeys.WallToys),
    welcome: (name) => `Willkommen im Spielzeugladen, ${name}! 🧸`,
    props: [
      // Persönliches Poster (Spielkonzept: „Willkommen, Samya! 💖“)
      { type: 'boardPoster', x: 704, y: wallTop + 18, labels: ['Willkommen, Samya! 💖'] },
      { type: 'shelfToys', x: 210, y: 300 },
      { type: 'shelfToys', x: 400, y: 300 },
      { type: 'shelfToys', x: 1010, y: 300 },
      { type: 'shelfToys', x: 1200, y: 300 },
      { type: 'bigTeddy', x: 704, y: 360 },
      { type: 'displayTable', x: 260, y: 540 },
      { type: 'counter', x: 1100, y: 580 },
      { type: 'plant', x: 1340, y: 420 },
    ],
  },
  salon: SALON,
  cafe: CAFE,
  school: SCHOOL,
};

/** Raum(e) als Kartenlayout: Böden, Trennwände mit Durchgang, Raumschilder, Möbel, Ausgang. */
export function interiorLayout(def: InteriorDef): WorldLayout {
  const cols = def.rooms.reduce((sum, room) => sum + room.cols, 0);
  const width = cols * TILE_SIZE;
  const tiles: GroundTileId[][] = Array.from({ length: ROOM_ROWS }, () => []);
  for (const room of def.rooms) {
    for (const row of tiles) for (let c = 0; c < room.cols; c++) row.push(room.floor);
  }
  const extra: PlacedProp[] = [];
  const starts = roomStarts(def);
  def.rooms.forEach((room, i) => {
    const x = starts[i];
    if (i > 0) {
      // Trennwand mit Durchgang zum Nachbarraum
      extra.push({ type: 'partitionHigh', x, y: DOORWAY.top });
      extra.push({ type: 'partitionLow', x, y: ROOM_HEIGHT });
    }
    if (room.name && def.rooms.length > 1) {
      extra.push({ type: 'roomBoard', x: x + (room.cols * TILE_SIZE) / 2, y: wallTop + 6, labels: [room.name] });
    }
  });
  const exit = exitPoint(def);
  return {
    cols,
    rows: ROOM_ROWS,
    tiles,
    props: [{ id: 'exit', type: 'exitMat', x: exit.x, y: ROOM_HEIGHT - 26 }, ...extra, ...def.props],
    spawn: spawnPoint(def),
    // Rückwand: Man kann bis knapp an sie heran laufen
    solids: [{ x: 0, y: 0, w: width, h: WALL_HEIGHT - 22 }],
  };
}

/** Bereich des Bodens, auf dem Dinge aufgestellt werden dürfen. */
export function floorArea(def: InteriorDef): Rect {
  return { x: 24, y: WALL_HEIGHT + 4, w: interiorWidth(def) - 48, h: ROOM_HEIGHT - WALL_HEIGHT - 40 };
}
