// ─── The profile and the save blob never share an object ────────────────────
//
// THE BUG THIS FILE EXISTS TO PREVENT:
//   `loadProfile` copied each stored field only one level deep, so the
//   profile's nested arrays and objects (`world.bosses`, `inv.items`,
//   `inv.fresh`, `hero.weapons`…) WERE the ones inside the `mega_droid_state`
//   blob. A boss marked beaten or an item looked at edited the save in memory,
//   and the next UNRELATED write (a volume change, a leaderboard mark) put the
//   whole blob on disk with it: a checkpoint the game never took.
//
// The save model: the profile reaches the blob through `saveProfile` and
// nothing else, and a `loadProfile` without a save in between gives back what
// was stored. The same holds for the resume point (`readSnapshot`), and for a
// level-lab test run, which writes nothing at all.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { starterItems } from '@/game/data/items'

const STATE_KEY = 'mega_droid_state'

const hero = () => ({
  xp: 40, attrs: { hp: 1, we: 0, power: 2 }, skills: { rapid: 1 }, pendingAttrs: 0,
  weapons: ['scrapBurst'], slots: ['scrapBurst', ''], weaponXp: { scrapBurst: 12 }
})
const inventory = () => ({
  items: starterItems(),
  equipped: { buster: 'start_buster', helmet: 'start_helm', chest: 'start_body', boots: 'start_boots', chip1: null, chip2: null },
  tanks: 1,
  fresh: ['start_helm']
})
const world = () => ({ unlocked: ['scrapyard', 'blaze'], bosses: ['scrapper'], tutorialDone: true, selected: 'blaze' })
const quests = () => ({ jobs: [], jobSeed: 7, storyAttempts: { blaze: 1 } })
const stats = () => ({ kills: 90, deaths: 1, chests: 4, missions: 5, playSeconds: 900, bestLevel: 6, lastDropAt: 0, xpEarned: 2000 })

/** A save well into the game, on disk before the game boots. */
const stored = () => ({
  ma_level: 6,
  ma_bolts: 300,
  ma_story: 1,
  ma_quests_done: 5,
  ma_hero: hero(),
  ma_inventory: inventory(),
  ma_quests: quests(),
  ma_world: world(),
  ma_stats: stats(),
  ma_tutorial: { hubLesson: true },
  ma_user_sound_volume: 0.7
})

const boot = async () => {
  localStorage.setItem(STATE_KEY, JSON.stringify(stored()))
  const gs = await holdGameState()
  const prof = await import('@/game/state/profile')
  const { default: useUser } = await import('@/use/useUser')
  prof.loadProfile()
  /** What is on disk now: the debounced blob write, flushed. */
  const onDisk = (): Record<string, any> => {
    gs.flushPersist()
    return JSON.parse(localStorage.getItem(STATE_KEY) ?? '{}')
  }
  /** An unrelated write through the ordinary settings path. */
  const changeVolume = (v: number) => useUser().setSettingValue('sound', v)
  return { gs, prof, onDisk, changeVolume }
}

/** Everything a mission or the hub does to the profile between checkpoints. */
const playWithoutSaving = (prof: typeof import('@/game/state/profile')) => {
  const p = prof.profile
  p.world.bosses.push('blazeMaster')
  p.world.unlocked.push('cryo')
  p.hero.weapons.push('flameWave')
  p.hero.slots[1] = 'flameWave'
  p.inv.items[0]!.upg = 3
  prof.markSeen('start_helm')
}

/** The profile fields of a blob, for comparing against what was stored. */
const profileFields = (blob: Record<string, any>) => ({
  hero: blob.ma_hero, inv: blob.ma_inventory, quests: blob.ma_quests, world: blob.ma_world, stats: blob.ma_stats
})
const storedProfileFields = () => profileFields(stored())

