import type { DollDef, Look, Parts } from '../types';
import { darken, heartPath, lighten, mirror, mix, nextUid, pivot, star } from './svg';
import { hairColorById, hairPaint, hairStyleById, tuckedHair } from './hair';
import { BLUSHES, FACE_ART, LIPS, NAIL_COLORS, SHADOWS, byId, nailColorAt } from './makeup';
import { itemById } from './catalog';
import { dollById } from '../dolls';

/** The doll is always drawn in this coordinate space. */
export const DOLL_VB = { x: 0, y: -40, w: 400, h: 740 };
export const DOLL_VIEWBOX = `${DOLL_VB.x} ${DOLL_VB.y} ${DOLL_VB.w} ${DOLL_VB.h}`;

const SUIT = '#f4eaff';
const SUIT_TRIM = '#d8c2ff';

export interface ComposeOpts {
  /** Prefix for gradient ids; must match the uid given to the items' parts(). */
  uid: string;
  skin: string;
  /** Soft shadow the fringe casts on the forehead. */
  hairShadow?: string;
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
  ears?: 'round' | 'pointy';
  /** Soft shadow on the floor under her feet. */
  ground?: boolean;
  /** Draw her from behind (for the twirl): pass the hair paint for the back of her head. */
  back?: { hairFill: string };
}

const join = (layers: Parts[], key: keyof Parts) => layers.map((l) => l[key] ?? '').join('');

const HEAD_D = 'M118 145 C118 92 154 66 200 66 C246 66 282 92 282 145 C282 197 250 234 200 234 C150 234 118 197 118 145 Z';
const TORSO_D = 'M170 248 Q150 250 148 270 L158 340 Q150 370 150 400 L250 400 Q250 370 242 340 L252 270 Q250 250 230 248 Z';
/** Colour of the soft shadows that give the doll and her clothes some roundness. */
export const SHADE = '#4a1040';
/** The knee: legs bend here when she walks. */
const KNEE_Y = 516;

/**
 * Shared shading. `-cyl` rounds anything tube-shaped (torso, skirts, tails),
 * `-face` rounds the head, and `-drop` is the shadow one layer casts on the
 * layer below (a hem on a leg, a top on a skirt). Items use them through
 * `vol()` and `hemShadow()` in clothes.ts.
 */
function shadingDefs(uid: string, faceShade: string): string {
  return `<linearGradient id="${uid}-cyl" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${SHADE}" stop-opacity=".3"/><stop offset=".2" stop-color="${SHADE}" stop-opacity=".05"/>
      <stop offset=".36" stop-color="#fff" stop-opacity=".24"/><stop offset=".56" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".8" stop-color="${SHADE}" stop-opacity=".07"/><stop offset="1" stop-color="${SHADE}" stop-opacity=".32"/>
    </linearGradient>
    <linearGradient id="${uid}-drop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${SHADE}" stop-opacity=".34"/><stop offset="1" stop-color="${SHADE}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${uid}-face" cx=".4" cy=".3" r=".78">
      <stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".7" stop-color="${faceShade}" stop-opacity="0"/><stop offset="1" stop-color="${faceShade}" stop-opacity=".5"/>
    </radialGradient>
    <clipPath id="${uid}-hc"><path d="${HEAD_D}"/></clipPath>
    <clipPath id="${uid}-torso"><path d="${TORSO_D}"/><rect x="186" y="214" width="28" height="46"/></clipPath>
    <clipPath id="${uid}-kt"><rect x="100" y="360" width="200" height="${KNEE_Y - 360}"/></clipPath>
    <clipPath id="${uid}-ks"><rect x="100" y="${KNEE_Y - 3}" width="200" height="220"/></clipPath>`;
}

