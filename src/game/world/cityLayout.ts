import { GroundTile, type GroundTileId } from '../assets/assetKeys';
import { TILE_SIZE } from '../config/constants';
import { CollisionManager } from '../systems/CollisionManager';
import type { Rect, Vec2 } from '../types';
import { rectsOverlap, seededRandom } from '../utils/math';
import { BUILDINGS, type BuildingId } from './buildings';
import { propFootprint, type PlacedProp } from './props';

export interface WorldLayout {
  cols: number;
  rows: number;
  tiles: GroundTileId[][];
  props: PlacedProp[];
  spawn: Vec2;
  /** Zusätzliche feste Hindernisse (z. B. die Rückwand eines Raums) */
  solids?: Rect[];
}

/** Bereich, der beim ersten Betreten als „entdeckt“ zählt. */
export interface DiscoveryZone {
  id: string;
  name: string;
  rect: Rect;
}

/** Eine Straße (Fahrspuren für Autos), y-Werte = Fußlinie der Autos. */
export interface Lane {
  y: number;
  direction: 1 | -1;
}

export interface CityLayout extends WorldLayout {
  zones: DiscoveryZone[];
  lanes: Lane[];
}

const t = TILE_SIZE;
export const CITY_COLS = 64;
export const CITY_ROWS = 48;

/** Erste Zeile jeder Straße: Gehweg oben, drei Fahrbahnreihen, Gehweg unten. */
const ROAD_TOPS = [10, 25, 41];
/** Fußwege von Nord nach Süd (je zwei Kacheln breit). */
const PATH_COLUMNS = [17, 18, 45, 46];
/** Fußpunkt der Gebäude pro Häuserzeile: direkt am Gehweg darunter. */
const BAND_BASE = ROAD_TOPS.map((row) => row * t - 4);

/** Alle Orte, die man entdecken kann (Bereiche + Gebäude). */
export function discoverablePlaceIds(): string[] {
  const buildings = (Object.keys(BUILDINGS) as BuildingId[]).filter((id) => BUILDINGS[id].discoverable);
  return ['plaza', 'park', ...buildings];
}

export const PARK_RECT: Rect = { x: 20 * t, y: 2 * t, w: 24 * t, h: 8 * t };
export const PLAZA_RECT: Rect = { x: 23 * t, y: 15 * t, w: 18 * t, h: 10 * t };

/** Platzierung der Gebäude: Mitte (x) und Häuserzeile. */
export const BUILDING_PLACEMENT: Record<BuildingId, { x: number; band: 0 | 1 | 2 }> = {
  school: { x: 544, band: 0 },
  salon: { x: 3296, band: 0 },
  cafe: { x: 3776, band: 0 },
  boutique: { x: 384, band: 1 },
  toystore: { x: 832, band: 1 },
  rewe: { x: 3520, band: 1 },
  neighborBlue: { x: 1536, band: 2 },
  home: { x: 2048, band: 2 },
  neighborYellow: { x: 2560, band: 2 },
};

/** Abstand vor der Tür, an dem die Figur beim Herauskommen steht. */
export const DOOR_FRONT = 52;

export function buildingBase(id: BuildingId): Vec2 {
  const placement = BUILDING_PLACEMENT[id];
  return { x: placement.x, y: BAND_BASE[placement.band] };
}

/** Punkt vor der Haustür (hier erscheint die Figur nach dem Verlassen). */
export function doorFront(id: BuildingId): Vec2 {
  const base = buildingBase(id);
  return { x: base.x, y: base.y + DOOR_FRONT };
}

/** Alle festen Hindernisse eines Layouts als CollisionManager. */
export function createLayoutCollisions(layout: WorldLayout): CollisionManager {
  const collisions = new CollisionManager({ x: 0, y: 0, w: layout.cols * t, h: layout.rows * t });
  for (const prop of layout.props) {
    const rect = propFootprint(prop);
    if (rect) collisions.addSolid(rect);
  }
  for (const rect of layout.solids ?? []) collisions.addSolid(rect);
  return collisions;
}

