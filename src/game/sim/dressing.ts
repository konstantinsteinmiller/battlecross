import type { ZoneShape } from '../data/zones'
import { CELL } from './grid'
import type { Chamber, Fixture } from './layouts'
import type { Rng } from './rng'
import { K_GROUND, K_BLOCK, K_CLIFF, K_RAMP, K_WATER } from './zoneFeatures'

/**
 * ─── Set pieces: what makes a place look lived in (roadmap #120) ─────────────
 *
 * Each zone dresses its layout with things of its own: the goblins' beds,
 * fires and banners in the Hollows, windmills on the Oakhaven fields, a
 * temple's colonnades, the timbers and carts of the mines, a citadel's
 * pylons, a fortress's gate towers, boulders in the lava of the Crags.
 *
 * A piece that stands in the way has a footprint of whole cells, and each of
 * those becomes a block (`K_BLOCK`): walked round, seen and shot over, like
 * a chest. A piece that lies flat or stands where nobody walks (a club by a
 * bed, a floe on the lake, a timber frame against a tunnel's walls) has none.
 *
 * Nothing a piece stands on may cut anything off: every piece is laid in a
 * transaction that walks the plan again and takes the piece back if a single
 * cell it did not stand on is now out of reach (doors shut, and open).
 *
 * Pure and seeded (the caller's stream): the sim blocks the cells, the view
 * (`gfx/setPieces.ts`) draws the pieces.
 */

export type DressKind =
  // The Hollows: the goblins live here.
  | 'bed' | 'fire' | 'banner' | 'club' | 'tent'
  // The Oakhaven fields.
  | 'mill' | 'scarecrow'
  // The Sunken Temple.
  | 'column' | 'brokenColumn' | 'rubble'
  // Rock: a boulder to fight round; one standing in the lava.
  | 'boulder' | 'lavaRock'
  // The Whisperwood: its giants, its fallen trunks, mist lying in patches and
  // the bloody marks of claws on the ground (both drawn as decals: nothing to walk round).
  | 'log' | 'oldTree' | 'mist' | 'claws'
  // The mines.
  | 'timber' | 'rail' | 'cart' | 'crates'
  // The tundra's lake.
  | 'floe'
  // The citadel, the fortress, the rift.
  | 'pylon' | 'gateTower' | 'warBanner' | 'shard'
  // An invaded zone (the afterplay): a burning ruin, and a rift scar on the
  // ground (a decal: nothing to walk round, but it slows and burns).
  | 'ruin' | 'scar'
  // The first visit's camp (#156): the teachers' broken-down caravan.
  | 'wagon'

export interface DressPlan {
  kind: DressKind
  /** Centre (metres) and turn (radians, 0: its length runs along +Z). */
  x: number
  z: number
  a: number
  /** The cells it blocks (none: it is walked over, or stands in rock or water). */
  cells: number[]
}

/** Cells across and along (before its turn) that a piece blocks; [0, 0]: none. */
export const DRESS_FOOT: Readonly<Record<DressKind, readonly [number, number]>> = {
  bed: [1, 2], fire: [1, 1], banner: [1, 1], club: [0, 0], tent: [2, 2],
  mill: [3, 3], scarecrow: [1, 1],
  column: [1, 1], brokenColumn: [1, 1], rubble: [1, 1],
  boulder: [1, 1], lavaRock: [0, 0],
  log: [1, 3], oldTree: [2, 2], mist: [0, 0], claws: [0, 0],
  timber: [0, 0], rail: [0, 0], cart: [1, 1], crates: [1, 1],
  floe: [0, 0],
  pylon: [1, 1], gateTower: [0, 0], warBanner: [1, 1], shard: [0, 0],
  ruin: [1, 1], scar: [0, 0],
  wagon: [2, 3]
}

/**
 * What each piece is to a walking body (`gfx/propRoles.ts`): SOLID stands in
 * the way, and what it covers of the ground lies on blocked cells (its own
 * footprint's, or the rock, water or wall it stands in); WALK lies flat or is
 * walked over. A new kind is not drawn until it says which.
 */
