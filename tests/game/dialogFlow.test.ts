// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

/**
 * Conversations in the game: what `flow.ts` does around one (the windows it
 * hands over to, a quest's decision, the hidden trainers), and what `talk.ts`
 * writes into the save. Portal calls and the renderer are stubbed.
 */

vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: () => {} }))

type Flow = typeof import('@/game/flow')
type P = typeof import('@/game/state/profile')
type T = typeof import('@/game/talk')
let f: Flow
let p: P
let k: T

const STATE_KEY = 'bcross_state'
const tally = { xp: 60, gold: 40, kills: 5, items: [], seconds: 75, waves: 0 }

const boot = async (): Promise<void> => {
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  k = await import('@/game/talk')
  p.initProfile()
}

/** Hear every line until the conversation wants something else. */
const hear = (): string[] => {
  const ids: string[] = []
  for (let i = 0; i < 40 && k.talk.on && k.talk.phase === 'line'; i++) { ids.push(k.talk.line!.id); k.talkNext() }
  return ids
}
const blob = (): Record<string, any> => JSON.parse(localStorage.getItem(STATE_KEY) ?? '{}')

beforeEach(async () => {
  drainAndResetModules()
  await boot()
})
afterEach(() => { drainPersist() })

describe('talking to a townsperson', () => {
  it('starts a conversation instead of opening a window, and the shop is reached through it — and returns to it', () => {
    f.talkTo('sunfordSmith')
    expect(f.flow.talk).toBe('npc')
    expect(f.flow.modal).toBe('')
    expect(f.flow.npc?.id).toBe('sunfordSmith')
    expect(k.talk.stage).toBe('world')
    expect(hear()).toEqual(['dlg.sunfordSmith.hello.1', 'dlg.sunfordSmith.hello.2'])
    expect(k.talk.choices.map(c => c.id)).toEqual(['trade', 'who', 'gear', 'rumor', 'end'])
    expect(k.talk.choices[0]).toMatchObject({ icon: 'trade', text: 'dlg.hero.trade' })

    expect(k.talkPick('trade')).toBe(true)
    expect(f.flow.modal).toBe('')
    hear()
    expect(f.flow.modal).toBe('shop')
    expect(f.flow.talk).toBe('npc')
    expect(k.talkWaiting()).toBe(true)

    // Closing the shop: the smith says a parting line and the topics are back.
    f.closeModal()
    expect(f.flow.modal).toBe('')
    expect(f.flow.npc?.id).toBe('sunfordSmith')
    expect(hear()).toEqual(['dlg.sunfordSmith.shopBack.1'])
    expect(k.talk.phase).toBe('choices')

    expect(k.talkLeave()).toBe(true)
    expect(hear()).toEqual(['dlg.hero.bye', 'dlg.sunfordSmith.bye.1'])
    expect(f.flow.talk).toBe('')
    expect(f.flow.npc).toBeNull()
    expect(k.talk.on).toBe(false)
  })

  it('a trainer and a healer are reached the same way; one conversation at a time', () => {
    f.talkTo('trainerPyro')
    hear()
    // A second person cannot be addressed over the first.
    f.talkTo('sunfordSmith')
    expect(f.flow.npc?.id).toBe('trainerPyro')
    k.talkPick('train')
    hear()
    expect(f.flow.modal).toBe('trainer')
    expect(f.flow.trainerCls).toBe('pyro')
    f.closeModal()
    hear()
    k.talkLeave()
    hear()

    f.talkTo('sunfordHealer')
    hear()
    k.talkPick('heal')
    hear()
    expect(f.flow.modal).toBe('healer')
    f.closeModal()
    expect(hear()).toEqual(['dlg.sunfordHealer.healBack.1'])
  })

  it('closing a window that no conversation opened still just closes it', () => {
    f.flow.modal = 'pause'
    f.closeModal()
    expect(f.flow.modal).toBe('')
    expect(f.flow.talk).toBe('')
  })

  it('a trainer comments on the hero\'s attributes', () => {
    // The thresholds are the class's own skill table: the second lesson
    // (Cauterize, Intelligence 9), then the fourth (Pyromaniac, 17 and Skill 10).
    f.talkTo('trainerPyro')
    hear()
    k.talkPick('ready')
    expect(hear()).toEqual(['dlg.hero.ready', 'dlg.trainerPyro.ready.weak.1'])
    p.profile.hero.attrs.int = 9
    k.talkPick('ready')
    expect(hear()).toEqual(['dlg.hero.ready', 'dlg.trainerPyro.ready.able.1'])
    p.profile.hero.attrs.int = 17
    p.profile.hero.attrs.skl = 10
    k.talkPick('ready')
    expect(hear()).toEqual(['dlg.hero.ready', 'dlg.trainerPyro.ready.strong.1'])
  })

  it('a gift is given once, and a Charisma option is locked until the hero has it', () => {
    p.clearNode('plains')
    const gold = p.profile.gold
    f.talkTo('elderMara')
    hear()
    expect(k.talk.choices.find(c => c.id === 'reward')).toMatchObject({ icon: 'gift', locked: [] })
    k.talkPick('reward')
    hear()
    expect(p.profile.gold).toBe(gold + 60)
    expect(k.talk.choices.map(c => c.id)).not.toContain('reward')
    k.talkLeave()
    hear()

    f.talkTo('sunfordPeddler')
    hear()
    expect(k.talk.choices.find(c => c.id === 'stolen')!.locked).toEqual([{ kind: 'attr', attr: 'cha', n: 8 }])
    expect(k.talkPick('stolen')).toBe(false)
    expect(p.owns('copperBand')).toBe(false)
    p.profile.hero.attrs.cha = 8
    expect(k.talkPick('stolen')).toBe(true)
    expect(p.owns('copperBand')).toBe(true)
  })

  it('a healer sells mana potions by the game\'s rule: price shown, locked without gold, locked when the stock is full', () => {
    f.talkTo('sunfordHealer')
    hear()
    const mana = () => k.talk.choices.find(c => c.id === 'mana')!
    expect(mana().note).toEqual({ key: 'hud.gold', params: { n: p.manaPotionCost() } })
    expect(mana().locked).toEqual([{ kind: 'gold', n: p.manaPotionCost() }])
    expect(k.talkPick('mana')).toBe(false)
    expect(p.profile.inv.manaPotions).toBe(0)

    p.profile.gold = 5000
    const cost = p.manaPotionCost()
    expect(k.talkPick('mana')).toBe(true)
    expect(hear()).toEqual(['dlg.hero.mana', 'dlg.sunfordHealer.mana.1'])
    expect(p.profile.inv.manaPotions).toBe(1)
    expect(p.profile.gold).toBe(5000 - cost)
    // Bought again and again, until the stock is as large as the belt.
    while (p.manaPotionRoom() > 0) { expect(k.talkPick('mana')).toBe(true); hear() }
    expect(mana().locked).toEqual([{ kind: 'full' }])
    expect(k.talkPick('mana')).toBe(false)
    expect(p.profile.inv.manaPotions).toBe(p.profile.inv.potions)
  })

  it('a quest giver tells of the quest and where it is decided, until it has been; then speaks of the choice', () => {
    f.talkTo('elderMara')
    hear()
    const quest = k.talk.choices.find(c => c.id === 'quest')!
    expect(quest.icon).toBe('quest')
    k.talkPick('quest')
    expect(hear()).toEqual(['dlg.elderMara.quest.say', 'dlg.elderMara.quest.1', 'dlg.elderMara.quest.2', 'dlg.elderMara.quest.3', 'dlg.elderMara.quest.4'])
    expect(p.profile.world.said).toContain('hint.goblinKing')
    expect(k.npcPin(f.npcById('elderMara')!).kind).toBe('quest')
    k.talkLeave()
    hear()

    expect(p.decideQuest('goblinKing', 'slay')).toBe(true)
    expect(k.npcPin(f.npcById('elderMara')!).kind).toBe('talk')
    f.talkTo('elderMara')
    expect(hear()).toEqual(['dlg.elderMara.slain.1'])
    expect(k.talk.choices.map(c => c.id)).not.toContain('quest')
    k.talkPick('king')
    expect(hear()).toEqual(['dlg.elderMara.king.say', 'dlg.elderMara.king.slay.1'])
    k.talkLeave()
    hear()
    // The news was told: next time she greets him as ever.
    f.talkTo('elderMara')
    expect(hear()).toEqual(['dlg.elderMara.again.1'])
  })

  it('travelling away drops a conversation', async () => {
    f.setNodeBuilder(async () => ({ setup: { theme: 'town' } }) as never)
    f.talkTo('sunfordSmith')
    expect(f.flow.talk).toBe('npc')
    await f.travel('sunford')
    expect(f.flow.talk).toBe('')
    expect(k.talk.on).toBe(false)
    // …and the next one starts cleanly.
    f.talkTo('sunfordSmith')
    expect(f.flow.talk).toBe('npc')
    f.setNodeBuilder(null)
  })
})

