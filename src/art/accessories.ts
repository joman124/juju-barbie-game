import type { WearItem } from '../types';
import { flower, heart, heartPath, linearGradient, mirror, scallopCircle, sparkle, star, starPath } from './svg';

const T_HEAD: [number, number, number, number] = [80, -30, 240, 230];
const T_NECK: [number, number, number, number] = [130, 226, 140, 120];
const T_FACE: [number, number, number, number] = [112, 116, 176, 110];

/* ---------------------------- on the head --------------------------- */

export const HEAD_ACC: WearItem[] = [
  {
    id: 'hd-tiara',
    slot: 'accHead',
    thumb: T_HEAD,
    parts: () => ({
      head:
        `<path d="M166 84 L180 50 L191 74 L200 34 L209 74 L220 50 L234 84 Q200 70 166 84 Z" fill="#eef1ff" stroke="#b9c3ef" stroke-width="3" stroke-linejoin="round"/>
         <path d="M146 92 Q200 64 254 92" fill="none" stroke="#dfe6fb" stroke-width="8" stroke-linecap="round"/>
         <circle cx="200" cy="56" r="7" fill="#ff6fb1"/><circle cx="181" cy="64" r="4.5" fill="#7ad7ff"/><circle cx="219" cy="64" r="4.5" fill="#7ad7ff"/>` +
        sparkle(200, 26, 7, '#fff'),
    }),
  },
  {
    id: 'hd-crown',
    slot: 'accHead',
    tuck: 'top',
    thumb: T_HEAD,
    parts: () => ({
      head:
        `<path d="M150 82 L142 20 L172 50 L200 6 L228 50 L258 20 L250 82 Q200 68 150 82 Z" fill="#ffcf3f" stroke="#f0a81c" stroke-width="4" stroke-linejoin="round"/>
         <path d="M152 76 Q200 62 248 76" fill="none" stroke="#f0a81c" stroke-width="5" stroke-linecap="round"/>
         <circle cx="142" cy="20" r="7" fill="#ff6fb1"/><circle cx="200" cy="6" r="8" fill="#ff6fb1"/><circle cx="258" cy="20" r="7" fill="#ff6fb1"/>
         <circle cx="200" cy="52" r="8" fill="#ff3f6e"/><circle cx="172" cy="62" r="5" fill="#4db8ff"/><circle cx="228" cy="62" r="5" fill="#4db8ff"/>`,
    }),
  },
  {
    id: 'hd-bow',
    slot: 'accHead',
    tuck: 'top',
    thumb: T_HEAD,
    parts: () => ({
      head:
        `<path d="M200 56 C170 20 132 22 138 58 C132 92 172 90 200 60 Z" fill="#ff5fae" stroke="#e03d8f" stroke-width="3" stroke-linejoin="round"/>
         <path d="M200 56 C230 20 268 22 262 58 C268 92 228 90 200 60 Z" fill="#ff5fae" stroke="#e03d8f" stroke-width="3" stroke-linejoin="round"/>
         <circle cx="160" cy="50" r="5" fill="#fff"/><circle cx="170" cy="70" r="4" fill="#fff"/><circle cx="240" cy="50" r="5" fill="#fff"/><circle cx="230" cy="70" r="4" fill="#fff"/>
         <ellipse cx="200" cy="58" rx="13" ry="16" fill="#ff3f9a" stroke="#e03d8f" stroke-width="3"/>`,
    }),
  },
  {
    id: 'hd-flowers',
    slot: 'accHead',
    thumb: T_HEAD,
    parts: () => {
      const pts: Array<[number, number, string]> = [
        [124, 112, '#ff8ec7'],
        [142, 84, '#ffd84a'],
        [168, 66, '#c59bff'],
        [200, 58, '#ff6f91'],
        [232, 66, '#7ad7ff'],
        [258, 84, '#ffd84a'],
        [276, 112, '#ff8ec7'],
      ];
      return {
        head:
          `<path d="M120 116 Q200 30 280 116" fill="none" stroke="#3fb872" stroke-width="7" stroke-linecap="round"/>` +
          pts
            .map(
              ([x, y, c], i) =>
                `<ellipse cx="${x + (i % 2 ? 14 : -14)}" cy="${y + 4}" rx="9" ry="5" fill="#5fd38d" transform="rotate(${i % 2 ? 30 : -30} ${x} ${y})"/>` +
                flower(x, y, i === 3 ? 17 : 14, c, c === '#ffd84a' ? '#ff9f43' : '#ffd84a'),
            )
            .join(''),
      };
    },
  },
  {
    id: 'hd-cap',
    slot: 'accHead',
    tuck: 'top',
    thumb: T_HEAD,
    parts: () => ({
      head:
        `<path d="M106 112 C104 52 152 26 200 26 C248 26 296 52 294 112 Q200 88 106 112 Z" fill="#18c5c0"/>
         <path d="M200 28 L200 96 M156 38 Q150 70 150 100 M244 38 Q250 70 250 100" stroke="#0fa5a3" stroke-width="3" fill="none" stroke-linecap="round"/>
         <path d="M120 122 Q200 106 280 122 L280 142 Q200 124 120 142 Z" fill="#4a1040" opacity=".16"/>
         <path d="M104 110 Q200 82 296 110 Q300 132 262 130 Q200 112 138 130 Q100 132 104 110 Z" fill="#ff6fb1"/>
         <circle cx="200" cy="26" r="7" fill="#ff6fb1"/>` + star(200, 68, 14, '#fff'),
    }),
  },
  {
    id: 'hd-phones',
    slot: 'accHead',
    thumb: [70, 0, 260, 220],
    parts: () => ({
      head:
        `<path d="M110 150 C104 30 296 30 290 150" fill="none" stroke="#ff5fae" stroke-width="13" stroke-linecap="round"/>
         <rect x="92" y="126" width="32" height="68" rx="15" fill="#8f6bff" stroke="#6f49e6" stroke-width="3"/>
         <rect x="276" y="126" width="32" height="68" rx="15" fill="#8f6bff" stroke="#6f49e6" stroke-width="3"/>` +
        star(108, 160, 8, '#ffd84a') +
        star(292, 160, 8, '#ffd84a'),
    }),
  },
  {
    id: 'hd-cat',
    slot: 'accHead',
    thumb: T_HEAD,
    parts: () => {
      const ear = `<path d="M128 84 L138 14 L184 54 Z" fill="#3d2a55" stroke="#3d2a55" stroke-width="8" stroke-linejoin="round"/><path d="M140 70 L144 34 L168 56 Z" fill="#ff8ec7"/>`;
      return {
        head: `<path d="M122 110 Q200 36 278 110" fill="none" stroke="#3d2a55" stroke-width="8" stroke-linecap="round"/>` + ear + mirror(ear),
      };
    },
  },
  {
    id: 'hd-helmet',
    slot: 'accHead',
    tuck: 'all',
    thumb: [50, -20, 300, 300],
    parts: () => ({
      over:
        `<circle cx="200" cy="138" r="132" fill="#dff3ff" fill-opacity=".2" stroke="#eef4ff" stroke-width="7"/>
         <path d="M110 80 Q140 30 196 20" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
         <circle cx="98" cy="110" r="6" fill="#fff" opacity=".8"/>
         <ellipse cx="200" cy="258" rx="78" ry="17" fill="#c9d3ea"/><ellipse cx="200" cy="254" rx="78" ry="14" fill="#e8edfb"/>
         <circle cx="140" cy="256" r="5" fill="#ff6fb1"/><circle cx="260" cy="256" r="5" fill="#27d3c3"/>`,
    }),
  },
];

