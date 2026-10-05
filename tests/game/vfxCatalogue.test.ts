import { describe, expect, it, vi } from 'vitest'

// The effects module builds textures and meshes only when a Vfx is made; its
// table of projectile looks is plain data.
vi.mock('@/game/engine/quality', () => ({ sceneQuality: () => 'high' }))

import { SHOT_KINDS } from '@/game/gfx/vfx'
import { ENEMIES, MINIONS } from '@/game/data/enemies'

/** Ability kinds whose `fx` names a thing in flight or a blast of one (`sim/abilities.ts`;
 *  a `line` is drawn as a beam, not thrown). */
const THROWN = new Set(['shot', 'volley', 'lob', 'barrage', 'smash'])
/** What the sim fires on its own (`sim/actors.ts`, `sim/hero.ts`, `sim/heroSkills.ts`). */
const BUILT_IN = ['bolt', 'bullet', 'bomb', 'blast', 'fireball']

describe('every projectile has a look of its own (#74)', () => {
  it('the kinds the sim fires by itself', () => {
    for (const k of BUILT_IN) expect(SHOT_KINDS, k).toContain(k)
  })

  it('every enemy and minion basic shot', () => {
    const shots = [...ENEMIES.map(e => e.shotFx), ...Object.values(MINIONS).map(m => m.shotFx)].filter((f): f is string => !!f)
    expect(shots.length).toBeGreaterThan(0)
    for (const f of shots) expect(SHOT_KINDS, f).toContain(f)
  })

  it('every thrown, shot or called-down ability', () => {
    const missing: string[] = []
    for (const e of ENEMIES) {
      for (const a of e.abilities) {
        if (a.fx && THROWN.has(a.kind) && !SHOT_KINDS.includes(a.fx)) missing.push(`${e.id}.${a.kind}:${a.fx}`)
      }
    }
    expect(missing).toEqual([])
  })
})
