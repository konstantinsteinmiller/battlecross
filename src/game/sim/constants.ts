/** Tunables shared by the mission sim. Units: metres, seconds, radians. */

export const EYE_H = 1.36
/** Generous on purpose: wall pilasters stand 0.3 m proud of the wall line,
 *  and the camera must never end up inside one. */
export const PLAYER_R = 0.62
export const WALK_SPEED = 4.7
export const ACCEL = 16
/** Tap-to-move walks a touch slower than the stick — it reads as deliberate. */
export const PATH_SPEED = 4.3

export const LOOK_TOUCH = 0.0058
export const LOOK_MOUSE = 0.0034
/** A captured mouse (pointer lock): raw movement, finer than a drag. */
export const LOOK_LOCK = 0.0023
/** Keyboard turning (← / →), rad/s. */
export const TURN_RATE = 2.3
export const PITCH_MIN = -0.95
export const PITCH_MAX = 0.62

export const DOOR_OPEN_DIST = 4.4
export const DOOR_OPEN_SPEED = 2.6

export const BEAM_IN_TIME = 1.15

/** How far a chest or the worker-bot answers [E] / the tap (m), centre to
 *  centre — the boss shutter's reach. A chest's centre sits 0.55 m back
 *  toward its wall and its collision keeps the player 1.4 m off it, so a
 *  shorter reach left only a thin crescent in front to stand in. */
export const INTERACT_DIST = 3.4
/** Closer than this the interact reach skips the grid sight test (m): no
 *  wall fits between (a wall cell is 3 m thick; chests keep off doorways),
 *  and a line that grazes a wall cell's corner would only hide the prompt. */
export const INTERACT_NEAR = 1.8
