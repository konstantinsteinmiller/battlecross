// Samsung Internet forced-dark-mode counter. See runtime.ts for the design and plan.ts for the measured routes.
export { startCounter, stopCounter, isCounterRunning, counterUsesPaint, counterStats, counterElement, registerWorklet, styleChangeMatters } from './runtime'
export { planBox, pickTextShadows, ringBands, gradientValue, withPremultipliedBlends, SAMSUNG_30, PAINT_LAYERS } from './plan'
export type { Computed, Plan, PlanEnv, Model } from './plan'
export { observe, precorrect, reachableLuma, LIGHT_KEEP_Y } from './model'
export type { Rgb, Role } from './model'
export { parseColor, parseGradient, parseShadows, splitTop } from './css'

export { isSamsungUa } from './ua'
