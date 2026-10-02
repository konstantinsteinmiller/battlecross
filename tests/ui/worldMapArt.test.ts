import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'
import { MAP, NODE_BY_ID, nodeOpen, type NodeId } from '@/game/data/zones'
import { MAP_H, MAP_W, distToLine, lengths, pointAlong } from '@/components/screens/map/geo'
import { ROADS, ROAD_BY_KEY, nodeAt, roadKey, routeBetween, routeLine } from '@/components/screens/map/roads'
import { mapBridgesSvg, mapPlateSvg, mapPlateUrl } from '@/components/screens/map/terrain'
import { cloudCover, landmarkSvg } from '@/components/screens/map/landmarks'
import { MAP_REGIONS, SIGHTS, decorSvg, frameSvg, tearClip } from '@/components/screens/map/life'

/**
 * The drawn world map (`components/screens/map/`): the geometry the screen
 * stands on. What is pinned here fails silently otherwise — a place moved in
 * `zones.ts` whose landmark now hangs off the sheet or sits on its neighbour,
 * a link added to the travel graph with no road drawn for it, a plate that
 * carries something the painter must not paint.
 */

/**
 * Is this markup well-formed: every tag closed in order, every attribute
 * quoted? (No DOM here: the suite runs in node, and a parser is not worth a
 * jsdom start-up for this file.) Returns what is wrong, or ''.
 */
