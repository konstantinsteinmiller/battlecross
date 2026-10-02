// The Battlecross lockup, generated: `node store-art/brand/logo-final.mjs`.
//
// Writes store-art/brand/logo-lockup.svg (the emblem over the two-line
// wordmark) and store-art/brand/emblem.svg (the emblem alone, the app icon),
// then pastes the lockup into the two places that draw the boot splash —
// index.html and src/components/atoms/FLogoProgress.vue — so the two can
// never drift (tests/ui/splashLogo.test.ts holds them byte-identical).
//
// Everything is paths: no <text>, no ids, no external reference. The letters
// are a chunky rounded stroke face drawn on a 4 × 6 grid, so the logo cannot
// reflow before the bundled font loads and costs under 5 KB on the critical
// path.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')

const INK = '#141a33'
const GOLD = '#ffd24a'
const AMBER = '#ffa733'
const STEEL = '#e6ebf5'
const BLUE = '#3f7fd6'

// ── The stroke face (absolute commands on a 4 × 6 grid) ──────────────────────
const FACE = {
  B: 'M0 0V6 M0 0H2.4Q4 0 4 1.5Q4 3 2.4 3H0 M2.4 3Q4 3 4 4.5Q4 6 2.4 6H0',
  A: 'M0 6L2 0L4 6 M0.9 4H3.1',
  T: 'M0 0H4 M2 0V6',
  L: 'M0 0V6H4',
  E: 'M4 0H0V6H4 M0 3H3',
  C: 'M4 1.2Q4 0 2.6 0H1.5Q0 0 0 1.5V4.5Q0 6 1.5 6H2.6Q4 6 4 4.8',
  R: 'M0 6V0H2.4Q4 0 4 1.5Q4 3 2.4 3H0 M2.2 3L4 6',
  O: 'M1.5 0H2.5Q4 0 4 1.5V4.5Q4 6 2.5 6H1.5Q0 6 0 4.5V1.5Q0 0 1.5 0Z',
  S: 'M4 1.2Q4 0 2.6 0H1.5Q0 0 0 1.5Q0 3 1.5 3H2.5Q4 3 4 4.5Q4 6 2.5 6H1.4Q0 6 0 4.8'
}

const n = (v) => String(Math.round(v * 10) / 10)

/** One letter's path, scaled by `u` and moved to (ox, oy). */
const place = (d, u, ox, oy) => d.replace(/([MLHVQZ])([^MLHVQZ]*)/g, (_, c, args) => {
  const v = args.trim().split(/[\s,]+/).filter(Boolean).map(Number)
  if (c === 'Z') return 'Z'
  if (c === 'H') return `H${n(ox + v[0] * u)}`
  if (c === 'V') return `V${n(oy + v[0] * u)}`
  const out = []
  for (let i = 0; i < v.length; i += 2) out.push(`${n(ox + v[i] * u)} ${n(oy + v[i + 1] * u)}`)
  return c + out.join(' ')
})

/** A word as one path, centred on x = 150. */
const word = (text, u, y, gap = 1.7) => {
  const w = text.length * 4 * u + (text.length - 1) * gap * u
  let x = 150 - w / 2
  let d = ''
  for (const ch of text) {
    d += place(FACE[ch], u, x, y)
    x += (4 + gap) * u
  }
  return d
}

// ── The emblem: two swords crossed behind a shield ───────────────────────────
const sword = (deg) =>
  `<g transform="rotate(${deg} 150 80)">` +
  `<path d="M150 -20l9 13v82h-18V-7z" fill="${STEEL}" stroke="${INK}" stroke-width="6"/>` +
  `<path d="M150 -6v76" stroke="#aeb9cf" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M128 75h44v10h-44z" fill="${GOLD}" stroke="${INK}" stroke-width="6"/>` +
  `<path d="M144 86h12v36h-12z" fill="#a8733f" stroke="${INK}" stroke-width="6"/>` +
  `<circle cx="150" cy="128" r="7" fill="${GOLD}" stroke="${INK}" stroke-width="6"/></g>`

