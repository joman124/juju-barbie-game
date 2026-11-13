import type { DollDef, Look, Parts } from '../types';
import { darken, lighten, mirror, mix, nextUid, pivot, star } from './svg';
import { hairColorById, hairPaint, hairStyleById } from './hair';
import { BLUSHES, FACE_ART, LIPS, NAIL_COLORS, SHADOWS, byId, nailColorAt } from './makeup';
import { itemById } from './catalog';
import { dollById } from '../dolls';

/** The doll is always drawn in this coordinate space. */
export const DOLL_VB = { x: 0, y: -40, w: 400, h: 740 };
export const DOLL_VIEWBOX = `${DOLL_VB.x} ${DOLL_VB.y} ${DOLL_VB.w} ${DOLL_VB.h}`;

const SUIT = '#f4eaff';
const SUIT_TRIM = '#d8c2ff';

export interface ComposeOpts {
  skin: string;
  /** Plain dress-form look used behind wardrobe thumbnails. */
  mannequin?: boolean;
  face?: string;
  hairBack?: string;
  hairFront?: string;
  layers: Parts[];
  handL?: string;
  handR?: string;
  nails?: string;
  hideLegs?: boolean;
  hideHead?: boolean;
  hideBody?: boolean;
}

const join = (layers: Parts[], key: keyof Parts) => layers.map((l) => l[key] ?? '').join('');

/** Stacks body, clothes, hair and accessories in a fixed order. */
export function composeDoll(o: ComposeOpts): string {
  const skin = o.skin;
  const shade = o.mannequin ? darken(skin, 0.06) : mix(skin, '#a2452f', 0.28);
  const L = o.layers;
  const suit = o.mannequin ? skin : SUIT;
  const body = !o.hideBody;

  // --- legs -----------------------------------------------------------
  const legArt = (cls: string) =>
    pivot(
      176,
      392,
      `leg ${cls}`,
      (body
        ? `<path d="M157 388 L198 388 L189 642 L165 642 Z" fill="${skin}" stroke="${skin}" stroke-width="7" stroke-linejoin="round"/>
           <ellipse cx="174" cy="655" rx="21" ry="13" fill="${skin}"/>
           <path d="M156 388 L199 388 L198 424 L157 424 Z" fill="${suit}" stroke="${suit}" stroke-width="7" stroke-linejoin="round"/>`
        : '') +
        join(L, 'foot') +
        join(L, 'leg'),
    );
  const tail = join(L, 'tail');
  const legs = tail ? pivot(200, 392, 'tail', tail) : o.hideLegs ? '' : legArt('leg-l') + mirror(legArt('leg-r'));

  // --- torso ----------------------------------------------------------
  const torso = body
    ? `<rect x="186" y="214" width="28" height="46" rx="10" fill="${skin}"/>
       <path d="M186 240 Q200 252 214 240 L214 226 L186 226 Z" fill="${shade}" opacity=".45"/>
       <path d="M170 248 Q150 250 148 270 L158 340 Q150 370 150 400 L250 400 Q250 370 242 340 L252 270 Q250 250 230 248 Z" fill="${skin}"/>
       <path d="M166 258 L183 256 Q200 280 217 256 L234 258 L243 340 Q250 370 250 402 L150 402 Q150 370 157 340 Z" fill="${suit}"/>` +
      (o.mannequin
        ? ''
        : `<path d="M183 256 Q200 280 217 256" fill="none" stroke="${SUIT_TRIM}" stroke-width="4" stroke-linecap="round"/>` +
          star(200, 312, 9, SUIT_TRIM))
    : '';

  // --- arms -----------------------------------------------------------
  const arm = (side: 'l' | 'r', held: string) =>
    pivot(
      157,
      270,
      `armU armU-${side}`,
      (body ? `<line x1="157" y1="271" x2="139" y2="345" stroke="${skin}" stroke-width="24" stroke-linecap="round"/>` : '') +
        pivot(
          139,
          345,
          `armF armF-${side}`,
          (body
            ? `<line x1="139" y1="345" x2="131" y2="408" stroke="${skin}" stroke-width="21" stroke-linecap="round"/>
               <circle cx="130" cy="421" r="14" fill="${skin}"/>
               <ellipse cx="141" cy="419" rx="5.5" ry="9" fill="${skin}" transform="rotate(-18 141 419)"/>` +
              (o.nails ?? '')
            : '') +
            join(L, 'armFore') +
            (held ? pivot(130, 421, 'held', held) : ''),
        ) +
        join(L, 'armUpper'),
    );

  // --- head -----------------------------------------------------------
  const head = o.hideHead
    ? ''
    : pivot(
        200,
        236,
        'head',
        `<circle cx="119" cy="162" r="13" fill="${skin}"/><circle cx="281" cy="162" r="13" fill="${skin}"/>
         <circle cx="119" cy="163" r="6" fill="${shade}" opacity=".35"/><circle cx="281" cy="163" r="6" fill="${shade}" opacity=".35"/>
         <path d="M118 145 C118 92 154 66 200 66 C246 66 282 92 282 145 C282 197 250 234 200 234 C150 234 118 197 118 145 Z" fill="${skin}"/>` +
          (o.face ?? '') +
          (o.hairFront ?? '') +
          join(L, 'face') +
          join(L, 'head') +
          join(L, 'over'),
      );

  const defs = join(L, 'defs');

  return (
    (defs ? `<defs>${defs}</defs>` : '') +
    pivot(
      200,
      670,
      'bob',
      pivot(200, 300, 'wings', join(L, 'behind')) +
        (o.hideHead ? '' : pivot(200, 236, 'head', o.hairBack ?? '')) +
        legs +
        torso +
        pivot(200, 372, 'swish', join(L, 'hips')) +
        join(L, 'torso') +
        join(L, 'neck') +
        arm('l', o.handL ?? '') +
        mirror(arm('r', o.handR ?? '')) +
        head,
    )
  );
}

