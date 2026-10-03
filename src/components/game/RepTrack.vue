<template lang="pug">
  //- Standing with the three factions (roadmap #15): −5…5, marks at the gift
  //- (+3) and the blessing (+5).
  div.rep(data-rep)
    div.rep__row(v-for="f in FACTIONS" :key="f" :data-faction="f" :style="{ '--tone': FACTION_COLOR[f] }")
      span.rep__name {{ t(`faction.${f}`) }}
      span.rep__track(role="meter" :aria-label="t('rep.meter', { name: t(`faction.${f}`), n: rep[f] })" :aria-valuenow="rep[f]" :aria-valuemin="REP_MIN" :aria-valuemax="REP_MAX")
        span.rep__zero
        span.rep__fill(:style="fill(rep[f])")
        span.rep__mark(v-for="m in MARKS" :key="m" :style="{ insetInlineStart: `${pos(m)}%` }" :class="{ 'is-reached': rep[f] >= m }")
      span.rep__n {{ rep[f] > 0 ? `+${rep[f]}` : rep[f] }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FACTIONS, FACTION_COLOR, REP_MAX, REP_MIN } from '@/game/data/quests'
import { REP_BLESSING, REP_GIFT } from '@/game/contracts'
import { profile } from '@/game/state/profile'

const { t } = useI18n()
const rep = computed(() => profile.quests.rep)
const MARKS = [REP_GIFT, REP_BLESSING]
const pos = (v: number): number => ((v - REP_MIN) / (REP_MAX - REP_MIN)) * 100
const fill = (v: number): Record<string, string> => {
  const a = pos(Math.min(0, v))
  const b = pos(Math.max(0, v))
  return { insetInlineStart: `${a}%`, width: `${b - a}%`, background: v < 0 ? 'var(--bc-red)' : 'var(--tone)' }
}
</script>

<style scoped lang="sass">
.rep
  display: flex
  flex-direction: column
  gap: 0.35rem
  width: 100%
.rep__row
  display: grid
  grid-template-columns: minmax(0, 1fr) minmax(5rem, 1.4fr) 2.2em
  align-items: center
  gap: 0.5rem
.rep__name
  min-width: 0
  overflow-wrap: anywhere
  font-size: clamp(0.66rem, 2.7vmin, 0.86rem)
  font-weight: 800
  line-height: 1.15
.rep__track
  position: relative
  height: 0.8rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 999px
  background: rgba(var(--bc-ink-rgb), 0.35)
  overflow: hidden
.rep__zero
  position: absolute
  inset-block: 0
  inset-inline-start: 50%
  width: 2px
  background: var(--bc-ink)
.rep__fill
  position: absolute
  inset-block: 0
.rep__mark
  position: absolute
  inset-block: 0
  width: 2px
  margin-inline-start: -1px
  background: rgba(var(--bc-white-rgb), 0.6)
  &.is-reached
    background: var(--bc-ink)
.rep__n
  font-size: clamp(0.7rem, 2.8vmin, 0.9rem)
  font-weight: 900
  text-align: end
  font-variant-numeric: tabular-nums
</style>
