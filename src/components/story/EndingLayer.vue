<template lang="pug">
  //- The ending (#102): its captions, Skip, the credits and the end card over
  //- the film (`story/ending.ts`). A tap on the film jumps to the next line.
  div.ending(v-if="endingUi.on" @pointerdown="onTap")
    button.skip(
      v-if="!endingUi.card"
      type="button"
      :aria-label="t('ui.skip')"
      @pointerdown.stop
      @click="endingLive?.skip()"
    )
      span {{ t('ui.skip') }}
      GameIcon.si(name="skip-forward")
    Transition(name="cap" mode="out-in")
      div.caption(v-if="endingUi.caption && !endingUi.credits && !endingUi.card" :key="endingUi.seq" role="status")
        span.who(v-if="endingUi.speaker") {{ t(`ending.speaker.${endingUi.speaker}`) }}
        span.line {{ t(`ending.${endingUi.caption}`) }}
    div.credits(v-if="endingUi.credits" aria-live="off")
      div.roll(:style="{ transform: `translateY(${(1 - endingUi.roll) * 100}vh) translateY(${-endingUi.roll * 100}%)` }")
        div.game Mega Droid
        div.by {{ t('ending.credits.by', { studio: STUDIO }) }}
        div.head {{ t('ending.credits.cast') }}
        div.cast
          span(v-for="c in CAST" :key="c") {{ t(`ending.cast.${c}`) }}
        div.head {{ t('ending.credits.masters') }}
        div.masters
          div.m(v-for="id in MASTERS" :key="id")
            MasterPortrait(:id="id" :size="52")
            span {{ t(`boss.${id}`) }}
        div.thanks {{ t('ending.credits.thanks') }}
    div.card(v-if="endingUi.card" @pointerdown.stop)
      div.title {{ t('ending.card.title') }}
      p.promise {{ t('ending.card.promise') }}
      div.actions
        FButton(type="primary" icon="replay" :label="t('ending.card.ngplus')" @click="confirming = true")
        FButton(type="secondary" icon="back" :label="t('ending.card.lab')" @click="endingLive?.choose('lab')")
    //- Vex's sting before New Game+: black, one red pixel, his skull assembling.
    div.sting(v-if="endingUi.sting" @pointerdown.stop="endingLive?.advance()")
      div.pixel
      svg.skull(viewBox="0 0 100 100" aria-hidden="true")
        rect(x="22" y="14" width="56" height="62" rx="22")
        circle(cx="38" cy="44" r="8")
        circle(cx="62" cy="44" r="8")
        path(d="M36 66 h28")
    div.confirm(v-if="confirming && !endingUi.sting" role="dialog" aria-modal="true" @pointerdown.stop)
      div.box
        div.title {{ t('ending.card.confirm') }}
        p {{ t('ending.card.confirmBody') }}
        div.actions
          FButton(type="primary" icon="replay" :label="t('ending.card.ngplus')" @click="endingLive?.choose('ngplus')")
          FButton(type="secondary" :label="t('cancel')" @click="confirming = false")
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import FButton from '@/components/atoms/FButton.vue'
import MasterPortrait from '@/components/atoms/MasterPortrait.vue'
import { endingUi } from '@/game/story/endingUi'
import { endingLive } from '@/game/flow'
import type { BossId } from '@/game/models/bosses'

const { t } = useI18n()
/** The studio, as it signs its games. A name: never translated. */
const STUDIO = 'Hyperg8 Studio'
const CAST = ['flux', 'atlas', 'pip', 'gauss'] as const
const MASTERS: BossId[] = ['scrapper', 'blazeMaster', 'frostMaster', 'voltMaster', 'galeMaster', 'magnetMaster',
  'drillMaster', 'tideMaster', 'neonMaster', 'rotorMaster', 'vexMk1']
const confirming = ref(false)

const onTap = (): void => {
  if (!endingUi.card) endingLive?.advance()
}
const onKey = (e: KeyboardEvent): void => {
  if (endingUi.card) return
  if (e.key === 'Escape') endingLive?.skip()
  else if (e.code === 'Space' || e.key === 'Enter') endingLive?.advance()
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped lang="sass">
.ending
  position: absolute
  inset: 0
  z-index: 20
  color: #fff
  font-family: var(--font-ui)
  pointer-events: auto
.skip
  position: absolute
  top: calc(env(safe-area-inset-top, 0px) + 12px)
  right: calc(env(safe-area-inset-right, 0px) + 12px)
  display: flex
  align-items: center
  gap: 6px
  padding: 8px 14px
  border-radius: 999px
  border: 2px solid rgba(255, 255, 255, 0.6)
  background: rgba(20, 26, 51, 0.6)
  color: #fff
  font-size: clamp(13px, 2.6vmin, 16px)
  cursor: pointer
  .si
    width: 18px
    height: 18px
.caption
  position: absolute
  left: 50%
  bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(24px, 9vh, 70px))
  transform: translateX(-50%)
  max-width: min(88vw, 640px)
  padding: 0.6em 1em
  border-radius: 14px
  background: rgba(10, 14, 30, 0.72)
  text-align: center
  font-size: clamp(15px, 3.4vmin, 22px)
  line-height: 1.35
  display: flex
  flex-direction: column
  gap: 4px
