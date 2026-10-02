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
  greathelm: P('M10 13c0-5 6-8 14-8s14 3 14 8v26c0 3-6 5-14 5s-14-2-14-5z', 'm') + P('M14 20h20v4.5h-7.500V38h-5V24.500H14z', 'd') + P('M24 5v10', 'n') + C(15, 33, 1.6, 'a') + C(33, 33, 1.6, 'a'),
  circlet: P('M4 22c7 6 13 8 20 8s13-2 20-8v9c-7 6-13 8-20 8S11 37 4 31z', 'g') + P('M24 8l8 13-8 10-8-10z', 'a') + P('M24 13l3.500 8-3.500 4.500-3.500-4.500z', 'w') + C(9, 30, 1.8, 'a') + C(39, 30, 1.8, 'a'),
  hat: P('M3 35c0-4 9-7 21-7s21 3 21 7-9 8-21 8S3 39 3 35z', 'a') + P('M28 2c1 10 5 20 10 29-9 3-19 3-28 0C15 24 21 13 28 2z', 'a') + P('M11 27c9 3 17 3 26 0l1.500 4c-10 3-19 3-29 0z', 'g') + star(25, 19, 4.6, 1.9, 4, 'w', 0),
  gloves: G('rotate(-12 24 24)', R(31, 15, 9, 16, 4.5, 'k') + R(12, 5, 21, 28, 9, 'k') + P('M19 8v11M26 8v11', 'n') + R(10, 30, 25, 13, 3.5, 'a') + P('M12 36h21', 'n')),
  gauntlets: G('rotate(-12 24 24)', R(31, 14, 9, 15, 3, 'm') + R(12, 4, 21, 26, 6, 'm') + P('M19 6v9M26 6v9', 'n') + R(12, 16, 21, 5, 1.5, 'a') + P('M13 27h19l6 17H7z', 'm') + P('M10 36h25', 'n')),
  boots: P('M14 4h15v22l12 6c3 2 4 6 3 9H14z', 'k') + R(12, 39, 33, 6, 2.5, 'd') + R(12, 4, 19, 8, 2.5, 'a') + P('M29 26l-7 5', 'n'),
  greaves: P('M14 9h15v18l12 6c3 2 4 5 3 8H14z', 'm') + R(12, 39, 33, 6, 2.5, 'd') + P('M11 3h21l-2 12H13z', 'a') + P('M14 21h15M14 27h15', 'n') + P('M34 30l-3 9', 'n'),
  ring: RING('g') + GEM('a', 12),
  charm: P('M14 4l10 16L34 4', 'n') + P('M24 17l11 9-11 17-11-17z', 'a') + P('M24 23l4 4-4 7-4-7z', 'w'),
  hourglass: HOURGLASS('a'),
  heart: P('M24 43C9 32 5 24 5 17a10 10 0 0 1 19-4 10 10 0 0 1 19 4c0 7-4 15-19 26z', 'a') + P('M24 13l-5 9 7 5-4 9', 'n'),

  // ── Aegis Knight ──
  'skill.shieldSlam': G('translate(-4 2) scale(0.9)', SHIELD('a')) + star(36, 14, 11, 4.6, 6, 'g'),
  'skill.aegisAura': C(24, 24, 20, 'b') + G('translate(6 6) scale(0.75)', SHIELD('a') + P('M24 13v22M15 21h18', 'n')),
  'skill.radiantStrike': RAYS('g') + G('translate(7.2 7.2) scale(0.7)', G('rotate(40 24 24)', SWORD('w'))),
  'skill.fortitude': SHIELD('a') + G('translate(9.6 8) scale(0.6)', HEART('r')),
  'skill.tauntingCry': P('M6 19h9l14-10v30L15 29H6z', 'a') + P('M35 15a12 12 0 0 1 0 18M40 9a20 20 0 0 1 0 30', 'n'),
  'skill.holyBastion': P('M4 42a20 22 0 0 1 40 0z', 'b') + G('translate(9.6 12) scale(0.6)', TOWER('w')) + star(24, 9, 7, 3, 4, 'g', 0),

  // ── Shadowblade ──
  'skill.shadowstep': P('M4 14h14M2 24h14M4 34h14', 'n') + P('M20 6c12 0 22 8 24 18-2 10-12 18-24 18 8-4 12-10 12-18S28 10 20 6z', 'a'),
  'skill.lethality': G('translate(-5 5) scale(0.95)', G('rotate(40 24 24)', DAGGER('m'))) + star(35, 13, 11, 4.4, 4, 'r', 0),
  'skill.venomousBlade': G('translate(-6 -2)', G('rotate(40 24 24)', DAGGER('m'))) + G('translate(22 20) scale(0.5)', DROP('e')),
  'skill.evasion': P('M10 40V20a14 14 0 0 1 28 0v20l-5-4-4.5 4-4.5-4-4.5 4-4.5-4z', 'b') + C(19, 21, 3, 'd') + C(29, 21, 3, 'd') + P('M2 12h9M1 20h6', 'n'),
  'skill.smokeBomb': G('translate(0 12) scale(0.75)', BOMB('d')) + G('translate(8 -6) scale(0.8)', CLOUD('b')),
  'skill.danceOfBlades': [0, 120, 240].map(a => G(`rotate(${a} 24 24)`, P('M24 3l5 7v10H19V10z', 'm'))).join('') + C(24, 24, 6.5, 'a'),

  // ── Arch-Pyromancer ──
  'skill.fireball': P('M3 40l13-9M6 30l8-4M14 44l7-9', 'n') + G('translate(10 -2) scale(0.78)', FLAME('a')),
  'skill.cauterize': FLAME('a') + R(21, 26, 6, 14, 1.5, 'w') + R(17, 30, 14, 6, 1.5, 'w'),
  'skill.flamePillar': P('M6 43h36', 'n') + P('M15 43c-3-8 2-12 2-18 0-5-2-8 0-13 3 3 4 5 5 9 1-6 1-12 3-18 4 6 8 11 8 19 0 4-2 6-1 10 2 4 2 8-1 11z', 'a') + P('M21 43c-1-5 3-8 3-13 3 4 5 8 3 13z', 'g'),
  'skill.pyromaniac': G('translate(-4 0)', FLAME('a')) + star(37, 12, 9, 3.6, 4, 'w', 0) + star(40, 32, 5.5, 2.2, 4, 'w', 0),
  'skill.combustion': star(24, 24, 22, 11, 9, 'a') + star(24, 24, 12, 6, 9, 'g'),
  'skill.cataclysm': P('M44 3L27 12M46 15L33 21M34 2L23 9', 'n') + C(19, 29, 14, 'a') + C(14, 27, 3.4, 'd') + C(23, 35, 2.6, 'd') + C(24, 24, 2, 'd') + P('M6 44h30', 'n'),

  // ── Royal Sovereign ──
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
  'skill.chronoRewind': CLOCK('w') + P('M4 6v13h13', 'n') + P('M5 18A21 21 0 0 1 24 3', 'n'),

  // ── Blood Alchemist ──
  'skill.sanguineFlask': FLASK('r') + C(20, 34, 2, 'w') + C(27, 37, 1.5, 'w'),
  'skill.bloodTransmutation': G('translate(-8 0) scale(0.7)', DROP('r')) + G('translate(22 14) scale(0.7)', DROP('u')) + P('M19 12l8 4-8 4', 'n'),
  'skill.essenceHarvest': G('translate(7.2 8) scale(0.7)', DROP('r')) + P('M6 30A20 20 0 0 1 24 4M42 18A20 20 0 0 1 24 44', 'n') + P('M24 1l5 4-5 4zM24 47l-5-4 5-4z', 'w'),
  'skill.hemophilia': HEART('r') + G('translate(14.4 14) scale(0.4)', DROP('w')),
  'skill.mutagenicRage': C(24, 25, 19, 'r') + P('M12 17l9 5M36 17l-9 5', 'n') + C(17, 25, 2.6, 'd') + C(31, 25, 2.6, 'd') + P('M15 36h18l-3-4-3 4-3-4-3 4-3-4z', 'w'),
  'skill.philosophersCrucible': P('M6 20h36v6c0 11-7 18-18 18S6 37 6 26z', 'm') + P('M9 23h30c0 3-6 6-15 6S9 26 9 23z', 'r') + C(17, 12, 3.4, 'r') + C(29, 8, 2.6, 'r') + C(33, 15, 2, 'r') + P('M3 20h42', 'n'),

  // ── Aether-Tech ──
  'skill.aetherPistol': GUN('m') + star(42, 8, 6, 2.4, 4, 'a', 0),
  'skill.deployTurret': P('M12 44l8-14h8l8 14z', 'k') + R(11, 14, 22, 16, 5, 'm') + R(30, 18, 15, 7, 2.5, 'a') + C(20, 22, 3.6, 'a'),
  'skill.ventHeat': R(4, 16, 13, 16, 3, 'm') + P('M17 18l27-12v36L17 30z', 'a') + P('M22 21l14-6M22 27l14 6M22 24h16', 'n'),
  'skill.thermalOverload': R(18, 4, 12, 28, 6, 'w') + C(24, 35, 10, 'r') + R(21.5, 14, 5, 22, 2.5, 'r') + G('translate(26 0) scale(0.42)', BOLT('g')),
  'skill.orbitalBeam': P('M17 0h14l-3 34h-8z', 'a') + P('M22 0h4l-1 34h-2z', 'w') + P('M6 40a18 6 0 0 1 36 0z', 'b') + star(24, 36, 9, 4, 6, 'w'),
  'skill.exoSuit': P('M9 14l15-9 15 9v16c0 8-7 13-15 14-8-1-15-6-15-14z', 'm') + P('M14 19h20l-3 8H17z', 'a') + P('M19 34h10M24 5v8', 'n'),

  // ── Geomancer ──
  'skill.stoneSpike': P('M4 43h40', 'n') + P('M24 3l9 40H15z', 'a') + P('M9 43l4-16 5 16zM31 43l5-12 4 12z', 'b') + P('M24 3l-2 22 5 6', 'n'),
  'skill.earthBarrier': WALL('a'),
  'skill.seismicShock': P('M3 30l10-2 4-12 6 20 5-26 5 18 4-6 8 2', 'n') + P('M4 44h40', 'n') + WAVE(10) + WAVE(18),
  'skill.earthenSkin': SHIELD('a') + P('M24 5l-3 12 7 7-5 8 2 11M14 16l7 1M28 24l9-3', 'n'),
  'skill.petrify': P('M12 44V20c0-9 5-15 12-15s12 6 12 15v24z', 'm') + C(19, 21, 2.6, 'd') + C(29, 21, 2.6, 'd') + P('M19 30h10M30 5l-4 9 5 5-3 8', 'n'),
  'skill.tectonicRupture': P('M2 12h18l-3 10 5 6-4 8 2 8H2zM46 12H29l-2 9 5 7-3 7 2 9h15z', 'a') + P('M22 44l2-9-4-8 5-6-2-9', 'n') + P('M21 44l3-12 4 12z', 'g'),

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

  // ── Odds and ends ──
  potion: FLASK('r') + G('translate(14.4 20) scale(0.4)', HEART('w')),
  xp: star(24, 25, 21, 9, 5, 'u'),
  rock: ROCK('m'),
  unknown: C(24, 24, 18, 'b') + P('M18 19a6 6 0 1 1 9 5c-2 1-3 2-3 5M24 35v1', 'n')
}

export const hasGlyph = (id: string): boolean => id in GLYPHS