describe('the profile never shares an object with the save blob', () => {
  beforeEach(() => drainAndResetModules())
  afterEach(() => drainPersist())

  it('an unsaved change stays off the disk, whatever else is written', async () => {
    const { gs, prof, onDisk, changeVolume } = await boot()
    playWithoutSaving(prof)
    changeVolume(0.3)
    const disk = onDisk()
    // The unrelated write did land…
    expect(disk.ma_user_sound_volume).toBe(0.3)
    // …and carried none of the unsaved play with it, on disk or in memory.
    expect(profileFields(disk)).toEqual(storedProfileFields())
    expect(profileFields(gs.gameState.value)).toEqual(storedProfileFields())
  })

  it('saveProfile still persists all of it', async () => {
    const { prof, onDisk } = await boot()
    playWithoutSaving(prof)
    prof.saveProfile()
    const disk = onDisk()
    expect(disk.ma_world.bosses).toEqual(['scrapper', 'blazeMaster'])
    expect(disk.ma_world.unlocked).toEqual(['scrapyard', 'blaze', 'cryo'])
    expect(disk.ma_hero.weapons).toEqual(['scrapBurst', 'flameWave'])
    expect(disk.ma_hero.slots).toEqual(['scrapBurst', 'flameWave'])
    expect(disk.ma_inventory.items[0].upg).toBe(3)
    expect(disk.ma_inventory.fresh).toEqual([])
    expect(disk.ma_level).toBe(6)
    expect(disk.ma_stats).toEqual(stats())
    expect(disk.ma_tutorial).toEqual({ hubLesson: true })
  })

  it('a reload without a save gives back what was stored', async () => {
    const { prof } = await boot()
    playWithoutSaving(prof)
    prof.loadProfile()
    const p = prof.profile
    expect(p.world.bosses).toEqual(['scrapper'])
    expect(p.world.unlocked).toEqual(['scrapyard', 'blaze'])
    expect(p.hero.weapons).toEqual(['scrapBurst'])
    expect(p.hero.slots).toEqual(['scrapBurst', ''])
    expect(p.inv.items[0]!.upg).toBe(0)
    expect(p.inv.fresh).toEqual(['start_helm'])
  })

  it('a save hands the blob a copy: play after it waits for the next save', async () => {
    const { prof, onDisk, changeVolume } = await boot()
    prof.profile.world.bosses.push('blazeMaster')
    prof.saveProfile()
    prof.profile.world.bosses.push('frostMaster')
    prof.profile.inv.items[1]!.upg = 2
    changeVolume(0.2)
    const disk = onDisk()
    expect(disk.ma_world.bosses).toEqual(['scrapper', 'blazeMaster'])
    expect(disk.ma_inventory.items[1].upg).toBe(0)
  })

  it('the resume point read at boot is a copy too', async () => {
    const { gs, prof, onDisk, changeVolume } = await boot()
    const { storyQuest } = await import('@/game/data/quests')
    const { SECTOR_BY_ID } = await import('@/game/data/regions')
    const { MISSION_KEY } = await import('@/keys')
    const snap = {
      quest: storyQuest(SECTOR_BY_ID.blaze, 6, 0), killed: [0, 3], opened: [1], doors: [2], collected: [], progress: 0,
      x: 31.5, z: 12, yaw: 1.2, hp: 88, we: 20, bolts: 45, xp: 60, kills: 2, t: 94, done: false
    }
    gs.setStates({ [MISSION_KEY]: snap })
    const written = JSON.parse(JSON.stringify(snap))
    const read = prof.readSnapshot()!
    read.killed.push(5)
    read.opened.length = 0
    changeVolume(0.4)
    expect(onDisk().ma_mission).toEqual(written)
  })

  it('a level-lab test run (the save sandbox) writes nothing, on any path', async () => {
    const { prof, onDisk, changeVolume } = await boot()
    prof.setSaveSandbox(true)
    playWithoutSaving(prof)
    prof.grantXp(5000)
    prof.saveProfile()
    prof.markTip('sandboxTip')
    prof.writeSnapshot(null)
    changeVolume(0.5)
    const disk = onDisk()
    expect(disk.ma_user_sound_volume).toBe(0.5)
    expect(profileFields(disk)).toEqual(storedProfileFields())
    expect(disk.ma_level).toBe(6)
    expect(disk.ma_tutorial).toEqual({ hubLesson: true })
    expect('ma_mission' in disk).toBe(false)
    // Leaving it re-reads the untouched save, and saving works again.
    prof.setSaveSandbox(false)
    prof.loadProfile()
    expect(prof.profile.world.bosses).toEqual(['scrapper'])
    expect(prof.profile.level).toBe(6)
    prof.profile.bolts = 999
    prof.saveProfile()
    expect(onDisk().ma_bolts).toBe(999)
  })
})
