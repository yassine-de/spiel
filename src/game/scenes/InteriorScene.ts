import type Phaser from 'phaser';
import { ASSET_SCALE, DEPTH, SCENES, TILE_SIZE } from '../config/constants';
import { audio, saves, tasks } from '../services';
import { ShoppingCart } from '../shop/economy';
import type { MarketSection, ShopId } from '../shop/products';
import type { TaskEvent } from '../tasks/dailyTasks';
import type { Rect } from '../types';
import { getUI } from '../ui';
import type { ShopOpenOptions } from '../ui/ShopPanel';
import type { WorldLayout } from '../world/cityLayout';
import { ITEM_SPRITE_ORIGIN_Y, itemTextureKey } from '../assets/placeholders/itemIconPainter';
import { getProduct } from '../shop/products';
import { doorFront } from '../world/cityLayout';
import {
  INTERIORS,
  type InteriorDef,
  type InteriorId,
  WALL_HEIGHT,
  exitPoint,
  floorArea,
  interiorLayout,
  roomStarts,
  spawnPoint,
} from '../world/interiors';
import { findPlacement } from '../world/placement';
import type { PropType } from '../world/props';
import type { CitySceneData } from './CityScene';
import { setupCafe } from './places/cafe';
import type { Place, PlaceContext } from './places/PlaceContext';
import { setupSalon } from './places/salon';
import { setupSchool } from './places/school';
import { viewSize } from './sceneUtils';
import { type StartPoint, WorldScene } from './WorldScene';

export interface InteriorSceneData {
  interior: InteriorId;
}

/** Welche Möbel welchen Laden öffnen (und mit welchem Button-Text). */
interface ShopSpot {
  label: string;
  section?: MarketSection;
  checkout?: boolean;
}

const SHOP_SPOTS: Partial<Record<ShopId, Partial<Record<PropType, ShopSpot>>>> = {
  boutique: {
    clothesRack: { label: 'Kleidung ansehen' },
    displayTable: { label: 'Kleidung ansehen' },
    mirror: { label: 'Anprobieren' },
    counter: { label: 'Kleidung ansehen' },
  },
  rewe: {
    fruitStand: { label: 'Obst & Gemüse', section: 'produce' },
    cooler: { label: 'Kühlregal ansehen', section: 'cooler' },
    shelfGroceries: { label: 'Regal ansehen', section: 'pantry' },
    counter: { label: 'Zur Kasse', section: 'produce', checkout: true },
  },
  toystore: {
    shelfToys: { label: 'Spielzeug ansehen' },
    bigTeddy: { label: 'Spielzeug ansehen' },
    displayTable: { label: 'Spielzeug ansehen' },
    counter: { label: 'Spielzeug ansehen' },
  },
};

const VISIT_EVENT: Record<InteriorId, TaskEvent> = {
  home: 'visit-home',
  boutique: 'visit-boutique',
  rewe: 'visit-rewe',
  toystore: 'visit-toystore',
  salon: 'visit-salon',
  cafe: 'visit-cafe',
  school: 'visit-school',
};

/** Orte mit eigenen Szenarien (Figuren, Sitzplätze, Spiele). */
const PLACES: Partial<Record<InteriorId, (ctx: PlaceContext) => Place>> = {
  salon: setupSalon,
  cafe: setupCafe,
  school: setupSchool,
};

/** Innenraum eines Gebäudes: Rückwand, Boden, Möbel, Läden und ein Ausgang unten in der Mitte. */
export class InteriorScene extends WorldScene {
  private def: InteriorDef = INTERIORS.home;
  /** Warenkorb dieses Besuchs (nur im Supermarkt) */
  private cart = new ShoppingCart();
  /** Aufgestellte Spielzeuge (nur zu Hause) */
  private readonly placed = new Map<string, Phaser.GameObjects.Image>();
  /** Szenarien in Salon, Café und Schule */
  private place: Place | null = null;

  constructor() {
    super(SCENES.Interior);
  }

