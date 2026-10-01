// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const showHelp = vi.fn()
vi.mock('@/game/boot', () => ({ currentMission: () => ({ showHelp }) }))

const load = async () => {
  const { flow } = await import('@/game/flow')
  const { toggleHelp } = await import('@/game/help')
  return { flow, toggleHelp }
}

beforeEach(() => { showHelp.mockClear() })

describe('F1 / the help button (#114)', () => {
  it('opens the controls legend in a mission, and closes it on a second press', async () => {
    const { flow, toggleHelp } = await load()
    flow.screen = 'mission'
    flow.modal = ''
    toggleHelp()
    expect(flow.modal).toBe('controls')
    expect(showHelp).toHaveBeenCalled()
    toggleHelp()
    expect(flow.modal).toBe('')
  })

  it('works in the Lab too', async () => {
    const { flow, toggleHelp } = await load()
    flow.screen = 'hub'
    flow.modal = ''
    toggleHelp()
    expect(flow.modal).toBe('controls')
    flow.modal = ''
  })

  it('never replaces another modal', async () => {
    const { flow, toggleHelp } = await load()
    flow.screen = 'mission'
    flow.modal = 'results'
    toggleHelp()
    expect(flow.modal).toBe('results')
    flow.modal = ''
  })
})
