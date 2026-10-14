#!/usr/bin/env node
/**
 * ─── World map quarters: their painted model ────────────────────────────────
 *
 * Cuts the finished whole-map painting (`art-sheets/painted/bg-ui-map.jpg`)
 * into the four overlapping quarters of `MAP_PARTS`, and every piece of a
 * subdivided quarter (`MAP_SUBDIVIDED`), each enlarged to its own 1376 x 768,
 * into `art-sheets/map-parts/ref-<quarter>[-<piece>].jpg`. Each prompt
 * attaches its crop first: the painter only re-details a picture it already
 * sees, so all of them share one palette, light and layout and the stitch
 * finds no seam. (Fed the whole map instead, a quarter came back as the whole
 * map shrunk into its frame.)
 *
 *   node tools/map-part-refs.mjs      # after every repaint of bg-ui-map
 *
 * The tiles are read from `art-sheets/sheet-index.json` (`pnpm art:prompts`).
 */
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'art-sheets', 'painted', 'bg-ui-map.jpg')
const OUT = join(ROOT, 'art-sheets', 'map-parts')

const index = JSON.parse(readFileSync(join(ROOT, 'art-sheets', 'sheet-index.json'), 'utf8'))
const tiles = (index.scenery ?? []).filter((a) => a.part)

mkdirSync(OUT, { recursive: true })
const { width, height } = await sharp(SRC).metadata()
for (const a of tiles) {
  const { part: p, sub } = a
  // `mapTileRect` in `src/game/art/artSheet.ts`.
  const fx = p.x + (sub ? sub.x * p.span : 0)
  const fy = p.y + (sub ? sub.y * p.span : 0)
  const fw = sub ? p.span * sub.span : p.span
  const left = Math.round(fx * width)
  const top = Math.round(fy * height)
  const w = Math.min(width - left, Math.round(fw * width))
  const h = Math.min(height - top, Math.round(fw * height))
  const name = sub ? `${p.name}-${sub.name}` : p.name
  const file = join(OUT, `ref-${name}.jpg`)
  await sharp(SRC).extract({ left, top, width: w, height: h }).resize(a.width, a.height, { fit: 'fill', kernel: 'lanczos3' }).jpeg({ quality: 92 }).toFile(file)
  console.log(`  ✓ ${name}: ${w}x${h} at ${left},${top} → ${file}`)
}
