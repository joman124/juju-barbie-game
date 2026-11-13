import type { Look } from './types';
import { DOLL_VIEWBOX, DOLL_VB, dollMarkup } from './art/doll';
import { sceneMarkup } from './art/backdrops';
import { PET_VIEWBOX, petById } from './art/pets';
import { nextUid, sparkle } from './art/svg';
import { dollById } from './dolls';

const PHOTO_W = 720;
const PHOTO_H = 900;

/** A portrait picture of a finished look on its runway, as standalone SVG. */
export function lookPictureSvg(look: Look, opts: { audience?: boolean; cls?: string } = {}): string {
  const uid = nextUid();
  const d = dollById(look.doll);
  const dh = 700;
  const dw = (dh * DOLL_VB.w) / DOLL_VB.h;
  const pet = petById(look.pet);
  const petArt = pet
    ? `<svg x="${pet.floats ? 770 : 764}" y="${pet.floats ? 380 : 684}" width="176" height="197" viewBox="${PET_VIEWBOX}">${pet.draw()}</svg>`
    : '';
  const glints = sparkle(300, 90, 22, '#fff') + sparkle(900, 150, 16, '#fff') + sparkle(880, 420, 14, '#fff', 'opacity=".9"') + sparkle(320, 470, 12, '#fff', 'opacity=".9"');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${opts.cls ?? ''}" viewBox="240 0 ${PHOTO_W} ${PHOTO_H}" preserveAspectRatio="xMidYMid slice">
    ${sceneMarkup(d.theme, uid, opts.audience ?? false)}
    <ellipse cx="600" cy="866" rx="150" ry="22" fill="#000" opacity=".16"/>
    <svg x="${600 - dw / 2}" y="${868 - dh}" width="${dw}" height="${dh}" viewBox="${DOLL_VIEWBOX}">${dollMarkup(look, `${uid}d`)}</svg>
    ${petArt}${glints}
  </svg>`;
}

/** Renders the picture to a PNG file for saving to Photos. */
export async function lookPng(look: Look): Promise<Blob> {
  const scale = 2;
  const svg = lookPictureSvg(look, { audience: true }).replace('<svg ', `<svg width="${PHOTO_W * scale}" height="${PHOTO_H * scale}" `);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not draw the picture'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = PHOTO_W * scale;
    canvas.height = PHOTO_H * scale;
    const g = canvas.getContext('2d')!;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not make the picture'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
