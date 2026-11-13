/**
 * Build flags the simulation reads. Kept out of `world.ts` so a test can flip the behaviour on a `Sim` without touching the environment.
 *
 * VITE_APP_WALK_ATTACK=true: the hero's basic attack also works on the run: the legs keep running with the stick while the upper body
 * faces the target and swings (the red-marked foe first, else the nearest one in reach). Off: a swing is dropped the moment he moves,
 * and he attacks only standing still (the earlier behaviour, kept for A/B tests).
 */
export const WALK_ATTACK = import.meta.env.VITE_APP_WALK_ATTACK === 'true'
