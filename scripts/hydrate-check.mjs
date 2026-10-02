#!/usr/bin/env node
/**
 * Cloud-save hydration, proved end to end in a real browser.
 *
 *   node scripts/hydrate-check.mjs            # starts its own dev server
 *   node scripts/hydrate-check.mjs --port 5412 --keep
 *
 * The game is served as the CrazyGames build (`--mode crazy-web`) and the
 * portal's SDK script is replaced by a stub whose `data` module is an
 * in-memory "cloud" this script owns. Four cases, each in a fresh browser
 * profile (no localStorage carried over):
 *
 *   A  an empty cloud        → a first-timer: boots into the opening fight
 *   B  a developed cloud save → a RETURNING player: boots into their town,
 *      at their level, with their gear, skills, map and choices — the save
 *      came from the SDK alone (the device had nothing)
 *   C  what is played is written back: a change made in the game reaches the
 *      cloud as ONE `bcross_state` blob, and the next device boots with it
 *   D  a cloud that fails at boot and answers later: the game starts, the
 *      retry lands, the profile in memory becomes the cloud's WITHOUT a
 *      reload — and the failed boot never overwrote the cloud with defaults
 *   E  a SLOW cloud (every read takes 1.5 s): the game waits for it and still
 *      boots the returning player, never the first-timer
 *
 * Each case also asserts what the save layer itself reports (`hydrateState`)
 * and what the player SEES (the level and the gold drawn in the HUD), not only
 * what is in memory.
 *
 * Uses the installed Chrome through playwright-core on its own profile; the
 * server and the browser it starts are stopped when it ends.
 */
import { spawn, execSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def }
const PORT = Number(arg('port', 5412))
const KEEP = process.argv.includes('--keep')
const TITLE = 'Battlecross'
const URL = `http://localhost:${PORT}/`

const STATE_KEY = 'bcross_state'
const MANIFEST = '__save_internal__crazy_keys'

/** A save some hours in. */
const DEVELOPED = {
  bc_version: 1, bc_level: 9, bc_gold: 1234, bc_story: 3, bc_quests_done: 5,
  bc_hero: {
    xp: 410, attrs: { str: 14, dex: 7, int: 9, end: 12, skl: 5, cha: 8 }, points: 2,
    learned: ['shieldSlam', 'fireball', 'aegisAura'], active: ['shieldSlam', 'fireball', '', '', '', ''], passive: ['aegisAura', '', '']
  },
  bc_inventory: {
    items: ['rustedShortsword', 'woodenBuckler', 'paddedTunic', 'ironBroadsword', 'copperBand'],
    equipped: { main: 'ironBroadsword', off: 'woodenBuckler', body: 'paddedTunic', trinket1: 'copperBand', trinket2: null }, fresh: [], potions: 4
  },
  bc_quests: { done: { goblinKing: 'pact' }, rep: { order: 0, syndicate: 1, circle: 0 } },
  bc_world: { cleared: ['plains', 'sunford', 'hollows', 'woods'], flags: ['goblinPact', 'arenaOpen'], at: 'sunford', visits: { plains: 3, hollows: 1 }, arenaBest: 4 },
  bc_stats: { kills: 180, deaths: 2, runs: 9, playSeconds: 2600, bestLevel: 9, xpEarned: 9000 },
  bc_tutorial: {}
}
const cloudOf = (state) => ({ [MANIFEST]: JSON.stringify([STATE_KEY]), [STATE_KEY]: JSON.stringify(state) })

/** The stubbed portal SDK. `__cloud` is the cloud; `__failReads` makes the
 *  first N reads reject (case D). */
const sdkStub = (cloud, failReads, delayMs = 0) => `
(() => {
  const cloud = ${JSON.stringify(cloud)};
  let fail = ${failReads};
  window.__cloud = cloud;
  window.__cloudWrites = [];
  const noop = () => {};
  window.CrazyGames = { SDK: {
    environment: 'crazygames',
    init: async () => {},
    data: {
      getItem: (k) => {
        window.__reads = (window.__reads || 0) + 1;
        if (fail > 0) { fail--; throw new Error('cloud unavailable'); }
        const v = k in cloud ? cloud[k] : null;
        return ${delayMs} > 0 ? new Promise((r) => setTimeout(() => r(v), ${delayMs})) : v;
      },
      setItem: (k, v) => { cloud[k] = String(v); window.__cloudWrites.push(k); },
      removeItem: (k) => { delete cloud[k]; },
      clear: () => { for (const k of Object.keys(cloud)) delete cloud[k]; }
    },
    game: {
      settings: { muteAudio: false, disableChat: false }, isMuted: () => false,
      addSettingsChangeListener: noop, addMuteListener: noop, addJoinRoomListener: noop,
      loadingStart: noop, loadingStop: noop, gameplayStart: noop, gameplayStop: noop, happytime: noop
    },
    ad: { hasAdblock: async () => false, requestAd: (_t, cb) => { cb && cb.adStarted && cb.adStarted(); setTimeout(() => cb && cb.adFinished && cb.adFinished(), 30); } },
    banner: { requestBanner: async () => {}, requestResponsiveBanner: async () => {}, clearAllBanners: noop, clearBanner: noop },
    user: {
      isUserAccountAvailable: true, getUser: async () => null, addAuthListener: noop,
      getSystemInfo: async () => ({ countryCode: 'US', locale: 'en-US', device: { type: 'desktop' }, os: {}, browser: {} }),
      systemInfo: { countryCode: 'US', locale: 'en-US', device: { type: 'desktop' } }
    }
  } };
})();`

