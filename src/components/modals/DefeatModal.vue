<template lang="pug">
  FModal(:model-value="open" :title="t('defeat.title')" :is-closable="false")
    div.defeat
      p.lead {{ t('defeat.body') }}
      div.keep
        span {{ t('defeat.kept', { xp: tally.xp, bolts: tally.bolts }) }}
    template(#footer)
      div.actions
        FButton(
          v-if="hud.tanks > 0"
          type="success"
          icon="flask"
          :label="t('defeat.useTank', { n: hud.tanks })"
          @click="useTank"
        )
        FButton(
          v-if="canAd && !revivedByAd"
          type="primary"
          icon="video"
          :is-disabled="adInFlight"
          :label="t('defeat.rebootAd')"
          @click="rebootAd"
        )
        FButton(type="danger" icon="back" :label="t('defeat.retreat')" @click="retreat")
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { flow } from '@/game/flow'
import { hud } from '@/game/state/hud'
import { currentMission } from '@/game/boot'
import { profile, saveProfile } from '@/game/state/profile'
import { claimReward, canOfferReward, adInFlight } from '@/use/useAdGate'

/**
 * "System down" — Blades' defeat choice, casual-friendly: reboot on the spot
 * with a Repair Tank, or with a rewarded ad (once per mission), or retreat and
 * keep everything earned so far.
 */
const { t } = useI18n()
const open = computed(() => flow.modal === 'defeat')
const revivedByAd = ref(false)
const canAd = computed(() => canOfferReward.value)
const tally = computed(() => {
  const m = currentMission()
  return { xp: m?.xp ?? 0, bolts: m?.bolts ?? 0 }
})

const useTank = () => {
  if (profile.inv.tanks <= 0) return
  profile.inv.tanks--
  saveProfile()
  currentMission()?.revive()
}
const rebootAd = async () => {
  const ok = await claimReward(() => {
    revivedByAd.value = true
    currentMission()?.revive()
  })
  if (!ok) flow.modal = 'defeat'
}
const retreat = () => {
  flow.modal = ''
  currentMission()?.retreat()
}
</script>

<style scoped lang="sass">
.defeat
  text-align: center
  color: #fff
  font-family: var(--font-ui)
.lead
  font-size: clamp(14px, 3vmin, 18px)
  margin: 0 0 10px
.keep
  font-size: clamp(12px, 2.6vmin, 15px)
  color: #9fe6ff
.actions
  display: flex
  flex-wrap: wrap
  gap: 10px
  justify-content: center
</style>
