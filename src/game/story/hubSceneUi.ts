import { reactive } from 'vue'

/** The hub's voiced scene now on screen (`HubSceneLayer.vue`); Pip's notices wait for it. */
export const hubSceneUi = reactive({
  active: false,
  id: '' as '' | 'broadcast' | 'blueprint' | 'reserve' | 'breach',
  /** Where the picture is, set by the scene's own beats so it follows the lines:
   *  blueprint `freeze`; reserve `beams` → `red`; breach `fire` → `crack` → `shatter`. */
  stage: ''
})

export const hubStage = (stage: string): (() => void) => () => { hubSceneUi.stage = stage }
