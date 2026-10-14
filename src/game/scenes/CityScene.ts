import Phaser from 'phaser';
import { TextureKeys } from '../assets/assetKeys';
import { ASSET_SCALE, SCENES } from '../config/constants';
import { audio, saves, tasks } from '../services';
import { CarSystem } from '../systems/CarSystem';
import { getUI } from '../ui';
import { BUILDINGS, type BuildingId } from '../world/buildings';
import { type CityLayout, type WorldLayout, buildingBase, createCityLayout, doorFront } from '../world/cityLayout';
import type { InteriorSceneData } from './InteriorScene';
import { type StartPoint, WorldScene } from './WorldScene';

export interface CitySceneData {
  /** true direkt nach dem Erstellen des Avatars */
  firstVisit?: boolean;
  /** Gebäude, aus dem die Figur gerade herauskommt */
  returnFrom?: BuildingId;
}

/** Begrüßung „Willkommen zurück“ nur einmal pro Spielsitzung. */
let greetedThisSession = false;

/** Wie nah man der Tür kommen muss, damit der Button erscheint. */
const DOOR_RADIUS = 70;
/** Ab dieser Nähe gilt ein Gebäude als entdeckt. */
const DISCOVER_RADIUS = 230;

/**
 * Die Stadt: Straßen, Gehwege, Park, Stadtplatz und alle Gebäude.
 * Vier Gebäude sind betretbar, die übrigen sind deutlich als geschlossen markiert.
 */
export class CityScene extends WorldScene {
  private sceneData: CitySceneData = {};
  private layout!: CityLayout;
  private cars: CarSystem | null = null;
  private sparkles: Phaser.GameObjects.Image[] = [];
  private lastSaved = { x: 0, y: 0 };
  /** Nach dem Betreten eines Gebäudes gilt die Tür-Position (nicht mehr überschreiben). */
  private enteringBuilding = false;
  private readonly saveNow = () => this.savePosition(true);
  private readonly onVisibility = () => {
    if (document.hidden) this.savePosition(true);
  };

  constructor() {
    super(SCENES.City);
  }

  init(data: CitySceneData): void {
    this.sceneData = data ?? {};
    this.enteringBuilding = false;
  }

  protected createLayout(): WorldLayout {
    this.layout = createCityLayout();
    return this.layout;
  }

  protected startPoint(layout: WorldLayout): StartPoint {
    if (this.sceneData.returnFrom) return { ...doorFront(this.sceneData.returnFrom), facing: 'down' };
    const saved = saves.cityPosition;
    if (saved) {
      const box = { x: saved.x - 15, y: saved.y - 7, w: 30, h: 14 };
      // Gespeicherte Position nur verwenden, wenn sie (noch) frei ist
      if (!this.world.collisions.collides(box)) return { ...saved, facing: 'down' };
    }
    return { ...layout.spawn, facing: 'down' };
  }

  protected setupPlace(): void {
    const ui = getUI();
    const name = saves.playerName;
    const objects = this.world.objects;

    // Schilder
    const sign = objects.get('welcome-sign');
    if (sign) {
      this.interactions.add({
        id: 'welcome-sign',
        x: sign.prop.x,
        y: sign.prop.y + 14,
        radius: 110,
        label: 'Schild lesen',
        action: () => {
          audio.play('interact');
          ui.toast.show("Willkommen in Samya's World! 💖");
        },
      });
    }
    const parkSign = objects.get('park-sign');
    if (parkSign) {
      this.interactions.add({
        id: 'park-sign',
        x: parkSign.prop.x,
        y: parkSign.prop.y + 14,
        radius: 110,
        label: 'Schild lesen',
        action: () => {
          audio.play('interact');
          ui.toast.show('Samyas Lieblingspark 🌸');
        },
      });
    }

    // Brunnen
    this.sparkles = Array.from({ length: 14 }, () => this.add.image(0, 0, TextureKeys.Sparkle).setVisible(false));
    const fountain = objects.get('fountain');
    if (fountain) {
      this.interactions.add({
        id: 'fountain',
        x: fountain.prop.x,
        y: fountain.prop.y + 12,
        radius: 150,
        label: 'Brunnen bestaunen',
        action: () => {
          audio.play('sparkle');
          this.sparkleBurst(fountain.prop.x, fountain.prop.y - 70);
          tasks.report('fountain');
          ui.toast.show(`Plitsch, platsch! Der Brunnen glitzert für dich, ${name}! ✨`);
        },
      });
    }

    // Eingänge der betretbaren Gebäude
    for (const def of Object.values(BUILDINGS)) {
      if (!def.interior || !def.enterLabel) continue;
      const base = buildingBase(def.id);
      this.interactions.add({
        id: `door-${def.id}`,
        x: base.x,
        y: base.y + 30,
        radius: DOOR_RADIUS,
        label: def.enterLabel,
        action: () => this.enter(def.id),
      });
    }
    // Wer gerade herauskommt, soll nicht sofort wieder hineingehen.
    if (this.sceneData.returnFrom) this.interactions.suppressUntilLeft(`door-${this.sceneData.returnFrom}`);

    // Autos
    this.cars = new CarSystem(this, this.layout.lanes, this.world.width, () => ({ x: this.player.x, y: this.player.y }));
    this.world.collisions.addDynamicSource(() => this.cars?.solids() ?? []);

    // Entdecken: Startort zählt sofort (ohne Hinweis), danach mit kleiner Meldung
    this.checkDiscoveries(true);
    this.time.addEvent({ delay: 500, loop: true, callback: () => this.checkDiscoveries(false) });

    // Position regelmäßig und beim Verlassen der Seite speichern
    this.lastSaved = { x: this.player.x, y: this.player.y };
    this.time.addEvent({ delay: 3000, loop: true, callback: () => this.savePosition(false) });
    window.addEventListener('pagehide', this.saveNow);
    document.addEventListener('visibilitychange', this.onVisibility);

    this.greet(name);
  }

