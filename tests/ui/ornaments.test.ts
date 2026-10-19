// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { installOrnaments } from '@/components/art/ornaments'
import { ORNAMENTS, ornamentSvg } from '@/game/art/ornamentRefs'
import { SETS, artTarget } from '@/game/art/artSheet'

describe('interface ornaments (roadmaps #127, #128)', () => {
  it('every custom property the cel mixins read is written by installOrnaments', () => {
    const sass = readFileSync('src/assets/css/cel.sass', 'utf8')
    const used = new Set<string>()
    // Direct names, plus the `#{$set}` corner families the mixin takes.
    for (const m of sass.matchAll(/var\(--(orn-[a-z-]+)\)/g)) used.add(m[1]!)
    for (const set of ['corner', 'corner-sm']) for (const k of ['tl', 'tr', 'bl', 'br']) used.add(`orn-${set}-${k}`.replace('orn-corner', 'orn-corner'))
    installOrnaments()
    const css = document.getElementById('bc-ornaments')!.textContent ?? ''
    for (const name of used) {
      if (name.includes('#')) continue
      expect(css, name).toContain(`--${name}:url(`)
    }
  })

  it('has a drawing, a painted target and a panel on the ornament sheet for each ornament', () => {
    // The rule and the crest are painted on their own sheet; their panels on the first stay blank so the other four keep their places.
    const sheet = SETS.find(s => s.stem === 'sheet-ui-ornaments')!
    const pair = SETS.find(s => s.stem === 'sheet-ui-rule-crest')!
    expect(sheet.cells.map(c => c?.target ?? null)).toEqual(ORNAMENTS.map(o => (o.id === 'orn-rule' || o.id === 'orn-crest' ? null : artTarget('ui', o.id))))
    expect(pair.cells.map(c => c!.target)).toEqual([artTarget('ui', 'orn-rule'), artTarget('ui', 'orn-crest')])
    for (const o of ORNAMENTS) {
      expect(ornamentSvg(o)).toContain(`viewBox="0 0 ${o.w} ${o.h}"`)
      expect(ornamentSvg(o, 'xy', true)).toContain('matrix(-1 0 0 -1')
    }
  })
})
