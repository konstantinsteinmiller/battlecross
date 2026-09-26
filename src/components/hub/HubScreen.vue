<template lang="pug">
  div.hub
    div.topbar
      div.lvl
        span.lv-num {{ profile.level }}
        div.lv-col
          span.lv-label {{ t('hud.level', { n: profile.level }) }}
          div.xp
            div.xp-fill(:style="{ width: Math.min(100, xp01() * 100) + '%' }")
      button.pill.attr(v-if="profile.hero.pendingAttrs > 0" type="button" @click="flow.modal = 'levelUp'")
        GameIcon.pi(name="star")
        span {{ t('hub.levelUpReady') }}
      div.spacer
      div.pill.bolts(data-lesson="bolts" @pointerdown="registerQaAdTap()")
        GameIcon.pi(name="nut")
        span {{ fmt(profile.bolts) }}
      //- The top-100 list, on builds with a live board only (a baked board's
      //- rows would be invented players; there the results screen shows the
      //- rank badge alone).
      button.pill.ranks(
        v-if="leaderboardListEnabled"
        type="button"
        :aria-label="t('leaderboard.title')"
        @click="showBoard = true"
      )
        GameIcon.pi(name="leaderboard")
      button.pill.cog(type="button" :aria-label="t('options.title')" @click="$emit('options')")
        GameIcon.pi(name="settings")
    LeaderboardModal(v-if="leaderboardListEnabled" v-model="showBoard" :score="lifetimeXp()")
    div.panel(:class="`tab-${tab}`")
      Transition(name="tab-fade" mode="out-in")
        MissionsTab(v-if="tab === 'missions'" key="m")
        HeroTab(v-else-if="tab === 'hero'" key="h")
        CircuitsTab(v-else-if="tab === 'circuits'" key="c")
        WorkshopTab(v-else key="w")
    nav.tabs
      button.tab(
        v-for="tb in TABS"
        :key="tb.id"
        type="button"
        :class="{ on: tab === tb.id }"
        :data-lesson="`tab-${tb.id}`"
        :aria-label="tb.aria ? t(tb.aria) : undefined"
        @click="setTab(tb.id)"
      )
        span.t-ico
          GameIcon(:name="tb.icon")
          span.badge(v-if="tb.id === 'circuits' && chipsAvailable() > 0") {{ chipsAvailable() }}
          span.badge(v-if="tb.id === 'hero' && (profile.inv.fresh.length > 0 || profile.hero.pendingAttrs > 0)") !
        span.t-label {{ t(`hub.tab.${tb.id}`) }}
    HubLesson
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { GameIconName } from '@/components/icons/iconNames'
import MissionsTab from './MissionsTab.vue'
import HeroTab from './HeroTab.vue'
import CircuitsTab from './CircuitsTab.vue'
import WorkshopTab from './WorkshopTab.vue'
import HubLesson from './HubLesson.vue'
import { hubTab, type HubTab } from './hubLesson'
import { profile, xp01, chipsAvailable, lifetimeXp } from '@/game/state/profile'
import LeaderboardModal from '@/components/organisms/LeaderboardModal.vue'
import { leaderboardListEnabled } from '@/use/useLeaderboard'
import { flow } from '@/game/flow'
import { formatCount } from '@/utils/localeNumber'
import { sfx } from '@/game/audio/sfx'
import { registerQaAdTap } from '@/use/useQaAdTrigger'

/**
 * The hub: Gauss's lab behind, the menus in front. Missions is the home tab
 * (deploying is always one tap away); Hero, Circuits and Workshop hold the
 * RPG layer. Portrait lays the panel out as a bottom sheet; landscape as a
 * left column, so Flux stays visible on the other side.
 */
defineEmits<{ options: [] }>()
const { t, locale } = useI18n()
type Tab = HubTab
/** `aria`: a spoken name for a tab whose visible label needs one. */
const TABS: Array<{ id: Tab; icon: GameIconName; aria?: string }> = [
  { id: 'missions', icon: 'play' },
  // The hero's tab is labelled with his name, and a name alone can read as
  // a plain word (his old name was taken for the metal). The face glyph, the
  // name plate at the top of his panel and this spoken name say it is the
  // player's android. (The face is `android`; `helmet` is the gear slot.)
  { id: 'hero', icon: 'android', aria: 'hub.heroTabAria' },
  { id: 'circuits', icon: 'chart' },
  { id: 'workshop', icon: 'anvil' }
]
// Shared with the upgrade tour (it watches which tab is open). Every visit
// to the lab opens on Missions: deploying is always one tap away.
const tab = hubTab
tab.value = 'missions'
/** The leaderboard modal; it fetches the board when it opens, not before. */
const showBoard = ref(false)
const setTab = (id: Tab) => {
  if (tab.value !== id) sfx('uiClick')
  tab.value = id
}
const fmt = (n: number) => formatCount(Math.round(n), locale.value)

