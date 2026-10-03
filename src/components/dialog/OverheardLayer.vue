<template lang="pug">
  div.overheard(aria-hidden="true")
    SpeechBubble.overheard__line(
      v-if="line"
      :key="line.key"
      ref="bubble"
      :text="text"
      tone="npc"
      tail
    )
</template>

<script setup lang="ts">
/**
 * Overheard small talk: the line one of two chatting townsfolk is saying,
 * in the dialogue's own bubble over their head, smaller, with nothing to
 * answer and nothing to tap (`game/overheard.ts` decides what and when).
 * Not read out to a screen reader: it is murmur, not a conversation.
 */
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { addHudTicker } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { currentZone } from '@/game/boot'
import { dialogWorld } from '@/game/talk'
import { revealed } from '@/game/dialog/pacing'
import { Overhearing, type HeardLine } from '@/game/overheard'
import { townChats, townSay } from '@/game/sim/townLife'
import SpeechBubble from './SpeechBubble.vue'

const { t } = useI18n()
const heard = new Overhearing()
const line = shallowRef<HeardLine | null>(null)
const bubble = ref<InstanceType<typeof SpeechBubble> | null>(null)
const text = computed(() => (line.value ? t(line.value.key) : ''))

/** Clear of the speaker's head (and of a named one's marker). */
const LIFT = 1.05
const LIFT_NAMED = 1.75
const TAIL_GAP = 12
const p = { x: 0, y: 0 }
let remove: (() => void) | null = null

onMounted(() => {
  remove = addHudTicker((dt) => {
    const zone = currentZone()
    if (!zone || zone.setup.kind !== 'town' || !zone.setup.town) { line.value = heard.stop(); return }
    const hero = zone.sim.hero.unit
    const now = heard.step(Math.min(dt, 0.1), {
      visit: zone,
      town: zone.setup.town,
      chats: townChats(zone.sim),
      hx: hero.x,
      hz: hero.z,
      quiet: !!flow.talk || !!flow.modal,
      world: dialogWorld(),
      say: (unit, seconds) => townSay(zone.sim, unit, seconds),
      text: key => t(key)
    })
    if (now?.key !== line.value?.key || now?.unit !== line.value?.unit) line.value = now
    if (!now) return
    const b = bubble.value
    const el = b?.$el as HTMLElement | undefined
    const u = zone.sim.get(now.unit)
    if (!b || !el || !u) return
    b.reveal(revealed(text.value, now.t))
    // Over one of the named, clear of their marker and the "Talk" prompt too.
    const on = zone.project(u.x, u.h + (u.npc ? LIFT_NAMED : LIFT), u.z, p)
    const w = el.offsetWidth
    const h = el.offsetHeight
    el.style.transform = on ? `translate3d(${Math.round(p.x - w / 2)}px, ${Math.round(p.y - h - TAIL_GAP)}px, 0)` : 'translate3d(-999px, -999px, 0)'
    el.style.setProperty('--tail-x', `${Math.round(w / 2)}px`)
    // Fades out over the last part of the line.
    el.style.opacity = String(Math.max(0, Math.min(1, (now.dur - now.t) / 0.35, now.t / 0.15)))
  })
})
onUnmounted(() => remove?.())
</script>

<style scoped lang="sass">
.overheard
  position: absolute
  inset: 0
  overflow: hidden
  pointer-events: none
.overheard__line
  position: absolute
  top: 0
  left: 0
  width: max-content
  max-width: min(15rem, 70vw)
  font-size: 0.82em
  will-change: transform, opacity
  // (Placed and faded in by the ticker, from its first frame.)
  opacity: 0
</style>
