import { ref, watch } from 'vue'
import { getState, setState } from '@/use/useGameState'
import { saveDataVersion } from '@/use/useSaveStatus'
import { KILLCAM_KEY } from '@/keys'

/**
 * The kill-cam setting (Options → Gameplay; on by default). A player can also
 * switch it off from inside a kill-cam — its "off" button or F4 — and only
 * the Options toggle turns it back on.
 */
const readPersisted = (): boolean => getState<boolean>(KILLCAM_KEY, true) !== false

export const killCamsEnabled = ref<boolean>(readPersisted())

// A cloud save that lands after boot carries the player's choice too.
watch(saveDataVersion, () => {
  const v = readPersisted()
  if (v !== killCamsEnabled.value) killCamsEnabled.value = v
})

export const setKillCamsEnabled = (next: boolean): void => {
  killCamsEnabled.value = next
  setState(KILLCAM_KEY, next)
}
