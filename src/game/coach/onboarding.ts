import { watch, type WatchStopHandle } from 'vue'
import { EQUIP_SLOTS } from '../data/items'
import { flow } from '../flow'
import { talk } from '../talk'
import { hud } from '../state/hud'
import { profile } from '../state/profile'
import { coach, RECALL } from '../coach'
import { isAdShowing } from '@/use/useGamePause'
import { stepOf, wantedHere, type FeatureCtx, type Step } from './features'
import { Pacer } from './pacing'
import { REVEALS, isVeteran, markRevealUsed, markRevealed, revealed, type RevealId } from './reveal'
import { onboard, type FeatureId } from './state'

/**
 * ─── The introductions, live (roadmap #52) ───────────────────────────────────
 *
 * Wires the pure parts to the running game: reads where the player is
 * (`flow`, the conversation, the save), asks `features.ts` what could be
 * taught here, lets the `Pacer` choose (one feature at a time, one new one per
 * breathing moment, reveals first), and writes the answer to `onboard`, which
 * the layers draw. It also LISTENS: every feature used — however the player
 * found it — is reported to the coach as learned, so a lesson never shows for
 * something already done.
 *
 * Ticked by `LessonLayer.vue` on its own animation frame: the game loop stands
 * still under a window, and that is exactly where most of these lessons are.
 */

export const pacer = new Pacer()

let clock = 0
let calmFor = 0

const dom: FeatureCtx['dom'] = {
  has: (sel) => !!document.querySelector(sel),
  attr: (sel, name) => document.querySelector(sel)?.getAttribute(name) ?? null,
  all: (sel, name) => Array.from(document.querySelectorAll(sel), el => el.getAttribute(name) ?? '')
}

export const liveCtx = (): FeatureCtx => ({
  screen: flow.screen,
  modal: flow.modal,
  talk: flow.talk,
  talkPhase: talk.phase,
  npcRole: flow.npc?.role ?? '',
  trainerCls: flow.trainerCls,
  node: flow.node,
  family: hud.device,
  dom
})

/** The step of the lesson on screen, for the layer (null: nothing to draw). */
export const currentStep = (): Step | null => (onboard.lesson && onboard.shown ? stepOf(onboard.lesson, liveCtx()) : null)

/** When a HUD button is due: the moment it first matters. */
const due = (id: RevealId): boolean => {
  switch (id) {
    case 'map': return flow.screen === 'town'
    case 'hero': return profile.hero.points > 0 || profile.level > 1
    case 'bag': return profile.inv.fresh.length > 0 || profile.inv.items.some(i => !EQUIP_SLOTS.some(s => profile.inv.equipped[s] === i))
    case 'skills': return profile.hero.learned.length > 1
    case 'mana': return hud.manaPotions > 0 || profile.inv.manaPotions > 0
  }
}

/** Is the button's home on screen, in a calm, to pop it in? */
const hostCalm = (id: RevealId): boolean => {
  if (id === 'mana') return flow.screen === 'zone' && !flow.modal && !flow.talk && hud.phase === 'play' && calmFor >= 1.5
  if (flow.screen === 'town') return !flow.modal && !flow.talk
  return flow.screen === 'map' && !flow.modal && id !== 'map'
}

/** Nothing new shows while something else has the player. */
const blocked = (): boolean =>
  isAdShowing.value || flow.loading || flow.screen === 'boot' ||
  flow.modal === 'pause' || flow.modal === 'help' || flow.modal === 'results' || flow.modal === 'ending' ||
  (typeof document !== 'undefined' && document.hidden)

const learned = (id: FeatureId): boolean => coach.learned(id)

