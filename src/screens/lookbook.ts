import type { SavedLook } from '../types';
import { btn, muteAction, muteButton, routes, html, type Screen } from '../app';
import { audio } from '../audio';
import { ICONS } from '../art/icons';
import { dollSvg } from '../art/doll';
import { petSvg } from '../art/pets';
import { dollById } from '../dolls';
import { lookPictureSvg, lookPng } from '../photo';
import { deleteLook, loadLooks } from '../state';

const HOLD_MS = 3000;

function card(s: SavedLook, i: number): string {
  const d = dollById(s.look.doll);
  return `<button type="button" class="look-card" data-act="open" data-arg="${s.id}" aria-label="Saved look ${i + 1}" style="--c1:${d.color};--c2:${d.color2}">
    <span class="look-doll">${dollSvg(s.look)}</span>
    <span class="look-pet">${petSvg(s.look.pet)}</span>
  </button>`;
}

export function lookbookScreen(): Screen {
  let looks = loadLooks();
  let open: SavedLook | undefined;
  let png: Promise<Blob> | undefined;
  let holdTimer = 0;

  const root = html(`
    <div class="lookbook">
      <div class="book-head">
        <div class="book-title">${ICONS.book}</div>
      </div>
      <div class="book-grid scrolls"></div>
      <div class="book-empty">
        <div class="book-empty-art">${ICONS.camera}</div>
        ${btn('play', ICONS.play, 'btn-play pulse', '', 'Play')}
      </div>
      <div class="corner corner-tl">${btn('back', ICONS.back, 'btn-small btn-ghost', '', 'Back')}</div>
      <div class="corner corner-tr">${muteButton()}</div>
      <div class="detail">
        <div class="detail-card">
          <div class="detail-pic"></div>
          <div class="detail-bar">
            ${btn('restyle', ICONS.brush, 'btn-mid btn-purple', '', 'Change this look')}
            ${btn('replay', ICONS.show, 'btn-big btn-show pulse', '', 'Fashion show')}
            ${btn('close', ICONS.close, 'btn-mid btn-blue', '', 'Close')}
          </div>
          <button type="button" class="grown-lock" aria-label="Grown-ups: press and hold">
            <span class="lock-ring"></span>${ICONS.lock}
          </button>
        </div>
        <div class="grown">
          <div class="grown-box">
            <p class="grown-title">For grown-ups</p>
            <button type="button" class="grown-btn" data-act="save">Save picture</button>
            <button type="button" class="grown-btn danger" data-act="delete">Delete this look</button>
            <button type="button" class="grown-btn plain" data-act="grownClose">Done</button>
            <p class="grown-note"></p>
          </div>
        </div>
      </div>
    </div>`);

  const $ = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
  const grid = $('.book-grid');
  const detail = $('.detail');
  const pic = $('.detail-pic');
  const lock = $('.grown-lock');
  const grown = $('.grown');
  const note = $('.grown-note');

  function draw(): void {
    root.classList.toggle('is-empty', looks.length === 0);
    grid.innerHTML = looks.map(card).join('');
  }

  function closeDetail(): void {
    open = undefined;
    png = undefined;
    detail.classList.remove('on');
    grown.classList.remove('on');
  }

  // Press and hold for three seconds: easy for an adult, unlikely for a small child.
  const cancelHold = () => {
    window.clearTimeout(holdTimer);
    lock.classList.remove('holding');
  };
  lock.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    audio.unlock();
    lock.classList.add('holding');
    holdTimer = window.setTimeout(() => {
      lock.classList.remove('holding');
      if (!open) return;
      note.textContent = '';
      grown.classList.add('on');
      png = lookPng(open.look);
      png.catch(() => undefined);
    }, HOLD_MS);
  });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) lock.addEventListener(ev, cancelHold);

  async function savePicture(): Promise<void> {
    if (!open || !png) return;
    try {
      const blob = await png;
      const file = new File([blob], 'fashion-show-look.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file] });
        note.textContent = '';
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      note.textContent = 'Picture saved to your downloads.';
    } catch (err) {
      if ((err as Error).name !== 'AbortError') note.textContent = 'Sorry, the picture could not be saved.';
    }
  }

  draw();

  return {
    root,
    actions: {
      open: (id) => {
        const s = looks.find((l) => l.id === id);
        if (!s) return;
        open = s;
        audio.sfx('select');
        pic.innerHTML = lookPictureSvg(s.look, { audience: true });
        detail.classList.add('on');
      },
      close: () => {
        audio.sfx('tap');
        closeDetail();
      },
      restyle: () => {
        if (!open) return;
        audio.sfx('tap');
        routes.studio(open.look);
      },
      replay: () => {
        if (!open) return;
        audio.sfx('sparkle');
        routes.show(open.look, 'lookbook');
      },
      save: () => void savePicture(),
      delete: () => {
        if (!open) return;
        deleteLook(open.id);
        looks = loadLooks();
        closeDetail();
        draw();
      },
      grownClose: () => grown.classList.remove('on'),
      play: () => {
        audio.sfx('sparkle');
        routes.pick();
      },
      back: () => {
        audio.sfx('tap');
        routes.title();
      },
      mute: muteAction,
    },
    hintTarget: () => (looks.length === 0 ? root.querySelector('.book-empty .btn-play') : null),
    onShow: () => audio.music('studio'),
    onHide: cancelHold,
  };
}
