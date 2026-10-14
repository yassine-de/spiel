import Phaser from 'phaser';
import { DEPTH, SCENES } from '../config/constants';
import { Player } from '../entities/Player';
import { renderQuality } from '../managers/QualityManager';
import { input, keyboard, reducedMotion, saves } from '../services';
import { InteractionManager } from '../systems/InteractionManager';
import { PlayerController } from '../systems/PlayerController';
import type { Direction, Rect, Vec2 } from '../types';
import { getUI } from '../ui';
import { DEBUG_ENABLED, DebugOverlay } from '../ui/DebugOverlay';
import type { WorldLayout } from '../world/cityLayout';
import { type BuiltWorld, buildWorld } from '../world/WorldBuilder';
import { fitCamera, onResize } from './sceneUtils';

export interface StartPoint extends Vec2 {
  facing: Direction;
}

/**
 * Gemeinsame Grundlage für alle begehbaren Orte (Stadt und Innenräume):
 * Figur, Steuerung, Kamera, Interaktionen, HUD, Pause, Avatar-Bearbeitung, Debug.
 */
export abstract class WorldScene extends Phaser.Scene {
  protected player!: Player;
  protected controller!: PlayerController;
  protected interactions!: InteractionManager;
  protected world!: BuiltWorld;
  protected calm = false;
  private debug: DebugOverlay | null = null;
  private leaving = false;

  /** Kartendaten des Ortes. */
  protected abstract createLayout(): WorldLayout;
  /** Wo die Figur beim Betreten steht. */
  protected abstract startPoint(layout: WorldLayout): StartPoint;
  /** Interaktionen, Umgebung usw. – nach dem Aufbau der Welt. */
  protected abstract setupPlace(layout: WorldLayout): void;
  /** Kamerabegrenzung in Welt-Einheiten. */
  protected cameraBounds(): Rect {
    return { x: 0, y: 0, w: this.world.width, h: this.world.height };
  }

  create(): void {
    const ui = getUI();
    this.leaving = false;
    this.calm = reducedMotion();
    const layout = this.createLayout();
    this.world = buildWorld(this, layout, { reducedMotion: this.calm });

    const start = this.startPoint(layout);
    this.player = new Player(this, start.x, start.y);
    this.player.animate(false, start.facing, 0);
    this.controller = new PlayerController(this.player, this.world.collisions, input);
    this.interactions = new InteractionManager((item) => ui.hud.setInteraction(item?.label ?? null));

    this.setupPlace(layout);

    // Kamera
    const camera = this.cameras.main;
    const applyCamera = () => {
      fitCamera(this);
      const b = this.cameraBounds();
      camera.setBounds(b.x, b.y, b.w, b.h);
    };
    applyCamera();
    const lerp = this.calm ? 1 : 0.12;
    camera.startFollow(this.player.sprite, false, lerp, lerp);
    camera.setFollowOffset(0, 40);
    camera.fadeIn(this.calm ? 0 : 350, 255, 240, 246);
    onResize(this, applyCamera);

    // Oberfläche
    ui.hud.show();
    ui.hud.setPlayer(saves.playerName, saves.avatar);
    ui.hud.setCoins(saves.coins);
    ui.hudHandlers = {
      onPause: () => this.openPause(),
      onSettings: () => ui.settings.show(),
      onAvatar: () => this.editAvatar('edit'),
      onInventory: () => ui.inventory.show(),
      onTasks: () => ui.tasks.show(),
      onWardrobe: () => this.openWardrobe(),
      onHome: () => this.goHome(),
    };
    ui.hud.setHomeVisible(this.canGoHome());
    ui.pauseHandlers = {
      onResume: () => this.resumeGame(),
      onSettings: () => ui.settings.show(),
      onMainMenu: () => this.backToMenu(),
    };
    keyboard.onPause = () => {
      if (ui.shop.isOpen) ui.shop.close();
      else if (ui.inventory.isOpen) ui.inventory.hide();
      else if (ui.tasks.isOpen) ui.tasks.hide();
      else if (ui.settings.isOpen) ui.settings.hide();
      else if (ui.pause.isOpen) this.resumeGame();
      else this.openPause();
    };
    // Rückkehr aus dem Avatar-Editor: neuen Look in der Oberfläche zeigen
    this.events.on('resume', () => {
      if (ui.pause.isOpen) return;
      ui.hud.show();
      ui.hud.setPlayer(saves.playerName, saves.avatar);
      ui.hud.setInteraction(this.interactions.active?.label ?? null);
    });

    if (DEBUG_ENABLED) this.enableDebug();

    this.events.once('shutdown', () => {
      ui.shop.close();
      ui.inventory.hide();
      ui.tasks.hide();
      ui.hud.hide();
      keyboard.onPause = null;
      this.events.off('resume');
      this.interactions.clear();
      this.debug = null;
      this.onShutdown();
    });
  }

