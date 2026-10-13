#!/usr/bin/env node
/**
 * Bakes where the PAINTED world map shows water (roadmap #119): every cell of
 * the hero's walk grid (`screens/map/walk.ts`, 10 sheet units a cell) read off
 * `public/images/ui/map.webp`, stretched over the 1600 × 900 sheet exactly as
 * the map screen shows it.
 *
 *   node scripts/map-walk-bake.mjs
 *
 * Writes `src/components/screens/map/paintedGround.ts`: one string a row,
 *   `~`  water (the sea, the lakes, the rivers): more than half the cell's
 *        pixels are water blue
 *   `x`  the rift's black void
 *   `.`  painted ground: earth, roads, grass, snow, mountains, the bridges
 *
 * Re-run it whenever the painting changes: `tests/ui/worldMapWalk.test.ts`
 * reads the painting again and fails while the baked rows are stale.
 */
import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PAINTING = path.join(ROOT, 'public/images/ui/map.webp')
const OUT = path.join(ROOT, 'src/components/screens/map/paintedGround.ts')

/** The sheet, its cell (`MAP_W`, `MAP_H`, `STEP` in `screens/map/`). */
const W = 1600
const H = 900
const STEP = 10

/** Water blue: a cyan to sky hue, coloured enough. The deep lake blue in the
 *  snow shares its hue with the snow's shade and the ice peaks: there only
 *  the stronger colour is water. */
export const isWater = (r, g, b) => {
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const c = mx - mn
  if (c < 30 || c / mx < 0.2) return false
  let h = mx === r ? 60 * (((g - b) / c) % 6) : mx === g ? 60 * ((b - r) / c + 2) : 60 * ((r - g) / c + 4)
  if (h < 0) h += 360
  return (h >= 160 && h <= 200) || (h > 200 && h <= 215 && c / mx >= 0.47)
}

/** The rift's void: near black. */
export const isVoid = (r, g, b) => Math.max(r, g, b) < 45

/** The painting's pixels at sheet size (RGB, `W` × `H`). */
export const readPainting = async () => {
  const sharp = require('sharp')
  return sharp(PAINTING).resize(W, H, { fit: 'fill' }).removeAlpha().raw().toBuffer()
}

/** A cell is water from this share of water pixels: a painted river is two
 *  cells wide and seldom fills either, so half would leave fords in it. */
const WATER_SHARE = 0.35
const VOID_SHARE = 0.5
/** A patch of water or void smaller than this (cells) is a shade in the snow,
 *  an ice peak or a burnt tree, not a lake: ground. */
const MIN_PATCH = 8

/** One row string per cell row, as `paintedGround.ts` holds them. */
export const bakeRows = (px) => {
  const GW = W / STEP
  const GH = H / STEP
  const n = STEP * STEP
  const wet = new Float32Array(GW * GH)
  const cls = new Array(GW * GH).fill('.')
  for (let j = 0; j < GH; j++) {
    for (let i = 0; i < GW; i++) {
      let water = 0
      let gap = 0
      for (let y = j * STEP; y < (j + 1) * STEP; y++) {
        for (let x = i * STEP; x < (i + 1) * STEP; x++) {
          const k = (y * W + x) * 3
          if (isWater(px[k], px[k + 1], px[k + 2])) water++
          else if (isVoid(px[k], px[k + 1], px[k + 2])) gap++
        }
      }
      wet[j * GW + i] = water / n
      cls[j * GW + i] = water >= n * WATER_SHARE ? '~' : gap >= n * VOID_SHARE ? 'x' : '.'
    }
  }
  // Small patches are not water (or void).
  const seen = new Uint8Array(GW * GH)
  for (let s = 0; s < GW * GH; s++) {
    if (seen[s] || cls[s] === '.') continue
    const kind = cls[s]
    const patch = [s]
    seen[s] = 1
    for (let q = 0; q < patch.length; q++) {
      const k = patch[q]
      const i = k % GW
      const j = (k - i) / GW
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const a = i + di
        const b = j + dj
        if (a < 0 || b < 0 || a >= GW || b >= GH) continue
        const m = b * GW + a
        if (!seen[m] && cls[m] === kind) { seen[m] = 1; patch.push(m) }
      }
    }
    if (patch.length < MIN_PATCH) for (const k of patch) cls[k] = '.'
  }
  // A river running on the diagonal touches only at corners: close each such
  // corner with the wetter of its two ground cells, so no ford opens there.
  for (let j = 0; j < GH - 1; j++) {
    for (let i = 0; i < GW - 1; i++) {
      const a = j * GW + i
      for (const [p, q, r, t] of [[a, a + GW + 1, a + 1, a + GW], [a + 1, a + GW, a, a + GW + 1]]) {
        if (cls[p] === '~' && cls[q] === '~' && cls[r] !== '~' && cls[t] !== '~') cls[wet[r] >= wet[t] ? r : t] = '~'
      }
    }
  }
  const rows = []
  for (let j = 0; j < GH; j++) rows.push(cls.slice(j * GW, (j + 1) * GW).join(''))
  return rows
}

const main = async () => {
  const rows = bakeRows(await readPainting())
  const src = `/**
 * ─── Where the painted world map shows water (roadmap #119) ─────────────────
 *
 * Baked by \`node scripts/map-walk-bake.mjs\` from \`public/images/ui/map.webp\`:
 * one string a row of the walk grid, \`~\` water, \`x\` the rift's void, \`.\`
 * painted ground (the bridges included). Do not edit by hand.
 */
export const PAINTED_GROUND: readonly string[] = [
${rows.map(r => `  '${r}'`).join(',\n')}
]
`
  writeFileSync(OUT, src)
  console.log(`wrote ${path.relative(ROOT, OUT)}: ${rows.length} rows`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
