/** Eigene, einfache SVG-Symbole für die Oberfläche (keine Fremdgrafiken). */

const svg = (body: string, viewBox = '0 0 24 24') =>
  `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const Icons = {
  play: svg('<path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.6A1 1 0 0 0 8 5.5z" fill="currentColor" stroke="none"/>'),
  pause: svg('<rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor" stroke="none"/>'),
  gear: svg(
    '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/><circle cx="12" cy="12" r="6.6"/>',
  ),
  brush: svg('<path d="M14.5 4.5l5 5-8.5 8.5-5-5z"/><path d="M6 13l-1.8 1.8a3 3 0 0 0 0 4.2 3 3 0 0 0 4.2 0L10.2 17"/>'),
  home: svg('<path d="M4 11.5L12 4.5l8 7"/><path d="M6.5 10v9.5h11V10"/><path d="M10.5 19.5v-5h3v5"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  sound: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>'),
  fullscreen: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  hand: svg(
    '<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10V5a1.5 1.5 0 0 1 3 0v5"/><path d="M14 10V6.5a1.5 1.5 0 0 1 3 0V13a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.6-2.2L3.5 15.8a1.6 1.6 0 0 1 2.4-2.1L8 15.5"/>',
  ),
  heart: svg(
    '<path d="M12 20s-7.5-4.6-9-9.4C2 7.3 4.2 4.5 7.2 4.5c2 0 3.5 1.1 4.8 2.9 1.3-1.8 2.8-2.9 4.8-2.9 3 0 5.2 2.8 4.2 6.1C19.5 15.4 12 20 12 20z" fill="currentColor" stroke="none"/>',
  ),
  phone: svg('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
  person: svg('<circle cx="12" cy="7" r="3.5"/><path d="M5 20.5c.6-4.2 3.3-7 7-7s6.4 2.8 7 7"/>'),
  smile: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14c.9 1.4 2.1 2 3.5 2s2.6-.6 3.5-2"/><path d="M9 9.5v.5M15 9.5v.5"/>'),
  hair: svg('<path d="M5 15c-1-6 2.5-10.5 7-10.5S20 9 19 15"/><path d="M5 15c1.5-.5 3-2.5 3.5-5 1.5 2 4.5 3.5 7.5 3.5"/><path d="M5 15v4M19 15v4"/>'),
  shirt: svg('<path d="M8.5 4.5L4 7l1.8 3.8L8 10v9.5h8V10l2.2.8L20 7l-4.5-2.5c-.5 1.4-1.9 2.3-3.5 2.3s-3-.9-3.5-2.3z"/>'),
  sparkle: svg('<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>'),
  rotate: svg('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.8 4.5v4h-4"/>'),
  dice: svg('<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>'),
  walk: svg('<circle cx="13" cy="4.5" r="2"/><path d="M10 21l2-6 3 3v4M12 15l-1-5 4 1 2 3M11 10l-3 2-1 3"/>'),
  stop: svg('<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none"/>'),
  bag: svg('<path d="M5.5 8.5h13l-1 11h-11z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>'),
  list: svg('<path d="M9 6.5h10M9 12h10M9 17.5h10"/><path d="M4.5 6.5l1 1 2-2M4.5 12l1 1 2-2M4.5 17.5l1 1 2-2"/>'),
  cart: svg('<path d="M3.5 4.5h2.5l2 10h10l2-7H7"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>'),
  minus: svg('<path d="M6 12h12"/>'),
  plus: svg('<path d="M12 6v12M6 12h12"/>'),
  trash: svg('<path d="M5 7h14M10 7V5h4v2M7 7l1 12.5h8L17 7"/>'),
} as const;

/** Münze (farbig, für Preise und Münzstand). */
export const COIN_SVG = `<svg viewBox="0 0 32 32" aria-hidden="true">
  <circle cx="16" cy="16" r="14" fill="#ffd45e" stroke="#e0a526" stroke-width="2.5"/>
  <circle cx="16" cy="16" r="9.5" fill="#ffe48f" stroke="#eab53a" stroke-width="1.5"/>
  <path d="M16 21.5s-4.6-2.8-5.5-5.7c-.6-2 .7-3.7 2.5-3.7 1.2 0 2.1.7 3 1.8.8-1.1 1.7-1.8 3-1.8 1.8 0 3.1 1.7 2.5 3.7-.9 2.9-5.5 5.7-5.5 5.7z" fill="#ff8fb8"/>
</svg>`;
