#!/usr/bin/env node
/**
 * ─── World map stitcher ─────────────────────────────────────────────────────
 *
 * The painter returns 1376 px at most, which a phone's 3x screen stretches into
 * mush. So the world map is also painted as four overlapping quarters
 * (`MAP_PARTS` in `src/game/art/artSheet.ts`, sliced into `art-sheets/map-parts/`),
 * and this joins them into the one sheet the game loads, `public/images/ui/map.webp`,
 * at about 2500 px.
 *
 *   pnpm art:stitch-map                 # join the four, write the map
 *   pnpm art:stitch-map --seams <png>   # also write a copy with the cuts drawn in
 *   pnpm art:stitch-map --dry           # measure and report, write nothing
 *   pnpm art:stitch-map --parts <dir> --out <file>   # other quarters, elsewhere
 *
 * HOW IT JOINS THEM
 *
 * Four separate paintings never agree to the pixel, so a plain cross-fade over
 * the shared strip ghosts every tree that moved. Instead:
 *   1. colour: each quarter gets one gain per channel, solved so that the
 *      shared strips agree on average (a quarter painted a shade warmer is
 *      pulled toward its neighbours, never all toward one);
 *   2. the cut: through each shared strip, the path along which the two
 *      paintings differ least (dynamic programming, one pixel of drift per
 *      row), kept away from the strip's own edges;
 *   3. a narrow feather across that path, so the cut has no hard step.
 * Left and right halves are joined top to bottom first, then side by side.
 *
 * A SUBDIVIDED QUARTER (`MAP_SUBDIVIDED`) is painted as four pieces, laid out
 * inside it exactly as the quarters are inside the map; they are joined the
 * same way into the quarter's own file (`map-parts/<q>/` → `map-parts/<q>.webp`)
 * before the quarters are. `--seams x.png` also writes `x-<q>.png` for it.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (f) => args.includes(f)
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null }
const DRY = flag('--dry')
const SEAMS = opt('--seams')
const OUT = resolve(ROOT, opt('--out') ?? 'public/images/ui/map.webp')
const PARTS = opt('--parts')
/** Half-width of the feather across the cut, px. */
const FEATHER = 14

const index = JSON.parse(readFileSync(join(ROOT, 'art-sheets', 'sheet-index.json'), 'utf8'))
const parts = (index.scenery ?? []).filter((a) => a.part && !a.sub)
// The pieces of a subdivided quarter: joined into it first, by this same
// script over their own folder (never from inside such a run).
if (!PARTS) {
  for (const q of new Set((index.scenery ?? []).filter((a) => a.sub).map((a) => a.part.name))) {
    const dir = join(ROOT, 'art-sheets', 'map-parts', q)
    console.log(`quarter ${q}, from its four pieces:`)
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--parts', dir, '--out', join(ROOT, 'art-sheets', 'map-parts', `${q}.webp`),
      ...(SEAMS ? ['--seams', SEAMS.replace(/(\.png)?$/i, `-${q}.png`)] : []), ...(DRY ? ['--dry'] : [])], { stdio: 'inherit' })
    if (r.status !== 0) process.exit(r.status ?? 1)
  }
}
if (parts.length !== 4) {
  console.error(`expected four map quarters in the index, found ${parts.length} — run pnpm art:prompts`)
  process.exit(1)
}
const W = parts[0].width
const H = parts[0].height
const span = parts[0].part.span
const FW = Math.round(W / span)
const FH = Math.round(H / span)
const byName = Object.fromEntries(parts.map((a) => [a.part.name, a]))

/** A quarter's pixels as floats, RGB, at its declared size. */
const load = async (a) => {
  const file = PARTS ? resolve(PARTS, `${a.part.name}.webp`) : resolve(ROOT, 'public', a.target)
  if (!existsSync(file)) {
    console.error(`missing ${a.target.replace(/^\.\.\//, '')} — paint and slice ${a.id} first`)
    process.exit(1)
  }
  const { data, info } = await sharp(file).removeAlpha().resize(W, H, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true })
  if (info.channels !== 3) throw new Error(`${a.id}: ${info.channels} channels`)
  return Float32Array.from(data)
}

const img = {}
for (const n of ['nw', 'ne', 'sw', 'se']) img[n] = await load(byName[n])
const at = { nw: [0, 0], ne: [FW - W, 0], sw: [0, FH - H], se: [FW - W, FH - H] }

