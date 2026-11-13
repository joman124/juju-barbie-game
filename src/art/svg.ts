/** Small helpers for building SVG markup as strings. */

let uidCounter = 0;
/** Unique prefix for gradient / clip ids, so many dolls can share one page. */
export function nextUid(): string {
  uidCounter += 1;
  return `u${uidCounter}`;
}

/** Wraps content so CSS transforms on `.cls` rotate / scale around (x, y). */
export function pivot(x: number, y: number, cls: string, inner: string): string {
  return `<g transform="translate(${x} ${y})"><g class="${cls}"><g transform="translate(${-x} ${-y})">${inner}</g></g></g>`;
}

/** Mirrors left-side artwork onto the right side of the 400-wide doll. */
export function mirror(inner: string): string {
  return `<g transform="translate(400 0) scale(-1 1)">${inner}</g>`;
}

function parseHex(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = parseHex(a);
  const [r2, g2, b2] = parseHex(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  const hex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${hex(c(r1, r2))}${hex(c(g1, g2))}${hex(c(b1, b2))}`;
}
export const darken = (c: string, t: number) => mix(c, '#2a1235', t);
export const lighten = (c: string, t: number) => mix(c, '#ffffff', t);

const f = (n: number) => Math.round(n * 10) / 10;

export function starPath(cx: number, cy: number, r: number, inner = 0.45, points = 5, rot = -90): string {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = ((rot + (i * 180) / points) * Math.PI) / 180;
    d += `${i === 0 ? 'M' : 'L'}${f(cx + Math.cos(a) * rad)} ${f(cy + Math.sin(a) * rad)}`;
  }
  return d + 'Z';
}

export function star(cx: number, cy: number, r: number, fill: string, extra = ''): string {
  return `<path d="${starPath(cx, cy, r)}" fill="${fill}" stroke="${fill}" stroke-width="${f(r * 0.22)}" stroke-linejoin="round" ${extra}/>`;
}

/** Four-point twinkle. */
export function sparkle(cx: number, cy: number, r: number, fill = '#fff', extra = ''): string {
  return `<path d="${starPath(cx, cy, r, 0.28, 4)}" fill="${fill}" ${extra}/>`;
}

export function heartPath(cx: number, cy: number, s: number): string {
  // s = half width
  const w = s;
  return `M${f(cx)} ${f(cy + w * 0.9)}C${f(cx - w * 1.5)} ${f(cy - w * 0.1)} ${f(cx - w * 0.9)} ${f(cy - w * 1.15)} ${f(cx)} ${f(cy - w * 0.4)}C${f(cx + w * 0.9)} ${f(cy - w * 1.15)} ${f(cx + w * 1.5)} ${f(cy - w * 0.1)} ${f(cx)} ${f(cy + w * 0.9)}Z`;
}

export function heart(cx: number, cy: number, s: number, fill: string, extra = ''): string {
  return `<path d="${heartPath(cx, cy, s)}" fill="${fill}" ${extra}/>`;
}

export function flower(cx: number, cy: number, r: number, petal: string, center = '#ffd84a', petals = 5): string {
  let out = '';
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 - Math.PI / 2;
    out += `<circle cx="${f(cx + Math.cos(a) * r * 0.62)}" cy="${f(cy + Math.sin(a) * r * 0.62)}" r="${f(r * 0.48)}" fill="${petal}"/>`;
  }
  return out + `<circle cx="${cx}" cy="${cy}" r="${f(r * 0.36)}" fill="${center}"/>`;
}

/** Scalloped (cloud-like) closed outline through a ring of bumps. */
export function scallopCircle(cx: number, cy: number, r: number, bumps: number, fill: string, bumpScale = 0.34): string {
  let out = `<circle cx="${cx}" cy="${cy}" r="${f(r * 0.86)}" fill="${fill}"/>`;
  for (let i = 0; i < bumps; i++) {
    const a = (i / bumps) * Math.PI * 2;
    out += `<circle cx="${f(cx + Math.cos(a) * r * 0.78)}" cy="${f(cy + Math.sin(a) * r * 0.78)}" r="${f(r * bumpScale)}" fill="${fill}"/>`;
  }
  return out;
}

export const RAINBOW = ['#ff5d73', '#ff9f43', '#ffd84a', '#5fd38d', '#4db8ff', '#a57bff'];

export function rainbowGradient(id: string, vertical = true): string {
  const stops = RAINBOW.map((c, i) => `<stop offset="${f((i / (RAINBOW.length - 1)) * 100)}%" stop-color="${c}"/>`).join('');
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops}</linearGradient>`;
}

export function linearGradient(id: string, colors: string[], vertical = true): string {
  const stops = colors.map((c, i) => `<stop offset="${f((i / (colors.length - 1)) * 100)}%" stop-color="${c}"/>`).join('');
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops}</linearGradient>`;
}

/** Deterministic pseudo-random numbers so artwork is stable between renders. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function svgWrap(viewBox: string, inner: string, attrs = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${attrs}>${inner}</svg>`;
}
