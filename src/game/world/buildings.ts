import { TextureKeys, type TextureKey } from '../assets/assetKeys';
import { type BuildingVisual, buildingCanvasSize, buildingMetrics } from '../assets/placeholders/buildingPainter';

export type BuildingId =
  | 'home'
  | 'boutique'
  | 'rewe'
  | 'toystore'
  | 'cafe'
  | 'salon'
  | 'school'
  | 'neighborBlue'
  | 'neighborYellow';

/** Beschriftung auf einem Objekt, relativ zum Fußpunkt. */
export interface LabelSlot {
  text: string;
  offsetX?: number;
  /** negativ = über dem Fußpunkt */
  offsetY: number;
  maxWidth: number;
  fontSize: number;
  color: string;
}

export interface BuildingDef {
  id: BuildingId;
  /** Anzeigename (auch für „Neuer Ort entdeckt“) */
  name: string;
  texture: TextureKey;
  visual: BuildingVisual;
  /** Innenraum, falls betretbar */
  interior?: 'home' | 'boutique' | 'rewe' | 'toystore';
  /** Text des Interaktionsbuttons vor der Tür */
  enterLabel?: string;
  labels: LabelSlot[];
  /** Zählt als entdeckbarer Ort */
  discoverable: boolean;
}

const SIGN_COLOR = '#8a3a68';

/** Beschriftung auf dem Fassadenschild. */
function signLabel(v: BuildingVisual, text: string, fontSize: number, color = SIGN_COLOR): LabelSlot {
  const sign = v.sign!;
  return { text, offsetY: -sign.fromBase, maxWidth: sign.width - 24, fontSize, color };
}

/** Beschriftung auf dem Schild quer über der geschlossenen Tür. */
function doorLabel(v: BuildingVisual, text: string): LabelSlot {
  return { text, offsetY: -buildingMetrics(v).doorSignCenter, maxWidth: v.doorSign!.width - 12, fontSize: 20, color: SIGN_COLOR };
}

const school: BuildingVisual = {
  width: 640,
  wallHeight: 290,
  roof: 'gable',
  roofHeight: 96,
  wall: '#b85a3e',
  material: 'brick',
  roofColor: '#5f6673',
  upperWindows: 5,
  display: 'curtains',
  door: { style: 'arch', color: '#2f6a8f', width: 72 },
  doorSign: { width: 210 },
  sign: { width: 320, height: 44, fromBase: 150, fill: '#ffffff', border: '#2f6a8f' },
  clock: true,
};

const boutique: BuildingVisual = {
  width: 420,
  wallHeight: 280,
  roof: 'flat',
  roofHeight: 34,
  wall: '#f4d3dc',
  material: 'plaster',
  roofColor: '#e7c2cd',
  upperWindows: 3,
  display: 'dresses',
  bigDisplay: true,
  door: { style: 'shop', color: '#c95b86', width: 62 },
  awning: ['#ff8fc2', '#ffffff'],
  sign: { width: 340, height: 36, fromBase: 162, fill: '#ffffff', border: '#ff7eb6' },
};

const toystore: BuildingVisual = {
  width: 420,
  wallHeight: 280,
  roof: 'gable',
  roofHeight: 84,
  wall: '#f2d27a',
  material: 'siding',
  roofColor: '#4f6f96',
  upperWindows: 3,
  display: 'toys',
  bigDisplay: true,
  door: { style: 'shop', color: '#3f8f80', width: 62 },
  awning: ['#ff9cc8', '#ffbf8a', '#ffe28a', '#9be0c1', '#8fc4ff', '#c3a8f5'],
  sign: { width: 300, height: 36, fromBase: 162, fill: '#ffffff', border: '#8fc4ff' },
};

const rewe: BuildingVisual = {
  width: 780,
  wallHeight: 240,
  roof: 'flat',
  roofHeight: 30,
  wall: '#f3f2ef',
  material: 'plaster',
  roofColor: '#d9d7d3',
  upperWindows: 0,
  display: 'groceries',
  bigDisplay: true,
  door: { style: 'glass', color: '#8d939c', width: 124 },
  topBand: '#d9262e',
  // Wunsch der Familie: rotes Schild mit weißer Schrift
  sign: { width: 300, height: 68, fromBase: 196, fill: '#d9262e', border: '#a8161d' },
};

const cafe: BuildingVisual = {
  width: 420,
  wallHeight: 230,
  roof: 'gable',
  roofHeight: 80,
  wall: '#d8c6a4',
  material: 'stone',
  roofColor: '#b8573a',
  upperWindows: 0,
  display: 'cups',
  door: { style: 'shop', color: '#7a4f34', width: 62 },
  awning: ['#8fdccf', '#ffffff'],
  doorSign: { width: 170 },
  sign: { width: 190, height: 40, fromBase: 196, fill: '#ffffff', border: '#8fdccf' },
};

