#!/usr/bin/env node
/**
 * ─── Promotion covers: in-engine plate → Gemini → portal cover sizes ─────────
 *
 * The art-generation-pipeline's promotion side step, for a 3D game: the plate
 * is not composited from sprites, it is RENDERED — the game's own Flux (his
 * third-person body), the Scrapper and two machines staged in the Scrapyard,
 * framed once per aspect (`tools/promotion/stage-scene.js`). Each plate goes
 * to the Art Desk's Gemini window (same profile, same throttle, same
 * allowance ledger) with the cover prompt, and every deliverable is cut from
 * the master of ITS OWN aspect, then compressed.
 *
 *   pnpm art:promotion                     paint missing masters → cut → compress
 *   pnpm art:promotion --plates --url U    re-stage the plates from a running dev server first
 *   pnpm art:promotion --dry               write the prompt document, paint nothing
 *   pnpm art:promotion --no-generate       cut + compress from what is on disk
 *   pnpm art:promotion --only 1x1,16x9     just these families
 *   pnpm art:promotion --force             repaint these masters (old ones archived)
 *   pnpm art:promotion --keep-window       leave the Gemini window open
 *
 * Rules kept from the skill (PROMOTION.md): no text, no UI and no logo in a
 * cover (portals set the title themselves; the logo ships as its own file in
 * public/images/logo); a size is only ever cut from its own aspect's master;
 * a family with no painting still ships, cut from its plate; the prompt
 * document lives in art-sheets/promotion/, out of the Art Desk's scan.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(ROOT, 'package.json'))
const sharp = require('sharp')
const DIR = join(ROOT, 'art-sheets', 'promotion')
const PAINTED = join(DIR, 'painted')
const OUT = join(ROOT, 'src', 'assets', 'promotion')
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/')

const { values: opt } = parseArgs({
  options: {
    plates: { type: 'boolean', default: false },
    url: { type: 'string' },
    dry: { type: 'boolean', default: false },
    'no-generate': { type: 'boolean', default: false },
    only: { type: 'string' },
    force: { type: 'boolean', default: false },
    'keep-window': { type: 'boolean', default: false },
    profile: { type: 'string' }
  }
})

/** Aspect families: the plate, and every deliverable cut from its master. */
const FAMILIES = {
  '16x9': { plate: [1920, 1080], shape: 'landscape', out: [{ file: '1920x1080.webp', w: 1920, h: 1080 }] },
  '9x16': { plate: [1080, 1920], shape: 'portrait', out: [{ file: '1080x1920.jpg', w: 1080, h: 1920 }] },
  '2x3': { plate: [1024, 1536], shape: 'tall', trim: 0.015, out: [{ file: '800x1200.webp', w: 800, h: 1200 }] },
  '1x1': { plate: [1024, 1024], shape: 'square', out: [{ file: '800x800.webp', w: 800, h: 800 }] }
}
/** Camera and cast placement per family (metres / radians, see stage-scene.js). */
const STAGE = {
  '16x9': { fwd: 1.7, dist: 2.6, camY: 0.5, side: -1.0, bossBack: 5.2, bossSide: 2.0, lookY: 1.7, fov: 60, turn: 0.5, lookMix: 0.45, bossScale: 2.2, extras: [[-3.2, 3.4], [4.4, 2.6]] },
  '9x16': { fwd: 1.7, dist: 3.0, camY: 0.4, side: -0.3, bossBack: 5.4, bossSide: 0.9, lookY: 2.5, fov: 68, turn: 0.35, lookMix: 0.25, bossScale: 2.5, extras: [[-2.0, 3.0], [2.3, 2.2]] },
  '1x1': { fwd: 1.7, dist: 2.8, camY: 0.45, side: -0.6, bossBack: 5.2, bossSide: 1.4, lookY: 2.0, fov: 62, turn: 0.45, lookMix: 0.35, bossScale: 2.3, extras: [[-2.6, 3.2], [3.2, 2.4]] },
  '2x3': { fwd: 1.7, dist: 2.9, camY: 0.42, side: -0.4, bossBack: 5.3, bossSide: 1.1, lookY: 2.3, fov: 64, turn: 0.4, lookMix: 0.3, bossScale: 2.4, extras: [[-2.2, 3.0], [2.6, 2.3]] }
}
const families = (opt.only ? opt.only.split(',') : Object.keys(FAMILIES)).filter((f) => FAMILIES[f])
const plateOf = (f) => join(DIR, `cover-${f}.png`)
const masterOf = (f) => join(PAINTED, `cover-${f}.jpg`)