describe('what was said is remembered in the save', () => {
  it('a met person is greeted as one after a reload; a one-time topic stays said', async () => {
    f.talkTo('sunfordSmith')
    hear()
    k.talkPick('who')
    hear()
    k.talkLeave()
    hear()
    expect(p.profile.world.said).toEqual(expect.arrayContaining(['sunfordSmith', 'sunfordSmith.who']))
    drainPersist()
    expect(blob().bc_world.said).toEqual(expect.arrayContaining(['sunfordSmith', 'sunfordSmith.who']))

    vi.resetModules()
    await boot()
    expect(p.profile.world.said).toEqual(expect.arrayContaining(['sunfordSmith', 'sunfordSmith.who']))
    f.talkTo('sunfordSmith')
    expect(hear()).toEqual(['dlg.sunfordSmith.again.1'])
    expect(k.talk.choices.map(c => c.id)).toEqual(['trade', 'gear', 'rumor', 'end'])
  })

  it('a save from before the conversations loads with an empty memory', async () => {
    drainPersist()
    localStorage.setItem(STATE_KEY, JSON.stringify({
      bc_version: 1, bc_level: 4, bc_gold: 50, bc_story: 1, bc_quests_done: 1,
      bc_world: { cleared: ['plains', 'sunford'], flags: [], at: 'sunford', visits: { plains: 2 }, arenaBest: 0 }
    }))
    vi.resetModules()
    await boot()
    expect(p.profile.level).toBe(4)
    expect(p.profile.world.said).toEqual([])
    expect(p.profile.world.cleared).toContain('plains')
    f.talkTo('sunfordSmith')
    expect(hear()[0]).toBe('dlg.sunfordSmith.hello.1')
  })

  it('a damaged memory is cleaned on load', async () => {
    drainPersist()
    localStorage.setItem(STATE_KEY, JSON.stringify({ bc_level: 2, bc_world: { cleared: [], flags: [], at: 'sunford', visits: {}, arenaBest: 0, said: ['a', 'a', 7, null, 'b'] } }))
    vi.resetModules()
    await boot()
    expect(p.profile.world.said).toEqual(['a', 'b'])
  })

  it('the marker over a head: something new until it has been said', () => {
    const smith = f.npcById('sunfordSmith')!
    expect(k.npcPin(smith)).toEqual({ kind: 'shop', news: true })
    f.talkTo('sunfordSmith')
    hear()
    for (const id of ['who', 'gear']) { k.talkPick(id); hear() }
    k.talkLeave()
    hear()
    expect(k.npcPin(smith)).toEqual({ kind: 'shop', news: false })
    expect(k.npcPin(f.npcById('trainerPyro')!).kind).toBe('trainer')
    expect(k.npcPin(f.npcById('sunfordHealer')!).kind).toBe('healer')
  })
})

