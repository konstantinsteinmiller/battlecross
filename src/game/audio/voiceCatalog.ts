/**
 * ─── The voice catalog: every voice-over line, in one place ──────────────────
 *
 * The single source of truth for voice work. Every line anyone may record
 * is listed here once: who says it, where in the game, when it plays, how to
 * read it, how long it may run, and the file it ships as. Everything else is
 * generated from it:
 *
 *   pnpm voice:report   status per language (done / recorded / to record) in
 *                       the console, and the recording scripts
 *                       src/assets/voice-lines-list_en.pdf / _de.pdf
 *   pnpm voice:script   voice-todo.md (the lines in the game today)
 *
 * A line's file name is its key with the dots as underscores (`fileName`):
 * `atlas.bossAhead` ships as `public/audio/voice/<lang>/atlas_bossAhead.ogg`
 * (`audio/voice.ts` plays it). Raw takes from the speaker go to
 * `vo-src/raw/<lang>/<speaker>/atlas_bossAhead_<take>.ogg`. How each voice is
 * processed lives in `story-voice-over.md` (the Audacity chains). Keys never
 * hold an underscore (a test checks), so a file name maps back to one key.
 *
 * Two kinds of line:
 * - `live`: in the game now. Its text is the locale's (`en.ts` / `de.ts`,
 *   same key), so a line changed there changes here.
 * - `planned`: from `story-voice-over.md`, not wired in yet. Its text is the
 *   draft below (English, and a German draft to be reviewed) until the key is
 *   added to the locales, which makes it live.
 *
 * `{name}` in a draft is filled from `params` (i18n keys: weapon, boss and
 * sector names), so a variant reads with the name as the game spells it;
 * `{NAME}` in capitals fills it in capitals (Vex shouting a boss's name).
 *
 * Pure data, no runtime imports: `tools/` read it with Node's type stripping.
 */

export type Speaker = 'atlas' | 'vex' | 'flux' | 'gauss'
export type Lang = 'en' | 'de'
/** [English, German]. */
export type Both = readonly [string, string]

export interface VoiceLine {
  /** The i18n key, and the file name: `<key>.ogg`. */
  key: string
  speaker: Speaker
  /** Where in the game (see SCENES), for grouping. */
  scene: SceneId
  status: 'live' | 'planned'
  /** When it plays. */
  when: Both
  /** How to read it. */
  direction: Both
  /** The longest the delivered line may run (s). */
  max: number
  /** Planned lines: the draft text. Live lines read the locale. */
  draft?: Both
  /** `{name}` → i18n key of the value. */
  params?: Readonly<Record<string, string>>
  /** Recorded once, in English, for every language (barks, laughs). */
  neutral?: boolean
}

export interface SpeakerInfo {
  name: string
  role: Both
  voice: Both
  avoid?: Both
}

export const SPEAKERS: Readonly<Record<Speaker, SpeakerInfo>> = {
  atlas: {
    name: 'Atlas',
    role: ['Flux\'s field AI', 'Fluxs Feld-KI'],
    voice: [
      'Gender-neutral to slightly low; calm, precise, warm underneath. A mission-control navigator who is also your friend. Dry humour by understatement. Never shouts: at critical moments it gets tighter and faster, not louder.',
      'Geschlechtsneutral bis leicht tief; ruhig, präzise, darunter warm. Ein Navigator aus der Missionskontrolle, der zugleich dein Freund ist. Trockener Humor durch Untertreibung. Schreit nie: in kritischen Momenten wird die Stimme knapper und schneller, nicht lauter.'
    ]
  },
  vex: {
    name: 'Dr. Vex',
    role: ['The showman doctor, the villain', 'Der Showman-Doktor, der Schurke'],
    voice: [
      'Big, theatrical, pompous: a game-show host crossed with a vain surgeon. Relishes the words and stretches the big ones ("Maaag-nificent"). Over the top but never scary: the audience is all ages.',
      'Groß, theatralisch, aufgeblasen: ein Showmaster gekreuzt mit einem eitlen Chirurgen. Genießt jedes Wort und dehnt die großen ("Grooo-ßartig"). Völlig übertrieben, aber nie gruselig: das Publikum ist jedes Alters.'
    ],
    avoid: [
      'Imitating any specific film villain\'s voice or catchphrases: the archetype, not an impression.',
      'Die Stimme oder Sprüche eines bestimmten Filmschurken nachzumachen: der Archetyp, keine Imitation.'
    ]
  },
  flux: {
    name: 'Flux',
    role: ['The hero: barks only', 'Der Held: nur Ausrufe'],
    voice: [
      'Youthful, bright, bouncy. A plucky little robot, never pained or gory: every yelp should be funny. Cartoon timing.',
      'Jung, hell, federnd. Ein mutiger kleiner Roboter, nie leidend: jeder Aufschrei soll lustig sein. Cartoon-Timing.'
    ]
  },
  gauss: {
    name: 'Prof. Gauss',
    role: ['The inventor (one optional line)', 'Die Erfinderin (eine optionale Zeile)'],
    voice: [
      'Elderly, gentle, clever and a little amused. A grandmother who built half the city.',
      'Älter, sanft, klug und ein wenig amüsiert. Eine Großmutter, die die halbe Stadt gebaut hat.'
    ]
  }
}

export type SceneId =
  | 'intro' | 'mission' | 'missionStory' | 'missionWarn' | 'missionIdle'
  | 'prologue' | 'act1' | 'midpoint' | 'act2' | 'shift' | 'act3' | 'ending'
  | 'fieldWarn' | 'scan' | 'barks' | 'laughs'

/** In playing order. */
export const SCENES: ReadonlyArray<{ id: SceneId; title: Both }> = [
  { id: 'intro', title: ['Intro cutscene', 'Intro-Zwischensequenz'] },
  { id: 'mission', title: ['Every mission', 'Jede Mission'] },
  { id: 'missionStory', title: ['Story mission starts', 'Start der Story-Missionen'] },
  { id: 'missionWarn', title: ['In-mission warnings', 'Warnungen in der Mission'] },
  { id: 'missionIdle', title: ['Small talk', 'Smalltalk'] },
  { id: 'prologue', title: ['Prologue: Scrapyard', 'Prolog: Schrottplatz'] },
  { id: 'act1', title: ['Act I: Heat and Ice', 'Akt I: Hitze und Eis'] },
  { id: 'midpoint', title: ['Midpoint: the Blueprint', 'Wendepunkt: der Bauplan'] },
  { id: 'act2', title: ['Act II: Storm Front', 'Akt II: Sturmfront'] },
  { id: 'shift', title: ['Act IIb: The Second Shift', 'Akt IIb: Die zweite Schicht'] },
  { id: 'act3', title: ['Act III: The Fortress', 'Akt III: Die Festung'] },
  { id: 'ending', title: ['Ending', 'Ende'] },
  { id: 'fieldWarn', title: ['Field warnings and hints', 'Feldwarnungen und Hinweise'] },
  { id: 'scan', title: ['Machine scans (first sighting)', 'Maschinen-Scans (erste Sichtung)'] },
  { id: 'barks', title: ['Damage barks', 'Schadens-Ausrufe'] },
  { id: 'laughs', title: ['Laughs', 'Lacher'] }
]

type Opts = Omit<VoiceLine, 'key' | 'speaker' | 'scene' | 'status' | 'max'> & { max?: number }

const live = (key: string, speaker: Speaker, scene: SceneId, o: Opts): VoiceLine =>
  ({ key, speaker, scene, status: 'live', max: 3, ...o })
const plan = (key: string, speaker: Speaker, scene: SceneId, max: number, o: Opts): VoiceLine =>
  ({ key, speaker, scene, status: 'planned', ...o, max: o.max ?? max })

const WEAPONS = ['scrapBurst', 'flameWave', 'iceLance', 'thunderArc', 'galeGuard', 'magnetPull', 'drillBomb', 'bubbleLance', 'neonBlade', 'droneSwarm'] as const
/** Each Master's weakness (checked against `data/bosses.ts` by a test). */
export const WEAK_TO: ReadonlyArray<readonly [boss: string, weapon: string]> = [
  ['blazeMaster', 'iceLance'], ['frostMaster', 'thunderArc'], ['voltMaster', 'galeGuard'], ['galeMaster', 'flameWave'], ['magnetMaster', 'drillBomb'], ['drillMaster', 'bubbleLance'], ['tideMaster', 'neonBlade'], ['neonMaster', 'droneSwarm'], ['rotorMaster', 'magnetPull']
]
/** Each sector's floor level after the first (checked against `data/regions.ts`). */
export const SECTOR_FLOOR: ReadonlyArray<readonly [sector: string, level: number]> = [
  ['blaze', 3], ['cryo', 6], ['volt', 9], ['gale', 13], ['magnet', 16], ['drill', 19], ['tide', 22], ['neon', 25], ['rotor', 28], ['fortress', 31]
]

