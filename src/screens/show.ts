import type { Expression, Look, Theme } from '../types';
import { armHint, btn, muteAction, muteButton, routes, html, type Screen } from '../app';
import { audio } from '../audio';
import { fx } from '../fx';
import { ICONS } from '../art/icons';
import { dollBustSvg, dollSvg } from '../art/doll';
import { handSvg } from '../art/hand';
import { SCENE_H, sceneLayers } from '../art/backdrops';
import { petById, petSvg } from '../art/pets';
import { nextUid } from '../art/svg';
import { dollById } from '../dolls';
import { lookPictureSvg } from '../photo';
import { hasFlag, saveLook, setFlag } from '../state';

/** Where the doll's feet are in the scene (y out of 900) and how big she is. */
interface Spot {
  y: number;
  scale: number;
  /** How far the "camera" has pushed in: backdrop and crowd grow by different amounts for depth. */
  zoom: number;
}
const FAR: Spot = { y: 522, scale: 0.36, zoom: 0 };
const MID: Spot = { y: 690, scale: 0.68, zoom: 0.5 };
const NEAR: Spot = { y: 868, scale: 1, zoom: 1 };
/** After the photo she steps back so the buttons do not cover her feet. */
const REST: Spot = { y: 772, scale: 0.84, zoom: 0.7 };

type Pose = '' | 'walk' | 'pose-present' | 'pose-hip' | 'pose-cheer' | 'pose-wave';
type Move = 'twirl' | 'mv-jump' | 'mv-curtsy' | 'mv-float' | 'mv-shimmy';

