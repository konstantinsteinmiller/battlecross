<template lang="pug">
  //- DEV ONLY (the route is not registered in a build): every placeholder
  //- drawing on one page, for art iteration and for checking a drop-in file.
  div.lab
    h1 Art bench
    p.lab__note Vector placeholders and any file dropped into public/images. Dev only; nothing here is translated.
    div.lab__bar
      button(type="button" :class="{ 'is-on': !ab }" @click="ab = false") Gallery
      button(type="button" :class="{ 'is-on': ab }" @click="ab = true") Painted vs drawn
      label.lab__tog(v-if="ab")
        input(type="checkbox" v-model="paintedOnly")
        |  painted only ({{ paintedCount }} of {{ abTotal }})
    template(v-if="!ab")
      section(v-for="g in groups" :key="g.title")
        h2 {{ g.title }} ({{ g.cells.length }})
        div.lab__grid
          div.lab__cell(v-for="c in g.cells" :key="c.id")
            span.lab__icon
              ItemIcon(v-if="g.kind === 'item'" :id="c.id")
              SkillIcon(v-else-if="g.kind === 'skill'" :id="c.id")
              Portrait(v-else-if="g.kind === 'portrait'" :look="c.id")
              ArtIcon(v-else :glyph="c.id" :tint="c.tint" frame="round")
            span.lab__name {{ c.id.replace(/^status\./, '') }}
    //- The art pipeline's playground: every drawable a painter can replace,
    //- as the game draws it with the file (left of each pair) and without it
    //- (right), at the sizes the HUD uses. A painted part is only ever wrong
    //- RELATIVE to the drawing it stands in for.
    template(v-else)
      p.lab__note Left of each pair: what the game shows (the painted file when one exists). Right: the drawing it replaces. At 40, 56 and 72 px, the sizes the HUD draws them at.
      section(v-for="g in abGroups" :key="g.title")
        h2 {{ g.title }} ({{ g.cells.length }})
        p.lab__note(v-if="!g.cells.length") Nothing painted here yet: slice a sheet (pnpm art:slice), or untick "painted only".
        div.lab__ab
          div.lab__row(v-for="c in g.cells" :key="c.id" :class="{ 'is-painted': c.painted }")
            span.lab__pair(v-for="px in SIZES" :key="px")
              span.lab__box(:style="{ width: `${px}px` }")
                Sample(:kind="g.kind" :id="c.id")
              span.lab__box(:style="{ width: `${px}px` }")
                Sample(:kind="g.kind" :id="c.id" drawn)
            span.lab__name {{ c.id }}
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, type PropType } from 'vue'
import { ITEMS } from '@/game/data/items'
import { SKILLS } from '@/game/data/skills'
import { LOOKS } from '@/game/gfx/rigs/looks'
import { ART_CATALOGUE } from '@/game/art/artSheet'
import { ITEM_ART, PORTRAIT_ART, SKILL_ART, UI_ART } from '@/game/assets/overrides'
import { GLYPHS } from '@/components/art/glyphs'
import { statusTint } from '@/components/art/tints'
import ArtIcon from '@/components/art/ArtIcon.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'
import SkillIcon from '@/components/art/SkillIcon.vue'
import Portrait from '@/components/art/Portrait.vue'
import IconCoin from '@/components/icons/IconCoin.vue'

interface Cell { id: string; tint?: string }
const groups: Array<{ title: string; kind: 'item' | 'skill' | 'portrait' | 'glyph'; cells: Cell[] }> = [
  { title: 'Items', kind: 'item', cells: ITEMS.map(i => ({ id: i.id })) },
  { title: 'Skills', kind: 'skill', cells: SKILLS.map(s => ({ id: s.id })) },
  { title: 'Statuses', kind: 'glyph', cells: Object.keys(GLYPHS).filter(k => k.startsWith('status.')).map(id => ({ id, tint: statusTint(id.slice(7)) })) },
  { title: 'Portraits', kind: 'portrait', cells: ['hero', 'oracle', 'dragon', ...Object.keys(LOOKS)].map(id => ({ id })) }
]

// ─── Painted vs drawn ────────────────────────────────────────────────────────

