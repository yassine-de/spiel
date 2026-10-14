/**
 * Gemeinsam genutzte Dienste. Einfache Modul-Singletons statt eines DI-Containers:
 * Das Spiel hat genau eine Instanz von jedem.
 */
import { SaveManager } from '../storage/saveManager';
import { SettingsStore } from '../storage/settingsStore';
import { KeyboardInput } from './input/KeyboardInput';
import { InputState } from './input/InputState';
import { AudioManager } from './managers/AudioManager';
import { isReducedMotion } from './managers/QualityManager';
import { TaskManager } from './tasks/TaskManager';
import { discoverablePlaceIds } from './world/cityLayout';

export const settings = new SettingsStore();
export const audio = new AudioManager();
export const input = new InputState();
export const keyboard = new KeyboardInput(input);
export const saves = new SaveManager();
/** Ergebnis des Ladens beim Start: leer, geladen oder aus einem kaputten Stand neu begonnen. */
export const saveLoadStatus = saves.load();
export const tasks = new TaskManager(saves, () => discoverablePlaceIds().some((id) => !saves.hasDiscovered(id)));

audio.applySettings(settings.get());
settings.subscribe((s) => audio.applySettings(s));

export const playClick = (): void => audio.play('click');

export function reducedMotion(): boolean {
  return isReducedMotion(settings.get().reducedMotion);
}
