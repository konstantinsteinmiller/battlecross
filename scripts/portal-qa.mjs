#!/usr/bin/env node
// ─── Portal-signal proof, against the BUILT bundle ──────────────────────────
//
// Drives a Chrome on a private profile over CDP and asserts what a portal's
// QA grades — the ads, the audio around them, PAUSE and MUTE — on the artefact
// QA actually runs.
//
//   pnpm build:gamemonetize   (or, with no game id yet:
//                              VITE_GAME_ID=qa-placeholder npx vite build --mode gamemonetize --base=./)
//   pnpm qa:gamemonetize      = node scripts/portal-qa.mjs --platform gamemonetize --headless
//
//   --platform <id>   gamemonetize | gamepix | none              (default gamemonetize)
//   --dist <dir>      built output to serve                     (default ./dist)
//   --chrome <path>   Chrome executable
//   --sdk-delay <ms>  how long the stubbed SDK takes to report ready (default 1200)
//   --keep            leave the browser open for inspection
//   --headless        run Chrome headless (WebGL via SwiftShader)
//
// Exits non-zero on any failed check, so CI can gate on it.
//
// ── Why every part of this is the way it is ──
//
// THE BUILT BUNDLE, not the dev server. The dev server skips the obfuscator,
// the env-literal folding the platform gates rely on, the stub aliases and
// `vite-plugin-singlefile`. Any of those can break the shipping artefact while
// the dev server stays green.
//
// THE PROBE IS INJECTED INTO THE HTML, right after `<meta charset>`. Every
// check here is about what happens DURING boot, so an evaluate-after-load
// probe is too late.
//
// GAMEMONETIZE: THE REAL SDK REQUEST IS ANSWERED, NOT SKIPPED. The plugin
// injects `https://api.gamemonetize.com/sdk.js` exactly as it does on the
// portal; CDP's Fetch domain intercepts that request and answers it with a
// stub that reports SDK_READY `--sdk-delay` ms later. So the run proves the
// build makes the SDK request at all (with a game id in SDK_OPTIONS), and the
// readiness race is the real one: a cross-origin script, loaded after mount.
//
// ── Ways this check lies to you, all of which cost a run to find ──
//
// 1. INJECTING BEFORE `<meta charset>`. The browser sniffs the encoding from
//    the first 1024 bytes; push the charset meta out of that window and the
//    bundle decodes as windows-1252. Inject AFTER it.
// 2. `document.querySelectorAll('audio')`. The music element is `new Audio()`,
//    never appended to the document, so that list is EMPTY and `.every(paused)`
//    over it is vacuously true. Track media and AudioContexts by wrapping their
//    constructors, and require `count > 0`.
// 3. NO CONTROL CASE. "The world froze" is also true of a world that never
//    ran, and "silent under the ad" of a game that never played music. Every
//    freeze and every silence below is preceded by the opposite observation.
// 4. HOSTNAME GATES. Satisfy them with `--host-resolver-rules`, never by
//    weakening the build.
// 5. AN SDK THAT IS READY INSTANTLY. A stub answering in 30 ms wins every race
//    against the game's own boot, so a placement that SAMPLES readiness once
//    passes here and fires nothing on the portal — GameMonetize rejected a
//    sibling game for exactly that ("Ads should be shown the first time after
//    the game loads") while this harness was green. Hence `--sdk-delay` 1200.
// 6. COUNTING EVENTS INSTEAD OF READING STATE. "Zero play() calls under the
//    ad" reports a false failure for a post-splash ad (the music legitimately
//    started at boot) and passes vacuously otherwise. Sample the media and the
//    contexts instead — and, because this game's score is SYNTHESISED, whether
//    the sequencer is still scheduling notes.
// 7. A FIRST-LOAD AD WITH NOTHING TO SILENCE. In pass A the ad can open before
//    the score has started, and "all paused" is then true of a silent game. So
//    pass B reloads with the SDK delayed to 9 s — well into a running fight —
//    and asserts music live BEFORE the ad, silent under it, live after it.

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtempSync, readFileSync, readdirSync, existsSync, statSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, extname, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const argv = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : fallback
}
const flag = name => argv.includes(`--${name}`)

