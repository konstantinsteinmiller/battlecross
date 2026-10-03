<template lang="pug">
  div.hud(:class="[`hud--${hud.device}`, `hud--${flow.screen}`, { 'hud--talk': flow.talk }]")
    FloatLayer
    //- The townspeople's markers, and the "Talk" prompt on the one in reach.
    NpcPins(v-if="flow.screen === 'town'")
    //- What two chatting townsfolk say as the hero passes them.
    OverheardLayer(v-if="flow.screen === 'town'")
    CoachLayer(v-if="(flow.screen === 'zone' || flow.screen === 'town') && !flow.modal && !flow.talk")
    //- The "Open" prompt on the chest in reach.
    ChestPrompt(v-if="flow.screen === 'zone'")
    //- After the finale falls: how the hero goes home.
    LeaveButton(v-if="flow.screen === 'zone'")
    div.hud__top
      HeroFrame.hud__tl
      TopStatus.hud__tc
      HudMenu.hud__tr(pause help @pause="pause" @help="help")
    div.hud__bl
      TouchStick
    //- A zone: the skills. A town: the hero's menus.
    div.hud__br(v-if="flow.screen === 'zone'")
      SkillBar
    div.hud__br(v-else)
      MenuButtons(map)
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
 *
 * During a conversation (`flow.talk`) the corners step back: the scene and
 * the speech bubbles (`DialogLayer`) have the screen.
 */
import { hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { recallHere } from '@/game/coach/onboarding'
import NpcPins from '@/components/dialog/NpcPins.vue'
import OverheardLayer from '@/components/dialog/OverheardLayer.vue'
import HeroFrame from './HeroFrame.vue'
import TopStatus from './TopStatus.vue'
import HudMenu from './HudMenu.vue'
import SkillBar from './SkillBar.vue'
import TouchStick from './TouchStick.vue'
import FloatLayer from './FloatLayer.vue'
import CoachLayer from './CoachLayer.vue'
import ChestPrompt from './ChestPrompt.vue'
import LeaveButton from './LeaveButton.vue'
import MenuButtons from './MenuButtons.vue'

defineEmits<{ (e: 'options'): void }>()

const pause = (): void => { if (!flow.modal && !flow.loading) flow.modal = 'pause' }
/** "?": the lessons of where the player is come back (a fight's controls; a
 *  town's talking, trading and learning), and the controls page opens. */
const help = (): void => {
  recallHere()
  if (!flow.modal && !flow.loading) flow.modal = 'help'
}
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
// A conversation: the corners fade out and take no input until it is over.
.hud__top, .hud__bl, .hud__br
  transition: opacity 220ms ease-out, visibility 0s
.hud--talk
  .hud__top, .hud__bl, .hud__br
    opacity: 0
    visibility: hidden
    transition: opacity 220ms ease-out, visibility 0s 220ms
    :deep(*)
      pointer-events: none !important
</style>
