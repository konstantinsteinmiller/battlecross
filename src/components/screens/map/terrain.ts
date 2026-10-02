/**
 * ─── The world map's terrain plate ───────────────────────────────────────────
 *
 * The drawn country under the landmarks: sea and coast, one region of terrain
 * per stretch of the journey, rivers, bridges, the worn beds of the roads and
 * the bare sites the landmarks stand on. One standalone SVG, 1600 × 900, built
 * from the data below with a seeded scatter, so it is the same map on every
 * device and crisp at any size.
 *
 * It is exactly what `public/images/ui/map.webp` replaces (`UI_ART.get('map')`)
 * and what the art bench bakes as the painter's reference (`bg-ui-map`): so
 * NOTHING here moves and nothing here is a landmark, a marker or a letter.
 * Those are drawn over it by `WorldMap.vue`, in either case.
 *
 * The look: thick ink outlines, flat two-tone fills, candy colours — the game's
 * cel style, with a hand-drawn map's conventions (little mountains seen from
 * the side, trees as lollipops, waves as squiggles).
 */
import { MAP, type NodeId } from '@/game/data/zones'
import { INK, MAP_H, MAP_W, distToLine, inPoly, r1, sampleSpline, seeded, spline, type Pt } from './geo'
import { ROADS, nodeAt } from './roads'
import { SIGHTS } from './life'

// ── Colours ──────────────────────────────────────────────────────────────────
export const TERRAIN = {
  sea: '#56c4ea', seaDeep: '#42aee0', shallow: '#8fe0f2', shallowHi: '#c3f3f8', foam: '#eafcff',
  sand: '#fbe9a8',
  meadow: '#a9e05c', meadowHi: '#c6ee7c', meadowLo: '#8ccc4a', grass: '#5fae3c',
  hills: '#d6cd6e', hillsHi: '#e9e08c', hill: '#bfb85a', hillHi: '#e3dc86', hillLo: '#9c9644',
  woods: '#6cc468', woodsHi: '#86d47a', tree: '#2fa65c', treeHi: '#62d07e', treeLo: '#1f8650', trunk: '#8f5d36',
  blossom: '#ff9ac4', blossomHi: '#ffc4dc', blossomLo: '#e86aa2', amber: '#ffb93a', amberHi: '#ffd978', amberLo: '#e8902a',
  farm: '#f6da62', farmHi: '#fde98c', wheat: '#f2c23c', wheatLo: '#d99a24', crop: '#9fd848', cropLo: '#72b834', soil: '#d98c4a', soilLo: '#b46a34',
  hay: '#ffd95a', hayLo: '#d9a02c',
  ash: '#8f6c78', ashHi: '#a88792', ashLo: '#6c4d5c', cinder: '#55384a', lava: '#ff7a28', lavaHot: '#ffe45e',
  rock: '#d6ae7a', rockHi: '#ecca98', mount: '#bd8b5a', mountLo: '#946542', mountHi: '#dcae78', snowcap: '#ffffff',
  snow: '#eef9ff', snowHi: '#ffffff', snowLo: '#c6e6f8', ice: '#9bd8f6', iceLo: '#6fb8ea', frost: '#b4d2ee', frostLo: '#88aedc',
  pine: '#2c9a76', pineHi: '#5cc49c', pineLo: '#1c7a62',
  marsh: '#8ed89c', marshHi: '#aee8ae', lake: '#48c2d0', lakeHi: '#8ae6e6', reed: '#3f9a54', reedTop: '#8a5a34',
  void: '#8a5ee0', voidHi: '#a882f2', voidLo: '#6a40c2', crystal: '#d9b6ff', crystalHi: '#f4e6ff', crystalLo: '#a46cf0',
  dread: '#70324e', dreadHi: '#8e4a66', dreadLo: '#4e2038', dreadRock: '#562a46', ember: '#ff5a4a',
  rift: '#2c1244', riftGlow: '#ff5ad8', riftCore: '#ffe6ff',
  river: '#5cc8f0', riverHi: '#c3f3f8',
  road: '#e2c68c', roadLo: '#c7a56a', wood: '#c98a4c', woodLo: '#8f5d36', stone: '#c9c4d2', stoneLo: '#928ca4',
  site: '#edd69c'
} as const
const C = TERRAIN

// ── SVG shorthands ───────────────────────────────────────────────────────────
const round = ' stroke-linejoin="round" stroke-linecap="round"'
const shape = (d: string, fill: string, sw = 3, stroke: string = INK): string => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${round}/>`
const flat = (d: string, fill: string, extra = ''): string => `<path d="${d}" fill="${fill}"${extra}/>`
const line = (d: string, stroke: string, sw: number, extra = ''): string => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}"${round}${extra}/>`
const use = (id: string, p: Pt, s = 1, flip = false): string =>
  `<use xlink:href="#${id}" transform="translate(${r1(p[0])} ${r1(p[1])}) scale(${flip ? -r1(s) : r1(s)} ${r1(s)})"/>`
