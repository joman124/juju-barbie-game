import type { Look, WearItem } from '../types';
import { BOTTOMS, DRESSES, SHOES, TOPS } from './clothes';
import { BLING_ACC, CARRY_ACC, HEAD_ACC } from './accessories';
import { composeDoll, MANNEQUIN } from './doll';
import { nextUid } from './svg';

export const WEAR_ITEMS: WearItem[] = [...TOPS, ...BOTTOMS, ...DRESSES, ...SHOES, ...HEAD_ACC, ...BLING_ACC, ...CARRY_ACC];

const index = new Map(WEAR_ITEMS.map((i) => [i.id, i]));
export const itemById = (id: string | undefined): WearItem | undefined => (id ? index.get(id) : undefined);

/** The item drawn on a pale dress form, cropped to where it sits on the doll. */
export function itemThumb(item: WearItem): string {
  const uid = nextUid();
  const p = item.parts({ uid });
  const [x, y, w, h] = item.thumb;
  const inner = composeDoll({
    skin: MANNEQUIN,
    mannequin: true,
    layers: [p],
    handL: item.slot === 'accHandL' ? p.hand : '',
    handR: item.slot === 'accHandR' ? p.hand : '',
    hideLegs: !!item.tail,
    hideHead: !(item.slot === 'accHead' || item.slot === 'accFace'),
  });
  const headBlank =
    item.slot === 'accHead' || item.slot === 'accFace'
      ? ''
      : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMid meet">${headBlank}${inner}</svg>`;
}

/** Which look fields each wardrobe slot can live in alongside. */
export const OPTIONAL_SLOTS: Array<keyof Look> = [
  'top',
  'bottom',
  'dress',
  'shoes',
  'accHead',
  'accNeck',
  'accFace',
  'accHandL',
  'accHandR',
  'accBack',
  'lips',
  'shadow',
  'blush',
  'faceArt',
  'nailColor',
  'nailPattern',
  'pet',
];
