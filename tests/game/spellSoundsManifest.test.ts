import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { SFX_NAMES } from '@/game/audio/sfx'

/** Owner decision 53: the generated spell sound files in sound-src/ match their manifest. */
const DIR = join(process.cwd(), 'sound-src/generated-spells')
const manifest = JSON.parse(readFileSync(join(DIR, 'manifest.json'), 'utf8')) as {
  totalBytes: number
  files: { file: string; event: string; bytes: number; seconds: number; peakDb: number; rmsDb: number }[]
}

describe('generated spell sounds', () => {
  it('manifest and folder list the same .ogg files, with the same sizes', () => {
    const onDisk = readdirSync(DIR).filter(f => f.endsWith('.ogg')).sort()
    expect(manifest.files.map(f => f.file).sort()).toEqual(onDisk)
    for (const f of manifest.files) expect(statSync(join(DIR, f.file)).size).toBe(f.bytes)
    expect(manifest.files.reduce((s, f) => s + f.bytes, 0)).toBe(manifest.totalBytes)
    expect(manifest.totalBytes).toBeLessThan(3 * 1048576)
  })

  it('every file is named after a sound the game has, and never sits in public/', () => {
    for (const f of manifest.files) {
      expect(SFX_NAMES).toContain(f.event)
      expect(f.file).toBe(`${f.event}.ogg`)
      expect(existsSync(join(process.cwd(), 'public/audio/sfx', f.file))).toBe(false)
    }
  })

  it('no file clips and the levels stay close together', () => {
    for (const f of manifest.files) {
      expect(f.peakDb).toBeLessThan(-1)
      expect(f.seconds).toBeGreaterThan(0.1)
      expect(f.rmsDb).toBeGreaterThan(-28)
      expect(f.rmsDb).toBeLessThan(-20)
    }
  })
})
