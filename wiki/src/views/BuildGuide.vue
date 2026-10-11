<script setup lang="ts">
import { computed } from 'vue'
import { parts } from '../router'
import { BUILD_BY_ID } from '../builds'
import { encodePlan, type Plan } from '../planner'
import { barSynergy, statFocus } from '../synergy'
import { CLASSES, ATTRS, ATTR_NAME, ATTR_COLOR, EQUIP_SLOT_LIST, ITEM_BY_ID, IMG, classIcon, className, itemName, slotName, type ClassId } from '../data'
import SkillIcon from '../components/SkillIcon.vue'
import ItemIcon from '../components/ItemIcon.vue'
import StatSheet from '../components/StatSheet.vue'
import SkillPath from '../components/SkillPath.vue'

const b = computed(() => BUILD_BY_ID[parts.value[1] ?? ''])
const plan = computed<Plan | null>(() => b.value ? { level: 30, attrs: b.value.attrs, actives: b.value.actives, passives: b.value.passives, gear: b.value.gear } : null)
const syn = computed(() => (b.value ? barSynergy([...b.value.actives, ...b.value.passives], b.value.attrs) : { score: 0, top: [] }))
const focus = computed(() => (b.value ? statFocus(b.value.actives, b.value.attrs) : null))
const color = computed(() => (b.value ? CLASSES[b.value.classes[0] as ClassId].color : '#fff'))
const portrait = computed(() => {
  const body = b.value?.gear.body ? ITEM_BY_ID[b.value.gear.body] : undefined
  const kind = body?.kind === 'plate' ? 'plate' : body?.kind === 'robe' ? 'robe' : 'leather'
  return `${IMG}portraits/hero-${kind}.webp`
})
const maxAttr = computed(() => (b.value ? Math.max(...ATTRS.map(a => b.value!.attrs[a])) : 1))
</script>

<template>
  <div v-if="b && plan" class="page wrap" :style="{ '--c': color }">
    <a href="#/builds" class="small">← All builds</a>
    <section class="head panel">
      <img class="portrait" :src="portrait" alt="" />
      <div class="hinfo">
        <div class="row">
          <span v-for="c in b.classes" :key="c" class="chip"><img :src="classIcon(c as ClassId)" alt="" class="ci" />{{ className(c as ClassId) }}</span>
        </div>
        <h1 class="gold-text">{{ b.name }}</h1>
        <p class="tagline">{{ b.tagline }}</p>
        <div class="row">
          <span v-for="r in b.roles" :key="r" class="chip">{{ r }}</span>
          <span class="chip">Difficulty {{ '★'.repeat(b.difficulty) }}</span>
          <span class="chip">Synergy {{ syn.score }}/100</span>
          <span v-if="focus" class="chip" :style="{ color: ATTR_COLOR[focus.attr] }">{{ ATTR_NAME[focus.attr] }} focus {{ focus.on }}/{{ focus.total }}</span>
        </div>
        <div class="row" style="margin-top:14px">
          <a class="btn" :href="'#/planner?b=' + encodeURIComponent(encodePlan(plan))">⚒ Open in Planner</a>
        </div>
      </div>
    </section>

    <!-- On a phone: everything a player mid-game needs, on one screen. -->
    <section class="panel quick">
      <h3>Quick view</h3>
      <div class="row"><SkillIcon v-for="id in b.actives" :key="id" :id="id" :size="40" /></div>
      <div class="row"><SkillIcon v-for="id in b.passives" :key="id" :id="id" :size="40" /></div>
      <div class="row qa"><span v-for="a in ATTRS" :key="a" :style="{ color: ATTR_COLOR[a] }">{{ a.toUpperCase() }} {{ b.attrs[a] }}</span></div>
      <div class="row"><template v-for="s in EQUIP_SLOT_LIST" :key="s"><ItemIcon v-if="b.gear[s]" :id="b.gear[s]!" :size="40" /></template></div>
      <div class="dim small">Tap any icon for details.</div>
    </section>

    <div class="grid cols">
      <div class="stack">
        <section class="panel">
          <h2>Overview</h2>
          <p>{{ b.intro }}</p>
          <ul><li v-for="(p, i) in b.playstyle" :key="i">{{ p }}</li></ul>
        </section>

        <section class="panel">
          <h2>The bar</h2>
          <h4 class="dim">Actives</h4>
          <div class="row skbar"><SkillIcon v-for="id in b.actives" :key="id" :id="id" :size="58" label /></div>
          <h4 class="dim">Passives</h4>
          <div class="row skbar"><SkillIcon v-for="id in b.passives" :key="id" :id="id" :size="58" label /></div>
          <h4 class="dim" style="margin-top:14px">Rotation</h4>
          <ol class="rot"><li v-for="(r, i) in b.rotation" :key="i">{{ r }}</li></ol>
        </section>

        <section class="panel">
          <h2>Skill path</h2>
          <SkillPath :plan="plan" />
        </section>

        <section class="panel">
          <h2>Leveling</h2>
          <div v-for="l in b.leveling" :key="l.range" class="lvl">
            <div class="range display">Lv {{ l.range }}</div>
            <p>{{ l.text }}</p>
          </div>
        </section>

        <section class="grid g2">
          <div class="panel"><h3 class="ok">Strengths</h3><ul><li v-for="s in b.strengths" :key="s">{{ s }}</li></ul></div>
          <div class="panel"><h3 class="warn">Weaknesses</h3><ul><li v-for="s in b.weaknesses" :key="s">{{ s }}</li></ul></div>
        </section>

        <section v-if="syn.top.length || focus" class="panel">
          <h2>Why it works</h2>
          <p v-if="focus" class="small"><b :style="{ color: ATTR_COLOR[focus.attr] }">{{ focus.on }} of {{ focus.total }}</b> damage skills scale with {{ ATTR_NAME[focus.attr] }}, the build's highest attribute — every point from levels and gear in it raises all of them at once.</p>
          <ul><li v-for="p in syn.top" :key="p.a.id + p.b.id">{{ p.why[0] }}</li></ul>
        </section>
      </div>

      <div class="stack">
        <section class="panel">
          <h3>Attributes at 30</h3>
          <div v-for="a in ATTRS" :key="a" class="ab">
            <span class="an" :style="{ color: ATTR_COLOR[a] }">{{ ATTR_NAME[a] }}</span>
            <div class="bar" style="flex:1"><i :style="{ width: (b.attrs[a] / maxAttr * 100) + '%', background: ATTR_COLOR[a] }"></i></div>
            <b>{{ b.attrs[a] }}</b>
          </div>
        </section>
        <section class="panel">
          <h3>Gear</h3>
          <div v-for="s in EQUIP_SLOT_LIST" :key="s" class="gear">
            <template v-if="b.gear[s]">
              <ItemIcon :id="b.gear[s]!" :size="44" />
              <div><div class="gn">{{ itemName(ITEM_BY_ID[b.gear[s]!]!) }}</div><div class="dim small">{{ slotName(ITEM_BY_ID[b.gear[s]!]!.slot) }}</div></div>
            </template>
          </div>
          <a class="small" href="#/items">Where to find each piece →</a>
        </section>
        <section class="panel">
          <h3>Stats at 30 (fully geared)</h3>
          <StatSheet :plan="plan" />
        </section>
        <section class="panel">
          <h3>Story choices</h3>
          <ul class="small"><li v-for="c in b.choices" :key="c">{{ c }}</li></ul>
        </section>
        <section v-if="b.variants?.length" class="panel">
          <h3>Variants</h3>
          <ul class="small"><li v-for="v in b.variants" :key="v">{{ v }}</li></ul>
        </section>
      </div>
    </div>
  </div>
  <div v-else class="page wrap"><p>Build not found. <a href="#/builds">All builds</a></p></div>
