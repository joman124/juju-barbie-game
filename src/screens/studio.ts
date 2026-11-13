import type { Expression, Look, WearItem } from '../types';
import { btn, muteAction, muteButton, routes, html, type Screen } from '../app';
import { audio } from '../audio';
import { fx } from '../fx';
import { ICONS } from '../art/icons';
import { DOLL_VB, composeDoll, dollSvg, headThumb } from '../art/doll';
import { itemThumb } from '../art/catalog';
import { BOTTOMS, DRESSES, SHOES, TOPS } from '../art/clothes';
import { BLING_ACC, CARRY_ACC, HEAD_ACC } from '../art/accessories';
import { HAIR_COLORS, HAIR_STYLES, hairSwatch } from '../art/hair';
import { BLUSHES, FACE_ART, LIPS, NAIL_COLORS, NAIL_PATTERNS, SHADOWS, byId, type Swatch } from '../art/makeup';
import { handSvg, patternIcon, polishIcon } from '../art/hand';
import { PETS, petSvg } from '../art/pets';
import { nextUid } from '../art/svg';
import { dollById } from '../dolls';
import { choose, hasFlag, randomLook, sameLook, setFlag, type Memory } from '../state';

type View = 'full' | 'bust' | 'face' | 'hands';

interface Opt {
  id: string;
  slot: keyof Look;
  thumb: (look: Look) => string;
}

/**
 * One kind of thing to change. Every category is a single picture button in
 * one row: there are no sub-menus, so any category is one tap away.
 */
interface Category {
  id: string;
  /** Picture on the category button. */
  icon: (look: Look) => string;
  view: View;
  color: string;
  opts: Opt[];
  /** Thumbnails or the button picture depend on the current look. */
  live?: boolean;
}

const thumbCache = new Map<string, string>();
const cached = (key: string, make: () => string) => {
  let v = thumbCache.get(key);
  if (!v) {
    v = make();
    thumbCache.set(key, v);
  }
  return v;
};

const wear = (items: WearItem[]): Opt[] => items.map((it) => ({ id: it.id, slot: it.slot, thumb: () => cached(it.id, () => itemThumb(it)) }));

/** Garment on its own (no dress form), used as a category picture. */
function bareIcon(it: WearItem): string {
  return cached(`bare-${it.id}`, () => {
    const uid = nextUid();
    const p = it.parts({ uid });
    const [x, y, w, h] = it.thumb;
    const inner = composeDoll({
      uid,
      skin: '#fff',
      layers: [p],
      handL: it.slot === 'accHandL' ? p.hand : '',
      handR: it.slot === 'accHandR' ? p.hand : '',
      hideBody: true,
      hideHead: true,
      hideLegs: !!it.tail,
    });
    const headParts = (p.head ?? '') + (p.face ?? '') + (p.over ?? '');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}">${inner}${headParts}</svg>`;
  });
}

