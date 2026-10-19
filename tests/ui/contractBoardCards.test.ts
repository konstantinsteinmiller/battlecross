// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The standing track and the gift/blessing rows sit on the same parchment card
// as the tasks, so the page's bottom-left corner ornament never runs under
// their text.
const src = readFileSync(resolve(__dirname, '../../src/components/modals/ContractBoard.vue'), 'utf8')

describe('contract board cards', () => {
  it('puts the standing track and each gift row on the parchment card', () => {
    expect(src).toMatch(/div\.card\.board__rep/)
    expect(src).toMatch(/li\.card\.reward/)
    expect(src).toMatch(/\.card\n  position: relative\n  color: var\(--bc-paper-ink\)/)
  })

  it('keeps the tasks on the same card and a safe inset around the list', () => {
    expect(src).toMatch(/\n\.job\n/)
    expect(src).toMatch(/\.board\n  padding-block-end/)
  })
})

describe('contract board jobs', () => {
  it('every job row carries the card class, and the card paints an opaque parchment', () => {
    const rows = src.split('\n').filter(l => /li\.[\w.-]*\bjob\b/.test(l))
    expect(rows.length).toBe(2)
    for (const l of rows) expect(l).toMatch(/li\.card\.job/)
    const card = src.match(/\n\.card\n((?:  .*\n)+)/)?.[1] ?? ''
    expect(card).toMatch(/background: \$grain, radial-gradient\(.*var\(--bc-paper-hi\).*var\(--bc-paper-deep\)/)
  })
})
