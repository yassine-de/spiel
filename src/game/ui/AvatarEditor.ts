import {
  BODY_TYPES,
  EXPRESSIONS,
  EYE_COLORS,
  EYE_SHAPES,
  HAIR_COLORS,
  HAIR_STYLES,
  MOUTHS,
  SKIN_TONES,
  applyChoice,
  getItem,
  isAvailable,
  itemsInCategories,
  randomAvatar,
} from '../avatar/avatarCatalog';
import type { AvatarConfig, ItemCategory } from '../avatar/avatarTypes';
import { THUMB_REGIONS, drawAvatarThumbnail, type ThumbRegion } from '../assets/placeholders/avatar/avatarPainter';
import { audio, input, playClick, saves } from '../services';
import type { Direction } from '../types';
import { button, h } from './dom';
import { Icons } from './icons';

/** create = erster Start, edit = alles ändern, wardrobe = Kleiderschrank (nur Kleidung) */
export type EditorMode = 'create' | 'edit' | 'wardrobe';

export interface EditorHandlers {
  onConfirm: (avatar: AvatarConfig) => void;
  onCancel?: () => void;
}

interface Option {
  value: string | null;
  label: string;
  /** Farbkreis statt Vorschaubild */
  swatch?: string;
}

interface Group {
  label: string;
  key: keyof AvatarConfig;
  options: Option[];
  region: ThumbRegion;
  /** Nur anzeigen/markieren, wenn diese Bedingung erfüllt ist */
  note?: (avatar: AvatarConfig) => string | null;
}

interface Tab {
  id: string;
  label: string;
  icon: string;
  groups: Group[];
}

const named = <T extends string>(list: { id: T; name: string }[]): Option[] => list.map((o) => ({ value: o.id, label: o.name }));
const colors = (list: { id: string; name: string; color: string; color2?: string }[]): Option[] =>
  list.map((o) => ({ value: o.id, label: o.name, swatch: o.color2 ? `linear-gradient(90deg, ${o.color} 50%, ${o.color2} 50%)` : o.color }));
const items = (categories: ItemCategory[], withNone = false): Option[] => [
  ...(withNone ? [{ value: null, label: 'Ohne' }] : []),
  ...itemsInCategories(categories).map((item) => ({ value: item.id, label: item.name })),
];

const wearsDress = (a: AvatarConfig) => getItem(a.top)?.category === 'dress';

const TABS: Tab[] = [
  {
    id: 'body',
    label: 'Ich',
    icon: Icons.person,
    groups: [
      { label: 'Charakter', key: 'body', options: named(BODY_TYPES), region: 'full' },
      { label: 'Hautfarbe', key: 'skin', options: colors(SKIN_TONES), region: 'head' },
    ],
  },
  {
    id: 'face',
    label: 'Gesicht',
    icon: Icons.smile,
    groups: [
      { label: 'Augen', key: 'eyeShape', options: named(EYE_SHAPES), region: 'head' },
      { label: 'Augenfarbe', key: 'eyeColor', options: colors(EYE_COLORS), region: 'head' },
      { label: 'Mund', key: 'mouth', options: named(MOUTHS), region: 'head' },
      { label: 'Gesichtsausdruck', key: 'expression', options: named(EXPRESSIONS), region: 'head' },
    ],
  },
  {
    id: 'hair',
    label: 'Haare',
    icon: Icons.hair,
    groups: [
      { label: 'Frisur', key: 'hairStyle', options: named(HAIR_STYLES), region: 'head' },
      { label: 'Haarfarbe', key: 'hairColor', options: colors(HAIR_COLORS), region: 'head' },
    ],
  },
  {
    id: 'clothes',
    label: 'Kleidung',
    icon: Icons.shirt,
    groups: [
      { label: 'T-Shirts', key: 'top', options: items(['tshirt']), region: 'body' },
      { label: 'Pullover', key: 'top', options: items(['pullover']), region: 'body' },
      { label: 'Jacken', key: 'top', options: items(['jacket']), region: 'body' },
      { label: 'Kleider', key: 'top', options: items(['dress']), region: 'legs' },
      {
        label: 'Röcke',
        key: 'bottom',
        options: items(['skirt']),
        region: 'legs',
        note: (a) => (wearsDress(a) ? 'Du trägst gerade ein Kleid 👗' : null),
      },
      {
        label: 'Hosen',
        key: 'bottom',
        options: items(['pants']),
        region: 'legs',
        note: (a) => (wearsDress(a) ? 'Du trägst gerade ein Kleid 👗' : null),
      },
      { label: 'Schuhe', key: 'shoes', options: items(['shoes']), region: 'feet' },
    ],
  },
  {
    id: 'extras',
    label: 'Extras',
    icon: Icons.sparkle,
    groups: [
      { label: 'Brillen', key: 'glasses', options: items(['glasses'], true), region: 'head' },
      { label: 'Schleifen & Haarbänder', key: 'hairAccessory', options: items(['bow', 'headband'], true), region: 'head' },
      { label: 'Hüte', key: 'hat', options: items(['hat'], true), region: 'head' },
      { label: 'Taschen', key: 'bag', options: items(['bag'], true), region: 'body' },
    ],
  },
];

