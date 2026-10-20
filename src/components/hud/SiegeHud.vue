<template lang="pug">
  div.siege-hud(v-if="v.active" data-siege-hud)
    //- The gate, always on show (§8.5): its health, the wave of ten, the Marks in hand.
    div.siege-hud__gate(role="group" :aria-label="t('siege.hud.gate', { pct: pct(v.gate01) })")
      div.siege-hud__row
        span.siege-hud__wave {{ t('siege.hud.wave', { n: v.wave, total: SIEGE_WAVES }) }}
        span.siege-hud__marks(data-siege-marks) {{ t('siege.hud.marks', { n: v.marks }) }}
      div.siege-hud__bar(:class="{ 'is-low': v.gate01 <= 0.25, 'is-half': v.gate01 <= 0.5 }")
        i.siege-hud__fill(:style="{ transform: `scaleX(${Math.max(0, Math.min(1, v.gate01))})` }")
        span.siege-hud__label {{ t('siege.hud.gate', { pct: pct(v.gate01) }) }}
      //- The fifth wave's captain, the tenth's Siege Lord.
      div.siege-hud__boss(v-if="v.bossKey" data-siege-boss)
        span.siege-hud__bossname {{ t(v.bossKey) }}
        div.siege-hud__bar.is-boss
          i.siege-hud__fill(:style="{ transform: `scaleX(${Math.max(0, Math.min(1, v.boss01))})` }")
    //- Between waves: what the Marks can buy, and the clock to the next wave.
    div.siege-hud__build(v-if="v.phase === 'build' && flow.screen === 'zone' && !flow.modal" data-siege-build)
      p.siege-hud__clock {{ t('siege.hud.build', { n: v.wave, s: v.buildT }) }}
      div.siege-hud__defs
        button.def(
          v-for="d in DEFENCES"
          :key="d"
          type="button"
          :class="{ 'is-off': v.blocks[d] !== '' }"
          :aria-disabled="v.blocks[d] !== ''"
          :aria-label="t('siege.hud.buy', { name: t(`siege.def.${d}.name`), n: DEFENCE_COST[d] })"
          :title="t(`siege.def.${d}.desc`)"
          :data-siege-def="d"
          @click="buy(d)"
        )
          span.def__icon
            GameIcon(:name="ICON[d]")
          span.def__name {{ t(`siege.def.${d}.name`) }}
          span.def__cost {{ DEFENCE_COST[d] }}
      p.siege-hud__why(v-if="why" aria-live="polite") {{ why }}
      FButton.siege-hud__ready(:label="t('siege.hud.ready')" type="danger" size="sm" icon="skip-forward" data-siege-ready @click="ready")
    //- A wave's number, big, as it comes (§8.5).
    Transition(name="siege-banner")
      p.siege-hud__banner(v-if="banner" :key="banner.id") {{ banner.text }}
</template>

<script setup lang="ts">
/**
 * ─── The siege's HUD (afterplay §8.5) ───────────────────────────────────────
 *
 * The gate's health bar is always on show, with the wave of ten and the
 * Marks in hand; the siege's boss gets a bar of its own. In a build phase the
 * five defences are offered with their costs (one that cannot be bought now
 * answers why when tapped) and Ready brings the wave at once. Reads the
 * scene's mirror (`state/siegeHud.ts`); taps go back through `siegeActions`.
 */
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { flow } from '@/game/flow'
import { siegeActions, siegeHud } from '@/game/state/siegeHud'
import { DEFENCES, DEFENCE_COST, SIEGE_WAVES, type DefenceId } from '@/game/data/siege'
import { sfx } from '@/game/audio/sfx'
import GameIcon from '@/components/icons/GameIcon.vue'
import FButton from '@/components/atoms/FButton.vue'
import type { GameIconName } from '@/components/icons/iconNames'

const { t } = useI18n()
const v = siegeHud
const ICON: Record<DefenceId, GameIconName> = { ballista: 'range', cauldron: 'flame', barricade: 'shield', militia: 'squad', repair: 'anvil' }
const pct = (k: number): number => Math.max(0, Math.round(k * 100))
const why = ref('')
let whyTimer: ReturnType<typeof setTimeout> | null = null

const buy = (d: DefenceId): void => {
  const block = v.blocks[d]
  if (block) {
    sfx('denied')
    why.value = t(`siege.block.${block}`)
    if (whyTimer) clearTimeout(whyTimer)
    whyTimer = setTimeout(() => { why.value = '' }, 1800)
    return
  }
  siegeActions.build(d)
}
const ready = (): void => { siegeActions.ready() }

/** The banner: a wave's number as it comes, the Siege Lord's as he does. */
const banner = ref<{ id: number; text: string } | null>(null)
let bannerTimer: ReturnType<typeof setTimeout> | null = null
const phase = computed(() => `${v.phase}:${v.wave}`)
watch(phase, () => {
  if (!v.active || v.phase !== 'wave') return
  banner.value = { id: (banner.value?.id ?? 0) + 1, text: v.wave === SIEGE_WAVES ? t('siege.banner.final') : t('siege.banner.wave', { n: v.wave }) }
  if (bannerTimer) clearTimeout(bannerTimer)
  bannerTimer = setTimeout(() => { banner.value = null }, 2400)
})
onUnmounted(() => {
  if (whyTimer) clearTimeout(whyTimer)
  if (bannerTimer) clearTimeout(bannerTimer)
})
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.siege-hud
  position: absolute
  inset: 0
  pointer-events: none
