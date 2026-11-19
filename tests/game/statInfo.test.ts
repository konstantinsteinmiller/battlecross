import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'
import { ATTRS } from '@/game/data/attributes'
import { DERIVED_STATS, SOURCES, STAT_INFO_IDS, statInfoParams } from '@/game/data/statInfo'
import { STATS } from '@/components/game/heroSheet'

const msg = en as unknown as { statinfo: Record<string, any>; stat: Record<string, string> }

describe('the stat info cards', () => {
  it('cover every attribute and every stat of the character sheet', () => {
    expect([...DERIVED_STATS]).toEqual(STATS.map(s => s.key))
    expect(STAT_INFO_IDS).toEqual([...ATTRS, ...DERIVED_STATS])
  })

  it('have the three texts, and a tag text for each place a stat comes from', () => {
    for (const id of STAT_INFO_IDS) {
      for (const k of ['does', 'fights', 'synergy']) expect(typeof msg.statinfo[id]?.[k], `${id}.${k}`).toBe('string')
      for (const raw of SOURCES[id]) expect(typeof msg.statinfo.src[raw.split(':')[0]!], `${id} source ${raw}`).toBe('string')
    }
    for (const k of ['does', 'fights', 'source', 'synergy']) expect(typeof msg.statinfo.h[k]).toBe('string')
  })

  it('use only numbers the rules provide (no {placeholder} without a value)', () => {
    const have = new Set(Object.keys(statInfoParams()))
    for (const id of STAT_INFO_IDS) {
      for (const k of ['does', 'fights', 'synergy']) {
        for (const m of String(msg.statinfo[id][k]).matchAll(/\{(\w+)\}/g)) expect(have.has(m[1]!), `${id}.${k} {${m[1]}}`).toBe(true)
      }
    }
  })
})
