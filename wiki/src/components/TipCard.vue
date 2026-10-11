<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { tip, hideTip } from '../tip'
import {
  SKILL_BY_ID, ITEM_BY_ID, CLASSES, TIER_COLOR, ATTR_SHORT, ATTR_NAME, className, skillName, skillDesc, scalingOf, skillCost,
  itemName, tierName, slotName, modLine, sourcesOf, teachersOf, npcName, placeName, type Attr
} from '../data'
import { tagsOf, TAG_LABEL, TAG_COLOR } from '../synergy'

const s = computed(() => (tip.kind === 'skill' ? SKILL_BY_ID[tip.id] : undefined))
const it = computed(() => (tip.kind === 'item' ? ITEM_BY_ID[tip.id] : undefined))
const pos = computed(() => {
  const w = 360, h = 320
  const x = tip.x + 18 + w > window.innerWidth ? tip.x - w - 18 : tip.x + 18
  const y = Math.min(tip.y + 14, window.innerHeight - h)
  return { left: Math.max(8, x) + 'px', top: Math.max(8, y) + 'px' }
})
const narrow = ref(window.innerWidth < 700)
const onResize = (): void => { narrow.value = window.innerWidth < 700 }
/** A tap that is not on an icon closes the card (touch has no mouseleave). */
const onDown = (e: PointerEvent): void => {
  if (!(e.target as HTMLElement).closest('.skill, .item, .tipcard')) hideTip()
}
onMounted(() => { addEventListener('resize', onResize); addEventListener('pointerdown', onDown) })
onUnmounted(() => { removeEventListener('resize', onResize); removeEventListener('pointerdown', onDown) })
const firstTeacher = computed(() => (s.value ? teachersOf(s.value.cls)[0] : undefined))
</script>

<template>
  <div v-if="s || it" class="tipcard" :class="{ sheet: narrow }" :style="narrow ? {} : pos" @click="narrow && hideTip()">
    <template v-if="s">
      <div class="head" :style="{ color: CLASSES[s.cls].color }">
        <div class="name display">{{ skillName(s) }}</div>
        <div class="sub">{{ className(s.cls) }} · {{ s.kind === 'active' ? 'Active' : 'Passive' }}</div>
      </div>
      <p class="desc">{{ skillDesc(s) }}</p>
      <div class="meta">
        <span>Level {{ s.level }}</span>
        <span v-for="(v, a) in s.req" :key="a" :class="'attr-' + a">{{ v }} {{ ATTR_SHORT[a as Attr] }}</span>
      </div>
      <div v-if="s.kind === 'active'" class="meta">
        <span>⏱ {{ s.cd }}s</span>
        <span v-if="s.mana">💧 {{ s.mana }} mana</span>
        <span v-if="s.hpCost" class="warn">♥ {{ s.hpCost }}% health</span>
        <span v-if="s.heat">🔥 +{{ s.heat }} heat</span>
        <span v-if="s.range">↔ {{ s.range }} m</span>
        <span v-if="s.radius">◎ {{ s.radius }} m</span>
      </div>
      <div v-if="scalingOf(s)" class="meta"><span :class="'attr-' + scalingOf(s)">Scales with {{ ATTR_NAME[scalingOf(s)!] }}</span></div>
      <div v-if="s.mods" class="mods"><div v-for="(v, k) in s.mods" :key="k">{{ modLine(k as string, v as number) }}</div></div>
      <div class="tags"><span v-for="t in tagsOf(s)" :key="t" class="tg" :style="{ color: TAG_COLOR[t] }">{{ TAG_LABEL[t] }}</span></div>
      <div class="foot">Trainer cost {{ skillCost(s) }} gold<span v-if="firstTeacher"> · first from {{ npcName(firstTeacher.npc) }}, {{ placeName(firstTeacher.place) }}</span></div>
    </template>
    <template v-else-if="it">
      <div class="head" :style="{ color: TIER_COLOR[it.tier] }">
        <div class="name display">{{ itemName(it) }}</div>
        <div class="sub">{{ tierName(it.tier) }} {{ slotName(it.slot) }} · requires level {{ it.level }}</div>
      </div>
      <div v-if="it.armor" class="meta"><span>🛡 {{ it.armor }} Armor</span></div>
      <div v-if="it.weapon" class="meta"><span>{{ it.weapon.style }} · scales with {{ ATTR_NAME[it.weapon.scale] }} · {{ it.weapon.interval }}s swing</span></div>
      <div class="mods"><div v-for="(v, k) in it.mods" :key="k">{{ modLine(k as string, v as number) }}</div></div>
      <div class="foot">
        <div v-for="(src, i) in sourcesOf(it).slice(0, 4)" :key="i">• {{ src.text }} <span class="dim">(~lv {{ src.at }})</span></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tipcard {
  position: fixed; z-index: 1000; width: 360px; pointer-events: none;
  background: linear-gradient(180deg, rgba(30, 22, 44, .98), rgba(14, 10, 22, .98));
  border: 1px solid rgba(255, 216, 74, .35); border-radius: 14px; padding: 14px 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08);
  font-size: 13.5px; animation: pop .12s ease-out;
}
@keyframes pop { from { opacity: 0; transform: scale(.97); } }
.tipcard.sheet { left: 8px !important; right: 8px; bottom: 8px; top: auto !important; width: auto; max-height: 62vh; overflow: auto; pointer-events: auto; border-radius: 18px; }
.tipcard.sheet::after { content: 'Tap to close'; display: block; text-align: center; color: var(--dim); font-size: 11px; margin-top: 8px; }
.head { text-align: center; border-bottom: 1px solid rgba(255,255,255,.08); padding-bottom: 8px; margin-bottom: 8px; }
.name { font-size: 21px; text-shadow: 0 2px 0 rgba(0,0,0,.6); }
.sub { color: var(--muted); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.desc { color: #fff; }
.meta { display: flex; flex-wrap: wrap; gap: 4px 12px; color: var(--muted); font-weight: 700; font-size: 12.5px; margin-bottom: 4px; }
.mods { color: #8ab4ff; margin: 6px 0; font-weight: 700; }
.tags { display: flex; flex-wrap: wrap; gap: 4px 10px; font-size: 12px; font-weight: 800; margin: 6px 0; }
.foot { color: var(--dim); font-size: 12px; border-top: 1px solid rgba(255,255,255,.08); padding-top: 6px; margin-top: 6px; }
</style>