// ── Server ───────────────────────────────────────────────────────────────────
const titleAt = async () => {
  try { return /<title>([^<]*)<\/title>/.exec(await (await fetch(URL)).text())?.[1] ?? '' } catch { return null }
}
let server = null
const startServer = async () => {
  const before = await titleAt()
  if (before !== null) throw new Error(`port ${PORT} is already serving "${before}" — pass another --port`)
  server = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', '--mode', 'crazy-web', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore', shell: process.platform === 'win32', windowsHide: true })
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 500))
    const t = await titleAt()
    if (t === TITLE) return
    if (t !== null) throw new Error(`port ${PORT} serves "${t}", not ${TITLE}`)
  }
  throw new Error('the dev server did not come up')
}
const stopServer = () => {
  if (!server?.pid) return
  try {
    if (process.platform === 'win32') execSync(`taskkill /PID ${server.pid} /T /F`, { stdio: 'ignore', windowsHide: true })
    else server.kill('SIGTERM')
  } catch { /* already gone */ }
}

// ── One boot ─────────────────────────────────────────────────────────────────
const boot = async ({ cloud, failReads = 0, delayMs = 0 }) => {
  const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-hydrate-')), {
    channel: 'chrome', headless: true, viewport: { width: 1000, height: 640 }, locale: 'en-US',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio']
  })
  const page = ctx.pages()[0] ?? await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 300)))
  // The portal SDK is the stub; every other portal's script is an empty file.
  await page.route(/crazygames-sdk-v3\.js/, r => r.fulfill({ contentType: 'application/javascript', body: sdkStub(cloud, failReads, delayMs) }))
  await page.route(/gamepix\.sdk\.js|poki-sdk\.js|youtube\.com\/game_api/, r => r.fulfill({ contentType: 'application/javascript', body: '' }))
  await page.goto(URL, { waitUntil: 'load' })
  if (await page.title() !== TITLE) throw new Error('wrong app on the port')
  await page.waitForFunction(() => window.__game && window.__game.app.mode, null, { timeout: 90000 })
  await page.waitForTimeout(800)
  const read = () => page.evaluate(() => {
    const g = window.__game
    const p = g.profile
    return {
      screen: g.flow.screen, node: g.flow.node, level: p.level, gold: p.gold, xp: p.hero.xp, points: p.hero.points,
      learned: [...p.hero.learned], main: p.inv.equipped.main, items: p.inv.items.length, cleared: [...p.world.cleared],
      flags: [...p.world.flags], quest: p.quests.done.goblinKing ?? null, potions: p.inv.potions,
      localKeys: Object.keys(localStorage).filter(k => k.startsWith('bc') || k.startsWith('__save')),
      cloudState: window.__cloud['bcross_state'] ? JSON.parse(window.__cloud['bcross_state']) : null,
      cloudKeys: Object.keys(window.__cloud), reads: window.__reads || 0,
      // What the save layer reports, and what is DRAWN (the HUD's own text).
      hydrate: window.__saveManager ? window.__saveManager.hydrateState : null,
      hudLevel: document.querySelector('.hero-frame__level')?.textContent?.trim() ?? null,
      hudGold: document.querySelector('.hero-frame .gold span')?.textContent?.replace(/\D/g, '') ?? null
    }
  })
  return { ctx, page, read, errors }
}

