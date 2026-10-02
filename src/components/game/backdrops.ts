/**
 * ─── The screens' backdrops (D45) ────────────────────────────────────────────
 *
 * What lies behind the three big windows, drawn in code in the game's cel
 * style: a merchant's table for trade, an open satchel beside an armoury stand
 * for the equipment, a constellation board for the skills. One standalone SVG
 * each, 1376 × 768 (16:9), shown `cover`: a phone in portrait sees only the
 * middle quarter of the sheet, a desktop all of it.
 *
 * Each is exactly what `public/images/ui/bg-<name>.webp` replaces
 * (`UI_ART.get('bg-trade')`…) and what the art bench bakes as the painter's
 * reference (`bg-ui-trade`…), so nothing here moves and nothing is lettering.
 *
 * THE CONTENT-SAFE AREA. The interface lies over the MIDDLE of the sheet at
 * every size: the middle 44 % of the width (x 385 to 991) is always under
 * panels, sockets and lettering, and on a portrait phone it is all that is
 * seen. It stays calm: one surface, low contrast, no objects. The objects
 * (lantern, scales, rack, stand, constellations) live in the outer 28 % on
 * each side, and nothing important sits in the top 12 % (the title bar).
 */

export const BACKDROP_W = 1376
export const BACKDROP_H = 768
/** The calm middle, as fractions of the sheet's width. */
export const BACKDROP_SAFE: readonly [number, number] = [0.28, 0.72]

export type BackdropName = 'trade' | 'inventory' | 'skills'
export const BACKDROPS: readonly BackdropName[] = ['trade', 'inventory', 'skills']

const W = BACKDROP_W
const H = BACKDROP_H
const INK = '#1b1626'

// ── SVG shorthands ───────────────────────────────────────────────────────────
const round = ' stroke-linejoin="round" stroke-linecap="round"'
const n1 = (v: number): number => Math.round(v * 10) / 10
/** An ink-outlined shape. */
const S = (d: string, fill: string, sw = 5): string => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"${round}/>`
/** A flat shape, no outline (a shadow step, a lit band). */
const F = (d: string, fill: string, o = 1): string => `<path d="${d}" fill="${fill}"${o < 1 ? ` opacity="${o}"` : ''}/>`
const L = (d: string, stroke: string, sw: number, extra = ''): string => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}"${round}${extra}/>`
const R = (x: number, y: number, w: number, h: number, r: number, fill: string, sw = 5): string =>
  `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${r}" fill="${fill}"${sw ? ` stroke="${INK}" stroke-width="${sw}"${round}` : ''}/>`
const C = (cx: number, cy: number, r: number, fill: string, sw = 5, o = 1): string =>
  `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="${fill}"${sw ? ` stroke="${INK}" stroke-width="${sw}"` : ''}${o < 1 ? ` opacity="${o}"` : ''}/>`
const E = (cx: number, cy: number, rx: number, ry: number, fill: string, sw = 5, o = 1): string =>
  `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${fill}"${sw ? ` stroke="${INK}" stroke-width="${sw}"` : ''}${o < 1 ? ` opacity="${o}"` : ''}/>`
const G = (transform: string, inner: string): string => `<g transform="${transform}">${inner}</g>`

