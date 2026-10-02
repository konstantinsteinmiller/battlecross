/**
 * ─── What moves on the world map, and what frames it ─────────────────────────
 *
 * Everything drawn over the terrain plate that is not a place: the windmill,
 * the ship, the serpent, the lighthouse, waves that glint, the compass rose and
 * the title ribbon (`decorSvg`, under the landmarks); the drifting clouds and
 * the birds (`SKY_CLOUDS`, `birdsSvg`, over them); the torn edge of the sheet
 * (`frameSvg`).
 * All in the sheet's 1600 × 900 space. Motion is CSS on the classes named
 * here (`lf-*`, see `WorldMap.vue`): transforms and opacity only.
 */
import { INK, MAP_H, MAP_W, r1, seeded, type Pt } from './geo'
import { cloudShape } from './landmarks'

/** Where the fixed sights stand: the terrain keeps its trees off them. */
export const SIGHTS: Readonly<Record<'windmill' | 'lighthouse' | 'serpent' | 'ship' | 'compass' | 'ribbon' | 'camp', Pt>> = {
  windmill: [112, 604],
  lighthouse: [92, 848],
  serpent: [262, 862],
  ship: [622, 858],
  compass: [1492, 782],
  ribbon: [832, 848],
  camp: [1010, 470]
}

/**
 * The names lettered across the country (`map.region.<id>`): where each is
 * written, in sheet units, and how it leans. `sea`: written on water.
 */
export const MAP_REGIONS: ReadonlyArray<{ id: string; x: number; y: number; rot: number; sea?: boolean }> = [
  { id: 'vale', x: 196, y: 532, rot: -4 },
  { id: 'hills', x: 214, y: 302, rot: -3 },
  { id: 'peaks', x: 500, y: 62, rot: -3 },
  { id: 'ash', x: 800, y: 404, rot: 3 },
  { id: 'frost', x: 790, y: 62, rot: 3 },
  { id: 'fields', x: 1010, y: 742, rot: 5 },
  { id: 'mere', x: 1312, y: 604, rot: 6 },
  { id: 'reach', x: 1300, y: 330, rot: -3 },
  { id: 'dread', x: 1250, y: 50, rot: 4 },
  { id: 'sea', x: 1410, y: 856, rot: -3, sea: true },
  { id: 'bay', x: 790, y: 800, rot: -2, sea: true }
]

const round = ' stroke-linejoin="round" stroke-linecap="round"'
const s = (d: string, fill: string, sw = 2.6): string => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"${round}/>`
const f = (d: string, fill: string): string => `<path d="${d}" fill="${fill}"/>`
const l = (d: string, stroke: string, sw: number): string => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}"${round}/>`
const at = (p: Pt, inner: string, k = 1): string => `<g transform="translate(${p[0]} ${p[1]})${k === 1 ? '' : ` scale(${k})`}">${inner}</g>`
const esc = (t: string): string => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const windmill = (): string =>
  s('M-12 0L-8-34H8L12 0z', '#fff4dc') + f('M2-34H8L12 0H5z', '#e3d2ae') + l('M-12 0L-8-34H8L12 0z', INK, 2.6) +
  s('M-11-34Q0-50 11-34z', '#ff6a4f') + s('M-4 0V-10a4 4 0 0 1 8 0V0z', '#8f5d36', 2) + s('M-3-24h6v6h-6z', '#8fdcff', 1.8) +
  `<g transform="translate(0 -38)"><g class="lf-spin">${[0, 90, 180, 270].map(a => `<g transform="rotate(${a})">${l('M0 0V-27', INK, 3)}${s('M1.500-7h9v19h-9z', '#fff8e3', 2)}${l('M1.500-1h9M1.500 5h9', '#d9b87a', 1.4)}</g>`).join('')}</g>` +
  `<circle r="3.400" fill="#ffc526" stroke="${INK}" stroke-width="2"/></g>`