  init(data: InteriorSceneData): void {
    this.def = INTERIORS[data?.interior] ?? INTERIORS.home;
    this.cart = new ShoppingCart();
  }

  protected createLayout(): WorldLayout {
    return interiorLayout(this.def);
  }

  protected startPoint(): StartPoint {
    return { ...spawnPoint(this.def), facing: 'up' };
  }

  protected override canGoHome(): boolean {
    return this.def.id !== 'home';
  }

  /** Aus einem Laden direkt nach Hause. */
  protected override goHome(): void {
    const front = doorFront('home');
    saves.setCityPosition(front.x, front.y);
    this.dropCart();
    const data: InteriorSceneData = { interior: 'home' };
    this.goTo(SCENES.Interior, data);
  }

  protected setupPlace(): void {
    const ui = getUI();
    this.cameras.main.setBackgroundColor('#f3e6f7');

    // Rückwände (Tapete als Kachelmuster, je Raum eigene)
    const starts = roomStarts(this.def);
    this.def.rooms.forEach((room, i) => {
      this.add
        .tileSprite(starts[i], 0, room.cols * TILE_SIZE, WALL_HEIGHT, room.wall)
        .setOrigin(0, 0)
        .setTileScale(1 / ASSET_SCALE)
        .setDepth(DEPTH.wall);
    });

    const exit = exitPoint(this.def);
    this.interactions.add({
      id: 'exit',
      x: exit.x,
      y: exit.y,
      radius: 80,
      label: 'Hinausgehen',
      action: () => this.leave(),
    });
    // Direkt nach dem Betreten nicht versehentlich wieder hinausgehen
    this.interactions.suppressUntilLeft('exit');

    // Läden: Regale, Ständer und Kasse öffnen das Ladenfenster
    const shop = this.def.shop;
    const spots = shop ? SHOP_SPOTS[shop] : undefined;
    if (shop && spots) {
      this.def.props.forEach((prop, index) => {
        const spot = spots[prop.type];
        if (!spot) return;
        this.interactions.add({
          id: `shop-${index}`,
          x: prop.x,
          y: prop.y + 22,
          radius: 115,
          label: spot.label,
          action: () => this.openShop({ shop, section: spot.section, checkout: spot.checkout, cart: shop === 'rewe' ? this.cart : undefined }),
        });
      });
    }

    if (this.def.id === 'home') this.setupHome();
    const setup = PLACES[this.def.id];
    if (setup) {
      this.place = setup({
        scene: this,
        player: this.player,
        interactions: this.interactions,
        world: this.world,
        calm: this.calm,
        setBusy: (on) => this.setBusy(on),
        isBusy: () => this.isBusy,
      });
    }

    ui.toast.queue(this.def.welcome(saves.playerName), 3500);
    tasks.report(VISIT_EVENT[this.def.id]);
  }

  protected override onShutdown(): void {
    getUI().inventory.placement = null;
    this.placed.clear();
    this.place?.destroy();
    this.place = null;
  }

  protected override onUpdate(time: number, delta: number): void {
    this.place?.update?.(time, delta);
  }

  /* ---------------- Samyas Haus ---------------- */

  private setupHome(): void {
    const ui = getUI();
    const name = saves.playerName;
    const spot = (id: string, label: string, action: () => void, radius = 120) => {
      const obj = this.world.objects.get(id);
      if (!obj) return;
      this.interactions.add({ id, x: obj.prop.x, y: obj.prop.y + 24, radius, label, action });
    };
    spot('wardrobe', 'Kleiderschrank öffnen', () => this.openWardrobe());
    spot('home-mirror', 'In den Spiegel schauen', () => {
      audio.play('sparkle');
      ui.toast.show(`Wow, ${name}, du siehst heute fantastisch aus! 💖`);
    }, 90);
    spot('toybox', 'Spielzeugkiste öffnen', () => ui.inventory.openAt('toys'));
    spot('fridge', 'Kühlschrank öffnen', () => ui.inventory.openAt('food'));
    spot('bed', 'Ausruhen', () => {
      audio.play('interact');
      ui.toast.show(`Zzz … ${name} macht ein kleines Nickerchen. 💤`);
    }, 150);
    spot('tv', 'Fernsehen', () => {
      audio.play('interact');
      ui.toast.show(`Im Fernsehen läuft: „Die Abenteuer von ${name}“! 📺`);
    });

    // Gespeicherte Spielzeuge wieder aufstellen
    for (const [id, position] of Object.entries(saves.placements)) this.showPlaced(id, position.x, position.y);

    ui.inventory.placement = {
      place: (id) => this.placeToy(id),
      remove: (id) => this.removeToy(id),
    };
  }

