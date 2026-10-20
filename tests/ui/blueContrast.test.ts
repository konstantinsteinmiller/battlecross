import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * #129: white lettering on the blue tone must read. The owner kept the light
 * cel blue (`blueTokens.test.ts`: a darker token looked force-darkened), so
 * white on the bare blue is only about 2.6:1. What carries the label is its
 * ink outline (`cel.label` → `--bc-text-outline`): every glyph is ringed in
 * ink, so the edge the eye reads is ink on blue and white on ink. Both must
 * pass AA (4.5:1) on the base and the lit band, AA large (3:1) on the low band.
 */
const root = resolve(__dirname, '../..')
const theme = readFileSync(join(root, 'src/assets/css/theme.sass'), 'utf8')
const cel = readFileSync(join(root, 'src/assets/css/cel.sass'), 'utf8')
const hex = (name: string): string => theme.match(new RegExp(`--bc-${name}: *(#[0-9a-f]{6})`, 'i'))![1]!
const lum = (h: string): number => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
const contrast = (a: string, b: string): number => {
  const [x, y] = [lum(a), lum(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

describe('white text on the blue tone', () => {
  it('the label wears the ink outline', () => {
    expect(cel).toMatch(/@mixin label[\s\S]*?text-shadow: var\(--bc-text-outline\)/)
    expect(theme).toMatch(/--bc-outline-c: var\(--bc-ink\)/)
  })

  it('passes AA through its outline on the base and both bands', () => {
    expect(contrast('#ffffff', hex('ink'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(hex('ink'), hex('blue'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(hex('ink'), hex('blue-hi'))).toBeGreaterThanOrEqual(4.5)
    // The low band sits under the lip, below the letters' middle; large bold labels need 3:1 (AA large).
    expect(contrast(hex('ink'), hex('blue-lo'))).toBeGreaterThanOrEqual(3)
  })
})
