import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero, setHeroLoadout } from '@/game/sim/hero'
import { referenceBuild } from '@/game/sim/bot'

const read = (p: string): string => readFileSync(resolve(__dirname, '../../src', p), 'utf8')

/** #221: the bag and the loadout open in a level, from the portrait; a lightbox teaches it in the Goblin Hollows. */
describe('the bag in a level (#221)', () => {
  it('a skill set in the menu is the hero\'s at once, and a kept slot keeps its cooldown', () => {
    const ref = referenceBuild({ cls: 'aegis', level: 12 })
    const sim = new Sim({ seed: 1, w: 20, h: 20, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
    createHero(sim, { build: ref.build, skills: ref.skills, x: 5, z: 5, xpInto: 0, potions: 3 })
    const h = sim.hero
    const keep = h.skills[0]!
    h.cd[0] = 4
    h.cd[1] = 4
    setHeroLoadout(sim, [keep, 'cleave', ...h.skills.slice(2)])
    expect(h.skills[1]).toBe('cleave')
    expect(h.cd[1]).toBe(0)
    expect(h.cd[0]).toBe(4)
  })

  it('the portrait opens the bag, every page of the book opens in a level, and the lesson is once, in the Hollows', () => {
    expect(read('components/hud/HeroFrame.vue')).toContain("openBook('inventory')")
    expect(read('components/screens/hero/HeroBook.vue')).not.toContain("flow.screen === 'zone' ? PAGES.filter")
    const zone = read('game/modes/zoneMode.ts')
    expect(zone).toContain("this.setup.zone === 'hollows' && !profile.tips[BAG_TIP]")
    expect(zone).toContain('BAG_HINT_AT_S = 10')
  })
})
