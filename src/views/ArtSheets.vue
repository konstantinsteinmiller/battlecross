<template lang="pug">
  //- DEV ONLY (the route is not registered in a build): every reference sheet
  //- of the art pipeline, drawn from the game's own vector drawings.
  div.art-sheets(:data-ready="ready ? '1' : undefined")
    h1 Art sheets
    div.bar
      button(type="button" :disabled="busy || !ready" @click="exportAll") Export all sheets
      span.status {{ status }}
    p.note
      | Reference sheets for the painter: {{ views.length }} of {{ total }} drawn{{ only.size ? ' (filtered by ?only=)' : '' }}.
      | Export writes them, sheet-index.json and the prompt documents into art-sheets/. Dev only; nothing here is translated.
    //- The game's own drawings, one per panel. Baked from here, never from a
    //- painted file: see `held` in the script.
    div.stage(ref="stage" aria-hidden="true")
      span.stage__cell(v-for="c in drawn" :key="c.target" :data-target="c.target")
        ArtIcon(v-if="c.draw === 'item' || c.draw === 'skill'" :glyph="c.glyph || 'unknown'" :tint="c.tint" frame="none")
        Portrait(v-else-if="c.draw === 'portrait'" :look="c.id")
        IconCoin(v-else)
    section.sheet(v-for="v in views" :key="v.stem")
      h2 {{ v.title }}
      p.sheet__meta {{ v.stem }}.png · {{ v.width }} × {{ v.height }} · {{ v.note }}
      div.sheet__pair
        img(:src="v.clean" :alt="v.stem")
        img(v-if="v.key" :src="v.key" :alt="`${v.stem} key`")
</template>

<script setup lang="ts">
/**
 * The export bench of the art pipeline (`src/game/art/artSheet.ts` is the
 * manifest; this only renders it). For every sheet: the clean reference on
 * flat magenta, a captioned key sheet, and the measured fit of every drawing
 * (its solid bounding box, as fractions of a panel), which the slicer uses to
 * register a painted return back onto the drawing it replaces.
 *
 * `/#/art-sheets?only=<stem or id>,…` draws and exports only those sheets;
 * the dev endpoint merges them into the index already on disk.
 */
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  CELL, ICON_FILL, ICON_FILL_ROUND, REF_SCALE, SCENERY, SETS, SINGLES, fitsOfIndex, panelHeight, promptDocs, sheetIndex, sheetSize,
  type ArtScenery, type ArtSet, type Fit, type SheetCell
} from '@/game/art/artSheet'
import { PORTRAIT_ART, UI_ART } from '@/game/assets/overrides'
import { MAP } from '@/game/data/zones'
import { groundDetail } from '@/game/gfx/textures'
import { MAP_H, MAP_W } from '@/components/screens/map/geo'
import { mapPlateSvg } from '@/components/screens/map/terrain'
import { landmarkSvg } from '@/components/screens/map/landmarks'
import ArtIcon from '@/components/art/ArtIcon.vue'
import Portrait from '@/components/art/Portrait.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import { BACKDROP_SAFE, backdropSvg } from '@/components/game/backdrops'

// THE REFERENCE MUST NEVER BE THE SHIPPED PAINTING OF ITSELF. `Portrait` and
// `IconCoin` show a painted file when one exists, so an export after the first
// art pass would send the PAINTING out as the next reference, and every
// re-roll would restyle a painting, one generation further from the drawing.
// The art layer is therefore off while the bench is open (items and skills
// already go straight to `ArtIcon`, which has no override of its own).
const held = { portraits: new Map(PORTRAIT_ART), coin: UI_ART.get('coin') }
PORTRAIT_ART.clear()
UI_ART.delete('coin')
onBeforeUnmount(() => {
  for (const [k, v] of held.portraits) PORTRAIT_ART.set(k, v)
  if (held.coin) UI_ART.set('coin', held.coin)
})

