import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Pause, Play, Star } from '@phosphor-icons/react'
import { Button } from './ui/Button'
import { Wordmark } from './ui/Logo'
import { EASE } from '../lib/motion'
import { GYM, PROGRAMS, formatTime, nextClass, spotsLabel } from '../lib/data'
import { posterSrc, prefersSaveData, useVideoCut, videoSrc } from '../lib/media'

const SLIDE_MS = 7000 // each clip is exactly 7 seconds
const LINES = ['Get stronger', 'in 12 weeks,', 'fully coached.']

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = !!useReducedMotion()
  const cut = useVideoCut()
  const [saveData] = useState(prefersSaveData)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const elapsed = useRef(0)
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const motionOk = !reduced && !saveData
  const running = motionOk && !paused && visible

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  const go = useCallback((i: number) => {
    elapsed.current = 0
    setIndex((i + PROGRAMS.length) % PROGRAMS.length)
  }, [])

  // Pause everything while the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    const onVis = () => setVisible(document.visibilityState === 'visible' && el.getBoundingClientRect().bottom > 0)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // Restart the active clip on every switch and warm up the next one.
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return
      if (i === index) {
        try {
          v.currentTime = 0
        } catch {
          /* not loaded yet */
        }
      } else v.pause()
    })
    const next = videos.current[(index + 1) % PROGRAMS.length]
    if (next && motionOk) next.preload = 'auto'
  }, [index, cut, motionOk])

  useEffect(() => {
    const v = videos.current[index]
    if (!v || !motionOk) return
    if (running) v.play().catch(() => {})
    else v.pause()
  }, [running, index, cut, motionOk])

  // Story timer: drives the progress bar directly (no re-render per frame) and advances on completion.
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      elapsed.current += now - last
      last = now
      const p = Math.min(elapsed.current / SLIDE_MS, 1)
      const bar = bars.current[index]
      if (bar) bar.style.transform = `scaleX(${p})`
      if (p >= 1) go(index + 1)
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, index, go])

  const onPointerDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1))
  }

  const program = PROGRAMS[index]
  const barScale = (i: number) => (i < index ? 1 : i > index ? 0 : motionOk ? elapsed.current / SLIDE_MS : 1)

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  })

  return (
    <section
      ref={ref}
      id="top"
      aria-labelledby="hero-title"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
      className="relative h-[100svh] min-h-[640px] touch-pan-y overflow-hidden bg-ink select-none"
    >
      {/* Footage: all clips stacked, the active one fades and settles in */}
      <motion.div style={{ scale: reduced ? 1 : mediaScale }} className="absolute inset-0" aria-hidden="true">
        {PROGRAMS.map((p, i) => (
          <video
            key={`${p.id}-${cut}`}
            ref={(el) => {
              videos.current[i] = el
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

      {/* Giant wordmark over the footage */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
        className="pointer-events-none absolute inset-x-4 top-28 text-white mix-blend-difference md:inset-x-8 md:top-24"
        aria-hidden="true"
      >
        <Wordmark className="block h-auto w-full" />
      </motion.div>

      <NextClassChip className="absolute left-4 top-[calc(7.5rem+20vw)] inline-flex max-w-[calc(100%-2rem)] md:left-8 lg:hidden" />

      {/* Copy and controls */}
      <motion.div
        style={{ y: reduced ? 0 : contentY, opacity: contentOpacity }}
        className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-7xl px-4 pb-6 md:px-8 md:pb-12"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[680px]">
            <NextClassChip className="mb-6 hidden lg:inline-flex" />
            <div className="h-4 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={program.id}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="caption-3 font-mono uppercase tracking-widest text-volt"
                >
                  0{index + 1} / 0{PROGRAMS.length} · {program.name} · {program.duration}
                </motion.p>
              </AnimatePresence>
            </div>

            <h1 id="hero-title" className="heading-3 sm:heading-2 lg:heading-1 mt-3">
              {LINES.map((line, i) => (
                <span key={line} className="-mb-4 block overflow-hidden pb-4">
                  <motion.span
                    className="text-hero inline-block"
                    initial={{ y: '105%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.35 + i * 0.1 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p {...enter(0.8)} className="body-6 sm:body-3 lg:body-7 mt-4 max-w-md text-white/80 lg:max-w-lg">
              Small group strength and conditioning in Eastside Portland. Every class capped at 10 and run by a certified
              coach.
            </motion.p>

            <motion.div {...enter(0.95)} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Button href="#book" arrow className="w-full sm:w-auto">
                Book your free trial class
              </Button>
              <span className="flex items-center justify-center gap-2 sm:justify-start">
                <span className="flex gap-0.5 text-volt" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} weight="fill" />
                  ))}
                </span>
                <span className="caption-1 text-white/80">
                  <span className="font-mono text-white">{GYM.rating}</span> from {GYM.reviews} Google reviews
                </span>
              </span>
            </motion.div>
          </div>

          {/* Program switcher: story bars on phones, a playlist on desktop */}
          <motion.div {...enter(1.1)} className="flex items-end gap-2 lg:w-80 lg:flex-col lg:items-stretch">
            <div role="tablist" aria-label="Programs" className="flex min-w-0 flex-1 gap-2 lg:flex-col lg:gap-1">
              {PROGRAMS.map((p, i) => {
                const active = i === index
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`${p.name}, ${p.duration}, ${p.level}`}
                    onClick={() => go(i)}
                    className={`group flex min-h-11 min-w-0 flex-col justify-end gap-2 rounded-xl text-left transition-colors duration-300 ease-forge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt lg:flex-none lg:flex-row lg:items-center lg:gap-3 lg:rounded-2xl lg:p-2 ${
                      active ? 'flex-[2.4] lg:bg-white/10 lg:backdrop-blur-md' : 'flex-1 lg:hover:bg-white/5'
                    }`}
                  >
                    <img
                      src={posterSrc(p.video, 'wide')}
                      alt=""
                      className="hidden h-10 w-16 shrink-0 rounded-lg object-cover lg:block"
                      loading="lazy"
                    />
                    <span className="flex w-full flex-col gap-2 lg:order-none">
                      <span className={`caption-3 order-2 truncate lg:order-none lg:title-4 ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                        <span className={`lg:hidden ${active ? '' : 'font-mono'}`}>{active ? p.name : `0${i + 1}`}</span>
                        <span className="hidden lg:inline">{p.name}</span>
                      </span>
                      <span className="relative order-1 block h-0.5 w-full overflow-hidden rounded-full bg-white/20 lg:order-none">
                        <span
                          ref={(el) => {
                            bars.current[i] = el
                          }}
                          className="absolute inset-0 origin-left bg-volt"
                          style={{ transform: `scaleX(${barScale(i)})` }}
                        />
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            {motionOk && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? 'Play program videos' : 'Pause program videos'}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors duration-300 ease-forge hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt lg:hidden"
              >
                {paused ? <Play size={16} weight="fill" /> : <Pause size={16} weight="fill" />}
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

function NextClassChip({ className = '' }: { className?: string }) {
  const next = nextClass()
  if (!next) return null
  const when = next.when === 'Today' || next.when === 'Tomorrow' ? next.when.toLowerCase() : next.when
  return (
    <motion.a
      href="#schedule"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 1.2 }}
      className={`z-10 max-w-full items-center gap-2 rounded-full border border-white/15 bg-ink/40 py-2 pl-3 pr-4 backdrop-blur-md transition-colors duration-300 ease-forge hover:bg-ink/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${className}`}
    >
      <span className="size-2 shrink-0 rounded-full bg-volt animate-pulse-dot" aria-hidden="true" />
      <span className="caption-1 truncate text-white">
        Next class · {next.cls.name} {when} {formatTime(next.cls.time)}
        <span className="text-white/60"> · {spotsLabel(next.cls.spots)}</span>
      </span>
    </motion.a>
  )
}
