import Phaser from 'phaser';
import { DEFAULT_AVATAR } from '../avatar/avatarCatalog';
import { applyAvatarTexture } from '../avatar/avatarTexture';
import type { AvatarConfig } from '../avatar/avatarTypes';
import { SCENES } from '../config/constants';
import { keyboard, reducedMotion, saves } from '../services';
import { getUI } from '../ui';
import type { EditorMode } from '../ui/AvatarEditor';
import { MenuBackdrop } from './MenuBackdrop';
import { fitCamera, onResize, viewSize } from './sceneUtils';

export interface AvatarSceneData {
  mode: EditorMode;
  /** Wohin es danach geht: Hauptmenü oder (pausierte bzw. neue) Spielwelt */
  returnTo: 'menu' | 'world';
  /** Pausierte Szene, zu der zurückgekehrt wird (Bearbeiten mitten im Spiel) */
  worldScene?: string;
}

/**
 * Avatar-Editor. Beim ersten Spielstart legt er den Spielstand an;
 * danach kann der Avatar jederzeit bearbeitet werden – auch mitten im Spiel
 * (die Spielwelt wartet pausiert im Hintergrund, die Position bleibt erhalten).
 */
export class AvatarCreatorScene extends Phaser.Scene {
  private backdrop!: MenuBackdrop;
  private settings: AvatarSceneData = { mode: 'create', returnTo: 'world' };

  constructor() {
    super(SCENES.AvatarCreator);
  }

  init(data: Partial<AvatarSceneData>): void {
    this.settings = { mode: data.mode ?? 'create', returnTo: data.returnTo ?? 'world', worldScene: data.worldScene };
  }

  create(): void {
    const ui = getUI();
    const { mode } = this.settings;
    // Über einer pausierten Spielwelt muss der Editor oben liegen.
    this.scene.bringToTop();
    const layout = () => {
      fitCamera(this);
      const { width, height } = viewSize(this);
      this.cameras.main.centerOn(width / 2, height / 2);
    };
    layout();
    this.backdrop = new MenuBackdrop(this, { scrolling: false, trees: false, hearts: true, calm: reducedMotion() });
    onResize(this, () => {
      layout();
      this.backdrop.layout();
    });

    const previousPause = keyboard.onPause;
    keyboard.onPause = () => ui.editor.cancel();
    this.events.once('shutdown', () => {
      keyboard.onPause = previousPause;
      ui.editor.close();
    });

    ui.editor.open(mode, saves.hasSave ? saves.avatar : { ...DEFAULT_AVATAR }, {
      onConfirm: (avatar) => this.finish(avatar),
      onCancel: mode !== 'create' ? () => this.finish(null) : undefined,
    });
  }

  override update(_time: number, delta: number): void {
    this.backdrop.update(delta);
  }

  private finish(avatar: AvatarConfig | null): void {
    const ui = getUI();
    if (avatar) {
      const saved = this.settings.mode === 'create' ? saves.create(avatar) : saves.setAvatar(avatar);
      applyAvatarTexture(this.textures, saves.avatar);
      if (!saved) ui.toast.show('Hinweis: Auf diesem Gerät kann gerade nicht gespeichert werden.', 5000);
    }

    if (this.settings.returnTo === 'menu') {
      this.scene.start(SCENES.MainMenu);
    } else if (this.settings.mode === 'create') {
      this.scene.start(SCENES.City, { firstVisit: true });
    } else {
      // Zurück in die pausierte Spielwelt
      this.scene.stop();
      this.scene.resume(this.settings.worldScene ?? SCENES.City);
    }
  }
}
