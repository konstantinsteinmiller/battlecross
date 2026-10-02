import { registerCheat } from '@/use/useCheats'
import { currentZone } from './boot'
import { MAP } from './data/zones'
import { ITEMS } from './data/items'
import { SKILLS } from './data/skills'
import { xpToNext } from './data/progression'
import { dealDamage } from './sim/combat'
import { applyStatus } from './sim/combat'
import { grantXp, profile, saveProfile } from './state/profile'

/**
 * Dev cheats. They only fire when cheats are enabled: `localStorage.cheat =
 * 'true'` plus a reload (see `useCheats`), so a shipped build keeps them
 * behind DevTools. They are registered from the game chunk, because the eager
 * App shell must never import the sim. All sit on ctrl+shift+alt, which no
 * game control uses.
 */
export const registerGameCheats = (): void => {
  registerCheat('ctrl+shift+alt+b', '+1000 gold', () => {
    profile.gold += 1000
    saveProfile()
  })
  registerCheat('ctrl+shift+alt+l', 'level up', () => {
    grantXp(xpToNext(profile.level) - profile.hero.xp)
    saveProfile()
  })
  registerCheat('ctrl+shift+alt+k', 'slay everything awake', () => {
    const z = currentZone()
    if (!z) return
    for (const u of z.sim.units) if (u.alive && u.team === 1) dealDamage(z.sim, z.sim.hero.unit, u, 1e7, { type: 'true', canCrit: false })
  })
  registerCheat('ctrl+shift+alt+g', 'god mode (10 minutes)', () => {
    const z = currentZone()
    if (z) applyStatus(z.sim, z.sim.hero.unit, 'invulnerable', 600, 1, z.sim.hero.unit)
  })
  registerCheat('ctrl+shift+alt+u', 'open the whole map, learn and own everything', () => {
    for (const n of MAP) if (!profile.world.cleared.includes(n.id)) profile.world.cleared.push(n.id)
    for (const f of ['arenaOpen', 'throneDone']) if (!profile.world.flags.includes(f)) profile.world.flags.push(f)
    for (const s of SKILLS) if (!profile.hero.learned.includes(s.id)) profile.hero.learned.push(s.id)
    for (const i of ITEMS) if (!profile.inv.items.includes(i.id)) profile.inv.items.push(i.id)
    saveProfile()
  })
}
