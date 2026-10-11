<script setup lang="ts">
import { CLASS_IDS, CLASSES, className, classDesc, classIcon, skillsByClass, classOpensAt, teachersOf, factionName, ATTR_SHORT, ATTR_COLOR, type Attr } from '../data'
import SkillIcon from '../components/SkillIcon.vue'

const mainAttrs = (c: (typeof CLASS_IDS)[number]): Attr[] => {
  const n: Partial<Record<Attr, number>> = {}
  for (const s of skillsByClass(c)) for (const [a, v] of Object.entries(s.req)) n[a as Attr] = Math.max(n[a as Attr] ?? 0, v as number)
  return (Object.entries(n) as [Attr, number][]).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([a]) => a)
}
const GROUPS = [
  { title: 'The eight of the realm', text: 'Taught in the first towns — and by a master in Silverbridge.', ids: CLASS_IDS.slice(0, 8) },
  { title: 'The secret four', text: 'Hidden masters: pass their test, or free their disciple from a cage.', ids: CLASS_IDS.slice(8, 12) },
  { title: 'The masters of Silverbridge', text: 'Taught openly in the big river town from your first visit.', ids: CLASS_IDS.slice(12) }
]
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">The Sixteen Classes</h1>
    <p class="muted">There is no class lock in Battlecross: every trainer teaches anyone who meets the bars. A “class” is a set of twelve skills — eight actives and four passives fit on your bar, from any mix of classes.</p>
    <template v-for="g in GROUPS" :key="g.title">
      <div class="section-title"><h2>{{ g.title }}</h2><span class="dim small">{{ g.text }}</span></div>
      <div class="grid g4">
        <a v-for="c in g.ids" :key="c" :href="'#/classes/' + c" class="panel hover-lift cc" :style="{ '--c': CLASSES[c].color }">
          <img class="ico" :src="classIcon(c)" alt="" />
          <h3 class="display" :style="{ color: CLASSES[c].color }">{{ className(c) }}</h3>
          <p class="small muted">{{ classDesc(c) }}</p>
          <div class="row small">
            <span v-for="a in mainAttrs(c)" :key="a" class="chip" :style="{ color: ATTR_COLOR[a] }">{{ ATTR_SHORT[a] }}</span>
            <span class="chip" v-if="CLASSES[c].faction !== 'none'">{{ factionName(CLASSES[c].faction) }}</span>
            <span class="chip">From ~lv {{ classOpensAt(c) }}</span>
          </div>
          <div class="sk"><SkillIcon v-for="s in skillsByClass(c)" :key="s.id" :id="s.id" :size="30" /></div>
          <div class="dim small">{{ teachersOf(c).length }} teacher{{ teachersOf(c).length > 1 ? 's' : '' }}</div>
        </a>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cc { color: var(--ink); display: block; position: relative; overflow: hidden; }
.cc:hover { color: var(--ink); }
.cc::before { content: ''; position: absolute; right: -60px; top: -60px; width: 200px; height: 200px; background: radial-gradient(circle, color-mix(in srgb, var(--c) 30%, transparent), transparent 70%); }
.ico { width: 64px; height: 64px; object-fit: contain; position: relative; filter: drop-shadow(0 4px 10px rgba(0,0,0,.6)); }
.cc h3 { margin: 8px 0 4px; font-size: 22px; }
.sk { display: grid; grid-template-columns: repeat(6, minmax(0, 30px)); gap: 6px; margin: 10px 0 6px; position: relative; }
</style>