let acc = 0
/** One beat of the introductions (called every frame; decides ~10 times a second). */
export const tickOnboarding = (dt: number): void => {
  clock += dt
  calmFor = onboard.fight ? 0 : calmFor + dt
  acc += dt
  if (acc < 0.1) return
  acc = 0
  const ctx = liveCtx()
  const want = wantedHere(ctx, learned)
  const reveals = isVeteran() ? [] : REVEALS.filter(id => !revealed(id) && due(id) && hostCalm(id))
  const out = pacer.step({ now: clock, want, blocked: blocked(), reveals })
  if (out.reveal) markRevealed(out.reveal)
  if (onboard.lesson !== out.lesson) onboard.lesson = out.lesson
  if (onboard.shown !== out.shown) onboard.shown = out.shown
}

/** The player used a feature: learned, and its lesson (if up) pops green. */
export const featureUsed = (id: FeatureId): void => {
  const wasUp = onboard.lesson === id && onboard.shown
  coach.use(id)
  pacer.retire(id)
  if (onboard.lesson === id) { onboard.lesson = ''; onboard.shown = false }
  if (wasUp) { onboard.done = id; onboard.doneN++ }
}

/** "?": the lessons of the place the player is in come back, now. */
export const recallHere = (): void => {
  const scope = flow.screen === 'town' ? 'town' : flow.screen === 'map' ? 'map' : 'fight'
  coach.recall(RECALL[scope])
  pacer.breathe(clock)
}

let stops: WatchStopHandle[] = []

/** Listen to the game for uses and breathing moments (once, from the layer). */
export const installOnboarding = (): (() => void) => {
  if (stops.length) return () => {}
  const sync = { flush: 'sync' as const }
  stops = [
    // ── Breathing moments, and the screen settling ──
    watch(() => flow.screen, (now, was) => {
      pacer.breathe(clock)
      if (was === 'town' && now === 'map') markRevealUsed('map')
    }, sync),
    watch(() => flow.modal, (now, was) => {
      if (!now && was) pacer.breathe(clock)
      else pacer.settle(clock)
      if (now === 'character') markRevealUsed('hero')
      else if (now === 'skills') markRevealUsed('skills')
      else if (now === 'inventory') markRevealUsed('bag')
      if (now === 'trainer') featureUsed('teach')
    }, sync),
    watch(() => flow.talk, (now, was) => {
      if (!now && was) pacer.breathe(clock)
      else pacer.settle(clock)
      if (now === 'npc' && flow.npc?.role === 'trainer') featureUsed('talk')
    }, sync),
    watch(() => talk.phase, () => pacer.settle(clock), sync),
    watch(() => onboard.fight, (on) => { if (!on) pacer.breathe(clock) }, sync),
    // ── Uses ──
    watch(() => flow.loading, (on) => { if (on && flow.screen === 'map') featureUsed('travel') }, sync),
    watch(() => EQUIP_SLOTS.map(s => profile.inv.equipped[s] ?? '').join('|'), (now, was) => {
      if (flow.modal !== 'inventory' && flow.modal !== 'shop') return
      const a = now.split('|')
      const b = was.split('|')
      if (a.some((id, i) => id && id !== b[i])) featureUsed('equip')
    }, sync),
    watch(() => profile.hero.points, (now, was) => { if (now < was && flow.modal === 'character') featureUsed('attr') }, sync),
    watch(() => profile.hero.learned.length, (now, was) => { if (now > was && flow.modal === 'trainer') featureUsed('learn') }, sync),
    watch(() => [...profile.hero.active, '|', ...profile.hero.passive].join(','), () => { if (flow.modal === 'skills') featureUsed('slot') }, sync),
    watch(() => profile.inv.items.length, (now, was) => { if (now > was && flow.modal === 'shop') featureUsed('buy') }, sync)
  ]
  return () => {
    for (const s of stops) s()
    stops = []
  }
}

// DEV: the probe scripts read the pacing through the app's own instance.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__onboard = { pacer, onboard, currentStep, liveCtx, recallHere, blocked, clock: () => clock }
}

/** Test seam. */
export const resetOnboarding = (): void => {
  pacer.reset()
  clock = 0
  calmFor = 0
  acc = 0
  onboard.lesson = ''
  onboard.shown = false
  onboard.done = ''
  onboard.doneN = 0
  onboard.fight = false
}
