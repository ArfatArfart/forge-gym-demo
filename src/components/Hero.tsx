import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Star } from '@phosphor-icons/react'
import { Button } from './ui/Button'
import { EASE } from '../lib/motion'
import { GYM, coachName, formatTime, nextClass, spotsLabel } from '../lib/data'

const HeroScene = lazy(() => import('../scene/HeroScene'))

const LINES = ['Lift heavier', 'in 12 weeks,', 'fully coached.']

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = !!useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const [active, setActive] = useState(true)
  const [ready, setReady] = useState(false)
  const [webgl] = useState(hasWebGL)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  })

  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" className="relative min-h-[100svh] overflow-hidden bg-ink">
      {/* 3D stage */}
      <div className="absolute inset-0" aria-hidden="true">
        {!ready && webgl && (
          <div className="absolute left-1/2 top-[22%] size-40 -translate-x-1/2 rounded-full bg-coal animate-skeleton md:left-auto md:right-[16%] md:top-1/2 md:size-80 md:-translate-x-0 md:-translate-y-1/2" />
        )}
        {webgl && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 1.2, ease: EASE }}
          >
            <SceneBoundary>
              <Suspense fallback={null}>
                <HeroScene progress={scrollYProgress} active={active} reduced={reduced} onReady={() => setReady(true)} />
              </Suspense>
            </SceneBoundary>
          </motion.div>
        )}
      </div>

      <motion.div
        style={{ y: reduced ? 0 : contentY, opacity: contentOpacity }}
        className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-end px-4 pb-16 pt-32 md:px-8 md:pb-24 lg:justify-center lg:pb-24"
      >
        <div className="pointer-events-auto">
          <motion.p {...enter(0.3)} className="caption-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono uppercase tracking-widest text-muted backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-ember animate-pulse-dot" aria-hidden="true" />
            <span className="hidden sm:inline">Strength and conditioning · </span>Eastside Portland
          </motion.p>

          <h1 id="hero-title" className="heading-3 sm:heading-2 lg:heading-1 mt-6 max-w-[680px]">
            {LINES.map((line, i) => (
              <span key={line} className="-mb-2 block overflow-hidden pb-2">
                <motion.span
                  className="text-hero inline-block"
                  initial={{ y: '105%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.45 + i * 0.12 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p {...enter(0.9)} className="body-3 sm:body-7 mt-6 max-w-[680px] text-muted lg:max-w-[520px]">
            Forge is a strength and conditioning gym where every class is capped at 10 athletes, programmed in
            12 week blocks and run by a certified coach. Your first class is free.
          </motion.p>

          <motion.div {...enter(1.05)} className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Button href="#book" arrow>
              Book your free trial class
            </Button>
            <div className="flex items-center gap-2">
              <span className="flex gap-0.5 text-ember" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} weight="fill" />
                ))}
              </span>
              <span className="caption-1 text-muted">
                <span className="font-mono text-white">{GYM.rating}</span> from {GYM.reviews} Google reviews
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <NextClassCard />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 1.6 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        aria-hidden="true"
      >
        <span className="caption-5 font-mono uppercase tracking-widest text-dim">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-ember"
            animate={reduced ? undefined : { y: [-16, 40] }}
            transition={{ duration: 1.8, ease: EASE, repeat: Infinity, repeatDelay: 0.4 }}
          />
        </span>
      </motion.div>
    </section>
  )
}

function NextClassCard() {
  const next = nextClass()
  if (!next) return null
  return (
    <motion.a
      href="#schedule"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 1.4 }}
      className="group absolute bottom-24 right-8 z-10 hidden w-64 rounded-2xl border border-white/10 bg-coal/60 p-4 backdrop-blur-xl transition-colors duration-300 ease-forge hover:bg-coal/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember xl:block"
    >
      <span className="caption-4 flex items-center justify-between font-mono uppercase tracking-widest text-muted">
        Next class
        <span className="flex items-center gap-2 text-ember">
          <span className="size-1.5 rounded-full bg-ember animate-pulse-dot" aria-hidden="true" />
          {next.when}
        </span>
      </span>
      <span className="title-2 mt-2 block text-white">
        {next.cls.name} <span className="font-mono text-muted">{formatTime(next.cls.time)}</span>
      </span>
      <span className="caption-2 mt-1 block text-muted">
        Coach {coachName(next.cls.coach)} · {spotsLabel(next.cls.spots)}
      </span>
    </motion.a>
  )
}
