// DOM side of the Samsung dark-mode counter: registers the paint worklet, plans every element and
// pseudo-element of the UI with `planBox`, writes the result (inline style with !important, or a rule in
// one private stylesheet for ::before/::after) and keeps it current while the app re-renders.
//
// Cost control:
//  - one global stylesheet restores every <img> (`:where(img)`), so images cost no JS;
//  - work is queued and drained under a time budget: first in the observer callback for new nodes (so a screen that
//    just opened is mostly fixed before its first paint), the rest per animation frame; the batch size follows the
//    measured cost per element;
//  - a `style` mutation is only re-planned when a colour-relevant property changed (the HUD rewrites widths
//    every frame and must not pay for it);
//  - drop-shadow filters (a render surface each) are capped at MAX_SHADOW_FILTERS live elements.
//
// The module never turns itself on: `useSamsungFix` decides (Samsung UA + the player's choice).
import { planBox, SAMSUNG_30, type Computed, type Model, type Plan, type PlanEnv } from './plan'

const WORKLET_FILE = 'fdc-paint.js'
/** Work per slice of a long pass, and in the MutationObserver callback that sees new nodes before they are first painted. */
const FRAME_BUDGET_MS = 8
const SYNC_BUDGET_MS = 24
/** Pause between two slices of a long pass, so input and rendering get the main thread in between. */
const SLICE_GAP_MS = 8
const MIN_BATCH = 4
const MAX_BATCH = 64
const MAX_SHADOW_FILTERS = 160
const MAX_SUBTREE = 64
const SKIP = new Set(['CANVAS', 'SCRIPT', 'STYLE', 'LINK', 'META', 'VIDEO', 'IFRAME', 'HEAD', 'TITLE', 'NOSCRIPT', 'TEMPLATE', 'SVG'])
const SIDES = ['Top', 'Right', 'Bottom', 'Left'] as const
const CORNERS = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'] as const
const RELEVANT_STYLE = /^(background|color|border|box-shadow|text-shadow|filter|-webkit-background-clip|--[\w-]*(col|tint|bg|fill|accent|tone|glow|shade))/i
const RELEVANT_TRANSITION = /color|background|border|shadow|filter/

type PaintWorklet = { addModule(url: string): Promise<void> }

interface State {
  saved: Map<string, string>
  written: Map<string, string>
  attrs: string[]
  textColor: Plan['textColor']
  shadowSig: string | null
  filtered: boolean
  rules: CSSStyleRule[]
}

const states = new WeakMap<HTMLElement, State>()
/** Elements rewritten in the last two frames: their transitions are switched off meanwhile, or the rewrite itself
 *  (colour to transparent, bg to a paint layer) would fade in over the authored transition time. */
const settling = new Set<HTMLElement>()
let settleRaf = 0
const active = new Set<HTMLElement>()
const pending = new Set<HTMLElement>()
const model: Model = SAMSUNG_30
const DEFAULT_GAIN = { ...SAMSUNG_30.gain }

let running = false
let startToken = 0
let paintOk = false
let workletPromise: Promise<boolean> | null = null
let observer: MutationObserver | null = null
let styleEl: HTMLStyleElement | null = null
let ruleSheet: HTMLStyleElement | null = null
let timer = 0
let filteredCount = 0
let idCounter = 0
let pseudoSelector = ''
let pseudoSheets = -1
const stats = { planned: 0, ms: 0, frames: 0, worstMs: 0, revertMs: 0, planMs: 0, commitMs: 0 }
/** Why elements were queued (diagnostics for the cost report). */
const why = { style: 0, cls: 0, added: 0, pointer: 0, settle: 0 }

