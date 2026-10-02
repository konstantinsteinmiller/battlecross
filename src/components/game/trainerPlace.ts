import type { ClassId } from '@/game/data/skills'
import { MAP, TOWNS, hiddenTrainerOf, townNpcs, type NodeId, type TownId } from '@/game/data/zones'
import { flagSet, profile } from '@/game/state/profile'

/**
 * Where a class is taught, as the world's flags leave it today: its trainer
 * in a town, or the hidden one a cleared zone holds (Oakhaven's fall moves
 * two of them). `met`: the hero has spoken to them (the dialogue memory), so
 * the skills page can name them rather than only point at the place.
 */
export const trainerPlace = (cls: ClassId): { npc: string; node: NodeId; met: boolean } | null => {
  const flags = flagSet()
  const met = (npc: string): boolean => profile.world.said.includes(npc)
  for (const town of Object.keys(TOWNS) as TownId[]) {
    const n = townNpcs(town, flags).find(x => x.role === 'trainer' && x.cls === cls)
    if (n) return { npc: n.id, node: town, met: met(n.id) }
  }
  // A hidden trainer shows once their zone is cleared: asked as if all were.
  const everywhere = new Set<string>(MAP.map(n => n.id))
  for (const n of MAP) {
    const t = hiddenTrainerOf(n.id, everywhere, flags)
    if (t && t.cls === cls) return { npc: t.npc, node: n.id, met: met(t.npc) }
  }
  return null
}
