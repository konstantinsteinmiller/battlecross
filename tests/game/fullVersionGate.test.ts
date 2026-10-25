// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

/**
 * The iOS free demo and its one-time unlock (roadmap #Store-IAP): what is
 * locked, when the gate is on at all, how the entitlement is cached and
 * refreshed, and where the flow offers the purchase. The store itself is the
 * mocked Tauri plugin; no StoreKit runs here.
 */

const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36'

const ads = vi.hoisted(() => ({ shown: 0 }))
const store = vi.hoisted(() => ({
  calls: [] as string[],
  reply: {} as Record<string, unknown>,
  fail: false,
  listeners: [] as Array<(p: { entitled?: boolean }) => void>
}))
vi.mock('@tauri-apps/api/core', () => ({
  invoke: async (cmd: string) => {
    const name = cmd.replace('plugin:iap|', '')
    store.calls.push(name)
    if (store.fail) throw new Error('offline')
    return store.reply[name]
  },
  addPluginListener: async (_p: string, _e: string, cb: (p: { entitled?: boolean }) => void) => { store.listeners.push(cb); return {} }
}))
vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {}, reportLadder: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => { ads.shown++ } }))
vi.mock('@/use/useAdGate', () => ({
  canShowInterstitial: () => true, markInterstitialShown: () => {}, isRewardGated: true,
  canOfferReward: { value: false }, claimReward: async () => false
}))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: () => {} }))

const setUa = (ua: string): void => {
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true })
}
/** The iOS store build: the flags plus an Apple device. */
const iosBuild = (): void => {
  vi.stubEnv('VITE_APP_NATIVE', 'true')
  vi.stubEnv('VITE_APP_IAP_UNLOCK', 'true')
  setUa(IOS_UA)
}

type Gate = typeof import('@/use/useFullVersion')
type State = typeof import('@/use/useGameState')
let gate: Gate
let state: State

const load = async (): Promise<void> => {
  drainAndResetModules()
  state = await holdGameState()
  gate = await import('@/use/useFullVersion')
}

beforeEach(() => {
  store.calls.length = 0
  store.reply = {}
  store.fail = false
  store.listeners.length = 0
  ads.shown = 0
})
afterEach(() => {
  drainPersist()
  vi.unstubAllEnvs()
  setUa('Mozilla/5.0 (jsdom)')
})

describe('what the demo locks', () => {
  it('every map node is either demo content or locked: none slips past the lock', async () => {
    const d = await import('@/game/data/fullVersion')
    expect(d.unclassifiedNodes()).toEqual([])
    for (const n of d.DEMO_NODES) expect(d.isLockedNode(n)).toBe(false)
  })

  it('the demo is the town, the plains, the Hollows and the colosseum; the road on is locked', async () => {
    const d = await import('@/game/data/fullVersion')
    expect([...d.DEMO_NODES].sort()).toEqual(['arena', 'hollows', 'plains', 'sunford'])
    for (const n of ['woods', 'silverbridge', 'crags', 'temple', 'fortress', 'rift']) expect(d.isLockedNode(n)).toBe(true)
  })

  it('a quest is locked with its zone; the Goblin King stays in the demo', async () => {
    const d = await import('@/game/data/fullVersion')
    const { QUESTS } = await import('@/game/data/quests')
    for (const q of QUESTS) expect(d.questLockedByDemo(q.node), q.id).toBe(q.id !== 'goblinKing')
  })

  it('the demo ends with any answer to the Goblin King', async () => {
    const d = await import('@/game/data/fullVersion')
    const { QUEST_BY_ID } = await import('@/game/data/quests')
    for (const c of QUEST_BY_ID.goblinKing!.choices) expect(d.demoEnded(new Set(c.flags))).toBe(true)
    expect(d.demoEnded(new Set())).toBe(false)
  })
})

