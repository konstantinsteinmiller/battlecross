#!/usr/bin/env node
/**
 * ─── Sheet slicer ───────────────────────────────────────────────────────────
 *
 * The return half of the art pipeline. `/#/art-sheets` bakes the game's vector
 * drawings onto a 256 px lattice and out to an image model; this takes the
 * repainted sheet and cuts it back into the drop-in files the game already
 * loads by name (`public/images/items|skills|portraits|ui|textures/<id>.webp`,
 * see `src/game/assets/overrides.ts`).
 *
 *   pnpm art:slice                                  # every image in art-sheets/painted/
 *   pnpm art:slice --dry                            # print the plan, write nothing
 *   pnpm art:slice art-sheets/painted/sheet-items-weapons.png
 *
 * WHY IT DRIVES A BROWSER
 *
 * Chrome decodes the painting, keys and crops it on a canvas and encodes WebP,
 * in the same isolated-profile harness the export bench is driven with. The
 * keying and fitting below were tuned against that decoder and encoder.
 *
 * WHAT IT REFUSES TO DO
 *
 * · A file whose NAME is not a sheet in the index. Four item sheets share one
 *   shape and eight skill sheets another, so a painting is never matched by
 *   its proportions: a wrong guess would cut twelve good icons over twelve
 *   others, silently. Name the file after its reference, or pass `--sheet`.
 * · A painting whose reference was redrawn since it was painted (the receipt,
 *   below). It is parked in `painted/stale/`, with the files cut from it.
 * · A sheet that came back a different SHAPE: the grid was re-composed, and
 *   every rect in the index is then a lie.
 *
 * A failure is loud; a correction is printed. Nothing here guesses quietly.
 */
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync,
  existsSync, readdirSync, statSync, renameSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname, basename, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SHEETS = join(ROOT, 'art-sheets')
const PAINTED = join(SHEETS, 'painted')
const IMAGE = /\.(png|webp|jpe?g)$/i
const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
]

// ─── Which sheet is this file? ──────────────────────────────────────────────

/**
 * Sets, the single and the backdrops are the same thing to the slicer: a stem,
 * a size and a list of rects. `index` is `art-sheets/sheet-index.json` (the
 * shape `sheetIndex()` in `src/game/art/artSheet.ts` builds).
 */
export const buildTargets = (index) => [
  ...(index.sheets ?? []).map((s) => ({
    id: s.id,
    kind: 'cells',
    stem: s.files.clean.replace(/\.png$/i, ''),
    width: s.width,
    height: s.height,
    cols: s.cols,
    rows: s.rows,
    maxEdge: s.maxEdge,
    // How much of a panel a sliced file keeps, centred (1: all of it).
    crop: s.crop ?? 1,
    // What a return is registered by: its middle, or its bottom edge.
    anchor: s.anchor ?? 'centre',
    cells: s.cells ?? []
  })),
  // A backdrop is not a lattice: the whole image IS the asset.
  ...(index.scenery ?? []).map((a) => ({
    id: a.id,
    kind: 'scenery',
    stem: a.file.replace(/\.png$/i, ''),
    width: a.width,
    height: a.height,
    maxEdge: a.maxEdge,
    tileable: !!a.tileable,
    bg: a.bg ?? 'opaque',
    cells: [{ id: a.id, label: a.title ?? a.id, x: 0, y: 0, w: a.width, h: a.height, target: a.target }]
  }))
]

/**
 * The sheet a painted file belongs to, by its NAME alone.
 *
 * The name must be the reference's own stem, optionally followed by something
 * that cannot be part of a stem (`sheet-items-weapons (1).png`, `…_v2.jpg`: a
 * browser's or a painter's suffix). Anything else is refused:
 *
 * · never by shape. `sheet-items-weapons`, `-arms`, `-armor` and `-trinkets`
 *   are all 1024x768, so a shape match is a coin toss between four sheets;
 * · never a stem the index does not know. That is a sheet nobody exported
 *   yet, or one deleted from the manifest whose painting nobody removed, and
 *   in both cases cutting it over the nearest match destroys good art.
 */
export const identify = (file, targets, forced = null) => {
  if (forced) {
    const t = targets.find((x) => x.id === forced || x.stem === forced)
    if (!t) throw new Error(`--sheet ${forced} is unknown. The index has:\n    ${targets.map((x) => x.stem).join(', ')}`)
    return t
  }
  const name = basename(file).replace(/\.[^.]+$/, '').toLowerCase()
  const hits = targets
    .filter((t) => {
      const stem = t.stem.toLowerCase()
      if (name === stem) return true
      // A stem is letters, digits and dashes, so only a character outside
      // that set may follow it: `sheet-items-arms-old` is NOT `sheet-items-arms`.
      return name.startsWith(stem) && !/[a-z0-9-]/.test(name[stem.length])
    })
    .sort((a, b) => b.stem.length - a.stem.length)
  if (hits.length) return hits[0]
  throw new Error(`"${basename(file)}" is not a sheet in the index. A painting is named after its reference`
    + ' (e.g. sheet-items-weapons.png) and is never matched by shape:'
    + '\n    if the sheet is new, export it first (pnpm art:export); if the name is just odd, pass --sheet <stem>.')
}

// ─── The cut, run inside the page ───────────────────────────────────────────

/**
 * Serialised into Chrome (`Function.prototype.toString`), so it may only use
 * its two arguments and `globalThis.__sheet`, the decoded painting.
 */
