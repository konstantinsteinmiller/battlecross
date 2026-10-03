#!/usr/bin/env node
/**
 * The loading screen's background tile (roadmap #64): a seamless 240 px square
 * of the game's own things — a sword, a shield, a potion, a coin, a helmet, a
 * star, a gem — drawn as WHITISH OUTLINES only, well spaced, slightly turned,
 * in two sizes. The splash scrolls it slowly toward the bottom right, the way
 * Brawl Stars' loading screens do.
 *
 *   node store-art/brand/splash-tile.mjs        # writes splash-tile.svg, prints the CSS url()
 *
 * Code-drawn on purpose: crisp at any density, a couple of kilobytes, and it
 * paints in the static splash before any script or image has loaded. Every
 * icon sits wholly inside the tile, so the repeat has no seam to hide.
 *
 * The SAME url() is pasted into index.html (#static-splash .s-grid) and
 * FLogoProgress.vue (.backdrop-grid); tests/ui/splashLogo.test.ts holds both
 * to this file.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const TILE = 240

// Each icon on a 24-unit box, outline only (the tile strokes them).
const ICONS = {
  sword: 'M12 1.5l2.6 3.4V16h-5.2V4.9zM6 16.5h12M12 17v4.5M12 21.5a1.4 1.4 0 1 0 .01 0',
  shield: 'M12 2l8 3v6.2c0 5.6-3.6 9.3-8 10.8c-4.4-1.5-8-5.2-8-10.8V5zM12 6v12M7.5 10.5h9',
  potion: 'M9.5 2h5M10.5 2v6.5L5.2 17.5a2.8 2.8 0 0 0 2.4 4.2h8.8a2.8 2.8 0 0 0 2.4-4.2L13.5 8.5V2M7.4 14h9.2',
  coin: 'M12 3a9 9 0 1 0 .01 0M12 6.6a5.4 5.4 0 1 0 .01 0',
  helmet: 'M4 17v-5.5a8 8 0 0 1 16 0V17h-5.2v-4.4H9.2V17zM12 3.5V1',
  star: 'M12 2.2l2.9 6 6.5.9-4.7 4.6 1.1 6.5L12 17.1l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z',
  gem: 'M6 4h12l4.5 5.5L12 22 1.5 9.5zM1.5 9.5h21M9 4l3 5.5L15 4'
}

// [icon, centre x, centre y, degrees, scale]: two sizes, plenty of room.
const PLACED = [
  ['sword', 52, 54, -32, 2.2],
  ['shield', 170, 46, 12, 1.6],
  ['potion', 194, 140, 16, 1.9],
  ['coin', 106, 128, 0, 1.35],
  ['helmet', 48, 190, -12, 2],
  ['star', 146, 202, 18, 1.45],
  ['gem', 206, 208, -10, 1.2]
]

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}">`,
  '<g fill="none" stroke="#fff" stroke-opacity=".26" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
  ...PLACED.map(([icon, x, y, deg, s]) => `<path transform="translate(${x} ${y}) rotate(${deg}) scale(${s}) translate(-12 -12)" d="${ICONS[icon]}"/>`),
  '</g></svg>'
].join('')

/** The tile as a CSS url(): the few characters a data URI must escape, and no more. */
export const tileUrl = (text) => `url("data:image/svg+xml,${text.replace(/"/g, "'").replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}")`

// Run as a command (it is also imported by the splash test for tileUrl).
if (process.argv[1]?.endsWith('splash-tile.mjs')) {
  writeFileSync(join(HERE, 'splash-tile.svg'), svg)
  console.log(tileUrl(svg))
  console.error(`splash-tile.svg: ${svg.length} bytes, url() ${tileUrl(svg).length} chars`)
}
