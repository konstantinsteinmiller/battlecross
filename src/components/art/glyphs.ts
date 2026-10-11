/**
 * ─── Placeholder art: the vector glyphs ──────────────────────────────────────
 *
 * Every item, skill and status has a drawing here until a painted one is
 * dropped into `public/images/` (see `game/assets/overrides.ts`). One style
 * for all of them: chunky rounded shapes in a 48 × 48 box, a dark outline,
 * the owner's tint (`a`), a lighter second tone (`b`), plus white, gold,
 * metal and wood; `n` is a white line, `i` an ink line (on a light shape). `ArtIcon.vue` supplies the frame and the colours.
 *
 * Shapes are composed from a small kit of parts, so a new icon is a line.
 */

type Cls = 'a' | 'b' | 'w' | 'd' | 'm' | 'g' | 'k' | 'n' | 'i' | 'r' | 'u' | 'e'

const P = (d: string, c: Cls = 'a'): string => `<path class="${c}" d="${d}"/>`
const C = (x: number, y: number, r: number, c: Cls = 'a'): string => `<circle class="${c}" cx="${x}" cy="${y}" r="${r}"/>`
const R = (x: number, y: number, w: number, h: number, rx: number, c: Cls = 'a'): string =>
  `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`
const G = (tf: string, inner: string): string => `<g transform="${tf}">${inner}</g>`
const n2 = (v: number): number => Math.round(v * 100) / 100

/** A star / burst: `n` points, outer and inner radius. */
const star = (cx: number, cy: number, ro: number, ri: number, n: number, c: Cls = 'g', rot = -90): string => {
  let d = ''
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180
    const r = i % 2 === 0 ? ro : ri
    d += `${i ? 'L' : 'M'}${n2(cx + Math.cos(a) * r)} ${n2(cy + Math.sin(a) * r)}`
  }
  return P(d + 'Z', c)
}

// ── Parts ────────────────────────────────────────────────────────────────────
const FLAME = (c: Cls = 'a'): string =>
  P('M25 4c1 8 12 12 12 24a13 13 0 0 1-26 0c0-6 3-9 5-13 1 4 3 6 4 6 0-7 2-12 5-17z', c) +
  P('M24 25c3 4 6 6 6 10a6 6 0 0 1-12 0c0-4 3-6 6-10z', 'g')
const DROP = (c: Cls = 'a'): string => P('M24 5c6 9 13 15 13 24a13 13 0 0 1-26 0c0-9 7-15 13-24z', c) + P('M17 29a7 7 0 0 0 5 7', 'n')
const SHIELD = (c: Cls = 'a'): string => P('M24 5l15 5v12c0 10-6 17-15 21C15 39 9 32 9 22V10z', c)
const BOLT = (c: Cls = 'g'): string => P('M28 4L11 27h10l-3 17 19-25H26z', c)
const HEART = (c: Cls = 'r'): string => P('M24 41C10 31 6 24 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 7-4 14-18 24z', c)
const SKULL = (c: Cls = 'w'): string =>
  P('M24 6c9 0 15 6 15 14 0 5-2 8-5 10v7H14v-7c-3-2-5-5-5-10 0-8 6-14 15-14z', c) + C(18, 21, 3.6, 'd') + C(30, 21, 3.6, 'd') + P('M24 26l-2 4h4z', 'd')
const CLOCK = (c: Cls = 'w'): string => C(24, 24, 17, c) + P('M24 13v11l7 5', 'i')
const CROWN = (c: Cls = 'g'): string => P('M8 37L6 15l10 9 8-14 8 14 10-9-2 22z', c) + C(24, 30, 2.6, 'r')
const HOURGLASS = (c: Cls = 'a'): string =>
  R(11, 5, 26, 5, 2, 'g') + R(11, 38, 26, 5, 2, 'g') + P('M14 10h20c0 8-6 10-6 14s6 6 6 14H14c0-8 6-10 6-14s-6-6-6-14z', 'w') + P('M18 14h12c-1 4-6 6-6 8-0-2-5-4-6-8zM24 30c2 2 6 4 7 8H17c1-4 5-6 7-8z', c)
const BLADE = (c: Cls = 'm'): string => P('M24 3l5 7v20H19V10z', c)
const SWORD = (c: Cls = 'm'): string => BLADE(c) + R(13, 29, 22, 5, 2.5, 'g') + R(21, 34, 6, 8, 2, 'k') + C(24, 44, 2.8, 'g')
const DAGGER = (c: Cls = 'm'): string => P('M24 10l4 6v14h-8V16z', c) + R(15, 29, 18, 4.5, 2, 'g') + R(21.5, 33.5, 5, 7, 2, 'k')
const ROCK = (c: Cls = 'a'): string => P('M10 38l5-16 8-8 9 4 7 14-3 8H14z', c) + P('M23 14l-2 12 8 6', 'n')
const HELM = (c: Cls = 'm'): string => P('M10 28C10 15 16 7 24 7s14 8 14 21v10H27V27h-6v11H10z', c) + P('M24 7v9', 'n')
const GUN = (c: Cls = 'm'): string => P('M5 16h34a3 3 0 0 1 3 3v5H27l-2 5h-6l-3 13H8l3-15H5z', c) + R(30, 12, 6, 4, 1.5, 'a')
const BOMB = (c: Cls = 'd'): string => C(22, 29, 14, c) + P('M30 17l5-6', 'n') + star(38, 8, 6, 2.6, 5, 'g')
const FLASK = (c: Cls = 'a'): string =>
  P('M19 5h10v11l9 17a6 6 0 0 1-5 9H15a6 6 0 0 1-5-9l9-17z', 'w') + P('M14 30h20l3 5a4 4 0 0 1-4 5H15a4 4 0 0 1-4-5z', c) + R(17, 3, 14, 4, 2, 'k')
/** What each elixir does, drawn as one bold sign (the flask's glass). */
const ELIXIR_MARK = {
  might: P('M24 3l4 5v22h-8V8z', 'w') + R(13, 29, 22, 5, 2.5, 'g') + R(21, 34, 6, 10, 2, 'k'),
  iron: P('M24 5l15 5v12c0 10-6 17-15 21C15 39 9 32 9 22V10z', 'w'),
  swift: P('M4 14l16 10L4 34zM22 14l22 10-22 10z', 'w'),
  mind: C(24, 24, 17, 'w') + P('M24 13v11l7 5', 'i'),
  vigor: P('M24 41C10 31 6 24 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 7-4 14-18 24z', 'w'),
  shadow: P('M24 5c6 9 13 15 13 24a13 13 0 0 1-26 0c0-9 7-15 13-24z', 'w')
} as const
const RING = (c: Cls = 'g'): string => `<circle class="n" style="stroke:var(--ol);stroke-width:11" cx="24" cy="28" r="11"/><circle class="n" style="stroke:var(--${c === 'g' ? 'gold' : 'a'});stroke-width:6" cx="24" cy="28" r="11"/>`
const GEM = (c: Cls = 'a', y = 11): string => P(`M24 ${y - 7}l7 6-7 8-7-8z`, c)
const ARROW_R = (c: Cls = 'w'): string => P('M6 20h22v-8l14 12-14 12v-8H6z', c)
const RAYS = (c: Cls = 'g'): string =>
  [0, 45, 90, 135, 180, 225, 270, 315].map(a => G(`rotate(${a} 24 24)`, R(22, 1, 4, 9, 2, c))).join('')
const WAVE = (r: number): string => `<path class="n" d="M${24 - r} 36a${r} ${r * 0.5} 0 0 1 ${r * 2} 0"/>`
const TOWER = (c: Cls = 'm'): string => P('M12 44V16H9V6h7v5h5V6h6v5h5V6h7v10h-3v28z', c) + P('M20 44V33a4 4 0 0 1 8 0v11z', 'd')
const CLOUD = (c: Cls = 'w'): string => P('M12 34a8 8 0 0 1 2-16 10 10 0 0 1 19-2 9 9 0 0 1 3 18z', c)
const BANNER = (c: Cls = 'a'): string => R(10, 3, 4, 42, 2, 'k') + P('M14 7h26l-6 9 6 9H14z', c)
const TARGET = (): string => C(24, 24, 18, 'w') + C(24, 24, 11.5, 'a') + C(24, 24, 5, 'w')
const WALL = (c: Cls = 'a'): string => R(5, 12, 17, 11, 2, c) + R(26, 12, 17, 11, 2, c) + R(5, 26, 11, 11, 2, c) + R(19, 26, 17, 11, 2, c) + R(39, 26, 4, 11, 2, c)
const SPIRAL = (): string => `<path class="n" style="stroke-width:5" d="M24 24a3 3 0 1 1 6 0 9 9 0 1 1-18 0 15 15 0 1 1 30 0"/>`