/** A small seeded generator, so a scatter is the same on every device. */
const seeded = (seed: number): (() => number) => {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** A four- or five-pointed star. */
const star = (cx: number, cy: number, r: number, inner: number, points: number, rot = -Math.PI / 2): string => {
  let d = ''
  for (let i = 0; i < points * 2; i++) {
    const a = rot + (i * Math.PI) / points
    const k = i % 2 ? inner : r
    d += `${i ? 'L' : 'M'}${n1(cx + Math.cos(a) * k)} ${n1(cy + Math.sin(a) * k)}`
  }
  return d + 'Z'
}

const wrap = (inner: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`

// ── Shared props ─────────────────────────────────────────────────────────────
const GOLD = { hi: '#ffe978', base: '#ffc526', lo: '#f09410', deep: '#9a5206' }
const BRASS = { hi: '#fff0a8', base: '#f4bb3a', lo: '#c47f1c', deep: '#7a4a0e' }
const STEEL = { hi: '#f4f8ff', base: '#c2cce6', lo: '#8792b8', deep: '#4c5580' }
const LEATHER = { hi: '#d99a56', base: '#b8743a', lo: '#8f5426', deep: '#5c3317' }
const PAPER = { hi: '#fff8e3', base: '#f8e9c4', lo: '#ecd3a0', deep: '#d9b87a' }

/** A coin lying flat, seen a little from above. */
const coin = (x: number, y: number, r = 20): string =>
  E(x, y + r * 0.22, r, r * 0.62, GOLD.deep, 4) + E(x, y, r, r * 0.62, GOLD.lo, 4) + E(x, y - r * 0.06, r * 0.66, r * 0.38, GOLD.hi, 0) +
  L(`M${n1(x - r * 0.62)} ${n1(y - r * 0.16)}q${n1(r * 0.2)} ${n1(-r * 0.3)} ${n1(r * 0.6)} ${n1(-r * 0.34)}`, '#ffffff', 3)

/** A stack of coins, `n` high. */
const coinStack = (x: number, y: number, n: number, r = 22): string => {
  let out = ''
  for (let i = 0; i < n; i++) out += E(x, y - i * r * 0.36 + r * 0.22, r, r * 0.6, i ? GOLD.lo : GOLD.deep, 4)
  return out + E(x, y - (n - 1) * r * 0.36, r, r * 0.6, GOLD.base, 4) + E(x, y - (n - 1) * r * 0.36 - r * 0.05, r * 0.64, r * 0.36, GOLD.hi, 0)
}

// ═════════════════════════════════════════════════════════════════════════════
// Trade: a merchant's table
// ═════════════════════════════════════════════════════════════════════════════
const TABLE = { hi: '#b47a48', base: '#a06a3c', lo: '#8a5730', seam: '#5c3317', knot: '#7a4a28' }
const CLOTH = { hi: '#2f8f96', base: '#25747e', lo: '#1d5f6a', deep: '#14454f' }

const tradeSvg = (): string => {
  const rnd = seeded(41)
  let s = `<rect width="${W}" height="${H}" fill="${TABLE.base}"/>`
  // The planks: six boards, alternating tone, a lit edge under each seam.
  const PH = H / 6
  for (let i = 0; i < 6; i++) {
    const y = i * PH
    if (i % 2) s += `<rect x="0" y="${n1(y)}" width="${W}" height="${n1(PH)}" fill="${TABLE.lo}"/>`
    s += `<rect x="0" y="${n1(y + 4)}" width="${W}" height="7" fill="${TABLE.hi}" opacity="0.55"/>`
    s += L(`M0 ${n1(y)}H${W}`, TABLE.seam, 5)
    // Where two boards meet end to end, and a knot or two.
    for (let k = 0; k < 3; k++) {
      const x = 60 + rnd() * (W - 120)
      s += L(`M${n1(x)} ${n1(y + 3)}v${n1(PH - 6)}`, TABLE.seam, 4)
    }
    for (let k = 0; k < 2; k++) {
      const x = 40 + rnd() * (W - 80)
      const ky = y + 34 + rnd() * (PH - 68)
      s += E(x, ky, 15, 8, TABLE.knot, 0) + E(x, ky, 7, 3.5, TABLE.seam, 0)
      s += L(`M${n1(x - 46)} ${n1(ky + 3)}q${46} ${-20} ${92} 0`, TABLE.knot, 3, ' opacity="0.7"')
    }
  }
  // The lantern's light: two hard steps on the boards.
  s += C(196, 214, 196, '#ffd98a', 0, 0.14) + C(196, 214, 160, '#ffe9a8', 0, 0.16)

  // The cloth: a runner down the middle of the table, where the deal is laid.
  const X0 = 372
  const X1 = W - 372
  s += `<rect x="${X0}" y="-6" width="${X1 - X0}" height="${H + 12}" fill="${CLOTH.base}" stroke="${INK}" stroke-width="5"/>`
  // A woven diamond, tone on tone: it must stay quiet under the interface.
  let weave = ''
  for (let y = -80; y < H + 80; y += 128) for (let x = X0 + 44; x < X1; x += 128) weave += `M${x + 64} ${y}l64 64-64 64-64-64z`
  s += `<clipPath id="tc"><rect x="${X0 + 34}" y="0" width="${X1 - X0 - 68}" height="${H}"/></clipPath>`
  s += `<g clip-path="url(#tc)">${F(weave, CLOTH.lo, 0.55)}</g>`
  s += `<rect x="${X0 + 3}" y="0" width="14" height="${H}" fill="${CLOTH.hi}" opacity="0.8"/>`
  // The gold border, a band inside each edge.
  for (const x of [X0 + 22, X1 - 36]) {
    s += `<rect x="${x}" y="-6" width="14" height="${H + 12}" fill="${GOLD.base}" stroke="${INK}" stroke-width="4"/>`
    s += `<rect x="${x + 3}" y="0" width="4" height="${H}" fill="${GOLD.hi}"/>`
  }
  // The shadow the cloth's edge throws on the boards.
  s += `<rect x="${X1 + 3}" y="0" width="12" height="${H}" fill="${TABLE.seam}" opacity="0.35"/>`

  // ── Left of the cloth: the lantern, the ledger, a little money ─────────────
  const lantern = [
    // The ring it is carried by.
    L('M-22 -108a22 22 0 0 1 44 0', BRASS.deep, 14), L('M-22 -108a22 22 0 0 1 44 0', BRASS.base, 6),
    // Cap, glass, base.
    S('M-46 -64l14-40h64l14 40z', BRASS.base), F('M-38 -68l10-30h28v30z', BRASS.hi),
    R(-52, -64, 104, 132, 14, '#ffe978'), R(-34, -48, 68, 100, 10, '#fff8e3', 0),
    S('M0 -20c16 18 22 30 22 44a22 22 0 0 1-44 0c0-10 6-18 12-26 2 8 6 10 10 12 2-12 0-20 0-30z', '#ff9838', 4),
    F('M0 12c7 8 10 14 10 20a10 10 0 0 1-20 0c0-8 6-12 10-20z', '#ffe978'),
    L('M-18 -62v128M18 -62v128', INK, 5),
    S('M-62 68h124l-12 30h-100z', BRASS.base), F('M-52 72h60l-4 10h-52z', BRASS.hi),
    S('M-72 98h144v16h-144z', BRASS.lo)
  ].join('')
  s += E(196, 336, 96, 20, TABLE.seam, 0, 0.4) + G('translate(196 214)', lantern)

  // The ledger, open, a quill across it.
  const ledger = [
    S('M-150 -92h300v188h-300z', LEATHER.base, 6), F('M-150 -92h300v20h-300z', LEATHER.hi),
    S('M-136 -80h132v164h-132z', PAPER.base, 4), S('M4 -80h132v164h-132z', PAPER.hi, 4),
    L('M0 -84v172', LEATHER.deep, 6),
    L('M-118 -52h92M-118 -26h100M-118 0h76M-118 26h96M-118 52h60', PAPER.deep, 6),
    L('M22 -52h96M22 -26h70M22 0h92M22 26h54', PAPER.deep, 6),
    S('M-12 84l10 34 10-34z', '#ff5a4f', 4),
    // The quill.
    S('M150 -128c-44 6-86 40-112 96l-22 50 46-30c52-30 80-70 88-116z', '#f4f8ff', 5),
    L('M16 18l122 -140', STEEL.lo, 4), S('M16 18l-14 26 24-18z', INK, 3)
  ].join('')
  s += G('translate(196 612) rotate(-7)', ledger)
  s += coinStack(76, 456, 4) + coinStack(126, 474, 2) + coin(318, 470, 18) + coin(300, 128, 17) + coin(60, 716, 18)

  // ── Right of the cloth: the scales, a purse, weights ───────────────────────
  const pan = (x: number, y: number, load: string): string =>
    L(`M${x} ${y - 132}L${x - 54} ${y}M${x} ${y - 132}L${x + 54} ${y}M${x} ${y - 132}V${y}`, BRASS.deep, 4) +
    load + S(`M${x - 66} ${y}h132c0 30-28 44-66 44s-66-14-66-44z`, BRASS.base) + F(`M${x - 54} ${y + 5}h60c-4 16-24 24-44 22-10-4-16-12-16-22z`, BRASS.hi) +
    E(x, y, 66, 10, BRASS.lo, 5)
  const scales = [
    // Base and post.
    E(0, 250, 110, 22, TABLE.seam, 0, 0.4),
    S('M-86 236h172l-16-30h-140z', BRASS.base), F('M-66 212h70l-4 12h-74z', BRASS.hi),
    R(-11, -86, 22, 296, 8, BRASS.base), R(-7, -80, 7, 284, 3, BRASS.hi, 0),
    // The beam, tipped a little by the gold.
    G('rotate(-5)', R(-170, -100, 340, 20, 10, BRASS.base) + R(-160, -97, 320, 6, 3, BRASS.hi, 0) + C(-166, -90, 13, BRASS.lo) + C(166, -90, 13, BRASS.lo)),
    C(0, -92, 24, BRASS.base), C(0, -92, 10, '#ff5a4f', 4),
    S('M-12 -118l12-34 12 34z', BRASS.hi, 4),
    pan(-166, 72, coin(-178, 60, 17) + coin(-152, 56, 17) + coin(-166, 46, 17)),
    pan(166, 44, R(148, 12, 36, 32, 6, STEEL.base, 4) + R(158, 2, 16, 12, 4, STEEL.lo, 4))
  ].join('')
  s += G('translate(1198 300) scale(0.82)', scales)

  // The purse, untied, coins spilling toward the cloth.
  const purse = [
    E(0, 96, 104, 20, TABLE.seam, 0, 0.4),
    S('M-70 -20c-34 34-44 74-22 100 22 22 162 22 184 0 22-26 12-66-22-100z', LEATHER.base, 6),
    F('M-62 -8c-22 26-28 50-18 70 14-34 40-56 80-66z', LEATHER.hi),
    F('M-76 74c26 16 150 16 176 0-8 16-40 24-88 24s-80-8-88-24z', LEATHER.lo),
    S('M-78 -28c20-28 136-28 156 0l-14 22h-128z', LEATHER.lo, 6),
    L('M-66 -12h132', GOLD.base, 9), L('M-66 -12h132', GOLD.hi, 3),
    S('M44 -12l40 34-10 8-36-34z', GOLD.base, 4)
  ].join('')
  s += G('translate(1190 614)', purse)
  s += coin(1060, 690, 20) + coin(1024, 640, 17) + coin(1092, 726, 16) + coinStack(1316, 716, 3, 20) + coin(1330, 124, 16)
  // Three little weights in a row.
  for (const [i, k] of [1, 0.8, 0.62].entries()) {
    const x = 1066 + i * 54
    s += G(`translate(${x} 96) scale(${k})`, S('M-22 26h44l-6-40h-32z', STEEL.base, 5) + F('M-14 20h14l-2-28h-8z', STEEL.hi) + R(-9, -30, 18, 16, 5, STEEL.lo, 5))
  }
  return wrap(s)
}

// ═════════════════════════════════════════════════════════════════════════════
// Equipment: an open satchel beside the armoury stand
// ═════════════════════════════════════════════════════════════════════════════
const LINING = { hi: '#3f7d70', base: '#33695f', lo: '#2b594f', deep: '#1f4039' }
const WOOD = { hi: '#b47a48', base: '#96643c', lo: '#7a4a28', deep: '#5c3317' }

const inventorySvg = (): string => {
  let s = `<rect width="${W}" height="${H}" fill="${LINING.base}"/>`
  // The lining: a quilted diamond, tone on tone.
  let quilt = ''
  for (let x = -H; x < W + H; x += 112) quilt += `M${x} 0l${H} ${H}M${x} ${H}l${H} ${-H}`
  s += L(quilt, LINING.lo, 5)
  let studs = ''
  for (let y = 0; y <= H; y += 56) for (let x = (y / 56) % 2 ? 56 : 0; x <= W; x += 112) studs += `<circle cx="${x}" cy="${y}" r="5" fill="${LINING.hi}"/>`
  s += studs
  // The lit middle of the open bag: two hard steps.
  s += E(W / 2, H / 2 + 20, 520, 330, LINING.hi, 0, 0.22) + E(W / 2, H / 2 + 20, 330, 220, LINING.hi, 0, 0.2)

  // The leather rim: lit along the top, in shadow along the foot, stitched.
  const RIM = 44
  s += `<path fill-rule="evenodd" d="M0 0h${W}v${H}h${-W}zM${RIM} ${RIM + 30}a30 30 0 0 1 30-30h${W - RIM * 2 - 60}a30 30 0 0 1 30 30v${H - RIM * 2 - 60}a30 30 0 0 1-30 30h${-(W - RIM * 2 - 60)}a30 30 0 0 1-30-30z" fill="${LEATHER.base}"/>`
  s += `<rect x="0" y="0" width="${W}" height="16" fill="${LEATHER.hi}"/>`
  s += `<rect x="0" y="${H - 18}" width="${W}" height="18" fill="${LEATHER.lo}"/>`
  s += `<rect x="${RIM}" y="${RIM}" width="${W - RIM * 2}" height="${H - RIM * 2}" rx="30" fill="none" stroke="${INK}" stroke-width="6"/>`
  s += `<rect x="${RIM / 2}" y="${RIM / 2}" width="${W - RIM}" height="${H - RIM}" rx="14" fill="none" stroke="#ffe2a8" stroke-width="4" stroke-dasharray="16 12" stroke-linecap="round"/>`
  // The rim's shadow on the lining.
  s += `<rect x="${RIM + 6}" y="${RIM + 6}" width="${W - RIM * 2 - 12}" height="${H - RIM * 2 - 12}" rx="26" fill="none" stroke="${LINING.deep}" stroke-width="10" opacity="0.45"/>`

  // Two straps over the rim, each with a buckle.
  for (const x of [214, W - 214]) {
    const strap = [
      S('M-36 -10h72v176c0 14-16 24-36 24s-36-10-36-24z', LEATHER.lo, 6), F('M-28 -4h16v168h-16z', LEATHER.base),
      L('M0 20v16M0 132v16', LEATHER.deep, 6),
      R(-46, 60, 92, 56, 12, BRASS.base, 6), R(-28, 74, 56, 28, 6, LEATHER.deep, 5), R(-38, 64, 40, 8, 4, BRASS.hi, 0),
      R(-5, 70, 10, 38, 4, BRASS.lo, 4)
    ].join('')
    s += G(`translate(${x} 0)`, strap)
  }

  // ── Left: the weapon rack ─────────────────────────────────────────────────
  const rack = [
    E(0, 252, 150, 18, LINING.deep, 0, 0.5),
    // Two posts and two rails.
    R(-128, -210, 26, 462, 8, WOOD.base, 6), R(102, -210, 26, 462, 8, WOOD.base, 6),
    R(-122, -204, 8, 450, 4, WOOD.hi, 0), R(108, -204, 8, 450, 4, WOOD.hi, 0),
    R(-150, -170, 300, 28, 10, WOOD.lo, 6), R(-150, 96, 300, 28, 10, WOOD.lo, 6), R(-142, -166, 284, 7, 3, WOOD.base, 0),
    // A sword, point down.
    G('translate(-62 -30)', [
      S('M-15 -92h30v170l-15 26-15-26z', STEEL.base), F('M-9 -86h9v170l-9-14z', STEEL.hi),
      R(-40, -112, 80, 22, 8, GOLD.base), R(-11, -160, 22, 50, 6, LEATHER.deep), C(0, -170, 15, GOLD.base), C(-4, -174, 4, GOLD.hi, 0)
    ].join('')),
    // An axe.
    G('translate(40 -20)', [
      R(-9, -150, 18, 250, 6, WOOD.hi, 5),
      S('M9 -138c44-12 74 10 80 52-20 28-50 38-80 28z', STEEL.base), F('M17 -128c26-6 46 4 54 22-18-8-36-8-54-2z', STEEL.hi),
      S('M-9 -132c-22-4-36 6-42 24 12 16 26 22 42 22z', STEEL.lo)
    ].join('')),
    // A round shield at the foot.
    G('translate(-10 176)', C(0, 0, 78, '#3fa4ff', 6) + F('M-58 -34a66 66 0 0 1 116 0c-36-18-80-18-116 0z', '#8fdcff') + C(0, 0, 78, 'none', 6) + C(0, 0, 58, 'none', 4) + C(0, 0, 22, BRASS.base, 5) + C(-6, -6, 6, BRASS.hi, 0) + L('M0 -58v36M0 22v36M-58 0h36M22 0h36', '#2470e8', 6))
  ].join('')
  s += G('translate(206 420)', rack)

  // ── Right: the armour stand ───────────────────────────────────────────────
  const stand = [
    E(0, 268, 140, 18, LINING.deep, 0, 0.5),
    // Foot, post, shoulder bar.
    S('M-96 262h192l-22-34h-148z', WOOD.lo, 6), R(-14, -150, 28, 384, 8, WOOD.base, 6), R(-8, -144, 8, 372, 4, WOOD.hi, 0),
    R(-120, -74, 240, 26, 12, WOOD.base, 6),
    // The breastplate hung on it.
    S('M-104 -70c34 10 70-2 104-22 34 20 70 32 104 22l-12 60-20 12v104c0 22-32 40-72 40s-72-18-72-40v-104l-20-12z', STEEL.base, 6),
    F('M-88 -56c26 4 54-4 80-18v52c-22 12-48 18-72 12z', STEEL.hi),
    F('M-72 112c20 20 124 20 144 0v-18c-20 18-124 18-144 0z', STEEL.lo),
    L('M0 -88v230', STEEL.deep, 5), C(0, 6, 15, GOLD.base, 5), C(-4, 2, 4.5, GOLD.hi, 0),
    L('M-72 60h144', STEEL.deep, 5),
    // The helmet on top.
    S('M-58 -150c0-52 26-86 58-86s58 34 58 86l-10 24h-96z', STEEL.base, 6), F('M-44 -156c0-40 16-64 38-70v70z', STEEL.hi),
    S('M-66 -152h132v22h-132z', STEEL.lo, 6), L('M0 -236v84', STEEL.deep, 5),
    S('M-6 -236c4-36 40-50 70-34-30 6-44 18-48 34z', '#ff5a4f', 5)
  ].join('')
  s += G('translate(1172 410)', stand)

  // A few things loose in the bag's corners.
  s += G('translate(96 700) rotate(-12)', S('M-20 -6h40l-4-26h-32z', '#f4f8ff', 5) + S('M-28 -6c-12 12-16 28-8 40 8 10 64 10 72 0 8-12 4-28-8-40z', '#ff5a4f', 5) + F('M-20 2c-8 10-10 18-6 26 6-14 16-22 30-26z', '#ffa08f') + R(-14, -44, 28, 14, 5, LEATHER.base, 5))
  s += coin(1320, 690, 18) + coin(1286, 716, 15) + coin(352, 706, 16)
  return wrap(s)
}

// ═════════════════════════════════════════════════════════════════════════════
// Skills: a constellation board in a codex
// ═════════════════════════════════════════════════════════════════════════════
const NIGHT = { hi: '#3d3270', base: '#2b2352', lo: '#221b44', deep: '#171230' }
/** The eight class colours (`CLASSES` in data/skills.ts), as gems on the frame. */
const GEMS = ['#ffd84a', '#9c7bff', '#ff7a3a', '#ffb04a', '#5fd8ff', '#ff4a6a', '#4ff0c8', '#c79a5a']

/** A constellation: stars joined by lines. */
const constellation = (pts: ReadonlyArray<readonly [number, number, number?]>, links: ReadonlyArray<readonly [number, number]>, tint: string): string => {
  let out = ''
  for (const [a, b] of links) out += L(`M${pts[a]![0]} ${pts[a]![1]}L${pts[b]![0]} ${pts[b]![1]}`, tint, 4, ' stroke-dasharray="2 12" opacity="0.9"')
  for (const [x, y, r = 11] of pts) out += `<path d="${star(x, y, r + 6, (r + 6) * 0.4, 4)}" fill="${INK}"/>` + `<path d="${star(x, y, r, r * 0.4, 4)}" fill="${tint}"/>` + C(x, y, r * 0.26, '#ffffff', 0)
  return out
}

const skillsSvg = (): string => {
  const rnd = seeded(7)
  let s = `<rect width="${W}" height="${H}" fill="${NIGHT.lo}"/>`
  // The sky, lit in two hard steps toward the middle.
  s += E(W / 2, H / 2 + 10, 620, 400, NIGHT.base, 0) + E(W / 2, H / 2 + 10, 400, 270, NIGHT.hi, 0, 0.45)
  // The astrolabe: quiet rings and ticks behind the loadout.
  const cx = W / 2
  const cy = H / 2 + 10
  let ticks = ''
  for (let i = 0; i < 48; i++) {
    const a = (i * Math.PI * 2) / 48
    const r0 = i % 4 ? 318 : 306
    ticks += `M${n1(cx + Math.cos(a) * r0)} ${n1(cy + Math.sin(a) * r0)}L${n1(cx + Math.cos(a) * 332)} ${n1(cy + Math.sin(a) * 332)}`
  }
  s += `<g opacity="0.5"><circle cx="${cx}" cy="${n1(cy)}" r="332" fill="none" stroke="#5a4c96" stroke-width="4"/><circle cx="${cx}" cy="${n1(cy)}" r="236" fill="none" stroke="#5a4c96" stroke-width="3" stroke-dasharray="4 14" stroke-linecap="round"/><circle cx="${cx}" cy="${n1(cy)}" r="140" fill="none" stroke="#5a4c96" stroke-width="3"/>${L(ticks, '#5a4c96', 3)}</g>`

  // The far stars: many small ones at the sides, few and faint in the middle.
  let far = ''
  for (let i = 0; i < 150; i++) {
    const x = rnd() * W
    const y = 70 + rnd() * (H - 120)
    const mid = x > W * BACKDROP_SAFE[0] && x < W * BACKDROP_SAFE[1]
    const r = 1.6 + rnd() * (mid ? 1.6 : 3.4)
    const tint = rnd() < 0.2 ? '#ffe978' : rnd() < 0.3 ? '#8fdcff' : '#ffffff'
    far += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="${tint}" opacity="${mid ? 0.28 : 0.8}"/>`
  }
  s += far

  // Constellations, left and right: a blade, a flame; a shield, an hourglass.
  s += constellation([[150, 150, 13], [176, 236], [202, 322], [228, 408, 13], [150, 356], [300, 370], [246, 474]], [[0, 1], [1, 2], [2, 3], [4, 3], [3, 5], [3, 6]], '#8fdcff')
  s += constellation([[176, 560, 12], [120, 628], [150, 700, 13], [236, 706], [270, 636], [214, 610]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [5, 2]], '#ff9838')
  s += constellation([[1130, 140, 13], [1250, 150], [1262, 250], [1190, 322, 13], [1118, 246]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]], '#ffe978')
  s += constellation([[1120, 470, 12], [1236, 470], [1178, 566, 13], [1118, 664], [1240, 664, 12]], [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4]], '#deb3ff')
  // Two shooting stars, far out.
  s += L('M330 110l-70 30', '#ffffff', 4, ' opacity="0.7"') + `<path d="${star(336, 108, 10, 4, 4)}" fill="#ffffff"/>`
  s += L('M1040 690l60-34', '#ffffff', 4, ' opacity="0.7"') + `<path d="${star(1034, 694, 9, 3.6, 4)}" fill="#ffffff"/>`

  // The codex's frame: a brass rule with a turned corner and the eight class gems.
  const M = 26
  s += `<rect x="${M}" y="${M}" width="${W - M * 2}" height="${H - M * 2}" rx="26" fill="none" stroke="${INK}" stroke-width="14"/>`
  s += `<rect x="${M}" y="${M}" width="${W - M * 2}" height="${H - M * 2}" rx="26" fill="none" stroke="${BRASS.base}" stroke-width="7"/>`
  s += `<rect x="${M + 16}" y="${M + 16}" width="${W - M * 2 - 32}" height="${H - M * 2 - 32}" rx="14" fill="none" stroke="${BRASS.lo}" stroke-width="3" stroke-dasharray="3 10" stroke-linecap="round"/>`
  for (const [x, y, sx, sy] of [[M, M, 1, 1], [W - M, M, -1, 1], [M, H - M, 1, -1], [W - M, H - M, -1, -1]] as const) {
    s += G(`translate(${x} ${y}) scale(${sx} ${sy})`, S('M-6 70c0-46 30-76 76-76', 'none', 14) + L('M-6 70c0-46 30-76 76-76', BRASS.base, 7) + L('M18 86c0-40 28-68 68-68', BRASS.hi, 4) + C(26, 26, 13, BRASS.base, 5) + C(22, 22, 4, BRASS.hi, 0))
  }
  for (const [i, tint] of GEMS.entries()) {
    const left = i < 4
    const x = left ? M : W - M
    const y = 168 + (i % 4) * 144
    s += G(`translate(${x} ${y})`, S('M0 -24l18 24-18 24-18-24z', tint, 5) + F('M0 -24l-18 24h18z', '#ffffff', 0.45))
  }
  return wrap(s)
}

const BUILDERS: Record<BackdropName, () => string> = { trade: tradeSvg, inventory: inventorySvg, skills: skillsSvg }
const cache: Partial<Record<BackdropName, string>> = {}

/** The drawn backdrop, as one standalone SVG document. */
export const backdropSvg = (name: BackdropName): string => (cache[name] ??= BUILDERS[name]())
