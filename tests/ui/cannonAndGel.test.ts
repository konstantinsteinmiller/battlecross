// ─── Flux carries a cannon and heals with repair gel ─────────────────────────
//
// "Buster", "Giga Buster" and "Repair Tank" were MegaMan's words (Mega Buster,
// E-Tank). The game now says what Flux actually carries: his right forearm is
// a plasma CANNON, the skill that holds a charge past full is OVERCHARGE, and
// the lab patches him up with Gauss's REPAIR GEL (the lore's own name for it,
// story.md). The store copy already said "cannon".
//
// Only VALUES changed. The keys (`slot.buster`, `board.buster`, `item.arm_*`,
// `skill.giga`, `skill.tankCap`, `workshop.tankName`, `defeat.useTank` …) are
// read by the code and stay, like the save's slot and item ids, so no save
// needs migrating.
//
// Every shipped locale is checked: nothing still uses its old rendering of
// either term, the keys that name the weapon carry that language's word for
// the cannon, and the keys that name the heal carry its word for the gel.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'
import { LANGUAGES } from '@/utils/enums'

type Messages = Record<string, unknown>
const load = async (code: string): Promise<Messages> =>
  (await import(`../../src/i18n/locales/${code}.ts`)).default as Messages
const at = (m: Messages, path: string): unknown =>
  path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], m)
const str = (m: Messages, path: string): string => {
  const v = at(m, path)
  expect(typeof v, `${path} is not a string`).toBe('string')
  return (v as string).normalize('NFC')
}
const allStrings = (o: unknown, path = ''): Array<[string, string]> =>
  typeof o === 'string'
    ? [[path, o.normalize('NFC')]]
    : o && typeof o === 'object'
      ? Object.entries(o).flatMap(([k, v]) => allStrings(v, path ? `${path}.${k}` : k))
      : []
const has = (text: string, stem: string): boolean => text.toLowerCase().includes(stem.toLowerCase())

/** The keys that name the arm weapon (and the two screen-reader lessons that
 *  mention it). */
const CANNON_KEYS = [
  'slot.buster', 'board.buster',
  'item.arm_standard', 'item.arm_rapid', 'item.arm_heavy', 'item.arm_quick', 'item.arm_nova',
  'lesson.charge', 'hubLesson.upgradeBuster'
]
/** The keys that name the heal. */
const GEL_KEYS = [
  'combat.tank', 'tips.tank', 'loot.tank', 'defeat.useTank', 'pause.keys.slide',
  'hero.stat.tanks', 'workshop.tankName', 'skill.tankCap.name', 'skill.tankCap.desc'
]

/** Each language's word for the cannon (a stem, so inflected forms count). */
const CANNON: Record<string, string> = {
  en: 'cannon', de: 'kanone', es: 'cañón', fr: 'canon', it: 'cannone', pt: 'canhão', nl: 'kanon',
  pl: 'dział', tr: 'top', id: 'meriam', vi: 'pháo', ru: 'пушк', uk: 'гармат', kk: 'зеңбіре',
  uz: 'toʻp', ja: 'キャノン', ko: '캐논', th: 'ปืนใหญ่', hi: 'तोप', ar: 'مدفع', zh: '臂炮',
  'pt-PT': 'canhão', 'zh-TW': '臂砲', sv: 'kanon', nb: 'kanon', da: 'kanon', fi: 'tykk', ca: 'canó', gl: 'canón',
  az: 'top', cs: 'děl', hr: 'top', ro: 'tun', hu: 'ágyú', lv: 'lielgabal', lt: 'patrank', eo: 'kanon',
  el: 'κανόν', bg: 'оръди'
}
/** …and for the gel (Portuguese pluralises it to "géis"). */
const GEL: Record<string, string[]> = {
  en: ['gel'], de: ['gel'], es: ['gel'], fr: ['gel'], it: ['gel'], pt: ['gel', 'géis'], nl: ['gel'],
  pl: ['żel'], tr: ['jel'], id: ['gel'], vi: ['gel'], ru: ['гел'], uk: ['гел'], kk: ['гел'],
  uz: ['gel'], ja: ['ジェル'], ko: ['젤'], th: ['เจล'], hi: ['जेल'], ar: ['جل'], zh: ['凝胶'],
  'pt-PT': ['gel', 'géis'], 'zh-TW': ['凝膠'], sv: ['gel'], nb: ['gel'], da: ['gel'], fi: ['geel'], ca: ['gel'],
  gl: ['xel'], az: ['gel'], cs: ['gel'], hr: ['gel'], ro: ['gel'], hu: ['zselé'], lv: ['gel'], lt: ['gel'],
  eo: ['ĝel'], el: ['τζελ'], bg: ['гел']
}

/** Words no locale may use again: MegaMan's, in Latin script. */
const BANNED_EVERYWHERE = /buster|repair tank|e-?tank|giga/i
/** How each language rendered the old terms, which must be gone too. */
const OLD: Record<string, RegExp> = {
  de: /reparaturtank|tankkapazität/i,
  es: /tanque/i,
  fr: /\bkits?\b/i,
  it: /\bkit\b/i,
  pt: /\bkits?\b/i,
  nl: /reparatietank|tankcapaciteit/i,
  pl: /zestaw/i,
  tr: /\bkit/i,
  // A whole word: "tangkis" is parry.
  id: /\btangki\b/i,
  vi: /bình sửa chữa|sức chứa bình/i,
  ru: /бластер|ремкомплект|гига/i,
  uk: /бластер|ремкомплект|гіга/i,
  kk: /бластер|жиынты|гига/i,
  uz: /blaster|toʻplam/i,
  ja: /バスター|缶|ギガ/,
  ko: /버스터|탱크/,
  th: /บัสเตอร์|ถัง|กิกะ/,
  hi: /बस्टर|टैंक|गीगा/,
  ar: /خزان|جيجا/,
  zh: /罐|超载臂炮/
}

