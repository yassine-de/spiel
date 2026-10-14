type Child = Node | string | null | undefined | false;

interface Props {
  class?: string;
  text?: string;
  html?: string;
  attrs?: Record<string, string>;
  on?: Partial<{ [K in keyof HTMLElementEventMap]: (event: HTMLElementEventMap[K]) => void }>;
}

/** Kleiner Helfer zum Erzeugen von DOM-Elementen. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props.class) el.className = props.class;
  if (props.text !== undefined) el.textContent = props.text;
  if (props.html !== undefined) el.innerHTML = props.html;
  if (props.attrs) for (const [name, value] of Object.entries(props.attrs)) el.setAttribute(name, value);
  if (props.on) {
    for (const [name, handler] of Object.entries(props.on)) {
      el.addEventListener(name, handler as EventListener);
    }
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child);
  }
  return el;
}

export interface ButtonOptions {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  ariaLabel?: string;
  onPress: () => void;
}

/**
 * Großer, kinderfreundlicher Button. Nach dem Antippen wird der Fokus entfernt,
 * damit die Leertaste danach wieder für das Spiel funktioniert.
 */
export function button(options: ButtonOptions, onSound?: () => void): HTMLButtonElement {
  const variant = options.variant ?? 'primary';
  const el = h(
    'button',
    {
      class: `btn btn-${variant}`,
      attrs: { type: 'button', ...(options.ariaLabel ? { 'aria-label': options.ariaLabel } : {}) },
    },
    options.icon ? h('span', { class: 'btn-glyph', html: options.icon, attrs: { 'aria-hidden': 'true' } }) : null,
    variant === 'icon' ? null : h('span', { class: 'btn-label', text: options.label }),
  );
  if (variant === 'icon') el.title = options.label;
  el.addEventListener('click', (event) => {
    onSound?.();
    options.onPress();
    if (event.detail > 0) el.blur();
  });
  return el;
}

export function formatCoins(value: number): string {
  return new Intl.NumberFormat('de-DE').format(value);
}