const poly = (pts: readonly Pt[]): string => 'M' + pts.map(p => `${r1(p[0])} ${r1(p[1])}`).join('L') + 'Z'

// ── The country ──────────────────────────────────────────────────────────────
/** The mainland, clockwise from the north-west: sea to the west and the south,
 *  more land past the top and the right edge. */
const LAND: Pt[] = [
  [176, -70], [130, 34], [86, 116], [98, 200], [60, 268], [86, 350], [54, 432], [72, 520], [46, 604], [74, 694], [130, 758],
  [236, 794], [352, 816], [462, 842], [556, 830], [610, 790], [664, 762], [762, 770], [862, 780], [950, 772], [1002, 804],
  [1062, 846], [1180, 852], [1262, 802], [1304, 734], [1352, 664], [1432, 616], [1530, 622], [1680, 588], [1680, -70]
]
const ISLES: Pt[][] = [
  [[52, 838], [70, 812], [108, 808], [132, 832], [116, 860], [70, 864]],
  [[1556, 716], [1580, 700], [1606, 714], [1596, 738], [1566, 740]]
]

interface Region { id: string; poly: Pt[]; fill: string; hi: string; lift?: Pt }
const REGIONS: Region[] = [
  { id: 'hills', fill: C.hills, hi: C.hillsHi, poly: [[30, 296], [150, 284], [300, 306], [356, 376], [338, 470], [258, 524], [124, 516], [30, 530]] },
  { id: 'rock', fill: C.rock, hi: C.rockHi, poly: [[50, -70], [724, -70], [706, 84], [684, 196], [636, 284], [524, 316], [404, 300], [300, 282], [166, 262], [60, 270]] },
  { id: 'woods', fill: C.woods, hi: C.woodsHi, poly: [[536, 398], [646, 372], [764, 416], [834, 470], [824, 548], [750, 602], [622, 598], [548, 566], [520, 478]] },
  { id: 'farm', fill: C.farm, hi: C.farmHi, poly: [[776, 584], [900, 532], [1040, 558], [1180, 618], [1268, 716], [1260, 880], [1000, 880], [900, 800], [650, 790], [650, 706], [706, 642]] },
  { id: 'ash', fill: C.ash, hi: C.ashHi, poly: [[640, 216], [762, 198], [902, 204], [970, 282], [954, 374], [882, 424], [742, 414], [660, 364], [622, 292]] },
  { id: 'marsh', fill: C.marsh, hi: C.marshHi, lift: [0, 0], poly: [[1160, 392], [1300, 362], [1424, 400], [1476, 500], [1424, 592], [1332, 646], [1232, 604], [1160, 524], [1136, 446]] },
  { id: 'snow', fill: C.snow, hi: C.snowHi, lift: [0, -6], poly: [[704, -70], [1196, -70], [1176, 82], [1196, 204], [1176, 332], [1084, 378], [984, 338], [958, 232], [884, 184], [724, 172], [694, 60]] },
  { id: 'void', fill: C.void, hi: C.voidHi, poly: [[1172, 66], [1302, 96], [1422, 194], [1442, 302], [1382, 352], [1242, 342], [1178, 282], [1182, 164]] },
  { id: 'dread', fill: C.dread, hi: C.dreadHi, poly: [[1180, -70], [1680, -70], [1680, 236], [1562, 226], [1442, 196], [1322, 100], [1192, 62]] }
]
const REGION_POLY: Record<string, Pt[]> = Object.fromEntries(REGIONS.map(r => [r.id, sampleSpline(r.poly, true, 6)]))

/** The tear the Void came through, running off the edge of the sheet. */
const RIFT: Pt[] = [[1404, 338], [1436, 312], [1452, 326], [1484, 286], [1516, 306], [1560, 262], [1680, 236], [1680, 440], [1590, 398], [1552, 414], [1516, 384], [1482, 400], [1452, 372], [1430, 366]]

const LAKE: Pt[] = [[1226, 452], [1296, 420], [1378, 440], [1402, 494], [1354, 536], [1270, 534], [1222, 496]]
const LAKE_POLY = sampleSpline(LAKE, true, 6)

interface River { pts: Pt[]; w: number; fill: string; hi: string; mouth?: boolean }
const RIVERS: River[] = [
  { pts: [[612, 308], [578, 372], [534, 430], [506, 500], [522, 572], [576, 640], [626, 704], [650, 770]], w: 13, fill: C.river, hi: C.riverHi, mouth: true },
  { pts: [[336, 262], [252, 284], [172, 268], [104, 292], [56, 300]], w: 11, fill: C.river, hi: C.riverHi, mouth: true },
  { pts: [[1128, 326], [1160, 378], [1204, 416], [1244, 456]], w: 10, fill: C.river, hi: C.riverHi },
  { pts: [[1376, 516], [1410, 566], [1394, 612], [1416, 640]], w: 12, fill: C.river, hi: C.riverHi, mouth: true },
  // The lava that runs off the volcano into its pool.
  { pts: [[826, 322], [866, 344], [884, 378], [872, 398]], w: 8, fill: C.lava, hi: C.lavaHot }
]
const RIVER_LINES = RIVERS.map(r => sampleSpline(r.pts, false, 10))

