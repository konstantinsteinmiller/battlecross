import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * The trade table and the hero's book are on the token layer (D41), like the
 * F components (`themeTokens.test.ts` covers `components/game`): no hex
 * colour in a template or a style, and every `--bc-*` read is defined. Data
 * colours (a tier's, a class's) live in the scripts and stay. The shared
 * partials the screens `@use` are held to the same rule.
 */
const root = resolve(__dirname, '../..')
const read = (rel: string): string => readFileSync(join(root, rel), 'utf8')
const walk = (dir: string): string[] => readdirSync(join(root, dir)).flatMap((name) => {
  const rel = `${dir}/${name}`
  return statSync(join(root, rel)).isDirectory() ? walk(rel) : /\.(vue|sass)$/.test(rel) ? [rel] : []
})

const FILES = [...walk('src/components/screens/trade'), ...walk('src/components/screens/hero'), 'src/components/game/screen.sass']
const blocks = (src: string, tag: 'template' | 'style'): string =>
  [...src.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map(m => m[1]).join('\n')
const noComments = (s: string): string => s.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*|\/\/-)/.test(l)).join('\n')
const HEX = /#[0-9a-fA-F]{3,8}\b/g
const defined = new Set([...read('src/assets/css/theme.sass').matchAll(/^\s*(--bc-[a-z0-9-]+):/gm)].map(m => m[1]))

describe('the screens are on the tokens', () => {
  it('finds the screens', () => {
    expect(FILES).toEqual(expect.arrayContaining([
      'src/components/screens/trade/TradeScreen.vue', 'src/components/screens/trade/TeachScreen.vue', 'src/components/screens/trade/HealerScreen.vue',
      'src/components/screens/trade/trade.sass', 'src/components/screens/hero/HeroBook.vue', 'src/components/screens/hero/EquipmentPage.vue'
    ]))
  })

  it.each(FILES)('%s spells no hex colour in its template or style', (file) => {
    const src = read(file)
    const body = file.endsWith('.sass') ? src : `${blocks(src, 'style')}\n${blocks(src, 'template')}`
    const found = [...noComments(body).matchAll(HEX)].map(m => m[0])
    expect(found, file).toEqual([])
  })

  it.each(FILES)('%s reads only tokens the theme defines', (file) => {
    const used = new Set([...read(file).matchAll(/var\((--bc-[a-z0-9-]+)/g)].map(m => m[1]))
    expect([...used].filter(n => !defined.has(n)), file).toEqual([])
  })
})
