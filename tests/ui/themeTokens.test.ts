import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

/**
 * The token layer (D41). One file holds every colour the interface is drawn
 * with; a component reads tokens and never spells a hex. jsdom cannot resolve
 * a custom property, so the rule is asserted on the sources:
 *
 *   • the theme defines the ramps and surfaces the components read;
 *   • no interface component's template or style block contains a hex colour
 *     (colours that are DATA — a tier, a class, a zone's theme — live in the
 *     script as TypeScript and stay);
 *   • every `--bc-*` a component reads exists in the theme.
 */
const root = resolve(__dirname, '../..')
const read = (rel: string): string => readFileSync(join(root, rel), 'utf8')

const walk = (dir: string): string[] => readdirSync(join(root, dir)).flatMap((name) => {
  const rel = `${dir}/${name}`
  return statSync(join(root, rel)).isDirectory() ? walk(rel) : rel.endsWith('.vue') ? [rel] : []
})

/** The interface components on the tokens. */
const OWNED = [
  ...walk('src/components/atoms'),
  ...walk('src/components/molecules'),
  ...walk('src/components/organisms'),
  ...walk('src/components/game'),
  ...walk('src/components/hud'),
  'src/components/modals/ResultsModal.vue',
  'src/components/modals/PauseModal.vue',
  'src/components/modals/HelpModal.vue',
  'src/components/modals/EndingModal.vue'
].filter(f => ![
  // The boot splash mirrors the static one in index.html rule for rule
  // (`splashLogo.test.ts`), before any stylesheet has loaded.
  'src/components/atoms/FLogoProgress.vue',
  // A developer overlay, not interface.
  'src/components/atoms/FPerfMeter.vue',
  // The control-lesson layer is on its own workstream.
  'src/components/hud/CoachLayer.vue'
].includes(f))

const blocks = (src: string, tag: 'template' | 'style'): string =>
  [...src.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map(m => m[1]).join('\n')
/** Comment lines say `#114` and the like; they are not colours. */
const noComments = (s: string): string => s.split('\n').filter(l => !/^\s*(\/\/|\/\*|\*|\/\/-)/.test(l)).join('\n')
const HEX = /#[0-9a-fA-F]{3,8}\b/g

const theme = read('src/assets/css/theme.sass')
const defined = new Set([...theme.matchAll(/^\s*(--bc-[a-z0-9-]+):/gm)].map(m => m[1]))

describe('UI tokens', () => {
  it('the theme defines every ramp as hi / base / lo / deep', () => {
    for (const ramp of ['gold', 'blue', 'green', 'red', 'purple', 'pink', 'orange', 'teal', 'stone', 'brass', 'steel', 'off', 'leather']) {
      for (const step of ['-hi', '', '-lo', '-deep']) expect(defined, `--bc-${ramp}${step}`).toContain(`--bc-${ramp}${step}`)
    }
  })

  it('the theme defines the ink, the surfaces, the shape and the motion', () => {
    for (const name of [
      '--bc-ink', '--bc-paper', '--bc-paper-hi', '--bc-paper-lo', '--bc-paper-ink', '--bc-paper-ink-soft', '--bc-wood',
      '--bc-on', '--bc-on-soft', '--bc-on-accent', '--bc-cell', '--bc-rule',
      '--bc-text', '--bc-text-outline', '--bc-r-sm', '--bc-r-md', '--bc-r-lg', '--bc-r-pill',
      '--bc-ol-thin', '--bc-ol', '--bc-ol-thick', '--bc-press', '--bc-drop', '--bc-ease-bounce', '--bc-focus',
      '--bc-z-modal', '--bc-z-veil'
    ]) expect(defined, name).toContain(name)
  })

  it('the outline is the glyphs\' own ink', () => {
    expect(theme).toMatch(/--bc-ink: #1b1626/)
    expect(read('src/components/art/ArtIcon.vue')).toContain('--ol: #1b1626')
  })

  it.each(OWNED)('%s spells no hex colour in its template or style', (file) => {
    const src = read(file)
    const found = [...noComments(blocks(src, 'style')).matchAll(HEX), ...noComments(blocks(src, 'template')).matchAll(HEX)].map(m => m[0])
    expect(found, `${relative(root, join(root, file))}: ${found.join(' ')}`).toEqual([])
  })

  it.each(OWNED)('%s reads only tokens the theme defines', (file) => {
    const used = new Set([...read(file).matchAll(/var\((--bc-[a-z0-9-]+)/g)].map(m => m[1]))
    const missing = [...used].filter(n => !defined.has(n))
    expect(missing, `${file}: ${missing.join(' ')}`).toEqual([])
  })

  it('the cel mixins read only tokens the theme defines', () => {
    const cel = read('src/assets/css/cel.sass')
    const used = [...cel.matchAll(/var\((--bc-[a-z0-9-]+)\)/g)].map(m => m[1]).filter(n => !n.endsWith('-'))
    expect(used.filter(n => !defined.has(n))).toEqual([])
  })
})
