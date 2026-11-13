import type { WearItem } from '../types';
import { darken, flower, heart, linearGradient, mirror, pivot, RAINBOW, sparkle, star } from './svg';

/* ------------------------------------------------------------------ *
 * Shared shapes. All coordinates are in the 400-wide doll space.
 * ------------------------------------------------------------------ */

const teeBody = (hem = 394) =>
  `M167 249 Q147 251 145 272 L154 338 Q147 366 147 ${hem} L253 ${hem} Q253 366 246 338 L255 272 Q253 251 233 249 Q200 279 167 249 Z`;
const tankBody = (hem = 394) =>
  `M168 250 L183 250 Q200 282 217 250 L232 250 L247 304 L246 338 Q253 366 253 ${hem} L147 ${hem} Q147 366 154 338 L153 304 Z`;

const shortSleeve = (fill: string, trim?: string) =>
  `<line x1="157" y1="270" x2="149" y2="300" stroke="${fill}" stroke-width="33" stroke-linecap="round"/>` +
  (trim ? `<line x1="134" y1="306" x2="161" y2="313" stroke="${trim}" stroke-width="6" stroke-linecap="round"/>` : '');
const puffSleeve = (fill: string, trim: string) =>
  `<circle cx="151" cy="280" r="25" fill="${fill}"/><path d="M131 296 Q150 308 168 298" fill="none" stroke="${trim}" stroke-width="6" stroke-linecap="round"/>`;
const longUpper = (fill: string) => `<line x1="157" y1="271" x2="139" y2="345" stroke="${fill}" stroke-width="30" stroke-linecap="round"/>`;
const longFore = (fill: string, cuff: string) =>
  `<line x1="139" y1="345" x2="132" y2="396" stroke="${fill}" stroke-width="27" stroke-linecap="round"/>
   <line x1="121" y1="402" x2="143" y2="405" stroke="${cuff}" stroke-width="9" stroke-linecap="round"/>`;

/** Trouser leg from the hip down to `toY`. */
const pantsLeg = (fill: string, toY: number, flare = 0) => {
  const t = (toY - 388) / 254;
  const l = 157 + 8 * t - 5 - flare;
  const r = 198 - 9 * t + 5 + flare;
  return `<path d="M153 386 L202 386 L${r} ${toY} L${l} ${toY} Z" fill="${fill}" stroke="${fill}" stroke-width="6" stroke-linejoin="round"/>`;
};
const hipBand = (fill: string) =>
  `<path d="M148 372 L252 372 Q254 392 252 412 L206 412 L200 400 L194 412 L148 412 Q146 392 148 372 Z" fill="${fill}" stroke="${fill}" stroke-width="4" stroke-linejoin="round"/>`;
const waistband = (fill: string, y = 368, h = 12) =>
  `<rect x="148" y="${y}" width="104" height="${h}" rx="${h / 2}" fill="${fill}"/>`;