  private showPlaced(id: string, x: number, y: number): void {
    const key = itemTextureKey(id);
    if (!this.textures.exists(key)) return;
    const image = this.add.image(x, y, key).setOrigin(0.5, ITEM_SPRITE_ORIGIN_Y).setScale(1 / ASSET_SCALE).setDepth(y);
    this.placed.set(id, image);
    const name = getProduct(id)?.name ?? 'Spielzeug';
    this.interactions.add({ id: `placed-${id}`, x, y: y + 10, radius: 70, label: `${name} wegräumen`, action: () => this.removeToy(id) });
  }

  /** Stellt ein Spielzeug vor Samya auf (gespeichert). */
  private placeToy(id: string): boolean {
    const ui = getUI();
    if (id in saves.placements) return false;
    const exit = exitPoint(this.def);
    const target = findPlacement({ x: this.player.x, y: this.player.y }, this.player.facing, {
      area: floorArea(this.def),
      solids: this.world.solids,
      occupied: Object.values(saves.placements),
      keepClear: [{ x: exit.x, y: exit.y, r: 110 }],
    });
    if (!target) {
      audio.play('oops');
      ui.toast.show('Hier ist leider kein Platz. Geh ein Stück weiter! 💕');
      return false;
    }
    if (!saves.place(id, target.x, target.y)) return false;
    const saved = saves.placements[id];
    this.showPlaced(id, saved.x, saved.y);
    // Nicht sofort wieder „Wegräumen“ anbieten
    this.interactions.suppressUntilLeft(`placed-${id}`);
    audio.play('add');
    ui.toast.show(`${getProduct(id)?.name ?? 'Dein Spielzeug'} steht jetzt hier! ✨`);
    return true;
  }

  private removeToy(id: string): void {
    if (!saves.unplace(id)) return;
    this.placed.get(id)?.destroy();
    this.placed.delete(id);
    this.interactions.remove(`placed-${id}`);
    audio.play('close');
    getUI().toast.show(`${getProduct(id)?.name ?? 'Das Spielzeug'} ist wieder in der Spielzeugkiste. 🧸`);
  }

  /** Ist der Raum kleiner als der Bildschirm, wird er mittig angezeigt. */
  protected override cameraBounds(): Rect {
    const view = viewSize(this);
    const w = Math.max(this.world.width, view.width);
    const h = Math.max(this.world.height, view.height);
    return { x: (this.world.width - w) / 2, y: (this.world.height - h) / 2, w, h };
  }

  private openShop(options: ShopOpenOptions): void {
    const ui = getUI();
    ui.hud.setInteraction(null);
    ui.shop.open(options, () => ui.hud.setInteraction(this.interactions.active?.label ?? null));
  }

  /** Nicht bezahlte Sachen bleiben im Laden. */
  private dropCart(): void {
    if (this.cart.count === 0) return;
    this.cart.clear();
    getUI().toast.show('Die Sachen aus dem Warenkorb kommen zurück ins Regal 🛒', 3500);
  }

  private leave(): void {
    audio.play('close');
    this.dropCart();
    const data: CitySceneData = { returnFrom: this.def.building };
    this.goTo(SCENES.City, data);
  }
}