const PLATFORM = arg('platform', 'gamemonetize')
const ROOT = resolve(arg('dist', 'dist'))
const CHROME = arg('chrome', process.env.CHROME_PATH
  ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe')
const KEEP = flag('keep')
const HEADLESS = flag('headless')
// See trap 5: keep it well past the moment the game's own route chunk mounts.
const SDK_DELAY_MS = Number(arg('sdk-delay', '1200'))
// Pass B's delay (trap 7): long enough that the opening fight and its score
// are running when the first-load ad opens.
const LATE_SDK_DELAY_MS = 9000
const TITLE = 'Battlecross'
const PORT = 8300 + Math.floor(Math.random() * 500)
const CDP_PORT = 9500 + Math.floor(Math.random() * 400)
const PROFILE = mkdtempSync(join(tmpdir(), 'portal-qa-'))

// ─── The shared probe ───────────────────────────────────────────────────────
//
// Platform-independent. Installs the counters and the levers every check below
// pulls; the per-platform SDK stub is appended to it.
const PROBE = `
var qs = new URLSearchParams(location.search);
var qa = window.__qa = {
  playCalls: [], sdkCalls: [], media: [], muted: true,
  sdkDelayMs: Number(qs.get('qaSdkDelay') || ${SDK_DELAY_MS}),
  firstInputAt: null, splashUpAt: null, splashGoneAt: null
};

// A harness-only shim, and the only one here. A mapped hostname over plain
// http is NOT a secure context, so \`crypto.randomUUID\` is undefined. Real
// portals serve the iframe over https, where it exists. Guarded.
if (window.crypto && typeof window.crypto.randomUUID !== 'function') {
  window.crypto.randomUUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
    });
  };
}

// The pacing clock. The game spaces interstitials 121 s apart on Date.now();
// the run moves that clock forward instead of waiting two minutes.
var realNow = Date.now.bind(Date);
qa.skewMs = 0;
Date.now = function () { return realNow() + qa.skewMs; };

// Media elements, tracked by CONSTRUCTOR — trap 2.
var RealAudio = window.Audio;
window.Audio = function () {
  var el = new RealAudio(arguments[0]);
  qa.media.push(el);
  return el;
};
window.Audio.prototype = RealAudio.prototype;
var realPlay = HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play = function () {
  qa.playCalls.push({ src: String(this.currentSrc || this.src || ''), loop: !!this.loop });
  if (qa.media.indexOf(this) < 0) qa.media.push(this);
  return realPlay.apply(this, arguments);
};

// The tab switch. The app reads document.visibilityState AND listens for the
// event, so both move together.
var hidden = false;
Object.defineProperty(document, 'visibilityState', { get: function () { return hidden ? 'hidden' : 'visible'; } });
Object.defineProperty(document, 'hidden', { get: function () { return hidden; } });
qa.setHidden = function (v) {
  hidden = !!v;
  document.dispatchEvent(new Event('visibilitychange'));
  return hidden;
};

// "Is the world running?" — counted in RENDERED GAME FRAMES: animation-frame
// callbacks during which WebGL drew anything. A raw frames count is the wrong
// observable here: the HUD, the lessons and the coach run rAF chains of their
// own that keep ticking while the game is paused, and a run read ~50 rAF/s
// both ways. The game's loop is the only thing that draws to the canvas, and a
// held pause gate cancels it outright (app.setSuspended), so draws stop.
var realRaf = window.requestAnimationFrame.bind(window);
qa.raf = 0;
qa.drawCalls = 0;
qa.frames = 0;
['WebGLRenderingContext', 'WebGL2RenderingContext'].forEach(function (name) {
  var C = window[name];
  if (!C) return;
  ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced', 'drawRangeElements'].forEach(function (m) {
    var real = C.prototype[m];
    if (typeof real !== 'function') return;
    C.prototype[m] = function () { qa.drawCalls++; return real.apply(this, arguments); };
  });
});
window.requestAnimationFrame = function (cb) {
  return realRaf(function (t) {
    qa.raf++;
    var before = qa.drawCalls;
    try { cb(t); } finally { if (qa.drawCalls > before) qa.frames++; }
  });
};
qa.progress = function () { return qa.frames; };

// Every AudioContext, by constructor (trap 2) — the score and every SFX are
// synthesised on one.
qa.contexts = [];
var RealAC = window.AudioContext || window.webkitAudioContext;
if (RealAC) {
  var TrackedAC = function (o) { var c = new RealAC(o); qa.contexts.push(c); return c; };
  TrackedAC.prototype = RealAC.prototype;
  window.AudioContext = TrackedAC;
  if (window.webkitAudioContext) window.webkitAudioContext = TrackedAC;
}
// Notes scheduled: the synthesised score starts oscillators and buffer sources
// as it plays, so "started a source in the last 2 s on a running context" is
// what "the music is playing" means here (trap 6).
qa.starts = [];
if (window.AudioScheduledSourceNode) {
  var realStart = AudioScheduledSourceNode.prototype.start;
  AudioScheduledSourceNode.prototype.start = function () {
    qa.starts.push(performance.now());
    if (qa.starts.length > 4000) qa.starts.splice(0, 2000);
    return realStart.apply(this, arguments);
  };
}
qa.musicLive = function () {
  var media = qa.media.some(function (m) { return m.loop && !m.paused; });
  var now = performance.now();
  var ctxRunning = qa.contexts.some(function (c) { return c.state === 'running'; });
  var recent = qa.starts.filter(function (t) { return now - t < 2000; }).length;
  return media || (ctxRunning && recent > 0);
};
qa.audioState = function () {
  return {
    count: qa.media.length + qa.contexts.length,
    allPaused: qa.media.every(function (a) { return a.paused; })
      && qa.contexts.every(function (c) { return c.state !== 'running'; })
  };
};

// The first real input the page sees. Every ad that must open "before the
// first fight moves" is checked against it.
['pointerdown', 'keydown', 'touchstart'].forEach(function (type) {
  window.addEventListener(type, function (e) {
    if (e.isTrusted && qa.firstInputAt === null) qa.firstInputAt = performance.now();
  }, { capture: true, passive: true });
});

// The Vue loader (FLogoProgress): its first appearance and the moment it is
// done — the loader card starts leaving, which is the edge the first-load ad
// is armed on ("splash gone"). The backdrop fades out for a second longer.
setInterval(function () {
  var l = document.querySelector('.loader');
  var up = !!l && !/leave/.test(l.className);
  if (up && qa.splashUpAt === null) qa.splashUpAt = performance.now();
  if (!up && qa.splashUpAt !== null && qa.splashGoneAt === null) qa.splashGoneAt = performance.now();
}, 50);
`

// ─── Per-platform SDK stubs ─────────────────────────────────────────────────
//
// `host` satisfies the build's own hostname gate. `fingerprint` is a string
// only THIS platform's build can contain — `dist/` is shared by every build,
// and a stale one answers happily (the served-<title> rule, one level up).
const PLATFORMS = {
  gamemonetize: {
    host: 'local.gamemonetize.com',
    label: 'GameMonetize HTML5',
    fingerprint: 'api.gamemonetize.com/sdk.js',
    // The real request, answered by CDP (see the header). Its body hands over
    // to the stub below, which is already in the page.
    sdkUrlPattern: '*api.gamemonetize.com/sdk.js*',
    sdkBody: 'window.__qa && window.__qa.gmSdkLoaded();',
    // GameMonetize has NO mute API and NO language API (`qa.portalMute` is
    // deliberately absent, so the mute checks are skipped out loud). Its one
    // portal signal is the ad layer: SDK_GAME_PAUSE when it opens,
    // SDK_GAME_START when it closes.
    stub: `
qa.gmEmit = function (name) {
  var o = window.SDK_OPTIONS;
  if (!o || typeof o.onEvent !== 'function') return false;
  o.onEvent({ name: name });
  return true;
};
qa.gmSdkLoaded = function () {
  qa.sdkLoadedAt = performance.now();
  var o = window.SDK_OPTIONS || {};
  qa.sdkOptions = { gameId: o.gameId || null, keys: Object.keys(o), hasOnEvent: typeof o.onEvent === 'function' };
  log('sdk.js');
  window.sdk = sdk;
  // Delayed on purpose (trap 5): the real SDK still has its ad stack to load.
  setTimeout(function () { qa.sdkReadyAt = performance.now(); qa.gmEmit('SDK_READY'); }, qa.sdkDelayMs);
};

// A stubbed ad stays OPEN 12 s: past the 6 s "the ad never opened" cap useAds
// applies to a request that reports no impression. An ad still playing at
// second 8 is the case that used to hand the game back mid-video.
qa.adMs = 12000;
qa.ads = [];
qa.audits = [];
qa.adOpen = false;
var runAd = function (kind) {
  var audit = {
    kind: kind,
    requestedAt: performance.now(),
    inputBeforeRequest: qa.firstInputAt !== null,
    openedAt: null, closedAt: null,
    rafAtOpen: null, rafAfter1s: null,
    audioAtOpen: null, musicAtOpen: null,
    audioPastCap: null, musicPastCap: null,
    resultsAtOpen: null, resultsAtRequest: !!document.querySelector('.results')
  };
  qa.ads.push(kind);
  qa.audits.push(audit);
  setTimeout(function () {
    qa.adOpen = true;
    audit.openedAt = performance.now();
    audit.rafAtOpen = qa.progress();
    audit.resultsAtOpen = !!document.querySelector('.results');
    qa.gmEmit('SDK_GAME_PAUSE');
    // Read AFTER the SDK's pause reached the game (it is synchronous there).
    audit.audioAtOpen = qa.audioState();
    audit.musicAtOpen = qa.musicLive();
    setTimeout(function () { audit.rafAfter1s = qa.progress(); }, 1000);
    // PAST the 6 s cap, before the ad closes.
    setTimeout(function () {
      audit.audioPastCap = qa.audioState();
      audit.musicPastCap = qa.musicLive();
    }, 8000);
    setTimeout(function () {
      qa.adOpen = false;
      audit.closedAt = performance.now();
      qa.gmEmit('ALL_ADS_COMPLETED');
      qa.gmEmit('SDK_GAME_START');
    }, qa.adMs);
  }, 400);
};

// The live HTML5 SDK exposes showBanner and no showAd / preloadAd.
var sdk = {
  showBanner: function () { log('showBanner'); runAd('interstitial'); }
};
`
  },
  gamepix: {
    host: 'local.gamepix.com',
    label: 'GamePix v3',
    fingerprint: 'integration.gamepix.com',
    stub: `
var store = {};
var sdk = {
  isMuted: function () { return qa.muted; },
  init: function () {
    log('init');
    return new Promise(function (r) { setTimeout(r, qa.sdkDelayMs); });
  },
  customLoading: function (v) { log('customLoading:' + v); },
  gameLoading: function (p) { log('gameLoading:' + p); },
  gameLoaded: function (cb) { log('gameLoaded'); if (cb) setTimeout(cb, 0); },
  updateScore: function (s) { log('updateScore:' + s); },
  updateLevel: function (l) { log('updateLevel:' + l); },
  happyMoment: function () { log('happyMoment'); },
  lang: function () { return 'en'; },
  localStorage: {
    getItem: function (k) { return k in store ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; }
  },
  interstitialAd: function () { log('interstitialAd'); return Promise.resolve({ success: false }); },
  rewardAd: function () { log('rewardAd'); return Promise.resolve({ success: false }); }
};
Object.defineProperty(window, 'GamePix', { value: sdk, writable: false, configurable: false });
qa.portalMute = function (on) {
  qa.muted = !!on;
  var fn = on ? (sdk.soundOff || (sdk.on && sdk.on.soundOff))
              : (sdk.soundOn || (sdk.on && sdk.on.soundOn));
  if (typeof fn === 'function') fn();
  return typeof fn === 'function';
};
`
  },
  none: {
    host: '127.0.0.1',
    label: 'no SDK (plain web build)',
    fingerprint: null,
    stub: ''
  }
}

const plat = PLATFORMS[PLATFORM]
if (!plat) {
  console.error(`unknown platform "${PLATFORM}" — have: ${Object.keys(PLATFORMS).join(', ')}`)
  process.exit(2)
}

const STUB = `<script>\n(function(){\nvar log=function(n){window.__qa.sdkCalls.push(n)};\n${PROBE}\n${plat.stub}\n})();\n</script>`

// ─── Serve the built output ─────────────────────────────────────────────────
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css', '.json': 'application/json', '.map': 'application/json',
  '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf'
}