const emblem =
  sword(-42) + sword(42) +
  `<path d="M150 24l40 13v32c0 27-16 45-40 56c-24-11-40-29-40-56V37z" fill="${BLUE}" stroke="${INK}" stroke-width="8"/>` +
  `<path d="M150 34l31 10v25c0 21-12 36-31 45z" fill="#2f63b8"/>` +
  `<path d="M150 34l31 10v25c0 21-12 36-31 45c-19-9-31-24-31-45V44z" fill="none" stroke="${GOLD}" stroke-width="3.4"/>` +
  `<path d="M150 48l6.500 15 15 6.500-15 6.500-6.500 15-6.500-15-15-6.500 15-6.500z" fill="#fff" stroke="${INK}" stroke-width="4"/>`.replace(/(\d)\.(\d)00/g, '$1.$2')

// ── The wordmark: BATTLE in white, CROSS in gold, leaning like the bar ───────
const line = (d, color, dy) =>
  `<path d="${d}" transform="matrix(1 0 -.213 1 ${n(40 + dy * 0.213)} ${dy})" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>` +
  `<path d="${d}" transform="matrix(1 0 -.213 1 ${n(40 + dy * 0.213)} ${dy - 4})" fill="none" stroke="${color}" stroke-width="8.600" stroke-linecap="round"/>`.replace('8.600', '8.6')

const battle = word('BATTLE', 7.6, 146)
const cross = word('CROSS', 7.6, 206)

const svg = (viewBox, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" aria-hidden="true" focusable="false"><g stroke-linejoin="round">${inner}</g></svg>`

const lockup = svg('0 0 300 262', emblem + line(battle, '#ffffff', 0) + line(cross, AMBER, 0))
// The app icon: ONE file for every size. Below 41 CSS px (a browser tab) a
// media query, evaluated against the image's own size, swaps the emblem (.d)
// for the shield alone, drawn bold (.s). The tile is .bg, so
// scripts/render-icons.mjs can square it off for the full-bleed renders.
const shieldOnly = emblem.slice(emblem.indexOf('<path d="M150 24'))
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="b" cx="50%" cy="42%" r="64%"><stop offset="0" stop-color="#24397a"/><stop offset=".56" stop-color="#122150"/><stop offset="1" stop-color="#0a1224"/></radialGradient>
    <radialGradient id="g" cx="50%" cy="44%" r="46%"><stop offset="0" stop-color="#ffa733" stop-opacity=".32"/><stop offset="1" stop-color="#ffa733" stop-opacity="0"/></radialGradient>
  </defs>
  <style>.s{display:none}@media (max-width:40px){.d{display:none}.s{display:inline}}</style>
  <g class="bg">
    <rect width="512" height="512" rx="112" fill="url(#b)"/>
    <rect width="512" height="512" rx="112" fill="url(#g)"/>
  </g>
  <g class="d" stroke-linejoin="round"><g transform="translate(256 262) scale(2.85) translate(-150 -74)">${emblem}</g></g>
  <g class="s" stroke-linejoin="round"><g transform="translate(256 256) scale(4.5) translate(-150 -75)">${shieldOnly}</g></g>
</svg>
`

if (lockup.length >= 5000) throw new Error(`the lockup is ${lockup.length} bytes; the splash budget is 5000`)

writeFileSync(resolve(here, 'logo-lockup.svg'), lockup)
writeFileSync(resolve(here, 'emblem.svg'), icon)
writeFileSync(resolve(root, 'public/icons/icon.svg'), icon)

// Paste into the two splash copies.
const paste = (rel, re) => {
  const p = resolve(root, rel)
  const src = readFileSync(p, 'utf8')
  if (!re.test(src)) throw new Error(`${rel}: the lockup's place was not found`)
  writeFileSync(p, src.replace(re, (_, a, _old, b) => a + lockup + b))
}
paste('index.html', /(<div class="s-logo"[^>]*>)(<svg[\s\S]*?<\/svg>)(<\/div>)/)
paste('src/components/atoms/FLogoProgress.vue', /(h1\.logo\(.*\)\n\s*)(<svg[\s\S]*?<\/svg>)(\n)/)
console.log(`lockup ${lockup.length} bytes → logo-lockup.svg, index.html, FLogoProgress.vue; icon → public/icons/icon.svg`)
