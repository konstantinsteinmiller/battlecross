#!/usr/bin/env node
/**
 * ─── pnpm cinematic-trailer ─────────────────────────────────────────────────
 *
 * The cinematic trailer (roadmap #X1), from nothing to one finished file:
 *
 *   1. RECORD the picture: `record.mjs --formats cinematic --scenarios success`
 *      (the shot list is `scenarios/cinematic-trailer.mjs`; the clean feed, so
 *      no bubbles, no HUD). It writes the voice cues to
 *      preview-videos/cinematic-cues.json.
 *   2. RENDER the music: the game's own boss theme ("Trial of Blades", the cuts
 *      sit on its beat), offline, to the trailer's length (`tools/music-render.mjs`).
 *      The game's score is a live WebAudio sequencer the frame recorder cannot hear.
 *   3. MIX: the hero's own recordings (public/audio/voice/en/<line>.ogg) at
 *      their cues, the music ducked under each line, a fade in and out.
 *   4. WRITE preview-videos/chaos-machine-cinematic-trailer.mp4 — H.264 4:2:0
 *      at 1920x1080, AAC stereo.
 *
 * Any other flag goes to the recorder, so a quick draft is
 *   pnpm cinematic-trailer --fps 15 --landscape 960x540 --dpr 1 --quality balanced
 * and `--skip-record` re-mixes the last recording (after a sound change).
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUT_DIR = join(ROOT, 'preview-videos')
const FINAL = join(OUT_DIR, 'chaos-machine-cinematic-trailer.mp4')
const CUES = join(OUT_DIR, 'cinematic-cues.json')
const ffmpeg = createRequire(join(ROOT, 'package.json'))('ffmpeg-static')

const argv = process.argv.slice(2)
const skipRecord = argv.includes('--skip-record')
const passOn = argv.filter(a => a !== '--skip-record')

const run = (cmd, args, label) => {
  console.log(`\n── ${label} ──`)
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', windowsHide: true })
  if (r.status !== 0) { console.error(`${label} failed (exit ${r.status})`); process.exit(r.status ?? 1) }
}

// 1. The picture.
if (!skipRecord) run(process.execPath, [join(ROOT, 'tools/preview-video/record.mjs'), '--formats', 'cinematic', '--scenarios', 'success', ...passOn], 'recording the picture')

/** The newest recording of the trailer, the upload-grade one when there is a choice. */
const picture = (() => {
  const found = []
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/^success-cinematic-.*\.mp4$/.test(f)) found.push(p) } }
  if (existsSync(OUT_DIR)) walk(OUT_DIR)
  const rank = (p) => (/[\\/]lossless/.test(p) ? 0 : 1)
  return found.sort((a, b) => rank(b) - rank(a) || statSync(b).mtimeMs - statSync(a).mtimeMs)[0]
})()
if (!picture) { console.error('no recording of the trailer found under preview-videos/'); process.exit(1) }
if (!existsSync(CUES)) { console.error(`no voice cues at ${CUES}: record first`); process.exit(1) }
const { durationMs, cues } = JSON.parse(readFileSync(CUES, 'utf8'))
const seconds = durationMs / 1000
console.log(`picture: ${picture}\ncues: ${cues.map(c => `${c.id}@${(c.ms / 1000).toFixed(2)}s`).join(', ')}`)

// 2. The music, a little longer than the picture (the fade-out is the mix's).
const musicDir = join(OUT_DIR, 'cinematic-audio')
mkdirSync(musicDir, { recursive: true })
run(process.execPath, ['--import', './tools/ts-resolve.mjs', join(ROOT, 'tools/music-render.mjs'), '--out', musicDir, '--seconds', String(Math.ceil(seconds + 2)), 'boss'], 'rendering the boss theme')
const music = join(musicDir, 'boss.mp3')

// 3 + 4. The mix: every line at its cue, the music ducked under the voice.
const voices = cues.map(c => ({ ...c, file: join(ROOT, 'public/audio/voice/en', `${c.id}.ogg`) })).filter(c => {
  if (existsSync(c.file)) return true
  console.warn(`  no recording for ${c.id}: left out`)
  return false
})
const inputs = ['-i', picture, '-i', music, ...voices.flatMap(v => ['-i', v.file])]
const fadeOut = Math.max(0, seconds - 2.5).toFixed(2)
const parts = [
  `[1:a]atrim=0:${seconds.toFixed(3)},asetpts=PTS-STARTPTS,volume=0.75,afade=t=in:st=0:d=0.4,afade=t=out:st=${fadeOut}:d=2.5[mus]`
]
voices.forEach((v, i) => parts.push(`[${i + 2}:a]aresample=44100,aformat=channel_layouts=stereo,volume=2.2,adelay=${v.ms}|${v.ms}[v${i}]`))
if (voices.length) {
  parts.push(`${voices.map((_, i) => `[v${i}]`).join('')}amix=inputs=${voices.length}:normalize=0,asplit=2[vo][key]`)
  parts.push('[mus][key]sidechaincompress=threshold=0.04:ratio=6:attack=15:release=350[duck]')
  parts.push('[duck][vo]amix=inputs=2:normalize=0,alimiter=limit=0.95[aout]')
} else parts.push('[mus]alimiter=limit=0.95[aout]')

run(ffmpeg, [
  '-y', '-loglevel', 'error', ...inputs,
  '-filter_complex', parts.join(';'),
  '-map', '0:v', '-map', '[aout]',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
  '-t', seconds.toFixed(3), '-movflags', '+faststart', FINAL
], 'mixing the trailer')
console.log(`\n✓ ${FINAL} (${(statSync(FINAL).size / 1e6).toFixed(1)} MB, ${seconds.toFixed(1)} s)`)
