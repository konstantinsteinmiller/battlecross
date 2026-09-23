import { watch } from 'vue'
import { getAudioContext, isAudioSuspended } from '@/use/useAssets'
import useUser from '@/use/useUser'
import { isMobileAudioMuted } from '@/use/useMobileAudioMute'
import { isPlatformAudioMuted } from '@/use/useGamePauseAudio'

/**
 * ─── Audio graph ─────────────────────────────────────────────────────────────
 *
 * Everything the game plays is SYNTHESIZED on the one shared AudioContext
 * (`useAssets.getAudioContext`). That is what makes the ad / pause / platform
 * mute guarantees hold for free: those gates suspend the context, and a
 * suspended context stops every oscillator and freezes the music clock.
 *
 *   sfx voices ─► sfxBus ─┐
 *                         ├─► master (compressor) ─► destination
 *   music voices ► musicBus┘
 */

let ctx: AudioContext | null = null
let master: DynamicsCompressorNode | null = null
let sfxBus: GainNode | null = null
let musicBus: GainNode | null = null
let noiseBuf: AudioBuffer | null = null
const pulseWaves = new Map<number, PeriodicWave>()
let watching = false

export const SFX_BASE = 0.32
export const MUSIC_BASE = 0.2

/** The graph, created lazily on first use (after a user gesture on mobile). */
export const audio = (): { ctx: AudioContext; sfx: GainNode; music: GainNode } | null => {
  if (ctx && sfxBus && musicBus) return { ctx, sfx: sfxBus, music: musicBus }
  const c = getAudioContext()
  if (!c) return null
  ctx = c
  master = c.createDynamicsCompressor()
  master.threshold.value = -14
  master.knee.value = 12
  master.ratio.value = 4
  master.attack.value = 0.003
  master.release.value = 0.2
  master.connect(c.destination)
  sfxBus = c.createGain()
  musicBus = c.createGain()
  sfxBus.connect(master)
  musicBus.connect(master)
  applyVolumes()
  if (!watching) {
    watching = true
    const { userSoundVolume, userMusicVolume } = useUser()
    watch([userSoundVolume, userMusicVolume, isMobileAudioMuted, isPlatformAudioMuted], applyVolumes)
  }
  return { ctx: c, sfx: sfxBus, music: musicBus }
}

const applyVolumes = (): void => {
  if (!ctx || !sfxBus || !musicBus) return
  const { userSoundVolume, userMusicVolume } = useUser()
  const muted = isMobileAudioMuted.value || isPlatformAudioMuted.value
  const t = ctx.currentTime
  sfxBus.gain.setTargetAtTime(muted ? 0 : SFX_BASE * (userSoundVolume.value ?? 0.7), t, 0.02)
  musicBus.gain.setTargetAtTime(muted ? 0 : MUSIC_BASE * (userMusicVolume.value ?? 0.6), t, 0.05)
}

/** White noise, 1 s, shared by every noise voice. */
export const noise = (): AudioBuffer | null => {
  if (noiseBuf) return noiseBuf
  const a = audio()
  if (!a) return null
  const len = a.ctx.sampleRate
  noiseBuf = a.ctx.createBuffer(1, len, a.ctx.sampleRate)
  const d = noiseBuf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return noiseBuf
}

/** Band-limited pulse wave with the given duty (0.125 / 0.25 / 0.5 — the
 *  classic console channel's three timbres). */
export const pulse = (duty: number): PeriodicWave | null => {
  const hit = pulseWaves.get(duty)
  if (hit) return hit
  const a = audio()
  if (!a) return null
  const N = 48
  const real = new Float32Array(N)
  const imag = new Float32Array(N)
  for (let n = 1; n < N; n++) {
    real[n] = Math.sin(2 * Math.PI * n * duty) / (n * Math.PI)
    imag[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (n * Math.PI)
  }
  const w = a.ctx.createPeriodicWave(real, imag)
  pulseWaves.set(duty, w)
  return w
}

export const canPlay = (): boolean =>
  !isAudioSuspended() && !isMobileAudioMuted.value && !isPlatformAudioMuted.value

export const midiHz = (m: number): number => 440 * Math.pow(2, (m - 69) / 12)