/** Each doll has her own big move at the end of the runway. */
const SIGNATURE: Record<Theme, { pose: Pose; move: Move }> = {
  stadium: { pose: 'pose-cheer', move: 'mv-jump' },
  ocean: { pose: 'pose-present', move: 'twirl' },
  castle: { pose: 'pose-present', move: 'mv-curtsy' },
  forest: { pose: 'pose-present', move: 'twirl' },
  space: { pose: 'pose-present', move: 'mv-float' },
  concert: { pose: 'pose-cheer', move: 'mv-shimmy' },
};
const MOVE_MS: Record<Exclude<Move, 'twirl'>, number> = { 'mv-jump': 1100, 'mv-curtsy': 1300, 'mv-float': 1700, 'mv-shimmy': 1200 };
const ALL_MOVES: Array<{ pose: Pose; move: Move }> = Object.values(SIGNATURE);

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export function showScreen(look: Look, from: 'studio' | 'lookbook'): Screen {
  const doll = dollById(look.doll);
  const pet = petById(look.pet);
  const root = html(`
    <div class="show theme-${doll.theme}">
      <div class="scene">
        ${sceneLayers(doll.theme, nextUid())}
        <div class="scene-dim"></div>
        <div class="walker">
          <div class="walker-glow"></div>
          <div class="walker-in">
            <div class="walker-doll front">${dollSvg(look)}</div>
            <div class="walker-doll back">${dollSvg(look, '', { back: true })}</div>
          </div>
          ${pet ? `<div class="walker-pet ${pet.floats ? 'floats' : ''}">${petSvg(look.pet)}</div>` : ''}
        </div>
      </div>
      <div class="flashes"></div>
      <div class="tap-spot"></div>
      <div class="cam cam-face">${dollBustSvg(look)}<span class="cam-badge">${ICONS.camera}</span></div>
      <div class="cam cam-hand"><span class="cam-wave">${handSvg(doll.skin, look.nailColor, look.nailPattern)}</span><span class="cam-badge">${ICONS.camera}</span></div>
      <div class="curtain curtain-l"></div>
      <div class="curtain curtain-r"></div>
      <div class="valance"></div>
      <div class="white-flash"></div>
      <button type="button" class="polaroid no-stage" data-act="save" aria-label="Save this look">${lookPictureSvg(look)}</button>
      <div class="corner corner-tl no-stage">${btn('back', ICONS.back, 'btn-small btn-ghost', '', 'Back')}</div>
      <div class="corner corner-tr no-stage">${muteButton()}</div>
      <div class="show-bar no-stage">
        ${btn('save', ICONS.heart, 'btn-big btn-show pulse save-btn', '', 'Save to the lookbook')}
        ${btn('again', ICONS.again, 'btn-mid btn-blue', '', 'Watch again')}
        ${btn('restyle', ICONS.brush, 'btn-mid btn-purple', '', 'Change the look')}
        ${btn('home', ICONS.home, 'btn-mid btn-green', '', 'Pick another doll')}
      </div>
    </div>`);

  const $ = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
  const scene = $('.scene');
  const walker = $('.walker');
  const walkerIn = $('.walker-in');
  const svgs = Array.from(root.querySelectorAll('.walker-doll svg')) as SVGElement[];
  const flashes = $('.flashes');
  const polaroid = $('.polaroid');
  const saveBtn = $('.save-btn');
  const tapSpot = $('.tap-spot');
  const camFace = $('.cam-face');
  const camHand = $('.cam-hand');
  const backdrop = Array.from(root.querySelectorAll<HTMLElement>('.scene-back, .scene-lights'));
  const crowd = Array.from(root.querySelectorAll<HTMLElement>('.scene-crowd'));

  let alive = true;
  let ended = false;
  let saved = false;
  let busy = false;
  let tapped = hasFlag('tapped');
  let flashTimer = 0;
  let demoTimer = 0;
  let exTimer = 0;
  let moving: Animation | undefined;
  let at = FAR;
  const onResize = () => {
    walker.style.transform = place(at);
  };

  const sleep = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      window.setTimeout(() => (alive ? resolve() : reject(new Error('left'))), ms);
    });

  const place = (p: Spot) => {
    const sh = scene.clientHeight;
    return `translate(-50%, ${(((p.y - NEAR.y) / SCENE_H) * sh).toFixed(1)}px) scale(${p.scale})`;
  };

  /** Pushes the view in as she comes closer; the crowd in front grows more than the backdrop behind. */
  function zoom(fromZ: number, toZ: number, ms: number): void {
    const opts: KeyframeAnimationOptions = { duration: ms, easing: 'ease-in-out', fill: 'forwards' };
    for (const el of backdrop) el.animate({ transform: [`scale(${1 + fromZ * 0.05})`, `scale(${1 + toZ * 0.05})`] }, opts);
    for (const el of crowd) el.animate({ scale: [String(1 + fromZ * 0.12), String(1 + toZ * 0.12)] }, opts);
  }

  function setPose(pose: Pose): void {
    for (const svg of svgs) svg.setAttribute('class', `doll-svg ${pose || 'idle'}`);
    walker.dataset.pose = pose;
  }

  function feel(ex: Expression, ms = 0): void {
    window.clearTimeout(exTimer);
    walker.dataset.ex = ex;
    if (ms) exTimer = window.setTimeout(() => (walker.dataset.ex = 'grin'), ms);
  }

  async function walkTo(fromP: Spot, toP: Spot, ms: number): Promise<void> {
    setPose('walk');
    feel('smile');
    at = toP;
    zoom(fromP.zoom, toP.zoom, ms);
    moving = walker.animate([{ transform: place(fromP) }, { transform: place(toP) }], { duration: ms, easing: 'linear', fill: 'forwards' });
    await sleep(ms);
    walker.style.transform = place(toP);
    moving.cancel();
    setPose('');
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

  function hop(): void {
    walkerIn.classList.remove('hop');
    void walkerIn.offsetWidth;
    walkerIn.classList.add('hop');
    window.setTimeout(() => walkerIn.classList.remove('hop'), 600);
  }

  /** A real turn: she narrows to an edge, we swap to her back view, and round again. */
  async function twirl(turns = 2): Promise<void> {
    const edge = (fromX: number, toX: number, lift: number) =>
      walkerIn.animate([{ transform: `translateY(${-lift}%) scaleX(${fromX})` }, { transform: `translateY(${-lift}%) scaleX(${toX})` }], { duration: 130, easing: 'ease-in-out', fill: 'forwards' });
    for (let i = 0; i < turns; i++) {
      edge(1, 0.06, 2);
      await sleep(130);
      walkerIn.classList.add('show-back');
      edge(0.06, 1, 4);
      await sleep(190);
      edge(1, 0.06, 4);
      await sleep(130);
      walkerIn.classList.remove('show-back');
      edge(0.06, 1, 2);
      await sleep(150);
    }
    walkerIn.getAnimations().forEach((a) => a.cancel());
  }

  async function doMove(move: Move): Promise<void> {
    if (move === 'twirl') return twirl();
    walkerIn.classList.add(move);
    await sleep(MOVE_MS[move]);
    walkerIn.classList.remove(move);
  }

  /** The close-up camera: a round window that pops up so the audience can see the details. */
  async function closeUp(cam: HTMLElement, ms: number): Promise<void> {
    cam.classList.add('on');
    audio.sfx('shutter');
    const r = cam.getBoundingClientRect();
    fx.twinkle(r.left + r.width / 2, r.top + r.height / 2, 12, r.width / 2);
    await sleep(ms);
    cam.classList.remove('on');
  }

  function mouth(): { x: number; y: number } {
    const r = walker.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.33 };
  }

  function blowKiss(): void {
    feel('kiss', 1100);
    const m = mouth();
    fx.burst(m.x, m.y, 7, ['heart']);
    audio.sfx('sparkle');
  }

  async function run(): Promise<void> {
    const mid = pick<Pose>(['pose-present', 'pose-hip', 'pose-cheer']);
    // usually her own signature move, sometimes a surprise
    const big = Math.random() < 0.7 ? SIGNATURE[doll.theme] : pick(ALL_MOVES);
    const finale = pick(['wave', 'kiss', 'cheer']);

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

    // first stop: a pose, and the camera goes in on her face
    await walkTo(FAR, MID, 3200);
    setPose(mid);
    feel('grin');
    hop();
    audio.sfx('applause');
    for (let i = 0; i < 5; i++) flash();
    await sleep(500);
    camFace.dataset.ex = 'grin';
    window.setTimeout(() => (camFace.dataset.ex = 'wink'), 700);
    window.setTimeout(() => (camFace.dataset.ex = 'grin'), 1500);
    await closeUp(camFace, 2100);

    // end of the runway: her big move
    await walkTo(MID, NEAR, 2800);
    setPose(big.pose);
    feel('grin');
    audio.sfx('magic');
    fx.confetti(120);
    for (let i = 0; i < 6; i++) flash();
    await doMove(big.move);
    await sleep(250);

    // show off the nails, if she has had them done
    if (look.nailColor) {
      setPose('pose-wave');
      await closeUp(camHand, 2000);
    }

    // the finale
    if (finale === 'kiss') {
      setPose('pose-hip');
      hop();
      blowKiss();
    } else {
      setPose(finale === 'cheer' ? 'pose-cheer' : 'pose-wave');
      feel('grin');
      hop();
    }
    audio.sfx('applause');
    audio.sfx('cheer');
    startFlashes(260);
    await sleep(1600);

    // the photo
    audio.sfx('shutter');
    root.classList.add('snap');
    await sleep(260);
    root.classList.remove('snap');
    polaroid.classList.add('on');
    await sleep(1150);
    polaroid.classList.add('rest');
    root.classList.add('ended');
    ended = true;
    at = REST;
    zoom(NEAR.zoom, REST.zoom, 600);
    moving = walker.animate([{ transform: place(NEAR) }, { transform: place(REST) }], { duration: 600, easing: 'ease-in-out', fill: 'forwards' });
    setPose('pose-wave');
    feel('grin');
    startFlashes(700);
    armHint();
  }

  /** Puts the photo in the lookbook. The heart then turns into the lookbook button. */
  function save(): void {
    if (saved || !ended) return;
    saved = true;
    saveLook(look);
    audio.sfx('select');
    const pr = polaroid.getBoundingClientRect();
    const br = saveBtn.getBoundingClientRect();
    const dx = br.left + br.width / 2 - (pr.left + pr.width / 2);
    const dy = br.top + br.height / 2 - (pr.top + pr.height / 2);
    polaroid.animate([{ translate: '0 0', scale: '1', opacity: 1 }, { translate: `${dx}px ${dy}px`, scale: '0.15', opacity: 0.5 }], {
      duration: 600,
      easing: 'cubic-bezier(.5,0,.8,.4)',
      fill: 'forwards',
    });
    window.setTimeout(() => {
      polaroid.classList.remove('on');
      saveBtn.innerHTML = ICONS.book;
      saveBtn.dataset.act = 'book';
      saveBtn.setAttribute('aria-label', 'Lookbook');
      saveBtn.classList.remove('pulse', 'btn-show');
      saveBtn.classList.add('btn-pink', 'bump');
      audio.sfx('sparkle');
      fx.twinkle(br.left + br.width / 2, br.top + br.height / 2, 16, br.width / 2);
      fx.burst(br.left + br.width / 2, br.top, 6, ['heart']);
    }, 590);
  }

  /** After the show, tapping her makes her do another pose or trick. */
  async function trick(): Promise<void> {
    if (busy) return;
    busy = true;
    try {
      const what = pick(['present', 'hip', 'cheer', 'wave', 'kiss', 'twirl', 'jump']);
      audio.sfx('pet');
      if (what === 'twirl') {
        setPose('pose-present');
        await twirl(1);
      } else if (what === 'jump') {
        setPose('pose-cheer');
        await doMove('mv-jump');
      } else if (what === 'kiss') {
        setPose('pose-hip');
        hop();
        blowKiss();
        await sleep(500);
      } else {
        setPose(`pose-${what}` as Pose);
        feel(pick<Expression>(['grin', 'wink']), 900);
        hop();
        await sleep(500);
      }
    } finally {
      busy = false;
    }
  }

  const leave = () => {
    alive = false;
    window.clearInterval(flashTimer);
    window.clearInterval(demoTimer);
    window.clearTimeout(exTimer);
    moving?.cancel();
    fx.clear();
  };

  return {
    root,
    actions: {
      save,
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
      if (!tapped) {
        tapped = true;
        setFlag('tapped');
        window.clearInterval(demoTimer);
      }
      fx.burst(x, y, 8);
      audio.pop();
      const r = walker.getBoundingClientRect();
      if (ended && x > r.left && x < r.right && y > r.top && y < r.bottom) trick().catch(() => undefined);
    },
    // First show: the hand taps the crowd to show that tapping throws hearts. At the end it points at the heart.
    hintTarget: () => (ended ? (saved ? null : saveBtn) : tapped ? null : tapSpot),
    hintDelay: () => (ended ? 2200 : 3200),
    onShow: () => {
      window.addEventListener('resize', onResize);
      if (!tapped) {
        demoTimer = window.setInterval(() => {
          const r = tapSpot.getBoundingClientRect();
          if (!tapped && !ended && root.classList.contains('open') && document.querySelector('.hint-hand.on')) fx.burst(r.left + r.width / 2, r.top + r.height / 2, 5);
        }, 1000);
      }
      run().catch(() => undefined);
    },
    onHide: () => {
      window.removeEventListener('resize', onResize);
      leave();
    },
  };
}
