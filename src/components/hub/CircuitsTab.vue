<template lang="pug">
  div.circuits.sheet
    div.head
      div.boards
        button.board-btn(
          v-for="b in BOARDS"
          :key="b"
          type="button"
          :class="[b, { on: board === b }]"
          @click="board = b; selected = firstOf(b)"
        ) {{ t(`board.${b}`) }}
      div.chips(:class="{ has: chipsAvailable() > 0 }")
        span.chip-ico
        span {{ t('circuits.chips', { n: chipsAvailable() }) }}
    div.body
      div.grid-wrap
        svg.traces(viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true")
          line(
            v-for="n in nodes.filter(x => x.req)"
            :key="n.id"
            :x1="cx(SKILL_BY_ID[n.req.id].pos[0])"
            :y1="cy(SKILL_BY_ID[n.req.id].pos[1])"
            :x2="cx(n.pos[0])"
            :y2="cy(n.pos[1])"
            :class="{ live: rank(n.req.id) >= n.req.rank }"
          )
        button.node(
          v-for="n in nodes"
          :key="n.id"
          type="button"
          :class="{ sel: selected === n.id, locked: !nodeUnlocked(n, profile.hero.skills), maxed: rank(n.id) >= n.ranks, owned: rank(n.id) > 0 }"
          :style="{ left: (cx(n.pos[0]) / 3) + '%', top: (cy(n.pos[1]) / 3) + '%' }"
          @click="selected = n.id"
        )
          span.n-ico
            GameIcon(:name="n.icon")
          span.pips
            span.pip(v-for="k in n.ranks" :key="k" :class="{ on: k <= rank(n.id) }")
      div.detail(v-if="sel")
        div.d-name {{ t(`skill.${sel.id}.name`) }}
        div.d-rank {{ t('circuits.rank', { n: rank(sel.id), max: sel.ranks }) }}
        div.d-desc {{ t(`skill.${sel.id}.desc`) }}
        div.d-req(v-if="sel.req && !nodeUnlocked(sel, profile.hero.skills)")
          | {{ t('circuits.requires', { name: t(`skill.${sel.req.id}.name`), n: sel.req.rank }) }}
        button.install(
          type="button"
          :disabled="!canRankUp(sel, profile.hero.skills, chipsAvailable())"
          @click="install"
        )
          span {{ rank(sel.id) >= sel.ranks ? t('circuits.maxed') : t('circuits.install') }}
        //- The price wears the nut, like every price in the Workshop.
        button.respec(v-if="spent > 0" type="button" :disabled="profile.bolts < respecCost(profile.hero.skills)" @click="respec")
          span {{ t('circuits.respec') }}
          span.cost
            GameIcon.ci(name="nut")
            | {{ respecCost(profile.hero.skills) }}
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import { SKILLS, SKILL_BY_ID, BOARDS, nodeUnlocked, canRankUp, respecCost, type Board } from '@/game/data/skills'
import { profile, chipsAvailable, rankUpSkill, respecSkills } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'

/**
 * The three circuit boards. Nodes sit on a 3×3 layout with traces from each
 * node's requirement; a trace lights up once the requirement is powered. One
 * Skill Chip per level; tap a node, then Install.
 */
const { t } = useI18n()
const board = ref<Board>('buster')
const firstOf = (b: Board) => SKILLS.find(s => s.board === b)!.id
const selected = ref(firstOf('buster'))
const nodes = computed(() => SKILLS.filter(s => s.board === board.value))
const sel = computed(() => SKILL_BY_ID[selected.value] ?? null)
const rank = (id: string) => profile.hero.skills[id] ?? 0
const spent = computed(() => Object.values(profile.hero.skills).reduce((a, b) => a + b, 0))
const cx = (c: number) => 50 + c * 100
const cy = (r: number) => 50 + r * 100
const install = () => {
  if (sel.value && rankUpSkill(sel.value.id)) sfx('levelUp')
  else sfx('denied')
}
const respec = () => {
  if (respecSkills(respecCost(profile.hero.skills))) sfx('uiOpen')
}
</script>

<style scoped lang="sass">
@use './sheet'
.head
  display: flex
  align-items: center
  justify-content: space-between
  gap: 8px
  flex-wrap: wrap
.boards
  display: flex
  gap: 6px
.board-btn
  padding: 6px 12px
  border-radius: 12px
  border: 2px solid #141a33
  color: #fff
  font-family: var(--font-ui)
  font-size: clamp(12px, 2.6vmin, 15px)
  opacity: 0.7
  &.buster
    background: linear-gradient(#ffb04a, #c25a00)
  &.armor
    background: linear-gradient(#7fe0a8, #1f7a5a)
  &.core
    background: linear-gradient(#b98cff, #5c2ca0)
  &.on
    opacity: 1
    outline: 3px solid #fff
.chips
  display: flex
  align-items: center
  gap: 6px
  padding: 4px 10px
  border-radius: 999px
  background: rgba(0, 0, 0, 0.3)
  font-size: clamp(12px, 2.6vmin, 15px)
  &.has
    color: #7ff4ff
    animation: chip-glow 1.2s ease-in-out infinite
.chip-ico
  width: 14px
  height: 14px
  border-radius: 3px
  background: linear-gradient(135deg, #7ff4ff, #1f7fd0)
  border: 2px solid #141a33
.body
  flex: 1
  min-height: 0
  display: flex
  gap: 12px
  margin-top: 10px
  overflow-y: auto
.grid-wrap
  position: relative
  flex: 0 0 auto
  width: min(46vmin, 300px)
  aspect-ratio: 1
  border-radius: 14px
  background: radial-gradient(circle, rgba(47, 69, 128, 0.5), rgba(11, 20, 51, 0.6)), repeating-linear-gradient(0deg, rgba(127, 244, 255, 0.05) 0 2px, transparent 2px 20px)
.traces
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  line
    stroke: rgba(127, 244, 255, 0.18)
    stroke-width: 6
    stroke-linecap: round
    &.live
      stroke: #7ff4ff
      filter: drop-shadow(0 0 4px #7ff4ff)
.node
  position: absolute
  transform: translate(-50%, -50%)
  width: 26%
  aspect-ratio: 1
  border-radius: 50%
  border: 3px solid #141a33
  background: radial-gradient(circle at 40% 30%, #6f8cc0, #2f4580)
  color: #cfe0ff
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  &.owned
    background: radial-gradient(circle at 40% 30%, #e6fbff, #3cc8ff 55%, #1f7fd0)
    color: #fff
  &.maxed
    background: radial-gradient(circle at 40% 30%, #fff8c0, #ffd23a 55%, #e08a00)
    color: #141a33
  &.locked
    filter: grayscale(0.9) brightness(0.55)
  &.sel
    outline: 3px solid #ffd84a
    outline-offset: 2px
.n-ico
  width: 46%
  height: 46%
.pips
  display: flex
  gap: 2px
  margin-top: 2px
.pip
  width: 5px
  height: 5px
  border-radius: 50%
  background: rgba(0, 0, 0, 0.45)
  &.on
    background: #fff
    box-shadow: 0 0 4px #fff
.detail
  flex: 1
  min-width: 140px
  display: flex
  flex-direction: column
  gap: 6px
.d-name
  font-size: clamp(15px, 3.2vmin, 19px)
.d-rank
  font-family: var(--font-pixel)
  font-size: clamp(8px, 1.8vmin, 10px)
  color: #9fe6ff
.d-desc
  font-size: clamp(12px, 2.6vmin, 15px)
  color: #dfe7ff
  line-height: 1.3
.d-req
  font-size: clamp(11px, 2.4vmin, 13px)
  color: #ff9a8a
.install, .respec
  padding: 8px 12px
  border-radius: 12px
  border: 3px solid #141a33
  font-family: var(--font-ui)
  font-size: clamp(13px, 2.8vmin, 16px)
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  &:disabled
    filter: grayscale(0.8) brightness(0.7)
.install
  background: linear-gradient(#7ff4ff, #1f7fd0)
  color: #fff
.respec
  margin-top: auto
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  background: linear-gradient(#5d6a82, #3b4458)
  color: #fff
  font-size: clamp(11px, 2.4vmin, 13px)
.cost
  display: inline-flex
  align-items: center
  gap: 3px
  color: #ffd84a
  // Nested, so it outranks GameIcon's own 100% sizing on specificity.
  .ci
    width: 1.15em
    height: 1.15em
@media (orientation: portrait)
  .body
    flex-direction: column
    align-items: center
  .detail
    width: 100%
@keyframes chip-glow
  50%
    box-shadow: 0 0 12px rgba(127, 244, 255, 0.6)
</style>