// ── The cases ────────────────────────────────────────────────────────────────
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? '  — ' + detail : ''}`) }

try {
  await startServer()

  console.log('\nA  empty cloud → first-timer')
  {
    const b = await boot({ cloud: {} })
    const s = await b.read()
    check('boots into the opening fight', s.screen === 'zone' && s.node === 'plains', `${s.screen}/${s.node}`)
    check('level 1 with the starter kit', s.level === 1 && s.main === 'rustedShortsword' && s.learned.join() === 'shieldSlam')
    check('the save layer reports an EMPTY cloud (not a failure)', s.hydrate === 'success-empty', String(s.hydrate))
    check('no page errors', b.errors.length === 0, b.errors.join(' | '))
    await b.ctx.close()
  }

  console.log('\nB  developed cloud save, empty device → returning player')
  let carried = null
  {
    const b = await boot({ cloud: cloudOf(DEVELOPED) })
    const s = await b.read()
    check('NOT a first-timer: boots into their town', s.screen === 'town' && s.node === 'sunford', `${s.screen}/${s.node}`)
    check('level, gold and XP are the cloud\'s', s.level === 9 && s.gold === 1234 && s.xp === 410 && s.points === 2, `lv ${s.level} gold ${s.gold} xp ${s.xp}`)
    check('skills, gear and potions are the cloud\'s', s.learned.join() === 'shieldSlam,fireball,aegisAura' && s.main === 'ironBroadsword' && s.items === 5 && s.potions === 4)
    check('map, flags and the quest decision are the cloud\'s', s.cleared.length === 4 && s.flags.includes('goblinPact') && s.quest === 'pact')
    check('the save layer reports a cloud read WITH data', s.hydrate === 'success-with-data', String(s.hydrate))
    check('the player SEES it: the HUD draws level 9 and 1234 gold', s.hudLevel === '9' && s.hudGold === '1234', `level "${s.hudLevel}", gold "${s.hudGold}"`)

    console.log('\nC  what is played is written back as one blob')
    await b.page.evaluate(() => {
      const g = window.__game
      g.profile.gold += 500
      g.profile.world.cleared.push('outskirts')
    })
    // Through the game's own checkpoint, as a visit's end would.
    await b.page.evaluate(async () => {
      const m = await import('/src/game/state/profile.ts')
      m.saveProfile()
      const s = await import('/src/use/useSaveStatus.ts')
      await s.flushSaveNow()
    })
    await b.page.waitForTimeout(1200)
    const after = await b.read()
    check('the cloud blob holds the change', after.cloudState?.bc_gold === 1734 && after.cloudState?.bc_world?.cleared?.includes('outskirts'), `gold ${after.cloudState?.bc_gold}`)
    check('the cloud holds ONE state entry (plus bookkeeping), no per-field keys', after.cloudKeys.filter(k => k.startsWith('bc_')).length === 0 && after.cloudKeys.includes(STATE_KEY), after.cloudKeys.join(','))
    carried = await b.page.evaluate(() => ({ ...window.__cloud }))
    check('no page errors', b.errors.length === 0, b.errors.join(' | '))
    await b.ctx.close()
  }
  {
    const b = await boot({ cloud: carried })
    const s = await b.read()
    check('the next device boots with what was played', s.level === 9 && s.gold === 1734 && s.cleared.includes('outskirts') && s.screen === 'town', `gold ${s.gold}`)
    await b.ctx.close()
  }

  console.log('\nD  the cloud fails at boot and answers later')
  {
    const b = await boot({ cloud: cloudOf(DEVELOPED), failReads: 12 })
    const first = await b.read()
    check('the game still starts (nothing waits on the cloud forever)', first.screen === 'zone' || first.screen === 'town', first.screen + ', cloud reads so far: ' + first.reads)
    check('the failed boot wrote NOTHING over the cloud save', first.cloudState?.bc_level === 9 && first.cloudState?.bc_gold === 1234, `cloud lv ${first.cloudState?.bc_level}`)
    // The first retry is 5 s after the failed read.
    await b.page.waitForFunction(() => window.__game.profile.level === 9, null, { timeout: 30000 }).catch(() => {})
    const s = await b.read()
    check('the retry lands and the profile in memory becomes the cloud\'s, without a reload', s.level === 9 && s.gold === 1234 && s.learned.length === 3, `lv ${s.level} gold ${s.gold}`)
    check('the cloud save is still intact afterwards', s.cloudState?.bc_level === 9 && s.cloudState?.bc_gold === 1234)
    check('the save layer now reports the cloud read', s.hydrate === 'success-with-data', String(s.hydrate))
    await b.ctx.close()
  }

  console.log('\nE  a slow cloud (every read takes 1.5 s)')
  {
    const b = await boot({ cloud: cloudOf(DEVELOPED), delayMs: 1500 })
    const s = await b.read()
    check('the game waited for it: the returning player boots into their town', s.screen === 'town' && s.node === 'sunford' && s.level === 9, `${s.screen}/${s.node} lv ${s.level}`)
    check('…and the HUD draws their level and gold', s.hudLevel === '9' && s.hudGold === '1234', `level "${s.hudLevel}", gold "${s.hudGold}"`)
    check('the slow boot wrote nothing over the cloud', s.cloudState?.bc_level === 9 && s.cloudState?.bc_gold === 1234)
    check('no page errors', b.errors.length === 0, b.errors.join(' | '))
    await b.ctx.close()
  }
} catch (e) {
  check('the run itself', false, String(e).slice(0, 400))
} finally {
  if (!KEEP) stopServer()
}

const failed = results.filter(r => !r.ok).length
console.log(`\n${results.length - failed} / ${results.length} checks passed`)
process.exit(failed ? 1 : 0)