/** Register the paint worklet from the game's own origin (a blob: module would need a CSP change). */
export function registerWorklet(base: string = typeof document !== 'undefined' ? document.baseURI : ''): Promise<boolean> {
  if (workletPromise) return workletPromise
  const pw = typeof CSS !== 'undefined' ? (CSS as unknown as { paintWorklet?: PaintWorklet }).paintWorklet : undefined
  if (!pw) return (workletPromise = Promise.resolve(false))
  workletPromise = pw.addModule(new URL(WORKLET_FILE, base).href).then(() => true, () => false)
  return workletPromise
}

// ---- custom properties ----

/** Read only by the element's own paint (never by a pseudo-element): register them non-inherited, or every write
 *  re-styles the element's whole subtree (custom properties inherit by default). */
const OWN_PROPS = [...Array.from({ length: 6 }, (_, i) => `--bc-p${i}`), '--bc-bw', '--bc-bc', '--bc-rad', '--bc-rings', '--bc-ins', '--bc-insx']

function registerProperties(): void {
  const css = typeof CSS !== 'undefined' ? (CSS as unknown as { registerProperty?: (d: { name: string; syntax: string; inherits: boolean }) => void }) : null
  if (!css?.registerProperty) return
  for (const name of OWN_PROPS) {
    try {
      css.registerProperty({ name, syntax: '*', inherits: false })
    } catch { /* already registered by an earlier start */ }
  }
}

// ---- global stylesheet ----

const globalCss = (): string =>
  `:where(img){filter:brightness(${model.gain.img})}\n` +
  '[data-bc-nt]{transition:none!important}\n' +
  '[data-bc-bgi]{isolation:isolate}\n' +
  ['before', 'after'].map(slot =>
    `[data-bc-bgi="${slot}"]::${slot}{content:"";position:absolute;z-index:-1;pointer-events:none;border-radius:var(--bc-prad);border:0;` +
    'inset:var(--bc-in);background-image:var(--bc-bgi);background-size:var(--bc-bgs);background-position:var(--bc-bgp);' +
    'background-repeat:var(--bc-bgr);filter:brightness(var(--bc-gbg))}'
  ).join('\n')

function ensureStyles(): void {
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.setAttribute('data-bc-fix', '')
    styleEl.textContent = globalCss()
    document.head.appendChild(styleEl)
  }
  if (!ruleSheet) {
    ruleSheet = document.createElement('style')
    ruleSheet.setAttribute('data-bc-fix-rules', '')
    document.head.appendChild(ruleSheet)
  }
}

// ---- reading ----

const px = (v: string): number => Number.parseFloat(v) || 0
/** `data-bc-raw` marks a subtree the counter must leave alone (the colour-check squares); the dark-mode guard's
 *  sentinel probe must keep reading the colours it wrote. */
const eligible = (el: Element): el is HTMLElement =>
  el instanceof HTMLElement && !SKIP.has(el.tagName.toUpperCase()) && !el.closest('[data-bc-raw],[data-fdmg-sentinel]')

function readComputed(el: HTMLElement | null, cs: CSSStyleDeclaration, o: { hasText: boolean; leaf: boolean }): Computed {
  // The border box (percent radii and gradient lines are measured on it); a pseudo-element only reports its content box.
  const w = el ? el.offsetWidth : px(cs.width)
  const h = el ? el.offsetHeight : px(cs.height)
  const style = (s: string) => (cs as unknown as Record<string, string>)[s] ?? ''
  const borderWidth = SIDES.map(s => {
    const st = style(`border${s}Style`)
    return st === 'none' || st === 'hidden' ? 0 : px(style(`border${s}Width`))
  })
  const borderRadius = CORNERS.map(c => {
    const v = style(`border${c}Radius`).split(' ')[0] ?? ''
    return v.endsWith('%') ? (parseFloat(v) / 100) * Math.min(w || 0, h || 0) : px(v)
  })
  return {
    backgroundColor: cs.backgroundColor,
    backgroundImage: cs.backgroundImage,
    backgroundSize: cs.backgroundSize,
    backgroundPosition: cs.backgroundPosition,
    backgroundRepeat: cs.backgroundRepeat,
    backgroundOrigin: cs.backgroundOrigin,
    backgroundClip: cs.backgroundClip,
    color: cs.color,
    filter: cs.filter,
    boxShadow: cs.boxShadow,
    textShadow: cs.textShadow,
    position: cs.position,
    borderWidth,
    borderColor: SIDES.map(s => style(`border${s}Color`)),
    borderRadius,
    hasBorderImage: !!cs.borderImageSource && cs.borderImageSource !== 'none',
    width: w,
    height: h,
    hasText: o.hasText,
    leaf: o.leaf,
    isImg: el instanceof HTMLImageElement,
    isField: el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement,
  }
}

