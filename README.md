# Juju's Fashion Show

A dress-up and makeover game for children aged 3 to 5, made for the iPad. Pick a doll, give her a makeover, then watch her walk the runway in her own fashion show.

It is a web app: it runs in Safari, can be added to the home screen as a full-screen app, and works with no internet connection once it has been opened once.

## How to play

No reading is needed.

1. **Tap the big green button** to start.
2. **Pick a doll.** There are six: Sunny (sport), Coral (mermaid), Rosie (princess), Fern (fairy), Nova (astronaut) and Melody (pop star). Each arrives in her own outfit with her own pet.
3. **Give her a makeover.** The six big buttons along the top are clothes, accessories, hair, makeup, nails and pets. Tap anything to put it on; tap it again to take it off. Any item works on any doll.
   - The magic wand button gives her a surprise look.
   - The round arrow button puts her back in the outfit she arrived in.
   - Makeup zooms in on her face and nails zoom in on her hand.
4. **Tap the star button** for the fashion show. Tap anywhere during the show to throw hearts and stars.
5. The finished look is saved to the **lookbook** (the book button). Tap a saved look to change it or watch its show again.

There are no scores, timers, ads, purchases, accounts or links out of the game, and nothing is ever sent anywhere. Saved looks stay on the device.

### For grown-ups

In the lookbook, open a look, then **press and hold the padlock for three seconds**. From there you can save the look as a picture (on an iPad this opens the share sheet, where you can choose Save Image) or delete it.

## Put it on an iPad

The game is a folder of plain files, so any static web host will serve it.

1. Build it (see below) and upload the `dist` folder to a host such as GitHub Pages, Netlify, Vercel or Cloudflare Pages. It must be served over `https` for offline play and the home screen app to work.
2. On the iPad, open the address in **Safari**.
3. Tap the **Share** button, then **Add to Home Screen**, then **Add**.
4. Open the game from its new home screen icon. It now runs full screen, and works offline.

It needs iPadOS 15 or newer.

If there is no sound, check that the iPad is not muted in Control Centre and that the speaker button in the top corner of the game is not crossed out.

To try it without hosting anything, run `npm run dev` on a computer and open the address it prints from an iPad on the same Wi-Fi. This is fine for a look, but the home screen app and offline play need `https`.

## Run it on a computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open the address it prints. To make the files for hosting:

```bash
npm run build
```

The finished game is in `dist`. `npm run preview` serves that folder so you can check the built version.

## How it is made

- **TypeScript and Vite**, no framework. The built game is a single small script, one stylesheet and a few icons.
- **All artwork is drawn in code** as layered SVG. There are no image files apart from the app icons, which are themselves photographed from the artwork.
- **All sound is synthesised** with the Web Audio API: the music, taps, sparkles and applause. There are no audio files.

```
src/
  main.ts            start-up
  app.ts             screen switching and touch handling for small hands
  state.ts           wardrobe rules (dress replaces top and bottom, and so on), saved looks
  audio.ts           music and sound effects
  fx.ts              confetti, hearts and stars
  photo.ts           the picture of a finished look
  dolls.ts           the six dolls and their starter looks
  screens/           title, doll picker, studio, fashion show, lookbook
  art/
    doll.ts          the body rig and the fixed layer order
    hair.ts          hair styles and colours
    clothes.ts       tops, bottoms, dresses, shoes
    accessories.ts   crowns, jewellery, glasses, bags, wands, wings
    makeup.ts        lips, eyeshadow, blush, face art, nail colours
    hand.ts          the close-up hand for nails
    pets.ts          the eight pets
    backdrops.ts     the six runway scenes
    icons.ts         button icons
```

### Adding a new item

Every doll shares one body, so an item is drawn once and fits everyone. Add an entry to the right list in `src/art/clothes.ts` or `src/art/accessories.ts`. Each item says which parts of the doll it draws on (`torso`, `hips`, `leg`, `foot`, `armUpper`, `head` and so on); `src/art/doll.ts` stacks those parts in the right order. Left-side pieces such as sleeves, trouser legs and shoes are drawn once and mirrored.

Open `/sheet.html?show=items` while `npm run dev` is running to see every item on one page. `?show=dolls`, `?show=hair` and `?show=mix` show the dolls, the hair styles and a set of mixed-up outfits.

### Testing

`scripts/play.cjs` plays the game with touch input in an iPad-sized browser and saves screenshots to `shots/`. It needs [Playwright](https://playwright.dev) and the dev server running.

```bash
node scripts/play.cjs tour landscape
```

Other scenarios are `starters` (every doll through the whole show), `surprise` (random looks), `hint` (the idle pointing hand) and `gate` (the grown-up lock, saving and deleting). Add `portrait` for the upright layout.

`node scripts/make-icons.cjs` regenerates the app icons in `public/icons`.