export const DRESS_ROLE: Readonly<Record<DressKind, 'solid' | 'walk'>> = {
  bed: 'solid', fire: 'solid', banner: 'solid', club: 'walk', tent: 'solid',
  mill: 'solid', scarecrow: 'solid',
  column: 'solid', brokenColumn: 'solid', rubble: 'solid',
  boulder: 'solid', lavaRock: 'solid',
  log: 'solid', oldTree: 'solid', mist: 'walk', claws: 'walk',
  timber: 'solid', rail: 'walk', cart: 'solid', crates: 'solid',
  floe: 'walk',
  pylon: 'solid', gateTower: 'solid', warBanner: 'solid', shard: 'solid',
  ruin: 'solid', scar: 'walk',
  wagon: 'solid'
}

/** Tall pieces: never just in front of (down-screen of) a chest or a side place. */
export const DRESS_TALL: ReadonlySet<DressKind> = new Set<DressKind>(['mill', 'tent', 'oldTree', 'column', 'pylon', 'gateTower'])

export interface DressCtx {
  w: number
  h: number
  solid: Uint8Array
  trail: Uint8Array
  kind: Uint8Array
  sealed: Uint8Array
  side: Uint8Array
  start: { i: number; j: number }
  /** Places that stay clear, each with how many cells round it: a chest's
   *  spot and its spill, a plate, the hint stone, a pack's ring. */
  keep: Array<{ x: number; z: number; r: number; pack?: boolean }>
  /** Chests (metres): nothing tall stands just in front of one. */
  chests: ReadonlyArray<{ x: number; z: number }>
}

export interface Dresser {
  readonly pieces: DressPlan[]
  /**
   * Stand a piece with a footprint whose low corner is cell (i0, j0) (turned
   * a quarter when `a` is), `clear` cells off the road. False (and nothing
   * changed) where it does not fit or would cut anything off.
   */
  stand(kind: DressKind, i0: number, j0: number, a: number, o?: { clear?: number; byPack?: boolean }): boolean
  /** A piece that blocks nothing (or stands in rock), as it is. */
  lay(kind: DressKind, x: number, z: number, a: number): void
  /** Is the cell open ground a piece could stand on? */
  free(i: number, j: number, clear?: number, byPack?: boolean): boolean
}

export const makeDresser = (c: DressCtx): Dresser => {
  const { w, h, solid, trail, kind, sealed, side } = c
  const pieces: DressPlan[] = []
  const walk = (k: number, doorsOpen: boolean): boolean =>
    !solid[k] && kind[k] !== K_WATER && kind[k] !== K_BLOCK && kind[k] !== K_CLIFF && (doorsOpen || !sealed[k])
  const queue = new Int32Array(w * h)
  const startK = c.start.j * w + c.start.i
  const anySealed = sealed.some(v => v > 0)
  /** How many cells can be walked to from the start, as the pathfinder walks (no cut corners). */
  const reach = (doorsOpen: boolean): number => {
    if (!walk(startK, doorsOpen)) return 0
    const seen = new Uint8Array(w * h)
    let head = 0
    let tail = 0
    queue[tail++] = startK
    seen[startK] = 1
    while (head < tail) {
      const k = queue[head++]!
      const i = k % w
      const j = (k - i) / w
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue
          const ni = i + di
          const nj = j + dj
          if (ni < 0 || nj < 0 || ni >= w || nj >= h) continue
          const nk = nj * w + ni
          if (seen[nk] || !walk(nk, doorsOpen)) continue
          if (di && dj && (!walk(j * w + ni, doorsOpen) || !walk(nj * w + i, doorsOpen))) continue
          seen[nk] = 1
          queue[tail++] = nk
        }
      }
    }
    return tail
  }
  let shut = reach(false)
  let open = anySealed ? reach(true) : shut
  const free = (i: number, j: number, clear = 1, byPack = false): boolean => {
    if (i < 3 || j < 3 || i >= w - 3 || j >= h - 3) return false
    const k = j * w + i
    if (solid[k] || kind[k] !== K_GROUND || sealed[k] || trail[k]) return false
    if (Math.abs(i - c.start.i) <= 2 && Math.abs(j - c.start.j) <= 2) return false
    for (let dj = -clear; dj <= clear; dj++) for (let di = -clear; di <= clear; di++) if (trail[(j + dj) * w + i + di]) return false
    // Off a ledge's edge and its ramp (a pad would level the step away), and
    // a cell back from the water's bank.
    for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) {
      const kd = kind[(j + dj) * w + i + di]
      if (kd === K_CLIFF || kd === K_RAMP) return false
      if (Math.abs(di) <= 1 && Math.abs(dj) <= 1 && kd !== K_GROUND && kd !== K_BLOCK) return false
    }
    const x = (i + 0.5) * CELL
    const z = (j + 0.5) * CELL
    for (const p of c.keep) if (!(byPack && p.pack) && Math.hypot(p.x - x, p.z - z) < p.r * CELL) return false
    return true
  }
  const stand: Dresser['stand'] = (kd, i0, j0, a, o = {}) => {
    const turned = Math.abs(Math.sin(a)) > 0.5
    const [fa, fb] = DRESS_FOOT[kd]
    const fw = turned ? fb : fa
    const fd = turned ? fa : fb
    const cells: number[] = []
    for (let j = j0; j < j0 + fd; j++) {
      for (let i = i0; i < i0 + fw; i++) {
        if (!free(i, j, o.clear ?? 1, o.byPack)) return false
        cells.push(j * w + i)
      }
    }
    const x = (i0 + fw / 2) * CELL
    const z = (j0 + fd / 2) * CELL
    if (DRESS_TALL.has(kd)) {
      // A tall piece never stands in the rows just in front of a chest or a
      // side place: the fixed camera would lose it behind it.
      for (const ch of c.chests) if (Math.abs(ch.x - x) < (fw / 2 + 2) * CELL && z - ch.z > 0 && z - ch.z < (fd / 2 + 4) * CELL) return false
      for (let j = j0 - 4; j < j0; j++) for (let i = i0 - 2; i < i0 + fw + 2; i++) if (j >= 0 && i >= 0 && i < w && side[j * w + i]) return false
    }
    // The transaction: block, walk again, and take it back if anything else fell out of reach.
    const was = cells.map(k => kind[k]!)
    for (const k of cells) kind[k] = K_BLOCK
    const s = reach(false)
    const op = anySealed ? reach(true) : s
    if (s !== shut - cells.length || op !== open - cells.length) {
      cells.forEach((k, q) => { kind[k] = was[q]! })
      return false
    }
    shut = s
    open = op
    pieces.push({ kind: kd, x, z, a, cells })
    return true
  }
  const lay: Dresser['lay'] = (kd, x, z, a) => { pieces.push({ kind: kd, x, z, a, cells: [] }) }
  return { pieces, stand, lay, free }
}