describe('the English source', () => {
  it('names the weapon, the skill and the heal', () => {
    expect(en.slot.buster).toBe('Cannon')
    expect(en.board.buster).toBe('Cannon')
    expect(en.item.arm_standard).toBe('Standard Cannon')
    expect(en.skill.giga.name).toBe('Overload')
    expect(en.workshop.tankName).toBe('Repair Gel')
    expect(en.defeat.useTank).toBe('Reboot with Repair Gel ({n})')
  })

  it('keeps every key the code reads (values changed, not keys)', () => {
    for (const k of [...CANNON_KEYS, ...GEL_KEYS, 'skill.giga.name', 'skill.giga.desc', 'workshop.tankDesc']) {
      expect(typeof at(en, k), k).toBe('string')
    }
  })
})

describe('every locale says cannon and repair gel', () => {
  it.each(LANGUAGES)('%s: no old word is left anywhere', async (code) => {
    const strings = allStrings(await load(code))
    const stale = strings.filter(([, v]) => BANNED_EVERYWHERE.test(v) || (OLD[code]?.test(v) ?? false))
    expect(stale).toEqual([])
  })

  it.each(LANGUAGES)('%s: the weapon keys name the cannon', async (code) => {
    const m = await load(code)
    const word = CANNON[code]
    expect(word, `no cannon word listed for ${code}`).toBeTruthy()
    const missing = CANNON_KEYS.filter((k) => !has(str(m, k), word!))
    expect(missing).toEqual([])
  })

  it.each(LANGUAGES)('%s: the heal keys name the gel', async (code) => {
    const m = await load(code)
    const words = GEL[code]
    expect(words, `no gel word listed for ${code}`).toBeTruthy()
    const missing = GEL_KEYS.filter((k) => !words!.some((w) => has(str(m, k), w)))
    expect(missing).toEqual([])
  })

  it.each(LANGUAGES)('%s: the Overload skill is its own name, not a kind of cannon', async (code) => {
    const m = await load(code)
    const name = str(m, 'skill.giga.name')
    expect(name.trim().length).toBeGreaterThan(2)
    expect(has(name, CANNON[code]!)).toBe(false)
    if (code !== 'en') expect(name).not.toBe(en.skill.giga.name)
  })
})

// ─── The store copy ──────────────────────────────────────────────────────────

const ROOT = resolve(__dirname, '../..')
const read = (rel: string): string => readFileSync(join(ROOT, rel), 'utf8')
const markdownUnder = (rel: string): string[] => {
  const out: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(join(ROOT, dir))) {
      const p = `${dir}/${name}`
      if (statSync(join(ROOT, p)).isDirectory()) walk(p)
      else if (name.endsWith('.md')) out.push(p)
    }
  }
  walk(rel)
  return out
}

describe('the store copy uses the same words', () => {
  const html = read('index.html')
  const meta = /<meta name="description" content="([^"]*)">/.exec(html)?.[1] ?? ''
  const manifest = JSON.parse(read('public/manifest.json')) as { description: string }
  const docs: Array<[string, string]> = [
    ['index.html meta description', meta],
    ['manifest description', manifest.description],
    ...['description.md', ...markdownUnder('store-art')].map((f): [string, string] => [f, read(f)])
  ]

  it.each(docs)('%s never says Buster or Repair Tank', (_, text) => {
    expect(text.length).toBeGreaterThan(0)
    expect(text).not.toMatch(/buster|repair tank|e-?tank/i)
  })
})

// The store's desktop controls must match the game (`engine/input.ts`): left
// click shoots, Space (or Q) slides. description.md once said Space shoots.
describe('the store copy states the desktop controls the game has', () => {
  const flat = (f: string) => read(f).replace(/\s+/g, ' ')
  it.each(['description.md', 'store-art/playgama/game-form.md', 'store-art/playgama/wrap/content.md'])('%s', (f) => {
    const text = flat(f)
    expect(text).not.toMatch(/space[^.;]{0,20}\b(shoot|fire)/i)
    expect(text).toMatch(/left click:? shoots?/i)
    expect(text).toMatch(/space(?: or q)?:? slides?/i)
  })
})

// Generated leaderboard names ("Cannon482913") are player-facing too. Read from
// the source, so the save layer behind the module is never loaded here.
describe('anonymous leaderboard names', () => {
  const src = read('src/use/usePlayerIdentity.ts')
  const words = [...(/const ANON_WORDS = \[([\s\S]*?)\]/.exec(src)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]!)

  it('draw from android words, none of them MegaMan\'s, none long enough to be cut', () => {
    expect(words.length).toBeGreaterThan(5)
    expect(words.filter((w) => /^(buster|mega\w*|rock(man)?)$/i.test(w))).toEqual([])
    expect(words.filter((w) => w.length > 9)).toEqual([])
  })
})