// ── 1. Colour: one gain per quarter and channel ─────────────────────────────
// Each shared strip gives one equation per channel, log g_a + log m_a =
// log g_b + log m_b, plus "the gains average to one". Least squares, 4 unknowns.
const meanIn = (n, x0, y0, x1, y1) => {
  // x0..y1 in map coordinates; the quarter's own pixels inside that box.
  const [ox, oy] = at[n]
  const s = [0, 0, 0]
  let k = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = ((y - oy) * W + (x - ox)) * 3
      s[0] += img[n][i]; s[1] += img[n][i + 1]; s[2] += img[n][i + 2]
      k++
    }
  }
  return s.map((v) => v / k)
}
const ox0 = FW - W // where the right halves start
const ox1 = W // where the left halves end
const oy0 = FH - H
const oy1 = H
const strips = [
  ['nw', 'ne', ox0, 0, ox1, oy0],
  ['sw', 'se', ox0, oy1, ox1, FH],
  ['nw', 'sw', 0, oy0, ox0, oy1],
  ['ne', 'se', ox1, oy0, FW, oy1],
  ['nw', 'se', ox0, oy0, ox1, oy1],
  ['ne', 'sw', ox0, oy0, ox1, oy1]
]
const NAMES = ['nw', 'ne', 'sw', 'se']
const gains = { nw: [1, 1, 1], ne: [1, 1, 1], sw: [1, 1, 1], se: [1, 1, 1] }
const report = []
for (let c = 0; c < 3; c++) {
  // Normal equations of A g = b, with a last row sum(g) = 0.
  const rows = []
  for (const [a, b, x0, y0, x1, y1] of strips) {
    const ma = meanIn(a, x0, y0, x1, y1)[c]
    const mb = meanIn(b, x0, y0, x1, y1)[c]
    const r = [0, 0, 0, 0]
    r[NAMES.indexOf(a)] = 1
    r[NAMES.indexOf(b)] = -1
    rows.push([r, Math.log(mb + 1) - Math.log(ma + 1)])
  }
  rows.push([[1, 1, 1, 1], 0])
  const M = Array.from({ length: 4 }, () => [0, 0, 0, 0, 0])
  for (const [r, v] of rows) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) M[i][j] += r[i] * r[j]
      M[i][4] += r[i] * v
    }
  }
  for (let i = 0; i < 4; i++) {
    let p = i
    for (let k = i + 1; k < 4; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k
    ;[M[i], M[p]] = [M[p], M[i]]
    for (let k = 0; k < 4; k++) {
      if (k === i) continue
      const f = M[k][i] / M[i][i]
      for (let j = i; j < 5; j++) M[k][j] -= f * M[i][j]
    }
  }
  NAMES.forEach((n, i) => { gains[n][c] = Math.exp(M[i][4] / M[i][i]) })
}
for (const n of NAMES) {
  const g = gains[n]
  report.push(`  ${n}: gain r ${g[0].toFixed(3)} g ${g[1].toFixed(3)} b ${g[2].toFixed(3)}`)
  const px = img[n]
  for (let i = 0; i < px.length; i += 3) {
    px[i] = Math.min(255, px[i] * g[0])
    px[i + 1] = Math.min(255, px[i + 1] * g[1])
    px[i + 2] = Math.min(255, px[i + 2] * g[2])
  }
}

// ── 2 + 3. The cut and the feather ──────────────────────────────────────────

/** Box blur of a single-channel image, radius r, both directions. */
const blur = (src, w, h, r) => {
  const tmp = new Float32Array(w * h)
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    let s = 0
    for (let x = -r; x <= r; x++) s += src[y * w + Math.min(w - 1, Math.max(0, x))]
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = s / (2 * r + 1)
      s += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)]
    }
  }
  for (let x = 0; x < w; x++) {
    let s = 0
    for (let y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]
    for (let y = 0; y < h; y++) {
      out[y * w + x] = s / (2 * r + 1)
      s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]
    }
  }
  return out
}

/**
 * Join A (left) and B (right), both `h` rows, overlapping on `ov` columns:
 * A's last `ov` columns are B's first. Returns the joined image and the cut
 * (one column per row, in overlap coordinates).
 */
