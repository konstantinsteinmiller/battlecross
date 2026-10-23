import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * #161: the veil between locations wears the boot splash's backdrop — the same
 * gradient and the same scrolling tile — so every loading screen looks alike.
 */
const read = (rel: string): string => readFileSync(resolve(__dirname, '../..', rel), 'utf8')
const splash = read('src/components/atoms/FLogoProgress.vue')
const veil = read('src/components/hud/TravelVeil.vue')

/** A property of a top-level sass rule. */
const prop = (src: string, rule: string, name: string): string | undefined =>
  new RegExp(`^${rule.replace('.', '\\.')}\\n(?: {2}.*\\n)*? {2}${name}: (.*)$`, 'm').exec(src)?.[1]

describe('the travel veil', () => {
  it('paints the splash backdrop', () => {
    expect(prop(veil, '.veil', 'background')).toBe(prop(splash, '.splash-backdrop', 'background'))
  })

  it('scrolls the same tile at the same pace', () => {
    for (const name of ['inset', 'background-image', 'background-size', 'animation']) {
      expect(prop(veil, '.veil__grid', name), name).toBe(prop(splash, '.backdrop-grid', name))
    }
    const pan = /@keyframes grid-pan\n {2}to\n {4}transform: (.*)$/m
    expect(pan.exec(veil)?.[1]).toBe(pan.exec(splash)?.[1])
    expect(veil).toMatch(/@media \(prefers-reduced-motion: reduce\)\n {2}\.veil__grid\n {4}animation: none/)
  })
})
