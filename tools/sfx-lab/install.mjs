#!/usr/bin/env node
// ─── node tools/sfx-lab/install.mjs  (pnpm sfx:install) ───────────────────────
// The picks made in the sound lab (reports/sfx-lab/decisions.json) become the game's sounds (roadmaps #191, #192): each
// picked take is trimmed of the silence round it, its peak set to a common level, a few milliseconds faded off its end, and
// written as Opus in an .ogg to public/audio/sfx/<sfx name>.ogg, where the game's drop-in loader (`game/assets/overrides.ts`)
// takes it over from the synth. A sound with no pick keeps the synth. `tools/sfx-lab/picks.json` records which take each is.
//
//   --only id,id   only these      --dry   list, convert nothing
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const LAB = join(ROOT, 'reports', 'sfx-lab')
const OUT = join(ROOT, 'public', 'audio', 'sfx')
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined }
const only = arg('--only')?.split(',')
const decisions = JSON.parse(readFileSync(join(LAB, 'decisions.json'), 'utf8'))
mkdirSync(OUT, { recursive: true })

const ffmpeg = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] })
/** The loudest peak of a file, dBFS (from ffmpeg's volumedetect, which prints to stderr). */
const peakOf = (file) => {
  try {
    execFileSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'volumedetect', '-f', 'null', '-'], { stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (e) {
    const m = /max_volume:\s*(-?[\d.]+) dB/.exec(String(e.stderr))
    if (m) return Number(m[1])
  }
  return null
}

const picks = {}
let n = 0
for (const [id, d] of Object.entries(decisions)) {
  if (!d.pick || (only && !only.includes(id))) continue
  const src = join(LAB, 'audio', id, d.pick)
  if (!existsSync(src)) { console.warn(`${id}: the picked take ${d.pick} is not on disk`); continue }
  picks[id] = { take: d.pick, stars: d.ratings?.[d.pick] ?? 0 }
  if (process.argv.includes('--dry')) { console.log(id, d.pick); continue }
  const tmp = join(LAB, `_trim-${id}.wav`)
  // Silence off both ends (the model pads its clips), mono.
  ffmpeg(['-i', src, '-ac', '1', '-af', 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.01,areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.02,areverse', tmp])
  const peak = peakOf(tmp)
  // To -1.5 dBFS peak: the same top level for every sound; the game's own file gain and the mix do the rest.
  const gain = peak === null ? 0 : Math.max(-12, Math.min(18, -1.5 - peak))
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', tmp]).toString().trim())
  const fade = Math.min(0.05, dur / 4)
  ffmpeg(['-i', tmp, '-af', `volume=${gain.toFixed(2)}dB,afade=t=out:st=${Math.max(0, dur - fade).toFixed(3)}:d=${fade.toFixed(3)}`, '-c:a', 'libopus', '-b:a', '64k', '-vbr', 'on', join(OUT, `${id}.ogg`)])
  try { execFileSync('node', ['-e', `require('fs').unlinkSync(${JSON.stringify(tmp)})`]) } catch { /* left */ }
  n++
}
writeFileSync(join(HERE, 'picks.json'), JSON.stringify(picks, null, 1))
console.log(process.argv.includes('--dry') ? `${Object.keys(picks).length} picks` : `${n} sounds installed into public/audio/sfx/`)
