/**
 * ─── The bar frames' ornaments ───────────────────────────────────────────────
 *
 * The wings, gems, crown, crest and finials that `FBar` hangs on the frames of
 * an elite, a champion and a boss (roadmap #137). Pure SVG strings in one
 * palette type, so two callers draw the SAME shapes:
 *
 *   • `FBar.vue` draws them in the live theme (the palette is CSS variables);
 *   • the art bench (`views/ArtSheets.vue`) draws the whole frame in fixed
 *     colours as the reference the painter is sent (`BAR_FRAME_REFS`), and the
 *     painted return replaces the code-drawn frame (`bar-frame-<frame>.webp`).
 *
 * The reference is a 512 x 128 STRIP (4:1): the bar's window 384 x 32 (12:1) in the
 * middle (x 64..448, y 48..80), the 64 px end caps, and the ornaments free to use
 * the 48 px above AND below the window. The drawing touches all four edges of its
 * box, so the slicer trims the painting to its paint and stretches that onto
 * 512 x 128: the window then lands exactly where `FBar`'s three-slice expects it
 * (see `artSheet.ts`, `bar-frame-*`).
 */

/** Everything an ornament is coloured with. A CSS variable or a hex, both work in `style`. */
export interface OrnPalette {
  /** The metal: lit face, shaded face. */
  hi: string
  lo: string
  /** The gem: face, lit facet, shaded facet. */
  gem: string
  gemHi: string
  gemLo: string
  /** The horns' bone: face, shade. */
  bone: string
  boneLo: string
  ink: string
  white: string
}

/** The theme's own, for the game. */
export const THEME_PALETTE: OrnPalette = {
  hi: 'var(--o-hi)', lo: 'var(--o-lo)',
  gem: 'var(--gem)', gemHi: 'var(--gem-hi)', gemLo: 'var(--gem-lo)',
  bone: 'var(--bc-paper-hi)', boneLo: 'var(--bc-paper-deep)',
  ink: 'var(--bc-ink)', white: 'var(--bc-white)'
}

const f = (n: number): string => String(Math.round(n * 100) / 100)

const shape = (d: string, fill: string, ink: string, sw = 0): string =>
  `<path d="${d}" style="fill:${fill}${sw ? `;stroke:${ink};stroke-width:${sw};stroke-linejoin:round;stroke-linecap:round` : ''}"/>`
const line = (d: string, stroke: string, sw: number): string =>
  `<path d="${d}" style="fill:none;stroke:${stroke};stroke-width:${sw};stroke-linejoin:round;stroke-linecap:round"/>`
const dot = (x: number, y: number, r: number, fill: string, ink: string, sw = 1.4): string =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" style="fill:${fill};stroke:${ink};stroke-width:${sw}"/>`

/**
 * One swept feather from a root, ending in a point at (tx, ty): a leaf with a
 * belly on its lower edge, which is what makes a stack of them read as a wing.
 */
const feather = (rx: number, ry: number, tx: number, ty: number): string => {
  const mx = (rx + tx) / 2
  const my = (ry + ty) / 2
  return `M${f(rx)} ${f(ry - 1.6)}C${f(mx + 4)} ${f(my - 5)} ${f(tx + 8)} ${f(ty - 1)} ${f(tx)} ${f(ty)}`
    + `C${f(tx + 9)} ${f(ty + 5)} ${f(mx)} ${f(my + 5)} ${f(rx)} ${f(ry + 2.4)}z`
}

// ── A wing: five feathers, the longest on top, a lit leading edge ────────────
/** viewBox of `wingBody`. The tip points up and away; its root is at the right. */
export const WING_BOX = '0 0 46 30'
const WING_TIPS: ReadonlyArray<readonly [number, number]> = [[2, 2.500], [3, 8.500], [7, 14], [13, 19.500], [21, 24.500]]

