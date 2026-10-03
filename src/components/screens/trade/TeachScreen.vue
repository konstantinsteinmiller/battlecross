<template lang="pug">
  TradeFrame(
    ref="frame"
    art="skills"
    :look="npc ? npc.look : 'elder'"
    :name="npc ? t(`npc.${npc.id}.name`) : t(`class.${cls}.name`)"
    :line="t(`class.${cls}.desc`)"
    :ring="CLASSES[cls].color"
  )
    div.trade.teach(:class="{ 'has-sel': !!picked }" :style="{ '--tint': CLASSES[cls].color }")
      //- ── The class's six skills, as the path they are learned along ───────
      section.trade__side.trade__left.teach__path
        h3.trade__cap {{ t(`class.${cls}.name`) }}
        div.trade__scroll
          p.trainer__friend(v-if="friend") {{ t('trainer.friend', { faction: t(`faction.${CLASSES[cls].faction}`) }) }}
          ol.lessons
            li.lessons__step(v-for="s in skills" :key="s.id" :class="{ 'is-known': knows(s.id) }")
              button.lesson(
                type="button"
                :class="{ 'is-sel': picked === s.id, 'is-known': knows(s.id), 'is-open': learnBlock(s.id) === '', 'is-locked': lockedOut(s.id) }"
                :aria-label="t(`skill.${s.id}.name`)"
                :aria-pressed="picked === s.id"
                :data-skill="s.id"
                @click="pick(s.id)"
              )
                span.lesson__icon
                  SkillIcon(:id="s.id" :dim="lockedOut(s.id)")
                span.lesson__text
                  span.lesson__name {{ t(`skill.${s.id}.name`) }}
                  span.lesson__reqs
                    span(:class="{ bad: profile.level < s.level }") {{ t('hud.level', { n: s.level }) }}
                    span(v-for="r in reqsOf(s.id)" :key="r.attr" :class="{ bad: r.have < r.need }") {{ t(`attr.${r.attr}.short`) }} {{ r.need }}
                span.lesson__price(v-if="knows(s.id)")
                  GameIcon(name="check")
                  | {{ t('trainer.known') }}
                PriceTag.lesson__fee(v-else :n="skillCost(s.id)" :base="baseOf(s.id)" :bad="profile.gold < skillCost(s.id)" plain)

      //- ── The lesson on the table ────────────────────────────────────────────
      section.trade__table(:class="{ 'is-open': !!picked }")
        template(v-if="picked")
          button.trade__sheet-close(type="button" :aria-label="t('close')" @click="picked = ''")
            GameIcon(name="close")
          div.trade__paper
            SkillCard(:id="picked" :dim="lockedOut(picked)")
          div.trade__deal(v-if="!knows(picked)")
            span.trade__deal-label {{ t('trainer.fee') }}
            PriceTag.trade__deal-price(:n="skillCost(picked)" :base="baseOf(picked)" :bad="profile.gold < skillCost(picked)")
          p.trade__why(v-if="block && block !== 'known'") {{ t(`trainer.block.${block}`) }}
          div.trainer__actions
            FButton.trade__act(
              :label="block === 'known' ? t('trainer.known') : t('trainer.learn')"
              type="success"
              :size="short ? 'sm' : 'md'"
              :is-disabled="block !== ''"
              @click="learn"
            )
        p.trade__hint(v-else) {{ t('trainer.hint') }}

      DealStamp(:n="stamps" :text="t('trainer.known')" tone="gold")

      //- ── The hero: what he brings to the lesson ─────────────────────────────
      section.trade__side.trade__right.teach__hero
        h3.trade__cap {{ t('menu.character') }}
        div.trade__scroll
          ul.teach__attrs
            li.teach__attr(
              v-for="a in ATTRS"
              :key="a"
              :class="{ 'is-need': needOf(a) > 0, 'is-short': needOf(a) > total[a] }"
              :style="{ '--c': ATTR_COLOR[a] }"
            )
              span.teach__attr-name {{ t(`attr.${a}.short`) }}
              span.teach__attr-val {{ total[a] }}
                small(v-if="needOf(a) > 0") / {{ needOf(a) }}
          h4.teach__cap {{ t('skills.active') }}
          div.teach__slots
            span.teach__slot(v-for="(id, i) in profile.hero.active" :key="`a${i}`" :data-slot="`active:${i}`")
              FSocket(shape="square" :tint="id ? colorOf(id) : undefined" :empty="!id")
                span.teach__face(v-if="id")
                  SkillIcon(:id="id")
          h4.teach__cap {{ t('skills.passive') }}
          div.teach__slots
            span.teach__slot(v-for="(id, i) in profile.hero.passive" :key="`p${i}`" :data-slot="`passive:${i}`")
              FSocket(shape="round" metal="steel" :tint="id ? colorOf(id) : undefined" :empty="!id")
                span.teach__face(v-if="id")
                  SkillIcon(:id="id")