// ── The prompt ──────────────────────────────────────────────────────────────

const SHOT = {
  landscape: `THE SHOT — WIDE 16:9. Flux stands left of centre, big: from boots to antenna he fills at least 70% of the frame's height, his arm cannon thrust toward the right third where the Scrapper looms. The Scrapper fills the right half, towering, cropped by the top edge, its hammer fist raised overhead and its crane claw reaching toward Flux. The two machines scatter behind on the left, smaller and softer. Use the width: speed lines and flung scrap sweep from the edges toward Flux's glowing cannon.`,
  portrait: `THE SHOT — TALL 9:16, read top to bottom as ONE vertical gesture, NOT a landscape laid on its side. Top: the Scrapper's red eye and raised hammer fist, cropped by the top edge, coming DOWN. Middle: the blazing amber charge at the muzzle of Flux's cannon, aimed UP at it — the brightest point of the whole image, in the upper-middle. Bottom half: Flux, huge, low heroic angle, boots planted, filling the full width. The machines are small, at the side edges, half cropped.`,
  tall: `THE SHOT — TALL 2:3, a poster. Flux fills the lower two thirds, big and centred a little left, low heroic angle, cannon raised toward the upper right. The Scrapper looms over him from behind in the upper half, hammer fist raised, red eye glowing, cropped by the top edge. The machines at the side edges, smaller.`,
  square: `THE SHOT — SQUARE 1:1, a store tile read at 250 px. Fewer things, each bigger: Flux's head, visor and arm cannon fill the lower-left two thirds, the cannon's charging muzzle near the centre; the Scrapper's head and raised hammer fist fill the upper right, cropped by the frame. One machine at most, small, behind.`
}

const promptFor = (f) => {
  const fam = FAMILIES[f]
  const [w, h] = fam.plate
  return `Create a brand-NEW image (do not edit the attached picture — it is only a reference for who is in the scene): ONE finished key-art cover illustration for a video game — a single full-bleed illustration, ${w}×${h} px (${f.replace('x', ':')}), PNG, edge to edge, with NO text, NO letters, NO title, NO logo, NO numbers, NO UI, NO buttons, NO borders or frames.

WHAT IT IS NOT: not a comic page, not a screenshot, not a collage of panels, not a character sheet, not the attached plate with filters on it. Nothing written anywhere: the store page sets the game's name over the cover itself.

READ THE ATTACHED PLATE. It is a render from the game itself. TAKE from it: who is in the scene, what each one looks like (shapes, colours, proportions, outlines), roughly where each stands, and the world (the Scrapyard arena: olive-green riveted steel walls with yellow capped posts and rails, rusty orange pipes, a pale steel-tile floor, open blue sky). CHANGE everything else: the plate is stiff, evenly lit and posed like a toy on a shelf — the job is to turn it into an explosive, dramatic poster.

WHO IS IN IT — keep these designs exactly, they are the game's characters:
- FLUX, the hero: a small, sturdy, chibi-proportioned robot. A big ROUND pearl-white helmet (a smooth dome — no horns, no ears, no fins, no pointed crest) with a wide BLACK visor band across it and two big ROUND glowing AMBER eyes in the visor, a tiny antenna with an amber tip. White rounded armour plates over a black undersuit, an amber hexagon reactor glowing on his chest, chunky white boots. His right arm is a large white ARM CANNON with a glowing amber muzzle. Determined, fearless: his amber eyes narrowed into a fierce squint.
- THE SCRAPPER, the boss: a hulking scrap mech three times Flux's height. A round dome body in hazard yellow with dark grey shoulder spheres, a glowing RED visor slit and a red warning light on top, rusty orange joints. One arm ends in a red crane hook claw, the other in a massive black hydraulic hammer fist with yellow rims.
- Two small machines, the supporting cast: a green SHIELD TROOPER hiding behind a big round grey shield with a green glowing core, and a yellow HARD-HAT dome robot. Keep them small and behind.

THE MOMENT — the second BEFORE the hit. Flux's cannon is charging a blazing amber-white energy ball at the muzzle, crackling, about to fire; the Scrapper's hammer fist is raised to smash down. Nothing has landed yet: all tension.

HIGH-CTR RULES (this image must win a click at 250 px wide, in a grid of forty other games, in a fifth of a second):
- One subject, enormous: Flux and the threat fill most of the frame. No busy crowd.
- The face is the hook: Flux's visor and amber eyes are large, crisp and readable.
- Maximum contrast where the eye lands: the amber-white glow of the charging shot against the Scrapper's red eye and the deep shadow behind — the two brightest, most saturated colours meet at the focal point and nowhere else.
- Everything points at it: speed lines, flung sparks and scrap, the Scrapper's arm, dust — every line leads to the cannon's glow.
- Three planes of depth: something large, sharp and cropped by the frame in front (a flying bolt, a spark burst, a scrap chunk); the subjects crisp in the middle; a softer, hazier background.
- Quiet edge, bright centre: the arena darkens and desaturates toward the corners; warm rim light on Flux from the charge, a cool blue sky behind.
- Nothing important within the outer eighth of the image on any side.

${SHOT[fam.shape]}

STYLE: the game's own look pushed to premium key art — bright, glossy, toy-like 3D cartoon rendering with clean thick dark-navy outlines, smooth soft shading, saturated primaries, crisp specular highlights, cinematic lighting and atmosphere (glow, sparks, motion blur on flying debris). This image is NOT composited over anything: it IS the floor, the light and the shadows, out to all four edges — cast shadows, contact shadows and a vignette are welcome.

CHECK BEFORE YOU ANSWER: exactly ONE image · ${w}×${h}, ${f.replace('x', ':')} · Flux with a ROUND white helmet, black visor, round amber eyes, white arm cannon · the yellow Scrapper with red eye, hook claw and hammer fist · no text, no letters, no numbers, no logo, no UI, no frame anywhere.

OUTPUT: one PNG image, ${w}×${h} px, aspect ${f.replace('x', ':')}, full bleed.`
}