describe('when the gate is on', () => {
  it('is off on a web build, whatever the device', async () => {
    setUa(IOS_UA)
    await load()
    expect(gate.gateOn.value).toBe(false)
    expect(gate.gateActive.value).toBe(false)
    expect(gate.isNodeLockedByDemo('woods')).toBe(false)
    await gate.initFullVersion()
    expect(store.calls).toEqual([])
  })

  it('is off on Android even with the shared .env.tauri flag', async () => {
    vi.stubEnv('VITE_APP_NATIVE', 'true')
    vi.stubEnv('VITE_APP_IAP_UNLOCK', 'true')
    setUa(ANDROID_UA)
    await load()
    expect(gate.gateActive.value).toBe(false)
    expect(gate.isNodeLockedByDemo('rift')).toBe(false)
    await gate.initFullVersion()
    expect(store.calls).toEqual([])
  })

  it('is off on a native build without the flag', async () => {
    vi.stubEnv('VITE_APP_NATIVE', 'true')
    vi.stubEnv('VITE_APP_IAP_UNLOCK', 'false')
    setUa(IOS_UA)
    await load()
    expect(gate.gateActive.value).toBe(false)
  })

  it('is on for the iOS store build: places beyond the Goblin King are locked, the demo is not', async () => {
    iosBuild()
    await load()
    expect(gate.gateActive.value).toBe(true)
    expect(gate.isNodeLockedByDemo('woods')).toBe(true)
    expect(gate.isNodeLockedByDemo('rift')).toBe(true)
    for (const n of ['sunford', 'plains', 'hollows', 'arena']) expect(gate.isNodeLockedByDemo(n)).toBe(false)
  })

  it('the pure rule needs all three', async () => {
    await load()
    expect(gate.iapPlatformOn(true, true, true)).toBe(true)
    expect(gate.iapPlatformOn(false, true, true)).toBe(false)
    expect(gate.iapPlatformOn(true, false, true)).toBe(false)
    expect(gate.iapPlatformOn(true, true, false)).toBe(false)
  })
})

describe('the entitlement', () => {
  it('opens the game offline from the cached purchase, and keeps it when the store cannot be asked', async () => {
    iosBuild()
    drainAndResetModules()
    state = await holdGameState()
    state.setState('bc_full_version', true)
    gate = await import('@/use/useFullVersion')
    expect(gate.isFullVersion.value).toBe(true)
    expect(gate.gateActive.value).toBe(false)
    expect(gate.isNodeLockedByDemo('woods')).toBe(false)
    store.fail = true
    await gate.initFullVersion()
    expect(gate.isFullVersion.value).toBe(true)
    expect(state.getState('bc_full_version')).toBe(true)
  })

  it('a start asks the store: a confirmed purchase is cached, a confirmed refund takes the unlock back', async () => {
    iosBuild()
    await load()
    store.reply = { get_entitlement: { supported: true, checked: true, entitled: true }, get_product: { supported: true, id: 'x', price: '2,99 €' } }
    await gate.initFullVersion()
    expect(store.calls).toContain('get_entitlement')
    expect(gate.isFullVersion.value).toBe(true)
    expect(state.getState('bc_full_version')).toBe(true)
    expect(gate.price.value).toBe('2,99 €')

    store.reply = { get_entitlement: { supported: true, checked: true, entitled: false } }
    await gate.verifyEntitlement()
    expect(gate.isFullVersion.value).toBe(false)
    expect(gate.gateActive.value).toBe(true)
  })

  it('an unchecked answer (the store could not be reached) changes nothing', async () => {
    iosBuild()
    await load()
    gate.isFullVersion.value = true
    store.reply = { get_entitlement: { supported: true, checked: false, entitled: false } }
    await gate.verifyEntitlement()
    expect(gate.isFullVersion.value).toBe(true)
  })

  it('shows the storefront price, never a hard-coded one', async () => {
    iosBuild()
    await load()
    store.reply = { get_product: { supported: true, id: 'com.hyperg8.battlecross.fullversion', price: 'CHF 2.90' } }
    expect(await gate.loadProduct()).toBe(true)
    expect(gate.price.value).toBe('CHF 2.90')
  })

  it('a purchase unlocks at once and is cached', async () => {
    iosBuild()
    await load()
    store.reply = { purchase: { supported: true, status: 'purchased', entitled: true } }
    expect(await gate.buy()).toBe(true)
    expect(gate.isFullVersion.value).toBe(true)
    expect(gate.purchaseStatus.value).toBe('thanks')
    expect(state.getState('bc_full_version')).toBe(true)
    expect(gate.isNodeLockedByDemo('woods')).toBe(false)
  })

  it('pending, cancelled and failed purchases stay locked, each with its own line', async () => {
    iosBuild()
    await load()
    store.reply = { purchase: { supported: true, status: 'pending', entitled: false } }
    expect(await gate.buy()).toBe(false)
    expect(gate.purchaseStatus.value).toBe('pending')
    store.reply = { purchase: { supported: true, status: 'cancelled', entitled: false } }
    await gate.buy()
    expect(gate.purchaseStatus.value).toBe('idle')
    store.reply = { purchase: { supported: true, status: 'failed', entitled: false, error: 'x' } }
    await gate.buy()
    expect(gate.purchaseStatus.value).toBe('failed')
    store.fail = true
    await gate.buy()
    expect(gate.purchaseStatus.value).toBe('failed')
    expect(gate.isFullVersion.value).toBe(false)
  })

  it('restore unlocks a returning buyer, and says so when nothing is found', async () => {
    iosBuild()
    await load()
    store.reply = { restore: { supported: true, checked: true, entitled: false } }
    expect(await gate.restore()).toBe(false)
    expect(gate.purchaseStatus.value).toBe('restoreNone')
    store.reply = { restore: { supported: true, checked: true, entitled: true } }
    expect(await gate.restore()).toBe(true)
    expect(gate.purchaseStatus.value).toBe('thanks')
    expect(state.getState('bc_full_version')).toBe(true)
  })

  it('an approval that arrives later (Ask to Buy) unlocks through the plugin event', async () => {
    iosBuild()
    await load()
    store.reply = { get_entitlement: { supported: true, checked: true, entitled: false }, get_product: { supported: true, id: 'x', price: '$2.99' } }
    await gate.initFullVersion()
    await vi.waitFor(() => expect(store.listeners.length).toBe(1))
    store.listeners[0]!({ entitled: true })
    expect(gate.isFullVersion.value).toBe(true)
    expect(gate.purchaseStatus.value).toBe('thanks')
  })

  it('does nothing on a build without the gate', async () => {
    await load()
    expect(await gate.buy()).toBe(false)
    expect(await gate.restore()).toBe(false)
    expect(store.calls).toEqual([])
  })
})