const joinSideBySide = (A, aw, B, bw, h, ov) => {
  // How much the two differ, per overlap pixel, softened so that a cut prefers
  // calm ground to the gap between two leaves.
  const diff = new Float32Array(ov * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < ov; x++) {
      const ia = (y * aw + (aw - ov + x)) * 3
      const ib = (y * bw + x) * 3
      diff[y * ov + x] = Math.abs(A[ia] - B[ib]) + Math.abs(A[ia + 1] - B[ib + 1]) + Math.abs(A[ia + 2] - B[ib + 2])
    }
  }
  const cost = blur(diff, ov, h, 3)
  // Keep the cut and its feather inside the strip.
  const lo = FEATHER + 4
  const hi = ov - FEATHER - 5
  const acc = new Float32Array(ov * h).fill(Infinity)
  const from = new Int8Array(ov * h)
  for (let x = lo; x <= hi; x++) acc[x] = cost[x]
  for (let y = 1; y < h; y++) {
    for (let x = lo; x <= hi; x++) {
      let best = acc[(y - 1) * ov + x]
      let d = 0
      if (x > lo && acc[(y - 1) * ov + x - 1] < best) { best = acc[(y - 1) * ov + x - 1]; d = -1 }
      if (x < hi && acc[(y - 1) * ov + x + 1] < best) { best = acc[(y - 1) * ov + x + 1]; d = 1 }
      acc[y * ov + x] = best + cost[y * ov + x]
      from[y * ov + x] = d
    }
  }
  const cut = new Int32Array(h)
  let x = lo
  for (let k = lo; k <= hi; k++) if (acc[(h - 1) * ov + k] < acc[(h - 1) * ov + x]) x = k
  for (let y = h - 1; y >= 0; y--) {
    cut[y] = x
    x += from[y * ov + x]
  }
  // The cut, smoothed a little so the feather does not zigzag.
  const sm = new Float32Array(h)
  for (let y = 0; y < h; y++) {
    let s = 0
    let k = 0
    for (let d = -6; d <= 6; d++) { const yy = y + d; if (yy >= 0 && yy < h) { s += cut[yy]; k++ } }
    sm[y] = s / k
  }
  const w = aw + bw - ov
  const out = new Float32Array(w * h * 3)
  let mismatch = 0
  for (let y = 0; y < h; y++) {
    mismatch += cost[y * ov + cut[y]]
    for (let X = 0; X < w; X++) {
      const xo = X - (aw - ov) // overlap coordinate
      let t // weight of B
      if (xo < 0) t = 0
      else if (xo >= ov) t = 1
      else {
        const u = (xo - sm[y] + FEATHER) / (2 * FEATHER)
        t = u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u)
      }
      const o = (y * w + X) * 3
      const ia = (y * aw + Math.min(X, aw - 1)) * 3
      const ib = (y * bw + Math.max(0, X - (aw - ov))) * 3
      for (let c = 0; c < 3; c++) out[o + c] = (xo < ov ? A[ia + c] : 0) * (1 - t) + (xo >= 0 ? B[ib + c] : 0) * t
    }
  }
  return { out, w, cut: Float32Array.from(sm), mismatch: mismatch / h / 3 }
}

/** Swap rows and columns, so a top/bottom join is a side-by-side one. */
const transpose = (src, w, h) => {
  const out = new Float32Array(w * h * 3)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3
      const o = (x * h + y) * 3
      out[o] = src[i]; out[o + 1] = src[i + 1]; out[o + 2] = src[i + 2]
    }
  }
  return out
}

const ovY = 2 * H - FH
const ovX = 2 * W - FW
const halves = {}
const cuts = []
for (const [side, top, bottom] of [['left', 'nw', 'sw'], ['right', 'ne', 'se']]) {
  const j = joinSideBySide(transpose(img[top], W, H), H, transpose(img[bottom], W, H), H, W, ovY)
  halves[side] = transpose(j.out, FH, W)
  cuts.push({ side, across: true, cut: j.cut, off: H - ovY })
  report.push(`  ${side} half: cut through ${ovY} shared rows, mean difference along it ${j.mismatch.toFixed(1)} / 255`)
}
const full = joinSideBySide(halves.left, W, halves.right, W, FH, ovX)
cuts.push({ side: 'middle', across: false, cut: full.cut, off: W - ovX })
report.push(`  middle: cut through ${ovX} shared columns, mean difference along it ${full.mismatch.toFixed(1)} / 255`)

console.log(`world map: four quarters of ${W}x${H} (span ${span}) → ${FW}x${FH}`)
console.log(report.join('\n'))

const toSharp = (px) => sharp(Buffer.from(Uint8ClampedArray.from(px)), { raw: { width: FW, height: FH, channels: 3 } })
if (SEAMS) {
  const marked = Float32Array.from(full.out)
  const dot = (x, y) => { const i = (Math.round(y) * FW + Math.round(x)) * 3; if (i >= 0 && i < marked.length) { marked[i] = 255; marked[i + 1] = 0; marked[i + 2] = 0 } }
  for (const c of cuts) {
    if (c.across) {
      const x0 = c.side === 'left' ? 0 : FW - W
      for (let x = 0; x < W; x++) for (let d = -1; d <= 1; d++) dot(x0 + x, c.off + c.cut[x] + d)
    } else {
      for (let y = 0; y < FH; y++) for (let d = -1; d <= 1; d++) dot(c.off + c.cut[y] + d, y)
    }
  }
  mkdirSync(dirname(resolve(SEAMS)), { recursive: true })
  await sharp(Buffer.from(Uint8ClampedArray.from(marked)), { raw: { width: FW, height: FH, channels: 3 } }).png().toFile(resolve(SEAMS))
  console.log(`  seams drawn into ${SEAMS}`)
}
if (DRY) {
  console.log('  (dry run: nothing written)')
} else {
  mkdirSync(dirname(OUT), { recursive: true })
  await toSharp(full.out).webp({ quality: 90, effort: 5 }).toFile(OUT)
  console.log(`  ✓ wrote ${relative(ROOT, OUT)}  ${FW}x${FH}`)
  console.log('  then: pnpm compress-folder public/images/ui')
}
