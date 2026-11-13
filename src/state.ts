import type { Look, SavedLook } from './types';
import { BOTTOMS, DRESSES, SHOES, TOPS } from './art/clothes';
import { BLING_ACC, CARRY_ACC, HEAD_ACC } from './art/accessories';
import { itemById } from './art/catalog';
import { HAIR_COLORS, HAIR_STYLES } from './art/hair';
import { BLUSHES, FACE_ART, LIPS, NAIL_COLORS, NAIL_PATTERNS, SHADOWS } from './art/makeup';
import { PETS } from './art/pets';
import { dollById } from './dolls';

const LOOKS_KEY = 'jfs.looks.v1';
const MUTE_KEY = 'jfs.muted';
const MAX_LOOKS = 60;

/** Remembers the last separates so swapping out of a dress restores them. */
export interface Memory {
  top?: string;
  bottom?: string;
  legsBottom?: string;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be unavailable in private mode; the game still works */
  }
}

/** Small remembered facts, e.g. that the first-time walkthrough has been seen. */
export const hasFlag = (name: string) => read<boolean>(`jfs.flag.${name}`, false);
export const setFlag = (name: string) => write(`jfs.flag.${name}`, true);

export const loadMuted = () => read<boolean>(MUTE_KEY, false);
export const storeMuted = (m: boolean) => write(MUTE_KEY, m);

export function loadLooks(): SavedLook[] {
  const list = read<SavedLook[]>(LOOKS_KEY, []);
  return Array.isArray(list) ? list.filter((s) => s && s.look && typeof s.look.doll === 'string') : [];
}

const LOOK_KEYS: Array<keyof Look> = [
  'doll',
  'top',
  'bottom',
  'dress',
  'shoes',
  'accHead',
  'accNeck',
  'accFace',
  'accHandL',
  'accHandR',
  'accBack',
  'hair',
  'hairColor',
  'lips',
  'shadow',
  'blush',
  'faceArt',
  'nailColor',
  'nailPattern',
  'pet',
];

export function sameLook(a: Look, b: Look): boolean {
  return LOOK_KEYS.every((k) => (a[k] ?? '') === (b[k] ?? ''));
}

/**
 * Adds a look to the lookbook (newest first). A look that is already in the
 * book is moved to the front instead of being saved twice.
 */
export function saveLook(look: Look): SavedLook {
  const list = loadLooks();
  const at = list.findIndex((s) => sameLook(s.look, look));
  let saved: SavedLook;
  if (at >= 0) {
    saved = { ...list[at], at: Date.now() };
    list.splice(at, 1);
  } else {
    saved = { id: `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`, at: Date.now(), look: { ...look } };
  }
  list.unshift(saved);
  write(LOOKS_KEY, list.slice(0, MAX_LOOKS));
  // Ask the browser to keep saved looks even if the device runs low on space.
  void navigator.storage?.persist?.().catch(() => undefined);
  return saved;
}

export const isSaved = (look: Look) => loadLooks().some((s) => sameLook(s.look, look));

export function deleteLook(id: string): void {
  write(
    LOOKS_KEY,
    loadLooks().filter((s) => s.id !== id),
  );
}

const isTail = (id: string | undefined) => !!itemById(id)?.tail;

/**
 * Applies one tap in the wardrobe. Tapping what is already on takes it off.
 * Returns the new look and whether the item ended up on.
 */
export function choose(look: Look, slot: keyof Look, id: string, mem: Memory): { look: Look; on: boolean } {
  const next: Look = { ...look };
  const starter = dollById(look.doll).starter;
  const rememberSeparates = () => {
    if (next.top) mem.top = next.top;
    if (next.bottom) {
      mem.bottom = next.bottom;
      if (!isTail(next.bottom)) mem.legsBottom = next.bottom;
    }
  };

  if (slot === 'hair' || slot === 'hairColor') {
    next[slot] = id;
    return { look: next, on: true };
  }

  if (next[slot] === id) {
    delete next[slot];
    if (slot === 'nailColor') delete next.nailPattern;
    return { look: next, on: false };
  }

  switch (slot) {
    case 'dress':
      rememberSeparates();
      next.dress = id;
      delete next.top;
      delete next.bottom;
      break;
    case 'top':
      next.top = id;
      if (next.dress) {
        delete next.dress;
        next.bottom = mem.bottom ?? starter.bottom ?? 'bot-shorts';
      }
      break;
    case 'bottom':
      next.bottom = id;
      if (next.dress) {
        delete next.dress;
        next.top = mem.top ?? starter.top ?? 'top-star';
      }
      break;
    case 'shoes':
      next.shoes = id;
      // Shoes cannot show under a tail, so swap the tail for something with legs.
      if (!next.dress && isTail(next.bottom)) next.bottom = mem.legsBottom ?? 'bot-shorts';
      break;
    case 'nailPattern':
      next.nailPattern = id;
      if (!next.nailColor) next.nailColor = NAIL_COLORS[0].id;
      break;
    default:
      (next as unknown as Record<string, string>)[slot] = id;
  }
  rememberSeparates();
  return { look: next, on: true };
}

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const maybe = <T>(list: T[], chance: number): T | undefined => (Math.random() < chance ? pick(list) : undefined);

/** A random head-to-toe look for the "surprise me" button. */
export function randomLook(dollId: string): Look {
  const look: Look = { doll: dollId, hair: pick(HAIR_STYLES).id, hairColor: pick(HAIR_COLORS).id };
  if (Math.random() < 0.42) look.dress = pick(DRESSES).id;
  else {
    look.top = pick(TOPS).id;
    look.bottom = pick(BOTTOMS).id;
  }
  look.shoes = pick(SHOES).id;
  look.accHead = maybe(HEAD_ACC, 0.6)?.id;
  const bling = maybe(BLING_ACC, 0.7);
  if (bling) (look as unknown as Record<string, string>)[bling.slot] = bling.id;
  const carry = maybe(CARRY_ACC, 0.75);
  if (carry) (look as unknown as Record<string, string>)[carry.slot] = carry.id;
  if (Math.random() < 0.3 && !look.accBack) look.accBack = pick(CARRY_ACC.filter((c) => c.slot === 'accBack')).id;
  look.lips = pick(LIPS).id;
  look.shadow = maybe(SHADOWS, 0.8)?.id;
  look.blush = maybe(BLUSHES, 0.6)?.id;
  look.faceArt = maybe(FACE_ART, 0.5)?.id;
  look.nailColor = pick(NAIL_COLORS).id;
  look.nailPattern = pick(NAIL_PATTERNS);
  look.pet = pick(PETS).id;
  for (const k of Object.keys(look) as Array<keyof Look>) if (look[k] === undefined) delete look[k];
  return look;
}
