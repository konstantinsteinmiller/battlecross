<template lang="pug">
  div.skills(:class="{ 'is-dragging': drag.state.active, 'is-armed': armed }")
    //- ── The loadout: what goes into the fight ───────────────────────────────
    section.skills__board
      h3.skills__cap {{ t('skills.active') }}
      div.loadout.loadout--active
        button.slot(
          v-for="(id, i) in profile.hero.active"
          :key="`a${i}`"
          type="button"
          :class="slotClass('active', i, id)"
          :data-drop="`active:${i}`"
          :aria-label="id ? t(`skill.${id}.name`) : t('skills.emptySlot', { n: i + 1 })"
          v-on="id ? drag.handle({ id, from: `active:${i}` }) : {}"
          @click="tapSlot('active', i)"
        )
          FSocket(shape="square" :tint="id ? colorOf(id) : undefined" :empty="!id" :gem="!!id")
            span.slot__face(v-if="id")
              SkillIcon(:id="id" :dim="!usable(id)")
            template(#badge)
              span.slot__n {{ i + 1 }}
      h3.skills__cap {{ t('skills.passive') }}
      div.loadout.loadout--passive
        button.slot.slot--round(
          v-for="(id, i) in profile.hero.passive"
          :key="`p${i}`"
          type="button"
          :class="slotClass('passive', i, id)"
          :data-drop="`passive:${i}`"
          :aria-label="id ? t(`skill.${id}.name`) : t('skills.emptySlot', { n: i + 1 })"
          v-on="id ? drag.handle({ id, from: `passive:${i}` }) : {}"
          @click="tapSlot('passive', i)"
        )
          FSocket(shape="round" metal="steel" :tint="id ? colorOf(id) : undefined" :empty="!id")
            span.slot__face(v-if="id")
              SkillIcon(:id="id" :dim="!usable(id)")
      p.skills__how {{ armed ? t('skills.howSlot') : t('skills.how') }}

    div.skills__rest
      //- ── The codex: eight classes, six skills each ─────────────────────────
      section.skills__book.codex(data-drop="tree" :style="{ '--tint': CLASSES[cls].color }")
        div.codex__classes(role="tablist")
          button.emblem(
            v-for="c in CLASS_IDS"
            :key="c"
            type="button"
            role="tab"
            :aria-selected="cls === c"
            :aria-label="t('skills.classCount', { cls: t(`class.${c}.name`), n: learnedOf(c), total: skillsOf(c).length })"
            :class="{ 'is-active': cls === c, 'is-bare': learnedOf(c) === 0 }"
            :style="{ '--tint': CLASSES[c].color }"
            @click="pickClass(c)"
          )
            span.emblem__disc
              ArtIcon(:glyph="`skill.${skillsOf(c)[0].id}`" :tint="CLASSES[c].color" frame="none")
            span.emblem__pips(aria-hidden="true")
              span.emblem__pip(v-for="s in skillsOf(c)" :key="s.id" :class="{ on: knows(s.id) }")
        header.codex__head
          h3.codex__name {{ t(`class.${cls}.name`) }}
          p.codex__desc {{ t(`class.${cls}.desc`) }}
        //- The class's six skills as a path, in the order they are learned.
        div.codex__path
          button.node(
            v-for="s in skillsOf(cls)"
            :key="s.id"
            type="button"
            :class="{ 'is-sel': picked === s.id, 'is-known': knows(s.id), 'is-open': !knows(s.id) && usable(s.id), 'is-locked': !knows(s.id) && !usable(s.id), 'is-round': s.kind === 'passive', 'is-used': slotted(s.id) }"
            :aria-label="t(`skill.${s.id}.name`)"
            :aria-pressed="picked === s.id"
            v-on="knows(s.id) ? drag.handle({ id: s.id, from: 'tree' }) : {}"
            @click="tapNode(s.id)"
          )
            span.node__icon
              SkillIcon(:id="s.id" :dim="!knows(s.id)")
            span.node__mark(v-if="!knows(s.id)" aria-hidden="true")
              GameIcon(:name="usable(s.id) ? 'plus' : 'lock'")
            span.node__used(v-else-if="slotted(s.id)" aria-hidden="true")
              GameIcon(name="check")
            span.node__lvl(:class="{ bad: profile.level < s.level }") {{ t('hud.level', { n: s.level }) }}

      //- ── The skill in hand ─────────────────────────────────────────────────
      section.skills__card
        template(v-if="picked")
          SkillCard(:id="picked" :dim="!knows(picked)")
          p.skills__note(v-if="!knows(picked) && place") {{ place.met ? t('skills.hint.met', { name: t(`npc.${place.npc}.name`), place: t(`node.${place.node}.name`) }) : t('skills.hint.unmet', { place: t(`node.${place.node}.name`) }) }}
          p.skills__note.is-bad(v-else-if="knows(picked) && !usable(picked)") {{ t('skills.unmet') }}
          div.loadout__actions(v-if="knows(picked)")
            FButton(v-if="slotted(picked)" :label="t('skills.remove')" type="danger" size="sm" @click="remove")
            FButton(:label="t('skills.equip')" type="success" size="sm" :is-disabled="!usable(picked)" @click="equip")
        p.skills__hint(v-else) {{ profile.hero.learned.length ? t('skills.how') : t('skills.none') }}

    Teleport(to="body")
      div.drag-ghost(v-if="drag.state.active && drag.state.payload" :ref="drag.ghost" :class="{ 'is-round': kindOf(drag.state.payload.id) === 'passive' }")
        SkillIcon(:id="drag.state.payload.id")
</template>

<script setup lang="ts">
/**
 * ─── The skills page (D40) ───────────────────────────────────────────────────
 *
 * The loadout is the centrepiece: six active sockets in the order of the
 * battle bar and three round passive ones. Under it the codex: the eight
 * classes as emblems, each opening its six skills as a path — learned,
 * learnable (the hero meets its bars: the page says who teaches it and
 * where), or locked behind its requirements.
 *
 *   tap a skill, then a slot      slot it there (or the other way round:
 *                                 an empty slot first, then the skill)
 *   drag a skill onto a slot      the same, in one move
 *   drag a slot onto another      swap them
 *   drag a slot back to the codex take it out
 *
 * The build is classless (GDD §4.2): any learned skill goes in any slot of
 * its kind. Every change goes through `setSlot`, which checks the
 * requirements again.
 */
import { computed, nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CLASSES, CLASS_IDS, SKILL_BY_ID, meetsSkill, skillsOf, type ClassId } from '@/game/data/skills'
import { knows, profile, setSlot, totalAttrs } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import FButton from '@/components/atoms/FButton.vue'
import FSocket from '@/components/atoms/FSocket.vue'
import ArtIcon from '@/components/art/ArtIcon.vue'
import SkillIcon from '@/components/art/SkillIcon.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import SkillCard from '@/components/game/SkillCard.vue'
import { burst, thunk } from '@/components/game/fx'
import { trainerPlace } from '@/components/game/trainerPlace'
import { useDrag } from '@/components/game/useDrag'

type Kind = 'active' | 'passive'
const { t } = useI18n()

const kindOf = (id: string): Kind => SKILL_BY_ID[id]?.kind ?? 'active'
const colorOf = (id: string): string => SKILL_BY_ID[id]?.color ?? ''
const slotsOf = (kind: Kind): string[] => (kind === 'active' ? profile.hero.active : profile.hero.passive)
const slotted = (id: string): boolean => profile.hero.active.includes(id) || profile.hero.passive.includes(id)
const attrs = computed(() => totalAttrs())
const usable = (id: string): boolean => {
  const s = SKILL_BY_ID[id]
  return !!s && meetsSkill(s, profile.level, attrs.value)
}
const learnedOf = (c: ClassId): number => skillsOf(c).filter(s => knows(s.id)).length

// ── What is open and what is in hand ─────────────────────────────────────────
/** The class the codex opens on: the one the hero knows most of. */
const firstClass = (): ClassId => [...CLASS_IDS].sort((a, b) => learnedOf(b) - learnedOf(a))[0] ?? 'aegis'
const cls = ref<ClassId>(firstClass())
const picked = ref('')
/** A learned skill is in hand: the next slot tapped takes it. */
const armed = ref(false)
/** An empty slot was tapped first: the next skill tapped goes there. */
const sel = reactive<{ kind: Kind | ''; slot: number }>({ kind: '', slot: -1 })
const place = computed(() => (picked.value && SKILL_BY_ID[picked.value] ? trainerPlace(SKILL_BY_ID[picked.value]!.cls) : null))

const slotClass = (kind: Kind, i: number, id: string): Record<string, boolean> => {
  const zone = `${kind}:${i}`
  const held = drag.state.active ? drag.state.payload?.id ?? '' : armed.value ? picked.value : ''
  return {
    'is-empty': !id,
    'is-sel': (sel.kind === kind && sel.slot === i) || (!!id && id === picked.value),
    'is-target': !!held && held !== id && kindOf(held) === kind && usable(held),
    'is-over': drag.state.over === zone && drag.state.overOk,
    'is-refuse': drag.state.over === zone && !drag.state.overOk
  }
}

const pickClass = (c: ClassId): void => {
  cls.value = c
  sfx('uiClick')
}

/** Put a skill in a slot, with the thunk it deserves. */
const putIn = (id: string, kind: Kind, slot: number): boolean => {
  if (!setSlot(kind, slot, id)) { sfx('denied'); return false }
  sfx('uiEquip')
  armed.value = false
  sel.kind = ''
  sel.slot = -1
  picked.value = id
  void nextTick(() => {
    const el = document.querySelector<HTMLElement>(`.slot[data-drop="${kind}:${slot}"]`)
    thunk(el?.querySelector('.f-socket'))
    burst(el, colorOf(id))
  })
  return true
}

const tapNode = (id: string): void => {
  const s = SKILL_BY_ID[id]
  if (!s) return
  const ready = knows(id) && usable(id)
  // An empty slot is waiting for exactly this kind of skill.
  if (ready && sel.kind === s.kind && sel.slot >= 0 && !slotsOf(s.kind)[sel.slot]) { putIn(id, s.kind, sel.slot); return }
  picked.value = id
  armed.value = ready
  sfx('uiClick')
}

const tapSlot = (kind: Kind, i: number): void => {
  const id = slotsOf(kind)[i] ?? ''
  if (armed.value && picked.value && picked.value !== id && kindOf(picked.value) === kind) { putIn(picked.value, kind, i); return }
  armed.value = false
  sel.kind = kind
  sel.slot = i
  sfx('uiClick')
  if (!id) return
  picked.value = id
  cls.value = SKILL_BY_ID[id]?.cls ?? cls.value
}

/** "Slot it": the chosen slot when it is of the right kind, else the first
 *  free one, else the first. */
const equip = (): void => {
  const s = SKILL_BY_ID[picked.value]
  if (!s) return
  const slots = slotsOf(s.kind)
  let slot = sel.kind === s.kind ? sel.slot : -1
  if (slot < 0 || slots[slot] === s.id) slot = slots.indexOf('')
  if (slot < 0) slot = 0
  putIn(s.id, s.kind, slot)
}

const remove = (): void => {
  const s = SKILL_BY_ID[picked.value]
  if (!s) return
  const at = slotsOf(s.kind).indexOf(s.id)
  if (at >= 0 && setSlot(s.kind, at, '')) sfx('uiClose')
}

// ── Drag and drop ────────────────────────────────────────────────────────────
interface Held { id: string; from: string }
const zoneOf = (zone: string): { kind: Kind; slot: number } | null => {
  const [kind, n] = zone.split(':')
  return (kind === 'active' || kind === 'passive') && n !== undefined ? { kind, slot: Number(n) } : null
}
const drag = useDrag<Held>({
  accepts: (p, zone) => {
    if (zone === 'tree') return p.from !== 'tree'
    const z = zoneOf(zone)
    return !!z && zone !== p.from && kindOf(p.id) === z.kind && knows(p.id) && usable(p.id)
  },
  onDrop: (p, zone) => {
    if (zone === 'tree') {
      const z = zoneOf(p.from)
      if (!z || !setSlot(z.kind, z.slot, '')) return false
      sfx('uiClose')
      return true
    }
    const z = zoneOf(zone)
    return !!z && putIn(p.id, z.kind, z.slot)
  },
  onStart: (p) => {
    picked.value = p.id
    armed.value = false
    cls.value = SKILL_BY_ID[p.id]?.cls ?? cls.value
  }
})
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'

.skills
  --sock: clamp(2.9rem, 13vmin, 4.6rem)
  --gap: clamp(0.35rem, 1.6vmin, 0.8rem)
  flex: 1 1 auto
  min-height: 0
  display: grid
  gap: var(--gap)
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) minmax(0, 1fr)
  grid-template-rows: minmax(0, 1fr)
  width: 100%
  max-width: 82rem
  margin-inline: auto
