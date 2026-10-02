import { reactive } from 'vue'

/**
 * What the debrief film shows over the picture (`DebriefLayer.vue`). In its
 * own module so the layer never pulls the film's chunk in (`story/debrief.ts`).
 */
export const debriefUi = reactive({
  on: false,
  /** Where the film is: the city, the copied weapon's card, Vex, the next sector's card. */
  stage: '' as '' | 'city' | 'weapon' | 'vex' | 'next',
  from: '',
  to: '',
  boss: '',
  toBoss: '',
  /** The weapon copied from the fallen Master ('' = none). */
  weapon: ''
})
