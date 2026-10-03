#!/usr/bin/env node
/**
 * Every store cover, cut from the painted masters (roadmap #1).
 *
 *   node --import ./tools/ts-resolve.mjs store-art/covers.mjs                 # all four scenarios
 *   node --import ./tools/ts-resolve.mjs store-art/covers.mjs --only clash    # one
 *   node --import ./tools/ts-resolve.mjs store-art/covers.mjs --compress      # …then compress what it wrote
 *   node --import ./tools/ts-resolve.mjs store-art/covers.mjs --compare       # + the side-by-side sheet
 *
 * Per scenario (`src/game/art/coverScenes.ts`) it writes, into
 * `store-art/covers/<scenario>/`, every size of `COVER_SIZES` in exactly the
 * formats listed, as `cover_<w>x<h>.<ext>` and/or `cover-logo_<w>x<h>.<ext>`,
 * plus `contact-sheet.jpg` (every file on one page, for review).
 *
 * WHERE EACH SIZE COMES FROM — a size is cut from a master of its own family:
 *   16:9  `art-sheets/painted/cover-<id>.{jpg,png,webp}` (the Art Desk's file)
 *   1:1   `art-sheets/painted/cover-sq-<id>.*`, when it has been painted
 *   9:16  `art-sheets/painted/cover-tall-<id>.*`, when it has been painted
 * A family with no painting falls back to a crop of the 16:9 (centred on the
 * scene's focal box), and a scenario with no painting at all to its reference
 * plate (`art-sheets/cover-<id>.png`), so the folder is never half a folder.
 * The contact sheet says which source every file came from.
 *
 * THE LOGO is the game's own: the painted badge (`public/images/logo/emblem.webp`)
 * beside the code-drawn BATTLE / CROSS letters of the splash lockup
 * (`store-art/brand/logo-lockup.svg`), never painted into a cover. It goes in
 * the scene's logo box (lower left) on landscape sizes and bottom-centre on
 * square and portrait ones: never the top-left, where CrazyGames lays its badges.
 *
 * Node and sharp only, no browser. Written generously (jpeg 92 4:4:4, webp 92)
 * so the compressor is the one place that picks a bitrate.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'store-art', 'covers')
const args = process.argv.slice(2)
const flag = (f) => args.includes(f)
const onlyAt = args.indexOf('--only')
const ONLY = onlyAt >= 0 ? new Set(String(args[onlyAt + 1] ?? '').split(',')) : null

const { COVER_SCENES, COVER_SIZES, CG_BANNER, cropBox } = await import(pathToFileURL(join(ROOT, 'src', 'game', 'art', 'coverScenes.ts')).href)

// ─── Sources ────────────────────────────────────────────────────────────────

const painted = (stem) => ['jpg', 'jpeg', 'png', 'webp'].map((e) => join(ROOT, 'art-sheets', 'painted', `${stem}.${e}`)).find(existsSync) ?? null

/** The master for one family of one scenario, and where it came from. */
const masterOf = (scene, family) => {
  const own = family === '16x9' ? painted(scene.stem) : painted(`cover-${family === '1x1' ? 'sq' : 'tall'}-${scene.id}`)
  if (own) return { file: own, how: family === '16x9' ? 'painted' : `painted ${family}`, own: true }
  const wide = painted(scene.stem)
  if (wide) return { file: wide, how: `crop of the painted 16:9`, own: false }
  const plate = join(ROOT, 'art-sheets', `${scene.stem}.png`)
  if (existsSync(plate)) return { file: plate, how: family === '16x9' ? 'reference plate (not painted yet)' : 'crop of the reference plate', own: false }
  throw new Error(`${scene.stem}: no painting and no reference plate — export it from /#/art-sheets first`)
}

// ─── The logo: painted badge + code-drawn letters, side by side ─────────────

/** The splash lockup with its drawn badge taken out: the wordmark alone. */
const wordmarkSvg = () => {
  const svg = readFileSync(join(ROOT, 'store-art', 'brand', 'logo-lockup.svg'), 'utf8')
  const open = svg.indexOf('<g stroke-linejoin="round">') + '<g stroke-linejoin="round">'.length
  // The wordmark is every path from the first one leaning like the bar.
  const firstWord = svg.lastIndexOf('<path', svg.indexOf('matrix(1 0 -.213 1'))
  if (open < 30 || firstWord < open) throw new Error('logo-lockup.svg: the wordmark was not found')
  return svg.slice(0, open) + svg.slice(firstWord)
}

