// CSS Paint API worklet for the Samsung dark-mode colour fix (src/utils/forcedDarkCounter).
// Samsung Internet's forced dark mode leaves worklet output untouched, so the game's own
// colours are drawn here instead of being left to the browser. Served from 'self' (a blob:
// worklet would need a CSP change). Plain JS: it runs in the worklet scope, no imports.
//
//   bc-p0 .. bc-p5   one background layer each. Input `--bc-pN`:
//                      solid     "r g b a"
//                      gradient  "<head> | r g b a f p, r g b a f p, ..."   (a stop sits at f * line + p px)
//                        head    "L <deg> <repeating 0|1>"                       linear
//                                "R <c|e> <cx> <cy> <cs|fs|cc|fc | rx ry>"       radial (cx, cy, rx, ry: N% or Npx)
//                                "C <fromDeg> <cx> <cy>"                         conic
//   bc-border        used as `border-image-source`. Draws the border ring (rounded outer edge, one colour
//                    per side) and the outer spread rings (box-shadow 0 0 0 Npx) at 1:1 over the border box plus
//                    `border-image-outset`. Inputs `--bc-bw` (t r b l px), `--bc-bc` (four "r g b a" joined by "|"),
//                    `--bc-rad` (tl tr br bl px), `--bc-rings` ("from to r g b a" bands, outwards, joined by "|").
//   bc-inset         a background layer: inset shadows. `--bc-ins` ("from to r g b a" bands, inwards from the padding
//                    edge, the spread rings) and `--bc-insx` ("x y blur spread r g b a" parts joined by "|").

const str = v => String(v).trim()
const nums = v => str(v).split(/[ ,]+/).filter(Boolean).map(Number)
const rgba = n => 'rgba(' + Math.round(n[0]) + ',' + Math.round(n[1]) + ',' + Math.round(n[2]) + ',' + n[3] + ')'
/** "50%" / "12px" against a length. */
const len = (t, total) => (String(t).endsWith('%') ? (parseFloat(t) / 100) * total : parseFloat(t) || 0)

const stopsOf = v => str(v).split(',').map(nums).filter(n => n.length >= 6)

function linear(ctx, size, head, stops) {
  const angle = (Number(head[1]) || 0) * Math.PI / 180
  const repeating = head[2] === '1'
  const sx = Math.sin(angle)
  const sy = -Math.cos(angle)
  const L = Math.abs(size.width * sx) + Math.abs(size.height * sy) || 1
  const cx = size.width / 2
  const cy = size.height / 2
  const grad = ctx.createLinearGradient(cx - sx * L / 2, cy - sy * L / 2, cx + sx * L / 2, cy + sy * L / 2)
  let list = stops.map(n => ({ c: n, pos: n[4] * L + n[5] }))
  if (repeating) {
    const first = list[0].pos
    const period = list[list.length - 1].pos - first
    if (period > 0.25) {
      const out = []
      for (let k = Math.floor((0 - list[list.length - 1].pos) / period); first + k * period < L && out.length < 800; k++) {
        for (const s of list) out.push({ c: s.c, pos: s.pos + k * period })
      }
      list = out
    }
  }
  // Stops outside 0..1 are clamped by the canvas, as CSS clamps them; order is kept monotonic.
  let last = -Infinity
  for (const s of list) {
    const pos = Math.max(last, s.pos)
    last = pos
    grad.addColorStop(Math.max(0, Math.min(1, pos / L)), rgba(s.c))
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size.width, size.height)
}

function radial(ctx, size, head, stops) {
  const W = size.width
  const H = size.height
  const circle = head[1] === 'c'
  const cx = len(head[2], W)
  const cy = len(head[3], H)
  const dl = cx
  const dr = W - cx
  const dt = cy
  const db = H - cy
  const corners = [Math.hypot(dl, dt), Math.hypot(dr, dt), Math.hypot(dl, db), Math.hypot(dr, db)]
  let rx
  let ry
  const kw = head[4]
  if (kw === 'cs' || kw === 'fs') {
    const pick = kw === 'cs' ? Math.min : Math.max
    const sx = pick(dl, dr)
    const sy = pick(dt, db)
    if (circle) rx = ry = pick(sx, sy)
    else { rx = sx; ry = sy }
  } else if (kw === 'cc' || kw === 'fc') {
    const near = kw === 'cc'
    if (circle) {
      rx = ry = near ? Math.min(...corners) : Math.max(...corners)
    } else {
      // An ellipse with the closest/farthest-side aspect ratio, scaled to pass through that corner.
      // The corner lies sx and sy away along the axes, so the scale is sqrt(2).
      const pick = near ? Math.min : Math.max
      rx = pick(dl, dr) * Math.SQRT2
      ry = pick(dt, db) * Math.SQRT2
    }
  } else {
    rx = len(head[4], W)
    ry = circle ? rx : len(head[5], H)
  }
  rx = Math.max(rx, 0.01)
  ry = Math.max(ry, 0.01)
  const pos = stops.map(n => ({ c: n, s: n[4] + n[5] / rx }))
  const hi = Math.max(1, ...pos.map(p => p.s))
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(1, ry / rx)
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * hi)
  let last = 0
  for (const p of pos) {
    const s = Math.max(last, p.s)
    last = s
    grad.addColorStop(Math.max(0, Math.min(1, s / hi)), rgba(p.c))
  }
  ctx.fillStyle = grad
  // Cover the whole box in the scaled space.
  ctx.fillRect(-cx, -cy * (rx / ry), W, H * (rx / ry))
  ctx.restore()
}

