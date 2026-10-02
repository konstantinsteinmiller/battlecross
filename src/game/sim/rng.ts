/** Small, fast, seedable PRNG (mulberry32). Maps and loot must be
 *  reproducible from a seed so a mission snapshot only stores deltas. */
export type Rng = () => number

export const mulberry32 = (seed: number): Rng => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const randInt = (rng: Rng, min: number, max: number): number =>
  min + Math.floor(rng() * (max - min + 1))

export const randRange = (rng: Rng, min: number, max: number): number =>
  min + rng() * (max - min)

export const pick = <T>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]!

export const shuffle = <T>(rng: Rng, arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const t = arr[i]!
    arr[i] = arr[j]!
    arr[j] = t
  }
  return arr
}

/** Weighted pick over `[item, weight]` pairs. */
export const weighted = <T>(rng: Rng, items: ReadonlyArray<readonly [T, number]>): T => {
  let total = 0
  for (const [, w] of items) total += Math.max(0, w)
  let r = rng() * total
  for (const [it, w] of items) {
    r -= Math.max(0, w)
    if (r <= 0) return it
  }
  return items[items.length - 1]![0]
}

/** Hash a string to a 32-bit seed. */
export const hashSeed = (s: string): number => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