export const wingBody = (p: OrnPalette): string => {
  const rx = 45
  const ry = 20
  const out: string[] = []
  // Back to front: the shortest, lowest feather first.
  WING_TIPS.slice().reverse().forEach(([tx, ty], i) => {
    const d = feather(rx, ry, tx, ty)
    out.push(shape(d, i % 2 ? p.hi : p.lo, p.ink, 2))
    // A quill down the feather.
    out.push(line(`M${f(rx - 4)} ${f(ry)}Q${f((rx + tx) / 2 + 2)} ${f((ry + ty) / 2)} ${f(tx + 5)} ${f(ty + 2)}`, p.ink, 0.9))
  })
  // The lit leading edge and a shoulder stud where the wing meets the bezel.
  out.push(line('M43 18C32 15 16 10 4 3.500', p.white, 1.2))
  out.push(dot(44, 20, 2.800, p.hi, p.ink))
  return out.join('')
}

// ── A gem: a cut stone with a table, two lit facets and a glint ──────────────
export const GEM_BOX = '0 0 18 22'
export const gemBody = (p: OrnPalette, glow = false): string => [
  // The halo behind a boss's stone (an opacity pulse in the game).
  glow ? `<circle class="g-glow" cx="9" cy="11" r="9" style="fill:${p.gem}"/>` : '',
  shape('M9 1L15.600 6V16L9 21L2.400 16V6Z', p.gem, p.ink, 1.6),
  shape('M9 1L2.400 6L9 9.500Z', p.gemHi, p.ink),
  shape('M9 1L15.600 6L9 9.500Z', p.gem, p.ink),
  shape('M9 21L2.400 16L9 9.500Z', p.gemLo, p.ink),
  shape('M9 21L15.600 16L9 9.500Z', p.gem, p.ink),
  line('M9 1L2.400 6V16L9 21L15.600 16V6Z', p.ink, 1.6),
  line('M5.200 7.200L8 4.700', p.white, 1.5),
  dot(6, 8.500, 0.9, p.white, p.white, 0)
].join('')

// ── The boss's crown between two horns ───────────────────────────────────────
export const CROWN_BOX = '0 0 96 34'
const CROWN_PTS: ReadonlyArray<readonly [number, number]> = [[30, 32], [26, 14], [36, 22], [40, 8], [44, 20], [48, 1.500], [52, 20], [56, 8], [60, 22], [70, 14], [66, 32]]

export const crownBody = (p: OrnPalette): string => {
  const horn = (m: boolean): string => {
    const x = (v: number): number => (m ? 96 - v : v)
    const hd = `M${x(30)} 32C${x(14)} 32 ${x(3)} 23 ${x(1.500)} 3C${x(8)} 14 ${x(17)} 18 ${x(29)} 18.500z`
    const sd = `M${x(30)} 32C${x(15)} 31 ${x(6)} 24 ${x(2.500)} 10C${x(8)} 19 ${x(17)} 24 ${x(29)} 25z`
    return shape(hd, p.bone, p.ink, 2) + shape(sd, p.boneLo, p.ink)
      // Growth rings.
      + line(`M${x(9)} 20L${x(12)} 15.500M${x(15)} 23.500L${x(18)} 18.500M${x(21)} 26L${x(23.500)} 20`, p.ink, 1)
      + line(`M${x(30)} 32C${x(14)} 32 ${x(3)} 23 ${x(1.500)} 3C${x(8)} 14 ${x(17)} 18 ${x(29)} 18.500z`, p.ink, 2)
  }
  const d = `M${CROWN_PTS.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}z`
  return [
    horn(false), horn(true),
    shape(d, p.hi, p.ink, 2),
    // The shaded band and its lit upper edge.
    shape('M30 32L29.300 27H66.700L66 32Z', p.lo, p.ink, 0),
    line('M29.300 27H66.700', p.ink, 1.200),
    line('M27 15L36 22.500M69 15L60 22.500M41 9.500L44 19.500M55 9.500L52 19.500', p.white, 1),
    // A jewel on every point, a big stone on the band.
    dot(48, 4.500, 2.600, p.gem, p.ink), dot(40, 10.500, 2, p.gemHi, p.ink), dot(56, 10.500, 2, p.gemHi, p.ink),
    dot(26.500, 16, 1.800, p.gemLo, p.ink), dot(69.500, 16, 1.800, p.gemLo, p.ink),
    shape('M48 23.500L52.500 29.500L48 33.500L43.500 29.500Z', p.gem, p.ink, 1.500),
    shape('M48 23.500L43.500 29.500H48Z', p.gemHi, p.ink)
  ].join('')
}

