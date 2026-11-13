import { heartPath, sparkle, starPath } from './svg';

const wrap = (inner: string, vb = '0 0 100 100') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="icon">${inner}</svg>`;
const W = '#ffffff';

export const ICONS = {
  play: wrap(`<path d="M34 20 L82 50 L34 80 Z" fill="${W}" stroke="${W}" stroke-width="10" stroke-linejoin="round"/>`),
  home: wrap(
    `<path d="M14 50 L50 16 L86 50" fill="none" stroke="${W}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M26 48 L26 84 L74 84 L74 48 L50 26 Z" fill="${W}"/><rect x="42" y="60" width="16" height="24" rx="4" fill="#ff6fb1"/>`,
  ),
  back: wrap(`<path d="M58 20 L26 50 L58 80" fill="none" stroke="${W}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`),
  surprise: wrap(
    `<line x1="24" y1="80" x2="58" y2="44" stroke="${W}" stroke-width="10" stroke-linecap="round"/>
     <path d="${starPath(66, 34, 22)}" fill="#ffd84a" stroke="#ffd84a" stroke-width="5" stroke-linejoin="round"/>` +
      sparkle(26, 30, 11, W) +
      sparkle(84, 72, 10, W) +
      sparkle(46, 14, 7, W),
  ),
  reset: wrap(
    `<path d="M76 50 A26 26 0 1 1 62 27" fill="none" stroke="${W}" stroke-width="11" stroke-linecap="round"/>
     <path d="M52 10 L70 28 L48 38 Z" fill="${W}" stroke="${W}" stroke-width="5" stroke-linejoin="round"/>`,
  ),
  show: wrap(
    `<path d="${starPath(50, 50, 38)}" fill="#ffd84a" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>` +
      sparkle(84, 18, 10, W) +
      sparkle(16, 78, 8, W),
  ),
  book: wrap(
    `<path d="M50 28 Q32 16 12 22 L12 78 Q32 72 50 84 Q68 72 88 78 L88 22 Q68 16 50 28 Z" fill="${W}"/>
     <path d="M50 28 L50 84" stroke="#ff8ec7" stroke-width="4"/><path d="${heartPath(31, 50, 10)}" fill="#ff6fb1"/><path d="${starPath(69, 50, 11)}" fill="#ffd84a"/>`,
  ),
  soundOn: wrap(
    `<path d="M14 40 L30 40 L52 22 L52 78 L30 60 L14 60 Z" fill="${W}" stroke="${W}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M66 36 Q76 50 66 64 M76 26 Q94 50 76 74" fill="none" stroke="${W}" stroke-width="8" stroke-linecap="round"/>`,
  ),
  soundOff: wrap(
    `<path d="M14 40 L30 40 L52 22 L52 78 L30 60 L14 60 Z" fill="${W}" stroke="${W}" stroke-width="6" stroke-linejoin="round" opacity=".7"/>
     <path d="M66 38 L88 62 M88 38 L66 62" stroke="${W}" stroke-width="9" stroke-linecap="round"/>`,
  ),
  again: wrap(
    `<path d="M24 50 A26 26 0 1 0 38 27" fill="none" stroke="${W}" stroke-width="11" stroke-linecap="round"/>
     <path d="M48 10 L30 28 L52 38 Z" fill="${W}" stroke="${W}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M44 40 L62 50 L44 60 Z" fill="${W}" stroke="${W}" stroke-width="5" stroke-linejoin="round"/>`,
  ),
  brush: wrap(
    `<path d="M20 84 Q16 66 32 60 L44 72 Q40 88 20 84 Z" fill="#ffd84a"/>
     <path d="M36 56 L72 14 Q80 8 86 14 Q92 20 86 28 L48 68 Z" fill="${W}"/>` + sparkle(22, 34, 10, W),
  ),
  lock: wrap(
    `<path d="M32 46 L32 34 A18 18 0 0 1 68 34 L68 46" fill="none" stroke="${W}" stroke-width="10" stroke-linecap="round"/>
     <rect x="20" y="44" width="60" height="44" rx="12" fill="${W}"/><circle cx="50" cy="62" r="7" fill="#8f6bff"/><rect x="47" y="64" width="6" height="14" rx="3" fill="#8f6bff"/>`,
  ),
  close: wrap(`<path d="M26 26 L74 74 M74 26 L26 74" stroke="${W}" stroke-width="14" stroke-linecap="round"/>`),
  check: wrap(`<path d="M22 52 L42 72 L80 28" fill="none" stroke="${W}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>`),
  clothes: wrap(
    `<path d="M34 16 Q50 30 66 16 L90 32 L78 50 L70 44 L70 86 L30 86 L30 44 L22 50 L10 32 Z" fill="${W}" stroke="${W}" stroke-width="5" stroke-linejoin="round"/><path d="${heartPath(50, 60, 9)}" fill="#ff6fb1"/>`,
  ),
  crown: wrap(
    `<path d="M14 78 L8 28 L32 50 L50 16 L68 50 L92 28 L86 78 Z" fill="#ffd84a" stroke="${W}" stroke-width="6" stroke-linejoin="round"/><circle cx="50" cy="60" r="7" fill="#ff5f86"/><circle cx="30" cy="64" r="4.5" fill="#7ad7ff"/><circle cx="70" cy="64" r="4.5" fill="#7ad7ff"/>`,
  ),
  hair: wrap(
    `<rect x="12" y="20" width="76" height="20" rx="10" fill="${W}"/>
     <path d="M20 40 L20 82 M32 40 L32 76 M44 40 L44 84 M56 40 L56 76 M68 40 L68 84 M80 40 L80 78" stroke="${W}" stroke-width="7" stroke-linecap="round"/>`,
  ),
  makeup: wrap(
    `<rect x="30" y="50" width="40" height="42" rx="6" fill="${W}"/><rect x="34" y="40" width="32" height="14" rx="3" fill="#ffd84a"/>
     <path d="M38 40 L38 22 L62 8 L62 40 Z" fill="#ff3f6e" stroke="#ff3f6e" stroke-width="4" stroke-linejoin="round"/>`,
  ),
  nails: wrap(
    `<rect x="39" y="6" width="22" height="36" rx="7" fill="${W}"/><rect x="26" y="40" width="48" height="52" rx="15" fill="#ff6fb1" stroke="${W}" stroke-width="6"/>
     <path d="M38 54 Q36 68 40 80" fill="none" stroke="${W}" stroke-width="6" stroke-linecap="round" opacity=".7"/>`,
  ),
  pets: wrap(
    `<ellipse cx="50" cy="66" rx="24" ry="20" fill="${W}"/><ellipse cx="20" cy="46" rx="10" ry="13" fill="${W}"/><ellipse cx="80" cy="46" rx="10" ry="13" fill="${W}"/>
     <ellipse cx="38" cy="26" rx="10" ry="13" fill="${W}"/><ellipse cx="62" cy="26" rx="10" ry="13" fill="${W}"/>`,
  ),
  lips: wrap(
    `<path d="M10 50 Q30 24 50 38 Q70 24 90 50 Q50 92 10 50 Z" fill="#ff3f6e" stroke="${W}" stroke-width="5" stroke-linejoin="round"/><path d="M16 50 Q50 62 84 50" fill="none" stroke="#c2184b" stroke-width="4" stroke-linecap="round"/>`,
  ),
  eye: wrap(
    `<path d="M8 54 Q50 6 92 54 Q50 30 8 54 Z" fill="#a877ff"/>
     <path d="M10 56 Q50 18 90 56 Q50 90 10 56 Z" fill="${W}"/><circle cx="50" cy="56" r="17" fill="#3f9be8"/><circle cx="50" cy="56" r="8" fill="#2a1a2e"/><circle cx="44" cy="50" r="4.5" fill="${W}"/>
     <path d="M10 56 Q50 18 90 56" fill="none" stroke="#2a1a2e" stroke-width="6" stroke-linecap="round"/>`,
  ),
  cheek: wrap(
    `<circle cx="50" cy="54" r="38" fill="#ff8fb0" opacity=".75"/><path d="${starPath(50, 54, 22)}" fill="#ffd84a" stroke="#ffd84a" stroke-width="4" stroke-linejoin="round"/>` + sparkle(82, 20, 9, W),
  ),
  camera: wrap(
    `<rect x="10" y="30" width="80" height="54" rx="12" fill="${W}"/><rect x="34" y="18" width="32" height="18" rx="6" fill="${W}"/><circle cx="50" cy="57" r="18" fill="#8f6bff"/><circle cx="50" cy="57" r="9" fill="#cdb3ff"/>`,
  ),
  hand: wrap(
    `<path d="M40 92 Q22 80 18 60 Q14 48 24 46 Q32 46 36 58 L36 20 Q36 10 45 10 Q54 10 54 20 L54 46 Q60 40 67 44 Q72 40 79 46 Q88 46 88 58 L86 76 Q84 88 74 92 Z" fill="${W}" stroke="#ff5fae" stroke-width="5" stroke-linejoin="round"/>`,
  ),
  heart: wrap(`<path d="${heartPath(50, 52, 34)}" fill="#ff5f86" stroke="${W}" stroke-width="6" stroke-linejoin="round"/>`),
};

export type IconName = keyof typeof ICONS;
