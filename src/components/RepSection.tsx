import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { EASE } from '../lib/motion'
import { posterSrc, useVideoCut, videoSrc } from '../lib/media'

/** Coaching cues, timed (seconds) to one rep of a barbell clean and thruster. */
const CUES = [
  { at: 0, title: 'Set your back', body: 'Hips high, chest proud, bar over the middle of your foot.' },
  { at: 0.9, title: 'Push the floor away', body: 'Legs drive first. The bar stays close to your body.' },
  { at: 2.0, title: 'Catch in the front rack', body: 'Elbows up fast and land soft on your heels.' },
  { at: 3.2, title: 'Stay tall in the squat', body: 'Knees track out over your toes, chest stays up.' },
  { at: 5.1, title: 'Drive it overhead', body: 'Use the legs to launch it, finish with the arms.' },
  { at: 6.5, title: 'Lock it out', body: 'Ribs down, biceps by your ears. Rep logged in the app.' },
]

const cueAt = (t: number) => {
  let i = 0
  for (let k = 0; k < CUES.length; k++) if (t >= CUES[k].at) i = k
  return i
}

export function RepSection() {
  const outer = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const clock = useRef<HTMLSpanElement>(null)
  const target = useRef(0)
  const shown = useRef(0)
  const [cue, setCue] = useState(0)
  const reduced = !!useReducedMotion()
  const cut = useVideoCut()

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    target.current = Math.min(Math.max((p - 0.04) / 0.9, 0), 1)
  })

  // Prime the clip once it nears the viewport (iOS only renders seeked frames after a play call).
  useEffect(() => {
    const v = video.current
    if (!v || reduced) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        v.preload = 'auto'
        v.play()
          .then(() => v.pause())
          .catch(() => {})
        io.disconnect()
      },
      { rootMargin: '600px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduced, cut])

  // Only run the scrub loop while the section is near the viewport.
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = outer.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Scrub loop: eases the playhead toward the scroll position each frame.
  useEffect(() => {
    if (reduced || !near) return
    let raf = 0
    const tick = () => {
      const v = video.current
      shown.current += (target.current - shown.current) * 0.18
      if (v && v.duration && v.readyState >= 1) {
        const t = shown.current * (v.duration - 0.05)
        // Phones stutter if seeks pile up, so wait for the previous one to land.
        if (!v.seeking && Math.abs(v.currentTime - t) > 1 / 48) v.currentTime = t
        const i = cueAt(t)
        setCue((c) => (c === i ? c : i))
        if (clock.current) clock.current.textContent = `00:0${t.toFixed(1)}`
      }
      if (bar.current) bar.current.style.transform = `scaleX(${shown.current})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced, near])

  const active = CUES[cue]

  return (
    <section id="coaching" aria-labelledby="rep-title" className="relative scroll-mt-24 bg-ink">
      <div ref={outer} className={reduced ? 'py-16 md:py-24' : 'relative h-[300vh] md:h-[380vh]'}>
        <div className={reduced ? '' : 'sticky top-0 flex h-[100svh] items-center overflow-hidden py-24 md:py-16'}>
          <div className="mx-auto grid h-full w-full max-w-7xl grid-rows-[auto_1fr] gap-6 px-4 md:px-8 lg:grid-cols-[1fr_1.3fr] lg:grid-rows-1 lg:items-center lg:gap-16">
            {/* Copy and cue list */}
            <div>
              <p className="caption-3 font-mono uppercase tracking-widest text-volt">Every rep, coached</p>
              <h2 id="rep-title" className="heading-4 md:heading-2 mt-3 text-white">
                Most gyms sell access. <br />
                <span className="text-muted">We coach the rep.</span>
              </h2>
              <p className="body-3 mt-6 hidden max-w-md text-muted lg:block">
                Scroll to lift. This is what your coach is watching on every working set, and what they will cue you on
                until it is automatic.
              </p>
              <ol className="mt-8 hidden flex-col gap-1 lg:flex">
                {CUES.map((c, i) => (
                  <li
                    key={c.title}
                    className={`flex items-start gap-4 rounded-2xl p-3 transition-[background-color,opacity] duration-500 ease-forge ${
                      i === cue || reduced ? 'bg-white/5 opacity-100' : 'opacity-40'
                    }`}
                  >
                    <span className={`caption-3 mt-1 font-mono ${i <= cue || reduced ? 'text-volt' : 'text-dim'}`}>0{i + 1}</span>
                    <span>
                      <span className="title-3 block text-white">{c.title}</span>
                      <span className="body-6 text-muted">{c.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Footage frame */}
            <div className="relative min-h-0 overflow-hidden rounded-4xl bg-coal lg:aspect-video">
              <video
                ref={video}
                key={cut}
                src={videoSrc('rep', cut)}
                poster={posterSrc('rep', cut)}
                muted
                playsInline
                preload="metadata"
                disablePictureInPicture
                aria-label="An athlete performing a barbell clean and thruster, one rep"
                className="absolute inset-0 size-full object-cover"
              />
              <span className="absolute inset-0 bg-ink/15" aria-hidden="true" />

              {/* HUD */}
              <div className="absolute inset-x-4 top-4 flex items-center justify-between" aria-hidden="true">
                <span className="caption-3 inline-flex items-center gap-2 rounded-full bg-ink/60 px-3 py-1 font-mono uppercase tracking-widest text-white backdrop-blur-md">
                  <span className="size-1.5 rounded-full bg-volt animate-pulse-dot" />
                  Coach view
                </span>
                <span className="caption-3 rounded-full bg-ink/60 px-3 py-1 font-mono text-white backdrop-blur-md">
                  <span ref={clock}>00:00.0</span>
                </span>
              </div>

              {/* Active cue (phones and tablets) */}
              <div className="absolute inset-x-3 bottom-3 lg:hidden">
                <div className="rounded-3xl bg-ink/70 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="caption-3 font-mono uppercase tracking-widest text-volt">
                      Cue 0{cue + 1} / 0{CUES.length}
                    </span>
                    <span className="caption-5 font-mono text-muted">Scroll to lift</span>
                  </div>
                  <div className="mt-2 min-h-16" aria-live="polite">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={active.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: EASE }}
                      >
                        <p className="title-1 text-white">{active.title}</p>
                        <p className="body-6 mt-1 text-muted">{active.body}</p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <span className="mt-4 block h-0.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
                    <span ref={bar} className="block h-full origin-left bg-volt" style={{ transform: 'scaleX(0)' }} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
