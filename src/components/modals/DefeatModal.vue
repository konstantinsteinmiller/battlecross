<template lang="pug">
  FModal(:model-value="open" :title="t('defeat.title')" :is-closable="false")
    div.defeat
      p.lead {{ t('defeat.body') }}
      //- What is kept, as the same signed chips the job board promises.
      div.keep
        span {{ t('defeat.kept') }}
        span.chips
          span.chip.xp {{ t('combat.xp', { n: tally.xp }) }}
          span.chip.bolt
            | +{{ tally.bolts }}
            GameIcon.mini(name="nut")
    template(#footer)
      div.actions
        FButton(
          v-if="hud.tanks > 0"
          type="success"
          icon="flask"
          :label="t('defeat.useTank', { n: hud.tanks })"
          @click="useTank"
        )
        //- Poki (`platformPolicy.freeOptionFirst`): the free Retreat comes before
        //- the rewarded Reboot and is never smaller — an invisible copy of the
        //- offer's label sizes it.
        FButton(v-if="freeFirst" type="danger" icon="back" @click="retreat")
          span.free-label
            span {{ t('defeat.retreat') }}
            span.sizer(v-if="offerReboot" aria-hidden="true") {{ t('defeat.rebootAd') }}
        FButton(
          v-if="offerReboot"
          type="primary"
          icon="video"
          :is-disabled="adInFlight"
          :label="t('defeat.rebootAd')"
          @click="rebootAd"
        )
        FButton(v-if="!freeFirst" type="danger" icon="back" :label="t('defeat.retreat')" @click="retreat")
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { flow } from '@/game/flow'
import { hud } from '@/game/state/hud'
import { currentMission } from '@/game/boot'
import { profile, saveProfile } from '@/game/state/profile'
import { claimReward, canOfferReward, adInFlight } from '@/use/useAdGate'
import { resumeMusicAfterAd } from '@/use/useSound'
import { platformPolicy } from '@/platforms/capabilities'

/**
 * "System down" — Blades' defeat choice, casual-friendly: reboot on the spot
 * with a Repair Tank, or with a rewarded ad (once per mission), or retreat and
 * keep everything earned so far.
 */
const { t } = useI18n()
const open = computed(() => flow.modal === 'defeat')
const revivedByAd = ref(false)
// Once per MISSION, not per session: this modal lives as long as the scene.
watch(() => flow.quest, () => { revivedByAd.value = false })
const canAd = computed(() => canOfferReward.value)
/** Portal rule (Poki): the free choice before the rewarded one. */
const freeFirst = platformPolicy.freeOptionFirst
const offerReboot = computed(() => canAd.value && !revivedByAd.value)
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
  try {
    await claimReward(() => {
      revivedByAd.value = true
      currentMission()?.revive()
    })
  } finally {
    // The ad hard-stopped the music AND its play intent (so nothing could
    // sound under it). A revive puts the player straight back into the live
    // mission, so bring the track back — on a no-fill or a throw too.
    resumeMusicAfterAd()
  }
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
  display: flex
  flex-direction: column
  align-items: center
  gap: 6px
  font-size: clamp(12px, 2.6vmin, 15px)
  color: #9fe6ff
.chips
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 6px
.chip
  display: inline-flex
  align-items: center
  gap: 3px
  padding: 2px 9px
  border-radius: 999px
  background: rgba(0, 0, 0, 0.3)
  &.xp
    color: #9dff5a
  &.bolt
    color: #ffd84a
  // Nested, so it outranks GameIcon's own 100% sizing on specificity.
  .mini
    width: 1.1em
    height: 1.1em
.actions
  display: flex
  flex-wrap: wrap
  gap: 10px
  justify-content: center
// Poki: the free button's label shares one grid cell with an invisible copy of
// the rewarded label, so the free button is at least as wide as the offer.
.free-label
  display: inline-grid
  justify-items: center
  > *
    grid-area: 1 / 1
.sizer
  visibility: hidden
</style>
