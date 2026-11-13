import type { Look } from './types';
import { audio } from './audio';
import { fx } from './fx';
import { ICONS } from './art/icons';

/**
 * App shell: one screen at a time, plus touch handling tuned for small hands.
 *
 * Buttons are any element with `data-act="name"`. A tap counts when a finger
 * goes down and comes up on the same button, even if it slid a little, so
 * wobbly taps still work. Only one finger is tracked at a time and very large
 * contacts (a resting palm) are ignored.
 */

export type Action = (arg: string, el: HTMLElement, ev: PointerEvent) => void;

export interface Screen {
  root: HTMLElement;
  actions: Record<string, Action>;
  /** Called for a finger landing anywhere that is not a button. */
  onStagePress?: (x: number, y: number) => void;
  /** Element the idle hint hand should point at. */
  hintTarget?: () => Element | null;
  onShow?: () => void;
  onHide?: () => void;
}

export const routes = {
  title: () => {},
  pick: () => {},
  studio: (_look: Look) => {},
  show: (_look: Look, _from: 'studio' | 'lookbook') => {},
  lookbook: () => {},
};

let appEl: HTMLElement;
let current: Screen | undefined;
let hintEl: HTMLElement;
let hintTimer = 0;
let hintTrack = 0;

const HINT_DELAY = 6000;
const PALM_SIZE = 70;
const TAP_SLOP = 44;

interface Press {
  id: number;
  target: HTMLElement | null;
  x: number;
  y: number;
}
let press: Press | undefined;
const lastFire = new WeakMap<Element, number>();

export function html(markup: string): HTMLElement {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild as HTMLElement;
}

export function go(screen: Screen): void {
  const prev = current;
  if (prev) {
    prev.onHide?.();
    const old = prev.root;
    old.classList.add('leaving');
    window.setTimeout(() => old.remove(), 320);
  }
  current = screen;
  press = undefined;
  screen.root.classList.add('screen', 'entering');
  appEl.insertBefore(screen.root, appEl.firstChild);
  requestAnimationFrame(() => requestAnimationFrame(() => screen.root.classList.remove('entering')));
  screen.onShow?.();
  armHint();
}

function hideHint(): void {
  hintEl.classList.remove('on');
  window.clearInterval(hintTrack);
}

/** After a few idle seconds, a bouncing hand points at the next thing to tap. */
export function armHint(delay = HINT_DELAY): void {
  window.clearTimeout(hintTimer);
  hideHint();
  hintTimer = window.setTimeout(() => {
    const place = () => {
      const target = current?.hintTarget?.();
      if (!target || !document.body.contains(target)) return hideHint();
      const r = target.getBoundingClientRect();
      hintEl.style.left = `${r.left + r.width * 0.62}px`;
      hintEl.style.top = `${r.top + r.height * 0.6}px`;
      hintEl.classList.add('on');
    };
    place();
    hintTrack = window.setInterval(place, 500);
  }, delay);
}

function onDown(ev: PointerEvent): void {
  audio.unlock();
  armHint();
  if (!current) return;
  if (ev.pointerType === 'touch' && (ev.width > PALM_SIZE || ev.height > PALM_SIZE)) return;
  const el = ev.target instanceof Element ? (ev.target.closest('[data-act]') as HTMLElement | null) : null;
  if (!el || !current.root.contains(el)) {
    if (ev.target instanceof Element && ev.target.closest('.no-stage')) return;
    // Every touch gets a little sparkle and a note, even when it misses a button.
    if (current.onStagePress) current.onStagePress(ev.clientX, ev.clientY);
    else {
      fx.twinkle(ev.clientX, ev.clientY, 6, 24);
      audio.pop();
    }
    return;
  }
  if (press) return; // a second finger while one is already down
  press = { id: ev.pointerId, target: el, x: ev.clientX, y: ev.clientY };
  el.classList.add('pressed');
}

function onUp(ev: PointerEvent): void {
  if (!press || press.id !== ev.pointerId) return;
  const p = press;
  press = undefined;
  const el = p.target;
  if (!el) return;
  el.classList.remove('pressed');
  if (!current || !current.root.contains(el)) return;
  const r = el.getBoundingClientRect();
  const inside = ev.clientX >= r.left - 12 && ev.clientX <= r.right + 12 && ev.clientY >= r.top - 12 && ev.clientY <= r.bottom + 12;
  const moved = Math.hypot(ev.clientX - p.x, ev.clientY - p.y);
  const scrolled = !!el.closest('.scrolls') && moved > 14;
  if ((!inside && moved > TAP_SLOP) || scrolled) return;
  const now = performance.now();
  if (now - (lastFire.get(el) ?? 0) < 260) return;
  lastFire.set(el, now);
  const act = current.actions[el.dataset.act ?? ''];
  if (act) act(el.dataset.arg ?? '', el, ev);
}

function onCancel(ev: PointerEvent): void {
  if (press && press.id === ev.pointerId) {
    press.target?.classList.remove('pressed');
    press = undefined;
  }
}

export function initApp(root: HTMLElement): void {
  appEl = root;
  hintEl = html(`<div class="hint-hand" aria-hidden="true">${ICONS.hand}</div>`);
  document.body.appendChild(hintEl);

  // Safari only lets sound start from certain touch events, so try on each of them.
  for (const type of ['pointerup', 'touchend', 'click']) document.addEventListener(type, () => audio.unlock(), { capture: true, passive: true });
  root.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);

  // Make it behave like an app, not a web page.
  const stop = (e: Event) => e.preventDefault();
  document.addEventListener('gesturestart', stop);
  document.addEventListener('gesturechange', stop);
  document.addEventListener('contextmenu', stop);
  document.addEventListener('dragstart', stop);
  document.addEventListener('selectstart', stop);
  document.addEventListener('dblclick', stop);
  document.addEventListener(
    'touchmove',
    (e) => {
      const scroller = e.target instanceof Element ? e.target.closest('.scrolls') : null;
      if (e.touches.length > 1 || !scroller) e.preventDefault();
    },
    { passive: false },
  );
  document.addEventListener('visibilitychange', () => audio.setActive(!document.hidden));
}

/** Round candy button markup. */
export function btn(act: string, icon: string, cls = '', arg = '', label = ''): string {
  return `<button type="button" class="btn ${cls}" data-act="${act}" data-arg="${arg}" aria-label="${label || act}">${icon}</button>`;
}

export function muteButton(): string {
  return btn('mute', audio.isMuted() ? ICONS.soundOff : ICONS.soundOn, 'btn-small btn-ghost mute-btn', '', 'Sound on or off');
}

export const muteAction: Action = (_arg, el) => {
  audio.setMuted(!audio.isMuted());
  el.innerHTML = audio.isMuted() ? ICONS.soundOff : ICONS.soundOn;
  audio.sfx('tap');
};

export const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
