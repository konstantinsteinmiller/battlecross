/**
 * ─── The landmarks of the world map ──────────────────────────────────────────
 *
 * One small drawing per place, in a 100 × 100 box whose ground line is y = 82
 * (the place's own spot on the sheet is the box's 50, 80). Drawn by code over
 * the terrain plate, painted or not, because a landmark has STATES: a place
 * still locked is drawn washed out and still, and Oakhaven stands or lies in
 * ruins by what the player chose.
 *
 * Parts that live carry a class the map screen animates:
 * `lm-flag` (flutters), `lm-smoke` (rises), `lm-glow` (flickers), `lm-bob`.
 */
import type { NodeId } from '@/game/data/zones'
import { INK, mix } from './geo'

export interface LandmarkState {
  /** Not open yet: washed out, nothing moves. */
  locked?: boolean
  /** Oakhaven after the siege was lost. */
  ruined?: boolean
}

interface Pen {
  /** An outlined shape. */
  s: (d: string, fill: string, sw?: number) => string
  /** A flat shape (a shadow facet, a highlight). */
  f: (d: string, fill: string, cls?: string) => string
  /** A coloured line. */
  l: (d: string, colour: string, sw: number, cls?: string) => string
  /** An ink line. */
  i: (d: string, sw?: number) => string
  /** A disc. */
  o: (x: number, y: number, r: number, fill: string, cls?: string, sw?: number) => string
  /** A colour as this state shows it. */
  c: (hex: string) => string
  live: boolean
}

const grey = (hex: string): string => {
  const v = Math.round(parseInt(hex.slice(1, 3), 16) * 0.3 + parseInt(hex.slice(3, 5), 16) * 0.55 + parseInt(hex.slice(5, 7), 16) * 0.15)
  return '#' + v.toString(16).padStart(2, '0').repeat(3)
}

const FIRE = new Set(['#ff8a2a', '#ffe45e'])

const pen = (st: LandmarkState): Pen => {
  // Locked: every colour loses its hue and fades toward old paper.
  const c = st.locked ? (hex: string): string => mix(mix(hex, grey(hex), 0.86), '#d8cfc4', 0.34)
    // Fallen: soot and bruise over everything but the fires.
    : st.ruined ? (hex: string): string => (FIRE.has(hex) ? hex : mix(mix(hex, grey(hex), 0.55), '#5a4670', 0.4))
      : (hex: string): string => hex
  const ink = st.locked ? '#6f6678' : INK
  const join = ' stroke-linejoin="round" stroke-linecap="round"'
  const cl = (cls?: string): string => (cls && !st.locked ? ` class="${cls}"` : '')
  return {
    c,
    live: !st.locked,
    s: (d, fill, sw = 2.6) => `<path d="${d}" fill="${c(fill)}" stroke="${ink}" stroke-width="${sw}"${join}/>`,
    f: (d, fill, cls) => `<path d="${d}" fill="${c(fill)}"${cl(cls)}/>`,
    l: (d, colour, sw, cls) => `<path d="${d}" fill="none" stroke="${c(colour)}" stroke-width="${sw}"${join}${cl(cls)}/>`,
    i: (d, sw = 2.6) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${sw}"${join}/>`,
    o: (x, y, r, fill, cls, sw = 2.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c(fill)}"${sw ? ` stroke="${ink}" stroke-width="${sw}"` : ''}${cl(cls)}/>`
  }
}

/** Smoke from a chimney or a crater: three puffs that rise in turn. */
const smoke = (p: Pen, x: number, y: number, tint = '#f4f0f8'): string => (p.live
  ? [0, 1, 2].map(k => `<circle class="lm-smoke lm-smoke--${k}" cx="${x}" cy="${y}" r="4.200" fill="${tint}" stroke="${INK}" stroke-width="1.600"/>`).join('')
  : '')

/** A pennant on a pole. `x, y` is the top of the pole. */
const flag = (p: Pen, x: number, y: number, h: number, colour: string, w = 12): string =>
  p.i(`M${x} ${y}V${y + h}`, 2.4) + `<g${p.live ? ' class="lm-flag"' : ''}>${p.s(`M${x} ${y}L${x + w} ${y + 3.5}L${x} ${y + 8}z`, colour, 2)}</g>`

