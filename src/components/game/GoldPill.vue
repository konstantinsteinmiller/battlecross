<template lang="pug">
  span.gold-pill(role="img" :aria-label="t('hud.gold', { n: fmt(profile.gold) })")
    IconCoin.gold-pill__coin
    span {{ fmt(profile.gold) }}
</template>

<script setup lang="ts">
/** The purse, wherever it is spent. */
import { useI18n } from 'vue-i18n'
import { profile } from '@/game/state/profile'
import { fmt } from '@/utils/format'
import IconCoin from '@/components/icons/IconCoin.vue'

const { t } = useI18n()
</script>

<style scoped lang="sass">
.gold-pill
  display: inline-flex
  align-items: center
  gap: 0.3em
  flex: 0 0 auto
  padding: 0.25em 0.7em 0.25em 0.4em
  border-radius: 999px
  border: 2px solid #0f1a30
  background: #1c2440
  color: #ffe066
  font-size: clamp(0.84rem, 3.5vmin, 1.1rem)
  line-height: 1
.gold-pill__coin
  width: 1.25em
  height: 1.25em
</style>
