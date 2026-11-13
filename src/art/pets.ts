import { darken, heart, lighten, RAINBOW, sparkle, star } from './svg';

export interface Pet {
  id: string;
  /** Inner SVG for a 200 x 200 box, standing on the bottom edge. */
  draw: () => string;
  /** Floats instead of hopping along the ground. */
  floats?: boolean;
}

export const PET_VIEWBOX = '0 -24 200 224';

interface Critter {
  body: string;
  belly: string;
  ears: 'cat' | 'dog' | 'bunny' | 'round' | 'horse' | 'none';
  earInner?: string;
  tail?: 'cat' | 'pom' | 'dog' | 'none';
  cheeks?: string;
  nose?: string;
  extra?: string;
  behind?: string;
  eyePatch?: string;
}

function eyes(patch?: string): string {
  const e = (cx: number) =>
    (patch ? `<ellipse cx="${cx}" cy="86" rx="15" ry="18" fill="${patch}" transform="rotate(${cx < 100 ? 18 : -18} ${cx} 86)"/>` : '') +
    `<ellipse cx="${cx}" cy="86" rx="8.5" ry="10.5" fill="#2a1a2e"/><circle cx="${cx - 3}" cy="82" r="3.4" fill="#fff"/><circle cx="${cx + 3}" cy="90" r="1.6" fill="#fff"/>`;
  return `<g class="pet-blink">${e(78)}${e(122)}</g>`;
}

function critter(c: Critter): string {
  const dark = darken(c.body, 0.14);
  let ears = '';
  switch (c.ears) {
    case 'cat':
      ears = `<path d="M54 62 L52 14 L92 40 Z" fill="${c.body}" stroke="${c.body}" stroke-width="8" stroke-linejoin="round"/><path d="M62 50 L61 28 L80 42 Z" fill="${c.earInner}"/>
        <path d="M146 62 L148 14 L108 40 Z" fill="${c.body}" stroke="${c.body}" stroke-width="8" stroke-linejoin="round"/><path d="M138 50 L139 28 L120 42 Z" fill="${c.earInner}"/>`;
      break;
    case 'dog':
      ears = `<ellipse cx="50" cy="78" rx="17" ry="34" fill="${c.earInner}" transform="rotate(14 50 78)"/><ellipse cx="150" cy="78" rx="17" ry="34" fill="${c.earInner}" transform="rotate(-14 150 78)"/>`;
      break;
    case 'bunny':
      ears = `<ellipse cx="76" cy="22" rx="15" ry="38" fill="${c.body}" transform="rotate(-8 76 22)"/><ellipse cx="76" cy="24" rx="7" ry="26" fill="${c.earInner}" transform="rotate(-8 76 24)"/>
        <ellipse cx="124" cy="22" rx="15" ry="38" fill="${c.body}" transform="rotate(8 124 22)"/><ellipse cx="124" cy="24" rx="7" ry="26" fill="${c.earInner}" transform="rotate(8 124 24)"/>`;
      break;
    case 'round':
      ears = `<circle cx="58" cy="40" r="19" fill="${c.earInner}"/><circle cx="142" cy="40" r="19" fill="${c.earInner}"/>`;
      break;
    case 'horse':
      ears = `<path d="M62 52 L60 16 L86 38 Z" fill="${c.body}" stroke="${c.body}" stroke-width="7" stroke-linejoin="round"/><path d="M138 52 L140 16 L114 38 Z" fill="${c.body}" stroke="${c.body}" stroke-width="7" stroke-linejoin="round"/>`;
      break;
    default:
      break;
  }
  let tail = '';
  if (c.tail === 'cat') tail = `<path d="M140 168 Q184 170 176 124 Q172 108 160 114" fill="none" stroke="${c.body}" stroke-width="14" stroke-linecap="round"/>`;
  if (c.tail === 'dog') tail = `<path d="M142 160 Q176 150 172 118" fill="none" stroke="${c.body}" stroke-width="13" stroke-linecap="round"/>`;
  if (c.tail === 'pom') tail = `<circle cx="150" cy="164" r="15" fill="#fff"/>`;
  return (
    (c.behind ?? '') +
    `<g class="pet-tail">${tail}</g>` +
    `<ellipse cx="100" cy="150" rx="44" ry="42" fill="${c.body}"/>
     <ellipse cx="100" cy="158" rx="27" ry="28" fill="${c.belly}"/>
     <ellipse cx="78" cy="186" rx="17" ry="11" fill="${c.body}" stroke="${dark}" stroke-width="2"/>
     <ellipse cx="122" cy="186" rx="17" ry="11" fill="${c.body}" stroke="${dark}" stroke-width="2"/>` +
    ears +
    `<ellipse cx="100" cy="82" rx="56" ry="50" fill="${c.body}"/>` +
    eyes(c.eyePatch) +
    `<ellipse cx="66" cy="102" rx="10" ry="6.5" fill="${c.cheeks ?? '#ff8fb0'}" opacity=".6"/><ellipse cx="134" cy="102" rx="10" ry="6.5" fill="${c.cheeks ?? '#ff8fb0'}" opacity=".6"/>
     <path d="M94 97 Q100 93 106 97 Q100 105 94 97 Z" fill="${c.nose ?? '#ff6f91'}"/>
     <path d="M100 103 Q100 111 91 111 M100 103 Q100 111 109 111" fill="none" stroke="#2a1a2e" stroke-width="2.6" stroke-linecap="round"/>` +
    (c.extra ?? '')
  );
}