const route = useRoute()
const only = new Set(String(route.query.only ?? '').split(',').map(s => s.trim()).filter(Boolean))
const wanted = (stem: string, ids: string[]): boolean => !only.size || only.has(stem) || ids.some(id => only.has(id))

const sets: ArtSet[] = [...SETS, ...SINGLES].filter(s => wanted(s.stem, s.cells.flatMap(c => (c ? [c.id] : []))))
const scenery: ArtScenery[] = SCENERY.filter(a => wanted(a.stem, [a.plate]))
const drawn: SheetCell[] = sets.flatMap(s => s.cells.flatMap(c => (c ? [c] : [])))
const total = SETS.length + SINGLES.length + SCENERY.length

interface View { stem: string; title: string; width: number; height: number; note: string; clean: string; key: string }
const views = ref<View[]>([])
const fits: Record<string, Fit> = {}
const stage = ref<HTMLElement | null>(null)
const ready = ref(false)
const busy = ref(false)
const status = ref('Rendering references…')

const MAGENTA = '#ff00ff'
const INK = '#0f0c19'
const SIZE = CELL * REF_SCALE
const OFF = (CELL - SIZE) / 2

const canvas = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.imageSmoothingQuality = 'high'
  return [c, g]
}

/** What an SVG looks like comes from the component's scoped CSS, which an
 *  image of that SVG would lose: write the computed paint into the copy. */
const PAINT = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linejoin', 'stroke-linecap', 'stroke-dasharray', 'opacity']

/**
 * Where a drawing goes in its panel's square: `[x, y, size]`, px.
 *
 * AN ICON FILLS ITS PANEL. The image is the WHOLE drawing (several glyphs run
 * past their 48-unit box, and a painter handed a droplet with a straight cut
 * down one side paints the cut), and it is scaled about its own solid box
 * until its longest side takes `ICON_FILL` of the panel, centred. It used to
 * sit at the glyph's inset in the game, 55 to 70 % of the panel, and the model
 * painted it that small: the first icons read worse at 40 px than the vectors
 * they replaced. Drawn large, it is painted large, with shapes to match. An
 * icon shown in a round frame is kept inside the panel's inscribed circle.
 * The slicer trims an icon to its own paint, so where the drawing sat in the
 * game's frame no longer has to survive the round trip.
 *
 * A bust is the exception: its flat bottom IS the edge of the frame
 * `Portrait` puts it in, so it stays on its box, cut there like the vector.
 */
const placeOf = (c: SheetCell, img: HTMLImageElement): [number, number, number] => {
  if (c.draw === 'portrait') return [OFF, OFF, SIZE]
  // Measured at twice the panel, so the box is good to half a pixel.
  const R = CELL * 2
  const [, g] = canvas(R, R)
  g.drawImage(img, 0, 0, R, R)
  const d = g.getImageData(0, 0, R, R).data
  let x0 = R
  let y0 = R
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < R; y++) {
    for (let x = 0; x < R; x++) {
      if ((d[(y * R + x) * 4 + 3] ?? 0) <= 140) continue
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
  if (x1 < 0) return [0, 0, CELL]
  const cx = (x0 + x1 + 1) / 2
  const cy = (y0 + y1 + 1) / 2
  let k = (ICON_FILL * R) / Math.max(x1 - x0 + 1, y1 - y0 + 1)
  if (c.round) {
    let far = 0
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if ((d[(y * R + x) * 4 + 3] ?? 0) > 140) far = Math.max(far, Math.hypot(x + 0.5 - cx, y + 0.5 - cy))
      }
    }
    if (far > 0) k = Math.min(k, (ICON_FILL_ROUND * R) / 2 / far)
  }
  // The box's middle on the panel's middle.
  return [CELL / 2 - (cx / 2) * k, CELL / 2 - (cy / 2) * k, CELL * k]
}