describe('a quest decision', () => {
  it('follows the result screen as a conversation, not a window, and cannot be left without choosing', async () => {
    await f.bankVisit('victory', 'hollows', tally)
    await f.leaveResults()
    expect(f.flow.modal).toBe('')
    expect(f.flow.talk).toBe('decision')
    expect(k.talk.stage).toBe('portrait')
    expect(k.talk.title).toBe('quest.goblinKing.title')
    expect(k.talk.conv?.look).toBe('goblinKing')
    expect(k.talkLeave()).toBe(false)
    hear()
    expect(k.talk.final).toBe(true)
    expect(k.talk.choices.map(c => c.id)).toEqual(['slay', 'pact', 'ransom'])
    expect(k.talkLeave()).toBe(false)
    expect(f.flow.talk).toBe('decision')
  })

  it('is applied by the rules, saved at once, told with its rewards, and then moves on to the map', async () => {
    await f.bankVisit('victory', 'hollows', tally)
    await f.leaveResults()
    hear()
    const gold = p.profile.gold
    // The Charisma option stays shut.
    expect(k.talkPick('pact')).toBe(false)
    expect(p.profile.quests.done.goblinKing).toBeUndefined()

    expect(k.talkPick('slay')).toBe(true)
    expect(p.profile.quests.done.goblinKing).toBe('slay')
    expect(p.profile.world.flags).toEqual(expect.arrayContaining(['goblinSlain', 'arenaOpen']))
    expect(p.profile.quests.rep.order).toBe(1)
    expect(p.profile.gold).toBe(gold + 120)
    // On the device before another word is spoken.
    expect(blob().bc_quests.done.goblinKing).toBe('slay')
    expect(k.talk.outcome).toMatchObject({ id: 'slay', gold: 120 })
    // Permanent: no second choice, in this conversation or by the rule.
    expect(k.talkPick('ransom')).toBe(false)
    expect(p.decideQuest('goblinKing', 'ransom')).toBe(false)

    expect(f.flow.screen).not.toBe('map')
    expect(hear()).toEqual(['dlg.quest.goblinKing.slay.say', 'dlg.quest.goblinKing.slay.1', 'dlg.quest.goblinKing.slay.2'])
    expect(f.flow.talk).toBe('')
    expect(f.flow.quest).toBe('')
    expect(f.flow.screen).toBe('map')
  })

  it('a decided quest brings no second decision; the throne leads to the ending', async () => {
    p.decideQuest('goblinKing', 'slay')
    f.flow.quest = 'goblinKing'
    f.flow.modal = 'results'
    await f.leaveResults()
    expect(f.flow.talk).toBe('')
    expect(f.flow.screen).toBe('map')

    await f.bankVisit('victory', 'fortress', tally)
    await f.leaveResults()
    expect(f.flow.talk).toBe('decision')
    hear()
    // Factions the hero never served cannot be handed the throne; breaking it is always open.
    expect(k.talk.choices.filter(c => !c.locked.length).map(c => c.id)).toEqual(['shatter'])
    k.talkPick('shatter')
    hear()
    expect(f.flow.talk).toBe('')
    expect(f.flow.modal).toBe('ending')
  })
})