/** The ground a landmark stands on, by place. */
const SITE: Record<NodeId, [string, string]> = {
  sunford: [C.site, C.roadLo], plains: [C.site, C.roadLo], hollows: [C.hillsHi, C.hillLo], arena: [C.site, C.roadLo], woods: [C.woodsHi, C.treeLo],
  outskirts: [C.site, C.roadLo], oakhaven: [C.site, C.roadLo], crags: [C.ashHi, C.ashLo], mines: [C.rockHi, C.mountLo], ironhold: [C.rockHi, C.mountLo],
  tundra: [C.snowHi, C.snowLo], temple: [C.marshHi, C.reed], citadel: [C.voidHi, C.voidLo], peak: [C.snowHi, C.snowLo], fortress: [C.dreadHi, C.dreadLo], rift: [C.voidLo, C.rift]
}

// ── The stamps: one drawing each, used many times ────────────────────────────
const tree = (id: string, body: string, hi: string, lo: string): string => `<g id="${id}">` +
  flat('M-9 1.500a9 3 0 1 0 18 0a9 3 0 1 0-18 0z', 'rgba(42,28,48,0.18)') +
  shape('M-2.800 1V-9h5.600V1z', C.trunk, 2.200) +
  `<circle cx="0" cy="-18" r="12.500" fill="${body}" stroke="${INK}" stroke-width="2.800"/>` +
  flat('M-10.800-13.500A12.500 12.500 0 0 0 12.300-16.500A15 15 0 0 1-10.800-13.500z', lo) +
  line('M-7.500-19a8.500 8.500 0 0 1 6.500-7.500', hi, 3.400) + '</g>'
const pine = (id: string, body: string, hi: string, tip: string): string => `<g id="${id}">` +
  shape('M-2.200 1V-6h4.400V1z', C.trunk, 2) +
  shape('M0-37L9-23H5L12.500-12H6.500L15-2H-15L-6.500-12H-12.500L-5-23H-9z', body, 2.600) +
  line('M-4-21L0-28M-6-10L-1-17', hi, 2.600) +
  (tip ? shape('M0-37L5.500-28.500L1-26L-2-29L-5.500-28.500z', tip, 1.800) : '') + '</g>'
const peak = (id: string, body: string, lo: string, cap: string): string => `<g id="${id}">` +
  flat('M-42 0L-11-51Q-6-58-1-51L11-31L19-40Q22-44 25-40L46 0z', body) +
  flat('M-6-56Q-3-56-1-51L11-31L5-19L14-8L9 0H46L25-40Q22-44 19-40L11-31L-1-51z', lo) +
  shape('M-22.500-32L-11-51Q-6-58-1-51L8-36L2-29L-5-37L-12-28L-17-34z', cap, 2.200) +
  line('M-42 0L-11-51Q-6-58-1-51L11-31L19-40Q22-44 25-40L46 0', INK, 3.200) + '</g>'