const hasDirectText = (el: HTMLElement): boolean => {
  for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue!.trim() !== '') return true
  return false
}

// ---- pseudo-element discovery (one native `matches` call per element) ----

function collectPseudoSelectors(rules: CSSRuleList, out: Set<string>): void {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      if (!/::?(before|after)/.test(rule.selectorText)) continue
      for (const part of rule.selectorText.split(',')) {
        if (!/::?(before|after)\s*$/.test(part)) continue
        const base = part.replace(/::?(before|after)\s*$/, '').trim()
        if (!base || /::/.test(base)) continue
        try {
          document.querySelector(base)
          out.add(base)
        } catch { /* a selector the engine rejects cannot match anything */ }
      }
    } else if ('cssRules' in rule) {
      collectPseudoSelectors((rule as CSSGroupingRule).cssRules, out)
    }
  }
}

function refreshPseudoSelector(): void {
  if (pseudoSheets === document.styleSheets.length) return
  pseudoSheets = document.styleSheets.length
  const out = new Set<string>()
  for (const sheet of document.styleSheets) {
    if ((sheet.ownerNode as Element | null)?.hasAttribute('data-bc-fix-rules')) continue
    try {
      collectPseudoSelectors(sheet.cssRules, out)
    } catch { /* cross-origin sheet */ }
  }
  pseudoSelector = [...out].join(',')
}

// ---- planning one element ----

function parentOf(el: HTMLElement): HTMLElement | null {
  return el.parentElement
}