type AbKind = 'item' | 'skill' | 'portrait' | 'coin'
/** The override map each kind's component reads (`game/assets/overrides.ts`). */
const ART: Record<AbKind, Map<string, string>> = { item: ITEM_ART, skill: SKILL_ART, portrait: PORTRAIT_ART, coin: UI_ART }
/** The sizes the HUD draws an icon at, px. */
const SIZES = [40, 56, 72]

/**
 * One drawable through the GAME'S OWN component (a look-alike would agree with
 * itself and prove nothing). `drawn` shows it as if no file had been dropped
 * in: the components read their override once, while they are set up, so the
 * entry is taken out of the map for exactly that long and put back when this
 * sample has mounted. Mounting is synchronous and depth-first, so nothing else
 * renders in between.
 */
const Sample = defineComponent({
  props: {
    kind: { type: String as PropType<AbKind>, required: true },
    id: { type: String, required: true },
    drawn: { type: Boolean, default: false }
  },
  setup(p) {
    const art = ART[p.kind]
    const url = p.drawn ? art.get(p.id) : undefined
    if (url !== undefined) {
      art.delete(p.id)
      onMounted(() => art.set(p.id, url))
    }
    return () => (p.kind === 'item' ? h(ItemIcon, { id: p.id })
      : p.kind === 'skill' ? h(SkillIcon, { id: p.id })
        : p.kind === 'portrait' ? h(Portrait, { look: p.id })
          : h(IconCoin))
  }
})

const ab = ref(false)
const paintedOnly = ref(false)
// Exactly what the pipeline paints (the art manifest), so a sheet that was
// sliced shows up here without anybody adding it.
const abAll: Array<{ title: string; kind: AbKind; cells: Array<{ id: string; painted: boolean }> }> = [
  { title: 'Items', kind: 'item' as const, ids: ART_CATALOGUE.items },
  { title: 'Skills', kind: 'skill' as const, ids: ART_CATALOGUE.skills },
  { title: 'Portraits', kind: 'portrait' as const, ids: ART_CATALOGUE.portraits },
  { title: 'UI', kind: 'coin' as const, ids: ['coin'] }
].map(g => ({ title: g.title, kind: g.kind, cells: g.ids.map(id => ({ id, painted: ART[g.kind].has(id) })) }))
const abTotal = abAll.reduce((n, g) => n + g.cells.length, 0)
const paintedCount = abAll.reduce((n, g) => n + g.cells.filter(c => c.painted).length, 0)
const abGroups = computed(() => abAll.map(g => ({ ...g, cells: paintedOnly.value ? g.cells.filter(c => c.painted) : g.cells })))
</script>

<style scoped lang="sass">
.lab
  position: fixed
  inset: 0
  overflow: auto
  padding: 1rem
  background: #1b2244
  color: #fff
  font-family: var(--font-ui)
  h1, h2
    margin: 0.6rem 0 0.4rem
.lab__note
  margin: 0 0 0.6rem
  color: #b9c4ee
.lab__bar
  display: flex
  align-items: center
  gap: 0.5rem
  margin: 0 0 0.6rem
  button
    padding: 0.35rem 0.8rem
    border-radius: 0.5rem
    border: 2px solid #0f1a30
    background: #3d4c8c
    color: #fff
    font: inherit
    cursor: pointer
    &.is-on
      background: #3fd060
.lab__tog
  color: #dfe6ff
  cursor: pointer
.lab__grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(5.2rem, 1fr))
  gap: 0.6rem
.lab__cell
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.25rem
.lab__icon
  width: 3.6rem
.lab__name
  font-size: 0.62rem
  color: #dfe6ff
  text-align: center
  word-break: break-word
.lab__ab
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(27rem, 1fr))
  gap: 0.5rem 1rem
.lab__row
  display: flex
  align-items: center
  gap: 0.9rem
  padding: 0.3rem 0.5rem
  border-radius: 0.5rem
  // A row with no file yet shows the same drawing twice: said, not hidden.
  opacity: 0.55
  &.is-painted
    opacity: 1
    background: rgba(255, 255, 255, 0.07)
  .lab__name
    text-align: left
.lab__pair
  display: flex
  align-items: center
  gap: 0.3rem
.lab__box
  flex: 0 0 auto
  // The coin has no box of its own: it is sized by whoever draws it.
  > :deep(img), > :deep(svg)
    display: block
    width: 100%
</style>