const STAMPS = [
  tree('t1', C.tree, C.treeHi, C.treeLo),
  tree('t2', '#48b84e', '#84de6a', '#2f9a42'),
  tree('t3', C.blossom, C.blossomHi, C.blossomLo),
  tree('t4', C.amber, C.amberHi, C.amberLo),
  pine('p1', C.pine, C.pineHi, ''),
  pine('p2', C.pine, C.pineHi, C.snowcap),
  peak('m1', C.mount, C.mountLo, C.snowcap),
  peak('m2', C.frost, C.frostLo, C.snowcap),
  peak('m3', C.dreadRock, '#3c1a32', C.ember),
  // A bush: three lobes.
  `<g id="b1">${shape('M-13 1a7 7 0 0 1 1.500-13a9 9 0 0 1 16-3a7.500 7.500 0 0 1 8 16z', C.tree, 2.600)}${line('M-6-11a7 7 0 0 1 6-4', C.treeHi, 2.800)}</g>`,
  // A hill and its lit shoulder.
  `<g id="h1">${shape('M-27 0Q-25-21 0-21Q25-21 27 0z', C.hill, 2.800)}${line('M-16-9Q-9-16 2-16', C.hillHi, 3.200)}${line('M12-5Q16-9 15-13', C.hillLo, 2.600)}</g>`,
  `<g id="h2">${shape('M-27 0Q-25-21 0-21Q25-21 27 0z', C.meadowLo, 2.800)}${line('M-16-9Q-9-16 2-16', C.meadowHi, 3.200)}</g>`,
  `<g id="g1">${line('M-5 0L-7.500-7M0 0V-9.500M5 0L7.500-7', C.grass, 2.400)}</g>`,
  `<g id="f1">${line('M0 0V-7', C.grass, 2.200)}<circle cx="0" cy="-9" r="3.200" fill="#ffffff" stroke="${INK}" stroke-width="1.600"/><circle cx="0" cy="-9" r="1.100" fill="${C.amber}"/></g>`,
  `<g id="f2">${line('M0 0V-7', C.grass, 2.200)}<circle cx="0" cy="-9" r="3.200" fill="#ff7aa8" stroke="${INK}" stroke-width="1.600"/><circle cx="0" cy="-9" r="1.100" fill="${C.lavaHot}"/></g>`,
  `<g id="r1">${shape('M-11 0L-8-10L2-14L11-7L10 0z', C.stone, 2.600)}${flat('M2-14L11-7L10 0H3L5-7z', C.stoneLo)}${line('M-11 0L-8-10L2-14L11-7L10 0z', INK, 2.600)}</g>`,
  `<g id="r2">${shape('M-11 0L-8-10L2-14L11-7L10 0z', C.cinder, 2.600)}${line('M-5-3L-2-8L3-6', C.lava, 2.400)}</g>`,
  `<g id="w1">${line('M-15 0q5-6.500 10 0t10 0t10 0', C.foam, 3)}</g>`,
  `<g id="w2">${line('M-10 0q5-6 10 0t10 0', C.shallowHi, 2.800)}</g>`,
  `<g id="e1">${line('M-5 1V-13M1 1V-18M7 1V-11', C.reed, 2.400)}${flat('M-6.800-17a1.800 3.600 0 1 0 3.600 0a1.800 3.600 0 1 0-3.600 0zM-0.800-22a1.800 3.600 0 1 0 3.600 0a1.800 3.600 0 1 0-3.600 0z', C.reedTop)}</g>`,
  `<g id="l1">${shape('M-7 0a7 3.600 0 1 0 14 0a7 3.600 0 1 0-14 0z', '#7ad86a', 2)}${flat('M0 0L7-1.500L6 2z', C.lake)}<circle cx="-1" cy="-1.500" r="1.800" fill="#ff9ac4"/></g>`,
  `<g id="x1">${shape('M-8 0L-5-22L2-31L9-9L7 0z', C.crystal, 2.600)}${flat('M-5-22L2-31L1-10z', C.crystalHi)}${flat('M2-31L9-9L7 0H3z', C.crystalLo)}${line('M-8 0L-5-22L2-31L9-9L7 0z', INK, 2.600)}</g>`,
  `<g id="d1">${line('M0 1V-19M0-9L-8-17M0-13L7-21M-8-17L-12-15M7-21L11-20', INK, 3.200)}</g>`,
  `<g id="s1">${line('M-15 0Q-7-9 4-4Q10-9 17 0', C.snowLo, 3)}</g>`,
  `<g id="i1">${shape('M-7 0L-3-17L4-11L9 0z', C.ice, 2.400)}${flat('M-3-17L4-11L1-2z', '#e6f8ff')}</g>`,
  `<g id="y1">${shape('M-10 0Q-10-15 0-16Q10-15 10 0z', C.hay, 2.600)}${line('M-3.500-4V-11M3-3V-9', C.hayLo, 2.200)}</g>`,
  `<g id="a1">${line('M-4-1V3M3-1V3', INK, 2)}<ellipse cx="0" cy="-5" rx="7.500" ry="5.500" fill="#ffffff" stroke="${INK}" stroke-width="2.200"/><circle cx="7" cy="-7.500" r="3.200" fill="${INK}"/></g>`,
  `<g id="k1">${shape('M-6 0L0-24L6 0z', C.dreadHi, 2.600)}${flat('M0-24L6 0H1z', C.dreadLo)}${line('M-6 0L0-24L6 0z', INK, 2.600)}</g>`,
  // A standing stone.
  `<g id="o1">${shape('M-5 0L-4.500-17Q0-21 4.500-17L5 0z', C.stone, 2.400)}${flat('M1-19Q4-19 4.500-17L5 0H1z', C.stoneLo)}${line('M-5 0L-4.500-17Q0-21 4.500-17L5 0z', INK, 2.400)}</g>`,
  // A palm.
  `<g id="q1">${line('M0 1Q-3-10 2-20', C.trunk, 4)}${line('M0 1Q-3-10 2-20', INK, 1)}${shape('M2-20Q-9-27-16-19Q-8-21 2-20Q-2-31-11-33Q-1-33 2-20Q6-32 16-30Q8-27 2-20Q12-23 18-15Q9-19 2-20z', '#3fbf5c', 2)}</g>`
].join('')

// ── Scatter ──────────────────────────────────────────────────────────────────
const LAND_POLY = sampleSpline(LAND, false, 6)
const ROAD_LINES = ROADS.map(r => r.line)
const NODE_AT = MAP.map(n => nodeAt(n.id))
/** The sights drawn over the plate (`life.ts`), and the stone circle. */
const CLEARINGS: Pt[] = [SIGHTS.windmill, SIGHTS.camp, [452, 394]]

