// ─── "The Last Light": the cinematic score (#74) ────────────────────────────
//
// One piece in two edits, written as code: note events for sampled instruments
// (piano, violin, cello, a string section, pizzicato, nylon guitar, taiko,
// timpani) and synthesized percussion (kick, snare, toms, bongos, shaker,
// crash). 112 BPM, D minor (the game's key), 4/4.
//
//   trailer  40 bars, cut to the cinematic trailer's shots (its scenario lays
//            its shots on these same bars): the walk out of Sunford, the call
//            to arms, the build (the hero's book, #125), the montage, the
//            loot, the dragon and the fortress, the rift
//   game     the driving sections (montage, climax, fortress) as a loop that
//            opens on a drum blow: the boss fight's music
//
// Every event is { inst, t, dur, midi?, vel, pan? } with t and dur in beats.

export const BPM = 112
const BEAT_S = 60 / BPM

/** Chords as their tones (MIDI, mid register) and a bass root for the cellos (C2..C3). */
const CH = {
  Dm: { tones: [62, 65, 69], root: 38 },
  Bb: { tones: [58, 62, 65], root: 46 },
  F: { tones: [60, 65, 69], root: 41 },
  C: { tones: [60, 64, 67], root: 36 },
  Gm: { tones: [62, 67, 70], root: 43 },
  A: { tones: [61, 64, 69], root: 45 }
}

/**
 * The sections, bar by bar: the chord of each bar, how loud it plays (0..1),
 * and which parts play. A section's `melody` is a list of bars of [midi, beats].
 */
const M1 = [[[69, 2], [74, 1], [76, 1]], [[77, 3], [76, 1]], [[72, 2], [74, 1], [76, 1]], [[76, 4]]]
const M1b = [[[69, 2], [74, 1], [76, 1]], [[77, 3], [79, 1]], [[81, 2], [79, 1], [77, 1]], [[76, 2], [74, 2]]]
const M2 = [[[81, 1.5], [79, 0.5], [77, 1], [76, 1]], [[74, 2], [77, 2]], [[79, 1.5], [77, 0.5], [74, 2]], [[73, 2], [76, 2]]]
const LOOT = [[[74, 1], [77, 1], [82, 2]], [[81, 3], [77, 1]], [[79, 4]]]
const SOLO = [[[69, 3], [74, 1]], [[77, 2], [74, 2]]]

const SECTIONS = [
  // 0–1  the walk out of Sunford
  { name: 'intro', chords: ['Dm', 'Bb'], level: 0.45, parts: ['pianoArp', 'guitarPick', 'celloDrone'] },
  // 2–9  the call: the Goblin King, the Treant, Oakhaven
  { name: 'call', chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'F', 'A'], level: 0.66, parts: ['pizz', 'celloEighths', 'pianoChords', 'pad', 'bongos@2', 'shaker@2', 'kick@4', 'taikoDown', 'timpRollEnd'], melody: { inst: 'violin', bars: [...M1, ...M1b] } },
  // 10–16  the montage
  { name: 'montage', chords: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'A'], level: 0.92, parts: ['celloEighths', 'guitarStrum', 'pianoStabs', 'pad', 'bongos', 'shaker', 'drums', 'taikoBars', 'crashDown', 'fillEnd'], melody: { inst: 'violin', bars: [...M2, ...M2.slice(0, 2), [[76, 4]]], up: 12 } },
  // 17–19  the loot
  { name: 'loot', chords: ['Bb', 'F', 'C'], level: 0.97, parts: ['celloLong', 'guitarStrum', 'pianoChords', 'pad', 'halfDrums', 'crashDown', 'bongos'], melody: { inst: 'violin', bars: LOOT, up: 12 } },
  // 20–21  the walk round the well
  { name: 'square', chords: ['Dm', 'Bb'], level: 0.42, parts: ['pianoArp', 'guitarPick', 'celloDrone', 'timpRollEnd'], melody: { inst: 'violin', bars: SOLO } },
  // 22–27  the dragon
  { name: 'climax', chords: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'A'], level: 1, parts: ['celloEighths', 'chugs', 'pianoOctaves', 'pad', 'bongos', 'shaker', 'drums', 'taikoBeats', 'crashDown', 'fillEnd'], melody: { inst: 'violin', bars: [...M2, ...M2.slice(0, 2)], up: 12 } },
  // 28–35  the fortress
  { name: 'fortress', chords: ['Bb', 'C', 'Dm', 'Dm', 'Bb', 'C', 'A', 'A'], level: 1, parts: ['celloEighths', 'chugs', 'guitarStrum', 'pianoOctaves', 'pad', 'bongos', 'shaker', 'drums', 'taikoBeats', 'crashDown', 'fillEnd'], melody: { inst: 'violin', bars: [...M1b, ...M2], up: 12 } },
  // 36–39  the rift: the drop, and the last word
  { name: 'rift', chords: ['Dm', 'Dm', 'Bb', 'Dm'], level: 0.55, parts: ['celloDrone', 'pianoLow', 'highViolin', 'timpSoft', 'finalHit'] }
]

