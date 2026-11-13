import type { HairColor } from '../types';
import { rainbowGradient, scallopCircle } from './svg';

export const HAIR_COLORS: HairColor[] = [
  { id: 'black', base: '#2b2233', shade: '#17111d', light: '#5a4a6e' },
  { id: 'brown', base: '#7a4a2b', shade: '#573119', light: '#a8714a' },
  { id: 'blonde', base: '#ffd766', shade: '#e3a93a', light: '#fff0b3' },
  { id: 'red', base: '#e8643c', shade: '#b9431f', light: '#ff9a6e' },
  { id: 'pink', base: '#ff7fbf', shade: '#e0559b', light: '#ffc0e0' },
  { id: 'purple', base: '#9d6bff', shade: '#7245d6', light: '#cdb3ff' },
  { id: 'teal', base: '#2fd0c8', shade: '#1a9fa0', light: '#9af3ea' },
  { id: 'rainbow', base: '#ff7fbf', shade: '#a57bff', light: '#ffffff', rainbow: true },
];

export interface HairStyle {
  id: string;
  /** Behind the body. */
  back: (h: HairPaint) => string;
  /** Over the face edge: fringe, braids, side locks. */
  front: (h: HairPaint) => string;
}

export interface HairPaint {
  fill: string;
  shade: string;
  light: string;
  tie: string;
}