// Side by side, the codex and the card are columns of the page's own grid.
.skills__rest
  display: contents

// ── The loadout, set straight on the board ───────────────────────────────────
.skills__board
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.3rem, 1.4vmin, 0.7rem)
  min-width: 0
  min-height: 0
  container-type: inline-size
  +screen.scroller
.skills__cap
  +screen.caption
.loadout
  display: grid
  justify-content: center
  gap: clamp(0.3rem, 1.4vmin, 0.6rem)
  // Room for the gem on a socket's crown.
  padding-top: 0.3rem
.loadout--active
  grid-template-columns: repeat(3, var(--sock))
.loadout--passive
  grid-template-columns: repeat(3, calc(var(--sock) * 0.92))
// Wide enough for the battle bar's own row of six.
@container (min-width: 19.5rem)
  .loadout--active
    grid-template-columns: repeat(6, minmax(0, var(--sock)))
.slot
  +screen.bare-button
  width: 100%
  border-radius: var(--bc-r-md)
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), opacity 140ms ease-out
  &:active
    transition-duration: var(--bc-t-press)
    transform: scale(0.94)
.slot__face
  display: block
// The slot's place on the battle bar.
.slot__n
  +screen.tag('stone')
  position: absolute
  right: -6%
  bottom: -8%
  min-width: 1.5em
  justify-content: center
  padding-inline: 0.3em
  pointer-events: none