const ROTATION: Direction[] = ['down', 'left', 'up', 'right'];
const THUMB_PX = Math.min(2, Math.max(1, Math.round(window.devicePixelRatio || 1))) * 64;

/**
 * Avatar-Editor: Jede Änderung ist sofort in der großen Vorschau
 * und in allen Vorschaubildern sichtbar.
 */
export class AvatarEditor {
  readonly el: HTMLElement;
  private readonly title: HTMLElement;
  private readonly subtitle: HTMLElement;
  private readonly preview: HTMLCanvasElement;
  private readonly previewWrap: HTMLElement;
  private readonly tabBar: HTMLElement;
  private readonly options: HTMLElement;
  private readonly actions: HTMLElement;
  private readonly walkButton: HTMLButtonElement;
  private draft: AvatarConfig | null = null;
  private handlers: EditorHandlers | null = null;
  private activeTab = TABS[0].id;
  /** Sichtbare Reiter (im Kleiderschrank nur Kleidung) */
  private tabs: Tab[] = TABS;
  private mode: EditorMode = 'create';
  private direction: Direction = 'down';
  private walkTimer: number | undefined;
  private walkColumn = 0;
  private visible = false;

  constructor(parent: HTMLElement) {
    this.title = h('h1', { class: 'editor-title' });
    this.subtitle = h('p', { class: 'editor-subtitle' });
    this.preview = h('canvas', {
      class: 'editor-preview-canvas',
      attrs: { width: String(THUMB_REGIONS.full.w * 2), height: String(THUMB_REGIONS.full.h * 2), role: 'img', 'aria-label': 'Vorschau deines Avatars' },
    });
    this.walkButton = button(
      { label: 'Laufen', icon: Icons.walk, variant: 'icon', onPress: () => this.toggleWalk() },
      playClick,
    );
    this.previewWrap = h('div', { class: 'editor-preview-figure' }, this.preview);
    this.tabBar = h('div', { class: 'editor-tabs', attrs: { role: 'tablist' } });
    this.options = h('div', { class: 'editor-options' });
    this.actions = h('div', { class: 'editor-actions' });

    this.el = h(
      'div',
      { class: 'avatar-editor', attrs: { hidden: '' } },
      h('header', { class: 'editor-header' }, this.title, this.subtitle),
      h(
        'section',
        { class: 'editor-preview' },
        this.previewWrap,
        h(
          'div',
          { class: 'editor-preview-tools' },
          button({ label: 'Drehen', icon: Icons.rotate, variant: 'icon', onPress: () => this.rotate() }, playClick),
          this.walkButton,
          button({ label: 'Überrasch mich!', icon: Icons.dice, variant: 'icon', onPress: () => this.surprise() }, () => audio.play('sparkle')),
        ),
      ),
      h('section', { class: 'editor-panel' }, this.tabBar, this.options),
      this.actions,
    );
    parent.append(this.el);
    this.renderTabs();
  }

