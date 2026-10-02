<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  leaderboardEnabled, leaderboardFailed, playerTotal, rankFor, rankTotalFor
} from '@/use/useLeaderboard'
import { formatCount } from '@/utils/localeNumber'
import GameIcon from '@/components/icons/GameIcon.vue'

/**
 * ─── "#1130 of 2345" ────────────────────────────────────────────────────────
 *
 * The whole leaderboard, reduced to one pill on the result screen. It is the
 * only part of this feature most players ever see, and the population is the
 * half that makes the placing mean something: a bare "#1130" says nothing.
 *
 * THREE STATES, and only one of them is a number:
 *
 *   • a rank        → `#1130`, plus `of 2345` once the population has landed
 *                     — both GROUPED for the player's locale, so a big board
 *                     reads as `#41,032 of 154,331` rather than as two strings
 *                     of digits somebody has to count
 *   • still waiting → `…`, holding the cell's width so the row of chips does
 *                     not jump sideways when the rank arrives a beat later
 *   • nothing to say → the badge does not render AT ALL
 *
 * THERE IS NO "#100+" STATE, and adding one back is a regression. A placing
 * this component cannot state as a number is not shown as prose instead — the
 * ladder in `useLeaderboard` guarantees a real number from a histogram, or an
 * estimated one, or nothing. `rankFor` returns no sentinel for a template to
 * decorate, which is the point: the rule is enforced where the number is made,
 * not in every screen that shows one.
 *
 * The empty state is the one to respect. An empty plaque is a question the
 * screen cannot answer, and a permanent "Loading…" on a player with no
 * connection reads as a broken game. Once the fetch has actually failed the
 * badge is gone and stays gone — though it rarely comes to that, because the
 * offline ladder usually has a cached or baked board to rank against, and the
 * player never learns which one answered.
 *
 * `score` is a PROP rather than an import so this component is drop-in: it does
 * not know where the game keeps its lifetime best. Pass the same number
 * `reportRun` is called with.
 */

const props = withDefaults(defineProps<{
  /** The player's LIFETIME BEST — the same number passed to `reportRun`, not
   *  this run's result. Ranking a run total against a board of bests would show
   *  a player their rank falling after a bad run. */
  score: number
  /** Hide the "of N" tail (a cramped HUD corner, say). The placing alone is a
   *  weaker line, so only do this where the width genuinely is not there. */
  compact?: boolean
}>(), { compact: false })

const { t, locale } = useI18n()

/**
 * Both numbers in this pill are grouped for the active locale. Reading
 * `locale.value` inside a render is what keeps it REACTIVE: change the language
 * in an options screen and the separators follow, instead of the pill keeping
 * whichever convention happened to be active when it first painted.
 */
const fmt = (n: number): string => formatCount(n, locale.value)

/** The population, grouped — shared by the visible tail and the aria label. */
// `rankTotalFor`, not `playerTotal`: a build that ranks an unplayed player last
// counts them into the population. See `useLeaderboard`.
const totalLabel = computed(() => fmt(rankTotalFor(props.score)))

/**
 * The rank as PROSE — `#42`, `…`, or empty.
 *
 * The `#` is built here rather than in the template because `#{}` is Pug
 * interpolation: a literal `#` in front of a mustache is a parse error, not a
 * hash sign. (Costs an hour the first time.)
 */
const label = computed<string>(() => {
  if (!leaderboardEnabled) return ''
  const rank = rankFor(props.score)
  if (rank > 0) return `#${fmt(rank)}`
  // `0` is the only non-answer `rankFor` has, and it means "nothing honest to
  // say yet" — not "unknowable". Until the endpoint has actually failed that is
  // a request still in flight, so hold the slot; after it, give the slot back.
  return leaderboardFailed.value ? '' : '…'
})

/** Only once the population has actually landed. Before that there is no "of N"
 *  to print, and a placeholder there would be a second unanswered question. */
const showTotal = computed(() => !props.compact && playerTotal.value > 0)

/** One accessible name for the whole pill. Without it a screen reader reads
 *  "number 1130 of 2345" with no idea what is being counted. */
const ariaLabel = computed(() =>
  showTotal.value
    ? `${t('leaderboard.title')}: ${label.value} ${t('leaderboard.of', { n: totalLabel.value })}`
    : `${t('leaderboard.title')}: ${label.value}`
)
</script>

<template lang="pug">
  //- No cell at all when there is nothing honest to say.
  div.rank-badge(v-if="label" role="img" :aria-label="ariaLabel")
    //- The game's own glyph: it inherits `currentColor`, so the glyph and the
    //- number can never drift apart.
    GameIcon.rank-badge__icon(name="trophy" aria-hidden="true")
    span.rank-badge__rank {{ label }}
    span.rank-badge__of(v-if="showTotal") {{ t('leaderboard.of', { n: totalLabel }) }}
</template>

<style scoped lang="sass">
// The same pill the rest of the game wears — an ink outline round a sunk cell,
// glyph then number — so the placing reads as one of the game's own numbers
// rather than a widget bolted on. Gold, because it is the one number on the
// screen that is not about this run: it is about everyone else.
.rank-badge
  display: inline-flex
  align-items: baseline
  gap: 0.3em
  padding: clamp(0.2rem, 1vmin, 0.34rem) clamp(0.5rem, 2.2vmin, 0.8rem)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--bc-gold-hi) 0, var(--bc-gold-hi) 46%, var(--bc-gold) 46%, var(--bc-gold) 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-ink)

.rank-badge__icon
  // `align-self` rather than `align-items: center` on the row: the numbers set
  // the baseline, and a glyph hung off it sits where a capital letter would.
  align-self: center
  flex: 0 0 auto
  width: clamp(0.85rem, 4vmin, 1.2rem)
  height: clamp(0.85rem, 4vmin, 1.2rem)

.rank-badge__rank
  color: var(--bc-text)
  font-weight: 900
  font-size: clamp(0.85rem, 4.2vmin, 1.3rem)
  line-height: 1
  // Every number on a candy fill wears the ink outline.
  text-shadow: var(--bc-text-outline)

.rank-badge__of
  color: var(--bc-ink)
  text-transform: uppercase
  font-size: clamp(0.5rem, 2.4vmin, 0.7rem)
</style>
