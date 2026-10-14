import type { Direction } from '../types';

/**
 * Alle Textur-Schlüssel des Spiels. Die Spiellogik kennt nur diese Schlüssel –
 * ob dahinter ein Platzhalter oder eine echte Grafik liegt, entscheidet allein
 * das assetManifest.
 */
export const TextureKeys = {
  Player: 'char-player',
  Shadow: 'fx-shadow',
  Sparkle: 'fx-sparkle',
  Heart: 'fx-heart',
  GroundTiles: 'ground-tiles',
  TreeGreen: 'env-tree-green',
  TreePink: 'env-tree-pink',
  Bush: 'env-bush',
  FlowersPink: 'env-flowers-pink',
  FlowersLilac: 'env-flowers-lilac',
  Lamp: 'env-lamp',
  Bench: 'env-bench',
  Fountain: 'env-fountain',
  Sign: 'env-sign',
  Cloud: 'menu-cloud',
  MenuHills: 'menu-hills',
  // Gebäude
  BldSchool: 'bld-school',
  BldBoutique: 'bld-boutique',
  BldToyStore: 'bld-toystore',
  BldRewe: 'bld-rewe',
  BldCafe: 'bld-cafe',
  BldSalon: 'bld-salon',
  BldHome: 'bld-home',
  BldNeighborBlue: 'bld-neighbor-blue',
  BldNeighborYellow: 'bld-neighbor-yellow',
  // Stadt
  Pond: 'city-pond',
  WaterShine: 'fx-water-shine',
  Playground: 'city-playground',
  Fence: 'city-fence',
  Hedge: 'city-hedge',
  Mailbox: 'city-mailbox',
  CafeTable: 'city-cafe-table',
  Carts: 'city-carts',
  Flagpole: 'city-flagpole',
  Flag: 'city-flag',
  FlowerBed: 'city-flowerbed',
  CarPink: 'car-pink',
  CarMint: 'car-mint',
  CarYellow: 'car-yellow',
  // Innenräume
  WallHome: 'int-wall-home',
  WallBoutique: 'int-wall-boutique',
  WallMarket: 'int-wall-market',
  WallToys: 'int-wall-toys',
  WallWindow: 'int-wall-window',
  BoardRewe: 'int-board-rewe',
  BoardBoutique: 'int-board-boutique',
  BoardPoster: 'int-board-poster',
  ShelfGroceries: 'int-shelf-groceries',
  ShelfToys: 'int-shelf-toys',
  ShelfBooks: 'int-shelf-books',
  Cooler: 'int-cooler',
  FruitStand: 'int-fruit-stand',
  Counter: 'int-counter',
  ClothesRack: 'int-clothes-rack',
  DisplayTable: 'int-display-table',
  Mirror: 'int-mirror',
  Plant: 'int-plant',
  Rug: 'int-rug',
  Sofa: 'int-sofa',
  CoffeeTable: 'int-coffee-table',
  Tv: 'int-tv',
  BigTeddy: 'int-big-teddy',
  ExitMat: 'int-exit-mat',
  // Samyas Haus
  WallBedroom: 'int-wall-bedroom',
  WallKitchen: 'int-wall-kitchen',
  Bed: 'home-bed',
  Nightstand: 'home-nightstand',
  Wardrobe: 'home-wardrobe',
  ToyBox: 'home-toybox',
  Fridge: 'home-fridge',
  KitchenCounter: 'home-kitchen-counter',
  DiningTable: 'home-dining-table',
  PartitionHigh: 'home-partition-high',
  PartitionLow: 'home-partition-low',
  RoomBoard: 'home-room-board',
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];

/**
 * Aufbau eines Figuren-Spritesheets (@2x):
 * Zeilen = Blickrichtungen, Spalte 0 = Stehen, Spalten 1–4 = Laufzyklus.
 * Echte Figuren-Grafiken müssen genau diesem Raster folgen.
 */
export const CHARACTER_SHEET = {
  frameWidth: 144,
  frameHeight: 224,
  /** y-Position der Fußsohlen innerhalb eines Frames (Ursprung der Figur). */
  footY: 216,
  columns: 5,
  rows: ['down', 'left', 'right', 'up'] as readonly Direction[],
  idleColumn: 0,
  walkColumns: [1, 2, 3, 4],
} as const;

/** Bodenkacheln (@2x) mit 2 px Rand, damit beim Zoomen keine Nahtlinien entstehen. */
export const GROUND_TILESET = {
  tilePx: 128,
  extrude: 2,
} as const;

export const GroundTile = {
  Grass: 0,
  GrassFlowers: 1,
  GrassLight: 2,
  Plaza: 3,
  Sidewalk: 4,
  Road: 5,
  RoadLine: 6,
  Crosswalk: 7,
  CurbAboveRoad: 8,
  CurbBelowRoad: 9,
  ParkPath: 10,
  WoodFloor: 11,
  CheckerFloor: 12,
  PinkTileFloor: 13,
  CarpetFloor: 14,
  KitchenFloor: 15,
} as const;

export type GroundTileId = (typeof GroundTile)[keyof typeof GroundTile];
export const GROUND_TILE_COUNT = Object.keys(GroundTile).length;