.slot.is-sel :deep(.f-socket)
  filter: drop-shadow(0 0 0.5rem var(--bc-gold-hi))
.slot.is-target :deep(.f-socket)
  animation: slot-call 0.9s ease-in-out infinite alternate
.slot.is-over :deep(.f-socket)
  animation: none
  transform: scale(1.14)
  filter: drop-shadow(0 0 0.7rem var(--bc-green-hi))
.slot.is-refuse :deep(.f-socket)
  filter: drop-shadow(0 0 0.5rem var(--bc-red)) grayscale(0.4)
.is-dragging .slot:not(.is-target)
  opacity: 0.5
.skills__how
  margin: 0
  max-width: 24rem
  +cel.label
  font-size: clamp(0.66rem, 2.7vmin, 0.84rem)
  line-height: 1.25
  text-align: center
  text-shadow: var(--bc-text-outline-thin)
  text-wrap: balance
.is-armed .skills__how
  color: var(--bc-text-gold)

// ── The codex ────────────────────────────────────────────────────────────────
.codex
  display: flex
  flex-direction: column
  gap: clamp(0.4rem, 1.8vmin, 0.8rem)
  min-width: 0
  min-height: 0
  padding: clamp(0.5rem, 2.2vmin, 0.9rem)
  +screen.page
  container-type: inline-size
  +screen.scroller
