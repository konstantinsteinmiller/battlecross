// `pnpm voice:collect` — every line of data/voice-manifest.json as a TTS job:
// its text (normalised for speech), who says it with that voice's card, the
// stage direction and tone from its emotion, the situation, the longest it
// should run, the text's hash, and the file the game will read.
//
//   pnpm voice:collect              every line in the manifest
//   pnpm voice:collect --samples    a handful of lines, for comparing engines
//   --lang en                       one language only (default: every language in lib.mjs)
//
// Writes vo-src/jobs/<live|samples>.json (what `voice:gen` reads) and a
// readable .md beside it. Run `pnpm voice:manifest` first when lines changed.

import { mkdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { CARDS, LANGS, ROOT, SAMPLE_KEYS, VOICE_LINES, VO_SRC, VOICE_OUT, args, fileName, hashFor, maxFor, textOf } from './lib.mjs'
import { isCoreId } from './core.mjs'
import { normalize } from './normalize.mjs'

/**
 * Respellings for a word the model keeps getting wrong in one line (by job
 * id, `en/<id>`): the model reads `say`, QA still checks the take against the
 * real text. Add from real failures only.
 */
const SAY = {
  // The model said "Lately, mostly swords" twice; short phrases keep it to one.
  'en/dlg.sunfordSmith.who.2': 'Horseshoes. Ploughs. The odd sword. Lately... mostly swords.',
  // The model dropped the last sentence; a pause before it keeps it in.
  'en/dlg.goblinTrader.town.1': 'People still stare. But the baker gives me pie... I like the pie.',
  // French: the model slid into English around the names and the short words; pauses and
  // French spellings of the names keep it French.
  'fr/dlg.quest.dragon.ask.1': 'Assez... Tu as des crocs... petite créature.',
  'fr/dlg.quest.throne.circle.say': 'Que le Cercle de l’Éther... l’aie.',
  'fr/dlg.quest.throne.circle.say__f': 'Que le Cercle de l’Éther... l’aie.',
  'fr/dlg.bark.goblinKing.charge.1': 'Écrase-les... Tusker !',
  'fr/dlg.elderMara.quest.say__f': 'Qu’est-ce qui inquiète... Seunforde ?',
  'fr/dlg.quest.goblinKing.slay.say__f': 'Pas de marché... Tes raids s’arrêtent ici.',
  'fr/dlg.quest.goblinKing.slay.2__f': 'Seunforde dort plus tranquille... et l’Ordre de Fer... entend ton nom.',
  'fr/dlg.quest.goblinKing.pact.say__f': 'Arrête les raids... et commerce plutôt avec Seunforde. Jure-le.',
  'fr/dlg.quest.throne.claim.2__f': 'Trois factions... découvrent qu’elles ont... un ennemi commun.',
  // Russian: the names were mangled ("Естрел", "Баукхевен"); stress-friendly spellings and pauses.
  'ru/dlg.elderMara.quest.4': 'Норы сразу за равни́нами. Пожалуйста, будь осторо́жен.',
  'ru/dlg.bark.freedFarmers.freed.1': 'Спасены! Мы Толлеры, фермеры. Найди нас в Оукхэйвене. Дома беда.',
  'ru/dlg.bark.windDisciple.freed.1': 'Наконец-то свободен! Кестрел Вэйн, с пути Ветробега. Найди меня в Оукхэйвене, и я тебя научу.',
  // Chinese: 教教 came out 叫叫, and the faction names ran into the verb; a particle and a pause.
  'zh/dlg.hero.train': '教教我吧。',
  'zh/dlg.quest.throne.order.say': '铁之骑士团，来守着它。',
  'zh/dlg.quest.throne.order.say__f': '铁之骑士团，来守着它。',
  'zh/dlg.quest.throne.syndicate.say': '灰烬商会，应得此位。',
  'zh/dlg.quest.throne.syndicate.say__f': '灰烬商会，应得此位。',
  // Japanese: 竜 was read リュート and 研究と呼ぶ ran together; the reading in kana and pauses.
  'ja/dlg.mayorBrenna.hello.2': '町長の、ブレナ・クイルよ。なくした物、壊れた物、遅れた物は、ぜんぶ、私の机に来るの。',
  'ja/dlg.quest.dragon.slay.say': 'りゅうとは、取引しない。',
  'ja/dlg.quest.dragon.slay.say__f': 'りゅうとは、取引しない。',
  'ja/dlg.quest.throne.circle.2': '彼らは、研究と、呼ぶ。ほかの者は、息をひそめる。',
  'ja/dlg.quest.throne.circle.2__f': '彼らは、研究と、呼ぶ。ほかの者は、息をひそめる。',
  // 炎 and 鋼 in kana, so the model reads them right (#130).
  'ja/dlg.intro.fire.1': 'ほのおは、呼び声に応え、はがねは、新たな名を知った。'
}

/** Lines that are a sound more than words (a gasp, a laugh): QA only fails added speech. */
// The intro's fire line in Japanese (#130): Whisper writes 炎 and 鋼 back in kana
// (ほのお, はがね), so a correct take scored 83 % off; the other languages are shipped.
const LOOSE = new Set(['dlg.intro.fire.1'])

const a = args()
const mode = a.samples ? 'samples' : 'live'
const langs = a.lang ? [a.lang] : LANGS
if (langs.some(l => !LANGS.includes(l))) throw new Error(`--lang must be one of ${LANGS.join(', ')}`)

const pick = mode === 'samples'
  ? SAMPLE_KEYS.map(k => VOICE_LINES.find(l => l.key === k) ?? (() => { throw new Error(`sample ${k} is not in data/voice-manifest.json`) })())
  : VOICE_LINES

const missingCards = [...new Set(pick.map(l => l.speaker))].filter(s => !CARDS[s])
if (missingCards.length) throw new Error(`no voice card for ${missingCards.join(', ')}: add one to src/game/audio/voiceCards.ts`)

const jobs = []
for (const line of pick) {
  for (const lang of langs) {
    // Only English is voiced in full; the other languages get just the core lines (data/voice-core.json).
    if (lang !== 'en' && !isCoreId(fileName(line.key))) continue
    const shown = textOf(line, lang)
    if (!shown) continue
    const { text, emphasis } = normalize(shown, lang)
    const file = fileName(line.key)
    jobs.push({
      id: `${lang}/${file}`,
      key: line.key,
      file,
      lang,
      speaker: line.speaker,
      role: line.role,
      who: line.who,
      scene: line.scene,
      status: line.status,
      tone: line.tone,
      max: maxFor(line, lang, shown),
      hash: hashFor(line, lang, shown),
      shown,
      text,
      ...(SAY[`${lang}/${file}`] ? { say: SAY[`${lang}/${file}`] } : {}),
      ...(LOOSE.has(line.key) ? { loose: true } : {}),
      emphasis,
      direction: line.direction[LANGS.indexOf(lang)] ?? line.direction[0],
      directionEn: line.direction[0],
      situation: line.when[LANGS.indexOf(lang)] ?? line.when[0],
      out: relative(ROOT, join(VOICE_OUT, lang, `${file}.ogg`)).replaceAll('\\', '/')
    })
  }
}

const speakers = [...new Set(jobs.map(j => j.speaker))]
const doc = {
  mode,
  langs,
  cards: Object.fromEntries(speakers.map(s => [s, CARDS[s]])),
  jobs
}
const dir = join(VO_SRC, 'jobs')
mkdirSync(dir, { recursive: true })
writeFileSync(join(dir, `${mode}.json`), `${JSON.stringify(doc, null, 2)}\n`)

const cell = (s) => String(s).replaceAll('|', '\\|')
const md = [`# Voice jobs: ${mode}`, '', `Generated by \`pnpm voice:collect${mode === 'live' ? '' : ` --${mode}`}\`. ${jobs.length} jobs.`, '',
  '| Id | Voice | Tone | Max s | Text for the model | Direction | Situation |', '| --- | --- | --- | --- | --- | --- | --- |',
  ...jobs.map(j => `| ${j.id} | ${j.speaker} | ${j.tone} | ${j.max} | ${cell(j.text)} | ${cell(j.direction)} | ${cell(j.situation)} |`)]
writeFileSync(join(dir, `${mode}.md`), `${md.join('\n')}\n`)

const per = langs.map(l => `${l} ${jobs.filter(j => j.lang === l).length}`).join(', ')
console.log(`vo-src/jobs/${mode}.json: ${jobs.length} jobs (${per}), ${speakers.length} voices`)