/** A flame: an outer tongue and its hot heart. `x, y` is its foot. */
const flame = (p: Pen, x: number, y: number, k = 1): string => `<g transform="translate(${x} ${y}) scale(${k})"><g${p.live ? ' class="lm-glow lm-glow--fire"' : ''}>` +
  p.s('M0 0c-7-2-7-9-3-14c1 3 3 4 4 6c1-3 1-6 0-9c6 4 9 13-1 17z', '#ff8a2a', 2) + p.f('M0-1c-3-1-3-5-1-7c2 2 4 5 1 7z', '#ffe45e') + '</g></g>'

const DRAW: Record<NodeId, (p: Pen, st: LandmarkState) => string> = {
  // A farming town: three roofs round a little clock tower.
  sunford: p =>
    p.s('M39 62V32h12v30z', '#f1e2c6') + p.s('M35 34L45 17L55 34z', '#ff6a4f') + p.o(45, 42, 3.2, '#fff8e3', '', 1.8) + flag(p, 45, 6, 11, '#ffc526') +
    p.s('M15 82V61h30v21z', '#ffeccb') + p.s('M10 63L30 44L50 63z', '#ff6a4f') + p.f('M30 44L50 63H43L30 51z', '#d8423a') + p.i('M10 63L30 44L50 63z') +
    p.s('M26 82V71h8v11z', '#8f5d36', 2.2) + p.s('M19 66h6v6h-6z', '#8fdcff', 2) +
    p.s('M49 82V56h30v26z', '#fff4dc') + p.s('M44 58L64 38L84 58z', '#3fa4ff') + p.f('M64 38L84 58H77L64 45z', '#2470e8') + p.i('M44 58L64 38L84 58z') +
    p.s('M70 50V40h6v10z', '#c9c4d2', 2) + smoke(p, 73, 36) +
    p.s('M58 82V69h9v13z', '#8f5d36', 2.2) + p.s('M70 63h6v6h-6z', '#ffe45e', 2) + p.s('M53 63h6v6h-6z', '#ffe45e', 2) +
    p.o(90, 72, 8, '#54d862') + p.l('M86 71a5 5 0 0 1 4-4', '#b4ff86', 2.4) + p.s('M88.500 82v-4h3v4z', '#8f5d36', 1.6),

  // The bandits' camp on the open road.
  plains: p =>
    p.i('M14 82V58', 3) + p.s('M5 60h15l4 3.500-4 3.500H5z', '#c98a4c', 2.2) +
    p.s('M24 82L46 44L68 82z', '#ff9838') + p.f('M46 44L53 82H39z', '#ffd08a') + p.f('M46 44L68 82H60z', '#e5621a') + p.i('M24 82L46 44L68 82z') +
    p.s('M41 82L46 66L51 82z', '#5c3317', 2.2) + flag(p, 46, 31, 13, '#ff5a4f') +
    p.l('M72 82l15-5M72 77l15 5', '#8f5d36', 4) + p.i('M72 82l15-5M72 77l15 5', 1.2) + flame(p, 80, 78, 1.05) +
    p.s('M88 82V70h7v12z', '#c98a4c', 2.2) + p.i('M88 74h7M88 78h7', 1.6),

  // A cave mouth in a mossy hill, and something looking out of it.
  hollows: p =>
    p.s('M8 82Q8 46 32 37Q50 25 69 38Q92 47 92 82z', '#a99cb8') + p.f('M14 66Q16 46 34 41Q50 31 64 40Q46 40 34 50Q22 58 20 72z', '#c7bcd6') +
    p.f('M70 44Q88 52 90 80H80Q82 60 70 44z', '#857696') + p.i('M8 82Q8 46 32 37Q50 25 69 38Q92 47 92 82') +
    p.s('M20 40q4-9 13-7q5-8 15-4q3 6-3 9q-13-3-19 6z', '#54d862', 2.2) + p.s('M62 37q8-5 14 2q-7-1-11 3z', '#54d862', 2.2) +
    p.s('M33 82V67Q33 50 50 50Q67 50 67 67V82z', '#241a2e') +
    p.s('M38 55l3.500 9l3.500-9zM55 55l3.500 9l3.500-9z', '#fff8e3', 1.8) +
    p.o(45, 71, 2.6, '#ffe45e', 'lm-glow', 0) + p.o(56, 71, 2.6, '#ffe45e', 'lm-glow', 0) +
    p.i('M74 82V64', 3) + flame(p, 74, 65, 0.7) + flag(p, 28, 18, 16, '#54d862', 11),

  // The colosseum: a ring of arches, pennants on the rim.
  arena: p =>
    flag(p, 24, 28, 18, '#ff5a4f', 11) + flag(p, 50, 21, 18, '#ffc526', 12) + flag(p, 76, 28, 18, '#3fa4ff', 11) +
    p.s('M8 60Q8 40 50 40Q92 40 92 60V72Q92 88 50 88Q8 88 8 72z', '#f6d48a') +
    p.f('M8 66V72Q8 88 50 88Q92 88 92 72V66Q92 82 50 82Q8 82 8 66z', '#d9a04e') +
    p.s('M16 58Q16 46 50 46Q84 46 84 58Q84 69 50 69Q16 69 16 58z', '#c98a4c', 2.4) +
    p.f('M24 60Q24 52 50 52Q76 52 76 60Q76 66 50 66Q24 66 24 60z', '#fbe9a8') +
    [14, 24.5, 35.5, 46.5, 57.5, 68.5, 79].map((x, i) => p.s(`M${x} ${[76, 80, 82.5, 83, 82.5, 80, 76][i]}v-6.500a3.500 3.500 0 0 1 7 0v6.500z`, '#5c3317', 1.8)).join('') +
    p.i('M8 60Q8 40 50 40Q92 40 92 60V72Q92 88 50 88Q8 88 8 72z'),

  // Old trees, and one of them is awake.
  woods: p =>
    p.s('M46 82V58h9v24z', '#8f5d36') + p.o(50, 40, 22, '#27a648', '', 2.8) + p.f('M30 48A22 22 0 0 0 72 44A26 26 0 0 1 30 48z', '#14803a') +
    p.l('M37 36a15 15 0 0 1 12-13', '#8dff8a', 4) + p.i('M28 40A22 22 0 1 1 72 40A22 22 0 1 1 28 40', 2.8) +
    p.o(43, 42, 3.4, '#ffe45e', 'lm-glow', 1.6) + p.o(57, 42, 3.4, '#ffe45e', 'lm-glow', 1.6) + p.i('M44 51q6 4 12 0', 2.2) +
    p.s('M20 82V70h6v12z', '#8f5d36', 2.2) + p.o(23, 62, 13, '#54d862') + p.l('M15 60a9 9 0 0 1 7-8', '#b4ff86', 3) +
    p.s('M74 82V70h6v12z', '#8f5d36', 2.2) + p.o(77, 60, 14, '#3fbf5c') + p.l('M69 58a9 9 0 0 1 7-8', '#b4ff86', 3) +
    p.s('M33 82v-5h4v5z', '#fff8e3', 1.6) + p.s('M28 78q7-10 14 0z', '#ff5a4f', 2) + p.o(33, 75, 1.2, '#ffffff', '', 0) + p.o(37.500, 76, 1, '#ffffff', '', 0) +
    p.s('M60 84a5 5 0 0 1 1-9a6 6 0 0 1 11-1a5 5 0 0 1 3 10z', '#27a648', 2.2),

  // A farm on fire outside the walls.
  outskirts: p =>
    smoke(p, 60, 30, '#b9b3c4') +
    p.s('M22 82V58L44 42L66 58V82z', '#f0604a') + p.f('M56 51L66 58V82H56z', '#c8403a') +
    p.s('M16 61L44 38L72 61L67 66L44 48L21 66z', '#8f5d36') +
    p.s('M35 82V66h18v16z', '#ffeccb', 2.2) + p.i('M35 66L53 82M53 66L35 82', 2) + p.o(44, 55, 3.4, '#5c3317', '', 1.8) +
    flame(p, 58, 47, 1.25) + flame(p, 31, 55, 0.8) +
    p.i('M72 76H96M76 71V82M85 71V82M94 71V82', 2.4) +
    p.l('M8 82V68M13 82V65M18 82V69', '#f2c23c', 2.8) + p.l('M8 68l-2-4M13 65l0-5M18 69l2-4', '#d99a24', 2.6),

  // A walled trade town; after the siege, what is left of one.
  oakhaven: (p, st) =>
    (st.ruined ? '' : flag(p, 50, 14, 22, '#ff5a4f', 14)) +
    p.s('M24 62V48L35 37L46 48V62z', '#ffeccb', 2.2) + p.s('M20 50L35 35L50 50z', '#3fa4ff', 2.2) +
    p.s('M54 62V44L66 32L78 44V62z', '#fff4dc', 2.2) + p.s('M50 46L66 30L82 46z', '#ff9838', 2.2) +
    p.s('M16 82V60h6v-5h6v5h6v-5h6v5h7v-5h6v5h7v-5h6v5h6v-5h6v5h6V82z', '#dcd6e2') +
    p.f('M16 74H84V82H16z', '#aaa2b8') + p.i('M16 82V60h6v-5h6v5h6v-5h6v5h7v-5h6v5h7v-5h6v5h6v-5h6v5h6V82') +
    (st.ruined ? p.s('M40 60l5 9-4 6 6 7H34l3-8-4-7z', '#241a2e', 2) : '') +
    p.s('M42 82V71a8 8 0 0 1 16 0V82z', st.ruined ? '#241a2e' : '#8f5d36', 2.4) + (st.ruined ? '' : p.i('M50 64V82', 1.8)) +
    p.s('M6 82V52h14v30z', '#c9c2d4') + p.s('M3 54L13 37L23 54z', '#2470e8') + p.s('M10 62h6v8h-6z', '#ffe45e', 1.8) +
    p.s('M80 82V52h14v30z', '#c9c2d4') + p.s('M77 54L87 37L97 54z', '#2470e8') + p.s('M84 62h6v8h-6z', '#ffe45e', 1.8) +
    (st.ruined ? flame(p, 66, 34, 1.1) + flame(p, 30, 42, 0.8) + smoke(p, 60, 22, '#8a8296') + flag(p, 50, 26, 16, '#241a2e', 12) : ''),

  // The volcano.
  crags: p =>
    smoke(p, 50, 22, '#cfc6d6') +
    p.s('M6 82L35 37Q39 31 43 35L50 31L57 35Q61 31 65 37L94 82z', '#86606c') +
    p.f('M57 35Q61 31 65 37L94 82H70L62 60L66 50z', '#63424f') + p.f('M22 66L35 44L40 50L30 70z', '#a47e88') +
    p.s('M35 37Q39 31 43 35L50 31L57 35Q61 31 65 37L59 47L54 41L50 51L45 42L40 48z', '#ff7a28', 2.2) +
    p.f('M43 37L50 34L57 37L53 40L50 45L46 40z', '#ffe45e', 'lm-glow') +
    p.l('M51 50Q57 60 51 68Q47 76 55 82', '#241a2e', 8) + p.l('M51 50Q57 60 51 68Q47 76 55 82', '#ff7a28', 4.600) + p.l('M51 52Q56 60 51 67', '#ffe45e', 1.600, 'lm-glow') +
    p.i('M6 82L35 37M65 37L94 82') +
    p.s('M12 84l3-8 8-2 5 6-1 4z', '#55384a', 2.2) + p.s('M76 84l2-7 8-1 5 5-1 3z', '#55384a', 2.2),

  // A timbered mouth in the rock, rails, and a cart heaped with ore.
  mines: p =>
    p.s('M8 82L20 50L40 36L64 39L82 52L92 82z', '#bd8b5a') + p.f('M20 50L40 36L64 39L52 46L34 48L24 62z', '#dcae78') + p.f('M64 39L82 52L92 82H78L72 58z', '#946542') +
    p.i('M8 82L20 50L40 36L64 39L82 52L92 82') +
    p.s('M34 82V58h32v24z', '#241a2e') +
    p.s('M30 82V55h7v27z', '#c98a4c', 2.2) + p.s('M63 82V55h7v27z', '#c98a4c', 2.2) + p.s('M26 50h48v7.500H26z', '#e0a868', 2.2) +
    p.i('M36 50v7.500M64 50v7.500', 1.6) + p.o(50, 62, 3.4, '#ffe45e', 'lm-glow', 1.8) + p.i('M50 57.500V59', 1.8) +
    p.l('M40 90L46 76M60 90L54 76', '#8792b8', 2.4) + p.i('M41 86H59M44 80H56', 1.8) +
    p.o(46, 71, 3.6, '#ffc526', '', 1.8) + p.o(53, 70, 4, '#ffe978', '', 1.8) + p.o(50, 67, 3, '#ffc526', '', 1.8) +
    p.s('M40 82l2.500-10h15L60 82z', '#8792b8', 2.2) + p.f('M51 72h6.500L60 82H52z', '#5d6790') + p.i('M40 82l2.500-10h15L60 82z', 2.2) +
    p.o(44.500, 84, 2.6, '#3a3050', '', 1.6) + p.o(55.500, 84, 2.6, '#3a3050', '', 1.6),

  // The forge-town under the mountain.
  ironhold: p =>
    p.s('M4 82L32 30Q37 22 42 30L52 46L59 36Q63 31 67 37L96 82z', '#bd8b5a') + p.f('M36 26Q40 25 42 30L52 46L47 60L56 82H96L67 37Q63 31 59 36L52 46z', '#946542') +
    p.s('M24 44L32 30Q37 22 42 30L47 38L42 44L37 37L31 46z', '#ffffff', 2) + p.i('M4 82L32 30Q37 22 42 30L52 46L59 36Q63 31 67 37L96 82') +
    p.s('M62 60V40h9v20z', '#6a6480', 2.2) + p.i('M60 40h13', 3) + smoke(p, 66, 34) +
    p.s('M28 82V58h5v-5h6v5h6v-5h6v5h6v-5h6v5h5V82z', '#8a849e') + p.f('M58 53h6v5h5V82H58z', '#6a6480') +
    p.i('M28 82V58h5v-5h6v5h6v-5h6v5h6v-5h6v5h5V82') +
    p.s('M41 82V70a7.500 7.500 0 0 1 15 0V82z', '#ff8a2a', 2.4) + p.f('M44.500 82V72a4 4 0 0 1 8 0V82z', '#ffe45e', 'lm-glow') +
    p.s('M32 64h5v6h-5z', '#ffe45e', 1.8) + p.s('M60 64h5v6h-5z', '#ffe45e', 1.8) +
    flag(p, 34, 38, 15, '#ff5a4f', 11),

  // Spires of ice over the frozen waste.
  tundra: p =>
    p.s('M14 82L25 46L33 55L38 82z', '#bfe6ff') + p.f('M25 46L33 55L38 82H31z', '#7fc0f0') + p.i('M14 82L25 46L33 55L38 82') +
    p.s('M62 82L72 42L81 55L88 82z', '#bfe6ff') + p.f('M72 42L81 55L88 82H78z', '#7fc0f0') + p.i('M62 82L72 42L81 55L88 82') +
    p.s('M34 82L45 30L52 20L61 47L66 82z', '#d6f0ff') + p.f('M45 30L52 20L50 52L44 82H34z', '#f4fbff') + p.f('M52 20L61 47L66 82H55L57 50z', '#8fc8f4') +
    p.i('M34 82L45 30L52 20L61 47L66 82') + p.l('M48 40l-2 14M41 66l-1 8', '#ffffff', 2.4) +
    p.s('M6 84Q18 70 32 80Q46 72 60 80Q76 70 94 84z', '#ffffff') + p.l('M14 80Q20 75 27 79M66 80Q74 75 82 79', '#c6e6f8', 2.4) +
    `<path${p.live ? ' class="lm-glow"' : ''} d="M52 6l1.800 5.200L59 13l-5.200 1.800L52 20l-1.800-5.200L45 13l5.200-1.800z" fill="${p.c('#ffffff')}" stroke="${p.live ? INK : '#6f6678'}" stroke-width="1.400" stroke-linejoin="round"/>`,

  // The drowned temple of the naga.
  temple: p =>
    p.s('M14 52L50 28L86 52z', '#3fdcc4') + p.f('M50 28L86 52H72L50 37z', '#1fa596') + p.i('M14 52L50 28L86 52z') + p.o(50, 43, 4.2, '#ffc526', 'lm-glow', 1.8) +
    p.s('M16 52h68v7H16z', '#f0f4e4') +
    [22, 37, 55, 70].map((x, i) => p.s(`M${x} ${i === 2 ? 68 : 59}h8v${i === 2 ? 20 : 29}h-8z`, '#f0f4e4', 2.2) + p.f(`M${x + 5} ${i === 2 ? 68 : 59}h3v${i === 2 ? 20 : 29}h-3z`, '#c4d4c8')).join('') +
    p.s('M53 68l3-3 4 2 3-3 2 4z', '#f0f4e4', 1.8) +
    p.l('M20 60q3 8-2 14M80 60q-4 10 1 16', '#27a648', 2.6) +
    p.s('M8 80q5.500-5 11 0t11 0t11 0t11 0t11 0t11 0t10 0t10 0V90H8z', '#48c2d0', 2.2) + p.l('M16 86q4-3 8 0M44 86q4-3 8 0M70 86q4-3 8 0', '#c3f3f8', 2),

  // The citadel that was not there last year.
  citadel: p =>
    `<g${p.live ? ' class="lm-bob"' : ''}>${p.s('M50 0l6 7-6 10-6-10z', '#d9b6ff', 2)}${p.f('M50 0l6 7-6 3z', '#f4e6ff')}</g>` +
    p.s('M12 86Q20 74 34 78Q50 70 66 78Q80 74 88 86z', '#4a2a8a') +
    p.s('M18 82V50L27 36L36 50V82z', '#6a40c2') + p.f('M27 36L36 50V82H29V50z', '#472a94') + p.i('M18 82V50L27 36L36 50V82') +
    p.s('M64 82V50L73 36L82 50V82z', '#6a40c2') + p.f('M73 36L82 50V82H75V50z', '#472a94') + p.i('M64 82V50L73 36L82 50V82') +
    p.s('M38 84V40L50 22L62 40V84z', '#7a4ee0') + p.f('M50 22L62 40V84H52V40z', '#5632b0') + p.i('M38 84V40L50 22L62 40V84z') +
    p.s('M45 84V71a5 5 0 0 1 10 0V84z', '#241a2e', 2) +
    p.f('M47 46h6v12h-6zM24 54h5v9h-5zM70 54h5v9h-5z', '#ff7ae6', 'lm-glow') + p.i('M47 46h6v12h-6zM24 54h5v9h-5zM70 54h5v9h-5z', 1.6) +
    p.l('M34 30q-8-8-2-18M66 30q8-8 2-18', '#d9b6ff', 2.2, 'lm-glow'),

  // The dragon's mountain.
  peak: p =>
    p.s('M50 26Q34 4 12 14Q26 16 27 27Q38 22 48 34z', '#8a5ee0', 2.2) + p.f('M27 27Q38 22 48 34L50 26Q40 14 27 27z', '#6a40c2') +
    p.s('M56 26Q72 4 94 14Q80 16 79 27Q68 22 58 34z', '#8a5ee0', 2.2) + p.f('M79 27Q68 22 58 34L56 26Q66 14 79 27z', '#6a40c2') +
    p.s('M6 82L42 30Q48 20 54 28L64 44L70 37Q74 32 78 38L96 82z', '#93a8dc') + p.f('M48 24Q52 23 54 28L64 44L58 58L66 82H96L78 38Q74 32 70 37L64 44z', '#6c82c0') +
    p.s('M30 47L42 30Q48 20 54 28L62 41L56 49L49 40L42 51L36 44z', '#ffffff', 2.2) + p.i('M6 82L42 30Q48 20 54 28L64 44L70 37Q74 32 78 38L96 82') +
    p.s('M41 26Q41 12 53 12Q64 12 62 22Q61 27 54 28Q50 34 44 31z', '#a882f2', 2.2) + p.s('M44 14L41 5L49 12zM58 13L62 4L62 14z', '#fff8e3', 1.8) +
    p.o(54, 19, 2.4, '#ffe45e', 'lm-glow', 1.4) + p.i('M47 26q3 2 6 0', 1.6) +
    p.s('M44 82V74a6 6 0 0 1 12 0V82z', '#241a2e', 2) + p.l('M12 80Q18 75 24 79M74 80Q80 75 86 79', '#ffffff', 2.6),

  // The Arch-Demon's seat.
  fortress: p =>
    p.s('M28 82V44h44v38z', '#5a2a48') + p.f('M60 44h12v38H60z', '#3e1a34') +
    p.s('M28 44v-6h7v6h6v-6h7v6h4v-6h7v6h6v-6h7v6', '#5a2a48') +
    p.s('M42 44L50 10L58 44z', '#d62c38') + p.f('M50 10L58 44H52z', '#84142a') + p.i('M42 44L50 10L58 44z') +
    p.s('M12 82V36h16v46z', '#6b3454') + p.f('M22 36h6v46h-6z', '#4a2038') + p.i('M12 82V36h16v46') + p.s('M9 38L20 12L31 38z', '#d62c38') + p.f('M20 12L31 38H24z', '#84142a') + p.i('M9 38L20 12L31 38z') +
    p.s('M72 82V36h16v46z', '#6b3454') + p.f('M82 36h6v46h-6z', '#4a2038') + p.i('M72 82V36h16v46') + p.s('M69 38L80 12L91 38z', '#d62c38') + p.f('M80 12L91 38H84z', '#84142a') + p.i('M69 38L80 12L91 38z') +
    p.s('M41 82V69a9 9 0 0 1 18 0V82z', '#ff7a28', 2.4) + p.f('M45 82V71a5 5 0 0 1 10 0V82z', '#ffe45e', 'lm-glow') +
    p.f('M36 54l9 4-9 3zM64 54l-9 4 9 3z', '#ffe45e', 'lm-glow') + p.i('M36 54l9 4-9 3zM64 54l-9 4 9 3z', 1.6) +
    p.s('M17 48h6v9h-6zM77 48h6v9h-6z', '#ff7a28', 1.8) +
    flag(p, 20, 2, 11, '#ff5a4f', 10) + flag(p, 80, 2, 11, '#ff5a4f', 10),

  // The wound in the world.
  rift: p =>
    `<g${p.live ? ' class="lm-bob"' : ''}>${p.s('M12 40l7-5 5 6-4 7-7-1z', '#4a2a8a', 2)}${p.s('M82 30l8-2 3 7-6 5-6-3z', '#4a2a8a', 2)}${p.s('M84 72l6-3 4 5-4 6-6-2z', '#4a2a8a', 2)}</g>` +
    p.s('M50 14L58 36L80 28L67 48L88 58L65 62L70 86L50 70L30 86L35 62L12 58L33 48L20 28L42 36z', '#2c1244') +
    p.s('M50 28L55 43L68 40L60 51L72 58L58 60L60 74L50 65L40 74L42 60L28 58L40 51L32 40L45 43z', '#8a3ee0', 2.2) +
    `<g${p.live ? ' class="lm-glow lm-glow--fire"' : ''}>${p.s('M50 38Q62 44 59 56Q57 68 50 70Q41 66 41 55Q41 44 50 38z', '#ff5ad8', 2.2)}${p.f('M50 45Q56 49 54 56Q53 62 50 63Q46 60 46 55Q46 49 50 45z', '#ffe6ff')}</g>` +
    p.l('M50 14L50 4M88 58L96 60M12 58L4 60', '#ff5ad8', 2.4, 'lm-glow')
}

