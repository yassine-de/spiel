/**
 * Asset-Manifest: Hier wird für jeden Textur-Schlüssel festgelegt, woher die Grafik kommt.
 *
 * - Ist `file` gesetzt, lädt die PreloadScene die Datei aus `public/assets/…`.
 * - Fehlt `file` (oder schlägt das Laden fehl), wird der gekennzeichnete
 *   PLATZHALTER aus `placeholders/` erzeugt.
 *
 * Die Spielfigur (TextureKeys.Player) steht nicht hier: Sie wird aus dem
 * Avatar erzeugt (avatar/avatarTexture.ts).
 *
 * Echte Grafiken ersetzen Platzhalter also, indem man hier `file` einträgt –
 * ohne Änderungen an der Spiellogik. Alle Grafiken sind @2x (ASSET_SCALE).
 */
import { GROUND_TILESET, TextureKeys, type TextureKey } from './assetKeys';
import { BUILDINGS, type BuildingId } from '../world/buildings';
import { paintBuilding } from './placeholders/buildingPainter';
import * as city from './placeholders/cityPainter';
import * as env from './placeholders/environmentPainter';
import * as home from './placeholders/homePainter';
import * as int from './placeholders/interiorPainter';
import { itemTextureKey, paintItemSprite } from './placeholders/itemIconPainter';
import { PRODUCTS } from '../shop/products';

interface BaseAsset {
  /** Fester Schlüssel oder „item-…“ für aufstellbare Spielzeuge */
  key: TextureKey | `item-${string}`;
  /** Pfad relativ zu `public/`, z. B. 'assets/env/tree-green.png' */
  file?: string;
  placeholder: () => HTMLCanvasElement;
}

export interface ImageAsset extends BaseAsset {
  kind: 'image';
}

export interface SpriteSheetAsset extends BaseAsset {
  kind: 'spritesheet';
  frameWidth: number;
  frameHeight: number;
  margin?: number;
  spacing?: number;
}

export type AssetEntry = ImageAsset | SpriteSheetAsset;

const image = (key: BaseAsset['key'], placeholder: () => HTMLCanvasElement, file?: string): ImageAsset => ({
  kind: 'image',
  key,
  placeholder,
  file,
});

