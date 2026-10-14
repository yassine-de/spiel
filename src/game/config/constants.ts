/** Logische Bildschirmgröße in Welt-Einheiten (16:9). Die sichtbare Welt ist immer 720 Einheiten hoch. */
export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

/**
 * Alle Texturen werden in doppelter Auflösung erzeugt bzw. geliefert (@2x)
 * und mit 1 / ASSET_SCALE dargestellt. So bleiben Grafiken auf hochauflösenden
 * Handydisplays scharf. Echte Grafiken müssen ebenfalls in @2x vorliegen.
 */
export const ASSET_SCALE = 2;

/** Kachelgröße des Bodens in Welt-Einheiten. */
export const TILE_SIZE = 64;

/** Laufgeschwindigkeit der Spielfigur in Welt-Einheiten pro Sekunde. */
export const PLAYER_SPEED = 240;

/**
 * Bewegung nur in vier Richtungen (ohne Diagonalen)?
 * false = freie analoge Bewegung, die Figur schaut aber immer in eine der vier Richtungen.
 */
export const SNAP_MOVEMENT_TO_FOUR_DIRECTIONS = false;

/** Standardname der Spielerin (der Spielstand speichert den Namen). */
export const PLAYER_NAME = 'Samya';

/** Präfix für alle LocalStorage-Schlüssel. */
export const STORAGE_PREFIX = 'samyas-world';

export const SCENES = {
  Boot: 'BootScene',
  Preload: 'PreloadScene',
  MainMenu: 'MainMenuScene',
  AvatarCreator: 'AvatarCreatorScene',
  City: 'CityScene',
  Interior: 'InteriorScene',
} as const;

/** Zeichenreihenfolge flacher Ebenen; alle anderen Objekte werden nach ihrer y-Position sortiert. */
export const DEPTH = { ground: 0, wall: 0.5, wallDecor: 1, floorDecor: 2, shadow: 3, overlay: 100000 } as const;
