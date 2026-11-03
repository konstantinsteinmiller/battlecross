#!/usr/bin/env node
/**
 * What one page load of a RUNNING dev server transfers: every response's bytes, grouped by the first folders of its path, biggest
 * first, up to the hero choice (or `--wait` seconds). Nothing is started or stopped here.
 *   node scripts/load-bytes.mjs [http://localhost:2194/] [--wait 40]
 */
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
const START = process.argv.find(a => a.startsWith('http')) ?? 'http://localhost:2194/'
const wi = process.argv.indexOf('--wait')
const WAIT = (wi > 0 ? Number(process.argv[wi + 1]) : 40) * 1000
const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-bytes-')), {
  channel: 'chrome', headless: false, viewport: { width: 1100, height: 700 }, locale: 'en-US',
  args: ['--mute-audio']
})
await ctx.routeWebSocket(/.*/, () => {})
const page = ctx.pages()[0] ?? await ctx.newPage()
const rows = []
page.on('response', async (r) => {
  try {
    const len = Number(r.headers()['content-length'] ?? 0) || (await r.body().catch(() => Buffer.alloc(0))).length
    rows.push({ url: new URL(r.url()).pathname, len })
  } catch { /* gone */ }
})
await page.goto(START, { waitUntil: 'commit', timeout: 120000 })
await page.waitForTimeout(WAIT)
const group = new Map()
for (const r of rows) {
  const parts = r.url.split('/').filter(Boolean)
  const key = '/' + parts.slice(0, parts[0] === 'src' || parts[0] === 'node_modules' ? 2 : 3).join('/')
  const g = group.get(key) ?? { n: 0, bytes: 0 }
  g.n++; g.bytes += r.len
  group.set(key, g)
}
const total = rows.reduce((a, r) => a + r.len, 0)
console.log('requests', rows.length, 'total MB', (total / 1048576).toFixed(1))
for (const [k, g] of [...group].sort((a, b) => b[1].bytes - a[1].bytes).slice(0, 25)) console.log((g.bytes / 1048576).toFixed(1).padStart(8), 'MB', String(g.n).padStart(5), k)
console.log('biggest files:')
for (const r of [...rows].sort((a, b) => b.len - a.len).slice(0, 12)) console.log((r.len / 1048576).toFixed(2).padStart(8), 'MB', r.url)
await ctx.close().catch(() => {})
process.exit(0)