/* c8 ignore start */
function pageCut(plan, o) {
  const img = globalThis.__sheet
  const W0 = img.naturalWidth
  const H0 = img.naturalHeight
  const res = { cells: [], dirtyLines: [], ground: null }
  const mk = (w, h) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const g = c.getContext('2d', { willReadFrequently: true })
    g.imageSmoothingQuality = 'high'
    return [c, g]
  }

  // ── A backdrop: all artwork, edge to edge. No key, no trim, no flood. ──
  if (o.kind === 'scenery') {
    const p = plan[0]
    const [dst, dc] = mk(p.outW, p.outH)
    // Off-ratio: a tile is squashed (cropping it would break the repeat); a
    // picture is cropped about its centre (squashing it distorts every shape).
    let sx = 0
    let sy = 0
    let sw = W0
    let sh = H0
    if (!o.tileable) {
      const want = p.outW / p.outH
      if (W0 / H0 > want) { sw = Math.round(H0 * want); sx = Math.round((W0 - sw) / 2) } else { sh = Math.round(W0 / want); sy = Math.round((H0 - sh) / 2) }
    }
    dc.drawImage(img, sx, sy, sw, sh, 0, 0, p.outW, p.outH)
    const d = dc.getImageData(0, 0, p.outW, p.outH).data
    const at = (x, y) => (y * p.outW + x) * 4
    const lum = (i) => d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
    let seam = null
    if (o.tileable) {
      // How big the jump across each wrap is, against the jump between two
      // neighbouring columns / rows INSIDE the picture. A tile that repeats
      // has the same kind of step at its edge as anywhere else.
      const step = (a, b) => {
        let s = 0
        for (let t = 0; t < a.length; t++) s += Math.abs(lum(a[t]) - lum(b[t]))
        return s / a.length
      }
      const col = (x) => Array.from({ length: p.outH }, (_, y) => at(x, y))
      const row = (y) => Array.from({ length: p.outW }, (_, x) => at(x, y))
      const inner = (step(col(p.outW >> 1), col((p.outW >> 1) + 1)) + step(row(p.outH >> 1), row((p.outH >> 1) + 1))) / 2
      seam = { x: step(col(0), col(p.outW - 1)), y: step(row(0), row(p.outH - 1)), inner }
    }
    // Is there any colour, and how bright is it? (The ground detail must be
    // near-white greys; the game multiplies it over each zone's colours.)
    let sat = 0
    let light = 0
    const n = p.outW * p.outH
    for (let i = 0; i < d.length; i += 4) {
      sat += Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2])
      light += lum(i)
    }
    res.cells.push({
      id: p.id, target: p.target, w: p.outW, h: p.outH, seam, sat: sat / n / 255, light: light / n / 255,
      dataUrl: dst.toDataURL('image/webp', o.quality)
    })
    return JSON.stringify(res)
  }

  // ── What ground did it come back on, and is the grid where it went out? ──
  const [, fc] = mk(W0, H0)
  fc.drawImage(img, 0, 0)
  const fd = fc.getImageData(0, 0, W0, H0).data
  const isKey = (i) => fd[i + 1] < 70 && fd[i] > 190 && fd[i + 2] > 190
  {
    const counts = new Map()
    let ring = 0
    let magenta = 0
    const see = (x, y) => {
      const i = (y * W0 + x) * 4
      ring++
      if (isKey(i)) magenta++
      const key = ((fd[i] >> 4) << 8) | ((fd[i + 1] >> 4) << 4) | (fd[i + 2] >> 4)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    for (let x = 0; x < W0; x++) { see(x, 0); see(x, H0 - 1) }
    for (let y = 0; y < H0; y++) { see(0, y); see(W0 - 1, y) }
    const top = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0
    const rgb = [((top >> 8) & 15) * 16 + 8, ((top >> 4) & 15) * 16 + 8, (top & 15) * 16 + 8]
    res.ground = { hex: '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join(''), magenta: magenta / ring }
  }
  // The cut is uniform by construction, so every interior cut line must be
  // background from end to end. A line with paint on it means a drawing leans
  // into its neighbour, or the model re-composed the grid: either way the
  // panels are not where the cut expects them.
  if (res.ground.magenta > 0.6) {
    const clean = (n, m, at) => {
      let best = 0
      for (let off = -2; off <= 2; off++) {
        const a = n + off
        let bg = 0
        for (let b = 0; b < m; b++) if (isKey(at(a, b))) bg++
        best = Math.max(best, bg / m)
      }
      return best
    }
    for (let i = 1; i < o.cols; i++) {
      const share = clean(Math.round((W0 * i) / o.cols), H0, (x, y) => (y * W0 + x) * 4)
      if (share < 0.97) res.dirtyLines.push({ axis: 'column', n: i, share })
    }
    for (let i = 1; i < o.rows; i++) {
      const share = clean(Math.round((H0 * i) / o.rows), W0, (y, x) => (y * W0 + x) * 4)
      if (share < 0.97) res.dirtyLines.push({ axis: 'row', n: i, share })
    }
  }

  for (const p of plan) {
    // Crop the panel 1:1 first, so measuring happens on real pixels.
    const [cell, cc] = mk(p.sw, p.sh)
    cc.drawImage(img, p.sx, p.sy, p.sw, p.sh, 0, 0, p.sw, p.sh)
    const id = cc.getImageData(0, 0, p.sw, p.sh)
    const d = id.data
    const W = p.sw
    const H = p.sh
    const N = W * H
    let keyed = 0

    if (o.chroma) {
      // A CHANNEL test, not a distance-to-magenta one. Pure magenta is the
      // only thing with G near zero AND both R and B near full; a distance
      // key would take the game's own violets and purples with it.
      const bg = new Uint8Array(N)
      for (let k = 0; k < N; k++) {
        const i = k * 4
        if (d[i + 1] < 70 && d[i] > 190 && d[i + 2] > 190) { bg[k] = 1; d[i + 3] = 0; keyed++ }
      }
      // De-fringe ONLY where art meets keyed background. Anti-aliasing leaves
      // a pink rim there; running this over the whole panel instead would
      // desaturate every warm highlight in the drawing.
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const k = y * W + x
          if (bg[k]) continue
          const touches = (x > 0 && bg[k - 1]) || (x < W - 1 && bg[k + 1]) || (y > 0 && bg[k - W]) || (y < H - 1 && bg[k + W])
          if (!touches) continue
          const i = k * 4
          const r = d[i]
          const g = d[i + 1]
          const b = d[i + 2]
          if (r > g + 30 && b > g + 30) {
            const spill = Math.min(r - g, b - g)
            d[i] = r - spill
            d[i + 2] = b - spill
            d[i + 3] = Math.max(0, d[i + 3] - Math.round(spill * 0.8))
          }
        }
      }
      // ── A band around the keyed ground ──
      //
      // The two stages below take magenta OUT of a pixel, and what they test
      // for is "red and blue both above green". In a warm-toned game that is
      // only ever spill. Here it is also the PALETTE: the Shadowblade's
      // violet, the tier-4 purple, the crimson of the alchemist. Run over the
      // whole panel they would grey out every purple icon. A soft edge mixed
      // with the ground can only lie next to the ground, so both stages are
      // confined to the few pixels around it.
      const band = new Uint8Array(N)
      if (keyed > N * 0.03) {
        let rim = []
        for (let k = 0; k < N; k++) if (bg[k]) rim.push(k)
        for (let pass = 0; pass < 3; pass++) {
          const next = []
          for (const k of rim) {
            const x = k % W
            const y = (k / W) | 0
            const reach = (nk) => { if (!bg[nk] && !band[nk]) { band[nk] = 1; next.push(nk) } }
            if (x > 0) reach(k - 1)
            if (x < W - 1) reach(k + 1)
            if (y > 0) reach(k - W)
            if (y < H - 1) reach(k + W)
          }
          rim = next
        }
        // ── Unmix the soft edge from the magenta ──
        //
        // Where a soft edge lay over the ground the two MIXED. The ground's
        // colour is known exactly, so the mix can be undone: distance from
        // magenta gives the coverage, and magenta's share is subtracted back
        // out of the colour that remains.
        const LO = 60
        const HI = 210
        for (let k = 0; k < N; k++) {
          if (!band[k]) continue
          const i = k * 4
          if (d[i + 3] < 8) continue
          const dist = Math.abs(d[i] - 255) + d[i + 1] + Math.abs(d[i + 2] - 255)
          if (dist >= HI) continue
          if (dist <= LO) { d[i + 3] = 0; keyed++; continue }
          const a2 = (dist - LO) / (HI - LO)
          // P = a*F + (1-a)*B, with B = magenta  =>  F = (P - (1-a)*B) / a
          const un = (v, ground) => {
            const f = (v - (1 - a2) * ground) / a2
            return f < 0 ? 0 : f > 255 ? 255 : Math.round(f)
          }
          d[i] = un(d[i], 255)
          d[i + 1] = un(d[i + 1], 0)
          d[i + 2] = un(d[i + 2], 255)
          d[i + 3] = Math.round(d[i + 3] * a2)
        }
        // ── Boundary erode ──
        //
        // The outermost rim of a soft edge sits beyond the unmix's reach.
        // Being ADJACENT to keyed background is itself strong evidence, so
        // the rule can be looser there than it could be panel-wide.
        const A = (k) => d[k * 4 + 3]
        for (let pass = 0; pass < 2; pass++) {
          const edits = []
          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const k = y * W + x
              const i = k * 4
              if (d[i + 3] < 8) continue
              const touches = (x > 0 && A(k - 1) < 8) || (x < W - 1 && A(k + 1) < 8) || (y > 0 && A(k - W) < 8) || (y < H - 1 && A(k + W) < 8)
              if (!touches) continue
              const dist = Math.abs(d[i] - 255) + d[i + 1] + Math.abs(d[i + 2] - 255)
              if (dist >= 300) continue
              edits.push([i, Math.round(d[i + 3] * Math.max(0, (dist - 120) / 180))])
            }
          }
          if (!edits.length) break
          for (const [i, a2] of edits) d[i + 3] = a2
        }
        // ── Spill suppression, in the band only (see above) ──
        for (let k = 0; k < N; k++) {
          if (!band[k]) continue
          const i = k * 4
          if (d[i + 3] < 8 || d[i + 3] > 250) continue
          const spill = Math.min(d[i], d[i + 2]) - d[i + 1]
          if (spill <= 0) continue
          d[i] = Math.round(d[i] - spill * 0.9)
          d[i + 2] = Math.round(d[i + 2] - spill * 0.9)
        }
      }
      cc.putImageData(id, 0, 0)
    }

    // ── Whatever the background actually turned out to be ──
    //
    // The magenta key only removes magenta. Returns also arrive on white, on
    // cream, or with the transparency CHECKERBOARD painted in as literal
    // pixels. So: work out what the background IS from the edge of the frame,
    // then flood inward. Flooding only removes what is CONNECTED to an edge,
    // so a cream highlight inside a drawing survives while the cream around
    // it does not.
    //
    // SEED FROM THE FRAME, never from the drawing's own outline: once the
    // ground is keyed the silhouette becomes the shore, its flat colour
    // becomes "the background", and the flood eats holes through the art.
    //
    // AND IT ONLY RUNS WHEN THE KEY FOUND NOTHING. After a successful key the
    // only opaque pixels left on the frame are artwork that crossed the cut
    // line; a handful of them are then 100 % of the seeds and the flood
    // adopts the drawing's own colour as the ground.
    if (o.autoBg && keyed <= N * 0.03) {
      const A = (k) => d[k * 4 + 3]
      const q = (i) => ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4)
      const seeds = []
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const k = y * W + x
          if (A(k) < 8) continue
          if (x === 0 || y === 0 || x === W - 1 || y === H - 1) seeds.push(k)
        }
      }
      const counts = new Map()
      for (const k of seeds) {
        const key = q(k * 4)
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
      // CLUSTER the buckets: a JPEG smears one flat colour across a dozen
      // neighbouring ones, and a human still sees one colour.
      const centre = (key) => [((key >> 8) & 15) * 16 + 8, ((key >> 4) & 15) * 16 + 8, (key & 15) * 16 + 8]
      const near = (a2, b2) => Math.abs(a2[0] - b2[0]) + Math.abs(a2[1] - b2[1]) + Math.abs(a2[2] - b2[2]) <= 64
      const refs = []
      let covered = 0
      for (const [key, n] of [...counts].sort((a2, b2) => b2[1] - a2[1])) {
        const c2 = centre(key)
        if (refs.find((r2) => near(r2, c2))) { covered += n; continue }
        if (refs.length < 4) { refs.push(c2); covered += n }
      }
      const keep = (i) => refs.some((r2) => near(r2, [d[i], d[i + 1], d[i + 2]]))
      // A flat ground clusters and reaches a good share of the frame.
      if (seeds.length >= 2 * (W + H) * 0.1 && covered / seeds.length >= 0.7) {
        const seen = new Uint8Array(N)
        const stack = []
        for (const k of seeds) if (keep(k * 4) && !seen[k]) { seen[k] = 1; stack.push(k) }
        let removed = 0
        while (stack.length) {
          const k = stack.pop()
          d[k * 4 + 3] = 0
          removed++
          const x = k % W
          const y = (k / W) | 0
          const push = (nk) => {
            if (nk < 0 || nk >= N || seen[nk]) return
            if (A(nk) < 8) { seen[nk] = 1; return }
            if (!keep(nk * 4)) return
            seen[nk] = 1
            stack.push(nk)
          }
          if (x > 0) push(k - 1)
          if (x < W - 1) push(k + 1)
          if (y > 0) push(k - W)
          if (y < H - 1) push(k + W)
        }
        // ── De-fringe: a boundary pixel that is a blend of ground and ink ──
        for (let pass = 0; pass < 2; pass++) {
          const edits = []
          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const k = y * W + x
              const i = k * 4
              if (d[i + 3] < 8) continue
              const touches = (x > 0 && A(k - 1) < 8) || (x < W - 1 && A(k + 1) < 8) || (y > 0 && A(k - W) < 8) || (y < H - 1 && A(k + W) < 8)
              if (!touches) continue
              let best = 1e9
              for (const [rr, gg, bb] of refs) best = Math.min(best, Math.abs(d[i] - rr) + Math.abs(d[i + 1] - gg) + Math.abs(d[i + 2] - bb))
              if (best < 70) edits.push([i, 0])
              else if (best < 170) edits.push([i, Math.round((d[i + 3] * (best - 70)) / 100)])
            }
          }
          if (!edits.length) break
          for (const [i, a2] of edits) { if (a2 === 0) removed++; d[i + 3] = a2 }
        }
        keyed += removed
        cc.putImageData(id, 0, 0)
      }
    }

    // The drawing's box, on SOLID pixels (alpha over 140) — the same floor the
    // bench measured the reference with. A soft edge is light, not extent.
    let x0 = W
    let y0 = H
    let x1 = -1
    let y1 = -1
    let opaque = 0
    let onFrame = 0
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const a = d[(y * W + x) * 4 + 3]
        if (a > 8) opaque++
        if (a <= 140) continue
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
        if (x === 0 || y === 0 || x === W - 1 || y === H - 1) onFrame++
      }
    }
    if (x1 < 0) { res.cells.push({ id: p.id, target: p.target, empty: true }); continue }
    const box = { x0: x0 / W, y0: y0 / H, x1: (x1 + 1) / W, y1: (y1 + 1) / H }
    const bboxFill = opaque / ((x1 - x0 + 1) * (y1 - y0 + 1))

    // ── Register it onto the drawing it replaces ──
    //
    // A return arrives at a different size and position from the reference,
    // always. Each panel of a SET is its own object, so each is fitted onto
    // its OWN measured box (one correction for a whole strip is for frames of
    // one animation, which this game has none of).
    //
    // The scale matches the box's AREA: fitting the height alone lets a
    // painting of other proportions overhang, fitting the tighter axis makes
    // everything read shrunken, and the geometric mean of the two is what
    // "the same size, drawn differently" looks like.
    let src = cell
    let fitNote = null
    const F = p.fit
    if (F && F.h > 0 && F.w > 0) {
      const gotH = box.y1 - box.y0
      const gotW = box.x1 - box.x0
      const k = Math.sqrt((F.h / Math.max(gotH, 0.01)) * (F.w / Math.max(gotW, 0.01)))
      const gotCx = (box.x0 + box.x1) / 2
      // A bust hangs from its cut line; everything else from its middle.
      const fromY = o.anchor === 'feet' ? box.y1 : (box.y0 + box.y1) / 2
      const toY = o.anchor === 'feet' ? F.bottom : F.bottom - F.h / 2
      if (!(k > 0.25 && k < 4)) {
        // A wild measurement must never obliterate the art.
        fitNote = { wild: +k.toFixed(2) }
      } else if (Math.abs(k - 1) > 0.04 || Math.abs(fromY - toY) > 0.02 || Math.abs(gotCx - F.cx) > 0.02) {
        const [to, g2] = mk(W, H)
        g2.translate(F.cx * W, toY * H)
        g2.scale(k, k)
        g2.translate(-gotCx * W, -fromY * H)
        g2.drawImage(cell, 0, 0)
        src = to
        fitNote = { k: +k.toFixed(3), dx: +(F.cx - gotCx).toFixed(3), dy: +(toY - fromY).toFixed(3) }
      }
    }

    // Square again, at the size the game needs: the kept part of the panel
    // (all of it, or the drawing's own box) resampled to the output edge. That
    // also undoes a sheet that came back slightly squashed.
    const [dst, dc] = mk(p.out, p.out)
    const cw = W * p.crop
    const ch = H * p.crop
    dc.drawImage(src, (W - cw) / 2, (H - ch) / 2, cw, ch, 0, 0, p.out, p.out)
    res.cells.push({
      id: p.id, target: p.target, w: p.out, h: p.out,
      keyed: keyed / N, coverage: opaque / N, bboxFill, onFrame, fitNote,
      dataUrl: dst.toDataURL('image/webp', o.quality)
    })
  }
  return JSON.stringify(res)
}
/* c8 ignore stop */