  protected override onShutdown(): void {
    window.removeEventListener('pagehide', this.saveNow);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.cars = null;
  }

  protected override onUpdate(_time: number, delta: number): void {
    this.cars?.update(delta);
  }

  protected override goHome(): void {
    this.enter('home');
  }

  protected override backToMenu(): void {
    this.savePosition(true);
    super.backToMenu();
  }

  private greet(name: string): void {
    const ui = getUI();
    if (this.sceneData.returnFrom) return;
    if (this.sceneData.firstVisit) {
      this.time.delayedCall(700, () => ui.toast.queue(`Hallo ${name}! Lauf mit dem Joystick los und entdecke deine Stadt. 💖`));
    } else if (!greetedThisSession) {
      this.time.delayedCall(700, () => ui.toast.queue(`Willkommen zurück, ${name}! Deine Stadt wartet auf dich! 💖`));
    }
    greetedThisSession = true;
  }

  private enter(id: BuildingId): void {
    const interior = BUILDINGS[id].interior;
    if (!interior) return;
    audio.play('open');
    this.enteringBuilding = true;
    // Beim Neuladen im Gebäude startet man wieder vor dessen Tür.
    const front = doorFront(id);
    saves.setCityPosition(front.x, front.y);
    if (saves.discover(id)) tasks.report('discover');
    const data: InteriorSceneData = { interior };
    this.goTo(SCENES.Interior, data);
  }

  private checkDiscoveries(silent: boolean): void {
    if (!saves.hasSave) return;
    const { x, y } = this.player;
    const found: string[] = [];
    for (const zone of this.layout.zones) {
      const r = zone.rect;
      const inside = x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      if (inside && zone.id === 'park') tasks.report('visit-park');
      if (inside && saves.discover(zone.id)) found.push(zone.name);
    }
    for (const def of Object.values(BUILDINGS)) {
      if (!def.discoverable) continue;
      const front = doorFront(def.id);
      if (Math.hypot(front.x - x, front.y - y) < DISCOVER_RADIUS && saves.discover(def.id)) found.push(def.name);
    }
    if (found.length > 0 && !silent) {
      audio.play('sparkle');
      getUI().toast.queue(`Neuer Ort entdeckt: ${found[0]}! ✨`);
      tasks.report('discover');
    }
  }

  private savePosition(force: boolean): void {
    if (!saves.hasSave || !this.player || this.enteringBuilding) return;
    const { x, y } = this.player;
    if (!force && Math.hypot(x - this.lastSaved.x, y - this.lastSaved.y) < 24) return;
    this.lastSaved = { x, y };
    saves.setCityPosition(x, y);
  }

  /** Kleiner Glitzerregen über dem Brunnen (dezent; bei „Ruhig“ nur kurz eingeblendet). */
  private sparkleBurst(x: number, y: number): void {
    const calm = this.calm;
    this.sparkles.forEach((sparkle, i) => {
      this.tweens.killTweensOf(sparkle);
      const angle = (Math.PI * 2 * i) / this.sparkles.length;
      const distance = 50 + (i % 3) * 25;
      sparkle
        .setPosition(x + Math.cos(angle) * 20, y + Math.sin(angle) * 10)
        .setDepth(y + 400)
        .setAlpha(1)
        .setScale(0.5 / ASSET_SCALE)
        .setVisible(true);
      this.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance * 0.6 - (calm ? 0 : 40),
        scale: (calm ? 0.5 : 0.9) / ASSET_SCALE,
        alpha: 0,
        duration: calm ? 600 : 1100 + (i % 4) * 120,
        ease: 'Quad.Out',
        onComplete: () => sparkle.setVisible(false),
      });
    });
  }
}
