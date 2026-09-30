/**
 * ─── The kill-cam ────────────────────────────────────────────────────────────
 *
 * Now and then a machine's end gets a freeze-frame (`freezeCam.ts`): the world
 * stops, the camera swings over Flux's shoulder, and the machine crumbles into
 * pieces while he stands over it. It is a reward, so it never costs the player
 * anything: never on a boss or a mini-boss (their own finish is the moment),
 * never in the tutorial mission (the lessons own it), never while he is in a
 * hurry (sliding, in the air, next to a hazard, another machine awake close
 * by), and at most once per KIND of machine in a mission — the second Gear
 * Roller crumbling is no longer news.
 *
 * Pure rules: the mission hands over what it knows, this decides.
 */

/** Chance per eligible kill. */
export const KILLCAM_CHANCE = 0.1
/** The shot's length (s): long enough to watch the crumble, short of a chore. */
export const KILLCAM_DUR = 2.6
/** A hazard this close (m) means Flux is in a hurry. */
export const KILLCAM_HAZARD_R = 6
/** Another awake machine this close (m) means the fight is still on. */
export const KILLCAM_ALERT_R = 12

export interface KillCamCheck {
  /** The player's setting (Options → Gameplay). */
  enabled: boolean
  tutorial: boolean
  boss: boolean
  mini: boolean
  kind: string
  /** Kinds already shown this mission. */
  seen: ReadonlySet<string>
  sliding: boolean
  airborne: boolean
  hazardNear: boolean
  alertNear: boolean
  /** Another freeze-frame, the exit or a lesson is already running. */
  busy: boolean
  /** A uniform 0..1 roll. */
  roll: number
}

export const wantsKillCam = (c: KillCamCheck): boolean =>
  c.enabled && !c.tutorial && !c.boss && !c.mini && !c.busy &&
  !c.seen.has(c.kind) && !c.sliding && !c.airborne && !c.hazardNear && !c.alertNear &&
  c.roll < KILLCAM_CHANCE
