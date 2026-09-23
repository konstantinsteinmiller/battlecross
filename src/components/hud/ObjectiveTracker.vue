<template lang="pug">
  div.obj(v-if="hud.objectiveKey && hud.phase !== 'hub'" :class="{ done: hud.objectiveDone }")
    div.obj-head
      span.dot
      span.label {{ hud.objectiveDone ? t('objective.complete') : t('objective.title') }}
    div.obj-text {{ hud.objectiveDone ? t('objective.beamOutHint') : t(hud.objectiveKey, resolveParams(t, hud.objectiveParams)) }}
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { resolveParams } from '@/game/state/i18nParams'

/** The mission objective line (Blades' quest tracker), under the energy bars. */
const { t } = useI18n()
</script>

<style scoped lang="sass">
.obj
  position: absolute
  left: calc(env(safe-area-inset-left, 0px) + clamp(8px, 2.2vmin, 18px) + clamp(40px, 9vmin, 60px))
  top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 2.2vmin, 18px))
  max-width: min(44vw, 280px)
  padding: 6px 10px
  border-radius: 10px
  background: rgba(11, 20, 51, 0.62)
  border: 2px solid rgba(127, 244, 255, 0.35)
  color: #fff
  font-family: var(--font-ui)
  pointer-events: none
  &.done
    border-color: rgba(141, 255, 122, 0.8)
    box-shadow: 0 0 14px rgba(141, 255, 122, 0.35)
.obj-head
  display: flex
  align-items: center
  gap: 6px
  font-size: clamp(9px, 1.9vmin, 12px)
  color: #9fe6ff
  letter-spacing: 0.06em
  text-transform: uppercase
.done .obj-head
  color: #8dff7a
.dot
  width: 7px
  height: 7px
  border-radius: 50%
  background: currentColor
  box-shadow: 0 0 6px currentColor
.obj-text
  margin-top: 2px
  font-size: clamp(11px, 2.4vmin, 15px)
  line-height: 1.25
  text-shadow: 0 2px 0 #141a33
</style>
