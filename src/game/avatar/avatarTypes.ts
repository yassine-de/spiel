/** Gespeicherte Avatar-Konfiguration. Alle Werte sind IDs aus dem avatarCatalog. */
export interface AvatarConfig {
  body: BodyType;
  skin: string;
  eyeShape: EyeShape;
  eyeColor: string;
  mouth: MouthShape;
  expression: Expression;
  hairStyle: HairStyle;
  hairColor: string;
  /** Oberteil: T-Shirt, Pullover oder Kleid (ein Kleid ersetzt das Unterteil). */
  top: string;
  bottom: string;
  shoes: string;
  glasses: string | null;
  hairAccessory: string | null;
  hat: string | null;
  /** Handtasche (seit Phase 4; fehlt in älteren Spielständen und wird dann „ohne“) */
  bag: string | null;
}

export type BodyType = 'girl' | 'boy';
export type EyeShape = 'round' | 'sparkle' | 'happy' | 'gentle';
export type MouthShape = 'smile' | 'grin' | 'cat' | 'wow';
export type Expression = 'happy' | 'excited' | 'calm' | 'brave';
export type HairStyle = 'long' | 'bob' | 'pigtails' | 'ponytail' | 'buns' | 'curly' | 'short' | 'spiky';

export type ClothingCategory = 'tshirt' | 'pullover' | 'jacket' | 'dress' | 'skirt' | 'pants' | 'shoes';
export type AccessoryCategory = 'glasses' | 'bow' | 'headband' | 'hat' | 'bag';
export type ItemCategory = ClothingCategory | AccessoryCategory;

export type Pattern = 'none' | 'heart' | 'star' | 'stripes' | 'rainbow' | 'dots';

/** Ein Kleidungsstück oder Accessoire. Die Läden (Phase 4) verwenden dieselben IDs. */
export interface WearableItem {
  id: string;
  name: string;
  category: ItemCategory;
  color: string;
  /** Darstellungsvariante innerhalb der Kategorie */
  variant: string;
  pattern?: Pattern;
  /** Zweite Farbe bei zweigeteilter Kleidung (linke Körperseite) */
  color2?: string;
}

export interface ColorOption {
  id: string;
  name: string;
  color: string;
  /** Zweite Farbe (z. B. zweifarbige Haare: linke Kopfseite) */
  color2?: string;
}

export interface NamedOption<T extends string> {
  id: T;
  name: string;
}