.siege-hud__gate
  position: absolute
  top: max(58px, calc(4.4rem * var(--hud-s, 1)))
  left: 50%
  transform: translateX(-50%)
  display: flex
  flex-direction: column
  align-items: stretch
  gap: 0.2rem
  width: min(17rem, 56vw)
  // A phone held upright: the zone card and the objective chip fill the top
  // row, so the gate goes under them instead of behind them.
  @media (max-aspect-ratio: 3/4)
    top: max(158px, calc(10rem * var(--hud-s, 1)))
    width: min(17rem, 70vw)
.siege-hud__row
  display: flex
  justify-content: space-between
  gap: 0.5rem
  +cel.label
  color: var(--bc-gold-hi)
  font-size: max(10px, calc(clamp(0.72rem, 2.9vmin, 0.95rem) * var(--hud-s, 1)))
  text-shadow: var(--bc-text-outline)
.siege-hud__marks
  color: var(--bc-on-accent)
.siege-hud__bar
  position: relative
  height: max(12px, calc(1.05rem * var(--hud-s, 1)))
  overflow: hidden
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: var(--bc-leather-deep)
.siege-hud__fill
  position: absolute
  inset: 0
  transform-origin: left center
  background: linear-gradient(var(--bc-leather-hi), var(--bc-leather))
  transition: transform 160ms linear
.is-half .siege-hud__fill
  background: linear-gradient(var(--bc-orange), var(--bc-orange-lo))
.is-low .siege-hud__fill
  background: linear-gradient(var(--bc-red), var(--bc-red-lo))
.is-boss
  height: max(9px, calc(0.7rem * var(--hud-s, 1)))
  .siege-hud__fill
    background: linear-gradient(var(--bc-red-hi), var(--bc-red-deep))
.siege-hud__label
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: center
  color: var(--bc-white)
  font-size: max(9px, calc(0.7rem * var(--hud-s, 1)))
  font-weight: 700
  text-shadow: var(--bc-text-outline)
.siege-hud__boss
  display: flex
  flex-direction: column
  gap: 0.1rem
  margin-top: 0.15rem
.siege-hud__bossname
  +cel.label
  color: var(--bc-orange)
  font-size: max(10px, calc(clamp(0.7rem, 2.8vmin, 0.9rem) * var(--hud-s, 1)))
  text-align: center
  text-shadow: var(--bc-text-outline)
.siege-hud__build
  position: absolute
  left: 50%
  bottom: max(16px, calc(9.5rem * var(--hud-s, 1)))
  transform: translateX(-50%)
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.35rem
  width: min(32rem, 94vw)
  pointer-events: none
.siege-hud__clock
  margin: 0
  +cel.label
  color: var(--bc-gold-hi)
  font-size: max(11px, calc(clamp(0.85rem, 3.4vmin, 1.15rem) * var(--hud-s, 1)))
  text-shadow: var(--bc-text-outline)
.siege-hud__defs
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 0.3rem
.def
  pointer-events: auto
  display: grid
  grid-template-columns: auto auto
  align-items: center
  gap: 0 0.3rem
  min-width: 44px
  min-height: 44px
  padding: 0.25rem 0.5rem
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: 0.6rem
  background: var(--bc-paper)
  color: var(--bc-ink)
  font-size: max(10px, calc(clamp(0.66rem, 2.6vmin, 0.85rem) * var(--hud-s, 1)))
  cursor: pointer
  &.is-off
    opacity: 0.5
.def__icon
  grid-row: span 2
  display: block
  width: 1.5em
  height: 1.5em
.def__name
  font-weight: 700
  white-space: nowrap
.def__cost
  color: var(--bc-gold-deep)
  font-weight: 700
.siege-hud__why
  margin: 0
  padding: 0.15rem 0.6rem
  border-radius: var(--bc-r-pill)
  background: var(--bc-paper)
  color: var(--bc-red)
  font-size: max(10px, calc(0.8rem * var(--hud-s, 1)))
.siege-hud__ready
  pointer-events: auto
.siege-hud__banner
  position: absolute
  top: 34vh
  left: 0
  right: 0
  margin: 0
  +cel.label
  color: var(--bc-gold-hi)
  font-size: max(10px, calc(clamp(2rem, 9vmin, 4.2rem) * var(--hud-s, 1)))
  text-align: center
  text-shadow: var(--bc-text-outline)
.siege-banner-enter-active
  animation: siege-banner-in 420ms var(--bc-ease-pop) both
.siege-banner-leave-active
  transition: opacity 300ms ease
.siege-banner-leave-to
  opacity: 0
@keyframes siege-banner-in
  from
    opacity: 0
    transform: scale(1.6)
@media (prefers-reduced-motion: reduce)
  .siege-banner-enter-active
    animation: none
</style>
