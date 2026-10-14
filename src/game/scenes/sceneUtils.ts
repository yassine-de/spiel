import type Phaser from 'phaser';
import { renderQuality } from '../managers/QualityManager';

/** Sichtbarer Bereich in Welt-Einheiten (die Höhe ist im Querformat immer ≥ 720). */
export function viewSize(scene: Phaser.Scene): { width: number; height: number } {
  return { width: scene.scale.width / renderQuality.scale, height: scene.scale.height / renderQuality.scale };
}

/** Passt Kameragröße und Zoom an die aktuelle Spielfläche und Qualitätsstufe an. */
export function fitCamera(scene: Phaser.Scene): void {
  const camera = scene.cameras.main;
  camera.setSize(scene.scale.width, scene.scale.height);
  camera.setZoom(renderQuality.scale);
}

/** Registriert einen Resize-Handler, der beim Beenden der Szene automatisch entfernt wird. */
export function onResize(scene: Phaser.Scene, handler: () => void): void {
  scene.scale.on('resize', handler);
  scene.events.once('shutdown', () => scene.scale.off('resize', handler));
}