// ─── The command ────────────────────────────────────────────────────────────

const HELP = `
Slice repainted reference sheets back into the game's drop-in files.

  node tools/slice-sheets.mjs [files…] [options]

  files            Paintings, or a folder of them. Default: art-sheets/painted/
                   (its top level only: painted/stale/ and painted/replaced/
                   are never read).
  --sheet <stem>   Force the sheet when the file's name is odd. Otherwise the
                   name must be the reference's own (sheet-items-weapons.png).
                   A painting is NEVER matched by its shape.
  --out <dir>      Where targets are written, relative to the repo. Default: public
  --size <px>      Force the output edge, in px, for this run. Default: 256,
                   lowered to the sheet's own cap from the manifest.
  --quality <0-1>  WebP quality. Default: 0.92
  --no-chroma      Keep the magenta background instead of keying it out.
  --no-auto-bg     Do not flood a white or cream background away when no
                   magenta was found.
  --no-fit         Cut the panels where they landed, without registering them
                   onto the box the bench measured on the drawing.
  --dry            Print the plan and write nothing.
  --stale-ok       Slice a painting even though its reference was redrawn
                   since it was painted. Off by default: the receipt in
                   painted/.sliced.json is what stops a re-cut drawing being
                   overwritten by a painting of the old one.
  --index <file>   Read another sheet index (tests).
`

