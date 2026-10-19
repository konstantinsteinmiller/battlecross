import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The production obfuscator rewrites string literals into array lookups, so a
 * file with `import('@/…')` that is not on its exclude list ships the bare
 * `@/…` specifier and the browser throws `Failed to resolve module specifier`.
 * Every such file must match one of the exclude patterns in vite.config.ts.
 */
const config = readFileSync('vite.config.ts', 'utf8')
const start = config.indexOf('javascriptObfuscator({')
const block = config.slice(config.indexOf('exclude: [', start), config.indexOf('\n        ],', start))
const patterns = [...block.matchAll(/^\s*\/(.+)\/,?\s*$/gm)].map(m => new RegExp(m[1]!))

const walk = (dir: string): string[] => readdirSync(dir).flatMap(n => {
  const p = join(dir, n)
  return statSync(p).isDirectory() ? walk(p) : /\.(ts|vue)$/.test(n) ? [p] : []
})
// A real call, not one in a comment.
const dynamicAlias = /^(?!\s*(\/\/|\*)).*\bimport\(\s*['"]@\//m

describe('obfuscator exclude list', () => {
  it('reads the patterns from vite.config.ts', () => {
    expect(patterns.length).toBeGreaterThan(10)
  })

  it('covers every source file that dynamic-imports through the @/ alias', () => {
    const files = walk('src').filter(f => !f.endsWith('.stub.ts') && dynamicAlias.test(readFileSync(f, 'utf8')))
    const missing = files.map(f => relative('.', f).replace(/\\/g, '/')).filter(f => !patterns.some(p => p.test(f)))
    expect(missing).toEqual([])
  })
})