if (!existsSync(join(ROOT, 'index.html'))) {
  console.error(`no index.html in ${ROOT} — build first (e.g. pnpm build:${PLATFORM})`)
  process.exit(2)
}
const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8')
const CHARSET = /<meta[^>]+charset[^>]*>/i
if (!CHARSET.test(indexHtml)) {
  console.error('built index.html has no charset meta — refusing to inject blind')
  process.exit(2)
}
const patched = indexHtml.replace(CHARSET, m => m + STUB)

if (plat.fingerprint) {
  const inline = indexHtml.includes(plat.fingerprint)
  const inChunks = !inline && existsSync(join(ROOT, 'assets'))
    && readdirSync(join(ROOT, 'assets')).some(f =>
      f.endsWith('.js') && readFileSync(join(ROOT, 'assets', f), 'utf8').includes(plat.fingerprint))
  if (!inline && !inChunks) {
    console.error(
      `${ROOT} does not look like a ${PLATFORM} build (no "${plat.fingerprint}" in it).\n`
      + `Rebuild: pnpm build:${PLATFORM}`
    )
    process.exit(2)
  }
}

const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (p === '/' || p === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(patched)
    return
  }
  const file = join(ROOT, p.replace(/^\/+/, ''))
  if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404); res.end('not found'); return
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise(r => server.listen(PORT, '0.0.0.0', r))

