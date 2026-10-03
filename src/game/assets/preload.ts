import { ICON_ART, ITEM_ART, PORTRAIT_ART, SKILL_ART, UI_ART } from './overrides'
import { profile, isFreshProfile, needsHeroChoice } from '../state/profile'
import { HERO_GENDERS, heroOutfit, heroPortraitId } from '../art/heroPortrait'
import { TOWNS, type TownId } from '../data/zones'

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
 * table's backdrop, the map (he leaves a town by it), then the glyphs and the
 * book. In a zone: the glyphs first (a status shows on his frame in the first
 * fight), the bag and the book (opened after a fight), then the map (also
 * fetched at once when the zone is won).
 */
export const likelyImages = (node: string): string[] => {
  const town = (TOWNS as Record<string, (typeof TOWNS)[TownId] | undefined>)[node]
  const people = town ? town.npcs.map(n => PORTRAIT_ART.get(n.look)) : []
  const bag = [...new Set([...profile.inv.items, ...Object.values(profile.inv.equipped)])].filter((x): x is string => !!x).map(id => ITEM_ART.get(id))
  const glyphs = byPrefix(ICON_ART, 'ui-', 'mark-', 'status-', 'slot-', 'class-')
  const book = [UI_ART.get('bg-inventory'), ...bag, UI_ART.get('bg-skills'), ...skillArt(profile.hero.learned)]
  const out = town
    ? [...people, UI_ART.get('bg-trade'), UI_ART.get('map'), ...glyphs, ...book]
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

/** Test seam. */
export const __resetPreload = (): void => {
  warm.clear()
  held.length = 0
  queue = []
  for (const t of dripping) clearTimeout(t)
  dripping = []
}