describe('where the flow offers it', () => {
  type Flow = typeof import('@/game/flow')
  type P = typeof import('@/game/state/profile')
  let f: Flow
  let p: P

  const boot = async (): Promise<void> => {
    drainAndResetModules()
    await holdGameState()
    p = await import('@/game/state/profile')
    f = await import('@/game/flow')
    gate = await import('@/use/useFullVersion')
    p.initProfile()
    p.profile.stats.runs = 3
  }
  const beatGoblinKing = (): void => { p.profile.world.flags.push('arenaOpen') }

  it('never before the Goblin King is answered', async () => {
    iosBuild()
    await boot()
    expect(f.unlockDue()).toBe(false)
    f.afterVisit()
    expect(f.flow.modal).not.toBe('unlock')
  })

  it('offers the purchase once he is beaten, when the visit is left', async () => {
    iosBuild()
    await boot()
    beatGoblinKing()
    expect(f.unlockDue()).toBe(true)
    f.afterVisit()
    expect(f.flow.modal).toBe('unlock')
    expect(f.flow.unlockFrom).toBe('victory')
    // only the first time
    expect(f.unlockDue()).toBe(false)
  })

  it('never when the full version is owned', async () => {
    iosBuild()
    await boot()
    beatGoblinKing()
    gate.isFullVersion.value = true
    expect(f.unlockDue()).toBe(false)
    f.afterVisit()
    expect(f.flow.modal).not.toBe('unlock')
  })

  it('never on a build without the gate (Android, web, desktop)', async () => {
    await boot()
    beatGoblinKing()
    expect(f.unlockDue()).toBe(false)
    f.afterVisit()
    expect(f.flow.modal).not.toBe('unlock')
  })

  it('no interstitial plays in front of the offer: the closed result leads straight to it', async () => {
    iosBuild()
    await boot()
    beatGoblinKing()
    await f.bankVisit('victory', 'plains', { xp: 60, gold: 40, kills: 5, items: [], seconds: 75, waves: 0 })
    await f.leaveResults()
    expect(ads.shown).toBe(0)
    expect(f.flow.modal).toBe('unlock')
  })

  it('a locked place on the map opens the offer instead of the journey', async () => {
    iosBuild()
    await boot()
    f.flow.screen = 'map'
    await f.travel('woods')
    expect(f.flow.modal).toBe('unlock')
    expect(f.flow.unlockFrom).toBe('map')
    expect(f.flow.loading).toBe(false)
  })

  it('Not now keeps the demo playable: from the map it only closes', async () => {
    iosBuild()
    await boot()
    f.flow.screen = 'map'
    await f.travel('crags')
    await f.declineUnlock()
    expect(f.flow.modal).toBe('')
    expect(f.flow.screen).toBe('map')
  })

  it('does not open over a window, a conversation or a loading veil', async () => {
    iosBuild()
    await boot()
    f.flow.modal = 'pause'
    f.openUnlock('map')
    expect(f.flow.modal).toBe('pause')
    f.flow.modal = ''
    f.flow.talk = 'npc'
    f.openUnlock('map')
    expect(f.flow.modal).toBe('')
    f.flow.talk = ''
    f.flow.loading = true
    f.openUnlock('map')
    expect(f.flow.modal).toBe('')
  })
})