// ─── Chrome + CDP ───────────────────────────────────────────────────────────
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${CDP_PORT}`,
  `--user-data-dir=${PROFILE}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  // Full speed while we PRETEND the tab is hidden, or Chrome's own throttling
  // produces the result we are trying to attribute to the game's pause gate.
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
  // The embed grants autoplay, as a portal iframe with `allow=autoplay` does:
  // the score may start without a gesture, which is what makes pass B's
  // "music live before the ad" a real control.
  '--autoplay-policy=no-user-gesture-required',
  `--host-resolver-rules=MAP ${plat.host} 127.0.0.1`,
  '--window-size=520,900',
  // English UI: the result-screen steps find their buttons by label, and the
  // game follows the browser language on a portal with no language signal.
  '--lang=en-US',
  ...(HEADLESS ? ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio'] : []),
  'about:blank'
], { stdio: 'ignore', windowsHide: true })

const api = `http://127.0.0.1:${CDP_PORT}/json`
const waitForChrome = async () => {
  for (let i = 0; i < 160; i++) {
    try { const r = await fetch(`${api}/version`); if (r.ok) return r.json() } catch { /* not up */ }
    await sleep(250)
  }
  throw new Error('Chrome did not expose a debugging port')
}

let msgId = 0
const connect = wsUrl => {
  const ws = new WebSocket(wsUrl)
  const pending = new Map()
  const listeners = new Map()
  const ready = new Promise((res, rej) => {
    ws.onopen = () => res()
    ws.onerror = e => rej(new Error(`ws error ${e?.message ?? ''}`))
  })
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data)
    if (m.method) { for (const fn of listeners.get(m.method) ?? []) fn(m.params); return }
    const p = m.id && pending.get(m.id)
    if (!p) return
    pending.delete(m.id)
    m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result)
  }
  const send = (method, params = {}) => new Promise((res, rej) => {
    const id = ++msgId
    pending.set(id, { res, rej })
    ws.send(JSON.stringify({ id, method, params }))
  })
  const on = (method, fn) => {
    if (!listeners.has(method)) listeners.set(method, [])
    listeners.get(method).push(fn)
  }
  return { ws, ready, send, on }
}

