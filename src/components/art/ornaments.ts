import { UI_ART } from '@/game/assets/overrides'
import { ORNAMENTS, ornamentSvg, type Flip, type OrnamentDef } from '@/game/art/ornamentRefs'

/**
 * ─── The ornaments as CSS (roadmap #127, #128) ───────────────────────────────
 *
 * The mixins in `assets/css/cel.sass` (`ornate-corners`, `ornate-crest`,
 * `ornate-button`) read their pictures from custom properties on `:root`:
 *
 *   --orn-corner-tl / -tr / -bl / -br     --orn-corner-sm-…  (same four)
 *   --orn-wing-l / -r    --orn-rivet    --orn-rule    --orn-crest
 *
 * They are written here, once, before the app mounts, so a component never
 * knows whether it wears a drawing or a painting. The vector drawing
 * (`game/art/ornamentRefs.ts`) is always installed first; where the painter has
 * returned `images/ui/orn-<name>.webp` (`UI_ART`, the art-override contract),
 * the painting is loaded, mirrored on a canvas for the other corners, and
 * swapped in. Nothing about the layout depends on which one is showing: the
 * ornaments are pointer-less background layers sized by the mixins.
 */

/** Which mirrors an ornament needs, by property suffix. */
const MIRRORS: Readonly<Record<string, ReadonlyArray<readonly [string, Flip | undefined]>>> = {
  'orn-corner': [['tl', undefined], ['tr', 'x'], ['bl', 'y'], ['br', 'xy']],
  'orn-corner-sm': [['tl', undefined], ['tr', 'x'], ['bl', 'y'], ['br', 'xy']],
  'orn-wing': [['l', undefined], ['r', 'x']]
}

const propName = (id: string, suffix?: string): string => `--${id}${suffix ? `-${suffix}` : ''}`

const drawnUrl = (o: OrnamentDef, flip?: Flip): string => `url("data:image/svg+xml,${encodeURIComponent(ornamentSvg(o, flip, true))}")`

const STYLE_ID = 'bc-ornaments'

/** The custom properties as one `:root` rule. */
const rule = (vars: Map<string, string>): string => `:root{${[...vars].map(([k, v]) => `${k}:${v}`).join(';')}}`

const drawnVars = (): Map<string, string> => {
  const vars = new Map<string, string>()
  for (const o of ORNAMENTS) {
    const mirrors = MIRRORS[o.id]
    if (mirrors) for (const [suffix, flip] of mirrors) vars.set(propName(o.id, suffix), drawnUrl(o, flip))
    else vars.set(propName(o.id), drawnUrl(o))
  }
  return vars
}

const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = () => reject(new Error(`ornament ${src} did not load`))
  img.src = src
})

/** Paintings that do not fit their slot yet: the drawing stays until they are repainted. None now. */
const UNFIT: ReadonlySet<string> = new Set()

/**
 * The painting cut to its visible part. The files are squares with the painted
 * shape somewhere inside (a wing is a third of the height), and the mixins stretch
 * the picture over the slot, so an untrimmed file lands small, squashed and off the
 * border it should touch.
 */
const trimmed = (img: HTMLImageElement): HTMLCanvasElement | null => {
  const w = img.naturalWidth
  const h = img.naturalHeight
  const probe = document.createElement('canvas')
  probe.width = w
  probe.height = h
  const pg = probe.getContext('2d', { willReadFrequently: true })
  if (!pg) return null
  pg.drawImage(img, 0, 0)
  const px = pg.getImageData(0, 0, w, h).data
  let x0 = w, x1 = -1, y0 = h, y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (px[(y * w + x) * 4 + 3]! > 24) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < x0 || y1 < y0) return null
  const c = document.createElement('canvas')
  c.width = x1 - x0 + 1
  c.height = y1 - y0 + 1
  c.getContext('2d')?.drawImage(img, x0, y0, c.width, c.height, 0, 0, c.width, c.height)
  return c
}

/** A painted ornament, trimmed and mirrored on a canvas. Lossless, so a mirror is as sharp as the original. */
const mirrored = (img: HTMLImageElement, flip?: Flip): string => {
  const cut = trimmed(img)
  if (!cut) return `url("${img.src}")`
  if (!flip) return `url("${cut.toDataURL('image/png')}")`
  const c = document.createElement('canvas')
  c.width = cut.width
  c.height = cut.height
  const g = c.getContext('2d')
  if (!g) return `url("${img.src}")`
  const sx = flip === 'x' || flip === 'xy' ? -1 : 1
  const sy = flip === 'y' || flip === 'xy' ? -1 : 1
  g.translate(sx < 0 ? c.width : 0, sy < 0 ? c.height : 0)
  g.scale(sx, sy)
  g.drawImage(cut, 0, 0)
  return `url("${c.toDataURL('image/png')}")`
}

/**
 * Write the ornament properties. Safe to call twice (it replaces its own
 * style element) and a no-op without a document.
 */
export const installOrnaments = (): void => {
  if (typeof document === 'undefined') return
  const el = document.getElementById(STYLE_ID) ?? Object.assign(document.createElement('style'), { id: STYLE_ID })
  const vars = drawnVars()
  el.textContent = rule(vars)
  if (!el.parentNode) document.head.appendChild(el)

  // The paintings, where they exist. Each one lands as soon as it has loaded;
  // a file that fails to load keeps its drawing.
  for (const o of ORNAMENTS) {
    const file = UI_ART.get(o.id)
    if (!file || UNFIT.has(o.id)) continue
    void loadImage(file).then(img => {
      const mirrors = MIRRORS[o.id]
      if (mirrors) for (const [suffix, flip] of mirrors) vars.set(propName(o.id, suffix), mirrored(img, flip))
      else vars.set(propName(o.id), mirrored(img))
      el.textContent = rule(vars)
    }).catch(() => { /* the drawing stays */ })
  }
}
