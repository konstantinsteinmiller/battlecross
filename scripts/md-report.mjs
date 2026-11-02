#!/usr/bin/env node
/**
 * Render a report's Markdown to a standalone HTML page next to it (no dependencies), with the funnel
 * screenshots as a gallery when the report is the tutorial funnel's.
 *   node scripts/md-report.mjs reports/tutorial-funnel-report.md
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'

const src = resolve(process.argv[2] ?? 'reports/tutorial-funnel-report.md')
const md = readFileSync(src, 'utf8').replace(/\r/g, '')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

const lines = md.split('\n')
let out = ''
let i = 0
while (i < lines.length) {
  const l = lines[i]
  if (!l.trim()) { i++; continue }
  const h = /^(#{1,3}) (.*)$/.exec(l)
  if (h) { out += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>\n`; i++; continue }
  if (l.startsWith('|')) {
    const rows = []
    while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i]); i++ }
    const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
    const head = cells(rows[0])
    const body = rows.slice(2).map(cells)
    out += '<div class="tw"><table>' + (head.some(Boolean) ? `<thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead>` : '') +
      `<tbody>${body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>\n`
    continue
  }
  if (/^\* /.test(l)) {
    let items = ''
    while (i < lines.length && (/^\* /.test(lines[i]) || /^  \S/.test(lines[i]))) {
      if (/^\* /.test(lines[i])) items += `<li>${inline(lines[i].slice(2))}`
      else items += ' ' + inline(lines[i].trim())
      i++
      if (!(i < lines.length && /^  \S/.test(lines[i]))) items += '</li>'
    }
    out += `<ul>${items}</ul>\n`
    continue
  }
  let p = l
  i++
  while (i < lines.length && lines[i].trim() && !/^(#|\||\* )/.test(lines[i])) { p += ' ' + lines[i].trim(); i++ }
  out += `<p>${inline(p)}</p>\n`
}

const dir = dirname(src)
const shots = []
for (const [dev, label] of [['desktop', 'Desktop'], ['phone', 'Phone portrait'], ['landscape', 'Phone landscape']]) {
  const j = resolve(dir, `tf-${dev}`, 'funnel.json')
  if (!existsSync(j)) continue
  const steps = JSON.parse(readFileSync(j, 'utf8')).runs[0].steps.filter(s => s.shot)
  shots.push(`<h2>Screenshots: ${label}</h2><div class="g">${steps.map(s => `<figure><img loading="lazy" src="tf-${dev}/${s.shot}" alt=""><figcaption><b>${s.step}. ${esc(s.key)}</b>${s.goal ? '<br>goal: ' + esc(s.goal) : ''}${s.note ? '<br>' + esc(s.note) : ''}</figcaption></figure>`).join('')}</div>`)
}

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tutorial funnel report</title><style>
:root{--bg:#fbf7ee;--fg:#2a2118;--mut:#6b5d4a;--line:#e0d3b8;--acc:#9a5b12;--code:#efe5cf}
@media (prefers-color-scheme:dark){:root{--bg:#1c1812;--fg:#efe6d4;--mut:#b3a58c;--line:#3a3226;--acc:#f2b24a;--code:#2a241b}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif}
main{max-width:980px;margin:0 auto;padding:24px 16px 64px}
h1{font-size:1.7rem;line-height:1.25}h2{margin-top:2rem;border-bottom:1px solid var(--line);padding-bottom:.3rem}
a{color:var(--acc)}code{background:var(--code);padding:.1em .35em;border-radius:4px;font-size:.9em}
.tw{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.92rem}th,td{border:1px solid var(--line);padding:.4rem .6rem;text-align:left;vertical-align:top}th{background:var(--code)}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}figure{margin:0}img{width:100%;border:1px solid var(--line);border-radius:8px;background:#000}figcaption{font-size:.8rem;color:var(--mut);padding-top:4px}
</style></head><body><main>${out}${shots.join('\n')}</main></body></html>`
const dest = src.replace(/\.md$/, '.html')
writeFileSync(dest, html)
console.log('written', basename(dest))
