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
  camera: wrap(
    `<rect x="10" y="30" width="80" height="54" rx="12" fill="${W}"/><rect x="34" y="18" width="32" height="18" rx="6" fill="${W}"/><circle cx="50" cy="57" r="18" fill="#8f6bff"/><circle cx="50" cy="57" r="9" fill="#cdb3ff"/>`,
  ),
  hand: wrap(
    `<path d="M40 92 Q22 80 18 60 Q14 48 24 46 Q32 46 36 58 L36 20 Q36 10 45 10 Q54 10 54 20 L54 46 Q60 40 67 44 Q72 40 79 46 Q88 46 88 58 L86 76 Q84 88 74 92 Z" fill="${W}" stroke="#ff5fae" stroke-width="5" stroke-linejoin="round"/>`,
  ),
  heart: wrap(`<path d="${heartPath(50, 52, 34)}" fill="#ff5f86" stroke="${W}" stroke-width="6" stroke-linejoin="round"/>`),
};

export type IconName = keyof typeof ICONS;
