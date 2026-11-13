import type { Look, WearItem } from '../types';
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
import { choose, randomLook, sameLook, type Memory } from '../state';

type View = 'full' | 'bust' | 'face' | 'hands';

interface Opt {
  id: string;
  slot: keyof Look;
  thumb: (look: Look) => string;
}
interface Sub {
  id: string;
  icon: (look: Look) => string;
  opts: Opt[];
  /** Thumbnails depend on the current look, so redraw them every time. */
  live?: boolean;
}
interface Tab {
  id: string;
  icon: string;
  view: View;
  color: string;
  subs: Sub[];
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

/** Garment on its own (no dress form), used as a sub-tab icon. */
function bareIcon(it: WearItem): string {
  return cached(`bare-${it.id}`, () => {
    const p = it.parts({ uid: nextUid() });
    const [x, y, w, h] = it.thumb;
    const inner = composeDoll({
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

const TABS: Tab[] = [
  {
    id: 'clothes',
    icon: ICONS.clothes,
    view: 'full',
    color: '#ff6fb1',
    subs: [
      { id: 'top', icon: () => bareIcon(TOPS[0]), opts: wear(TOPS) },
      { id: 'bottom', icon: () => bareIcon(BOTTOMS[5]), opts: wear(BOTTOMS) },
      { id: 'dress', icon: () => bareIcon(DRESSES[0]), opts: wear(DRESSES) },
      { id: 'shoes', icon: () => bareIcon(SHOES[0]), opts: wear(SHOES) },
    ],
  },
  {
    id: 'acc',
    icon: ICONS.crown,
    view: 'full',
    color: '#ffb020',
    subs: [
      { id: 'head', icon: () => bareIcon(HEAD_ACC[1]), opts: wear(HEAD_ACC) },
      { id: 'bling', icon: () => bareIcon(BLING_ACC[4]), opts: wear(BLING_ACC) },
      { id: 'carry', icon: () => bareIcon(CARRY_ACC[0]), opts: wear(CARRY_ACC) },
    ],
  },
  {
    id: 'hair',
    icon: ICONS.hair,
    view: 'bust',
    color: '#9a6bff',
    subs: [
      {
        id: 'style',
        live: true,
        icon: (look) => headThumb({ ...look, hairColor: look.hairColor }, look.hair),
        opts: HAIR_STYLES.map((s) => ({ id: s.id, slot: 'hair' as const, thumb: (look: Look) => headThumb(look, s.id) })),
      },
      {
        id: 'color',
        icon: () => swatchIcon(hairSwatch(HAIR_COLORS[7], 'tabsw')),
        opts: HAIR_COLORS.map((c) => ({ id: c.id, slot: 'hairColor' as const, thumb: () => swatchIcon(hairSwatch(c, `sw${c.id}`)) })),
      },
    ],
  },
  {
    id: 'makeup',
    icon: ICONS.makeup,
    view: 'face',
    color: '#ff4f7a',
    subs: [
      { id: 'lips', icon: () => ICONS.lips, opts: LIPS.map((s) => ({ id: s.id, slot: 'lips' as const, thumb: () => lipThumb(s) })) },
      { id: 'eyes', icon: () => ICONS.eye, opts: SHADOWS.map((s) => ({ id: s.id, slot: 'shadow' as const, thumb: () => shadowThumb(s) })) },
      {
        id: 'cheeks',
        icon: () => ICONS.cheek,
        opts: [
          ...BLUSHES.map((s) => ({ id: s.id, slot: 'blush' as const, thumb: () => blushThumb(s) })),
          ...FACE_ART.map((a) => ({ id: a.id, slot: 'faceArt' as const, thumb: () => swatchIcon(a.icon()) })),
        ],
      },
    ],
  },
  {
    id: 'nails',
    icon: ICONS.nails,
    view: 'hands',
    color: '#18c5c0',
    subs: [
      { id: 'polish', icon: () => polishIcon(NAIL_COLORS[0]), opts: NAIL_COLORS.map((s) => ({ id: s.id, slot: 'nailColor' as const, thumb: () => polishIcon(s) })) },
      {
        id: 'pattern',
        live: true,
        icon: () => patternIcon('np-hearts', NAIL_COLORS[2]),
        opts: NAIL_PATTERNS.map((p) => ({ id: p, slot: 'nailPattern' as const, thumb: (look: Look) => patternIcon(p, byId(NAIL_COLORS, look.nailColor)) })),
      },
    ],
  },
  {
    id: 'pets',
    icon: ICONS.pets,
    view: 'full',
    color: '#5fc96a',
    subs: [{ id: 'pets', icon: () => '', opts: PETS.map((p) => ({ id: p.id, slot: 'pet' as const, thumb: () => petSvg(p.id) })) }],
  },
];

/** Roughly where on the doll (0-1 across, 0-1 down) each slot sits, for sparkles. */
const SPARK_AT: Partial<Record<keyof Look, [number, number]>> = {
  top: [0.5, 0.45],
  bottom: [0.5, 0.66],
  dress: [0.5, 0.58],
  shoes: [0.5, 0.93],
  accHead: [0.5, 0.12],
  accNeck: [0.5, 0.4],
  accFace: [0.5, 0.27],
  accHandL: [0.28, 0.62],
  accHandR: [0.74, 0.52],
  accBack: [0.5, 0.42],
  hair: [0.5, 0.2],
  hairColor: [0.5, 0.2],
};

export function studioScreen(initial: Look): Screen {
  let look: Look = { ...initial };
  const doll = dollById(look.doll);
  const mem: Memory = {};
  let tab = 0;
  const subIndex = TABS.map(() => 0);
  let changes = 0;

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
          ${btn('reset', ICONS.reset, 'btn-small btn-blue', '', 'Start again')}
          ${btn('surprise', ICONS.surprise, 'btn-mid btn-purple', '', 'Surprise me')}
          ${btn('show', ICONS.show, 'btn-big btn-show pulse', '', 'Fashion show')}
        </div>
      </div>
      <div class="panel">
        <div class="tabs"></div>
        <div class="subtabs"></div>
        <div class="grid"></div>
      </div>
    </div>`);

  const $ = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
  const stage = $('.stage');
  const dollWrap = $('.doll-wrap');
  const dollZoom = $('.doll-zoom');
  const petWrap = $('.pet-wrap');
  const handWrap = $('.hand-wrap');
  const tabsEl = $('.tabs');
  const subsEl = $('.subtabs');
  const gridEl = $('.grid');

  const curTab = () => TABS[tab];
  const curSub = () => curTab().subs[subIndex[tab]];

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

  function drawTabs(): void {
    tabsEl.innerHTML = TABS.map(
      (t, i) => `<button type="button" class="tab ${i === tab ? 'on' : ''}" data-act="tab" data-arg="${i}" style="--tc:${t.color}" aria-label="${t.id}">${t.icon}</button>`,
    ).join('');
    const subs = curTab().subs;
    subsEl.style.setProperty('--tc', curTab().color);
    subsEl.classList.toggle('empty', subs.length < 2);
    subsEl.innerHTML =
      subs.length < 2
        ? ''
        : subs.map((s, i) => `<button type="button" class="subtab ${i === subIndex[tab] ? 'on' : ''}" data-act="sub" data-arg="${i}" aria-label="${s.id}">${s.icon(look)}</button>`).join('');
  }

  function drawGrid(animate = false): void {
    const sub = curSub();
    gridEl.style.setProperty('--tc', curTab().color);
    gridEl.classList.toggle('pop-in', animate);
    gridEl.innerHTML = sub.opts
      .map((o, i) => {
        const on = look[o.slot] === o.id;
        return `<button type="button" class="tile ${on ? 'on' : ''}" data-act="opt" data-arg="${i}" style="animation-delay:${i * 28}ms" aria-label="${o.id}" aria-pressed="${on}">${o.thumb(look)}<span class="tick">${ICONS.check}</span></button>`;
      })
      .join('');
  }

  function markTiles(): void {
    const sub = curSub();
    if (sub.live) return drawGrid();
    gridEl.querySelectorAll<HTMLElement>('.tile').forEach((el, i) => {
      const o = sub.opts[i];
      const on = !!o && look[o.slot] === o.id;
      el.classList.toggle('on', on);
      el.setAttribute('aria-pressed', String(on));
    });
  }

  /** Zooms the doll for hair and makeup, and swaps to the hand for nails. */
  function applyView(): void {
    const view = curTab().view;
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

  function react(slot?: keyof Look): void {
    dollWrap.classList.remove('react');
    void dollWrap.offsetWidth;
    dollWrap.classList.add('react');
    const view = curTab().view;
    const r = (view === 'hands' ? handWrap : dollWrap).getBoundingClientRect();
    if (view === 'face' || view === 'bust' || view === 'hands') {
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
      petWrap.classList.remove('react');
      void petWrap.offsetWidth;
      petWrap.classList.add('react');
    }
    drawHand();
    react(slot);
  }

  const onResize = () => applyView();

  drawDoll();
  drawPet();
  drawHand();
  drawTabs();
  drawGrid(true);

  return {
    root,
    actions: {
      tab: (arg) => {
        const i = Number(arg);
        if (i === tab) return;
        tab = i;
        audio.sfx('tab');
        drawTabs();
        drawGrid(true);
        applyView();
      },
      sub: (arg) => {
        const i = Number(arg);
        if (i === subIndex[tab]) return;
        subIndex[tab] = i;
        audio.sfx('tab');
        drawTabs();
        drawGrid(true);
      },
      opt: (arg, el) => {
        const o = curSub().opts[Number(arg)];
        if (!o) return;
        const res = choose(look, o.slot, o.id, mem);
        changes++;
        audio.sfx(res.on ? (o.slot === 'pet' ? 'pet' : 'select') : 'remove');
        setLook(res.look, o.slot);
        markTiles();
        const tile = curSub().live ? (gridEl.children[Number(arg)] as HTMLElement | undefined) : el;
        if (tile) {
          tile.classList.remove('bump');
          void tile.offsetWidth;
          tile.classList.add('bump');
        }
        if (curTab().id === 'hair') drawTabs();
      },
      surprise: () => {
        audio.sfx('magic');
        changes++;
        let next = randomLook(look.doll);
        if (sameLook(next, look)) next = randomLook(look.doll);
        setLook(next);
        drawPet();
        drawTabs();
        drawGrid();
        const r = dollWrap.getBoundingClientRect();
        fx.twinkle(r.left + r.width / 2, r.top + r.height / 2, 26, r.width * 0.4);
      },
      reset: () => {
        audio.sfx('whoosh');
        setLook({ ...doll.starter });
        drawPet();
        drawTabs();
        drawGrid();
      },
      show: () => {
        audio.sfx('sparkle');
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
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        // Tickle the doll (or her pet) and she hops.
        const target = curTab().view === 'full' && petWrap.getBoundingClientRect().left < x && petWrap.getBoundingClientRect().top < y ? petWrap : dollWrap;
        target.classList.remove('react');
        void target.offsetWidth;
        target.classList.add('react');
      }
    },
    hintTarget: () => (changes === 0 ? gridEl.querySelector('.tile:not(.on)') : root.querySelector('.btn-show')),
    onShow: () => {
      audio.music('studio');
      window.addEventListener('resize', onResize);
      requestAnimationFrame(applyView);
    },
    onHide: () => window.removeEventListener('resize', onResize),
  };
}
