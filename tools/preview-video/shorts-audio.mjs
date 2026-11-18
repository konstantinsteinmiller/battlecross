#!/usr/bin/env node
/**
 * ─── node tools/preview-video/shorts-audio.mjs [short-id …] ──────────────────
 *
 * Gives each YouTube Short its sound. The recorder's clips are silent; the in-game action is not: the scenarios
 * (`scenarios/_boss.mjs`) log every sound the fight asked for on the clip's clock (`preview-videos/shorts-audio/<id>.json`).
 * This voices them with the game's own synth (`tools/sfx-render.mjs`), lays the game's boss theme (`public/audio/music/boss.ogg`,
 * looped) under them, puts the Battlecross wordmark in the top left corner (a fifth of the width: well inside the 25 % of the
 * viewport the owner allows), fades in and out, levels to −14 LUFS (a Short's loudness) and writes
 * `preview-videos/shorts/<id>.mp4` — the picture untouched, AAC stereo.
 *
 *   pnpm preview:video --formats shorts --scenarios short-king-win,short-jarl-win,short-ember-fail,short-jarl-fail
 *   node tools/preview-video/shorts-audio.mjs            # every short-* clip with a log
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUT = join(ROOT, 'preview-videos')
const LOGS = join(OUT, 'shorts-audio')
const FINAL = join(OUT, 'shorts')
const LOGO_SRC = join(ROOT, 'public', 'images', 'logo', 'wordmark.webp')
/** The logo's width as a share of the picture's width, and its margin from the top left corner as a share of it. */
const LOGO_W = 0.2
const LOGO_MARGIN = 0.03
const MUSIC = join(ROOT, 'public', 'audio', 'music', 'boss.ogg')
const ffmpeg = createRequire(join(ROOT, 'package.json'))('ffmpeg-static')
/** The boss theme is the bed, the fight's hits sit on top. */
const MUSIC_GAIN = 0.5
const FX_GAIN = 1.1

const run = (cmd, args, label) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', windowsHide: true })
  if (r.status !== 0) { console.error(`${label} failed (exit ${r.status})`); process.exit(r.status ?? 1) }
}

const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : (existsSync(LOGS) ? readdirSync(LOGS).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, '')) : [])
if (!ids.length) { console.error('no sound logs: record the shorts first'); process.exit(1) }
if (!existsSync(MUSIC)) { console.error(`no boss theme at ${MUSIC}`); process.exit(1) }
mkdirSync(FINAL, { recursive: true })
// The wordmark as a PNG (its transparency kept) for the overlay.
const LOGO = join(LOGS, 'logo.png')
run(ffmpeg, ['-y', '-loglevel', 'error', '-i', LOGO_SRC, LOGO], 'reading the logo')

for (const id of ids) {
  const log = join(LOGS, `${id}.json`)
  const picture = readdirSync(OUT).filter(f => f.startsWith(`${id}-shorts-`) && f.endsWith('.mp4')).sort().pop()
  if (!existsSync(log) || !picture) { console.warn(`${id}: no log or no picture, skipped`); continue }
  const { durationMs, events } = JSON.parse(readFileSync(log, 'utf8'))
  const seconds = durationMs / 1000
  console.log(`\n── ${id}: ${events.length} sounds over ${seconds} s ──`)
  const fx = join(LOGS, `${id}.fx.wav`)
  run(process.execPath, [join(ROOT, 'tools/sfx-render.mjs'), log, fx], `${id}: rendering the sounds`)
  const out = join(FINAL, `${id}.mp4`)
  const fadeOut = Math.max(0, seconds - 1.2).toFixed(2)
  const graph = [
    `[3:v][0:v]scale2ref=w=iw*${LOGO_W}:h=ow/mdar[logo][pic]`,
    `[pic][logo]overlay=x=W*${LOGO_MARGIN}:y=W*${LOGO_MARGIN}:format=auto,format=yuv420p[vout]`,
    `[1:a]atrim=0:${seconds.toFixed(3)},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,volume=${MUSIC_GAIN}[mus]`,
    `[2:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=${FX_GAIN},apad,atrim=0:${seconds.toFixed(3)}[fx]`,
    `[mus][fx]amix=inputs=2:normalize=0:duration=first,afade=t=in:st=0:d=0.3,afade=t=out:st=${fadeOut}:d=1.2,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100,alimiter=limit=0.89:attack=2:level=false[aout]`
  ].join(';')
  run(ffmpeg, [
    '-y', '-loglevel', 'error', '-i', join(OUT, picture), '-stream_loop', '-1', '-i', MUSIC, '-i', fx, '-i', LOGO,
    '-filter_complex', graph, '-map', '[vout]', '-map', '[aout]', '-c:v', 'libx264', '-crf', '15', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-t', seconds.toFixed(3), '-movflags', '+faststart', out
  ], `${id}: mixing`)
  console.log(`wrote ${out}`)
}
