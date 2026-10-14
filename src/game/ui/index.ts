import { GameUI } from './GameUI';

let instance: GameUI | null = null;

export function initUI(root: HTMLElement): GameUI {
  instance = new GameUI(root);
  return instance;
}

/** Zugriff auf die HTML-Oberfläche aus den Szenen. */
export function getUI(): GameUI {
  if (!instance) throw new Error('UI wurde noch nicht initialisiert');
  return instance;
}
