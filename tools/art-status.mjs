#!/usr/bin/env node
/**
 * Which painted drop-ins are actually on disk, and which are still drawings.
 *
 *   pnpm art:status           # a summary per kind, plus what is missing
 *   pnpm art:status --all     # list every id, present or not
 *
 * The question this answers is "I sliced the art and only half the game
 * changed". A miss is SILENT by design — the build lists the override folders
 * (`assetOverridesPlugin` in vite.config.ts) and the game only asks for files
 * that exist, so a portal never sees a 404 — which is right in play and
 * useless at the bench, where the whole point is to know what is still
 * missing. Nothing here touches a browser: it reads the catalogue in the art
 * manifest and looks in `public/`.
 *
 * Run through the `--import` hook (the pnpm script does):
 *   node --import ./tools/ts-resolve.mjs tools/art-status.mjs
 */
import { existsSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')
const ALL = process.argv.includes('--all')

const { ART_CATALOGUE, artTarget } = await import(pathToFileURL(join(ROOT, 'src', 'game', 'art', 'artSheet.ts')).href)

// The build reads a hand-made `.png` or `.jpg` too (`IMAGE_EXTS` in
// vite.config.ts); the slicer only ever writes `.webp`.
const onDisk = (target) => ['.webp', '.png', '.jpg']
  .map((ext) => join(PUBLIC, target.replace(/\.webp$/, ext)))
  .find((f) => existsSync(f))

let present = 0
let absent = 0
const rows = []

for (const [kind, ids] of Object.entries(ART_CATALOGUE)) {
  const missing = []
  let here = 0
  let bytes = 0
  for (const id of ids) {
    const file = onDisk(artTarget(kind, id))
    if (file) {
      here++
      bytes += statSync(file).size
      if (ALL) rows.push(`  ✓ ${kind}/${id}`)
    } else {
      missing.push(id)
      if (ALL) rows.push(`  · ${kind}/${id}`)
    }
  }
  present += here
  absent += missing.length
  const kb = bytes > 0 ? ` — ${(bytes / 1024).toFixed(0)} kB` : ''
  console.log(`${here === ids.length ? '✓' : here === 0 ? '·' : '½'} ${kind.padEnd(9)} ${String(here).padStart(3)}/${ids.length}${kb}`)
  if (missing.length && !ALL) {
    // The whole point: name them. A kind that is half painted is the case that
    // looks like "the art layer is broken" and is really "these ten are not cut yet".
    const shown = missing.slice(0, 12).join(', ')
    console.log(`    missing: ${shown}${missing.length > 12 ? `, …and ${missing.length - 12} more` : ''}`)
  }
}

if (ALL) console.log(rows.join('\n'))
console.log(`\n${present} painted, ${absent} still drawn, ${present + absent} in the catalogue.`)
if (absent) {
  console.log('A missing file is not an error: the game draws that one. It is only'
    + '\na surprise when you expected a painting — slice the sheet it belongs to'
    + '\n(`pnpm art:slice`); the dev server reloads when a file lands, a build'
    + '\npicks it up the next time it runs.')
}
