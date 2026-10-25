<template lang="pug">
  FModal(:model-value="true" :title="t('iap.title')" :is-closable="false" surface="parchment" tone="gold")
    div.unlock(data-unlock)
      p.unlock__text(v-if="!owned") {{ t('iap.body') }}
      p.unlock__text.unlock__thanks(v-else data-unlock-thanks) {{ t('iap.thanks') }}
      p.unlock__status(v-if="statusKey" :class="{ 'is-bad': purchaseStatus === 'failed' || purchaseStatus === 'restoreNone' }" role="status" data-unlock-status) {{ t(statusKey) }}
    template(#footer)
      template(v-if="!owned")
        FButton(:label="t('iap.notNow')" type="secondary" size="md" :is-disabled="busy" @click="declineUnlock")
        FButton(
          :label="price ? t('iap.unlock', { price }) : t('iap.unlockNoPrice')"
          type="success"
          size="md"
          icon="lock"
          attention
          :is-disabled="busy"
          data-unlock-buy
          @click="buy"
        )
        //- App Review requires a restore path wherever a purchase is offered.
        button.unlock__restore(type="button" :disabled="busy" data-unlock-restore @click="restore") {{ t('iap.restore') }}
      FButton(v-else :label="t('continue')" type="success" size="md" data-unlock-continue @click="acceptUnlock")
</template>

<script setup lang="ts">
/**
 * The unlock offer of the iOS free demo (roadmap #Store-IAP): the Goblin King
 * is beaten, the rest of the game is a one-time purchase. Shown once right
 * after that (`flow.afterVisit`), and by any locked place on the map. The
 * price is the storefront's own string from StoreKit, never a hard-coded one.
 * "Not now" keeps the demo playable (the town after the Goblin King, the map
 * from a locked place); "Restore purchases" is the review-required way back
 * for a player who already bought on this Apple account.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { acceptUnlock, declineUnlock } from '@/game/flow'
import { buy, isFullVersion, loadProduct, price, purchaseStatus, restore } from '@/use/useFullVersion'

const { t } = useI18n()
const busy = computed(() => purchaseStatus.value === 'busy')
/** Bought (now, or restored, or approved while the offer was up): thank, then go on. */
const owned = computed(() => isFullVersion.value)
const statusKey = computed(() => {
  switch (purchaseStatus.value) {
    case 'busy': return 'iap.working'
    case 'pending': return 'iap.pending'
    case 'failed': return 'iap.failed'
    case 'restoreNone': return 'iap.restoreNone'
    default: return ''
  }
})

// The price may not have arrived at boot (offline start): ask again now.
if (!price.value) void loadProduct()
</script>

<style scoped lang="sass">
.unlock
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.6rem
  text-align: center
  color: var(--bc-on)
.unlock__text
  margin: 0
  max-width: 24rem
  font-size: clamp(0.95rem, 4vmin, 1.2rem)
  line-height: 1.3
.unlock__thanks
  font-weight: 700
.unlock__status
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.8rem, 3.2vmin, 1rem)
  &.is-bad
    color: var(--bc-on)
    font-weight: 700
.unlock__restore
  appearance: none
  background: none
  border: 0
  padding: 0.4rem 0.6rem
  color: var(--bc-on)
  font: inherit
  font-size: clamp(0.8rem, 3.2vmin, 1rem)
  text-decoration: underline
  cursor: pointer
  &:disabled
    opacity: 0.5
    cursor: default
</style>
