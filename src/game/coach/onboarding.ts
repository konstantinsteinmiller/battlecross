import { watch, type WatchStopHandle } from 'vue'
import { EQUIP_SLOTS } from '../data/items'
import { flow } from '../flow'
import { app } from '../engine/app'
import { ARENA_WAVES } from '../data/zones'
import { ZoneMode } from '../modes/zoneMode'
import { dummyBeat } from './dummy'
import { GOAL_LESSON, bossOf, goalSig, nextGoal, type Goal, type GoalCtx } from './goal'
import { talk } from '../talk'
import { hud } from '../state/hud'
import { markTip, profile } from '../state/profile'
import { coach, RECALL } from '../coach'
import { isAdShowing } from '@/use/useGamePause'
import { heroChoice } from '../heroChoice'
import { equipCandidate, stepOf, wantedHere, type FeatureCtx, type Step } from './features'
import { Nudger, type NudgeCand } from './nudge'
import { nudgeWorld } from './world'
import { MAP } from '../data/zones'
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

/** Where the player is, as the next goal reads it. */
export const liveGoalCtx = (): GoalCtx => {
  const z = app.mode instanceof ZoneMode && flow.screen === 'zone' ? app.mode : null
  return {
    screen: flow.screen,
    node: flow.node,
    modal: flow.modal,
    quest: flow.quest,
    pointsKept,
    zone: z
      ? {
          kind: z.setup.kind === 'arena' ? 'arena' : 'zone',
          node: flow.node,
          done: hud.groupsDone,
          total: hud.groupsTotal,
          boss: bossOf(z.plan.packs.find(p => p.finale)?.kinds),
          // The plate shows a boss: the finale's own, or a branch's.
          bossAwake: !!hud.bossKey && hud.bossKey === 'enemy.' + bossOf(z.plan.packs.find(p => p.finale)?.kinds),
          sideBoss: hud.bossKey && hud.bossKey !== 'enemy.' + bossOf(z.plan.packs.find(p => p.finale)?.kinds) ? hud.bossKey.slice(6) : '',
          encounter: !!flow.encounter,
          ended: z.sim.ended || '',
          dummy: dummyBeat(z.sim) === 'on',
          wave: hud.wave,
          waves: ARENA_WAVES
        }
      : null
  }
}