</template>

<script setup lang="ts">
/**
 * ─── A class trainer: the trade table as a lesson (GDD §4.2, §5) ─────────────
 *
 * The trainer's side is the class's six skills as the path they are learned
 * along, each with its bars and its fee; the table holds the lesson in hand;
 * the hero's side shows what he brings — his attributes against the lesson's
 * bars, and his loadout, where a learned skill lands by itself (`learnSkill`
 * puts it in the first free slot of its kind).
 *
 * Any hero may learn from any trainer: the build is whatever the slots hold.
 * Charisma and a friendly faction lower the fee (the full price is struck).
 */
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ATTRS, ATTR_COLOR, type Attr } from '@/game/data/attributes'
import { CLASSES, SKILL_BY_ID, priceOf, skillsOf, type ClassId } from '@/game/data/skills'
import { REP_FRIEND } from '@/game/data/quests'
import { knows, learnBlock, learnSkill, profile, skillCost, totalAttrs } from '@/game/state/profile'
import { flow } from '@/game/flow'
import { sfx } from '@/game/audio/sfx'
import FButton from '@/components/atoms/FButton.vue'
import FSocket from '@/components/atoms/FSocket.vue'
import SkillIcon from '@/components/art/SkillIcon.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import SkillCard from '@/components/game/SkillCard.vue'
import PriceTag from '@/components/game/PriceTag.vue'
import DealStamp from '@/components/game/DealStamp.vue'
import { burst, shake, thunk } from '@/components/game/fx'
import { useMedia } from '@/components/game/useMedia'
import TradeFrame from './TradeFrame.vue'

const { t } = useI18n()
const npc = computed(() => flow.npc)
const cls = computed<ClassId>(() => (flow.trainerCls || 'aegis') as ClassId)
const skills = computed(() => skillsOf(cls.value))
const frame = ref<InstanceType<typeof TradeFrame> | null>(null)
/** A phone on its side: the big action a size down, so the card has room. */
const short = useMedia('(max-height: 30rem)')
const picked = ref('')
const block = computed(() => (picked.value ? learnBlock(picked.value) : ''))
const total = computed(() => totalAttrs())
const friend = computed(() => {
  const f = CLASSES[cls.value].faction
  return f !== 'none' && profile.quests.rep[f] >= REP_FRIEND
})

const colorOf = (id: string): string => SKILL_BY_ID[id]?.color ?? ''
const baseOf = (id: string): number => (SKILL_BY_ID[id] ? priceOf(SKILL_BY_ID[id]!) : 0)
const reqsOf = (id: string): Array<{ attr: Attr; need: number; have: number }> => {
  const s = SKILL_BY_ID[id]
  if (!s) return []
  return (Object.keys(s.req) as Attr[]).map(attr => ({ attr, need: s.req[attr] ?? 0, have: total.value[attr] }))
}
/** Not learned and out of reach for now (level or attributes, not money). */
const lockedOut = (id: string): boolean => !knows(id) && (learnBlock(id) === 'level' || learnBlock(id) === 'attrs')
/** What the lesson in hand asks of this attribute (0: nothing). */
const needOf = (a: Attr): number => (picked.value && !knows(picked.value) ? SKILL_BY_ID[picked.value]?.req[a] ?? 0 : 0)

