// @vitest-environment jsdom
// What counts as LIVE GAMEPLAY — the predicate behind every portal's
// gameplayStart / gameplayStop bracket.
//
// This is a portal contract, not a view detail. CrazyGames counts the session
// between the two events; Poki measures conversion-to-play on the first
// `gameplayStart()` and takes a screen wake lock for the duration of the
// bracket. So every reason the game is not being played has to close it, and a
// missing one is invisible until a reviewer reads the SDK event log.
//
// The tab-away and portal-pause arms are here because they were once MISSING:
// both already halted the simulation via `isGamePaused`, so the game looked
// correct while the portal was never told, and a player who switched tabs
// mid-mission left an open bracket behind them.

import { describe, expect, it } from 'vitest'
import { isGameplayLive, type GameplayLiveInputs } from '@/use/useGameplayLifecycle'

/** A player mid-mission with nothing in the way. Each test negates one thing. */
const playing: GameplayLiveInputs = {
  screen: 'zone',
  pauseMenu: false,
  adShowing: false,
  visibilityHidden: false,
  platformPaused: false
}

describe('isGameplayLive', () => {
  it('is live while the player is in a zone', () => {
    expect(isGameplayLive(playing)).toBe(true)
  })

  it('stays live in a town, on the map, in shops and on result screens — they are part of the session', () => {
    expect(isGameplayLive({ ...playing, screen: 'town' })).toBe(true)
    expect(isGameplayLive({ ...playing, screen: 'map' })).toBe(true)
  })

  it('is not live while the game boots', () => {
    expect(isGameplayLive({ ...playing, screen: 'boot' })).toBe(false)
  })

  it('STOPS on tab away', () => {
    expect(isGameplayLive({ ...playing, visibilityHidden: true })).toBe(false)
  })

  it('STOPS when the portal SDK asks the game to pause', () => {
    expect(isGameplayLive({ ...playing, platformPaused: true })).toBe(false)
  })

  it('comes back live when the player returns to the tab', () => {
    const away = { ...playing, visibilityHidden: true }
    expect(isGameplayLive(away)).toBe(false)
    expect(isGameplayLive({ ...away, visibilityHidden: false })).toBe(true)
  })

  it('STOPS only for the pause menu', () => {
    expect(isGameplayLive({ ...playing, pauseMenu: true })).toBe(false)
  })

  it('STOPS while an ad is on screen', () => {
    expect(isGameplayLive({ ...playing, adShowing: true })).toBe(false)
  })

  it('needs EVERY reason to clear before it reports live again', () => {
    const stopped = { ...playing, visibilityHidden: true, pauseMenu: true }
    expect(isGameplayLive({ ...stopped, visibilityHidden: false })).toBe(false)
    expect(isGameplayLive({ ...stopped, pauseMenu: false })).toBe(false)
    expect(isGameplayLive({ ...stopped, visibilityHidden: false, pauseMenu: false })).toBe(true)
  })
})
