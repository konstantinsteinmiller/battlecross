<script setup lang="ts">
/**
 * The small corner indicator used inside `FHudButton`'s `badge` slot —
 * a claim count, a reward amount, or a countdown. Fluidly sized so it stays
 * legible on a 320 px phone without swallowing the chip it sits on.
 */
interface Props {
  tone?: 'red' | 'blue' | 'gold' | 'green'
}
withDefaults(defineProps<Props>(), { tone: 'red' })
</script>

<template lang="pug">
  span.f-hud-badge(:class="`tone-${tone}`")
    slot
</template>

<style scoped lang="sass">
@use '@/assets/css/cel'

.f-hud-badge
  +cel.tone('red')
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 0.15em
  min-width: clamp(1.05rem, 4.4vw, 1.3rem)
  min-height: clamp(1.05rem, 4.4vw, 1.3rem)
  padding-inline: 0.3em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  +cel.fill(50%, 100%)
  color: var(--bc-text)
  font-weight: 900
  line-height: 1
  font-size: clamp(0.6rem, 2.5vw, 0.76rem)
  white-space: nowrap
  text-shadow: var(--bc-text-outline-thin)
  box-shadow: 0 2px 0 var(--bc-ink)

  // Both element types, deliberately. `IconCoin` is an `<img>` while every
  // other icon in the set is an inline `<svg>`, and an `svg`-only rule let the
  // coin fall through to its intrinsic 128×128 — a giant gold disc bursting out
  // of the badge and shoving the rest of the HUD row off screen.
  :slotted(svg),
  :slotted(img)
    flex: 0 0 auto
    width: 1em
    height: 1em
    object-fit: contain

.tone-blue
  +cel.tone('blue')
.tone-gold
  +cel.tone('gold')
.tone-green
  +cel.tone('green')
</style>