.codex__classes
  display: grid
  grid-template-columns: repeat(4, minmax(0, 1fr))
  gap: clamp(0.25rem, 1.2vmin, 0.5rem)
  flex: 0 0 auto
@container (min-width: 26rem)
  .codex__classes
    grid-template-columns: repeat(8, minmax(0, 1fr))
// A class: its emblem on a disc of its colour, and six pips for its skills.
.emblem
  +screen.bare-button
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.2rem
  min-height: 2.75rem
  padding: 0.15rem 0 0.25rem
  border-radius: var(--bc-r-md)
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
  &:active
    transition-duration: var(--bc-t-press)
    transform: scale(0.93)
.emblem__disc
  display: block
  width: min(100%, 3.1rem)
  aspect-ratio: 1
  padding: 14%
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: 50%
  background: linear-gradient(180deg, color-mix(in srgb, var(--tint) 60%, var(--bc-white)) 0, color-mix(in srgb, var(--tint) 60%, var(--bc-white)) 46%, var(--tint) 46%, var(--tint) 100%)
  box-shadow: var(--bc-drop)
.emblem.is-bare .emblem__disc
  filter: saturate(0.45)
.emblem.is-active .emblem__disc
  +screen.chosen
.emblem__pips
  display: flex
  gap: 2px
.emblem__pip
  width: 0.3rem
  height: 0.3rem
  border-radius: 50%
  background: rgba(var(--bc-paper-ink-rgb), 0.26)
  &.on
    background: var(--bc-green-lo)

.codex__head
  display: flex
  flex-direction: column
  gap: 0.15rem
  text-align: start
.codex__name
  align-self: flex-start
  margin: 0
  padding: 0.1em 0.6em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: linear-gradient(180deg, color-mix(in srgb, var(--tint) 72%, var(--bc-white)) 0, color-mix(in srgb, var(--tint) 72%, var(--bc-white)) 46%, var(--tint) 46%, var(--tint) 100%)
  +cel.label
  font-size: clamp(0.9rem, 3.7vmin, 1.15rem)
  font-weight: inherit
  line-height: 1.15
.codex__desc
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.7rem, 2.9vmin, 0.88rem)
  line-height: 1.25

// The path: six stones on a thread.
.codex__path
  position: relative
  display: grid
  grid-template-columns: repeat(3, minmax(0, 1fr))
  gap: clamp(0.5rem, 2.2vmin, 0.9rem) clamp(0.25rem, 1.2vmin, 0.6rem)
  padding: 0.3rem 0
@container (min-width: 19.5rem)
  .codex__path
    grid-template-columns: repeat(6, minmax(0, 1fr))