const lighthouse = (): string =>
  s('M-8 0L-5.500-30h11L8 0z', '#ffffff') + f('M-7-10h14l-.800-8H-6.200zM1-30h4.500L8 0H3z', '#ff5a4f') + l('M-8 0L-5.500-30h11L8 0z', INK, 2.6) +
  s('M-7-30h14v-8H-7z', '#ffe45e', 2.2) + s('M-9-38L0-47L9-38z', '#ff5a4f', 2.2) +
  `<path class="lf-blink" d="M7-34L46-44V-24z" fill="#fff8c0" opacity="0.7"/><path class="lf-blink" d="M-7-34L-46-44V-24z" fill="#fff8c0" opacity="0.7"/>`

const serpent = (): string =>
  `<g class="lf-bob">` +
  s('M-44 4Q-44-14-32-14Q-20-14-20 4z', '#3fdcc4') + l('M-38-4Q-32-10-26-5', '#a6fff0', 2.6) +
  s('M-10 4Q-10-20 3-20Q16-20 16 4z', '#3fdcc4') + l('M-4-6Q3-14 10-7', '#a6fff0', 2.6) +
  s('M26 4V-14Q26-30 40-30Q54-30 54-19Q54-10 44-10L42 4z', '#3fdcc4') + f('M44-26l5-8 2 8zM36-28l3-8 4 7z', '#ffc526') + l('M44-26l5-8 2 8M36-28l3-8 4 7', INK, 1.8) +
  `<circle cx="45" cy="-21" r="2.400" fill="${INK}"/><circle cx="45.800" cy="-21.800" r="0.800" fill="#ffffff"/>` + l('M48-14h5', INK, 1.8) +
  `</g>` + l('M-52 6q5-5 10 0M-24 6q4-4 8 0M12 6q5-5 10 0M38 6q6-5 12 0', '#eafcff', 3)

const ship = (): string =>
  `<g class="lf-bob lf-bob--slow">` +
  l('M0-4V-42', INK, 3) + s('M2-40Q22-32 22-12H2z', '#fff8e3', 2.2) + s('M-2-36Q-16-28-16-12H-2z', '#ffe9c4', 2.2) + s('M0-42l10-3-10-4z', '#ff5a4f', 1.8) +
  s('M-24-8H26L18 6H-16z', '#c98a4c') + f('M-20 0H22L18 6H-16z', '#8f5d36') + l('M-24-8H26L18 6H-16z', INK, 2.6) +
  `</g>` + l('M-30 8q5-5 10 0M16 8q5-5 10 0', '#eafcff', 3)

const camp = (): string =>
  s('M-20 0L-6-24L8 0z', '#8fdcff') + f('M-6-24L8 0H2z', '#3fa4ff') + l('M-20 0L-6-24L8 0z', INK, 2.6) + s('M-9 0L-6-9L-3 0z', '#173f9c', 1.8) +
  l('M14 2l12-4M14-2l12 4', '#8f5d36', 3.4) +
  `<g transform="translate(20 -1)"><g class="lf-fire">${s('M0 0c-6-2-6-8-2.500-12c1 2.500 2.500 3.500 3.500 5c1-2.500 1-5 0-7.500c5 3.500 7.500 11-1 14.500z', '#ff8a2a', 1.8)}${f('M0-1c-2.500-1-2.500-4-1-6c2 2 3.500 4 1 6z', '#ffe45e')}</g></g>`

const compass = (letters: readonly [string, string, string, string]): string => {
  const ray = (len: number, w: number, a: string, b: string): string => [0, 90, 180, 270].map(r => `<g transform="rotate(${r})">${f(`M0 0L${-w}-${w}L0-${len}z`, a)}${f(`M0 0L${w}-${w}L0-${len}z`, b)}${l(`M0 0L${-w}-${w}L0-${len}L${w}-${w}z`, INK, 2.2)}</g>`).join('')
  const txt = (x: number, y: number, t: string, big = false): string =>
    `<text class="lf-text${big ? ' lf-text--n' : ''}" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${esc(t)}</text>`
  return `<circle r="47" fill="#fff8e3" stroke="${INK}" stroke-width="3" opacity="0.92"/><circle r="39" fill="none" stroke="#d9b87a" stroke-width="2" stroke-dasharray="3 6"/>` +
    `<g transform="rotate(45)">${ray(30, 6, '#ffd978', '#e8902a')}</g>` + ray(44, 8.5, '#ff6a4f', '#c62f3a') +
    `<circle r="6" fill="#ffc526" stroke="${INK}" stroke-width="2.200"/>` +
    txt(0, -62, letters[0], true) + txt(62, 0, letters[1]) + txt(0, 62, letters[2]) + txt(-62, 0, letters[3])
}