/** The drawing in one stage cell, as an image. Gives up after 20 s and names it. */
const drawingOf = async (c: SheetCell): Promise<HTMLImageElement> => {
  const target = c.target
  const svg = stage.value?.querySelector(`[data-target="${target}"] svg`)
  if (!svg) throw new Error(`no drawing for ${target}`)
  const copy = svg.cloneNode(true) as SVGSVGElement
  const from = svg.querySelectorAll('*')
  const to = copy.querySelectorAll<SVGElement>('*')
  from.forEach((el, i) => {
    const cs = getComputedStyle(el)
    for (const p of PAINT) to[i]?.style.setProperty(p, cs.getPropertyValue(p))
  })
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  if (c.draw !== 'portrait') {
    // The whole panel in the drawing's own units: its box, plus the margin.
    const [x = 0, y = 0, w = 48, h = 48] = (copy.getAttribute('viewBox') ?? '0 0 48 48').trim().split(/[\s,]+/).map(Number)
    const mx = (w / REF_SCALE - w) / 2
    const my = (h / REF_SCALE - h) / 2
    copy.setAttribute('viewBox', `${x - mx} ${y - my} ${w + mx * 2} ${h + my * 2}`)
  }
  // Twice the drawn size, so the downsample is clean.
  copy.setAttribute('width', String(CELL * 2))
  copy.setAttribute('height', String(CELL * 2))
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`
  await Promise.race([
    img.decode(),
    new Promise((_, no) => setTimeout(() => no(new Error(`${target} did not render in 20 s`)), 20_000))
  ])
  return img
}

/** The drawing's SOLID box (alpha over 140: a soft edge is light, not extent),
 *  measured on a transparent panel, since magenta has no alpha to measure. */
const measure = (img: HTMLImageElement, x: number, y: number, size: number): Fit | null => {
  const [, g] = canvas(CELL, CELL)
  g.drawImage(img, x, y, size, size)
  const d = g.getImageData(0, 0, CELL, CELL).data
  let x0 = CELL
  let y0 = CELL
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      if ((d[(y * CELL + x) * 4 + 3] ?? 0) <= 140) continue
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
  if (x1 < 0) return null
  // Three decimals, and the SAME numbers go into the index: `pnpm art:prompts`
  // reads them back, and both routes must write identical documents.
  const r = (v: number): number => Math.round(v * 1000) / 1000
  return { h: r((y1 - y0 + 1) / CELL), w: r((x1 - x0 + 1) / CELL), bottom: r((y1 + 1) / CELL), cx: r((x0 + x1 + 1) / 2 / CELL) }
}

const caption = (g: CanvasRenderingContext2D, text: string, x: number, y: number, w: number): void => {
  g.fillStyle = 'rgba(15, 12, 25, 0.82)'
  g.fillRect(x, y - 22, w, 22)
  g.fillStyle = '#ffffff'
  g.font = '600 13px system-ui, sans-serif'
  g.textBaseline = 'middle'
  g.fillText(text, x + 6, y - 11, w - 12)
}

const bakeSet = async (s: ArtSet): Promise<View> => {
  const { width, height } = sheetSize(s)
  // A panel may be taller than the drawing's square (`TALL` in the manifest):
  // the square sits in its middle, and the fit is still measured on it.
  const ph = panelHeight(s)
  const lift = (ph - CELL) / 2
  const [clean, g] = canvas(width, height)
  g.fillStyle = MAGENTA
  g.fillRect(0, 0, width, height)
  let n = 0
  for (const [i, c] of s.cells.entries()) {
    if (!c) continue
    const img = await drawingOf(c)
    const [x, y, size] = placeOf(c, img)
    g.drawImage(img, (i % s.cols) * CELL + x, Math.floor(i / s.cols) * ph + lift + y, size, size)
    const fit = measure(img, x, y, size)
    if (fit) fits[c.target] = fit
    n++
  }
  // Captions live on a SEPARATE sheet: text inside a panel is text an image
  // model will faithfully repaint as art.
  const [key, k] = canvas(width, height)
  k.drawImage(clean, 0, 0)
  k.strokeStyle = INK
  k.lineWidth = 2
  for (const [i, c] of s.cells.entries()) {
    const x = (i % s.cols) * CELL
    const y = Math.floor(i / s.cols) * ph
    k.strokeRect(x + 1, y + 1, CELL - 2, ph - 2)
    caption(k, c ? `${i + 1}. ${c.id}` : `${i + 1}. (blank)`, x + 2, y + ph - 2, CELL - 4)
  }
  return { stem: s.stem, title: s.title, width, height, note: `${n} panel${n === 1 ? '' : 's'}, ${s.cols} × ${s.rows}${ph === CELL ? '' : `, panels ${CELL} × ${ph}`}`, clean: clean.toDataURL('image/png'), key: key.toDataURL('image/png') }
}

/** A standalone SVG document as an image. */
const svgImage = async (svg: string): Promise<HTMLImageElement> => {
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  await Promise.race([
    img.decode(),
    new Promise((_, no) => setTimeout(() => no(new Error('the map plate did not render in 20 s')), 20_000))
  ])
  return img
}

/**
 * The terrain plate `WorldMap.vue` draws under its landmarks
 * (`screens/map/terrain.ts`): sea, coast, regions, rivers, the roads' beds
 * and the bare sites. Never the painted file it may be replaced by: the plate
 * is built from the drawing's own data, which has no override.
 */
const bakeMap = async (a: ArtScenery): Promise<View> => {
  const { width: W, height: H } = a
  const [clean, g] = canvas(W, H)
  g.drawImage(await svgImage(mapPlateSvg()), 0, 0, W, H)
  // The key shows what the game draws over the plate, so a return can be
  // checked against it: every landmark on its site. The painter never sees it.
  const [key, k] = canvas(W, H)
  k.drawImage(clean, 0, 0)
  // A landmark's box is 120 sheet units, its foot at 50 %, 80 % of it.
  const bw = (120 / MAP_W) * W
  const bh = (120 / MAP_H) * H
  for (const n of MAP) {
    const x = n.at[0] * W
    const y = n.at[1] * H
    const mark = await svgImage(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="240" height="240" overflow="visible">${landmarkSvg(n.id)}</svg>`)
    k.drawImage(mark, x - bw / 2, y - bh * 0.8, bw, bh)
    caption(k, n.id, x - 50, y + bh * 0.2 + 26, 100)
  }
  return { stem: a.stem, title: a.title, width: W, height: H, note: 'opaque backdrop; the key shows the landmarks the game draws over it', clean: clean.toDataURL('image/png'), key: key.toDataURL('image/png') }
}