  /** Aufräumen beim Verlassen der Szene. */
  protected onShutdown(): void {}

  /** Zusätzliche Logik pro Bild (z. B. Autos). */
  protected onUpdate(_time: number, _delta: number): void {}

  override update(time: number, delta: number): void {
    this.controller.update(delta);
    this.onUpdate(time, delta);
    this.interactions.update(this.player.x, this.player.y);
    if (input.consumeInteract()) this.interactions.trigger();
    this.debug?.update(time, {
      FPS: Math.round(this.game.loop.actualFps),
      Ort: this.scene.key,
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      Blick: this.player.facing,
      Auflösung: `${renderQuality.scale}×`,
    });
  }

  /** Sanfter Szenenwechsel; Eingaben sind währenddessen gesperrt. */
  protected goTo(sceneKey: string, data?: object): void {
    if (this.leaving) return;
    this.leaving = true;
    input.block('scene-change');
    getUI().hud.setInteraction(null);
    const finish = () => {
      input.unblock('scene-change');
      this.scene.start(sceneKey, data);
    };
    if (this.calm) {
      finish();
      return;
    }
    this.cameras.main.fadeOut(260, 255, 240, 246);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, finish);
  }

  /** Kann Samya von hier aus direkt nach Hause gehen? */
  protected canGoHome(): boolean {
    return true;
  }

  /** Direkt nach Hause (vom HUD-Button). */
  protected goHome(): void {}

  /** Kleiderschrank: nur Kleidung wechseln (Grundausstattung + Gekauftes). */
  protected openWardrobe(): void {
    this.editAvatar('wardrobe');
  }

  /** Avatar mitten im Spiel ändern: Welt pausiert, Position bleibt erhalten. */
  private editAvatar(mode: 'edit' | 'wardrobe'): void {
    const ui = getUI();
    if (ui.pause.isOpen || ui.editor.isOpen || this.leaving) return;
    ui.settings.hide();
    ui.hud.hide();
    ui.toast.hide();
    this.scene.pause();
    this.scene.launch(SCENES.AvatarCreator, { mode, returnTo: 'world', worldScene: this.scene.key });
  }

  private openPause(): void {
    const ui = getUI();
    if (ui.pause.isOpen || this.leaving) return;
    ui.pause.show();
    this.scene.pause();
  }

  private resumeGame(): void {
    const ui = getUI();
    ui.settings.hide();
    ui.pause.hide();
    this.scene.resume();
  }

  protected backToMenu(): void {
    getUI().pause.hide();
    this.scene.resume();
    this.scene.start(SCENES.MainMenu);
  }

  private enableDebug(): void {
    this.debug = new DebugOverlay(document.getElementById('ui')!);
    const graphics = this.add.graphics().setDepth(DEPTH.overlay);
    graphics.lineStyle(2, 0xff3388, 0.8);
    for (const s of this.world.solids) graphics.strokeRect(s.x, s.y, s.w, s.h);
    (window as unknown as { __samya: unknown }).__samya = {
      scene: () => this.scene.key,
      player: () => ({ x: this.player.x, y: this.player.y, facing: this.player.facing }),
      interaction: () => this.interactions.active?.label ?? null,
      blocked: () => input.isBlocked,
      /** Übersicht: ganze Karte zeigen (true) bzw. wieder der Figur folgen (false) */
      overview: (on: boolean) => {
        const camera = this.cameras.main;
        if (on) {
          camera.stopFollow();
          camera.removeBounds();
          camera.setZoom(Math.min(camera.width / this.world.width, camera.height / this.world.height));
          camera.centerOn(this.world.width / 2, this.world.height / 2);
        } else {
          fitCamera(this);
          const b = this.cameraBounds();
          camera.setBounds(b.x, b.y, b.w, b.h);
          camera.startFollow(this.player.sprite, false, 1, 1);
        }
      },
      teleport: (x: number, y: number) => this.player.setPosition(x, y),
    };
    this.events.once('shutdown', () => {
      graphics.destroy();
      document.querySelector('.debug-overlay')?.remove();
    });
  }
}