/** Stacks body, clothes, hair and accessories in a fixed order. */
export function composeDoll(o: ComposeOpts): string {
  const skin = o.skin;
  const shade = o.mannequin ? darken(skin, 0.06) : mix(skin, '#a2452f', 0.28);
  const L = o.layers;
  const suit = o.mannequin ? skin : SUIT;
  const body = !o.hideBody;
  const u = o.uid;

  // --- legs: a thigh and a shin, so the knee can lift when she walks ---
  const legSkin = body
    ? `<path d="M157 388 L198 388 L189 642 L165 642 Z" fill="${skin}" stroke="${skin}" stroke-width="7" stroke-linejoin="round"/>
       <path d="M156 388 L199 388 L198 424 L157 424 Z" fill="${suit}" stroke="${suit}" stroke-width="7" stroke-linejoin="round"/>`
    : '';
  const legWear =
    join(L, 'leg') +
    // a highlight down the shin and a shadow on the inside edge round the leg off
    `<path d="M171 404 L175 628" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".17"/>
     <path d="M196 398 L188 634" fill="none" stroke="${SHADE}" stroke-width="7" stroke-linecap="round" opacity=".13"/>`;
  const legArt = (side: 'l' | 'r') =>
    pivot(
      176,
      392,
      `leg leg-${side}`,
      `<g clip-path="url(#${u}-kt)">${legSkin}${legWear}</g>` +
        pivot(
          176,
          KNEE_Y,
          `shin shin-${side}`,
          `<g clip-path="url(#${u}-ks)">${legSkin}</g>` +
            (body ? `<ellipse cx="174" cy="655" rx="21" ry="13" fill="${skin}"/>` : '') +
            join(L, 'foot') +
            `<g clip-path="url(#${u}-ks)">${legWear}</g>`,
        ),
    );
  const tail = join(L, 'tail');
  const legs = tail ? pivot(200, 392, 'tail', tail) : o.hideLegs ? '' : legArt('l') + mirror(legArt('r'));

  // --- torso ----------------------------------------------------------
  const torso = body
    ? `<rect x="186" y="214" width="28" height="46" rx="10" fill="${skin}"/>
       <path d="M186 240 Q200 252 214 240 L214 226 L186 226 Z" fill="${shade}" opacity=".45"/>
       <path d="${TORSO_D}" fill="${skin}"/>
       <path d="M166 258 L183 256 Q200 280 217 256 L234 258 L243 340 Q250 370 250 402 L150 402 Q150 370 157 340 Z" fill="${suit}"/>` +
      (o.mannequin
        ? ''
        : `<path d="M183 256 Q200 280 217 256" fill="none" stroke="${SUIT_TRIM}" stroke-width="4" stroke-linecap="round"/>` +
          star(200, 312, 9, SUIT_TRIM))
    : '';
  const torsoShading = body
    ? `<path d="${TORSO_D}" fill="url(#${u}-cyl)"/>
       <path d="M159 336 Q169 345 178 339 M241 336 Q231 345 222 339" fill="none" stroke="${SHADE}" stroke-width="3" stroke-linecap="round" opacity=".13"/>`
    : '';
  // the shadow her chin casts on her neck and collar
  const chinShadow = body && !o.hideHead ? `<g clip-path="url(#${u}-torso)"><ellipse cx="200" cy="244" rx="48" ry="17" fill="${SHADE}" opacity=".2"/></g>` : '';

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
            `<path d="M137 354 L131 400" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".18"/>` +
            (body ? `<ellipse cx="125" cy="416" rx="4" ry="5.5" fill="#fff" opacity=".22"/>` : '') +
            (held ? pivot(130, 421, 'held', held) : ''),
        ) +
        join(L, 'armUpper') +
        `<path d="M152 282 L141 336" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".18"/>
         <path d="M165 284 L149 342" fill="none" stroke="${SHADE}" stroke-width="5" stroke-linecap="round" opacity=".11"/>`,
    );
  const arms = arm('l', o.handL ?? '') + mirror(arm('r', o.handR ?? ''));

  // --- head -----------------------------------------------------------
  const ear =
    o.ears === 'pointy'
      ? `<path d="M127 146 L95 126 Q101 166 125 178 Z" fill="${skin}" stroke="${skin}" stroke-width="5" stroke-linejoin="round"/><path d="M121 153 L106 143 Q110 161 121 169 Z" fill="${shade}" opacity=".35"/>`
      : `<circle cx="119" cy="162" r="13" fill="${skin}"/><circle cx="119" cy="163" r="6" fill="${shade}" opacity=".35"/>`;
  const headBase = ear + mirror(ear) + `<path d="${HEAD_D}" fill="${skin}"/>`;
  const head = o.hideHead
    ? ''
    : o.back
      ? pivot(200, 236, 'head', headBase + (o.hairFront ?? '') + `<path d="${HEAD_D}" fill="${o.back.hairFill}"/>` + (o.hairBack ?? '') + join(L, 'head') + join(L, 'over'))
      : pivot(
          200,
          236,
          'head',
          headBase +
            `<path d="${HEAD_D}" fill="url(#${u}-face)"/>` +
            (o.hairShadow ? `<g clip-path="url(#${u}-hc)"><g opacity=".2" transform="translate(0 7)">${o.hairShadow}</g></g>` : '') +
            (o.face ?? '') +
            (o.hairFront ?? '') +
            join(L, 'face') +
            join(L, 'head') +
            join(L, 'over'),
        );

  const faceShade = o.mannequin ? darken(skin, 0.3) : mix(skin, '#8a2438', 0.55);
  const defs = shadingDefs(u, faceShade) + join(L, 'defs');
  const wings = pivot(200, 300, 'wings', join(L, 'behind'));
  const dressed = torso + pivot(200, 372, 'swish', join(L, 'hips')) + join(L, 'torso') + torsoShading;
  const ground = o.ground ? `<ellipse cx="200" cy="668" rx="96" ry="13" fill="${SHADE}" opacity=".16"/>` : '';

  // Everything above the hips sits in an `upper` group so it can sway as she walks.
  const stack = o.back
    ? legs + pivot(200, 392, 'upper', dressed + arms + wings + head)
    : pivot(200, 392, 'upper', wings + (o.hideHead ? '' : pivot(200, 236, 'head', o.hairBack ?? ''))) +
      legs +
      pivot(200, 392, 'upper', dressed + chinShadow + join(L, 'neck') + arms + head);

  return `<defs>${defs}</defs>` + ground + pivot(200, 670, 'bob', stack);
}

