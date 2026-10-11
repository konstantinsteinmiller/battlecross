<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { query, setQuery } from '../router'
import { BUILDS } from '../builds'
import { decodePlan, emptyPlan, encodePlan, pointsAt, problemsOf, spentOf, totalsOf, type Plan } from '../planner'
import { barSynergy } from '../synergy'
import {
  CLASS_IDS, CLASSES, SKILLS, ATTRS, ATTR_NAME, ATTR_COLOR, ATTR_START, ACTIVE_SLOTS, PASSIVE_SLOTS, EQUIP_SLOT_LIST, ALL_ITEMS,
  ITEM_BY_ID, SKILL_BY_ID, TIER_COLOR, MAX_LEVEL, className, classIcon, skillName, itemName, slotName, slotOfEquip, tierName,
  skillReqText, type Attr, type ClassId, type EquipSlot
} from '../data'
import { meetsSkill } from '@/game/data/skills'
import SkillIcon from '../components/SkillIcon.vue'
import ItemIcon from '../components/ItemIcon.vue'
import StatSheet from '../components/StatSheet.vue'
import SkillPath from '../components/SkillPath.vue'

const STORE = 'bx-codex-plan'
const initial = (): Plan => {
  const q = query.value.get('b')
  const fromUrl = q ? decodePlan(q) : null
  if (fromUrl) return fromUrl
  try { const s = localStorage.getItem(STORE); const p = s ? decodePlan(s) : null; if (p) return p } catch { /* private mode */ }
  return emptyPlan()
}
const plan = reactive<Plan>(initial())
watch(plan, () => {
  const code = encodePlan(plan)
  setQuery({ b: code })
  try { localStorage.setItem(STORE, code) } catch { /* private mode */ }
}, { deep: true })

const budget = computed(() => pointsAt(plan.level))
const left = computed(() => budget.value - spentOf(plan.attrs))
const totals = computed(() => totalsOf(plan))
const problems = computed(() => problemsOf(plan))
const syn = computed(() => barSynergy([...plan.actives, ...plan.passives]))

const add = (a: Attr, n: number): void => {
  const step = n > 0 ? Math.min(n, left.value) : Math.max(n, ATTR_START - plan.attrs[a])
  plan.attrs[a] += step
}
const resetAttrs = (): void => { for (const a of ATTRS) plan.attrs[a] = ATTR_START }

// Skills
const tab = ref<ClassId | 'all'>('all')
const kind = ref<'all' | 'active' | 'passive'>('all')
const search = ref('')
const pool = computed(() => SKILLS.filter(s =>
  (tab.value === 'all' || s.cls === tab.value) && (kind.value === 'all' || s.kind === kind.value) &&
  (!search.value || skillName(s).toLowerCase().includes(search.value.toLowerCase()))).sort((a, b) => a.level - b.level))
const toggle = (id: string): void => {
  const s = SKILL_BY_ID[id]!
  const list = s.kind === 'active' ? plan.actives : plan.passives
  const max = s.kind === 'active' ? ACTIVE_SLOTS : PASSIVE_SLOTS
  const i = list.indexOf(id)
  if (i >= 0) list.splice(i, 1)
  else if (list.length < max) list.push(id)
}
const slotted = (id: string): boolean => plan.actives.includes(id) || plan.passives.includes(id)
const meets = (id: string): boolean => meetsSkill(SKILL_BY_ID[id]!, plan.level, totals.value)

// Gear
const optionsFor = (s: EquipSlot) => ALL_ITEMS.filter(i => i.slot === slotOfEquip(s)).sort((a, b) => a.level - b.level || a.tier - b.tier)
const setGear = (s: EquipSlot, id: string): void => { if (id) plan.gear[s] = id; else delete plan.gear[s] }
const toggleBless = (f: 'order' | 'syndicate' | 'circle'): void => {
  plan.blessings = plan.blessings ?? []
  const i = plan.blessings.indexOf(f)
  if (i >= 0) plan.blessings.splice(i, 1); else plan.blessings.push(f)
}

const load = (id: string): void => {
  const b = BUILDS.find(x => x.id === id)
  if (!b) return
  Object.assign(plan, { level: 30, attrs: { ...b.attrs }, actives: [...b.actives], passives: [...b.passives], gear: { ...b.gear }, blessings: [], upgrades: {} })
}
const clear = (): void => { Object.assign(plan, emptyPlan()) }
const copied = ref(false)
const share = async (): Promise<void> => {
  try { await navigator.clipboard.writeText(location.href); copied.value = true; setTimeout(() => (copied.value = false), 1600) } catch { /* no clipboard */ }
}
const preset = ref('')
watch(preset, v => { if (v) { load(v); preset.value = '' } })
</script>