let logoCache = null
/** The horizontal store logo, as a transparent PNG about 1600 px wide. */
const logoPng = async () => {
  if (logoCache) return logoCache
  const H = 520
  const words = await sharp(Buffer.from(wordmarkSvg()), { density: 600 }).trim().png().toBuffer()
  const wm = await sharp(words).metadata()
  const wordsH = Math.round(H * 0.82)
  const wordsW = Math.round((wm.width * wordsH) / wm.height)
  const badge = await sharp(join(ROOT, 'public', 'images', 'logo', 'emblem.webp')).trim().resize(H, H, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  const gap = Math.round(H * 0.04)
  const W = H + gap + wordsW
  logoCache = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: badge, left: 0, top: 0 },
      { input: await sharp(words).resize(wordsW, wordsH).png().toBuffer(), left: H + gap, top: Math.round((H - wordsH) / 2) }
    ])
    .png()
    .toBuffer()
  return logoCache
}

/** Where the logo goes on a w x h cover, and how wide: readable at 400 x 225. */
const logoPlace = (scene, w, h, aspect) => {
  const landscape = w / h > 1.2
  const small = Math.min(w, h) <= 450
  const width = Math.round(w * (landscape ? (small ? 0.44 : 0.36) : small ? 0.62 : 0.56))
  const margin = Math.round(Math.min(w, h) * 0.045)
  const lh = Math.round(width / aspect)
  if (landscape) return { width, left: Math.max(margin, Math.round(scene.logo.x * w)), top: h - lh - margin }
  return { width, left: Math.round((w - width) / 2), top: h - lh - margin }
}

/** A soft dark pool under the logo, so it reads on any painting. */
const shade = (w, h, p, lh) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><radialGradient id="s" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#0a1224" stop-opacity=".55"/><stop offset="1" stop-color="#0a1224" stop-opacity="0"/></radialGradient></defs>` +
  `<ellipse cx="${p.left + p.width / 2}" cy="${p.top + lh / 2}" rx="${p.width * 0.68}" ry="${lh * 1.05}" fill="url(#s)"/></svg>`
)

// ─── Cutting ────────────────────────────────────────────────────────────────

/** One size of one scenario: [bare, withLogo] PNG buffers at exactly w x h. */
const cut = async (scene, size) => {
  const src = masterOf(scene, size.family)
  const img = sharp(src.file)
  const { width: mw, height: mh } = await img.metadata()
  // An own-family master is a pure resize; anything else is a focal crop.
  const box = cropBox(mw, mh, size.w / size.h, scene.focal)
  let pipe = sharp(src.file).extract(box).resize(size.w, size.h, { fit: 'cover', kernel: 'lanczos3' })
  if (size.w <= 800) pipe = pipe.sharpen({ sigma: size.w <= 512 ? 0.7 : 0.5 })
  const bare = await pipe.png().toBuffer()
  const logo = await logoPng()
  const lm = await sharp(logo).metadata()
  const p = logoPlace(scene, size.w, size.h, lm.width / lm.height)
  const lh = Math.round(p.width / (lm.width / lm.height))
  const withLogo = await sharp(bare)
    .composite([
      { input: shade(size.w, size.h, p, lh), left: 0, top: 0 },
      { input: await sharp(logo).resize(p.width, lh).png().toBuffer(), left: p.left, top: p.top }
    ])
    .png()
    .toBuffer()
  return { bare, withLogo, how: src.how }
}

const encode = (buf, fmt) => (fmt === 'jpg'
  ? sharp(buf).flatten({ background: '#0a1224' }).jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true }).toBuffer()
  : sharp(buf).webp({ quality: 92, effort: 5 }).toBuffer())

// ─── Contact sheet ──────────────────────────────────────────────────────────

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const label = (text, w, size = 22, colour = '#ffffff') => sharp(Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${size + 12}"><text x="0" y="${size}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" fill="${colour}">${esc(text)}</text></svg>`
)).png().toBuffer()

/** Tiles laid out in rows of at most `maxW` px, each with a caption under it. */
const sheet = async (title, tiles, file, { maxW = 2400, bg = '#1b1d2a', ink = '#ffffff', sub = '#c8cce0' } = {}) => {
  const pad = 24
  const comps = []
  let x = pad
  let y = pad + 48
  let rowH = 0
  comps.push({ input: await label(title, maxW - 2 * pad, 32, ink), left: pad, top: pad })
  for (const t of tiles) {
    const m = await sharp(t.input).metadata()
    if (x + m.width > maxW - pad && x > pad) { x = pad; y += rowH + 48; rowH = 0 }
    comps.push({ input: t.input, left: x, top: y })
    comps.push({ input: await label(t.caption, Math.max(m.width, 260), 18, sub), left: x, top: y + m.height + 6 })
    x += m.width + pad
    rowH = Math.max(rowH, m.height)
  }
  const H = y + rowH + 48 + pad
  await sharp({ create: { width: maxW, height: H, channels: 3, background: bg } }).composite(comps).jpeg({ quality: 86, mozjpeg: true }).toFile(file)
}

