<template lang="pug">
  div.bark(aria-live="polite")
    SpeechBubble.bark__line(
      v-if="line"
      :key="line.key + line.unit"
      ref="bubble"
      :text="text"
      tone="npc"
      :emotion="line.look?.emotion ?? ''"
      :style="line.look ? { '--paper': line.look.paper, '--paper-lo': line.look.band } : undefined"
      tail
    )
</template>

<script setup lang="ts">
/**
 * What a boss shouts at a big beat of its fight (#74): the line in the
 * dialogue's bubble over its head, typed out, faded at the end, with its
 * recording when there is one (`data/dialogs/bosses.ts`). The sim says when
 * (`bark` events, handed over by the zone through `takeBark`). A speaker with a look of its own (the cameo's hunter,
 * #210: his teal, said as a shout) gets its paper, from `CAMEO_BARK_LOOK`.
 */
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { addHudTicker, takeBark } from '@/game/state/hud'
import { currentZone } from '@/game/boot'
import { flow } from '@/game/flow'
import { revealed, speakSeconds } from '@/game/dialog/pacing'
import SpeechBubble from '@/components/dialog/SpeechBubble.vue'
import { speakLine } from '@/game/audio/speech'
import { CAMEO_BARK_LOOK } from '@/game/coach/cameo'

const { t, locale } = useI18n()
const line = shallowRef<{ unit: number; key: string; t: number; dur: number; look?: { paper: string; band: string; emotion: string } } | null>(null)
const bubble = ref<InstanceType<typeof SpeechBubble> | null>(null)
const text = computed(() => (line.value ? t(line.value.key) : ''))

const LIFT = 0.6
const TAIL_GAP = 12
const p = { x: 0, y: 0 }
let remove: (() => void) | null = null

onMounted(() => {
  remove = addHudTicker((dt) => {
    const zone = currentZone()
    const next = takeBark()
    // A conversation or a window is open (a talk with a townsperson, the smith's introduction): nobody shouts over it. The cry is
    // dropped, not queued (a cage's call is made again), and one already up goes (the dialogue's own line cuts its recording).
    if (flow.talk || flow.modal) {
      if (line.value) line.value = null
      return
    }
    if (next) {
      const kind = zone?.sim.get(next.unit)?.kind
      line.value = { unit: next.unit, key: next.key, t: 0, dur: speakSeconds(t(next.key)) + 0.6, look: kind ? CAMEO_BARK_LOOK[kind] : undefined }
      void speakLine(next.key, locale.value)
    }
    const now = line.value
    if (!now) return
    now.t += Math.min(dt, 0.1)
    const u = zone?.sim.get(now.unit)
    if (!zone || !u || now.t >= now.dur) { line.value = null; return }
    const b = bubble.value
    const el = b?.$el as HTMLElement | undefined
    if (!b || !el) return
    b.reveal(revealed(text.value, now.t))
    // Over its head, wherever it is (a dragon in the sky included).
    const on = zone.project(u.x, u.h + LIFT + (u.boss?.alt ?? 0), u.z, p)
    const w = el.offsetWidth
    const h = el.offsetHeight
    el.style.transform = on ? `translate3d(${Math.round(p.x - w / 2)}px, ${Math.round(p.y - h - TAIL_GAP)}px, 0)` : 'translate3d(-999px, -999px, 0)'
    el.style.setProperty('--tail-x', `${Math.round(w / 2)}px`)
    el.style.opacity = String(Math.max(0, Math.min(1, (now.dur - now.t) / 0.35, now.t / 0.15)))
  })
})
onUnmounted(() => remove?.())
</script>

<style scoped lang="sass">
.bark
  position: absolute
  inset: 0
  overflow: hidden
  pointer-events: none
.bark__line
  position: absolute
  top: 0
  left: 0
  width: max-content
  max-width: min(16rem, 70vw)
  will-change: transform, opacity
  opacity: 0
</style>