/**
 * The trailer's own edit (#125): the same sections, the boss fights' (climax,
 * fortress, rift) cut shorter, and a 'build' section for the hero's book (the
 * loadout, the stats, the gear) in place of the walk round the well. The game
 * edit below still plays SECTIONS as written.
 */
const section = (name) => SECTIONS.find(s => s.name === name)
const TRAILER_SECTIONS = [
  section('intro'),
  section('call'),
  // 10–17  the build: a lighter drive under the menus
  { name: 'build', chords: ['Dm', 'Bb', 'F', 'C', 'Gm', 'Bb', 'C', 'A'], level: 0.74, parts: ['celloEighths', 'guitarStrum', 'pianoChords', 'pad', 'bongos', 'shaker', 'kick', 'taikoDown', 'timpRollEnd'], melody: { inst: 'violin', bars: [...M1, ...M1b] } },
  section('montage'),
  section('loot'),
  { ...section('climax'), chords: ['Dm', 'Bb', 'Gm', 'A'], melody: { inst: 'violin', bars: M2, up: 12 } },
  { ...section('fortress'), chords: ['Bb', 'C', 'Dm', 'Bb', 'A', 'A'], melody: { inst: 'violin', bars: [...M1b.slice(0, 2), ...M2], up: 12 } },
  { ...section('rift'), chords: ['Dm', 'Dm'] }
]

/** The bars of a section list, numbered: [{ bar, chord, level, parts, section, i (bar in section), n (bars in section) }]. */
const barsOf = (sections) => {
  const out = []
  for (const s of sections) s.chords.forEach((c, i) => out.push({ bar: out.length, chord: CH[c], level: s.level, parts: s.parts, section: s, i, n: s.chords.length }))
  return out
}

/** Does a bar play this part (a part may start at a bar of its section: 'kick@4')? */
const plays = (b, part) => b.parts.some(p => { const [name, from] = p.split('@'); return name === part && b.i >= Number(from ?? 0) })

const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647 } })()
const human = (t) => t + (rnd() - 0.5) * 0.03