function face(d: DollDef, look: Look): string {
  const skin = d.skin;
  const t = d.face;
  const shade = mix(skin, '#a2452f', 0.3);
  const lips = byId(LIPS, look.lips);
  const lipColor = lips ? lips.color : mix(skin, '#d6456a', 0.5);
  const shadow = byId(SHADOWS, look.shadow);
  const blush = byId(BLUSHES, look.blush);
  const art = byId(FACE_ART, look.faceArt);
  const lash = '#2a1a2e';
  const { rx, ry, tilt, gap } = t.eye;

  const lashes = (cx: number, dir: number): string => {
    const ox = cx + dir * (rx - 0.5);
    switch (t.lashes) {
      case 'long':
        return `<path d="M${ox} 157 l${dir * 9} -5 M${ox - dir * 4} 151 l${dir * 7} -9 M${ox - dir * 10} 146 l${dir * 3} -9" fill="none" stroke="${lash}" stroke-width="3" stroke-linecap="round"/>`;
      case 'wing':
        return `<path d="M${ox - dir * 4} 158 Q${ox + dir * 6} 156 ${ox + dir * 13} 146" fill="none" stroke="${lash}" stroke-width="5" stroke-linecap="round"/><path d="M${ox - dir * 6} 150 l${dir * 5} -8" fill="none" stroke="${lash}" stroke-width="3" stroke-linecap="round"/>`;
      case 'soft':
        return `<path d="M${ox} 157 l${dir * 6} -5" fill="none" stroke="${lash}" stroke-width="3" stroke-linecap="round"/>`;
      default:
        return `<path d="M${ox} 157 l${dir * 8} -6 M${ox - dir * 4} 151 l${dir * 5} -8" fill="none" stroke="${lash}" stroke-width="3.2" stroke-linecap="round"/>`;
    }
  };

  const eye = (cx: number, dir: number, side: 'l' | 'r') =>
    (shadow
      ? `<path d="M${cx - rx - 3.5} 160 Q${cx} ${142 - ry} ${cx + rx + 3.5} 160 Q${cx} 146 ${cx - rx - 3.5} 160 Z" fill="${shadow.color}" opacity=".92"/>
         <circle cx="${cx + dir * 6}" cy="${161 - ry}" r="2.2" fill="#fff" opacity=".9"/>`
      : '') +
    `<g class="eye-open eye-${side}" transform="rotate(${-dir * tilt} ${cx} 164)">
       <ellipse cx="${cx}" cy="164" rx="${rx}" ry="${ry}" fill="#fff"/>
       <ellipse cx="${cx}" cy="166" rx="${rx * 0.77}" ry="${ry * 0.8}" fill="${d.eyes}"/>
       <ellipse cx="${cx}" cy="167" rx="${rx * 0.44}" ry="${ry * 0.5}" fill="${lash}"/>
       <circle cx="${cx - 4.5}" cy="${164 - ry * 0.25}" r="${rx * 0.3}" fill="#fff"/>
       <circle cx="${cx + 4.5}" cy="${164 + ry * 0.4}" r="2.2" fill="#fff" opacity=".9"/>
       <path d="M${cx - rx - 1.5} 160 Q${cx} ${157 - ry} ${cx + rx + 1.5} 160" fill="none" stroke="${lash}" stroke-width="5" stroke-linecap="round"/>
       ${lashes(cx, dir)}
     </g>
     <g class="eye-shut eye-${side}" display="none">
       <path d="M${cx - rx} 166 Q${cx} 152 ${cx + rx} 166" fill="none" stroke="${lash}" stroke-width="5" stroke-linecap="round"/>
       <path d="M${cx + dir * (rx - 1)} 164 l${dir * 7} -4" fill="none" stroke="${lash}" stroke-width="3.2" stroke-linecap="round"/>
     </g>`;

  const brow = (cx: number, dir: number): string => {
    const outer = cx + dir * 16;
    const inner = cx - dir * 17;
    if (t.brow === 'arched') return `<path d="M${outer} 137 Q${cx + dir * 4} 119 ${inner} 131" fill="none" stroke="${d.brows}" stroke-width="3.6" stroke-linecap="round"/>`;
    if (t.brow === 'straight') return `<path d="M${outer} 133 Q${cx} 128 ${inner} 132" fill="none" stroke="${d.brows}" stroke-width="5" stroke-linecap="round"/>`;
    return `<path d="M${outer} 137 Q${cx} 126 ${inner} 133" fill="none" stroke="${d.brows}" stroke-width="4" stroke-linecap="round"/>`;
  };

  const blushColor = blush ? blush.color : mix(skin, '#ff6f91', 0.55);
  const blushOpacity = blush ? 0.62 : 0.3;
  const lipDark = darken(lipColor, 0.35);
  const smileD = {
    smile: 'M183 201 Q192 196 200 200 Q208 196 217 201 Q200 221 183 201 Z',
    heart: 'M181 200 Q190 190 200 199 Q210 190 219 200 Q200 228 181 200 Z',
    wide: 'M177 200 Q190 196 200 199 Q210 196 223 200 Q200 221 177 200 Z',
  }[t.mouth];
  const lx = 200 - gap;
  const rxEye = 200 + gap;

  const freckles = t.freckles
    ? [
        [170, 188],
        [180, 193],
        [190, 188],
        [210, 188],
        [220, 193],
        [230, 188],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${shade}" opacity=".6"/>`)
        .join('')
    : '';
  const mole = t.mole ? `<circle cx="228" cy="207" r="2.6" fill="${darken(skin, 0.55)}"/>` : '';
  const dimples = t.dimples ? `<path d="M174 200 Q171 205 174 210 M226 200 Q229 205 226 210" fill="none" stroke="${shade}" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>` : '';

  return (
    `<ellipse cx="148" cy="194" rx="17" ry="11" fill="${blushColor}" opacity="${blushOpacity}"/>
     <ellipse cx="252" cy="194" rx="17" ry="11" fill="${blushColor}" opacity="${blushOpacity}"/>` +
    freckles +
    (art ? art.draw() + mirror(art.draw()) : '') +
    `<g class="brows">${brow(lx, -1)}${brow(rxEye, 1)}</g>` +
    pivot(200, 166, 'blink', eye(lx, -1, 'l') + eye(rxEye, 1, 'r')) +
    `<path d="M196 185 Q200 189 204 185" fill="none" stroke="${shade}" stroke-width="3" stroke-linecap="round"/>` +
    dimples +
    mole +
    // one mouth per expression; CSS shows the one that matches data-ex
    `<g class="mouth-smile"><path d="${smileD}" fill="${lipColor}" stroke="${lipColor}" stroke-width="2.5" stroke-linejoin="round"/>
       <path d="M${t.mouth === 'wide' ? 180 : 185} 202 Q200 207 ${t.mouth === 'wide' ? 220 : 215} 202" fill="none" stroke="${lipDark}" stroke-width="2" stroke-linecap="round" opacity=".7"/>
       ${lips ? `<ellipse cx="200" cy="210" rx="5" ry="1.8" fill="#fff" opacity=".6"/>` : ''}</g>
     <g class="mouth-grin" display="none"><path d="M179 198 Q200 193 221 198 Q219 225 200 227 Q181 225 179 198 Z" fill="#7a1f3a" stroke="${lipColor}" stroke-width="4.5" stroke-linejoin="round"/>
       <path d="M185 200 Q200 196 215 200 L213 206 Q200 209 187 206 Z" fill="#fff"/><ellipse cx="200" cy="219" rx="9" ry="4.5" fill="#ff7f9f"/></g>
     <g class="mouth-wow" display="none"><ellipse cx="200" cy="208" rx="9" ry="11" fill="#7a1f3a" stroke="${lipColor}" stroke-width="4.5"/></g>
     <g class="mouth-kiss" display="none"><path d="${heartPath(200, 206, 8.5)}" fill="${lipColor}" stroke="${lipColor}" stroke-width="2.5" stroke-linejoin="round"/></g>`
  );
}

const SHADOW_PAINT = { fill: SHADE, shade: SHADE, light: SHADE, tie: SHADE };

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
    // the shadow a top casts on whatever is worn below it
    if (look.top) push({ hips: `<rect x="150" y="390" width="100" height="24" fill="url(#${uid}-drop)"/>` });
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

export interface DollView {
  /** Draw her from behind. */
  back?: boolean;
  /** Shadow on the floor under her feet. */
  ground?: boolean;
}

/** Inner SVG markup for a dressed doll (no outer <svg>). */
export function dollMarkup(look: Look, uid = nextUid(), view: DollView = {}): string {
  const d = dollById(look.doll);
  const { paint, defs } = hairPaint(hairColorById(look.hairColor), uid);
  // some headwear needs the hair tucked away (a bun under a crown, anything in a helmet)
  const style = tuckedHair(hairStyleById(look.hair), itemById(look.accHead)?.tuck);
  const { layers, handL, handR, hideLegs } = lookLayers(look, uid);
  if (defs) layers.unshift({ defs });
  return composeDoll({
    uid,
    skin: d.skin,
    ears: d.face.ears,
    face: face(d, look),
    hairBack: style.back(paint),
    hairFront: style.front(paint),
    hairShadow: style.front(SHADOW_PAINT),
    layers,
    handL,
    handR,
    hideLegs,
    nails: tinyNails(look),
    ground: view.ground,
    back: view.back ? { hairFill: paint.fill } : undefined,
  });
}

export function dollSvg(look: Look, cls = '', view: DollView = {}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="doll-svg ${cls}" viewBox="${DOLL_VIEWBOX}" preserveAspectRatio="xMidYMax meet">${dollMarkup(look, nextUid(), view)}</svg>`;
}

/** Her face and shoulders, for the close-up camera in the show. */
export function dollBustSvg(look: Look, cls = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="doll-svg ${cls}" viewBox="50 -30 300 300" preserveAspectRatio="xMidYMid slice">${dollMarkup(look)}</svg>`;
}

/** Just the head, for hair style thumbnails. */
export function headThumb(look: Look, hairId: string): string {
  const uid = nextUid();
  const d = dollById(look.doll);
  const { paint, defs } = hairPaint(hairColorById(look.hairColor), uid);
  const style = hairStyleById(hairId);
  const inner = composeDoll({
    uid,
    skin: d.skin,
    ears: d.face.ears,
    face: face(d, { ...look, faceArt: undefined }),
    hairBack: style.back(paint),
    hairFront: style.front(paint),
    hairShadow: style.front(SHADOW_PAINT),
    layers: defs ? [{ defs }] : [],
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="30 -10 340 340" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

/** Pale dress form used behind clothing thumbnails. */
export const MANNEQUIN = lighten('#cdb6f2', 0.55);
