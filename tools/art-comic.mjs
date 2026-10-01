/**
 * ─── Comic pages: comic.md → Gemini → src/assets/comic/pages ────────────────
 *
 * Paints every comic page that has no image yet, through the Art Desk's Gemini
 * window (tools/art-desk: same Chrome profile, same allowance ledger, same
 * throttle from art-desk.config.json).
 *
 * For each "### Page N" (and "## Cover") in comic.md, the prompt is built from
 * the page's code block. Its first line of tags ("[STYLE] [FLUX] …") is
 * expanded into the STYLE block and the CHARACTER blocks. The reference
 * sheets for those characters (src/assets/comic/R1–R5) are attached.
 *
 *   pnpm art:comic                  paint every missing page
 *   pnpm art:comic --only 3,4       just these pages ("cover" works too)
 *   pnpm art:comic --force          repaint even if the file exists; the old
 *                                   one is archived to pages/replaced/
 *   pnpm art:comic --dry            print prompts and attachments, paint nothing
 *   pnpm art:comic --keep-window    leave the Gemini window open at the end
 *   pnpm art:comic --profile <name> paint on ~/.art-desk/profiles/<name>, another
 *                                   Google account with its own allowance and ledger
 *   pnpm art:comic --wait 12        when the account's image limit is spent,
 *                                   check again every 30 min for up to 12 h
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const COMIC_MD = join(ROOT, 'comic.md')
const REFS = join(ROOT, 'src', 'assets', 'comic')
const PAGES = join(REFS, 'pages')

// Which reference sheet shows which character (see comic.md § Reference sheets).
const SHEET = {
  FLUX: 'R1.jpg',
  MACHINES: 'R1.jpg',
  PIP: 'R2.jpg',
  ATLAS: 'R2.jpg',
  GAUSS: 'R3.jpg',
  VEX: 'R4.jpg',
  'MK-I': 'R4.jpg',
  SCRAPPER: 'R5.jpg',
  MASTERS: 'R5.jpg',
  // The second shift (the five Masters after Gale) and their machines.
  'SECOND-SHIFT': 'R6.jpg',
  'SHIFT-MACHINES': 'R6.jpg'
}
// Gemini copies designs well from a few images; past this it starts averaging.
const MAX_ATTACH = 4

const { values: opt } = parseArgs({
  options: {
    only: { type: 'string' },
    force: { type: 'boolean', default: false },
    dry: { type: 'boolean', default: false },
    'keep-window': { type: 'boolean', default: false },
    profile: { type: 'string' },
    wait: { type: 'string' }
  }
})
const WAIT_UNTIL = opt.wait ? Date.now() + Number(opt.wait) * 3600_000 : 0
const QUOTA_POLL_MS = 30 * 60_000

const rel = (p) => relative(ROOT, p).replaceAll('\\', '/')
const fence = /```[a-z]*\r?\n([\s\S]*?)```/

// ── Parse comic.md ──────────────────────────────────────────────────────────
const md = readFileSync(COMIC_MD, 'utf-8').replace(/\r\n/g, '\n')

const blockAfter = (headingRe) => {
  const m = md.match(headingRe)
  if (!m) return null
  return md.slice(m.index + m[0].length).match(fence)?.[1].trim() ?? null
}

const STYLE = blockAfter(/^## STYLE block.*$/m)
if (!STYLE) throw new Error('comic.md: no STYLE block found')

const CHARS = {}
for (const m of md.matchAll(/^\*\*\[([A-Z-]+)\]\*\*.*$/gm)) {
  CHARS[m[1]] = md.slice(m.index + m[0].length).match(fence)[1].trim()
}

const pages = []
for (const m of md.matchAll(/^(?:### Page (\d+) · (.+)|## (Cover))$/gm)) {
  const id = m[3] ? 'cover' : m[1]
  const title = m[3] ?? m[2]
  const body = md.slice(m.index + m[0].length).match(fence)[1].trim()
  const [tagLine, ...rest] = body.split('\n')
  const tags = [...tagLine.matchAll(/\[([A-Z-]+)\]/g)].map((t) => t[1])
  if (!tags.includes('STYLE')) throw new Error(`comic.md: page ${id} does not start with [STYLE]`)
  const chars = tags.filter((t) => t !== 'STYLE')
  for (const c of chars) if (!CHARS[c]) throw new Error(`comic.md: page ${id} names [${c}], which has no CHARACTER block`)
  const refs = [...new Set(chars.map((c) => SHEET[c]).filter(Boolean))].slice(0, MAX_ATTACH)
  const prompt = [
    STYLE,
    ...chars.map((c) => CHARS[c]),
    rest.join('\n').trim(),
    refs.length
      ? `ATTACHED: ${refs.length} character reference image${refs.length > 1 ? 's' : ''}. Take ONLY the character designs from them; the page layout, panels and all text come from this prompt.`
      : '',
    'OUTPUT: exactly one image, a single portrait comic page at 2:3.'
  ].filter(Boolean).join('\n\n')
  pages.push({ id, title, file: join(PAGES, id === 'cover' ? 'cover.jpg' : `P${id}.jpg`), refs: refs.map((r) => join(REFS, r)), prompt })
}

// ── Pick the queue ──────────────────────────────────────────────────────────
const only = opt.only ? new Set(opt.only.split(',').map((s) => s.trim().replace(/^p/i, '').toLowerCase())) : null
const exists = (p) => ['.jpg', '.png', '.webp'].some((ext) => existsSync(p.file.replace(/\.jpg$/, ext)))
const queue = pages.filter((p) => (only ? only.has(p.id) : true) && (opt.force || !exists(p)))

for (const p of pages) {
  const state = queue.includes(p) ? 'to paint' : exists(p) ? 'done' : 'skipped'
  console.log(`  ${state.padEnd(8)}  ${p.id.padStart(5)}  ${p.title}`)
}
for (const r of new Set(queue.flatMap((p) => p.refs))) {
  if (!existsSync(r)) throw new Error(`missing reference sheet ${rel(r)}`)
}
if (!queue.length) {
  console.log('\nNothing to paint.')
  process.exit(0)
}

if (opt.dry) {
  for (const p of queue) {
    console.log(`\n═══ ${p.id} · ${p.title} → ${rel(p.file)}\n  attach: ${p.refs.map(rel).join(', ') || '(none)'}\n\n${p.prompt}`)
  }
  process.exit(0)
}

// ── Paint ───────────────────────────────────────────────────────────────────
const { loadConfig } = await import(pathToFileURL(join(ROOT, 'tools', 'art-desk', 'config.mjs')).href)
const { Gemini } = await import(pathToFileURL(join(ROOT, 'tools', 'art-desk', 'gemini.mjs')).href)
const { ledger } = await import(pathToFileURL(join(ROOT, 'tools', 'art-desk', 'usage.mjs')).href)
const cfg = loadConfig(ROOT)
let g = cfg.gemini
if (opt.profile) {
  const { homedir } = await import('node:os')
  const profileDir = join(homedir(), '.art-desk', 'profiles', opt.profile)
  if (!existsSync(profileDir)) throw new Error(`no Gemini profile at ${profileDir}`)
  // An account of its own counts in its own ledger (the art-desk config rule).
  g = { ...g, profileDir, usageFile: join(profileDir, 'art-desk-usage.json') }
}
const { countGeneration, usedToday } = ledger(g.usageFile)
const painter = new Gemini({
  root: ROOT, profileDir: g.profileDir, url: g.url, chrome: g.chrome, chromeArgs: g.chromeArgs,
  log: (line, level) => console.log(`    ${level === 'err' ? '! ' : ''}${line}`)
})

console.log(`\npainting ${queue.length} page(s)  (${usedToday()} generations today, cap ${g.dailyCap})`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let consecutive = 0
let stopped = null
let painted = 0

for (const [i, p] of queue.entries()) {
  if (usedToday() >= g.dailyCap) { stopped = `daily cap reached (${usedToday()}/${g.dailyCap})`; break }
  if (i > 0) {
    const gap = Math.round(g.gapSeconds + Math.random() * g.jitterSeconds)
    console.log(`  … waiting ${gap} s`)
    await sleep(gap * 1000)
  }
  console.log(`  → ${p.id} · ${p.title}  (attach ${p.refs.map((r) => r.split(/[\\/]/).pop()).join(', ') || 'none'})`)
  let attempt = 0
  for (;;) {
    let last = ''
    try {
      const { bytes } = await painter.paint({
        refFile: null,
        styleFiles: p.refs,
        prompt: p.prompt,
        timeoutMs: g.timeoutSeconds * 1000,
        onPhase: (phase, quiet) => { if (!(quiet && phase === last)) { last = phase; console.log(`    ${phase}`) } }
      })
      const ext = bytes.slice(0, 4).toString('hex') === '89504e47' ? 'png' : bytes.slice(0, 2).toString('hex') === 'ffd8' ? 'jpg' : 'webp'
      const dest = p.file.replace(/\.jpg$/, `.${ext}`)
      const stem = p.file.split(/[\\/]/).pop().replace(/\.jpg$/, '')
      // A repainted page is archived, never overwritten: the old one may be the better one.
      for (const old of readdirSync(PAGES)) {
        if (old.replace(/\.[^.]+$/, '') !== stem) continue
        const to = join(PAGES, 'replaced', `${stem}.${Date.now()}${old.slice(old.lastIndexOf('.'))}`)
        mkdirSync(dirname(to), { recursive: true })
        renameSync(join(PAGES, old), to)
      }
      writeFileSync(dest, bytes)
      countGeneration()
      console.log(`    ✓ ${rel(dest)}  ${(bytes.length / 1024).toFixed(0)} kB`)
      painted++
      consecutive = 0
      break
    } catch (e) {
      // Only an attempt that reached Gemini's painter spends the allowance.
      if (e.counted) countGeneration()
      console.log(`    ! ${p.id} failed: ${e.code ?? ''} ${e.message}`)
      if (e.code === 'QUOTA' && Date.now() + QUOTA_POLL_MS < WAIT_UNTIL) {
        console.log(`    limit spent — checking again at ${new Date(Date.now() + QUOTA_POLL_MS).toLocaleTimeString()}`)
        await painter.closeWindow().catch(() => {})
        await sleep(QUOTA_POLL_MS)
        continue
      }
      if (['QUOTA', 'SIGNED_OUT', 'CONSENT'].includes(e.code)) { stopped = `${e.code}: ${e.message}`; break }
      if (++attempt <= g.retries && ['NO_IMAGE', 'TIMEOUT'].includes(e.code)) { console.log('    re-rolling once'); continue }
      consecutive++
      break
    }
  }
  if (stopped) break
  if (consecutive >= g.maxConsecutiveFailures) { stopped = `${consecutive} failures in a row`; break }
}

if (!opt['keep-window']) await painter.closeWindow().catch(() => {})
console.log(`\n${painted} of ${queue.length} page(s) painted${stopped ? ` — stopped: ${stopped}` : ''}`)
process.exit(stopped ? 1 : 0)
