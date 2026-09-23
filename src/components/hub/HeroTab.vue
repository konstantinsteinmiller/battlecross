<template lang="pug">
  div.hero.sheet
    div.scroll
      button.attr-cta(v-if="profile.hero.pendingAttrs > 0" type="button" @click="flow.modal = 'levelUp'")
        | {{ t('hero.attrPending', { n: profile.hero.pendingAttrs }) }}
      div.section-title {{ t('hero.stats') }}
      div.stats
        div.stat(v-for="s in statRows" :key="s.k")
          span.k {{ t(s.k) }}
          span.v {{ s.v }}
      div.section-title {{ t('hero.attributes') }}
      div.attrs
        div.attr(v-for="a in ATTRS" :key="a" :class="a")
          GameIcon.ai(:name="ATTR_ICON[a]")
          span.an {{ t(`attr.${a}.name`) }}
          span.av {{ profile.hero.attrs[a] }}
      slot
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import { profile, computeStats, armorTotal } from '@/game/state/profile'
import { ATTR_ICON, type Attr } from '@/game/data/progression'
import { flow } from '@/game/flow'

/** Cobalt's sheet: derived combat stats and attribute points. */
const { t } = useI18n()
const ATTRS: Attr[] = ['hp', 'we', 'power']
const pct = (v: number) => `${Math.round(v * 100)}%`
const statRows = computed(() => {
  void profile.level
  const s = computeStats()
  return [
    { k: 'hero.stat.hp', v: s.maxHp },
    { k: 'hero.stat.we', v: s.maxWe },
    { k: 'hero.stat.power', v: s.maxPower },
    { k: 'hero.stat.damage', v: Math.round(s.busterDmg * s.pelletMul) },
    { k: 'hero.stat.charge', v: Math.round(s.busterDmg * 4 * s.chargeDmgMul) },
    { k: 'hero.stat.armor', v: armorTotal() },
    { k: 'hero.stat.crit', v: pct(s.critChance) },
    { k: 'hero.stat.tanks', v: `${profile.inv.tanks}/${s.tanksMax}` }
  ]
})
</script>

<style scoped lang="sass">
@use './sheet'
.attr-cta
  padding: 10px
  border-radius: 12px
  border: 3px solid #141a33
  background: linear-gradient(#ffd23a, #e08a00)
  color: #141a33
  font-family: var(--font-ui)
  font-size: clamp(13px, 2.8vmin, 16px)
  animation: cta 1.2s ease-in-out infinite
.stats
  display: grid
  grid-template-columns: repeat(2, 1fr)
  gap: 4px 12px
  padding: 8px 12px
  border-radius: 12px
  background: rgba(0, 0, 0, 0.25)
.stat
  display: flex
  justify-content: space-between
  font-size: clamp(12px, 2.6vmin, 15px)
.k
  color: #cfe0ff
.v
  font-family: var(--font-pixel)
  font-size: 0.75em
  color: #fff
.attrs
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: 8px
.attr
  display: flex
  align-items: center
  gap: 6px
  padding: 8px
  border-radius: 12px
  border: 2px solid #141a33
  font-size: clamp(12px, 2.6vmin, 14px)
  &.hp
    background: linear-gradient(#d0303f, #7a1420)
  &.we
    background: linear-gradient(#1f7fd0, #123c6e)
  &.power
    background: linear-gradient(#2f9a3f, #145a22)
.ai
  width: 20px
  height: 20px
.av
  margin-left: auto
  font-family: var(--font-pixel)
  font-size: 0.75em
@keyframes cta
  50%
    transform: scale(1.03)
</style>