/** Is this spot free for a stamp: on land, clear of every landmark and its
 *  name, of the roads and of the water? */
const free = (p: Pt, pad = 0): boolean => {
  if (!inPoly(p, LAND_POLY) || inPoly(p, LAKE_POLY) || inPoly(p, RIFT)) return false
  for (const n of NODE_AT) {
    const dx = (p[0] - n[0]) / (64 + pad)
    const dy = (p[1] - (n[1] - 26)) / (74 + pad)
    if (dx * dx + dy * dy < 1) return false
    // The name hangs under the landmark.
    if (Math.abs(p[0] - n[0]) < 92 && p[1] > n[1] + 14 && p[1] < n[1] + 74) return false
  }
  for (const c of CLEARINGS) if (Math.hypot(p[0] - c[0], (p[1] - (c[1] - 14)) * 1.3) < 46 + pad) return false
  for (const l of ROAD_LINES) if (distToLine(p, l) < 17 + pad) return false
  for (let i = 0; i < RIVER_LINES.length; i++) if (distToLine(p, RIVER_LINES[i]!) < RIVERS[i]!.w + 6 + pad) return false
  return true
}

interface Stamp { p: Pt; svg: string }

/** Up to `want` free spots inside a region, no two closer than `gap`. */
const scatter = (rnd: () => number, area: readonly Pt[], want: number, gap: number, pad = 0, ok: (p: Pt) => boolean = () => true): Pt[] => {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const p of area) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]) }
  x0 = Math.max(x0, 8); y0 = Math.max(y0, 34); x1 = Math.min(x1, MAP_W - 8); y1 = Math.min(y1, MAP_H - 6)
  const out: Pt[] = []
  for (let i = 0; i < want * 40 && out.length < want; i++) {
    const p: Pt = [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)]
    if (!inPoly(p, area) || !free(p, pad) || !ok(p)) continue
    if (out.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < gap)) continue
    out.push(p)
  }
  return out
}

const pick = <T>(rnd: () => number, list: readonly T[]): T => list[Math.floor(rnd() * list.length)]!

