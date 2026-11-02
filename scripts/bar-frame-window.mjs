// The painted bar frames (public/images/ui/bar-frame-<boss|elite|champion>.webp) have the well painted in solid dark,
// so the health fill under the frame never shows. This opens the well: the dark interior is flood-filled from the
// middle and made transparent, and the left and right edges (where the painted wings run off the file) fade out over a
// few pixels instead of ending in a hard cut. The untouched paintings stay as bar-frame-<name>-original.webp.
//
//   node scripts/bar-frame-window.mjs
import { copyFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire(join(process.cwd(), 'package.json'))
const sharp = require('sharp')
const FADE = 56 // px of the 1024-wide file
const TOL = 46

for (const name of ['boss', 'elite', 'champion']) {
  const file = `public/images/ui/bar-frame-${name}.webp`
  const keep = `reports/bar-frames-pre-window/bar-frame-${name}-pre-window.webp`
  if (!existsSync(keep)) copyFileSync(file, keep)
  const { data, info } = await sharp(keep).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width
  const H = info.height
  const at = (x, y) => (y * W + x) * 4
  const sx = W >> 1
  const sy = H >> 1
  const seed = [data[at(sx, sy)], data[at(sx, sy) + 1], data[at(sx, sy) + 2]]
  const near = (i) => Math.abs(data[i] - seed[0]) + Math.abs(data[i + 1] - seed[1]) + Math.abs(data[i + 2] - seed[2]) <= TOL * 3 / 2 && data[i + 3] > 200
  const seen = new Uint8Array(W * H)
  const stack = [[sx, sy]]
  let n = 0
  while (stack.length) {
    const [x, y] = stack.pop()
    if (x < 0 || y < 0 || x >= W || y >= H) continue
    const k = y * W + x
    if (seen[k] || !near(at(x, y))) continue
    seen[k] = 1
    n++
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
  for (let k = 0; k < seen.length; k++) if (seen[k]) data[k * 4 + 3] = 0
  // The edge ring of the well: one pixel of the old dark, half-transparent, so no dark fringe shows against the fill.
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const k = y * W + x
      if (seen[k]) continue
      if (seen[k - 1] || seen[k + 1] || seen[k - W] || seen[k + W]) data[k * 4 + 3] = Math.min(data[k * 4 + 3], 150)
    }
  }
  // The painted wings run off the file and are cut: the winged frames lose them here (the bar draws its own wings
  // behind the frame, `FBar.vue`), so the frame ends cleanly at its gems. The champion's scrolls fade instead.
  const WING = 58
  if (name !== 'champion') {
    for (let y = 0; y < H; y++) for (let x = 0; x < WING; x++) { data[at(x, y) + 3] = 0; data[at(W - 1 - x, y) + 3] = 0 }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < (name === 'champion' ? FADE : 0); x++) {
      const f = x / FADE
      for (const xx of [x, W - 1 - x]) data[at(xx, y) + 3] = Math.round(data[at(xx, y) + 3] * f * f)
    }
  }
  await sharp(data, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 92, alphaQuality: 100 }).toFile(file)
  console.log(name, 'well pixels opened:', n)
}