const salon: BuildingVisual = {
  width: 380,
  wallHeight: 230,
  roof: 'flat',
  roofHeight: 32,
  wall: '#e6dcf2',
  material: 'plaster',
  roofColor: '#cfc6dc',
  upperWindows: 0,
  display: 'mirrors',
  door: { style: 'shop', color: '#7d63b0', width: 62 },
  awning: ['#c9a7ef', '#ffffff'],
  doorSign: { width: 170 },
  sign: { width: 240, height: 40, fromBase: 196, fill: '#ffffff', border: '#c9a7ef' },
};

const home: BuildingVisual = {
  width: 380,
  wallHeight: 200,
  roof: 'gable',
  roofHeight: 110,
  wall: '#f6d8c6',
  material: 'plaster',
  roofColor: '#c2553f',
  upperWindows: 0,
  display: 'curtains',
  door: { style: 'arch', color: '#7a5596', width: 66 },
  chimney: true,
  heartWindow: true,
  plate: { offsetX: 0, fromBase: 162, width: 236, height: 38 },
};

const neighbor = (wall: string, material: BuildingVisual['material'], roofColor: string, door: string): BuildingVisual => ({
  width: 340,
  wallHeight: 190,
  roof: 'gable',
  roofHeight: 96,
  wall,
  material,
  roofColor,
  upperWindows: 0,
  display: 'curtains',
  door: { style: 'arch', color: door, width: 62 },
  chimney: true,
});

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  home: {
    id: 'home',
    name: 'Samyas Haus',
    texture: TextureKeys.BldHome,
    visual: home,
    interior: 'home',
    enterLabel: 'Haus betreten',
    labels: [{ text: 'Hier wohnt Samya 🏠', offsetY: -162, maxWidth: 224, fontSize: 21, color: SIGN_COLOR }],
    discoverable: true,
  },
  boutique: {
    id: 'boutique',
    name: "Samya's Boutique",
    texture: TextureKeys.BldBoutique,
    visual: boutique,
    interior: 'boutique',
    enterLabel: 'Geschäft betreten',
    labels: [signLabel(boutique, "Samya's Boutique", 25, '#d9558f')],
    discoverable: true,
  },
  rewe: {
    id: 'rewe',
    name: 'REWE',
    texture: TextureKeys.BldRewe,
    visual: rewe,
    interior: 'rewe',
    enterLabel: 'Geschäft betreten',
    labels: [signLabel(rewe, 'REWE', 46, '#ffffff')],
    discoverable: true,
  },
  toystore: {
    id: 'toystore',
    name: 'Spielzeugladen',
    texture: TextureKeys.BldToyStore,
    visual: toystore,
    interior: 'toystore',
    enterLabel: 'Geschäft betreten',
    labels: [signLabel(toystore, 'Spielzeugladen', 25, '#3f7fd6')],
    discoverable: true,
  },
  cafe: {
    id: 'cafe',
    name: 'Café',
    texture: TextureKeys.BldCafe,
    visual: cafe,
    labels: [signLabel(cafe, 'Café', 26, '#3e9a7c'), doorLabel(cafe, 'Bald geöffnet')],
    discoverable: true,
  },
  salon: {
    id: 'salon',
    name: 'Friseursalon',
    texture: TextureKeys.BldSalon,
    visual: salon,
    labels: [signLabel(salon, 'Friseursalon', 24, '#8a6ccc'), doorLabel(salon, 'Bald geöffnet')],
    discoverable: true,
  },
  school: {
    id: 'school',
    name: 'Adolf-Reichwein-Schule',
    texture: TextureKeys.BldSchool,
    visual: school,
    labels: [signLabel(school, 'Adolf-Reichwein-Schule', 23, '#5b4a9a'), doorLabel(school, 'Heute schulfrei! 🎒')],
    discoverable: true,
  },
  neighborBlue: {
    id: 'neighborBlue',
    name: 'Nachbarhaus',
    texture: TextureKeys.BldNeighborBlue,
    visual: neighbor('#bcd3e6', 'siding', '#59616e', '#c99a3e'),
    labels: [],
    discoverable: false,
  },
  neighborYellow: {
    id: 'neighborYellow',
    name: 'Nachbarhaus',
    texture: TextureKeys.BldNeighborYellow,
    visual: neighbor('#efe0b0', 'plaster', '#a85a3e', '#3f6f8f'),
    labels: [],
    discoverable: false,
  },
};

/** Ursprung (Fußpunkt) als Anteil der Texturhöhe. */
export function buildingOriginY(def: BuildingDef): number {
  const size = buildingCanvasSize(def.visual);
  return size.baseY / size.height;
}