/** Every note of the piece for these sections. */
const notes = (sections) => {
  const ev = []
  const add = (inst, t, dur, vel, midi, pan) => ev.push({ inst, t: human(t), dur, vel: Math.max(0.05, Math.min(1, vel * (0.92 + rnd() * 0.16))), midi, pan })
  const bars = barsOf(sections)
  for (const b of bars) {
    const t0 = b.bar * 4
    const L = b.level
    const { tones, root } = b.chord
    const last = b.i === b.n - 1
    // ── Strings ──
    if (plays(b, 'celloDrone')) add('cello', t0, 4, 0.55 * L + 0.2, root)
    if (plays(b, 'celloLong')) { add('cello', t0, 4, 0.6 * L, root); add('cello', t0, 4, 0.45 * L, root + 12) }
    if (plays(b, 'celloEighths')) {
      const pat = [0, 0, 12, 0, 7, 0, 12, 0]
      pat.forEach((o, k) => add('cello', t0 + k * 0.5, 0.45, (k % 2 ? 0.55 : 0.75) * L, root + o))
    }
    if (plays(b, 'pizz')) [0, 1, 2, 1, 0, 1, 2, 1].forEach((k, j) => add('pizz', t0 + j * 0.5, 0.4, 0.5 * L + 0.15, tones[k] + (j >= 4 ? 12 : 0)))
    if (plays(b, 'chugs')) for (let k = 0; k < 8; k++) tones.forEach(m => add('strings', t0 + k * 0.5, 0.36, (k % 2 ? 0.5 : 0.72) * L, m))
    if (plays(b, 'pad')) tones.forEach(m => add('strings', t0, 4, 0.32 * L, m + 12))
    if (plays(b, 'highViolin')) add('violin', t0, 4, 0.35, b.i % 2 ? 81 : 86)
    // ── Piano ──
    if (plays(b, 'pianoArp')) {
      const arp = [root, root + 7, root + 12, tones[1] + 12, tones[2] + 12, tones[1] + 12, root + 12, root + 7]
      arp.forEach((m, k) => add('piano', t0 + k * 0.5, 1.4, (k === 0 ? 0.6 : 0.42) * L + 0.15, m + 12))
    }
    if (plays(b, 'pianoChords')) [0, 2].forEach(h => tones.forEach(m => add('piano', t0 + h, 2, 0.5 * L, m)))
    if (plays(b, 'pianoStabs')) [0, 1.5, 3].forEach(h => { add('piano', t0 + h, 0.6, 0.75 * L, root + 12); add('piano', t0 + h, 0.6, 0.6 * L, root + 24); tones.forEach(m => add('piano', t0 + h, 0.6, 0.45 * L, m + 12)) })
    if (plays(b, 'pianoOctaves')) [0, 2].forEach(h => { add('piano', t0 + h, 1.8, 0.85 * L, root - 12); add('piano', t0 + h, 1.8, 0.7 * L, root) })
    if (plays(b, 'pianoLow')) { add('piano', t0, 3.5, 0.7, root - 12); add('piano', t0, 3.5, 0.5, root) }
    // ── Guitar ──
    if (plays(b, 'guitarPick')) [0, 2, 1, 2, 0, 2, 1, 2].forEach((k, j) => add('guitar', t0 + j * 0.5, 1.2, 0.5 * L + 0.2, tones[k] - (k === 0 ? 12 : 0)))
    if (plays(b, 'guitarStrum')) {
      // A strum: the strings one after another, down on the beat, up on the off-beat (accents on 1 and the and of 2).
      const pat = [[0, 1, 0.85], [1, -1, 0.5], [1.5, 1, 0.8], [2, -1, 0.55], [2.5, 1, 0.7], [3, -1, 0.5], [3.5, 1, 0.65]]
      const strings = [root + 12, tones[0], tones[1], tones[2], tones[0] + 12]
      for (const [h, dir, v] of pat) {
        const order = dir > 0 ? strings : [...strings].reverse()
        order.forEach((m, k) => ev.push({ inst: 'guitar', t: t0 + h + k * 0.025, dur: 0.6, vel: v * L * 0.75, midi: m }))
      }
    }
    // ── Percussion ──
    if (plays(b, 'bongos')) for (let k = 0; k < 16; k++) {
      const pat = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0]
      if (!pat[k]) continue
      const accent = k % 4 === 0 ? 1 : k % 2 ? 0.55 : 0.75
      add(k % 4 === 3 || k % 8 === 6 ? 'bongoLo' : 'bongoHi', t0 + k * 0.25, 0.2, accent * L * 0.8)
    }
    if (plays(b, 'shaker')) for (let k = 0; k < 16; k++) add('shaker', t0 + k * 0.25, 0.1, (k % 2 ? 0.35 : 0.55) * L)
    if (plays(b, 'kick')) [0, 2].forEach(h => add('kick', t0 + h, 0.5, 0.8 * L))
    if (plays(b, 'drums')) {
      ;[0, 1.5, 2, 3.5].forEach(h => add('kick', t0 + h, 0.5, (h % 2 === 0 ? 0.95 : 0.7) * L))
      ;[1, 3].forEach(h => add('snare', t0 + h, 0.5, 0.85 * L))
    }
    if (plays(b, 'halfDrums')) { add('kick', t0, 0.5, 0.9 * L); add('snare', t0 + 2, 0.5, 0.8 * L) }
    if (plays(b, 'taikoDown') && b.i % 4 === 0) add('taiko', t0, 2, 0.9 * L, 50)
    if (plays(b, 'taikoBars')) { add('taiko', t0, 2, 0.95 * L, 50); add('taiko', t0 + 2.5, 1, 0.6 * L, 55) }
    if (plays(b, 'taikoBeats')) [0, 1, 2, 3].forEach(h => add('taiko', t0 + h, 1, (h === 0 ? 1 : 0.7) * L, h % 2 ? 55 : 50))
    if (plays(b, 'crashDown') && b.i === 0) add('crash', t0, 3, 0.8 * L)
    if (plays(b, 'fillEnd') && last) for (let k = 0; k < 8; k++) add(k < 4 ? 'tomHi' : 'tomLo', t0 + 2 + k * 0.25, 0.4, (0.55 + k * 0.06) * L)
    if (plays(b, 'timpRollEnd') && last) for (let k = 0; k < 16; k++) add('timpani', t0 + 2 + k * 0.125, 0.3, 0.2 + k * 0.04, 38)
    if (plays(b, 'timpSoft')) [0, 2].forEach(h => add('timpani', t0 + h, 1.5, 0.45, 38))
    if (plays(b, 'finalHit') && last) {
      add('taiko', t0, 3, 1, 45)
      add('crash', t0, 4, 0.9)
      add('kick', t0, 1, 1)
      ;[38, 50, 62, 65, 69, 74].forEach(m => add(m < 50 ? 'cello' : m < 70 ? 'strings' : 'violin', t0, 4, 0.8, m))
      add('piano', t0, 4, 0.9, 26)
      add('piano', t0, 4, 0.8, 38)
    }
  }
  // ── The melodies ──
  let bar0 = 0
  for (const s of sections) {
    if (s.melody) {
      let t = bar0 * 4
      s.melody.bars.forEach((bar, i) => {
        if (i >= s.chords.length) return
        let h = 0
        for (const [m, d] of bar) { add(s.melody.inst, bar0 * 4 + i * 4 + h, d * 0.98, 0.55 + s.level * 0.4, m + (s.melody.up ?? 0)); h += d }
      })
      void t
    }
    bar0 += s.chords.length
  }
  return ev
}

/** An edit of the piece: 'trailer' (40 bars, TRAILER_SECTIONS) or 'game' (the boss fight's loop). */
export const score = (edit = 'trailer') => {
  const pick = edit === 'game' ? SECTIONS.filter(s => s.name === 'montage' || s.name === 'climax' || s.name === 'fortress') : TRAILER_SECTIONS
  const bars = pick.reduce((n, s) => n + s.chords.length, 0)
  return { bpm: BPM, beats: bars * 4, seconds: bars * 4 * BEAT_S, loop: edit === 'game', events: notes(pick) }
}

/** The trailer's bars per section, for the scenario to cut on. */
export const TRAILER_BARS = Object.fromEntries(TRAILER_SECTIONS.map(s => [s.name, s.chords.length]))
