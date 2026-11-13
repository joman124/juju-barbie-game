// Dev-only contact sheet: every doll and every item, for checking the art.
import { DOLLS } from './dolls';
import { dollSvg, headThumb } from './art/doll';
import { WEAR_ITEMS, itemThumb } from './art/catalog';
import { HAIR_STYLES, HAIR_COLORS } from './art/hair';
import { PETS, petSvg } from './art/pets';

const out = document.getElementById('out')!;
const q = new URLSearchParams(location.search);
const what = q.get('show') ?? 'dolls';
let html = '<div class="row">';
if (what === 'dolls') {
  for (const d of DOLLS) html += `<div class="d">${dollSvg(d.starter)}</div>`;
} else if (what === 'hair') {
  for (const s of HAIR_STYLES) html += `<div class="d">${dollSvg({ ...DOLLS[0].starter, accHead: undefined, hair: s.id, hairColor: HAIR_COLORS[HAIR_STYLES.indexOf(s) % 8].id })}</div>`;
  for (const s of HAIR_STYLES) html += `<div class="t">${headThumb(DOLLS[2].starter, s.id)}</div>`;
} else if (what === 'items') {
  for (const it of WEAR_ITEMS) html += `<div class="t"><span>${it.id}</span>${itemThumb(it)}</div>`;
  for (const p of PETS) html += `<div class="t">${petSvg(p.id)}</div>`;
} else if (what === 'mix') {
  const ids = (k: string) => WEAR_ITEMS.filter((i) => i.slot === k).map((i) => i.id);
  const tops = ids('top'), bots = ids('bottom'), shoes = ids('shoes'), dresses = ids('dress');
  const heads = ids('accHead'), necks = ids('accNeck'), faces = ids('accFace'), hl = ids('accHandL'), hr = ids('accHandR'), bk = ids('accBack');
  for (let i = 0; i < 16; i++) {
    const d = DOLLS[i % 6];
    const dress = i >= 8;
    html += `<div class="d">${dollSvg({ doll: d.id, hair: HAIR_STYLES[i % 8].id, hairColor: HAIR_COLORS[(i * 3) % 8].id,
      top: dress ? undefined : tops[i % 8], bottom: dress ? undefined : bots[i % 8], dress: dress ? dresses[i % 8] : undefined,
      shoes: shoes[i % 8], accHead: heads[i % 8], accNeck: necks[i % 4], accFace: i % 2 ? faces[(i >> 1) % 4] : undefined,
      accHandL: hl[i % 3], accHandR: hr[i % 2], accBack: i % 4 === 0 ? undefined : bk[i % 3],
      lips: 'lip-red', shadow: 'sh-purple', blush: 'bl-pink', faceArt: i % 2 ? 'fa-stars' : 'fa-hearts', nailColor: 'n-red' })}</div>`;
  }
}
out.innerHTML = html + '</div>';
