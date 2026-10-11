<script setup lang="ts">
import { computed } from 'vue'
import { statsOf, totalsOf, type Plan } from '../planner'
import { ATTRS, ATTR_SHORT, ATTR_COLOR } from '../data'
import { shopDiscount, minionMul } from '@/game/sim/stats'
import { statPower } from '@/game/data/attributes'

const props = defineProps<{ plan: Plan }>()
const st = computed(() => statsOf(props.plan))
const tot = computed(() => totalsOf(props.plan))
const pct = (v: number, d = 1): string => `${(v * 100).toFixed(d)}%`
const rows = computed(() => {
  const s = st.value
  const main = Math.max(...ATTRS.map(a => tot.value[a]))
  return [
    { k: 'Health', v: s.maxHp.toLocaleString(), c: '#ff6b6b' },
    { k: 'Mana', v: s.maxMana.toLocaleString(), c: '#50aaff' },
    { k: 'Health regen', v: `${s.hpRegen.toFixed(1)}/s` },
    { k: 'Mana regen', v: `${s.manaRegen.toFixed(1)}/s` },
    { k: 'Armor', v: Math.round(s.armor).toString() },
    { k: 'Elemental resist', v: pct(s.resist) },
    { k: 'Block', v: pct(s.block) },
    { k: 'Dodge', v: pct(s.dodge) },
    { k: 'Damage reduction', v: pct(s.damageReduction) },
    { k: 'Crit chance', v: pct(s.critChance) },
    { k: 'Crit damage', v: `×${s.critMult.toFixed(2)}` },
    { k: 'Spell crit (extra)', v: pct(s.spellCrit) },
    { k: 'Attack speed', v: `×${s.attackSpeed.toFixed(2)}` },
    { k: 'Move speed', v: `${s.moveSpeed.toFixed(2)} m/s` },
    { k: 'Cooldown reduction', v: pct(s.cdr) },
    { k: 'Mana discount', v: pct(s.manaDiscount) },
    { k: 'Life steal', v: pct(s.lifesteal + s.physLifesteal) },
    { k: 'Hero might (level)', v: `×${s.damageMul.toFixed(2)}` },
    { k: '100% hit of top attribute', v: Math.round(statPower(main) * s.damageMul).toString(), c: '#ffd84a' },
    { k: 'Minion damage', v: `×${minionMul(tot.value.cha, s.mods).toFixed(2)}` },
    { k: 'Shop discount (CHA)', v: pct(shopDiscount(tot.value.cha), 0) }
  ]
})
</script>

<template>
  <div class="sheet">
    <div class="attrs">
      <div v-for="a in ATTRS" :key="a" class="attr">
        <span class="lbl" :style="{ color: ATTR_COLOR[a] }">{{ ATTR_SHORT[a] }}</span>
        <span class="val">{{ tot[a] }}</span>
        <span class="gear dim" v-if="tot[a] !== plan.attrs[a]">({{ plan.attrs[a] }}+{{ tot[a] - plan.attrs[a] }})</span>
      </div>
    </div>
    <div class="rows">
      <div v-for="r in rows" :key="r.k" class="r"><span class="dim">{{ r.k }}</span><b :style="{ color: r.c }">{{ r.v }}</b></div>
    </div>
  </div>
</template>

<style scoped>
.attrs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
.attr { background: rgba(0,0,0,.3); border-radius: 10px; padding: 8px 10px; display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 6px; min-width: 0; }
.lbl { font-family: var(--display); font-size: 14px; }
.val { font-family: var(--display); font-size: 22px; }
.gear { font-size: 11px; width: 100%; }
.rows { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 18px; font-size: 13.5px; }
.r { display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,.06); padding: 3px 0; }
</style>
