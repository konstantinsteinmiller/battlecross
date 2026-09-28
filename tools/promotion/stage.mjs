// node stage.mjs URL W H OUT.png STAGE.js
// Loads the dev game at W×H, waits for play, skips nothing else, runs the
// staging script (an async function body with `mod(path)` to import the app's
// own module instances), prints its return value, and screenshots.
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const [URL_, W, H, OUT, STAGE] = process.argv.slice(2)
const port = 20000 + Math.floor(Math.random() * 20000)
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [`--remote-debugging-port=${port}`, '--headless=new', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'stage-'))}`, '--no-first-run', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
let targets; for (let i = 0; i < 60 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json() } catch { await sleep(200) } }
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r))
let id = 0; const pending = new Map(); const errs = []
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) }
  if (d.method === 'Runtime.exceptionThrown') errs.push(JSON.stringify(d.params.exceptionDetails).slice(0, 400)) })
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async (e) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.result?.exceptionDetails) return 'EXC: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 600); return r.result?.result?.value }
await send('Runtime.enable'); await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: URL_ })
await sleep(20000)
const helper = `window.mod = (f) => import(performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes(f)) || f); 1`
await ev(helper)
// Wait for play
for (let i = 0; i < 60; i++) {
  const ph = await ev(`mod('/src/game/state/hud.ts').then(h => h.hud.phase)`)
  if (ph === 'play') break
  await sleep(500)
}
const body = (process.env.PLATE ? `window.__plate = ${process.env.PLATE};` : '') + readFileSync(STAGE, 'utf8')
const res = await ev(`(async () => { ${body} })()`)
console.log('stage:', typeof res === 'string' ? res : JSON.stringify(res))
await sleep(600)
const shot = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync(OUT, Buffer.from(shot.result.data, 'base64'))
if (errs.length) console.log('errors:', errs.slice(0, 3))
ws.close(); chrome.kill(); process.exit(0)
