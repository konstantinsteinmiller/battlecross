<script setup lang="ts">
import { ATTRS, ATTR_COLOR, ATTR_START, POINTS_PER_LEVEL, t, type Attr } from '../data'
import { DERIVED_STATS, SOURCES, isAttrId, statInfoParams, type StatInfoId } from '@/game/data/statInfo'

const params = statInfoParams()
const name = (id: StatInfoId): string => (isAttrId(id) ? t(`attr.${id}.name`) : t(`stat.${id}`))
const part = (id: StatInfoId, k: 'does' | 'fights' | 'synergy'): string => t(`statinfo.${id}.${k}`, params)
const sources = (id: StatInfoId): { label: string; attr: Attr | null }[] => SOURCES[id].map((raw) => {
  const [tag, a] = raw.split(':')
  return { label: t(`statinfo.src.${tag}`), attr: a && isAttrId(a) ? a : null }
})
const tint = (id: StatInfoId): string => (isAttrId(id) ? ATTR_COLOR[id] : '#d9b04e')
const cap = t('statinfo.cap')
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Stats</h1>
    <p class="muted lead">
      What every number on the character sheet means: what it does, how it plays in a fight, where it comes from and what it works with.
      In the game, rest the mouse on a stat (or tap it on a touch screen) to read the same card. A new hero starts with {{ ATTR_START }} in every attribute and earns {{ POINTS_PER_LEVEL }} points per level.
      {{ cap }}
    </p>

    <div class="section-title"><h2>The six attributes</h2><span class="dim small">the points you spend</span></div>
    <div class="grid g2">
      <section v-for="id in ATTRS" :id="'stat-' + id" :key="id" class="panel stat" :style="{ '--c': tint(id) }">
        <h3 class="display" :style="{ color: tint(id) }">{{ name(id) }} <span class="small dim">({{ t(`attr.${id}.short`) }})</span></h3>
        <h4>What it does</h4>
        <p class="small">{{ part(id, 'does') }}</p>
        <h4>In a fight</h4>
        <p class="small">{{ part(id, 'fights') }}</p>
        <h4>Where it comes from</h4>
        <p class="small tags"><span v-for="s in sources(id)" :key="s.label" class="tag">{{ s.label }}</span></p>
        <h4>Synergies</h4>
        <p class="small">{{ part(id, 'synergy') }}</p>
      </section>
    </div>

    <div class="section-title"><h2>The derived stats</h2><span class="dim small">what the attributes and gear add up to</span></div>
    <div class="grid g2">
      <section v-for="id in DERIVED_STATS" :id="'stat-' + id" :key="id" class="panel stat" :style="{ '--c': tint(id) }">
        <h3 class="display" :style="{ color: tint(id) }">{{ name(id) }}</h3>
        <h4>What it does</h4>
        <p class="small">{{ part(id, 'does') }}</p>
        <h4>In a fight</h4>
        <p class="small">{{ part(id, 'fights') }}</p>
        <h4>Where it comes from</h4>
        <p class="small tags">
          <span v-for="s in sources(id)" :key="s.label + (s.attr ?? '')" class="tag">
            {{ s.label }}<b v-if="s.attr" class="attr" :style="{ background: ATTR_COLOR[s.attr] }">{{ t(`attr.${s.attr}.short`) }}</b>
          </span>
        </p>
        <h4>Synergies</h4>
        <p class="small">{{ part(id, 'synergy') }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.stat h4 { margin: 10px 0 2px; font-size: 12px; letter-spacing: .05em; text-transform: uppercase; color: var(--c); }
.stat p { margin: 0; line-height: 1.45; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border: 1px solid var(--line, #5a4a30); border-radius: 999px; }
.attr { padding: 0 6px; border-radius: 999px; color: #1b1626; font-size: 11px; }
</style>
