import { registerCheat } from '@/use/useCheats'
import { currentMission } from './boot'
import { profile, saveProfile, grantXp } from './state/profile'
import { xpToNext } from './data/progression'
import { SECTORS } from './data/regions'
import { WEAPONS, type WeaponId } from './data/weapons'
import { cellCenter } from './world/levelGen'
import { isSolidAt } from './world/nav'

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
  // A boss fight is minutes into a mission; QA needs the entrance in seconds.
  // The corridor outside the shutter, facing it, so the last steps are walked.
  registerCheat('ctrl+shift+alt+j', 'jump to the boss door', () => {
    const m = currentMission()
    const d = m?.map.doors.find(o => o.boss)
    if (!m || !d) return
    const dx = cellCenter(d.i)
    const dz = cellCenter(d.j)
    // Back along the corridor, away from the boss room (`dir` points into it).
    const bx = d.axis === 'x' ? -d.dir : 0
    const bz = d.axis === 'z' ? -d.dir : 0
    let back = 4.5
    while (back > 1.5 && isSolidAt(m.nav, dx + bx * back, dz + bz * back)) back -= 0.5
    const p = m.player
    p.x = p.px = dx + bx * back
    p.z = p.pz = dz + bz * back
    p.path = null
    p.yaw = Math.atan2(bx, bz)
  })
  registerCheat('ctrl+shift+alt+u', 'unlock every sector and weapon', () => {
    profile.world.unlocked = SECTORS.map(s => s.id)
    for (const id of Object.keys(WEAPONS) as WeaponId[]) {
      if (!profile.hero.weapons.includes(id)) profile.hero.weapons.push(id)
    }
    saveProfile()
  })
}