const results = []
const check = (name, pass, detail) => {
  results.push({ name, pass })
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`)
}
const note = (text) => console.log(`  ----  ${text}`)

const version = await waitForChrome()
const target = await (await fetch(`${api}/new?about:blank`, { method: 'PUT' })).json()
const { ws, ready, send, on } = connect(target.webSocketDebuggerUrl)
await ready

const ev = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(`${r.exceptionDetails.text} :: ${expr}`)
  return r.result.value
}
const waitFor = async (expr, ms, step = 200) => {
  for (let t = 0; t < ms; t += step) {
    if (await ev(expr)) return true
    await sleep(step)
  }
  return !!(await ev(expr))
}
const pressKey = async (key, code) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: key === 'Escape' ? 27 : 0 })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: key === 'Escape' ? 27 : 0 })
}
/** Click the first visible button whose text or aria-label matches. */
const clickButton = (re) => ev(`(() => {
  const re = ${re};
  const b = Array.from(document.querySelectorAll('button')).find(x => {
    const r = x.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && (re.test(x.textContent || '') || re.test(x.getAttribute('aria-label') || ''));
  });
  if (!b) return false;
  b.click(); return true;
})()`)

// ── What leaves the page, and what the console says ─────────────────────────
const requests = []
const consoleErrors = []
let sdkRequests = 0
on('Network.requestWillBeSent', p => requests.push(p.request.url))
on('Runtime.consoleAPICalled', p => {
  if (p.type === 'error') consoleErrors.push(p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 240))
})
on('Runtime.exceptionThrown', p => consoleErrors.push(`[exception] ${p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text}`.slice(0, 240)))
on('Log.entryAdded', p => { if (p.entry.level === 'error') consoleErrors.push(`[${p.entry.source}] ${p.entry.text} ${p.entry.url ?? ''}`.slice(0, 240)) })
if (plat.sdkUrlPattern) {
  on('Fetch.requestPaused', p => {
    sdkRequests++
    void send('Fetch.fulfillRequest', {
      requestId: p.requestId,
      responseCode: 200,
      responseHeaders: [{ name: 'Content-Type', value: 'text/javascript; charset=utf-8' }, { name: 'Access-Control-Allow-Origin', value: '*' }],
      body: Buffer.from(plat.sdkBody).toString('base64')
    })
  })
}

/** One boot of the game: navigate, wait for the splash to clear. */
const boot = async (query = '') => {
  await send('Page.navigate', { url: `http://${plat.host}:${PORT}/${query}` })
  for (let i = 0; i < 60 && (await ev('document.title')) !== TITLE; i++) await sleep(250)
  const title = await ev('document.title')
  check(`serving THIS game (title "${TITLE}")`, title === TITLE, `title="${title}"`)
  const booted = await waitFor('!!document.querySelector(".hud, .wmap")', 60000, 250)
  check('game booted into a zone, a town or the map', booted)
  if (!booted) {
    console.log('  body    : ' + await ev('document.body.innerText.slice(0,300)'))
    throw new Error('never reached gameplay')
  }
  const gone = await waitFor('window.__qa.splashGoneAt !== null', 60000, 250)
  check('splash cleared — the loader finished', gone)
}

/** A brand-new save asks boy or girl first and holds the world still until
 *  one is picked (roadmap #71): pick the boy, so the frame checks see a
 *  running game. A save that has picked is never asked. */
const pickHero = async () => {
  const asked = await waitFor('!!document.querySelector(".hero-choice .hero-choice__card")', 4000, 200)
  if (!asked) return
  await sleep(900)
  await ev(`document.querySelector('.hero-choice [data-hero="m"]').click()`)
  check('hero choice answered (boy)', await waitFor('!document.querySelector(".hero-choice")', 6000, 200))
  await sleep(300)
}

/** Wait until no stubbed ad is open (and none is about to). */
const waitAdClosed = async () => {
  await sleep(600)
  for (let i = 0; i < 80 && await ev('!!(window.__qa.adOpen)'); i++) await sleep(500)
}