export const PETS: Pet[] = [
  {
    id: 'pet-kitty',
    draw: () =>
      critter({
        body: '#ffb65c',
        belly: '#fff3dc',
        ears: 'cat',
        earInner: '#ff8fb0',
        tail: 'cat',
        extra:
          `<path d="M84 40 L88 56 M100 36 L100 54 M116 40 L112 56" stroke="#e98a2b" stroke-width="5" stroke-linecap="round"/>
           <path d="M52 96 L30 92 M52 104 L32 108 M148 96 L170 92 M148 104 L168 108" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
           <path d="M72 124 Q100 138 128 124" fill="none" stroke="#ff5fae" stroke-width="8" stroke-linecap="round"/><circle cx="100" cy="134" r="7" fill="#ffd84a"/>`,
      }),
  },
  {
    id: 'pet-puppy',
    draw: () =>
      critter({
        body: '#f6e3c5',
        belly: '#fffaf0',
        ears: 'dog',
        earInner: '#a8683d',
        tail: 'dog',
        nose: '#3d2a2e',
        eyePatch: undefined,
        extra:
          `<ellipse cx="124" cy="80" rx="20" ry="22" fill="#a8683d" opacity=".0"/>
           <path d="M96 112 Q100 126 104 112 Z" fill="#ff6f91" stroke="#ff6f91" stroke-width="4" stroke-linejoin="round"/>
           <path d="M72 124 Q100 138 128 124" fill="none" stroke="#18c5c0" stroke-width="8" stroke-linecap="round"/>` + star(100, 136, 7, '#ffd84a'),
      }),
  },
  {
    id: 'pet-bunny',
    draw: () =>
      critter({
        body: '#ffffff',
        belly: '#ffeef6',
        ears: 'bunny',
        earInner: '#ffb3d1',
        tail: 'pom',
        extra:
          `<path d="M96 110 L96 118 L100 118 L100 110 M100 110 L100 118 L104 118 L104 110" fill="#fff" stroke="#d9c8e6" stroke-width="1.5"/>
           <path d="M88 126 L100 132 L112 126 L112 140 L100 134 L88 140 Z" fill="#c59bff"/>`,
      }),
  },
  {
    id: 'pet-unicorn',
    draw: () =>
      critter({
        body: '#fff7fd',
        belly: '#ffe3f3',
        ears: 'horse',
        tail: 'none',
        nose: '#ff8ec7',
        behind: RAINBOW.slice(0, 5)
          .map((c, i) => `<circle cx="${46 - i * 2}" cy="${56 + i * 17}" r="15" fill="${c}"/>`)
          .join('') + `<path d="M140 150 Q190 150 180 186 Q168 176 160 186 Q156 170 144 176 Z" fill="#a57bff"/><path d="M146 156 Q178 158 174 178" fill="none" stroke="#4db8ff" stroke-width="6" stroke-linecap="round"/>`,
        extra:
          `<path d="M100 -2 L88 38 L112 38 Z" fill="#ffd84a" stroke="#f0a81c" stroke-width="2.5" stroke-linejoin="round"/>
           <path d="M94 26 L108 20 M96 14 L105 10" stroke="#f0a81c" stroke-width="2.5" stroke-linecap="round"/>` +
          `<circle cx="84" cy="42" r="13" fill="#ff5d73"/><circle cx="102" cy="40" r="11" fill="#ff9f43"/><circle cx="118" cy="44" r="9" fill="#ffd84a"/>` +
          sparkle(150, 60, 7, '#ffd84a'),
      }),
  },
  {
    id: 'pet-dragon',
    draw: () =>
      critter({
        body: '#7fdc8a',
        belly: '#fff3b8',
        ears: 'none',
        tail: 'none',
        nose: '#3fa85a',
        cheeks: '#ff9f6b',
        behind:
          `<path d="M64 140 Q14 96 10 130 Q22 132 26 146 Q40 140 46 156 Q56 150 66 160 Z" fill="#b98bff" stroke="#8f6bff" stroke-width="3" stroke-linejoin="round"/>
           <path d="M136 140 Q186 96 190 130 Q178 132 174 146 Q160 140 154 156 Q144 150 134 160 Z" fill="#b98bff" stroke="#8f6bff" stroke-width="3" stroke-linejoin="round"/>
           <path d="M140 170 Q186 186 184 150 L194 152 L186 138 L174 148 Q174 170 146 158 Z" fill="#7fdc8a"/>`,
        extra:
          `<path d="M70 44 L62 18 L84 34 Z M130 44 L138 18 L116 34 Z" fill="#fff3b8" stroke="#e8d26a" stroke-width="2" stroke-linejoin="round"/>
           <path d="M92 34 L100 20 L108 34 Z" fill="#b98bff"/>
           <path d="M84 132 Q100 126 116 132 M80 144 Q100 138 120 144" fill="none" stroke="#e8d26a" stroke-width="2.5" stroke-linecap="round"/>`,
      }),
  },
  {
    id: 'pet-panda',
    draw: () =>
      critter({
        body: '#ffffff',
        belly: '#ffffff',
        ears: 'round',
        earInner: '#2f2a3d',
        tail: 'none',
        nose: '#2f2a3d',
        eyePatch: '#2f2a3d',
        extra:
          `<ellipse cx="62" cy="150" rx="15" ry="24" fill="#2f2a3d" transform="rotate(16 62 150)"/><ellipse cx="138" cy="150" rx="15" ry="24" fill="#2f2a3d" transform="rotate(-16 138 150)"/>
           <ellipse cx="78" cy="186" rx="17" ry="11" fill="#2f2a3d"/><ellipse cx="122" cy="186" rx="17" ry="11" fill="#2f2a3d"/>` +
          heart(100, 150, 10, '#ff6fb1'),
      }),
  },
  {
    id: 'pet-alien',
    draw: () =>
      `<g class="pet-tail"><path d="M78 38 Q70 14 60 8 M122 38 Q130 14 140 8" fill="none" stroke="#5fd3a0" stroke-width="6" stroke-linecap="round"/>
       <circle cx="58" cy="8" r="9" fill="#ffd84a"/><circle cx="142" cy="8" r="9" fill="#ff8ec7"/></g>
       <ellipse cx="100" cy="152" rx="40" ry="38" fill="#7ae8b8"/>
       <ellipse cx="100" cy="160" rx="24" ry="24" fill="#c9fbe4"/>
       <ellipse cx="60" cy="150" rx="11" ry="20" fill="#7ae8b8" transform="rotate(24 60 150)"/><ellipse cx="140" cy="150" rx="11" ry="20" fill="#7ae8b8" transform="rotate(-24 140 150)"/>
       <ellipse cx="80" cy="186" rx="16" ry="10" fill="#5fd3a0"/><ellipse cx="120" cy="186" rx="16" ry="10" fill="#5fd3a0"/>
       <ellipse cx="100" cy="82" rx="60" ry="50" fill="#7ae8b8"/>
       <g class="pet-blink"><ellipse cx="74" cy="82" rx="15" ry="19" fill="#2a1a2e"/><circle cx="69" cy="75" r="5.5" fill="#fff"/><circle cx="79" cy="90" r="2.5" fill="#fff"/>
       <ellipse cx="126" cy="82" rx="15" ry="19" fill="#2a1a2e"/><circle cx="121" cy="75" r="5.5" fill="#fff"/><circle cx="131" cy="90" r="2.5" fill="#fff"/></g>
       <ellipse cx="56" cy="104" rx="9" ry="6" fill="#ff8fb0" opacity=".65"/><ellipse cx="144" cy="104" rx="9" ry="6" fill="#ff8fb0" opacity=".65"/>
       <path d="M90 108 Q100 118 110 108" fill="none" stroke="#2a1a2e" stroke-width="3" stroke-linecap="round"/>` +
      star(100, 158, 9, '#ffd84a'),
  },
  {
    id: 'pet-fish',
    floats: true,
    draw: () =>
      `<circle cx="100" cy="104" r="88" fill="#bfeaff" fill-opacity=".35" stroke="#e6f7ff" stroke-width="5"/>
       <path d="M40 66 Q56 34 92 26" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".85"/>
       <g class="pet-tail"><path d="M136 108 L178 76 Q170 108 180 140 Z" fill="#ff8ec7" stroke="#ff5fae" stroke-width="3" stroke-linejoin="round"/></g>
       <path d="M92 62 Q112 34 132 62 Z" fill="#ff8ec7"/>
       <ellipse cx="96" cy="108" rx="54" ry="42" fill="#ffa63d"/>
       <path d="M96 68 Q112 108 96 148 M120 76 Q132 108 120 140" fill="none" stroke="${lighten('#ffa63d', 0.75)}" stroke-width="9" stroke-linecap="round"/>
       <path d="M92 130 Q108 150 84 152 Z" fill="#ff8ec7"/>
       <g class="pet-blink"><ellipse cx="68" cy="98" rx="10" ry="12" fill="#2a1a2e"/><circle cx="64.5" cy="93.5" r="4" fill="#fff"/><circle cx="71.5" cy="103" r="1.8" fill="#fff"/></g>
       <ellipse cx="60" cy="118" rx="9" ry="6" fill="#ff6f91" opacity=".6"/>
       <path d="M46 116 Q52 124 60 120" fill="none" stroke="#2a1a2e" stroke-width="2.6" stroke-linecap="round"/>
       <circle cx="30" cy="140" r="6" fill="#fff" opacity=".7"/><circle cx="44" cy="158" r="4" fill="#fff" opacity=".7"/>`,
  },
];

export const petById = (id: string | undefined) => PETS.find((p) => p.id === id);

export function petSvg(id: string | undefined, cls = ''): string {
  const p = petById(id);
  if (!p) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="pet-svg ${cls}" viewBox="${PET_VIEWBOX}" preserveAspectRatio="xMidYMax meet">${p.draw()}</svg>`;
}
