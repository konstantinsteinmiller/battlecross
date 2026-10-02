<template lang="pug">
  ScreenShell.book(:art="ART[page]" :label="t(`menu.${page}`)" @close="closeModal")
    template(#lead)
      //- The book's three pages, as tabs standing on the top bar.
      nav.book__tabs(role="tablist")
        button.book__tab(
          v-for="p in PAGES"
          :key="p.id"
          type="button"
          role="tab"
          :data-page="p.id"
          :aria-selected="page === p.id"
          :aria-label="t(`menu.${p.id}`)"
          :class="{ 'is-active': page === p.id }"
          @click="go(p.id)"
        )
          span.book__tab-shadow(aria-hidden="true")
          span.book__tab-body
            GameIcon.book__tab-icon(:name="p.icon")
            span.book__tab-label {{ t(`menu.${p.id}`) }}
          FHudBadge.book__tab-badge(v-if="p.id === 'character' && profile.hero.points > 0" tone="red") {{ profile.hero.points }}
          FHudBadge.book__tab-badge(v-else-if="p.id === 'inventory' && profile.inv.fresh.length > 0" tone="green") {{ profile.inv.fresh.length }}
    template(#tail)
      GoldPill
    //- A page turns: the old one leaves toward the side the new one is not on.
    Transition(:name="back ? 'turn-back' : 'turn'" mode="out-in")
      CharacterPage(v-if="page === 'character'" key="character")
      SkillsPage(v-else-if="page === 'skills'" key="skills")
      EquipmentPage(v-else key="inventory")
</template>

<script setup lang="ts">
/**
 * ─── The hero's book (D39, D40) ──────────────────────────────────────────────
 *
 * Character, skills and equipment as three pages of ONE full-screen book,
 * opened by the HUD's three buttons on the page each one names. The page that
 * is open is `flow.modal` itself ('character' | 'skills' | 'inventory'), so a
 * tab and a HUD button are the same thing and a script can still read it.
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { closeModal, flow, type Modal } from '@/game/flow'
import { profile } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import FHudBadge from '@/components/atoms/FHudBadge.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { GameIconName } from '@/components/icons/iconNames'
import GoldPill from '@/components/game/GoldPill.vue'
import ScreenShell from '@/components/game/ScreenShell.vue'
import type { BackdropName } from '@/components/game/backdrops'
import CharacterPage from './CharacterPage.vue'
import SkillsPage from './SkillsPage.vue'
import EquipmentPage from './EquipmentPage.vue'

type Page = 'character' | 'skills' | 'inventory'
const PAGES: ReadonlyArray<{ id: Page; icon: GameIconName }> = [
  { id: 'character', icon: 'hero' },
  { id: 'skills', icon: 'book' },
  { id: 'inventory', icon: 'bag' }
]
/** What lies behind each page: the armoury for the hero and his gear, the
 *  constellation board for his skills. */
const ART: Record<Page, BackdropName> = { character: 'inventory', skills: 'skills', inventory: 'inventory' }

const { t } = useI18n()
const page = computed<Page>(() => (flow.modal === 'character' || flow.modal === 'skills' ? flow.modal : 'inventory'))

/** Which way the page turns: back when the new page is before the old one. */
const back = ref(false)
const index = (p: Page): number => PAGES.findIndex(x => x.id === p)
watch(page, (now, was) => { back.value = index(now) < index(was) }, { flush: 'sync' })

const go = (p: Page): void => {
  if (p === page.value) return
  sfx('uiClick')
  flow.modal = p as Modal
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.book__tabs
  display: flex
  align-items: flex-end
  gap: clamp(0.15rem, 0.8vmin, 0.4rem)
  min-width: 0
// A tab: leather while it waits, gold when it is the open page.
.book__tab
  +cel.tone('leather')
  position: relative
  flex: 0 1 auto
  min-width: 2.75rem
  padding: 0
  border: 0
  background: none
  cursor: pointer
  -webkit-tap-highlight-color: transparent
  +cel.focus-ring
  &.is-active
    +cel.tone('gold')
    flex-shrink: 0
  &:active .book__tab-body
    transition-duration: var(--bc-t-press)
    transform: translateY(var(--bc-press-sm)) scale(1.02, 0.94)
.book__tab-shadow
  position: absolute
  inset: 0
  transform: translateY(var(--bc-press-sm))
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  background-color: var(--c-deep)
.book__tab-body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  gap: 0.35em
  min-height: 2.75rem
  padding: 0 clamp(0.6rem, 2.6vmin, 1.1rem)
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  +cel.fill(46%, 88%)
  color: var(--bc-stitch)
  overflow: hidden
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
  .is-active &
    color: var(--bc-text)
.book__tab-icon
  flex: 0 0 auto
  width: clamp(1.15rem, 4.6vmin, 1.5rem)
  height: clamp(1.15rem, 4.6vmin, 1.5rem)
  filter: drop-shadow(0 2px 0 var(--bc-ink))
.book__tab-label
  min-width: 0
  font-size: clamp(0.7rem, 2.9vmin, 1rem)
  letter-spacing: 0.04em
  line-height: 1
  text-transform: uppercase
  text-shadow: var(--bc-text-outline)
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
.book__tab-badge
  position: absolute
  right: -0.35rem
  top: -0.4rem
  z-index: 2
// A narrow screen names only the open page; the others are their glyphs.
@media (max-width: 34rem)
  .book__tab:not(.is-active) .book__tab-label
    display: none
  .book__tab:not(.is-active) .book__tab-body
    padding-inline: 0

// ── The page turn ────────────────────────────────────────────────────────────
.turn-enter-active, .turn-back-enter-active
  transition: transform 220ms var(--bc-ease-out), opacity 160ms ease-out
.turn-leave-active, .turn-back-leave-active
  transition: transform 120ms ease-in, opacity 120ms ease-in
.turn-enter-from, .turn-back-leave-to
  opacity: 0
  transform: translateX(2rem) rotateY(-10deg)
.turn-leave-to, .turn-back-enter-from
  opacity: 0
  transform: translateX(-2rem) rotateY(10deg)
@media (prefers-reduced-motion: reduce)
  .turn-enter-active, .turn-back-enter-active, .turn-leave-active, .turn-back-leave-active
    transition: none
</style>