const writeDoc = () => {
  const doc = ['# Promotion covers — prompts', '', 'Written by `pnpm art:promotion`. Attach `cover-<aspect>.png` with each prompt.', '']
  for (const f of Object.keys(FAMILIES)) doc.push(`## cover-${f}`, '', '```text', promptFor(f), '```', '')
  writeFileSync(join(DIR, 'PROMPTS-promotion.md'), doc.join('\n'))
}

// ── Plates (optional re-stage from a running dev server) ───────────────────

if (opt.plates) {
  if (!opt.url) throw new Error('--plates needs --url <dev server>, e.g. --url http://localhost:5173/')
  for (const f of families) {
    const [w, h] = FAMILIES[f].plate
    const r = spawnSync(process.execPath, [join(ROOT, 'tools', 'promotion', 'stage.mjs'), opt.url, String(w), String(h), plateOf(f), join(ROOT, 'tools', 'promotion', 'stage-scene.js')], {
      stdio: 'inherit', env: { ...process.env, PLATE: JSON.stringify(STAGE[f]) }
    })
    if (r.status !== 0) throw new Error(`staging ${f} failed`)
  }
}

mkdirSync(PAINTED, { recursive: true })
writeDoc()
for (const f of families) if (!existsSync(plateOf(f))) throw new Error(`no plate ${rel(plateOf(f))} — run with --plates --url <dev server>`)

if (opt.dry) {
  console.log(`prompt document: ${rel(join(DIR, 'PROMPTS-promotion.md'))}`)
  process.exit(0)
}

// ── Paint ───────────────────────────────────────────────────────────────────