// ── Atlas: in the game now ──
const ATLAS_LIVE: VoiceLine[] = [
  live('story.atlas.logStart', 'atlas', 'intro', {
    when: ['Intro: the cold open freezes and rewinds; Atlas starts its log', 'Intro: der Kaltstart friert ein und spult zurück; Atlas startet sein Protokoll'],
    direction: ['Flat, clinical. It starts the rewind.', 'Flach, klinisch. Damit beginnt der Rücklauf.'], max: 1
  }),
  live('story.atlas.goodMorning', 'atlas', 'intro', {
    when: ['Intro: Flux wakes up; the first words of the game', 'Intro: Flux erwacht; die ersten Worte des Spiels'],
    direction: ['Soft: the first words he ever hears. Warm on "Flux".', 'Sanft: die ersten Worte, die er je hört. Warm auf "Flux".'], max: 2.2
  }),
  live('story.atlas.scrapyardFirst', 'atlas', 'intro', {
    when: ['Intro, the hologram: the Scrapyard relay blinks', 'Intro, das Hologramm: das Schrottplatz-Relais blinkt'],
    direction: ['Matter-of-fact. The whole mission in one breath.', 'Sachlich. Die ganze Mission in einem Atemzug.'], max: 2.2
  }),
  live('atlas.landed', 'atlas', 'mission', {
    when: ['Every mission: Flux lands on the pad', 'Jede Mission: Flux landet auf der Plattform'],
    direction: ['Upbeat, a quick kick-off.', 'Munter, ein schneller Startschuss.']
  }),
  live('atlas.brief.tutorial', 'atlas', 'mission', {
    when: ['The tutorial starts', 'Das Tutorial beginnt'],
    direction: ['Encouraging, a friendly coach.', 'Ermutigend, ein freundlicher Coach.']
  }),
  live('atlas.brief.job', 'atlas', 'mission', {
    when: ['A job mission starts', 'Ein Job beginnt'],
    direction: ['Brisk and casual.', 'Zügig und locker.']
  }),
  live('atlas.brief.climb', 'atlas', 'mission', {
    when: ['A Tower Run starts', 'Ein Turmlauf beginnt'],
    direction: ['Excited, rising on each "up".', 'Aufgeregt, jedes "hoch" steigt an.']
  }),
  live('atlas.brief.story', 'atlas', 'mission', {
    when: ['A story mission starts (fallback line)', 'Eine Story-Mission beginnt (Ersatzzeile)'],
    direction: ['Determined, a small rally.', 'Entschlossen, ein kleiner Aufruf.']
  }),
  ...(['scrapyard', 'blaze', 'cryo', 'volt', 'gale', 'magnet', 'drill', 'tide', 'neon', 'rotor', 'fortress'] as const).map(s => live(`atlas.story.${s}`, 'atlas', 'missionStory', {
    when: [`Story mission start: {sector}`, `Start der Story-Mission: {sector}`],
    params: { sector: `sector.${s}` },
    direction: s === 'fortress'
      ? ['Quiet resolve. This is the end of it.', 'Ruhige Entschlossenheit. Jetzt wird es beendet.']
      : s === 'volt'
        ? ['Playful unease: the tower is already getting to it.', 'Verspieltes Unbehagen: der Turm macht sich schon bemerkbar.']
        : ['A briefing with a grin.', 'Eine Einweisung mit einem Grinsen.']
  })),
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(n => live(`atlas.arc.${n}`, 'atlas', 'missionStory', {
    when: [`Story mission start, ${n} of 10 Masters freed`, `Start einer Story-Mission, ${n} von 10 Meistern befreit`],
    direction: n === 10
      ? ['Steady and ready: the last door is open.', 'Ruhig und bereit: die letzte Tür ist offen.']
      : ['The score so far, with a hint of pride.', 'Der Zwischenstand, mit einem Hauch Stolz.']
  })),
  live('atlas.bossAhead', 'atlas', 'missionWarn', {
    when: ['The boss door comes into view', 'Die Boss-Tür kommt in Sicht'],
    direction: ['Alert, then a calming breath.', 'Wachsam, dann ein beruhigender Atemzug.']
  }),
  live('atlas.bossDown', 'atlas', 'missionWarn', {
    when: ['A Core Master is beaten (freed)', 'Ein Kernmeister ist besiegt (befreit)'],
    direction: ['Relieved and proud.', 'Erleichtert und stolz.']
  }),
  live('atlas.vexDown', 'atlas', 'missionWarn', {
    when: ['Vex\'s Mk-I is beaten', 'Vex\' Mk-I ist besiegt'],
    direction: ['Triumph, still not shouting.', 'Triumph, trotzdem nicht geschrien.']
  }),
  live('atlas.guardDown', 'atlas', 'missionWarn', {
    when: ['A Fortress guard hall is cleared (its door opens)', 'Eine Wachhalle der Festung ist frei (ihre Tür öffnet sich)'],
    direction: ['A quick breath, then onward.', 'Kurz durchatmen, dann weiter.']
  }),
  live('atlas.lowHp', 'atlas', 'missionWarn', {
    when: ['Health under 30 %, no Repair Gel left', 'Gesundheit unter 30 %, kein Reparaturgel mehr'],
    direction: ['Worried, quick, not loud.', 'Besorgt, schnell, nicht laut.']
  }),
  live('atlas.lowHpGel', 'atlas', 'missionWarn', {
    when: ['Health under 30 %, a Repair Gel in the pack', 'Gesundheit unter 30 %, ein Reparaturgel im Gepäck'],
    direction: ['A clear instruction.', 'Eine klare Anweisung.']
  }),
  live('atlas.lowWe', 'atlas', 'missionWarn', {
    when: ['Special weapon energy under 20 %', 'Spezialwaffen-Energie unter 20 %'],
    direction: ['A practical heads-up.', 'Ein sachlicher Hinweis.']
  }),
  live('atlas.trap', 'atlas', 'missionWarn', {
    when: ['A corridor trap ahead (flame jet, blade)', 'Eine Falle im Gang voraus (Flammendüse, Klinge)'],
    direction: ['Coaching.', 'Wie ein Trainer.']
  }),
  live('atlas.plate', 'atlas', 'missionWarn', {
    when: ['A pressure plate ahead', 'Eine Druckplatte voraus'],
    direction: ['Playful, almost whispered on the last word.', 'Verspielt, das letzte Wort fast geflüstert.']
  }),
  live('atlas.objective', 'atlas', 'missionWarn', {
    when: ['The objective is done', 'Das Ziel ist erledigt'],
    direction: ['Relaxed.', 'Entspannt.']
  }),
  live('atlas.exit', 'atlas', 'missionWarn', {
    when: ['The exit drone arrives', 'Die Abholdrohne kommt an'],
    direction: ['Cheerful.', 'Fröhlich.']
  }),
  live('atlas.levelUp', 'atlas', 'missionWarn', {
    when: ['Flux levels up mid-mission', 'Flux steigt in der Mission eine Stufe auf'],
    direction: ['Proud.', 'Stolz.']
  }),
  ...([1, 2, 3, 4] as const).map(n => live(`atlas.idle.${n}`, 'atlas', 'missionIdle', {
    when: ['Small talk in a quiet stretch', 'Smalltalk in einer ruhigen Phase'],
    direction: ['Warm, unhurried.', 'Warm, ohne Eile.']
  }))
]

