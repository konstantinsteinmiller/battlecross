import { app } from './engine/app'
import { ZoneMode } from './modes/zoneMode'
import { buildPlace, enterPlace, flow, npcById, type Modal } from './flow'
import { addHudTicker } from './state/hud'
import { profile, setSaveSandbox } from './state/profile'
import { botThink, referenceBuild, setBotDodge } from './sim/bot'
import { orderMove, usePotion } from './sim/hero'
import { chestLock, orderOpen } from './sim/interact'
import { escortPacks } from './data/encounters'
import { ENEMY_BY_ID } from './data/enemies'
import { ITEMS } from './data/items'
import { SKILLS, type ClassId } from './data/skills'
import { MAP, type NodeId } from './data/zones'
import type { ZoneId } from './data/items'
import { acquireAppPause } from '@/use/useGamePause'
import { setSfxTap } from './audio/sfx'
import { PREVIEW_FEED, PREVIEW_ON, type Feed } from './previewFlags'

/**
 * ─── The recorder's seam (DEV only) ──────────────────────────────────────────
 *
 * `pnpm preview:video` (tools/preview-video) records gameplay clips for the
 * portals. It needs three things from the game, and this file is all of them:
 *
 *   • a FEED flag, read once from the URL: `?feed=preview` records the world
 *     with the interface it paints itself (health bars over heads, the rings
 *     under the hero and the target); `?feed=pure` hides those too, for a spec
 *     that says "no UI of any kind". The DOM interface (the HUD, the menus) is
 *     the recorder's to hide, by CSS; only what the RENDERER draws needs a flag;
 *   • a scripting handle, `window.__preview`, installed when the URL carries
 *     `?preview=1`: stage a hero and a fight, prebuild several places and CUT
 *     between them, hand the hero to the balance suite's reference player;
 *   • the result screen held back, so a clip can run past a boss's fall.
 *
 * Everything here is behind `import.meta.env.DEV`: in a build the flag is the
 * constant `'off'`, `installPreview` is never called, and the module folds away.
 */

export { PREVIEW_FEED, PREVIEW_ON, type Feed }

export interface PreviewState {
  node: string
  ended: '' | 'victory' | 'defeat'
  simTime: number
  hero: { hp01: number; alive: boolean; level: number }
  boss: { kind: string; hp01: number; alive: boolean } | null
  foesAwake: number
  groupsDone: number
  groupsTotal: number
}

export interface PreviewApi {
  feed: Feed
  /** Freeze / release the whole game (the same gate a menu or an ad uses). */
  hold(on: boolean): void
  held(): boolean
  /** Make the hero a level-appropriate build of one class (nothing is saved).
   *  `bare`: he owns nothing beyond what he wears, so bosses and chests drop loot on camera. */
  hero(o: { level: number; cls: ClassId; potions?: number; bare?: boolean }): void
  /** Build a place and keep it, without showing it. Returns its shot index.
   *  `escort`: the caravan's road in that zone's land instead (#85). */
  build(node: NodeId, o?: { escort?: boolean }): Promise<number>
  /** Hard cut to a prebuilt shot. */
  cut(shot: number): void
  /** Arrange the fight in the live shot. */
  stage(o: { pack?: 'finale' | number; gap?: number; heroHp?: number; bossHp?: number; foeHp?: number; potions?: number }): void
  /** Hand the hero to the reference player (or take him back). */
  bot(on: boolean): void
  /** The scripted boss on the field (#74): set its health (a phase's line crossed
   *  right now), and ready its named moves (`cd` timers to 0, the rest held). */
  boss(o: { hp?: number; ready?: string[]; hold?: string[] }): boolean
  /** How often the reference player rolls out of warnings (0..1; default 0.7). */
  dodge(share: number): void
  /** Drink a potion now. */
  potion(): boolean
  /**
   * A walk (a town, a road): the hero is put at the first point (world metres)
   * and walks on through the rest, one after the other. The reference player
   * is switched off for it.
   */
  walk(points: Array<[number, number]>): void
  /** The escort's cart pulled up beside the hero, rolling on toward the next ambush (#125's caravan shot). */
  caravan(): boolean
  /** The nearest chest the hero may open holds these pieces (and its gold); he walks over and opens it. */
  chest(items: string[]): boolean
  /** Open one of the game's own screens (a shop names its merchant), or close it (''). */
  open(modal: Modal | '', npc?: string): void
  /** The hero's book for a shot: gold, unspent points, the bag, the loadout ('' = an empty socket). */
  book(o: { gold?: number; points?: number; items?: string[]; active?: string[]; passive?: string[] }): void
  /** Every sound the game asked for since `installPreview`, on the page clock (the trailer's sound track). */
  sfxLog(): Array<{ name: string; pan: number; gain: number; t: number }>
  /** Where things are in the live shot (world metres): the start, the main
   *  packs (the finale last), the set pieces (#120) and the puzzle's plates. */
  places(): { start: [number, number]; packs: Array<[number, number]>; pieces: Array<{ kind: string; x: number; z: number }> } | null
  /** Hold the camera out at `k` times its fitted distance (1: back to normal), for a still of a whole place. */
  zoom(k: number): void
  state(): PreviewState
}