/* ------------------------- jewellery and glasses -------------------- */

const cord = (color: string) => `<path d="M176 252 Q200 296 224 252" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;

function pearls(): string {
  let out = '';
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const x = 174 + 52 * t;
    const y = 254 + Math.sin(t * Math.PI) * 26;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#fff" stroke="#e3d3f5" stroke-width="1.5"/>`;
  }
  return out;
}

const lensArm = `<path d="M124 160 L140 162 M276 160 L260 162" stroke-width="5" stroke-linecap="round" fill="none"`;

export const BLING_ACC: WearItem[] = [
  { id: 'nk-pearls', slot: 'accNeck', thumb: T_NECK, parts: () => ({ neck: pearls() }) },
  {
    id: 'nk-heart',
    slot: 'accNeck',
    thumb: T_NECK,
    parts: () => ({
      neck: cord('#f0a81c') + `<path d="${heartPath(200, 286, 12)}" fill="#ff3f6e" stroke="#ffcf3f" stroke-width="3"/><circle cx="195" cy="282" r="2.5" fill="#fff"/>`,
    }),
  },
  {
    id: 'nk-medal',
    slot: 'accNeck',
    thumb: [130, 232, 140, 120],
    parts: () => ({
      neck:
        `<path d="M176 252 L200 300 L224 252" fill="none" stroke="#4db8ff" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
         <path d="M176 252 L200 300 L224 252" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
         <circle cx="200" cy="312" r="17" fill="#ffcf3f" stroke="#f0a81c" stroke-width="4"/>` + star(200, 312, 8, '#fff'),
    }),
  },
  {
    id: 'nk-shells',
    slot: 'accNeck',
    thumb: T_NECK,
    parts: () => {
      const shell = (x: number, y: number, c: string) =>
        `<path d="M${x - 9} ${y - 2} Q${x} ${y - 14} ${x + 9} ${y - 2} Q${x} ${y + 12} ${x - 9} ${y - 2} Z" fill="${c}" stroke="#fff" stroke-width="1.5"/>`;
      return { neck: cord('#8be9ff') + shell(184, 270, '#ffb3dc') + shell(200, 280, '#8be9ff') + shell(216, 270, '#ffb3dc') };
    },
  },
  {
    id: 'gl-hearts',
    slot: 'accFace',
    thumb: T_FACE,
    parts: () => ({
      face:
        `${lensArm} stroke="#ff3f9a"/>
         <path d="${heartPath(169, 163, 22)}" fill="#ff8ec7" fill-opacity=".85" stroke="#ff3f9a" stroke-width="6" stroke-linejoin="round"/>
         <path d="${heartPath(231, 163, 22)}" fill="#ff8ec7" fill-opacity=".85" stroke="#ff3f9a" stroke-width="6" stroke-linejoin="round"/>
         <path d="M192 160 Q200 154 208 160" fill="none" stroke="#ff3f9a" stroke-width="5" stroke-linecap="round"/>
         <path d="M152 152 Q158 144 166 148 M214 152 Q220 144 228 148" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>`,
    }),
  },
  {
    id: 'gl-stars',
    slot: 'accFace',
    thumb: T_FACE,
    parts: () => ({
      face:
        `${lensArm} stroke="#f0a81c"/>
         <path d="${starPath(169, 165, 29, 0.55)}" fill="#4a3fb5" fill-opacity=".8" stroke="#ffcf3f" stroke-width="7" stroke-linejoin="round"/>
         <path d="${starPath(231, 165, 29, 0.55)}" fill="#4a3fb5" fill-opacity=".8" stroke="#ffcf3f" stroke-width="7" stroke-linejoin="round"/>
         <path d="M188 162 Q200 156 212 162" fill="none" stroke="#ffcf3f" stroke-width="5" stroke-linecap="round"/>` +
        sparkle(160, 156, 6, '#fff') +
        sparkle(222, 156, 6, '#fff'),
    }),
  },
  {
    id: 'gl-round',
    slot: 'accFace',
    thumb: T_FACE,
    parts: () => ({
      face:
        `${lensArm} stroke="#7a4de0"/>
         <circle cx="169" cy="165" r="24" fill="#bfe6ff" fill-opacity=".28" stroke="#7a4de0" stroke-width="6"/>
         <circle cx="231" cy="165" r="24" fill="#bfe6ff" fill-opacity=".28" stroke="#7a4de0" stroke-width="6"/>
         <path d="M193 162 Q200 156 207 162" fill="none" stroke="#7a4de0" stroke-width="5" stroke-linecap="round"/>
         <path d="M154 154 Q160 146 168 148 M216 154 Q222 146 230 148" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>`,
    }),
  },
  {
    id: 'gl-cat',
    slot: 'accFace',
    thumb: T_FACE,
    parts: () => {
      const lens = `<path d="M146 158 Q138 138 128 136 Q150 140 190 150 Q196 172 180 184 Q160 190 148 178 Z" fill="#1f1a3a" fill-opacity=".78" stroke="#27d3c3" stroke-width="6" stroke-linejoin="round"/><circle cx="132" cy="138" r="4" fill="#ffd84a"/>`;
      return {
        face: lens + mirror(lens) + `<path d="M190 156 Q200 150 210 156" fill="none" stroke="#27d3c3" stroke-width="5" stroke-linecap="round"/><path d="M156 160 Q162 154 170 156 M222 160 Q228 154 236 156" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`,
      };
    },
  },
];