// ─── Run ────────────────────────────────────────────────────────────────────

const written = []
for (const scene of COVER_SCENES) {
  if (ONLY && !ONLY.has(scene.id) && !ONLY.has(scene.stem)) continue
  const dir = join(OUT, scene.id)
  mkdirSync(dir, { recursive: true })
  const tiles = []
  for (const size of COVER_SIZES) {
    const { bare, withLogo, how } = await cut(scene, size)
    for (const [variant, buf] of size.logo === 'both' ? [['cover', bare], ['cover-logo', withLogo]] : [['cover-logo', withLogo]]) {
      for (const fmt of size.formats) {
        const name = `${variant}_${size.w}x${size.h}.${fmt}`
        const data = await encode(buf, fmt)
        writeFileSync(join(dir, name), data)
        written.push(join(dir, name))
      }
      // The sheet shows each file at a third of its size (never under 200 px wide).
      const scale = Math.max(200 / size.w, Math.min(1, 1 / 3))
      tiles.push({ input: await sharp(buf).resize(Math.round(size.w * scale)).png().toBuffer(), caption: `${variant}_${size.w}x${size.h} ${size.formats.join('+')} · ${how}` })
    }
  }
  await sheet(`${scene.stem} — ${scene.hook}`, tiles, join(dir, 'contact-sheet.jpg'))
  console.log(`${scene.id}: ${COVER_SIZES.length} sizes → ${relative(ROOT, dir)} (+ contact-sheet.jpg) · 16:9 from ${masterOf(scene, '16x9').how}`)
}

if (flag('--compress') && written.length) {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'compress-images.mjs'), OUT, '--backup-dir', join(ROOT, 'store-art', 'covers-backup'), '--fresh', '--only', written.join(',')], { cwd: ROOT, stdio: 'inherit', windowsHide: true })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

// ─── The comparison: the covers as a portal shows them ──────────────────────
//
// Each 16:9 at 280 px and each 1:1 at 200 px, on a dark (CrazyGames) and a
// light (Poki-like) page, under a mock badge in the CrazyGames corner. Row 1
// is the baseline: what a cover made from a gameplay screenshot looks like.
if (flag('--compare')) {
  const badge = (w, h) => Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect x="${w * 0.03}" y="${h * 0.05}" width="${w * CG_BANNER.w * 0.62}" height="${h * CG_BANNER.h * 0.62}" rx="${h * 0.04}" fill="#ff3d6e"/>` +
    `<text x="${w * 0.06}" y="${h * 0.05 + h * CG_BANNER.h * 0.45}" font-family="Segoe UI, Arial" font-weight="700" font-size="${Math.min(h * 0.075, (w * CG_BANNER.w * 0.62) / 8)}" fill="#fff">HOT · UPDATED</text></svg>`
  )
  const tile = async (file, w, h) => {
    const b = await sharp(file).resize(w, h, { fit: 'cover' }).png().toBuffer()
    return sharp(b).composite([{ input: badge(w, h), left: 0, top: 0 }]).png().toBuffer()
  }
  const rows = []
  const base = join(OUT, 'baseline', 'gameplay.png')
  if (existsSync(base)) rows.push({ name: 'baseline: a gameplay screenshot', wide: base, square: base })
  for (const s of COVER_SCENES) {
    const d = join(OUT, s.id)
    if (existsSync(join(d, 'cover_1920x1080.jpg'))) rows.push({ name: `${s.id} (16:9 from ${masterOf(s, '16x9').how})`, wide: join(d, 'cover_1920x1080.jpg'), square: join(d, 'cover_800x800.jpg') })
  }
  for (const [bg, name] of [['#1b1d2a', 'dark'], ['#83ffe7', 'light']]) {
    const tiles = []
    for (const r of rows) {
      tiles.push({ input: await tile(r.wide, 280, 158), caption: `${r.name} · 280 px` })
      tiles.push({ input: await tile(r.square, 200, 200), caption: '1:1 · 200 px' })
      tiles.push({ input: await sharp(r.wide).resize(160, 90, { fit: 'cover' }).png().toBuffer(), caption: '160 px (list)' })
    }
    await sheet(`Covers at portal size, ${name} page, under a mock CrazyGames badge`, tiles, join(OUT, `comparison-${name}.jpg`), { maxW: 1000, bg, ...(name === 'light' ? { ink: '#1b1d2a', sub: '#24324a' } : {}) })
  }
  console.log(`comparison → ${relative(ROOT, OUT)}/comparison-dark.jpg, comparison-light.jpg`)
}
