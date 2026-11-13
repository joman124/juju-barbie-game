import { btn, muteAction, muteButton, routes, html, type Screen } from '../app';
import { audio } from '../audio';
import { ICONS } from '../art/icons';
import { dollSvg } from '../art/doll';
import { sparkle, star } from '../art/svg';
import { DOLLS } from '../dolls';
import { loadLooks } from '../state';

function twinkles(): string {
  const pts: Array<[number, number, number, string]> = [
    [8, 14, 26, '#fff'],
    [22, 70, 18, '#ffe98a'],
    [36, 10, 14, '#fff'],
    [64, 12, 20, '#ffe98a'],
    [80, 62, 24, '#fff'],
    [92, 20, 16, '#fff'],
    [50, 88, 16, '#ffe98a'],
    [12, 44, 12, '#fff'],
    [88, 86, 14, '#fff'],
  ];
  return pts
    .map(
      ([x, y, s, c], i) =>
        `<svg class="twinkle" style="left:${x}%;top:${y}%;width:${s * 2}px;height:${s * 2}px;animation-delay:${(-i * 0.37).toFixed(2)}s" viewBox="-20 -20 40 40">${i % 3 === 0 ? star(0, 0, 14, c) : sparkle(0, 0, 18, c)}</svg>`,
    )
    .join('');
}

export function titleScreen(): Screen {
  const cast = [DOLLS[1], DOLLS[2], DOLLS[5], DOLLS[3]];
  const hasLooks = loadLooks().length > 0;
  const root = html(`
    <div class="title">
      <div class="twinkles">${twinkles()}</div>
      <div class="title-cast">
        ${cast.map((d, i) => `<div class="cast cast-${i} idle">${dollSvg(d.starter)}</div>`).join('')}
      </div>
      <h1 class="logo"><span class="logo-top">Juju's</span><span class="logo-main">Fashion Show</span></h1>
      ${btn('play', ICONS.play, 'btn-play pulse', '', 'Play')}
      <div class="corner corner-tr">${muteButton()}</div>
      <div class="corner corner-bl">${btn('book', ICONS.book, `btn-mid btn-purple ${hasLooks ? '' : 'dim'}`, '', 'Lookbook')}</div>
    </div>`);
  return {
    root,
    actions: {
      play: () => {
        audio.sfx('sparkle');
        routes.pick();
      },
      book: () => {
        audio.sfx('tap');
        routes.lookbook();
      },
      mute: muteAction,
    },
    hintTarget: () => root.querySelector('.btn-play'),
    onShow: () => audio.music('studio'),
  };
}
