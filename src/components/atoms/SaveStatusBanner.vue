<script setup lang="ts">
import GameIcon from '@/components/icons/GameIcon.vue'
// Two-purpose corner banner:
//   1. Offline mode — when the strategy is in failed-retrying / failed-final,
//      tell the player their progress is saved locally but cloud is paused,
//      and offer a "Retry" button.
//   2. Conflict-merge bonus — when a hydrate detected a higher cloud save
//      and we restored it, show the bonus coins so the loss-of-local feels
//      like a gain instead of a punishment. Auto-dismisses after a few sec.
//
// Tap-to-dismiss for both states. Mounted from App.vue.
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  acknowledgeBonus,
  bonusCoinsAwarded,
  hasBonusToShow,
  isOfflineMode,
  retryInFlight,
  retrySync
} from '@/use/useSaveStatus'
import { isCrazyWeb } from '@/use/useUser'

const { t } = useI18n()

const dismissed = ref(false)

const offlineDismissed = ref(false)
watch(isOfflineMode, (on) => {
  if (!on) offlineDismissed.value = false
})

// Auto-dismiss the bonus after 6 seconds so it doesn't linger forever.
let bonusTimer: ReturnType<typeof setTimeout> | null = null
watch(bonusCoinsAwarded, (n) => {
  if (n > 0) {
    if (bonusTimer) clearTimeout(bonusTimer)
    bonusTimer = setTimeout(() => acknowledgeBonus(), 6_000)
  }
})
onUnmounted(() => {
  if (bonusTimer) clearTimeout(bonusTimer)
})

// The offline banner says "Playing offline. Your progress is saved here." —
// only TRUE for builds with a local fallback (LocalStorage / Glitch / itch / GD
// / GamePix, all `persistToRaw: true`). CrazyGames is CLOUD-ONLY
// (`persistToRaw: false`), so there is no local save and the message would be a
// lie; the strategy also goes `failed-retrying` whenever `sdk.data` is
// unreachable — which is ALWAYS the case off-portal (localhost / preview),
// flashing a scary banner during dev. The retry ladder still heals silently
// underneath, and CG doesn't mandate an offline notice, so suppress the banner
// on CG entirely. The "cloud save restored" bonus banner is unaffected.
const showOffline = computed(() => isOfflineMode.value && !offlineDismissed.value && !isCrazyWeb)
const showBonus = computed(() => hasBonusToShow.value && !dismissed.value)

const onRetry = async (e: Event) => {
  e.stopPropagation()
  await retrySync()
}

const onDismissOffline = () => {
  offlineDismissed.value = true
}
const onDismissBonus = () => {
  acknowledgeBonus()
  dismissed.value = true
}

// Reset per-show dismiss flag so a future bonus can show again.
watch(hasBonusToShow, (on) => {
  if (on) dismissed.value = false
})
</script>

<template lang="pug">
  div.save-status
    //- Bonus banner — green / celebratory
    div.save-status__slip.is-bonus(v-if="showBonus" @click="onDismissBonus")
      span.save-status__mark(aria-hidden="true")
        GameIcon(name="gift")
      div.save-status__text
        div.save-status__title {{ t('saveStatus.restoredTitle') }}
        div.save-status__body {{ t('saveStatus.restoredBody', { n: bonusCoinsAwarded }) }}
      span.save-status__body {{ t('saveStatus.tap') }}

    //- Offline banner — amber / informational
    div.save-status__slip.is-offline(v-else-if="showOffline")
      span.save-status__mark(aria-hidden="true")
        GameIcon(name="info")
      div.save-status__text
        div.save-status__title {{ t('saveStatus.pausedTitle') }}
        div.save-status__body {{ t('saveStatus.pausedBody') }}
      button.save-status__retry(type="button" :disabled="retryInFlight" @click="onRetry") {{ retryInFlight ? '…' : t('saveStatus.retry') }}
      button.save-status__close(type="button" :aria-label="t('saveStatus.dismiss')" @click="onDismissOffline")
        GameIcon(name="close")
</template>

<style scoped lang="sass">
.save-status
  position: fixed
  left: 0.5rem
  right: 0.5rem
  bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px))
  z-index: 40
  display: flex
  flex-direction: column
  gap: 0.5rem
  font-family: var(--font-ui)
  pointer-events: none
  @media (min-width: 640px)
    left: auto
    right: 1rem
    max-width: 24rem
// A slip of parchment with a coloured mark: green for good news, amber for a wait.
.save-status__slip
  --c-hi: var(--bc-green-hi)
  --c: var(--bc-green)
  display: flex
  align-items: center
  gap: 0.6rem
  padding: 0.45rem 0.7rem
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0, var(--bc-paper-hi) 0.4rem, var(--bc-paper) 0.4rem, var(--bc-paper) 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-paper-ink)
  font-size: 0.875rem
  pointer-events: auto
  &.is-bonus
    cursor: pointer
  &.is-offline
    --c-hi: var(--bc-orange-hi)
    --c: var(--bc-orange)
.save-status__mark
  flex: 0 0 auto
  width: 2rem
  height: 2rem
  padding: 0.38rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: linear-gradient(180deg, var(--c-hi) 0, var(--c-hi) 46%, var(--c) 46%, var(--c) 100%)
  color: var(--bc-ink)
.save-status__text
  flex: 1 1 auto
  min-width: 0
.save-status__title
  font-weight: 900
.save-status__body
  color: var(--bc-paper-ink-soft)
  font-size: 0.75rem
.save-status__retry
  flex: 0 0 auto
  min-height: 2rem
  padding: 0.2rem 0.6rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: linear-gradient(180deg, var(--bc-gold-hi) 0, var(--bc-gold-hi) 46%, var(--bc-gold) 46%, var(--bc-gold) 100%)
  box-shadow: 0 2px 0 var(--bc-ink)
  color: var(--bc-ink)
  font: inherit
  font-size: 0.75rem
  font-weight: 900
  cursor: pointer
  &:disabled
    opacity: 0.5
.save-status__close
  flex: 0 0 auto
  width: 2rem
  height: 2rem
  padding: 0.55rem
  border: 0
  background: none
  color: var(--bc-paper-ink-soft)
  cursor: pointer
</style>