export function hairPaint(color: HairColor, uid: string): { paint: HairPaint; defs: string } {
  if (color.rainbow) {
    const id = `${uid}-hair`;
    return {
      defs: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="90" y1="30" x2="310" y2="330">${[
        '#ff5d73',
        '#ff9f43',
        '#ffd84a',
        '#5fd38d',
        '#4db8ff',
        '#a57bff',
      ]
        .map((c, i) => `<stop offset="${i * 20}%" stop-color="${c}"/>`)
        .join('')}</linearGradient>`,
      paint: { fill: `url(#${id})`, shade: '#7a5be0', light: '#ffffff', tie: '#ffffff' },
    };
  }
  return {
    defs: '',
    paint: { fill: color.base, shade: color.shade, light: color.light, tie: color.id === 'pink' ? '#8be9ff' : '#ff6fb5' },
  };
}

const CAP = (h: HairPaint) => `<ellipse cx="200" cy="138" rx="97" ry="96" fill="${h.fill}"/>`;

const shine = (h: HairPaint) =>
  `<path d="M146 76 Q198 50 252 74" fill="none" stroke="${h.light}" stroke-width="9" stroke-linecap="round" opacity=".55"/>`;

const SWOOP = (h: HairPaint) =>
  `<path d="M108 164 C98 84 150 42 200 42 C252 42 302 84 292 164 C287 134 274 113 254 101 C226 124 170 134 132 117 C119 130 111 146 108 164 Z" fill="${h.fill}"/>
   <path d="M254 101 C226 124 170 134 132 117" fill="none" stroke="${h.shade}" stroke-width="3" stroke-linecap="round" opacity=".45"/>${shine(h)}`;

const FRINGE = (h: HairPaint) =>
  `<path d="M108 166 C98 84 150 42 200 42 C250 42 302 84 292 166 C289 142 282 128 273 117 Q256 126 240 116 Q220 127 200 117 Q180 127 160 116 Q144 126 127 117 C118 128 111 142 108 166 Z" fill="${h.fill}"/>${shine(h)}`;

const PART = (h: HairPaint) =>
  `<path d="M108 166 C98 84 150 42 200 42 C250 42 302 84 292 166 C288 122 252 88 200 80 C148 88 112 122 108 166 Z" fill="${h.fill}"/>
   <path d="M200 44 L200 80" stroke="${h.shade}" stroke-width="3" stroke-linecap="round" opacity=".5"/>${shine(h)}`;

function braid(h: HairPaint): string {
  let out = '';
  const n = 8;
  for (let i = 0; i < n; i++) {
    const y = 176 + i * 27;
    const x = 110 + (i % 2 === 0 ? -3 : 3) - i * 0.6;
    out += `<ellipse cx="${x}" cy="${y}" rx="${17 - i * 0.5}" ry="17" fill="${h.fill}" stroke="${h.shade}" stroke-width="2.5" stroke-opacity=".5" transform="rotate(${i % 2 === 0 ? -22 : 22} ${x} ${y})"/>`;
  }
  const endY = 176 + n * 27;
  out += `<path d="M96 ${endY - 6} Q104 ${endY + 34} 106 ${endY + 40} Q112 ${endY + 30} 118 ${endY - 6} Z" fill="${h.fill}"/>`;
  out += `<rect x="94" y="${endY - 14}" width="26" height="12" rx="6" fill="${h.tie}"/>`;
  return out;
}
const mirrorX = (s: string) => `<g transform="translate(400 0) scale(-1 1)">${s}</g>`;

export const HAIR_STYLES: HairStyle[] = [
  {
    id: 'long',
    back: (h) =>
      `<path d="M103 140 C96 60 150 40 200 40 C250 40 304 60 297 140 L308 392 Q296 420 272 408 Q250 424 226 410 Q200 424 174 410 Q150 424 128 408 Q104 420 92 392 Z" fill="${h.fill}"/>
       <path d="M124 250 Q118 330 126 396 M276 250 Q282 330 274 396" fill="none" stroke="${h.shade}" stroke-width="4" stroke-linecap="round" opacity=".35"/>`,
    front: SWOOP,
  },
  {
    id: 'wavy',
    back: (h) => {
      let out = `<path d="M103 140 C96 60 150 40 200 40 C250 40 304 60 297 140 L300 360 L100 360 Z" fill="${h.fill}"/>`;
      for (let i = 0; i < 6; i++) {
        const y = 170 + i * 40;
        const off = i % 2 === 0 ? 0 : 12;
        out += `<circle cx="${104 - off}" cy="${y}" r="30" fill="${h.fill}"/><circle cx="${296 + off}" cy="${y}" r="30" fill="${h.fill}"/>`;
      }
      out += `<circle cx="140" cy="372" r="30" fill="${h.fill}"/><circle cx="260" cy="372" r="30" fill="${h.fill}"/><circle cx="200" cy="376" r="30" fill="${h.fill}"/>`;
      return out;
    },
    front: (h) =>
      PART(h) +
      `<circle cx="112" cy="170" r="15" fill="${h.fill}"/><circle cx="288" cy="170" r="15" fill="${h.fill}"/>`,
  },
  {
    id: 'ponytail',
    back: (h) =>
      CAP(h) +
      `<path d="M258 66 C312 40 358 96 352 180 C350 244 340 296 318 338 C316 290 300 250 292 206 C286 160 288 118 262 108 Z" fill="${h.fill}"/>
       <path d="M318 110 Q334 190 318 300" fill="none" stroke="${h.shade}" stroke-width="4" stroke-linecap="round" opacity=".35"/>
       <ellipse cx="270" cy="82" rx="15" ry="19" fill="${h.tie}" transform="rotate(-35 270 82)"/>`,
    front: SWOOP,
  },
  {
    id: 'pigtails',
    back: (h) => {
      const tail = `<path d="M118 112 C62 116 46 200 60 286 C64 308 88 316 98 296 C92 246 108 196 132 160 Z" fill="${h.fill}"/>
        <path d="M84 150 Q68 210 78 280" fill="none" stroke="${h.shade}" stroke-width="4" stroke-linecap="round" opacity=".35"/>
        <circle cx="114" cy="126" r="14" fill="${h.tie}"/>`;
      return CAP(h) + tail + mirrorX(tail);
    },
    front: PART,
  },
  {
    id: 'buns',
    back: (h) => {
      const bun = `<circle cx="128" cy="58" r="40" fill="${h.fill}"/>
        <path d="M108 52 Q128 32 148 52 Q150 72 128 74 Q118 70 120 60" fill="none" stroke="${h.shade}" stroke-width="4" stroke-linecap="round" opacity=".4"/>`;
      return bun + mirrorX(bun) + CAP(h);
    },
    front: (h) =>
      FRINGE(h) +
      `<ellipse cx="146" cy="84" rx="10" ry="6" fill="${h.tie}" transform="rotate(-40 146 84)"/><ellipse cx="254" cy="84" rx="10" ry="6" fill="${h.tie}" transform="rotate(40 254 84)"/>`,
  },
  {
    id: 'afro',
    back: (h) => scallopCircle(200, 124, 122, 16, h.fill, 0.3),
    front: (h) => {
      let out = '';
      const pts: Array<[number, number, number]> = [
        [122, 132, 20],
        [132, 106, 22],
        [154, 88, 22],
        [182, 80, 22],
        [212, 80, 22],
        [240, 86, 22],
        [264, 104, 22],
        [278, 132, 20],
      ];
      for (const [x, y, r] of pts) out += `<circle cx="${x}" cy="${y}" r="${r}" fill="${h.fill}"/>`;
      out += `<path d="M150 46 Q200 22 250 44" fill="none" stroke="${h.light}" stroke-width="9" stroke-linecap="round" opacity=".4"/>`;
      return out;
    },
  },
  {
    id: 'bob',
    back: (h) =>
      `<path d="M103 140 C96 60 150 40 200 40 C250 40 304 60 297 140 L304 228 Q298 258 268 250 L132 250 Q102 258 96 228 Z" fill="${h.fill}"/>`,
    front: (h) => {
      const lock = `<path d="M108 150 C98 196 102 232 124 252 C136 240 134 200 130 150 Z" fill="${h.fill}"/>`;
      return lock + mirrorX(lock) + FRINGE(h);
    },
  },
  {
    id: 'braids',
    back: CAP,
    front: (h) => PART(h) + braid(h) + mirrorX(braid(h)),
  },
];

export const hairStyleById = (id: string) => HAIR_STYLES.find((s) => s.id === id) ?? HAIR_STYLES[0];
export const hairColorById = (id: string) => HAIR_COLORS.find((c) => c.id === id) ?? HAIR_COLORS[0];

/** Swatch drawn in the hair colour picker. */
export function hairSwatch(color: HairColor, uid: string): string {
  const fill = color.rainbow ? `url(#${uid}-sw)` : color.base;
  const defs = color.rainbow ? `<defs>${rainbowGradient(`${uid}-sw`, false)}</defs>` : '';
  return `${defs}<path d="M20 34 C20 16 40 10 54 16 C70 8 88 20 82 40 C96 52 88 76 72 78 C66 92 40 94 32 80 C14 80 8 56 20 34 Z" fill="${fill}"/>
    <path d="M30 34 Q46 20 64 26" fill="none" stroke="${color.light}" stroke-width="6" stroke-linecap="round" opacity=".7"/>`;
}