const ribbon = (title: string): string => {
  const w = Math.max(96, Math.min(150, 34 + title.length * 11))
  return s(`M${-w - 26}-12l12 15-12 15h30v-30z`, '#e5621a') + s(`M${w + 26}-12l-12 15 12 15h-30v-30z`, '#e5621a') +
    f(`M${-w + 4} 18l-12-7h12zM${w - 4} 18l12-7h-12z`, '#8f3608') +
    s(`M${-w}-20Q0-30 ${w}-20V14Q0 4 ${-w} 14z`, '#ffc526', 3) + f(`M${-w + 2} 6Q0-4 ${w - 2} 6V12.500Q0 2.500 ${-w + 2} 12.500z`, '#f09410') +
    l(`M${-w + 10}-15Q${-w / 2}-21 ${-w / 4}-22`, '#ffe978', 3) + l(`M${-w}-20Q0-30 ${w}-20V14Q0 4 ${-w} 14z`, INK, 3) +
    `<text class="lf-text lf-text--title" x="0" y="-6.500" text-anchor="middle" dominant-baseline="central"${title.length > 12 ? ` textLength="${r1(w * 1.7)}" lengthAdjust="spacingAndGlyphs"` : ''}>${esc(title)}</text>`
}

/** Waves that glint on the open water. */
const glints = (): string => {
  const spots: Pt[] = [[30, 150], [26, 470], [180, 880], [420, 876], [740, 812], [1010, 870], [1150, 882], [1430, 690], [1560, 800], [1410, 868], [1250, 876], [540, 868]]
  return spots.map((p, i) => `<g transform="translate(${p[0]} ${p[1]})"><path class="lf-wave lf-wave--${i % 4}" d="M-15 0q5-6.500 10 0t10 0t10 0" fill="none" stroke="#ffffff" stroke-width="3.200"${round}/></g>`).join('')
}

export interface DecorText {
  /** The game's name, for the ribbon. */
  title: string
  /** N, E, S, W. */
  compass: readonly [string, string, string, string]
}

/** The sights of the map: goes over the terrain, under the landmarks. */
export const decorSvg = (text: DecorText): string =>
  glints() + at(SIGHTS.lighthouse, lighthouse(), 1.05) + at(SIGHTS.windmill, windmill(), 1.1) + at(SIGHTS.camp, camp()) +
  at(SIGHTS.serpent, serpent(), 0.9) + at(SIGHTS.ship, ship(), 0.9) + at(SIGHTS.compass, compass(text.compass)) + at(SIGHTS.ribbon, ribbon(text.title))

/**
 * The sky over the map: clouds that drift across it, and two flights of birds.
 * Each is its own small drawing, so the screen can move it as a layer (a
 * transform) and nothing under it is painted again.
 *
 * A cloud: how far down the sheet it flies, its size, the seconds one crossing
 * takes and where in the crossing it starts.
 */
export const SKY_CLOUDS: ReadonlyArray<{ y: number; k: number; secs: number; start: number }> = [
  { y: 150, k: 1.5, secs: 96, start: -8 }, { y: 360, k: 1.1, secs: 132, start: -70 }, { y: 600, k: 1.8, secs: 118, start: -40 },
  { y: 790, k: 1.2, secs: 150, start: -110 }, { y: 270, k: 0.9, secs: 170, start: -140 }
]
/** One cloud, in a `-40 -40 80 44` view box. */
export const skyCloudSvg = (): string => cloudShape()
/** A flight of birds, in a `-60 -36 76 72` view box. */
export const birdsSvg = (n: 3 | 5): string => {
  const bird = (x: number, y: number, i: number): string => `<g transform="translate(${x} ${y})"><path class="lf-flap lf-flap--${i % 3}" d="M-8 0q4-6 8 0q4-6 8 0" fill="none" stroke="${INK}" stroke-width="2.600"${round}/></g>`
  return bird(0, 0, 0) + bird(-22, 12, 1) + bird(-20, -14, 2) + (n === 5 ? bird(-46, 24, 0) + bird(-44, -26, 1) : '')
}