  get isOpen(): boolean {
    return this.visible;
  }

  open(mode: EditorMode, avatar: AvatarConfig, handlers: EditorHandlers): void {
    this.draft = { ...avatar };
    this.handlers = handlers;
    this.mode = mode;
    this.direction = 'down';
    // Kleiderschrank: nur die Reiter Kleidung und Extras
    this.tabs = mode === 'wardrobe' ? TABS.filter((t) => t.id === 'clothes' || t.id === 'extras') : TABS;
    this.activeTab = this.tabs[0].id;
    if (mode === 'create') {
      this.title.textContent = "Willkommen in Samya's World! 💖";
      this.subtitle.textContent = 'Gestalte deinen eigenen Avatar und entdecke deine Stadt!';
    } else if (mode === 'wardrobe') {
      this.title.textContent = 'Dein Kleiderschrank 👗';
      this.subtitle.textContent = 'Such dir aus, was du heute anziehen möchtest!';
    } else {
      this.title.textContent = 'Dein Avatar ✨';
      this.subtitle.textContent = 'Tippe etwas Neues an – du siehst es sofort!';
    }
    this.actions.replaceChildren(
      ...(mode !== 'create'
        ? [button({ label: 'Abbrechen', variant: 'secondary', onPress: () => this.cancel() }, playClick)]
        : []),
      button(
        { label: mode === 'create' ? 'Mein Abenteuer starten! ✨' : 'Fertig! ✨', onPress: () => this.confirm() },
        () => audio.play('interact'),
      ),
    );
    this.el.classList.toggle('is-create', mode === 'create');
    this.visible = true;
    this.el.hidden = false;
    input.block('avatar-editor');
    this.renderTabs();
    this.renderOptions();
    this.renderPreview();
  }

  close(): void {
    if (!this.visible) return;
    this.visible = false;
    this.stopWalk();
    this.el.hidden = true;
    input.unblock('avatar-editor');
  }

  /** Escape: im Bearbeiten-Modus wie „Abbrechen“. */
  cancel(): void {
    const onCancel = this.handlers?.onCancel;
    if (!onCancel) return;
    this.close();
    onCancel();
  }

  private confirm(): void {
    if (!this.draft || !this.handlers) return;
    const result = this.draft;
    this.close();
    this.handlers.onConfirm(result);
  }