const todo = families.filter((f) => opt.force || !existsSync(masterOf(f)))
let stopped = null
if (!opt['no-generate'] && todo.length) {
  const { loadConfig } = await import(pathToFileURL(join(ROOT, 'tools', 'art-desk', 'config.mjs')).href)
  const { Gemini } = await import(pathToFileURL(join(ROOT, 'tools', 'art-desk', 'gemini.mjs')).href)
  const { ledger } = await import(pathToFileURL(join(ROOT, 'tools', 'art-desk', 'usage.mjs')).href)
  const cfg = loadConfig(ROOT)
  let g = cfg.gemini
  if (opt.profile) {
    const { homedir } = await import('node:os')
    const profileDir = join(homedir(), '.art-desk', 'profiles', opt.profile)
    g = { ...g, profileDir, usageFile: join(profileDir, 'art-desk-usage.json') }
  }
  const { countGeneration, usedToday } = ledger(g.usageFile)
  const painter = new Gemini({
    root: ROOT, profileDir: g.profileDir, url: g.url, chrome: g.chrome, chromeArgs: g.chromeArgs,
    log: (line, level) => console.log(`    ${level === 'err' ? '! ' : ''}${line}`)
  })
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  console.log(`painting ${todo.length} cover master(s)  (${usedToday()} generations today, cap ${g.dailyCap})`)
  for (const [i, f] of todo.entries()) {
    if (usedToday() >= g.dailyCap) { stopped = 'daily cap reached'; break }
    if (i > 0) await sleep(Math.round(g.gapSeconds + Math.random() * g.jitterSeconds) * 1000)
    console.log(`  → cover-${f}`)
    let attempt = 0
    for (;;) {
      let last = ''
      try {
        // A JPEG copy as a character REFERENCE: a big PNG attached as the
        // main image reads as an edit request and Gemini refuses or errors.
        const ref = join(PAINTED, '..', `ref-${f}.jpg`)
        await sharp(plateOf(f)).resize({ width: 1280, height: 1280, fit: 'inside' }).jpeg({ quality: 88 }).toFile(ref)
        const { bytes } = await painter.paint({
          refFile: null, styleFiles: [ref], prompt: promptFor(f), timeoutMs: g.timeoutSeconds * 1000,
          onPhase: (phase, quiet) => { if (!(quiet && phase === last)) { last = phase; console.log(`    ${phase}`) } }
        })
        const dest = masterOf(f)
        if (existsSync(dest)) {
          const to = join(PAINTED, 'replaced', `cover-${f}.${Date.now()}.jpg`)
          mkdirSync(dirname(to), { recursive: true })
          renameSync(dest, to)
        }
        // Stored as JPEG whatever came back (the free web app returns JPEG anyway).
        await sharp(bytes).jpeg({ quality: 95, chromaSubsampling: '4:4:4' }).toFile(dest)
        countGeneration()
        console.log(`    ✓ ${rel(dest)}`)
        break
      } catch (e) {
        if (e.counted) countGeneration()
        console.log(`    ! cover-${f} failed: ${e.code ?? ''} ${e.message}`)
        if (['QUOTA', 'SIGNED_OUT', 'CONSENT', 'BROWSER'].includes(e.code)) { stopped = `${e.code}: ${e.message}`; break }
        if (++attempt <= g.retries && ['NO_IMAGE', 'TIMEOUT'].includes(e.code)) { console.log('    re-rolling once'); continue }
        break
      }
    }
    if (stopped) break
  }
  if (!opt['keep-window']) await painter.closeWindow().catch(() => {})
}

// ── Cut + compress ──────────────────────────────────────────────────────────

mkdirSync(OUT, { recursive: true })
const written = []
for (const f of families) {
  const painted = existsSync(masterOf(f))
  const src = painted ? masterOf(f) : plateOf(f)
  for (const o of FAMILIES[f].out) {
    const dest = join(OUT, o.file)
    // `trim`: a painted master that came back with a drawn frame loses its
    // outer edge (a share of each side) before the cut — no frames on a cover.
    const meta = await sharp(src).metadata()
    const t = painted ? (FAMILIES[f].trim ?? 0) : 0
    const box = { left: Math.round(meta.width * t), top: Math.round(meta.height * t), width: Math.round(meta.width * (1 - 2 * t)), height: Math.round(meta.height * (1 - 2 * t)) }
    const img = sharp(src).extract(box).resize(o.w, o.h, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    if (o.file.endsWith('.webp')) await img.webp({ quality: 92, smartSubsample: true }).toFile(dest)
    else await img.jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(dest)
    written.push(dest)
    console.log(`  ${painted ? 'painted' : 'PLATE (not painted yet)'} → ${rel(dest)}`)
  }
}
if (written.length) {
  // Absolute: the compressor resolves --only from its own working directory.
  const only = written.flatMap((p) => ['--only', p])
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'compress-images.mjs'), OUT, '--backup-dir', 'promotion-backup', '--fresh', ...only], { stdio: 'inherit', cwd: ROOT })
  if (r.status !== 0) console.log('! compression failed — the deliverables stand uncompressed')
}
if (stopped) { console.log(`stopped: ${stopped}`); process.exit(1) }