<template>
  <div class="page wrap">
    <div class="row between">
      <div>
        <h1 class="gold-text">Character Planner</h1>
        <p class="muted">Any skill from any class, any gear — the stats are computed with the game's own formulas. Your plan saves in the link: share it.</p>
      </div>
      <div class="row">
        <select v-model="preset"><option value="">Load a guide build…</option><option v-for="b in BUILDS" :key="b.id" :value="b.id">{{ b.name }}</option></select>
        <button class="btn ghost small" @click="clear">Reset</button>
        <button class="btn small" @click="share">{{ copied ? '✓ Link copied' : '🔗 Share build' }}</button>
      </div>
    </div>

    <div class="layout">
      <!-- Left: level, attributes -->
      <aside class="stack">
        <section class="panel">
          <div class="row between"><h3>Level</h3><span class="display lvbig gold-text">{{ plan.level }}</span></div>
          <input type="range" min="1" :max="MAX_LEVEL" v-model.number="plan.level" style="width:100%" />
        </section>
        <section class="panel">
          <div class="row between"><h3>Attributes</h3><span :class="left < 0 ? 'warn' : 'ok'" class="display">{{ left }} left</span></div>
          <div v-for="a in ATTRS" :key="a" class="attr">
            <span class="an" :style="{ color: ATTR_COLOR[a] }">{{ ATTR_NAME[a] }}</span>
            <button class="pm" @click="add(a, -5)" title="-5">«</button>
            <button class="pm" @click="add(a, -1)">−</button>
            <span class="av display">{{ plan.attrs[a] }}</span>
            <button class="pm" @click="add(a, 1)">+</button>
            <button class="pm" @click="add(a, 5)" title="+5">»</button>
            <span class="tot dim small" v-if="totals[a] !== plan.attrs[a]">{{ totals[a] }}</span>
          </div>
          <button class="btn ghost small" @click="resetAttrs">Reset points</button>
          <p class="dim small" style="margin-top:8px">5 in each to start, 3 per level ({{ budget }} at level {{ plan.level }}). Grey number: total with gear & passives — skill requirements check that total.</p>
        </section>
        <section class="panel">
          <h3>Faction blessings</h3>
          <p class="dim small">+5 standing with a faction grants its blessing.</p>
          <div class="row">
            <button class="chip" :class="{ on: plan.blessings?.includes('order') }" @click="toggleBless('order')">Order · +5% HP</button>
            <button class="chip" :class="{ on: plan.blessings?.includes('circle') }" @click="toggleBless('circle')">Circle · +10% mana regen</button>
            <button class="chip" :class="{ on: plan.blessings?.includes('syndicate') }" @click="toggleBless('syndicate')">Syndicate · +10% gold</button>
          </div>
        </section>
      </aside>

      <!-- Middle: bar + picker -->
      <section class="stack">
        <div class="panel">
          <div class="row between"><h3>Skill bar</h3><span class="chip">Synergy {{ syn.score }}/100</span></div>
          <div class="slots">
            <div v-for="i in ACTIVE_SLOTS" :key="'a' + i" class="slot" @click="plan.actives[i - 1] && toggle(plan.actives[i - 1]!)">
              <SkillIcon v-if="plan.actives[i - 1]" :id="plan.actives[i - 1]!" :size="56" :dim="!meets(plan.actives[i - 1]!)" />
              <span v-else class="dim">{{ i }}</span>
            </div>
          </div>
          <div class="slots passives">
            <div v-for="i in PASSIVE_SLOTS" :key="'p' + i" class="slot round" @click="plan.passives[i - 1] && toggle(plan.passives[i - 1]!)">
              <SkillIcon v-if="plan.passives[i - 1]" :id="plan.passives[i - 1]!" :size="56" :dim="!meets(plan.passives[i - 1]!)" />
              <span v-else class="dim">P{{ i }}</span>
            </div>
          </div>
          <p class="dim small">Click a skill below to slot it, click a slot to remove it. Greyed: requirements not met at this level.</p>
          <ul v-if="syn.top.length" class="why small"><li v-for="p in syn.top.slice(0, 4)" :key="p.a.id + p.b.id">✦ {{ p.why[0] }}</li></ul>
        </div>

        <div class="panel">
          <div class="tabs">
            <button class="ctab" :class="{ on: tab === 'all' }" @click="tab = 'all'">All</button>
            <button v-for="c in CLASS_IDS" :key="c" class="ctab" :class="{ on: tab === c }" :title="className(c)" :style="{ '--c': CLASSES[c].color }" @click="tab = c">
              <img :src="classIcon(c)" :alt="className(c)" />
            </button>
          </div>
          <div class="row" style="margin:10px 0">
            <input type="search" v-model="search" placeholder="Search skills…" />
            <button class="chip" :class="{ on: kind === 'all' }" @click="kind = 'all'">All</button>
            <button class="chip" :class="{ on: kind === 'active' }" @click="kind = 'active'">Actives</button>
            <button class="chip" :class="{ on: kind === 'passive' }" @click="kind = 'passive'">Passives</button>
          </div>
          <div class="pool">
            <button v-for="s in pool" :key="s.id" class="pick" :class="{ on: slotted(s.id), no: !meets(s.id) }" @click="toggle(s.id)">
              <SkillIcon :id="s.id" :size="40" />
              <span class="pn"><b>{{ skillName(s) }}</b><span class="dim small">{{ skillReqText(s) }}</span></span>
            </button>
          </div>
        </div>
      </section>

      <!-- Right: gear + stats -->
      <aside class="stack">
        <section class="panel">
          <h3>Equipment</h3>
          <div v-for="s in EQUIP_SLOT_LIST" :key="s" class="eq">
            <ItemIcon v-if="plan.gear[s]" :id="plan.gear[s]!" :size="40" />
            <span v-else class="empty"></span>
            <select :value="plan.gear[s] ?? ''" @change="setGear(s, ($event.target as HTMLSelectElement).value)">
              <option value="">— {{ slotName(slotOfEquip(s)) }} —</option>
              <option v-for="it in optionsFor(s)" :key="it.id" :value="it.id" :style="{ color: TIER_COLOR[it.tier] }">
                {{ itemName(it) }} · Lv{{ it.level }} · {{ tierName(it.tier) }}
              </option>
            </select>
          </div>
        </section>
        <section class="panel">
          <h3>Stats</h3>
          <StatSheet :plan="plan" />
        </section>
        <section v-if="problems.length" class="panel">
          <h3 class="warn">Problems</h3>
          <ul class="small"><li v-for="(p, i) in problems" :key="i">{{ p.id && SKILL_BY_ID[p.id] ? 'Requirements not met: ' + skillName(SKILL_BY_ID[p.id]!) : p.id && ITEM_BY_ID[p.id] ? 'Level too low for ' + itemName(ITEM_BY_ID[p.id]!) : p.text }}</li></ul>
        </section>
      </aside>
    </div>

    <section v-if="plan.actives.length + plan.passives.length" class="panel" style="margin-top:20px">
      <h2>Your skill path</h2>
      <SkillPath :plan="plan" />
    </section>
  </div>
