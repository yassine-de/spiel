import Phaser from 'phaser';
import { AvatarCreatorScene } from '../scenes/AvatarCreatorScene';
import { BootScene } from '../scenes/BootScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { CityScene } from '../scenes/CityScene';
import { InteriorScene } from '../scenes/InteriorScene';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from './constants';

export function createGameConfig(renderScale: number): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#bfe9c4',
    // EXPAND füllt jeden Bildschirm ohne schwarze Ränder; die Basisgröße bleibt immer sichtbar.
    scale: {
      mode: Phaser.Scale.EXPAND,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: DESIGN_WIDTH * renderScale,
      height: DESIGN_HEIGHT * renderScale,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
      powerPreference: 'default',
    },
    // `?debug=timer`: Spielschleife per Timer statt requestAnimationFrame
    // (nur für automatisierte Tests in ausgeblendeten Browserfenstern).
    fps: { target: 60, smoothStep: true, forceSetTimeOut: new URLSearchParams(location.search).get('debug') === 'timer' },
    // Eingaben laufen über die HTML-Oberfläche (Joystick, Buttons, Tastatur).
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    // Eigenes Audiosystem (AudioManager), Phaser-Sound wird nicht gebraucht.
    audio: { noAudio: true },
    disableContextMenu: true,
    banner: false,
    scene: [BootScene, PreloadScene, MainMenuScene, AvatarCreatorScene, CityScene, InteriorScene],
  };
}
