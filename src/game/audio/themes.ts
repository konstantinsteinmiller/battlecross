import type { ThemeId } from '../data/zones'
import type { TrackId } from './songs'

/**
 * Which piece of the score (`songs.ts`) a zone's look plays. Eight area themes
 * cover the fifteen looks: places that feel alike share one.
 */
const THEME_TRACK: Record<ThemeId, TrackId> = {
  town: 'town',
  plains: 'meadow',
  farm: 'meadow',
  forest: 'wildwood',
  ruin: 'wildwood',
  cave: 'deep',
  mine: 'deep',
  ash: 'ember',
  rift: 'ember',
  snow: 'frost',
  peak: 'frost',
  temple: 'sanctum',
  void: 'sanctum',
  fortress: 'bastion',
  arena: 'bastion'
}

/** The music track for a zone theme. */
export const trackForTheme = (theme: ThemeId): TrackId => THEME_TRACK[theme]

/** Every zone theme, for tools and tests. */
export const THEME_IDS = Object.keys(THEME_TRACK) as ThemeId[]