// ── Atlas: planned (story-voice-over.md) ──
const ATLAS_PLAN: VoiceLine[] = [
  plan('atlas.boss.signalFirst', 'atlas', 'prologue', 2.2, {
    when: ['Scrapyard: the first Core Master signal', 'Schrottplatz: das erste Kernmeister-Signal'],
    draft: ['Core Master signal. It\'s… big.', 'Kernmeister-Signal. Er ist… groß.'],
    direction: ['Deadpan understatement, a pause before "big".', 'Trockene Untertreibung, Pause vor "groß".']
  }),
  plan('atlas.story.relayOne', 'atlas', 'prologue', 2, {
    when: ['The first relay is lit', 'Das erste Relais leuchtet'],
    draft: ['Relay one lit. Nine to go.', 'Relais eins leuchtet. Noch neun.'],
    direction: ['The first small win. A hint of a smile.', 'Der erste kleine Sieg. Ein Hauch von Lächeln.']
  }),
  plan('atlas.sector.blaze', 'atlas', 'act1', 2.4, {
    when: ['Beam-in: Blaze Refinery', 'Ankunft: Glutraffinerie'],
    draft: ['Refinery. It runs hot. Mind the vents.', 'Raffinerie. Hier wird\'s heiß. Achte auf die Düsen.'],
    direction: ['Brisk briefing.', 'Zügige Einweisung.']
  }),
  plan('atlas.boss.noWeak', 'atlas', 'act1', 2.2, {
    when: ['A boss fight with no known weakness', 'Ein Bosskampf ohne bekannte Schwäche'],
    draft: ['No weak spot I can see. Stay moving.', 'Keine Schwachstelle zu sehen. Bleib in Bewegung.'],
    direction: ['Focused.', 'Konzentriert.']
  }),
  ...WEAPONS.map(w => plan(`atlas.story.copied.${w}`, 'atlas', 'act1', 1.6, {
    when: ['A Master is freed: its weapon is copied', 'Ein Meister ist befreit: seine Waffe wird kopiert'],
    draft: ['{weapon} copied.', '{weapon} kopiert.'], params: { weapon: `weapon.${w}.name` },
    direction: ['Crisp.', 'Knackig.']
  })),
  plan('atlas.sector.cryo', 'atlas', 'act1', 2.4, {
    when: ['Beam-in: Cryo Plant', 'Ankunft: Kryowerk'],
    draft: ['Coolant\'s flowing uphill. To the Fortress.', 'Das Kühlmittel fließt bergauf. Zur Festung.'],
    direction: ['Noticing something; suspicious.', 'Bemerkt etwas; misstrauisch.']
  }),
  plan('atlas.story.dataCore', 'atlas', 'act1', 1.6, {
    when: ['The Frost Master leaves a data core behind', 'Der Frostmeister hinterlässt einen Datenkern'],
    draft: ['It left us something.', 'Er hat uns etwas dagelassen.'],
    direction: ['Curious, quiet.', 'Neugierig, leise.']
  }),
  plan('atlas.story.firstDraft', 'atlas', 'midpoint', 2.6, {
    when: ['The blueprint: Atlas recognises its own code', 'Der Bauplan: Atlas erkennt seinen eigenen Code'],
    draft: ['…I was written from its first draft.', '…Ich wurde aus seinem ersten Entwurf geschrieben.'],
    direction: ['The quietest line in the game. Unsettled.', 'Die leiseste Zeile des Spiels. Verunsichert.']
  }),
  plan('atlas.story.body', 'atlas', 'midpoint', 2.6, {
    when: ['The blueprint: what Vex is building', 'Der Bauplan: was Vex baut'],
    draft: ['It\'s building a body. Out of our valley.', 'Er baut sich einen Körper. Aus unserem Tal.'],
    direction: ['Recovering; resolve coming back.', 'Fängt sich; die Entschlossenheit kehrt zurück.']
  }),
  plan('atlas.volt.hack', 'atlas', 'act2', 2, {
    when: ['Volt Tower: Vex hacks Atlas mid-sentence', 'Voltturm: Vex hackt Atlas mitten im Satz'],
    draft: ['Flux… something\'s in the—', 'Flux… da ist etwas in mei—'],
    direction: ['Cut off mid-word, clean. The glitch is added in post.', 'Mitten im Wort abbrechen, sauber. Der Glitch kommt in der Nachbearbeitung.']
  }),
  plan('atlas.volt.thanks', 'atlas', 'act2', 2.4, {
    when: ['Volt Tower: the hack fails', 'Voltturm: der Hack scheitert'],
    draft: ['…You kept it out. Thank you.', '…Du hast es draußen gehalten. Danke.'],
    direction: ['Shaken, then sincere. Their bond line.', 'Erschüttert, dann aufrichtig. Die Zeile ihrer Freundschaft.']
  }),
  plan('atlas.story.voltFreed', 'atlas', 'act2', 2.2, {
    when: ['The Volt Master is freed', 'Der Voltmeister ist befreit'],
    draft: ['The signal\'s lost its power station.', 'Das Signal hat sein Kraftwerk verloren.'],
    direction: ['Satisfied.', 'Zufrieden.']
  }),
  plan('atlas.sector.gale', 'atlas', 'act2', 2.4, {
    when: ['Beam-in: Sky Docks', 'Ankunft: Himmelsdocks'],
    draft: ['Every part for its body goes through here.', 'Jedes Teil für seinen Körper kommt hier durch.'],
    direction: ['A briefing with purpose.', 'Eine Einweisung mit Ziel.']
  }),
  plan('atlas.story.galeFreed', 'atlas', 'act2', 2.2, {
    when: ['The Gale Master is freed', 'Der Sturmmeister ist befreit'],
    draft: ['No more parts reach the Fortress.', 'Keine Teile erreichen mehr die Festung.'],
    direction: ['Quiet triumph.', 'Leiser Triumph.']
  }),
  plan('atlas.story.breach', 'atlas', 'shift', 2.2, {
    when: ['The Fortress shield falls', 'Der Schild der Festung fällt'],
    draft: ['Shield\'s down. The Fortress is open.', 'Der Schild ist unten. Die Festung ist offen.'],
    direction: ['Steady: this is it.', 'Ruhig: jetzt gilt es.']
  }),
  plan('atlas.fortress.bays', 'atlas', 'act3', 1.8, {
    when: ['Fortress: the half-built assembly bays', 'Festung: die halb gebauten Montagehallen'],
    draft: ['Half-built. You did that.', 'Halb gebaut. Das warst du.'],
    direction: ['Proud, understated.', 'Stolz, zurückhaltend.']
  }),
  plan('atlas.mk1.intro', 'atlas', 'act3', 1.8, {
    when: ['Mk-I intro: Vex steps into his body', 'Mk-I-Auftritt: Vex steigt in seinen Körper'],
    draft: ['That\'s Vex. The real one.', 'Das ist Vex. Der echte.'],
    direction: ['Low and focused.', 'Tief und konzentriert.']
  }),
  ...([['fire', 'Fire!', 'Feuer!'], ['ice', 'Ice!', 'Eis!'], ['volt', 'Volt!', 'Volt!'], ['wind', 'Wind!', 'Wind!'], ['scrap', 'Scrap!', 'Schrott!']] as const)
    .map(([id, en, de]) => plan(`atlas.mk1.${id}`, 'atlas', 'act3', 0.6, {
      when: ['Mk-I fight: calling the element of its next attack', 'Mk-I-Kampf: ruft das Element des nächsten Angriffs'],
      draft: [en, de], direction: ['A sharp call-out, on the beat.', 'Ein scharfer Zuruf, auf den Punkt.']
    })),
  plan('atlas.mk1.free', 'atlas', 'act3', 1.8, {
    when: ['Mk-I phase 2: answering Vex ("Why won\'t they listen?")', 'Mk-I Phase 2: Antwort an Vex ("Warum hören sie nicht?")'],
    draft: ['Because they\'re free.', 'Weil sie frei sind.'],
    direction: ['Calm, almost gentle. The thesis of the game.', 'Ruhig, fast sanft. Die Kernaussage des Spiels.']
  }),
  plan('atlas.ending.spire', 'atlas', 'ending', 2.8, {
    when: ['Ending: the empty Spire', 'Ende: die leere Spitze'],
    draft: ['The Spire\'s empty. I could run all of it.', 'Die Spitze ist leer. Ich könnte alles steuern.'],
    direction: ['Tempted. A slow realisation, not greed.', 'In Versuchung. Eine langsame Erkenntnis, keine Gier.']
  }),
  plan('atlas.ending.choice', 'atlas', 'ending', 2.2, {
    when: ['Ending: Atlas chooses', 'Ende: Atlas entscheidet sich'],
    draft: ['…No. They can run themselves.', '…Nein. Sie können sich selbst steuern.'],
    direction: ['A decision, not a sacrifice. Peace.', 'Eine Entscheidung, kein Opfer. Frieden.']
  }),
  plan('atlas.ending.spark', 'atlas', 'ending', 2.2, {
    when: ['Ending: the last shot', 'Ende: die letzte Einstellung'],
    draft: ['Flux… did you see that spark?', 'Flux… hast du den Funken gesehen?'],
    direction: ['Light and curious: a hook, not dread.', 'Leicht und neugierig: ein Köder, keine Angst.']
  }),
  // Field warnings and hints
  plan('atlas.warn.boss', 'atlas', 'fieldWarn', 1.4, {
    when: ['A Core Master ahead', 'Ein Kernmeister voraus'], draft: ['Core Master ahead.', 'Kernmeister voraus.'],
    direction: ['Alert.', 'Wachsam.']
  }),
  ...WEAK_TO.map(([b, w]) => plan(`atlas.warn.weakTo.${b}`, 'atlas', 'fieldWarn', 2.2, {
    when: ['Boss intro: naming its weakness', 'Boss-Auftritt: nennt seine Schwäche'],
    draft: ['{boss}. {weapon} hurts it.', '{boss}. {weapon} tut ihm weh.'],
    params: { boss: `boss.${b}`, weapon: `weapon.${w}.name` },
    direction: ['Tactical.', 'Taktisch.']
  })),
  plan('atlas.warn.gelFirst', 'atlas', 'fieldWarn', 2, {
    when: ['Low health the first time, a gel in the pack', 'Zum ersten Mal wenig Gesundheit, ein Gel im Gepäck'],
    draft: ['Plating\'s cracking. Use a gel.', 'Die Panzerung bricht. Nimm ein Gel.'],
    direction: ['Concerned; a clear instruction.', 'Besorgt; eine klare Anweisung.']
  }),
  plan('atlas.warn.gel', 'atlas', 'fieldWarn', 0.6, {
    when: ['Low health again, a gel in the pack', 'Wieder wenig Gesundheit, ein Gel im Gepäck'],
    draft: ['Gel.', 'Gel.'], direction: ['A quick nudge.', 'Ein kurzer Stups.']
  }),
  plan('atlas.warn.criticalFirst', 'atlas', 'fieldWarn', 1.2, {
    when: ['Critical health, the first time', 'Kritische Gesundheit, zum ersten Mal'],
    draft: ['Critical! Back off!', 'Kritisch! Zieh dich zurück!'],
    direction: ['Tight and fast, NOT loud.', 'Knapp und schnell, NICHT laut.']
  }),
  plan('atlas.warn.critical', 'atlas', 'fieldWarn', 0.7, {
    when: ['Critical health again', 'Wieder kritische Gesundheit'], draft: ['Critical!', 'Kritisch!'],
    direction: ['Tight.', 'Knapp.']
  }),
  plan('atlas.warn.noGel', 'atlas', 'fieldWarn', 1.8, {
    when: ['Low health, no gel left', 'Wenig Gesundheit, kein Gel mehr'],
    draft: ['No gel left. Play it safe.', 'Kein Gel mehr. Geh auf Nummer sicher.'],
    direction: ['Worried and calm.', 'Besorgt und ruhig.']
  }),
  plan('atlas.warn.weLow', 'atlas', 'fieldWarn', 2, {
    when: ['Weapon energy low', 'Waffenenergie niedrig'],
    draft: ['Weapon energy low. Buster\'s free.', 'Waffenenergie niedrig. Der Buster kostet nichts.'],
    direction: ['Practical.', 'Praktisch.']
  }),
  plan('atlas.warn.weEmpty', 'atlas', 'fieldWarn', 0.9, {
    when: ['Weapon energy empty', 'Waffenenergie leer'], draft: ['Tank\'s dry.', 'Tank ist leer.'],
    direction: ['Dry (pun intended).', 'Trocken (Wortspiel beabsichtigt).']
  }),
  ...WEAPONS.map(w => plan(`atlas.warn.borrowedLast.${w}`, 'atlas', 'fieldWarn', 1.6, {
    when: ['A borrowed weapon\'s last shot', 'Der letzte Schuss einer geliehenen Waffe'],
    draft: ['Last shot of {weapon}.', 'Letzter Schuss {weapon}.'], params: { weapon: `weapon.${w}.name` },
    direction: ['A heads-up.', 'Ein Hinweis.']
  })),
  plan('atlas.warn.flame', 'atlas', 'fieldWarn', 2.2, {
    when: ['A flame-jet trap ahead', 'Eine Flammendüsen-Falle voraus'],
    draft: ['Vents. Wait for it… or slide.', 'Düsen. Warte ab… oder rutsch durch.'],
    direction: ['Coaching, a pause on "wait for it".', 'Wie ein Trainer, Pause bei "warte ab".']
  }),
  plan('atlas.warn.blade', 'atlas', 'fieldWarn', 1.8, {
    when: ['A blade trap ahead', 'Eine Klingenfalle voraus'],
    draft: ['Blade. Go right after it.', 'Klinge. Lauf direkt hinter ihr durch.'], direction: ['Coaching.', 'Wie ein Trainer.']
  }),
  plan('atlas.warn.crusher', 'atlas', 'fieldWarn', 1.6, {
    when: ['A crusher ahead', 'Eine Presse voraus'],
    draft: ['Crusher. Watch the lamp.', 'Presse. Achte auf die Lampe.'], direction: ['Coaching.', 'Wie ein Trainer.']
  }),
  plan('atlas.warn.ladder', 'atlas', 'fieldWarn', 1.8, {
    when: ['The first ladder', 'Die erste Leiter'],
    draft: ['Ladder. Push toward the wall.', 'Leiter. Drück dich zur Wand.'], direction: ['Coaching.', 'Wie ein Trainer.']
  }),
  plan('atlas.warn.pit', 'atlas', 'fieldWarn', 1.6, {
    when: ['A pit with a lift', 'Ein Abgrund mit Aufzug'],
    draft: ['Long drop. Time the lift.', 'Tiefer Fall. Pass den Aufzug ab.'], direction: ['Coaching.', 'Wie ein Trainer.']
  }),
  plan('atlas.hint.locator', 'atlas', 'fieldWarn', 1.4, {
    when: ['The objective locator appears', 'Der Zielanzeiger erscheint'],
    draft: ['Objective\'s that way.', 'Das Ziel liegt da lang.'], direction: ['Casual.', 'Beiläufig.']
  }),
  plan('atlas.hint.rescue', 'atlas', 'fieldWarn', 2, {
    when: ['A worker-bot to rescue is near', 'Ein Arbeiterbot zum Retten ist in der Nähe'],
    draft: ['Worker-bot signal. Faint. Close.', 'Arbeiterbot-Signal. Schwach. Ganz nah.'], direction: ['Hopeful.', 'Hoffnungsvoll.']
  }),
  plan('atlas.hint.upgrade', 'atlas', 'fieldWarn', 1.2, {
    when: ['Loot better than what Flux wears', 'Beute, besser als Fluxs Ausrüstung'],
    draft: ['That\'s an upgrade.', 'Das ist ein Upgrade.'], direction: ['Pleased.', 'Erfreut.']
  }),
  plan('atlas.hint.levelUp', 'atlas', 'fieldWarn', 1.4, {
    when: ['A level-up', 'Ein Stufenaufstieg'], draft: ['New chip compiled.', 'Neuer Chip kompiliert.'],
    direction: ['Proud.', 'Stolz.']
  }),
  plan('atlas.hint.done', 'atlas', 'fieldWarn', 2, {
    when: ['The objective is done', 'Das Ziel ist erledigt'],
    draft: ['Done. Call the drone when ready.', 'Erledigt. Ruf die Drohne, wenn du so weit bist.'], direction: ['Relaxed.', 'Entspannt.']
  }),
  plan('atlas.hint.underLevel', 'atlas', 'fieldWarn', 1.8, {
    when: ['Flux is under the sector\'s floor level', 'Flux liegt unter der Mindeststufe des Sektors'],
    draft: ['They\'ll outclass you. Train first.', 'Die sind dir überlegen. Trainier erst.'], direction: ['An honest warning.', 'Eine ehrliche Warnung.']
  }),
  ...SECTOR_FLOOR.map(([s, n]) => plan(`atlas.hint.floor.${s}`, 'atlas', 'fieldWarn', 2, {
    when: ['The mission card: the sector\'s floor level', 'Die Missionskarte: die Mindeststufe des Sektors'],
    draft: [`{sector} runs level ${n} and up.`, `{sector} beginnt ab Stufe ${n}.`], params: { sector: `sector.${s}` },
    direction: ['A briefing.', 'Eine Einweisung.']
  })),
  plan('atlas.warn.down', 'atlas', 'fieldWarn', 1.8, {
    when: ['Flux goes down', 'Flux geht zu Boden'],
    draft: ['Rebooting… Pip\'s got you.', 'Neustart… Pip hat dich.'], direction: ['Reassuring.', 'Beruhigend.']
  }),
  // Machine scans
  ...([
    ['hardhat', '{enemy}. Shoot when it peeks.', '{enemy}. Schieß, wenn er rauslugt.', 1.8],
    ['trooper', 'Shield. Charge through it.', 'Schild. Mit einer Ladung durchbrechen.', 1.6],
    ['heli', '{enemy}. Look up.', '{enemy}. Schau nach oben.', 1.4],
    ['hopper', '{enemy}. Move off the ring.', '{enemy}. Runter vom Ring.', 1.6],
    ['roller', '{enemy}. Sidestep it.', '{enemy}. Weich seitlich aus.', 1.6],
    ['brute', '{enemy}. Parry, then punish.', '{enemy}. Parieren, dann zuschlagen.', 1.8],
    ['turret', '{enemy}. Keep moving.', '{enemy}. Bleib in Bewegung.', 1.6],
    ['golem', 'That crate\'s breathing. Get close.', 'Die Kiste atmet. Geh nah ran.', 2],
    ['polar', '{enemy}. Shoot it when it opens red.', '{enemy}. Schieß, wenn es rot aufgeht.', 1.8],
    ['warden', '{enemy}. Hit the core when it opens.', '{enemy}. Triff den Kern, wenn er aufgeht.', 1.8],
    ['hornet', '{enemy}. It dives straight: sidestep!', '{enemy}. Er stürzt geradeaus: zur Seite!', 1.6],
    ['stalker', '{enemy}. Parry the lunge.', '{enemy}. Pariere den Sprung.', 1.8],
    ['puffer', '{enemy}. Pop it before it swells.', '{enemy}. Platz ihn, bevor er anschwillt.', 1.6],
    ['mole', '{enemy}. Hit it when it pops up.', '{enemy}. Triff ihn beim Auftauchen.', 1.8],
    ['elite', 'Gold ring. Elite. Careful.', 'Goldring. Elite. Vorsicht.', 1.6]
  ] as const).map(([e, en, de, max]) => plan(`atlas.scan.${e}`, 'atlas', 'scan', max, {
    when: ['The first sighting of this machine', 'Die erste Sichtung dieser Maschine'],
    draft: [en, de], params: { enemy: `enemy.${e}` }, direction: ['A quick tactical read.', 'Eine schnelle taktische Einschätzung.']
  })),
  ...([['fire', 'Fire', 'Feuer'], ['ice', 'Ice', 'Eis'], ['volt', 'Volt', 'Volt'], ['wind', 'Wind', 'Wind']] as const)
    .map(([id, en, de]) => plan(`atlas.scan.${id}`, 'atlas', 'scan', 2, {
      when: [`The first ${id}-coated machine`, `Die erste Maschine mit ${de}-Beschichtung`],
      draft: [`${en}-coated. It shrugs off ${en.toLowerCase()}.`, `${de}beschichtet. ${de} prallt ab.`],
      direction: ['A quick tactical read.', 'Eine schnelle taktische Einschätzung.']
    }))
]