describe('a hidden trainer met on the map', () => {
  it('speaks as a portrait, teaches through the conversation, and leaves the hero on the map', () => {
    p.profile.world.cleared.push('temple')
    f.openMap()
    f.visitHiddenTrainer('temple')
    expect(f.flow.talk).toBe('map')
    expect(f.flow.modal).toBe('')
    expect(k.talk.stage).toBe('portrait')
    expect(hear()).toEqual(['dlg.trainerChrono.hello.1', 'dlg.trainerChrono.hello.2'])
    k.talkPick('train')
    hear()
    expect(f.flow.modal).toBe('trainer')
    expect(f.flow.trainerCls).toBe('chrono')
    expect(f.flow.npc).toMatchObject({ id: 'trainerChrono', role: 'trainer', cls: 'chrono' })
    f.closeModal()
    expect(hear()).toEqual(['dlg.trainerChrono.trainBack.1'])
    k.talkLeave()
    hear()
    expect(f.flow.talk).toBe('')
    expect(f.flow.screen).toBe('map')
  })

  it('the Keeper of Hours greets a hero who slew the oracle differently', () => {
    p.decideQuest('oracle', 'slay')
    p.profile.world.cleared.push('peak')
    f.visitHiddenTrainer('peak')
    expect(hear()).toEqual(['dlg.trainerChrono.fled.1', 'dlg.trainerChrono.fled.2'])
  })

  it('nothing happens where there is none', () => {
    f.visitHiddenTrainer('plains')
    expect(f.flow.talk).toBe('')
    expect(f.flow.modal).toBe('')
  })
})

describe('a conversation is not gameplay', () => {
  it('the portal bracket reads it as a reason gameplay is not live', async () => {
    const { isGameplayLive } = await import('@/use/useGameplayLifecycle')
    const base = { screen: 'zone' as const, phase: 'play', flowModal: false, anyModalOpen: false, adShowing: false, visibilityHidden: false, platformPaused: false }
    expect(isGameplayLive(base)).toBe(true)
    // What `GameScene.vue` feeds it while `flow.talk` is set.
    f.talkTo('sunfordSmith')
    expect(isGameplayLive({ ...base, flowModal: f.flow.modal !== '' || f.flow.talk !== '' })).toBe(false)
  })
})