const scallopRow = (x1: number, x2: number, y: number, r: number, fill: string, extra = '') => {
  const n = Math.max(2, Math.round((x2 - x1) / (r * 1.5)));
  let out = '';
  for (let i = 0; i <= n; i++) out += `<circle cx="${Math.round(x1 + ((x2 - x1) * i) / n)}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
  return out;
};

const T_TOP: [number, number, number, number] = [95, 232, 210, 185];
const T_BOTTOM: [number, number, number, number] = [60, 355, 280, 300];
const T_SKIRT: [number, number, number, number] = [95, 350, 210, 160];
const T_DRESS: [number, number, number, number] = [40, 235, 320, 430];
const T_SHOES: [number, number, number, number] = [110, 592, 180, 100];

/* ------------------------------------------------------------------ *
 * Tops
 * ------------------------------------------------------------------ */

export const TOPS: WearItem[] = [
  {
    id: 'top-star',
    slot: 'top',
    thumb: T_TOP,
    parts: () => ({
      torso:
        `<path d="${teeBody()}" fill="#ff6fb1"/><path d="M167 249 Q200 279 233 249" fill="none" stroke="#ffd0e6" stroke-width="6" stroke-linecap="round"/>` +
        star(200, 326, 25, '#ffd84a') +
        sparkle(232, 296, 8, '#fff') +
        `<rect x="147" y="384" width="106" height="10" rx="5" fill="#ff4f9d"/>`,
      armUpper: shortSleeve('#ff6fb1', '#ffd0e6'),
    }),
  },
  {
    id: 'top-jersey',
    slot: 'top',
    thumb: T_TOP,
    parts: () => ({
      torso:
        `<path d="${teeBody()}" fill="#18c5c0"/>
         <path d="M146 290 L154 338 Q147 366 147 394 L164 394 Q164 366 170 338 L162 290 Z" fill="#fff"/>
         <path d="M254 290 L246 338 Q253 366 253 394 L236 394 Q236 366 230 338 L238 290 Z" fill="#fff"/>
         <path d="M167 249 Q200 279 233 249" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
         <path d="M187 302 L214 302 L199 350" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
      armUpper: shortSleeve('#18c5c0', '#fff'),
    }),
  },
  {
    id: 'top-stripes',
    slot: 'top',
    thumb: T_TOP,
    parts: ({ uid }) => ({
      defs: `<clipPath id="${uid}-st"><path d="${teeBody()}"/></clipPath>`,
      torso:
        `<g clip-path="url(#${uid}-st)">${RAINBOW.map((c, i) => `<rect x="140" y="${249 + i * 25}" width="120" height="26" fill="${c}"/>`).join('')}</g>
         <path d="M167 249 Q200 279 233 249" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
      armUpper: longUpper('#ff5d73'),
      armFore: longFore('#ffd84a', '#4db8ff'),
    }),
  },
  {
    id: 'top-shell',
    slot: 'top',
    thumb: T_TOP,
    parts: () => ({
      torso:
        `<path d="${tankBody()}" fill="#35d0cc"/>
         <path d="M162 318 Q164 284 200 282 Q236 284 238 318 Q226 350 200 352 Q174 350 162 318 Z" fill="#ff9ccb" stroke="#ff6fb1" stroke-width="3"/>
         <path d="M200 350 L176 300 M200 350 L188 288 M200 350 L200 284 M200 350 L212 288 M200 350 L224 300" stroke="#ff6fb1" stroke-width="3" stroke-linecap="round" fill="none"/>` +
        scallopRow(152, 248, 392, 7, '#bff5f0') +
        `<circle cx="200" cy="354" r="6" fill="#fff"/>`,
    }),
  },
  {
    id: 'top-blouse',
    slot: 'top',
    thumb: T_TOP,
    parts: () => ({
      torso:
        `<path d="${teeBody()}" fill="#fff8fb"/>
         <path d="M168 250 L200 276 L186 292 L160 262 Z" fill="#c9a8ff"/><path d="M232 250 L200 276 L214 292 L240 262 Z" fill="#c9a8ff"/>
         <path d="M200 286 L182 276 L182 298 Z M200 286 L218 276 L218 298 Z" fill="#ff6fb1"/><circle cx="200" cy="286" r="6" fill="#ff4f9d"/>
         <circle cx="200" cy="318" r="4.5" fill="#c9a8ff"/><circle cx="200" cy="342" r="4.5" fill="#c9a8ff"/><circle cx="200" cy="366" r="4.5" fill="#c9a8ff"/>
         <rect x="147" y="384" width="106" height="10" rx="5" fill="#c9a8ff"/>`,
      armUpper: puffSleeve('#fff8fb', '#c9a8ff'),
    }),
  },
  {
    id: 'top-hoodie',
    slot: 'top',
    thumb: T_TOP,
    parts: () => ({
      torso:
        `<path d="${teeBody(398)}" fill="#8f6bff"/>
         <path d="M166 250 Q200 286 234 250" fill="none" stroke="#6f49e6" stroke-width="13" stroke-linecap="round"/>
         <path d="M172 344 L228 344 L238 384 L162 384 Z" fill="#7a55f0" stroke="#6f49e6" stroke-width="3" stroke-linejoin="round"/>
         <path d="M190 272 L188 312 M210 272 L212 312" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
         <circle cx="188" cy="316" r="5" fill="#fff"/><circle cx="212" cy="316" r="5" fill="#fff"/>
         <rect x="146" y="386" width="108" height="13" rx="6" fill="#6f49e6"/>` + heart(200, 364, 9, '#ff8ec7'),
      armUpper: longUpper('#8f6bff'),
      armFore: longFore('#8f6bff', '#6f49e6'),
    }),
  },
  {
    id: 'top-jacket',
    slot: 'top',
    thumb: T_TOP,
    parts: () => {
      const panel = `<path d="M167 249 Q147 251 145 272 L154 338 Q147 366 147 394 L184 394 L188 304 L176 254 Z" fill="#3d2a55"/>
        <path d="M168 250 L190 300 L172 318 L158 262 Z" fill="#ff4fa3"/>
        <circle cx="166" cy="346" r="4" fill="#ffd84a"/><circle cx="166" cy="368" r="4" fill="#ffd84a"/>`;
      return {
        torso:
          `<path d="${teeBody()}" fill="#fff"/>` + star(200, 334, 17, '#ff4fa3') + panel + mirror(panel),
        armUpper: longUpper('#3d2a55'),
        armFore: longFore('#3d2a55', '#ff4fa3'),
      };
    },
  },
  {
    id: 'top-leaf',
    slot: 'top',
    thumb: T_TOP,
    parts: () => ({
      torso:
        `<path d="M168 250 L183 250 Q200 282 217 250 L232 250 L247 304 L246 338 Q253 366 254 386 L240 408 L226 388 L213 410 L200 388 L187 410 L174 388 L160 408 L146 386 Q147 366 154 338 L153 304 Z" fill="#5fd38d"/>
         <path d="M200 290 L200 380 M176 330 Q188 340 200 336 M224 330 Q212 340 200 336" stroke="#3fb872" stroke-width="3" fill="none" stroke-linecap="round"/>` +
        flower(200, 300, 15, '#ff8ec7'),
      armUpper: `<path d="M150 252 Q120 270 128 306 Q160 300 168 262 Z" fill="#7fe0a4" stroke="#3fb872" stroke-width="3" stroke-linejoin="round"/>`,
    }),
  },
];

/* ------------------------------------------------------------------ *
 * Bottoms
 * ------------------------------------------------------------------ */

function tutuLayer(y: number, halfW: number, r: number, fill: string, opacity: number): string {
  let out = '';
  const n = Math.round((halfW * 2) / (r * 1.1));
  for (let i = 0; i <= n; i++) {
    const x = 200 - halfW + (halfW * 2 * i) / n;
    const yy = y - Math.abs(i - n / 2) * 1.5;
    out += `<circle cx="${Math.round(x)}" cy="${Math.round(yy)}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
  }
  return out;
}

export const BOTTOMS: WearItem[] = [
  {
    id: 'bot-shorts',
    slot: 'bottom',
    thumb: T_SKIRT,
    parts: () => ({
      leg: pantsLeg('#5aa9f0', 446) + `<path d="M150 440 L204 440 L204 452 L151 452 Z" fill="#a9d6ff" stroke="#a9d6ff" stroke-width="5" stroke-linejoin="round"/>`,
      hips:
        hipBand('#5aa9f0') +
        waistband('#3f8fe0') +
        `<circle cx="200" cy="374" r="5" fill="#ffd84a"/><path d="M158 390 Q170 400 180 388 M242 390 Q230 400 220 388" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 4" stroke-linecap="round"/>`,
    }),
  },
  {
    id: 'bot-jeans',
    slot: 'bottom',
    thumb: T_BOTTOM,
    parts: () => ({
      leg:
        pantsLeg('#4683dd', 628) +
        `<path d="M159 618 L196 618 L196 634 L160 634 Z" fill="#9cc6ff" stroke="#9cc6ff" stroke-width="5" stroke-linejoin="round"/>` +
        heart(177, 520, 10, '#ff8ec7'),
      hips:
        hipBand('#4683dd') +
        waistband('#2f66c4') +
        `<circle cx="200" cy="374" r="5" fill="#ffd84a"/><path d="M158 390 Q170 402 182 388 M242 390 Q230 402 218 388" fill="none" stroke="#ffd84a" stroke-width="2.5" stroke-dasharray="4 4" stroke-linecap="round"/>`,
    }),
  },
  {
    id: 'bot-leggings',
    slot: 'bottom',
    thumb: T_BOTTOM,
    parts: ({ uid }) => ({
      defs: linearGradient(`${uid}-lg`, ['#7b4be8', '#3d2a9c', '#ff5fb0']),
      leg:
        pantsLeg(`url(#${uid}-lg)`, 634).replace(/stroke="[^"]*" stroke-width="6"/, 'stroke="none"') +
        star(172, 450, 7, '#ffd84a') +
        sparkle(186, 506, 7, '#fff') +
        star(174, 566, 5, '#8be9ff') +
        sparkle(168, 606, 5, '#fff'),
      hips: hipBand('#7b4be8') + waistband('#ff5fb0'),
    }),
  },
  {
    id: 'bot-flares',
    slot: 'bottom',
    thumb: T_BOTTOM,
    parts: () => ({
      leg:
        `<path d="M153 386 L202 386 L196 540 L212 640 L142 640 L158 540 Z" fill="#ff3f9a" stroke="#ff3f9a" stroke-width="6" stroke-linejoin="round"/>` +
        star(177, 590, 13, '#ffd84a') +
        sparkle(166, 500, 6, '#fff'),
      hips: hipBand('#ff3f9a') + waistband('#ffd84a') + star(200, 374, 8, '#fff'),
    }),
  },
  {
    id: 'bot-sport',
    slot: 'bottom',
    thumb: T_SKIRT,
    parts: () => ({
      hips:
        `<path d="M150 372 L250 372 L276 462 L124 462 Z" fill="#fff" stroke="#d6e4f5" stroke-width="3" stroke-linejoin="round"/>
         <path d="M168 380 L152 460 M188 380 L182 462 M212 380 L218 462 M232 380 L248 460" stroke="#d6e4f5" stroke-width="3" stroke-linecap="round"/>
         <path d="M127 446 L273 446" stroke="#18c5c0" stroke-width="8" stroke-linecap="round"/>` + waistband('#18c5c0'),
    }),
  },
  {
    id: 'bot-tutu',
    slot: 'bottom',
    thumb: T_SKIRT,
    parts: () => ({
      hips:
        `<path d="M154 374 L246 374 L282 440 L118 440 Z" fill="#ff9fd0"/>` +
        tutuLayer(448, 86, 20, '#ff7fbf', 0.9) +
        tutuLayer(432, 78, 19, '#ffb3dc', 0.9) +
        tutuLayer(414, 66, 17, '#ffd3ea', 0.92) +
        waistband('#ff4f9d', 366, 14) +
        `<path d="M200 373 L182 362 L182 386 Z M200 373 L218 362 L218 386 Z" fill="#ffd84a"/><circle cx="200" cy="373" r="6" fill="#ffb300"/>` +
        sparkle(150, 430, 6, '#fff') +
        sparkle(246, 436, 6, '#fff'),
    }),
  },
  {
    id: 'bot-petal',
    slot: 'bottom',
    thumb: T_SKIRT,
    parts: () => {
      const petal = (x: number, len: number, fill: string, lean: number) =>
        `<path d="M${x} 374 Q${x - 26 + lean} ${374 + len * 0.6} ${x + lean * 2} ${374 + len} Q${x + 26 + lean} ${374 + len * 0.6} ${x} 374 Z" fill="${fill}" stroke="${darken(fill, 0.12)}" stroke-width="2"/>`;
      return {
        hips:
          [140, 170, 200, 230, 260].map((x, i) => petal(x, 104, i % 2 ? '#5fd38d' : '#8be0a8', (x - 200) / 5)).join('') +
          [155, 185, 215, 245].map((x, i) => petal(x, 80, i % 2 ? '#ff8ec7' : '#ffb3dc', (x - 200) / 6)).join('') +
          waistband('#3fb872') +
          flower(200, 374, 11, '#ffd84a', '#ff8ec7'),
      };
    },
  },
  {
    id: 'bot-tail',
    slot: 'bottom',
    tail: true,
    thumb: [50, 360, 300, 330],
    parts: ({ uid }) => {
      const body = 'M148 376 L252 376 Q264 446 246 514 Q230 574 208 616 L192 616 Q170 574 154 514 Q136 446 148 376 Z';
      let scales = '';
      for (let row = 0; row < 8; row++) {
        const y = 404 + row * 27;
        for (let i = -3; i <= 3; i++) {
          const x = 200 + i * 28 + (row % 2 ? 14 : 0);
          scales += `<path d="M${x - 14} ${y} q14 16 28 0" fill="none" stroke="#bafcf0" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
        }
      }
      return {
        defs: `${linearGradient(`${uid}-tl`, ['#2fd6c6', '#3aa7f0', '#9a6bff'])}<clipPath id="${uid}-tc"><path d="${body}"/></clipPath>`,
        tail:
          pivot(
            200,
            612,
            'fin',
            `<path d="M200 600 Q146 614 112 676 Q160 694 200 650 Q240 694 288 676 Q254 614 200 600 Z" fill="#ff8ec7" stroke="#ff6fb1" stroke-width="3" stroke-linejoin="round"/>
             <path d="M200 612 L140 668 M200 612 L172 672 M200 612 L228 672 M200 612 L260 668" stroke="#ffc4e3" stroke-width="3" stroke-linecap="round"/>`,
          ) +
          `<path d="${body}" fill="url(#${uid}-tl)"/><g clip-path="url(#${uid}-tc)">${scales}</g>` +
          scallopRow(152, 248, 378, 10, '#ff8ec7') +
          `<circle cx="200" cy="378" r="7" fill="#fff"/>`,
      };
    },
  },
];

/* ------------------------------------------------------------------ *
 * Dresses
 * ------------------------------------------------------------------ */

function tier(y: number, halfW: number, h: number, fill: string): string {
  return (
    `<path d="M${200 - halfW + 14} ${y} L${200 + halfW - 14} ${y} L${200 + halfW} ${y + h} L${200 - halfW} ${y + h} Z" fill="${fill}"/>` +
    scallopRow(200 - halfW + 6, 200 + halfW - 6, y + h, 10, fill)
  );
}

export const DRESSES: WearItem[] = [
  {
    id: 'dr-ballgown',
    slot: 'dress',
    thumb: T_DRESS,
    parts: () => ({
      hips:
        `<path d="M162 350 Q200 338 238 350 Q320 470 342 628 Q300 650 250 638 Q200 654 150 638 Q100 650 58 628 Q80 470 162 350 Z" fill="#ff8fc7"/>` +
        scallopRow(72, 328, 636, 15, '#ffc4e3') +
        `<path d="M162 350 Q118 470 96 566 Q160 536 200 430 Q240 536 304 566 Q282 470 238 350 Z" fill="#ffb6dc"/>` +
        sparkle(120, 590, 9, '#fff') +
        sparkle(200, 560, 11, '#fff') +
        sparkle(282, 594, 9, '#fff') +
        sparkle(160, 470, 7, '#fff') +
        sparkle(246, 480, 7, '#fff') +
        star(200, 610, 8, '#ffd84a'),
      torso:
        `<path d="${tankBody(358)}" fill="#ff5fae"/>
         <path d="M183 250 Q200 282 217 250" fill="none" stroke="#ffd84a" stroke-width="5" stroke-linecap="round"/>
         <rect x="148" y="346" width="104" height="14" rx="7" fill="#ffd84a"/>` +
        heart(200, 310, 11, '#fff') +
        `<circle cx="200" cy="353" r="7" fill="#fff" stroke="#ffb300" stroke-width="2"/>`,
      armUpper: puffSleeve('#ffb6dc', '#ffd84a'),
    }),
  },
  {
    id: 'dr-sun',
    slot: 'dress',
    thumb: [70, 235, 260, 290],
    parts: () => ({
      hips:
        `<path d="M154 346 L246 346 L286 484 Q200 506 114 484 Z" fill="#ffd84a"/>
         <path d="M118 474 Q200 496 282 474" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>` +
        flower(160, 430, 13, '#fff', '#ff9f43') +
        flower(236, 420, 13, '#fff', '#ff9f43') +
        flower(200, 462, 11, '#fff', '#ff9f43') +
        flower(196, 394, 9, '#fff', '#ff9f43'),
      torso:
        `<path d="${tankBody(352)}" fill="#ffd84a"/>
         <path d="M183 250 Q200 282 217 250" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
         <rect x="150" y="340" width="100" height="12" rx="6" fill="#ff9f43"/>` + flower(200, 306, 11, '#fff', '#ff9f43'),
    }),
  },
  {
    id: 'dr-fairy',
    slot: 'dress',
    thumb: [70, 235, 260, 290],
    parts: () => {
      const petal = (x: number, len: number, fill: string, lean: number) =>
        `<path d="M${x} 348 Q${x - 30 + lean} ${348 + len * 0.6} ${x + lean * 2.4} ${348 + len} Q${x + 30 + lean} ${348 + len * 0.6} ${x} 348 Z" fill="${fill}" stroke="${darken(fill, 0.1)}" stroke-width="2"/>`;
      return {
        hips:
          [136, 168, 200, 232, 264].map((x, i) => petal(x, 150, i % 2 ? '#ff8ec7' : '#ffb3dc', (x - 200) / 4)).join('') +
          [152, 184, 216, 248].map((x, i) => petal(x, 112, i % 2 ? '#c59bff' : '#e0c8ff', (x - 200) / 5)).join(''),
        torso:
          `<path d="${tankBody(356)}" fill="#6fdc9a"/>
           <path d="M148 344 L160 364 L174 346 L187 366 L200 346 L213 366 L226 346 L240 364 L252 344 L252 336 L148 336 Z" fill="#3fb872"/>` +
          flower(200, 300, 14, '#ff8ec7') +
          sparkle(176, 322, 6, '#fff') +
          sparkle(226, 326, 6, '#fff'),
        armUpper: `<path d="M150 252 Q118 268 126 304 Q160 300 168 262 Z" fill="#ffb3dc" stroke="#ff8ec7" stroke-width="3" stroke-linejoin="round"/>`,
      };
    },
  },
  {
    id: 'dr-party',
    slot: 'dress',
    thumb: [70, 235, 260, 290],
    parts: () => ({
      hips: tier(440, 98, 46, '#7a45e0') + tier(396, 82, 46, '#9a5cf5') + tier(350, 64, 48, '#b98bff'),
      torso:
        `<path d="${teeBody(356)}" fill="#9a5cf5"/>
         <path d="M167 249 Q200 279 233 249" fill="none" stroke="#e0c8ff" stroke-width="6" stroke-linecap="round"/>
         <rect x="150" y="342" width="100" height="13" rx="6.5" fill="#ff6fb1"/>
         <path d="M200 348 L180 334 L180 362 Z M200 348 L220 334 L220 362 Z" fill="#ff6fb1"/><circle cx="200" cy="348" r="7" fill="#ff3f9a"/>` +
        sparkle(180, 300, 7, '#fff') +
        sparkle(222, 312, 6, '#fff'),
      armUpper: shortSleeve('#b98bff', '#e0c8ff'),
    }),
  },
  {
    id: 'dr-pop',
    slot: 'dress',
    thumb: [60, 235, 280, 410],
    parts: ({ uid }) => ({
      defs: linearGradient(`${uid}-pp`, ['#ff2f8e', '#ff7a3c', '#ffd23c']),
      leg: pantsLeg('#2a1f4a', 634) + sparkle(172, 500, 6, '#ff8ec7') + sparkle(182, 570, 5, '#8be9ff'),
      hips:
        tutuLayer(468, 84, 18, '#27d3c3', 0.85) +
        `<path d="M154 348 L246 348 L280 462 L246 444 L224 468 L200 446 L176 468 L154 444 L120 462 Z" fill="url(#${uid}-pp)"/>` +
        star(170, 410, 9, '#fff') +
        star(232, 404, 7, '#fff') +
        sparkle(200, 426, 8, '#fff'),
      torso:
        `<path d="${tankBody(356)}" fill="url(#${uid}-pp)"/>
         <rect x="148" y="342" width="104" height="14" rx="7" fill="#2a1f4a"/>` +
        star(200, 349, 11, '#ffd84a') +
        star(200, 300, 15, '#fff') +
        sparkle(174, 286, 6, '#fff'),
    }),
  },
  {
    id: 'dr-rainbow',
    slot: 'dress',
    thumb: [70, 235, 260, 290],
    parts: ({ uid }) => {
      const skirt = 'M156 346 L244 346 L288 480 L112 480 Z';
      return {
        defs: `<clipPath id="${uid}-rb"><path d="${skirt}"/></clipPath>`,
        hips:
          `<g clip-path="url(#${uid}-rb)">${RAINBOW.map((c, i) => `<rect x="100" y="${346 + i * 23}" width="200" height="24" fill="${c}"/>`).join('')}</g>` +
          scallopRow(118, 282, 482, 13, '#fff'),
        torso:
          `<path d="${teeBody(354)}" fill="#fff"/>
           <path d="M167 249 Q200 279 233 249" fill="none" stroke="#4db8ff" stroke-width="6" stroke-linecap="round"/>
           <path d="M176 330 A24 24 0 0 1 224 330" fill="none" stroke="#ff5d73" stroke-width="6"/>
           <path d="M182 330 A18 18 0 0 1 218 330" fill="none" stroke="#ffd84a" stroke-width="6"/>
           <path d="M188 330 A12 12 0 0 1 212 330" fill="none" stroke="#4db8ff" stroke-width="6"/>
           <rect x="150" y="340" width="100" height="12" rx="6" fill="#a57bff"/>`,
        armUpper: shortSleeve('#fff', '#ff5d73'),
      };
    },
  },
  {
    id: 'dr-space',
    slot: 'dress',
    thumb: T_DRESS,
    parts: () => ({
      leg:
        pantsLeg('#f2f5ff', 630) +
        `<rect x="158" y="500" width="38" height="24" rx="10" fill="#b9c6ee"/><path d="M158 610 L197 610" stroke="#27d3c3" stroke-width="9" stroke-linecap="round"/>`,
      hips: hipBand('#f2f5ff') + `<rect x="148" y="366" width="104" height="13" rx="6.5" fill="#ff6fb1"/><rect x="190" y="363" width="20" height="19" rx="5" fill="#ffd84a"/>`,
      torso:
        `<path d="${teeBody(380)}" fill="#f2f5ff"/>
         <path d="M166 250 Q200 284 234 250" fill="none" stroke="#b9c6ee" stroke-width="12" stroke-linecap="round"/>
         <rect x="172" y="296" width="56" height="42" rx="10" fill="#dfe6fb" stroke="#b9c6ee" stroke-width="3"/>
         <circle cx="186" cy="310" r="6" fill="#ff5d73"/><circle cx="200" cy="310" r="6" fill="#ffd84a"/><circle cx="214" cy="310" r="6" fill="#5fd38d"/>
         <rect x="182" y="322" width="36" height="8" rx="4" fill="#4db8ff"/>`,
      armUpper: longUpper('#f2f5ff') + `<line x1="140" y1="296" x2="165" y2="302" stroke="#27d3c3" stroke-width="9" stroke-linecap="round"/>`,
      armFore: longFore('#f2f5ff', '#ff6fb1'),
    }),
  },
  {
    id: 'dr-night',
    slot: 'dress',
    thumb: T_DRESS,
    parts: ({ uid }) => ({
      defs: linearGradient(`${uid}-nt`, ['#3a2fb0', '#5a38c8', '#b05ad6']),
      hips:
        `<path d="M158 350 Q200 340 242 350 Q286 480 298 632 Q250 652 200 644 Q150 652 102 632 Q114 480 158 350 Z" fill="url(#${uid}-nt)"/>` +
        star(150, 520, 9, '#ffd84a') +
        star(244, 470, 7, '#ffd84a') +
        star(214, 580, 10, '#ffd84a') +
        star(134, 600, 6, '#fff') +
        star(268, 590, 7, '#fff') +
        sparkle(184, 450, 7, '#fff') +
        sparkle(240, 540, 6, '#fff') +
        sparkle(160, 420, 5, '#fff') +
        `<path d="M108 628 Q200 652 292 628" fill="none" stroke="#dfe6fb" stroke-width="6" stroke-linecap="round"/>`,
      torso:
        `<path d="${tankBody(358)}" fill="#3a2fb0"/>
         <path d="M183 250 Q200 282 217 250" fill="none" stroke="#dfe6fb" stroke-width="5" stroke-linecap="round"/>
         <rect x="148" y="346" width="104" height="12" rx="6" fill="#dfe6fb"/>
         <path d="M210 296 A16 16 0 1 0 210 326 A12 12 0 1 1 210 296 Z" fill="#ffd84a"/>` + sparkle(180, 300, 6, '#fff'),
      armUpper: shortSleeve('#5a38c8', '#dfe6fb'),
    }),
  },
];

/* ------------------------------------------------------------------ *
 * Shoes (left foot; mirrored for the right)
 * ------------------------------------------------------------------ */

const shoeBase = (fill: string, top = 640) =>
  `<path d="M150 656 Q148 ${top} 165 ${top} L189 ${top} Q200 ${top} 200 656 Q200 671 187 671 L163 671 Q150 671 150 656 Z" fill="${fill}"/>`;

export const SHOES: WearItem[] = [
  {
    id: 'sh-sneakers',
    slot: 'shoes',
    thumb: T_SHOES,
    parts: () => ({
      foot:
        shoeBase('#fff', 632) +
        `<path d="M150 660 Q150 671 163 671 L187 671 Q200 671 200 660 Z" fill="#ff6fb1"/>
         <path d="M156 652 Q175 640 194 652 L194 660 L156 660 Z" fill="#ffd0e6"/>
         <path d="M166 638 L184 638 M166 645 L184 645" stroke="#ff6fb1" stroke-width="3" stroke-linecap="round"/>` + star(175, 654, 4.5, '#ffd84a'),
    }),
  },
  {
    id: 'sh-flats',
    slot: 'shoes',
    thumb: [110, 580, 180, 110],
    parts: () => ({
      foot:
        `<path d="M152 654 Q150 671 174 671 Q198 671 196 654 Q186 663 174 663 Q162 663 152 654 Z" fill="#ff8ec7" stroke="#ff8ec7" stroke-width="3" stroke-linejoin="round"/>
         <path d="M165 640 L188 616 M188 640 L166 616" stroke="#ff8ec7" stroke-width="5" stroke-linecap="round"/>
         <path d="M176 612 L164 604 L164 620 Z M176 612 L188 604 L188 620 Z" fill="#ff5fae"/>`,
    }),
  },
  {
    id: 'sh-boots',
    slot: 'shoes',
    thumb: [100, 540, 200, 150],
    parts: () => ({
      foot:
        `<path d="M159 566 L196 566 L193 640 Q201 646 200 658 Q200 671 187 671 L163 671 Q150 671 150 656 Q152 646 161 640 Z" fill="#ff3f9a"/>
         <rect x="154" y="556" width="46" height="18" rx="9" fill="#fff"/>
         <path d="M150 662 Q150 671 163 671 L187 671 Q200 671 200 662 Z" fill="#c2186b"/>` +
        star(177, 608, 9, '#ffd84a') +
        sparkle(170, 640, 5, '#fff'),
    }),
  },
  {
    id: 'sh-sandals',
    slot: 'shoes',
    thumb: T_SHOES,
    parts: () => ({
      foot:
        `<rect x="149" y="663" width="52" height="9" rx="4.5" fill="#f0a81c"/>
         <path d="M154 657 Q175 646 196 657" fill="none" stroke="#27d3c3" stroke-width="7" stroke-linecap="round"/>
         <path d="M164 638 L190 638" stroke="#27d3c3" stroke-width="6" stroke-linecap="round"/>` + flower(175, 650, 6, '#ff8ec7'),
    }),
  },
  {
    id: 'sh-maryjane',
    slot: 'shoes',
    thumb: [110, 580, 180, 110],
    parts: () => ({
      foot:
        `<path d="M161 606 L193 606 L191 646 L163 646 Z" fill="#fff" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>` +
        scallopRow(162, 192, 604, 5, '#ffd0e6') +
        `<path d="M150 656 Q149 648 158 648 L192 648 Q201 648 200 656 Q200 671 187 671 L163 671 Q150 671 150 656 Z" fill="#e8203d"/>
         <path d="M160 644 L191 644" stroke="#e8203d" stroke-width="6" stroke-linecap="round"/><circle cx="189" cy="644" r="3.5" fill="#ffd84a"/>
         <ellipse cx="166" cy="656" rx="5" ry="3" fill="#fff" opacity=".6"/>`,
    }),
  },
  {
    id: 'sh-crystal',
    slot: 'shoes',
    thumb: T_SHOES,
    parts: () => ({
      foot:
        `<path d="M150 656 Q148 642 165 642 L189 642 Q200 642 200 656 Q200 671 187 671 L163 671 Q150 671 150 656 Z" fill="#bfeaff" stroke="#fff" stroke-width="3" opacity=".92"/>
         <path d="M157 652 Q164 646 172 648" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
         <path d="M176 646 L166 640 L166 652 Z M176 646 L186 640 L186 652 Z" fill="#7ad7ff"/>` +
        sparkle(190, 660, 6, '#fff') +
        sparkle(160, 664, 4, '#fff'),
    }),
  },
  {
    id: 'sh-skates',
    slot: 'shoes',
    thumb: [100, 580, 200, 120],
    parts: () => ({
      foot:
        `<path d="M160 606 L194 606 L193 640 Q201 644 200 656 Q200 668 187 668 L163 668 Q150 668 150 654 Q152 644 161 640 Z" fill="#fff"/>
         <rect x="156" y="598" width="42" height="13" rx="6.5" fill="#a57bff"/>
         <path d="M168 620 L186 620 M168 630 L186 630" stroke="#ff6fb1" stroke-width="3" stroke-linecap="round"/>
         <rect x="148" y="664" width="54" height="8" rx="4" fill="#ff6fb1"/>
         <circle cx="161" cy="680" r="9" fill="#ffd84a" stroke="#f0a81c" stroke-width="2.5"/><circle cx="189" cy="680" r="9" fill="#ffd84a" stroke="#f0a81c" stroke-width="2.5"/>` +
        heart(175, 652, 5, '#ff6fb1'),
    }),
  },
  {
    id: 'sh-moon',
    slot: 'shoes',
    thumb: [100, 560, 200, 130],
    parts: () => ({
      foot:
        `<path d="M156 588 L199 588 L198 640 Q206 646 205 658 Q205 673 190 673 L160 673 Q145 673 146 656 Q147 646 157 640 Z" fill="#e3e9fb"/>
         <path d="M146 660 Q146 673 160 673 L190 673 Q205 673 205 660 Z" fill="#8f9cc9"/>
         <path d="M157 604 L198 604 M157 622 L198 622" stroke="#b9c6ee" stroke-width="5" stroke-linecap="round"/>
         <rect x="152" y="580" width="50" height="14" rx="7" fill="#27d3c3"/>` + star(177, 648, 6, '#ff6fb1'),
    }),
  },
];