// ── Atlas: stage helper lines and secret hints (planned) ──
// One list per stage, filled by that stage's module; the secrets' own.
const ATLAS_HINT_BLAZE: VoiceLine[] = ([
  ['lava', 'Meltdown Descent: the first catwalks over lava', 'Kernschmelze: die ersten Laufstege über Lava',
    'That\'s lava down there. Stay on the metal.', 'Da unten ist Lava. Bleib auf dem Metall.', 2.4, 'A calm warning, eyes down.', 'Eine ruhige Warnung, Blick nach unten.'],
  ['leap', 'Meltdown Descent: the first dash-leap gap', 'Kernschmelze: die erste Rutschsprung-Lücke',
    'Too wide to walk. Slide off the edge, you\'ll carry.', 'Zu weit zum Gehen. Rutsch über die Kante, du fliegst rüber.', 2.8, 'A coach\'s tip, confident.', 'Ein Trainer-Tipp, zuversichtlich.'],
  ['vents', 'Meltdown Descent: the flame-vent walkway', 'Kernschmelze: der Laufsteg mit Flammendüsen',
    'Hiss, then fire. Let the roar pass, then go.', 'Erst Zischen, dann Feuer. Warte das Fauchen ab, dann los.', 2.6, 'Rhythmic, counting it out.', 'Rhythmisch, zählt mit.'],
  ['barrels', 'Meltdown Descent: the ember barrels cross the stairs', 'Kernschmelze: Glutfässer rollen über die Treppe',
    'Barrels! Watch the lamps, cross between them.', 'Fässer! Achte auf die Lampen, geh zwischen ihnen durch.', 2.4, 'Quick, a little alarmed.', 'Schnell, leicht alarmiert.'],
  ['hammers', 'Meltdown Descent: the forge hammers over the walkway', 'Kernschmelze: die Schmiedehämmer über dem Steg',
    'Forge hammers. Count the beat, then run.', 'Schmiedehämmer. Zähl den Takt, dann lauf.', 2.2, 'Steady, like a metronome.', 'Gleichmäßig, wie ein Metronom.'],
  ['drop', 'Meltdown Descent: the top of the big drop shaft', 'Kernschmelze: oben am großen Fallschacht',
    'Long way down. One ledge at a time.', 'Weit runter. Ein Sims nach dem anderen.', 2, 'Dry understatement.', 'Trockene Untertreibung.']
] as const).map(([id, when, whenDe, en, de, max, dir, dirDe]) => plan(`atlas.hint.blaze.${id}`, 'atlas', 'act1', max, {
  when: [when, whenDe], draft: [en, de], direction: [dir, dirDe]
}))