const main = async () => {
  // Options that consume the next argument. Everything else that is not a
  // flag is an input path — walked in order rather than filtered, so
  // `--out public` cannot leave "public" behind looking like a file to slice.
  const VALUED = new Set(['--sheet', '--out', '--size', '--quality', '--index'])
  const argv = process.argv.slice(2)
  const opts = {}
  const files = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (VALUED.has(a)) {
      if (i + 1 >= argv.length) { console.error(`${a} needs a value`); process.exit(1) }
      opts[a] = argv[++i]
    } else if (a.startsWith('-')) {
      opts[a] = true
    } else {
      files.push(a)
    }
  }
  const flag = (name) => opts[name] === true
  const num = (name, fallback) => {
    if (opts[name] === undefined) return fallback
    const v = Number(opts[name])
    if (!Number.isFinite(v)) { console.error(`${name} must be a number`); process.exit(1) }
    return v
  }
  if (flag('--help') || flag('-h')) { console.log(HELP); process.exit(0) }

  const DRY = flag('--dry')
  const STALE_OK = flag('--stale-ok')
  const OUT_ROOT = resolve(ROOT, opts['--out'] ?? 'public')
  const QUALITY = num('--quality', 0.92)
  const FORCE_SHEET = opts['--sheet'] ?? null
  const INDEX = resolve(ROOT, opts['--index'] ?? join('art-sheets', 'sheet-index.json'))

  /**
   * The cap on an output edge, px — 256 unless `--size` says otherwise.
   *
   * 256 is where the payload and the eye agree, so it is the DEFAULT, not a
   * flag remembered on a good day. The manifest's own `maxEdge` can only
   * LOWER it (an icon is drawn at 40 to 70 px, the coin at the size of a
   * letter); a backdrop is written at its declared size; an explicit `--size`
   * forces the edge for one run.
   */
  const DEFAULT_EDGE = 256
  const SIZE = num('--size', DEFAULT_EDGE)
  const SIZE_FORCED = opts['--size'] != null
  const edgeCap = (sheet) => (SIZE_FORCED ? SIZE : Math.min(DEFAULT_EDGE, sheet.maxEdge ?? DEFAULT_EDGE))

  if (!existsSync(INDEX)) {
    console.error(`No ${relative(ROOT, INDEX)}. Export the reference sheets first: pnpm art:export`)
    process.exit(1)
  }
  const TARGETS = buildTargets(JSON.parse(readFileSync(INDEX, 'utf-8')))

  const collect = (p) => {
    const full = resolve(ROOT, p)
    if (!existsSync(full)) { console.error(`not found: ${p}`); process.exit(1) }
    // The top level only: `painted/stale/` holds paintings of drawings that
    // have since moved, `painted/replaced/` the ones a re-roll took over from.
    if (statSync(full).isDirectory()) return readdirSync(full).filter((f) => IMAGE.test(f)).map((f) => join(full, f))
    return [full]
  }
  if (!files.length && !existsSync(PAINTED)) {
    console.error(`No input given and ${relative(ROOT, PAINTED)}/ does not exist.`)
    console.error('Put the repainted sheets there, named after their references, or pass a path.')
    process.exit(1)
  }
  const inputs = (files.length ? files : [PAINTED]).flatMap(collect)
  if (!inputs.length) { console.error('nothing to slice'); process.exit(1) }

  /** Guard against a target that would escape the output root. */
  const safeTarget = (target) => {
    const full = resolve(OUT_ROOT, target)
    const rel = relative(OUT_ROOT, full)
    return rel && !rel.startsWith('..') && !rel.startsWith(sep) ? full : null
  }

  // ─── The receipt: what each painting was cut against ──────────────────────
  //
  // A painting is a snapshot of a DRAWING, and the drawing moves. When a
  // glyph is re-cut after its sheet was painted, the next slice anybody runs
  // — for an unrelated sheet — would re-install the old silhouette over the
  // corrected one, silently.
  //
  // So a successful slice leaves `painted/.sliced.json`: per painting, the
  // REVISION of the reference it was cut against (first 12 hex of a sha1 over
  // the clean sheet, the same number `art-prompts.mjs` and the Art Desk read)
  // and the painting's OWN hash. When the reference has changed since, that
  // painting is refused (`--stale-ok` overrides). The painting's hash is what
  // lets a re-roll saved under the old name through: a line only ever
  // describes the bytes it was written for.
  //
  // No receipt (a fresh clone, a first run) refuses nothing — a checkout
  // rewrites mtimes, so an older-looking file is a warning, not a verdict.
  const RECEIPT = join(PAINTED, '.sliced.json')
  const receipt = (() => {
    try {
      const r = JSON.parse(readFileSync(RECEIPT, 'utf-8'))
      return r && typeof r === 'object' ? (r.files ?? {}) : {}
    } catch {
      // Missing or corrupt: a receipt only ever ADDS a refusal, so the safe
      // failure is to behave as if nothing had been sliced yet.
      return {}
    }
  })()
  const receiptNext = { ...receipt }
  let receiptDirty = false
  const writeReceipt = () => {
    mkdirSync(PAINTED, { recursive: true })
    writeFileSync(RECEIPT, `${JSON.stringify({ note: 'written by tools/slice-sheets.mjs — the reference revision each painting was cut against', files: receiptNext }, null, 2)}\n`, 'utf-8')
  }

  const revOf = (file) => createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 12)
  /** The clean reference a painting was made from, if it is on disk. */
  const referenceOf = (sheet) => {
    const p = join(SHEETS, `${sheet.stem}.png`)
    return existsSync(p) ? p : null
  }

  /** `{ ok }` to go ahead, `{ ok: false, why }` to refuse; a `warn` either way. */
  const freshness = (file, sheet) => {
    const ref = referenceOf(sheet)
    if (!ref) return { ok: true }
    const rev = revOf(ref)
    const own = revOf(file)
    let seen = receipt[basename(file)]
    // The same NAME with different bytes is a new painting the old line says
    // nothing about.
    if (seen?.painting && seen.painting !== own) seen = undefined
    if (seen?.rev && seen.rev !== rev) {
      return {
        ok: false, rev,
        why: `the reference was REDRAWN after this was painted (${seen.rev} → ${rev}).`
          + `\n    ${relative(ROOT, ref)} is not the picture this file was painted over any more.`
          + '\n    Repaint it from the new sheet, or pass --stale-ok to cut it anyway.'
      }
    }
    if (!seen && statSync(ref).mtimeMs > statSync(file).mtimeMs + 60_000) {
      return {
        ok: true, rev, own,
        warn: `no receipt for this one yet, and ${basename(ref)} is newer than it.`
          + ' If the drawing changed since it was painted, this cuts the OLD one — check it, or repaint.'
      }
    }
    return { ok: true, rev, own }
  }

  /**
   * Park a painting whose drawing moved: out of `painted/` (where it would be
   * refused again on every run) into `painted/stale/` — never deleted, it is
   * still the best statement of the style — and the files cut from it with
   * it. Leaving those ships the old shape for the drawables that were painted
   * while the rest draw themselves correctly: the re-cut, visibly broken in
   * half. With them gone the game falls back to the corrected drawing.
   */
  const park = (file, sheet, why) => {
    if (dirname(resolve(file)) !== PAINTED) return
    const stale = join(PAINTED, 'stale')
    const cut = sheet.cells.map((c) => safeTarget(c.target)).filter((t) => t && existsSync(t))
    if (DRY) {
      console.error(`    (dry) would park it in ${relative(ROOT, stale)}/, with ${cut.length} file(s) cut from it`)
      return
    }
    mkdirSync(stale, { recursive: true })
    renameSync(file, join(stale, basename(file)))
    if (cut.length) {
      const to = join(stale, `${sheet.stem}.cut`)
      mkdirSync(to, { recursive: true })
      for (const t of cut) renameSync(t, join(to, basename(t)))
    }
    writeFileSync(join(stale, `${sheet.stem}.why.txt`), `${new Date().toISOString()}  ${basename(file)}\n${why}\n`, 'utf-8')
    delete receiptNext[basename(file)]
    receiptDirty = true
    console.error(`    parked in ${relative(ROOT, stale)}/, with ${cut.length} file(s) cut from it — the game draws those again.`)
  }

  // ─── Identify everything BEFORE a browser is started ──────────────────────
  //
  // A folder-wide run with one stray file must say so and still cut the rest;
  // a run with nothing it may cut must not launch Chrome to find that out.
  let written = 0
  let skipped = 0
  let failed = 0
  const jobs = []
  for (const file of inputs) {
    let sheet
    try {
      sheet = identify(file, TARGETS, FORCE_SHEET)
    } catch (e) {
      console.error(`\n✗ ${basename(file)} — ${e.message}`)
      failed++
      continue
    }
    const fresh = freshness(file, sheet)
    if (!fresh.ok && !STALE_OK) {
      console.error(`\n✗ ${basename(file)} — ${fresh.why}`)
      park(file, sheet, fresh.why)
      failed++
      continue
    }
    jobs.push({ file, sheet, fresh })
  }

  const finish = (code) => {
    if (receiptDirty && !DRY) writeReceipt()
    console.log(`\n${DRY ? 'would write' : 'wrote'} ${written} file(s)`
      + `${skipped ? `, skipped ${skipped} empty` : ''}`
      + `${failed ? `, ${failed} FAILED` : ''}`)
    if (written && !DRY) {
      console.log('\nTo see it: `pnpm dev`, then /#/models → "Painted vs drawn" (a running dev server reloads by itself).')
      console.log('Then: pnpm compress-folder public/images   and   pnpm art:prompts   (refreshes PAINT-STATUS.md).')
    }
    return code
  }
  if (!jobs.length) process.exit(finish(1))

  // ─── Chrome, for decode / key / crop / WebP encode ────────────────────────
  const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p))
  if (!chromePath) {
    console.error('No Chrome found. Tried:\n  ' + CHROME_CANDIDATES.join('\n  '))
    process.exit(1)
  }
  const PORT = 9336 + (process.pid % 200)
  // An isolated profile, always. The shared one is held by the user's own
  // browser and two clients on one profile deadlock with no recovery.
  const profile = mkdtempSync(join(tmpdir(), 'bcross-slice-'))
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const chrome = spawn(chromePath, [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-gpu', 'about:blank'
  ], { stdio: 'ignore', windowsHide: true })

  let ws
  let msgId = 0
  const pending = new Map()
  const send = (method, params = {}) => new Promise((res, rej) => {
    const m = { id: ++msgId, method, params }
    pending.set(m.id, { res, rej })
    ws.send(JSON.stringify(m))
  })
  const shutdown = async (code) => {
    try { ws?.close() } catch {}
    // The whole tree: Chrome's helpers outlive a plain kill on Windows.
    if (process.platform === 'win32' && chrome.pid) spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true })
    else try { chrome.kill() } catch {}
    await sleep(300)
    try { rmSync(profile, { recursive: true, force: true }) } catch {}
    process.exit(code)
  }

  try {
    let page = null
    for (let i = 0; i < 60 && !page; i++) {
      try {
        page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')
      } catch {}
      if (!page) await sleep(250)
    }
    if (!page) throw new Error('Chrome did not expose a debugging target')
    ws = new WebSocket(page.webSocketDebuggerUrl)
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true })
      ws.addEventListener('error', () => rej(new Error('could not attach to Chrome')), { once: true })
    })
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data)
      const p = pending.get(m.id)
      if (!p) return
      pending.delete(m.id)
      m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result)
    })
    await send('Runtime.enable')

    for (const { file, sheet, fresh } of jobs) {
      const b64 = readFileSync(file).toString('base64')
      const mime = /\.png$/i.test(file) ? 'image/png' : /\.webp$/i.test(file) ? 'image/webp' : 'image/jpeg'
      const probe = await send('Runtime.evaluate', {
        expression: `(async () => {
          const img = new Image();
          img.src = 'data:${mime};base64,${b64}';
          await img.decode();
          globalThis.__sheet = img;
          return JSON.stringify({ w: img.naturalWidth, h: img.naturalHeight });
        })()`,
        awaitPromise: true, returnByValue: true
      })
      if (probe.exceptionDetails) {
        console.error(`\n✗ ${basename(file)} — could not be decoded as an image`)
        failed++
        continue
      }
      const { w, h } = JSON.parse(probe.result.value)

      // The sheet may come back at a different resolution than it left at,
      // which is fine and expected. What is NOT fine is a different SHAPE.
      const sx = w / sheet.width
      const sy = h / sheet.height
      console.log(`\n${basename(file)} → ${sheet.kind === 'scenery' ? 'backdrop' : 'sheet'} "${sheet.stem}"  ${w}x${h} (${sx.toFixed(3)}x)`)
      if (!fresh.ok) console.warn(`  ! ${fresh.why.split('\n')[0]} Slicing anyway (--stale-ok).`)
      if (fresh.warn) console.warn(`  ! ${fresh.warn}`)
      if (mime === 'image/jpeg' && sheet.kind !== 'scenery') {
        console.warn('  ! a JPEG: its lossy chroma smears the magenta into the artwork at every'
          + ' edge, which leaves a pink fringe the key cannot fully remove. Ask for PNG.')
      }

      let plan
      if (sheet.kind === 'scenery') {
        const off = Math.abs((w / h) / (sheet.width / sheet.height) - 1)
        if (off > 0.02) {
          console.warn(`  ! aspect is ${(w / h).toFixed(2)}:1, wanted ${(sheet.width / sheet.height).toFixed(2)}:1 — `
            + (sheet.tileable ? 'squeezed to fit (a crop would break the repeat).' : 'cropped about its centre.'))
        }
        // Its declared shape: never larger than it came back, never over its
        // own cap from the manifest (the 256 default is for panels, and a
        // backdrop fills a screen).
        const long = Math.max(sheet.width, sheet.height)
        const scale = SIZE_FORCED ? SIZE / long : Math.min(1, (sheet.maxEdge ?? long) / long, w / sheet.width, h / sheet.height)
        const c = sheet.cells[0]
        plan = [{ id: c.id, target: c.target, outW: Math.max(1, Math.round(sheet.width * scale)), outH: Math.max(1, Math.round(sheet.height * scale)) }]
      } else {
        // A uniform squash is recoverable: the panels still divide the frame
        // evenly, every one is distorted by the same factor, and each is
        // resampled back to square on the way out. Refusing a good generation
        // over arithmetic we can do ourselves is the more expensive mistake —
        // but past a few percent the model did not drift, it re-composed.
        const drift = Math.abs(sx - sy) / Math.max(sx, sy)
        if (drift > 0.06) {
          console.error(`  ✗ aspect ratio changed (${sx.toFixed(3)} across vs ${sy.toFixed(3)} down).`)
          console.error('    The model re-composed the grid; the panel rects no longer apply. Ask for it again at the stated shape.')
          failed++
          continue
        }
        if (drift > 0.01) console.warn(`  ! proportions drifted ${(drift * 100).toFixed(1)}% — panels came back ${sy < sx ? 'squashed' : 'stretched'}; correcting to square.`)
        plan = sheet.cells.filter((c) => c.target).map((c) => {
          const sw = Math.round(c.w * sx)
          const sh = Math.round(c.h * sy)
          return {
            id: c.id, target: c.target,
            sx: Math.round(c.x * sx), sy: Math.round(c.y * sy), sw, sh,
            crop: sheet.crop,
            fit: flag('--no-fit') ? null : (c.fit ?? null),
            // Never upsample: a return buys file size and no detail above what it came back at.
            out: SIZE_FORCED ? SIZE : Math.max(1, Math.min(edgeCap(sheet), Math.round(Math.min(sw, sh) * sheet.crop)))
          }
        })
      }

      const cut = await send('Runtime.evaluate', {
        expression: `(${pageCut.toString()})(${JSON.stringify(plan)}, ${JSON.stringify({
          kind: sheet.kind, cols: sheet.cols, rows: sheet.rows, anchor: sheet.anchor, tileable: sheet.tileable,
          chroma: !flag('--no-chroma'), autoBg: !flag('--no-auto-bg'), quality: QUALITY
        })})`,
        returnByValue: true
      })
      if (cut.exceptionDetails) throw new Error(cut.exceptionDetails.exception?.description ?? 'slice failed')
      const res = JSON.parse(cut.result.value)

      if (res.ground && res.ground.magenta < 0.6) {
        console.warn(`  ! the background is ${res.ground.hex}, not #ff00ff.`)
        console.warn('    Only true magenta can be keyed safely. Anything else falls back to a flood')
        console.warn('    fill, which eats pale artwork it can reach — check every icon before shipping this.')
      }
      for (const l of res.dirtyLines ?? []) {
        console.warn(`  ! paint crosses the cut between ${l.axis}s ${l.n} and ${l.n + 1}`
          + ` (${(l.share * 100).toFixed(0)}% clear). A drawing leans into its neighbour, or the grid was re-composed — check both panels.`)
      }
      if (sheet.kind !== 'scenery' && !sheet.cells.some((c) => c.fit) && !flag('--no-fit')) {
        console.warn('  ! the index carries no measured fits for this sheet — panels are cut where they landed. Run pnpm art:export.')
      }

      let wroteHere = 0
      for (const r of res.cells) {
        if (r.empty) {
          console.warn(`  ! ${r.id.padEnd(24)} came back EMPTY — nothing written; the game keeps drawing it.`)
          skipped++
          continue
        }
        if (!r.dataUrl.startsWith('data:image/webp')) {
          console.error(`  ✗ ${r.id.padEnd(24)} browser would not encode WebP`)
          failed++
          continue
        }
        const full = safeTarget(r.target)
        if (!full) {
          console.error(`  ✗ ${r.id.padEnd(24)} target escapes ${relative(ROOT, OUT_ROOT)}/`)
          failed++
          continue
        }
        if (r.fitNote?.wild) {
          console.warn(`    ! ${r.id} measured ${r.fitNote.wild}x off its reference — too wild to trust, left as painted. Check it.`)
        } else if (r.fitNote) {
          console.log(`    · ${r.id}: registered onto the drawing — scaled to ${(r.fitNote.k * 100).toFixed(0)}%,`
            + ` moved ${(r.fitNote.dx * 100).toFixed(0)}% / ${(r.fitNote.dy * 100).toFixed(0)}% of a panel.`)
        }
        if (r.onFrame > 0) {
          console.warn(`    ! ${r.id} touches the edge of its panel: it, or a neighbour, crossed the cut line, and the fit was measured with that in it.`)
        }
        // An icon is meant to sit ON the game's own frame, so a ground that
        // survived is welded in. What gives a card away is that it fills its
        // own bounding box completely; a sword or a face never does.
        if (r.bboxFill !== undefined && r.bboxFill > 0.92) {
          console.warn(`    ! ${r.id} fills ${(r.bboxFill * 100).toFixed(0)}% of its own bounding box — it is a solid rectangle.`)
          console.warn('      The subject was almost certainly painted onto a card or tile that is now welded in. Re-generate it on flat magenta.')
        }
        if (r.seam) {
          const worst = Math.max(r.seam.x, r.seam.y)
          if (worst > Math.max(6, r.seam.inner * 3)) {
            console.warn(`    ! the tile does not repeat cleanly: the step across its edge is ${worst.toFixed(1)} against ${r.seam.inner.toFixed(1)} inside it. It will show as a grid on the ground.`)
          } else {
            console.log(`    · seam ${worst.toFixed(1)} vs ${r.seam.inner.toFixed(1)} inside: it repeats.`)
          }
        }
        if (sheet.tileable && r.sat !== undefined) {
          if (r.sat > 0.04) console.warn(`    ! ${r.id} carries colour (saturation ${(r.sat * 100).toFixed(0)}%). The ground detail is multiplied over each zone's colour and must be greys only.`)
          if (r.light < 0.8) console.warn(`    ! ${r.id} averages ${(r.light * 100).toFixed(0)}% brightness; about 90% is wanted, or every zone darkens.`)
        }
        const bytes = Buffer.from(r.dataUrl.slice(r.dataUrl.indexOf(',') + 1), 'base64')
        const shown = `${r.target}  ${r.w}x${r.h}  ${(bytes.length / 1024).toFixed(1)}kB`
          + (r.keyed ? `  (keyed ${(100 * r.keyed).toFixed(0)}% bg)` : '')
        if (DRY) {
          console.log(`  → ${r.id.padEnd(24)} ${shown}`)
        } else {
          mkdirSync(dirname(full), { recursive: true })
          writeFileSync(full, bytes)
          console.log(`  ✓ ${r.id.padEnd(24)} ${shown}`)
        }
        written++
        wroteHere++
      }
      // The receipt records what was actually cut INTO THE GAME, so a dry run
      // and a run into another folder (`--out`) both leave it alone.
      if (wroteHere && fresh.rev && !DRY && OUT_ROOT === resolve(ROOT, 'public')) {
        receiptNext[basename(file)] = { sheet: sheet.stem, rev: fresh.rev, painting: fresh.own ?? revOf(file), at: new Date().toISOString() }
        receiptDirty = true
      }
    }
    await shutdown(finish(failed ? 1 : 0))
  } catch (e) {
    console.error('\nERROR: ' + e.message)
    await shutdown(1)
  }
}

// Imported by the tests for `buildTargets` / `identify`; run as a command otherwise.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
