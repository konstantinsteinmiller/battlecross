import sharp from 'sharp'
import fs from 'node:fs'
const [d, prefix, cols, scale, out] = process.argv.slice(2)
const files = fs.readdirSync(d).filter(f => f.endsWith('.png')).sort()
const meta = await sharp(`${d}/${files[0]}`).metadata()
const w = Math.round(meta.width * +scale), h = Math.round(meta.height * +scale)
const C = +cols, rows = Math.ceil(files.length / C)
const comps = []
for (let i = 0; i < files.length; i++) {
  const buf = await sharp(`${d}/${files[i]}`).resize(w, h).toBuffer()
  const x = (i % C) * w, y = Math.floor(i / C) * (h + 18)
  comps.push({ input: buf, left: x, top: y + 18 })
  const label = Buffer.from(`<svg width="${w}" height="18"><text x="4" y="14" font-size="13" fill="white" font-family="sans-serif">${files[i]}</text></svg>`)
  comps.push({ input: label, left: x, top: y })
}
await sharp({ create: { width: C * w, height: rows * (h + 18), channels: 3, background: '#000' } }).composite(comps).png().toFile(out)
