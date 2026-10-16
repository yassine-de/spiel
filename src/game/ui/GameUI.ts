import { clearDrawing } from '../../storage/drawingStore';
import type { AvatarConfig } from '../avatar/avatarTypes';
import { ActivityPanel } from './ActivityPanel';
import { audio, saves, tasks } from '../services';
import { AvatarEditor } from './AvatarEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { h } from './dom';
import { Hud, type HudHandlers } from './Hud';
import { InventoryPanel } from './InventoryPanel';
import { LoadingScreen } from './LoadingScreen';
import { MainMenu, type MainMenuHandlers } from './MainMenu';
import { PauseMenu, type PauseMenuHandlers } from './PauseMenu';
import { RotateHint } from './RotateHint';
import { SettingsPanel } from './SettingsPanel';
import { ShopPanel } from './ShopPanel';
import { TasksPanel } from './TasksPanel';
import { Toast } from './Toast';

/**
 * Die HTML-Oberfläche über der Spielwelt. Szenen steuern sie über
 * die Handler-Objekte, die sie beim Betreten setzen.
 */
export class GameUI {
  readonly loading: LoadingScreen;
  readonly mainMenu: MainMenu;
  readonly hud: Hud;
  readonly editor: AvatarEditor;
  readonly settings: SettingsPanel;
  readonly pause: PauseMenu;
  readonly confirm: ConfirmDialog;
  readonly toast: Toast;
  readonly shop: ShopPanel;
  readonly inventory: InventoryPanel;
  readonly tasks: TasksPanel;
  /** Spiele und Aktionen in Salon, Café und Schule */
  readonly activity: ActivityPanel;

  /**
   * Ändert den Avatar dauerhaft (Spielstand + Spielfigur).
   * Wird in main.ts gesetzt, weil dafür das Phaser-Spiel gebraucht wird.
   */
  applyAvatarHook: (avatar: AvatarConfig) => void = () => undefined;

  /** Austauschbare Handler – die aktive Szene setzt sie. */
  mainMenuHandlers: MainMenuHandlers = { onPlay: () => undefined, onSettings: () => undefined, onAvatar: () => undefined };
  hudHandlers: HudHandlers = {
    onPause: () => undefined,
    onSettings: () => undefined,
    onAvatar: () => undefined,
    onInventory: () => undefined,
    onTasks: () => undefined,
    onWardrobe: () => undefined,
    onHome: () => undefined,
  };
  pauseHandlers: PauseMenuHandlers = { onResume: () => undefined, onSettings: () => undefined, onMainMenu: () => undefined };

  constructor(root: HTMLElement) {
    const screens = h('div', { class: 'layer layer-screens' });
    const hudLayer = h('div', { class: 'layer layer-hud' });
    const editorLayer = h('div', { class: 'layer layer-editor' });
    const toastLayer = h('div', { class: 'layer layer-toast' });
    const modalLayer = h('div', { class: 'layer layer-modal' });
    const topLayer = h('div', { class: 'layer layer-top' });
    root.append(screens, hudLayer, editorLayer, toastLayer, modalLayer, topLayer);

    this.mainMenu = new MainMenu(screens, {
      onPlay: () => this.mainMenuHandlers.onPlay(),
      onSettings: () => this.mainMenuHandlers.onSettings(),
      onAvatar: () => this.mainMenuHandlers.onAvatar(),
    });
    this.hud = new Hud(hudLayer, {
      onPause: () => this.hudHandlers.onPause(),
      onSettings: () => this.hudHandlers.onSettings(),
      onAvatar: () => this.hudHandlers.onAvatar(),
      onInventory: () => this.hudHandlers.onInventory(),
      onTasks: () => this.hudHandlers.onTasks(),
      onWardrobe: () => this.hudHandlers.onWardrobe(),
      onHome: () => this.hudHandlers.onHome(),
    });
    this.editor = new AvatarEditor(editorLayer);
    this.shop = new ShopPanel(editorLayer, {
      applyAvatar: (avatar) => this.applyAvatar(avatar),
      refreshCoins: () => this.refreshCoins(),
      toast: (message, duration) => this.toast.show(message, duration),
    });
    this.toast = new Toast(toastLayer);
    this.pause = new PauseMenu(modalLayer, {
      onResume: () => this.pauseHandlers.onResume(),
      onSettings: () => this.pauseHandlers.onSettings(),
      onMainMenu: () => this.pauseHandlers.onMainMenu(),
    });
    this.settings = new SettingsPanel(modalLayer);
    this.confirm = new ConfirmDialog(modalLayer);
    this.inventory = new InventoryPanel(modalLayer, (avatar) => this.applyAvatar(avatar));
    this.inventory.notify = (message) => this.toast.show(message);
    this.tasks = new TasksPanel(modalLayer);
    this.activity = new ActivityPanel(modalLayer);
    // Erledigte Tagesaufgabe: Münzen gutschreiben und freundlich melden
    tasks.onCompleted((task) => {
      audio.play('coin');
      this.refreshCoins();
      this.toast.queue(`Aufgabe geschafft: ${task.title}! +${task.reward} Münzen 🪙`);
    });
    this.settings.onResetRequest = () => void this.confirmReset();
    this.loading = new LoadingScreen(topLayer);
    new RotateHint(topLayer);
  }

  applyAvatar(avatar: AvatarConfig): void {
    this.applyAvatarHook(avatar);
    this.hud.setPlayer(saves.playerName, saves.avatar);
  }

  refreshCoins(): void {
    this.hud.setCoins(saves.coins);
  }

  /** Ist gerade ein Fenster offen, das Spielmeldungen nicht stören sollen? */
  get busy(): boolean {
    return (
      this.shop.isOpen ||
      this.editor.isOpen ||
      this.inventory.isOpen ||
      this.tasks.isOpen ||
      this.pause.isOpen ||
      this.settings.isOpen ||
      this.activity.isOpen
    );
  }

  private async confirmReset(): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Spielstand löschen?',
      message: `Dein Avatar und alles Gespeicherte werden gelöscht. Das kann man nicht rückgängig machen.`,
      cancelLabel: 'Nein, behalten 💖',
      confirmLabel: 'Ja, alles löschen',
    });
    if (!ok) return;
    saves.reset();
    clearDrawing();
    // Sauberer Neustart mit leerem Spielstand
    window.location.reload();
  }
}
