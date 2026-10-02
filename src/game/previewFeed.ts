import { app } from './engine/app'
import { ZoneMode } from './modes/zoneMode'
import { buildPlace, enterPlace, flow } from './flow'
import { addHudTicker } from './state/hud'
import { profile, setSaveSandbox } from './state/profile'
import { botThink, referenceBuild } from './sim/bot'
import { usePotion } from './sim/hero'
import { ENEMY_BY_ID } from './data/enemies'
import { ITEMS } from './data/items'
import { SKILLS, type ClassId } from './data/skills'
import { MAP, type NodeId } from './data/zones'
import { acquireAppPause } from '@/use/useGamePause'
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
  /** Make the hero a level-appropriate build of one class (nothing is saved). */
  hero(o: { level: number; cls: ClassId; potions?: number }): void
  /** Build a place and keep it, without showing it. Returns its shot index. */
  build(node: NodeId): Promise<number>
  /** Hard cut to a prebuilt shot. */
  cut(shot: number): void
  /** Arrange the fight in the live shot. */
  stage(o: { pack?: 'finale' | number; gap?: number; heroHp?: number; bossHp?: number; foeHp?: number; potions?: number }): void
  /** Hand the hero to the reference player (or take him back). */
  bot(on: boolean): void
  /** Drink a potion now. */
  potion(): boolean
  state(): PreviewState
}

const zone = (): ZoneMode | null => (app.mode instanceof ZoneMode ? app.mode : null)

/** Install `window.__preview`. Called from the scene's DEV block. */
export const installPreview = (): void => {
  if (!import.meta.env.DEV) return
  let release: (() => void) | null = null
  const shots: Array<{ node: NodeId; mode: Awaited<ReturnType<typeof buildPlace>> }> = []
  let botOn = false
  let nextThink = 0

  // The reference player decides on SIMULATION time, so a take plays the same
  // at 30 and at 60 frames a second.
  addHudTicker(() => {
    const z = zone()
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

    hero({ level, cls, potions }) {
      setSaveSandbox(true)
      const ref = referenceBuild({ level, cls })
      profile.level = level
      profile.hero.attrs = { ...ref.build.attrs }
      profile.hero.points = 0
      profile.hero.learned = SKILLS.map(s => s.id)
      profile.hero.active = [0, 1, 2, 3, 4, 5].map(i => ref.skills[i] ?? '')
      profile.hero.passive = [0, 1, 2].map(i => ref.build.passives[i] ?? '')
      profile.inv.items = ITEMS.map(i => i.id)
      profile.inv.equipped = { ...ref.build.equipped }
      profile.inv.potions = Math.max(1, Math.min(5, potions ?? 3))
      // Every road open: a clip may be shot anywhere.
      profile.world.cleared = MAP.map(n => n.id)
      for (const f of ['arenaOpen', 'throneDone']) if (!profile.world.flags.includes(f)) profile.world.flags.push(f)
    },

    async build(node) {
      const mode = await buildPlace(node, () => {})
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
    },

    potion: () => { const z = zone(); return z ? usePotion(z.sim) : false },

    state() {
      const z = zone()
      if (!z) return { node: flow.node, ended: '', simTime: 0, hero: { hp01: 0, alive: false, level: 0 }, boss: null, foesAwake: 0, groupsDone: 0, groupsTotal: 0 }
      const sim = z.sim
      const u = sim.hero.unit
      let boss: PreviewState['boss'] = null
      let awake = 0
      for (const e of sim.units) {
        if (e.team !== 1) continue
        if (e.alive && e.awake) awake++
        if (e.rank === 'boss' || e.rank === 'elite') {
          const b = { kind: e.kind, hp01: Math.max(0, e.hp) / e.s.maxHp, alive: e.alive }
          if (!boss || e.rank === 'boss') boss = b
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