// ─── What each place is dressed with ─────────────────────────────────────────

export interface PlaceCtx {
  shape: ZoneShape
  rng: Rng
  w: number
  kind: Uint8Array
  /** The main clearings (cells): 0 the start, the last the finale. */
  cs: ReadonlyArray<{ i: number; j: number; r: number }>
  chambers: ReadonlyArray<Chamber | null>
  /** What the layout built in (`layouts.ts`). */
  fixtures: ReadonlyArray<Fixture>
  /** An invaded zone (`data/invasion.ts`): burning ruins per clearing and rift scars per visit. */
  invasion?: { ruins: readonly [number, number]; scars: readonly [number, number] }
}

const QUARTER = Math.PI / 2

/** Dress a place the way it is lived in or built. */
export const dressPlace = (d: Dresser, c: PlaceCtx): void => {
  const { rng, cs } = c
  const n = cs.length - 1
  const cx = (i: number): number => (i + 0.5) * CELL
  /** Up to `count` tries round clearing `k`, `r0`..`r1` of its radius out. */
  const round = (k: number, r0: number, r1: number, tries: number, fn: (i: number, j: number, a: number) => boolean): boolean => {
    const p = cs[k]!
    for (let t = 0; t < tries; t++) {
      const a = rng() * Math.PI * 2
      const r = p.r * (r0 + rng() * (r1 - r0))
      if (fn(Math.round(p.i + Math.cos(a) * r), Math.round(p.j + Math.sin(a) * r), a)) return true
    }
    return false
  }
  // Pieces the layout built in come first: they are the place's bones.
  for (const f of c.fixtures) {
    if (DRESS_FOOT[f.kind][0]) d.stand(f.kind, Math.round(f.i), Math.round(f.j), f.a)
    else d.lay(f.kind, cx(f.i), cx(f.j), f.a)
  }
  switch (c.shape) {
    case 'camp': {
      // The goblins live here: in every hollow a fire with the pack round
      // it, beds of straw by the walls with a club beside each, a tent, and
      // their banners where the road comes in.
      for (let k = 0; k <= n; k++) {
        const p = cs[k]!
        const den = k > 0 && k < n
        if (den && !round(k, 0.35, 0.55, 16, (i, j) => d.stand('fire', i, j, 0, { clear: 0, byPack: true }))) round(k, 0.15, 0.8, 40, (i, j) => d.stand('fire', i, j, 0, { clear: 0, byPack: true }))
        const beds = k === 0 ? 0 : k === n ? 1 : 2 + Math.floor(rng() * 2)
        for (let q = 0; q < beds; q++) {
          round(k, 0.7, 0.95, 14, (i, j, a) => {
            // Along the wall: its length runs round the hollow.
            const turn = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? 0 : QUARTER
            if (!d.stand('bed', i, j, turn)) return false
            const b = d.pieces[d.pieces.length - 1]!
            // The club lies by the bed, on the side toward the middle.
            const ox = Math.sign(p.i - i) * (turn ? 0 : 1)
            const oz = Math.sign(p.j - j) * (turn ? 1 : 0)
            d.lay('club', b.x + ox * 1.05, b.z + oz * 1.05, rng() * Math.PI * 2)
            return true
          })
        }
        if (den && rng() < 0.7) round(k, 0.7, 0.95, 10, (i, j) => d.stand('tent', i, j, 0))
        // Banners where the road comes into the hollow (and out of the start).
        const banners = k === 0 ? 2 : k === n ? 4 : 2
        for (let q = 0; q < banners; q++) round(k, 0.55, 1, 16, (i, j) => d.stand('banner', i, j, 0, { clear: 0 }))
      }
      break
    }
    case 'glades': {
      // A giant of a tree in each glade and trunks fallen at its edge.
      for (let k = 0; k <= n; k++) {
        if (k > 0 && !round(k, 0.55, 0.85, 14, (i, j) => d.stand('oldTree', i, j, 0))) round(k, 0.4, 1.05, 30, (i, j) => d.stand('oldTree', i, j, 0))
        const logs = k === 0 ? 1 : 1 + Math.floor(rng() * 2)
        for (let q = 0; q < logs; q++) round(k, 0.7, 1, 14, (i, j, a) => d.stand('log', i, j, Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? 0 : QUARTER))
        // Mist lying in the glade, here and there.
        if (rng() < 0.7) round(k, 0.2, 0.9, 10, (i, j) => { if (c.kind[j * c.w + i] !== K_GROUND) return false; d.lay('mist', cx(i), cx(j), rng() * Math.PI * 2); return true })
        // Something with claws came through: its marks, bloody, on open ground.
        if (k > 0) for (let q = 0; q < 2; q++) round(k, 0.3, 1, 10, (i, j) => { if (!d.free(i, j, 0)) return false; d.lay('claws', cx(i) + (rng() - 0.5), cx(j) + (rng() - 0.5), rng() * Math.PI * 2); return true })
      }
      break
    }
    case 'field': {
      // A windmill or two among the fields, a scarecrow in the wheat.
      const mills = 1 + Math.floor(rng() * 2)
      let built = 0
      const order = Array.from({ length: n - 1 }, (_, q) => q + 1).sort(() => rng() - 0.5)
      for (const k of order) {
        if (built >= mills) break
        if (round(k, 0.45, 1, 40, (i, j) => d.stand('mill', i - 1, j - 1, 0))) built++
      }
      // Never a field without one: then any field, and nearer the paths.
      for (const k of [...order, n]) {
        if (built > 0) break
        if (round(k, 0.3, 1.1, 60, (i, j) => d.stand('mill', i - 1, j - 1, 0, { clear: 0 }))) built++
      }
      for (let k = 1; k < n; k++) if (rng() < 0.7) round(k, 0.5, 0.9, 10, (i, j) => d.stand('scarecrow', i, j, 0))
      break
    }
    case 'strips': {
      // Black boulders on the finale's crust.
      for (let q = 0; q < 3; q++) round(n, 0.55, 0.85, 10, (i, j) => d.stand('boulder', i, j, 0))
      break
    }
    case 'galleries': {
      // A cart and a stack of crates in each gallery, against its wall.
      for (let k = 1; k <= n; k++) {
        const g = c.chambers[k]
        if (!g) continue
        const wall = (kd: DressKind): void => {
          for (let t = 0; t < 14; t++) {
            const top = rng() < 0.5
            const i = Math.round(g.i0 + 1 + rng() * (g.i1 - g.i0 - 2))
            if (d.stand(kd, i, top ? g.j0 + 1 : g.j1 - 1, 0)) return
          }
        }
        wall('cart')
        wall('crates')
        if (k < n) wall('crates')
      }
      break
    }
    case 'ring': {
      // Floes adrift on the frozen lake; frost-split boulders on its shore.
      for (let k = 0; k < c.kind.length; k++) {
        if (c.kind[k] !== K_WATER || rng() > 0.05) continue
        const i = k % c.w
        d.lay('floe', cx(i + (rng() - 0.5) * 0.4), cx((k - i) / c.w + (rng() - 0.5) * 0.4), rng() * Math.PI * 2)
      }
      for (let k = 1; k < n; k++) round(k, 0.65, 0.95, 10, (i, j) => d.stand('boulder', i, j, 0))
      break
    }
    case 'rooms': {
      // Fallen drums and blocks in the chambers.
      for (let k = 1; k <= n; k++) for (let q = 0; q < 2; q++) round(k, 0.5, 0.9, 10, (i, j) => d.stand('rubble', i, j, 0))
      break
    }
    case 'castle': {
      // The fortress's colours along the walls of each yard, its stores stacked by them.
      const yards = new Set(c.chambers.filter((r): r is Chamber => !!r))
      for (const g of yards) {
        const big = (g.i1 - g.i0) * (g.j1 - g.j0) > 200
        for (let q = 0; q < (big ? 6 : 2); q++) {
          for (let t = 0; t < 12; t++) {
            const top = rng() < 0.5
            const i = Math.round(g.i0 + 1 + rng() * (g.i1 - g.i0 - 2))
            if (d.stand('warBanner', i, top ? g.j0 : g.j1, 0)) break
          }
        }
        if (big) for (let q = 0; q < 3; q++) {
          for (let t = 0; t < 12; t++) {
            const left = rng() < 0.5
            const j = Math.round(g.j0 + 1 + rng() * (g.j1 - g.j0 - 2))
            if (d.stand('crates', left ? g.i0 : g.i1, j, 0)) break
          }
        }
      }
      break
    }
    case 'spiral': {
      // Boulders fallen on the shelves of the mountain path.
      for (let k = 1; k < n; k++) round(k, 0.6, 0.95, 10, (i, j) => d.stand('boulder', i, j, 0))
      break
    }
    default:
      break
  }
  if (c.invasion) dressInvasion(d, c, round)
}