/** The torn edge of the sheet, as the corners of a polygon in sheet units. */
const tear = (): Pt[] => {
  const rnd = seeded(1313)
  const out: Pt[] = []
  const side = (from: Pt, to: Pt, nx: number, ny: number): void => {
    const len = Math.hypot(to[0] - from[0], to[1] - from[1])
    const n = Math.round(len / 34)
    for (let i = 0; i < n; i++) {
      const t = i / n
      // A torn edge bites in and jumps back out; the corners are left whole.
      const bite = i === 0 ? 0 : (rnd() < 0.18 ? 6 + rnd() * 9 : rnd() * 5)
      out.push([r1(from[0] + (to[0] - from[0]) * t + nx * bite), r1(from[1] + (to[1] - from[1]) * t + ny * bite)])
    }
  }
  side([0, 0], [MAP_W, 0], 0, 1)
  side([MAP_W, 0], [MAP_W, MAP_H], -1, 0)
  side([MAP_W, MAP_H], [0, MAP_H], 0, -1)
  side([0, MAP_H], [0, 0], 1, 0)
  return out
}
const TEAR = tear()

/** The sheet's outline for CSS `clip-path`. */
export const tearClip = (): string => `polygon(${TEAR.map(p => `${r1((p[0] / MAP_W) * 100)}% ${r1((p[1] / MAP_H) * 100)}%`).join(',')})`

/** The paper margin round the map, its inked rules and corner pieces. */
export const frameSvg = (): string => {
  const m = 24
  const outer = 'M' + TEAR.map(p => `${p[0]} ${p[1]}`).join('L') + 'Z'
  const inner = `M${m + 14} ${m}H${MAP_W - m - 14}Q${MAP_W - m} ${m} ${MAP_W - m} ${m + 14}V${MAP_H - m - 14}Q${MAP_W - m} ${MAP_H - m} ${MAP_W - m - 14} ${MAP_H - m}H${m + 14}Q${m} ${MAP_H - m} ${m} ${MAP_H - m - 14}V${m + 14}Q${m} ${m} ${m + 14} ${m}Z`
  const corner = `<path d="M0 0v34c0 6 4 10 10 10h34M10 12c0 14 8 22 22 22M10 6a3 3 0 1 0 .01 0M40 34a3 3 0 1 0 .01 0" fill="none" stroke="#7d5f41" stroke-width="2.600"${round}/>`
  const c = m + 12
  return `<path d="${outer}${inner}" fill-rule="evenodd" fill="#f6e3b4"/>` +
    `<path d="M0 0H${MAP_W}V${MAP_H}H0Z${`M9 9V${MAP_H - 9}H${MAP_W - 9}V9Z`}" fill-rule="evenodd" fill="#e2c68c" opacity="0.7"/>` +
    l(outer, '#b8915a', 5) + l(inner, INK, 4) +
    `<path d="M${m + 22} ${m + 9}H${MAP_W - m - 22}M${m + 22} ${MAP_H - m - 9}H${MAP_W - m - 22}M${m + 9} ${m + 22}V${MAP_H - m - 22}M${MAP_W - m - 9} ${m + 22}V${MAP_H - m - 22}" fill="none" stroke="#fff4dc" stroke-width="2.400" opacity="0.75"/>` +
    `<g transform="translate(${c} ${MAP_H - c}) scale(1 -1)">${corner}</g><g transform="translate(${MAP_W - c} ${MAP_H - c}) scale(-1 -1)">${corner}</g>` +
    `<g transform="translate(${c} ${c})">${corner}</g><g transform="translate(${MAP_W - c} ${c}) scale(-1 1)">${corner}</g>`
}