</template>

<style scoped>
.layout { display: grid; grid-template-columns: 300px minmax(0, 1fr) 360px; gap: 18px; margin-top: 16px; align-items: start; }
@media (max-width: 1200px) { .layout { grid-template-columns: 1fr 1fr; } .layout > section { grid-column: 1 / -1; order: -1; } }
@media (max-width: 760px) { .layout { grid-template-columns: 1fr; } }
.lvbig { font-size: 34px; }
.attr { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
.an { flex: 1; font-weight: 800; font-size: 13.5px; }
.av { width: 34px; text-align: center; font-size: 19px; }
.pm { width: 26px; height: 26px; border-radius: 7px; border: 1px solid var(--line); background: rgba(0,0,0,.35); color: var(--ink); cursor: pointer; font-weight: 800; }
.pm:hover { border-color: var(--gold); color: var(--gold); }
.tot { width: 28px; text-align: right; }
.slots { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 8px; margin: 10px 0; }
@media (max-width: 760px) { .slots { grid-template-columns: repeat(4, minmax(0, 1fr)); } .layout > * { min-width: 0; } }
.slots.passives { grid-template-columns: repeat(4, minmax(0, 64px)); }
@media (max-width: 760px) { .pool { grid-template-columns: 1fr; max-height: 420px; } .eq select { font-size: 14px; } }
.slot { aspect-ratio: 1; min-width: 0; border-radius: 12px; background: rgba(0,0,0,.35); border: 1px dashed var(--line); display: grid; place-items: center; cursor: pointer; }
.slot.round { border-radius: 50%; }
.why { list-style: none; padding: 0; margin: 8px 0 0; color: #cfe8ff; }
.tabs { display: flex; flex-wrap: wrap; gap: 4px; }
.ctab { height: 36px; min-width: 36px; border-radius: 9px; border: 1px solid var(--line2); background: rgba(0,0,0,.3); color: var(--ink); cursor: pointer; padding: 3px; font-weight: 800; }
.ctab img { width: 28px; height: 28px; object-fit: contain; display: block; }
.ctab.on { border-color: var(--c, var(--gold)); background: color-mix(in srgb, var(--c, #ffd84a) 22%, transparent); }
.pool { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 6px; max-height: 560px; overflow: auto; padding-right: 4px; }
.pick { display: flex; gap: 10px; align-items: center; text-align: left; background: rgba(0,0,0,.25); border: 1px solid var(--line2); border-radius: 10px; padding: 6px 8px; color: var(--ink); cursor: pointer; font: inherit; }
.pick:hover { border-color: var(--line); background: rgba(255,255,255,.04); }
.pick.on { border-color: var(--gold); background: rgba(255,216,74,.12); }
.pick.no { opacity: .55; }
.pn { display: flex; flex-direction: column; line-height: 1.2; font-size: 13.5px; }
.eq { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.eq select { flex: 1; min-width: 0; font-size: 13px; }
.empty { width: 40px; height: 40px; border-radius: 10px; border: 1px dashed var(--line); flex: none; }
</style>