/**
 * A big screen's backdrop (`components/game/backdrops.ts`): the drawing the
 * screen shows until `images/ui/bg-<name>.webp` exists. The key marks the calm
 * middle the interface always covers, so a return can be checked against it.
 */
const bakeScreen = async (a: ArtScenery): Promise<View> => {
  const { width: W, height: H } = a
  const [clean, g] = canvas(W, H)
  g.drawImage(await svgImage(backdropSvg(a.screen!.name)), 0, 0, W, H)
  const [key, k] = canvas(W, H)
  k.drawImage(clean, 0, 0)
  const x0 = W * BACKDROP_SAFE[0]
  const x1 = W * BACKDROP_SAFE[1]
  k.fillStyle = 'rgba(15, 12, 25, 0.35)'
  k.fillRect(x0, 0, x1 - x0, H)
  k.fillRect(0, 0, W, H * 0.12)
  k.strokeStyle = '#ffffff'
  k.lineWidth = 3
  k.setLineDash([12, 10])
  k.strokeRect(x0, 0, x1 - x0, H)
  caption(k, 'calm middle: the interface always covers it', x0 + 8, H / 2, x1 - x0 - 16)
  caption(k, 'the top bar covers this', 8, H * 0.12 - 4, 260)
  return { stem: a.stem, title: a.title, width: W, height: H, note: 'opaque backdrop; the key marks the calm middle and the top bar', clean: clean.toDataURL('image/png'), key: key.toDataURL('image/png') }
}

