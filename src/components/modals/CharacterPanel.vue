<template lang="pug">
  div.sheet
    div.sheet__top
      span.sheet__face
        Portrait(look="hero")
      div.sheet__id
        span.sheet__lvl {{ t('hud.level', { n: profile.level }) }}
        span.sheet__xpbar
          span.sheet__xpfill(:style="{ transform: `scaleX(${xp01()})` }")
        span.sheet__xp(v-if="profile.level < MAX_LEVEL") {{ fmt(profile.hero.xp) }} / {{ fmt(xpToNext(profile.level)) }} {{ t('hud.xp') }}
        span.sheet__xp(v-else) {{ t('sheet.maxLevel') }}
      span.sheet__points(v-if="profile.hero.points > 0" :key="profile.hero.points") {{ t('sheet.points', { n: profile.hero.points }) }}
    ul.attrs
      li.attr(v-for="a in ATTRS" :key="a" :style="{ '--c': ATTR_COLOR[a] }")
        span.attr__badge {{ t(`attr.${a}.short`) }}
        span.attr__text
          span.attr__name {{ t(`attr.${a}.name`) }}
          span.attr__desc {{ t(`attr.${a}.desc`) }}
        span.attr__val
          | {{ total[a] }}
          small(v-if="total[a] > profile.hero.attrs[a]")  (+{{ total[a] - profile.hero.attrs[a] }})
        button.attr__plus(
          type="button"
          :disabled="profile.hero.points <= 0"
          :aria-label="t('sheet.raise', { attr: t(`attr.${a}.name`) })"
          @click="raise(a)"
        )
          GameIcon(name="plus")
    dl.derived
      div.derived__cell(v-for="d in derived" :key="d.key")
        dt {{ t(`stat.${d.key}`) }}
        dd {{ d.value }}
</template>

<script setup lang="ts">
/** The character sheet (GDD §4): the six attributes, the points to spend on
 *  them, and what they add up to. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ATTRS, ATTR_COLOR, type Attr } from '@/game/data/attributes'
import { MAX_LEVEL, xpToNext } from '@/game/data/progression'
import { computeStats, profile, spendPoint, totalAttrs, xp01 } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import Portrait from '@/components/art/Portrait.vue'
import GameIcon from '@/components/icons/GameIcon.vue'

const { t } = useI18n()
const total = computed(() => totalAttrs())
const pct = (v: number): string => `${Math.round(v * 100)}%`

const derived = computed(() => {
  const s = computeStats()
  return [
    { key: 'health', value: fmt(s.maxHp) },
    { key: 'mana', value: fmt(s.maxMana) },
    { key: 'armor', value: fmt(s.armor) },
    { key: 'resist', value: pct(s.resist) },
    { key: 'crit', value: pct(s.critChance) },
    { key: 'critDamage', value: pct(s.critMult) },
    { key: 'attackSpeed', value: pct(s.attackSpeed) },
    { key: 'moveSpeed', value: `${s.moveSpeed.toFixed(1)}` },
    { key: 'cdr', value: pct(s.cdr) },
    { key: 'block', value: pct(s.block) },
    { key: 'dodge', value: pct(s.dodge) },
    { key: 'hpRegen', value: s.hpRegen.toFixed(1) }
  ]
})

const raise = (a: Attr): void => {
  if (spendPoint(a)) sfx('uiPoint')
  else sfx('denied')
}
</script>

<style scoped lang="sass">
.sheet
  display: flex
  flex-direction: column
  gap: clamp(0.5rem, 2.2vmin, 0.9rem)
  color: #fff
.sheet__top
  display: flex
  align-items: center
  gap: 0.7rem
  flex-wrap: wrap
.sheet__face
  width: clamp(3rem, 13vmin, 4.4rem)
.sheet__id
  flex: 1 1 8rem
  display: flex
  flex-direction: column
  gap: 0.2rem
  min-width: 0
.sheet__lvl
  font-size: clamp(1rem, 4.2vmin, 1.4rem)
  line-height: 1.1
.sheet__xpbar
  position: relative
  height: clamp(0.5rem, 2vmin, 0.75rem)
  border-radius: 999px
  border: 2px solid #0f1a30
  background: #1c2440
  overflow: hidden
.sheet__xpfill
  position: absolute
  inset: 0
  transform-origin: left center
  background: linear-gradient(90deg, #c58cff, #7fd8ff)
.sheet__xp
  color: #b9c4ee
  font-size: clamp(0.66rem, 2.7vmin, 0.84rem)
.sheet__points
  padding: 0.3em 0.8em
  border-radius: 999px
  border: 2px solid #0f1a30
  background: linear-gradient(180deg, #ffe066, #f0a020)
  color: #2a1a05
  font-size: clamp(0.78rem, 3.2vmin, 1rem)
  animation: points-pop 320ms cubic-bezier(0.2, 1.6, 0.4, 1)
.attrs
  margin: 0
  padding: 0
  list-style: none
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr))
  gap: clamp(0.3rem, 1.4vmin, 0.5rem)
.attr
  display: grid
  grid-template-columns: auto minmax(0, 1fr) auto auto
  align-items: center
  gap: 0.5rem
  padding: 0.35rem 0.5rem
  border-radius: 0.7rem
  border: 2px solid #0f1a30
  background: rgba(14, 20, 44, 0.7)
.attr__badge
  display: grid
  place-items: center
  width: clamp(2.2rem, 9vmin, 2.8rem)
  aspect-ratio: 1
  border-radius: 28%
  border: 2px solid #0f1a30
  background: var(--c)
  color: #1b1626
  font-size: clamp(0.68rem, 2.8vmin, 0.86rem)
.attr__text
  text-align: left
  display: flex
  flex-direction: column
  min-width: 0
.attr__name
  font-size: clamp(0.84rem, 3.4vmin, 1.02rem)
  line-height: 1.15
.attr__desc
  color: #a9b4de
  font-size: clamp(0.62rem, 2.5vmin, 0.78rem)
  line-height: 1.2
.attr__val
  font-size: clamp(1rem, 4.2vmin, 1.3rem)
  color: var(--c)
  white-space: nowrap
  small
    font-size: 0.62em
    color: #7dff8a
.attr__plus
  width: clamp(2.5rem, 10vmin, 2.9rem)
  aspect-ratio: 1
  padding: 22%
  border-radius: 50%
  border: 2px solid #0f1a30
  background: linear-gradient(180deg, #7dff8a, #2fb84a)
  box-shadow: 0 3px 0 #0f1a30
  color: #fff
  cursor: pointer
  touch-action: manipulation
  &:active:not(:disabled)
    transform: translateY(2px)
    box-shadow: 0 1px 0 #0f1a30
  &:disabled
    filter: grayscale(1)
    opacity: 0.4
    cursor: default
  svg
    display: block
    width: 100%
    height: 100%
.derived
  margin: 0
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(min(46%, 8.5rem), 1fr))
  gap: 0.3rem
.derived__cell
  display: flex
  justify-content: space-between
  gap: 0.5rem
  padding: 0.25rem 0.55rem
  border-radius: 0.5rem
  background: rgba(14, 20, 44, 0.55)
  font-size: clamp(0.7rem, 2.9vmin, 0.88rem)
  dt
    color: #b9c4ee
  dd
    margin: 0
@keyframes points-pop
  from
    transform: scale(0.7)
  to
    transform: scale(1)
</style>
