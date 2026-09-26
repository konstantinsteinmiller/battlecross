<template lang="pug">
  div.bars(aria-hidden="true")
    div.bar-col
      div.bar.hp(:title="t('hud.hp')" :class="{ low: hpLow, beat: lowHealthLive }")
        span.cap
          GameIcon(name="heart")
        div.track
          div.fill(:style="{ height: hpPct + '%' }")
      div.bar.we(:title="t('hud.we')" :style="{ '--we': weColor }")
        span.cap
          GameIcon(name="bolt")
        div.track
          div.fill(:style="{ height: wePct + '%' }")
    div.power
      div.power-fill(:style="{ width: powerPct + '%' }" :class="{ cracked: powerPct < 20 }")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { profile } from '@/game/state/profile'
import { WEAPONS } from '@/game/data/weapons'
import { LOW_HP, lowHealthLive } from '@/game/state/screenFx'
import GameIcon from '@/components/icons/GameIcon.vue'

/**
 * The classic vertical energy bars: 28 segments each, health in yellow and
 * weapon energy in the equipped weapon's colour, drawn as ONE fill element over
 * a repeating segment mask (no per-segment DOM). A thin Power bar (block /
 * slide stamina) runs underneath.
 *
 * Each bar wears its glyph on a cap at the top, a heart on health and a bolt on
 * weapon energy: a playtester read the full weapon bar as their health one
 * turn before dying. Under `LOW_HP` the health bar turns red, and in live play it
 * beats in step with the ScreenFx edge vignette (`lowHealthLive`).
 *
 * The Core Master's bar (BossBar.vue) stands in line to the right with the same
 * frame, cap and segment geometry. Keep the two in step.
 */
const { t } = useI18n()
const SEG = 28
const seg = (v: number, max: number) =>
  (max > 0 ? (Math.ceil(Math.min(1, Math.max(0, v / max)) * SEG) / SEG) * 100 : 0)
const hpPct = computed(() => seg(hud.hp, hud.maxHp))
const wePct = computed(() => seg(hud.we, hud.maxWe))
const powerPct = computed(() => (hud.maxPower > 0 ? (hud.power / hud.maxPower) * 100 : 0))
const hpLow = computed(() => hud.hp > 0 && hud.hp < hud.maxHp * LOW_HP)
// Read from the profile, not `hud.weapons`: that array is mutated in place
// under a SHALLOW reactive, so a computed over it never saw a slot change.
const weColor = computed(() => {
  const id = profile.hero.slots[0]
  return id ? WEAPONS[id].color : '#5fd8ff'
})
</script>

<style scoped lang="sass">
.bars
  // The bar geometry. BossBar.vue repeats it to stand in line: keep in step.
  --bw: clamp(14px, 3.4vmin, 22px)
  --gap: clamp(3px, 0.8vmin, 6px)
  position: absolute
  left: calc(env(safe-area-inset-left, 0px) + clamp(8px, 2.2vmin, 18px))
  top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 2.2vmin, 18px))
  display: flex
  flex-direction: column
  gap: 6px
.bar-col
  display: flex
  gap: var(--gap)
// The navy frame: its padding is the outline, the glyph cap sits on top and
// the segment well takes the rest (the bar keeps its old outer size).
.bar
  display: flex
  flex-direction: column
  width: var(--bw)
  height: clamp(110px, 28vmin, 200px)
  padding: 3px
  border-radius: 4px
  background: #141a33
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
// Reaches into the frame's edge, so the glyph gets the bar's whole width.
.cap
  display: block
  flex: none
  width: calc(var(--bw) - 2px)
  height: calc(var(--bw) - 2px)
  margin: -2px -2px 1px
.hp .cap
  color: #ff5d73
.hp.low .cap
  color: #ff3347
  filter: drop-shadow(0 0 2px rgba(255, 51, 71, 0.9))
.we .cap
  color: var(--we)
.track
  position: relative
  flex: 1
  border-radius: 1px
  background: #0b1433
  overflow: hidden
  // Segment gaps drawn over whatever fill is below
  &::after
    content: ''
    position: absolute
    inset: 0
    background: repeating-linear-gradient(to top, transparent 0, transparent calc(100% / 28 - 1.5px), #0b1433 calc(100% / 28 - 1.5px), #0b1433 calc(100% / 28))
    pointer-events: none
.fill
  position: absolute
  left: 0
  right: 0
  bottom: 0
  transition: height 0.12s linear
.hp .fill
  background: linear-gradient(90deg, #fff9c8 0%, #fff9c8 30%, #ffe14a 31%, #f0a800 100%)
.hp.low .fill
  background: linear-gradient(90deg, #ffe0e3 0%, #ffe0e3 30%, #ff4a5c 31%, #c8142e 100%)
// The heartbeat: the heart pumps (past the frame, which does not clip it) and
// the fill flares a lighter red (white washed it out to pink), on the
// vignette's 0.9 s lub-dub.
.hp.beat
  .cap
    animation: pump 0.9s ease-out infinite
  .fill::before
    content: ''
    position: absolute
    inset: 0
    background: #ff9aa6
    opacity: 0
    animation: flare 0.9s ease-out infinite
.we .fill
  background: linear-gradient(90deg, #ffffff 0%, #ffffff 30%, var(--we) 31%, var(--we) 100%)
.power
  width: calc(var(--bw) * 2 + var(--gap))
  height: 7px
  border: 2px solid #141a33
  border-radius: 4px
  background: #0b1433
  overflow: hidden
.power-fill
  height: 100%
  background: linear-gradient(#bff3ff, #3cc8ff)
  transition: width 0.1s linear
  &.cracked
    background: linear-gradient(#ffd0c0, #ff6a3d)
@keyframes pump
  0%, 60%, 100%
    transform: scale(1)
  12%
    transform: scale(1.3)
  26%
    transform: scale(1.04)
  38%
    transform: scale(1.2)
@keyframes flare
  0%, 60%, 100%
    opacity: 0
  12%
    opacity: 0.5
  26%
    opacity: 0.1
  38%
    opacity: 0.36
// Red and still: the tint alone carries the warning.
@media (prefers-reduced-motion: reduce)
  .hp.beat .cap, .hp.beat .fill::before
    animation: none
</style>
