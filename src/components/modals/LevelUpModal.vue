<template lang="pug">
  FModal(:model-value="open" :title="t('levelUp.title')" :is-closable="false")
    div.lu
      div.badge
        span.n {{ profile.level }}
      p.sub {{ t('levelUp.pick') }}
      div.chips {{ t('levelUp.chip') }}
      div.cards
        button.card(v-for="a in ATTRS" :key="a" type="button" :class="a" @click="pick(a)")
          span.ico
            GameIcon(:name="ATTR_ICON[a]")
          span.name {{ t(`attr.${a}.name`) }}
          span.gain +{{ ATTR_GAIN[a] }}
          span.desc {{ t(`attr.${a}.desc`) }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { flow } from '@/game/flow'
import { profile, chooseAttr } from '@/game/state/profile'
import { ATTR_GAIN, ATTR_ICON, type Attr } from '@/game/data/progression'
import { currentHub } from '@/game/boot'
import { sfx } from '@/game/audio/sfx'

/**
 * Level-up: the Blades attribute pick (HP / Weapon Energy / Power). Opens in
 * the hub (never mid-fight) while picks are pending; each pick closes it or
 * moves to the next pending level.
 */
const { t } = useI18n()
const ATTRS: Attr[] = ['hp', 'we', 'power']
const open = computed(() => flow.modal === 'levelUp')
const pick = (a: Attr) => {
  if (!chooseAttr(a)) return
  sfx('levelUp')
  currentHub()?.celebrate()
  if (profile.hero.pendingAttrs <= 0) flow.modal = ''
}
</script>

<style scoped lang="sass">
.lu
  display: flex
  flex-direction: column
  align-items: center
  gap: 8px
  color: #fff
  font-family: var(--font-ui)
.badge
  width: clamp(64px, 14vmin, 90px)
  height: clamp(64px, 14vmin, 90px)
  border-radius: 50%
  display: grid
  place-items: center
  background: radial-gradient(circle at 40% 30%, #fff3a0, #ffd23a 50%, #e08a00)
  border: 4px solid #141a33
  box-shadow: 0 0 24px rgba(255, 210, 58, 0.6)
  animation: lu-spin 2.4s ease-in-out infinite
  .n
    font-family: var(--font-pixel)
    font-size: clamp(18px, 4vmin, 26px)
    color: #141a33
.sub
  margin: 0
  font-size: clamp(14px, 3vmin, 18px)
.chips
  font-size: clamp(12px, 2.6vmin, 15px)
  color: #7ff4ff
.cards
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: clamp(6px, 1.6vmin, 12px)
  width: min(86vw, 460px)
.card
  display: flex
  flex-direction: column
  align-items: center
  gap: 3px
  padding: clamp(8px, 1.8vmin, 12px) 6px
  border-radius: 14px
  border: 3px solid #141a33
  color: #fff
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35), inset 0 3px 0 rgba(255, 255, 255, 0.25)
  transition: transform 0.08s
  &:active
    transform: translateY(3px)
  &.hp
    background: linear-gradient(#ff8a8a, #d0303f)
  &.we
    background: linear-gradient(#8ad8ff, #1f7fd0)
  &.power
    background: linear-gradient(#b8ff8a, #2f9a3f)
.ico
  width: clamp(26px, 6vmin, 36px)
  height: clamp(26px, 6vmin, 36px)
.name
  font-size: clamp(12px, 2.6vmin, 15px)
  text-align: center
.gain
  font-family: var(--font-pixel)
  font-size: clamp(11px, 2.4vmin, 14px)
  color: #fff9c8
.desc
  font-size: clamp(9px, 2vmin, 12px)
  opacity: 0.9
  text-align: center
  line-height: 1.2
@keyframes lu-spin
  50%
    transform: scale(1.08) rotate(6deg)
</style>