function conic(ctx, size, head, stops) {
  const W = size.width
  const H = size.height
  const cx = len(head[2], W)
  const cy = len(head[3], H)
  if (!ctx.createConicGradient) {
    ctx.fillStyle = rgba(stops[0])
    ctx.fillRect(0, 0, W, H)
    return
  }
  // CSS starts at 12 o'clock and runs clockwise; the canvas starts at 3 o'clock.
  const grad = ctx.createConicGradient(((Number(head[1]) || 0) - 90) * Math.PI / 180, cx, cy)
  let last = 0
  for (const n of stops) {
    const s = Math.max(last, n[4])
    last = s
    grad.addColorStop(Math.max(0, Math.min(1, s)), rgba(n))
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
}

const layer = name => class {
  static get inputProperties() { return [name] }
  paint(ctx, size, props) {
    const raw = str(props.get(name))
    const bar = raw.indexOf('|')
    if (bar < 0) {
      ctx.fillStyle = rgba(nums(raw))
      ctx.fillRect(0, 0, size.width, size.height)
      return
    }
    const head = str(raw.slice(0, bar)).split(/\s+/)
    const stops = stopsOf(raw.slice(bar + 1))
    if (!stops.length) return
    if (head[0] === 'R') radial(ctx, size, head, stops)
    else if (head[0] === 'C') conic(ctx, size, head, stops)
    else linear(ctx, size, head, stops)
  }
}

for (let i = 0; i < 6; i++) registerPaint('bc-p' + i, layer('--bc-p' + i))

/** Rounded rectangle path with a radius per corner (tl tr br bl). */
function roundedRect(ctx, x, y, w, h, r) {
  const k = r.map(v => Math.max(0, Math.min(v, w / 2, h / 2)))
  ctx.moveTo(x + k[0], y)
  ctx.lineTo(x + w - k[1], y)
  ctx.arcTo(x + w, y, x + w, y + k[1], k[1])
  ctx.lineTo(x + w, y + h - k[2])
  ctx.arcTo(x + w, y + h, x + w - k[2], y + h, k[2])
  ctx.lineTo(x + k[3], y + h)
  ctx.arcTo(x, y + h, x, y + h - k[3], k[3])
  ctx.lineTo(x, y + k[0])
  ctx.arcTo(x, y, x + k[0], y, k[0])
  ctx.closePath()
}

/** "from to r g b a | from to r g b a ..." -> [{ from, to, c: [r, g, b, a] }] */
const bands = v => str(v).split('|').map(nums).filter(n => n.length >= 6).map(n => ({ from: n[0], to: n[1], c: n.slice(2, 6) }))

registerPaint('bc-border', class {
  static get inputProperties() { return ['--bc-bw', '--bc-bc', '--bc-rad', '--bc-rings'] }
  paint(ctx, size, props) {
    const [t, r, b, l] = nums(props.get('--bc-bw'))
    const rad = nums(props.get('--bc-rad'))
    const cols = str(props.get('--bc-bc')).split('|').map(nums)
    const rings = bands(props.get('--bc-rings'))
    // The image area is the border box plus the outset the rings need.
    const out = rings.length ? rings[rings.length - 1].to : 0
    const W = size.width - 2 * out
    const H = size.height - 2 * out
    // Spread rings (box-shadow 0 0 0 Npx): grow the border box outwards, corners grow with them.
    for (const band of rings) {
      ctx.beginPath()
      const grow = d => rad.map(v => (v > 0 ? v + d : 0))
      roundedRect(ctx, out - band.to, out - band.to, W + 2 * band.to, H + 2 * band.to, grow(band.to))
      roundedRect(ctx, out - band.from, out - band.from, W + 2 * band.from, H + 2 * band.from, grow(band.from))
      ctx.fillStyle = rgba(band.c)
      ctx.fill('evenodd')
    }
    if (!(t || r || b || l)) return
    const inner = [
      Math.max(0, rad[0] - Math.max(l, t)), Math.max(0, rad[1] - Math.max(r, t)),
      Math.max(0, rad[2] - Math.max(r, b)), Math.max(0, rad[3] - Math.max(l, b))
    ]
    ctx.save()
    ctx.beginPath()
    roundedRect(ctx, out, out, W, H, rad)
    if (W - l - r > 0 && H - t - b > 0) roundedRect(ctx, out + l, out + t, W - l - r, H - t - b, inner)
    ctx.clip('evenodd')
    const same = cols.every(c => c.join() === cols[0].join())
    if (same) {
      ctx.fillStyle = rgba(cols[0])
      ctx.fillRect(out, out, W, H)
    } else {
      // Mitre the four sides along the diagonals like the browser does.
      const sides = [
        [[0, 0], [W, 0], [W - r, t], [l, t]],
        [[W, 0], [W, H], [W - r, H - b], [W - r, t]],
        [[0, H], [W, H], [W - r, H - b], [l, H - b]],
        [[0, 0], [0, H], [l, H - b], [l, t]]
      ]
      sides.forEach((poly, i) => {
        if (cols[i][3] <= 0) return
        ctx.fillStyle = rgba(cols[i])
        ctx.beginPath()
        poly.forEach((p, k) => (k ? ctx.lineTo(out + p[0], out + p[1]) : ctx.moveTo(out + p[0], out + p[1])))
        ctx.closePath()
        ctx.fill()
      })
    }
    ctx.restore()
  }
})

const SOFT_STEPS = 6

registerPaint('bc-inset', class {
  static get inputProperties() { return ['--bc-bw', '--bc-rad', '--bc-ins', '--bc-insx'] }
  paint(ctx, size, props) {
    const [t, r, b, l] = nums(props.get('--bc-bw'))
    const rad = nums(props.get('--bc-rad'))
    const x = l
    const y = t
    const w = size.width - l - r
    const h = size.height - t - b
    const inner = [
      Math.max(0, rad[0] - Math.max(l, t)), Math.max(0, rad[1] - Math.max(r, t)),
      Math.max(0, rad[2] - Math.max(r, b)), Math.max(0, rad[3] - Math.max(l, b))
    ]
    // Offset / blurred inset shadows, bottom-most (last in CSS) first. Clipped to the padding box; the shadow is
    // everything outside the box shrunk by the spread and moved by the offset. A blur is a few stacked hard edges.
    const parts = str(props.get('--bc-insx')).split('|').map(nums).filter(n => n.length >= 8)
    if (parts.length) {
      ctx.save()
      ctx.beginPath()
      roundedRect(ctx, x, y, w, h, inner)
      ctx.clip()
      for (const p of parts.reverse()) {
        const blur = p[2]
        const steps = blur > 0 ? SOFT_STEPS : 1
        // Each step carries a share of the alpha so the stack adds up to the shadow's own alpha.
        const alpha = steps > 1 ? 1 - Math.pow(1 - p[7], 1 / steps) : p[7]
        for (let i = 0; i < steps; i++) {
          const s = p[3] + (steps > 1 ? blur * ((i + 0.5) / steps - 0.5) : 0)
          ctx.beginPath()
          ctx.rect(x - 10000, y - 10000, w + 20000, h + 20000)
          if (w - 2 * s > 0 && h - 2 * s > 0) roundedRect(ctx, x + s + p[0], y + s + p[1], w - 2 * s, h - 2 * s, inner.map(v => Math.max(0, v - s)))
          ctx.fillStyle = rgba([p[4], p[5], p[6], alpha])
          ctx.fill('evenodd')
        }
      }
      ctx.restore()
    }
    // Spread rings (inset 0 0 0 Npx), bands inwards from the padding edge.
    for (const band of bands(props.get('--bc-ins'))) {
      const shrink = d => inner.map(v => Math.max(0, v - d))
      ctx.beginPath()
      roundedRect(ctx, x + band.from, y + band.from, w - 2 * band.from, h - 2 * band.from, shrink(band.from))
      if (w - 2 * band.to > 0 && h - 2 * band.to > 0) roundedRect(ctx, x + band.to, y + band.to, w - 2 * band.to, h - 2 * band.to, shrink(band.to))
      ctx.fillStyle = rgba(band.c)
      ctx.fill('evenodd')
    }
  }
})