// ── The champion's crest: a shield between two blades ────────────────────────
export const CREST_BOX = '0 0 52 30'
export const crestBody = (p: OrnPalette): string => {
  const blades = (m: boolean): string => {
    const g = [[1.500, 9], [3, 14.500], [7, 19.500]].map(([tx, ty]) => shape(feather(m ? 52 - 19 : 19, 22, m ? 52 - tx! : tx!, ty!), p.hi, p.ink, 1.800))
    return g.join('')
  }
  return [
    blades(false), blades(true),
    shape('M26 2L38 5.500V15C38 21.500 33 26.500 26 29C19 26.500 14 21.500 14 15V5.500Z', p.hi, p.ink, 2),
    shape('M26 2L38 5.500V15C38 21.500 33 26.500 26 29Z', p.lo, p.ink),
    shape('M26 8L31 15L26 23L21 15Z', p.gem, p.ink, 1.400),
    shape('M26 8L21 15H26Z', p.gemHi, p.ink),
    line('M16.500 7.500L26 4.500', p.white, 1.200)
  ].join('')
}

// ── An end cap's finial: a gilded scroll round a small gem ───────────────────
/** viewBox of `finialBody`. It faces left (outward); the right end mirrors it. */
export const FINIAL_BOX = '0 0 14 20'
export const finialBody = (p: OrnPalette): string => {
  // Two curls (ink under gold) spring from the bar's end and roll away from it.
  const curl = (d: string): string => line(d, p.ink, 3.600) + line(d, p.hi, 1.800)
  return [
    curl('M13.500 10C10.500 10 10 5 7.500 3.800C5.500 2.900 3.200 3.800 3.600 5.800'),
    curl('M13.500 10C10.500 10 10 15 7.500 16.200C5.500 17.100 3.200 16.200 3.600 14.200'),
    // The bead: a gold boss, its lower half in shade, a round stone set in it.
    dot(7, 10, 4.600, p.hi, p.ink, 1.600),
    shape('M2.400 10a4.600 4.600 0 0 0 9.200 0z', p.lo, p.ink, 0),
    dot(7, 10, 2.600, p.gem, p.ink, 1.200),
    dot(6.100, 9.100, 0.800, p.gemHi, p.ink, 0)
  ].join('')
}

// ── The painter's reference: a whole frame in fixed colours ──────────────────
const REF_INK = '#1b1626'
const REF = {
  steel: { hi: '#e3ecfa', lo: '#8e9fc2', gem: '#f59a2b', gemHi: '#ffd978', gemLo: '#c2610f' },
  gold: { hi: '#ffd266', lo: '#d28f1c', gem: '#e0455a', gemHi: '#ff9aa6', gemLo: '#a21f35' },
  crown: { hi: '#ffd266', lo: '#d28f1c', gem: '#8a3fd1', gemHi: '#c89bf5', gemLo: '#5a228f' }
} as const

const refPalette = (k: keyof typeof REF): OrnPalette => ({ ...REF[k], bone: '#f4ecd8', boneLo: '#c9bb97', ink: REF_INK, white: '#ffffff' })

/** An ornament body placed in a 512 x 128 frame: its box scaled to (w, h) at (x, y). */
const place = (body: string, box: string, x: number, y: number, w: number, h: number, mirror = false, flip = false): string => {
  const [, , bw = 1, bh = 1] = box.split(' ').map(Number)
  const sx = (mirror ? -w : w) / bw
  const sy = (flip ? -h : h) / bh
  return `<g transform="translate(${f(mirror ? x + w : x)} ${f(flip ? y + h : y)}) scale(${f(sx)} ${f(sy)})">${body}</g>`
}

