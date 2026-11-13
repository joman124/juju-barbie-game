import { flower, heartPath, lighten, mix, nextUid, rainbowGradient, rng, sparkle, starPath } from './svg';
import { NAIL_COLORS, byId, nailColorAt, type Swatch } from './makeup';

/** Pattern artwork for a nail whose box is centred on (0, 0), `w` wide and `h` tall. */
function patternArt(pattern: string | undefined, w: number, h: number, c2: string, seed: number): string {
  switch (pattern) {
    case 'np-dots':
      return [
        [-0.22, -0.28],
        [0.2, -0.1],
        [-0.16, 0.12],
        [0.18, 0.32],
        [-0.02, -0.02],
      ]
        .map(([x, y]) => `<circle cx="${(x * w).toFixed(1)}" cy="${(y * h).toFixed(1)}" r="${(w * 0.11).toFixed(1)}" fill="${c2}"/>`)
        .join('');
    case 'np-stripes':
      return [-0.3, 0, 0.3]
        .map((o) => `<line x1="${-w}" y1="${(o * h + w * 0.5).toFixed(1)}" x2="${w}" y2="${(o * h - w * 0.5).toFixed(1)}" stroke="${c2}" stroke-width="${(h * 0.11).toFixed(1)}"/>`)
        .join('');
    case 'np-hearts':
      return `<path d="${heartPath(0, 0, w * 0.26)}" fill="${c2}"/>`;
    case 'np-stars':
      return `<path d="${starPath(0, 0, w * 0.33)}" fill="${c2}" stroke="${c2}" stroke-width="${(w * 0.06).toFixed(1)}" stroke-linejoin="round"/>`;
    case 'np-tips':
      return `<path d="M${-w} ${-h} L${w} ${-h} L${w} ${(-h * 0.2).toFixed(1)} Q0 ${(-h * 0.42).toFixed(1)} ${-w} ${(-h * 0.2).toFixed(1)} Z" fill="#fff"/>`;
    case 'np-glitter': {
      const r = rng(seed * 97 + 5);
      let out = '';
      for (let i = 0; i < 12; i++) {
        const x = (r() - 0.5) * w * 0.8;
        const y = (r() - 0.5) * h * 0.8;
        out += i % 3 === 0 ? sparkle(x, y, w * 0.14, '#fff') : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(w * 0.05).toFixed(1)}" fill="${i % 2 ? '#ffe98a' : '#fff'}"/>`;
      }
      return out;
    }
    case 'np-flowers':
      return flower(0, 0, w * 0.3, '#ffffff', '#ffd84a');
    default:
      return '';
  }
}

