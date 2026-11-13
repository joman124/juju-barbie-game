/** Shared types for the doll, the wardrobe and saved looks. */

/** Pieces of artwork an item contributes to the layered doll. */
export interface Parts {
  /** Extra <defs> content (gradients, clip paths). */
  defs?: string;
  /** Behind the whole doll: wings, capes. */
  behind?: string;
  /** Drawn on each leg (left-leg coordinates, mirrored for the right). */
  leg?: string;
  /** Shoes: drawn on each foot (left coordinates, mirrored). */
  foot?: string;
  /** Replaces both legs, e.g. a mermaid tail. */
  tail?: string;
  /** Over the legs around the hips: skirts, waistbands. Sways while walking. */
  hips?: string;
  /** Over the torso. */
  torso?: string;
  /** Sleeves (left coordinates, mirrored). */
  armUpper?: string;
  armFore?: string;
  /** Held in the hand (left-arm coordinates). */
  hand?: string;
  neck?: string;
  /** On the face, over the hair fringe: glasses. */
  face?: string;
  /** On top of the head: crowns, bows. */
  head?: string;
  /** In front of everything on the head, e.g. a helmet bubble. */
  over?: string;
}

export type Slot =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'shoes'
  | 'accHead'
  | 'accNeck'
  | 'accFace'
  | 'accHandL'
  | 'accHandR'
  | 'accBack'
  | 'hair'
  | 'hairColor'
  | 'lips'
  | 'shadow'
  | 'blush'
  | 'faceArt'
  | 'nailColor'
  | 'nailPattern'
  | 'pet';

export interface ItemCtx {
  uid: string;
}

export interface WearItem {
  id: string;
  slot: Slot;
  parts: (ctx: ItemCtx) => Parts;
  /** viewBox used for the picker thumbnail. */
  thumb: [number, number, number, number];
  /** True for a mermaid tail: legs and shoes are hidden. */
  tail?: boolean;
}

export interface HairColor {
  id: string;
  base: string;
  shade: string;
  light: string;
  /** Multi-colour hair (rainbow, ombre): the colours from top to tip. */
  stops?: string[];
}

export interface Look {
  doll: string;
  top?: string;
  bottom?: string;
  dress?: string;
  shoes?: string;
  accHead?: string;
  accNeck?: string;
  accFace?: string;
  accHandL?: string;
  accHandR?: string;
  accBack?: string;
  hair: string;
  hairColor: string;
  lips?: string;
  shadow?: string;
  blush?: string;
  faceArt?: string;
  nailColor?: string;
  nailPattern?: string;
  pet?: string;
}

export type Theme = 'stadium' | 'ocean' | 'castle' | 'forest' | 'space' | 'concert';

export interface DollDef {
  id: string;
  name: string;
  skin: string;
  eyes: string;
  brows: string;
  theme: Theme;
  /** Card / accent colours. */
  color: string;
  color2: string;
  starter: Look;
}

export interface SavedLook {
  id: string;
  at: number;
  look: Look;
}
