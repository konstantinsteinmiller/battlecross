import { reactive } from 'vue'
import type { Speaker } from './endingScript'

/**
 * What the ending's layer (`EndingLayer.vue`) shows, written by the film
 * (`story/ending.ts`) each step. Apart from the film so the layer, which ships
 * with the game scene, never pulls the film's chunk in.
 */
export const endingUi = reactive({
  on: false,
  t: 0,
  caption: '' as string,
  speaker: '' as Speaker,
  /** Bumped whenever a new caption comes up (the layer replays its entrance). */
  seq: 0,
  credits: false,
  card: false,
  /** The roll's progress, 0..1. */
  roll: 0,
  /** New Game+ chosen: Vex's sting plays before the new run (#117). */
  sting: false
})
