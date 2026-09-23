import { registerCheat } from '@/use/useCheats'
import { currentMission } from './boot'
import { profile, saveProfile, grantXp } from './state/profile'
import { xpToNext } from './data/progression'
import { SECTORS } from './data/regions'
import { WEAPONS, type WeaponId } from './data/weapons'

/**
 * Dev cheats. They only fire when cheats are enabled: `localStorage.cheat =
 * 'true'` plus a reload (see `useCheats`), so a shipped build keeps them
 * behind DevTools. They are registered from the game chunk, because the eager
 * App shell must never import the sim. All sit on ctrl+shift+alt, which no
 * game control uses.
 */
export const registerGameCheats = (): void => {
  registerCheat('ctrl+shift+alt+b', '+1000 bolts', () => {
    profile.bolts += 1000
    saveProfile()
  })
  registerCheat('ctrl+shift+alt+l', 'level up', () => {
    grantXp(xpToNext(profile.level) - profile.hero.xp)
    saveProfile()
  })
  registerCheat('ctrl+shift+alt+o', 'finish the objective', () => currentMission()?.objects.progress(99))
  registerCheat('ctrl+shift+alt+k', 'destroy every machine', () => {
    const m = currentMission()
    if (!m) return
    for (const e of m.enemies) {
      if (e.state === 'dead') continue
      m.system.damageEnemy(e, 1e6, {
        crit: false, charge: 2, fromX: m.player.x, fromZ: m.player.z, x: e.x, y: 1, z: e.z, color: '#ffffff'
      })
    }
  })
  let god = false
  registerCheat('ctrl+shift+alt+g', 'god mode (toggle)', () => {
    const m = currentMission()
    if (!m) return
    god = !god
    m.combat.iframes = god ? 1e9 : 0
  })
  registerCheat('ctrl+shift+alt+u', 'unlock every sector and weapon', () => {
    profile.world.unlocked = SECTORS.map(s => s.id)
    for (const id of Object.keys(WEAPONS) as WeaponId[]) {
      if (!profile.hero.weapons.includes(id)) profile.hero.weapons.push(id)
    }
    saveProfile()
  })
}
