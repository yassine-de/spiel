import type { QualitySetting, ReducedMotionSetting, Settings } from '../../storage/settingsStore';
import { audio, playClick, saves, settings } from '../services';
import { button, h } from './dom';
import { Icons } from './icons';
import { Modal } from './Modal';

interface Choice<T extends string> {
  value: T;
  label: string;
}

/** Einstellungen: Ton, Animationen, Grafikqualität, Vollbild. Alles wird sofort gespeichert. */
export class SettingsPanel extends Modal {
  private readonly refreshers: Array<(s: Readonly<Settings>) => void> = [];

  constructor(parent: HTMLElement) {
    super(parent, 'Einstellungen', { className: 'settings-card' });

    this.body.append(
      this.row('Töne', this.toggle()),
      this.row('Lautstärke', this.volumeSlider()),
      this.row(
        'Animationen',
        this.segmented<ReducedMotionSetting>(
          [
            { value: 'auto', label: 'Automatisch' },
            { value: 'off', label: 'Normal' },
            { value: 'on', label: 'Ruhig' },
          ],
          (s) => s.reducedMotion,
          (value) => settings.update({ reducedMotion: value }),
        ),
      ),
      this.row(
        'Grafik',
        this.segmented<QualitySetting>(
          [
            { value: 'auto', label: 'Automatisch' },
            { value: 'high', label: 'Hoch' },
            { value: 'low', label: 'Sparsam' },
          ],
          (s) => s.quality,
          (value) => settings.update({ quality: value }),
        ),
      ),
    );

    // Vollbild nur anbieten, wenn der Browser es kann (iPhone-Safari z. B. nicht).
    if (document.fullscreenEnabled) {
      this.body.append(
        h(
          'div',
          { class: 'settings-actions' },
          button(
            {
              label: 'Vollbild an/aus',
              icon: Icons.fullscreen,
              variant: 'secondary',
              onPress: () => void toggleFullscreen(),
            },
            playClick,
          ),
        ),
      );
    }

    // Spielstand: ehrlicher Hinweis + Zurücksetzen (nur wenn es etwas zu löschen gibt)
    this.resetButton = button(
      { label: 'Spielstand löschen', icon: Icons.trash, variant: 'secondary', onPress: () => this.onResetRequest?.() },
      playClick,
    );
    this.body.append(
      h(
        'div',
        { class: 'settings-save' },
        h('span', { class: 'settings-label', text: 'Spielstand' }),
        h('p', {
          class: 'settings-hint',
          text: 'Dein Spielstand wird nur in diesem Browser auf diesem Gerät gespeichert. Werden die Browserdaten gelöscht, ist er weg.',
        }),
        h('div', { class: 'settings-actions' }, this.resetButton),
      ),
    );

    settings.subscribe((s) => this.refresh(s));
    this.refresh(settings.get());
  }

  private readonly resetButton: HTMLButtonElement;
  /** Wird beim Tippen auf „Spielstand löschen“ aufgerufen (Bestätigung macht GameUI). */
  onResetRequest: (() => void) | null = null;

  override show(): void {
    this.resetButton.hidden = !saves.hasSave;
    super.show();
  }

  private refresh(s: Readonly<Settings>): void {
    for (const refresher of this.refreshers) refresher(s);
  }

  private row(label: string, control: HTMLElement): HTMLElement {
    return h('div', { class: 'settings-row' }, h('span', { class: 'settings-label', text: label }), control);
  }

  private toggle(): HTMLElement {
    const el = h('button', { class: 'toggle', attrs: { type: 'button', role: 'switch' } }, h('span', { class: 'toggle-knob' }));
    const text = h('span', { class: 'toggle-text' });
    el.addEventListener('click', () => {
      settings.update({ muted: !settings.get().muted });
      audio.play('click');
    });
    this.refreshers.push((s) => {
      el.classList.toggle('is-on', !s.muted);
      el.setAttribute('aria-checked', String(!s.muted));
      text.textContent = s.muted ? 'Aus' : 'An';
    });
    return h('div', { class: 'toggle-wrap' }, el, text);
  }

  private volumeSlider(): HTMLElement {
    const slider = h('input', {
      class: 'slider',
      attrs: { type: 'range', min: '0', max: '100', step: '5', 'aria-label': 'Lautstärke' },
    });
    slider.addEventListener('input', () => settings.update({ sfxVolume: Number(slider.value) / 100 }));
    slider.addEventListener('change', () => audio.play('click'));
    this.refreshers.push((s) => {
      slider.value = String(Math.round(s.sfxVolume * 100));
      slider.style.setProperty('--fill', `${Math.round(s.sfxVolume * 100)}%`);
      slider.disabled = s.muted;
    });
    return slider;
  }

  private segmented<T extends string>(
    choices: Choice<T>[],
    read: (s: Readonly<Settings>) => T,
    write: (value: T) => void,
  ): HTMLElement {
    const buttons = choices.map((choice) => {
      const el = h('button', { class: 'segment', text: choice.label, attrs: { type: 'button' } });
      el.addEventListener('click', () => {
        write(choice.value);
        playClick();
      });
      return { el, value: choice.value };
    });
    this.refreshers.push((s) => {
      const current = read(s);
      for (const b of buttons) {
        b.el.classList.toggle('is-active', b.value === current);
        b.el.setAttribute('aria-pressed', String(b.value === current));
      }
    });
    return h('div', { class: 'segmented' }, ...buttons.map((b) => b.el));
  }
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    // Querformat nur versuchen – wird nicht erzwungen, wenn der Browser es nicht kann.
    const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await orientation.lock?.('landscape').catch(() => undefined);
  } catch {
    // Vollbild wurde abgelehnt – das Spiel läuft normal weiter.
  }
}
