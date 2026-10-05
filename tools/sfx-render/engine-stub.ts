/**
 * The audio engine as the OFFLINE sound render sees it (`tools/sfx-render.mjs`):
 * `audio()` hands out the offline context the renderer installed on
 * `window.__off`, and nothing is gated (no mute, no autoplay lock). The synth's
 * recipes run unchanged against it.
 */
interface Graph { ctx: BaseAudioContext; sfx: AudioNode; music: AudioNode; voice: AudioNode }
const w = globalThis as unknown as { __off?: Graph }

export const audio = (): Graph | null => w.__off ?? null
export const canPlay = (): boolean => true
export const duckMusic = (_seconds: number): void => {}
export const midiHz = (m: number): number => 440 * Math.pow(2, (m - 69) / 12)

let noiseFor: BaseAudioContext | null = null
let noiseBuf: AudioBuffer | null = null
export const noise = (): AudioBuffer | null => {
  const a = audio()
  if (!a) return null
  if (noiseFor !== a.ctx || !noiseBuf) {
    noiseFor = a.ctx
    noiseBuf = a.ctx.createBuffer(1, a.ctx.sampleRate, a.ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return noiseBuf
}

let wavesFor: BaseAudioContext | null = null
const waves = new Map<number, PeriodicWave>()
export const pulse = (duty: number): PeriodicWave | null => {
  const a = audio()
  if (!a) return null
  if (wavesFor !== a.ctx) { wavesFor = a.ctx; waves.clear() }
  const hit = waves.get(duty)
  if (hit) return hit
  const N = 48
  const real = new Float32Array(N)
  const imag = new Float32Array(N)
  for (let n = 1; n < N; n++) {
    real[n] = Math.sin(2 * Math.PI * n * duty) / (n * Math.PI)
    imag[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (n * Math.PI)
  }
  const wv = a.ctx.createPeriodicWave(real, imag)
  waves.set(duty, wv)
  return wv
}