const malformed = (markup: string): string => {
  const open: string[] = []
  let last = 0
  for (const m of markup.matchAll(/<(\/?)([A-Za-z][\w:-]*)((?:\s+[\w:-]+="[^"<]*")*)\s*(\/?)>/g)) {
    const between = markup.slice(last, m.index)
    if (between.includes('<') || between.includes('>')) return `stray markup before <${m[2]}>: ${between.slice(0, 60)}`
    last = m.index! + m[0].length
    if (m[1]) { if (open.pop() !== m[2]) return `</${m[2]}> closes nothing` } else if (!m[4]) open.push(m[2]!)
  }
  const tail = markup.slice(last)
  if (tail.includes('<') || tail.includes('>')) return `stray markup at the end: ${tail.slice(0, 60)}`
  return open.length ? `<${open.at(-1)}> is never closed` : ''
}

/** A landmark's box: 120 units, the place's own spot at its 50 %, 80 %. */
const BOX = 120
const boxOf = (id: NodeId): { x0: number; y0: number; x1: number; y1: number } => {
  const [x, y] = nodeAt(id)
  return { x0: x - BOX / 2, y0: y - BOX * 0.8, x1: x + BOX / 2, y1: y + BOX * 0.2 }
}

describe('the places on the sheet', () => {
  it('every landmark stands whole on the 1600 x 900 sheet, inside its margin', () => {
    for (const n of MAP) {
      const b = boxOf(n.id)
      expect(b.x0, n.id).toBeGreaterThanOrEqual(0)
      expect(b.y0, n.id).toBeGreaterThanOrEqual(0)
      expect(b.x1, n.id).toBeLessThanOrEqual(MAP_W)
      // Its name hangs under it, and the frame takes the last 24 units.
      expect(b.y1 + 44, n.id).toBeLessThanOrEqual(MAP_H - 24)
    }
  })

  it('no two landmarks overlap (the rule the layout check holds the buttons to)', () => {
    for (const a of MAP) {
      for (const c of MAP) {
        if (a.id >= c.id) continue
        const p = boxOf(a.id)
        const q = boxOf(c.id)
        const apart = p.x1 <= q.x0 || q.x1 <= p.x0 || p.y1 <= q.y0 || q.y1 <= p.y0
        expect(apart, `${a.id} / ${c.id}`).toBe(true)
      }
    }
  })

  it('the travel graph is what it was: sixteen places, the same links, the same gates', () => {
    expect(MAP.map(n => n.id)).toEqual(['sunford', 'plains', 'hollows', 'arena', 'woods', 'outskirts', 'oakhaven', 'crags', 'mines', 'ironhold', 'tundra', 'temple', 'citadel', 'peak', 'fortress', 'rift'])
    const links = Object.fromEntries(MAP.map(n => [n.id, [...n.links].sort().join(',')]))
    expect(links).toEqual({
      sunford: 'arena,plains', plains: 'hollows,sunford,woods', hollows: 'arena,plains', arena: 'hollows,sunford', woods: 'crags,outskirts,plains',
      outskirts: 'oakhaven,woods', oakhaven: 'outskirts', crags: 'mines,tundra,woods', mines: 'crags,ironhold', ironhold: 'mines',
      tundra: 'citadel,crags,temple', temple: 'citadel,tundra', citadel: 'fortress,peak,temple,tundra', peak: 'citadel,fortress', fortress: 'citadel,peak,rift', rift: 'fortress'
    })
    expect(NODE_BY_ID.arena!.needs).toEqual(['arenaOpen'])
    expect(NODE_BY_ID.rift!.needs).toEqual(['throneDone'])
  })
})

describe('the roads', () => {
  it('there is one road per link, from one place to the other', () => {
    const keys = new Set<string>()
    for (const n of MAP) for (const l of n.links) keys.add(roadKey(n.id, l))
    expect(ROADS.map(r => r.key).sort()).toEqual([...keys].sort())
    expect(ROADS).toHaveLength(18)
    for (const r of ROADS) {
      expect(r.line[0], r.key).toEqual(nodeAt(r.a))
      const end = r.line.at(-1)!
      expect(Math.hypot(end[0] - nodeAt(r.b)[0], end[1] - nodeAt(r.b)[1]), r.key).toBeLessThan(0.01)
      expect(r.d.startsWith('M'), r.key).toBe(true)
      // A road winds: it is longer than the straight line, and not absurdly so.
      const straight = Math.hypot(nodeAt(r.b)[0] - nodeAt(r.a)[0], nodeAt(r.b)[1] - nodeAt(r.a)[1])
      expect(r.length, r.key).toBeGreaterThan(straight)
      expect(r.length, r.key).toBeLessThan(straight * 1.45)
    }
  })

  it('a road stays on the sheet and never runs through a place it does not serve', () => {
    for (const r of ROADS) {
      for (const p of r.line) {
        expect(p[0] > 30 && p[0] < MAP_W - 30 && p[1] > 30 && p[1] < MAP_H - 30, `${r.key} leaves the sheet at ${p}`).toBe(true)
      }
      for (const n of MAP) {
        if (n.id === r.a || n.id === r.b) continue
        // The middle of the other place's landmark.
        const [x, y] = nodeAt(n.id)
        expect(distToLine([x, y - 30], r.line), `${r.key} past ${n.id}`).toBeGreaterThan(62)
      }
    }
  })

  it('the way between two places follows open roads, and falls back when there is none', () => {
    const all = routeBetween('sunford', 'rift')
    expect(all[0]).toBe('sunford')
    expect(all.at(-1)).toBe('rift')
    for (let i = 1; i < all.length; i++) expect(NODE_BY_ID[all[i - 1]!]!.links, `${all[i - 1]} → ${all[i]}`).toContain(all[i])
    // The fewest roads: plains, woods, crags, tundra, citadel, fortress.
    expect(all).toEqual(['sunford', 'plains', 'woods', 'crags', 'tundra', 'citadel', 'fortress', 'rift'])
    expect(routeBetween('woods', 'woods')).toEqual(['woods'])

    // A new save after the first fight: the plains are cleared.
    const cleared = new Set(['plains'])
    const open = (id: NodeId): boolean => nodeOpen(id, cleared, new Set())
    expect(routeBetween('plains', 'hollows', open)).toEqual(['plains', 'hollows'])
    // The colosseum is shut, so the way to Sunford is the road, not round by the arena.
    expect(routeBetween('hollows', 'sunford', open)).toEqual(['hollows', 'plains', 'sunford'])
    // Nothing open leads there: still an answer, over the map as drawn.
    expect(routeBetween('plains', 'fortress', open).at(-1)).toBe('fortress')
  })

  it('a route is one unbroken line the hero can be walked along', () => {
    const route = routeBetween('sunford', 'tundra')
    const line = routeLine(route)
    const cum = lengths(line)
    expect(line[0]).toEqual(nodeAt('sunford'))
    expect(Math.hypot(line.at(-1)![0] - nodeAt('tundra')[0], line.at(-1)![1] - nodeAt('tundra')[1])).toBeLessThan(0.01)
    for (let i = 1; i < line.length; i++) expect(Math.hypot(line[i]![0] - line[i - 1]![0], line[i]![1] - line[i - 1]![1])).toBeLessThan(24)
    expect(cum.at(-1)).toBeCloseTo(route.slice(1).reduce((s, id, i) => s + ROAD_BY_KEY[roadKey(route[i]!, id)]!.length, 0), 3)
    // Start, end, and forward all the way between.
    expect(pointAlong(line, cum, 0)).toEqual(line[0])
    expect(pointAlong(line, cum, 1)).toEqual(line.at(-1))
    expect(pointAlong(line, cum, 7)).toEqual(line.at(-1))
    let last = -1
    for (let k = 0; k <= 40; k++) {
      const p = pointAlong(line, cum, k / 40)
      // Its place along the line: the nearest point's running length never goes back.
      let best = Infinity
      let at = 0
      line.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < best) { best = d; at = cum[i]! } })
      expect(best).toBeLessThan(12)
      expect(at).toBeGreaterThanOrEqual(last)
      last = at
    }
    // A road walked against the way it was drawn is the same road, turned round.
    expect(routeLine(['plains', 'sunford'])).toEqual([...routeLine(['sunford', 'plains'])].reverse())
  })
})

