// The trailer's own sounds (not the game's): what a cut of a cinematic trailer
// rides on. Evaluated in the renderer's page; each fills an OfflineAudioContext.
//
//   trailerHit     a cut lands: a cinematic impact, a crack, a sub drop, a long hall
//   trailerWhoosh  into a cut: air pulled past fast, left to right
//   trailerRiser   the climb before the climax: noise and a tone rising for 3 s
//   trailerSub     the last word: a huge sub drop with a long tail
window.trailerSweeteners = {
  length: { trailerHit: 3.2, trailerWhoosh: 1.0, trailerRiser: 3.4, trailerSub: 4.0 },
  render(name, ctx) {
    const now = 0
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const nd = noiseBuf.getChannelData(0)
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
    // A hall to ring out in.
    const ir = ctx.createBuffer(2, ctx.sampleRate * 2.4, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c)
      let lp = 0
      for (let i = 0; i < d.length; i++) { const t = i / ctx.sampleRate; lp += (Math.random() * 2 - 1 - lp) * Math.max(0.04, 0.7 - t * 0.3); d[i] = lp * Math.exp(-t * 2.2) }
    }
    const verb = ctx.createConvolver()
    verb.buffer = ir
    const verbG = ctx.createGain()
    verbG.gain.value = 0.5
    verb.connect(verbG).connect(ctx.destination)
    const shaper = ctx.createWaveShaper()
    const curve = new Float32Array(1024)
    for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(x * 3) / Math.tanh(3) }
    shaper.curve = curve
    shaper.connect(ctx.destination)
    const send = (node, dry, wet, dirt) => {
      const g = ctx.createGain(); g.gain.value = dry; node.connect(g).connect(dirt ? shaper : ctx.destination)
      const w = ctx.createGain(); w.gain.value = wet; node.connect(w).connect(verb)
    }
    const env = (g, at, peak, atk, dur) => { g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + atk); g.gain.exponentialRampToValueAtTime(0.0001, at + dur) }
    const osc = (type, f0, f1, at, dur, peak, atk, dry, wet, dirt) => {
      const o = ctx.createOscillator(); o.type = type
      o.frequency.setValueAtTime(f0, at); if (f1) o.frequency.exponentialRampToValueAtTime(f1, at + dur)
      const g = ctx.createGain(); env(g, at, peak, atk, dur); o.connect(g); send(g, dry, wet, dirt); o.start(at); o.stop(at + dur + 0.05)
    }
    const noise = (type, f0, f1, q, at, dur, peak, atk, dry, wet, panFrom, panTo) => {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true
      const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q
      f.frequency.setValueAtTime(f0, at); if (f1) f.frequency.exponentialRampToValueAtTime(f1, at + dur)
      const g = ctx.createGain(); env(g, at, peak, atk, dur)
      const p = ctx.createStereoPanner(); p.pan.setValueAtTime(panFrom ?? 0, at); if (panTo !== undefined) p.pan.linearRampToValueAtTime(panTo, at + dur)
      s.connect(f).connect(g).connect(p); send(p, dry, wet, false); s.start(at, Math.random()); s.stop(at + dur + 0.05)
    }
    switch (name) {
      case 'trailerHit':
        noise('highpass', 1800, 0, 0.6, now, 0.03, 0.9, 0.001, 1, 0.6)
        osc('sine', 75, 30, now, 1.4, 0.95, 0.002, 1, 0.3, true)
        osc('triangle', 150, 55, now, 0.5, 0.35, 0.002, 1, 0.3, true)
        noise('lowpass', 2600, 90, 0.7, now, 1.2, 0.5, 0.004, 0.8, 0.8)
        noise('bandpass', 400, 120, 1.5, now + 0.02, 2.2, 0.18, 0.05, 0.4, 1)
        break
      case 'trailerWhoosh':
        noise('bandpass', 300, 3800, 2.4, now, 0.42, 0.55, 0.36, 1, 0.35, -0.8, 0.8)
        noise('highpass', 3000, 7000, 0.7, now + 0.1, 0.32, 0.12, 0.25, 1, 0.3, -0.6, 0.7)
        break
      case 'trailerRiser':
        noise('bandpass', 250, 6000, 3, now, 3.1, 0.35, 2.9, 1, 0.5, -0.3, 0.3)
        osc('sawtooth', 110, 440, now, 3.1, 0.12, 2.9, 0.7, 0.6, true)
        osc('sawtooth', 111.3, 445, now, 3.1, 0.1, 2.9, 0.7, 0.6, true)
        break
      case 'trailerSub':
        noise('highpass', 1500, 0, 0.6, now, 0.04, 0.8, 0.001, 1, 0.7)
        osc('sine', 60, 22, now, 3.0, 1, 0.003, 1, 0.4, true)
        noise('lowpass', 1800, 60, 0.7, now, 2.6, 0.5, 0.01, 0.8, 1)
        break
    }
  }
}