  private choose<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]): void {
    if (!this.draft) return;
    this.draft = applyChoice(this.draft, key, value);
    playClick();
    this.renderOptions();
    this.renderPreview(true);
  }

  private surprise(): void {
    const random = randomAvatar(Math.random, saves.owns);
    // Im Kleiderschrank bleiben Gesicht, Haare und Haut, wie sie sind
    this.draft =
      this.mode === 'wardrobe' && this.draft
        ? { ...this.draft, top: random.top, bottom: random.bottom, shoes: random.shoes, glasses: random.glasses, hairAccessory: random.hairAccessory, hat: random.hat, bag: random.bag }
        : random;
    this.renderOptions();
    this.renderPreview(true);
  }

  private rotate(): void {
    this.direction = ROTATION[(ROTATION.indexOf(this.direction) + 1) % ROTATION.length];
    this.renderPreview();
  }

  private toggleWalk(): void {
    if (this.walkTimer !== undefined) {
      this.stopWalk();
      return;
    }
    this.walkButton.classList.add('is-active');
    this.walkButton.title = 'Stopp';
    this.walkTimer = window.setInterval(() => {
      this.walkColumn = (this.walkColumn % 4) + 1;
      this.renderPreview();
    }, 120);
  }

  private stopWalk(): void {
    window.clearInterval(this.walkTimer);
    this.walkTimer = undefined;
    this.walkColumn = 0;
    this.walkButton.classList.remove('is-active');
    this.walkButton.title = 'Laufen';
    if (this.visible) this.renderPreview();
  }

  private renderPreview(bump = false): void {
    if (!this.draft) return;
    drawAvatarThumbnail(this.preview, this.draft, 'full', this.direction, this.walkColumn);
    if (bump) {
      this.previewWrap.classList.remove('is-bump');
      void this.previewWrap.offsetWidth;
      this.previewWrap.classList.add('is-bump');
    }
  }

  private renderTabs(): void {
    this.tabBar.replaceChildren(
      ...this.tabs.map((tab) => {
        const el = h(
          'button',
          {
            class: `editor-tab${tab.id === this.activeTab ? ' is-active' : ''}`,
            attrs: { type: 'button', role: 'tab', 'aria-selected': String(tab.id === this.activeTab) },
          },
          h('span', { class: 'btn-glyph', html: tab.icon, attrs: { 'aria-hidden': 'true' } }),
          h('span', { class: 'editor-tab-label', text: tab.label }),
        );
        el.addEventListener('click', () => {
          if (this.activeTab === tab.id) return;
          this.activeTab = tab.id;
          playClick();
          this.renderTabs();
          this.renderOptions();
          this.options.scrollTop = 0;
        });
        return el;
      }),
    );
  }

  private renderOptions(): void {
    const draft = this.draft;
    if (!draft) return;
    const tab = this.tabs.find((t) => t.id === this.activeTab) ?? this.tabs[0];
    const scroll = this.options.scrollTop;
    this.options.replaceChildren(...tab.groups.map((group) => this.renderGroup(group, draft)).filter((g): g is HTMLElement => g !== null));
    this.options.scrollTop = scroll;
  }

  private renderGroup(group: Group, draft: AvatarConfig): HTMLElement | null {
    // Nur Grundausstattung und gekaufte Kleidung anbieten
    const options = group.options.filter((o) => o.swatch || !getItem(o.value) || isAvailable(o.value, saves.owns));
    if (!options.some((o) => o.value !== null)) return null;
    const note = group.note?.(draft) ?? null;
    const current = draft[group.key] as string | null;
    const selectedOption = options.find((o) => o.value === current);
    const heading = h(
      'div',
      { class: 'editor-group-head' },
      h('span', { class: 'editor-group-label', text: group.label }),
      selectedOption && !note ? h('span', { class: 'editor-group-value', text: selectedOption.label }) : null,
      note ? h('span', { class: 'editor-group-note', text: note }) : null,
    );
    const row = h('div', { class: 'editor-option-row' });
    for (const option of options) {
      const selected = !note && option.value === current;
      const el = h('button', {
        class: `editor-option${selected ? ' is-selected' : ''}${option.swatch ? ' is-swatch' : ''}`,
        attrs: { type: 'button', 'aria-pressed': String(selected), 'aria-label': option.label, title: option.label },
      });
      if (option.swatch) {
        el.append(h('span', { class: 'editor-swatch', attrs: { style: `--swatch: ${option.swatch}` } }));
      } else {
        const preview = applyChoice(draft, group.key, option.value as never);
        const canvas = h('canvas', { attrs: { width: String(THUMB_PX), height: String(THUMB_PX), 'aria-hidden': 'true' } });
        drawAvatarThumbnail(canvas, preview, group.region);
        el.append(canvas);
        if (option.value === null) el.append(h('span', { class: 'editor-option-none', text: 'Ohne' }));
      }
      el.addEventListener('click', () => this.choose(group.key, option.value as never));
      row.append(el);
    }
    return h('div', { class: 'editor-group' }, heading, row);
  }
}
