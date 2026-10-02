#!/usr/bin/env node
/**
 * Pack a build folder into the zip a portal's upload form takes.
 *
 *   node scripts/zip-dist.mjs <name> [dir=dist]
 *
 * Writes `<dir>/<name>.zip` with `index.html` at the archive ROOT.
 *
 * Why not `tar -a -cf x.zip *` (what these build scripts used): which `tar`
 * answers depends on the shell. Windows' bsdtar writes a zip; the GNU tar that
 * Git Bash puts first on the PATH writes a TAR under a .zip name, which a
 * portal's upload form rejects without saying why. And `*` skips dot-files.
 * The writer below is the one the Poki deploy already relies on (plain
 * deflate, forward slashes, UTF-8 names, no data descriptors).
 */
import { existsSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { inspectZip, listZip, zipDir } from '../tools/poki-deploy/lib/zip.mjs'

const [name, dirArg = 'dist'] = process.argv.slice(2)
if (!name) {
  console.error('usage: node scripts/zip-dist.mjs <name> [dir]')
  process.exit(2)
}
const dir = resolve(dirArg)
if (!existsSync(join(dir, 'index.html'))) {
  console.error(`[zip-dist] ${dir} has no index.html: build first`)
  process.exit(1)
}
const out = join(dir, `${name}.zip`)
// A zip from an earlier run must not end up inside the new one.
rmSync(out, { force: true })
zipDir(dir, out, { exclude: n => n.endsWith('.zip') || n.endsWith('.map') })

const info = inspectZip(out)
if (!info.ok) {
  console.error(`[zip-dist] ${info.why}`)
  process.exit(1)
}
if (!listZip(out).includes('index.html')) {
  console.error('[zip-dist] index.html is not at the archive root')
  process.exit(1)
}
console.log(`[zip-dist] ${out} (${(info.bytes / 1024 / 1024).toFixed(2)} MB, ${info.entries} files)`)
