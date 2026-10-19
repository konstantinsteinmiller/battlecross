// The blue HUD buttons must keep their light cel blue: a darker token once made them look force-darkened.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('theme blue tokens', () => {
  const sass = readFileSync('src/assets/css/theme.sass', 'utf8')
  it.each([['hi', '#8fdcff'], ['', '#3fa4ff'], ['lo', '#2470e8']])('--bc-blue%s stays %s', (k, hex) => {
    expect(sass).toContain(`--bc-blue${k ? '-' + k : ''}: ${hex}`)
  })
})
