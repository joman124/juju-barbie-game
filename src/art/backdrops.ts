import type { Theme } from '../types';
import { flower, heart, linearGradient, mix, rng, sparkle, star } from './svg';

/** Every runway scene is drawn in this space; the runway vanishes at y = 500. */
export const SCENE_W = 1200;
export const SCENE_H = 900;
export const SCENE_VIEWBOX = `0 0 ${SCENE_W} ${SCENE_H}`;

interface RunwayStyle {
  top: string;
  bottom: string;
  rim: string;
  light: string;
  light2: string;
  crowd: string;
}

const STYLES: Record<Theme, RunwayStyle> = {
  stadium: { top: '#ff8f7a', bottom: '#ff5f52', rim: '#ffffff', light: '#ffffff', light2: '#ffd84a', crowd: '#28407a' },
  ocean: { top: '#d9fbf6', bottom: '#8be9ff', rim: '#ff9ccb', light: '#ffffff', light2: '#ff9ccb', crowd: '#0e4f8a' },
  castle: { top: '#ff5f86', bottom: '#d81b54', rim: '#ffcf3f', light: '#fff3b8', light2: '#ffcf3f', crowd: '#7a2a66' },
  forest: { top: '#f0c78c', bottom: '#cf9a5a', rim: '#3fb872', light: '#fff3b8', light2: '#ff8ec7', crowd: '#1f6b46' },
  space: { top: '#5a45d6', bottom: '#2c1f8a', rim: '#27d3c3', light: '#8bfff2', light2: '#ff8ec7', crowd: '#120a33' },
  concert: { top: '#4a3470', bottom: '#1d1233', rim: '#ff3f9a', light: '#ff8ec7', light2: '#8be9ff', crowd: '#12081f' },
};

function clouds(pts: Array<[number, number, number]>, fill = '#fff', opacity = 0.9): string {
  return pts
    .map(
      ([x, y, s]) =>
        `<g opacity="${opacity}" fill="${fill}"><ellipse cx="${x}" cy="${y}" rx="${70 * s}" ry="${26 * s}"/><circle cx="${x - 30 * s}" cy="${y - 16 * s}" r="${26 * s}"/><circle cx="${x + 12 * s}" cy="${y - 26 * s}" r="${34 * s}"/><circle cx="${x + 46 * s}" cy="${y - 10 * s}" r="${22 * s}"/></g>`,
    )
    .join('');
}

