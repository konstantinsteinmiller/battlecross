#!/usr/bin/env node
// ─── node tools/sfx-review/page-data.mjs <out sounds.json> ───────────────────
//
// The review page's data: manifest.json joined with the asset ids the files
// were uploaded under (assets.txt, "<out-relative path> <id>" per line), as
// the page's `sounds.json` (published next to the page).
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const out = process.argv[2]
if (!out) { console.error('usage: node tools/sfx-review/page-data.mjs <out sounds.json>'); process.exit(1) }
const ids = new Map(readFileSync(join(HERE, 'assets.txt'), 'utf8').split('\n')
  .filter(l => l.trim() && !l.startsWith('#')).map(l => l.trim().split(/\s+/)))
const url = (file) => {
  if (!file) return null
  const id = ids.get(file.replace(/^out\//, ''))
  if (!id) console.warn(`  no asset for ${file}`)
  return id ? `/_blob/${id}` : null
}
const { sounds } = JSON.parse(readFileSync(join(HERE, 'manifest.json'), 'utf8'))
const data = sounds.map(s => ({
  id: s.id, category: s.category, description: s.description, durationMs: s.durationMs,
  audioUrl: url(s.file), screenshotUrl: url(s.screenshot), mixUrl: url(s.mixFile), mixNote: s.mixNote
}))
// The remakes (remakes.json, written by generate.mjs): old, A and B per target.
// A new skill cast answers its element's rejected cast (the note shown is that one's).
const FROM = {
  castEarthShift: 'castEarth', castBoulder: 'castEarth', castFrostShatter: 'castIce', castAvalancheLeap: 'castIce', castAbsoluteZero: 'castIce',
  castSmokeBomb: 'castShadow', castShadowMark: 'castShadow', castOrbitalBeam: 'castShock', castSpark: 'castShock'
}
const remakes = JSON.parse(readFileSync(join(HERE, 'remakes.json'), 'utf8')).map(r => {
  const m = sounds.find(x => x.id === r.id)
  return { id: r.id, from: FROM[r.id] ?? r.id, isNew: !!FROM[r.id], description: m?.description ?? '', screenshotUrl: url(m?.screenshot),
    oldUrl: url(r.files.old), aUrl: url(r.files.A), bUrl: url(r.files.B) }
})
writeFileSync(out, JSON.stringify({ sounds: data, remakes }))
console.log(`${data.length} sounds → ${out}`)