export function createCityLayout(): CityLayout {
  const rand = seededRandom(3105);
  const tiles: GroundTileId[][] = [];
  for (let r = 0; r < CITY_ROWS; r++) {
    const row: GroundTileId[] = [];
    for (let c = 0; c < CITY_COLS; c++) {
      const v = rand();
      row.push(v < 0.1 ? GroundTile.GrassFlowers : v < 0.3 ? GroundTile.GrassLight : GroundTile.Grass);
    }
    tiles.push(row);
  }
  const fill = (c0: number, r0: number, c1: number, r1: number, tile: GroundTileId) => {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (tiles[r]?.[c] !== undefined) tiles[r][c] = tile;
  };

  // Straßen mit Gehwegen
  for (const top of ROAD_TOPS) {
    fill(0, top, CITY_COLS - 1, top, GroundTile.CurbAboveRoad);
    fill(0, top + 1, CITY_COLS - 1, top + 1, GroundTile.Road);
    fill(0, top + 2, CITY_COLS - 1, top + 2, GroundTile.RoadLine);
    fill(0, top + 3, CITY_COLS - 1, top + 3, GroundTile.Road);
    fill(0, top + 4, CITY_COLS - 1, top + 4, GroundTile.CurbBelowRoad);
  }
  // Fußwege mit Zebrastreifen
  for (const c of PATH_COLUMNS) {
    for (let r = ROAD_TOPS[0]; r <= ROAD_TOPS[2] + 4; r++) {
      const tile = tiles[r][c];
      const isRoad = tile === GroundTile.Road || tile === GroundTile.RoadLine;
      const isCurb = tile === GroundTile.CurbAboveRoad || tile === GroundTile.CurbBelowRoad;
      if (isRoad) tiles[r][c] = GroundTile.Crosswalk;
      else if (!isCurb) tiles[r][c] = GroundTile.Sidewalk;
    }
  }
  // Stadtpark mit Wegen
  fill(21, 7, 42, 8, GroundTile.ParkPath);
  fill(31, 7, 32, 9, GroundTile.ParkPath);
  fill(22, 3, 22, 8, GroundTile.ParkPath);
  fill(41, 3, 41, 8, GroundTile.ParkPath);
  fill(22, 3, 41, 3, GroundTile.ParkPath);
  // Stadtplatz mit Zugängen von den Fußwegen
  fill(23, 15, 40, 24, GroundTile.Plaza);
  fill(19, 22, 22, 23, GroundTile.Plaza);
  fill(41, 22, 44, 23, GroundTile.Plaza);

  const props: PlacedProp[] = [];
  const add = (prop: PlacedProp) => props.push(prop);

  // Gebäude
  for (const id of Object.keys(BUILDING_PLACEMENT) as BuildingId[]) {
    const base = buildingBase(id);
    add({ id: `building-${id}`, type: `building-${id}`, x: base.x, y: base.y });
  }

  // Schule: Fahnenmast
  add({ id: 'school-flag', type: 'flagpole', x: 940, y: BAND_BASE[0] - 6 });

  // Stadtpark
  for (const x of [1378, 1574, 1770, 2226, 2422, 2618]) add({ type: 'hedge', x, y: BAND_BASE[0] - 6 });
  add({ id: 'park-sign', type: 'sign', x: 2200, y: 575, labels: ['Samyas\nLieblingspark 🌸'] });
  add({ id: 'pond', type: 'pond', x: 2560, y: 334 });
  add({ type: 'playground', x: 1520, y: 334 });
  add({ type: 'bench', x: 1800, y: 440 });
  add({ type: 'bench', x: 2340, y: 440 });
  add({ type: 'flowerBed', x: 2010, y: 300 });
  add({ type: 'flowersPink', x: 1700, y: 250 });
  add({ type: 'flowersLilac', x: 2240, y: 260 });
  add({ type: 'flowersPink', x: 2760, y: 470 });
  add({ type: 'lamp', x: 1340, y: 440 });
  add({ type: 'lamp', x: 2740, y: 440 });

  // Stadtplatz
  add({ id: 'fountain', type: 'fountain', x: 2048, y: 1300 });
  add({ id: 'welcome-sign', type: 'sign', x: 1650, y: 1110, labels: ["Willkommen in\nSamya's World!"] });
  add({ type: 'bench', x: 2480, y: 1110 });
  add({ type: 'bench', x: 1620, y: 1460 });
  add({ type: 'bench', x: 2480, y: 1460 });
  add({ type: 'flowerBed', x: 1840, y: 1160 });
  add({ type: 'flowerBed', x: 2260, y: 1160 });
  add({ type: 'flowersPink', x: 1860, y: 1520 });
  add({ type: 'flowersLilac', x: 2240, y: 1520 });
  for (const [x, y] of [[1510, 1000], [2586, 1000], [1510, 1580], [2586, 1580]] as const) add({ type: 'lamp', x, y });
  // Grüne Ränder des Platzes
  for (const x of [1330, 2766]) {
    add({ type: 'flowerBed', x, y: 1040 });
    add({ type: 'bush', x, y: 1200 });
    add({ type: 'flowersPink', x: x - 30, y: 1290 });
    add({ type: 'flowersLilac', x: x + 30, y: 1340 });
  }

  // Vor den Läden
  add({ type: 'cafeTable', x: 3600, y: 700 });
  add({ type: 'cafeTable', x: 3950, y: 700 });
  add({ type: 'carts', x: 3990, y: BAND_BASE[1] });
  add({ type: 'flowerBed', x: 1150, y: BAND_BASE[1] - 30 });

  // Samyas Haus und Nachbarhäuser
  const home = buildingBase('home');
  add({ id: 'home-mailbox', type: 'mailbox', x: home.x + 150, y: home.y + 40 });
  add({ type: 'flowerBed', x: home.x - 140, y: home.y + 36 });
  for (const id of ['neighborBlue', 'neighborYellow'] as const) {
    // Gartenzaun vor der Tür: deutlich nicht betretbar
    const base = buildingBase(id);
    add({ type: 'fence', x: base.x - 65, y: base.y + 20 });
    add({ type: 'fence', x: base.x + 65, y: base.y + 20 });
  }

  // Gärten in der unteren Häuserzeile
  add({ type: 'flowerBed', x: 400, y: 2400 });
  add({ type: 'flowerBed', x: 700, y: 2520 });
  add({ type: 'bench', x: 560, y: 2240 });
  add({ type: 'flowersPink', x: 260, y: 2560 });
  add({ type: 'flowersLilac', x: 880, y: 2300 });
  add({ type: 'flowerBed', x: 3400, y: 2420 });
  add({ type: 'bench', x: 3600, y: 2250 });
  add({ type: 'flowersPink', x: 3800, y: 2540 });
  add({ type: 'flowersLilac', x: 3250, y: 2560 });

  // Laternen an den Gehwegen
  for (const [row, xs] of [
    [ROAD_TOPS[0], [150, 1010, 1250, 2930, 3536, 4040]],
    [ROAD_TOPS[1], [100, 1060, 1250, 2830, 3070]],
    [ROAD_TOPS[2], [300, 1250, 1790, 2310, 2930, 3800]],
  ] as const) {
    for (const x of xs) add({ type: 'lamp', x, y: row * t + 40 });
  }

  // Bäume: am Rand und auf freien Wiesen – nie vor Türen oder auf Wegen
  const blocked: Rect[] = props.map((p) => propFootprint(p)).filter((r): r is Rect => r !== null);
  const buildingAreas: Rect[] = (Object.keys(BUILDING_PLACEMENT) as BuildingId[]).map((id) => {
    const base = buildingBase(id);
    const v = BUILDINGS[id].visual;
    const height = v.wallHeight + v.roofHeight;
    return { x: base.x - v.width / 2 - 30, y: base.y - height, w: v.width + 60, h: height + 40 };
  });
  const isGrass = (x: number, y: number) => {
    const tile = tiles[Math.floor(y / t)]?.[Math.floor(x / t)];
    return tile === GroundTile.Grass || tile === GroundTile.GrassFlowers || tile === GroundTile.GrassLight;
  };
  const tryTree = (x: number, y: number, spacing = 120) => {
    const trunk = { x: x - 30, y: y - 30, w: 60, h: 40 };
    if (!isGrass(x, y) || !isGrass(x - 24, y) || !isGrass(x + 24, y)) return;
    if (buildingAreas.some((a) => rectsOverlap(a, trunk))) return;
    if (blocked.some((b) => rectsOverlap({ x: b.x - 20, y: b.y - 20, w: b.w + 40, h: b.h + 40 }, trunk))) return;
    if (!props.every((p) => !p.type.startsWith('tree') || Math.hypot(p.x - x, (p.y - y) * 1.4) > spacing)) return;
    add({ type: rand() < 0.35 ? 'treePink' : 'treeGreen', x, y });
  };
  // Randreihen
  for (let x = 60; x < CITY_COLS * t; x += 140) {
    tryTree(x + rand() * 30, 80 + rand() * 30);
    tryTree(x + rand() * 30, CITY_ROWS * t - 24 - rand() * 16);
  }
  for (let y = 200; y < CITY_ROWS * t; y += 160) {
    tryTree(50 + rand() * 20, y + rand() * 30);
    tryTree(CITY_COLS * t - 60 - rand() * 20, y + rand() * 30);
  }
  // Hinter den Häuserzeilen und im Park
  for (const band of [0, 1, 2]) {
    const top = band === 0 ? 2 * t : (ROAD_TOPS[band - 1] + 5) * t;
    for (let x = 80; x < CITY_COLS * t; x += 130) tryTree(x + rand() * 40, top + 60 + rand() * 50);
  }
  for (let i = 0; i < 160; i++) tryTree(60 + rand() * (CITY_COLS * t - 120), 120 + rand() * (CITY_ROWS * t - 160), 150);

  const zones: DiscoveryZone[] = [
    { id: 'plaza', name: 'Stadtplatz', rect: PLAZA_RECT },
    { id: 'park', name: 'Stadtpark', rect: PARK_RECT },
  ];

  const lanes: Lane[] = ROAD_TOPS.flatMap((top) => [
    { y: (top + 1) * t + 52, direction: -1 as const },
    { y: (top + 3) * t + 52, direction: 1 as const },
  ]);

  return { cols: CITY_COLS, rows: CITY_ROWS, tiles, props, spawn: { x: 2048, y: 1460 }, zones, lanes };
}