onMounted(() => {
  // Pending attribute picks are offered as soon as the hub opens.
  if (profile.hero.pendingAttrs > 0 && !flow.modal) flow.modal = 'levelUp'
})
</script>

<style scoped lang="sass">
.hub
  position: absolute
  inset: 0
  display: flex
  flex-direction: column
  pointer-events: none
  color: #fff
  font-family: var(--font-ui)
  padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)
.topbar
  pointer-events: auto
  display: flex
  align-items: center
  gap: clamp(6px, 1.4vmin, 10px)
  padding: clamp(8px, 2vmin, 14px)
.spacer
  flex: 1
.lvl
  display: flex
  align-items: center
  gap: 8px
  padding: 4px 12px 4px 4px
  border-radius: 999px
  background: rgba(11, 20, 51, 0.78)
  border: 2px solid #141a33
.lv-num
  display: grid
  place-items: center
  width: clamp(30px, 7vmin, 40px)
  height: clamp(30px, 7vmin, 40px)
  border-radius: 50%
  background: radial-gradient(circle at 40% 30%, #fff3a0, #ffd23a 50%, #e08a00)
  border: 3px solid #141a33
  color: #141a33
  font-family: var(--font-pixel)
  font-size: clamp(10px, 2.4vmin, 14px)
.lv-col
  display: flex
  flex-direction: column
  gap: 3px
.lv-label
  font-size: clamp(11px, 2.4vmin, 14px)
.xp
  width: clamp(70px, 18vmin, 130px)
  height: 7px
  border-radius: 4px
  background: #0b1433
  overflow: hidden
.xp-fill
  height: 100%
  background: linear-gradient(90deg, #9dff5a, #3cff9a)
.pill
  display: flex
  align-items: center
  gap: 6px
  padding: 5px 12px
  border-radius: 999px
  background: rgba(11, 20, 51, 0.78)
  border: 2px solid #141a33
  color: #fff
  font-size: clamp(12px, 2.6vmin, 15px)
  .pi
    width: clamp(16px, 3.6vmin, 22px)
    height: clamp(16px, 3.6vmin, 22px)
.bolts .pi
  color: #ffd84a
.attr
  background: linear-gradient(#ffd23a, #e08a00)
  color: #141a33
  animation: pill-pulse 1.2s ease-in-out infinite
.cog, .ranks
  padding: 6px
.ranks .pi
  color: #ffd84a
.panel
  pointer-events: auto
  flex: 1
  min-height: 0
  margin: 0 clamp(8px, 2vmin, 14px)
  display: flex
  flex-direction: column
.tabs
  pointer-events: auto
  display: grid
  grid-template-columns: repeat(4, 1fr)
  gap: 6px
  padding: clamp(6px, 1.6vmin, 10px) clamp(8px, 2vmin, 14px) clamp(8px, 2vmin, 14px)
.tab
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: 2px
  padding: clamp(6px, 1.4vmin, 9px) 4px
  border-radius: 14px
  border: 3px solid #141a33
  background: linear-gradient(#2f4580, #1c2a50)
  color: #9fb8e6
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35)
  &.on
    background: linear-gradient(#4fd8ff, #1f7fd0)
    color: #fff
    transform: translateY(-3px)
.t-ico
  position: relative
  width: clamp(22px, 5vmin, 30px)
  height: clamp(22px, 5vmin, 30px)
.badge
  position: absolute
  right: -12px
  top: -8px
  min-width: 18px
  height: 18px
  padding: 0 4px
  border-radius: 9px
  background: #ff4a5a
  border: 2px solid #141a33
  color: #fff
  font-family: var(--font-pixel)
  font-size: 8px
  line-height: 14px
  text-align: center
.t-label
  font-size: clamp(10px, 2.2vmin, 13px)
  white-space: nowrap
.tab-fade-enter-active, .tab-fade-leave-active
  transition: opacity 0.15s, transform 0.15s
.tab-fade-enter-from, .tab-fade-leave-to
  opacity: 0
  transform: translateY(8px)
@keyframes pill-pulse
  50%
    transform: scale(1.06)

// Landscape: the panel is a left column, Flux stands on the right.
@media (orientation: landscape)
  .panel
    width: min(56vw, 620px)
  .tabs
    width: min(56vw, 620px)
// Portrait: the panel is a bottom sheet under Flux.
@media (orientation: portrait)
  .panel
    justify-content: flex-end
</style>
