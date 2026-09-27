#!/usr/bin/env node
// ─── pnpm deploy:playgama ───────────────────────────────────────────────────
//
//   1. bump    package.json patch version       (the name the archive gets)
//   2. build   the project's Playgama build     (build + pack + release gates)
//   3. sign in the Playgama Developer Cabinet   (OAuth, once; cached after)
//   4. upload  start → PUT → confirm, as `<prefix>-<version>`
//   5. check   poll the cabinet's build check until it answers
//   6. QA      open the QA Tool on the archive just uploaded
//
// Step 6 opens the Guided Certification; walking it (and answering its
// questions truthfully) is the human's or Claude's job — the
// `playgama-deploy-qa` skill carries the procedure. Submitting to moderation,
// publishing the sandbox and buying traffic are deliberately NOT in this list:
// they are the developer's clicks in the cabinet.
//
// Usage:
//   pnpm deploy:playgama                  the whole pipeline
//   pnpm deploy:playgama --no-bump        reuse the current version number
//   pnpm deploy:playgama --version 1.2.0  set an exact version
//   pnpm deploy:playgama --skip-build     upload the zip that is already there
//   pnpm deploy:playgama --dry-run        bump nothing, upload nothing: build,
//                                         sign in, resolve the game, report
//   pnpm deploy:playgama --no-open        print the QA Tool link, open nothing
//   pnpm deploy:playgama --status         launch steps, submission state,
//                                         newest archive, moderation comments
//   pnpm deploy:playgama --app-id <id>    the cabinet game for this run
//
// The first run opens the cabinet's sign-in page in your default browser; the
// session is kept in ~/.playgama-deploy/oauth.json for every later run (and
// every other game — one account serves them all).

import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

import { connect, openInBrowser } from './lib/cabinet.mjs'
import { bold, bytes, cyan, die, dim, fail, info, pass, step, warn } from './lib/log.mjs'
import { bumpPatch, readVersion, writeVersion } from './lib/version.mjs'
import { inspectZip, listZip, zipDir } from './lib/zip.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..', '..')
const PKG = join(ROOT, 'package.json')

const argv = process.argv.slice(2)
const flag = (n) => argv.includes(`--${n}`)
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d }
const shown = (p) => relative(ROOT, p).split('\\').join('/')

const cfgPath = resolve(ROOT, arg('config', 'tools/playgama-deploy/playgama.config.mjs'))
if (!existsSync(cfgPath)) die(`no config at ${shown(cfgPath)}`, 'copy playgama.config.mjs from the playgama-deploy-qa skill and fill it in')
const cfg = (await import(pathToFileURL(cfgPath).href)).default

const DRY = flag('dry-run')
const STATUS = flag('status')

