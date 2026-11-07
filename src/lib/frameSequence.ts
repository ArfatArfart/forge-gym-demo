/**
 * Scroll scrubbed image sequence for phones.
 *
 * Seeking a <video> on every scroll tick is unreliable on iPhone: frames arrive late, pile up,
 * or never paint in Low Power Mode. Decoded stills drawn to a canvas are instant on every
 * browser. Frames load coarse to fine (every 8th, 4th, 2nd, then all), so scrubbing works
 * almost immediately and gains detail as the rest arrive. Neighbouring frames are
 * crossfaded, which keeps a 12 fps sequence looking fluid.
 */
export class FrameSequence {
  private frames: (HTMLImageElement | null)[]
  private started = false
  private disposed = false
  private ctx: CanvasRenderingContext2D | null = null
  private lastKey = ''
  /** Bumped whenever a new frame finishes decoding, so the next draw picks it up. */
  private version = 0

  constructor(
    readonly count: number,
    private url: (i: number) => string,
    /** Load every nth frame only (data saver). */
    private stride = 1,
  ) {
    this.frames = new Array(count).fill(null)
  }

  load() {
    if (this.started) return
    this.started = true
    // First and last frame up front, so both ends of the scroll have a picture straight away.
    const order: number[] = [0, this.count - 1]
    const seen = new Set<number>(order)
    for (const step of [8, 4, 2, 1]) {
      if (step < this.stride) break
      for (let i = 0; i < this.count; i += step) {
        if (i % this.stride || seen.has(i)) continue
        seen.add(i)
        order.push(i)
      }
    }
    // A few requests in flight at a time keeps the coarse pass first in line.
    let next = 0
    const pump = () => {
      if (this.disposed || next >= order.length) return
      const i = order[next++]
      const img = new Image()
      img.decoding = 'async'
      img.src = this.url(i)
      img
        .decode()
        .then(() => {
          if (this.disposed) return
          this.frames[i] = img
          this.version++
        })
        .catch(() => {})
        .finally(pump)
    }
    for (let k = 0; k < 4; k++) pump()
  }

  private nearest(i: number, dir: 1 | -1) {
    for (let k = i; k >= 0 && k < this.count; k += dir) if (this.frames[k]) return k
    return -1
  }

  /** Draws position p (0 to 1) into the canvas with object-fit: cover. Returns false until a frame is ready. */
  draw(canvas: HTMLCanvasElement, p: number) {
    const f = Math.min(Math.max(p, 0), 1) * (this.count - 1)
    let a = this.nearest(Math.floor(f), -1)
    let b = this.nearest(Math.ceil(f), 1)
    if (a < 0) a = b
    if (b < 0) b = a
    if (a < 0) return false
    const t = a === b ? 0 : (f - a) / (b - a)
    const key = `${a}:${b}:${t.toFixed(3)}:${canvas.width}x${canvas.height}:${this.version}`
    if (key === this.lastKey) return true
    this.lastKey = key

    if (!this.ctx || this.ctx.canvas !== canvas) this.ctx = canvas.getContext('2d', { alpha: false })
    const ctx = this.ctx
    if (!ctx) return false
    const paint = (img: HTMLImageElement, alpha: number) => {
      const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
      const w = img.naturalWidth * s
      const h = img.naturalHeight * s
      ctx.globalAlpha = alpha
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
    }
    paint(this.frames[a]!, 1)
    if (t > 0.01) paint(this.frames[b]!, t)
    ctx.globalAlpha = 1
    return true
  }

  dispose() {
    this.disposed = true
    this.frames.fill(null)
  }
}
