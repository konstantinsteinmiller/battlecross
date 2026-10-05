// The score's renderer, evaluated in a private headless Chrome page after the
// soundfonts (`MIDI.Soundfont.<name>`, FluidR3_GM via midi-js-soundfonts,
// CC BY 3.0). Plays the score's events into an OfflineAudioContext: sampled
// instruments, synthesized percussion, a hall to ring in, a master bus.
window.renderScore = async (score, opts) => {
  const SR = 44100
  const BEAT = 60 / score.bpm
  const tail = 4.5
  const len = Math.ceil((score.seconds + tail) * SR)
  const ctx = new OfflineAudioContext(2, len, SR)

  // ── The master: a gentle glue compressor, then the hall's return mixed in ──
  const master = ctx.createDynamicsCompressor()
  master.threshold.value = -16; master.ratio.value = 2.5; master.attack.value = 0.02; master.release.value = 0.25; master.knee.value = 10
  const out = ctx.createGain(); out.gain.value = 0.9
  master.connect(out).connect(ctx.destination)
  // A concert hall: early reflections, then a long, darkening, decorrelated tail.
  const ir = ctx.createBuffer(2, Math.floor(SR * 3.4), SR)
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c)
    let lp = 0
    for (let i = 0; i < d.length; i++) {
      const t = i / SR
      lp += (Math.random() * 2 - 1 - lp) * Math.max(0.03, 0.55 - t * 0.16)
      const early = t < 0.08 && Math.random() < 0.004 ? (Math.random() - 0.5) * 3 : 0
      d[i] = (lp + early) * Math.exp(-t * 1.9) * (t < 0.02 ? t / 0.02 : 1)
    }
  }
  const hall = ctx.createConvolver(); hall.buffer = ir
  const hallRet = ctx.createGain(); hallRet.gain.value = 0.42
  hall.connect(hallRet).connect(master)

  // ── Instruments: gain, pan, hall send, envelope ──
  const INST = {
    piano: { font: 'acoustic_grand_piano', gain: 0.55, pan: 0, wet: 0.28, attack: 0.002, release: 0.9, sustain: false },
    violin: { font: 'violin', gain: 0.5, pan: -0.25, wet: 0.45, attack: 0.08, release: 0.45, sustain: true },
    cello: { font: 'cello', gain: 0.62, pan: 0.3, wet: 0.35, attack: 0.04, release: 0.35, sustain: true },
    strings: { font: 'string_ensemble_1', gain: 0.3, pan: 0, wet: 0.5, attack: 0.05, release: 0.5, sustain: true },
    pizz: { font: 'pizzicato_strings', gain: 0.5, pan: -0.15, wet: 0.35, attack: 0.002, release: 0.4, sustain: false },
    guitar: { font: 'acoustic_guitar_nylon', gain: 0.42, pan: 0.4, wet: 0.22, attack: 0.002, release: 0.5, sustain: false },
    taiko: { font: 'taiko_drum', gain: 0.95, pan: 0, wet: 0.4, attack: 0.001, release: 1.2, sustain: false },
    timpani: { font: 'timpani', gain: 0.75, pan: 0.05, wet: 0.45, attack: 0.002, release: 1, sustain: false }
  }
  const busOf = {}
  const bus = (name, pan, wet) => {
    if (busOf[name]) return busOf[name]
    const g = ctx.createGain()
    const p = ctx.createStereoPanner(); p.pan.value = pan
    const w = ctx.createGain(); w.gain.value = wet
    g.connect(p).connect(master)
    g.connect(w).connect(hall)
    busOf[name] = g
    return g
  }

  // ── Samples: only the notes the score plays, decoded once ──
  const NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  const noteName = (m) => NAMES[m % 12] + (Math.floor(m / 12) - 1)
  const buffers = new Map()
  const want = new Set()
  for (const e of score.events) if (INST[e.inst]) want.add(e.inst + ':' + e.midi)
  await Promise.all([...want].map(async (k) => {
    const [inst, m] = k.split(':')
    const font = MIDI.Soundfont[INST[inst].font]
    const uri = font && font[noteName(Number(m))]
    if (!uri) return
    const ab = await (await fetch(uri)).arrayBuffer()
    buffers.set(k, await ctx.decodeAudioData(ab))
  }))

  const sampled = (e) => {
    const I = INST[e.inst]
    const buf = buffers.get(e.inst + ':' + e.midi)
    if (!buf) return
    const t = Math.max(0, e.t * BEAT)
    const dur = e.dur * BEAT
    const peak = I.gain * Math.pow(e.vel, 1.5)
    const dest = bus(e.inst, I.pan, I.wet)
    // A note may outlast its sample (a held string note): bow it again, crossfaded.
    const usable = Math.max(0.4, buf.duration - 0.35)
    const pieces = I.sustain && dur > usable ? Math.ceil((dur - 0.3) / (usable - 0.3)) : 1
    for (let k = 0; k < pieces; k++) {
      const s0 = t + k * (usable - 0.3)
      const s1 = k === pieces - 1 ? t + dur : s0 + usable
      const src = ctx.createBufferSource(); src.buffer = buf
      const g = ctx.createGain()
      const fadeIn = k === 0 ? I.attack : 0.3
      g.gain.setValueAtTime(0.0001, s0)
      g.gain.linearRampToValueAtTime(peak, s0 + fadeIn)
      if (I.sustain || k < pieces - 1) {
        g.gain.setValueAtTime(peak, Math.max(s0 + fadeIn, s1 - (k < pieces - 1 ? 0.3 : 0)))
        g.gain.linearRampToValueAtTime(0.0001, s1 + (k < pieces - 1 ? 0 : I.release))
      } else {
        // Struck and plucked: let it ring, dampened when the note ends.
        g.gain.setValueAtTime(peak, s1)
        g.gain.exponentialRampToValueAtTime(0.0001, s1 + I.release)
      }
      src.connect(g).connect(dest)
      src.start(s0)
      src.stop(s1 + I.release + 0.05)
    }
  }

  // ── Percussion, synthesized ──
  const noiseBuf = ctx.createBuffer(1, SR * 2, SR)
  const nd = noiseBuf.getChannelData(0)
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
  const drumBus = bus('drums', 0, 0.18)
  const bongoBus = bus('bongos', -0.4, 0.22)
  const shakerBus = bus('shaker', 0.35, 0.2)
  const env = (g, t, peak, atk, dur) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur) }
  const osc = (dest, type, f0, f1, t, dur, peak, bend = dur) => {
    const o = ctx.createOscillator(); o.type = type
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + bend)
    const g = ctx.createGain(); env(g, t, peak, 0.002, dur); o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.05)
  }
  const nz = (dest, type, f, q, t, dur, peak, atk = 0.001) => {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q
    const g = ctx.createGain(); env(g, t, peak, atk, dur)
    s.connect(fl).connect(g).connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.05)
  }
  const DRUM = {
    kick: (t, v) => { osc(drumBus, 'sine', 160, 42, t, 0.5, 0.95 * v, 0.12); nz(drumBus, 'bandpass', 3500, 1, t, 0.015, 0.25 * v) },
    snare: (t, v) => { nz(drumBus, 'bandpass', 2200, 0.7, t, 0.2, 0.55 * v); nz(drumBus, 'highpass', 5000, 0.7, t, 0.12, 0.25 * v); osc(drumBus, 'triangle', 200, 160, t, 0.11, 0.4 * v) },
    tomHi: (t, v) => { osc(drumBus, 'sine', 210, 140, t, 0.4, 0.7 * v); nz(drumBus, 'lowpass', 900, 0.8, t, 0.08, 0.2 * v) },
    tomLo: (t, v) => { osc(drumBus, 'sine', 130, 85, t, 0.5, 0.8 * v); nz(drumBus, 'lowpass', 700, 0.8, t, 0.1, 0.22 * v) },
    // A bongo: a skin struck by the fingers: the pitch bends down off the strike, a slap of the fingers on top.
    bongoHi: (t, v) => { osc(bongoBus, 'sine', 560, 410, t, 0.16, 0.6 * v, 0.03); nz(bongoBus, 'bandpass', 2600, 2, t, 0.02, 0.3 * v) },
    bongoLo: (t, v) => { osc(bongoBus, 'sine', 380, 280, t, 0.22, 0.65 * v, 0.035); nz(bongoBus, 'bandpass', 1900, 2, t, 0.025, 0.28 * v) },
    shaker: (t, v) => nz(shakerBus, 'highpass', 6500, 0.8, t, 0.07, 0.22 * v, 0.012),
    crash: (t, v, d) => { nz(drumBus, 'highpass', 5200, 0.6, t, Math.max(1.6, d), 0.32 * v); nz(drumBus, 'bandpass', 8500, 1.2, t, Math.max(1.2, d * 0.7), 0.18 * v) }
  }

  for (const e of score.events) {
    if (INST[e.inst]) sampled(e)
    else if (DRUM[e.inst]) DRUM[e.inst](Math.max(0, e.t * BEAT), e.vel, e.dur * BEAT)
  }

  const buf = await ctx.startRendering()
  // Kept for the caller to fetch in chunks (a whole track in one CDP reply is too big).
  let L = buf.getChannelData(0)
  let R = buf.getChannelData(1)
  if (score.loop) {
    // A loop: what rings on past its end (notes, the hall) is folded back onto its start, so the seam rings through.
    const n = Math.round(score.seconds * SR)
    const fold = (ch) => { const o = ch.slice(0, n); for (let i = n; i < ch.length; i++) o[(i - n) % n] += ch[i]; return o }
    L = fold(L)
    R = fold(R)
  }
  const pcm = new Int16Array(L.length * 2)
  let peak = 0
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
  const k = peak > 0.98 ? 0.98 / peak : 1
  for (let i = 0; i < L.length; i++) { pcm[i * 2] = Math.round(L[i] * k * 32767); pcm[i * 2 + 1] = Math.round(R[i] * k * 32767) }
  window.__pcm = new Uint8Array(pcm.buffer)
  return { bytes: window.__pcm.length, missing: [...want].filter(w => !buffers.has(w)).length, peak }
}

window.pcmChunk = (from, len) => {
  const a = window.__pcm.subarray(from, from + len)
  let s = ''
  for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000))
  return btoa(s)
}