/* ------------------------ carried things and wings ------------------ */

const T_HANDL: [number, number, number, number] = [60, 380, 150, 150];
const T_HANDR: [number, number, number, number] = [226, 290, 170, 170];

function pom(): string {
  let rays = '';
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const r = 34 + (i % 3) * 6;
    rays += `<line x1="130" y1="440" x2="${(130 + Math.cos(a) * r).toFixed(1)}" y2="${(440 + Math.sin(a) * r).toFixed(1)}" stroke="${i % 2 ? '#18c5c0' : '#ff6fb1'}" stroke-width="7" stroke-linecap="round"/>`;
  }
  return rays + scallopCircle(130, 440, 24, 9, '#ffd84a', 0.36);
}

export const CARRY_ACC: WearItem[] = [
  {
    id: 'hl-purse',
    slot: 'accHandL',
    thumb: T_HANDL,
    parts: () => ({
      hand:
        `<path d="M114 462 Q112 426 130 424 Q148 426 146 462" fill="none" stroke="#f0a81c" stroke-width="5" stroke-linecap="round"/>
         <path d="M102 460 L158 460 Q164 500 154 510 L106 510 Q96 500 102 460 Z" fill="#ff5fae" stroke="#e03d8f" stroke-width="3" stroke-linejoin="round"/>
         <path d="M102 460 L158 460 Q150 486 130 486 Q110 486 102 460 Z" fill="#ff8ec7" stroke="#e03d8f" stroke-width="3" stroke-linejoin="round"/>` +
        heart(130, 486, 8, '#ffd84a'),
    }),
  },
  {
    id: 'hl-pom',
    slot: 'accHandL',
    thumb: [60, 370, 140, 140],
    parts: () => ({ hand: pom() }),
  },
  {
    id: 'hl-balloon',
    slot: 'accHandL',
    thumb: [26, 142, 136, 136],
    parts: () => ({
      hand:
        `<path d="M128 420 Q96 360 104 300 Q108 276 96 252" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
         <path d="${heartPath(92, 200, 40)}" fill="#ff4f8b" stroke="#ff8ec7" stroke-width="4" stroke-linejoin="round"/>
         <path d="M68 176 Q74 162 88 166" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/>
         <path d="M92 236 L86 250 L98 250 Z" fill="#ff4f8b"/>`,
    }),
  },
  {
    id: 'hr-wand',
    slot: 'accHandR',
    thumb: T_HANDR,
    parts: () => ({
      hand:
        `<line x1="131" y1="436" x2="108" y2="346" stroke="#ff8ec7" stroke-width="7" stroke-linecap="round"/>
         <line x1="131" y1="436" x2="108" y2="346" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="6 10"/>
         <path d="M108 346 Q92 360 86 380 M108 346 Q120 362 118 380" fill="none" stroke="#8be9ff" stroke-width="4" stroke-linecap="round"/>` +
        star(106, 330, 26, '#ffd84a') +
        star(106, 330, 12, '#fff8d6') +
        sparkle(74, 312, 8, '#fff') +
        sparkle(140, 306, 7, '#fff') +
        sparkle(88, 290, 5, '#fff'),
    }),
  },
  {
    id: 'hr-mic',
    slot: 'accHandR',
    thumb: [240, 330, 140, 140],
    parts: () => ({
      hand:
        `<line x1="131" y1="438" x2="121" y2="396" stroke="#ff3f9a" stroke-width="13" stroke-linecap="round"/>
         <line x1="126" y1="418" x2="124" y2="408" stroke="#ffd84a" stroke-width="13" stroke-linecap="butt"/>
         <circle cx="118" cy="380" r="17" fill="#dfe6fb" stroke="#b9c6ee" stroke-width="3"/>
         <path d="M104 374 Q118 368 132 376 M103 384 Q118 380 133 386 M112 366 L112 394 M124 365 L124 396" stroke="#b9c6ee" stroke-width="2" fill="none"/>` +
        sparkle(96, 360, 7, '#fff'),
    }),
  },
  {
    id: 'bk-fairy',
    slot: 'accBack',
    thumb: [0, 110, 400, 360],
    parts: ({ uid }) => {
      const wing = `<path d="M198 296 C160 170 70 96 34 150 C8 210 96 300 198 304 Z" fill="url(#${uid}-fw)" fill-opacity=".85" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
        <path d="M198 306 C140 312 70 356 88 420 C118 462 186 384 198 314 Z" fill="url(#${uid}-fw)" fill-opacity=".8" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
        <path d="M190 292 Q120 210 60 164 M186 296 Q120 250 56 216 M190 312 Q140 350 104 404" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;
      return {
        defs: linearGradient(`${uid}-fw`, ['#ffd0f0', '#a8f0ff', '#c9b3ff']),
        behind: wing + mirror(wing) + sparkle(70, 130, 9, '#fff') + sparkle(330, 130, 9, '#fff') + sparkle(86, 430, 6, '#fff') + sparkle(314, 430, 6, '#fff'),
      };
    },
  },
  {
    id: 'bk-butterfly',
    slot: 'accBack',
    thumb: [0, 110, 400, 360],
    parts: () => {
      const wing = `<path d="M198 294 C176 170 76 92 30 140 C-4 196 70 304 198 304 Z" fill="#a064ff" stroke="#5a2fb8" stroke-width="6" stroke-linejoin="round"/>
        <path d="M198 306 C128 300 52 344 66 414 C92 470 184 404 198 314 Z" fill="#ff7fbf" stroke="#5a2fb8" stroke-width="6" stroke-linejoin="round"/>
        <circle cx="86" cy="170" r="20" fill="#ffd84a"/><circle cx="130" cy="222" r="13" fill="#8be9ff"/><circle cx="64" cy="218" r="9" fill="#fff"/>
        <circle cx="110" cy="380" r="15" fill="#ffd84a"/><circle cx="150" cy="346" r="8" fill="#fff"/>`;
      return { behind: wing + mirror(wing) };
    },
  },
  {
    id: 'bk-cape',
    slot: 'accBack',
    thumb: [60, 230, 280, 400],
    parts: () => ({
      behind:
        `<path d="M156 254 Q200 238 244 254 L310 596 Q256 628 200 606 Q144 628 90 596 Z" fill="#c0308a"/>
         <path d="M156 254 L90 596 M244 254 L310 596" stroke="#ffcf3f" stroke-width="7" stroke-linecap="round"/>
         <path d="M90 596 Q144 628 200 606 Q256 628 310 596" fill="none" stroke="#ffcf3f" stroke-width="7" stroke-linecap="round"/>` +
        star(128, 520, 9, '#ffcf3f') +
        star(272, 520, 9, '#ffcf3f'),
      neck:
        `<path d="M160 252 Q200 276 240 252 Q244 266 236 274 Q200 292 164 274 Q156 266 160 252 Z" fill="#fff"/>
         <circle cx="176" cy="268" r="3" fill="#3d2a55"/><circle cx="224" cy="268" r="3" fill="#3d2a55"/>
         <circle cx="200" cy="278" r="8" fill="#ffcf3f" stroke="#f0a81c" stroke-width="2.5"/>`,
    }),
  },
];
