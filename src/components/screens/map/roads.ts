/**
 * ─── The roads of the world map ──────────────────────────────────────────────
 *
 * One winding road per link of the travel graph (`MAP[].links`). A road is a
 * smooth curve from one place to the next through the waypoints given here;
 * the terrain keeps its trees off it, the map draws it, and the hero walks it.
 */
import { MAP, NODE_BY_ID, type NodeId } from '@/game/data/zones'
import { MAP_H, MAP_W, lengths, sampleSpline, spline, type Pt } from './geo'

export interface Road {
  /** The two ids, sorted and joined: `hollows-plains`. */
  key: string
  a: NodeId
  b: NodeId
  /** SVG path, from `a` to `b`. */
  d: string
  /** The same curve as points, from `a` to `b`. */
  line: Pt[]
  length: number
}

export const roadKey = (a: string, b: string): string => [a, b].sort().join('-')

/** Where a place stands on the sheet. */
export const nodeAt = (id: NodeId): Pt => {
  const n = NODE_BY_ID[id]
  return n ? [n.at[0] * MAP_W, n.at[1] * MAP_H] : [0, 0]
}

/**
 * The bends, by road key, in the order the key names its ends. A road with no
 * entry still bows a little to one side: nothing on a drawn map is ruled.
 */
const VIA: Readonly<Record<string, Pt[]>> = {
  'plains-sunford': [[330, 590], [262, 652]],
  'arena-sunford': [[396, 760], [300, 716]],
  'hollows-plains': [[262, 452], [352, 482]],
  'plains-woods': [[508, 540], [590, 492]],
  // Down the west bank and over the Sunford road: a crossroads.
  'arena-hollows': [[428, 690], [338, 618], [258, 520]],
  'outskirts-woods': [[818, 590], [742, 548]],
  'crags-woods': [[756, 384], [690, 410]],
  'oakhaven-outskirts': [[1052, 664], [968, 628]],
  'crags-mines': [[700, 296], [628, 240]],
  'crags-tundra': [[882, 262], [968, 286]],
  'ironhold-mines': [[400, 214], [484, 204]],
  'temple-tundra': [[1262, 398], [1168, 352]],
  'citadel-tundra': [[1208, 268], [1132, 234]],
  'citadel-temple': [[1352, 300], [1362, 392]],
  'citadel-peak': [[1196, 132], [1072, 132]],
  'citadel-fortress': [[1332, 150], [1400, 168]],
  'fortress-peak': [[1320, 62], [1130, 52]],
  'fortress-rift': [[1522, 190], [1516, 268]]
}

const build = (): Road[] => {
  const out: Road[] = []
  const seen = new Set<string>()
  for (const n of MAP) {
    for (const l of n.links) {
      const key = roadKey(n.id, l)
      if (seen.has(key) || !NODE_BY_ID[l]) continue
      seen.add(key)
      const [a, b] = key.split('-') as [NodeId, NodeId]
      const from = nodeAt(a)
      const to = nodeAt(b)
      let via = VIA[key]
      if (!via) {
        const bow = (out.length % 2 ? 1 : -1) * 0.14
        via = [[(from[0] + to[0]) / 2 - (to[1] - from[1]) * bow, (from[1] + to[1]) / 2 + (to[0] - from[0]) * bow]]
      }
      const pts = [from, ...via, to]
      const line = sampleSpline(pts, false, 14)
      const cum = lengths(line)
      out.push({ key, a, b, d: spline(pts), line, length: cum[cum.length - 1] ?? 0 })
    }
  }
  return out
}

export const ROADS: readonly Road[] = build()
export const ROAD_BY_KEY: Readonly<Record<string, Road>> = Object.fromEntries(ROADS.map(r => [r.key, r]))

/**
 * The places passed on the way from one to another, both ends included: the
 * fewest roads, over places the hero may walk (`open`). With no such way (a
 * save edited by hand), the fewest roads over any place; with none at all, the
 * two ends alone.
 */
export const routeBetween = (from: NodeId, to: NodeId, open: (id: NodeId) => boolean = () => true): NodeId[] => {
  if (from === to) return [from]
  const search = (ok: (id: NodeId) => boolean): NodeId[] | null => {
    const prev = new Map<NodeId, NodeId>()
    const queue: NodeId[] = [from]
    const seen = new Set<NodeId>([from])
    while (queue.length) {
      const cur = queue.shift()!
      for (const next of NODE_BY_ID[cur]?.links ?? []) {
        if (seen.has(next) || !NODE_BY_ID[next] || (next !== to && !ok(next))) continue
        seen.add(next)
        prev.set(next, cur)
        if (next === to) {
          const path: NodeId[] = [to]
          while (path[0] !== from) path.unshift(prev.get(path[0]!)!)
          return path
        }
        queue.push(next)
      }
    }
    return null
  }
  return search(open) ?? search(() => true) ?? [from, to]
}

/** The road keys along a route. */
export const routeKeys = (route: readonly NodeId[]): string[] => route.slice(1).map((id, i) => roadKey(route[i]!, id))

/** A route as one polyline, walked from its first place to its last. */
export const routeLine = (route: readonly NodeId[]): Pt[] => {
  if (route.length < 2) return route.map(nodeAt)
  const out: Pt[] = []
  for (let i = 1; i < route.length; i++) {
    const road = ROAD_BY_KEY[roadKey(route[i - 1]!, route[i]!)]
    const leg = !road ? [nodeAt(route[i - 1]!), nodeAt(route[i]!)] : road.a === route[i - 1] ? road.line : [...road.line].reverse()
    out.push(...(out.length ? leg.slice(1) : leg))
  }
  return out
}
