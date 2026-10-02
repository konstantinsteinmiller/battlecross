<template lang="pug">
  div.hero-doll(ref="root")
    //- The stand he is on: a round plinth, lit from above.
    span.hero-doll__plinth(aria-hidden="true")
    div.hero-doll__figure(ref="figure")
      Portrait(look="hero")
    span.hero-doll__level {{ t('hud.level', { n: profile.level }) }}
</template>

<script setup lang="ts">
/**
 * The hero in the middle of the paper-doll: his portrait, drawn from the gear
 * he wears (`heroLook`), so a helmet put on in the socket beside him shows on
 * him at once. `react()` makes him hop: something was just put on.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Portrait from '@/components/art/Portrait.vue'
import { profile } from '@/game/state/profile'
import { hop } from '@/components/game/fx'

const { t } = useI18n()
const root = ref<HTMLElement | null>(null)
const figure = ref<HTMLElement | null>(null)
defineExpose({ react: (): void => hop(figure.value) })
</script>

<style scoped lang="sass">
@use '@/components/game/screen'

.hero-doll
  position: relative
  display: flex
  align-items: center
  justify-content: center
  min-width: 0
  min-height: 0
  container-type: size
.hero-doll__figure
  position: relative
  // As large as the box allows, and round.
  width: min(92cqw, 78cqh)
  transform-origin: 50% 100%
.hero-doll__plinth
  position: absolute
  left: 50%
  bottom: 3%
  width: min(96cqw, 84cqh)
  height: 16%
  translate: -50% 0
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: 50%
  background: linear-gradient(180deg, var(--bc-brass-hi) 0, var(--bc-brass-hi) 30%, var(--bc-brass-lo) 30%, var(--bc-brass-lo) 100%)
  box-shadow: 0 0.3rem 0 var(--bc-ink)
.hero-doll__level
  +screen.tag('blue')
  position: absolute
  left: 50%
  bottom: 0
  translate: -50% 0
  font-size: clamp(0.7rem, 2.8vmin, 0.92rem)
</style>
