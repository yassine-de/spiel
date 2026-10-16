import { TextureKeys } from '../assets/assetKeys';
import type { AvatarConfig } from '../avatar/avatarTypes';

export type NpcId = 'hairdresser' | 'barista' | 'teacher';

export interface NpcDef {
  id: NpcId;
  name: string;
  /** Kurzer Titel für Hinweise, z. B. „Friseurin“ */
  role: string;
  texture: string;
  /** Aussehen – aus denselben Ebenen wie Samyas Avatar gezeichnet */
  avatar: AvatarConfig;
  /** Was die Figur sagt, wenn man sie anspricht (zufällig) */
  chatter: (name: string) => string[];
}

const base = { glasses: null, hairAccessory: null, hat: null, bag: null } as const;

export const NPCS: Record<NpcId, NpcDef> = {
  hairdresser: {
    id: 'hairdresser',
    name: 'Lina',
    role: 'Friseurin',
    texture: TextureKeys.NpcHairdresser,
    avatar: {
      ...base,
      body: 'girl',
      skin: 'skin-4',
      eyeShape: 'gentle',
      eyeColor: 'eyes-green',
      mouth: 'smile',
      expression: 'happy',
      hairStyle: 'buns',
      hairColor: 'hair-purple',
      top: 'top-tshirt-stripes',
      bottom: 'bottom-pants-jeans',
      shoes: 'shoes-sneakers-white',
      hairAccessory: 'headband-lilac',
    },
    chatter: (name) => [
      `Hallo ${name}! Setz dich, ich mache dir eine tolle Frisur! ✂️`,
      'Heute ist ein wunderschöner Tag für eine neue Haarfarbe! 🌈',
      `${name}, deine Haare glänzen ja wie Seide! ✨`,
      'Psst … Glitzerspray macht jede Frisur zur Party-Frisur! 💫',
    ],
  },
  barista: {
    id: 'barista',
    name: 'Ben',
    role: 'Café-Besitzer',
    texture: TextureKeys.NpcBarista,
    avatar: {
      ...base,
      body: 'boy',
      skin: 'skin-3',
      eyeShape: 'round',
      eyeColor: 'eyes-brown',
      mouth: 'grin',
      expression: 'happy',
      hairStyle: 'short',
      hairColor: 'hair-black',
      top: 'top-tshirt-sky',
      bottom: 'bottom-pants-jeans',
      shoes: 'shoes-boots-brown',
    },
    chatter: (name) => [
      `Hallo ${name}! Heute gibt es frische Muffins! 🧁`,
      'Mein Kakao ist der cremigste der ganzen Stadt! ☕',
      `Hast du Lust, einen Kuchen zu verzieren, ${name}? 🎂`,
    ],
  },
  teacher: {
    id: 'teacher',
    name: 'Frau Sonnenschein',
    role: 'Lehrerin',
    texture: TextureKeys.NpcTeacher,
    avatar: {
      ...base,
      body: 'girl',
      skin: 'skin-2',
      eyeShape: 'round',
      eyeColor: 'eyes-blue',
      mouth: 'smile',
      expression: 'calm',
      hairStyle: 'bob',
      hairColor: 'hair-red',
      top: 'top-pullover-mint',
      bottom: 'bottom-skirt-mint',
      shoes: 'shoes-ballerinas-red',
      glasses: 'glasses-round',
    },
    chatter: (name) => [
      `Guten Morgen, ${name}! Schön, dass du da bist! 🌞`,
      'An der Tafel warten knifflige Rechen-Rätsel auf dich! 🧮',
      'In der Malecke kannst du ein Bild für unsere Wand malen! 🎨',
      'Probier mal das Xylophon aus – ich zeige dir ein Lied! 🎵',
    ],
  },
};
