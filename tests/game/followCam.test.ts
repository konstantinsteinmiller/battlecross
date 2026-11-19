import { describe, expect, it } from 'vitest'
import { FollowCam } from '@/game/engine/camera'

// The follow camera leads the hero a little toward where he runs. The sim's velocity is the distance moved in one tick, so a
// teleport is hundreds of metres a second: the view must not follow that (#229, "the camera teleports away and crawls back").
describe('the follow camera', () => {
  it('stays near the hero through a teleport and a knockback, however big their "velocity"', () => {
    const cam = new FollowCam()
    cam.follow(0, 0, 0, 0, 1 / 60)
    let worst = 0
    let x = 0
    for (let i = 0; i < 240; i++) {
      // Frame 60: a Shadowstep of 12 m in one tick (12 / 0.033 = 360 m/s); frame 120: a boss knocks him 9 m.
      let vx = 4
      if (i === 60) { x += 12; vx = 360 } else if (i === 120) { x += 9; vx = 270 } else x += 4 / 60 * 0
      cam.follow(x, 0, vx, 0, 1 / 60)
      worst = Math.max(worst, Math.hypot(cam.target.x - x, cam.target.z))
    }
    // The view leads at most a couple of metres; right after the jump it is catching up, never leading away.
    expect(worst).toBeLessThan(13)
    const after = Math.hypot(cam.target.x - x, cam.target.z)
    expect(after).toBeLessThan(2.6)
  })

  it('catches up quickly from a long jump', () => {
    const cam = new FollowCam()
    cam.follow(0, 0, 0, 0, 1 / 60)
    for (let i = 0; i < 45; i++) cam.follow(20, 0, 0, 0, 1 / 60)
    expect(Math.hypot(cam.target.x - 20, cam.target.z)).toBeLessThan(0.5)
  })
})