// ── The glyphs ───────────────────────────────────────────────────────────────
export const GLYPHS: Readonly<Record<string, string>> = {
  // Items, by kind
  sword: G('rotate(40 24 24)', SWORD('m')),
  dagger: G('rotate(40 24 24)', DAGGER('a')),
  greatsword: G('rotate(40 24 24)', P('M24 1l7 8v21H17V9z', 'm') + P('M24 9v18', 'n') + R(11, 29, 26, 5.5, 2.5, 'a') + R(21, 34.5, 6, 8, 2, 'k') + C(24, 44.5, 2.8, 'a')),
  axe: G('rotate(25 24 24)', R(21.5, 6, 5, 39, 2.5, 'k') + P('M24 9c8-4 15 0 17 8-4 5-10 7-17 5zM24 9c-6-2-10 0-12 4 3 4 7 6 12 6z', 'm')),
  hammer: G('rotate(25 24 24)', R(21.5, 14, 5, 31, 2.5, 'k') + R(8, 5, 32, 15, 4, 'm') + R(8, 9, 6, 7, 1, 'a') + R(34, 9, 6, 7, 1, 'a')),
  staff: G('rotate(25 24 24)', R(22, 14, 4.5, 31, 2.2, 'k') + P('M14 14a10 10 0 0 1 20 0', 'n') + C(24, 11, 7, 'a') + C(21.5, 8.5, 2, 'w')),
  wand: G('rotate(35 24 24)', R(22, 16, 4.5, 28, 2.2, 'k') + R(21, 36, 6.5, 8, 2, 'g')) + star(33, 11, 10, 4.2, 4, 'a', 0),
  gun: GUN('m'),
  cannon: G('rotate(-18 24 24)', R(4, 14, 34, 16, 6, 'm') + R(34, 11, 9, 22, 4, 'a') + R(10, 28, 9, 12, 3, 'k') + C(16, 22, 3, 'a')),
  shield: SHIELD('a') + P('M24 11v26M13 20h22', 'n'),
  tome: R(8, 7, 32, 35, 4, 'a') + R(12, 7, 5, 35, 0, 'k') + star(28, 23, 8, 3.4, 4, 'g', 0),
  orb: C(24, 26, 16, 'a') + C(18, 20, 4.5, 'w') + P('M14 43h20', 'n'),
  syringe: G('rotate(45 24 24)', R(19, 12, 10, 22, 3, 'w') + R(19, 22, 10, 12, 3, 'r') + R(16, 8, 16, 5, 2, 'm') + R(22.5, 1, 3, 8, 1.5, 'm') + R(23, 34, 2.2, 12, 1, 'm')),
  battery: R(9, 12, 30, 30, 6, 'm') + R(18, 6, 12, 7, 2, 'm') + G('translate(4 7) scale(0.82)', BOLT('a')),
  robe: P('M17 5h14l11 9-5 8-4-2v24H15V20l-4 2-5-8z', 'a') + P('M24 6v38', 'n') + P('M17 5l7 8 7-8', 'n'),
  leather: P('M16 6l8 5 8-5 10 8-5 8-4-3v25H15V19l-4 3-5-8z', 'k') + R(15, 30, 18, 4.5, 1, 'a'),
  plate: P('M15 6h18l9 7-4 9-4-2v24H14V20l-4 2-4-9z', 'm') + P('M14 26h20M24 12v32', 'n') + C(24, 19, 3.2, 'a'),
  // Head, hands and feet. Leather is `k`, plate is `m`, cloth is the tint.
  hood: P('M24 3C12 8 7 21 9 34l-4 10h38l-4-10C41 21 36 8 24 3z', 'a') + P('M24 15c-6 0-10 5-10 13 0 6 4 11 10 11s10-5 10-11c0-8-4-13-10-13z', 'd') + P('M19 40l5 4 5-4', 'n'),
  cap: P('M8 31C8 17 15 9 24 9s16 8 16 22z', 'k') + P('M24 11v18M15 15l4 14M33 15l-4 14', 'n') + R(5, 29, 38, 8, 4, 'a') + C(24, 8, 3, 'a'),
  helm: HELM('m') + P('M10 24h28', 'n') + R(21.5, 2, 5, 10, 2.5, 'a'),
  greathelm: P('M10 13c0-5 6-8 14-8s14 3 14 8v26c0 3-6 5-14 5s-14-2-14-5z', 'm') + P('M14 20h20v4.5h-7.5V38h-5V24.5H14z', 'd') + P('M24 5v10', 'n') + C(15, 33, 1.6, 'a') + C(33, 33, 1.6, 'a'),
  circlet: P('M4 22c7 6 13 8 20 8s13-2 20-8v9c-7 6-13 8-20 8S11 37 4 31z', 'g') + P('M24 8l8 13-8 10-8-10z', 'a') + P('M24 13l3.5 8-3.5 4.5-3.5-4.5z', 'w') + C(9, 30, 1.8, 'a') + C(39, 30, 1.8, 'a'),
  hat: P('M3 35c0-4 9-7 21-7s21 3 21 7-9 8-21 8S3 39 3 35z', 'a') + P('M28 2c1 10 5 20 10 29-9 3-19 3-28 0C15 24 21 13 28 2z', 'a') + P('M11 27c9 3 17 3 26 0l1.5 4c-10 3-19 3-29 0z', 'k') + star(25, 18, 6.6, 2.7, 4, 'w', 0),
  gloves: G('rotate(-12 24 24)', R(31, 15, 9, 16, 4.5, 'k') + R(12, 5, 21, 28, 9, 'k') + P('M19 8v11M26 8v11', 'n') + R(10, 30, 25, 13, 3.5, 'a') + P('M12 36h21', 'n')),
  gauntlets: G('rotate(-12 24 24)', R(31, 14, 9, 15, 3, 'm') + R(12, 4, 21, 26, 6, 'm') + P('M19 6v9M26 6v9', 'n') + R(12, 16, 21, 5, 1.5, 'a') + P('M13 27h19l6 17H7z', 'm') + P('M10 36h25', 'n')),
  boots: P('M14 4h15v22l12 6c3 2 4 6 3 9H14z', 'k') + R(12, 39, 33, 6, 2.5, 'd') + R(12, 4, 19, 8, 2.5, 'a') + P('M29 26l-7 5', 'n'),
  greaves: P('M14 9h15v18l12 6c3 2 4 5 3 8H14z', 'm') + R(12, 39, 33, 6, 2.5, 'd') + P('M11 3h21l-2 12H13z', 'a') + P('M14 21h15M14 27h15', 'n') + P('M34 30l-3 9', 'n'),
  ring: RING('g') + GEM('a', 12),
  charm: P('M14 4l10 16L34 4', 'n') + P('M24 17l11 9-11 17-11-17z', 'a') + P('M24 23l4 4-4 7-4-7z', 'w'),
  hourglass: HOURGLASS('a'),
  heart: P('M24 43C9 32 5 24 5 17a10 10 0 0 1 19-4 10 10 0 0 1 19 4c0 7-4 15-19 26z', 'a') + P('M24 13l-5 9 7 5-4 9', 'n'),

  // ── Aegis Knight ──
  'skill.shieldThrow': G('translate(4 4) scale(0.8)', SHIELD('a')) + P('M2 40q6-8 12 0M10 46q6-8 12 0', 'n') + P('M36 6q6 6 0 12', 'n'),
  'skill.shieldShove': G('translate(-6 0)', SHIELD('a')) + P('M32 12q8 12 0 24M38 8q10 16 0 32M44 4q12 20 0 40', 'n'),
  'skill.holyChains': P('M6 8q10 4 12 14M42 8q-10 4-12 14M24 46v-12', 'n') + C(8, 8, 4, 'g') + C(40, 8, 4, 'g') + C(24, 44, 4, 'g') + G('translate(14 14) scale(0.42)', SHIELD('a')),
  'skill.bulwark': SHIELD('a') + P('M40 30L28 22M28 22v8M28 22h8', 'n'),
  'skill.retribution': SHIELD('a') + P('M2 10l10 6M2 20l10 4', 'n') + RAYS('g') + ARROW_R('g'),
  'skill.unbreakable': SHIELD('m') + P('M24 5l-4 12 6 6-4 10', 'n') + G('translate(16 18) scale(0.33)', HEART('r')),
  'skill.shieldSlam': G('translate(-4 2) scale(0.9)', SHIELD('a')) + star(36, 14, 11, 4.6, 6, 'g'),
  'skill.aegisAura': C(24, 24, 20, 'b') + G('translate(6 6) scale(0.75)', SHIELD('a') + P('M24 13v22M15 21h18', 'n')),
  'skill.radiantStrike': RAYS('g') + G('translate(7.2 7.2) scale(0.7)', G('rotate(40 24 24)', SWORD('w'))),
  'skill.fortitude': SHIELD('a') + G('translate(9.6 8) scale(0.6)', HEART('r')),
  'skill.tauntingCry': P('M6 19h9l14-10v30L15 29H6z', 'a') + P('M35 15a12 12 0 0 1 0 18M40 9a20 20 0 0 1 0 30', 'n'),
  'skill.holyBastion': P('M4 42a20 22 0 0 1 40 0z', 'b') + G('translate(9.6 12) scale(0.6)', TOWER('w')) + star(24, 9, 7, 3, 4, 'g', 0),

  // ── Shadowblade ──
  'skill.starFan': star(12, 30, 9, 3.5, 4, 'm', 0) + star(24, 16, 9, 3.5, 4, 'm', 45) + star(36, 30, 9, 3.5, 4, 'm', 0),
  'skill.grapplingHook': P('M24 4v22', 'n') + P('M24 26c-10 0-14-6-14-12M24 26c10 0 14-6 14-12M24 26v12', 'n') + P('M24 38c0 6 6 8 10 4', 'n') + C(24, 4, 3, 'a'),
  'skill.silentStrike': G('translate(-4 0)', G('rotate(40 24 24)', DAGGER('m'))) + P('M32 32c4 2 8 2 12 0', 'n') + R(37, 24, 3, 12, 1.5, 'd'),
  'skill.shadowMark': C(24, 24, 20, 'b') + C(24, 24, 12, 'n') + P('M24 2v8M24 38v8M2 24h8M38 24h8', 'n') + P('M28 16a8 8 0 1 0 0 16a10 10 0 0 1 0-16z', 'a'),
  'skill.bladeRhythm': P('M24 5a19 19 0 1 1-17 11', 'n') + P('M1 12l6 10 9-6z', 'a') + G('rotate(40 24 24)', DAGGER('m')),
  'skill.nightshadeMist': P('M8 36c-6 0-6-10 1-10 0-8 10-12 15-6 4-6 16-4 15 4 8 0 8 12 0 12z', 'b') + C(16, 14, 3, 'e') + C(28, 8, 2.5, 'e') + C(36, 16, 2, 'e') + P('M22 46l2-8 2 8z', 'a'),
  'skill.shadowstep': P('M4 14h14M2 24h14M4 34h14', 'n') + P('M20 6c12 0 22 8 24 18-2 10-12 18-24 18 8-4 12-10 12-18S28 10 20 6z', 'a'),
  'skill.lethality': G('translate(-5 5) scale(0.95)', G('rotate(40 24 24)', DAGGER('m'))) + star(35, 13, 11, 4.4, 4, 'r', 0),
  'skill.venomousBlade': G('translate(-6 -2)', G('rotate(40 24 24)', DAGGER('m'))) + G('translate(22 20) scale(0.5)', DROP('e')),
  'skill.evasion': P('M10 40V20a14 14 0 0 1 28 0v20l-5-4-4.5 4-4.5-4-4.5 4-4.5-4z', 'b') + C(19, 21, 3, 'd') + C(29, 21, 3, 'd') + P('M2 12h9M1 20h6', 'n'),
  'skill.smokeBomb': G('translate(0 12) scale(0.75)', BOMB('d')) + G('translate(8 -6) scale(0.8)', CLOUD('b')),
  'skill.danceOfBlades': [0, 120, 240].map(a => G(`rotate(${a} 24 24)`, P('M24 3l5 7v10H19V10z', 'm'))).join('') + C(24, 24, 6.5, 'a'),

  // ── Arch-Pyromancer ──
  'skill.firecracker': G('rotate(30 24 24)', R(18, 10, 12, 28, 4, 'r') + R(18, 18, 12, 4, 0, 'w')) + P('M34 8l4-4M36 12l6-2M30 6l0-5', 'n') + star(36, 7, 5, 2, 4, 'g', 0),
  'skill.fanTheFlames': P('M24 44L6 22a24 24 0 0 1 36 0z', 'm') + P('M24 44L14 18M24 44V14M24 44l10-26', 'n') + G('translate(12 -6) scale(0.5)', FLAME('a')),
  'skill.ringOfFire': C(24, 26, 16, 'n') + [0, 1, 2, 3, 4].map(k => G(`translate(${24 + Math.cos(k * 1.2566 - 1.5708) * 15 - 6} ${26 + Math.sin(k * 1.2566 - 1.5708) * 15 - 8}) scale(0.28)`, FLAME('a'))).join(''),
  'skill.everflame': P('M24 24c-6-10-20-10-20 0s14 10 20 0 20-10 20 0-14 10-20 0', 'n') + G('translate(14 6) scale(0.42)', FLAME('a')),
  'skill.wildfire': G('translate(10 12) scale(0.6)', FLAME('a')) + G('translate(2 2) scale(0.32)', FLAME('a')) + G('translate(30 4) scale(0.32)', FLAME('a')) + P('M18 18q-6-8-10-6M30 18q6-8 10-6', 'n'),
  'skill.phoenixFlight': P('M24 30C14 14 4 14 2 18c8 2 14 8 22 12zM24 30c10-16 20-16 22-12-8 2-14 8-22 12z', 'a') + C(24, 24, 6, 'g') + G('translate(17 26) scale(0.35)', FLAME('r')),
  'skill.fireball': P('M3 40l13-9M6 30l8-4M14 44l7-9', 'n') + G('translate(10 -2) scale(0.78)', FLAME('a')),
  'skill.cauterize': FLAME('a') + R(21, 26, 6, 14, 1.5, 'w') + R(17, 30, 14, 6, 1.5, 'w'),
  'skill.flamePillar': P('M6 43h36', 'n') + P('M15 43c-3-8 2-12 2-18 0-5-2-8 0-13 3 3 4 5 5 9 1-6 1-12 3-18 4 6 8 11 8 19 0 4-2 6-1 10 2 4 2 8-1 11z', 'a') + P('M21 43c-1-5 3-8 3-13 3 4 5 8 3 13z', 'g'),
  'skill.pyromaniac': G('translate(-4 0)', FLAME('a')) + star(37, 12, 9, 3.6, 4, 'w', 0) + star(40, 32, 5.5, 2.2, 4, 'w', 0),
  'skill.combustion': star(24, 24, 22, 11, 9, 'a') + star(24, 24, 12, 6, 9, 'g'),
  'skill.cataclysm': P('M44 3L27 12M46 15L33 21M34 2L23 9', 'n') + C(19, 29, 14, 'a') + C(14, 27, 3.4, 'd') + C(23, 35, 2.6, 'd') + C(24, 24, 2, 'd') + P('M6 44h30', 'n'),

  // ── Royal Sovereign ──
  'skill.callArchers': P('M10 4c18 6 18 34 0 40', 'n') + P('M10 4v40', 'i') + ARROW_R('w') + G('translate(4 18) scale(0.3)', CROWN('g')),
  'skill.royalRally': P('M6 18h10l20-12v36L16 30H6z', 'g') + C(40, 10, 3, 'a') + C(44, 24, 3, 'a') + C(40, 38, 3, 'a'),
  'skill.warMarshal': G('rotate(40 24 24)', SWORD('m')) + G('rotate(-40 24 24)', R(22, 6, 4, 34, 2, 'a')) + G('translate(12 0) scale(0.5)', CROWN('g')),
  'skill.royalDecree': R(8, 6, 32, 36, 4, 'w') + P('M14 14h20M14 20h20M14 26h14', 'n') + C(32, 36, 7, 'r'),
  'skill.loyalHearts': HEART('r') + G('translate(12 -2) scale(0.5)', CROWN('g')),
  'skill.summonChampion': HELM('g') + P('M10 12h28', 'n') + G('translate(12 -6) scale(0.5)', CROWN('g')),
  'skill.royalGuard': HELM('m') + P('M24 2c5 0 7 4 4 8h-8c-3-4-1-8 4-8z', 'a'),
  'skill.inspiringPresence': G('translate(0 6) scale(0.86)', CROWN('g')) + star(9, 9, 7, 2.8, 4, 'w', 0) + star(40, 8, 5.5, 2.2, 4, 'w', 0),
  'skill.commandFocus': TARGET() + P('M24 1v9M24 38v9M1 24h9M38 24h9', 'n'),
  'skill.sovereignsTribute': G('translate(0 6) scale(0.9)', SHIELD('a')) + G('translate(9.6 12) scale(0.6)', CROWN('g')),
  'skill.bannerOfVictory': BANNER('a') + star(25, 16, 6.5, 2.7, 5, 'g'),
  'skill.armyOfTheRealm': G('translate(-3 14) scale(0.55)', HELM('m')) + G('translate(24.6 14) scale(0.55)', HELM('m')) + G('translate(8.4 2) scale(0.65)', HELM('a')),

  // ── Chrono-Weaver ──
  'skill.temporalStasis': C(24, 24, 21, 'b') + G('translate(8.4 8.4) scale(0.65)', HOURGLASS('a')),
  'skill.hasteField': CLOCK('w') + P('M30 38l8 6-8 4zM38 38l8 6-8 4z', 'a'),
  'skill.timeDistort': P('M7 24c0-12 10-18 18-17 9 1 16 8 16 17s-6 18-17 17C13 40 7 34 7 24z', 'w') + P('M24 13c-2 4 2 7 0 11l8 4', 'i') + P('M3 10c4-3 6 1 10-2M36 44c4-3 6 1 10-2', 'n'),
  'skill.paradoxShift': P('M5 16h26v-8l12 11-12 11v-8H5z', 'a') + G('rotate(180 24 30)', P('M5 22h26v-8l12 11-12 11v-8H5z', 'w')),
  'skill.entropy': C(24, 24, 21, 'a') + SPIRAL(),
  'skill.echoBolt': G('translate(-9 5)', BOLT('b')) + G('translate(-4.5 2.5)', BOLT('b')) + BOLT('a'),
  'skill.foresight': P('M3 24c6-9 13-13 21-13s15 4 21 13c-6 9-13 13-21 13S9 33 3 24z', 'w') + C(24, 24, 9, 'a') + P('M24 18v6l4 3', 'n'),
  'skill.timeBubble': C(24, 24, 20, 'b') + P('M14 14a14 14 0 0 1 10-4', 'n') + G('translate(12 12) scale(0.5)', CLOCK('w')),
  'skill.timeLoop': P('M24 5a19 19 0 1 1-17 11', 'n') + P('M1 12l6 10 9-6z', 'a') + C(24, 24, 6, 'a'),
  'skill.frozenMoment': CLOCK('w') + star(37, 11, 10, 4, 6, 'u', 0),
  'skill.timeStop': CLOCK('w') + R(15, 15, 6, 18, 2, 'a') + R(27, 15, 6, 18, 2, 'a'),
  'skill.chronoRewind': CLOCK('w') + P('M4 6v13h13', 'n') + P('M5 18A21 21 0 0 1 24 3', 'n'),

  // ── Blood Alchemist ──
  'skill.essenceWard': FLASK('r') + G('translate(15 21) scale(0.38)', SHIELD('w')),
  'skill.vitalReserve': HEART('r') + R(21, 14, 6, 16, 1.5, 'w') + R(16, 19, 16, 6, 1.5, 'w') + P('M38 2l7 8h-4v7h-6v-7h-4z', 'g'),
  'skill.enfeeblingTonic': G('rotate(-18 24 28)', FLASK('e')) + P('M8 8c10-6 24-6 32 6', 'n') + P('M36 8l6 7 2-9z', 'a'),
  'skill.homunculus': C(24, 28, 16, 'r') + C(18, 25, 4, 'w') + C(30, 25, 4, 'w') + C(18, 25, 1.8, 'd') + C(30, 25, 1.8, 'd') + P('M19 34q5 4 10 0', 'n') + R(19, 6, 10, 8, 2, 'b'),
  'skill.adrenalCatalyst': HEART('r') + P('M6 22h36v-2H6z', 'n') + G('translate(14 12) scale(0.45)', BOLT('g')),
  'skill.grandTransmutation': C(24, 24, 21, 'b') + P('M24 6l17 30H7z', 'n') + C(24, 24, 21, 'n') + DROP('w'),
  'skill.sanguineFlask': FLASK('r') + C(20, 34, 2, 'w') + C(27, 37, 1.5, 'w'),
  'skill.bloodTransmutation': G('translate(-8 0) scale(0.7)', DROP('r')) + G('translate(22 14) scale(0.7)', DROP('u')) + P('M19 12l8 4-8 4', 'n'),
  'skill.essenceHarvest': G('translate(7.2 8) scale(0.7)', DROP('r')) + P('M6 30A20 20 0 0 1 24 4M42 18A20 20 0 0 1 24 44', 'n') + P('M24 1l5 4-5 4zM24 47l-5-4 5-4z', 'w'),
  'skill.hemophilia': HEART('r') + G('translate(14.4 14) scale(0.4)', DROP('w')),
  'skill.mutagenicRage': C(24, 25, 19, 'r') + P('M12 17l9 5M36 17l-9 5', 'n') + C(17, 25, 2.6, 'd') + C(31, 25, 2.6, 'd') + P('M15 36h18l-3-4-3 4-3-4-3 4-3-4z', 'w'),
  'skill.philosophersCrucible': P('M6 20h36v6c0 11-7 18-18 18S6 37 6 26z', 'm') + P('M9 23h30c0 3-6 6-15 6S9 26 9 23z', 'r') + C(17, 12, 3.4, 'r') + C(29, 8, 2.6, 'r') + C(33, 15, 2, 'r') + P('M3 20h42', 'n'),

  // ── Aether-Tech ──
  'skill.rocketJump': P('M14 6h12v18l10 6v8H14z', 'm') + G('translate(20 30) scale(0.55)', FLAME('a')) + P('M38 4l6 8h-4v8h-4v-8h-4z', 'g'),
  'skill.coolantLoop': P('M24 4a20 20 0 1 1-18 12', 'n') + P('M1 10l6 10 9-6z', 'a') + star(24, 24, 11, 4, 6, 'u', 0),
  'skill.shockGrenade': C(24, 28, 16, 'm') + R(20, 6, 8, 8, 2, 'd') + P('M16 26l6 2-4 4 8 2-3 6 9-9-6-1 4-4z', 'g'),
  'skill.precisionOptics': C(24, 24, 18, 'b') + C(24, 24, 10, 'n') + P('M24 2v12M24 34v12M2 24h12M34 24h12', 'n') + ARROW_R('a'),
  'skill.arcCoil': P('M16 44V20m16 24V20', 'n') + P('M14 22h20M14 30h20M14 38h20', 'm') + G('translate(4 -8) scale(0.8)', BOLT('g')),
  'skill.thermalPlating': SHIELD('m') + R(20, 10, 8, 22, 4, 'w') + C(24, 34, 6, 'r') + R(21.5, 20, 5, 14, 2.5, 'r'),
  'skill.aetherPistol': GUN('m') + star(42, 8, 6, 2.4, 4, 'a', 0),
  'skill.deployTurret': P('M12 44l8-14h8l8 14z', 'k') + R(11, 14, 22, 16, 5, 'm') + R(30, 18, 15, 7, 2.5, 'a') + C(20, 22, 3.6, 'a'),
  'skill.ventHeat': R(4, 16, 13, 16, 3, 'm') + P('M17 18l27-12v36L17 30z', 'a') + P('M22 21l14-6M22 27l14 6M22 24h16', 'n'),
  'skill.thermalOverload': R(18, 4, 12, 28, 6, 'w') + C(24, 35, 10, 'r') + R(21.5, 14, 5, 22, 2.5, 'r') + G('translate(26 0) scale(0.42)', BOLT('g')),
  'skill.orbitalBeam': P('M17 0h14l-3 34h-8z', 'a') + P('M22 0h4l-1 34h-2z', 'w') + P('M6 40a18 6 0 0 1 36 0z', 'b') + star(24, 36, 9, 4, 6, 'w'),
  'skill.exoSuit': P('M9 14l15-9 15 9v16c0 8-7 13-15 14-8-1-15-6-15-14z', 'm') + P('M14 19h20l-3 8H17z', 'a') + P('M19 34h10M24 5v8', 'n'),

  // ── Geomancer ──
  'skill.boulderRoll': C(28, 28, 16, 'a') + P('M22 20l6 6-4 6', 'n') + P('M2 18h8M2 26h6M2 34h8', 'n'),
  'skill.bedrock': R(6, 22, 36, 22, 3, 'a') + P('M6 30h36M6 37h36', 'n') + P('M24 2v16m-6-5 6 6 6-6', 'n'),
  'skill.sinkhole': C(24, 26, 20, 'd') + SPIRAL(),
  'skill.mountainBreaker': P('M4 44L20 14l6 8 6-10 12 32z', 'a') + P('M26 22l-4 10 6 4-3 8', 'n') + C(32, 8, 6, 'w'),
  'skill.geodeShell': P('M8 30c0-14 7-24 16-24s16 10 16 24c0 8-7 14-16 14S8 38 8 30z', 'a') + P('M14 32l5-14 5 12 5-14 5 16z', 'u'),
  'skill.crumble': R(10, 6, 28, 20, 3, 'a') + P('M24 6l-3 9 5 4-2 7', 'n') + P('M10 34l7-2 2 7-7 2zM22 38l7-1 1 7-7 1zM33 32l6 1-1 6-6-1z', 'b'),
  'skill.stoneSpike': P('M4 43h40', 'n') + P('M24 3l9 40H15z', 'a') + P('M9 43l4-16 5 16zM31 43l5-12 4 12z', 'b') + P('M24 3l-2 22 5 6', 'n'),
  'skill.earthBarrier': WALL('a'),
  'skill.seismicShock': P('M3 30l10-2 4-12 6 20 5-26 5 18 4-6 8 2', 'n') + P('M4 44h40', 'n') + WAVE(10) + WAVE(18),
  'skill.earthenSkin': SHIELD('a') + P('M24 5l-3 12 7 7-5 8 2 11M14 16l7 1M28 24l9-3', 'n'),
  'skill.petrify': P('M12 44V20c0-9 5-15 12-15s12 6 12 15v24z', 'm') + C(19, 21, 2.6, 'd') + C(29, 21, 2.6, 'd') + P('M19 30h10M30 5l-4 9 5 5-3 8', 'n'),
  'skill.tectonicRupture': P('M2 12h18l-3 10 5 6-4 8 2 8H2zM46 12H29l-2 9 5 7-3 7 2 9h15z', 'a') + P('M22 44l2-9-4-8 5-6-2-9', 'n') + P('M21 44l3-12 4 12z', 'g'),

  // ── Windrunner (#86) ──
  'skill.galeArrow': ARROW_R('a') + P('M4 10q6-4 10 0M2 34q6 4 10 0M6 22h8', 'n'),
  'skill.fleetfoot': P('M14 6h10v22l12 6v8H14z', 'b') + P('M24 14c8-10 18-10 22-6-6 0-12 4-16 10', 'w'),
  'skill.zephyrDash': C(32, 12, 6, 'a') + P('M30 20l-8 12 8 6M26 30l-8 2', 'n') + P('M2 18h12M4 26h10M2 34h12', 'n'),
  'skill.piercingGale': C(18, 24, 8, 'n') + C(32, 24, 8, 'n') + ARROW_R('a'),
  'skill.cycloneSnare': P('M6 8h36l-6 8H12zM12 18h24l-5 8H17zM17 28h14l-4 8h-6z', 'b') + P('M22 38l2 8 2-8', 'a'),
  'skill.keenEye': P('M3 24c6-9 13-13 21-13s15 4 21 13c-6 9-13 13-21 13S9 33 3 24z', 'w') + C(24, 24, 8, 'a') + P('M24 14v20M14 24h20', 'n'),
  'skill.updraftLeap': P('M24 4l7 10h-4v26h-6V14h-7z', 'a') + P('M17 40l7-6 7 6-7 4z', 'b') + SPIRAL(),
  'skill.swiftDraw': P('M10 4c18 6 18 34 0 40', 'n') + P('M10 4v40', 'i') + G('translate(18 6) scale(0.5)', BOLT('g')),
  'skill.arrowStorm': P('M8 18c-6 0-6-10 1-10 0-6 10-8 14-3 4-5 15-3 14 3 7 0 7 10 0 10z', 'b') + P('M10 22v12M18 24v14M26 22v12M34 24v14', 'n') + P('M7 32l3 6 3-6M23 32l3 6 3-6', 'a'),
  'skill.galeSpirits': P('M10 4c18 6 18 34 0 40', 'n') + C(32, 12, 5, 'b') + C(36, 34, 5, 'b') + P('M27 12q-4 6 2 8M31 34q-4 6 2 8', 'n'),
  'skill.skyHunter': P('M6 40c6-16 20-26 36-30', 'n') + star(36, 12, 10, 4, 5, 'g'),
  'skill.skyrender': P('M8 18c-6 0-6-10 1-10 0-6 10-8 14-3 4-5 15-3 14 3 7 0 7 10 0 10z', 'b') + P('M24 4l-4 40', 'n') + ARROW_R('a'),

  // ── Frostwarden (#86) ──
  'skill.frostCleave': G('rotate(40 24 24)', SWORD('u')) + P('M6 30q8 14 24 14', 'n') + star(8, 30, 6, 2.5, 6, 'w', 0),
  'skill.rimeLance': P('M42 6L10 38l-4 4 4-12 6 2 2-8 6 2 2-8 6 2z', 'u') + P('M42 6L10 38', 'n'),
  'skill.wintersBite': P('M14 6h20l-4 22-6 14-6-14z', 'u') + P('M24 10v28', 'n'),
  'skill.frostArmor': P('M10 8l14-4 14 4v18c0 10-6 16-14 18-8-2-14-8-14-18z', 'm') + star(24, 22, 9, 3.5, 6, 'u', 0),
  'skill.glacialCharge': G('rotate(90 24 24)', SWORD('u')) + P('M2 14l8 3-8 3zM4 26l8 2-8 3zM2 36l8 2-8 3z', 'b'),
  'skill.frozenHeart': HEART('u') + P('M24 12l-6 8 6 18 6-18z', 'w'),
  'skill.rimeField': P('M4 32a20 8 0 1 0 40 0a20 8 0 1 0-40 0z', 'b') + P('M8 30l2-10 3 9M20 26l3-12 3 12M34 28l3-10 2 10', 'u'),
  'skill.frostShatter': P('M14 16l10-6 10 6v14l-10 6-10-6z', 'u') + P('M14 16l10 6 10-6M24 22v14', 'i') + P('M10 10L2 4l3 9zM38 10l8-6-3 9zM10 34l-8 6 9-1zM38 34l8 6-9-1z', 'b'),
  'skill.shatterpoint': P('M24 3l13 11-4 26-9 5-9-5-4-26z', 'u') + P('M24 3l-3 13 6 6-4 10 2 13', 'i') + P('M38 12l7-3-3 7zM6 30l-4 5 6-1zM40 34l6 2-5 4z', 'b'),
  'skill.avalancheLeap': P('M2 44L22 14l8 10 6-6 10 26z', 'w') + P('M22 14l-4 7 4-2 3 3zM36 18l-3 5 4-1 2 2z', 'u') + star(22, 12, 12, 5, 8, 'w', -90) + P('M14 6l-3-4 5 1zM32 4l3-4 0 5zM34 16l6-1-4 4z', 'u'),
  'skill.iceborn': G('translate(0 4)', P('M10 28C10 15 16 7 24 7s14 8 14 21v10H27V27h-6v11H10z', 'u') + P('M24 7v9', 'w') + P('M13 16L4 2l12 10zM35 16l9-14-12 10z', 'w')),
  'skill.absoluteZero': star(24, 24, 21, 8, 6, 'u', -90) + star(24, 24, 12, 5, 6, 'w', -60) + C(24, 24, 4, 'b'),

  // ── Lightbringer (#86) ──
  'skill.sunbolt': P('M4 30l18-10 2 8z', 'g') + C(32, 20, 11, 'g') + C(32, 20, 6, 'w') + P('M32 5v-3M44 9l2-2M47 20h3M44 31l2 2', 'g'),
  'skill.mendingLight': HEART('a') + R(21, 14, 6, 16, 1.5, 'w') + R(16, 19, 16, 6, 1.5, 'w') + star(40, 8, 5, 2, 4, 'g', 0) + star(8, 10, 4, 1.6, 4, 'g', 0),
  'skill.kindledHope': R(17, 22, 14, 22, 3, 'w') + P('M17 28h14', 'i') + G('translate(13 0) scale(0.46)', FLAME('g')),
  'skill.lanceOfLight': P('M4 28L36 18l2 6-32 8z', 'g') + P('M34 14l12 6-10 8z', 'w'),
  'skill.dawnShield': SHIELD('a') + P('M14 28a10 10 0 0 1 20 0z', 'g') + P('M24 14v4M16 18l2 3M32 18l-2 3', 'n'),
  'skill.haloWard': P('M10 8a14 5 0 1 0 28 0a14 5 0 1 0-28 0z', 'g') + G('translate(10 14) scale(0.6)', SHIELD('a')),
  'skill.dawnSanctuary': P('M4 36a20 8 0 1 0 40 0a20 8 0 1 0-40 0z', 'b') + R(21, 6, 6, 30, 2, 'g') + R(14, 14, 20, 6, 2, 'g'),
  'skill.blindingFlash': P('M3 30c6-9 13-13 21-13s15 4 21 13c-6 9-13 13-21 13S9 39 3 30z', 'w') + C(24, 30, 6, 'd') + star(24, 12, 12, 4, 8, 'g', 0),
  'skill.guardianLight': P('M24 30C14 14 4 14 2 18c8 2 14 8 22 12zM24 30c10-16 20-16 22-12-8 2-14 8-22 12z', 'g') + G('translate(14 18) scale(0.42)', HEART('a')),
  'skill.sunfall': C(24, 10, 8, 'g') + C(24, 10, 4, 'w') + P('M18 16h12l3 26H15z', 'g') + P('M22 18h4l1 22h-6z', 'w') + P('M8 44h32', 'i'),
  'skill.searingLight': C(24, 24, 14, 'g') + RAYS('g') + star(24, 24, 8, 3, 4, 'w', 0),
  'skill.haloOfDawn': RAYS('g') + P('M10 22a14 6 0 1 0 28 0a14 6 0 1 0-28 0z', 'g') + P('M16 22a8 3 0 1 0 16 0a8 3 0 1 0-16 0z', 'w'),

  // ── Beastcaller (#86) ──
  'skill.callWolf': P('M8 6l9 9h14l9-9 1 15-4 7 1 6-6 8-4 3h-8l-4-3-6-8 1-6-4-7z', 'a') + P('M17 30l7 12 7-12-7-3z', 'b') + P('M21 37h6l-3 4z', 'd') + P('M14 22l6 2-5 2zM34 22l-6 2 5 2z', 'd') + P('M12 9l4 5-3 2zM36 9l-4 5 3 2z', 'b'),
  'skill.wolfPounce': G('rotate(-18 24 20) translate(2 -4) scale(0.8)', P('M8 6l9 9h14l9-9 1 15-4 7 1 6-6 8-4 3h-8l-4-3-6-8 1-6-4-7z', 'a') + P('M17 30l7 12 7-12-7-3z', 'b') + P('M21 37h6l-3 4z', 'd') + P('M14 22l6 2-5 2zM34 22l-6 2 5 2z', 'd') + P('M12 9l4 5-3 2zM36 9l-4 5 3 2z', 'b')) + G('translate(4 34) scale(0.55)', P('M4 10c0-6 4-8 8-8s8 2 8 8-4 8-8 8-8-2-8-8z', 'a') + C(4, 2, 3, 'a') + C(12, -1, 3, 'a') + C(20, 2, 3, 'a')) + G('translate(30 36) scale(0.55)', P('M4 10c0-6 4-8 8-8s8 2 8 8-4 8-8 8-8-2-8-8z', 'a') + C(4, 2, 3, 'a') + C(12, -1, 3, 'a') + C(20, 2, 3, 'a')),
  'skill.wildKinship': HEART('a') + G('translate(14 14) scale(0.42)', C(24, 30, 9, 'w') + C(14, 18, 4, 'w') + C(22, 12, 4, 'w') + C(30, 12, 4, 'w') + C(36, 18, 4, 'w')),
  'skill.callHawk': P('M24 24C17 12 8 6 2 8c3 3 4 6 6 7-2 0-3 1-3 2 3 1 6 3 8 3-1 1-1 2 0 3 4 0 8 1 11 1z', 'g') + P('M24 24C31 12 40 6 46 8c-3 3-4 6-6 7 2 0 3 1 3 2-3 1-6 3-8 3 1 1 1 2 0 3-4 0-8 1-11 1z', 'g') + P('M19 20c0-4 2-7 5-7s5 3 5 7l-1 14-4 8-4-8z', 'k') + P('M21 28l3 4 3-4', 'b') + P('M22 17l2 5 2-5z', 'g') + C(21.5, 16, 1.4, 'd') + C(26.5, 16, 1.4, 'd'),
  'skill.callBear': C(12, 12, 7, 'k') + C(36, 12, 7, 'k') + C(12, 12, 3.4, 'b') + C(36, 12, 3.4, 'b') + C(24, 26, 17, 'k') + P('M17 30a7 6 0 1 0 14 0a7 6 0 1 0-14 0z', 'b') + P('M21 29h6l-3 4z', 'd') + P('M15 22l5 1-4 2zM33 22l-5 1 4 2z', 'd'),
  'skill.thickHide': SHIELD('a') + P('M14 14l4 8M22 12l4 10M30 14l4 8M16 28l4 6M26 28l4 6', 'n'),
  'skill.packBond': P('M6 10c4 14 32 14 36 0', 'i') + P('M12 18l4 0-2 16zM22 21l4 0-2 20zM32 18l4 0-2 16z', 'w') + C(18, 20, 3, 'a') + C(30, 20, 3, 'a'),
  'skill.spiritStampede': G('translate(-4 10) scale(0.55)', P('M8 6l9 9h14l9-9 1 15-4 7 1 6-6 8-4 3h-8l-4-3-6-8 1-6-4-7z', 'a') + P('M17 30l7 12 7-12-7-3z', 'b') + P('M21 37h6l-3 4z', 'd') + P('M14 22l6 2-5 2zM34 22l-6 2 5 2z', 'd') + P('M12 9l4 5-3 2zM36 9l-4 5 3 2z', 'b')) + G('translate(22 10) scale(0.55)', P('M8 6l9 9h14l9-9 1 15-4 7 1 6-6 8-4 3h-8l-4-3-6-8 1-6-4-7z', 'a') + P('M17 30l7 12 7-12-7-3z', 'b') + P('M21 37h6l-3 4z', 'd') + P('M14 22l6 2-5 2zM34 22l-6 2 5 2z', 'd') + P('M12 9l4 5-3 2zM36 9l-4 5 3 2z', 'b')) + G('translate(9 0) scale(0.62)', P('M8 6l9 9h14l9-9 1 15-4 7 1 6-6 8-4 3h-8l-4-3-6-8 1-6-4-7z', 'a') + P('M17 30l7 12 7-12-7-3z', 'b') + P('M21 37h6l-3 4z', 'd') + P('M14 22l6 2-5 2zM34 22l-6 2 5 2z', 'd') + P('M12 9l4 5-3 2zM36 9l-4 5 3 2z', 'b')),
  'skill.packTactics': P('M24 2l12 24-12 16-12-16z', 'm') + P('M24 2v40', 'i') + G('translate(17 16) scale(0.32)', P('M4 10c0-6 4-8 8-8s8 2 8 8-4 8-8 8-8-2-8-8z', 'a') + C(4, 2, 3, 'a') + C(12, -1, 3, 'a') + C(20, 2, 3, 'a')) + R(21, 40, 6, 7, 2, 'k'),
  'skill.alphaHowl': P('M8 6l9 9h14l9-9 1 15-4 7 1 6-6 8-4 3h-8l-4-3-6-8 1-6-4-7z', 'a') + P('M15 30l9 3 9-3-2 10-7 4-7-4z', 'd') + P('M18 31l2 4 2-3zM30 31l-2 4-2-3z', 'w') + P('M21 26h6l-3 3z', 'd') + P('M14 20l6 1-5 3zM34 20l-6 1 5 3z', 'd') + P('M12 9l4 5-3 2zM36 9l-4 5 3 2z', 'b'),
  'skill.leaderOfThePack': G('translate(4 10) scale(0.82)', P('M8 6l9 9h14l9-9 1 15-4 7 1 6-6 8-4 3h-8l-4-3-6-8 1-6-4-7z', 'a') + P('M17 30l7 12 7-12-7-3z', 'b') + P('M21 37h6l-3 4z', 'd') + P('M14 22l6 2-5 2zM34 22l-6 2 5 2z', 'd') + P('M12 9l4 5-3 2zM36 9l-4 5 3 2z', 'b')) + G('translate(12 -3) scale(0.5)', CROWN('g')),
  'skill.wildHunt': P('M34 2a10 10 0 1 0 0 16a12 12 0 0 1 0-16z', 'g') + P('M6 26c8 0 22 4 30 14l4-4c-8-10-22-16-34-14z', 'w') + P('M36 40l6 4 2-6z', 'g') + P('M14 26l-2 6M22 28l-2 6', 'i'),

  // ── Elementalist (#95) ──
  'skill.prismBolt': P('M24 4l14 20-14 20-14-20z', 'r') + P('M24 4l14 20-14 20z', 'u') + P('M24 4l-5 20 5 20 5-20z', 'b'),
  'skill.elementalHarmony': C(24, 24, 16, 'n') + C(24, 8, 5, 'r') + C(40, 24, 5, 'u') + C(24, 40, 5, 'g') + C(8, 24, 5, 'm'),
  'skill.frostLance': P('M2 27L34 19l12 5-12 5z', 'u') + P('M8 26l26-5v4z', 'w'),
  'skill.chainSpark': P('M28 2L12 22h9l-5 12 8-6-2 18 14-24h-9l6-14z', 'g') + star(8, 12, 5, 2, 4, 'w', 0) + star(40, 38, 5, 2, 4, 'w', 0) + star(8, 36, 4, 1.6, 4, 'w', 0),
  'skill.smolderingCore': P('M6 40l5-18 11-10 13 4 7 16-5 10H12z', 'k') + P('M14 26l7 5-3 8 6-4 5 6 1-9 7-3-8-2-2-7-4 6z', 'r') + C(24, 32, 4, 'g') + G('translate(28 -2) scale(0.4)', DROP('u')),
  'skill.rollingBoulder': G('translate(-6 -8) scale(1.25)', ROCK('m')),
  'skill.thunderSnow': P('M8 18c-6 0-6-10 1-10 0-6 10-8 14-3 4-5 15-3 14 3 7 0 7 10 0 10z', 'b') + star(14, 32, 7, 2.5, 6, 'u', 0) + G('translate(20 18) scale(0.5)', BOLT('g')),
  'skill.spellweave': P('M6 10c12 8 24 20 36 28M6 38c12-8 24-20 36-28', 'n') + star(24, 24, 9, 3.5, 4, 'g', 0),
  'skill.prismaticNova': P('M24 24L24 2M24 24L46 24M24 24L24 46M24 24L2 24', 'n') + C(24, 4, 4, 'r') + C(44, 24, 4, 'u') + C(24, 44, 4, 'g') + C(4, 24, 4, 'm') + C(24, 24, 5, 'w'),
  'skill.prismaticWard': P('M24 4l18 10v20L24 44 6 34V14z', 'b') + P('M24 4v40M6 14l36 20M42 14L6 34', 'n'),
  'skill.frostfireComet': C(32, 16, 8, 'w') + P('M26 20L4 42l4-14z', 'r') + P('M28 22L10 44l12-8z', 'u'),
  'skill.elementalConvergence': R(22, 14, 4, 32, 2, 'm') + C(24, 12, 5, 'w') + C(24, 8, 5, 'r') + C(40, 24, 5, 'u') + C(24, 28, 4, 'g') + C(8, 24, 5, 'm'),

  // ── Soul Warden (#95) ──
  'skill.wispBolt': G('translate(-4 -4) scale(1)', P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd')) + P('M8 40q6 4 10-2', 'n'),
  'skill.kindredSpirits': G('translate(-10 4) scale(0.75)', P('M12 44V22c0-10 6-16 12-16s12 6 12 16v22l-4-4-4 4-4-4-4 4-4-4z', 'w') + C(20, 22, 2.4, 'd') + C(28, 22, 2.4, 'd')) + G('translate(16 4) scale(0.75)', P('M12 44V22c0-10 6-16 12-16s12 6 12 16v22l-4-4-4 4-4-4-4 4-4-4z', 'w') + C(20, 22, 2.4, 'd') + C(28, 22, 2.4, 'd')) + G('translate(18 0) scale(0.3)', HEART('a')),
  'skill.callTheFallen': P('M8 30h32v6c0 6-6 10-16 10S8 42 8 36z', 'b') + G('translate(2 -6) scale(0.4)', P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd')) + G('translate(14 -10) scale(0.4)', P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd')) + G('translate(26 -6) scale(0.4)', P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd')),
  'skill.soulBond': G('translate(-8 0) scale(0.6)', P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd')) + G('translate(20 0) scale(0.6)', P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd')) + P('M12 32c6 8 18 8 24 0l-3 6c-6 4-12 4-18 0z', 'g'),
  'skill.restlessSouls': P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd') + P('M4 44h6M14 44h6M24 44h6M34 44h6', 'n'),
  'skill.spiritLantern': R(16, 14, 16, 24, 4, 'g') + R(19, 17, 10, 18, 3, 'w') + P('M24 4v10M18 10h12', 'n') + P('M8 26H2M46 26h-6M10 14l-4-4M38 14l4-4', 'n'),
  'skill.hauntingWail': C(22, 24, 16, 'w') + C(16, 20, 2.4, 'd') + C(28, 20, 2.4, 'd') + C(22, 30, 4, 'd') + P('M40 16q6 8 0 16M44 12q8 12 0 24', 'n'),
  'skill.wardensVigil': SHIELD('b') + G('translate(12 10) scale(0.5)', R(16, 14, 16, 24, 4, 'g') + R(19, 17, 10, 18, 3, 'w') + P('M24 4v10M18 10h12', 'n')),
  'skill.releaseSouls': star(24, 26, 16, 6, 6, 'b') + P('M14 10v-6M24 8V2M34 10v-6', 'n') + C(24, 26, 5, 'w'),
  'skill.lanternKeeper': R(16, 14, 16, 24, 4, 'g') + R(19, 17, 10, 18, 3, 'w') + P('M24 4v10M18 10h12', 'n') + P('M24 22v6l3 2', 'n'),
  'skill.wispSwarm': G('translate(-6 -6) scale(0.4)', P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd')) + G('translate(6 -10) scale(0.4)', P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd')) + G('translate(18 -10) scale(0.4)', P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd')) + G('translate(30 -6) scale(0.4)', P('M24 10c8 0 12 8 12 16 0 10-6 16-12 16-4 0-6-4-4-8-6 2-8-4-6-8 2-10 4-16 10-16z', 'b') + C(20, 24, 2.2, 'd') + C(28, 24, 2.2, 'd')) + P('M8 26l4 14M20 22l2 16M30 22l-2 16M40 26l-4 14', 'n'),
  'skill.processionOfSouls': G('translate(30 8) scale(0.45)', R(16, 14, 16, 24, 4, 'g') + R(19, 17, 10, 18, 3, 'w') + P('M24 4v10M18 10h12', 'n')) + G('translate(-2 12) scale(0.5)', P('M12 44V22c0-10 6-16 12-16s12 6 12 16v22l-4-4-4 4-4-4-4 4-4-4z', 'w') + C(20, 22, 2.4, 'd') + C(28, 22, 2.4, 'd')) + G('translate(10 12) scale(0.5)', P('M12 44V22c0-10 6-16 12-16s12 6 12 16v22l-4-4-4 4-4-4-4 4-4-4z', 'w') + C(20, 22, 2.4, 'd') + C(28, 22, 2.4, 'd')) + G('translate(22 12) scale(0.5)', P('M12 44V22c0-10 6-16 12-16s12 6 12 16v22l-4-4-4 4-4-4-4 4-4-4z', 'w') + C(20, 22, 2.4, 'd') + C(28, 22, 2.4, 'd')),

  // ── Iron Monk (#95) ──
  'skill.palmStrike': P('M14 44V22l-4-8 3-2 5 6V8h4v14V6h4v16V8h4v14l4-6 3 2-5 10v16z', 'a') + P('M40 14h6M40 22h6M40 30h6', 'n'),
  'skill.ironBody': P('M12 8h24l4 10-4 26H12L8 18z', 'm') + C(16, 14, 1.8, 'd') + C(32, 14, 1.8, 'd') + C(16, 38, 1.8, 'd') + C(32, 38, 1.8, 'd'),
  'skill.flyingKick': P('M6 42l12-14 6 2 12-10 8 4-2 6-8 2-10 8-8-2-8 6z', 'a') + P('M36 20l8 4-3 4-8-2z', 'k') + P('M2 28l8-4M2 36l6-2', 'b'),
  'skill.tigerStance': C(24, 30, 9, 'g') + C(14, 18, 4, 'g') + C(22, 12, 4, 'g') + C(30, 12, 4, 'g') + C(36, 18, 4, 'g') + P('M18 30l4-4M26 34l4-4', 'n'),
  'skill.craneStance': P('M30 6c4 0 6 3 5 6l-5 8c6 2 10 8 10 14-8 0-14-4-18-10l-12-4 12-2c2-6 4-12 8-12z', 'w') + P('M35 9l9 2-9 2z', 'g') + P('M26 30v14M26 36l-4-2', 'i') + C(32, 9, 1.4, 'd'),
  'skill.flowingFists': G('translate(0 2) scale(0.8)', R(12, 16, 24, 20, 6, 'a') + P('M18 16v8M24 16v8M30 16v8', 'n') + R(8, 22, 8, 10, 4, 'a')) + P('M4 40c6-6 12 6 18 0s12 6 18 0', 'n'),
  'skill.hundredFists': G('translate(-4 -2) scale(0.5)', R(12, 16, 24, 20, 6, 'a') + P('M18 16v8M24 16v8M30 16v8', 'n') + R(8, 22, 8, 10, 4, 'a')) + G('translate(16 -6) scale(0.5)', R(12, 16, 24, 20, 6, 'a') + P('M18 16v8M24 16v8M30 16v8', 'n') + R(8, 22, 8, 10, 4, 'a')) + G('translate(6 14) scale(0.5)', R(12, 16, 24, 20, 6, 'a') + P('M18 16v8M24 16v8M30 16v8', 'n') + R(8, 22, 8, 10, 4, 'a')) + G('translate(24 16) scale(0.5)', R(12, 16, 24, 20, 6, 'a') + P('M18 16v8M24 16v8M30 16v8', 'n') + R(8, 22, 8, 10, 4, 'a')),
  'skill.risingDragon': G('translate(2 10) scale(0.7)', R(12, 16, 24, 20, 6, 'a') + R(8, 22, 8, 10, 4, 'a')) + P('M8 42c-6-10 2-22 12-22s14-8 10-16c8 2 12 10 8 18-4 6-12 6-14 12', 'b') + P('M30 4l4-4 2 6z', 'b'),
  'skill.cranesGrace': P('M36 4C20 8 10 22 10 40l4-2c2-12 10-24 22-34z', 'w') + P('M10 40L34 6', 'n'),
  'skill.whirlwindKick': P('M24 6a18 18 0 1 1-17 22', 'b') + P('M8 22c2 6 8 4 10 10l14-4 8 4-4 6-16 2c-8 0-12-6-12-18z', 'a') + P('M36 32l8 0-2 6z', 'k'),
  'skill.tigersFury': G('translate(6 10) scale(0.75)', R(12, 16, 24, 20, 6, 'a') + P('M18 16v8M24 16v8M30 16v8', 'n') + R(8, 22, 8, 10, 4, 'a')) + P('M10 4l14 14M18 2l14 14M26 4l14 14', 'r'),
  'skill.mountainPalm': P('M4 44l14-20 6 8 8-14 12 26z', 'b') + G('translate(10 -10) scale(0.6)', P('M14 44V22l-4-8 3-2 5 6V8h4v14V6h4v16V8h4v14l4-6 3 2-5 10v16z', 'a')),

  // ── Bard (#95) ──
  'skill.sharpNote': P('M18 36V8l18-4v8l-14 3v21', 'n') + C(14, 36, 6, 'a') + star(36, 8, 6, 2.4, 4, 'g', 0),
  'skill.stagePresence': R(6, 34, 36, 10, 2, 'm') + star(24, 18, 12, 5, 5, 'g'),
  'skill.marchingSong': P('M8 22a16 6 0 1 0 32 0v14a16 6 0 1 1-32 0z', 'a') + P('M8 22a16 6 0 1 0 32 0a16 6 0 1 0-32 0', 'w') + P('M14 4l10 14M34 4L24 18', 'n'),
  'skill.lullaby': P('M30 4a12 12 0 1 0 0 20a14 14 0 0 1 0-20z', 'g') + P('M8 30h8l-8 8h8', 'n') + G('translate(18 10) scale(0.7)', P('M18 36V8l18-4v8l-14 3v21', 'n') + C(14, 36, 6, 'a')),
  'skill.longRefrain': P('M18 36V8l18-4v8l-14 3v21', 'n') + C(14, 36, 6, 'a') + P('M20 40c6-6 10 6 16 0s8 6 10 0', 'n'),
  'skill.balladOfValor': P('M18 24c-8 2-12 10-8 16s14 6 18-2 2-14-10-14z', 'a') + P('M22 26L40 6', 'n') + C(19, 33, 3, 'd') + G('rotate(-40 24 24) translate(4 0)', SWORD('m')),
  'skill.charmingSerenade': HEART('a') + G('translate(10 6) scale(0.55)', P('M18 36V8l18-4v8l-14 3v21', 'n') + C(14, 36, 6, 'w')),
  'skill.virtuoso': P('M18 24c-8 2-12 10-8 16s14 6 18-2 2-14-10-14z', 'a') + P('M22 26L40 6', 'n') + C(19, 33, 3, 'd') + star(40, 18, 5, 2, 4, 'g', 0) + star(34, 30, 4, 1.6, 4, 'g', 0) + star(44, 30, 3.5, 1.4, 4, 'g', 0),
  'skill.hymnOfMending': R(18, 6, 12, 36, 2, 'e') + R(6, 18, 36, 12, 2, 'e') + G('translate(10 8) scale(0.55)', P('M18 36V8l18-4v8l-14 3v21', 'n') + C(14, 36, 6, 'w')),
  'skill.crescendo': P('M4 34L26 14l4 22z', 'a') + P('M26 14l14-8v34l-10-4z', 'b') + star(40, 8, 6, 2.4, 4, 'g', 0),
  'skill.standingOvation': P('M8 44V26c0-6 6-8 8-2l2 8V12c0-3 5-3 5 0v12V8c0-3 5-3 5 0v16V12c0-3 5-3 5 0v20l4-6c2-4 7-2 5 2l-6 14-2 6z', 'b') + star(10, 10, 5, 2, 4, 'g', 0) + star(40, 8, 4, 1.6, 4, 'g', 0),
  'skill.grandFinale': G('translate(0 8) scale(0.8)', P('M18 24c-8 2-12 10-8 16s14 6 18-2 2-14-10-14z', 'a') + P('M22 26L40 6', 'n') + C(19, 33, 3, 'd')) + star(36, 12, 11, 4, 8, 'g', 0),

  // ── Statuses ──
  'status.stun': star(24, 24, 20, 9, 5, 'g') + C(24, 24, 4, 'w'),
  'status.knockup': P('M24 3l15 16h-9v12H18V19H9z', 'w') + P('M12 40h24', 'n'),
  'status.knockdown': P('M24 45L9 29h9V17h12v12h9z', 'w') + P('M12 8h24', 'n'),
  'status.stasis': C(24, 24, 21, 'b') + G('translate(8.4 8.4) scale(0.65)', HOURGLASS('a')),
  'status.petrify': ROCK('m'),
  'status.frozen': star(24, 24, 21, 6, 6, 'u') + C(24, 24, 5, 'w'),
  'status.fear': SKULL('w'),
  'status.slow': P('M8 34c0-10 7-17 16-17s16 7 16 17z', 'a') + C(38, 18, 6, 'e') + P('M4 38h40M36 10l-2-6M41 11l3-5', 'n'),
  'status.confuse': SPIRAL(),
  'status.taunt': P('M6 19h9l14-10v30L15 29H6z', 'r') + P('M35 15a12 12 0 0 1 0 18', 'n'),
  'status.armorShred': SHIELD('m') + P('M24 5l-4 14 8 6-6 18', 'n'),
  'status.weaken': G('rotate(180 24 24)', P('M24 3l15 16h-9v24H18V19H9z', 'u')),
  'status.vulnerable': TARGET(),
  'status.burn': FLAME('a'),
  'status.poison': DROP('e') + C(28, 30, 2.2, 'w'),
  'status.bleed': DROP('r'),
  'status.delayed': CLOCK('w'),
  'status.haste': P('M4 14l16 10L4 34zM22 14l22 10-22 10z', 'g'),
  'status.attackSpeed': G('translate(-6 0)', G('rotate(40 24 24)', DAGGER('m'))) + P('M30 34h14M34 40h10', 'n'),
  'status.damageUp': G('rotate(40 24 24)', SWORD('m')) + P('M38 4l7 9h-4v8h-6v-8h-4z', 'g'),
  'status.defenseUp': SHIELD('a') + P('M24 13l8 9h-5v9h-6v-9h-5z', 'w'),
  'status.regen': HEART('e') + R(21, 14, 6, 16, 1.5, 'w') + R(16, 19, 16, 6, 1.5, 'w'),
  'status.lifestealUp': HEART('r') + P('M24 13l8 9h-5v9h-6v-9h-5z', 'w'),
  'status.invulnerable': C(24, 24, 21, 'g') + G('translate(8.4 8.4) scale(0.65)', SHIELD('w')),
  'status.unkillable': SKULL('w') + P('M6 6l36 36', 'n'),
  'status.stealth': P('M3 24c6-9 13-13 21-13s15 4 21 13c-6 9-13 13-21 13S9 33 3 24z', 'b') + C(24, 24, 6.5, 'd') + P('M6 42L42 6', 'n'),
  'status.reflect': SHIELD('a') + P('M40 4L28 16M28 16v-8M28 16h8', 'n'),
  'status.envenom': G('translate(-6 -2)', G('rotate(40 24 24)', DAGGER('m'))) + G('translate(22 20) scale(0.5)', DROP('e')),
  'status.exosuit': P('M9 14l15-9 15 9v16c0 8-7 13-15 14-8-1-15-6-15-14z', 'm') + P('M14 19h20l-3 8H17z', 'a'),
  'status.focus': TARGET(),
  'status.accelerate': CLOCK('w') + P('M30 38l8 6-8 4zM38 38l8 6-8 4z', 'a'),
  'status.overheat': R(18, 4, 12, 28, 6, 'w') + C(24, 35, 10, 'r') + R(21.5, 10, 5, 26, 2.5, 'r'),
  'status.enrage': C(24, 25, 19, 'r') + P('M12 17l9 5M36 17l-9 5', 'n') + C(17, 26, 2.6, 'd') + C(31, 26, 2.6, 'd') + P('M17 36h14', 'n'),
  'status.ambush': SKULL('w'),
  // The Iron Monk's chi (#95): a jade yin-yang bead.
  'status.chi': C(24, 24, 20, 'e') + P('M24 4a10 10 0 0 1 0 20 10 10 0 0 0 0 20 20 20 0 0 1 0-40z', 'w') + C(24, 14, 3, 'e') + C(24, 34, 3, 'w'),
  // The elixirs (#87): a flask of the brew's colour, its strength on the glass.
  'status.elixirMight': FLASK('r') + G('translate(15 21) scale(0.38)', ELIXIR_MARK.might),
  'status.elixirIron': FLASK('m') + G('translate(15 21) scale(0.38)', ELIXIR_MARK.iron),
  'status.elixirSwift': FLASK('e') + G('translate(15 21) scale(0.38)', ELIXIR_MARK.swift),
  'status.elixirMind': FLASK('b') + G('translate(15 21) scale(0.38)', ELIXIR_MARK.mind),
  'status.elixirVigor': FLASK('r') + G('translate(15 21) scale(0.38)', ELIXIR_MARK.vigor),
  'status.elixirShadow': FLASK('u') + G('translate(15 21) scale(0.38)', ELIXIR_MARK.shadow),
  // The same strengths alone, for the third flask's glass on the battle bar.
  'mark.elixir.might': ELIXIR_MARK.might,
  'mark.elixir.iron': ELIXIR_MARK.iron,
  'mark.elixir.swift': ELIXIR_MARK.swift,
  'mark.elixir.mind': ELIXIR_MARK.mind,
  'mark.elixir.vigor': ELIXIR_MARK.vigor,
  'mark.elixir.shadow': ELIXIR_MARK.shadow,

  // ── Odds and ends ──
  potion: FLASK('r') + G('translate(14.4 20) scale(0.4)', HEART('w')),
  xp: star(24, 25, 21, 9, 5, 'u'),
  rock: ROCK('m'),
  unknown: C(24, 24, 18, 'b') + P('M18 19a6 6 0 1 1 9 5c-2 1-3 2-3 5M24 35v1', 'n')
}

export const hasGlyph = (id: string): boolean => id in GLYPHS