/** Everything that stands on the land, back to front. */
const stamps = (): string => {
  const rnd = seeded(20261002)
  const out: Stamp[] = []
  const put = (pts: Pt[], make: (p: Pt) => string): void => { for (const p of pts) out.push({ p, svg: make(p) }) }
  const inAny = (p: Pt): boolean => Object.values(REGION_POLY).some(a => inPoly(p, a))
  const size = (a: number, b: number): number => a + rnd() * (b - a)
  const R = REGION_POLY

  // The Whispering Woods: clumps of round trees, a few in blossom.
  put(scatter(rnd, R.woods!, 64, 21), p => use(pick(rnd, ['t1', 't1', 't1', 't2', 't2', 't4', 't3']), p, size(0.9, 1.25), rnd() < 0.5))
  put(scatter(rnd, R.woods!, 10, 26, 2), p => use('b1', p, size(0.8, 1.1), rnd() < 0.5))

  // The Ironpeaks, and the pines at their feet.
  put(scatter(rnd, R.rock!, 22, 64, 6), p => use('m1', p, size(0.82, 1.2), rnd() < 0.5))
  put(scatter(rnd, R.rock!, 16, 30), p => use('p1', p, size(0.72, 0.95)))
  put(scatter(rnd, R.rock!, 12, 34), p => use('r1', p, size(0.8, 1.2), rnd() < 0.5))

  // The goblin hills.
  put(scatter(rnd, R.hills!, 15, 44), p => use('h1', p, size(0.85, 1.25), rnd() < 0.5))
  put(scatter(rnd, R.hills!, 8, 30), p => use('r1', p, size(0.7, 1), rnd() < 0.5))
  put(scatter(rnd, R.hills!, 7, 34), p => use(pick(rnd, ['b1', 't2']), p, size(0.7, 0.9)))

  // The golden fields: hay, a hedge tree here and there.
  put(scatter(rnd, R.farm!, 12, 44), p => use('y1', p, size(0.85, 1.15)))
  put(scatter(rnd, R.farm!, 12, 54), p => use(pick(rnd, ['t2', 't4', 'b1']), p, size(0.75, 1), rnd() < 0.5))

  // The Ashlands: cinder rocks and dead trees.
  put(scatter(rnd, R.ash!, 18, 34), p => use('r2', p, size(0.8, 1.35), rnd() < 0.5))
  put(scatter(rnd, R.ash!, 9, 44), p => use('d1', p, size(0.8, 1.1), rnd() < 0.5))

  // The Frostmarch.
  put(scatter(rnd, R.snow!, 9, 78, 6), p => use('m2', p, size(0.85, 1.2), rnd() < 0.5))
  put(scatter(rnd, R.snow!, 22, 30), p => use('p2', p, size(0.72, 1)))
  put(scatter(rnd, R.snow!, 14, 40), p => use('s1', p, size(0.8, 1.2), rnd() < 0.5))
  put(scatter(rnd, R.snow!, 10, 40), p => use('i1', p, size(0.8, 1.3), rnd() < 0.5))

  // The Naga Mere: reeds round the lake.
  put(scatter(rnd, R.marsh!, 22, 26), p => use('e1', p, size(0.8, 1.15), rnd() < 0.5))
  put(scatter(rnd, R.marsh!, 7, 44), p => use(pick(rnd, ['b1', 't1']), p, size(0.7, 0.95)))

  // The Voidreach: crystal growths.
  put(scatter(rnd, R.void!, 22, 30), p => use('x1', p, size(0.7, 1.35), rnd() < 0.5))

  // The Dreadlands: black peaks with burning tips, thorns, dead trees.
  put(scatter(rnd, R.dread!, 9, 70, 6), p => use('m3', p, size(0.8, 1.15), rnd() < 0.5))
  put(scatter(rnd, R.dread!, 14, 32), p => use('k1', p, size(0.7, 1.2)))
  put(scatter(rnd, R.dread!, 9, 40), p => use('d1', p, size(0.75, 1.05), rnd() < 0.5))

  // The open meadow between them: tufts, flowers, lone trees, a soft hill.
  const meadow = LAND_POLY
  const open = (p: Pt): boolean => !inAny(p)
  put(scatter(rnd, meadow, 9, 90, 4, open), p => use('h2', p, size(0.9, 1.3), rnd() < 0.5))
  put(scatter(rnd, meadow, 30, 54, 0, open), p => use(pick(rnd, ['t1', 't2', 't2', 'b1', 't3']), p, size(0.72, 1.05), rnd() < 0.5))
  put(scatter(rnd, meadow, 64, 26, 0, open), p => use(pick(rnd, ['g1', 'g1', 'g1', 'f1', 'f2']), p, size(0.9, 1.2)))

  // By hand: sheep on the plains, the stone circle, the camp's logs.
  for (const p of [[250, 596], [268, 610], [236, 612], [470, 648], [488, 660], [378, 700]] as Pt[]) out.push({ p, svg: use('a1', p, 1, Math.round(p[0]) % 3 === 0) })
  for (const [i, a] of [0, 1, 2, 3, 4, 5, 6].entries()) {
    const p: Pt = [452 + Math.cos((a / 7) * Math.PI * 2) * 26, 398 + Math.sin((a / 7) * Math.PI * 2) * 11]
    out.push({ p, svg: use('o1', p, i % 3 === 0 ? 1.15 : 0.9) })
  }
  out.push({ p: [1582, 728], svg: use('q1', [1582, 728], 1, true) })

  out.sort((a, b) => a.p[1] - b.p[1])
  return out.map(s => s.svg).join('')
}

// ── Ground marks that lie flat (drawn under the stamps) ──────────────────────
const fields = (): string => {
  const rnd = seeded(77)
  const kinds: Array<[string, string]> = [[C.wheat, C.wheatLo], [C.crop, C.cropLo], [C.soil, C.soilLo], [C.wheat, C.wheatLo]]
  let out = ''
  for (const p of scatter(rnd, REGION_POLY.farm!, 20, 74, 8)) {
    const w = 46 + rnd() * 30
    const h = 26 + rnd() * 14
    const [fill, lo] = pick(rnd, kinds)
    let rows = ''
    for (let y = -h / 2 + 6; y < h / 2 - 3; y += 7) rows += `M${r1(-w / 2 + 6)} ${r1(y)}H${r1(w / 2 - 6)}`
    out += `<g transform="translate(${r1(p[0])} ${r1(p[1])}) rotate(${r1(-18 + rnd() * 36)}) skewX(-14)">` +
      `<rect x="${r1(-w / 2)}" y="${r1(-h / 2)}" width="${r1(w)}" height="${r1(h)}" rx="5" fill="${fill}" stroke="${INK}" stroke-width="2.600"/>` + line(rows, lo, 2.400) + '</g>'
  }
  return out
}