const swatchIcon = (inner: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;

const lipThumb = (s: Swatch) =>
  swatchIcon(
    `<path d="M10 50 Q30 22 50 38 Q70 22 90 50 Q50 94 10 50 Z" fill="${s.color}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
     <path d="M17 51 Q50 63 83 51" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="4" stroke-linecap="round"/><ellipse cx="50" cy="70" rx="12" ry="4" fill="#fff" opacity=".6"/>`,
  );
const shadowThumb = (s: Swatch) =>
  swatchIcon(
    `<path d="M8 62 Q50 0 92 62 Q50 34 8 62 Z" fill="${s.color}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
     <path d="M12 66 Q50 30 88 66" fill="none" stroke="#2a1a2e" stroke-width="7" stroke-linecap="round"/>
     <path d="M12 66 l-9 -8 M24 54 l-7 -10 M88 66 l9 -8 M76 54 l7 -10" stroke="#2a1a2e" stroke-width="5" stroke-linecap="round"/>
     <circle cx="62" cy="28" r="3.5" fill="#fff"/>`,
  );
const blushThumb = (s: Swatch) =>
  swatchIcon(`<circle cx="50" cy="52" r="38" fill="${s.color}" opacity=".35"/><circle cx="50" cy="52" r="27" fill="${s.color}" opacity=".7"/><circle cx="40" cy="42" r="7" fill="#fff" opacity=".55"/>`);

const PINK = '#ff6fb1';
const GOLD = '#ffb020';
const PURPLE = '#9a6bff';
const RED = '#ff4f7a';
const TEAL = '#18c5c0';
const GREEN = '#5fc96a';

const CATEGORIES: Category[] = [
  { id: 'tops', icon: () => bareIcon(TOPS[0]), view: 'full', color: PINK, opts: wear(TOPS) },
  { id: 'bottoms', icon: () => bareIcon(BOTTOMS[5]), view: 'full', color: PINK, opts: wear(BOTTOMS) },
  { id: 'dresses', icon: () => bareIcon(DRESSES[0]), view: 'full', color: PINK, opts: wear(DRESSES) },
  { id: 'shoes', icon: () => bareIcon(SHOES[0]), view: 'full', color: PINK, opts: wear(SHOES) },
  { id: 'hats', icon: () => bareIcon(HEAD_ACC[1]), view: 'bust', color: GOLD, opts: wear(HEAD_ACC) },
  { id: 'extras', icon: () => bareIcon(CARRY_ACC[0]), view: 'full', color: GOLD, opts: wear([...BLING_ACC, ...CARRY_ACC]) },
  {
    id: 'hair',
    live: true,
    icon: (look) => headThumb(look, look.hair),
    view: 'bust',
    color: PURPLE,
    opts: HAIR_STYLES.map((s) => ({ id: s.id, slot: 'hair' as const, thumb: (look: Look) => headThumb(look, s.id) })),
  },
  {
    id: 'haircolor',
    icon: () => swatchIcon(hairSwatch(HAIR_COLORS[HAIR_COLORS.length - 1], 'tabsw')),
    view: 'bust',
    color: PURPLE,
    opts: HAIR_COLORS.map((c) => ({ id: c.id, slot: 'hairColor' as const, thumb: () => swatchIcon(hairSwatch(c, `sw${c.id}`)) })),
  },
  {
    id: 'makeup',
    icon: () => lipThumb(LIPS[2]),
    view: 'face',
    color: RED,
    opts: [
      ...LIPS.map((s) => ({ id: s.id, slot: 'lips' as const, thumb: () => lipThumb(s) })),
      ...SHADOWS.map((s) => ({ id: s.id, slot: 'shadow' as const, thumb: () => shadowThumb(s) })),
    ],
  },
  {
    id: 'cheeks',
    icon: () => swatchIcon(FACE_ART[0].icon()),
    view: 'face',
    color: RED,
    opts: [
      ...BLUSHES.map((s) => ({ id: s.id, slot: 'blush' as const, thumb: () => blushThumb(s) })),
      ...FACE_ART.map((a) => ({ id: a.id, slot: 'faceArt' as const, thumb: () => swatchIcon(a.icon()) })),
    ],
  },
  {
    id: 'nails',
    live: true,
    icon: () => polishIcon(NAIL_COLORS[0]),
    view: 'hands',
    color: TEAL,
    opts: [
      ...NAIL_COLORS.map((s) => ({ id: s.id, slot: 'nailColor' as const, thumb: () => polishIcon(s) })),
      ...NAIL_PATTERNS.map((p) => ({ id: p, slot: 'nailPattern' as const, thumb: (look: Look) => patternIcon(p, byId(NAIL_COLORS, look.nailColor)) })),
    ],
  },
  { id: 'pets', icon: () => petSvg('pet-kitty'), view: 'full', color: GREEN, opts: PETS.map((p) => ({ id: p.id, slot: 'pet' as const, thumb: () => petSvg(p.id) })) },
];

const HAIR_CAT = CATEGORIES.findIndex((c) => c.id === 'hair');

/** Roughly where on the doll (0-1 across, 0-1 down) each slot sits, for sparkles. */
const SPARK_AT: Partial<Record<keyof Look, [number, number]>> = {
  top: [0.5, 0.45],
  bottom: [0.5, 0.66],
  dress: [0.5, 0.58],
  shoes: [0.5, 0.93],
  accNeck: [0.5, 0.4],
  accFace: [0.5, 0.27],
  accHandL: [0.28, 0.62],
  accHandR: [0.74, 0.52],
  accBack: [0.5, 0.42],
};

const HAPPY: Partial<Record<keyof Look, Expression>> = { lips: 'kiss', shadow: 'wink', pet: 'wow' };

export function studioScreen(initial: Look): Screen {
  let look: Look = { ...initial };
  const doll = dollById(look.doll);
  const mem: Memory = {};
  let cat = 0;
  let changes = 0;
  const visited = new Set<number>([0]);
  let exTimer = 0;

  /**
   * First visit only: the pointing hand walks the child through one whole
   * makeover. Step 0 try something on, 1 pick another category, 2 try
   * something on there, 3 start the show. Any matching tap moves it along.
   */
  let lesson = hasFlag('lesson') ? -1 : 0;

  const root = html(`
    <div class="studio" style="--c1:${doll.color};--c2:${doll.color2}">
      <div class="stage">
        <div class="stage-rays"></div>
        <div class="stage-floor"></div>
        <div class="doll-wrap idle"><div class="doll-zoom"></div></div>
        <div class="pet-wrap"></div>
        <div class="hand-wrap"></div>
        <div class="corner corner-tl">${btn('back', ICONS.back, 'btn-small btn-ghost', '', 'Back')}</div>
        <div class="corner corner-tr">${muteButton()}</div>
        <div class="stage-bar">
          <button type="button" class="btn btn-small btn-blue btn-reset" data-act="reset" aria-label="Back to how she started">
            <span class="reset-face">${headThumb(doll.starter, doll.starter.hair)}</span><span class="reset-badge">${ICONS.reset}</span>
          </button>
          ${btn('surprise', ICONS.surprise, 'btn-mid btn-purple', '', 'Surprise me')}
          ${btn('show', ICONS.show, 'btn-big btn-show pulse', '', 'Fashion show')}
        </div>
      </div>
      <div class="panel">
        <div class="rail"></div>
        <div class="grid"></div>
      </div>
    </div>`);

  const $ = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
  const stage = $('.stage');
  const dollWrap = $('.doll-wrap');
  const dollZoom = $('.doll-zoom');
  const petWrap = $('.pet-wrap');
  const handWrap = $('.hand-wrap');
  const railEl = $('.rail');
  const gridEl = $('.grid');

  const cur = () => CATEGORIES[cat];

  function drawDoll(): void {
    dollZoom.innerHTML = dollSvg(look);
  }
  function drawPet(): void {
    petWrap.innerHTML = petSvg(look.pet);
    petWrap.classList.toggle('floats', look.pet === 'pet-fish');
  }
  function drawHand(): void {
    handWrap.innerHTML = handSvg(doll.skin, look.nailColor, look.nailPattern);
  }

  function drawRail(): void {
    railEl.innerHTML = CATEGORIES.map(
      (c, i) =>
        `<button type="button" class="cat ${i === cat ? 'on' : ''}" data-act="cat" data-arg="${i}" style="--tc:${c.color}" aria-label="${c.id}" aria-pressed="${i === cat}">${c.icon(look)}</button>`,
    ).join('');
  }
  function markRail(): void {
    railEl.querySelectorAll<HTMLElement>('.cat').forEach((el, i) => {
      el.classList.toggle('on', i === cat);
      el.setAttribute('aria-pressed', String(i === cat));
      if (CATEGORIES[i].live && CATEGORIES[i].id === 'hair') el.innerHTML = CATEGORIES[i].icon(look);
    });
  }

  function drawGrid(animate = false): void {
    const c = cur();
    gridEl.style.setProperty('--tc', c.color);
    gridEl.dataset.n = String(c.opts.length);
    gridEl.classList.toggle('pop-in', animate);
    gridEl.innerHTML = c.opts
      .map((o, i) => {
        const on = look[o.slot] === o.id;
        return `<button type="button" class="tile ${on ? 'on' : ''}" data-act="opt" data-arg="${i}" style="animation-delay:${i * 22}ms" aria-label="${o.id}" aria-pressed="${on}">${o.thumb(look)}<span class="tick">${ICONS.check}</span></button>`;
      })
      .join('');
  }

  function markTiles(): void {
    const c = cur();
    if (c.live) return drawGrid();
    gridEl.querySelectorAll<HTMLElement>('.tile').forEach((el, i) => {
      const o = c.opts[i];
      const on = !!o && look[o.slot] === o.id;
      el.classList.toggle('on', on);
      el.setAttribute('aria-pressed', String(on));
    });
  }

  /** Zooms the doll for hair, hats and makeup, and swaps to the hand for nails. */
  function applyView(): void {
    const view = cur().view;
    stage.dataset.view = view;
    const w = dollWrap.clientWidth;
    const h = dollWrap.clientHeight;
    if (!w || !h) return;
    const dh = Math.min(h, (w * DOLL_VB.h) / DOLL_VB.w);
    const top = h - dh;
    const focus = view === 'face' ? 0.262 : view === 'bust' ? 0.3 : 0.5;
    const scale = view === 'face' ? Math.min(2.3, (w / ((dh * DOLL_VB.w) / DOLL_VB.h)) * 1.7) : view === 'bust' ? 1.5 : 1;
    const fy = top + dh * focus;
    dollZoom.style.transformOrigin = `50% ${fy}px`;
    dollZoom.style.transform = view === 'face' || view === 'bust' ? `translateY(${h * (view === 'face' ? 0.52 : 0.46) - fy}px) scale(${scale})` : 'none';
  }

  /** A quick change of expression, then back to her usual smile. */
  function feel(ex: Expression, ms = 850): void {
    window.clearTimeout(exTimer);
    dollWrap.dataset.ex = ex;
    exTimer = window.setTimeout(() => delete dollWrap.dataset.ex, ms);
  }

  function hop(el: HTMLElement): void {
    el.classList.remove('react');
    void el.offsetWidth;
    el.classList.add('react');
  }

  function react(slot?: keyof Look): void {
    hop(dollWrap);
    const view = cur().view;
    const r = (view === 'hands' ? handWrap : dollWrap).getBoundingClientRect();
    if (view !== 'full') {
      fx.twinkle(r.left + r.width / 2, r.top + r.height * 0.45, 12, r.width * 0.3);
      return;
    }
    if (slot === 'pet') {
      const pr = petWrap.getBoundingClientRect();
      fx.twinkle(pr.left + pr.width / 2, pr.top + pr.height / 2, 10, pr.width / 2);
      return;
    }
    const dh = Math.min(r.height, (r.width * DOLL_VB.h) / DOLL_VB.w);
    const dw = (dh * DOLL_VB.w) / DOLL_VB.h;
    const [ax, ay] = (slot && SPARK_AT[slot]) || [0.5, 0.5];
    fx.twinkle(r.left + r.width / 2 + (ax - 0.5) * dw, r.bottom - dh + ay * dh, 12, dw * 0.22);
  }

  function setLook(next: Look, slot?: keyof Look): void {
    const petChanged = next.pet !== look.pet;
    look = next;
    drawDoll();
    if (petChanged) {
      drawPet();
      hop(petWrap);
    }
    drawHand();
    react(slot);
  }

  const onResize = () => applyView();

  drawDoll();
  drawPet();
  drawHand();
  drawRail();
  drawGrid(true);

  return {
    root,
    actions: {
      cat: (arg) => {
        const i = Number(arg);
        if (i === cat) return;
        cat = i;
        visited.add(i);
        if (lesson === 1) lesson = 2;
        audio.sfx('tab');
        markRail();
        drawGrid(true);
        applyView();
      },
      opt: (arg, el) => {
        const o = cur().opts[Number(arg)];
        if (!o) return;
        const res = choose(look, o.slot, o.id, mem);
        changes++;
        if (lesson === 0) lesson = 1;
        else if (lesson === 2) lesson = 3;
        audio.sfx(res.on ? (o.slot === 'pet' ? 'pet' : 'select') : 'remove');
        setLook(res.look, o.slot);
        if (res.on) feel(HAPPY[o.slot] ?? 'grin');
        markTiles();
        markRail();
        const tile = cur().live ? (gridEl.children[Number(arg)] as HTMLElement | undefined) : el;
        if (tile) {
          tile.classList.remove('bump');
          void tile.offsetWidth;
          tile.classList.add('bump');
        }
      },
      surprise: () => {
        audio.sfx('magic');
        changes++;
        let next = randomLook(look.doll);
        if (sameLook(next, look)) next = randomLook(look.doll);
        setLook(next);
        feel('wow', 1100);
        drawPet();
        markRail();
        drawGrid();
        const r = dollWrap.getBoundingClientRect();
        fx.twinkle(r.left + r.width / 2, r.top + r.height / 2, 26, r.width * 0.4);
      },
      reset: () => {
        audio.sfx('whoosh');
        setLook({ ...doll.starter });
        drawPet();
        markRail();
        drawGrid();
      },
      show: () => {
        audio.sfx('sparkle');
        if (lesson >= 0) setFlag('lesson');
        routes.show(look, 'studio');
      },
      back: () => {
        audio.sfx('tap');
        routes.pick();
      },
      mute: muteAction,
    },
    onStagePress: (x, y) => {
      fx.twinkle(x, y, 7, 26);
      audio.pop();
      const r = stage.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return;
      // Tickle the doll (or her pet) and she reacts.
      const pr = petWrap.getBoundingClientRect();
      if (cur().view === 'full' && x > pr.left && y > pr.top && y < pr.bottom) hop(petWrap);
      else {
        hop(dollWrap);
        feel(Math.random() < 0.5 ? 'wink' : 'grin');
      }
    },
    hintTarget: () => {
      const tile = () => gridEl.querySelector('.tile:not(.on)');
      const star = () => root.querySelector('.btn-show');
      if (lesson === 0 || lesson === 2) return tile();
      if (lesson === 1) return railEl.children[HAIR_CAT === cat ? 0 : HAIR_CAT] ?? null;
      if (lesson === 3) return star();
      // After the lesson: nudge toward whatever has not been tried yet.
      if (changes === 0) return tile();
      if (visited.size < 3) return Array.from(railEl.children).find((_, i) => !visited.has(i)) ?? null;
      return star();
    },
    hintDelay: () => (lesson >= 0 ? 1100 : 6000),
    onShow: () => {
      audio.music('studio');
      window.addEventListener('resize', onResize);
      requestAnimationFrame(applyView);
    },
    onHide: () => {
      window.clearTimeout(exTimer);
      window.removeEventListener('resize', onResize);
    },
  };
}
