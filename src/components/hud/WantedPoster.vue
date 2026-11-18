<template lang="pug">
  div.wanted(aria-live="polite")
    Transition(name="wanted")
      button.wanted__card(v-if="shown" :key="shown" type="button" data-wanted-poster :aria-label="t('wanted.title')" @click="shown = 0")
        img.wanted__art(:src="src" alt="" draggable="false")
        span.wanted__title {{ t('wanted.title') }}
        span.wanted__reward {{ t('hoard.title') }}
        span.wanted__name {{ t('enemy.goblinKing') }}
</template>

<script setup lang="ts">
/**
 * ─── The Goblin King's wanted poster (roadmap #EXT-8) ───────────────────────
 *
 * Once the teachers are out of the cage the knight pins the bounty up: the King on his boar, a name to chase, and
 * what it pays (his hoard). Shown for a few seconds each time `hud.wanted` changes; a tap puts it away. The picture
 * is `images/ui/wanted.webp` once painted, the drawing it was painted from until then (`art/brandRefs.ts`).
 */
import { onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { UI_ART } from '@/game/assets/overrides'
import { WANTED_SVG } from '@/game/art/brandRefs'

const { t } = useI18n()
const shown = ref(0)
const src = UI_ART.get('wanted') ?? `data:image/svg+xml,${encodeURIComponent(WANTED_SVG)}`
let timer: ReturnType<typeof setTimeout> | null = null

watch(() => hud.wanted, (id) => {
  if (!id) return
  shown.value = id
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { shown.value = 0 }, 7500)
})
onUnmounted(() => { if (timer) clearTimeout(timer) })
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.wanted
  position: absolute
  inset: 0
  pointer-events: none
.wanted__card
  position: absolute
  right: max(12px, 3vw)
  top: 22vh
  width: max(150px, calc(clamp(10rem, 34vmin, 17rem) * var(--hud-s, 1)))
  aspect-ratio: 1
  display: block
  padding: 0
  border: 0
  background: none
  pointer-events: auto
  cursor: pointer
  transform: rotate(2.5deg)
  filter: drop-shadow(0 6px 0 rgba(15, 12, 25, 0.35))
.wanted__art
  display: block
  width: 100%
  height: 100%
  object-fit: contain
  user-select: none
// The poster's own bands, in the square the picture is painted in: the title band 17-28 %, the reward band 77-88 %.
.wanted__title, .wanted__reward, .wanted__name
  position: absolute
  left: 27%
  width: 46%
  display: flex
  align-items: center
  justify-content: center
  text-align: center
  +cel.label
  color: var(--bc-ink)
  line-height: 1
.wanted__title
  top: 17%
  height: 11%
  font-size: max(10px, calc(clamp(0.9rem, 4.6vmin, 1.6rem) * var(--hud-s, 1)))
  letter-spacing: 0.06em
  color: #8a1f12
.wanted__reward
  top: 77%
  height: 11%
  font-size: max(8px, calc(clamp(0.5rem, 2vmin, 0.8rem) * var(--hud-s, 1)))
.wanted__name
  top: 62%
  height: 11%
  font-size: max(9px, calc(clamp(0.6rem, 2.6vmin, 1rem) * var(--hud-s, 1)))
  color: #fff6dc
  text-shadow: var(--bc-text-outline)

.wanted-enter-active
  animation: wanted-in 380ms var(--bc-ease-pop) both
.wanted-leave-active
  transition: opacity 280ms ease
.wanted-leave-to
  opacity: 0
@keyframes wanted-in
  from
    opacity: 0
    transform: translateY(-26px) rotate(-6deg) scale(1.25)
@media (prefers-reduced-motion: reduce)
  .wanted-enter-active
    animation: none
</style>