const pick = (id: string): void => {
  picked.value = id
  sfx('uiClick')
}

const stamps = ref(0)
const learn = (): void => {
  const id = picked.value
  const cost = skillCost(id)
  const before = [...profile.hero.active, ...profile.hero.passive]
  if (!learnSkill(id)) {
    sfx('denied')
    shake(document.querySelector('.trade__act'))
    return
  }
  sfx('uiLearn')
  stamps.value++
  void frame.value?.pay(cost)
  void nextTick(() => {
    // The burst on the lesson, and the skill lands in the slot it took.
    burst(document.querySelector(`.lesson[data-skill="${id}"] .lesson__icon`), CLASSES[cls.value].color, true)
    const after = [...profile.hero.active, ...profile.hero.passive]
    const at = after.findIndex((x, i) => x === id && before[i] !== id)
    if (at >= 0) {
      const key = at < profile.hero.active.length ? `active:${at}` : `passive:${at - profile.hero.active.length}`
      const el = document.querySelector<HTMLElement>(`.teach__slot[data-slot="${key}"]`)
      thunk(el?.querySelector('.f-socket'))
      burst(el, CLASSES[cls.value].color)
    }
  })
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'
@use './trade'

// Side by side, the two sides are as tall as what they hold.
.teach__path, .teach__hero
  align-self: start
  max-height: 100%
// The trainer's side is a page of the class's codex, not a shelf.
.teach__path
  +screen.page
  .trade__cap
    color: var(--bc-text)
    background: var(--tint)
.trainer__friend
  margin: 0 0 0.5rem
  padding: 0.3rem 0.6rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: var(--bc-green-hi)
  color: var(--bc-green-deep)
  font-size: clamp(0.7rem, 2.9vmin, 0.88rem)
  line-height: 1.25
  text-align: start

// The path: the stones joined by a thread down their left side.
.lessons
  position: relative
  margin: 0
  padding: 0
  list-style: none
  display: flex
  flex-direction: column
  gap: clamp(0.3rem, 1.4vmin, 0.5rem)
.lessons__step
  position: relative
  // The thread from this stone to the next.
  &::before
    content: ''
    position: absolute
    left: calc(clamp(2.5rem, 10.5vmin, 3.1rem) / 2 + 0.35rem - 2px)
    top: 50%
    height: calc(100% + clamp(0.3rem, 1.4vmin, 0.5rem))
    border-left: 4px dashed var(--bc-paper-deep)
  &.is-known::before
    border-left-style: solid
    border-color: var(--tint)
  &:last-child::before
    display: none
// A narrow path: the fee goes under the name. A wide one: beside it.
.teach__path .trade__scroll
  container-type: inline-size
.lesson
  +screen.bare-button
  display: grid
  grid-template-columns: auto minmax(0, 1fr)
  align-items: center
  gap: 0.55rem
  width: 100%
  min-height: 3rem
  padding: 0.35rem 0.55rem 0.35rem 0.35rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  background: var(--bc-paper-hi)
  text-align: start
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), background-color 120ms ease-out
  &:active
    transition-duration: var(--bc-t-press)
    transform: scale(0.97)
  &.is-sel
    +screen.chosen
  &.is-open:not(.is-sel)
    box-shadow: inset 0 0 0 3px var(--bc-green-lo)
  &.is-known
    background: color-mix(in srgb, var(--tint) 22%, var(--bc-paper-hi))
  &.is-locked
    background: var(--bc-paper-lo)
.lesson__icon
  position: relative
  z-index: 1
  grid-row: span 2
  width: clamp(2.5rem, 10.5vmin, 3.1rem)
  border-radius: 24%
