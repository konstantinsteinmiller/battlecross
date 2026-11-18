/**
 * ─── The Smugglers' Undercroft (roadmap #EXT-1) ─────────────────────────────
 *
 * After the first level's cage opens, the ground answers: a second, bigger trapdoor (the Bandit Chief's wagon floor) drops the
 * hero and the freed teachers into the smugglers' tunnels under the road. Four beats, about three minutes:
 *
 *   corridor   a dark way where only a lit radius shows; wall braziers light as the hero passes
 *   cart run   a rail lane: the hero rides at speed, rolls over rolling barrels and rail gaps
 *   stash      three chests, one of them trapped behind a pressure plate
 *   warden     the Tunnel Warden, a drill-armed brute; lure his charge into the rotten pillars
 *
 * The reward is the smugglers' purse, an epic piece, and the tunnel out: it comes up under Sunford's smithy (the map is skipped).
 */

export const UNDER_FLAG = 'undercroftDone'
/** Offered once: a hero who skipped or finished it is never dropped again. */
export const underDue = (has: (flag: string) => boolean): boolean => !has(UNDER_FLAG)

/** The cart: top speed (m/s), how fast it gets there, what a barrel and a rail gap cost (share of max health), and the slow after one. */
export const CART_SPEED = 9
export const CART_ACCEL = 5
export const BARREL_HIT = 0.08
export const GAP_HIT = 0.1
export const CART_STUMBLE = 0.4
/** Seconds the hero is untouchable after a hit, and how far sideways he can steer on the rails (m/s). */
export const CART_GRACE = 0.9
export const CART_STEER = 6
/** Lane obstacles: one every this many metres, alternating barrels left, right and rail gaps. */
export const OBSTACLE_EVERY = 11
/** A rail gap's length (m): a roll carries him over it. */
export const GAP_LEN = 2.6

/** The braziers light when the hero is this near (m). */
export const BRAZIER_R = 6

/** The stash: gold in each chest at level `l`, and the trapped one's share. */
export const stashGold = (level: number, k: number): number => Math.round((70 + level * 16) * (k === 2 ? 2.4 : 1 + k * 0.3))
/** The pressure plate's drop: a share of the hero's health, and the warning (s). */
export const PLATE_HIT = 0.12

/** The smugglers' purse paid at the end, and the experience (a share of the level's bar). */
export const underPurse = (level: number): number => 220 + level * 55
export const UNDER_XP = 0.45

/** The Tunnel Warden's charged pillar blow: a share of his health the roof takes off him, and the stun. */
export const WARDEN_CRUSH = 0.1
export const WARDEN_STUN = 4
export const WARDEN_PILLARS = 4