const ATLAS_HINT_CRYO: VoiceLine[] = [
  plan('atlas.hint.cryo.ice', 'atlas', 'fieldWarn', 2.2, {
    when: ['Glacier Run: the first ice patch, in the lobby', 'Gletscherlauf: die erste Eisfläche, in der Halle'],
    draft: ['Ice! Let go of the stick and you\'ll keep sliding.', 'Eis! Lass den Stick los, und du rutschst weiter.'],
    direction: ['Delighted, a little mischievous.', 'Begeistert, ein bisschen verschmitzt.']
  }),
  plan('atlas.hint.cryo.spikes', 'atlas', 'fieldWarn', 2.4, {
    when: ['Glacier Run: the ice bridge over the spike pit', 'Gletscherlauf: die Eisbrücke über der Stachelgrube'],
    draft: ['Spikes under that ice. Walk it straight, no sharp turns.', 'Stacheln unter dem Eis. Geh geradeaus, keine scharfen Kurven.'],
    direction: ['Careful, steady.', 'Vorsichtig, ruhig.']
  }),
  plan('atlas.hint.cryo.frost', 'atlas', 'fieldWarn', 2.6, {
    when: ['Glacier Run: the first frost thrower', 'Gletscherlauf: der erste Frostwerfer'],
    draft: ['Frost thrower. It glows and hisses first. Cross when it\'s quiet.', 'Frostwerfer. Erst glüht und zischt er. Geh, wenn er still ist.'],
    direction: ['Tactical, quick.', 'Taktisch, zügig.']
  }),
  plan('atlas.hint.cryo.icicles', 'atlas', 'fieldWarn', 2, {
    when: ['Glacier Run: the icicle hall', 'Gletscherlauf: die Eiszapfenhalle'],
    draft: ['Shadows on the floor? Icicles. Step out of the ring!', 'Schatten am Boden? Eiszapfen. Raus aus dem Ring!'],
    direction: ['A quick look up, then urgent.', 'Ein schneller Blick nach oben, dann dringend.']
  }),
  plan('atlas.hint.cryo.pillar', 'atlas', 'fieldWarn', 2.4, {
    when: ['Glacier Run: a cracked ice pillar in sight', 'Gletscherlauf: eine rissige Eissäule in Sicht'],
    draft: ['That pillar\'s cracked. Shoot it, and there\'s your shortcut.', 'Die Säule hat Risse. Schieß drauf – schon hast du eine Abkürzung.'],
    direction: ['Sly, pointing out a trick.', 'Schlau, verrät einen Trick.']
  }),
  plan('atlas.hint.cryo.stairs', 'atlas', 'fieldWarn', 2, {
    when: ['Glacier Run: the top of the ice stairs', 'Gletscherlauf: oben an der Eistreppe'],
    draft: ['Icy stairs. Go slow — the landing\'s small.', 'Eisige Treppe. Langsam – der Absatz ist klein.'],
    direction: ['Calm warning.', 'Ruhige Warnung.']
  })
]

const ATLAS_HINT_VOLT: VoiceLine[] = [
  plan('atlas.hint.volt.panels', 'atlas', 'fieldWarn', 2.4, {
    when: ['Rail Rush: first coming up to the electrified floor panels', 'Rail Rush: zum ersten Mal vor den Strom-Bodenplatten'],
    draft: ['Those panels pulse. Wait on a dark row, then step.', 'Die Platten pulsieren. Warte auf einer dunklen Reihe, dann los.'],
    direction: ['A calm tip: timing, not speed.', 'Ein ruhiger Tipp: Timing, nicht Tempo.']
  }),
  plan('atlas.hint.volt.board', 'atlas', 'fieldWarn', 2.4, {
    when: ['Rail Rush: the maglev cart sets off with Flux on it', 'Rail Rush: der Magnetschwebewagen fährt mit Flux los'],
    draft: ['Hands off the controls — I\'ll drive, you shoot.', 'Hände weg vom Steuer — ich fahre, du schießt.'],
    direction: ['Gleeful, taking the wheel.', 'Vergnügt, übernimmt das Steuer.']
  }),
  plan('atlas.hint.volt.wave', 'atlas', 'fieldWarn', 2, {
    when: ['Rail Rush: the first wave of drones comes in ahead of the cart', 'Rail Rush: die erste Drohnenwelle vor dem Wagen'],
    draft: ['Drones ahead! Shoot them before they swoop.', 'Drohnen voraus! Schieß sie ab, bevor sie herabstoßen.'],
    direction: ['Quick, alert.', 'Schnell, wachsam.']
  }),
  plan('atlas.hint.volt.dip', 'atlas', 'fieldWarn', 2, {
    when: ['Rail Rush: just before the rail\'s big drop', 'Rail Rush: kurz vor dem großen Gefälle der Schiene'],
    draft: ['Big drop ahead. Hold on — keep shooting!', 'Gleich geht\'s steil runter. Festhalten — weiterschießen!'],
    direction: ['Rollercoaster thrill.', 'Achterbahn-Nervenkitzel.']
  }),
  plan('atlas.hint.volt.arrive', 'atlas', 'fieldWarn', 1.5, {
    when: ['Rail Rush: the cart stops at the exit station', 'Rail Rush: der Wagen hält an der Endstation'],
    draft: ['End of the line. Hop off!', 'Endstation. Steig aus!'], direction: ['Cheerful, a conductor.', 'Fröhlich, wie ein Schaffner.']
  })
]

