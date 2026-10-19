<template lang="pug">
  //- Where the hero is, in one badge under his frame: the place's emblem set into
  //- the frame's left end (a portrait slot), its name and level, and how far the
  //- clearing has come, a number over a row of gems. While the "clear" goal is on
  //- show a tap here shows the way to it again (the goal chip steps aside).
  component.zone(
    :is="tappable ? 'button' : 'div'"
    :type="tappable ? 'button' : undefined"
    :class="{ 'is-tap': tappable, 'is-town': isTown }"
    :aria-label="tappable ? t('goal.show', { goal: goalText }) : undefined"
    data-zone-badge
    @click="tappable && show()"
  )
    span.zone__slot(aria-hidden="true")
      GameIcon(name="map")
    span.zone__info
      span.zone__name {{ t(`node.${hud.zoneKey}.name`) }}
      span.zone__level(v-if="!isTown") {{ t('hud.level', { n: hud.zoneLevel }) }}
      //- The colosseum's week (#10): its modifier, always on show.
      span.zone__mod(v-if="hud.zoneKey === 'arena' && hud.arenaMod" data-arena-mod) {{ t(`ladder.mod.${hud.arenaMod}`) }}
    span.zone__progress(v-if="!isTown" role="img" :aria-label="progressLabel")
      span.zone__count(:class="{ 'is-wave': isArena }") {{ count }}
      span.zone__pips
        i(v-for="n in total" :key="n" :class="{ on: n <= done }")
</template>

<script setup lang="ts">
/** Top left, under the hero's frame and purse: the place, its level and the
 *  clearing so far (it replaces the two chips that said the same twice). */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { onboard } from '@/game/coach/state'
import { pointToGoal } from '@/game/coach/onboarding'
import { ARENA_WAVES } from '@/game/data/zones'
import { sfx } from '@/game/audio/sfx'
import GameIcon from '@/components/icons/GameIcon.vue'

const { t } = useI18n()

const isTown = computed(() => flow.screen !== 'zone')
const isArena = computed(() => hud.zoneKey === 'arena')
/** Gems: one per enemy group, or one per wave of the colosseum. */
const total = computed(() => (isArena.value ? ARENA_WAVES : hud.groupsTotal))
const done = computed(() => (isArena.value ? Math.max(0, hud.wave - 1) : hud.groupsDone))
const count = computed(() => (isArena.value ? String(Math.max(1, hud.wave)) : `${hud.groupsDone}/${hud.groupsTotal}`))
const progressLabel = computed(() => (isArena.value
  ? (hud.wave > ARENA_WAVES ? t('toast.wave', { n: hud.wave }) : t('hud.wave', { n: Math.max(1, hud.wave), total: ARENA_WAVES }))
  : t('hud.groups', { n: hud.groupsDone, total: hud.groupsTotal })))

const goal = computed(() => onboard.goal)
const tappable = computed(() => !isTown.value && goal.value?.id === 'clear')
const goalText = computed(() => (goal.value ? t(`goal.${goal.value.id}`, { place: goal.value.place ? t(`node.${goal.value.place}.name`) : '', foe: '' }) : ''))
const show = (): void => {
  sfx('uiClick')
  pointToGoal()
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.zone
  --slot: max(26px, calc(clamp(2rem, 8vmin, 2.7rem) * var(--hud-s, 1)))
  position: relative
  display: flex
  align-items: center
  gap: 0.45em
  // As wide as the hero's frame above it and no wider: a long name is cut, not grown.
  box-sizing: border-box
  width: 0
  min-width: 100%
  min-height: calc(var(--slot) * 0.78)
  margin: calc(clamp(0.2rem, 1vmin, 0.5rem) * var(--hud-s, 1)) 0 0
  padding: 0.12em 0.6em 0.12em calc(var(--slot) * 0.98)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0, var(--bc-paper-hi) 46%, var(--bc-paper) 46%, var(--bc-paper) 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-paper-ink)
  font-family: var(--font-ui)
  font-size: max(10px, calc(clamp(0.66rem, 2.8vmin, 0.95rem) * var(--hud-s, 1)))
  line-height: 1.1
  text-align: start
  text-shadow: none
  pointer-events: none
  &.is-tap
    pointer-events: auto
    cursor: pointer
    -webkit-tap-highlight-color: transparent
    // The tap area is a little larger than the badge (44 px on a phone).
    &::before
      content: ''
      position: absolute
      inset: -6px -0.2rem
    &:active
      transform: scale(0.97)
    &:focus-visible
      outline: 3px solid var(--bc-gold-hi)
      outline-offset: 2px
  &.is-town
    padding-right: 0.9em

// The emblem: a round gold-rimmed slot built into the frame's left end, a little taller than it.
.zone__slot
  position: absolute
  left: calc(var(--slot) * -0.12)
  top: 50%
  display: grid
  place-items: center
  width: var(--slot)
  height: var(--slot)
  transform: translateY(-50%)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  box-shadow: inset 0 0 0 max(2px, calc(var(--slot) * 0.09)) var(--bc-gold), inset 0 0 0 calc(max(2px, calc(var(--slot) * 0.09)) + var(--bc-ol-thin)) var(--bc-ink), var(--bc-drop)
  background: linear-gradient(180deg, var(--bc-purple) 0, var(--bc-purple) 46%, var(--bc-purple-deep) 46%, var(--bc-purple-deep) 100%)
  color: var(--bc-gold-hi)
  > :deep(svg), > :deep(img)
    width: 56%
    height: 56%

.zone__info
  flex: 1 1 auto
  min-width: 0
  display: flex
  flex-direction: column
  gap: 0.05em
.zone__name
  min-width: 0
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis
  font-weight: 900
.zone__level
  color: var(--bc-gold-deep)
  font-size: 0.88em
  font-weight: 800

// The clearing: the count over a row of gems, one per group (lit when beaten).
.zone__progress
  flex: 0 0 auto
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.15em
.zone__count
  color: var(--bc-green-deep)
  font-size: 0.92em
  font-weight: 900
  font-variant-numeric: tabular-nums
  &.is-wave
    color: var(--bc-orange-deep)
.zone__pips
  display: inline-flex
  flex-wrap: wrap
  justify-content: center
  max-width: 6.2em
  gap: 2px
  i
    width: 0.55em
    height: 0.55em
    border-radius: 50%
    border: var(--bc-ol-thin) solid var(--bc-ink)
    background: var(--bc-paper-deep)
    &.on
      background: linear-gradient(180deg, var(--bc-green-hi) 0, var(--bc-green-hi) 46%, var(--bc-green-lo) 46%, var(--bc-green-lo) 100%)
.zone__count.is-wave + .zone__pips i.on
  background: linear-gradient(180deg, var(--bc-orange-hi) 0, var(--bc-orange-hi) 46%, var(--bc-orange) 46%, var(--bc-orange) 100%)

.zone__mod
  align-self: flex-start
  padding: 0 0.4em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: var(--bc-red)
  color: var(--bc-text)
  font-size: 0.8em
  font-weight: 900
  text-shadow: var(--bc-text-outline-thin)
</style>