export const liveCtx = (): FeatureCtx => ({
  goal: onboard.goal?.id ?? '',
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
  isAdShowing.value || heroChoice.open || flow.loading || flow.screen === 'boot' ||
  flow.modal === 'pause' || flow.modal === 'help' || flow.modal === 'results' || flow.modal === 'ending' ||
  (typeof document !== 'undefined' && document.hidden)

/** A player who walked out on a trainer is not led back to one: the way
 *  to a trainer returns only when he asks (the tracker, "?"). */
const learned = (id: FeatureId): boolean => coach.learned(id) || (id === 'talk' && profile.tips.trainerSkipped === true && !coach.isRecalled('talk'))

// ── The goal ─────────────────────────────────────────────────────────────────

let goalKey = ''
/** Points on the sheet when it was opened, and whether he closed it on some
 *  (a choice to keep them: the town's goal moves on to the way out). */
let pointsAtOpen = -1
let pointsKept = false
/** Seconds in a town with the goal unchanged and nothing shown: the
 *  pointer comes back after STUCK_AFTER (a first-timer only). */
let stuckT = 0
export const STUCK_AFTER = 18

/** Work out the next goal, and keep the tracker's copy when it changes. */
const updateGoal = (): void => {
  const g = nextGoal(liveGoalCtx())
  const k = goalSig(g)
  if (k === goalKey) return
  const was = onboard.goal
  goalKey = k
  // The same goal counting on is progress, not a new goal.
  if (was && (!g || g.id !== was.id || g.place !== was.place || g.foe !== was.foe)) onboard.goalDoneN++
  onboard.goal = g
  onboard.goalN++
  stuckT = 0
  // A new goal is progress: whatever was nudging steps back.
  nudger.progress()
  worldBest = Infinity
  mapBest = Infinity
}

// ── Nudges (roadmap #69) ─────────────────────────────────────────────────────

export const nudger = new Nudger()
/** The closest the hero has come to the objective (world metres / map units). */
let worldBest = Infinity
let mapBest = Infinity
/** Getting this much closer counts as progress. */
const WORLD_STEP = 1.5
const MAP_STEP = 22

const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** The map's own state, read off its root: a fight alarm, a find, a rush to a place. */
const mapBusy = (): boolean => {
  const el = typeof document !== 'undefined' ? document.querySelector('.wmap') : null
  return !!el && (el.classList.contains('is-alarm') || el.classList.contains('is-rushing') || !!document.querySelector('.wmap__find, .wmap .card'))
}

/** What could be pointed at, here and now, most useful first. */
const nudgeCands = (): Array<NudgeCand & { sel: string; place: string }> => {
  const g = onboard.goal
  const out: Array<NudgeCand & { sel: string; place: string }> = []
  const add = (id: string, kind: NudgeCand['kind'], sel = '', place = ''): void => { out.push({ id, kind, sel, place }) }
  const w = nudgeWorld
  if (flow.screen === 'zone') {
    if (g?.id === 'exit') add('bounce:leave', 'bounce', '[data-coach="leave"]')
    if (hud.interactChest) add('bounce:chest', 'bounce', '.chest-prompt__btn')
    if (g && (g.id === 'clear' || g.id === 'boss' || g.id === 'dummy') && w.has) {
      if (!w.onScreen) add('edge:goal', 'edge')
      if (w.dist > 6) add('crumbs:goal', 'crumbs')
    }
    if (w.chest && g?.id !== 'exit') add('peek:chest', 'peek')
  } else if (flow.screen === 'town') {
    if (g?.id === 'trainer' && w.has && w.npc) {
      add('bounce:trainer', 'bounce', `.pin[data-npc="${w.npc}"] .pin__badge`)
      if (!w.onScreen) add('edge:goal', 'edge')
    }
    if (g?.id === 'points') add('bounce:hero', 'bounce', '[data-coach="menu-character"]')
    if (g?.id === 'leave') add('bounce:map', 'bounce', '[data-coach="menu-map"]')
  } else if (flow.screen === 'map') {
    if (g?.id === 'travel' && g.place) add(`mapWay:${g.place}`, 'mapWay', `.node[data-node="${g.place}"] .node__art`, g.place)
  }
  // An upgrade in the bag is worth a hop, but only once the goal's own cues
  // have had their say (or there are none): the goal comes first.
  if ((flow.screen === 'town' || flow.screen === 'map') && revealed('bag') && equipCandidate() && out.every(c => nudger.backedOff(c.id))) {
    add('bounce:bag', 'bounce', '[data-coach="menu-inventory"]')
  }
  return out
}

/** Is the hero getting any closer to the goal? (Then nothing nudges.) */
const senseProgress = (): void => {
  if (flow.screen === 'map') {
    const g = onboard.goal
    const node = g?.place ? MAP.find(n => n.id === g.place) : undefined
    const pos = profile.world.pos
    if (!node || !pos) return
    const d = Math.hypot((node.at[0] - pos[0]) * 1600, (node.at[1] - pos[1]) * 900)
    if (d < mapBest - MAP_STEP) { if (mapBest < Infinity) nudger.progress(); mapBest = d }
    if (mapBusy()) nudger.progress()
    return
  }
  const w = nudgeWorld
  if (!w.has) return
  if (w.dist < worldBest - WORLD_STEP) { if (worldBest < Infinity) nudger.progress(); worldBest = w.dist }
}

const tickNudges = (dt: number): void => {
  senseProgress()
  // A lesson's glyph on screen (a control's or a feature's) is already the pointer.
  const busy = blocked() || !!flow.modal || !!flow.talk || onboard.fight || onboard.shown || (flow.screen !== 'map' && hud.hints.length > 0) || hud.phase === 'dead' ||
    (flow.screen === 'map' && mapBusy()) || (flow.screen !== 'zone' && flow.screen !== 'town' && flow.screen !== 'map')
  const cands = busy ? [] : nudgeCands()
  const out = nudger.step({ now: clock, dt, blocked: busy, cands, firstTimer: !isVeteran(), reduced: reducedMotion() })
  const a = out.active
  const c = a ? cands.find(x => x.id === a.id) : undefined
  const cur = onboard.nudge
  if (!c) { if (cur) onboard.nudge = null; return }
  if (cur && cur.id === c.id && cur.style === out.style) return
  onboard.nudge = { id: c.id, kind: c.kind, sel: c.sel, place: c.place, style: out.style }
}

/** Bring a lesson back now, ahead of anything else the place could teach. */
const bringBack = (id: FeatureId | 'move'): void => {
  if (id === 'move') { coach.recall(['move', 'target']); return }
  coach.recall([id])
  pacer.breathe(clock)
  pacer.prefer(id, clock)
}

/** The tracker was tapped: show the way to the goal again. */
export const pointToGoal = (g: Goal | null = onboard.goal): void => {
  const id = g ? GOAL_LESSON[g.id] : undefined
  if (id) bringBack(id)
}

let acc = 0
/** One beat of the introductions (called every frame; decides ~10 times a second). */
export const tickOnboarding = (dt: number): void => {
  clock += dt
  calmFor = onboard.fight ? 0 : calmFor + dt
  acc += dt
  if (acc < 0.1) return
  acc = 0
  updateGoal()
  const ctx = liveCtx()
  const want = wantedHere(ctx, learned)
  const reveals = isVeteran() ? [] : REVEALS.filter(id => !revealed(id) && due(id) && hostCalm(id))
  const out = pacer.step({ now: clock, want, blocked: blocked(), reveals })
  if (out.reveal) markRevealed(out.reveal)
  if (onboard.lesson !== out.lesson) onboard.lesson = out.lesson
  if (onboard.shown !== out.shown) onboard.shown = out.shown
  tickNudges(0.1)
  // Lost in a town (or on the map): a first-timer who makes no progress for a while gets
  // the way to his goal back (talking, shops, houses all fine meanwhile).
  const calmTown = (flow.screen === 'town' || flow.screen === 'map') && !flow.modal && !flow.talk && !blocked()
  const askedOnly = onboard.goal?.id === 'trainer' && profile.tips.trainerSkipped === true
  if (!isVeteran() && calmTown && !out.shown && onboard.goal && !askedOnly) {
    stuckT += 0.1
    if (stuckT >= STUCK_AFTER) { stuckT = 0; pointToGoal() }
  } else stuckT = 0
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
    watch(() => [flow.screen, flow.node].join('|'), () => { nudger.visit(); worldBest = Infinity; mapBest = Infinity }, sync),
    watch(() => flow.screen, (now, was) => {
      pacer.breathe(clock)
      if (was === 'town' && now === 'map') nudger.used('bounce:map')
      pointsKept = false
      if (was === 'town' && now === 'map') {
        markRevealUsed('map')
        featureUsed('exit')
        // Walked out on the trainer: he is not led back to one unasked.
        if (onboard.goal?.id === 'trainer' && !profile.tips.trainerSkipped) markTip('trainerSkipped')
      }
    }, sync),
    watch(() => flow.modal, (now, was) => {
      if (!now && was) pacer.breathe(clock)
      else pacer.settle(clock)
      if (now === 'character') markRevealUsed('hero')
      else if (now === 'skills') markRevealUsed('skills')
      else if (now === 'inventory') markRevealUsed('bag')
      if (now === 'trainer') featureUsed('teach')
      // The sheet: the lesson rings every "+" until the points are spent, or
      // until he closes it having spent some (he keeps the rest).
      if (now === 'character') nudger.used('bounce:hero')
      if (now === 'inventory') nudger.used('bounce:bag')
      if (now === 'character') pointsAtOpen = profile.hero.points
      else if (was === 'character') {
        if (pointsAtOpen > profile.hero.points) { featureUsed('attr'); if (profile.hero.points > 0) pointsKept = true }
        pointsAtOpen = -1
      }
    }, sync),
    watch(() => flow.talk, (now, was) => {
      if (!now && was) pacer.breathe(clock)
      else pacer.settle(clock)
      if (now === 'npc' && flow.npc?.role === 'trainer') { featureUsed('talk'); nudger.used('bounce:trainer') }
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
    watch(() => profile.hero.points, (now, was) => { if (now < was && now === 0 && flow.modal === 'character') featureUsed('attr') }, sync),
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
  const nudgeWhy = (): Record<string, unknown> => ({ blocked: blocked(), modal: flow.modal, talk: flow.talk, fight: onboard.fight, lesson: onboard.shown, hints: hud.hints.length, phase: hud.phase, cands: nudgeCands().map(c => c.id), idle: nudger.idle, world: { ...nudgeWorld } })
  ;(window as unknown as Record<string, unknown>).__onboard = { nudgeWhy, pacer, nudger, nudgeWorld, onboard, currentStep, liveCtx, liveGoalCtx, recallHere, pointToGoal, blocked, clock: () => clock }
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
  onboard.goal = null
  onboard.goalN = 0
  onboard.goalDoneN = 0
  goalKey = ''
  stuckT = 0
  pointsAtOpen = -1
  pointsKept = false
  nudger.reset()
  onboard.nudge = null
  worldBest = Infinity
  mapBest = Infinity
}
