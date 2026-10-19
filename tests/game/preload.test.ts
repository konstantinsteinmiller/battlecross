import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('virtual:asset-overrides', () => ({
  default: {
    sfx: [], music: [], textures: [], voice: [], logo: [],
    items: ['rustedShortsword.webp', 'woodenBuckler.webp', 'ironBroadsword.webp'],
    skills: ['shieldSlam.webp', 'fireball.webp', 'meteor.webp', 'radiantStrike.webp'],
    portraits: ['hero-tunic.webp', 'hero-leather.webp', 'smith.webp', 'peddler.webp', 'captain.webp'],
    ui: ['coin.webp', 'map.webp', 'bg-inventory.webp', 'bg-skills.webp', 'bg-trade.webp'],
    icons: ['ui-pause.webp', 'ui-bag.webp', 'ui-plus.webp', 'ui-close.webp', 'ui-shield.webp', 'mark-quest.webp', 'status-burn.webp', 'slot-head.webp', 'class-aegis.webp']
  }
}))

// Images that "decode" at once.
class FakeImage {
  src = ''
  decoding = ''
  decode (): Promise<void> { return Promise.resolve() }
}

const { profile } = await import('@/game/state/profile')
const pre = await import('@/game/assets/preload')
const name = (u: string): string => u.slice(u.lastIndexOf('/') + 1)

describe('painted images by when they are needed', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', FakeImage)
    pre.__resetPreload()
    profile.inv.items = ['rustedShortsword', 'woodenBuckler']
    profile.inv.equipped = { ...profile.inv.equipped, main: 'rustedShortsword', body: null }
    profile.hero.active = ['shieldSlam', '', '', '', '', '']
    profile.hero.learned = ['shieldSlam', 'fireball']
    profile.hero.gender = 'm'
  })
  afterEach(() => vi.unstubAllGlobals())

  it('a town needs the HUD and menu glyphs, the pins, the coin, the portrait he wears and his slotted skills — nothing else', () => {
    profile.level = 6
    profile.tips.heroPicked = true
    const c = pre.criticalImages('sunford').map(name)
    expect(c).toEqual(expect.arrayContaining(['ui-pause.webp', 'ui-bag.webp', 'mark-quest.webp', 'coin.webp', 'hero-tunic.webp', 'shieldSlam.webp']))
    for (const not of ['status-burn.webp', 'map.webp', 'bg-inventory.webp', 'fireball.webp', 'smith.webp', 'rustedShortsword.webp']) expect(c).not.toContain(not)
    // A fight has no pins over anybody.
    expect(pre.criticalImages('plains').map(name)).not.toContain('mark-quest.webp')
  })

  it('a brand-new save: no menu glyphs yet (nothing revealed), the hero choice portrait instead; it opens on the plains', () => {
    profile.level = 1
    profile.story = 0
    profile.questsDone = 0
    profile.stats.runs = 0
    profile.stats.kills = 0
    delete profile.tips.heroPicked
    expect(pre.bootNode()).toBe('plains')
    const c = pre.criticalImages(pre.bootNode()).map(name)
    expect(c).toContain('hero-tunic.webp')
    expect(c).toContain('ui-pause.webp')
    expect(c).not.toContain('ui-bag.webp')
  })

  it('in a town the book backdrops and class emblems lead, then the people here, the map before the rest of the book; in a zone the book before the map', () => {
    const town = pre.likelyImages('sunford').map(name)
    // The biggest files a panel shows come first (D149): they landed past its hold.
    expect(town.slice(0, 3)).toEqual(['bg-inventory.webp', 'bg-skills.webp', 'class-aegis.webp'])
    expect(town.indexOf('smith.webp')).toBeGreaterThanOrEqual(0)
    expect(town.indexOf('smith.webp')).toBeLessThan(town.indexOf('bg-trade.webp'))
    expect(town.indexOf('map.webp')).toBeLessThan(town.indexOf('slot-head.webp'))
    // The book's own art (backdrop, slot glyphs, the bag) before the other glyphs (#142).
    expect(town.indexOf('bg-inventory.webp')).toBeLessThan(town.indexOf('status-burn.webp'))
    expect(town.indexOf('slot-head.webp')).toBeLessThan(town.indexOf('status-burn.webp'))
    expect(town.indexOf('rustedShortsword.webp')).toBeLessThan(town.indexOf('status-burn.webp'))
    // Not this town's people, not wares he does not own, not skills he has not learned.
    expect(town).not.toContain('captain.webp')
    expect(town).not.toContain('ironBroadsword.webp')
    expect(town).not.toContain('meteor.webp')
    const zone = pre.likelyImages('plains').map(name)
    expect(zone).not.toContain('smith.webp')
    expect(zone.indexOf('rustedShortsword.webp')).toBeLessThan(zone.indexOf('map.webp'))
    expect(zone).toContain('fireball.webp')
  })

  it('what is warm is not fetched again, and the drip skips it', async () => {
    await pre.awaitCritical(100)
    expect(pre.isWarm(pre.criticalImages()[0]!)).toBe(true)
    const zone = pre.likelyImages('plains')
    for (const u of pre.criticalImages()) expect(zone).not.toContain(u)
  })

  it('the early art: the level-up and window glyphs first, then the sheet, the bag and the whole tree of the class the book opens on', () => {
    const e = pre.earlyImages().map(name)
    expect(e.slice(0, 3)).toEqual(['ui-plus.webp', 'ui-close.webp', 'ui-shield.webp'])
    expect(e).toEqual(expect.arrayContaining(['bg-inventory.webp', 'slot-head.webp', 'hero-tunic.webp', 'rustedShortsword.webp', 'bg-skills.webp', 'shieldSlam.webp', 'radiantStrike.webp', 'class-aegis.webp']))
    // Unlearned skills of the book's class are in it (a level-up shows them);
    // another class's are not.
    expect(e).not.toContain('fireball.webp')
    expect(e).not.toContain('status-burn.webp')
    expect(e.indexOf('ui-close.webp')).toBeLessThan(e.indexOf('bg-inventory.webp'))
  })

  it('the early art goes on the idle queue as quiet tasks, and to its head at the first boss', async () => {
    const q = await import('@/utils/idleQueue')
    q.__resetIdleQueue()
    pre.queueEarlyArt()
    const before = q.idleWaiting()
    expect(before[0]).toBe(pre.artTask(pre.earlyImages()[0]!))
    q.idleTask('screen:x', async () => {}, 10)
    expect(q.idleWaiting()[0]).toBe('screen:x')
    pre.queueEarlyArt(true)
    expect(q.idleWaiting()[0]).toBe(pre.artTask(pre.earlyImages()[0]!))
    expect(q.idleWaiting().at(-1)).toBe('screen:x')
    q.__resetIdleQueue()
  })
})
