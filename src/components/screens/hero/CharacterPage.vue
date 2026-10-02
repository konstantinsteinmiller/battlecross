<template lang="pug">
  div.sheet
    //- ── Who he is ───────────────────────────────────────────────────────────
    section.sheet__who
      span.sheet__face
        Portrait(look="hero")
      div.sheet__id
        span.sheet__lvl {{ t('hud.level', { n: profile.level }) }}
        FBar.sheet__xpbar(:value="xp01()" tone="xp" frame="xp" :label="t('hud.xp')")
        span.sheet__xp(v-if="profile.level < MAX_LEVEL") {{ fmt(profile.hero.xp) }} / {{ fmt(xpToNext(profile.level)) }} {{ t('hud.xp') }}
        span.sheet__xp(v-else) {{ t('sheet.maxLevel') }}
      span.sheet__points(v-if="profile.hero.points > 0" :key="profile.hero.points") {{ t('sheet.points', { n: profile.hero.points }) }}

    div.sheet__rest
      //- ── The six attributes ────────────────────────────────────────────────
      ul.attrs
        li.attr(
          v-for="a in ATTRS"
          :key="a"
          :class="{ 'is-peek': peek === a }"
          :style="{ '--c': ATTR_COLOR[a] }"
          @pointerenter="onEnter($event, a)"
          @pointerleave="onLeave($event, a)"
        )
          span.attr__badge(:data-attr="a") {{ t(`attr.${a}.short`) }}
          span.attr__text
            span.attr__name {{ t(`attr.${a}.name`) }}
            span.attr__desc {{ t(`attr.${a}.desc`) }}
            //- What the next point is worth, in the sheet's own numbers.
            span.attr__gain(v-if="profile.hero.points > 0 && gains[a].length")
              span.attr__gain-lead {{ t('sheet.next') }}
              span.attr__gain-stat(v-for="g in gains[a]" :key="g.key") {{ t(`stat.${g.key}`) }} {{ g.deltaText }}
          span.attr__val
            span.attr__n(:key="total[a]") {{ total[a] }}
            small(v-if="total[a] > profile.hero.attrs[a]") +{{ total[a] - profile.hero.attrs[a] }}
          button.attr__plus(
            type="button"
            :disabled="profile.hero.points <= 0"
            :aria-label="t('sheet.raise', { attr: t(`attr.${a}.name`) })"
            @focus="peek = a"
            @blur="peek = ''"
            @click="raise(a)"
          )
            GameIcon(name="plus")

      //- ── What it all adds up to ────────────────────────────────────────────
      section.sheet__stats
        StatList(:rows="rows" layout="rows")
</template>

<script setup lang="ts">
/**
 * The character page (GDD §4): who the hero is, the six attributes with the
 * points to spend on them, and what they add up to. Before a point is spent
 * the page says what it would buy: each attribute lists what its next point
 * changes, and resting on a "+" (hover, focus, or the tap itself) shows the
 * new numbers in the list of derived stats.
 */
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ATTRS, ATTR_COLOR, type Attr } from '@/game/data/attributes'
import { MAX_LEVEL, xpToNext } from '@/game/data/progression'
import { computeStats, profile, spendPoint, totalAttrs, xp01 } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import Portrait from '@/components/art/Portrait.vue'
import FBar from '@/components/atoms/FBar.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import StatList from '@/components/game/StatList.vue'
import { statRows, statsWithAttrs, type StatRow } from '@/components/game/heroSheet'
import { burst, shake } from '@/components/game/fx'

const { t } = useI18n()
const total = computed(() => totalAttrs())

/** The attribute whose "+" is being considered. */
const peek = ref<Attr | ''>('')
const plusOne = (a: Attr) => statsWithAttrs({ ...profile.hero.attrs, [a]: profile.hero.attrs[a] + 1 })

const rows = computed<StatRow[]>(() => {
  const now = computeStats()
  return statRows(now, peek.value && profile.hero.points > 0 ? plusOne(peek.value) : now)
})
/** Per attribute: the stats one more point would move. */
const gains = computed(() => {
  const now = computeStats()
  const out = {} as Record<Attr, StatRow[]>
  for (const a of ATTRS) out[a] = statRows(now, plusOne(a)).filter(r => r.delta !== 0)
  return out
})

