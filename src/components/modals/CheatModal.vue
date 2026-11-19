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
        h3 Story
        p.cheat__now The whole first story cleared (every place, the throne, the Void Lord), the second arc open, level 30 at least.
        div.cheat__row
          FButton(label="Skip to the second arc" type="warning" size="sm" data-cheat-arc2 @click="skipToArc2")
      section.cheat__sec
        h3 Level
        p.cheat__now Level {{ profile.level }} of {{ heroLevelCap() }} · {{ profile.hero.points }} points to spend · {{ pointsEarned() }} earned in all, {{ pointsSpent() }} spent
        div.cheat__row
          FButton(v-for="n in [1, 5, 10]" :key="n" :label="`+${n} level${n > 1 ? 's' : ''}`" type="primary" size="sm" @click="levels(n)")
        div.cheat__row
          input.cheat__input(v-model.number="wanted" type="number" min="1" :max="heroLevelCap()" aria-label="Level" data-cheat-level)
          FButton(label="Set level" type="primary" size="sm" data-cheat-set-level @click="setLevel")
          FButton(label="Attribute points for this level" type="secondary" size="sm" data-cheat-points @click="fixPoints")
      section.cheat__sec
        h3 Skills
        p.cheat__now {{ profile.hero.learned.length }} of {{ allSkills.length }} learned
        div.cheat__row
          FButton(label="Unlock all skills" type="primary" size="sm" data-cheat-skills :is-disabled="profile.hero.learned.length >= allSkills.length" @click="unlockSkills")
      section.cheat__sec
        h3 Story events
        ul.cheat__events
          li(v-for="e in EVENTS" :key="e.id")
            span.cheat__name {{ e.label }}
            span.cheat__state(:class="{ 'is-on': e.get() }") {{ e.get() ? 'done' : 'not done' }}
            FButton(label="Set" type="success" size="sm" :is-disabled="e.get()" @click="e.set()")
            FButton(label="Reset" type="secondary" size="sm" :is-disabled="!e.get()" @click="e.reset()")
    template(#footer)
      FButton(label="Cheat mode off" type="danger" size="md" data-cheat-off @click="off")
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
import { ATTRS, ATTR_START, POINTS_PER_LEVEL } from '@/game/data/attributes'
import { ENDGAME_SKILLS, SKILLS } from '@/game/data/skills'
import { MAP } from '@/game/data/zones'
import { clearNode, grantXp, heroLevelCap, openAfterplay, profile, saveProfile } from '@/game/state/profile'
import { disableCheats } from '@/use/useCheats'
import { ref } from 'vue'

const close = (): void => { flow.modal = '' }
/** Cheat mode off again (`localStorage.cheat` removed), and the menu away. */
const off = (): void => { disableCheats(); flow.modal = '' }

// ── Level and its attribute points ───────────────────────────────────────────
const wanted = ref(profile.level)
/** What the levels so far entitle the hero to (`POINTS_PER_LEVEL` each from level 2), and what is already put into attributes. */
const pointsEarned = (): number => POINTS_PER_LEVEL * (profile.level - 1)
const pointsSpent = (): number => ATTRS.reduce((n, a) => n + Math.max(0, profile.hero.attrs[a] - ATTR_START), 0)
/** The points still to spend so that spent + unspent is what the reached level earns (never fewer than there are). */
const fixPoints = (): void => {
  profile.hero.points = Math.max(0, pointsEarned() - pointsSpent())
  profile.hero.pointsSeen = Math.min(profile.hero.pointsSeen, profile.hero.points)
  saveProfile()
}
/** Straight to a level (1 to the cap, the second arc's when it is open), the bar empty, and the points for it. */
const setLevel = (): void => {
  const n = Math.max(1, Math.min(heroLevelCap(), Math.round(Number(wanted.value) || profile.level)))
  profile.level = n
  profile.hero.xp = 0
  profile.stats.bestLevel = Math.max(profile.stats.bestLevel, n)
  wanted.value = n
  fixPoints()
}

// ── The second arc ───────────────────────────────────────────────────────────
/** Everything the first story ends with, then the second arc open. */
const skipToArc2 = (): void => {
  for (const n of MAP) clearNode(n.id)
  for (const f of ['arenaOpen', 'throneDone', ASSAULT_FLAG]) if (!profile.world.flags.includes(f)) profile.world.flags.push(f)
  profile.tips[KING_HOARD_TIP] = true
  openAfterplay()
  if (profile.level < 30) { wanted.value = 30; setLevel() } else fixPoints()
  saveProfile()
}

// ── Skills ───────────────────────────────────────────────────────────────────
const allSkills = [...SKILLS, ...ENDGAME_SKILLS]
const unlockSkills = (): void => {
  for (const s of allSkills) if (!profile.hero.learned.includes(s.id)) profile.hero.learned.push(s.id)
  saveProfile()
}
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
.cheat__input
  width: 5rem
  padding: 0.35rem 0.5rem
  border: 2px solid var(--bc-ink)
  border-radius: 0.5rem
  background: var(--bc-paper-hi)
  font: inherit
  font-weight: 800
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
