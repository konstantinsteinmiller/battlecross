/**
 * Toasts / objectives carry i18n KEYS as parameters (an enemy name, a rarity,
 * an item) so the sim never formats text. This resolves any param whose value
 * looks like one of those keys before interpolation.
 */
const KEY_PREFIXES = ['enemy.', 'enemyPlural.', 'rarity.', 'item.', 'sector.', 'weapon.', 'boss.', 'skill.', 'attr.']

type T = (k: string, p?: Record<string, unknown> | number) => string

/** Plural keys (`enemyPlural.*`) are resolved with the `total` / `n` count. */
export const resolveParams = (t: T, params: Record<string, string | number> | undefined): Record<string, string | number> => {
  if (!params) return {}
  const out: Record<string, string | number> = {}
  const count = Number(params.total ?? params.n ?? 1)
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string' && v.startsWith('enemyPlural.')) out[k] = t(v, count)
    else out[k] = typeof v === 'string' && KEY_PREFIXES.some(p => v.startsWith(p)) ? t(v) : v
  }
  return out
}
