import { ICON_ART, ITEM_ART, PORTRAIT_ART, SKILL_ART, UI_ART } from './overrides'
import { profile, isFreshProfile, needsHeroChoice } from '../state/profile'
import { HERO_GENDERS, heroOutfit, heroPortraitId } from '../art/heroPortrait'
import { TOWNS, type TownId } from '../data/zones'
import { CLASS_IDS, skillsOf, type ClassId } from '../data/skills'
import { idleTask, rerankIdle } from '@/utils/idleQueue'

/**
 * ─── Painted images, by when they are needed (roadmap #36) ───────────────────
 *
 * The painted files (`overrides.ts`) are plain `<img>`s, so by default each is
 * requested the moment its component mounts. The HUD mounts as the first
 * scene is shown, which on a phone's network made its glyphs, the coin, the
 * hero's portrait and the skill icons arrive a beat AFTER the scene (pop-in,
 * measured at 4G: 4–9 images, 30–95 ms late). So:
 *
 *   CRITICAL — what the first scene shows: fetched and DECODED while the
 *   loader builds the place (the network is idle then: the build is CPU), and
 *   the loader does not clear before they are (`awaitCritical`, capped).
 *   LIKELY — what the player can reach from here, in the order he is likely
 *   to reach it: fetched one at a time on a slow drip once the scene is
 *   playing (`prefetchLikely`), so a window opened later finds its art warm.
 *   Everything else (other towns' people, items not owned, other classes'
 *   skills) is left to the moment it is shown.
 *
 * A warmed image is held (`held`), so its decoded pixels are not dropped
 * before the `<img>` that wants them is created.
 */

const warm = new Map<string, Promise<void>>()
const held: HTMLImageElement[] = []

/** Fetch and decode one image (once). Never rejects. */
export const warmImage = (url: string | undefined): Promise<void> => {
  if (!url || typeof Image === 'undefined') return Promise.resolve()
  const hit = warm.get(url)
  if (hit) return hit
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  held.push(img)
  const p = (typeof img.decode === 'function' ? img.decode() : Promise.resolve()).catch(() => { /* a broken file keeps its vector fallback */ })
  warm.set(url, p)
  return p
}

/** Has this image been asked for already (warm or warming)? */
export const isWarm = (url: string): boolean => warm.has(url)

const byPrefix = (m: Map<string, string>, ...prefixes: string[]): string[] =>
  [...m].filter(([k]) => prefixes.some(p => k.startsWith(p))).map(([, v]) => v)

const skillArt = (ids: Iterable<string>): string[] => [...ids].map(id => SKILL_ART.get(id)).filter((u): u is string => !!u)

/** The hero's painted portrait as dressed now (the HUD's frame). */
const heroPortrait = (): string | undefined =>
  PORTRAIT_ART.get(heroPortraitId(heroOutfit(profile.inv.equipped), profile.hero.gender))

/** The HUD's own painted glyphs (top bar, flasks), on every scene. Taken from
 *  what the HUD requests as it mounts (measured: `PERF-LEDGER.md`); a glyph
 *  missing here is only requested later, as before. */
const HUD_GLYPHS = ['ui-pause', 'ui-sound', 'ui-help', 'mark-potion-health', 'mark-potion-mana']
/** The menu buttons (map, hero, book, bag), there once they are revealed. */
const MENU_GLYPHS = ['ui-map', 'ui-hero', 'ui-book', 'ui-bag']
/** The pins over a town's people: talk / quest, a smith's anvil, a peddler's
 *  gem, a trainer's book, the healer's flask. */
const PIN_GLYPHS = ['ui-chat', 'ui-anvil', 'ui-gem', 'ui-book', 'ui-flask', 'mark-quest']

/**
 * What the first scene shows: the HUD's glyphs (the menu's once any is
 * revealed: a save past the first fight; the pins' in a town), the coin, the
 * hero's portrait, his slotted skills; on a brand-new save the hero choice's
 * portraits.
 */