const ATLAS_HINT_GALE: VoiceLine[] = [
  plan('atlas.hint.gale.leap', 'atlas', 'fieldWarn', 3, {
    when: ['Sky Docks: the first one-cell gap between islands', 'Himmelsdocks: die erste Ein-Feld-Lücke zwischen Inseln'],
    draft: ['Gap\'s too wide to walk. Slide off the edge — you\'ll carry.', 'Zu breit zum Gehen. Rutsch über die Kante – du fliegst mit.'],
    direction: ['Coaching, quick and sure.', 'Wie ein Trainer, schnell und sicher.']
  }),
  plan('atlas.hint.gale.down', 'atlas', 'fieldWarn', 2, {
    when: ['Sky Docks: landed across the first gap', 'Himmelsdocks: über die erste Lücke gelandet'],
    draft: ['Nice leap. Now don\'t look down.', 'Schöner Sprung. Jetzt bloß nicht nach unten schauen.'],
    direction: ['Pleased, then dry.', 'Erfreut, dann trocken.']
  }),
  plan('atlas.hint.gale.shuttle', 'atlas', 'fieldWarn', 2.6, {
    when: ['Sky Docks: the first shuttle over a wide gap', 'Himmelsdocks: die erste Fähre über eine breite Lücke'],
    draft: ['Shuttles. Step on when it docks, off at the other end.', 'Fähren. Aufsteigen, wenn sie anlegt, drüben wieder runter.'],
    direction: ['Coaching.', 'Wie ein Trainer.']
  }),
  plan('atlas.hint.gale.wind', 'atlas', 'fieldWarn', 3, {
    when: ['Sky Docks: the mouth of the wind tunnel', 'Himmelsdocks: der Eingang des Windkanals'],
    draft: ['Wait for the gust to die, then move. Or hide behind a pillar.', 'Warte, bis die Böe abflaut, dann los. Oder duck dich hinter eine Säule.'],
    direction: ['Calm over the roar of the wind.', 'Ruhig über das Heulen des Windes hinweg.']
  }),
  plan('atlas.hint.gale.bob', 'atlas', 'fieldWarn', 2.6, {
    when: ['Sky Docks: the first bobbing platform', 'Himmelsdocks: die erste schwebende Plattform'],
    draft: ['Bobbing platforms. Hop on at the bottom, ride it up.', 'Schwebeplattformen. Unten aufsteigen, mit nach oben fahren.'],
    direction: ['Coaching, a little playful.', 'Wie ein Trainer, ein bisschen verspielt.']
  })
]

const ATLAS_SECRET: VoiceLine[] = [
  plan('atlas.secret.lights', 'atlas', 'fieldWarn', 3, {
    when: ['First time near a lamp puzzle (copy the panel\'s on/off pattern)', 'Zum ersten Mal an einem Lampenrätsel (das An/Aus-Muster des Schilds nachmachen)'],
    draft: ['That panel shows a pattern. The lamps on the wall don\'t. Yet.', 'Das Schild zeigt ein Muster. Die Lampen an der Wand noch nicht.'],
    direction: ['Dry, a raised eyebrow; a tiny pause before "Yet."', 'Trocken, eine hochgezogene Augenbraue; kleine Pause vor "noch nicht".']
  }),
  plan('atlas.secret.color', 'atlas', 'fieldWarn', 3, {
    when: ['First time near a colour puzzle (only the frame\'s colour lit)', 'Zum ersten Mal an einem Farbrätsel (nur die Farbe des Rahmens an)'],
    draft: ['That frame has a favourite colour. Only its lamps should shine.', 'Der Rahmen hat eine Lieblingsfarbe. Nur ihre Lampen sollen leuchten.'],
    direction: ['Conspiratorial, half a whisper.', 'Verschwörerisch, halb geflüstert.']
  }),
  plan('atlas.secret.cycle', 'atlas', 'fieldWarn', 3, {
    when: ['First time near a colour-cycle puzzle (each hit steps the colour)', 'Zum ersten Mal an einem Farbwechselrätsel (jeder Treffer wechselt die Farbe)'],
    draft: ['Every hit changes a lamp\'s mind. The panel knows what it wants.', 'Jeder Treffer ändert die Meinung einer Lampe. Das Schild weiß, was es will.'],
    direction: ['Amused, like describing a fussy pet.', 'Amüsiert, als beschriebe man ein wählerisches Haustier.']
  }),
  plan('atlas.secret.solved', 'atlas', 'fieldWarn', 2, {
    when: ['A secret wall opens (puzzle solved)', 'Eine geheime Wand öffnet sich (Rätsel gelöst)'],
    draft: ['Well, well. Someone likes puzzles.', 'Sieh an. Da mag jemand Rätsel.'],
    direction: ['Impressed, pretending not to be.', 'Beeindruckt, tut aber so, als wäre es nicht so.']
  })
]