</template>

<style scoped>
.head { display: flex; gap: 26px; align-items: center; margin: 12px 0 20px; position: relative; overflow: hidden; background: radial-gradient(600px 300px at 0% 50%, color-mix(in srgb, var(--c) 28%, transparent), transparent), var(--panel); }
.portrait { width: 200px; height: 200px; object-fit: contain; filter: drop-shadow(0 10px 20px rgba(0,0,0,.7)); flex: none; }
.ci { width: 18px; height: 18px; object-fit: contain; }
.tagline { font-size: 18px; color: #efe6d6; }
.cols { grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); align-items: start; }
@media (max-width: 1000px) { .cols { grid-template-columns: 1fr; } .head { flex-direction: column; text-align: center; } .head .row { justify-content: center; } }
.quick { display: none; }
@media (max-width: 680px) {
  .portrait { display: none; }
  .head h1 { font-size: 32px; }
  .head { gap: 8px; }
  .tagline { font-size: 15px; }
  .rot { columns: 1; }
  .lvl { flex-direction: column; gap: 2px; }
  .quick { display: block; }
}
.quick .row { gap: 8px; margin-bottom: 8px; }
.qa { font-size: 13px; font-weight: 800; }
.skbar { gap: 14px; margin-bottom: 8px; align-items: flex-start; }
.rot { padding-left: 20px; columns: 2; }
.lvl { display: flex; gap: 16px; align-items: baseline; border-bottom: 1px solid var(--line2); padding: 8px 0; }
.range { color: var(--gold); width: 90px; flex: none; }
.ab { display: flex; gap: 10px; align-items: center; margin-bottom: 6px; }
.an { width: 100px; font-weight: 800; font-size: 13px; }
.gear { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
.gn { font-weight: 800; }
ul { padding-left: 20px; margin: 0; }
li { margin-bottom: 4px; }
</style>
