import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/** A song file is fetched whole before it plays (roadmap #211): streamed, a slow moment broke it up into noise. */
describe('music files', () => {
  const src = readFileSync('src/game/audio/music.ts', 'utf8')

  it('play from bytes already in the browser: an object URL of the fetched file, set before play()', () => {
    const start = src.slice(src.indexOf('const startFile = '), src.indexOf('const stopFile = '))
    expect(start).toContain('new Audio()')
    expect(start).not.toMatch(/new Audio\(url\)/)
    expect(start).toMatch(/void wholeFile\(url\)\.then\(\(src\) => \{[\s\S]*el\.src = src[\s\S]*el\.play\(\)/)
    expect(src).toContain('URL.createObjectURL(b)')
  })

  it('are fetched ahead in the background at boot, and a file that cannot be fetched still streams', () => {
    expect(src).toMatch(/export const warmMusicFiles = \(\): void => preloadMusicFiles\(MUSIC_FILES\.values\(\)\)/)
    expect(readFileSync('src/views/GameScene.vue', 'utf8')).toContain('m.warmMusicFiles()')
    expect(src).toMatch(/\.catch\(\(\) => url\)/)
  })
})