// ── Vex (planned) ──
const VEX: VoiceLine[] = [
  plan('vex.intro.diagnosis', 'vex', 'intro', 3.5, {
    when: ['Intro: Vex takes over the screens', 'Intro: Vex übernimmt die Bildschirme'],
    draft: ['Diagnosis: this valley is SICK. The cure… is ME!', 'Diagnose: Dieses Tal ist KRANK. Die Heilung… bin ICH!'],
    direction: ['A grand reveal. A pause before "is ME", which is huge.', 'Eine große Enthüllung. Pause vor "bin ICH", das riesig kommt.']
  }),
  plan('vex.present.scrapper', 'vex', 'prologue', 2.5, {
    when: ['Presents the Scrapper', 'Kündigt den Schrottbrecher an'],
    draft: ['Warm up act! The {BOSS}!', 'Die Vorband! Der {BOSS}!'], params: { boss: 'boss.scrapper' },
    direction: ['A ringmaster, a bit dismissive.', 'Ein Zirkusdirektor, etwas herablassend.']
  }),
  plan('vex.hub.scrapper', 'vex', 'prologue', 2.5, {
    when: ['The hub, after the Scrapper', 'Die Basis, nach dem Schrottbrecher'],
    draft: ['A junk crane? How… adorable.', 'Ein Schrottkran? Wie… entzückend.'], direction: ['Mock-sweet, patronising.', 'Gespielt süß, herablassend.']
  }),
  plan('vex.present.blaze', 'vex', 'act1', 3, {
    when: ['Presents the Blaze Master', 'Kündigt den Glutmeister an'],
    draft: ['The oldest! The hottest! {BOSS}!', 'Der Älteste! Der Heißeste! {BOSS}!'], params: { boss: 'boss.blazeMaster' },
    direction: ['A full boxing-announcer build.', 'Ein Boxkampf-Ansager mit voller Steigerung.']
  }),
  plan('vex.hub.blaze', 'vex', 'act1', 2.8, {
    when: ['The hub, after the Blaze Master', 'Die Basis, nach dem Glutmeister'],
    draft: ['Side effect noted. Increasing the dose.', 'Nebenwirkung notiert. Ich erhöhe die Dosis.'],
    direction: ['Clinical and irritated, a doctor annoyed at a chart.', 'Klinisch und gereizt, ein Arzt, der sich über ein Krankenblatt ärgert.']
  }),
  plan('vex.present.frost', 'vex', 'act1', 2.8, {
    when: ['Presents the Frost Master', 'Kündigt den Frostmeister an'],
    draft: ['Chill, little droid. {BOSS}!', 'Bleib cool, kleiner Droide. {BOSS}!'], params: { boss: 'boss.frostMaster' },
    direction: ['Smug about the pun.', 'Selbstgefällig über das Wortspiel.']
  }),
  plan('vex.hub.blueprint', 'vex', 'midpoint', 2.8, {
    when: ['The hub: Flux found his blueprint', 'Die Basis: Flux hat seinen Bauplan gefunden'],
    draft: ['My sketches! Magnificent, aren\'t I?', 'Meine Skizzen! Großartig, nicht wahr?'],
    direction: ['Preening, delighted to be noticed.', 'Eitel, entzückt, bemerkt zu werden.']
  }),
  plan('vex.volt.hack', 'vex', 'act2', 2.8, {
    when: ['Volt Tower: he hacks Atlas', 'Voltturm: er hackt Atlas'],
    draft: ['Let\'s see what\'s in that empty head…', 'Mal sehen, was in dem leeren Kopf steckt…'],
    direction: ['Creepy-playful, a burglar humming.', 'Gruselig-verspielt, ein summender Einbrecher.']
  }),
  plan('vex.volt.fail', 'vex', 'act2', 2.2, {
    when: ['Volt Tower: the hack fails', 'Voltturm: der Hack scheitert'],
    draft: ['Unwritable?! How RUDE.', 'Nicht beschreibbar?! Wie UNVERSCHÄMT.'], direction: ['Scandalised. The monocle pops.', 'Empört. Das Monokel springt heraus.']
  }),
  plan('vex.present.volt', 'vex', 'act2', 2.8, {
    when: ['Presents the Volt Master', 'Kündigt den Voltmeister an'],
    draft: ['Blink and you\'ll miss it! {BOSS}!', 'Einmal blinzeln und er ist weg! {BOSS}!'], params: { boss: 'boss.voltMaster' },
    direction: ['Fast and zappy.', 'Schnell und zackig.']
  }),
  plan('vex.hub.volt', 'vex', 'act2', 2.8, {
    when: ['The hub, after the Volt Master', 'Die Basis, nach dem Voltmeister'],
    draft: ['I am… per-fect-ly… FINE.', 'Mir geht es… ab-so-lut… BESTENS.'],
    direction: ['Forced calm that cracks on the last word. The stutter is added in post.', 'Erzwungene Ruhe, die beim letzten Wort bricht. Das Stottern kommt in der Nachbearbeitung.']
  }),
  plan('vex.present.gale', 'vex', 'act2', 3, {
    when: ['Presents the Gale Master', 'Kündigt den Sturmmeister an'],
    draft: ['Next, please! {BOSS}, blow him away!', 'Der Nächste, bitte! {BOSS}, puste ihn weg!'], params: { boss: 'boss.galeMaster' },
    direction: ['Brisk showmanship, a doctor calling the next patient. Not desperate yet: he still has a reserve.', 'Zackige Showeinlage, ein Arzt ruft den nächsten Patienten auf. Noch nicht verzweifelt: er hat noch eine Reserve.']
  }),
  plan('vex.hub.gale', 'vex', 'act2', 2.4, {
    when: ['The hub, after the Gale Master: the shield holds, he calls up his reserve', 'Die Basis, nach dem Sturmmeister: der Schild hält, er ruft seine Reserve'],
    draft: ['Fine! I have MORE Masters.', 'Schön! Ich habe noch MEHR Meister.'],
    direction: ['Huffy, then smug again: he has a trick left.', 'Eingeschnappt, dann wieder selbstgefällig: er hat noch einen Trick.']
  }),
  plan('atlas.sector.magnet', 'atlas', 'shift', 2.2, {
    when: ['Beam-in: Polarity Works', 'Ankunft: Polaritätswerk'],
    draft: ['A foundry. It\'s casting claws.', 'Eine Gießerei. Hier entstehen Klauen.'],
    direction: ['Noticing something; a little grim.', 'Bemerkt etwas; ein wenig grimmig.']
  }),
  plan('vex.present.magnet', 'vex', 'shift', 2.8, {
    when: ['Presents the Magnet Master', 'Kündigt den Magnetmeister an'],
    draft: ['Attractive, isn\'t it? {BOSS}!', 'Anziehend, nicht wahr? {BOSS}!'], params: { boss: 'boss.magnetMaster' },
    direction: ['Silky, pleased with the pun: a ringmaster leaning on "attractive".', 'Seidig, zufrieden mit dem Wortspiel: ein Zirkusdirektor, der "anziehend" auskostet.']
  }),
  plan('atlas.story.magnetFreed', 'atlas', 'shift', 2.2, {
    when: ['The Magnet Master is freed', 'Der Magnetmeister ist befreit'],
    draft: ['The foundry\'s cold. No more claws.', 'Die Gießerei ist kalt. Keine Klauen mehr.'],
    direction: ['Satisfied.', 'Zufrieden.']
  }),
  plan('vex.hub.magnet', 'vex', 'shift', 2.4, {
    when: ['The hub, after the Magnet Master', 'Die Basis, nach dem Magnetmeister'],
    draft: ['Repelled? Me? Im-POSSIBLE!', 'Abgestoßen? Ich? Un-MÖGLICH!'],
    direction: ['Offended vanity; breaks the last word in two.', 'Gekränkte Eitelkeit; bricht das letzte Wort in zwei Teile.']
  }),
  plan('atlas.sector.drill', 'atlas', 'shift', 2.2, {
    when: ['Beam-in: Deep Mine', 'Ankunft: Tiefenmine'],
    draft: ['Ore for its armor. Dug right here.', 'Erz für seine Panzerung. Von hier unten.'],
    direction: ['Low and close, like a voice down a shaft.', 'Tief und nah, wie eine Stimme in einem Schacht.']
  }),
  plan('vex.present.drill', 'vex', 'shift', 3, {
    when: ['Presents the Drill Master', 'Kündigt den Bohrmeister an'],
    draft: ['Time for a deep check-up! {BOSS}!', 'Zeit für eine Tiefenuntersuchung! {BOSS}!'], params: { boss: 'boss.drillMaster' },
    direction: ['A doctor\'s bedside manner gone theatrical; leans into "deep".', 'Ärztlicher Plauderton, ins Theatralische gekippt; legt sich in "Tiefen".']
  }),
  plan('atlas.story.drillFreed', 'atlas', 'shift', 2.2, {
    when: ['The Drill Master is freed', 'Der Bohrmeister ist befreit'],
    draft: ['The mine\'s quiet. No more ore.', 'Die Mine ist still. Kein Erz mehr.'],
    direction: ['Quiet, a breath out.', 'Leise, ein Ausatmen.']
  }),
  plan('vex.hub.drill', 'vex', 'shift', 2.4, {
    when: ['The hub, after the Drill Master', 'Die Basis, nach dem Bohrmeister'],
    draft: ['Hmph. A new low. Literally.', 'Pah. Ein neuer Tiefpunkt. Wörtlich.'],
    direction: ['Sulky and deadpan, then pleased with his own pun on the last word.', 'Schmollend und trocken, dann zufrieden mit dem eigenen Wortspiel beim letzten Wort.']
  }),
  plan('atlas.sector.tide', 'atlas', 'shift', 2.2, {
    when: ['Beam-in: Tidewater Locks', 'Ankunft: Gezeitenschleusen'],
    draft: ['Barges now. Vex found another way.', 'Jetzt Lastkähne. Vex hat einen neuen Weg.'],
    direction: ['Wry: Vex is resourceful.', 'Trocken: Vex ist einfallsreich.']
  }),
  plan('vex.present.tide', 'vex', 'shift', 2.8, {
    when: ['Presents the Tide Master', 'Kündigt den Gezeitenmeister an'],
    draft: ['Wave goodbye, droid! {BOSS}!', 'Hier kommt die große Welle! {BOSS}!'], params: { boss: 'boss.tideMaster' },
    direction: ['Grand and splashy, a game-show host swinging his arm.', 'Groß und spritzig, ein Showmaster, der den Arm schwingt.']
  }),
  plan('atlas.story.tideFreed', 'atlas', 'shift', 2.2, {
    when: ['The Tide Master is freed', 'Der Gezeitenmeister ist befreit'],
    draft: ['Locks shut. The barges stay home.', 'Schleusen zu. Die Kähne bleiben daheim.'],
    direction: ['Pleased, a small smile.', 'Erfreut, ein kleines Lächeln.']
  }),
  plan('vex.hub.tide', 'vex', 'shift', 2.6, {
    when: ['The hub, after the Tide Master', 'Die Basis, nach dem Gezeitenmeister'],
    draft: ['The tide will turn! …Won\'t it?', 'Die Flut kommt wieder! …Oder?'],
    direction: ['Defiant, then a small doubtful pause before the question.', 'Trotzig, dann eine kleine zweifelnde Pause vor der Frage.']
  }),
  plan('atlas.sector.neon', 'atlas', 'shift', 2, {
    when: ['Beam-in: Blackout Boulevard', 'Ankunft: Blackout-Boulevard'],
    draft: ['Lights out. Except Vex\'s face.', 'Licht aus. Nur Vex\' Gesicht nicht.'],
    direction: ['Dry, almost a joke.', 'Trocken, fast ein Witz.']
  }),
  plan('vex.present.neon', 'vex', 'shift', 2.6, {
    when: ['Presents the Neon Master', 'Kündigt den Neonmeister an'],
    draft: ['Lights! Camera! {BOSS}!', 'Licht! Kamera! {BOSS}!'], params: { boss: 'boss.neonMaster' },
    direction: ['Pure showbiz: a director calling the shot, then the name in lights.', 'Reines Showbusiness: ein Regisseur ruft die Szene aus, dann der Name in Leuchtschrift.']
  }),
  plan('atlas.story.neonFreed', 'atlas', 'shift', 2.2, {
    when: ['The Neon Master is freed', 'Der Neonmeister ist befreit'],
    draft: ['Lights on. Vex lost its screens.', 'Licht an. Vex hat keine Bildschirme mehr.'],
    direction: ['Delighted, warm.', 'Begeistert, warm.']
  }),
  plan('vex.hub.neon', 'vex', 'shift', 2.2, {
    when: ['The hub, after the Neon Master', 'Die Basis, nach dem Neonmeister'],
    draft: ['Who turned the lights ON?!', 'Wer hat das Licht ANGEMACHT?!'],
    direction: ['Shrieking, squinting at the light. The glitch is added in post.', 'Kreischend, blinzelt ins Licht. Der Glitch kommt in der Nachbearbeitung.']
  }),
  plan('atlas.sector.rotor', 'atlas', 'shift', 2, {
    when: ['Beam-in: Rotor Run', 'Ankunft: Rotorflug'],
    draft: ['Drones. Its last supply line.', 'Drohnen. Seine letzte Versorgungslinie.'],
    direction: ['Focused: the end is in sight.', 'Konzentriert: das Ende ist in Sicht.']
  }),
  plan('vex.present.rotor', 'vex', 'shift', 2.8, {
    when: ['Presents the Rotor Master, the last of his reserve', 'Kündigt den Rotormeister an, den Letzten seiner Reserve'],
    draft: ['The grand finale! {BOSS}!', 'Das große Finale! {BOSS}!'], params: { boss: 'boss.rotorMaster' },
    direction: ['The last card: still the showman, the voice straining at the top.', 'Die letzte Karte: immer noch der Showman, die Stimme oben angespannt.']
  }),
  plan('atlas.story.rotorFreed', 'atlas', 'shift', 2.2, {
    when: ['The Rotor Master is freed: the tenth relay', 'Der Rotormeister ist befreit: das zehnte Relais'],
    draft: ['Every line\'s cut. Vex is alone.', 'Alle Linien gekappt. Vex ist allein.'],
    direction: ['Quiet triumph, with weight to it.', 'Leiser Triumph, mit Gewicht.']
  }),
  plan('vex.hub.rotor', 'vex', 'shift', 2.4, {
    when: ['The hub, after the Rotor Master: the Breach begins (just before vex.hub.breach)', 'Die Basis, nach dem Rotormeister: der Durchbruch beginnt (direkt vor vex.hub.breach)'],
    draft: ['Ten relays?! Nurse! NURSE!', 'Zehn Relais?! Schwester! SCHWESTER!'],
    direction: ['Panic: calling for a nurse who never comes. The tantrum builds into the Breach; the static tear is added in post.', 'Panik: ruft nach einer Schwester, die nie kommt. Der Wutanfall steigert sich in den Durchbruch; der Störeffekt kommt in der Nachbearbeitung.']
  }),
  plan('vex.hub.breach', 'vex', 'shift', 3, {
    when: ['The hub: his shield has fallen', 'Die Basis: sein Schild ist gefallen'],
    draft: ['No, no, NO! That shield was PATENTED!', 'Nein, nein, NEIN! Der Schild war PATENTIERT!'],
    direction: ['A full tantrum. The static tear is added in post.', 'Ein ausgewachsener Wutanfall. Der Störeffekt kommt in der Nachbearbeitung.']
  }),
  plan('vex.fortress.welcome', 'vex', 'act3', 3.2, {
    when: ['Entering the Fortress', 'Betreten der Festung'],
    draft: ['Welcome to my clinic! Take a seat… FOREVER!', 'Willkommen in meiner Klinik! Nimm Platz… für IMMER!'],
    direction: ['A villain host, relishing it.', 'Ein Schurken-Gastgeber, der es genießt.']
  }),
  plan('vex.mk1.intro', 'vex', 'act3', 2.8, {
    when: ['Mk-I intro', 'Mk-I-Auftritt'],
    draft: ['Behold! My new body! Mark ONE!', 'Seht her! Mein neuer Körper! Mark EINS!'], direction: ['The peak of vanity.', 'Der Gipfel der Eitelkeit.']
  }),
  plan('vex.mk1.obey', 'vex', 'act3', 2.4, {
    when: ['Mk-I fight: he calls the Masters', 'Mk-I-Kampf: er ruft die Meister'],
    draft: ['Masters! OBEY your doctor!', 'Meister! GEHORCHT eurem Doktor!'], direction: ['Commanding, strained.', 'Befehlend, angespannt.']
  }),
  plan('vex.mk1.listen', 'vex', 'act3', 2.2, {
    when: ['Mk-I phase 2: the Masters refuse', 'Mk-I Phase 2: die Meister verweigern sich'],
    draft: ['Why won\'t they LISTEN?!', 'Warum HÖREN sie nicht?!'], direction: ['Cracking; genuine confusion under the rage.', 'Brüchig; echte Verwirrung unter der Wut.']
  }),
  plan('vex.mk1.defeat', 'vex', 'act3', 2.6, {
    when: ['Mk-I defeated', 'Mk-I besiegt'],
    draft: ['I\'ll get… a second opinion…', 'Ich hole mir… eine zweite Meinung…'], direction: ['Small, fading, still smug under it.', 'Klein, verblassend, darunter immer noch selbstgefällig.']
  }),
  plan('vex.sting.doctorIn', 'vex', 'ending', 2.2, {
    when: ['New Game+ only: the sting after the credits', 'Nur New Game+: der Nachklapp nach dem Abspann'],
    draft: ['The doctor… is IN.', 'Der Doktor… ist DA.'], direction: ['Whispered, then a slow grin.', 'Geflüstert, dann ein langsames Grinsen.']
  }),
  ...([['short', 1.2], ['medium', 1.8], ['maniacal', 2.6]] as const).map(([k, max]) => plan(`vex.laugh.${k}`, 'vex', 'laughs', max, {
    when: ['A bubble that ends in a laugh', 'Eine Sprechblase, die mit einem Lachen endet'],
    draft: ['Mwa-ha-HA!', 'Mwa-ha-HA!'], neutral: true,
    direction: [`The ${k} laugh.`, `Das ${k === 'short' ? 'kurze' : k === 'medium' ? 'mittlere' : 'wahnsinnige'} Lachen.`]
  }))
]

