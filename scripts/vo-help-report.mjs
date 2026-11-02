// The voice-choice report for the cage's cries (#187): ElevenLabs candidates and Chatterbox takes side by side,
// one page, `reports/vo-help/index.html`. Run after `tools/voice/help-samples.mjs` and the Chatterbox run.
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { VOICES } from '../tools/voice/help-samples.mjs'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const out = join(ROOT, 'reports', 'vo-help')
const LINES = [
  ['dlg.bark.hero.cage.1', 'Hero: the thought after the first chest', 'hero'],
  ['dlg.bark.trainerPyro.help.1', 'Pyromancer, in the cage', 'trainerPyro'],
  ['dlg.bark.sbMasterSoulwarden.help.1', 'Soul Warden, in the cage', 'sbMasterSoulwarden'],
  ['dlg.bark.sbMasterIronmonk.help.1', 'Iron Fist monk, in the cage', 'sbMasterIronmonk']
]
const TEXT = {
  en: ['Is there somebody screaming for help?', 'Help! Anybody!', 'We were kidnapped!', 'Monsters! Help!'],
  de: ['Schreit da jemand um Hilfe?', 'Hilfe, ist da jemand?', 'Wir wurden entführt!', 'Monster! Hilfe!']
}
// Chatterbox takes: copied out of the shipped folder (they are the speakers' own voices, cloned from their reference clips).
mkdirSync(join(out, 'cb', 'en'), { recursive: true })
for (const [k] of LINES) {
  const src = join(ROOT, 'public', 'audio', 'voice', 'en', `${k}.ogg`)
  if (false && existsSync(src)) copyFileSync(src, join(out, 'cb', 'en', `${k}.ogg`))
}
const cb = (k) => (existsSync(join(out, 'cb', 'en', `${k}.ogg`)) ? `<audio controls preload="none" src="cb/en/${k}.ogg"></audio>` : '<span class="na">not generated</span>')

const pyroNote = ''
const rows = (lang) => LINES.map(([k, title], i) => {
  const cells = VOICES.map(([name]) => `<td><audio controls preload="none" src="el/${name}/${lang}/${k}.mp3"></audio></td>`).join('')
  return `<tr><th>${title}<small>${TEXT[lang][i]}</small></th>${cells}</tr>`
}).join('')
const head = VOICES.map(([n, , d]) => `<th>${n}<small>${d}</small></th>`).join('')
const FEMALE = ['Sarah', 'Laura', 'Jessica', 'Alice', 'Matilda', 'Lily', 'Rachel']
const femaleRows = ['en', 'de'].map(lang => {
  const k = 'dlg.bark.sbMasterSoulwarden.help.1'
  const cells = VOICES.filter(([n]) => FEMALE.includes(n)).map(([n, , d]) => `<tr><th>${n}<small>${d}</small></th><td><audio controls preload="none" src="el/${n}/${lang}/${k}.mp3"></audio></td></tr>`).join('')
  return `<h3>${lang === 'en' ? 'English: "We were kidnapped!"' : 'Deutsch: "Wir wurden entführt!"'}</h3><table>${cells}</table>`
}).join('')
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cage cries: voice samples</title>
<style>
:root{color-scheme:light dark;--bg:#fff;--fg:#1b1a22;--mut:#6a6878;--line:#d9d6e3;--acc:#5b3fd0}
@media(prefers-color-scheme:dark){:root{--bg:#15141b;--fg:#ecebf3;--mut:#9a98aa;--line:#34323f;--acc:#a99bff}}
body{background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif;margin:0;padding:1rem 16px 3rem;max-width:1400px;margin-inline:auto}
h1{font-size:1.5rem}h2{margin-top:2.2rem;font-size:1.15rem;border-bottom:2px solid var(--acc);padding-bottom:.3rem}
p{color:var(--mut)}table{border-collapse:collapse;width:100%}th,td{border:1px solid var(--line);padding:.4rem .5rem;vertical-align:top;text-align:left}
th small{display:block;font-weight:400;color:var(--mut);font-size:.8rem}.wrap{overflow-x:auto}audio{width:200px;height:36px}.na{color:var(--mut)}
</style>
<h1>The cage's cries: voices to choose from</h1>
<p>Four lines (#187), each in the voice of the one who says them. Listen across a row to compare voices for one line, and decide a voice per speaker. Picked so far and in the game now: pyromancer Brian (en) / Liam (de), monk Bill (en) / Liam (de). Still open: the Soul Warden (female voices first, below), and the hero (Liam, Laura for the girl).</p>
<h2>The Soul Warden as a woman: female voices (new)</h2>${femaleRows}
<h2>ElevenLabs, English (premade voices, eleven_multilingual_v2)</h2><div class="wrap"><table><tr><th></th>${head}</tr>${rows('en')}</table></div>
<h2>ElevenLabs, German (the same voices, multilingual)</h2><div class="wrap"><table><tr><th></th>${head}</tr>${rows('de')}</table></div>
<h2>Chatterbox, English (the game's own character voices: each speaker's reference clip, cloned)</h2>
<p>Chatterbox has no voice list: each speaker already has a voice in the game (the hero, the pyromancer trainer, the Soul Warden master and the Iron Fist master). These are those voices saying the new lines. It is what the other voiced languages (fr, es, ru, ja, pt, zh) will use.</p>
<div class="wrap"><table><tr><th>Line</th><th>Chatterbox</th></tr>${LINES.map(([k, t], i) => `<tr><th>${t}<small>${TEXT.en[i]}</small></th><td>${cb(k)}</td></tr>`).join('')}</table></div>
</html>`
writeFileSync(join(out, 'index.html'), html)
console.log('wrote reports/vo-help/index.html')
