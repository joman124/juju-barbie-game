import { btn, muteAction, muteButton, routes, html, type Screen } from '../app';
import { audio } from '../audio';
import { fx } from '../fx';
import { ICONS } from '../art/icons';
import { dollSvg } from '../art/doll';
import { petSvg } from '../art/pets';
import { DOLLS } from '../dolls';
import { hasFlag } from '../state';

export function pickScreen(): Screen {
  const root = html(`
    <div class="pick">
      <div class="pick-grid">
        ${DOLLS.map(
          (d, i) => `
          <button type="button" class="card idle" data-act="pick" data-arg="${d.id}" aria-label="${d.name}" style="--c1:${d.color};--c2:${d.color2};animation-delay:${i * 70}ms">
            <span class="card-glow"></span>
            <span class="card-doll">${dollSvg(d.starter)}</span>
            <span class="card-pet">${petSvg(d.starter.pet)}</span>
            <span class="card-name">${d.name}</span>
          </button>`,
        ).join('')}
      </div>
      <div class="corner corner-tl">${btn('back', ICONS.back, 'btn-small btn-ghost', '', 'Back')}</div>
      <div class="corner corner-tr">${muteButton()}</div>
    </div>`);
  let picked = false;
  return {
    root,
    actions: {
      pick: (id, el) => {
        if (picked) return;
        picked = true;
        const r = el.getBoundingClientRect();
        audio.sfx('magic');
        fx.twinkle(r.left + r.width / 2, r.top + r.height / 2, 18, r.width / 2);
        el.classList.add('chosen');
        root.classList.add('has-chosen');
        const doll = DOLLS.find((d) => d.id === id)!;
        window.setTimeout(() => routes.studio({ ...doll.starter }), 620);
      },
      back: () => {
        audio.sfx('tap');
        routes.title();
      },
      mute: muteAction,
    },
    hintTarget: () => root.querySelector('.card'),
    // a brand-new player gets pointed in the right direction straight away
    hintDelay: () => (hasFlag('lesson') ? 6000 : 1800),
    onShow: () => audio.music('studio'),
  };
}
