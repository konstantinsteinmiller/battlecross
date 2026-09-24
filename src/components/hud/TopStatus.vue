<template lang="pug">
  div.top-status
    div.lvl(:aria-label="t('hud.level', { n: hud.level })")
      span.lv-num {{ hud.level }}
      div.xp
        div.xp-fill(:style="{ width: Math.min(100, hud.xp01 * 100) + '%' }")
    div.bolts(:aria-label="t('hud.bolts')" @pointerdown="registerQaAdTap()")
      span.bolt-icon
        GameIcon(name="bolt")
      span.bolt-num {{ fmt(hud.bolts) }}
    button.help(type="button" :aria-label="t('hud.help')" @click="help")
      GameIcon(name="help")
    button.pause(type="button" :aria-label="t('ui.pause')" @click="$emit('pause')")
      GameIcon(name="pause")
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import GameIcon from '@/components/icons/GameIcon.vue'
import { formatCount } from '@/utils/localeNumber'
import { registerQaAdTap } from '@/use/useQaAdTrigger'
import { currentMission } from '@/game/boot'

defineEmits<{ pause: [] }>()
const { t, locale } = useI18n()
const fmt = (n: number) => formatCount(Math.round(n), locale.value)
/** Bring the control glyphs back (the coach's "?"). */
const help = () => currentMission()?.showHelp()
</script>

<style scoped lang="sass">
.top-status
  position: absolute
  right: calc(env(safe-area-inset-right, 0px) + clamp(8px, 2.2vmin, 18px))
  top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 2.2vmin, 18px))
  display: flex
  align-items: center
  gap: clamp(6px, 1.4vmin, 10px)
  pointer-events: none
.lvl
  position: relative
  display: flex
  align-items: center
  gap: 4px
  padding: 3px 8px 3px 3px
  border-radius: 999px
  background: rgba(11, 20, 51, 0.72)
  border: 2px solid #141a33
.lv-num
  display: grid
  place-items: center
  width: clamp(22px, 5vmin, 30px)
  height: clamp(22px, 5vmin, 30px)
  border-radius: 50%
  background: radial-gradient(circle at 40% 30%, #fff3a0, #ffd23a 50%, #e08a00)
  border: 2px solid #141a33
  color: #141a33
  font-family: var(--font-pixel)
  font-size: clamp(9px, 2vmin, 12px)
.xp
  width: clamp(40px, 10vmin, 70px)
  height: 6px
  border-radius: 3px
  background: #0b1433
  overflow: hidden
.xp-fill
  height: 100%
  background: linear-gradient(90deg, #9dff5a, #3cff9a)
  transition: width 0.3s ease-out
.bolts
  // Takes taps for the hidden QA ad trigger (useQaAdTrigger), so a tap here
  // never turns the view either.
  pointer-events: auto
  display: flex
  align-items: center
  gap: 4px
  padding: 3px 10px 3px 4px
  border-radius: 999px
  background: rgba(11, 20, 51, 0.72)
  border: 2px solid #141a33
  color: #fff
  font-family: var(--font-pixel)
  font-size: clamp(9px, 2vmin, 12px)
.bolt-icon
  width: clamp(18px, 4vmin, 24px)
  height: clamp(18px, 4vmin, 24px)
  color: #ffd84a
.help
  pointer-events: auto
  width: clamp(32px, 7vmin, 42px)
  height: clamp(32px, 7vmin, 42px)
  border-radius: 50%
  border: 3px solid #141a33
  background: linear-gradient(#8fe0ff, #3c8cff)
  color: #fff
  padding: clamp(5px, 1.4vmin, 8px)
  flex: 0 0 auto
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  &:active
    transform: translateY(2px)
.pause
  pointer-events: auto
  width: clamp(36px, 8vmin, 48px)
  height: clamp(36px, 8vmin, 48px)
  border-radius: 12px
  border: 3px solid #141a33
  background: linear-gradient(#3a5a9a, #22386a)
  color: #fff
  padding: clamp(6px, 1.6vmin, 10px)
  flex: 0 0 auto
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  &:active
    transform: translateY(2px)
</style>
