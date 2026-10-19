import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Every ink a parchment window sets its text in reads at WCAG AA (4.5:1)
 * against the paper, and outlined lettering takes its halo colour from its
 * own text colour (a dark outline round dark ink is what made the memory
 * stand unreadable).
 */
const theme = readFileSync('src/assets/css/theme.sass', 'utf8')
const modal = readFileSync('src/components/molecules/FModal.vue', 'utf8')

const hexOf = (token: string): string => {
  const m = theme.match(new RegExp(`--${token}:\\s*(#[0-9a-f]{6})`, 'i'))
  if (!m) throw new Error(`no hex for --${token}`)
  return m[1]!
}
const lum = (hex: string): number => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!
}
const contrast = (a: string, b: string): number => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number]
  return (x + 0.05) / (y + 0.05)
}

describe('text on parchment', () => {
  const block = modal.slice(modal.indexOf('.f-modal--parchment .f-modal__page'))
  const inks = [...block.matchAll(/--bc-on(?:-[a-z]+)?:\s*var\(--([a-z-]+)\)/g)].map(m => m[1]!)

  it('every on-parchment ink clears 4.5:1 against both paper tones', () => {
    expect(inks.length).toBeGreaterThanOrEqual(5)
    for (const ink of inks) for (const paper of ['bc-paper', 'bc-paper-hi']) {
      expect(contrast(hexOf(ink), hexOf(paper)), `${ink} on ${paper}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('outlines take a contrast-aware colour from the text itself', () => {
    expect(theme).toMatch(/--bc-text-outline:[^\n]*var\(--bc-outline-c\)/)
    expect(theme).not.toMatch(/--bc-text-outline(-thin)?:[^\n]*var\(--bc-ink\)/)
    expect(theme).toMatch(/--bc-outline-c:\s*oklch\(from currentColor/)
  })
})
