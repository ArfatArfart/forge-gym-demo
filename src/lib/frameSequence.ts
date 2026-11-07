/**
 * Scroll scrubbed image sequence for phones.
 *
 * Seeking a <video> on every scroll tick is unreliable on iPhone: frames arrive late, pile up,
 * or never paint in Low Power Mode. Stills drawn to a canvas are instant on every browser,
 * provided they are already decoded: a plain <img> drawn to a canvas is decoded again on the
 * main thread at every draw, which is what makes naive versions stutter.
 *
 * So frames are fetched once as compressed blobs (about 2 MB for the whole rep), then decoded off
 * the main thread into ImageBitmaps for a rolling window around the playhead plus a few anchors
 * spread across the clip. Memory stays near 60 MB instead of the ~180 MB that decoding every
 * frame would take, and a draw never decodes. Frames load coarse to fine (every 8th, 4th, 2nd,
 * then all) so scrubbing works almost immediately, and neighbouring frames are crossfaded so a
 * 12 fps sequence looks fluid.
 */

type Frame = ImageBitmap | HTMLImageElement

const WINDOW = 10 // decoded frames kept on each side of the playhead
const ANCHOR = 8 // every nth frame stays decoded for fast flicks
const DECODERS = 2

const frameSize = (f: Frame) => (f instanceof HTMLImageElement ? [f.naturalWidth, f.naturalHeight] : [f.width, f.height])

export class FrameSequence {
  private blobs: (Blob | null)[]
  private decoded = new Map<number, Frame>()
  private decoding = new Set<number>()
  private started = false
  private disposed = false
  private ctx: CanvasRenderingContext2D | null = null
  private lastKey = ''
  private center = 0
  private readonly bitmaps = typeof createImageBitmap === 'function'

  constructor(
    readonly count: number,
    private url: (i: number) => string,
    /** Load every nth frame only (data saver). */
    private stride = 1,
  ) {
    this.blobs = new Array(count).fill(null)
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
    let next = 0
    const pump = () => {
      if (this.disposed || next >= order.length) return
      const i = order[next++]
      fetch(this.url(i))
        .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
        .then((b) => {
          if (this.disposed) return
          this.blobs[i] = b
          this.schedule()
        })
        .catch(() => {})
        .finally(pump)
    }
    for (let k = 0; k < 4; k++) pump()
  }

  private wanted(i: number) {
    return Math.abs(i - this.center) <= WINDOW || i % ANCHOR === 0 || i === this.count - 1
  }

  /** Decode what the playhead needs next, nearest first, and free what it has left behind. */
  private schedule() {
    if (this.disposed) return
    if (this.bitmaps) {
      for (const [i, f] of this.decoded) {
        if (!this.wanted(i)) {
          ;(f as ImageBitmap).close?.()
          this.decoded.delete(i)
        }
      }
    }
    const todo: number[] = []
    for (let i = 0; i < this.count; i++) {
      if (this.blobs[i] && !this.decoded.has(i) && !this.decoding.has(i) && this.wanted(i)) todo.push(i)
    }
    todo.sort((a, b) => Math.abs(a - this.center) - Math.abs(b - this.center))
    for (const i of todo) {
      if (this.decoding.size >= DECODERS) break
      this.decode(i)
    }
  }

  private decode(i: number) {
    const blob = this.blobs[i]
    if (!blob) return
    this.decoding.add(i)
    const work: Promise<Frame> = this.bitmaps
      ? createImageBitmap(blob)
      : new Promise((res, rej) => {
          // Older Safari: a decoded <img> is the best available, and is never evicted.
          const img = new Image()
          img.src = URL.createObjectURL(blob)
          img.decode().then(() => res(img), rej)
        })
    work
      .then((f) => {
        if (this.disposed || (this.bitmaps && !this.wanted(i))) {
          ;(f as ImageBitmap).close?.()
          return
        }
        this.decoded.set(i, f)
      })
      .catch(() => {})
      .finally(() => {
        this.decoding.delete(i)
        this.schedule()
      })
  }

  private nearest(i: number, dir: 1 | -1) {
    for (let k = i; k >= 0 && k < this.count; k += dir) if (this.decoded.has(k)) return k
    return -1
  }

  /** Draws position p (0 to 1) into the canvas with object-fit: cover. Returns false until a frame is ready. */
  draw(canvas: HTMLCanvasElement, p: number) {
    const f = Math.min(Math.max(p, 0), 1) * (this.count - 1)
    const c = Math.round(f)
    if (c !== this.center) {
      this.center = c
      this.schedule()
    }
    let a = this.nearest(Math.floor(f), -1)
    let b = this.nearest(Math.ceil(f), 1)
    if (a < 0) a = b
    if (b < 0) b = a
    if (a < 0) return false
    // Quarter steps between neighbouring frames read as smooth motion and keep redraws rare:
    // at most four blends per source frame, and nothing at all while the scroll is still.
    let t = a === b ? 0 : Math.round(((f - a) / (b - a)) * 4) / 4
    if (t >= 1) {
      a = b
      t = 0
    }
    const key = `${a}:${b}:${t}:${canvas.width}x${canvas.height}`
    if (key === this.lastKey) return true
    this.lastKey = key

    if (!this.ctx || this.ctx.canvas !== canvas) this.ctx = canvas.getContext('2d', { alpha: false })
    const ctx = this.ctx
    if (!ctx) return false
    const paint = (img: Frame, alpha: number) => {
      const [iw, ih] = frameSize(img)
      const s = Math.max(canvas.width / iw, canvas.height / ih)
      const w = iw * s
      const h = ih * s
      ctx.globalAlpha = alpha
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
    }
    paint(this.decoded.get(a)!, 1)
    if (t > 0) paint(this.decoded.get(b)!, t)
    ctx.globalAlpha = 1
    return true
  }

  dispose() {
    this.disposed = true
    for (const f of this.decoded.values()) (f as ImageBitmap).close?.()
    this.decoded.clear()
    this.blobs.fill(null)
  }
}