const groundMarks = (): string => {
  const rnd = seeded(4242)
  let out = ''
  // Lit patches on the meadow, and darker ones: two tones, hard edges.
  for (const p of scatter(rnd, LAND_POLY, 16, 120, 0, q => !Object.values(REGION_POLY).some(a => inPoly(q, a)))) {
    const rx = 34 + rnd() * 30
    out += `<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="${r1(rx)}" ry="${r1(rx * 0.42)}" fill="${rnd() < 0.6 ? C.meadowHi : C.meadowLo}"/>`
  }
  // Cracks of fire across the ash.
  for (const p of scatter(rnd, REGION_POLY.ash!, 11, 52, 0)) {
    let d = `M${r1(p[0])} ${r1(p[1])}`
    let a = rnd() * Math.PI * 2
    for (let i = 0; i < 4; i++) { a += (rnd() - 0.5) * 1.6; d += `l${r1(Math.cos(a) * 13)} ${r1(Math.sin(a) * 8)}` }
    out += line(d, C.cinder, 7) + line(d, C.lava, 3.600) + line(d, C.lavaHot, 1.400)
  }
  // Pools of nothing in the Voidreach, and rifts of ember in the Dreadlands.
  for (const p of scatter(rnd, REGION_POLY.void!, 7, 64, 0)) {
    const rx = 16 + rnd() * 12
    out += `<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="${r1(rx)}" ry="${r1(rx * 0.45)}" fill="${C.voidLo}" stroke="${INK}" stroke-width="2.400"/>` +
      `<ellipse cx="${r1(p[0] - rx * 0.2)}" cy="${r1(p[1] - 1)}" rx="${r1(rx * 0.42)}" ry="${r1(rx * 0.16)}" fill="${C.crystalLo}"/>`
  }
  for (const p of scatter(rnd, REGION_POLY.dread!, 8, 70, 0)) {
    let d = `M${r1(p[0])} ${r1(p[1])}`
    for (let i = 0; i < 3; i++) d += `l${r1(9 + rnd() * 8)} ${r1((i % 2 ? -1 : 1) * (4 + rnd() * 5))}`
    out += line(d, C.dreadLo, 7) + line(d, C.ember, 3)
  }
  // Frozen ponds.
  for (const p of scatter(rnd, REGION_POLY.snow!, 6, 110, 4)) {
    const rx = 20 + rnd() * 14
    out += `<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="${r1(rx)}" ry="${r1(rx * 0.42)}" fill="${C.ice}" stroke="${INK}" stroke-width="2.400"/>` +
      line(`M${r1(p[0] - rx * 0.5)} ${r1(p[1] - 1)}l${r1(rx * 0.4)} -3`, '#e6f8ff', 2.400)
  }
  return out
}

const sea = (): string => {
  const rnd = seeded(909)
  let out = `<rect x="-2" y="-2" width="${MAP_W + 4}" height="${MAP_H + 4}" fill="${C.sea}"/>`
  // Deeper water away from the shore.
  for (const [x, y, rx, ry] of [[40, 880, 240, 60], [800, 930, 330, 62], [1500, 880, 220, 110], [-20, 420, 60, 220], [-30, 60, 120, 90]]) {
    out += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.seaDeep}"/>`
  }
  const coast = spline(LAND, false) + ISLES.map(i => spline(i, true)).join('')
  out += line(coast, C.shallow, 62) + line(coast, C.shallowHi, 30)
  // Waves, wherever there is open water.
  const wet = (p: Pt): boolean => !inPoly(p, LAND_POLY) && distToLine(p, LAND_POLY) > 22 && !ISLES.some(i => inPoly(p, i) || distToLine(p, i) < 22)
  const marks: Pt[] = []
  for (let i = 0; i < 2600 && marks.length < 64; i++) {
    const p: Pt = [14 + rnd() * (MAP_W - 28), 14 + rnd() * (MAP_H - 28)]
    if (!wet(p) || marks.some(q => Math.abs(q[0] - p[0]) < 62 && Math.abs(q[1] - p[1]) < 24)) continue
    marks.push(p)
    out += use(rnd() < 0.6 ? 'w1' : 'w2', p, 0.85 + rnd() * 0.4)
  }
  return out
}

const land = (): string => {
  const coast = spline(LAND, false) + 'Z'
  const isles = ISLES.map(i => spline(i, true)).join('')
  let out = line(coast + isles, INK, 9) + flat(coast + isles, C.meadow)
  let regions = ''
  for (const r of REGIONS) {
    const d = spline(r.poly, true)
    // The lit middle of a region: the same outline, drawn smaller.
    let cx = 0
    let cy = 0
    for (const p of r.poly) { cx += p[0] / r.poly.length; cy += p[1] / r.poly.length }
    const lift = r.lift ?? [-10, -8]
    const inner = r.poly.map((p): Pt => [cx + (p[0] - cx) * 0.6 + lift[0], cy + (p[1] - cy) * 0.6 + lift[1]])
    regions += flat(d, r.fill) + flat(spline(inner, true), r.hi)
  }
  // The tear: a black wound with a burning edge.
  regions += shape(poly(RIFT), C.rift, 3.200) +
    line(poly(RIFT.map((p): Pt => [p[0] + 9, p[1] + (p[1] < 340 ? 9 : -9)])), C.riftGlow, 5) +
    line(poly(RIFT.map((p): Pt => [p[0] + 20, p[1] + (p[1] < 340 ? 17 : -17)])), C.voidLo, 3)
  out += `<g clip-path="url(#land)">${regions}${groundMarks()}${fields()}` +
    line(coast + isles, C.sand, 22) + '</g>'
  return out
}