function face(d: DollDef, look: Look): string {
  const skin = d.skin;
  const shade = mix(skin, '#a2452f', 0.3);
  const lips = byId(LIPS, look.lips);
  const lipColor = lips ? lips.color : mix(skin, '#d6456a', 0.5);
  const shadow = byId(SHADOWS, look.shadow);
  const blush = byId(BLUSHES, look.blush);
  const art = byId(FACE_ART, look.faceArt);
  const lash = '#2a1a2e';

  const eye = (cx: number, dir: number) =>
    (shadow
      ? `<path d="M${cx - 19} 160 Q${cx} 122 ${cx + 19} 160 Q${cx} 146 ${cx - 19} 160 Z" fill="${shadow.color}" opacity=".92"/>
         <circle cx="${cx + dir * 6}" cy="143" r="2.2" fill="#fff" opacity=".9"/>`
      : '') +
    `<ellipse cx="${cx}" cy="164" rx="15.5" ry="18" fill="#fff"/>
     <ellipse cx="${cx}" cy="166" rx="12" ry="14.5" fill="${d.eyes}"/>
     <ellipse cx="${cx}" cy="167" rx="6.8" ry="9" fill="${lash}"/>
     <circle cx="${cx - 4.5}" cy="159.5" r="4.6" fill="#fff"/>
     <circle cx="${cx + 4.5}" cy="171" r="2.2" fill="#fff" opacity=".9"/>
     <path d="M${cx - 17} 160 Q${cx} 139 ${cx + 17} 160" fill="none" stroke="${lash}" stroke-width="5" stroke-linecap="round"/>
     <path d="M${cx + dir * 15} 157 l${dir * 8} -6 M${cx + dir * 11} 151 l${dir * 5} -8" fill="none" stroke="${lash}" stroke-width="3.2" stroke-linecap="round"/>`;

  const blushColor = blush ? blush.color : mix(skin, '#ff6f91', 0.55);
  const blushOpacity = blush ? 0.62 : 0.3;

  return (
    `<ellipse cx="148" cy="194" rx="17" ry="11" fill="${blushColor}" opacity="${blushOpacity}"/>
     <ellipse cx="252" cy="194" rx="17" ry="11" fill="${blushColor}" opacity="${blushOpacity}"/>` +
    (art ? art.draw() + mirror(art.draw()) : '') +
    `<path d="M153 137 Q169 126 186 133" fill="none" stroke="${d.brows}" stroke-width="4" stroke-linecap="round"/>
     <path d="M247 137 Q231 126 214 133" fill="none" stroke="${d.brows}" stroke-width="4" stroke-linecap="round"/>` +
    pivot(200, 166, 'blink', eye(169, -1) + eye(231, 1)) +
    `<path d="M196 185 Q200 189 204 185" fill="none" stroke="${shade}" stroke-width="3" stroke-linecap="round"/>
     <path d="M183 201 Q192 196 200 200 Q208 196 217 201 Q200 221 183 201 Z" fill="${lipColor}" stroke="${lipColor}" stroke-width="2.5" stroke-linejoin="round"/>
     <path d="M185 202 Q200 207 215 202" fill="none" stroke="${darken(lipColor, 0.35)}" stroke-width="2" stroke-linecap="round" opacity=".7"/>` +
    (lips ? `<ellipse cx="200" cy="210" rx="5" ry="1.8" fill="#fff" opacity=".6"/>` : '')
  );
}

