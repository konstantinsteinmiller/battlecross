/**
 * ─── The interface ornaments ─────────────────────────────────────────────────
 *
 * The gilded corner brackets, rivets and flourishes the cel system lays INSIDE
 * the border of buttons, cards and windows (roadmap #127). One drawing each,
 * as pure SVG strings, so the art manifest stays importable from Node and the
 * bench (`views/ArtSheets.vue`) draws them as the reference the painter is
 * sent (roadmap #128).
 *
 * The game does not use these as files: `components/art/ornaments.ts` turns
 * them into CSS custom properties (`--orn-corner-tl`, …) that the mixins in
 * `assets/css/cel.sass` read as background images. A painted file at
 * `images/ui/orn-<name>.webp` replaces the drawing there, and the vector below
 * keeps drawing wherever no painting exists.
 *
 * Every ornament is drawn once, in ONE orientation (corners at the top left,
 * the wing pointing left); the other orientations are mirrors, made at
 * runtime for the drawing and for a painting alike.
 */

export interface OrnamentDef {
  /** The id and the file name: `images/ui/<id>.webp`. */
  id: string
  /** The drawing's own box. */
  w: number
  h: number
  /** Inner SVG markup in that box. */
  body: string
}

const INK = '#1b1626'
const GOLD = '#ffc526'
const GOLD_HI = '#ffe978'
const GOLD_LO = '#f09410'

/** A stroked line in three layers: the ink outline, the gold, a thin lit edge. */
const gilt = (d: string, w: number): string =>
  `<g fill="none" stroke-linecap="round" stroke-linejoin="round">`
  + `<path d="${d}" stroke="${INK}" stroke-width="${w + 3.4}"/>`
  + `<path d="${d}" stroke="${GOLD}" stroke-width="${w}"/>`
  + `<path d="${d}" stroke="${GOLD_HI}" stroke-width="${Math.max(1, w * 0.3)}" transform="translate(-${w * 0.18} -${w * 0.18})"/></g>`

const bead = (x: number, y: number, r: number): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD}" stroke="${INK}" stroke-width="1.8"/>`
  + `<circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.32}" fill="${GOLD_HI}"/>`

export const ORNAMENTS: readonly OrnamentDef[] = [
  {
    // A scrolled bracket for the corners of a window or a card: two arms along
    // the edges, a curl tucked into the angle, a bead at each tip.
    id: 'orn-corner', w: 48, h: 48,
    body: gilt('M5 44V17Q5 5 17 5H44', 4.4)
      + gilt('M16 17Q16 12 21 12H29', 2.6)
      + gilt('M17 18Q17 27 25 26Q30 25 28 21', 2.4)
      + bead(5, 44, 3) + bead(44, 5, 3) + bead(16.5, 16.5, 3.2)
  },
  {
    // The same bracket, smaller and plainer, for a button.
    id: 'orn-corner-sm', w: 24, h: 24,
    body: gilt('M4 21V9Q4 4 9 4H21', 3.2) + bead(4, 21, 2.2) + bead(21, 4, 2.2)
  },
  {
    // A domed brass stud.
    id: 'orn-rivet', w: 16, h: 16,
    body: `<circle cx="8" cy="8" r="6.6" fill="${GOLD_LO}" stroke="${INK}" stroke-width="1.8"/>`
      + `<circle cx="7.4" cy="7.2" r="4.4" fill="${GOLD}"/>`
      + `<circle cx="5.9" cy="5.6" r="1.6" fill="${GOLD_HI}"/>`
  },
  {
    // A filigree rule, tapering from a lozenge in its middle: the edge of a
    // window's foot, the seam of a card.
    id: 'orn-rule', w: 96, h: 16,
    body: `<g fill="${GOLD}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round">`
      + '<path d="M40 8L10 5.4Q4 8 10 10.6Z"/><path d="M56 8L86 5.4Q92 8 86 10.6Z"/>'
      + `<path d="M48 1.6L55 8L48 14.4L41 8Z" fill="${GOLD_LO}"/></g>`
      + `<path d="M48 4.6L51.6 8L48 11.4L44.4 8Z" fill="${GOLD_HI}"/>`
      + bead(6, 8, 2.6) + bead(90, 8, 2.6)
  },
  {
    // A small heraldic cartouche to sit on the middle of an edge.
    id: 'orn-crest', w: 40, h: 24,
    body: `<g fill="${GOLD}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round">`
      + '<path d="M11 12Q6 5 1.6 12Q6 19 11 12Z"/><path d="M29 12Q34 5 38.4 12Q34 19 29 12Z"/>'
      + `<path d="M20 1.8L28 12L20 22.2L12 12Z" fill="${GOLD_LO}"/></g>`
      + `<path d="M20 5.4L24.6 12L20 18.6L15.4 12Z" fill="${GOLD}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`
      + `<circle cx="18.6" cy="9.4" r="1.4" fill="${GOLD_HI}"/>`
  },
  {
    // A leaf scroll for the ends of a wide button, pointing at its label's side.
    id: 'orn-wing', w: 32, h: 16,
    body: `<g fill="${GOLD}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round">`
      + '<path d="M2.4 8Q11 0.8 20 4.4Q15.4 8 20 11.6Q11 15.2 2.4 8Z"/></g>'
      + gilt('M20 8H25', 2.2) + bead(27.4, 8, 2.8)
      + `<path d="M5.6 7.6Q10.6 3.8 15 5" fill="none" stroke="${GOLD_HI}" stroke-width="1.2" stroke-linecap="round"/>`
  }
]

export const ORNAMENT_IDS: readonly string[] = ORNAMENTS.map(o => o.id)

/** Which ornaments have mirrors, and which mirrors they get. */
export type Flip = 'x' | 'y' | 'xy'

/** One ornament as a standalone SVG string, optionally mirrored. */
export const ornamentSvg = (o: OrnamentDef, flip?: Flip, sized = false): string => {
  const sx = flip === 'x' || flip === 'xy' ? -1 : 1
  const sy = flip === 'y' || flip === 'xy' ? -1 : 1
  const body = flip ? `<g transform="matrix(${sx} 0 0 ${sy} ${sx < 0 ? o.w : 0} ${sy < 0 ? o.h : 0})">${o.body}</g>` : o.body
  const size = sized ? ` width="${o.w}" height="${o.h}"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${o.w} ${o.h}"${size}>${body}</svg>`
}

/** The drawings by id, for the bench (`BRAND_REFS` shape). */
export const ORNAMENT_REFS: Readonly<Record<string, string>> = Object.fromEntries(ORNAMENTS.map(o => [o.id, ornamentSvg(o)]))
