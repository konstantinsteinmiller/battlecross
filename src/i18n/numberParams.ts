import { fmt2 } from '@/utils/format'

/**
 * ─── No float noise in a translated line ─────────────────────────────────────
 *
 * Every number the player reads shows at most two digits after the point
 * (owner rule). Most screens hand a line its numbers raw (`t('mod.str',
 * { n: 6.12 })`), and vue-i18n prints a raw number with `String()` — so a
 * forged `6.120000000000001` reached the screen as is, and `2.5` stayed `2.5`
 * in German. Rather than trust every call site, the global `t` passes each
 * fractional number parameter through `fmt2` (two decimals at most, trailing
 * zeros dropped, the player's own decimal sign). Whole numbers are left
 * alone: they print the same either way, and a call site that wants them
 * grouped already says so with `fmt`.
 */

type Params = Record<string, unknown>

/** The named parameters with every fractional number shown as `fmt2` shows it. */
export const formatNumberParams = <T>(params: T): T => {
  if (!params || typeof params !== 'object' || Array.isArray(params)) return params
  let out: Params | null = null
  for (const k in params as Params) {
    const v = (params as Params)[k]
    if (typeof v === 'number' && Number.isFinite(v) && !Number.isInteger(v)) {
      out ??= { ...(params as Params) }
      out[k] = fmt2(v)
    }
  }
  return (out ?? params) as T
}

/**
 * Route the composer's `t` through `formatNumberParams`. Call it on
 * `i18n.global` BEFORE `app.use(i18n)`: the plugin copies `t` onto `$t` then.
 */
export const installNumberParams = (composer: { t: (...args: any[]) => string }): void => {
  const t = composer.t
  composer.t = (...args: any[]): string => {
    if (args.length > 1) args[1] = formatNumberParams(args[1])
    return t(...args)
  }
}
