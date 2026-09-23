<template lang="pug">
  Transition(name="tf")
    div.target(v-if="hud.targetName" :class="{ elite: hud.targetElite }")
      div.row
        span.lv {{ t('enemy.level', { n: hud.targetLevel }) }}
        span.name
          template(v-if="hud.targetElite") {{ t('enemy.elite') }}&nbsp;
          | {{ t(hud.targetName) }}
      div.hpbar
        div.hpfill(:style="{ width: Math.max(0, hud.targetHp01 * 100) + '%' }")
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'

/** The locked target's name, level and health, top-centre (Blades-style). */
const { t } = useI18n()
</script>

<style scoped lang="sass">
.target
  position: absolute
  left: 50%
  top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 2vmin, 16px))
  transform: translateX(-50%)
  width: clamp(170px, 42vmin, 300px)
  pointer-events: none
.row
  display: flex
  justify-content: center
  align-items: baseline
  gap: 8px
  font-family: var(--font-ui)
  color: #fff
  text-shadow: 0 2px 0 #141a33, 0 0 4px #141a33
  font-size: clamp(13px, 2.8vmin, 18px)
  white-space: nowrap
.lv
  font-family: var(--font-pixel)
  font-size: 0.62em
  color: #9fe6ff
.elite .name
  color: #ffd84a
.hpbar
  margin-top: 4px
  height: clamp(8px, 1.6vmin, 11px)
  border: 2px solid #141a33
  border-radius: 6px
  background: #3a0d18
  overflow: hidden
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.35)
.hpfill
  height: 100%
  background: linear-gradient(#ff9aa0, #ff2d3f 60%, #c0101f)
  transition: width 0.15s ease-out
.tf-enter-active, .tf-leave-active
  transition: opacity 0.2s, transform 0.2s
.tf-enter-from, .tf-leave-to
  opacity: 0
  transform: translate(-50%, -8px)
</style>
