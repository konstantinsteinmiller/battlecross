/**
 * The floating start zone: a touch that goes down in the bottom-left area (and
 * then drags) re-anchors the joystick under the thumb instead of the thumb
 * having to find the resting stick. Pure geometry, in CSS px of the gesture
 * surface (y down); `input.ts` applies it, the tests pin the numbers.
 */

export interface StickZone {
  /** The zone is x in [0, w] and y in [h0, H] (the bottom-left corner). */
  w: number
  h: number
  /** Nearest the anchor may sit to the left / bottom edge of the surface. */
  edgeX: number
  edgeY: number
  tablet: boolean
}

/** Phone: the corner under a thumb. Tablet: a bigger, inset area. */
const PHONE = { fw: 0.38, fh: 0.45, maxW: 240, maxH: 320, margin: 8 }
const TABLET = { fw: 0.45, fh: 0.5, maxW: 440, maxH: 420, margin: 8, edge: 110 }
/** A tablet is a coarse pointer with a short side from here up (css px). */
export const TABLET_MIN_SHORT = 600
/** A tablet's stick is bigger (its travel radius, before the HUD scale). */
export const TABLET_TRAVEL_K = 1.25

export const isTabletViewport = (w: number, h: number, coarse: boolean): boolean =>
  coarse && Math.min(w, h) >= TABLET_MIN_SHORT

/**
 * The zone for a `w` × `h` surface and a stick of travel `radius`. `insetL` /
 * `insetB` are the safe-area insets (notch, home bar).
 */
export const stickZone = (w: number, h: number, radius: number, tablet: boolean, insetL = 0, insetB = 0): StickZone => {
  const t = tablet ? TABLET : PHONE
  const edge = tablet ? Math.max(TABLET.edge, radius + t.margin) : radius + t.margin
  return {
    w: Math.min(w * t.fw, t.maxW),
    h: Math.min(h * t.fh, t.maxH),
    edgeX: edge + Math.max(0, insetL),
    edgeY: edge + Math.max(0, insetB),
    tablet
  }
}

export const inStickZone = (z: StickZone, w: number, h: number, x: number, y: number): boolean =>
  x >= 0 && x <= z.w && y <= h && y >= h - z.h

/** The anchor for a touch at (x, y): pulled into the screen so the handle has room to go left and down. */
export const stickAnchor = (z: StickZone, w: number, h: number, x: number, y: number): { x: number; y: number } => ({
  x: Math.min(Math.max(x, z.edgeX), Math.max(z.edgeX, w - z.edgeX)),
  y: Math.max(Math.min(y, h - z.edgeY), z.edgeY)
})
