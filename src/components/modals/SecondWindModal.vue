<template lang="pug">
  FModal(:model-value="true" :title="t('wind.title')" :is-closable="false" surface="parchment" tone="red")
    div.wind
      p.wind__text {{ t('wind.text', { n: Math.round(REVIVE_HP * 100) }) }}
      span.wind__free(v-if="flow.windFree") {{ t('wind.free') }}
      p.wind__once(v-else) {{ t('wind.once') }}
    template(#footer)
      FButton(:label="t('wind.decline')" type="secondary" size="md" :is-disabled="adInFlight" @click="declineSecondWind")
      FButton(
        v-if="flow.windFree || canOfferReward"
        :label="rewardIsVideo && !flow.windFree ? t('wind.watch') : t('wind.take')"
        type="success"
        size="md"
        :icon="rewardIsVideo && !flow.windFree ? 'video' : 'heart'"
        attention
        :is-disabled="adInFlight"
        @click="takeSecondWind"
      )
</template>

<script setup lang="ts">
/**
 * Second wind (roadmap #18): the hero has fallen, the fight is held, and one
 * rewarded video gets him back up at half health. Offered before the result
 * screen, once per visit, only where a video is ready (`flow.secondWindAllowed`).
 * Where a video stops being ready while this is up, its button goes and "No
 * thanks" is what is left: a button that cannot deliver is never shown.
 */
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { declineSecondWind, flow, takeSecondWind } from '@/game/flow'
import { adInFlight, canOfferReward, rewardIsVideo } from '@/use/useAdGate'
import { REVIVE_HP } from '@/game/sim/combat'

const { t } = useI18n()
</script>

<style scoped lang="sass">
.wind
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.5rem
  text-align: center
  color: var(--bc-on)
.wind__text
  margin: 0
  max-width: 22rem
  font-size: clamp(0.95rem, 4vmin, 1.2rem)
  line-height: 1.3
.wind__free
  padding: 0.15rem 0.7rem
  border-radius: 999px
  background: var(--bc-success, #2e9e5b)
  color: #fff
  font-weight: 800
  font-size: clamp(0.8rem, 3.2vmin, 1rem)
  letter-spacing: 0.08em
  text-transform: uppercase
.wind__once
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
</style>
