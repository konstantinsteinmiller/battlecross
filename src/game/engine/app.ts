import { PerspectiveCamera, Scene } from 'three'
import { getRenderer, resizeRenderer, sizeRenderer } from './renderer'
import { frameStart, frameEnd, phaseStart, phaseEnd } from '@/use/usePerfProbe'
import { stepEffectsLadder } from './effectsLadder'
import { notePerfFrame } from './perfReport'

/**
 * ─── The game loop ───────────────────────────────────────────────────────────
 *
 * ONE requestAnimationFrame for the whole game. Logic runs on a fixed 60 Hz
 * step (deterministic enough for replays and snapshot resumes, and immune to
 * 120/144 Hz displays speeding the game up); rendering runs every frame and
 * interpolates between the last two logic states.
 *
 * The loop only RUNS while gameplay wants it AND the platform/ad/modal gate
 * allows it (`setSuspended`). A suspended loop cancels its RAF outright — a
 * portal's pause event must stop the loop, not merely skip work inside it.
 */

export interface GameMode {
  scene: Scene
  camera: PerspectiveCamera
  /** One fixed logic step. `first` is true for the first step of a frame
   *  (one-shot input edges are consumed there). */
  update(dt: number, first: boolean): void
  /** Draw. `alpha` ∈ [0,1) interpolates between logic steps; `dt` is the real
   *  frame time (camera look, UI-side animation). */
  render(alpha: number, dt: number): void
  resize?(w: number, h: number): void
  /** Called once when the mode becomes the live one (`setMode`). Modes can be
   *  built in the background, so start-of-mode effects belong here. */
  enter?(): void
  dispose(): void
}

const STEP = 1 / 60
const MAX_STEPS = 5

class GameApp {
  mode: GameMode | null = null
  private raf = 0
  private last = 0
  private acc = 0
  private wants = false
  private suspended = false
  private container: HTMLElement | null = null
  private ro: ResizeObserver | null = null
  /** Rolling frame stats for the perf meter. */
  frameMs = 16.7
  width = 1
  height = 1

  attach(container: HTMLElement): void {
    const r = getRenderer()
    this.container = container
    container.appendChild(r.domElement)
    this.ro?.disconnect()
    this.devW = 0
    this.devH = 0
    // The box's size in DEVICE pixels where the browser reports it (#Perf2,
    // `renderer.fitCanvas`): the buffer then matches the screen exactly at any
    // ratio, and a zoom (which changes the ratio and the box) reports anew.
    this.ro = new ResizeObserver((entries) => {
      const d = entries[entries.length - 1]?.devicePixelContentBoxSize?.[0]
      this.devW = d?.inlineSize ?? 0
      this.devH = d?.blockSize ?? 0
      this.resize()
    })
    try { this.ro.observe(container, { box: 'device-pixel-content-box' }) } catch { this.ro.observe(container) }
    this.watchDpr()
    this.resize()
  }

  detach(): void {
    this.ro?.disconnect()
    this.ro = null
    this.dprQuery?.removeEventListener('change', this.onDpr)
    this.dprQuery = null
    const r = getRenderer()
    if (r.domElement.parentElement) r.domElement.parentElement.removeChild(r.domElement)
    this.container = null
  }

  /** Device pixels of the box, from the last resize report (0: not reported). */
  private devW = 0
  private devH = 0
  private dprQuery: MediaQueryList | null = null
  private onDpr = (): void => { this.watchDpr(); this.resize() }
  /** A change of pixel ratio (zoom, another screen) without a resize report:
   *  the query only matches the ratio it was made for, so it is made again. */
  private watchDpr(): void {
    this.dprQuery?.removeEventListener('change', this.onDpr)
    try {
      this.dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`)
      this.dprQuery.addEventListener('change', this.onDpr)
    } catch { this.dprQuery = null }
  }

  resize(): void {
    const el = this.container
    // The box's own fractional size: `clientWidth` rounds to whole CSS pixels,
    // which at a fractional ratio is a fraction of a pixel short or over.
    const box = el?.getBoundingClientRect()
    const w = box ? box.width : window.innerWidth
    const h = box ? box.height : window.innerHeight
    // A zero-size viewport (Playables resize-to-zero, a collapsed iframe)
    // must not produce a NaN projection.
    this.width = Math.max(1, w)
    this.height = Math.max(1, h)
    // A device size that no longer belongs to this box (a report from before a
    // zoom) is not used: the fallback rounds from the CSS size instead.
    const dpr = window.devicePixelRatio || 1
    const exact = this.devW > 0 && Math.abs(this.devW - w * dpr) < 2 && Math.abs(this.devH - h * dpr) < 2
    const dw = exact ? this.devW : 0
    const dh = exact ? this.devH : 0
    if (this.mode) {
      resizeRenderer(this.mode.camera, this.width, this.height, dw, dh)
      this.mode.resize?.(this.width, this.height)
    } else {
      sizeRenderer(this.width, this.height, dw, dh)
    }
  }

  setMode(mode: GameMode | null): void {
    if (this.mode && this.mode !== mode) this.mode.dispose()
    this.mode = mode
    if (mode) {
      this.resize()
      mode.enter?.()
    }
    this.acc = 0
  }

  /** Gameplay wants the loop (a mode is active and not ended). */
  setWanted(on: boolean): void {
    this.wants = on
    this.sync()
  }

  /** Platform / ad / modal gate. */
  setSuspended(on: boolean): void {
    this.suspended = on
    this.sync()
  }

  get running(): boolean {
    return this.raf !== 0
  }

  private sync(): void {
    const run = this.wants && !this.suspended
    if (run && this.raf === 0) {
      this.last = performance.now()
      this.acc = 0
      this.raf = requestAnimationFrame(this.frame)
    } else if (!run && this.raf !== 0) {
      cancelAnimationFrame(this.raf)
      this.raf = 0
      // Draw one last frame so a paused screen is not stale mid-transition.
      this.mode?.render(0, 0)
    }
  }

  /** Render once without advancing (used while suspended / for thumbnails). */
  renderOnce(): void {
    this.mode?.render(0, 0)
  }

  private frame = (now: number): void => {
    this.raf = requestAnimationFrame(this.frame)
    const dtMs = now - this.last
    this.last = now
    this.frameMs = this.frameMs * 0.9 + dtMs * 0.1
    const dt = Math.min(0.1, Math.max(0, dtMs / 1000))
    const mode = this.mode
    if (!mode) return
    // Perf seam (`?perfprobe=1`, see `usePerfProbe.ts`): a const-false no-op in
    // every player's session.
    frameStart(now)
    this.acc += dt
    let n = 0
    phaseStart('step')
    while (this.acc >= STEP && n < MAX_STEPS) {
      mode.update(STEP, n === 0)
      this.acc -= STEP
      n++
    }
    phaseEnd('step')
    if (n === MAX_STEPS) this.acc = 0
    phaseStart('draw')
    mode.render(this.acc / STEP, dt)
    phaseEnd('draw')
    // The effects ladder hears the real interval, not the clamped step: at
    // 2 fps a frame is 0.5 s, not 0.1 (#Perf1, `effectsLadder.ts`).
    stepEffectsLadder(dtMs / 1000)
    notePerfFrame(now)
    frameEnd()
  }
}

export const app = new GameApp()

export const newScene = (): Scene => new Scene()