function tinyNails(look: Look): string {
  const sw = byId(NAIL_COLORS, look.nailColor);
  if (!sw) return '';
  const pts: Array<[number, number]> = [
    [120, 428],
    [125.5, 433],
    [132, 435],
    [138.5, 432],
  ];
  return pts
    .map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="3.1" ry="3.6" fill="${nailColorAt(sw, i)}" stroke="#fff" stroke-width=".8"/>`)
    .join('');
}

/** All artwork layers contributed by what the doll is wearing. */
export function lookLayers(look: Look, uid: string): { layers: Parts[]; handL: string; handR: string; hideLegs: boolean } {
  const ctx = { uid };
  const get = (id: string | undefined) => {
    const it = itemById(id);
    return it ? it.parts(ctx) : undefined;
  };
  const bottom = itemById(look.bottom);
  const hasTail = !look.dress && !!bottom?.tail;
  const layers: Parts[] = [];
  const push = (p: Parts | undefined) => {
    if (p) layers.push(p);
  };
  if (!hasTail) push(get(look.shoes));
  if (look.dress) push(get(look.dress));
  else {
    push(get(look.bottom));
    push(get(look.top));
  }
  push(get(look.accBack));
  push(get(look.accNeck));
  push(get(look.accFace));
  push(get(look.accHead));
  const handL = get(look.accHandL);
  const handR = get(look.accHandR);
  if (handL?.defs) layers.push({ defs: handL.defs });
  if (handR?.defs) layers.push({ defs: handR.defs });
  return { layers, handL: handL?.hand ?? '', handR: handR?.hand ?? '', hideLegs: hasTail };
}

/** Inner SVG markup for a dressed doll (no outer <svg>). */
export function dollMarkup(look: Look, uid = nextUid()): string {
  const d = dollById(look.doll);
  const { paint, defs } = hairPaint(hairColorById(look.hairColor), uid);
  const style = hairStyleById(look.hair);
  const { layers, handL, handR, hideLegs } = lookLayers(look, uid);
  if (defs) layers.unshift({ defs });
  return composeDoll({
    skin: d.skin,
    face: face(d, look),
    hairBack: style.back(paint),
    hairFront: style.front(paint),
    layers,
    handL,
    handR,
    hideLegs,
    nails: tinyNails(look),
  });
}

export function dollSvg(look: Look, cls = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="doll-svg ${cls}" viewBox="${DOLL_VIEWBOX}" preserveAspectRatio="xMidYMax meet">${dollMarkup(look)}</svg>`;
}

/** Just the head, for hair style thumbnails. */
export function headThumb(look: Look, hairId: string): string {
  const uid = nextUid();
  const d = dollById(look.doll);
  const { paint, defs } = hairPaint(hairColorById(look.hairColor), uid);
  const style = hairStyleById(hairId);
  const inner = composeDoll({
    skin: d.skin,
    face: face(d, { ...look, faceArt: undefined }),
    hairBack: style.back(paint),
    hairFront: style.front(paint),
    layers: defs ? [{ defs }] : [],
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="30 -10 340 340" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

/** Pale dress form used behind clothing thumbnails. */
export const MANNEQUIN = lighten('#cdb6f2', 0.55);