.who
  font-size: 0.75em
  color: #ffd84a
  letter-spacing: 0.06em
  text-transform: uppercase
.cap-enter-active, .cap-leave-active
  transition: opacity 0.4s
.cap-enter-from, .cap-leave-to
  opacity: 0
.credits
  position: absolute
  inset: 0
  overflow: hidden
  pointer-events: none
  background: linear-gradient(rgba(8, 10, 22, 0.55), rgba(8, 10, 22, 0.2) 40%, rgba(8, 10, 22, 0.55))
.roll
  display: flex
  flex-direction: column
  align-items: center
  gap: 18px
  padding: 0 16px
  text-align: center
.game
  font-family: var(--font-display, var(--font-ui))
  font-size: clamp(28px, 7vmin, 52px)
  color: #ffd84a
  text-shadow: 0 3px 0 #141a33
.by
  font-size: clamp(14px, 3vmin, 20px)
.head
  margin-top: 18px
  font-size: clamp(13px, 2.6vmin, 17px)
  color: #9fd6ff
  letter-spacing: 0.08em
  text-transform: uppercase
.cast
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 8px 22px
  font-size: clamp(16px, 3.4vmin, 22px)
.masters
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr))
  gap: 14px
  width: min(92vw, 640px)
.m
  display: flex
  flex-direction: column
  align-items: center
  gap: 4px
  font-size: clamp(11px, 2.2vmin, 14px)
.thanks
  margin-top: 26px
  font-size: clamp(18px, 4.4vmin, 30px)
  color: #ffd84a
.card
  position: absolute
  left: 50%
  top: 50%
  transform: translate(-50%, -50%)
  width: min(90vw, 520px)
  padding: 22px 18px
  border-radius: 18px
  background: rgba(12, 16, 36, 0.82)
  border: 3px solid #ffd84a
  text-align: center
  display: flex
  flex-direction: column
  gap: 12px
  animation: card-in 0.6s ease-out
.title
  font-family: var(--font-display, var(--font-ui))
  font-size: clamp(22px, 5vmin, 34px)
  color: #ffd84a
  text-shadow: 0 3px 0 #141a33
.promise
  margin: 0
  font-size: clamp(13px, 2.8vmin, 17px)
  color: #dfe7ff
.actions
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 10px
.sting
  position: absolute
  inset: 0
  z-index: 3
  background: #000
  display: grid
  place-items: center
  .pixel
    position: absolute
    left: 50%
    top: 34%
    width: 4px
    height: 4px
    background: #ff2d3f
    box-shadow: 0 0 10px #ff2d3f
    animation: sting-pixel 0.4s 0.4s both
  .skull
    position: absolute
    left: 50%
    top: 34%
    width: clamp(70px, 16vmin, 130px)
    transform: translate(-50%, -50%)
    fill: none
    stroke: #ff2d3f
    stroke-width: 3
    filter: drop-shadow(0 0 8px rgba(255, 45, 63, 0.8))
    animation: sting-skull 1.2s 0.8s steps(6) both
@keyframes sting-pixel
  from
    opacity: 0
@keyframes sting-skull
  from
    opacity: 0
    clip-path: inset(0 0 100% 0)
  to
    opacity: 1
    clip-path: inset(0 0 0 0)
@media (prefers-reduced-motion: reduce)
  .sting .pixel, .sting .skull
    animation: none
.confirm
  position: absolute
  inset: 0
  display: grid
  place-items: center
  background: rgba(4, 6, 14, 0.7)
  .box
    width: min(88vw, 460px)
    padding: 20px
    border-radius: 16px
    background: #141a33
    border: 2px solid #9fd6ff
    display: flex
    flex-direction: column
    gap: 12px
    text-align: center
    p
      margin: 0
      color: #dfe7ff
@keyframes card-in
  from
    opacity: 0
    transform: translate(-50%, -46%)
@media (prefers-reduced-motion: reduce)
  .card
    animation: none
</style>