// A mouse previews by resting on the row; a finger by tapping "+" (which
// also spends the point: the preview then shows what the NEXT one buys).
const onEnter = (e: PointerEvent, a: Attr): void => { if (e.pointerType === 'mouse') peek.value = a }
const onLeave = (e: PointerEvent, a: Attr): void => { if (e.pointerType === 'mouse' && peek.value === a) peek.value = '' }

const raise = (a: Attr): void => {
  const badge = document.querySelector<HTMLElement>(`.attr__badge[data-attr="${a}"]`)
  if (!spendPoint(a)) { sfx('denied'); shake(badge); return }
  sfx('uiPoint')
  peek.value = a
  void nextTick(() => burst(badge, ATTR_COLOR[a]))
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'

.sheet
  --gap: clamp(0.35rem, 1.6vmin, 0.8rem)
  flex: 1 1 auto
  min-height: 0
  display: grid
  gap: var(--gap)
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.5fr) minmax(0, 0.9fr)
  grid-template-rows: minmax(0, 1fr)
  width: 100%
  max-width: 82rem
  margin-inline: auto
.sheet__rest
  display: contents

// ── Who he is: set straight on the backdrop ──────────────────────────────────
.sheet__who
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.4rem, 1.8vmin, 0.9rem)
  min-width: 0
  min-height: 0
.sheet__face
  width: min(70%, 13rem)
  filter: drop-shadow(0 0.4rem 0 rgba(var(--bc-ink-rgb), 0.3))
.sheet__id
  display: flex
  flex-direction: column
  align-items: stretch
  gap: 0.25rem
  width: min(100%, 16rem)
  min-width: 0
  text-align: center
.sheet__lvl
  +cel.label
  font-size: clamp(1.1rem, 4.6vmin, 1.7rem)
  line-height: 1.1
.sheet__xpbar
  --fbar-h: clamp(0.7rem, 2.6vmin, 1rem)
.sheet__xp
  +cel.label
  color: var(--bc-text-xp)
  font-size: clamp(0.68rem, 2.8vmin, 0.86rem)
  text-shadow: var(--bc-text-outline-thin)
.sheet__points
  +cel.tone('gold')
  padding: 0.3em 0.9em
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  +cel.fill(46%, 88%)
  box-shadow: var(--bc-drop)
  +cel.label
  font-size: clamp(0.8rem, 3.3vmin, 1.05rem)
  text-align: center
  animation: points-pop 320ms var(--bc-ease-pop)

// ── The attributes ───────────────────────────────────────────────────────────
.attrs
  margin: 0
  padding: clamp(0.4rem, 1.8vmin, 0.8rem)
  list-style: none
  display: flex
  flex-direction: column
  gap: clamp(0.25rem, 1.2vmin, 0.5rem)
  min-width: 0
  min-height: 0
  +screen.page
  +screen.scroller
.attr
  display: grid
  grid-template-columns: auto minmax(0, 1fr) auto auto
  align-items: center
  gap: clamp(0.35rem, 1.6vmin, 0.7rem)
  padding: 0.3rem 0.4rem
  border: var(--bc-ol-thin) solid transparent
  border-radius: var(--bc-r-md)
  background: var(--bc-cell)
  transition: background-color 140ms ease-out, border-color 140ms ease-out
  &.is-peek
    border-color: var(--bc-ink)
    background: color-mix(in srgb, var(--c) 26%, var(--bc-paper-hi))
.attr__badge
  display: grid
  place-items: center
  width: clamp(2.3rem, 9.5vmin, 2.9rem)
  aspect-ratio: 1
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 28%
  background: linear-gradient(180deg, color-mix(in srgb, var(--c) 66%, var(--bc-white)) 0, color-mix(in srgb, var(--c) 66%, var(--bc-white)) 46%, var(--c) 46%, var(--c) 100%)
  box-shadow: var(--bc-drop)
  +cel.label
  font-size: clamp(0.66rem, 2.7vmin, 0.84rem)
  text-shadow: var(--bc-text-outline-thin)
