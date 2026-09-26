// @vitest-environment node
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { GAME_ICON_NAMES, type GameIconName } from '@/components/icons/iconNames'
import { ICON_PATHS } from '@/components/icons/iconPaths'
import { SLOT_ICON } from '@/components/hub/gearFormat'

// ─── The hero wears his face; his helmet is a piece of kit ─────────────────
//
// The hub's hero tab used to wear a round helmet with a stripe, and a
// playtester read "Cobalt" plus a helmet as a metal and a piece of kit, not
// as the character. The tab (and his name plate) now wear `android`: his head,
// with the visor band punched through the shell, two eye-lights standing in
// the band, and the one sensor blade with its bead. The head GEAR slot keeps
// `helmet`, now a side view of a visor helmet with no eyes: two things, two
// drawings.
//
// A test cannot judge likeness, but it can hold the anatomy, by rendering each
// glyph exactly as GameIcon does (all sub-paths as ONE path, nonzero winding)
// and probing points. A winding slip fills a band or a window back in, and
// the face would read as a plain blob.

const SCALE = 10
const PX = 24 * SCALE

const render = async (name: GameIconName): Promise<(x: number, y: number) => number> => {
  const d = ICON_PATHS[name].join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PX}" height="${PX}" viewBox="0 0 24 24"><path d="${d}" fill="#000"/></svg>`
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const at = (v: number) => Math.min(PX - 1, Math.max(0, Math.round(v * SCALE)))
  // alpha at a point given in glyph units
  return (x, y) => data[(at(y) * info.width + at(x)) * info.channels + 3]!
}

const edgeAlpha = async (name: GameIconName): Promise<number> => {
  const alpha = await render(name)
  const edge: number[] = []
  for (let t = 0; t <= 24; t += 0.25) edge.push(alpha(t, 0.5), alpha(t, 23.5), alpha(0.5, t), alpha(23.5, t))
  return Math.max(...edge)
}

describe("'android' is Flux's face", () => {
  it('is a registered glyph', () => {
    expect(GAME_ICON_NAMES).toContain('android')
  })

  it('stays inside the 24 x 24 box with a margin', async () => {
    expect(await edgeAlpha('android')).toBe(0)
  })

  it('has a solid shell: dome, temples and chin', async () => {
    const alpha = await render('android')
    for (const [x, y] of [[13, 6.5], [5, 12], [21, 12], [13, 19]] as const) {
      expect(alpha(x, y), `(${x}, ${y})`).toBe(255)
    }
  })

  it('has a see-through visor band, between and beside the eyes', async () => {
    const alpha = await render('android')
    for (const [x, y] of [[13, 13], [7.3, 12], [18.7, 12], [10.1, 9.9]] as const) {
      expect(alpha(x, y), `(${x}, ${y})`).toBe(0)
    }
  })

  it('has two solid eye-lights inside the band', async () => {
    const alpha = await render('android')
    expect(alpha(10.1, 12.4)).toBe(255)
    expect(alpha(15.9, 12.4)).toBe(255)
  })

  it('has the sensor blade and its bead up and to the left', async () => {
    const alpha = await render('android')
    expect(alpha(2.95, 3.1)).toBe(255) // bead
    expect(alpha(4.9, 6.4)).toBe(255) // blade, off the dome
    expect(alpha(20, 4)).toBe(0) // and nothing on the other side
  })
})

describe("'helmet' is the head gear, not the hero", () => {
  it('stays inside the 24 x 24 box with a margin', async () => {
    expect(await edgeAlpha('helmet')).toBe(0)
  })

  it('is a solid shell with a see-through visor window', async () => {
    const alpha = await render('helmet')
    for (const [x, y] of [[12, 6], [4.5, 12], [16, 17.5], [20.2, 11.5]] as const) {
      expect(alpha(x, y), `shell (${x}, ${y})`).toBe(255)
    }
    expect(alpha(15, 11.5)).toBe(0)
  })

  it('has no eyes: nothing stands inside its visor window', async () => {
    const alpha = await render('helmet')
    for (let x = 12; x <= 18; x += 0.25) expect(alpha(x, 11.5), `window at x=${x}`).toBe(0)
  })

  it('is a different drawing from the face, not a variant of it', async () => {
    const [a, b] = await Promise.all([render('android'), render('helmet')])
    let diff = 0, union = 0
    for (let y = 0; y < 24; y += 0.2) {
      for (let x = 0; x < 24; x += 0.2) {
        const p = a(x, y) > 127, q = b(x, y) > 127
        if (p || q) union++
        if (p !== q) diff++
      }
    }
    expect(diff / union).toBeGreaterThan(0.25)
  })

  it('is what the head slot shows, and no slot shows the face', () => {
    expect(SLOT_ICON.helmet).toBe('helmet')
    expect(Object.values(SLOT_ICON)).not.toContain('android')
  })
})
