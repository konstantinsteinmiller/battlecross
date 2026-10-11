import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { cpSync, existsSync, createReadStream } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * The player wiki (konstantinsteinmiller.github.io/battlecross/wiki): a
 * separate Vue app that imports the game's OWN data modules, so every number
 * on the site is the number the game plays with. Built into dist/wiki by
 * `pnpm wiki:build` (the Pages workflow runs it after the game's build).
 *
 * The art is the game's: the painted icons and portraits are served from
 * public/images in dev and copied to dist/wiki/img on build.
 */
const ROOT = dirname(fileURLToPath(import.meta.url))
const IMAGES = resolve(ROOT, '../public/images')
const ART_DIRS = ['skills', 'items', 'icons', 'portraits', 'ui', 'logo']
const FONT = resolve(ROOT, '../src/assets/css/font')
const COVERS = resolve(ROOT, '../store-art/covers/masters')

const gameArt = (): Plugin => {
  let outDir = ''
  return {
    name: 'wiki-game-art',
    configResolved(c) { outDir = c.build.outDir },
    configureServer(server) {
      server.middlewares.use('/img', (req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0]!)
        const base = url.startsWith('/covers/') ? COVERS : IMAGES
        const file = join(base, url.replace('/covers/', '/'))
        if (!file.startsWith(base) || !existsSync(file)) return next()
        res.setHeader('Content-Type', file.endsWith('.png') ? 'image/png' : 'image/webp')
        createReadStream(file).pipe(res)
      })
    },
    closeBundle() {
      for (const d of ART_DIRS) cpSync(join(IMAGES, d), join(outDir, 'img', d), { recursive: true })
      cpSync(COVERS, join(outDir, 'img', 'covers'), { recursive: true })
    }
  }
}

export default defineConfig({
  root: ROOT,
  base: './',
  publicDir: false,
  plugins: [vue(), gameArt()],
  resolve: { alias: { '@': resolve(ROOT, '../src'), '@font': FONT } },
  build: { outDir: resolve(ROOT, '../dist/wiki'), emptyOutDir: true, chunkSizeWarningLimit: 1500 },
  server: { port: 5199, strictPort: false }
})
