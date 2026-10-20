// Judge the failing lines again from their stored Whisper reads, with no new
// synthesis and no new read-back, and ship the ones that pass now exactly as
// generate.mjs ships a passing take (encode the best master, book it in
// vo-src/shipped.json, rewrite the to-do list). For a change to the judge
// (qa.mjs) that should reach lines voiced before it.
//   pnpm voice:rejudge                     chatterbox, live
//   pnpm voice:rejudge --engine qwen --dry  only list what would ship
//
// Never run it while a voice:gen run of the same engine is going: that run
// rewrites the results file and shipped.json from what it read at its start.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { ROOT, VO_SRC, args } from './lib.mjs'
import { encode } from './post.mjs'
import { judge, pickBest } from './qa.mjs'

const a = args()
const engineName = a.engine ?? 'chatterbox'
const mode = a.jobs ?? 'live'
const resultsFile = join(VO_SRC, 'gen', engineName, `${mode}-results.json`)
const bookFile = join(VO_SRC, 'shipped.json')
const data = JSON.parse(readFileSync(resultsFile, 'utf8'))
const book = existsSync(bookFile) ? JSON.parse(readFileSync(bookFile, 'utf8')) : {}
const day = new Date().toISOString().slice(0, 10)

const failing = data.results.filter(r => r.best == null)
const shipped = []
for (const r of failing) {
  if (r.takes.some(t => t.heard === undefined)) continue // never read back: needs Whisper, not a re-judge
  const takes = r.takes.map(t => ({ ...t, qa: judge(t, r.job.max) }))
  const best = pickBest(takes)
  if (!best || !existsSync(best.master)) continue
  shipped.push({ r, takes, best })
}
for (const { r, best } of shipped) console.log(`  ✔ ${r.job.id} t${best.take} — heard "${best.heard}"`)
console.log(`${shipped.length}/${failing.length} failing lines pass now${a.dry ? ' (dry run: nothing shipped)' : ''}`)
if (a.dry || !shipped.length) process.exit(0)

for (const { r, takes, best } of shipped) {
  const out = join(ROOT, r.job.out)
  await encode(best.master, out)
  r.takes = takes
  r.best = best.take
  r.shipped = relative(ROOT, out).replaceAll('\\', '/')
  book[r.job.id] = { engine: engineName, at: day, hash: r.job.hash }
}
writeFileSync(bookFile, `${JSON.stringify(Object.fromEntries(Object.entries(book).sort(([x], [y]) => x.localeCompare(y))), null, 2)}\n`)
writeFileSync(resultsFile, `${JSON.stringify(data, null, 2)}\n`)
const { writeVoiceTodo } = await import('./todo.mjs')
writeVoiceTodo()
