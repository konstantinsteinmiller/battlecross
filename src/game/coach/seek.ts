import { reactive } from 'vue'

/**
 * The teacher the hero asked to be led to (#166), from the skills page's "Find
 * teacher". In that town the gold chevrons lead to the NPC; on the world map a
 * small arrow marks the place (a hidden teacher's place is the zone that holds
 * their cage). Cleared on reaching them. Not saved.
 */
export const seek = reactive({ npc: '', node: '' })

export const setSeek = (npc: string, node: string): void => { seek.npc = npc; seek.node = node }
export const clearSeek = (): void => { seek.npc = ''; seek.node = '' }
