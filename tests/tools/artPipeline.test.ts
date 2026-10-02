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
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ITEMS } from '@/game/data/items'
import { CLASSES, CLASS_IDS, SKILLS, skillsOf } from '@/game/data/skills'
import {
  ART_CATALOGUE, BACKGROUND, CELL, FINISH, GLOW, NOTATION, SCENERY, SEE_THROUGH, SETS, SINGLES, STYLE_BACKDROP, STYLE_GREY, STYLE_PART, TALL,
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
    // The map: the game draws its markers OVER the picture.
    expect(textOf('bg-ui-map')).toMatch(/draws every place marker, every road and every name OVER this picture/)
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
    expect(pyro).toContain('wider than about 80% of its panel or taller than about 71%')
    expect(textOf('sheet-skills-pyro')).toContain(`orange (about ${CLASSES.pyro.color})`)
    expect(textOf('bg-ui-map')).toContain('1376 x 768 pixels (16:9)')
    // Nominal until the bench has measured; the measured extent afterwards.
    expect(arms).toContain('wider than about 80% of its panel or taller than about 80%')
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