export const criticalImages = (node?: string): string[] => {
  const town = node !== undefined && node in TOWNS
  const glyphs = [...HUD_GLYPHS, ...(needsHeroChoice() ? [] : MENU_GLYPHS), ...(town ? PIN_GLYPHS : [])]
  const out = [
    ...glyphs.map(g => ICON_ART.get(g)),
    UI_ART.get('coin'),
    heroPortrait(),
    ...skillArt(profile.hero.active.filter(Boolean))
  ]
  if (needsHeroChoice()) for (const g of HERO_GENDERS) out.push(PORTRAIT_ART.get(heroPortraitId('tunic', g)))
  return [...new Set(out.filter((u): u is string => !!u))]
}

/** Start warming the critical images; resolves when all are decoded or `capMs` passed. */
/** Where the boot opens (the same rule as `flow.createBootMode`): the plains
 *  for a new save, else the town he saved in, else Sunford. */
export const bootNode = (): string =>
  isFreshProfile() ? 'plains' : profile.world.at in TOWNS ? profile.world.at : 'sunford'

export const awaitCritical = (node: string = bootNode(), capMs = 2500): Promise<void> =>
  Promise.race([
    Promise.all(criticalImages(node).map(warmImage)).then(() => {}),
    new Promise<void>((resolve) => setTimeout(resolve, capMs))
  ])

/**
 * What the player can reach from `node`, most likely first. In a town: the
 * people here (their portraits speak in every conversation), the trade
 * table's backdrop, the map (he leaves a town by it), the book's own art,
 * then the other glyphs and the learned skills. In a zone: the glyphs first (a status shows on his frame in the first
 * fight), the bag and the book (opened after a fight), then the map (also
 * fetched at once when the zone is won).
 */
export const likelyImages = (node: string): string[] => {
  const town = (TOWNS as Record<string, (typeof TOWNS)[TownId] | undefined>)[node]
  const people = town ? town.npcs.map(n => PORTRAIT_ART.get(n.look)) : []
  const bag = [...new Set([...profile.inv.items, ...Object.values(profile.inv.equipped)])].filter((x): x is string => !!x).map(id => ITEM_ART.get(id))
  const glyphs = byPrefix(ICON_ART, 'ui-', 'mark-', 'status-', 'slot-', 'class-')
  const book = [UI_ART.get('bg-inventory'), ...bag, UI_ART.get('bg-skills'), ...skillArt(profile.hero.learned)]
  // In a town the book's own art (its backdrop, the slots' glyphs, the bag, the
  // slotted skills) comes before the rest of the glyphs: behind ~60 of them it
  // was still arriving 12 s into a visit on a phone link (roadmap #142).
  const bookFirst = [UI_ART.get('bg-inventory'), ...byPrefix(ICON_ART, 'slot-'), ...bag, UI_ART.get('bg-skills'), ...skillArt(profile.hero.active.filter(Boolean))]
  // The book's two backdrops and the skill book's class emblems lead in a
  // town, with the whole tree the skill book opens on: they landed past the panels' 300 ms
  // hold behind the town's own pictures (D149).
  const bookArt = [UI_ART.get('bg-inventory'), UI_ART.get('bg-skills'), ...byPrefix(ICON_ART, 'class-'), ...skillArt(skillsOf(bookClass()).map(sk => sk.id))]
  const out = town
    ? [...bookArt, ...people, UI_ART.get('bg-trade'), UI_ART.get('map'), ...bookFirst, ...glyphs, ...book]
    : [...glyphs, ...book, UI_ART.get('map')]
  return [...new Set(out.filter((u): u is string => !!u))].filter(u => !warm.has(u))
}

let dripping: Array<ReturnType<typeof setTimeout>> = []
let queue: string[] = []
/** Two requests in flight: a round trip, not the bandwidth, is what a drip of
 *  small files waits on. */
const LANES = 2

/**
 * Fetch and decode `likelyImages(node)` two at a time, `gapMs` apart, after
 * `delayMs`: a slow drip that never competes with a frame for long (each
 * decode runs off the main thread). A new place restarts the queue in its own
 * order; what is already warm is skipped.
 */
