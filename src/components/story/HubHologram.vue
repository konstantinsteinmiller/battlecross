<template lang="pug">
  //- The hologram of a story scene (the blueprint, the reserve, the breach):
  //- the picture only. The Lab shows it (HubSceneLayer.vue) and so does the
  //- debrief film (DebriefLayer.vue); the scene's own beats move `stage`.
  div.hologram
    div.backdrop
    svg.holo(viewBox="0 0 400 240" aria-hidden="true")
      //- The reserve and the breach: the shield's dome over the Fortress, the
      //- relays in a ring on the valley floor around it.
      template(v-if="id !== 'blueprint'")
        ellipse.floor(cx="200" cy="200" rx="160" ry="26")
        g.dome(:class="{ cracked: stage === 'crack' || stage === 'shatter', gone: stage === 'shatter', held: stage === 'red' }")
          path(d="M70 200 A130 150 0 0 1 330 200")
          polyline.crack(points="200,52 188,90 206,112 192,150 210,196")
        rect.fortress(x="186" y="166" width="28" height="34" rx="3")
        circle.relay(
          v-for="r in relays"
          :key="r.id"
          :cx="r.x" :cy="r.y" r="7"
          :style="{ '--c': r.color, 'transition-delay': r.delay }"
          :class="{ lit: r.lit, red: r.red }"
        )
        //- The reserve: five beams strike the dome and stop.
        template(v-if="id === 'reserve' && stage")
          line.beam(v-for="(r, i) in relays.slice(0, 5)" :key="'b' + i" :x1="r.x" :y1="r.y" x2="200" y2="52" :style="{ '--c': r.color }")
      //- The blueprint: the skull capsule in wireframe, five coloured lines
      //- into it (the first five Masters' signals), Atlas's ring beside it.
      g.blueprint(v-else)
        line.wire(v-for="(r, i) in relays.slice(0, 5)" :key="'w' + i" :x1="40 + i * 30" y1="220" x2="200" y2="170" :style="{ '--c': r.color }")
        rect(x="150" y="40" width="100" height="130" rx="44")
        circle(cx="182" cy="96" r="11")
        circle(cx="218" cy="96" r="11")
        path(d="M176 136 h48")
        circle.atlas-ring(cx="312" cy="96" r="20" :class="{ frozen: stage === 'freeze' }")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { profile } from '@/game/state/profile'
import { SECTORS } from '@/game/data/regions'
import { MASTER_COLOR } from '@/game/data/signature'

const props = defineProps<{
  id: 'blueprint' | 'reserve' | 'breach'
  /** Where the picture is: blueprint `freeze`; reserve `beams` → `red`; breach `fire` → `crack` → `shatter`. */
  stage: string
}>()

/** The relays on the valley's rim, in story order: lit as the breach fires them, red in the reserve. */
const relays = computed(() => SECTORS.filter(s => s.boss !== 'vexMk1' && s.id !== 'fortress').map((s, i, all) => {
  // A ring on the valley floor (an ellipse in perspective), the first relay front left.
  const a = Math.PI * 0.75 - (2 * Math.PI * i) / all.length
  return {
    id: s.id,
    x: 200 + Math.cos(a) * 160,
    y: 200 + Math.sin(a) * 26,
    color: MASTER_COLOR[s.boss as keyof typeof MASTER_COLOR] ?? '#fff',
    // The breach fires them one after another; the reserve's last five glow red.
    lit: props.id === 'breach' ? props.stage !== '' : profile.world.bosses.includes(s.boss),
    delay: props.id === 'breach' && props.stage === 'fire' ? `${0.2 + i * 0.25}s` : '0s',
    red: props.id === 'reserve' && i >= 5 && props.stage === 'red'
  }
}))
</script>

<style scoped lang="sass">
.hologram
  position: absolute
  inset: 0
.backdrop
  position: absolute
  inset: 0
  background: radial-gradient(ellipse at 50% 45%, rgba(10, 16, 40, 0.95), rgba(4, 6, 16, 0.99))
  animation: fade-in 0.4s ease both
.holo
  fill: none
  position: absolute
  left: 50%
  top: 54%
  width: min(92vw, 640px)
  transform: translate(-50%, -50%)
  stroke: #6ff2ff
  stroke-width: 2
  filter: drop-shadow(0 0 6px rgba(111, 242, 255, 0.8))
  animation: fade-in 0.5s ease both
.floor
  stroke: #2a4a6a
  stroke-dasharray: 2 4
.dome path
  stroke: #6ff2ff
  stroke-dasharray: 4 3
.dome .crack
  stroke: #ffffff
  stroke-width: 3
  opacity: 0
.dome.cracked .crack
  opacity: 1
.dome.gone
  animation: shatter 0.6s ease-in forwards
.dome.held path
  stroke: #ffffff
  stroke-dasharray: none
.fortress
  fill: #3a0a14
  stroke: #ff2d3f
.relay
  fill: #1a2240
  stroke: #445
  transition: fill 0.25s, stroke 0.25s
  &.lit
    fill: var(--c)
    stroke: #fff
  &.red
    fill: #ff2d3f
    stroke: #ffd35a
    animation: flare 0.5s ease-in-out infinite alternate
.wire
  stroke: var(--c)
  stroke-width: 2.5
  opacity: 0.85
.beam
  stroke: var(--c)
  stroke-width: 3
  stroke-dasharray: 260
  stroke-dashoffset: 260
  animation: beam 1.2s 0.3s ease-out forwards
.blueprint
  stroke: #6ff2ff
  animation: blink 1.6s ease-in-out infinite
  .atlas-ring
    stroke: #20b8d0
    stroke-width: 4
    stroke-dasharray: 80 34
    animation: spin 2s linear infinite
    &.frozen
      animation-play-state: paused
@keyframes fade-in
  from
    opacity: 0
@keyframes beam
  to
    stroke-dashoffset: 0
@keyframes flare
  to
    filter: brightness(1.6)
@keyframes shatter
  to
    opacity: 0
    transform: translateY(30px) scale(1.15)
@keyframes blink
  50%
    opacity: 0.6
@keyframes spin
  to
    transform: rotate(360deg)
    transform-origin: 300px 90px
@media (prefers-reduced-motion: reduce)
  .relay.red, .blueprint, .blueprint .atlas-ring, .dome.gone
    animation: none
</style>