describe('the terrain plate', () => {
  const svg = mapPlateSvg()

  it('is one standalone 16:9 drawing, the same every time', () => {
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
    expect(svg).toContain(`viewBox="0 0 ${MAP_W} ${MAP_H}"`)
    expect(MAP_W / MAP_H).toBeCloseTo(16 / 9, 5)
    expect(mapPlateSvg()).toBe(svg)
    expect(malformed(svg)).toBe('')
    expect(malformed('<g><path d="M0 0"/></g>')).toBe('')
    expect(malformed('<g><path d="M0 0"></g>')).not.toBe('')
    expect(malformed('<g><path d=M0/></g>')).not.toBe('')
    // Every stamp that is used is defined.
    const defined = new Set([...svg.slice(0, svg.indexOf('</defs>')).matchAll(/<g id="([\w-]+)"/g)].map(m => m[1]!))
    const used = new Set([...svg.matchAll(/xlink:href="#([\w-]+)"/g)].map(m => m[1]!))
    for (const id of used) expect(defined.has(id), id).toBe(true)
    expect(mapPlateUrl().startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true)
  })

  it('carries nothing the game draws over it: no lettering, nothing that moves, nothing loaded from outside', () => {
    expect(svg).not.toMatch(/<text\b/)
    expect(svg).not.toMatch(/\bclass=/)
    expect(svg).not.toMatch(/<animate|<style|<script|<image\b|<foreignObject/)
    expect(svg).not.toMatch(/href="(?!#)/)
  })

  it('has a bare site under every place, a bed for every road and a bridge at every river crossing', () => {
    for (const n of MAP) {
      const [x, y] = nodeAt(n.id)
      expect(svg, n.id).toContain(`<ellipse cx="${Math.round(x * 10) / 10}" cy="${Math.round(y * 10) / 10}" rx="50" ry="20"`)
    }
    for (const r of ROADS) expect(svg, r.key).toContain(`d="${r.d}"`)
    const bridges = mapBridgesSvg()
    expect(bridges.match(/<rect /g)).toHaveLength(2)
    expect(svg).toContain(bridges)
  })

  it('keeps its trees off the sights the screen draws over it', () => {
    const stamps = [...svg.matchAll(/<use xlink:href="#(t\d|p\d|m\d|b1)" transform="translate\(([\d.-]+) ([\d.-]+)\)/g)].map(m => [Number(m[2]), Number(m[3])] as const)
    expect(stamps.length).toBeGreaterThan(150)
    for (const at of [SIGHTS.windmill, SIGHTS.camp]) {
      for (const p of stamps) expect(Math.hypot(p[0] - at[0], p[1] - (at[1] - 14)), `${p} by ${at}`).toBeGreaterThan(34)
    }
    // And off the places: nothing is planted where a landmark stands.
    for (const n of MAP) {
      const [x, y] = nodeAt(n.id)
      for (const p of stamps) expect(Math.hypot((p[0] - x) / 64, (p[1] - (y - 26)) / 74), `${p} on ${n.id}`).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('the landmarks', () => {
  it('every place has one, and a locked place is drawn still', () => {
    for (const n of MAP) {
      const open = landmarkSvg(n.id)
      const locked = landmarkSvg(n.id, { locked: true })
      expect(open.length, n.id).toBeGreaterThan(300)
      expect(open, n.id).toMatch(/class="lm-/)
      expect(locked, n.id).not.toMatch(/class="/)
      expect(locked, n.id).not.toBe(open)
      expect(malformed(open), n.id).toBe('')
      expect(malformed(locked), n.id).toBe('')
    }
  })

  it('Oakhaven stands or lies in ruins', () => {
    const whole = landmarkSvg('oakhaven')
    const fallen = landmarkSvg('oakhaven', { ruined: true })
    expect(fallen).not.toBe(whole)
    // The fires of the ruin keep their colour; the walls do not.
    expect(fallen).toContain('#ff8a2a')
    expect(whole).toContain('#dcd6e2')
    expect(fallen).not.toContain('#dcd6e2')
  })

  it('cloud lies thicker over a place with no open road to it', () => {
    const puffs = (s: string): number => (s.match(/class="cl /g) ?? []).length
    expect(puffs(cloudCover(false))).toBe(2)
    expect(puffs(cloudCover(true))).toBe(4)
  })
})

describe('the sheet\'s dressing', () => {
  it('writes the given words, escaped', () => {
    const out = decorSvg({ title: 'A <b> & C', compass: ['N', 'E', 'S', 'W'] })
    expect(out).toContain('A &lt;b&gt; &amp; C')
    expect(out).not.toContain('<b>')
    expect(malformed(out)).toBe('')
    expect(malformed(frameSvg())).toBe('')
    expect(malformed(cloudCover(true))).toBe('')
  })

  it('every region lettered on the map has its English name, and stands on the sheet', () => {
    const region = (en as unknown as { map: { region: Record<string, string> } }).map.region
    expect(MAP_REGIONS.map(r => r.id).sort()).toEqual(Object.keys(region).sort())
    for (const r of MAP_REGIONS) {
      expect(region[r.id]!.length, r.id).toBeGreaterThan(2)
      expect(r.x > 60 && r.x < MAP_W - 60 && r.y > 40 && r.y < MAP_H - 36, r.id).toBe(true)
    }
  })

  it('the torn edge never bites past the margin the sheet is clipped at', () => {
    const pts = [...tearClip().matchAll(/([\d.]+)% ([\d.]+)%/g)].map(m => [(Number(m[1]) / 100) * MAP_W, (Number(m[2]) / 100) * MAP_H] as const)
    expect(pts.length).toBeGreaterThan(100)
    for (const [x, y] of pts) {
      const bite = Math.min(x, MAP_W - x, y, MAP_H - y)
      expect(bite).toBeGreaterThanOrEqual(0)
      // `.wmap__clip` is inset 16 units.
      expect(bite).toBeLessThanOrEqual(15.01)
    }
  })
})