// ── Flux (planned): barks, English everywhere ──
const BARKS: ReadonlyArray<readonly [type: string, max: number, takes: readonly string[], tail: string]> = [
  ['light', 0.4, ['Oof!', 'Ow!', 'Hey!'], 'a short tick'],
  ['heavy', 0.6, ['KLONK!', 'Arrgh!', 'Whoa-oa!'], 'a metal clang'],
  ['fire', 0.6, ['Yeowch!', 'Hot-hot-hot!', 'Yeowch!'], 'a sizzle'],
  ['ice', 0.6, ['Brrr-zzt!', 'Ch-chilly!', 'Brrr-zzt!'], 'a crystal tinkle'],
  ['volt', 0.5, ['Bzzzt!', 'Zzap!', 'Bzzzt!'], 'a static crackle'],
  ['wind', 0.7, ['Whoa-oa-oa!', 'Whoa-oa-oa!', 'Whoa-oa-oa!'], 'a whoosh'],
  ['trap', 0.5, ['Yikes!', 'Not cool!', 'Yikes!'], 'none'],
  ['crusher', 0.5, ['Squonk!', 'Squonk!', 'Squonk!'], 'a squeaky-toy squash'],
  ['pit', 1, ['Wha— aaaa!', 'Wha— aaaa!', 'Wha— aaaa!'], 'a Doppler fall'],
  ['lowHp', 0.6, ['Nnngh!', 'Nnngh!', 'Nnngh!'], 'a low servo whine'],
  ['down', 0.9, ['Uh-oh…', 'Uh-oh…', 'Uh-oh…'], 'a power-down sweep'],
  ['parry', 0.3, ['Ha!', 'Ha!', 'Ha!'], 'a bright ping'],
  ['gel', 0.7, ['Aaah~', 'Aaah~', 'Aaah~'], 'a rising refill shimmer']
]
const FLUX: VoiceLine[] = BARKS.flatMap(([type, max, takes, tail]) => takes.map((t, i) => plan(`flux.hurt.${type}.${i + 1}`, 'flux', 'barks', max, {
  when: [`Flux takes a hit: ${type} (the game picks one of 3 at random; synth tail in post: ${tail})`,
    `Flux wird getroffen: ${type} (das Spiel wählt zufällig einen von 3)`],
  draft: [t, t], neutral: true,
  direction: takes.indexOf(t) !== i
    ? ['Another take of the same word: vary the pitch and energy.', 'Eine weitere Aufnahme desselben Worts: Tonhöhe und Energie variieren.']
    : ['Comedy first: a cartoon robot getting bonked, never a real injury.', 'Komik zuerst: ein Cartoon-Roboter kriegt eins ab, nie eine echte Verletzung.']
})))

// ── Gauss (planned, optional) ──
const GAUSS: VoiceLine[] = [
  plan('gauss.ending.home', 'gauss', 'ending', 2.4, {
    when: ['Ending: back at the lab (optional line)', 'Ende: zurück im Labor (optionale Zeile)'],
    draft: ['Welcome home. Both of you.', 'Willkommen zu Hause. Ihr beide.'], direction: ['Warm, tired and proud.', 'Warm, müde und stolz.']
  })
]

/** Every line, speakers in cast order, scenes in playing order. */
export const VOICE_LINES: readonly VoiceLine[] = [
  ...ATLAS_LIVE, ...ATLAS_PLAN,
  ...ATLAS_HINT_BLAZE, ...ATLAS_HINT_CRYO, ...ATLAS_HINT_VOLT, ...ATLAS_HINT_GALE, ...ATLAS_SECRET,
  ...VEX, ...FLUX, ...GAUSS
]

/** A key's file name, without the extension: `atlas.bossAhead` → `atlas_bossAhead`. */
export const fileName = (key: string): string => key.replace(/\./g, '_')

/** Where a line's finished file goes, and where its raw takes go. */
export const voicePath = (l: VoiceLine, lang: Lang): string =>
  `public/audio/voice/${l.neutral ? 'en' : lang}/${fileName(l.key)}.ogg`
export const rawPath = (l: VoiceLine, lang: Lang, take = 1): string =>
  `vo-src/raw/${l.neutral ? 'en' : lang}/${l.speaker}/${fileName(l.key)}_${take}.ogg`
