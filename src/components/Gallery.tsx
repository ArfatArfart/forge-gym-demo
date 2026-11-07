import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { asset } from '../lib/asset'

const SHOTS = [
  {
    src: 'images/floor-deadlift.webp',
    alt: 'An athlete setting up a deadlift with bumper plates on a rubber floor',
    label: 'Platform row',
    detail: '8 lifting platforms with bumper plates',
  },
  {
    src: 'images/floor-racks.webp',
    alt: 'Long racks of dumbbells running down the training floor',
    label: 'Dumbbell wall',
    detail: 'Pairs from 2.5 kg to 50 kg',
  },
  {
    src: 'images/floor-grip.webp',
    alt: 'Close up of a hand gripping a loaded barbell before a lift',
    label: 'Barbell club',
    detail: 'Competition bars and calibrated plates',
  },
  {
    src: 'images/floor-dumbbells.webp',
    alt: 'A member lifting a dumbbell off the rack',
    label: 'Open gym',
    detail: 'Every rack free from 5:30 am',
  },
]

function Intro() {
  return (
    <div className="flex w-[78vw] shrink-0 flex-col justify-end pb-2 sm:w-[46vw] lg:w-[30vw]">
      <p className="caption-3 font-mono uppercase tracking-widest text-ember">Inside the club</p>
      <h2 id="floor-title" className="heading-4 md:heading-2 mt-4 text-white">
        6,500 square feet of iron, turf and rubber
      </h2>
      <p className="body-6 md:body-3 mt-4 max-w-sm text-muted">
        One room, no cardio theatre. Everything is built around the barbell and the 25 meter turf lane.
      </p>
    </div>
  )
}

function Shot({ s, i }: { s: (typeof SHOTS)[number]; i: number }) {
  return (
    <figure className="group relative aspect-[4/3] w-[78vw] shrink-0 overflow-hidden rounded-3xl bg-coal sm:w-[56vw] lg:w-[40vw]">
      <img
        src={asset(s.src)}
        alt={s.alt}
        loading="lazy"
        className="absolute inset-0 size-full object-cover grayscale transition-transform duration-700 ease-forge group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-ink/25" aria-hidden="true" />
      {/* Caption chip: card radius 24 with a 16px inset gives the chip 8 (B3). */}
      <figcaption className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-lg bg-ink/70 px-4 py-3 backdrop-blur-md">
        <span>
          <span className="title-3 block text-white">{s.label}</span>
          <span className="caption-2 text-muted">{s.detail}</span>
        </span>
        <span className="caption-3 font-mono text-dim">0{i + 1}</span>
      </figcaption>
    </figure>
  )
}

export function Gallery() {
  const reduced = !!useReducedMotion()
  const outer = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)
  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, (v) => -v * distance)

  useLayoutEffect(() => {
    const el = track.current
    if (!el) return
    const measure = () => setDistance(Math.max(el.scrollWidth - window.innerWidth, 0))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  if (reduced) {
    return (
      <section aria-labelledby="floor-title" className="bg-ink py-16 md:py-24">
        <div ref={track} className="flex gap-4 overflow-x-auto px-4 pb-4 md:gap-6 md:px-8">
          <Intro />
          {SHOTS.map((s, i) => (
            <Shot key={s.src} s={s} i={i} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="floor-title" className="bg-ink">
      <div ref={outer} className="relative h-[320vh]">
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
          <motion.div ref={track} style={{ x }} className="flex items-end gap-4 px-4 will-change-transform md:gap-6 md:px-8">
            <Intro />
            {SHOTS.map((s, i) => (
              <Shot key={s.src} s={s} i={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
