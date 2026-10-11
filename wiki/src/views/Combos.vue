<script setup lang="ts">
import { computed, ref } from 'vue'
import { SKILLS, SKILL_BY_ID, CLASS_IDS, CLASSES, className, classIcon, skillName, type ClassId } from '../data'
import { ALL_PAIRS, partnersOf, TAG_LABEL, TAG_COLOR, tagsOf } from '../synergy'
import SkillIcon from '../components/SkillIcon.vue'

const focus = ref('')
const cross = ref(true)
const clsA = ref<ClassId | ''>('')
const q = ref('')
const pairs = computed(() => ALL_PAIRS().filter(p =>
  (!cross.value || p.a.cls !== p.b.cls) && (!clsA.value || p.a.cls === clsA.value || p.b.cls === clsA.value)).slice(0, 60))
const focused = computed(() => SKILL_BY_ID[focus.value])
const partners = computed(() => (focused.value ? partnersOf(focused.value, 24) : []))
const pickable = computed(() => SKILLS.filter(s => !q.value || skillName(s).toLowerCase().includes(q.value.toLowerCase())))
const total = SKILLS.length * (SKILLS.length - 1) / 2
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Combo Lab</h1>
    <p class="muted lead">All {{ total.toLocaleString() }} skill pairs, scored. A pair scores when one skill <b>empowers</b> what the other delivers (Pyromaniac + fire spells, War Marshal + every summon, Shatterpoint + chills) or <b>sets it up</b> (a freeze before a burst, a mark before an assassination, a taunt before an area nuke). Cross-class pairs get a small bonus — that is where the unexplored builds hide.</p>

    <div class="grid cols">
      <section class="panel">
        <h2>Explore one skill</h2>
        <input type="search" v-model="q" placeholder="Find a skill…" style="width:100%;margin-bottom:10px" />
        <div class="picker">
          <button v-for="s in pickable" :key="s.id" class="pk" :class="{ on: focus === s.id }" @click="focus = s.id"><SkillIcon :id="s.id" :size="34" /></button>
        </div>
        <template v-if="focused">
          <div class="row focus">
            <SkillIcon :id="focused.id" :size="64" />
            <div><h3 class="display" :style="{ color: CLASSES[focused.cls].color }">{{ skillName(focused) }}</h3>
              <div class="row"><span v-for="t in tagsOf(focused)" :key="t" class="chip" :style="{ color: TAG_COLOR[t] }">{{ TAG_LABEL[t] }}</span></div></div>
          </div>
          <div v-for="p in partners" :key="p.b.id" class="prow">
            <SkillIcon :id="p.b.id" :size="40" />
            <div class="small"><b>{{ skillName(p.b) }}</b> <span :style="{ color: CLASSES[p.b.cls].color }">{{ className(p.b.cls) }}</span>
              <div class="muted">{{ p.why.slice(0, 2).join(' · ') }}</div></div>
            <span class="score display">{{ p.score.toFixed(1) }}</span>
          </div>
          <p v-if="!partners.length" class="dim">No strong partners found — a self-contained skill.</p>
        </template>
        <p v-else class="dim">Pick a skill to see its best partners across all classes.</p>
      </section>

      <section class="panel">
        <div class="row between"><h2>Strongest pairs</h2>
          <div class="row"><button class="chip" :class="{ on: cross }" @click="cross = !cross">Cross-class only</button></div></div>
        <div class="row" style="margin-bottom:10px">
          <button v-for="c in CLASS_IDS" :key="c" class="cb" :class="{ on: clsA === c }" :title="className(c)" :style="{ '--c': CLASSES[c].color }" @click="clsA = clsA === c ? '' : c"><img :src="classIcon(c)" alt="" /></button>
        </div>
        <div v-for="p in pairs" :key="p.a.id + p.b.id" class="prow">
          <SkillIcon :id="p.a.id" :size="38" /><span class="plus">+</span><SkillIcon :id="p.b.id" :size="38" />
          <div class="small"><b>{{ skillName(p.a) }} + {{ skillName(p.b) }}</b><div class="muted">{{ p.why[0] }}</div></div>
          <span class="score display">{{ p.score.toFixed(1) }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lead { max-width: 900px; }
.cols { grid-template-columns: 1fr 1fr; align-items: start; margin-top: 16px; }
@media (max-width: 1000px) { .cols { grid-template-columns: 1fr; } }
.picker { display: flex; flex-wrap: wrap; gap: 4px; max-height: 190px; overflow: auto; margin-bottom: 14px; }
.pk { background: none; border: 2px solid transparent; border-radius: 10px; padding: 2px; cursor: pointer; }
.pk.on { border-color: var(--gold); }
.focus { gap: 14px; margin: 8px 0 12px; }
.focus h3 { margin: 0 0 6px; }
.prow { display: flex; gap: 10px; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--line2); }
.prow > .small { flex: 1; min-width: 0; }
.plus { color: var(--gold); font-family: var(--display); }
.score { color: var(--gold); font-size: 18px; width: 44px; text-align: right; }
.cb { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--line2); background: rgba(0,0,0,.3); cursor: pointer; padding: 3px; }
.cb img { width: 100%; height: 100%; object-fit: contain; }
.cb.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 25%, transparent); }
</style>
