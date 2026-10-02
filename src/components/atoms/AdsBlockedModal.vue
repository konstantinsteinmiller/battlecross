<script setup lang="ts">
import FButton from '@/components/atoms/FButton.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
// ─── AdsBlockedModal ────────────────────────────────────────────────────
//
// Shown when the player tapped a "watch ad" button and:
//   1. The active ad provider returned `false` (no reward granted), AND
//   2. That provider has detected an ad-blocker is interfering with its
//      ad-fetch chain.
//
// Same component services every ad backend the game ships with
// (CrazyGames, GameDistribution, LevelPlay-on-native, Noop) — each
// provider populates its own `isAdsBlocked` ref via SDK-specific
// detection (CG's `sdk.ad.hasAdblock()`, GD's SDK_ERROR `Blocked:`
// pattern, etc.) and `useAds.showRewardedAd()` is the single seam that
// flips the modal-visible flag. Mounted unconditionally in App.vue;
// visibility is purely reactive on the flag.
//
// Wording is kid-safe because the game targets ages 6+. No mention
// of "ad blocker brand X", no urging to disable site-wide — just a
// gentle "we couldn't show your ad, please allow ads here to earn the
// reward". Adult-audience games can swap copy via a simple text edit.

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { dismissAdsBlockedModal, isAdsBlockedModalShown } from '@/use/useAds'

const { t } = useI18n()

// Hostname surfaced to the player so they know which site to allowlist.
// Falls back gracefully when running in a non-browser context (SSR,
// Node tests, Workers) where `window.location` is not a string.
const host = computed(() => {
  try {
    return window.location.host || 'this game'
  } catch {
    return 'this game'
  }
})
</script>

<template lang="pug">
  Teleport(to="body")
    Transition(
      name="ads-blocked-modal"
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    )
      //- z-[150]: must sit ABOVE every win/lose reward overlay (FReward
      //- z-[100]) and in-game menu (UpgradesModal z-[101], FSpeechBubble
      //- z-[100]) so the ad-blocker explainer is never buried under the
      //- screen that triggered the rewarded tap. Stays below the boot
      //- loader (FLogoProgress z-[200]), which never coexists with it.
      div.ads-blocked(
        v-if="isAdsBlockedModalShown"
        role="dialog"
        aria-modal="true"
        @click="dismissAdsBlockedModal"
      )
        //- Backdrop
        div.ads-blocked__backdrop

        //- Card
        div.ads-blocked__card(@click.stop)
          span.ads-blocked__badge(aria-hidden="true")
            GameIcon(name="shield")
          h2.ads-blocked__title {{ t('adsBlocked.title') }}
          p.ads-blocked__body {{ t('adsBlocked.body') }}
          p.ads-blocked__allow
            | {{ t('adsBlocked.allowPrefix') }}
            |
            span.ads-blocked__host {{ host }}
            |
            | {{ t('adsBlocked.allowSuffix') }}

          FButton(:label="t('adsBlocked.gotIt')" type="primary" size="md" block @click="dismissAdsBlockedModal")
</template>

<style scoped lang="sass">
.ads-blocked
  position: fixed
  inset: 0
  // Above every window and result overlay; below the boot loader.
  z-index: var(--bc-z-system)
  display: flex
  align-items: center
  justify-content: center
  padding: 1rem
  font-family: var(--font-ui)
.ads-blocked__backdrop
  position: absolute
  inset: 0
  background: var(--bc-backdrop)
  backdrop-filter: blur(4px)
.ads-blocked__card
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.6rem
  width: 100%
  max-width: 26rem
  padding: 1.3rem 1.2rem calc(1.2rem + var(--bc-press))
  border: var(--bc-ol-thick) solid var(--bc-ink)
  border-radius: var(--bc-r-xl)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0, var(--bc-paper-hi) 0.6rem, var(--bc-paper) 0.6rem, var(--bc-paper) 100%)
  box-shadow: 0 0.4rem 0 var(--bc-leather-deep), 0 0.4rem 0 var(--bc-ol-thick) var(--bc-ink)
  color: var(--bc-paper-ink)
  text-align: center
.ads-blocked__badge
  width: 3.4rem
  height: 3.4rem
  padding: 0.7rem
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: 50%
  background: linear-gradient(180deg, var(--bc-blue-hi) 0, var(--bc-blue-hi) 46%, var(--bc-blue) 46%, var(--bc-blue) 100%)
  color: var(--bc-text)
.ads-blocked__title
  margin: 0
  font-size: clamp(1.15rem, 5vmin, 1.5rem)
  line-height: 1.15
.ads-blocked__body
  margin: 0
  font-size: clamp(0.86rem, 3.6vmin, 1rem)
  line-height: 1.35
.ads-blocked__allow
  margin: 0 0 0.3rem
  color: var(--bc-paper-ink-soft)
  font-size: clamp(0.78rem, 3.2vmin, 0.9rem)
  line-height: 1.35
.ads-blocked__host
  color: var(--bc-gold-deep)
</style>