.attr__text
  display: flex
  flex-direction: column
  gap: 0.08rem
  min-width: 0
  text-align: start
.attr__name
  font-size: clamp(0.84rem, 3.4vmin, 1.02rem)
  line-height: 1.15
.attr__desc
  color: var(--bc-on-soft)
  font-size: clamp(0.62rem, 2.5vmin, 0.78rem)
  line-height: 1.2
.attr__gain
  display: flex
  flex-wrap: wrap
  gap: 0.1rem 0.45rem
  color: var(--bc-on-good)
  font-size: clamp(0.62rem, 2.5vmin, 0.78rem)
  line-height: 1.2
.attr__gain-lead
  color: var(--bc-on-soft)
.attr__gain-stat
  white-space: nowrap
.attr__val
  display: flex
  flex-direction: column
  align-items: flex-end
  font-size: clamp(1.05rem, 4.3vmin, 1.35rem)
  line-height: 1
  font-variant-numeric: tabular-nums
  white-space: nowrap
  small
    color: var(--bc-on-good)
    font-size: 0.58em
.attr__n
  display: inline-block
  animation: points-pop 300ms var(--bc-ease-pop)
// The "+": a round green button at a finger's size.
.attr__plus
  +cel.tone('green')
  position: relative
  flex: 0 0 auto
  width: 2.75rem
  height: 2.75rem
  padding: 0.65rem
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: 50%
  +cel.fill(46%, 86%)
  box-shadow: 0 var(--bc-press-sm) 0 var(--bc-ink)
  color: var(--bc-text)
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
  +cel.focus-ring
  &:active:not(:disabled)
    transition-duration: var(--bc-t-press)
    transform: translateY(var(--bc-press-sm)) scale(1.04, 0.94)
    box-shadow: 0 0 0 var(--bc-ink)
  &:disabled
    +cel.tone('off')
    cursor: default
    opacity: 0.6
  :deep(svg)
    display: block
    width: 100%
    height: 100%
    filter: drop-shadow(0 2px 0 var(--bc-ink))

// ── The derived stats ────────────────────────────────────────────────────────
.sheet__stats
  min-width: 0
  min-height: 0
  align-self: start
  max-height: 100%
  padding: clamp(0.4rem, 1.8vmin, 0.8rem)
  +screen.plate('slate')
  +screen.scroller

// ── Portrait: he is a strip across the top; the rest scrolls ─────────────────
@media (max-aspect-ratio: 1/1)
  .sheet
    grid-template-columns: minmax(0, 1fr)
    grid-template-rows: auto minmax(0, 1fr)
    max-width: 44rem
  .sheet__who
    flex-direction: row
    flex-wrap: wrap
    justify-content: flex-start
  .sheet__face
    width: clamp(3.4rem, 17vmin, 6rem)
    flex: 0 0 auto
  .sheet__id
    flex: 1 1 8rem
    width: auto
    text-align: start
  .sheet__rest
    display: flex
    flex-direction: column
    gap: var(--gap)
    +screen.scroller
    touch-action: pan-y
  .attrs, .sheet__stats
    flex: 0 0 auto
    max-height: none
    overflow: visible
  .sheet__stats :deep(.stats)
    grid-template-columns: repeat(2, minmax(0, 1fr))

// ── A short landscape: he keeps to a narrow column ───────────────────────────
@media (min-aspect-ratio: 1/1) and (max-height: 30rem)
  .sheet
    grid-template-columns: minmax(0, 0.6fr) minmax(0, 1.6fr) minmax(0, 0.9fr)
  .sheet__face
    width: min(60%, 5rem)
  .attr__desc
    display: none

@keyframes points-pop
  from
    transform: scale(0.7)
  to
    transform: scale(1)
@media (prefers-reduced-motion: reduce)
  .sheet__points, .attr__n
    animation: none
</style>