const water = (): string => {
  let out = ''
  for (const r of RIVERS) {
    const d = spline(r.pts, false)
    out += `<g clip-path="url(#land)">${line(d, INK, r.w + 6)}${line(d, r.fill, r.w)}${line(d, r.hi, 2.400, ` stroke-dasharray="${r.w} ${r.w * 2.2}"`)}</g>`
    if (r.mouth) {
      const end = r.pts[r.pts.length - 1]!
      out += `<circle cx="${end[0]}" cy="${end[1]}" r="${r1(r.w * 0.95)}" fill="${C.shallowHi}"/>`
    }
  }
  // The lava's pool.
  out += `<ellipse cx="872" cy="402" rx="24" ry="11" fill="${C.lava}" stroke="${INK}" stroke-width="3"/><ellipse cx="866" cy="400" rx="11" ry="4" fill="${C.lavaHot}"/>`
  const lake = spline(LAKE, true)
  const inner = LAKE.map((p): Pt => [1304 + (p[0] - 1304) * 0.62 - 10, 480 + (p[1] - 480) * 0.56 - 8])
  out += shape(lake, C.lake, 3.200) + flat(spline(inner, true), C.lakeHi) +
    use('w2', [1262, 508], 0.8) + use('w2', [1366, 470], 0.8) + use('l1', [1250, 478]) + use('l1', [1372, 506], 0.9, true) + use('l1', [1330, 440], 0.8)
  return out
}

/** Where a road crosses a river: the spot and the road's heading there. */
const crossings = (): Array<{ p: Pt; angle: number }> => {
  const out: Array<{ p: Pt; angle: number }> = []
  for (const road of ROAD_LINES) {
    for (let k = 0; k < RIVER_LINES.length - 1; k++) {
      const river = RIVER_LINES[k]!
      let best = Infinity
      let at = -1
      for (let i = 1; i < road.length - 1; i++) {
        const d = distToLine(road[i]!, river)
        if (d < best) { best = d; at = i }
      }
      if (best > 7 || at < 0) continue
      const a = road[at - 1]!
      const b = road[at + 1]!
      out.push({ p: road[at]!, angle: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI })
    }
  }
  return out
}

/**
 * A plank bridge wherever a road meets a river. On the plate, and drawn again
 * by the map screen over the travelled roads, which would otherwise cover it.
 */
export const mapBridgesSvg = (): string => crossings().map(c =>
  `<g transform="translate(${r1(c.p[0])} ${r1(c.p[1])}) rotate(${r1(c.angle)})">` +
  `<rect x="-19" y="-10" width="38" height="20" rx="3" fill="${C.wood}" stroke="${INK}" stroke-width="3"/>` +
  line('M-10-10V10M0-10V10M10-10V10', C.woodLo, 2.200) + line('M-21-12H21M-21 12H21', INK, 3.400) + '</g>').join('')

const roads = (): string => {
  let out = ''
  // The worn bed of every road. The map screen draws the travelled ones over it.
  for (const r of ROADS) out += line(r.d, C.roadLo, 11) + line(r.d, C.road, 7)
  out += mapBridgesSvg()
  for (const n of MAP) {
    const p = nodeAt(n.id)
    const [fill, lip] = SITE[n.id]
    out += `<ellipse cx="${r1(p[0])}" cy="${r1(p[1] + 5)}" rx="50" ry="20" fill="${lip}" stroke="${INK}" stroke-width="3"/>` +
      `<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="50" ry="20" fill="${fill}" stroke="${INK}" stroke-width="3"/>`
  }
  return out
}

/** The wreck on the rocks of the west shore, and the shoals. */
const seaDetails = (): string =>
  `<g transform="translate(46 708) scale(0.8)">${shape('M-24 0Q-20 14 0 14Q18 14 26-4L10-2L4-10L-8-3z', C.wood, 2.800)}${line('M-2-4L6-30', INK, 3.400)}${shape('M6-30L22-20L8-16z', '#f4ecd8', 2.200)}${line('M-16 6H14', C.woodLo, 2.400)}</g>` +
  use('r1', [1300, 872], 1.1) + use('r1', [1262, 878], 0.8, true) + use('r1', [34, 726], 0.9) + use('r1', [62, 722], 0.7, true)

let cached = ''

/** The terrain plate: a standalone SVG document, 1600 × 900. */
export const mapPlateSvg = (): string => {
  if (cached) return cached
  const coast = spline(LAND, false) + 'Z' + ISLES.map(i => spline(i, true)).join('')
  cached = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${MAP_W} ${MAP_H}" width="${MAP_W}" height="${MAP_H}" preserveAspectRatio="none">` +
    `<defs><clipPath id="land"><path d="${coast}"/></clipPath>${STAMPS}</defs>` +
    sea() + land() + water() + roads() + stamps() + seaDetails() + '</svg>'
  return cached
}

let url = ''
/** The plate as an image source. A data URL: `img-src data:` is in every
 *  portal's CSP, `blob:` is not. */
export const mapPlateUrl = (): string => (url ||= `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mapPlateSvg())}`)
