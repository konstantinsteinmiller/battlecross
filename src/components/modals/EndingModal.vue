<template lang="pug">
  FModal(:model-value="true" :title="t(`ending.${kind}.title`)" :is-closable="false" surface="parchment" tone="purple")
    div.ending
      span.ending__face
        Portrait(look="hero" ring="var(--bc-gold)")
      p.ending__text {{ t(`ending.${kind}.text`) }}
      ul.ending__notes
        li(v-for="f in notes" :key="f") {{ t(`ending.note.${f}`) }}
      //- Not an end card (#164): no tally, only the one threat left, and where it is.
      p.ending__more {{ t('ending.more') }}
    template(#footer)
      FButton(:label="t('ui.continue')" type="success" size="md" attention @click="done")
</template>

<script setup lang="ts">
/** The ending the hero's choices added up to (GDD §3.2): which power holds
 *  the throne, and a line for each thing done on the way there. The story is
 *  not over: one threat is left, in the Void Rift, and the hero walks there. */
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { EPILOGUE_FLAGS, endingOf } from '@/game/data/quests'
import { flagSet, markTip } from '@/game/state/profile'
import { afterVisit, flow } from '@/game/flow'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import Portrait from '@/components/art/Portrait.vue'
import { speakLine, stopSpeech } from '@/game/audio/speech'

const { t, locale } = useI18n()
const flags = computed(() => flagSet())
const kind = computed(() => endingOf(flags.value) || 'free')
const notes = computed(() => EPILOGUE_FLAGS.filter(f => flags.value.has(f)))

/**
 * The hero (or the girl hero) reads the ending out (roadmap #73): what became
 * of the throne, then each thing done on the way, then what is left to do.
 * A line with no recording is skipped; closing the window stops the voice.
 */
let reading = true
onMounted(async () => {
  const ids = [`ending.${kind.value}.text`, ...notes.value.map(f => `ending.note.${f}`), 'ending.more']
  for (const id of ids) {
    if (!reading) return
    const sec = await speakLine(id, locale.value)
    if (sec > 0) await new Promise(r => setTimeout(r, (sec + 0.35) * 1000))
  }
})
onUnmounted(() => { reading = false; stopSpeech() })

const done = (): void => {
  markTip('endingSeen')
  // On the map he sets off for the Rift by himself, and stops at its door (#164).
  flow.mapWalkTo = 'rift'
  afterVisit()
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.ending
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.5rem, 2.2vmin, 0.9rem)
  color: var(--bc-on)
  text-align: center
.ending__face
  width: clamp(4rem, 18vmin, 6rem)
.ending__text
  margin: 0
  font-size: clamp(0.86rem, 3.6vmin, 1.1rem)
  line-height: 1.4
.ending__notes
  margin: 0
  padding: 0
  list-style: none
  display: flex
  flex-direction: column
  gap: 0.3rem
  color: var(--bc-on-accent)
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
  line-height: 1.3
.ending__more
  margin: 0
  color: var(--bc-on-accent)
  font-size: clamp(0.8rem, 3.3vmin, 1rem)
  line-height: 1.35
</style>