const zone = (): ZoneMode | null => (app.mode instanceof ZoneMode ? app.mode : null)

/** Install `window.__preview`. Called from the scene's DEV block. */
export const installPreview = (): void => {
  if (!import.meta.env.DEV) return
  let release: (() => void) | null = null
  // The trailer's sound track: what the game WOULD play, with when (`tools/sfx-render.mjs` voices it).
  const sounds: Array<{ name: string; pan: number; gain: number; t: number }> = []
  setSfxTap((name, pan, gain) => { if (!name.startsWith('ui') && name !== 'mapMove') sounds.push({ name, pan, gain, t: performance.now() }) })
  const shots: Array<{ node: NodeId; mode: Awaited<ReturnType<typeof buildPlace>> }> = []
  let botOn = false
  let nextThink = 0
  /** The rest of a scripted walk (`walk`), next point first. */
  let route: Array<[number, number]> = []

  // The reference player decides on SIMULATION time, so a take plays the same
  // at 30 and at 60 frames a second.
  addHudTicker(() => {
    const z = zone()
    if (z && route.length) {
      // On to the next point when this one is reached (or nearly: a person in the way).
      const u = z.sim.hero.unit
      const [x, zz] = route[0]!
      if (Math.hypot(u.x - x, u.z - zz) < 1.2) {
        route.shift()
        if (route.length) orderMove(z.sim, route[0]![0], route[0]![1])
      }
    }
    if (!botOn || !z) return
    if (z.sim.time >= nextThink) {
      nextThink = z.sim.time + 0.2
      botThink(z.sim)
    }
  })

  const api: PreviewApi = {
    feed: PREVIEW_FEED,

    hold(on) {
      if (on && !release) release = acquireAppPause()
      else if (!on && release) { release(); release = null }
    },
    held: () => release !== null,

    hero({ level, cls, potions, bare }) {
      setSaveSandbox(true)
      const ref = referenceBuild({ level, cls })
      profile.level = level
      profile.hero.attrs = { ...ref.build.attrs }
      profile.hero.points = 0
      profile.hero.learned = SKILLS.map(s => s.id)
      profile.hero.active = [0, 1, 2, 3, 4, 5].map(i => ref.skills[i] ?? '')
      profile.hero.passive = [0, 1, 2].map(i => ref.build.passives[i] ?? '')
      profile.inv.items = bare ? Object.values(ref.build.equipped).filter((id): id is string => !!id) : ITEMS.map(i => i.id)
      profile.inv.equipped = { ...ref.build.equipped }
      profile.inv.potions = Math.max(1, Math.min(5, potions ?? 3))
      // Every road open: a clip may be shot anywhere.
      profile.world.cleared = MAP.map(n => n.id)
      for (const f of ['arenaOpen', 'throneDone']) if (!profile.world.flags.includes(f)) profile.world.flags.push(f)
    },

    async build(node, o = {}) {
      const zoneId = node as ZoneId
      const mode = o.escort
        ? await buildPlace(node, () => {}, { kind: 'fight', zone: zoneId, level: profile.level, seed: 125, packs: escortPacks(zoneId, 125), escort: true })
        : await buildPlace(node, () => {})
      shots.push({ node, mode })
      return shots.length - 1
    },

    cut(shot) {
      const s = shots[shot]
      if (!s) return
      nextThink = 0
      enterPlace(s.node, s.mode)
      app.renderOnce()
    },

    stage({ pack = 'finale', gap = 5, heroHp, bossHp, foeHp, potions }) {
      const z = zone()
      if (!z) return
      const packs = z.plan.packs
      const p = pack === 'finale' ? packs[packs.length - 1] : packs[Math.max(0, Math.min(packs.length - 1, pack))]
      if (!p) return
      const sim = z.sim
      const u = sim.hero.unit
      u.x = p.x
      u.z = p.z + gap
      u.px = u.x
      u.pz = u.z
      u.hasGoal = false
      sim.hero.order = { kind: 'none', targetId: 0, x: u.x, z: u.z }
      // The hero was moved, not walked: the camera jumps with him.
      z.cam.snap()
      if (heroHp !== undefined) u.hp = Math.max(1, u.s.maxHp * heroHp)
      if (potions !== undefined) sim.hero.potions = potions
      for (const e of sim.units) {
        if (!e.alive || e.team !== 1 || Math.hypot(e.x - p.x, e.z - p.z) > p.r + 6) continue
        e.awake = true
        const boss = ENEMY_BY_ID[e.kind]?.rank === 'boss' || e.kind === p.boss
        const f = boss ? bossHp : foeHp
        if (f !== undefined) e.hp = Math.max(1, e.s.maxHp * f)
      }
      for (const g of sim.groups) if (Math.hypot(g.x - p.x, g.z - p.z) < 1) g.awake = true
    },

    bot(on) {
      botOn = on
      nextThink = 0
      if (on) route = []
    },

    boss({ hp, ready = [], hold = [] }) {
      const z = zone()
      if (!z) return false
      const b = z.sim.units.find(e => e.alive && e.team === 1 && e.boss && e.boss.mode !== 'gone' && e.boss.mode !== 'exit')
      if (!b || !b.boss) return false
      if (hp !== undefined) b.hp = Math.max(1, b.s.maxHp * hp)
      for (const k of ready) b.boss.cd[k] = 0
      for (const k of hold) b.boss.cd[k] = 99
      if (ready.length) { b.boss.next = 0; b.aiT = 0 }
      return true
    },
    dodge: (share) => setBotDodge(share),

    potion: () => { const z = zone(); return z ? usePotion(z.sim) : false },

    walk(points) {
      const z = zone()
      if (!z || !points.length) return
      botOn = false
      const u = z.sim.hero.unit
      const [x0, z0] = points[0]!
      u.x = u.px = x0
      u.z = u.pz = z0
      u.hasGoal = false
      z.cam.snap()
      route = points.slice(1)
      if (route.length) orderMove(z.sim, route[0]![0], route[0]![1])
    },
    caravan() {
      const z = zone()
      const c = z?.sim.caravan
      const cart = c ? z.sim.get(c.unit) : undefined
      if (!z || !c || !cart) return false
      const u = z.sim.hero.unit
      // Beside the hero, on the road's side away from the pack he faces.
      cart.x = cart.px = u.x - 2.2
      cart.z = cart.pz = u.z + 1.6
      // On to the clearing ahead: the waypoint nearest the hero's pack.
      let best = 1
      for (let i = 1; i < c.path.length / 2; i++) {
        if (Math.hypot(c.path[i * 2]! - u.x, c.path[i * 2 + 1]! - u.z) < Math.hypot(c.path[best * 2]! - u.x, c.path[best * 2 + 1]! - u.z)) best = i
      }
      c.i = best
      c.phase = 'rolling'
      return true
    },

    chest(items) {
      const z = zone()
      if (!z) return false
      const sim = z.sim
      const u = sim.hero.unit
      const open = sim.chests.filter(c => c.role !== 'cage' && !chestLock(sim, c))
      const c = open.sort((a, b) => Math.hypot(a.x - u.x, a.z - u.z) - Math.hypot(b.x - u.x, b.z - u.z))[0]
      if (!c) return false
      // Named pieces, so the find is the shot's; the gold stays the chest's own.
      c.loot = [...c.loot.filter(d => d.kind === 'gold'), ...items.map(item => ({ kind: 'item' as const, gold: 0, u: 0, item }))]
      for (const id of items) { sim.owned.delete(id); sim.hero.items = sim.hero.items.filter(i => i !== id) }
      // A few steps short of it, then the walk and the lid are the game's.
      u.x = u.px = c.sx + 2.6
      u.z = u.pz = c.sz + 2.6
      u.hasGoal = false
      z.cam.snap()
      botOn = false
      route = []
      return orderOpen(sim, c.id)
    },

    open(modal, npc) {
      if (npc) flow.npc = npcById(npc)
      flow.modal = modal
    },

    book({ gold, points, items, active, passive }) {
      if (gold !== undefined) profile.gold = gold
      if (points !== undefined) profile.hero.points = points
      if (items) { profile.inv.items = [...new Set([...Object.values(profile.inv.equipped).filter((id): id is string => !!id), ...items])]; profile.inv.fresh = [...items] }
      if (active) profile.hero.active = active
      if (passive) profile.hero.passive = passive
    },
    sfxLog: () => sounds,

    zoom(k) {
      const z = zone()
      if (z) z.cam.punchZoom(k, 0.05, k === 1 ? 0 : 1e6)
    },

    places() {
      const z = zone()
      if (!z) return null
      const p = z.plan
      return {
        start: [p.start.x, p.start.z],
        packs: p.packs.map(q => [q.x, q.z] as [number, number]),
        pieces: [...(p.dressing ?? []).map(d => ({ kind: d.kind as string, x: d.x, z: d.z })), ...p.plates.map(q => ({ kind: 'plate', x: q.x, z: q.z }))]
      }
    },

    state() {
      const z = zone()
      if (!z) return { node: flow.node, ended: '', simTime: 0, hero: { hp01: 0, alive: false, level: 0 }, boss: null, foesAwake: 0, groupsDone: 0, groupsTotal: 0 }
      const sim = z.sim
      const u = sim.hero.unit
      let boss: PreviewState['boss'] = null
      let awake = 0
      // The zone's FINALE boss first: a branch boss elsewhere (roadmap #70) is not the one a clip stages.
      const finale = z.plan.packs.find(p => p.finale)?.boss ?? ''
      for (const e of sim.units) {
        if (e.team !== 1) continue
        // A mount that ran off the field (#74) is no one's boss any more.
        if (e.boss?.mode === 'gone') continue
        if (e.alive && e.awake) awake++
        if (e.rank === 'boss' || e.rank === 'elite') {
          const b = { kind: e.kind, hp01: Math.max(0, e.hp) / e.s.maxHp, alive: e.alive }
          if (boss?.kind === finale) continue
          if (!boss || e.kind === finale || e.rank === 'boss') boss = b
        }
      }
      return {
        node: flow.node, ended: sim.ended, simTime: sim.time,
        hero: { hp01: Math.max(0, u.hp) / u.s.maxHp, alive: u.alive, level: sim.hero.level },
        boss, foesAwake: awake, groupsDone: sim.groupsDone, groupsTotal: sim.groups.length
      }
    }
  }
  ;(window as unknown as { __preview: PreviewApi }).__preview = api
}
