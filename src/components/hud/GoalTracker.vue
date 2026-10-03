<template lang="pug">
  //- One short goal, always: what to do next (`game/coach/goal.ts`). A tap
  //- shows the way to it again.
  button.goal(
    v-if="visible && goal"
    type="button"
    :class="[`goal--${goal.id}`, { 'is-done': flashing }]"
    :aria-label="t('goal.show', { goal: text })"
    @click="show"
  )
    span.goal__icon(:key="`i${who}`" aria-hidden="true")
      GameIcon(:name="ICON[goal.id]")
      //- A goal reached: a tick flashes over the icon as the next one comes in.
      span.goal__tick(v-if="flashing" :key="`t${onboard.goalDoneN}`")
        GameIcon(name="check")
    span.goal__text(:key="`g${who}`") {{ text }}
    span.goal__count(v-if="count" :key="`c${count}`") {{ count }}
</template>

<script setup lang="ts">
/**
 * ─── The goal tracker (roadmap #2) ───────────────────────────────────────────
 *
 * A parchment chip under the place's name: an icon, one short goal, and its
 * progress when it has one ("Clear the Sunford Plains 1/3"). It pops when the
 * goal changes and flashes a tick when one is reached. Tapping it (clicking
 * it) brings back the pointer to the goal: the walk up the road, the way to a
 * trainer, the ring on the hero sheet or the map button.
 *
 * It steps aside for conversations, windows, ads and the result screen, and
 * it is for everybody: a returning player sees it too (but no lessons).
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { flow } from '@/game/flow'
import { onboard } from '@/game/coach/state'
import { pointToGoal } from '@/game/coach/onboarding'
import type { GoalId } from '@/game/coach/goal'
import { isAdShowing } from '@/use/useGamePause'
import { sfx } from '@/game/audio/sfx'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { GameIconName } from '@/components/icons/iconNames'

const { t } = useI18n()

const ICON: Record<GoalId, GameIconName> = {
  dummy: 'sword', clear: 'sword', boss: 'skull', exit: 'forward', wave: 'trophy',
  trainer: 'chat', learn: 'book', points: 'plus', leave: 'map', travel: 'map', decide: 'chat', explore: 'map'
}

const goal = computed(() => onboard.goal)
/** Which goal it is (its progress aside): a new one pops in, a count only bumps. */
const who = computed(() => (goal.value ? `${goal.value.id}|${goal.value.place ?? ''}|${goal.value.foe ?? ''}` : ''))
const visible = computed(() => !flow.talk && !flow.modal && !flow.loading && !isAdShowing.value)

const text = computed(() => {
  const g = goal.value
  if (!g) return ''
  return t(`goal.${g.id}`, {
    place: g.place ? t(`node.${g.place}.name`) : '',
    foe: g.foe ? t(`enemy.${g.foe}`) : ''
  })
})
/** "1/3", or a lone count ("3" points), or nothing. */
const count = computed(() => {
  const g = goal.value
  if (!g || g.n === undefined) return ''
  return g.of ? `${g.n}/${g.of}` : g.n > 0 ? String(g.n) : ''
})

/** A goal reached: the tick shows for a moment. */
const flashing = ref(false)
let timer = 0
watch(() => onboard.goalDoneN, () => {
  flashing.value = true
  window.clearTimeout(timer)
  timer = window.setTimeout(() => { flashing.value = false }, 900)
})

const show = (): void => {
  sfx('uiClick')
  pointToGoal()
}
</script>

<style scoped lang="sass">
.goal
  position: relative
  display: inline-flex
  align-items: center
  gap: 0.4em
  max-width: min(100%, 22rem)
  min-height: clamp(2.2rem, 8.6vmin, 2.6rem)
  margin: 0
  padding: 0.15em 0.75em 0.15em 0.25em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0, var(--bc-paper-hi) 46%, var(--bc-paper) 46%, var(--bc-paper) 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-paper-ink)
  font-family: var(--font-ui)
  font-size: clamp(0.68rem, 2.9vmin, 0.98rem)
  line-height: 1.1
  text-align: start
  cursor: pointer
  pointer-events: auto
  -webkit-tap-highlight-color: transparent
  user-select: none
  -webkit-user-select: none
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
  // The tap area is a little larger than the chip (44 px on a phone).
  &::before
    content: ''
    position: absolute
    inset: -0.35rem -0.2rem
  &:active
    transition-duration: var(--bc-t-press)
    transform: scale(0.95)
  &:focus-visible
    outline: 3px solid var(--bc-gold-hi)
    outline-offset: 2px
.goal__icon
  position: relative
  flex: 0 0 auto
  display: grid
  place-items: center
  width: clamp(1.7rem, 6.6vmin, 2.05rem)
  height: clamp(1.7rem, 6.6vmin, 2.05rem)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: linear-gradient(180deg, var(--bc-gold-hi) 0, var(--bc-gold-hi) 46%, var(--bc-gold) 46%, var(--bc-gold) 100%)
  color: var(--bc-ink)
  animation: goal-pop 520ms var(--bc-ease-bounce) both
  > :deep(svg), > :deep(img)
    width: 66%
    height: 66%
.goal--boss .goal__icon
  background: linear-gradient(180deg, var(--bc-red-hi) 0, var(--bc-red-hi) 46%, var(--bc-red) 46%, var(--bc-red) 100%)
  color: var(--bc-text)
.goal__text
  min-width: 0
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  animation: goal-in 420ms ease-out both
.goal__count
  flex: 0 0 auto
  padding: 0.05em 0.45em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: var(--bc-ink)
  color: var(--bc-gold-hi)
  font-size: 0.92em
  animation: goal-bump 360ms var(--bc-ease-bounce) both
// Reached: a green tick over the icon, and a green glow round the chip.
.goal__tick
  position: absolute
  inset: -2px
  display: grid
  place-items: center
  border-radius: 50%
  background: var(--bc-green)
  color: var(--bc-text)
  animation: goal-tick 900ms ease-out both
  :deep(svg), :deep(img)
    width: 70%
    height: 70%
.goal.is-done
  animation: goal-glow 900ms ease-out
@keyframes goal-pop
  0%
    transform: scale(0.2)
  60%
    transform: scale(1.25)
  100%
    transform: scale(1)
@keyframes goal-in
  from
    opacity: 0
    transform: translateY(0.35em)
  to
    opacity: 1
    transform: none
@keyframes goal-bump
  0%
    transform: scale(1)
  40%
    transform: scale(1.3)
  100%
    transform: scale(1)
@keyframes goal-tick
  0%
    opacity: 0
    transform: scale(0.4)
  20%
    opacity: 1
    transform: scale(1.2)
  70%
    opacity: 1
    transform: scale(1)
  100%
    opacity: 0
@keyframes goal-glow
  0%, 100%
    box-shadow: var(--bc-drop)
  30%
    box-shadow: var(--bc-drop), 0 0 0 3px var(--bc-green-hi), 0 0 1rem var(--bc-green-hi)
@media (prefers-reduced-motion: reduce)
  .goal__icon, .goal__text, .goal__count, .goal__tick, .goal.is-done
    animation: none
</style>
