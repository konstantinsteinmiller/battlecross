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
export const BEAM_OUT_TIME = 1.25

export const INTERACT_DIST = 2.6
