/**
 * ─── The siege of the Hollows' gate (roadmap #204) ───────────────────────────
 *
 * Before the hero's first step into the Goblin Hollows, the goblins and gnomes the King starved and
 * chained are storming the palisade across the cave mouth. Two wooden towers (goblin archers on their
 * platforms) hold it. The hero gets a panorama, then the chance to break the siege: pull the lever of
 * either catapult (each hurls one stone at its own tower), or step under the ram and push it (it rolls
 * on by itself, slowly; the movement keys or the stick make it faster, and three blows bring a tower
 * down). Both towers down: the palisade is breached and the party pours into the cave, the Hollows
 * proper follows. It plays right before the first entry, may be skipped, and a skipped one is offered
 * again on the next entry for as long as the King lives.
 *
 * Pure data and arithmetic; the sim plays it (`sim/assault.ts`), the view draws it (`gfx/assaultProps.ts`).
 */

/** The flag a finished siege sets: it is never played again. */
export const ASSAULT_FLAG = 'hollowsSiege'
/** The flag that says the King has been dealt with (his quest's answer): a skipped siege is not offered then. */
export const KING_DONE_FLAG = 'arenaOpen'

/** Is the siege due on the next entry to the Hollows? */
export const assaultDue = (has: (flag: string) => boolean): boolean => !has(ASSAULT_FLAG) && !has(KING_DONE_FLAG)

/** Seconds of the panorama before the hero may move. */
export const PANORAMA_S = 8.5
/** Seconds the party cheers and pours into the cave after the second tower falls, before the Hollows load. */
export const BREACH_S = 5
/** How near (m) the hero stands to a catapult's lever to pull it, and to the ram to take its handles. */
export const LEVER_REACH = 2.1
export const RAM_REACH = 2.6

/** A catapult's wind-up (the arm cranks back) and its stone's flight to the tower, seconds. */
export const CATAPULT_WIND = 1.1
export const CATAPULT_FLIGHT = 1.35

/** The ram's creep (m/s) when left alone, and with the hero pushing (a movement key or the stick). */
export const RAM_CREEP = 1.25
export const RAM_PUSH = 4.2
/** The ram's blows on a tower, and the seconds between them. */
export const RAM_BLOWS = 3
export const RAM_BLOW_GAP = 1.15
/**
 * The ram's footprint (half-width and half-length, m, around its centre: the wheels' outer edge and the
 * push-bar behind) and where the hero stands to push it: just behind the bar, never inside the frame.
 * Everything else (goblins, gnomes, the hero not riding) is pushed out of this box.
 */
export const RAM_HALF_X = 0.98
export const RAM_HALF_Z = 1.5
export const RAM_RIDE_Z = 1.95
/** The ram stops this far (m) in front of a tower's foot. */
export const RAM_STOP = 0.4

/** The seconds without anything done before the hint pulses, and before it names what to do. */
export const HINT_IDLE_S = 6
export const HINT_URGENT_S = 18

/**
 * The cries of the storming goblins and gnomes (the same idea as the cage's calls in the first level): one
 * rebel at a time, every 3 s until each cry has been heard once, then every 8 s, then every 12 to 15 s.
 */
export const CRIES = ['down', 'nomore', 'free'] as const
export type Cry = (typeof CRIES)[number]
export const CRIER = { goblin: 'rebelGoblin', gnome: 'rebelGnome' } as const
export const cryKey = (who: keyof typeof CRIER, cry: Cry): string => `dlg.bark.${CRIER[who]}.${cry}.1`
export const cryPeriod = (made: number): number => (made < 3 ? 5 : made < 6 ? 13 : 20 + (((made * 2654435761) >>> 0) % 5001) / 1000)
/** From the end of the panorama to the first cry. */
export const CRY_FIRST_S = 1.2

/**
 * ─── The sally (roadmap #EXT-7) ──────────────────────────────────────────────
 *
 * When the FIRST tower falls the palisade's gate swings open and the gate guards charge out in three waves: a
 * hold-the-line of at least `SALLY_WAVES`' last `at` seconds with the goblins and gnomes of the storming party
 * fighting beside the hero. Beating every guard "holds the line" and pays a strongbox when the siege is won;
 * it never fails the siege (a line that breaks is only a smaller purse): the hero is hurt at half strength and
 * never falls below a quarter of his health while it lasts.
 */
export const SALLY_WAVES: ReadonlyArray<{ at: number; kinds: readonly string[] }> = [
  { at: 0, kinds: ['goblin', 'goblin', 'goblin'] },
  { at: 8, kinds: ['goblin', 'goblinSlinger', 'goblin'] },
  { at: 16, kinds: ['wolf', 'goblin', 'goblin', 'goblin'] }
]
/** Every kind the sally can send (the scene prewarms them). */
export const SALLY_KINDS: readonly string[] = [...new Set(SALLY_WAVES.flatMap(w => w.kinds))]
/** The guards that are left after this long run away: the line did not hold, the purse is smaller. */
export const SALLY_CAP_S = 40
/** Enemy blows land this much lighter during the siege (the hero is a guest at somebody else's fight). */
export const SALLY_FOE_MUL = 0.5
/** The hero's health never drops below this share of his maximum while the sally lasts. */
export const SALLY_FLOOR = 0.25
/** A swing of a party member: this share of the guard's health, every `SALLY_SWING_GAP` s. */
export const SALLY_SWING = 0.1
export const SALLY_SWING_GAP = 0.9
/** The strongbox of a held line, in gold: `base + perLevel × level`, (half of it when the line broke). */
export const SALLY_PURSE = { base: 40, perLevel: 12 }
export const sallyPurse = (level: number, held: boolean): number => {
  const full = SALLY_PURSE.base + SALLY_PURSE.perLevel * Math.max(1, level)
  return held ? full : Math.round(full / 2)
}