export const ASSETS: AssetEntry[] = [
  {
    kind: 'spritesheet',
    key: TextureKeys.GroundTiles,
    frameWidth: GROUND_TILESET.tilePx,
    frameHeight: GROUND_TILESET.tilePx,
    margin: GROUND_TILESET.extrude,
    spacing: GROUND_TILESET.extrude * 2,
    placeholder: env.paintGroundTileset,
  },
  image(TextureKeys.Shadow, env.paintShadow),
  image(TextureKeys.Sparkle, env.paintSparkle),
  image(TextureKeys.Heart, env.paintHeart),
  image(TextureKeys.TreeGreen, () => env.paintTree({ leaves: '#8fd69a' }, 7)),
  image(TextureKeys.TreePink, () => env.paintTree({ leaves: '#ffc2d9', blossom: '#ffffff' }, 11)),
  image(TextureKeys.Bush, env.paintBush),
  image(TextureKeys.FlowersPink, () => env.paintFlowerPatch(['#ff8fb8', '#fff1a8', '#ffffff'], 3)),
  image(TextureKeys.FlowersLilac, () => env.paintFlowerPatch(['#c9a7ef', '#ffffff', '#ffc4de'], 5)),
  image(TextureKeys.Lamp, env.paintLamp),
  image(TextureKeys.Bench, env.paintBench),
  image(TextureKeys.Fountain, env.paintFountain),
  image(TextureKeys.Sign, env.paintSign),
  image(TextureKeys.Cloud, env.paintCloud),
  image(TextureKeys.MenuHills, env.paintMenuHills),
  // Gebäude (aus den Beschreibungen in world/buildings.ts)
  ...(Object.keys(BUILDINGS) as BuildingId[]).map((id) => image(BUILDINGS[id].texture, () => paintBuilding(BUILDINGS[id].visual))),
  // Stadt
  image(TextureKeys.Pond, city.paintPond),
  image(TextureKeys.WaterShine, city.paintWaterShine),
  image(TextureKeys.Playground, city.paintPlayground),
  image(TextureKeys.Fence, city.paintFence),
  image(TextureKeys.Hedge, city.paintHedge),
  image(TextureKeys.Mailbox, city.paintMailbox),
  image(TextureKeys.CafeTable, city.paintCafeTable),
  image(TextureKeys.Carts, city.paintCarts),
  image(TextureKeys.Flagpole, city.paintFlagpole),
  image(TextureKeys.Flag, city.paintFlag),
  image(TextureKeys.FlowerBed, city.paintFlowerBed),
  image(TextureKeys.CarPink, () => city.paintCar('#ff9cc8')),
  image(TextureKeys.CarMint, () => city.paintCar('#8fdccf')),
  image(TextureKeys.CarYellow, () => city.paintCar('#ffd36e')),
  // Innenräume
  image(TextureKeys.WallHome, () => int.paintWall('home')),
  image(TextureKeys.WallBoutique, () => int.paintWall('boutique')),
  image(TextureKeys.WallMarket, () => int.paintWall('market')),
  image(TextureKeys.WallToys, () => int.paintWall('toys')),
  image(TextureKeys.WallWindow, int.paintWallWindow),
  image(TextureKeys.BoardRewe, () => int.paintWallBoard('#d9262e', '#a8161d', 300, 80)),
  image(TextureKeys.BoardBoutique, () => int.paintWallBoard('#ffffff', '#ff7eb6', 440, 70)),
  image(TextureKeys.BoardPoster, () => int.paintWallBoard('#ffffff', '#ff9cc8', 400, 76)),
  image(TextureKeys.ShelfGroceries, () => int.paintShelf('groceries')),
  image(TextureKeys.ShelfToys, () => int.paintShelf('toys')),
  image(TextureKeys.ShelfBooks, () => int.paintShelf('books')),
  image(TextureKeys.Cooler, int.paintCooler),
  image(TextureKeys.FruitStand, int.paintFruitStand),
  image(TextureKeys.Counter, int.paintCounter),
  image(TextureKeys.ClothesRack, int.paintClothesRack),
  image(TextureKeys.DisplayTable, int.paintDisplayTable),
  image(TextureKeys.Mirror, int.paintMirror),
  image(TextureKeys.Plant, int.paintPlant),
  image(TextureKeys.Rug, int.paintRug),
  image(TextureKeys.Sofa, int.paintSofa),
  image(TextureKeys.CoffeeTable, int.paintCoffeeTable),
  image(TextureKeys.Tv, int.paintTv),
  image(TextureKeys.BigTeddy, int.paintBigTeddy),
  image(TextureKeys.ExitMat, int.paintExitMat),
  // Samyas Haus
  image(TextureKeys.WallBedroom, () => int.paintWall('bedroom')),
  image(TextureKeys.WallKitchen, () => int.paintWall('kitchen')),
  image(TextureKeys.Bed, home.paintBed),
  image(TextureKeys.Nightstand, home.paintNightstand),
  image(TextureKeys.Wardrobe, home.paintWardrobe),
  image(TextureKeys.ToyBox, home.paintToyBox),
  image(TextureKeys.Fridge, home.paintFridge),
  image(TextureKeys.KitchenCounter, home.paintKitchenCounter),
  image(TextureKeys.DiningTable, home.paintDiningTable),
  image(TextureKeys.PartitionHigh, () => home.paintPartition(PARTITION_HIGH)),
  image(TextureKeys.PartitionLow, () => home.paintPartition(PARTITION_LOW)),
  image(TextureKeys.RoomBoard, home.paintRoomBoard),
  // Aufstellbare Spielzeuge (aus den Produktbildern)
  ...PRODUCTS.filter((p) => p.category === 'toys').map((p) => image(itemTextureKey(p.id) as `item-${string}`, () => paintItemSprite(p.id))),
];

/** Höhen der Trennwand-Stücke (oberhalb und unterhalb des Durchgangs). */
export const PARTITION_HIGH = 360;
export const PARTITION_LOW = 144;