/** The metal band round the window, and the window (the bar shows through it). */
const bezel = (p: OrnPalette, bz: number): string =>
  `<rect x="${64 - bz}" y="${48 - bz}" width="${384 + bz * 2}" height="${32 + bz * 2}" rx="${16 + bz}" style="fill:${p.hi};stroke:${p.ink};stroke-width:3"/>`
  + `<path d="M${64 - bz} 64H${448 + bz}V${80 + bz - 14}Q${448 + bz} ${80 + bz} ${448 + bz - 14} ${80 + bz}H${64 - bz + 14}Q${64 - bz} ${80 + bz} ${64 - bz} ${80 + bz - 14}Z" style="fill:${p.lo}"/>`
  + `<rect x="64" y="48" width="384" height="32" rx="16" style="fill:#2a2438;stroke:${p.ink};stroke-width:3"/>`

const svg = (inner: string): string => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 128">${inner}</svg>`

/**
 * The layout rules the painter is held to (and the tests check): the well's
 * x 64..448 is left to the bar, nothing but the bezel touches it, a cap's wing
 * is at most 1.5 well heights (48) tall, and a crown or crest sits in the 48 px
 * above the window with its twin, upside down, in the 48 px under it.
 */

/** Elite: silver, a five-feather wing and an amber stone on each cap, a small stone over and under the middle. */
const eliteRef = (): string => {
  const p = refPalette('steel')
  return svg([
    place(wingBody(p), WING_BOX, 0, 38, 62, 40), place(wingBody(p), WING_BOX, 450, 38, 62, 40, true),
    bezel(p, 5),
    place(gemBody(p), GEM_BOX, 42, 52, 18, 24), place(gemBody(p), GEM_BOX, 452, 52, 18, 24),
    // A stone sitting on the bezel over the middle, and its twin under it: it touches the strip's top (bottom) edge and the rim.
    place(gemBody(p), GEM_BOX, 238, 0, 36, 44), place(gemBody(p), GEM_BOX, 238, 84, 36, 44, false, true)
  ].join(''))
}

/** Champion: gold, a winged crest over the middle (and under it), gilded scroll-and-gem finials on the caps. */
const championRef = (): string => {
  const p = refPalette('gold')
  const crest = (flip: boolean): string => {
    const t = flip ? 'translate(0 128) scale(1 -1)' : ''
    return `<g transform="${t}">${place(crestBody(p), CREST_BOX, 218, 0, 76, 44)}</g>`
  }
  return svg([
    crest(false), crest(true),
    bezel(p, 5),
    place(finialBody(p), FINIAL_BOX, 32, 46, 26, 36), place(finialBody(p), FINIAL_BOX, 454, 46, 26, 36, true),
    place(finialBody(p), FINIAL_BOX, 0, 52, 20, 24), place(finialBody(p), FINIAL_BOX, 492, 52, 20, 24, true)
  ].join(''))
}

/** Boss: a crown between horns over the middle (and under it), a wing and a stone on each cap. */
const bossRef = (): string => {
  const p = refPalette('crown')
  const crown = (flip: boolean): string => {
    const t = flip ? 'translate(0 128) scale(1 -1)' : ''
    return `<g transform="${t}">${place(crownBody(p), CROWN_BOX, 191, 0, 130, 46)}</g>`
  }
  return svg([
    place(wingBody(p), WING_BOX, 0, 36, 64, 42), place(wingBody(p), WING_BOX, 448, 36, 64, 42, true),
    crown(false), crown(true),
    bezel(p, 7),
    place(gemBody(p, false), GEM_BOX, 40, 49, 20, 30), place(gemBody(p, false), GEM_BOX, 452, 49, 20, 30)
  ].join(''))
}

/** The drawings by file id, for the bench (`BRAND_REFS` shape). */
export const BAR_FRAME_REFS: Readonly<Record<string, string>> = {
  'bar-frame-elite': eliteRef(),
  'bar-frame-champion': championRef(),
  'bar-frame-boss': bossRef()
}