try {
  console.log(`browser   ${version.Browser}`)
  console.log(`platform  ${PLATFORM} (${plat.label})`)
  console.log(`serving   ${ROOT} on http://${plat.host}:${PORT}`)
  console.log(`sdk delay ${SDK_DELAY_MS} ms\n`)

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  await send('Log.enable')
  await send('Emulation.setLocaleOverride', { locale: 'en-US' }).catch(() => {})
  await send('Network.setUserAgentOverride', { userAgent: version['User-Agent'].replace('HeadlessChrome', 'Chrome'), acceptLanguage: 'en-US,en' }).catch(() => {})
  if (plat.sdkUrlPattern) await send('Fetch.enable', { patterns: [{ urlPattern: plat.sdkUrlPattern, requestStage: 'Request' }] })

  if (PLATFORM === 'gamemonetize') {
    // ── Pass A: the readiness race (SDK ready ~1.2 s after it loads) ───────
    console.log('pass A — the first-load ad against a realistically slow SDK')
    await boot()
    const adSeen = await waitFor('window.__qa.audits.length > 0', SDK_DELAY_MS + 15000, 250)
    const opts = await ev('JSON.stringify(window.__qa.sdkOptions || null)')
    const o = JSON.parse(opts)
    check('the build requests the GameMonetize SDK (api.gamemonetize.com/sdk.js)', sdkRequests >= 1, `${sdkRequests} request(s)`)
    check('SDK_OPTIONS carries a game id and the event callback', !!o && !!o.gameId && o.hasOnEvent, opts)
    const strategy = await ev('window.__saveManager ? window.__saveManager.strategyName : null')
    check('the save runs on the GameMonetize strategy (local-only, its own name)', strategy === 'gamemonetize', `strategyName=${strategy}`)
    check('no child-directed ad flag in SDK_OPTIONS', !!o && !o.keys.some(k => /child|tfcd|coppa/i.test(k)), o ? o.keys.join(',') : '')
    check('first-load interstitial was requested', adSeen, `ads=${await ev('JSON.stringify(window.__qa.ads)')}`)
    if (adSeen) {
      await sleep(1600)
      const a = JSON.parse(await ev('JSON.stringify(window.__qa.audits[0])'))
      const t = JSON.parse(await ev('JSON.stringify({ gone: __qa.splashGoneAt, ready: __qa.sdkReadyAt, mark: performance.getEntriesByName("ad:first-load").length })'))
      check('…after the splash was gone and the SDK was ready',
        a.requestedAt >= t.gone && a.requestedAt >= t.ready,
        `splash gone ${Math.round(t.gone)} ms, sdk ready ${Math.round(t.ready)} ms, ad requested ${Math.round(a.requestedAt)} ms`)
      check('…promptly: within 3 s of the later of the two',
        a.requestedAt - Math.max(t.gone, t.ready) < 3000, `${Math.round(a.requestedAt - Math.max(t.gone, t.ready))} ms`)
      check('…before the player had touched anything (the first fight has not moved)',
        !a.inputBeforeRequest && t.mark === 1, `input before request: ${a.inputBeforeRequest}, ad:first-load mark: ${t.mark}`)
      check('the world is frozen while the ad is open',
        a.rafAfter1s !== null && a.rafAfter1s - a.rafAtOpen <= 2, `frames at open ${a.rafAtOpen}, 1 s later ${a.rafAfter1s}`)
      check('no sound underneath the ad (media + contexts read, not counted)',
        a.audioAtOpen.count > 0 && a.audioAtOpen.allPaused && !a.musicAtOpen, JSON.stringify(a.audioAtOpen))
    }
    await waitAdClosed()
    const a0 = JSON.parse(await ev('JSON.stringify(window.__qa.audits[0] || null)'))
    if (a0) {
      check('still silent PAST the 6 s "never opened" cap (ad ran 12 s)',
        a0.audioPastCap && a0.audioPastCap.count > 0 && a0.audioPastCap.allPaused && !a0.musicPastCap, JSON.stringify(a0.audioPastCap))
    }
    const musicBackA = await waitFor('window.__qa.musicLive()', 6000, 250)
    check('music plays once the ad closes', musicBackA)
    await pickHero()
    check('exactly ONE first-load ad (one armed path)', (await ev('window.__qa.audits.length')) === 1,
      `ads=${await ev('JSON.stringify(window.__qa.ads)')}`)

    // ── Pass B: the same ad over a game whose score is already playing ─────
    console.log(`\npass B — the SDK delayed to ${LATE_SDK_DELAY_MS / 1000} s, so the ad lands on a running fight (trap 7)`)
    await boot(`?qaSdkDelay=${LATE_SDK_DELAY_MS}`)
    await sleep(1200)
    const beforeAd = await ev('window.__qa.audits.length')
    const musicBefore = await waitFor('window.__qa.musicLive()', 6000, 250)
    const rafB0 = await ev('window.__qa.progress()')
    await sleep(1000)
    const rafB1 = await ev('window.__qa.progress()')
    check('control: music is playing in the running game before the ad', beforeAd === 0 && musicBefore,
      `ads so far ${beforeAd}`)
    check('control: the world runs before the ad', rafB1 - rafB0 > 5, `frames ${rafB0} → ${rafB1}`)
    const adB = await waitFor('window.__qa.audits.length > 0 && window.__qa.audits[0].audioAtOpen !== null', LATE_SDK_DELAY_MS + 15000, 250)
    check('the first-load ad arrives with the slow SDK', adB)
    if (adB) {
      await sleep(1600)
      const b = JSON.parse(await ev('JSON.stringify(window.__qa.audits[0])'))
      check('the music STOPS under the ad', b.audioAtOpen.count > 0 && b.audioAtOpen.allPaused && !b.musicAtOpen,
        JSON.stringify(b.audioAtOpen))
      check('the world freezes under the ad', b.rafAfter1s - b.rafAtOpen <= 2, `frames ${b.rafAtOpen} → ${b.rafAfter1s}`)
      await waitAdClosed()
      const b2 = JSON.parse(await ev('JSON.stringify(window.__qa.audits[0])'))
      check('…and stays stopped past the 6 s cap', b2.audioPastCap.count > 0 && b2.audioPastCap.allPaused && !b2.musicPastCap,
        JSON.stringify(b2.audioPastCap))
      check('the music comes back after the ad (the live run owed it a restart)',
        await waitFor('window.__qa.musicLive()', 6000, 250))
    }

    // ── The portal's own pause signal, outside an ad ────────────────────────
    // GameMonetize's SDK sends the same SDK_GAME_PAUSE / SDK_GAME_START pair
    // for its consent wall; the game must stop its LOOP and its sound for it,
    // and come back on the resume — not just pause the music.
    console.log('\nportal pause / resume (SDK_GAME_PAUSE without an ad)')
    const p0 = await ev('window.__qa.progress()'); await sleep(800); const p1 = await ev('window.__qa.progress()')
    check('control: the world runs', p1 - p0 > 5, `frames ${p0} → ${p1}`)
    await ev("window.__qa.gmEmit('SDK_GAME_PAUSE')")
    await sleep(300)
    const p2 = await ev('window.__qa.progress()'); await sleep(1500); const p3 = await ev('window.__qa.progress()')
    check('SDK_GAME_PAUSE → simulation FROZEN', p3 - p2 <= 2, `frames ${p2} → ${p3}`)
    const pausedAudio = JSON.parse(await ev('JSON.stringify(window.__qa.audioState())'))
    check('SDK_GAME_PAUSE → all audio suspended', pausedAudio.count > 0 && pausedAudio.allPaused, JSON.stringify(pausedAudio))
    await ev("window.__qa.gmEmit('SDK_GAME_START')")
    await sleep(1200)
    const p4 = await ev('window.__qa.progress()')
    check('SDK_GAME_START → simulation RESUMES', p4 - p3 > 5, `frames ${p3} → ${p4}`)
    check('SDK_GAME_START → music back', await waitFor('window.__qa.musicLive()', 5000, 250))
    note('mute: GameMonetize\'s SDK has no mute signal and no language signal — nothing to wire, nothing to test')
  }

  if (PLATFORM !== 'gamemonetize') {
    await boot()
    await sleep(2000)
    for (let i = 0; i < 160 && await ev('!!window.__qa.adOpen'); i++) await sleep(500)
    await pickHero()
    // Mute, on the flow QA runs: already muted at boot, then unmute.
    if (await ev("typeof window.__qa.portalMute === 'function'")) {
      await sleep(2500)
      check('portal muted at boot → no music', !(await ev('window.__qa.musicLive()')))
      check('soundOn callback registered on the SDK', await ev('window.__qa.portalMute(false)') === true)
      check('portal unmute → music DOES start', await waitFor('window.__qa.musicLive()', 4000, 250))
    }
  }

  // ── Tab away: the control case FIRST ──────────────────────────────────────
  console.log('\ntab away / back')
  const before = await ev('window.__qa.progress()')
  await sleep(1200)
  const moving = await ev('window.__qa.progress()')
  check('control: the world runs while visible', moving - before > 5, `frames ${before} → ${moving}`)
  await ev('window.__qa.setHidden(true)')
  await sleep(300)
  const hiddenStart = await ev('window.__qa.progress()')
  await sleep(1800)
  const hiddenEnd = await ev('window.__qa.progress()')
  check('tab away → simulation FROZEN', hiddenEnd - hiddenStart <= 2, `frames ${hiddenStart} → ${hiddenEnd}`)
  const hiddenAudio = JSON.parse(await ev('JSON.stringify(window.__qa.audioState())'))
  check('tab away → all audio suspended', hiddenAudio.count > 0 && hiddenAudio.allPaused, JSON.stringify(hiddenAudio))
  await ev('window.__qa.setHidden(false)')
  await sleep(1500)
  const back = await ev('window.__qa.progress()')
  check('return to tab → simulation RESUMES', back - hiddenEnd > 5, `frames ${hiddenEnd} → ${back}`)

  // ── The pause menu, then the result screen and the midgame ad ────────────
  console.log('\npause menu → retreat → result screen → Continue')
  const inZone = await ev('!!document.querySelector(".hud--zone")')
  if (!inZone) note('not in a zone (the save opened elsewhere) — the result-screen checks need one')
  let opened = await clickButton('/^Pause$/i')
  if (!opened) { await pressKey('Escape', 'Escape'); opened = 'escape' }
  const menuUp = await waitFor('!!document.querySelector(".pause")', 3000, 150)
  await sleep(500)
  const menuStart = await ev('window.__qa.progress()')
  await sleep(1500)
  const menuEnd = await ev('window.__qa.progress()')
  check('pause menu open → simulation FROZEN', menuUp && menuEnd - menuStart <= 2, `${opened}; frames ${menuStart} → ${menuEnd}`)
  // By design a menu freezes the world but NOT the sound (isAudioPaused): only
  // ads, a hidden tab and a platform pause silence it.
  const menuAudio = JSON.parse(await ev('JSON.stringify(window.__qa.audioState())'))
  check('pause menu open → audio stays live (menus freeze the game, not the sound)',
    menuAudio.count > 0 && !menuAudio.allPaused, JSON.stringify(menuAudio))

  if (PLATFORM === 'gamemonetize' && inZone) {
    const adsBefore = await ev('window.__qa.audits.length')
    const retreated = await clickButton('/Retreat to the map/i')
    const resultsUp = await waitFor('!!document.querySelector(".results")', 15000, 200)
    check('retreat → the result screen opens', retreated && resultsUp,
      retreated && resultsUp ? '' : `retreat button ${retreated ? 'clicked' : 'not found'}; buttons: ${await ev("JSON.stringify(Array.from(document.querySelectorAll('button')).map(b => (b.textContent || b.getAttribute('aria-label') || '').trim()).filter(Boolean).slice(0, 12))")}`)
    // Every interstitial is due again: move the pacing clock past the 121 s
    // gap the first-load ad started, instead of waiting it out.
    await ev('window.__qa.skewMs += 130000')
    await sleep(1500)
    check('no ad opens ON the result screen (it is read first; the ad waits for Continue)',
      (await ev('window.__qa.audits.length')) === adsBefore && await ev('!!document.querySelector(".results")'))
    await clickButton('/^Continue$/i')
    const midAd = await waitFor(`window.__qa.audits.length > ${adsBefore} && window.__qa.audits[${adsBefore}].audioAtOpen !== null`, 8000, 150)
    check('Continue → the midgame interstitial is requested', midAd)
    if (midAd) {
      await sleep(1500)
      const m = JSON.parse(await ev(`JSON.stringify(window.__qa.audits[${adsBefore}])`))
      check('the result screen is CLOSED before the ad is requested — never under or over it',
        !m.resultsAtRequest && !m.resultsAtOpen, `results at request ${m.resultsAtRequest}, at open ${m.resultsAtOpen}`)
      check('the world is frozen under the midgame ad', m.rafAfter1s - m.rafAtOpen <= 2, `frames ${m.rafAtOpen} → ${m.rafAfter1s}`)
      check('no sound under the midgame ad', m.audioAtOpen.count > 0 && m.audioAtOpen.allPaused && !m.musicAtOpen, JSON.stringify(m.audioAtOpen))
      await waitAdClosed()
      const m2 = JSON.parse(await ev(`JSON.stringify(window.__qa.audits[${adsBefore}])`))
      check('…still silent past the 6 s cap', m2.audioPastCap.count > 0 && m2.audioPastCap.allPaused && !m2.musicPastCap, JSON.stringify(m2.audioPastCap))
      check('after the ad: the world map, with music',
        await waitFor('!!document.querySelector(".wmap")', 8000, 200) && await waitFor('window.__qa.musicLive()', 6000, 250))
    }
  }

  // ── Nothing else on the wire, nothing red in the console ─────────────────
  console.log('\nnetwork and console')
  const own = new Set([`${plat.host}:${PORT}`, plat.host])
  const external = requests.filter(u => /^https?:/i.test(u)).filter(u => !own.has(new URL(u).host))
  const allowed = plat.fingerprint ? external.filter(u => u.includes(plat.fingerprint)) : []
  const foreign = external.filter(u => !allowed.includes(u))
  check(`no external request except ${plat.fingerprint ?? 'none'}`, foreign.length === 0,
    foreign.length ? [...new Set(foreign)].slice(0, 6).join(', ') : `${allowed.length} SDK request(s), ${requests.length} total`)
  check('zero console errors across the run', consoleErrors.length === 0, consoleErrors.slice(0, 6).join(' | '))
} catch (e) {
  check('the run completed', false, String(e?.message ?? e))
} finally {
  const failed = results.filter(r => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  if (failed.length) console.log('FAILED: ' + failed.map(f => f.name).join('; '))
  if (!KEEP) {
    try { ws.close() } catch { /* gone */ }
    await fetch(`${api}/close/${target.id}`).catch(() => {})
    if (process.platform === 'win32' && chrome.pid) { try { (await import('node:child_process')).execSync(`taskkill /PID ${chrome.pid} /T /F`, { stdio: 'ignore', windowsHide: true }) } catch { /* gone */ } } else chrome.kill()
    server.close()
    await sleep(500)
    try { rmSync(PROFILE, { recursive: true, force: true }) } catch { /* Chrome may still hold a lock */ }
    process.exit(failed.length ? 1 : 0)
  } else {
    console.log(`\n--keep: browser left open on http://${plat.host}:${PORT} (ctrl-c to stop)`)
  }
}
