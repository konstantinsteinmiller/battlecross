// Text a TTS model reads the way a person would: numbers as words, capitals
// that mean "say it LOUD" turned back into words (a model reads "ME" or "ON"
// as letters), and one kind of ellipsis. German needs this more than the
// choice of model: a model that sees "13" may say it in English.
//
// The capitalised words are returned as `emphasis`, so an engine that takes a
// written direction can be told to stress them.

const EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const DE_ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn',
  'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn']
const DE_TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']

// The other voiced languages: 0–99 (what the lines use), joined the usual way.
const FR_ONES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
const FR_TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante']
const ES_ONES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
const ES_TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const PT_ONES = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
const PT_TENS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
const RU_ONES = ['ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
const RU_TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
const CJK_DIGITS = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']

/** 0–99 for fr/es/pt/ru. */
const smallWords = (n, lang) => {
  if (lang === 'fr') {
    if (n < 20) return FR_ONES[n]
    if (n >= 70 && n < 80) return `soixante-${n === 71 ? 'et-' : ''}${FR_ONES[n - 60]}`
    if (n === 80) return 'quatre-vingts'
    if (n > 80) return `quatre-vingt-${FR_ONES[n - 80]}`
    const o = n % 10
    const t = FR_TENS[Math.floor(n / 10)]
    return o ? `${t}${o === 1 ? '-et-' : '-'}${FR_ONES[o]}` : t
  }
  if (lang === 'es') {
    if (n < 30) return ES_ONES[n]
    return n % 10 ? `${ES_TENS[Math.floor(n / 10)]} y ${ES_ONES[n % 10]}` : ES_TENS[Math.floor(n / 10)]
  }
  const ones = lang === 'pt' ? PT_ONES : RU_ONES
  const tens = lang === 'pt' ? PT_TENS : RU_TENS
  if (n < 20) return ones[n]
  return n % 10 ? `${tens[Math.floor(n / 10)]}${lang === 'pt' ? ' e ' : ' '}${ones[n % 10]}` : tens[Math.floor(n / 10)]
}

/** 0–999 in kanji numerals (Chinese and Japanese read them the same way). */
const cjkWords = (n) => {
  if (n < 10) return CJK_DIGITS[n]
  if (n < 100) return `${n >= 20 ? CJK_DIGITS[Math.floor(n / 10)] : ''}十${n % 10 ? CJK_DIGITS[n % 10] : ''}`
  return `${CJK_DIGITS[Math.floor(n / 100)]}百${n % 100 ? (n % 100 < 10 ? '〇' : '') + cjkWords(n % 100) : ''}`
}

/** 0–999 as words; anything larger stays digits (no line needs it). */
export const numberWords = (n, lang) => {
  if (!Number.isInteger(n) || n < 0 || n > 999) return String(n)
  if (lang === 'zh' || lang === 'ja') return cjkWords(n)
  if (['fr', 'es', 'pt', 'ru'].includes(lang)) return n < 100 ? smallWords(n, lang) : String(n)
  if (lang === 'de') {
    if (n < 20) return DE_ONES[n]
    if (n < 100) {
      const o = n % 10
      const t = DE_TENS[Math.floor(n / 10)]
      return o ? `${o === 1 ? 'ein' : DE_ONES[o]}und${t}` : t
    }
    const h = Math.floor(n / 100)
    const r = n % 100
    return `${h === 1 ? 'ein' : DE_ONES[h]}hundert${r ? numberWords(r, lang) : ''}`
  }
  if (n < 20) return EN_ONES[n]
  if (n < 100) {
    const o = n % 10
    return EN_TENS[Math.floor(n / 10)] + (o ? `-${EN_ONES[o]}` : '')
  }
  const r = n % 100
  return `${EN_ONES[Math.floor(n / 100)]} hundred${r ? ` and ${numberWords(r, lang)}` : ''}`
}

const PERCENT = { en: 'percent', de: 'Prozent', fr: 'pour cent', es: 'por ciento', pt: 'por cento', ru: 'процентов', ja: 'パーセント' }
/**
 * ADAPT: written forms a model spells out or misreads, said as words in each
 * language ("Dr. Vex Mk-I" came out "Mark 1" and failed QA until it was sent
 * as "Mark One"). The read-back is judged against the respelled text.
 */
const RESPELL = {
  // 'Mk-I': { en: 'Mark One' }  (none needed yet in Battlecross)
  Nimblefingers: { en: 'Nimble Fingers' }
}
const escape = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const respell = (t, lang) => Object.entries(RESPELL).reduce((s, [w, by]) =>
  s.replace(new RegExp(`\\b${escape(w)}\\b`, 'g'), by[lang] ?? by.en), t)

/** A word in capitals (two letters or more, any script with case), maybe hyphenated: "SICK", "Im-POSSIBLE". */
const CAPS = /\p{Lu}{2,}(?:-\p{Lu}{2,})*/gu

/** "SCHROTTBRECHER" → "Schrottbrecher": a capital first letter keeps names
 *  ("Blaze Master") and German nouns right, and costs nothing in speech. */
const unshout = (w) => w[0] + w.slice(1).toLowerCase()

/** The text as the model should read it, and the words it should stress. */
export const normalize = (text, lang) => {
  const emphasis = []
  let t = respell(text, lang)
    .replace(/…|\.{3}/g, '...')
    .replace(/(\d+)\s*%/g, (_, n) => (lang === 'zh' ? `百分之${numberWords(+n, lang)}` : `${numberWords(+n, lang)} ${PERCENT[lang]}`))
    .replace(/\d+/g, (n) => numberWords(+n, lang))
  t = t.replace(CAPS, (w, offset) => {
    emphasis.push(w.toLowerCase())
    // The tail of a word ("Im-POSSIBLE", "Un-MÖGLICH") stays lower case.
    if (t[offset - 1] === '-') return w.toLowerCase()
    return w.split('-').map(unshout).join('-')
  })
  return { text: t.replace(/\s+/g, ' ').trim(), emphasis }
}