export const prefetchLikely = (node: string, delayMs = 2000, gapMs = 60): void => {
  if (typeof window === 'undefined') return
  queue = likelyImages(node)
  for (const t of dripping) clearTimeout(t)
  dripping = []
  const next = (): void => {
    const url = queue.shift()
    if (!url) return
    void warmImage(url).then(() => { dripping.push(setTimeout(next, gapMs)) })
  }
  for (let i = 0; i < LANES; i++) dripping.push(setTimeout(next, delayMs))
}

/** Put one image at the head of the queue (the map's art when a zone is won). */
export const prefetchNow = (url: string | undefined): void => { void warmImage(url) }

// ─── The early art, on the idle queue (roadmap #142, D149) ───────────────────

/** The glyphs of what opens right after the first fights: the level-up chip
 *  and the points to spend (plus, star), every window's close, the shield of
 *  an equipped piece, the book's and the bag's own buttons. */
const EARLY_GLYPHS = ['ui-plus', 'ui-close', 'ui-shield', 'ui-star', 'ui-check', 'ui-lock', 'ui-hero', 'ui-book', 'ui-bag', 'ui-back', 'ui-info']

/** The class the skill book opens on (`SkillsPage.vue`): the one he knows most of. */
const bookClass = (): ClassId => {
  const known = new Set(profile.hero.learned)
  const n = (c: ClassId): number => skillsOf(c).filter(sk => known.has(sk.id)).length
  return [...CLASS_IDS].sort((a, b) => n(b) - n(a))[0] ?? 'aegis'
}

/**
 * What a new hero opens right after his first fights, most needed first: the
 * glyphs above, the character sheet (its backdrop, the slots, both portraits
 * the sheet shows), the bag (its backdrop and what he carries), the skill
 * book (its backdrop, the class emblems and the WHOLE tree of the class it
 * opens on, unlearned skills included: they are what a level-up shows). The
 * windows' ornaments are not here: `components/art/ornaments.ts` loads them
 * before the app mounts.
 */
export const earlyImages = (): string[] => {
  const bag = [...new Set([...profile.inv.items, ...Object.values(profile.inv.equipped)])].filter((x): x is string => !!x).map(id => ITEM_ART.get(id))
  const out = [
    ...EARLY_GLYPHS.map(g => ICON_ART.get(g)),
    UI_ART.get('bg-inventory'),
    ...byPrefix(ICON_ART, 'slot-'),
    heroPortrait(),
    ...HERO_GENDERS.map(g => PORTRAIT_ART.get(heroPortraitId(heroOutfit(profile.inv.equipped), g))),
    ...bag,
    UI_ART.get('bg-skills'),
    ...skillArt(skillsOf(bookClass()).map(sk => sk.id)),
    ...byPrefix(ICON_ART, 'class-')
  ]
  return [...new Set(out.filter((u): u is string => !!u))]
}

/** The idle queue's key of a warmed image. */
export const artTask = (url: string): string => `art:${url}`

/** Where the early art sits on the queue: after the screens' chunks, and at
 *  its head once the first boss is up (`queueEarlyArt(true)`). */
const EARLY_RANK = 40
const BOSS_RANK = 1

/**
 * Put the early art on the background queue (`utils/idleQueue.ts`) as QUIET
 * tasks: one image after another, only while the connection is idle, so none
 * of it competes with what the scene or a window is loading. Called once the
 * first frame is up, and again (`atBoss`) when a first-time player's first
 * boss fight starts: the fight is all CPU, and what follows it (the level-up,
 * the loot, the book) is exactly this art, so it moves to the head of the queue.
 */
export const queueEarlyArt = (atBoss = false): void => {
  const rank = atBoss ? BOSS_RANK : EARLY_RANK
  const urls = earlyImages().filter(u => !warm.has(u))
  urls.forEach((u, i) => idleTask(artTask(u), () => warmImage(u), rank + i / 1000, { quiet: true }))
  if (atBoss) rerankIdle(Object.fromEntries(urls.map((u, i) => [artTask(u), rank + i / 1000])))
}

/** Test seam. */
export const __resetPreload = (): void => {
  warm.clear()
  held.length = 0
  queue = []
  for (const t of dripping) clearTimeout(t)
  dripping = []
}
