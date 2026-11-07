import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, type MotionValue } from 'motion/react'
import { Wordmark } from './ui/Logo'
import { EASE } from '../lib/motion'
import { PROGRAMS } from '../lib/data'
import { asset } from '../lib/asset'
import { prefersSaveData, posterSrc, videoSrc } from '../lib/media'
import { HeroRenderer, webglAvailable, type Cut, type WordLayout } from '../lib/heroGL'

type Props = {
  index: number
  running: boolean
  motionOk: boolean
  cut: Cut
  scale: MotionValue<number> | number
  onWord: (box: WordLayout | null) => void
}

const heroVideo = (name: string, cut: Cut) => asset(`video/hero-${name}-${cut}.mp4`)
export const heroPoster = (name: string, cut: Cut) => asset(`video/hero-${name}-${cut}.jpg`)

const FADE_MS = 900

export function HeroMedia(props: Props) {
  const [mode] = useState<'gl' | 'dom'>(() => (!prefersSaveData() && webglAvailable() ? 'gl' : 'dom'))
  const [failed, setFailed] = useState(false)
  const onFail = useCallback(() => setFailed(true), [])
  if (mode === 'gl' && !failed) return <GLMedia {...props} onFail={onFail} />
  return <DomMedia {...props} />
}

/* ───────────── WebGL: footage, 3D wordmark, athlete in front ───────────── */

function GLMedia({ index, running, motionOk, cut, scale, onWord, onFail }: Props & { onFail: () => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const renderer = useRef<HeroRenderer | null>(null)
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const indexRef = useRef(index)
  const prev = useRef(index)
  const fade = useRef({ from: -1, start: 0 })
  const [ready, setReady] = useState(false)
  const readyRef = useRef(false)

  const draw = useCallback(() => {
    const r = renderer.current
    const b = vids.current[indexRef.current]
    if (!r || !b) return false
    const f = fade.current
    const k = f.from < 0 ? 1 : Math.min((performance.now() - f.start) / FADE_MS, 1)
    const e = 1 - Math.pow(1 - k, 4)
    const a = f.from >= 0 && k < 1 ? vids.current[f.from] : null
    r.render(b, a, e, 1 + 0.08 * (1 - e))
    if (!readyRef.current && b.readyState >= 2) {
      readyRef.current = true
      setReady(true)
    }
    return k < 1
  }, [])

  // Renderer lifetime: created once per canvas.
  const failRef = useRef(onFail)
  failRef.current = onFail
  useLayoutEffect(() => {
    try {
      renderer.current = new HeroRenderer(canvas.current!)
    } catch (err) {
      console.warn('Hero WebGL unavailable, using fallback', err)
      failRef.current()
    }
    return () => {
      renderer.current?.dispose()
      renderer.current = null
    }
  }, [])

  // Size, wordmark and cover mapping. Redrawn once Manrope has loaded so the letters are exact.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    let alive = true
    const resize = () => {
      const r = renderer.current
      if (!r || !alive || !el.clientWidth) return
      onWord(r.resize(el.clientWidth, el.clientHeight, cut))
      draw()
    }
    resize()
    document.fonts?.load('700 100px Manrope').then(resize).catch(() => {})
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [cut, draw, onWord])

  // Program switch: start a crossfade, restart the incoming clip, warm the next one.
  useEffect(() => {
    indexRef.current = index
    if (prev.current !== index) {
      fade.current = { from: prev.current, start: performance.now() }
      prev.current = index
    }
    vids.current.forEach((v, i) => {
      if (!v) return
      if (i === index) {
        v.preload = 'auto'
        try {
          v.currentTime = 0
        } catch {
          /* metadata not loaded yet */
        }
      } else v.pause()
    })
    const next = vids.current[(index + 1) % PROGRAMS.length]
    if (next && motionOk) next.preload = 'auto'
  }, [index, cut, motionOk])

  useEffect(() => {
    const v = vids.current[index]
    if (!v) return
    if (running) v.play().catch(() => {})
    else v.pause()
  }, [running, index, cut])

  // Draw loop while playing or fading; otherwise draw on demand.
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const fading = draw()
      if (running || fading) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running, index, cut, draw])

  return (
    <motion.div ref={wrap} style={{ scale }} className="absolute inset-0" aria-hidden="true">
      {/* Placeholder until the first composited frame is ready */}
      <img
        src={heroPoster(PROGRAMS[0].video, cut)}
        alt=""
        className={`absolute inset-0 size-full object-cover brightness-[0.6] transition-opacity duration-700 ease-forge ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      <canvas
        ref={canvas}
        className={`absolute inset-0 size-full transition-opacity duration-700 ease-forge ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Decoders for the packed clips. Kept in the DOM (not display:none) so mobile browsers keep decoding. */}
      {PROGRAMS.map((p, i) => (
        <video
          key={`${p.id}-${cut}`}
          ref={(el) => {
            vids.current[i] = el
          }}
          src={heroVideo(p.video, cut)}
          muted
          playsInline
          preload={i === 0 ? 'auto' : 'none'}
          disablePictureInPicture
          onLoadedData={() => draw()}
          onSeeked={() => draw()}
          className="pointer-events-none absolute left-0 top-0 size-px opacity-0"
        />
      ))}
    </motion.div>
  )
}

/* ───────────── Fallback: plain video crossfade with the flat wordmark ───────────── */

function DomMedia({ index, running, motionOk, cut, scale, onWord }: Props) {
  const vids = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    onWord(null)
  }, [onWord])

  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return
      if (i === index) {
        try {
          v.currentTime = 0
        } catch {
          /* not loaded yet */
        }
        if (running) v.play().catch(() => {})
        else v.pause()
      } else v.pause()
    })
  }, [index, running, cut])

  return (
    <>
      <motion.div style={{ scale }} className="absolute inset-0" aria-hidden="true">
        {PROGRAMS.map((p, i) => (
          <video
            key={`${p.id}-${cut}`}
            ref={(el) => {
              vids.current[i] = el
            }}
            src={motionOk ? videoSrc(p.video, cut) : undefined}
            poster={posterSrc(p.video, cut)}
            muted
            playsInline
            preload={i === 0 ? 'auto' : 'none'}
            disablePictureInPicture
            className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-1000 ease-forge ${
              i === index ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
            }`}
          />
        ))}
        <span className="absolute inset-0 bg-ink/45" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
        className="pointer-events-none absolute inset-x-4 top-28 text-white mix-blend-difference md:inset-x-8 md:top-24"
        aria-hidden="true"
      >
        <Wordmark className="block h-auto w-full" />
      </motion.div>
    </>
  )
}