.lesson__text
  display: flex
  flex-direction: column
  gap: 0.1rem
  min-width: 0
.lesson__name
  font-size: clamp(0.78rem, 3.2vmin, 0.98rem)
  line-height: 1.15
  overflow-wrap: break-word
  hyphens: auto
.lesson__price, .lesson__fee
  justify-self: start
@container (min-width: 21rem)
  .lesson
    grid-template-columns: auto minmax(0, 1fr) auto
  .lesson__icon
    grid-row: auto
  .lesson__price, .lesson__fee
    justify-self: end
.lesson__reqs
  display: flex
  flex-wrap: wrap
  gap: 0 0.45rem
  color: var(--bc-on-soft)
  font-size: clamp(0.6rem, 2.4vmin, 0.76rem)
  .bad
    color: var(--bc-on-bad)
.lesson__price
  display: inline-flex
  align-items: center
  gap: 0.25em
  color: var(--bc-on-good)
  font-size: clamp(0.66rem, 2.7vmin, 0.86rem)
  white-space: nowrap
  :deep(svg)
    width: 1em
    height: 1em
.lesson__fee
  color: var(--bc-on-accent)
  font-size: clamp(0.72rem, 2.9vmin, 0.92rem)
  text-shadow: none

// ── The hero's side ──────────────────────────────────────────────────────────
.teach__attrs
  margin: 0
  padding: 0
  list-style: none
  display: grid
  grid-template-columns: repeat(3, minmax(0, 1fr))
  gap: 0.3rem
.teach__attr
  display: flex
  align-items: baseline
  justify-content: space-between
  gap: 0.3rem
  padding: 0.25rem 0.45rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: rgba(var(--bc-ink-rgb), 0.28)
  font-size: clamp(0.66rem, 2.7vmin, 0.86rem)
  // The lesson asks something of it: it wears the attribute's colour…
  &.is-need
    background: color-mix(in srgb, var(--c) 45%, var(--bc-leather-lo))
  // …and goes red where the hero falls short.
  &.is-short
    background: var(--bc-red-lo)
.teach__attr-name
  color: var(--bc-text-soft)
.teach__attr-val
  +cel.label
  text-shadow: var(--bc-text-outline-thin)
  font-variant-numeric: tabular-nums
  white-space: nowrap
  small
    color: var(--bc-text-soft)
    font-size: 0.8em
.teach__cap
  +screen.caption
  margin-top: 0.7rem
  margin-bottom: 0.35rem
  text-align: start
.teach__slots
  display: grid
  grid-template-columns: repeat(6, minmax(0, 2.75rem))
  gap: 0.3rem
.teach__slot
  display: block
.teach__face
  display: block

// Portrait: the hero's side is a strip above the path, not a third of the screen.
@media (max-aspect-ratio: 1/1)
  .trade.teach
    grid-template-rows: auto minmax(0, 1fr)
    grid-template-areas: "right" "left"
  .teach__path, .teach__hero
    align-self: stretch
  .teach__hero .trade__cap
    display: none
  .teach__hero .trade__scroll
    display: flex
    flex-wrap: wrap
    align-items: center
    justify-content: center
    gap: 0.35rem 0.7rem
    padding: 0.4rem
    overflow: visible
  .teach__hero .teach__cap
    display: none
  .teach__attrs
    flex: 1 1 100%
    grid-template-columns: repeat(6, minmax(0, 1fr))
  .teach__attr
    flex-direction: column
    align-items: center
    gap: 0
    padding: 0.15rem 0.2rem
  .teach__slots
    grid-template-columns: repeat(6, 1.9rem)
    gap: 0.2rem
    &:last-child
      grid-template-columns: repeat(3, 1.9rem)
  // The lesson rises over the lower half of the path: the hero's strip and
  // the first lessons stay in view, and the path still scrolls above it.
  .teach .trade__table
    max-height: 58%
</style>
