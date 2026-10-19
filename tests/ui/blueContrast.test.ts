import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * #129: white lettering on the blue tone must pass WCAG AA. The label sits across
 * the lit band and the base of a candy fill (the shadow lip is below the text),
 * so both must hold: the base 4.5:1, the band 3:1 (the labels are large and bold).
 */
const theme = readFileSync(join(resolve(__dirname, '../..'), 'src/assets/css/theme.sass'), 'utf8')
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
  it('passes AA on the base and the lit band, hover brightening included', () => {
    expect(contrast('#ffffff', hex('blue'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast('#ffffff', hex('blue-lo'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast('#ffffff', hex('blue-hi'))).toBeGreaterThanOrEqual(3.3)
  })
})
