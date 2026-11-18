/** The suite's chests are plain chests (the mimic's roll, `sim/mimic.ts`, would turn the first one a test opens into a fight); `mimic.test.ts` turns it back on. */
;(globalThis as { __NO_MIMIC__?: boolean }).__NO_MIMIC__ = true
