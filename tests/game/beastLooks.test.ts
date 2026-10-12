import { describe, expect, it } from 'vitest'
import { MINIONS } from '@/game/data/enemies'
import { rigKeyFor } from '@/game/gfx/rigs/index'

/**
 * Call Bear spawned a wolf (and Call Wolf a grey one): the beast rig only knew
 * the wolf, the stalker and the howler, and every other look fell through to
 * the wolf. Every minion with a look of its own is drawn as that look.
 */
describe('minion looks', () => {
  it('the Beastcaller\'s bear is a bear, its wolf a spirit wolf', () => {
    expect(rigKeyFor(MINIONS.packBear!.rig, MINIONS.packBear!.look)).toBe('beast:spiritBear')
    expect(rigKeyFor(MINIONS.packWolf!.rig, MINIONS.packWolf!.look)).toBe('beast:spiritWolf')
  })

  it('no two beast minions of different looks share a template', () => {
    const beasts = Object.values(MINIONS).filter(m => m.rig === 'beast')
    const keys = new Map<string, string>()
    for (const m of beasts) {
      const k = rigKeyFor(m.rig, m.look)
      const had = keys.get(k)
      if (had) expect(had, `${m.id} is drawn as ${k}`).toBe(m.look)
      keys.set(k, m.look)
    }
  })
})
