<template lang="pug">
  div.hud(:class="[`hud--${hud.device}`, `hud--${flow.screen}`]")
    FloatLayer
    CoachLayer(v-if="flow.screen === 'zone' && !flow.modal")
    div.hud__top
      HeroFrame.hud__tl
      TopStatus.hud__tc
      HudMenu.hud__tr(pause help @pause="pause" @help="help")
    div.hud__bl
      TouchStick
    //- A zone: the skills. A town: the hero's menus, and who is in reach.
    div.hud__br(v-if="flow.screen === 'zone'")
      SkillBar
    div.hud__br(v-else)
      MenuButtons(map)
    div.hud__talk(v-if="flow.screen === 'town' && hud.interactKey && !flow.modal")
      FButton(:label="t(`npc.${hud.interactKey}.name`)" icon="chat" size="md" @click="talk")
      KeyCap.hud__talk-key(v-if="hud.device === 'mouse'" :code="interactCode")
</template>

<script setup lang="ts">
/**
 * The HUD over a zone or a town. Layout only: every corner is its own
 * component. The root never takes a pointer — the gesture surface under it
 * does — and only the buttons opt back in.
 *
 * Corners (the layout the studio's other games use): the hero top-left, the
 * rarely-touched buttons top-right, the stick bottom-left, the actions
 * bottom-right. Nothing overlaps at 320 × 658 or in a phone's landscape.
 */
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { input } from '@/game/boot'
import { coach } from '@/game/coach'
import { DEFAULT_BINDINGS } from '@/game/engine/keyBindings'
import FButton from '@/components/atoms/FButton.vue'
import KeyCap from '@/components/glyphs/KeyCap.vue'
import HeroFrame from './HeroFrame.vue'
import TopStatus from './TopStatus.vue'
import HudMenu from './HudMenu.vue'
import SkillBar from './SkillBar.vue'
import TouchStick from './TouchStick.vue'
import FloatLayer from './FloatLayer.vue'
import CoachLayer from './CoachLayer.vue'
import MenuButtons from './MenuButtons.vue'

defineEmits<{ (e: 'options'): void }>()
const { t } = useI18n()
const interactCode = DEFAULT_BINDINGS.interact[0]!

const pause = (): void => { if (!flow.modal && !flow.loading) flow.modal = 'pause' }
const help = (): void => {
  coach.recallAll()
  if (!flow.modal && !flow.loading) flow.modal = 'help'
}
const talk = (): void => { input.interactQueued = true }
</script>

<style scoped lang="sass">
.hud
  --pad: clamp(0.5rem, 2.2vmin, 1rem)
  position: absolute
  inset: 0
  pointer-events: none
  font-family: var(--font-ui)
  user-select: none
  -webkit-user-select: none
.hud__top
  position: absolute
  top: calc(env(safe-area-inset-top, 0px) + var(--pad))
  left: calc(env(safe-area-inset-left, 0px) + var(--pad))
  right: calc(env(safe-area-inset-right, 0px) + var(--pad))
  display: grid
  grid-template-columns: auto minmax(0, 1fr) auto
  grid-template-areas: "tl tc tr"
  align-items: start
  gap: clamp(0.3rem, 1.4vmin, 0.8rem)
.hud__tl
  grid-area: tl
.hud__tc
  grid-area: tc
  padding-top: 0.15rem
.hud__tr
  grid-area: tr
// A narrow screen has no room between the corners: the status drops a row.
@media (max-aspect-ratio: 1/1)
  .hud__top
    grid-template-areas: "tl . tr" "tc tc tc"
  .hud__tc
    padding-top: 0
.hud__bl, .hud__br
  position: absolute
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--pad) + clamp(0.4rem, 3vmin, 1.4rem))
.hud__bl
  left: calc(env(safe-area-inset-left, 0px) + var(--pad) + clamp(0.3rem, 2.4vmin, 1.4rem))
.hud__br
  right: calc(env(safe-area-inset-right, 0px) + var(--pad) + clamp(0.1rem, 1.2vmin, 0.8rem))
// Mouse and keys: the skills sit bottom centre, in key order.
.hud--mouse.hud--zone .hud__br
  right: auto
  left: 50%
  transform: translateX(-50%)
// A phone's town menu is two by two, so the stick keeps its corner.
.hud--touch.hud--town .hud__br :deep(.menu-buttons)
  display: grid
  grid-template-columns: repeat(2, auto)
.hud__talk
  position: absolute
  left: 50%
  bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(8.5rem, 44vmin, 13rem))
  transform: translateX(-50%)
  display: flex
  align-items: center
  gap: 0.5rem
  max-width: 92vw
  pointer-events: auto
  animation: talk-in 220ms cubic-bezier(0.2, 1.4, 0.4, 1)
.hud--mouse .hud__talk
  bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(6rem, 16vmin, 9rem))
.hud__talk-key
  font-size: clamp(0.8rem, 2.4vmin, 1.05rem)
  color: #141a33
@keyframes talk-in
  from
    opacity: 0
    transform: translateX(-50%) translateY(0.6rem) scale(0.85)
  to
    opacity: 1
    transform: translateX(-50%)
</style>