.node
  +screen.bare-button
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.2rem
  min-width: 0
  border-radius: var(--bc-r-md)
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
  &:active
    transition-duration: var(--bc-t-press)
    transform: scale(0.93)
  // The thread to the next stone.
  &::before
    content: ''
    position: absolute
    left: 50%
    top: min(1.6rem, 22cqw)
    width: calc(100% + 0.6rem)
    height: 0
    border-top: 3px dashed var(--bc-paper-deep)
  // The last stone of a row has nothing to its right.
  &:nth-child(3n)::before
    display: none
@container (min-width: 19.5rem)
  .node:nth-child(3n)::before
    display: block
  .node:last-child::before
    display: none
.node.is-known::before
  border-top: 4px solid var(--tint)
.node__icon
  position: relative
  display: block
  width: min(100%, 3.4rem)
  border-radius: 24%
.is-round .node__icon
  border-radius: 50%
.node.is-sel .node__icon
  +screen.chosen
// A skill within reach but not yet learned keeps its colour, a locked one loses it.
.node.is-open .node__icon :deep(.art-icon)
  filter: grayscale(0.25) brightness(0.9)
.node__mark, .node__used
  position: absolute
  right: 4%
  top: -6%
  z-index: 1
  width: 1.3rem
  height: 1.3rem
  padding: 0.2rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  color: var(--bc-text)
  pointer-events: none
  :deep(svg)
    display: block
    width: 100%
    height: 100%
.node__used
  background: var(--bc-green-lo)
.is-open .node__mark
  background: var(--bc-blue)
.is-locked .node__mark
  background: var(--bc-off-lo)
.node__lvl
  color: var(--bc-on-soft)
  font-size: clamp(0.6rem, 2.4vmin, 0.76rem)
  line-height: 1
  white-space: nowrap
  &.bad
    color: var(--bc-on-bad)

// ── The card ─────────────────────────────────────────────────────────────────
.skills__card
  display: flex
  flex-direction: column
  gap: var(--gap)
  min-width: 0
  min-height: 0
  align-self: start
  max-height: 100%
  padding-bottom: 0.4rem
  +screen.scroller
.skills__hint
  margin: 0
  padding: clamp(0.6rem, 2.6vmin, 1rem)
  +screen.page(var(--bc-r-md))
  color: var(--bc-paper-ink-soft)
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
  line-height: 1.35
  text-align: start
.skills__note
  margin: 0
  padding: 0.35rem 0.6rem
  +screen.plate('slate', var(--bc-r-md))
  color: var(--bc-text-gold)
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  line-height: 1.3
  text-align: start
  &.is-bad
    color: var(--bc-text-bad)
.loadout__actions
  display: flex
  justify-content: flex-end
  flex-wrap: wrap
  gap: 0.5rem
  padding-bottom: var(--bc-press)

.drag-ghost
  position: fixed
  left: 0
  top: 0
  z-index: var(--bc-z-veil)
  width: clamp(3.2rem, 15vmin, 4.6rem)
  margin: calc(clamp(3.2rem, 15vmin, 4.6rem) * -0.62) 0 0 calc(clamp(3.2rem, 15vmin, 4.6rem) * -0.5)
  pointer-events: none
  filter: drop-shadow(0 0.5rem 0 rgba(var(--bc-ink-rgb), 0.35))
  rotate: -6deg
  will-change: transform

// ── Portrait: the loadout above; the codex and the card scroll under it ──────
@media (max-aspect-ratio: 1/1)
  .skills
    grid-template-columns: minmax(0, 1fr)
    grid-template-rows: auto minmax(0, 1fr)
    max-width: 44rem
  .skills__board
    overflow: visible
  .skills__rest
    display: flex
    flex-direction: column
    gap: var(--gap)
    +screen.scroller
    touch-action: pan-y
  .codex
    flex: 0 0 auto
    overflow: visible
  .skills__card
    flex: 0 0 auto
    max-height: none
    overflow: visible

@media (min-aspect-ratio: 1/1) and (max-height: 30rem)
  .skills
    --sock: 2.75rem
  .skills__how
    display: none

@keyframes slot-call
  from
    transform: scale(1)
    filter: drop-shadow(0 0 0 var(--bc-gold-hi))
  to
    transform: scale(1.08)
    filter: drop-shadow(0 0 0.55rem var(--bc-gold-hi))
@media (prefers-reduced-motion: reduce)
  .slot.is-target :deep(.f-socket)
    animation: none
    filter: drop-shadow(0 0 0.45rem var(--bc-gold-hi))
</style>