/** The inner markup of a landmark: goes in an `<svg viewBox="0 0 100 100">`. */
export const landmarkSvg = (id: NodeId, st: LandmarkState = {}): string => DRAW[id](pen(st), st)

// ── Cloud cover ──────────────────────────────────────────────────────────────
const CLOUD = 'M-27 0a11 11 0 0 1 2-21.500a15.500 15.500 0 0 1 29-5.500a12.500 12.500 0 0 1 22 9a9.500 9.500 0 0 1-1 18z'
const CLOUD_LIP = 'M-27 0a11 11 0 0 1-7.500-8q18 6 36 3t30-4a9.500 9.500 0 0 1-6.500 9z'
/** One cloud, about 60 wide, standing on its origin. */
export const cloudShape = (): string =>
  `<path d="${CLOUD}" fill="#ffffff"/><path d="${CLOUD_LIP}" fill="#cfe2f8"/>` +
  `<path d="M-14-16a9 9 0 0 1 9-6" fill="none" stroke="#eaf4ff" stroke-width="3" stroke-linecap="round"/><path d="${CLOUD}" fill="none" stroke="#5a6a9a" stroke-width="2.400" stroke-linejoin="round"/>`
const cloud = (cls: string, x: number, y: number, k: number, flip = false): string =>
  `<g class="cl ${cls}"><g transform="translate(${x} ${y}) scale(${flip ? -k : k} ${k})">${cloudShape()}</g></g>`

/**
 * The cloud that lies over a place not reached yet: goes in the same
 * 100 × 100 box, over the landmark. `far` is a place with no open road to it:
 * the cloud lies thicker. Each puff carries a class (`cl--a` … `cl--d`) so
 * the map can drift it, and part them when the place opens.
 */
export const cloudCover = (far: boolean): string =>
  (far ? cloud('cl--d', 66, 56, 0.72, true) + cloud('cl--c', 48, 96, 1.05) : '') + cloud('cl--a', 20, 86, 0.86) + cloud('cl--b', 82, 90, 0.8, true)
