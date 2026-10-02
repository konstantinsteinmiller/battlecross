<template lang="pug">
  div.hero-doll(ref="root" :class="{ 'is-3d': live }")
    //- The stand he is on: a round plinth, lit from above.
    span.hero-doll__plinth(aria-hidden="true")
    HeroTurntable.hero-doll__live(v-if="live" ref="turntable" @fail="live = false")
    div.hero-doll__figure(v-else ref="figure")
      Portrait(look="hero")
    span.hero-doll__level {{ t('hud.level', { n: profile.level }) }}
</template>

<script setup lang="ts">
/**
 * The hero in the middle of the paper-doll, wearing what the sockets round
 * him hold: his own 3D rig on a turntable where the device has WebGL to
 * spare, his drawn portrait elsewhere (a low-end phone, `?scenery=low`, a
 * context that could not be had or was lost). Both follow the gear, so a
 * helmet put on in its socket shows on him at once. `react()`: something was
 * just put on, and he shows it.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Portrait from '@/components/art/Portrait.vue'
import { profile } from '@/game/state/profile'
import { sceneQuality } from '@/game/engine/quality'
import { hop } from '@/components/game/fx'
import HeroTurntable from './HeroTurntable.vue'

const { t } = useI18n()
const root = ref<HTMLElement | null>(null)
const figure = ref<HTMLElement | null>(null)
const turntable = ref<InstanceType<typeof HeroTurntable> | null>(null)

/** A live figure only where it is cheap: never on a device the scenery
 *  already spares, never without a WebGL canvas to ask for. */
const canLive = (): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  try {
    if (sceneQuality() === 'low') return false
    return typeof WebGLRenderingContext !== 'undefined'
  } catch {
    return false
  }
}
const live = ref(canLive())

defineExpose({
  react: (): void => {
    if (live.value) turntable.value?.react()
    else hop(figure.value)
  }
})
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
.hero-doll__live
  position: absolute
  inset: 0 0 6% 0
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
// Under a live figure the plinth is a low round stage, not a frame.
.is-3d .hero-doll__plinth
  bottom: 4%
  width: min(80cqw, 70cqh)
  height: 13%
.hero-doll__level
  +screen.tag('blue')
  position: absolute
  left: 50%
  bottom: 0
  translate: -50% 0
  z-index: 1
  font-size: clamp(0.7rem, 2.8vmin, 0.92rem)
</style>