/**
 * The Breaking came through (afterplay §3): burning ruins round every clearing
 * the hero fights in, and a rift scar or two on open ground beside the fights
 * (never on the road: the way through stays safe to walk). Last of a place's
 * dressing and on the same stream, so its own pieces stand exactly where they
 * stood before the invasion.
 */
const dressInvasion = (d: Dresser, c: PlaceCtx, round: (k: number, r0: number, r1: number, tries: number, fn: (i: number, j: number, a: number) => boolean) => boolean): void => {
  const { rng, cs } = c
  const inv = c.invasion!
  const n = cs.length - 1
  const between = (lo: number, hi: number): number => lo + Math.floor(rng() * (hi - lo + 1))
  for (let k = 1; k <= n; k++) {
    const want = between(inv.ruins[0], inv.ruins[1])
    for (let q = 0; q < want; q++) if (!round(k, 0.55, 1.05, 14, (i, j) => d.stand('ruin', i, j, 0))) round(k, 0.35, 1.25, 24, (i, j) => d.stand('ruin', i, j, 0, { clear: 0 }))
  }
  const scars = between(inv.scars[0], inv.scars[1])
  // The clearings before the finale first; the finale's own ring last.
  const order = [...Array.from({ length: Math.max(1, n - 1) }, (_, q) => q + 1).sort(() => rng() - 0.5), n]
  let laid = 0
  // Its whole patch on open ground off the road if it fits; else its middle
  // and the four cells beside it (a narrow shelf, a temple's hall).
  const fits = (i: number, j: number, whole: boolean): boolean => {
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if ((whole || !di || !dj) && !d.free(i + di, j + dj, 0, true)) return false
    return true
  }
  for (const whole of [true, false]) {
    for (const k of order) {
      if (laid >= scars) break
      const ok = round(k, 0.15, 1.1, 60, (i, j) => {
        if (!fits(i, j, whole)) return false
        d.lay('scar', (i + 0.5) * CELL, (j + 0.5) * CELL, rng() * Math.PI * 2)
        return true
      })
      if (ok) laid++
    }
  }
}
