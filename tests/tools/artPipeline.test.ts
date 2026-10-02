// @vitest-environment node
//
// ─── The art pipeline: manifest, prompts, slicer ────────────────────────────
//
// `src/game/art/artSheet.ts` decides what a painter can replace and what the
// painter is told; `tools/slice-sheets.mjs` cuts the return into the files the
// game loads by name. Every failure this pins is a SILENT one in practice:
//
//   1. a drawable the manifest forgot simply keeps drawing itself, and a
//      target outside the override folders is a file nothing ever loads;
//   2. the Art Desk sends what it parses back out of `PROMPTS-*.md`, so a
//      block that does not parse to exactly the builder's text is a sheet
//      painted from text nobody wrote (the parity test);
//   3. a half-copied prompt still generates something (the fence test);
//   4. four item sheets share one shape, so a painting matched by shape or by
//      a loose name is twelve good icons cut over twelve others.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ITEMS } from '@/game/data/items'
import { CLASSES, CLASS_IDS, SKILLS, skillsOf } from '@/game/data/skills'
import {
  ART_CATALOGUE, BACKGROUND, CELL, FINISH, GLOW, ICON_FILL, NOTATION, READABLE, SCENERY, SKILL_FINISH_REFS, SEE_THROUGH, SETS, SINGLES, STYLE_BACKDROP, STYLE_GREY, STYLE_PART, TALL,
  allStems, artTarget, fitsOfIndex, manifestTargets, panelHeight, promptBlocks, promptDocs, sheetIndex, sheetSize, type Fits
} from '@/game/art/artSheet'

const ROOT = resolve(__dirname, '..', '..')
const load = async <T = any>(...parts: string[]): Promise<T> => await import(pathToFileURL(join(ROOT, ...parts)).href)

const cellsOf = (stem: string) => {
  const s = [...SETS, ...SINGLES].find(x => x.stem === stem)
  if (!s) throw new Error(`no sheet ${stem}`)
  return s.cells
}
const idsOf = (stem: string): string[] => cellsOf(stem).flatMap(c => (c ? [c.id] : []))
const blanksOf = (stem: string): number => cellsOf(stem).filter(c => !c).length

/** Fits as the bench would measure them: one per panel, three decimals. */
const fakeFits = (): Fits => Object.fromEntries([...manifestTargets().keys()]
  .filter(t => !SCENERY.some(a => a.target === t))
  .map((t, i) => [t, { h: 0.5 + (i % 7) * 0.031, w: 0.4 + (i % 5) * 0.043, bottom: 0.82, cx: 0.5 }]))