function nail(uid: string, i: number, cx: number, cy: number, w: number, h: number, rot: number, color: string | undefined, sw: Swatch | undefined, pattern: string | undefined, skin: string): string {
  const shape = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * 0.42}"/>`;
  const fill = color ?? mix(lighten(skin, 0.45), '#ffb3c7', 0.35);
  const id = `${uid}-n${i}`;
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">
    <clipPath id="${id}">${shape}</clipPath>
    <g clip-path="url(#${id})"><rect x="${-w}" y="${-h}" width="${w * 2}" height="${h * 2}" fill="${fill}"/>
    ${color ? patternArt(pattern, w, h, sw?.color2 ?? '#fff', i + 1) : `<rect x="${-w}" y="${-h / 2}" width="${w * 2}" height="${h * 0.22}" fill="#fff" opacity=".8"/>`}
    <path d="M${-w * 0.26} ${-h * 0.3} L${-w * 0.26} ${h * 0.18}" stroke="#fff" stroke-width="${w * 0.12}" stroke-linecap="round" opacity=".55"/></g>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * 0.42}" fill="none" stroke="${color ? mix(color, '#3a1050', 0.3) : mix(skin, '#a2452f', 0.2)}" stroke-width="2.5" opacity="${color ? 0.55 : 0.6}"/>
  </g>`;
}

/** Big close-up hand for the nail salon. */
export function handSvg(skin: string, nailColor: string | undefined, pattern: string | undefined): string {
  const uid = nextUid();
  const sw = byId(NAIL_COLORS, nailColor);
  const shade = mix(skin, '#a2452f', 0.22);
  // [centre x, tip y, width, rotation]
  const fingers: Array<[number, number, number, number]> = [
    [112, 150, 46, -11],
    [164, 96, 50, -4],
    [220, 78, 52, 1],
    [274, 104, 50, 7],
  ];
  let out = '';
  // wrist + bracelet
  out += `<rect x="136" y="372" width="130" height="120" rx="30" fill="${skin}"/>`;
  // thumb
  out += `<g transform="rotate(38 318 318)"><rect x="290" y="204" width="58" height="150" rx="29" fill="${skin}"/></g>`;
  fingers.forEach(([cx, tip, w, rot]) => {
    out += `<g transform="rotate(${rot} ${cx} 300)"><rect x="${cx - w / 2}" y="${tip}" width="${w}" height="${310 - tip}" rx="${w / 2}" fill="${skin}"/>
      <path d="M${cx - w * 0.22} ${tip + (300 - tip) * 0.52} q${w * 0.22} 6 ${w * 0.44} 0" fill="none" stroke="${shade}" stroke-width="3" stroke-linecap="round" opacity=".5"/></g>`;
  });
  out += `<rect x="84" y="250" width="222" height="170" rx="62" fill="${skin}"/>`;
  out += `<path d="M150 392 Q200 408 252 392" fill="none" stroke="${shade}" stroke-width="3" stroke-linecap="round" opacity=".35"/>`;
  out += `<rect x="126" y="414" width="150" height="24" rx="12" fill="#ffd84a" stroke="#f0a81c" stroke-width="3"/><circle cx="201" cy="426" r="9" fill="#ff6fb1"/><circle cx="166" cy="426" r="5" fill="#7ad7ff"/><circle cx="236" cy="426" r="5" fill="#7ad7ff"/>`;
  // nails
  fingers.forEach(([cx, tip, w, rot], i) => {
    const rad = (rot * Math.PI) / 180;
    const dy = 300 - (tip + w * 0.7);
    const nx = cx + Math.sin(rad) * dy;
    const ny = 300 - Math.cos(rad) * dy;
    out += nail(uid, i, nx, ny, w * 0.76, w * 1.04, rot, sw ? nailColorAt(sw, i) : undefined, sw, pattern, skin);
  });
  // thumb nail
  {
    const rad = (38 * Math.PI) / 180;
    const lx = 319;
    const ly = 244;
    const dx = lx - 318;
    const dy = ly - 318;
    const nx = 318 + dx * Math.cos(rad) - dy * Math.sin(rad);
    const ny = 318 + dx * Math.sin(rad) + dy * Math.cos(rad);
    out += nail(uid, 4, nx, ny, 44, 56, 38, sw ? nailColorAt(sw, 4) : undefined, sw, pattern, skin);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" class="hand-svg" viewBox="50 50 360 400" preserveAspectRatio="xMidYMid meet">${out}</svg>`;
}

/** Nail polish bottle for the colour picker. */
export function polishIcon(sw: Swatch): string {
  const uid = nextUid();
  const fill = sw.rainbow ? `url(#${uid}-pb)` : sw.color;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${sw.rainbow ? `<defs>${rainbowGradient(`${uid}-pb`)}</defs>` : ''}
    <rect x="38" y="6" width="24" height="38" rx="7" fill="#3d2a55"/><rect x="43" y="10" width="5" height="28" rx="2.5" fill="#fff" opacity=".35"/>
    <rect x="24" y="42" width="52" height="52" rx="16" fill="${fill}" stroke="#fff" stroke-width="4"/>
    <path d="M36 54 Q34 70 38 82" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/></svg>`;
}

/** One big nail showing a pattern. */
export function patternIcon(pattern: string, sw: Swatch | undefined): string {
  const uid = nextUid();
  const s = sw ?? NAIL_COLORS[0];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${nail(uid, 2, 50, 50, 54, 74, 0, nailColorAt(s, 2), s, pattern, '#f6c7a0')}</svg>`;
}