/** `pnpm run x` where the repo is a pnpm repo, `npm run x` otherwise. */
const runScript = (name) => {
  const pm = existsSync(join(ROOT, 'pnpm-lock.yaml')) ? 'pnpm' : existsSync(join(ROOT, 'yarn.lock')) ? 'yarn' : 'npm'
  const r = spawnSync(pm, ['run', name], { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' })
  return r.status === 0
}

const log = (msg, detail) => info(msg, detail)

/** Sign in, or stop with the next action instead of a stack trace. */
const signIn = async () => {
  try {
    return await connect({ log })
  } catch (e) {
    die(`could not sign in to the Playgama cabinet: ${e.message ?? e}`,
      'open the printed link in a browser where you are logged in to developer.playgama.com, approve, and run again (delete ~/.playgama-deploy/oauth.json to start over)')
  }
}

// ─── The game ───────────────────────────────────────────────────────────────

const resolveGame = async (cab) => {
  const wanted = arg('app-id', cfg.applicationId)
  if (wanted) return wanted
  if (!cfg.title) die('neither applicationId nor title is configured', `set one in ${shown(cfgPath)}`)
  const all = []
  for (let skip = 0; ; skip += 100) {
    const page = await cab.call('list_applications', { limit: 100, skip })
    all.push(...(page.list ?? []))
    if (all.length >= (page.total ?? 0) || !(page.list ?? []).length) break
  }
  const hits = all.filter((a) => a.title === cfg.title)
  if (hits.length !== 1) {
    die(`${hits.length} games in the cabinet are titled "${cfg.title}"`,
      hits.length ? `pick one with --app-id: ${hits.map((h) => h.id).join(', ')}` : 'create the game in the cabinet first, or fix `title`')
  }
  info(`game ${bold(cfg.title)}`, `${hits[0].id} — put it in applicationId to skip this lookup`)
  return hits[0].id
}

const summarizeSteps = (steps) => {
  for (const s of steps.steps ?? []) {
    const line = `${s.id.padEnd(8)} ${s.state}${s.reason ? ` (${s.reason})` : ''}`
    if (s.state === 'DONE') pass(line)
    else if (s.state === 'FAILED' || s.state === 'BLOCKED') fail(line, (s.nextTools ?? []).join(', '))
    else warn(line, (s.nextTools ?? []).join(', '))
  }
  if (steps.current) info(`current step: ${bold(steps.current)}`)
}

// ─── --status ───────────────────────────────────────────────────────────────

if (STATUS) {
  step('Cabinet status')
  const cab = await signIn()
  const appId = await resolveGame(cab)
  const steps = await cab.call('get_launch_steps', { applicationId: appId })
  summarizeSteps(steps)
  const sub = await cab.call('get_submission_state', { applicationId: appId })
  info(`submission: status ${bold(sub.status)} · certification ${sub.certificationPassedLevel ?? 'none'} · ${sub.allowed ? 'can submit' : `cannot submit (${sub.reason})`}`)
  if (steps.archiveId) {
    const st = await cab.call('get_archive_status', { applicationId: appId, archiveId: steps.archiveId })
    info(`newest archive ${bold(st.name)}: ${st.state?.status}${st.state?.message ? ` — ${st.state.message}` : ''}`)
  }
  const comments = await cab.call('list_moderation_comments', { applicationId: appId })
  const text = JSON.stringify(comments)
  info(text.length > 2 && text !== '[]' && text !== '{}' ? `moderation comments:\n${JSON.stringify(comments, null, 2)}` : 'no moderation comments')
  process.exit(0)
}

// ─── 1. Version ─────────────────────────────────────────────────────────────

step('Version')
const current = readVersion(PKG)
let version = current
if (arg('version')) version = arg('version')
else if (!flag('no-bump') && !DRY && !flag('skip-build')) version = bumpPatch(current)
if (version !== current) {
  writeVersion(PKG, version)
  pass(`package.json ${current} → ${bold(version)}`)
} else {
  info(`version ${bold(version)}`, DRY ? 'dry run: not bumped' : 'unchanged')
}
const archiveName = `${cfg.archivePrefix}-${version}`

// ─── 2. Build ───────────────────────────────────────────────────────────────

const zipPath = resolve(ROOT, cfg.zip)
if (flag('skip-build')) {
  step('Build (skipped)')
  if (!existsSync(zipPath)) die(`${shown(zipPath)} does not exist`, `drop --skip-build, or run \`${cfg.buildScript}\` first`)
  info(`reusing ${shown(zipPath)}`, `built ${statSync(zipPath).mtime.toISOString()}`)
} else {
  step(`Build (${cfg.buildScript})`)
  if (!runScript(cfg.buildScript)) die(`${cfg.buildScript} failed`, 'fix the build or the release gates it reports, then run again')
  pass(`${cfg.buildScript} finished`)
}

if (cfg.pack?.dist) {
  step('Pack')
  const packed = zipDir(resolve(ROOT, cfg.pack.dist), zipPath, { exclude: (n) => n.endsWith('.zip') || /-original\.(png|jpe?g|webp)$/i.test(n) })
  pass(`packed ${shown(zipPath)}`, `${packed.entries} entries, ${bytes(packed.bytes)}`)
}

const z = inspectZip(zipPath)
if (!z.ok) die(`${shown(zipPath)} is not an uploadable zip: ${z.why}`)
if (!listZip(zipPath).includes('index.html')) die(`${shown(zipPath)} has no index.html at its root`, 'Playgama needs index.html at the root (or in one top-level folder)')
const upload = join(dirname(zipPath), `${archiveName}.zip`)
copyFileSync(zipPath, upload)
const size = statSync(upload).size
pass(`archive ${shown(upload)}`, bytes(size))

// ─── 3. Sign in + find the game ─────────────────────────────────────────────

step('Playgama Developer Cabinet')
const cab = await signIn()
pass('signed in', cab.server?.name ?? '')
const appId = await resolveGame(cab)
const app = await cab.call('get_application', { applicationId: appId })
info(`game ${bold(app.title)}`, `status ${app.status}`)
if ((app.archives ?? []).some((a) => a.name === archiveName)) {
  die(`the game already has an archive named ${archiveName}`, 'bump the version (drop --no-bump) — two builds under one name cannot be told apart')
}

if (DRY) {
  warn('dry run: nothing uploaded')
  process.exit(0)
}

// ─── 4. Upload ──────────────────────────────────────────────────────────────

step(`Upload ${archiveName}`)
const started = await cab.call('start_archive_upload', { applicationId: appId, name: archiveName, contentSize: size })
const put = await fetch(started.uploadUrl, {
  method: started.method ?? 'PUT',
  headers: { ...(started.headers ?? { 'Content-Type': 'application/zip' }), 'Content-Length': String(size) },
  body: readFileSync(upload),
  duplex: 'half'
})
if (!put.ok) die(`storage refused the upload: HTTP ${put.status} ${(await put.text()).slice(0, 300)}`)
pass('uploaded', `HTTP ${put.status}`)
await cab.call('confirm_archive_upload', { applicationId: appId, archiveId: started.archiveId })
pass('confirmed', started.archiveId)

// ─── 5. Build check ─────────────────────────────────────────────────────────

step('Cabinet build check')
let st = null
const t0 = Date.now()
for (;;) {
  st = await cab.call('get_archive_status', { applicationId: appId, archiveId: started.archiveId })
  if (st.processing === 'FAILED') die(`unpacking failed: ${st.errorMessage ?? st.failedAt}`, 'upload a corrected zip')
  if (st.processing === 'DONE' && st.state?.status && st.state.status !== 'CHECKING') break
  if (Date.now() - t0 > 10 * 60_000) die('the build check is still running after 10 minutes', 'check later with --status')
  await sleep(5000)
}
if (st.state.status === 'PASSED') {
  pass(`build check PASSED`, `Bridge ${st.analysis?.bridgeVersion ?? '?'} (${st.bridgeSdk})`)
} else {
  // The cabinet's own words ARE the diagnosis — never paraphrase them.
  fail(`build check ${st.state.status}`, st.state.reason ?? '')
  console.log(`\n   ${st.state.message}\n`)
  const cert = await cab.call('get_archive_qa_tool_link', { applicationId: appId, archiveId: started.archiveId, mode: 'certification' })
  die('the build did not pass the cabinet check', `startup log: ${cert.url}`)
}

// ─── 6. QA Tool ─────────────────────────────────────────────────────────────

step('QA Tool')
const qa = await cab.call('get_archive_qa_tool_link', { applicationId: appId, archiveId: started.archiveId })
info(`QA Tool: ${cyan(qa.url)}`)
if (!flag('no-open')) openInBrowser(qa.url)
const steps = await cab.call('get_launch_steps', { applicationId: appId })
summarizeSteps(steps)

const report = {
  at: new Date().toISOString(),
  version,
  archiveName,
  applicationId: appId,
  archiveId: started.archiveId,
  bytes: size,
  check: st.state,
  qaToolUrl: qa.url,
  qaAnswers: cfg.qaAnswers ?? {}
}
const reportPath = join(dirname(zipPath), `deploy-playgama-${version}.json`)
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')
info(`report ${shown(reportPath)}`)

console.log(`
   ${bold('Next')}: in the QA Tool choose ${bold('Guided Certification')} → Basic, then ${bold('Extended')}.
   Standing answers: ${Object.entries(cfg.qaAnswers ?? {}).map(([q, a]) => `"${q}" → ${a}`).join('; ') || 'none'}.
   ${dim('Submitting to moderation is your click in the cabinet; this pipeline never does it.')}
`)