function stadium(uid: string): string {
  const r = rng(11);
  let dots = '';
  const colors = ['#ff6fb1', '#ffd84a', '#8be9ff', '#ffffff', '#ff9f43', '#b98bff'];
  for (let row = 0; row < 7; row++) {
    for (let i = 0; i < 46; i++) {
      const x = 14 + i * 26 + (row % 2) * 13 + r() * 6;
      const sag = Math.pow((x - 600) / 600, 2) * 90;
      const y = 250 + row * 30 + sag + r() * 4;
      if (y > 486) continue;
      dots += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="9" fill="${colors[Math.floor(r() * colors.length)]}"/>`;
    }
  }
  let flags = '';
  for (let i = 0; i < 20; i++) {
    const x = 30 + i * 60;
    const y = 60 + Math.sin((i / 19) * Math.PI) * 46;
    flags += `<path d="M${x} ${y} L${x + 44} ${y + 3} L${x + 22} ${y + 44} Z" fill="${colors[i % colors.length]}"/>`;
  }
  let stripes = '';
  for (let i = 0; i < 6; i++) {
    const a = 600 + (i - 3) * 60;
    const b = 600 + (i - 3) * 420;
    if (i % 2 === 0) stripes += `<path d="M${a} 500 L${a + 60} 500 L${b + 420} 900 L${b} 900 Z" fill="#fff" opacity=".12"/>`;
  }
  const lamp = (x: number) =>
    `<rect x="${x - 5}" y="120" width="10" height="150" fill="#5a6f9c"/><rect x="${x - 44}" y="84" width="88" height="46" rx="8" fill="#3d4f7a"/>` +
    [0, 1, 2].map((k) => `<circle cx="${x - 26 + k * 26}" cy="107" r="10" fill="#fff8c9"/>`).join('');
  return (
    `<defs>${linearGradient(`${uid}-sky`, ['#5cc4ff', '#c9efff'])}${linearGradient(`${uid}-grass`, ['#7fe07a', '#3fb85a'])}</defs>
     <rect width="1200" height="520" fill="url(#${uid}-sky)"/>
     <circle cx="980" cy="110" r="62" fill="#fff3a8"/><circle cx="980" cy="110" r="44" fill="#ffe05c"/>` +
    clouds([
      [220, 150, 1],
      [640, 96, 0.8],
      [1080, 230, 0.7],
    ]) +
    `<path d="M0 240 Q600 150 1200 240 L1200 520 L0 520 Z" fill="#4a5fc4"/>
     <path d="M0 240 Q600 150 1200 240" fill="none" stroke="#fff" stroke-width="10"/>` +
    dots +
    lamp(150) +
    lamp(1050) +
    `<path d="M10 62 Q600 150 1190 62" fill="none" stroke="#fff" stroke-width="4"/>` +
    flags +
    `<rect y="500" width="1200" height="400" fill="url(#${uid}-grass)"/>` +
    stripes +
    `<path d="M0 500 L1200 500" stroke="#fff" stroke-width="8"/>`
  );
}

function ocean(uid: string): string {
  const r = rng(23);
  let bubbles = '';
  for (let i = 0; i < 34; i++) {
    const x = r() * 1200;
    const y = r() * 470;
    const s = 5 + r() * 16;
    bubbles += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(0)}" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".6" stroke-width="2.5"/>`;
  }
  const weed = (x: number, h: number, c: string) =>
    `<path d="M${x} 560 Q${x - 30} ${560 - h * 0.25} ${x} ${560 - h * 0.5} Q${x + 30} ${560 - h * 0.75} ${x} ${560 - h}" fill="none" stroke="${c}" stroke-width="20" stroke-linecap="round"/>`;
  const coral = (x: number, y: number, c: string, s: number) =>
    `<g fill="none" stroke="${c}" stroke-width="${18 * s}" stroke-linecap="round"><path d="M${x} ${y} L${x} ${y - 90 * s}"/><path d="M${x} ${y - 40 * s} Q${x - 40 * s} ${y - 50 * s} ${x - 46 * s} ${y - 100 * s}"/><path d="M${x} ${y - 30 * s} Q${x + 44 * s} ${y - 44 * s} ${x + 44 * s} ${y - 86 * s}"/></g>`;
  const fish = (x: number, y: number, c: string, flip: boolean) =>
    `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M26 0 L52 -18 L52 18 Z" fill="${c}"/><ellipse cx="0" cy="0" rx="34" ry="20" fill="${c}"/><circle cx="-16" cy="-4" r="5" fill="#fff"/><circle cx="-17" cy="-4" r="2.5" fill="#1a2a4a"/></g>`;
  return (
    `<defs>${linearGradient(`${uid}-sea`, ['#1466c4', '#1f9fd6', '#3fd9d0'])}${linearGradient(`${uid}-sand`, ['#ffe9ad', '#ffd27a'])}</defs>
     <rect width="1200" height="560" fill="url(#${uid}-sea)"/>
     <path d="M180 0 L320 0 L160 520 L-40 520 Z M520 0 L640 0 L620 520 L440 520 Z M860 0 L1010 0 L1180 520 L980 520 Z" fill="#fff" opacity=".1"/>
     <path d="M-20 520 Q120 360 300 460 Q380 400 470 520 Z M760 520 Q860 380 980 450 Q1100 360 1220 520 Z" fill="#0f5aa8" opacity=".55"/>` +
    bubbles +
    fish(250, 210, '#ffa63d', false) +
    fish(930, 150, '#ff8ec7', true) +
    fish(1050, 320, '#ffd84a', true) +
    weed(70, 300, '#2fb872') +
    weed(130, 220, '#5fd38d') +
    weed(1130, 320, '#2fb872') +
    weed(1070, 230, '#5fd38d') +
    coral(300, 540, '#ff7fa8', 1) +
    coral(900, 540, '#ff9f6b', 1.1) +
    coral(400, 530, '#c59bff', 0.7) +
    `<rect y="500" width="1200" height="400" fill="url(#${uid}-sand)"/>
     <path d="M0 500 Q150 480 300 500 Q450 520 600 500 Q750 480 900 500 Q1050 520 1200 500 L1200 540 L0 540 Z" fill="#ffe9ad"/>` +
    star(120, 640, 30, '#ff8f6b') +
    star(1090, 610, 24, '#ff8ec7') +
    `<path d="M70 760 Q100 716 130 760 Q100 790 70 760 Z" fill="#ffc4e3" stroke="#ff9ccb" stroke-width="4"/>
     <path d="M1080 760 Q1110 716 1140 760 Q1110 790 1080 760 Z" fill="#bff5f0" stroke="#5fd3d0" stroke-width="4"/>`
  );
}

function castle(uid: string): string {
  const tower = (x: number, y: number, w: number, h: number, roof: string) =>
    `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" fill="#fff0f8"/>
     <rect x="${x - w / 2}" y="${y}" width="${w * 0.3}" height="${h}" fill="#ffd9ec"/>
     <path d="M${x - w / 2 - 12} ${y} L${x} ${y - w * 1.25} L${x + w / 2 + 12} ${y} Z" fill="${roof}"/>
     <path d="M${x} ${y - w * 1.25} L${x} ${y - w * 1.25 - 40}" stroke="#b98bff" stroke-width="5"/>
     <path d="M${x} ${y - w * 1.25 - 40} L${x + 34} ${y - w * 1.25 - 28} L${x} ${y - w * 1.25 - 14} Z" fill="#ffd84a"/>
     <path d="M${x - 12} ${y + 60} Q${x} ${y + 34} ${x + 12} ${y + 60} L${x + 12} ${y + 92} L${x - 12} ${y + 92} Z" fill="#b98bff"/>`;
  const bush = (x: number, y: number, s: number) =>
    `<g fill="#4fc27a"><circle cx="${x}" cy="${y}" r="${46 * s}"/><circle cx="${x - 50 * s}" cy="${y + 14 * s}" r="${36 * s}"/><circle cx="${x + 52 * s}" cy="${y + 12 * s}" r="${38 * s}"/></g>` +
    flower(x - 30 * s, y - 6 * s, 12 * s, '#ff6f91') +
    flower(x + 24 * s, y - 16 * s, 12 * s, '#ff8ec7') +
    flower(x + 56 * s, y + 10 * s, 11 * s, '#fff');
  return (
    `<defs>${linearGradient(`${uid}-sky`, ['#ff9fd6', '#ffc9b8', '#fff0c9'])}${linearGradient(`${uid}-lawn`, ['#9ae89a', '#5fca78'])}</defs>
     <rect width="1200" height="520" fill="url(#${uid}-sky)"/>
     <circle cx="600" cy="300" r="330" fill="#fff" opacity=".22"/>` +
    clouds(
      [
        [160, 130, 1],
        [1040, 110, 1.1],
        [880, 250, 0.6],
        [300, 280, 0.6],
      ],
      '#fff',
      0.85,
    ) +
    `<path d="M-20 520 Q200 380 460 500 Q700 400 900 480 Q1060 400 1220 520 Z" fill="#8fe09a"/>` +
    tower(430, 250, 76, 250, '#b98bff') +
    tower(770, 250, 76, 250, '#b98bff') +
    `<rect x="456" y="320" width="288" height="180" fill="#fff0f8"/>
     <path d="M456 320 h36 v-22 h36 v22 h36 v-22 h36 v22 h36 v-22 h36 v22 h36 v-22 h36 v22" fill="#fff0f8" stroke="#ffd9ec" stroke-width="4"/>` +
    tower(600, 210, 104, 290, '#ff7fbf') +
    `<path d="M556 500 L556 420 Q600 362 644 420 L644 500 Z" fill="#b05ad6"/>
     <path d="M600 384 L600 500" stroke="#8f3fc0" stroke-width="5"/>` +
    heart(600, 286, 16, '#ff5f86') +
    heart(250, 200, 16, '#ff8ec7', 'opacity=".8"') +
    heart(960, 330, 12, '#ff8ec7', 'opacity=".8"') +
    sparkle(360, 120, 16, '#fff') +
    sparkle(820, 150, 12, '#fff') +
    sparkle(700, 70, 10, '#fff') +
    `<rect y="500" width="1200" height="400" fill="url(#${uid}-lawn)"/>` +
    bush(150, 520, 1) +
    bush(1050, 520, 1) +
    bush(330, 500, 0.6) +
    bush(870, 500, 0.6)
  );
}

function forest(uid: string): string {
  const tree = (x: number, s: number, c: string) =>
    `<rect x="${x - 16 * s}" y="${330 - 60 * s}" width="${32 * s}" height="${200 * s}" fill="#8a5a3c"/>
     <g fill="${c}"><circle cx="${x}" cy="${250 - 60 * s}" r="${92 * s}"/><circle cx="${x - 70 * s}" cy="${300 - 60 * s}" r="${64 * s}"/><circle cx="${x + 72 * s}" cy="${296 - 60 * s}" r="${66 * s}"/></g>`;
  const shroom = (x: number, y: number, s: number, c: string) =>
    `<path d="M${x - 22 * s} ${y} Q${x - 28 * s} ${y - 80 * s} ${x - 16 * s} ${y - 110 * s} L${x + 16 * s} ${y - 110 * s} Q${x + 28 * s} ${y - 80 * s} ${x + 22 * s} ${y} Z" fill="#fff3e0"/>
     <path d="M${x - 100 * s} ${y - 100 * s} Q${x - 96 * s} ${y - 210 * s} ${x} ${y - 214 * s} Q${x + 96 * s} ${y - 210 * s} ${x + 100 * s} ${y - 100 * s} Q${x} ${y - 78 * s} ${x - 100 * s} ${y - 100 * s} Z" fill="${c}"/>
     <circle cx="${x - 46 * s}" cy="${y - 140 * s}" r="${16 * s}" fill="#fff"/><circle cx="${x + 10 * s}" cy="${y - 178 * s}" r="${20 * s}" fill="#fff"/><circle cx="${x + 56 * s}" cy="${y - 130 * s}" r="${13 * s}" fill="#fff"/>`;
  const r = rng(41);
  let flies = '';
  for (let i = 0; i < 26; i++) {
    const x = r() * 1200;
    const y = 60 + r() * 420;
    flies += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="14" fill="#fff8a8" opacity=".25"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="5" fill="#fffbd6"/>`;
  }
  let lawn = '';
  for (let i = 0; i < 14; i++) {
    const x = 40 + r() * 1120;
    const y = 540 + r() * 330;
    if (Math.abs(x - 600) < 110 + (y - 500) * 1.2) continue;
    lawn += flower(x, y, 10 + (y - 500) * 0.03, ['#ff8ec7', '#fff', '#ffd84a', '#c59bff'][i % 4]);
  }
  return (
    `<defs>${linearGradient(`${uid}-sky`, ['#8fe8c8', '#d6fbd0'])}${linearGradient(`${uid}-moss`, ['#7fdc8a', '#3fae62'])}</defs>
     <rect width="1200" height="520" fill="url(#${uid}-sky)"/>` +
    tree(120, 1.2, '#3fb872') +
    tree(1080, 1.2, '#3fb872') +
    tree(340, 0.8, '#5fd38d') +
    tree(860, 0.8, '#5fd38d') +
    tree(600, 0.9, '#74dea0') +
    `<path d="M0 60 Q300 150 600 80 Q900 150 1200 60" fill="none" stroke="#8a5a3c" stroke-width="5"/>` +
    [100, 250, 400, 550, 700, 850, 1000, 1120]
      .map((x, i) => {
        const y = 82 + Math.sin((x / 1200) * Math.PI * 2 - 0.4) * -30 + 26;
        const c = ['#ff8ec7', '#ffd84a', '#8be9ff', '#c59bff'][i % 4];
        return `<line x1="${x}" y1="${y - 26}" x2="${x}" y2="${y}" stroke="#8a5a3c" stroke-width="3"/><circle cx="${x}" cy="${y + 14}" r="26" fill="${c}" opacity=".35"/><ellipse cx="${x}" cy="${y + 14}" rx="13" ry="17" fill="${c}"/>`;
      })
      .join('') +
    flies +
    `<rect y="500" width="1200" height="400" fill="url(#${uid}-moss)"/>
     <path d="M0 500 Q100 478 200 500 Q300 478 400 500 Q500 478 600 500 Q700 478 800 500 Q900 478 1000 500 Q1100 478 1200 500 L1200 530 L0 530 Z" fill="#7fdc8a"/>` +
    shroom(210, 560, 1, '#ff5f6e') +
    shroom(1000, 560, 1.05, '#ff8ec7') +
    shroom(360, 520, 0.5, '#c59bff') +
    shroom(850, 520, 0.5, '#ff5f6e') +
    lawn
  );
}

function space(uid: string): string {
  const r = rng(7);
  let stars = '';
  for (let i = 0; i < 110; i++) {
    const x = r() * 1200;
    const y = r() * 500;
    const s = 1.5 + r() * 3.5;
    stars += i % 9 === 0 ? sparkle(x, y, s * 4, '#fff') : `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="#fff" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
  }
  const crater = (x: number, y: number, s: number) =>
    `<ellipse cx="${x}" cy="${y}" rx="${60 * s}" ry="${18 * s}" fill="#8f7bd0"/><ellipse cx="${x}" cy="${y + 5 * s}" rx="${50 * s}" ry="${12 * s}" fill="#a896e0"/>`;
  return (
    `<defs>${linearGradient(`${uid}-sky`, ['#120a3a', '#3a1f8a', '#7a3fc0'])}${linearGradient(`${uid}-moon`, ['#cdbff5', '#a48fe0'])}</defs>
     <rect width="1200" height="520" fill="url(#${uid}-sky)"/>` +
    stars +
    `<g transform="rotate(-18 230 190)"><ellipse cx="230" cy="190" rx="170" ry="34" fill="none" stroke="#ffd84a" stroke-width="16" opacity=".9"/></g>
     <circle cx="230" cy="190" r="96" fill="#ff8ec7"/><path d="M146 150 Q230 120 314 160 M140 200 Q230 180 322 214" fill="none" stroke="#ffb3dc" stroke-width="14" stroke-linecap="round"/>
     <g transform="rotate(-18 230 190)"><path d="M62 192 A170 34 0 0 0 398 192" fill="none" stroke="#ffd84a" stroke-width="16"/></g>
     <circle cx="980" cy="130" r="54" fill="#5fd3d0"/><path d="M944 110 Q970 124 960 150 Q990 160 1000 130 Q1016 116 1004 96" fill="#8be98a" opacity=".8"/>
     <circle cx="760" cy="80" r="22" fill="#ffd84a"/>
     <g transform="translate(1040 330) rotate(24)">
       <path d="M-22 70 L-58 112 L-22 104 Z M22 70 L58 112 L22 104 Z" fill="#ff5f86"/>
       <path d="M0 -90 Q46 -30 30 96 L-30 96 Q-46 -30 0 -90 Z" fill="#f4f7ff"/>
       <path d="M0 -90 Q26 -58 32 -30 L-32 -30 Q-26 -58 0 -90 Z" fill="#ff5f86"/>
       <circle cx="0" cy="18" r="20" fill="#7ad7ff" stroke="#b9c6ee" stroke-width="6"/>
       <path d="M-18 96 Q0 150 18 96 Z" fill="#ffd84a"/>
     </g>
     <rect y="500" width="1200" height="400" fill="url(#${uid}-moon)"/>
     <path d="M0 500 Q200 470 400 498 Q600 520 800 494 Q1000 470 1200 500 L1200 540 L0 540 Z" fill="#cdbff5"/>` +
    crater(170, 610, 1) +
    crater(1010, 590, 0.9) +
    crater(90, 800, 1.5) +
    crater(1110, 790, 1.4)
  );
}

function concert(uid: string): string {
  const beam = (x: number, tx: number, c: string) => `<path d="M${x - 14} 40 L${x + 14} 40 L${tx + 120} 560 L${tx - 120} 560 Z" fill="${c}" opacity=".26"/>`;
  const speaker = (x: number) =>
    `<rect x="${x - 70}" y="300" width="140" height="210" rx="14" fill="#241a3a" stroke="#4a3470" stroke-width="5"/>
     <circle cx="${x}" cy="356" r="34" fill="#3d2a55" stroke="#8f6bff" stroke-width="5"/><circle cx="${x}" cy="356" r="12" fill="#8f6bff"/>
     <circle cx="${x}" cy="450" r="44" fill="#3d2a55" stroke="#ff5fae" stroke-width="5"/><circle cx="${x}" cy="450" r="16" fill="#ff5fae"/>`;
  let ball = '';
  for (let i = -3; i <= 3; i++) ball += `<path d="M${600 + i * 14} 96 Q${600 + i * 18} 150 ${600 + i * 14} 204" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>`;
  for (let j = -2; j <= 2; j++) ball += `<path d="M${548 + Math.abs(j) * 6} ${150 + j * 20} L${652 - Math.abs(j) * 6} ${150 + j * 20}" stroke="#fff" stroke-width="2" opacity=".6"/>`;
  const r = rng(77);
  let dots = '';
  for (let i = 0; i < 40; i++) dots += `<circle cx="${(r() * 1200).toFixed(0)}" cy="${(60 + r() * 420).toFixed(0)}" r="${(2 + r() * 4).toFixed(1)}" fill="#fff" opacity="${(0.3 + r() * 0.5).toFixed(2)}"/>`;
  return (
    `<defs>${linearGradient(`${uid}-sky`, ['#1d0f40', '#5a1f8a', '#d0358f'])}${linearGradient(`${uid}-floor`, ['#5a3f8a', '#2a1a4a'])}</defs>
     <rect width="1200" height="520" fill="url(#${uid}-sky)"/>` +
    dots +
    star(600, 330, 150, '#ff8ec7', 'opacity=".28"') +
    `<path d="${`M600 190 L636 290 L742 290 L656 352 L688 452 L600 392 L512 452 L544 352 L458 290 L564 290 Z`}" fill="none" stroke="#ffd84a" stroke-width="10" stroke-linejoin="round"/>` +
    beam(200, 420, '#ff8ec7') +
    beam(420, 250, '#8be9ff') +
    beam(780, 950, '#ffd84a') +
    beam(1000, 780, '#b98bff') +
    `<rect x="0" y="22" width="1200" height="26" fill="#3d2a55"/>` +
    [100, 200, 310, 420, 780, 890, 1000, 1100].map((x, i) => `<rect x="${x - 22}" y="40" width="44" height="34" rx="8" fill="#241a3a"/><circle cx="${x}" cy="74" r="13" fill="${['#ff8ec7', '#8be9ff', '#ffd84a', '#b98bff'][i % 4]}"/>`).join('') +
    `<line x1="600" y1="48" x2="600" y2="96" stroke="#dfe6fb" stroke-width="5"/><circle cx="600" cy="150" r="56" fill="#c9d3ea"/><circle cx="580" cy="130" r="18" fill="#fff" opacity=".6"/>` +
    ball +
    sparkle(520, 110, 16, '#fff') +
    sparkle(690, 190, 13, '#fff') +
    speaker(130) +
    speaker(1070) +
    `<rect y="500" width="1200" height="400" fill="url(#${uid}-floor)"/><rect y="500" width="1200" height="10" fill="#ff5fae"/>`
  );
}

const PAINTERS: Record<Theme, (uid: string) => string> = { stadium, ocean, castle, forest, space, concert };

function runwayLights(theme: Theme): string {
  const s = STYLES[theme];
  let lights = '';
  for (let i = 0; i < 9; i++) {
    const p = Math.pow((i + 0.5) / 9, 1.7);
    const y = 500 + 400 * p;
    const half = 92 + 378 * p;
    const rad = 5 + 15 * p;
    const c = i % 2 ? s.light2 : s.light;
    for (const x of [600 - half, 600 + half]) {
      lights += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(rad * 2).toFixed(0)}" fill="${c}" opacity=".3"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(0)}" fill="${c}"/>`;
    }
  }
  return lights;
}

function runway(theme: Theme, uid: string): string {
  const s = STYLES[theme];
  let extra = '';
  if (theme === 'stadium') {
    extra = [-0.5, 0, 0.5].map((k) => `<path d="M${600 + k * 150} 500 L${600 + k * 780} 900" stroke="#fff" stroke-width="5" opacity=".7"/>`).join('');
  }
  return (
    `<defs>${linearGradient(`${uid}-rw`, [s.top, s.bottom])}</defs>
     <path d="M498 500 L702 500 L1100 900 L100 900 Z" fill="${s.rim}"/>
     <path d="M512 500 L688 500 L1060 900 L140 900 Z" fill="url(#${uid}-rw)"/>
     <path d="M570 500 L630 500 L760 900 L440 900 Z" fill="#fff" opacity=".12"/>` + extra
  );
}

/** The cheering crowd, as two groups so they can bounce out of step. */
function audience(theme: Theme): [string, string] {
  const s = STYLES[theme];
  const r = rng(theme.length * 31 + 5);
  const rows: Array<{ y: number; size: number; xs: number[] }> = [
    { y: 706, size: 0.62, xs: [70, 150, 230, 310] },
    { y: 800, size: 0.86, xs: [20, 130, 240] },
    { y: 910, size: 1.16, xs: [-10, 130, 262] },
  ];
  const person = (x: number, y: number, k: number, idx: number): string => {
    const tone = mix(s.crowd, '#ffffff', 0.04 + r() * 0.16);
    const hair = Math.floor(r() * 4);
    const arm = r() > 0.45;
    const lift = r() > 0.5 ? -1 : 1;
    let out = '';
    if (arm) {
      out += `<path d="M${x + lift * 44 * k} ${y + 30 * k} L${x + lift * 62 * k} ${y - 62 * k}" stroke="${tone}" stroke-width="${20 * k}" stroke-linecap="round"/>`;
      out +=
        idx % 2 === 0
          ? `<rect x="${x + lift * 62 * k - 20 * k}" y="${y - 96 * k}" width="${40 * k}" height="${30 * k}" rx="${6 * k}" fill="#2a2140"/><circle cx="${x + lift * 62 * k}" cy="${y - 81 * k}" r="${8 * k}" fill="#cfe6ff"/>`
          : heart(x + lift * 62 * k, y - 84 * k, 16 * k, s.light2);
    }
    out += `<ellipse cx="${x}" cy="${y + 70 * k}" rx="${70 * k}" ry="${62 * k}" fill="${tone}"/><circle cx="${x}" cy="${y - 14 * k}" r="${42 * k}" fill="${tone}"/>`;
    if (hair === 0) out += `<circle cx="${x - 36 * k}" cy="${y - 44 * k}" r="${18 * k}" fill="${tone}"/><circle cx="${x + 36 * k}" cy="${y - 44 * k}" r="${18 * k}" fill="${tone}"/>`;
    if (hair === 1) out += `<circle cx="${x}" cy="${y - 62 * k}" r="${20 * k}" fill="${tone}"/>`;
    if (hair === 2) out += `<path d="M${x - 40 * k} ${y - 20 * k} L${x - 34 * k} ${y - 66 * k} L${x - 8 * k} ${y - 46 * k} Z M${x + 40 * k} ${y - 20 * k} L${x + 34 * k} ${y - 66 * k} L${x + 8 * k} ${y - 46 * k} Z" fill="${tone}"/>`;
    return out;
  };
  const groups: [string, string] = ['', ''];
  let idx = 0;
  for (const side of [0, 1]) {
    for (const row of rows) {
      for (const x of row.xs) {
        const px = (side ? 1200 - x : x) + (r() - 0.5) * 16;
        groups[idx % 2] += person(px, row.y, row.size, idx);
        idx++;
      }
    }
  }
  return groups;
}

/** Full runway scene in one piece, for still pictures. */
export function sceneMarkup(theme: Theme, uid: string, withAudience = true): string {
  const crowd = withAudience ? audience(theme).join('') : '';
  return PAINTERS[theme](uid) + runway(theme, uid) + runwayLights(theme) + crowd;
}

const layer = (cls: string, inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" class="scene-svg ${cls}" viewBox="${SCENE_VIEWBOX}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

/**
 * The scene for the live show, split into layers: the still backdrop, the
 * runway lights and two halves of the crowd. Each moving part is animated as
 * a whole layer, which stays smooth on older iPads.
 */
export function sceneLayers(theme: Theme, uid: string): string {
  const [a, b] = audience(theme);
  return (
    layer('scene-back', PAINTERS[theme](uid) + runway(theme, uid)) +
    layer('scene-lights', runwayLights(theme)) +
    layer('scene-crowd crowd-a', a) +
    layer('scene-crowd crowd-b', b)
  );
}

export const themeAccent = (theme: Theme) => STYLES[theme].light2;
