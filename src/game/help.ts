import { flow } from '@/game/flow'
import { currentMission } from '@/game/boot'
import { isGamePaused } from '@/use/useGamePause'

/**
 * F1, "?" and the HUD's help button: open the controls legend.
 *
 * Help used to only bring back the coach glyphs, at most two of them, and a
 * click on the button meant the mouse was free — the very state in which the
 * desktop glyph row is hidden — so a click showed nothing at all and F1 looked
 * dead (#114). The legend (`ControlsPanel` in `ControlsIntroModal`) is the
 * whole answer, and it works in the Lab too. A second press closes it. Another
 * modal (results, defeat, level-up, pause) is never replaced, and nothing opens
 * under an ad or a portal pause.
 */
export const toggleHelp = (): void => {
  if (flow.modal === 'controls') {
    flow.modal = ''
    return
  }
  if (flow.modal || (flow.screen !== 'mission' && flow.screen !== 'hub')) return
  if (isGamePaused.value) return
  flow.modal = 'controls'
  // Back in play, the glyph recall still points at the controls on screen.
  currentMission()?.showHelp()
}
