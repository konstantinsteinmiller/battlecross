<template lang="pug">
  div.journal
    //- Errands (#85, #86, #89): what people asked, where it stands, what is next.
    section.journal__section
      h3.journal__head {{ t('journal.errands') }}
      p.journal__empty(v-if="entries.length === 0") {{ t('journal.empty') }}
      ul.journal__list
        li.errand(v-for="e in entries" :key="e.def.id" :class="{ 'is-ready': e.state === 'ready' }" :data-errand="e.def.id")
          div.errand__top
            span.errand__title {{ t(`errand.${e.def.id}.title`) }}
            span.errand__from {{ t('journal.from', { npc: t(`npc.${e.def.giver}.name`) }) }}
          //- The steps: the ones behind ticked, the current one with its count.
          ol.errand__steps
            li.errand__step(
              v-for="(s, i) in e.def.steps"
              :key="i"
              :class="{ 'is-done': i < e.save.step || e.state === 'ready', 'is-now': i === e.save.step && e.state !== 'ready', 'is-later': i > e.save.step }"
            )
              span.errand__mark(aria-hidden="true")
                GameIcon(v-if="i < e.save.step || e.state === 'ready'" name="check")
              span.errand__text {{ stepText(s) }}
              span.errand__count(v-if="s.n > 1 && i === e.save.step && e.state !== 'ready'") {{ e.counts[i] }}/{{ s.n }}
          p.errand__ready(v-if="e.state === 'ready'") {{ t('journal.ready', { npc: t(`npc.${e.def.giver}.name`) }) }}
</template>

<script setup lang="ts">
/**
 * ─── The journal (roadmap #85, #86, #89, D100) ───────────────────────────────
 *
 * The fourth page of the hero's book: every errand taken and not yet handed
 * in, with who asked, the steps behind (ticked), the one he is on (with its
 * count) and the ones still to come; an errand that is done says so in green
 * and names who to go back to.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { errandWorld, openErrands } from '@/game/state/profile'
import { stepHave } from '@/game/errands'
import type { ErrandStep } from '@/game/data/errands'
import GameIcon from '@/components/icons/GameIcon.vue'

const { t } = useI18n()

const entries = computed(() => {
  const w = errandWorld()
  // Ready ones first: those are the ones to act on.
  return openErrands()
    .map(e => ({ ...e, counts: e.def.steps.map(s => stepHave(s, e.save, w)) }))
    .sort((a, b) => Number(b.state === 'ready') - Number(a.state === 'ready'))
})

const place = (p?: string): string => (p ? t(`node.${p}.name`) : '')
const stepText = (s: ErrandStep): string => {
  switch (s.kind) {
    case 'slay':
      return s.place
        ? t(s.enemy ? 'journal.step.slayAt' : 'journal.step.slayAnyAt', { n: s.n, enemy: s.enemy ? t(`enemy.${s.enemy}`) : '', place: place(s.place) })
        : t('journal.step.slay', { n: s.n, enemy: t(`enemy.${s.enemy ?? ''}`) })
    case 'clear': return t('journal.step.clear', { place: place(s.place) })
    case 'visit': return t('journal.step.visit', { place: place(s.place) })
    case 'gather': return t('journal.step.gather', { n: s.n, plant: t(`plant.${s.plant ?? ''}.name`) })
    case 'bring': return t('journal.step.bring', { item: t(`item.${s.item ?? ''}.name`) })
    case 'pieces': return t('journal.step.pieces', { n: s.n })
    case 'dig': return t('journal.step.dig', { place: place(s.place) })
    case 'talk': return t('journal.step.talk', { npc: t(`npc.${s.npc ?? ''}.name`) })
  }
  return ''
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'

.journal
  display: flex
  flex-direction: column
  gap: clamp(0.6rem, 2.4vmin, 1rem)
  max-width: 46rem
  width: 100%
  margin: 0 auto
  min-height: 0
  +screen.scroller
.journal__section
  display: flex
  flex-direction: column
  gap: 0.5rem
.journal__head
  margin: 0
  +cel.label
  font-size: clamp(0.95rem, 3.8vmin, 1.25rem)
  color: var(--bc-text)
  text-shadow: var(--bc-text-outline)
.journal__empty
  margin: 0.5rem 0
  color: var(--bc-stitch)
  font-size: clamp(0.8rem, 3.2vmin, 1rem)
.journal__list
  display: flex
  flex-direction: column
  gap: 0.6rem
  margin: 0
  padding: 0
  list-style: none
// An errand: a slip of parchment; green-edged when it is ready to hand in.
.errand
  display: flex
  flex-direction: column
  gap: 0.35rem
  padding: clamp(0.55rem, 2.2vmin, 0.85rem)
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  background: var(--bc-paper)
  color: var(--bc-paper-ink)
  box-shadow: var(--bc-drop)
  &.is-ready
    border-color: var(--bc-green-lo)
    box-shadow: 0 0 0 3px var(--bc-green), var(--bc-drop)
.errand__top
  display: flex
  flex-wrap: wrap
  align-items: baseline
  justify-content: space-between
  gap: 0.2rem 0.6rem
.errand__title
  +cel.label
  font-size: clamp(0.9rem, 3.4vmin, 1.1rem)
.errand__from
  color: var(--bc-paper-ink-soft)
  font-size: clamp(0.72rem, 2.8vmin, 0.88rem)
.errand__steps
  display: flex
  flex-direction: column
  gap: 0.25rem
  margin: 0
  padding: 0
  list-style: none
.errand__step
  display: flex
  align-items: center
  gap: 0.45rem
  font-size: clamp(0.78rem, 3vmin, 0.95rem)
  &.is-later
    opacity: 0.5
  &.is-done .errand__text
    text-decoration: line-through
    color: var(--bc-paper-ink-soft)
.errand__mark
  flex: 0 0 auto
  width: 1.1em
  height: 1.1em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-white)
  color: var(--bc-green-lo)
  .is-done &
    background: var(--bc-green)
    color: var(--bc-white)
  .is-now &
    background: var(--bc-gold)
.errand__text
  flex: 1 1 auto
  min-width: 0
.errand__count
  flex: 0 0 auto
  font-variant-numeric: tabular-nums
  +cel.label
.errand__ready
  margin: 0
  +cel.label
  color: var(--bc-green-lo)
</style>
