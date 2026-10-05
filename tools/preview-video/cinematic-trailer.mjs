#!/usr/bin/env node
/**
 * ─── pnpm cinematic-trailer ─────────────────────────────────────────────────
 *
 * The cinematic trailer (roadmap #X1), from nothing to one finished file:
 *
 *   1. RECORD the picture: `record.mjs --formats cinematic --scenarios success`
 *      (the shot list is `scenarios/cinematic-trailer.mjs`; the clean feed, so
 *      no bubbles, no HUD). It logs every sound the fights ask for to
 *      preview-videos/cinematic-sfx.json, on the clip's clock.
 *   2. RENDER the music: the game's own boss theme ("Trial of Blades", the cuts
 *      sit on its beat), offline, to the trailer's length (`tools/music-render.mjs`).
 *      The game's score is a live WebAudio sequencer the frame recorder cannot hear.
 *   3. RENDER the fights' sounds: the game's own synth recipes, offline, laid
 *      at the logged times (`tools/sfx-render.mjs`). No voice-over.
 *   4. MIX: the music under the fights, a fade in and out, levelled to -15 LUFS.
 *   5. WRITE preview-videos/battlecross-cinematic-trailer.mp4 — H.264 4:2:0
 *      at 1920x1080, AAC stereo.
 *
 * Any other flag goes to the recorder, so a quick draft is
 *   pnpm cinematic-trailer --fps 15 --landscape 960x540 --dpr 1 --quality balanced
 * and `--skip-record` re-mixes the last recording (after a sound change).
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUT_DIR = join(ROOT, 'preview-videos')
const FINAL = join(OUT_DIR, 'battlecross-cinematic-trailer.mp4')
const SOUNDS = join(OUT_DIR, 'cinematic-sfx.json')
const ffmpeg = createRequire(join(ROOT, 'package.json'))('ffmpeg-static')

/** The fights against the music (the music is the bed, the hits sit on top). */
const MUSIC_GAIN = 0.62
const FIGHTS_GAIN = 0.75

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
if (!existsSync(SOUNDS)) { console.error(`no sound log at ${SOUNDS}: record first`); process.exit(1) }
const { durationMs, events } = JSON.parse(readFileSync(SOUNDS, 'utf8'))
const seconds = durationMs / 1000
console.log(`picture: ${picture}\nsounds: ${events.length} logged`)

// 2. The music, a little longer than the picture (the fade-out is the mix's).
const audioDir = join(OUT_DIR, 'cinematic-audio')
mkdirSync(audioDir, { recursive: true })
run(process.execPath, ['--import', './tools/ts-resolve.mjs', join(ROOT, 'tools/music-render.mjs'), '--out', audioDir, '--seconds', String(Math.ceil(seconds + 2)), 'boss'], 'rendering the boss theme')
const music = join(audioDir, 'boss.mp3')

// 3. The fights, voiced from the game's own synth.
const fights = join(audioDir, 'fights.wav')
run(process.execPath, [join(ROOT, 'tools/sfx-render.mjs'), SOUNDS, fights], 'rendering the fights')

// 4 + 5. The mix.
const fadeOut = Math.max(0, seconds - 2.5).toFixed(2)
const graph = [
  `[1:a]atrim=0:${seconds.toFixed(3)},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,volume=${MUSIC_GAIN}[mus]`,
  // The fights' bus a little compressed: a crit on an explosion would otherwise
  // be squared off by the limiter, and AAC rings past the ceiling on that.
  `[2:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=${FIGHTS_GAIN},acompressor=threshold=0.2:ratio=3:attack=3:release=90[fx]`,
  `[mus][fx]amix=inputs=2:normalize=0:duration=first,afade=t=in:st=0:d=0.4,afade=t=out:st=${fadeOut}:d=2.5,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100,lowpass=f=16000,alimiter=limit=0.89:attack=2:level=false[aout]`
].join(';')
run(ffmpeg, [
  '-y', '-loglevel', 'error', '-i', picture, '-i', music, '-i', fights,
  '-filter_complex', graph,
  '-map', '0:v', '-map', '[aout]',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
  '-t', seconds.toFixed(3), '-movflags', '+faststart', FINAL
], 'mixing the trailer')

// 6. The encoder's last word: AAC can still ring past the ceiling on a hard
// transient. Measure the file's true peak and, over -1 dBTP, take the excess
// off the sound (the picture is copied, not encoded again).
const truePeak = (file) => {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8', windowsHide: true })
  const m = /Peak:\s+(-?[\d.]+) dBFS/.exec(r.stderr.split('Summary:').pop() ?? '')
  return m ? Number(m[1]) : null
}
// The encode that trims can ring again, so measure after each pass (a few at most).
for (let pass = 0; pass < 3; pass++) {
  const peak = truePeak(FINAL)
  if (peak === null || peak <= -1) break
  const tmp = FINAL.replace(/\.mp4$/, '.tmp.mp4')
  run(ffmpeg, ['-y', '-loglevel', 'error', '-i', FINAL, '-map', '0:v', '-map', '0:a', '-c:v', 'copy', '-af', `volume=${(-1 - peak - 0.6).toFixed(2)}dB`, '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart', tmp], `trimming a ${peak.toFixed(1)} dBTP peak`)
  renameSync(tmp, FINAL)
}
console.log(`true peak: ${truePeak(FINAL)?.toFixed(1)} dBTP`)
console.log(`\n✓ ${FINAL} (${(statSync(FINAL).size / 1e6).toFixed(1)} MB, ${seconds.toFixed(1)} s)`)
