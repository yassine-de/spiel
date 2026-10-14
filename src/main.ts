import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-700.css';
import './styles/main.css';

import Phaser from 'phaser';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from './game/config/constants';
import { createGameConfig } from './game/config/gameConfig';
import { computeRenderScale, readDeviceInfo, renderQuality } from './game/managers/QualityManager';
import { applyAvatarTexture } from './game/avatar/avatarTexture';
import { audio, input, reducedMotion, saves, settings } from './game/services';
import { initUI } from './game/ui';

function bootstrap(): void {
  const uiRoot = document.getElementById('ui');
  if (!uiRoot) throw new Error('#ui fehlt in index.html');
  const ui = initUI(uiRoot);

  // Ruhige Animationen auch in der HTML-Oberfläche
  const applyMotion = () => document.documentElement.toggleAttribute('data-calm', reducedMotion());
  applyMotion();
  settings.subscribe(applyMotion);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', applyMotion);

  // Audio darf erst nach einer Berührung starten
  const unlockAudio = () => audio.unlock();
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio);

  // Beim App-Wechsel keine „hängenden“ Eingaben
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) input.reset();
  });

  // Browser-Gesten (Zoomen, Kontextmenü, Doppeltipp) im Spiel unterdrücken
  for (const type of ['gesturestart', 'gesturechange', 'dblclick', 'contextmenu']) {
    document.addEventListener(type, (event) => event.preventDefault(), { passive: false });
  }

  renderQuality.scale = computeRenderScale(settings.get().quality, readDeviceInfo());
  const game = new Phaser.Game(createGameConfig(renderQuality.scale));

  // Kleidung aus Laden oder Inventar anziehen: speichern und Spielfigur neu zeichnen
  ui.applyAvatarHook = (avatar) => {
    saves.setAvatar(avatar);
    applyAvatarTexture(game.textures, saves.avatar);
  };

  // Qualitätsstufe ohne Neustart wechseln
  settings.subscribe((current, previous) => {
    if (current.quality === previous.quality) return;
    renderQuality.scale = computeRenderScale(current.quality, readDeviceInfo());
    // Im EXPAND-Modus rechnet Phaser mit game.config als Basisgröße (setGameSize wirkt dort nicht).
    const config = game.config as unknown as { width: number; height: number };
    config.width = DESIGN_WIDTH * renderQuality.scale;
    config.height = DESIGN_HEIGHT * renderQuality.scale;
    game.scale.refresh();
  });
}

bootstrap();
