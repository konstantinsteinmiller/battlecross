#!/usr/bin/env node
/**
 * Renders every raster app icon from the one source, public/icons/icon.svg.
 *
 *   node scripts/render-icons.mjs
 *
 * Writes:
 *   public/icons/icon-192.png, icon-512.png   the rounded tile, transparent corners
 *   public/icons/apple-touch-icon.png (180)    full bleed (iOS rounds it itself)
 *   public/icons/icon-maskable-512.png         full bleed, badge inside the
 *                                              safe zone (the inner 80% circle)
 *   public/favicon.ico                         16 + 32 + 48, PNG-compressed entries
 *
 * Rendered by Chrome, not by an SVG library: icon.svg swaps to a bold
 * small-size mark through a media query evaluated against the image's own
 * size, which only a browser does, and a tab favicon IS rendered by the
 * browser. So the 16 and 32 px favicon layers are exactly what a tab shows
 * for the SVG favicon. Chrome comes from CHROME_PATH (default: the Windows
 * install path, as the other scripts here).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const svg = readFileSync(`${root}public/icons/icon.svg`, 'utf8')
const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

/** Content scale of the maskable render: the badge's furthest point (the
 *  antenna bead) lands at ~180 of the 204.8 px safe-zone radius at 512. */
const MASKABLE_SCALE = 0.84

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await (await browser.newContext({ deviceScaleFactor: 1 })).newPage()

/** The SVG as an <img>: its media query sees `size`, the corners stay clear. */
const asImage = async (size) => {
  await page.setViewportSize({ width: Math.max(size, 64), height: Math.max(size, 64) })
  await page.setContent(`<body style="margin:0;background:transparent"><img src="${dataUri}" width="${size}" height="${size}" style="display:block"></body>`)
  await page.waitForFunction(() => document.images[0]?.complete)
  return page.screenshot({ clip: { x: 0, y: 0, width: size, height: size }, omitBackground: true })
}

/** The SVG inlined, tile squared off and the badge scaled: a full-bleed square. */
const fullBleed = async (size, scale) => {
  await page.setViewportSize({ width: size, height: size })
  const css = [
    'body{margin:0}',
    `svg{display:block;width:${size}px;height:${size}px}`,
    'svg .bg rect{rx:0;ry:0}',
    `svg .d{transform:translate(256px,256px) scale(${scale}) translate(-256px,-256px)}`
  ].join('')
  await page.setContent(`<style>${css}</style>${svg}`)
  return page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } })
}

const png = (buf) => sharp(buf).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()

/** An .ico whose entries are PNG streams (Vista+ and every browser read these). */
const ico = (entries) => {
  const head = Buffer.alloc(6 + 16 * entries.length)
  head.writeUInt16LE(0, 0)
  head.writeUInt16LE(1, 2)
  head.writeUInt16LE(entries.length, 4)
  let offset = head.length
  entries.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i
    head.writeUInt8(size >= 256 ? 0 : size, e)
    head.writeUInt8(size >= 256 ? 0 : size, e + 1)
    head.writeUInt8(0, e + 2) // palette size
    head.writeUInt8(0, e + 3) // reserved
    head.writeUInt16LE(1, e + 4) // colour planes
    head.writeUInt16LE(32, e + 6) // bits per pixel
    head.writeUInt32LE(data.length, e + 8)
    head.writeUInt32LE(offset, e + 12)
    offset += data.length
  })
  return Buffer.concat([head, ...entries.map((x) => x.data)])
}

const out = {}
for (const size of [192, 512]) out[`public/icons/icon-${size}.png`] = await png(await asImage(size))
out['public/icons/apple-touch-icon.png'] = await png(await fullBleed(180, 1))
out['public/icons/icon-maskable-512.png'] = await png(await fullBleed(512, MASKABLE_SCALE))
const fav = []
for (const size of [16, 32, 48]) fav.push({ size, data: await png(await asImage(size)) })
out['public/favicon.ico'] = ico(fav)

await browser.close()
for (const [rel, buf] of Object.entries(out)) {
  writeFileSync(`${root}${rel}`, buf)
  console.log(`${rel}  ${buf.length} bytes`)
}