function planElement(el: HTMLElement, batch: Map<HTMLElement, Plan>): { plan: Plan; pseudos: { slot: 'before' | 'after'; plan: Plan }[] } | null {
  if (!el.getClientRects().length) return null
  const cs = getComputedStyle(el)
  const hasText = hasDirectText(el)
  const c = readComputed(el, cs, { hasText, leaf: el.childElementCount === 0 && !hasText })
  const parent = parentOf(el)
  const parentState = parent ? states.get(parent) : undefined
  const parentPlan = parent ? batch.get(parent) : undefined
  let inherited: PlanEnv['inherited'] = null
  if (parentState?.textColor && parent && c.color === getComputedStyle(parent).color) inherited = parentState.textColor
  const inheritedShadow = parentPlan?.shadowSig ?? parentState?.shadowSig ?? null
  const env: PlanEnv = {
    model,
    paint: paintOk,
    pseudo: false,
    allowShadows: filteredCount < MAX_SHADOW_FILTERS,
    inherited,
    inheritedShadow,
    slot: () => pseudoSlot(el),
  }
  const plan = planBox(c, env)

  const pseudos: { slot: 'before' | 'after'; plan: Plan }[] = []
  if (pseudoSelector && el.matches(pseudoSelector)) {
    for (const slot of ['before', 'after'] as const) {
      if (plan.layerSlot === slot) continue
      const ps = getComputedStyle(el, `::${slot}`)
      const content = ps.content
      if (!content || content === 'none' || content === 'normal') continue
      const text = /^["']./.test(content)
      const pc = readComputed(null, ps, { hasText: text, leaf: !text })
      const p = planBox(pc, { ...env, pseudo: true, inherited: null, inheritedShadow: null, slot: () => null })
      if (p.decls.size) pseudos.push({ slot, plan: p })
    }
  }
  return { plan, pseudos }
}

/** The pseudo-element that is free to host a background-image layer. */
function pseudoSlot(el: HTMLElement): 'before' | 'after' | null {
  for (const slot of ['before', 'after'] as const) {
    const content = getComputedStyle(el, `::${slot}`).content
    if (!content || content === 'none' || content === 'normal') return slot
  }
  return null
}

// ---- writing ----

function revert(el: HTMLElement): void {
  const st = states.get(el)
  if (!st) return
  for (const [prop, val] of st.written) {
    if (el.style.getPropertyValue(prop) !== val) continue // the game rewrote it: theirs wins
    const old = st.saved.get(prop)
    if (old) el.style.setProperty(prop, old)
    else el.style.removeProperty(prop)
  }
  for (const a of st.attrs) el.removeAttribute(a)
  if (st.rules.length && ruleSheet?.sheet) {
    const sheet = ruleSheet.sheet
    for (const r of st.rules) {
      const i = Array.prototype.indexOf.call(sheet.cssRules, r)
      if (i >= 0) sheet.deleteRule(i)
    }
  }
  if (st.filtered) filteredCount = Math.max(0, filteredCount - 1)
  states.delete(el)
  active.delete(el)
}

const ruleText = (decls: Map<string, string>): string => [...decls].map(([k, v]) => `${k}:${v} !important`).join(';')

function commit(el: HTMLElement, plan: Plan, pseudos: { slot: 'before' | 'after'; plan: Plan }[]): void {
  if (!plan.decls.size && !pseudos.length) return
  const st: State = { saved: new Map(), written: new Map(), attrs: [], textColor: plan.textColor, shadowSig: plan.shadowSig, filtered: plan.usesFilterShadow, rules: [] }
  for (const [prop, val] of plan.decls) {
    st.saved.set(prop, el.style.getPropertyValue(prop))
    el.style.setProperty(prop, val, 'important')
    st.written.set(prop, el.style.getPropertyValue(prop))
  }
  if (plan.layerSlot) {
    el.setAttribute('data-bc-bgi', plan.layerSlot)
    st.attrs.push('data-bc-bgi')
  }
  if (pseudos.length && ruleSheet?.sheet) {
    let id = el.getAttribute('data-bc-n')
    if (!id) {
      id = String(++idCounter)
      el.setAttribute('data-bc-n', id)
    }
    st.attrs.push('data-bc-n')
    const sheet = ruleSheet.sheet
    for (const { slot, plan: p } of pseudos) {
      try {
        const idx = sheet.insertRule(`[data-bc-n="${id}"]::${slot}{${ruleText(p.decls)}}`, sheet.cssRules.length)
        st.rules.push(sheet.cssRules[idx] as CSSStyleRule)
        if (p.usesFilterShadow) st.filtered = true
      } catch { /* a declaration the engine rejects: leave that pseudo-element as authored */ }
    }
  }
  if (st.filtered) filteredCount++
  states.set(el, st)
  active.add(el)
}

function holdTransitions(els: HTMLElement[]): void {
  for (const el of els) {
    el.setAttribute('data-bc-nt', '')
    settling.add(el)
  }
  if (settleRaf) cancelAnimationFrame(settleRaf)
  settleRaf = requestAnimationFrame(() => {
    settleRaf = requestAnimationFrame(releaseTransitions)
  })
}

function releaseTransitions(): void {
  settleRaf = 0
  for (const el of settling) el.removeAttribute('data-bc-nt')
  settling.clear()
}

function run(els: HTMLElement[]): void {
  holdTransitions(els)
  els.sort((a, b) => (a === b ? 0 : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
  const t0 = performance.now()
  for (const el of els) revert(el)
  refreshPseudoSelector()
  const t1 = performance.now()
  const batch = new Map<HTMLElement, Plan>()
  const planned: { el: HTMLElement; plan: Plan; pseudos: { slot: 'before' | 'after'; plan: Plan }[] }[] = []
  for (const el of els) {
    if (!el.isConnected) continue
    const r = planElement(el, batch)
    if (!r) continue
    batch.set(el, r.plan)
    planned.push({ el, ...r })
  }
  const t2 = performance.now()
  for (const p of planned) commit(p.el, p.plan, p.pseudos)
  stats.planned += planned.length
  stats.revertMs += t1 - t0
  stats.planMs += t2 - t1
  stats.commitMs += performance.now() - t2
}

// ---- queue ----

function enqueueTree(root: HTMLElement, limit = Number.POSITIVE_INFINITY, wake = true): void {
  let n = 0
  if (eligible(root)) pending.add(root)
  for (const e of root.querySelectorAll('*')) {
    if (n++ >= limit) break
    if (eligible(e)) pending.add(e)
  }
  if (wake) schedule()
}

function schedule(gap = 0): void {
  if (!timer && pending.size && running) timer = window.setTimeout(flush, gap)
}

let perElementMs = 1

/** Plan and write queued elements until `budget` ms are spent. A batch is at least MIN_BATCH so work always moves. */
function drain(budget: number): number {
  const t0 = performance.now()
  while (pending.size) {
    const spent = performance.now() - t0
    if (spent >= budget) break
    const n = Math.max(MIN_BATCH, Math.min(MAX_BATCH, Math.floor((budget - spent) / perElementMs)))
    const els: HTMLElement[] = []
    for (const e of pending) {
      pending.delete(e)
      if (e.isConnected) els.push(e)
      if (els.length >= n) break
    }
    if (!els.length) continue
    const a = performance.now()
    run(els)
    perElementMs = perElementMs * 0.6 + ((performance.now() - a) / els.length) * 0.4
  }
  observer?.takeRecords() // our own writes are not news
  const ms = performance.now() - t0
  stats.ms += ms
  stats.worstMs = Math.max(stats.worstMs, ms)
  return ms
}

function flush(): void {
  timer = 0
  if (!running) return
  drain(FRAME_BUDGET_MS)
  stats.frames++
  for (const e of active) if (!e.isConnected) active.delete(e)
  schedule(SLICE_GAP_MS)
}

const parseDecls = (style: string | null): Map<string, string> => {
  const out = new Map<string, string>()
  if (!style) return out
  let depth = 0
  let cur = ''
  const take = (s: string) => {
    const i = s.indexOf(':')
    if (i > 0) out.set(s.slice(0, i).trim().toLowerCase(), s.slice(i + 1).trim())
  }
  for (const ch of style) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ';' && depth === 0) {
      take(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  take(cur)
  return out
}

/** Did a colour-relevant inline property change between two `style` attribute values? */
export function styleChangeMatters(oldStyle: string | null, newStyle: string | null, watchVars = false): boolean {
  const a = parseDecls(oldStyle)
  const b = parseDecls(newStyle)
  for (const k of new Set([...a.keys(), ...b.keys()])) {
    if (a.get(k) === b.get(k)) continue
    if (RELEVANT_STYLE.test(k)) return true
    // A custom property can feed any colour (a cooldown sweep reads `--cd`): once the element carries a rewrite of
    // its own, every variable it is given counts.
    if (watchVars && k.startsWith('--') && !k.startsWith('--bc-')) return true
  }
  return false
}

function onMutations(recs: MutationRecord[]): void {
  for (const r of recs) {
    const t = r.target
    if (r.type === 'attributes') {
      if (!eligible(t as Element)) continue
      const el = t as HTMLElement
      if (r.attributeName === 'style') {
        if (styleChangeMatters(r.oldValue, el.getAttribute('style'), states.has(el))) {
          pending.add(el)
          why.style++
        }
      } else {
        why.cls++
        enqueueTree(el, MAX_SUBTREE)
      }
    } else {
      r.addedNodes.forEach(n => {
        if (n instanceof HTMLElement) {
          why.added++
          enqueueTree(n, Number.POSITIVE_INFINITY, false)
        }
      })
    }
  }
  // New nodes first: fix as much as the sync budget allows before the browser paints them.
  if (pending.size) drain(SYNC_BUDGET_MS)
  schedule()
}

function enqueueAround(target: EventTarget | null): void {
  if (!(target instanceof HTMLElement)) return
  let el: HTMLElement | null = target
  for (let i = 0; el && i < 3; i++, el = el.parentElement) if (eligible(el)) pending.add(el)
  enqueueTree(target, 16)
}

const onPointer = (e: Event) => {
  why.pointer++
  enqueueAround(e.target)
}
const onSettled = (e: Event) => {
  if (e.type === 'transitionend' && !RELEVANT_TRANSITION.test((e as TransitionEvent).propertyName)) return
  if (e.target instanceof HTMLElement && eligible(e.target)) {
    why.settle++
    pending.add(e.target)
    schedule()
  }
}
const POINTER_EVENTS = ['pointerover', 'pointerout', 'pointerdown', 'pointerup', 'pointercancel', 'focusin', 'focusout'] as const
const SETTLE_EVENTS = ['transitionend', 'animationend'] as const

// ---- public API ----

/** Start countering `root` (default `document.body`) and everything the app adds to it later. Resolves true when running. */
export async function startCounter(root: HTMLElement = document.body, o: { gain?: Partial<Model['gain']> } = {}): Promise<boolean> {
  if (running) return true
  // `gain` is a test seam: 1 / 1 on a desktop browser (nothing darkens its images) leaves only the paint routes
  // visible, so a screenshot diff against the unfixed page proves them exact.
  Object.assign(model.gain, DEFAULT_GAIN, o.gain)
  const token = ++startToken
  paintOk = await registerWorklet()
  if (token !== startToken) return false
  running = true
  registerProperties()
  ensureStyles()
  observer = new MutationObserver(onMutations)
  observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'], attributeOldValue: true, childList: true, subtree: true })
  for (const ev of POINTER_EVENTS) document.addEventListener(ev, onPointer, { capture: true, passive: true })
  for (const ev of SETTLE_EVENTS) document.addEventListener(ev, onSettled, { capture: true, passive: true })
  enqueueTree(root)
  return true
}

/** Stop watching and put every element back as authored. */
export function stopCounter(): void {
  startToken++
  running = false
  observer?.disconnect()
  observer = null
  for (const ev of POINTER_EVENTS) document.removeEventListener(ev, onPointer, { capture: true })
  for (const ev of SETTLE_EVENTS) document.removeEventListener(ev, onSettled, { capture: true })
  if (timer) window.clearTimeout(timer)
  timer = 0
  if (settleRaf) cancelAnimationFrame(settleRaf)
  releaseTransitions()
  pending.clear()
  for (const e of [...active]) revert(e)
  active.clear()
  filteredCount = 0
  styleEl?.remove()
  ruleSheet?.remove()
  styleEl = null
  ruleSheet = null
  pseudoSheets = -1
}

export const isCounterRunning = (): boolean => running

/** Whether the paint worklet loaded (false: the model fallback is in use). */
export const counterUsesPaint = (): boolean => paintOk

/** Cost so far: elements planned, frames that did work, total and worst ms spent in a frame. */
export const counterStats = () => ({ ...stats, why: { ...why }, pending: pending.size, active: active.size, shadowFilters: filteredCount })

/** Re-plan one element now (after the app changed something the observer cannot see). */
export function counterElement(el: HTMLElement): void {
  if (!running || !eligible(el)) return
  run([el])
  observer?.takeRecords()
}

