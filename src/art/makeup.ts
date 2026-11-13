import { heart, sparkle, star, RAINBOW } from './svg';

export interface Swatch {
  id: string;
  color: string;
  /** Second colour for shimmer / accents. */
  color2?: string;
  rainbow?: boolean;
}

export const LIPS: Swatch[] = [
  { id: 'lip-pink', color: '#ff7eb0' },
  { id: 'lip-hot', color: '#ff2f8e' },
  { id: 'lip-red', color: '#e8203d' },
  { id: 'lip-coral', color: '#ff7a5c' },
  { id: 'lip-berry', color: '#b0286e' },
  { id: 'lip-purple', color: '#9a52e8' },
  { id: 'lip-blue', color: '#3fa4ff' },
  { id: 'lip-gold', color: '#f5b921' },
];

export const SHADOWS: Swatch[] = [
  { id: 'sh-pink', color: '#ff8ec7' },
  { id: 'sh-purple', color: '#a877ff' },
  { id: 'sh-blue', color: '#4fb2ff' },
  { id: 'sh-teal', color: '#27d3c3' },
  { id: 'sh-green', color: '#6fdc6b' },
  { id: 'sh-gold', color: '#ffc93c' },
  { id: 'sh-orange', color: '#ff9447' },
  { id: 'sh-silver', color: '#c9d3ea' },
];

export const BLUSHES: Swatch[] = [
  { id: 'bl-pink', color: '#ff7aa8' },
  { id: 'bl-peach', color: '#ff9a6b' },
  { id: 'bl-rose', color: '#e8457c' },
  { id: 'bl-lilac', color: '#c583ff' },
];

export interface FaceArt {
  id: string;
  /** Artwork for the left cheek area; mirrored for the right. */
  draw: () => string;
  icon: () => string;
}

export const FACE_ART: FaceArt[] = [
  {
    id: 'fa-stars',
    draw: () => star(140, 196, 7, '#ffd84a') + star(154, 208, 4.5, '#ff8ec7') + star(131, 211, 3.5, '#7ad7ff'),
    icon: () => star(50, 50, 30, '#ffd84a') + star(82, 22, 11, '#ff8ec7'),
  },
  {
    id: 'fa-hearts',
    draw: () => heart(141, 198, 7, '#ff4f8b') + heart(155, 210, 4.5, '#ff9ac2'),
    icon: () => heart(50, 50, 28, '#ff4f8b') + heart(82, 24, 10, '#ff9ac2'),
  },
  {
    id: 'fa-freckles',
    draw: () =>
      [
        [146, 190],
        [156, 196],
        [138, 198],
        [150, 204],
        [162, 188],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#b5613a" opacity=".75"/>`)
        .join(''),
    icon: () =>
      [
        [30, 40],
        [52, 30],
        [70, 46],
        [42, 62],
        [62, 68],
        [24, 66],
        [80, 70],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#c9713f"/>`)
        .join(''),
  },
  {
    id: 'fa-gems',
    draw: () =>
      `<circle cx="150" cy="186" r="4.5" fill="#7ad7ff" stroke="#fff" stroke-width="1.5"/><circle cx="138" cy="192" r="3.5" fill="#ff8ec7" stroke="#fff" stroke-width="1.2"/><circle cx="130" cy="202" r="2.8" fill="#b79bff" stroke="#fff" stroke-width="1"/>` +
      sparkle(160, 178, 5, '#ffffff'),
    icon: () =>
      `<path d="M50 84 L18 44 L32 24 L68 24 L82 44 Z" fill="#7ad7ff"/><path d="M18 44 L82 44 M32 24 L42 44 L50 84 L58 44 L68 24 M50 24 L42 44 M50 24 L58 44" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/>` +
      sparkle(84, 18, 10, '#ffd84a'),
  },
];

export const NAIL_COLORS: Swatch[] = [
  { id: 'n-pink', color: '#ff6fb1', color2: '#ffffff' },
  { id: 'n-red', color: '#f02d4f', color2: '#ffd84a' },
  { id: 'n-purple', color: '#9a5cf5', color2: '#ffd84a' },
  { id: 'n-blue', color: '#3d9bff', color2: '#ffffff' },
  { id: 'n-teal', color: '#16cfc0', color2: '#ffffff' },
  { id: 'n-yellow', color: '#ffd23c', color2: '#ff6fb1' },
  { id: 'n-green', color: '#63d86a', color2: '#ffffff' },
  { id: 'n-rainbow', color: '#ff6fb1', color2: '#ffffff', rainbow: true },
];

export const NAIL_PATTERNS = ['np-plain', 'np-dots', 'np-stripes', 'np-hearts', 'np-stars', 'np-tips', 'np-glitter', 'np-flowers'];

/** Colour of nail number `i` (0-4) for a nail colour swatch. */
export function nailColorAt(sw: Swatch, i: number): string {
  return sw.rainbow ? RAINBOW[[0, 1, 2, 3, 4][i % 5]] : sw.color;
}

export const byId = <T extends { id: string }>(list: T[], id: string | undefined) => list.find((x) => x.id === id);
