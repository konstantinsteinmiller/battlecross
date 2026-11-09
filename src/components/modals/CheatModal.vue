<template lang="pug">
  //- Dev cheat menu (typed "cmonc"). Plain strings on purpose: a debug tool, like the debug overlays.
  FModal(:model-value="true" title="Cheats" surface="parchment" tone="gold" @update:model-value="close")
    div.cheat(data-cheat)
      section.cheat__sec
        h3 Gold
        p.cheat__now {{ profile.gold }} gold
        div.cheat__row
          FButton(v-for="n in [100, 1000, 10000, 100000]" :key="n" :label="`+${n}`" type="primary" size="sm" @click="gold(n)")
      section.cheat__sec
        h3 Level
        p.cheat__now Level {{ profile.level }} · {{ profile.hero.points }} points to spend
        div.cheat__row
          FButton(v-for="n in [1, 5, 10]" :key="n" :label="`+${n} level${n > 1 ? 's' : ''}`" type="primary" size="sm" @click="levels(n)")
      section.cheat__sec
        h3 Story events
        ul.cheat__events
          li(v-for="e in EVENTS" :key="e.id")
            span.cheat__name {{ e.label }}
            span.cheat__state(:class="{ 'is-on': e.get() }") {{ e.get() ? 'done' : 'not done' }}
            FButton(label="Set" type="success" size="sm" :is-disabled="e.get()" @click="e.set()")
            FButton(label="Reset" type="secondary" size="sm" :is-disabled="!e.get()" @click="e.reset()")
    template(#footer)
      FButton(label="Close" type="success" size="md" @click="close")
</template>

<script setup lang="ts">
/**
 * ─── The cheat menu ──────────────────────────────────────────────────────────
 *
 * Opened by typing "cmonc" anywhere in the game (`useCheatWord`). Gold, level
 * ups and the story's milestones set or reset one by one. The profile is saved
 * after every press; a place already on screen shows the change when it is next
 * entered, so close this and go through the map.
 */
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { flow, KING_HOARD_TIP } from '@/game/flow'
import { ASSAULT_FLAG } from '@/game/data/assault'
import { xpToNext } from '@/game/data/progression'
import { NODE_BY_ID, type NodeId } from '@/game/data/zones'
import { clearNode, grantXp, openAfterplay, profile, saveProfile } from '@/game/state/profile'

const close = (): void => { flow.modal = '' }
const gold = (n: number): void => { profile.gold += n; saveProfile() }
const levels = (n: number): void => {
  for (let i = 0; i < n; i++) grantXp(xpToNext(profile.level) - profile.hero.xp)
  saveProfile()
}

interface Event { id: string; label: string; get: () => boolean; set: () => void; reset: () => void }

const flagOf = (f: string) => ({
  get: (): boolean => profile.world.flags.includes(f),
  set: (): void => { if (!profile.world.flags.includes(f)) profile.world.flags.push(f); saveProfile() },
  reset: (): void => { profile.world.flags = profile.world.flags.filter(x => x !== f); saveProfile() }
})
const nodeOf = (id: NodeId) => ({
  get: (): boolean => profile.world.cleared.includes(id),
  set: (): void => { clearNode(id); saveProfile() },
  reset: (): void => {
    if (!profile.world.cleared.includes(id)) return
    profile.world.cleared = profile.world.cleared.filter(x => x !== id)
    if (NODE_BY_ID[id]?.kind === 'zone') profile.story = Math.max(0, profile.story - 1)
    saveProfile()
  }
})
const tipOf = (id: string) => ({
  get: (): boolean => !!profile.tips[id],
  set: (): void => { profile.tips[id] = true; saveProfile() },
  reset: (): void => { delete profile.tips[id]; saveProfile() }
})

const EVENTS: Event[] = [
  { id: 'tutorial', label: 'Tutorial level finished (Sunford Plains)', ...nodeOf('plains') },
  { id: 'king', label: 'Goblin King defeated (Goblin Hollows cleared)', ...nodeOf('hollows') },
  { id: 'siege', label: 'Hollows gate siege won', ...flagOf(ASSAULT_FLAG) },
  { id: 'hoard', label: "King's hoard taken", ...tipOf(KING_HOARD_TIP) },
  {
    id: 'afterplay', label: 'Afterplay open (Void Lord fell)',
    get: (): boolean => profile.world.afterplay,
    set: (): void => { openAfterplay(); saveProfile() },
    reset: (): void => { profile.world.afterplay = false; profile.world.cleared = profile.world.cleared.filter(x => x !== 'rift'); saveProfile() }
  }
]
</script>

<style scoped lang="sass">
.cheat
  display: flex
  flex-direction: column
  gap: 0.8rem
  min-width: min(30rem, 86vw)
.cheat__sec h3
  margin: 0 0 0.2rem
  font-size: 1rem
.cheat__now
  margin: 0 0 0.35rem
  font-size: 0.85rem
  opacity: 0.8
.cheat__row
  display: flex
  flex-wrap: wrap
  gap: 0.4rem
.cheat__events
  list-style: none
  margin: 0
  padding: 0
  display: flex
  flex-direction: column
  gap: 0.4rem
  li
    display: flex
    align-items: center
    gap: 0.4rem
    flex-wrap: wrap
.cheat__name
  flex: 1 1 12rem
  font-weight: 800
  font-size: 0.9rem
.cheat__state
  font-size: 0.75rem
  opacity: 0.7
  &.is-on
    color: var(--bc-green-deep, #1d7a3a)
    opacity: 1
</style>
