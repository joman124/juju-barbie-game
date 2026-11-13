import type { Look } from '../types';
import { btn, muteAction, muteButton, routes, html, type Screen } from '../app';
import { audio } from '../audio';
import { fx } from '../fx';
import { ICONS } from '../art/icons';
import { dollSvg } from '../art/doll';
import { SCENE_H, sceneLayers } from '../art/backdrops';
import { petById, petSvg } from '../art/pets';
import { nextUid } from '../art/svg';
import { dollById } from '../dolls';
import { lookPictureSvg } from '../photo';
import { saveLook } from '../state';

/** Where the doll's feet are in the scene (y out of 900) and how big she is. */
const FAR = { y: 522, scale: 0.36 };
const MID = { y: 690, scale: 0.68 };
const NEAR = { y: 868, scale: 1 };
/** After the photo she steps back so the buttons do not cover her feet. */
const REST = { y: 772, scale: 0.84 };

export function showScreen(look: Look, from: 'studio' | 'lookbook'): Screen {
  const doll = dollById(look.doll);
  const pet = petById(look.pet);
  const root = html(`
    <div class="show theme-${doll.theme}">
      <div class="scene">
        ${sceneLayers(doll.theme, nextUid())}
        <div class="scene-dim"></div>
        <div class="walker">
          <div class="walker-in">
            <div class="walker-glow"></div>
            <div class="walker-doll">${dollSvg(look)}</div>
            ${pet ? `<div class="walker-pet ${pet.floats ? 'floats' : ''}">${petSvg(look.pet)}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="flashes"></div>
      <div class="curtain curtain-l"></div>
      <div class="curtain curtain-r"></div>
      <div class="valance"></div>
      <div class="white-flash"></div>
      <div class="polaroid">${lookPictureSvg(look)}</div>
      <div class="corner corner-tl no-stage">${btn('back', ICONS.back, 'btn-small btn-ghost', '', 'Back')}</div>
      <div class="corner corner-tr no-stage">${muteButton()}</div>
      <div class="show-bar no-stage">
        ${btn('again', ICONS.again, 'btn-mid btn-blue', '', 'Watch again')}
        ${btn('restyle', ICONS.brush, 'btn-mid btn-purple', '', 'Change the look')}
        ${btn('book', ICONS.book, 'btn-mid btn-pink book-btn', '', 'Lookbook')}
        ${btn('home', ICONS.home, 'btn-mid btn-green', '', 'Pick another doll')}
      </div>
    </div>`);

  const $ = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
  const scene = $('.scene');
  const walker = $('.walker');
  const walkerIn = $('.walker-in');
  const svg = root.querySelector('.walker-doll svg') as SVGElement;
  const flashes = $('.flashes');
  const polaroid = $('.polaroid');
  const bookBtn = $('.book-btn');

  let alive = true;
  let ended = false;
  let flashTimer = 0;
  let moving: Animation | undefined;
  let at = FAR;
  const onResize = () => {
    walker.style.transform = place(at);
  };

  const sleep = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      window.setTimeout(() => (alive ? resolve() : reject(new Error('left'))), ms);
    });

  const place = (p: { y: number; scale: number }) => {
    const sh = scene.clientHeight;
    return `translate(-50%, ${(((p.y - NEAR.y) / SCENE_H) * sh).toFixed(1)}px) scale(${p.scale})`;
  };

  async function walkTo(fromP: { y: number; scale: number }, toP: { y: number; scale: number }, ms: number): Promise<void> {
    setPose('walk');
    at = toP;
    moving = walker.animate([{ transform: place(fromP) }, { transform: place(toP) }], { duration: ms, easing: 'linear', fill: 'forwards' });
    await sleep(ms);
    walker.style.transform = place(toP);
    moving.cancel();
    setPose('');
  }

  function setPose(pose: string): void {
    svg.setAttribute('class', `doll-svg ${pose || 'idle'}`);
    walkerIn.dataset.pose = pose;
  }

  function flash(): void {
    const el = document.createElement('div');
    el.className = 'flash';
    const left = Math.random() < 0.5;
    el.style.left = `${left ? 2 + Math.random() * 26 : 72 + Math.random() * 26}%`;
    el.style.top = `${52 + Math.random() * 40}%`;
    flashes.appendChild(el);
    window.setTimeout(() => el.remove(), 500);
  }
  function startFlashes(every: number): void {
    window.clearInterval(flashTimer);
    flashTimer = window.setInterval(() => {
      if (Math.random() < 0.7) flash();
    }, every);
  }

  function hop(cls: string, ms: number): void {
    walkerIn.classList.remove('hop', 'twirl');
    void walkerIn.offsetWidth;
    walkerIn.classList.add(cls);
    window.setTimeout(() => walkerIn.classList.remove(cls), ms);
  }

  async function run(): Promise<void> {
    walker.style.transform = place(FAR);
    setPose('');
    audio.music('none');
    await sleep(350);
    audio.sfx('drumroll');
    await sleep(900);
    audio.sfx('fanfare');
    audio.sfx('whoosh');
    root.classList.add('open');
    await sleep(700);
    audio.music('show');
    startFlashes(420);
    await sleep(500);

    await walkTo(FAR, MID, 3000);
    setPose('pose-present');
    hop('hop', 600);
    audio.sfx('sparkle');
    audio.sfx('applause');
    for (let i = 0; i < 5; i++) flash();
    await sleep(1700);

    await walkTo(MID, NEAR, 2600);
    setPose('pose-present');
    hop('twirl', 1100);
    audio.sfx('magic');
    fx.confetti(120);
    for (let i = 0; i < 6; i++) flash();
    await sleep(1300);

    setPose('pose-wave');
    hop('hop', 600);
    audio.sfx('applause');
    audio.sfx('cheer');
    startFlashes(260);
    await sleep(1500);

    // The photo: flash, then a snapshot flies into the lookbook.
    audio.sfx('shutter');
    root.classList.add('snap');
    saveLook(look);
    await sleep(260);
    root.classList.remove('snap');
    polaroid.classList.add('on');
    await sleep(1250);
    const pr = polaroid.getBoundingClientRect();
    const br = bookBtn.getBoundingClientRect();
    root.classList.add('ended');
    ended = true;
    at = REST;
    moving = walker.animate([{ transform: place(NEAR) }, { transform: place(REST) }], { duration: 600, easing: 'ease-in-out', fill: 'forwards' });
    polaroid.animate(
      [
        { transform: 'translate(-50%, -50%) rotate(-4deg) scale(1)', opacity: 1 },
        {
          transform: `translate(calc(-50% + ${br.left + br.width / 2 - (pr.left + pr.width / 2)}px), calc(-50% + ${br.top + br.height / 2 - (pr.top + pr.height / 2)}px)) rotate(12deg) scale(0.12)`,
          opacity: 0.4,
        },
      ],
      { duration: 650, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' },
    );
    await sleep(640);
    polaroid.classList.remove('on');
    bookBtn.classList.add('bump');
    audio.sfx('select');
    fx.twinkle(br.left + br.width / 2, br.top + br.height / 2, 14, br.width / 2);
    startFlashes(700);
  }

  const leave = () => {
    alive = false;
    window.clearInterval(flashTimer);
    moving?.cancel();
    fx.clear();
  };

  return {
    root,
    actions: {
      again: () => {
        audio.sfx('tap');
        routes.show(look, from);
      },
      restyle: () => {
        audio.sfx('tap');
        routes.studio(look);
      },
      book: () => {
        audio.sfx('tap');
        routes.lookbook();
      },
      home: () => {
        audio.sfx('tap');
        routes.pick();
      },
      back: () => {
        audio.sfx('tap');
        if (from === 'lookbook') routes.lookbook();
        else routes.studio(look);
      },
      mute: muteAction,
    },
    onStagePress: (x, y) => {
      fx.burst(x, y, 8);
      audio.pop();
    },
    hintTarget: () => (ended ? root.querySelector('.show-bar .btn') : null),
    onShow: () => {
      window.addEventListener('resize', onResize);
      run().catch(() => undefined);
    },
    onHide: () => {
      window.removeEventListener('resize', onResize);
      leave();
    },
  };
}
