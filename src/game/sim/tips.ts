import type { Enemy } from './world'
import { hud } from '../state/hud'
import { profile, markTip } from '../state/profile'

/**
 * ─── Pip's tips ──────────────────────────────────────────────────────────────
 *
 * One-line onboarding from Cobalt's support bot, triggered by what is ACTUALLY
 * happening (the first hardhat hiding, the first orange ring, the first chest
 * in reach…) rather than by a front-loaded tutorial screen. Each tip shows
 * once per profile, holds for a few seconds, and yields to a newer, more
 * urgent one.
 */

export type TipId =
  | 'move' | 'fire' | 'hardhat' | 'charge' | 'block' | 'red' | 'chest' | 'tank' | 'bossDoor' | 'beamOut' | 'weapon' | 'levelUp'

const PRIORITY: Record<TipId, number> = {
  red: 9, block: 8, tank: 7, hardhat: 6, charge: 6, fire: 5, bossDoor: 5, weapon: 4, chest: 4, beamOut: 4, levelUp: 3, move: 2
}

export interface TipContext {
  time: number
  combat: boolean
  enemies: Enemy[]
  player: { x: number; z: number }
  hp01: number
  tanks: number
  interactKind: string
  objectiveDone: boolean
  hasWeapon: boolean
  touch: boolean
}

export class Tips {
  private current: TipId | null = null
  private shownAt = 0
  private checkT = 0

  constructor(private readonly enabled: boolean) {}

  private show(id: TipId, now: number, touch: boolean): void {
    if (profile.tips[`tip_${id}`]) return
    if (this.current && PRIORITY[this.current] > PRIORITY[id] && now - this.shownAt < 3) return
    this.current = id
    this.shownAt = now
    hud.tip = `tips.${id}${id === 'move' || id === 'fire' || id === 'block' ? (touch ? 'Touch' : 'Keys') : ''}`
    markTip(`tip_${id}`)
  }

  update(dt: number, c: TipContext): void {
    if (!this.enabled) return
    if (this.current && c.time - this.shownAt > 6) {
      this.current = null
      hud.tip = ''
    }
    this.checkT -= dt
    if (this.checkT > 0) return
    this.checkT = 0.25
    if (c.time > 1.5) this.show('move', c.time, c.touch)
    const near = (e: Enemy, r: number) => Math.hypot(e.x - c.player.x, e.z - c.player.z) < r
    for (const e of c.enemies) {
      if (e.state === 'dead' || !e.awake) continue
      if (e.state === 'tele' && near(e, 16)) this.show(e.teleRed ? 'red' : 'block', c.time, c.touch)
      if (e.kind === 'hardhat' && e.guard > 0.6 && near(e, 14)) this.show('hardhat', c.time, c.touch)
      if (e.kind === 'trooper' && near(e, 14)) this.show('charge', c.time, c.touch)
    }
    if (c.combat) this.show('fire', c.time, c.touch)
    if (c.interactKind === 'interact.chest') this.show('chest', c.time, c.touch)
    if (c.interactKind === 'interact.bossDoor') this.show('bossDoor', c.time, c.touch)
    if (c.hp01 < 0.4 && c.tanks > 0) this.show('tank', c.time, c.touch)
    if (c.objectiveDone && !c.combat) this.show('beamOut', c.time, c.touch)
    if (c.hasWeapon && c.combat) this.show('weapon', c.time, c.touch)
  }

  levelUp(now: number): void {
    if (this.enabled) this.show('levelUp', now, false)
  }

  clear(): void {
    this.current = null
    hud.tip = ''
  }
}
