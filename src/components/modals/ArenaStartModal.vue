<template lang="pug">
  FModal(:model-value="true" :title="t('arenaStart.title')" :is-closable="false" surface="parchment" tone="gold")
    div.start(data-arena-start)
      p.start__text {{ t('arenaStart.lead', { best: flow.arenaOffer.best }) }}
      p.start__why {{ t('arenaStart.why') }}
    template(#footer)
      div.start__ways
        FButton(:label="t('arenaStart.from', { n: flow.arenaOffer.rec })" type="success" size="md" icon="trophy" attention data-arena-start-rec @click="chooseArenaStart(flow.arenaOffer.rec)")
        FButton(:label="t('arenaStart.fromOne')" type="secondary" size="md" data-arena-start-one @click="chooseArenaStart(1)")
        FButton(:label="t('cancel')" type="secondary" size="md" data-arena-start-cancel @click="back")
</template>

<script setup lang="ts">
/**
 * "Where do you start?" at the colosseum's gate, from the second visit (roadmap #230): the wave the hero's power warrants
 * (`data/arenaStart.ts`), or the first wave as ever.
 */
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { chooseArenaStart, flow, openMap } from '@/game/flow'

const { t } = useI18n()
/** Not now: back to the map. */
const back = (): void => { flow.modal = ''; openMap() }
</script>

<style scoped lang="sass">
.start
  display: flex
  flex-direction: column
  gap: 0.6rem
  max-width: 24rem
  color: var(--bc-on)
.start__text
  margin: 0
  font-size: clamp(0.95rem, 3.8vmin, 1.2rem)
  font-weight: 700
  line-height: 1.3
.start__why
  margin: 0
  font-size: 0.8rem
  opacity: 0.75
.start__ways
  display: flex
  flex-direction: column
  align-items: stretch
  gap: clamp(0.3rem, 1.6vmin, 0.6rem)
  width: min(100%, 22rem)
</style>