/** The game's own baked ground detail, twice across and twice down, so the
 *  reference shows the repeat. Never the drop-in: the bench does not load it. */
const bakeGround = (a: ArtScenery): View => {
  const { width: W, height: H } = a
  const [clean, g] = canvas(W, H)
  const tile = groundDetail().image as HTMLCanvasElement
  for (const x of [0, W / 2]) for (const y of [0, H / 2]) g.drawImage(tile, x, y, W / 2, H / 2)
  return { stem: a.stem, title: a.title, width: W, height: H, note: 'opaque, tileable, greyscale: shown 2 × 2', clean: clean.toDataURL('image/png'), key: '' }
}

onMounted(async () => {
  try {
    await nextTick()
    for (const s of sets) views.value.push(await bakeSet(s))
    for (const a of scenery) views.value.push(a.plate === 'map' ? await bakeMap(a) : a.plate === 'screen' ? await bakeScreen(a) : bakeGround(a))
    status.value = ''
    ready.value = true
  } catch (e) {
    status.value = `FAILED: ${e instanceof Error ? e.message : String(e)}`
  }
})

const post = async (body: Record<string, unknown>): Promise<any> => {
  const r = await fetch(`${import.meta.env.BASE_URL}__art-sheets`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-art-sheets': '1' },
    body: JSON.stringify(body)
  })
  const j = await r.json()
  if (!r.ok) throw new Error(j.error ?? r.statusText)
  return j
}

const b64 = (dataUrl: string): string => dataUrl.slice(dataUrl.indexOf(',') + 1)

const exportAll = async (): Promise<void> => {
  busy.value = true
  try {
    let n = 0
    for (const v of views.value) {
      status.value = `Writing ${++n}/${views.value.length}: ${v.stem}.png`
      await post({ kind: 'png', name: `${v.stem}.png`, data: b64(v.clean) })
      if (v.key) await post({ kind: 'png', name: `${v.stem}-key.png`, data: b64(v.key) })
    }
    status.value = 'Writing sheet-index.json'
    const { index } = await post({ kind: 'index', index: sheetIndex(fits) })
    // From the MERGED index, so a partial export still writes the measured
    // sizes of the sheets it did not draw this time.
    const docs = promptDocs(fitsOfIndex(index))
    for (const [name, text] of Object.entries(docs)) {
      status.value = `Writing ${name}`
      await post({ kind: 'doc', name, text })
    }
    status.value = `wrote ${views.value.length} reference${views.value.length === 1 ? '' : 's'}, sheet-index.json and ${Object.keys(docs).length} prompt documents to art-sheets/`
  } catch (e) {
    status.value = `FAILED: ${e instanceof Error ? e.message : String(e)}`
  } finally {
    busy.value = false
  }
}
</script>

<style scoped lang="sass">
.art-sheets
  position: fixed
  inset: 0
  overflow: auto
  padding: 1rem
  background: #1b2244
  color: #fff
  font-family: var(--font-ui)
  h1, h2
    margin: 0.6rem 0 0.3rem
.bar
  display: flex
  align-items: center
  gap: 0.8rem
  button
    padding: 0.5rem 0.9rem
    border-radius: 0.5rem
    border: 2px solid #0f1a30
    background: #3fd060
    color: #fff
    font: inherit
    cursor: pointer
    &:disabled
      opacity: 0.5
      cursor: default
.status
  color: #ffe9a8
.note, .sheet__meta
  margin: 0.3rem 0 0.6rem
  color: #b9c4ee
// The drawings are measured and copied from here, so they must be laid out,
// but nobody needs to look at them.
.stage
  position: absolute
  left: -9999px
  top: 0
  width: 96px
.stage__cell
  display: block
  width: 96px
  height: 96px
  :deep(svg)
    display: block
    width: 100%
    height: 100%
.sheet__pair
  display: flex
  flex-wrap: wrap
  gap: 0.6rem
  img
    display: block
    max-width: min(100%, 40rem)
    height: auto
    border: 2px solid #0f1a30
</style>