describe('the manifest covers the game', () => {
  const targets = manifestTargets()

  it('every item has a panel: 44 ids on four 4x3 sheets, in items.ts order', () => {
    const main = ITEMS.filter(i => i.slot === 'main').map(i => i.id)
    const bySlot = (slot: string): string[] => ITEMS.filter(i => i.slot === slot).map(i => i.id)
    expect(ITEMS).toHaveLength(44)
    expect(idsOf('sheet-items-weapons')).toEqual(main.slice(0, 12))
    expect(idsOf('sheet-items-arms')).toEqual([...main.slice(12), ...bySlot('off')])
    expect(idsOf('sheet-items-armor')).toEqual(bySlot('body'))
    expect(idsOf('sheet-items-trinkets')).toEqual(bySlot('trinket'))
    expect([blanksOf('sheet-items-weapons'), blanksOf('sheet-items-arms'), blanksOf('sheet-items-armor'), blanksOf('sheet-items-trinkets')]).toEqual([0, 2, 0, 2])
    for (const it of ITEMS) expect(targets.has(`images/items/${it.id}.webp`), it.id).toBe(true)
    expect([...ART_CATALOGUE.items].sort()).toEqual(ITEMS.map(i => i.id).sort())
  })

  it('every skill has a panel: 48 ids, one 3x2 sheet per class, in unlock order, in the class colour', () => {
    expect(SKILLS).toHaveLength(48)
    for (const cls of CLASS_IDS) {
      const stem = `sheet-skills-${cls}`
      const want = skillsOf(cls)
      expect(idsOf(stem), stem).toEqual(want.map(s => s.id))
      expect(want.map(s => s.level), `${cls} unlock order`).toEqual([...want.map(s => s.level)].sort((a, b) => a - b))
      const sheet = SETS.find(s => s.stem === stem)!
      expect(sheet.accent?.hex).toBe(CLASSES[cls].color)
      // A passive is clipped to a circle in the game, and its panel says so.
      for (const c of sheet.cells) expect(!!c!.round, c!.id).toBe(want.find(s => s.id === c!.id)!.kind === 'passive')
    }
    for (const s of SKILLS) expect(targets.has(`images/skills/${s.id}.webp`), s.id).toBe(true)
    expect([...ART_CATALOGUE.skills].sort()).toEqual(SKILLS.map(s => s.id).sort())
  })

  it('every speaker portrait has a panel, and the hero and the void lord have none', () => {
    expect(idsOf('sheet-portraits-town')).toEqual(['smith', 'peddler', 'elder', 'healer', 'goblinTrader', 'captain', 'fence', 'dwarf', 'tinker'])
    expect(idsOf('sheet-portraits-trainers')).toEqual(['trainerAegis', 'trainerShadow', 'trainerPyro', 'trainerSovereign', 'trainerChrono', 'trainerBlood', 'trainerAether', 'trainerGeo'])
    expect(idsOf('sheet-portraits-speakers')).toEqual(['goblinKing', 'warlord', 'oracle', 'dragon', 'archDemon'])
    expect([blanksOf('sheet-portraits-town'), blanksOf('sheet-portraits-trainers'), blanksOf('sheet-portraits-speakers')]).toEqual([0, 1, 1])
    // Decisions: the hero's portrait follows the gear worn; voidLord never speaks.
    for (const id of ['hero', 'voidLord']) expect(targets.has(`images/portraits/${id}.webp`), id).toBe(false)
    expect(ART_CATALOGUE.portraits).toHaveLength(22)
  })

  it('the coin, the map and the ground are there, at their sizes', () => {
    expect(idsOf('single-ui-coin')).toEqual(['coin'])
    expect(SINGLES[0]!.maxEdge).toBe(64)
    expect(SCENERY.map(a => [a.stem, a.width, a.height, a.target, a.bg, a.tileable])).toEqual([
      ['bg-ui-map', 1376, 768, 'images/ui/map.webp', 'opaque', false],
      ['bg-ground', 512, 512, 'images/textures/ground.webp', 'opaque', true]
    ])
  })

  it('every target is a file the build would load: an override folder, the exact id, no duplicates', () => {
    const config = readFileSync(join(ROOT, 'vite.config.ts'), 'utf-8')
    const folders = ['items', 'skills', 'portraits', 'ui', 'textures']
    // The folders `assetOverridesPlugin` scans; a target anywhere else is never listed.
    for (const f of folders) expect(config, f).toContain(`'public/images/${f}'`)
    const seen = new Set<string>()
    for (const s of [...SETS, ...SINGLES]) {
      for (const c of s.cells) {
        if (!c) continue
        expect(c.target, c.id).toMatch(new RegExp(`^images/(${folders.join('|')})/${c.id}\\.webp$`))
        expect(seen.has(c.target), `duplicate target ${c.target}`).toBe(false)
        seen.add(c.target)
      }
    }
    for (const a of SCENERY) {
      expect(a.target).toMatch(new RegExp(`^images/(${folders.join('|')})/[A-Za-z0-9]+\\.webp$`))
      expect(seen.has(a.target), `duplicate target ${a.target}`).toBe(false)
      seen.add(a.target)
    }
    expect(seen.size).toBe(44 + 48 + 22 + 1 + 2)
    // The catalogue `pnpm art:status` reports on is exactly what the sheets write.
    const catalogue = Object.entries(ART_CATALOGUE).flatMap(([kind, ids]) => ids.map(id => artTarget(kind as keyof typeof ART_CATALOGUE, id)))
    expect([...catalogue].sort()).toEqual([...seen].sort())
    expect(targets.size).toBe(seen.size)
  })

  it('no stem is a prefix of another, so a file name can only mean one sheet', () => {
    const stems = allStems()
    expect(new Set(stems).size).toBe(stems.length)
    for (const a of stems) for (const b of stems) if (a !== b) expect(b.startsWith(a), `${a} is a prefix of ${b}`).toBe(false)
    for (const s of stems) expect(s).toMatch(/^(sheet|single|bg)-[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('every sheet has a shape the image model offers: 4:3, 1:1 or 16:9, and nothing else', () => {
    // The model returns the shape it offers, not the one it was asked for, and
    // a return of another shape re-composes the grid. 3:2 is not offered.
    const shapes = [
      ...[...SETS, ...SINGLES].map(s => ({ stem: s.stem, ...sheetSize(s) })),
      ...SCENERY.map(a => ({ stem: a.stem, width: a.width, height: a.height }))
    ]
    expect(shapes).toHaveLength(allStems().length)
    const index = sheetIndex()
    for (const { stem, width, height } of shapes) {
      // Exactly 4:3 or 1:1. 16:9 is the model's own plate (1376 x 768), within 1 %.
      const ok = width * 3 === height * 4 || width === height || Math.abs(width / height / (16 / 9) - 1) < 0.01
      expect(ok, `${stem} is ${width}x${height} (${(width / height).toFixed(3)}:1)`).toBe(true)
      // What the slicer and the desk read says the same.
      const entry = index.sheets.find(s => s.id === stem) ?? index.scenery.find(a => a.id === stem)
      expect([entry!.width, entry!.height], stem).toEqual([width, height])
      // And so does the prompt, in its last line.
      expect(promptBlocks().find(b => b.stem === stem)!.text.split('\n').at(-1), stem).toMatch(/\((4:3|1:1|16:9)[,)]/)
    }
  })

  it('the lattice is strict: panels from the origin, no gutters, square or 256 x 288', () => {
    const size = (stem: string) => sheetSize([...SETS, ...SINGLES].find(s => s.stem === stem)!)
    expect(size('sheet-items-weapons')).toEqual({ width: 1024, height: 768 })
    expect(size('sheet-skills-blood')).toEqual({ width: 768, height: 576 })
    expect(size('sheet-portraits-town')).toEqual({ width: 768, height: 768 })
    expect(size('sheet-portraits-speakers')).toEqual({ width: 768, height: 576 })
    expect(size('single-ui-coin')).toEqual({ width: 256, height: 256 })
    for (const s of sheetIndex().sheets) {
      expect(s.cells.length).toBeGreaterThan(0)
      const set = [...SETS, ...SINGLES].find(x => x.stem === s.id)!
      // A three-by-two sheet has taller panels, so that it is 4:3; every
      // other panel is the square the drawing is measured on.
      const tall = set.cols === 3 && set.rows === 2
      expect(panelHeight(set), s.id).toBe(tall ? TALL : CELL)
      expect([s.width, s.height]).toEqual([s.cols * CELL, s.rows * panelHeight(set)])
      for (const c of s.cells) {
        expect([c.w, c.h]).toEqual([CELL, panelHeight(set)])
        expect(c.x % c.w).toBe(0)
        expect(c.y % c.h).toBe(0)
        expect(c.x + c.w).toBeLessThanOrEqual(s.width)
        expect(c.y + c.h).toBeLessThanOrEqual(s.height)
      }
      expect(s.maxEdge).toBe(s.id.startsWith('sheet-portraits') ? 256 : s.id === 'single-ui-coin' ? 64 : 192)
    }
  })

  it('the index carries the measured fits, keyed by target, and hands them back', () => {
    const fits = fakeFits()
    const index = sheetIndex(fits)
    expect(fitsOfIndex(index)).toEqual(fits)
    expect(fitsOfIndex(sheetIndex())).toBeUndefined()
    // The shape the Art Desk reads (tools/art-desk/jobs.mjs, `indexByStem`).
    for (const s of index.sheets) {
      expect(s.files.clean).toBe(`${s.id}.png`)
      for (const c of s.cells) expect(typeof c.target).toBe('string')
    }
    for (const a of index.scenery) expect(a.file).toBe(`${a.id}.png`)
  })
})

describe('what a prompt says', () => {
  const blocks = promptBlocks()
  const textOf = (stem: string): string => blocks.find(b => b.stem === stem)!.text

  it('every panel has a blurb, and no prompt names a drawable: a name is a noun, and a noun gets painted', () => {
    for (const s of [...SETS, ...SINGLES]) {
      // The heading is the operator's line and stays outside the fence.
      const body = textOf(s.stem).slice(textOf(s.stem).indexOf('\n'))
      for (const c of s.cells) {
        if (!c) continue
        expect(c.blurb.length, c.id).toBeGreaterThan(20)
        expect(body, c.id).toContain(c.blurb)
        // A look id is its role ("healer", "dwarf"), which the blurb may say;
        // an item's or a skill's id is its NAME.
        if (c.draw !== 'item' && c.draw !== 'skill') continue
        expect(body, `${s.stem} names ${c.id}`).not.toContain(c.id)
        if (c.label.includes(' ')) expect(body, `${s.stem} names ${c.label}`).not.toContain(c.label)
      }
    }
  })

  it('no blurb carries a lore noun or reads as gore', () => {
    const all = [...SETS, ...SINGLES].flatMap(s => s.cells.flatMap(c => (c ? [c] : [])))
    for (const c of all) expect(c.blurb, c.id).not.toMatch(/\b(blood|bloody|gore|wound|flesh|vein|corpse|dragon|demon|void|vampyre|vampire|titan)\b/i)
    // The Blood Alchemist is alchemy: vessels and red liquid.
    const blood = cellsOf('sheet-skills-blood').map(c => c!.blurb).join(' ')
    expect(blood).toMatch(/flask/)
    expect(blood).toMatch(/liquid/)
  })

  it('the style block has two variants that differ by the panel tail only', () => {
    const lines = STYLE_PART.split('\n')
    expect(lines).toHaveLength(12)
    expect(lines[0]).toMatch(/^STYLE — /)
    expect(lines.at(-1)).toMatch(/^· Each object floats in its own panel/)
    expect(STYLE_BACKDROP).toBe(lines.slice(0, -1).join('\n'))
    // The greyscale ground drops the bullets that describe the opposite of it,
    // and adds none of its own: one copy of the wording, not two.
    for (const l of STYLE_GREY.split('\n')) expect(lines).toContain(l)
    expect(STYLE_GREY).not.toMatch(/candy|outline|glint|chibi/)
  })

  it('every keyed sheet carries the shared clauses; effects carry four more; a backdrop has no magenta contract', () => {
    for (const s of [...SETS, ...SINGLES]) {
      const text = textOf(s.stem)
      expect(text, s.stem).toContain(STYLE_PART)
      expect(text, s.stem).toContain(BACKGROUND)
      expect(text, s.stem).toContain(GLOW)
      const effect = s.kind === 'skills'
      for (const clause of [NOTATION, FINISH, SEE_THROUGH]) expect(text.includes(clause), `${s.stem}: ${clause.slice(0, 24)}`).toBe(effect)
      // Icons are seen at 40 px, and say so; a bust is shown larger.
      expect(text.includes(READABLE), `${s.stem}: readable at 40 px`).toBe(s.kind !== 'portraits')
      // Shape first, and repeated last.
      expect(text.split('\n')[2], s.stem).toMatch(/^WHAT COMES BACK IS /)
      expect(text.split('\n').at(-1), s.stem).toMatch(/^OUTPUT: /)
    }
    for (const a of SCENERY) {
      const text = textOf(a.stem)
      expect(text, a.stem).not.toContain(BACKGROUND)
      expect(text, a.stem).not.toContain('#FF00FF')
      expect(text, a.stem).not.toContain(STYLE_PART)
      expect(text, a.stem).toContain('NO magenta anywhere')
    }
    expect(textOf('bg-ui-map')).toContain(STYLE_BACKDROP)
    expect(textOf('bg-ground')).toContain(STYLE_GREY)
    // The map: the terrain is painted (roads and bare sites included); the
    // game draws its landmarks OVER the picture, so the sites stay empty.
    expect(textOf('bg-ui-map')).toMatch(/draws every landmark, every place marker and every name OVER this picture/)
    expect(textOf('bg-ui-map')).toMatch(/keep the clearings EMPTY/)
  })

  it('a skill sheet demands painted volume, names the flat answer as wrong, and goes out with painted weapons as finish references', () => {
    // The first skill sheets came back as flat single-colour shapes while the
    // weapons, from the same style block, came back with volume.
    for (const cls of CLASS_IDS) {
      const stem = `sheet-skills-${cls}`
      const text = textOf(stem)
      expect(text, stem).toContain('PAINTED VOLUME — this is what the sheet is judged on.')
      expect(text, stem).toMatch(/a LIT side and a SHADOW side that meet along a hard edge/)
      expect(text, stem).toMatch(/A shape filled with ONE flat colour is the wrong answer/)
      expect(text, stem).toContain('The accent colour stays the dominant colour of every panel.')
      // The volume is asked for BEFORE the style block, not after it.
      expect(text.indexOf(FINISH), stem).toBeLessThan(text.indexOf(STYLE_PART))
      // "Icon" and "emblem" are a style, and it is the flat one.
      expect(text, stem).not.toMatch(/\bemblem|\bICONS?\b/)
      // A passive is cropped to a circle; the frame must not be painted.
      expect(text, stem).not.toMatch(/ROUND frame/)
      expect(text, stem).toContain('Do NOT draw a circle, ring, disc or badge around or behind it.')
      // Three finish references, then the layout reference, and the prompt says which is which.
      const block = blocks.find(b => b.stem === stem)!
      expect(block.styleRefs).toEqual(SKILL_FINISH_REFS)
      expect(text, stem).toContain('ATTACHED IMAGES — there are 4')
      expect(text, stem).toContain('The LAST image is the LAYOUT reference')
      expect(text, stem).toMatch(/They are never subjects/)
    }
    // Shipped files, by the names the build loads them under.
    expect(SKILL_FINISH_REFS).toHaveLength(3)
    for (const f of SKILL_FINISH_REFS) expect(manifestTargets().has(f.replace(/^public\//, '')), f).toBe(true)
    // Nothing else is sent with more than its own reference.
    for (const b of blocks) if (!b.stem.startsWith('sheet-skills-')) expect(b.styleRefs, b.stem).toBeUndefined()
  })

  it('a sheet says its own grid, its blanks and its measured size', () => {
    const arms = textOf('sheet-items-arms')
    expect(arms).toContain('1024 x 768 pixels (4:3)')
    expect(arms).toContain('laid out 4 across and 3 down')
    expect(arms).toContain('2 panels are BLANK')
    expect(arms).toContain('Panel 11 (row 3, column 3): BLANK')
    const pyro = textOf('sheet-skills-pyro')
    expect(pyro).toContain('768 x 576 pixels (4:3)')
    expect(pyro).not.toContain('3:2')
    // A taller panel is said, and so is what not to do with the extra height;
    // a square one is not mentioned at all.
    expect(pyro).toContain('The panels are NOT square: each is a little taller than it is wide (8:9)')
    expect(textOf('sheet-portraits-speakers')).toContain('The panels are NOT square')
    expect(arms).not.toContain('NOT square')
    // The size is a share of the PANEL, so the same drawing reads smaller in a taller one.
    expect(pyro).toContain('wider than about 84% of its panel or taller than about 75%')
    expect(textOf('sheet-skills-pyro')).toContain(`orange (about ${CLASSES.pyro.color})`)
    expect(textOf('bg-ui-map')).toContain('1376 x 768 pixels (16:9)')
    // Nominal until the bench has measured; the measured extent afterwards.
    // An icon is drawn LARGE in its panel (ICON_FILL), so that it is painted large.
    expect(ICON_FILL).toBe(0.84)
    expect(arms).toContain('wider than about 84% of its panel or taller than about 84%')
    expect(arms).toContain('Paint each one as LARGE as the reference shows it')
    // A bust keeps its box, and its prompt does not ask for more.
    expect(textOf('sheet-portraits-town')).toContain('wider than about 80% of its panel or taller than about 80%')
    expect(textOf('sheet-portraits-town')).not.toContain('Paint each one as LARGE')
    const fits: Fits = { 'images/items/woodenBuckler.webp': { h: 0.61, w: 0.47, bottom: 0.8, cx: 0.5 } }
    expect(promptBlocks(fits).find(b => b.stem === 'sheet-items-arms')!.text).toContain('wider than about 47% of its panel or taller than about 61%')
  })
})

describe('the prompt documents', () => {
  let parsePromptDoc: (text: string, doc: string) => Array<{ title: string; refName: string; target: string | null; prompt: string; doc: string }>
  beforeAll(async () => {
    ({ parsePromptDoc } = await load('tools', 'art-desk', 'jobs.mjs'))
  })

  // DESK.md, setup step 7: the proof that the automation sends exactly what
  // the manifest wrote.
  it.each([['without fits', undefined], ['with measured fits', fakeFits()]])('parity %s: every block parses back to its builder\'s text, byte for byte', (_name, fits) => {
    const docs = promptDocs(fits as Fits | undefined)
    const blocks = promptBlocks(fits as Fits | undefined)
    expect(Object.keys(docs).sort()).toEqual(['PROMPTS-ITEMS.md', 'PROMPTS-PORTRAITS.md', 'PROMPTS-SKILLS.md', 'PROMPTS-UI.md'])
    const jobs = Object.entries(docs).flatMap(([name, text]) => parsePromptDoc(text, name))
    expect(jobs).toHaveLength(blocks.length)
    expect(blocks).toHaveLength(SETS.length + SINGLES.length + SCENERY.length)
    for (const b of blocks) {
      const job = jobs.find(j => j.refName === `${b.stem}.png`)
      expect(job, b.stem).toBeTruthy()
      // The builder's text with its heading line removed.
      const cut = b.text.indexOf('\n')
      expect(job!.prompt, b.stem).toBe(b.text.slice(cut + 1).replace(/^\n+/, ''))
      expect(job!.doc).toBe(b.doc)
      expect(job!.title).toBe(b.title)
      expect(job!.target, b.stem).toMatch(/^images\//)
      // What the desk attaches BEFORE the layout reference: exactly the manifest's list.
      expect(job!.styleRefs, b.stem).toEqual([...(b.styleRefs ?? [])])
      // The heading never leaks into what is sent.
      expect(job!.prompt).not.toContain(`${b.stem}.png`)
    }
  })

  // PROMPT-ANATOMY.md, "the document the prompt lives in".
  it('fences: one heading, one opening and one closing fence per block, and nothing stray inside', () => {
    const docs = promptDocs()
    let headings = 0
    for (const [name, text] of Object.entries(docs)) {
      const lines = text.split('\n')
      let open: string | null = null
      let opened = 0
      let closed = 0
      let mine = 0
      let pendingHeading = false
      for (const line of lines) {
        if (open === null) {
          if (/^## /.test(line)) {
            expect(pendingHeading, `${name}: a heading with no block before "${line}"`).toBe(false)
            pendingHeading = true
            mine++
            // The last parenthesis ties the block to its reference image.
            expect(line, name).toMatch(/\((?:sheet|single|bg)-[a-z0-9-]+\.png → images\/[A-Za-z0-9/.]+\)$/)
            continue
          }
          const m = /^(`{3,})text$/.exec(line)
          if (m) {
            expect(pendingHeading, `${name}: a fence with no heading`).toBe(true)
            pendingHeading = false
            open = m[1]!
            opened++
            continue
          }
          expect(line.startsWith('```'), `${name}: stray fence outside a block: ${line}`).toBe(false)
        } else if (line === open) {
          open = null
          closed++
        } else {
          // Inside a block: no fence of the block's own length or longer, and no heading of the document's.
          expect(line.startsWith(open), `${name}: a fence inside a block`).toBe(false)
          expect(/^## /.test(line), `${name}: a heading inside a block`).toBe(false)
        }
      }
      expect(open, `${name}: an unclosed fence`).toBeNull()
      expect(pendingHeading, `${name}: a trailing heading with no block`).toBe(false)
      expect([opened, closed]).toEqual([mine, mine])
      headings += mine
    }
    // One block per reference.
    expect(headings).toBe(SETS.length + SINGLES.length + SCENERY.length)
  })

  it('what is exported in art-sheets/ is current with the manifest', () => {
    // `pnpm art:prompts --check`, as a test: a manifest edit that never
    // regenerated its prompts is a sheet painted from the old blurb.
    const indexFile = join(ROOT, 'art-sheets', 'sheet-index.json')
    if (!existsSync(indexFile)) return
    const index = JSON.parse(readFileSync(indexFile, 'utf-8'))
    const nominal = sheetIndex()
    expect(index.sheets.map((s: any) => s.id)).toEqual(nominal.sheets.map(s => s.id))
    expect(index.scenery.map((a: any) => a.id)).toEqual(nominal.scenery.map(a => a.id))
    expect(index.sheets.flatMap((s: any) => s.cells.map((c: any) => c.target))).toEqual(nominal.sheets.flatMap(s => s.cells.map(c => c.target)))
    for (const [name, text] of Object.entries(promptDocs(fitsOfIndex(index)))) {
      const file = join(ROOT, 'art-sheets', name)
      expect(existsSync(file), name).toBe(true)
      expect(readFileSync(file, 'utf-8').replace(/\r\n/g, '\n'), `${name} is out of date — run pnpm art:prompts`).toBe(text)
    }
  })
})

describe('the slicer knows a painting by its name, and only by its name', () => {
  let buildTargets: (index: unknown) => Array<{ id: string; stem: string; kind: string; width: number; height: number; cells: Array<{ target: string }> }>
  let identify: (file: string, targets: unknown[], forced?: string | null) => { stem: string }
  const SCRATCH = join(ROOT, 'node_modules', '.tmp', `art-pipeline-test-${process.pid}`)

  beforeAll(async () => {
    ({ buildTargets, identify } = await load('tools', 'slice-sheets.mjs'))
    mkdirSync(SCRATCH, { recursive: true })
  })
  afterAll(() => rmSync(SCRATCH, { recursive: true, force: true }))

  it('reads every sheet and backdrop out of the index', () => {
    const targets = buildTargets(sheetIndex())
    expect(targets.map(t => t.stem)).toEqual(allStems())
    expect(targets.flatMap(t => t.cells.map(c => c.target)).sort()).toEqual([...manifestTargets().keys()].sort())
  })

  it('takes the reference\'s own name, with or without a download suffix', () => {
    const targets = buildTargets(sheetIndex())
    for (const stem of allStems()) {
      expect(identify(`/somewhere/${stem}.png`, targets).stem).toBe(stem)
      expect(identify(`${stem.toUpperCase()}.JPG`, targets).stem).toBe(stem)
      expect(identify(`${stem} (1).jpg`, targets).stem).toBe(stem)
      expect(identify(`${stem}_v2.webp`, targets).stem).toBe(stem)
    }
  })

  it('refuses an unknown stem instead of matching it by shape', () => {
    const targets = buildTargets(sheetIndex())
    // Four sheets are 1024x768 and nine are 768x576: shape says nothing.
    expect(targets.filter(t => t.width === 1024 && t.height === 768)).toHaveLength(4)
    expect(targets.filter(t => t.width === 768 && t.height === 576 && t.kind === 'cells')).toHaveLength(9)
    for (const name of [
      'Gemini_Generated_Image_abc123.png', // a download nobody renamed
      'sheet-items-shields.png',           // a sheet the index does not know (yet, or any more)
      'sheet-items-arms-old.png',          // a dash continues a stem: this is another sheet's name
      'sheet-items.png',                   // a prefix of four sheets is none of them
      'weapons.png',                       // a bare id
      'ground.png',
      'coin.png',
      'old-sheet-items-weapons.png'
    ]) {
      expect(() => identify(name, targets), name).toThrow(/is not a sheet in the index/)
    }
    expect(identify('whatever.png', targets, 'sheet-items-armor').stem).toBe('sheet-items-armor')
    expect(() => identify('whatever.png', targets, 'sheet-items-shields')).toThrow(/--sheet sheet-items-shields is unknown/)
  })

  it('the command fails loudly on an unknown stem and writes nothing (no browser needed to say so)', () => {
    const indexFile = join(SCRATCH, 'sheet-index.json')
    const stray = join(SCRATCH, 'sheet-items-shields.png')
    const out = join(SCRATCH, 'out')
    writeFileSync(indexFile, JSON.stringify(sheetIndex(fakeFits())), 'utf-8')
    writeFileSync(stray, 'not even an image: it must be refused by its name')
    const run = spawnSync(process.execPath, [join(ROOT, 'tools', 'slice-sheets.mjs'), '--index', indexFile, '--out', out, stray], { cwd: ROOT, encoding: 'utf-8', timeout: 20_000 })
    expect(run.status).toBe(1)
    expect(run.stderr).toContain('sheet-items-shields.png — "sheet-items-shields.png" is not a sheet in the index')
    expect(run.stderr).toContain('never matched by shape')
    expect(run.stdout).toContain('wrote 0 file(s), 1 FAILED')
    expect(existsSync(out)).toBe(false)
  })
})

// ─── The cut itself, in the browser the slicer drives ───────────────────────
//
// The first real item sheet came back with the panel grid DRAWN IN: a pale
// magenta line (#fb51f8) around every panel. Its green is over the channel
// key's ceiling, so the lines stayed, were measured as the drawing's extent,
// and all twelve icons shipped shrunken inside a pink rectangle. Pinned here,
// on fakes built from the committed references:
//
//   1. a drawn grid in a lighter AND a darker shade of the ground is keyed
//      out: nothing opaque is left along an icon's border, and the icon is
//      the size the fill rule gives it, with or without the grid;
//   2. a grid that is NOT a shade of the ground (white) cannot shrink an icon
//      either: the boundary band is never measured;
//   3. the colours the widened key must not take survive it: the
//      Shadowblade's violet, the tier-4 purple, the alchemist's crimson.
//
// It needs Chrome (the slicer decodes and encodes there); without one the
// suite says so and skips, as the slicer itself would refuse to run.
describe('the slicer keys out a drawn panel grid without touching the palette', () => {
  const CHROME = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium'
  ].find(p => existsSync(p))
  const INDEX = join(ROOT, 'art-sheets', 'sheet-index.json')
  const SCRATCH = join(ROOT, 'node_modules', '.tmp', `art-slice-test-${process.pid}`)
  const can = !!CHROME && existsSync(INDEX)
  // The model's own 4:3 return size.
  const W = 1200
  const H = 896

  interface Px { data: Buffer; w: number; h: number }
  const read = async (dir: string, target: string): Promise<Px> => {
    // From bytes, never from a path: sharp keeps a file it opened by name
    // open, and Windows then refuses to delete the scratch folder.
    const { data, info } = await sharp(readFileSync(join(SCRATCH, dir, target))).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    return { data, w: info.width, h: info.height }
  }
  /** The solid box (alpha over 140), and how many solid pixels pass `pick`. */
  const look = (p: Px, pick: (r: number, g: number, b: number) => boolean = () => true) => {
    let x0 = p.w, y0 = p.h, x1 = -1, y1 = -1, n = 0, rim = 0
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        const i = (y * p.w + x) * 4
        if (p.data[i + 3]! <= 140) continue
        if (x < 3 || y < 3 || x >= p.w - 3 || y >= p.h - 3) rim++
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
        if (pick(p.data[i]!, p.data[i + 1]!, p.data[i + 2]!)) n++
      }
    }
    // Where the box sits, and how far its farthest solid pixel is from its middle.
    const cx = (x0 + x1 + 1) / 2
    const cy = (y0 + y1 + 1) / 2
    let far = 0
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (p.data[(y * p.w + x) * 4 + 3]! > 140) far = Math.max(far, Math.hypot(x + 0.5 - cx, y + 0.5 - cy))
      }
    }
    return { w: x1 - x0 + 1, h: y1 - y0 + 1, n, rim, cx, cy, far }
  }
  const hue = (r: number, g: number, b: number): number => {
    const mx = Math.max(r, g, b)
    const mn = Math.min(r, g, b)
    if (mx - mn < 40) return -1
    const h = mx === r ? ((g - b) / (mx - mn)) * 60 : mx === g ? 120 + ((b - r) / (mx - mn)) * 60 : 240 + ((r - g) / (mx - mn)) * 60
    return (h + 360) % 360
  }

  /** A reference at the model's size, as a JPEG, with a grid drawn along every cut. */
  const fake = async (stem: string, dir: string, cols: number, rows: number, line: string | null): Promise<void> => {
    mkdirSync(join(SCRATCH, dir), { recursive: true })
    const bars: Array<{ input: { create: { width: number; height: number; channels: 3; background: string } }; left: number; top: number }> = []
    if (line) {
      const bar = (left: number, top: number, width: number, height: number): void => {
        bars.push({ input: { create: { width, height, channels: 3, background: line } }, left: Math.max(0, left), top: Math.max(0, top) })
      }
      // 12 px across each interior cut, 6 px along the frame: what came back.
      for (let c = 1; c < cols; c++) bar(Math.round((W * c) / cols) - 6, 0, 12, H)
      for (let r = 1; r < rows; r++) bar(0, Math.round((H * r) / rows) - 6, W, 12)
      bar(0, 0, W, 6); bar(0, H - 6, W, 6); bar(0, 0, 6, H); bar(W - 6, 0, 6, H)
    }
    const base = await sharp(readFileSync(join(ROOT, 'art-sheets', `${stem}.png`))).resize(W, H, { fit: 'fill' }).png().toBuffer()
    writeFileSync(join(SCRATCH, dir, `${stem}.jpg`), await sharp(base).composite(bars).jpeg({ quality: 88 }).toBuffer())
  }
  const slice = (dir: string) => spawnSync(process.execPath, [join(ROOT, 'tools', 'slice-sheets.mjs'), '--out', join(SCRATCH, dir, 'out'), join(SCRATCH, dir)], { cwd: ROOT, encoding: 'utf-8', timeout: 120_000 })

  afterAll(() => rmSync(SCRATCH, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }))

  it.skipIf(!can)('a pale, a dark and a white grid all leave the icons whole, clean-edged and full size', async () => {
    const index = JSON.parse(readFileSync(INDEX, 'utf-8'))
    const sheet = index.sheets.find((s: any) => s.id === 'sheet-items-weapons')
    await fake('sheet-items-weapons', 'plain', 4, 3, null)
    await fake('sheet-items-weapons', 'pale', 4, 3, '#fb51f8')
    await fake('sheet-items-weapons', 'dark', 4, 3, '#b000b0')
    await fake('sheet-items-weapons', 'white', 4, 3, '#ffffff')
    const runs = Object.fromEntries(['plain', 'pale', 'dark', 'white'].map(d => [d, slice(d)]))
    for (const [d, run] of Object.entries(runs)) expect(run.status, `${d}: ${run.stderr}`).toBe(0)
    // The grid is noticed and said, not silently absorbed.
    expect(runs.plain!.stderr).not.toContain('panel edges were DRAWN IN')
    for (const d of ['pale', 'dark', 'white']) expect(runs[d]!.stderr, d).toContain('panel edges were DRAWN IN on 12 of 12 panels')

    for (const c of sheet.cells) {
      const plain = look(await read('plain', join('out', c.target)))
      // THE FILL RULE: an icon is trimmed to its own paint and scaled until
      // its longest side is 90 % of the 192 px file, centred — unless that
      // would enlarge the painting by more than a quarter, which is where it
      // stops. (It used to be registered onto the drawing's measured size,
      // and read smaller than the vector glyph it replaced.)
      const painted = Math.max(c.fit.w, c.fit.h) * (W / 4)
      const want = Math.min(0.9 * 192, 1.25 * painted)
      expect(Math.abs(Math.max(plain.w, plain.h) - want), `${c.id}: longest side ${Math.max(plain.w, plain.h)}, wanted ${want.toFixed(0)}`).toBeLessThanOrEqual(5)
      expect(Math.abs(plain.cx - 96), `${c.id} is centred across`).toBeLessThanOrEqual(2)
      expect(Math.abs(plain.cy - 96), `${c.id} is centred down`).toBeLessThanOrEqual(2)
      for (const d of ['pale', 'dark', 'white']) {
        const got = look(await read(d, join('out', c.target)))
        // No line left along the border …
        expect(got.rim, `${d}/${c.id}: opaque pixels on the border`).toBe(0)
        // … and the icon is not shrunk into the frame the line drew.
        expect(Math.abs(got.w - plain.w), `${d}/${c.id} width ${got.w} vs ${plain.w}`).toBeLessThanOrEqual(3)
        expect(Math.abs(got.h - plain.h), `${d}/${c.id} height ${got.h} vs ${plain.h}`).toBeLessThanOrEqual(3)
        expect(got.n / plain.n, `${d}/${c.id} lost paint`).toBeGreaterThan(0.97)
      }
    }
  }, 180_000)

  it.skipIf(!can)('violet, purple and crimson survive the wider key', async () => {
    // Skill sheets are 3 x 2; the armour sheet holds the tier-4 purple robe.
    await fake('sheet-skills-shadow', 'hues-plain', 3, 2, null)
    await fake('sheet-skills-blood', 'hues-plain', 3, 2, null)
    await fake('sheet-items-armor', 'hues-plain', 4, 3, null)
    await fake('sheet-skills-shadow', 'hues-grid', 3, 2, '#fb51f8')
    await fake('sheet-skills-blood', 'hues-grid', 3, 2, '#fb51f8')
    await fake('sheet-items-armor', 'hues-grid', 4, 3, '#fb51f8')
    for (const d of ['hues-plain', 'hues-grid']) { const run = slice(d); expect(run.status, `${d}: ${run.stderr}`).toBe(0) }

    const between = (lo: number, hi: number) => (r: number, g: number, b: number): boolean => { const h = hue(r, g, b); return h >= lo && h <= hi }
    const cases: Array<[string, string, (r: number, g: number, b: number) => boolean, number]> = [
      ['violet', 'images/skills/shadowstep.webp', between(240, 285), 2000],
      ['violet', 'images/skills/danceOfBlades.webp', between(240, 285), 400],
      ['purple', 'images/items/chronoWeaverCloak.webp', between(255, 290), 2000],
      ['crimson', 'images/skills/sanguineFlask.webp', (r, g, b) => { const h = hue(r, g, b); return h >= 335 || (h >= 0 && h <= 10) }, 800],
      ['crimson', 'images/skills/mutagenicRage.webp', (r, g, b) => { const h = hue(r, g, b); return h >= 335 || (h >= 0 && h <= 10) }, 4000]
    ]
    for (const [name, target, pick, floor] of cases) {
      const plain = look(await read('hues-plain', join('out', target)), pick)
      const grid = look(await read('hues-grid', join('out', target)), pick)
      // The colour is there in quantity, solid, and a drawn grid costs none of it.
      expect(plain.n, `${name} in ${target}`).toBeGreaterThan(floor)
      expect(grid.n / plain.n, `${name} in ${target} with a grid`).toBeGreaterThan(0.97)
      expect(grid.rim, `${target}: opaque pixels on the border`).toBe(0)
    }

    // A PASSIVE is shown in a round frame, so it is fitted inside the circle:
    // its farthest pixel from the middle lands at 88 % of the radius, and no
    // corner of it is cut off. An active fills the square instead.
    const index = JSON.parse(readFileSync(INDEX, 'utf-8'))
    const cells = index.sheets.find((s: any) => s.id === 'sheet-skills-shadow').cells
    expect(cells.filter((c: any) => c.round).map((c: any) => c.id)).toEqual(['lethality', 'evasion'])
    for (const c of cells) {
      const got = look(await read('hues-plain', join('out', c.target)))
      const longest = Math.max(got.w, got.h)
      if (c.round) {
        expect(got.far, `${c.id} stays inside the round frame`).toBeLessThanOrEqual(0.44 * 192 + 2)
        expect(got.far, `${c.id} is as big as the circle allows`).toBeGreaterThanOrEqual(0.44 * 192 - 4)
      } else {
        expect(Math.abs(longest - 0.9 * 192), `${c.id}: longest side ${longest}`).toBeLessThanOrEqual(5)
      }
      expect(Math.abs(got.cx - 96) + Math.abs(got.cy - 96), `${c.id} is centred`).toBeLessThanOrEqual(3)
    }
  }, 180_000)

  it.skipIf(!can)('a bust is still registered onto its drawing: full width of the frame, sitting on the bottom edge', async () => {
    await fake('sheet-portraits-speakers', 'busts', 3, 2, null)
    const run = slice('busts')
    expect(run.status, run.stderr).toBe(0)
    const index = JSON.parse(readFileSync(INDEX, 'utf-8'))
    for (const c of index.sheets.find((s: any) => s.id === 'sheet-portraits-speakers').cells) {
      const p = await read('busts', join('out', c.target))
      expect([p.w, p.h]).toEqual([256, 256])
      // The bottom row of the file is the bust's cut line: paint all the way down.
      let bottom = 0
      for (let x = 0; x < p.w; x++) if (p.data[((p.h - 2) * p.w + x) * 4 + 3]! > 140) bottom++
      expect(bottom, `${c.id} sits on the bottom edge`).toBeGreaterThan(p.w * 0.5)
      // And it is the size the reference drew it at (the fit, over the 80 % box the file keeps).
      const got = look(p)
      expect(Math.abs(got.w - (c.fit.w / 0.8) * 256), `${c.id} width ${got.w}`).toBeLessThanOrEqual(8)
    }
  }, 180_000)
})
