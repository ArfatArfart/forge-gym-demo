import { useRef } from 'react'
import { motion, useInView, useReducedMotion, useScroll } from 'motion/react'
import { CalendarCheck, ChartLineUp, Clipboard } from '@phosphor-icons/react'
import { Reveal } from './ui/Reveal'
import { Button } from './ui/Button'
import { EASE } from '../lib/motion'

const STEPS = [
  {
    icon: CalendarCheck,
    title: 'Book a free class',
    body: 'Pick any Foundations or Strength class this week. No card needed. Bring water and flat shoes.',
    meta: 'Takes 30 seconds',
  },
  {
    icon: Clipboard,
    title: 'Get assessed',
    body: 'A coach spends 30 minutes on how you move, what hurts and what you want to be able to lift.',
    meta: '30 minutes, free',
  },
  {
    icon: ChartLineUp,
    title: 'Watch your numbers move',
    body: 'You leave with a 12 week plan. Every set goes in the Forge app and your coach reviews it weekly.',
    meta: 'Week 1 onwards',
  },
]

/* A member's deadlift one rep max over seven months. */
const LIFT = [102.5, 110, 117.5, 115, 125, 132.5, 137.5]

function LiftChart() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const w = 320
  const h = 96
  const pts = LIFT.map((v, i) => [(i / (LIFT.length - 1)) * w, h - ((v - 95) / 50) * h] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  return (
    <div ref={ref} className="mt-4 rounded-2xl border border-white/10 bg-coal p-4 md:mt-6 md:border-0 md:bg-ink" aria-label="Example: deadlift up from 102.5 kg to 137.5 kg in seven months" role="img">
      <div className="flex items-baseline justify-between">
        <span className="caption-4 font-mono uppercase tracking-widest text-dim">Deadlift 1RM · Priya R.</span>
        <span className="title-3 font-mono text-volt">+35 kg</span>
      </div>
      <div className="relative mt-4 overflow-hidden">
        <svg viewBox={`-6 -8 ${w + 12} ${h + 16}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
          <path d={line} fill="none" stroke="#d4ff3a" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? '#d4ff3a' : '#000'} stroke="#d4ff3a" strokeWidth={2} />
          ))}
        </svg>
        {/* Cover slides away (transform only) to draw the line left to right */}
        <motion.span
          className="absolute inset-0 origin-right bg-ink"
          initial={{ scaleX: 1 }}
          animate={inView ? { scaleX: 0 } : undefined}
          transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
        />
      </div>
      <div className="caption-5 mt-2 flex justify-between font-mono text-dim">
        <span>102.5 kg</span>
        <span>7 months</span>
        <span className="text-white">137.5 kg</span>
      </div>
    </div>
  )
}

export function HowItWorks() {
  const list = useRef<HTMLOListElement>(null)
  const reduced = !!useReducedMotion()
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 75%', 'end 60%'] })

  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 md:gap-12 md:px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <p className="caption-3 font-mono uppercase tracking-widest text-volt">How it works</p>
          <h2 id="how-title" className="heading-4 md:heading-2 mt-4 text-white">
            Three steps from <br className="hidden md:block" />
            stranger to member
          </h2>
          <p className="body-3 md:body-7 mt-3 max-w-md text-muted md:mt-6">No sales pitch and no pressure. You train, we talk, and you decide.</p>
          <Button href="#book" arrow className="mt-8 hidden lg:inline-flex">
            Book your free trial class
          </Button>
        </Reveal>

        <ol ref={list} className="relative flex flex-col gap-6 md:gap-4">
          {/* Progress rail: fills top to bottom with scroll (transform only) */}
          <span className="absolute bottom-6 left-5 top-6 w-px bg-white/10 md:bottom-8 md:left-8 md:top-8" aria-hidden="true">
            <motion.span style={{ scaleY: reduced ? 1 : scrollYProgress }} className="absolute inset-0 origin-top bg-volt" />
          </span>
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <Reveal delay={i * 0.08} className="flex gap-3 md:gap-6">
                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-volt text-ink md:size-16">
                  <s.icon size={20} weight="bold" aria-hidden="true" />
                </span>
                {/* Phones: open rows on the timeline. Larger screens: one card per step. */}
                <div className="min-w-0 flex-1 pt-1 md:rounded-3xl md:border md:border-white/10 md:bg-coal md:p-6 md:pt-6">
                  <div className="flex items-center justify-between gap-3 md:gap-4">
                    <span className="caption-3 font-mono uppercase tracking-widest text-dim">Step 0{i + 1}</span>
                    <span className="caption-4 rounded-full bg-white/5 px-2 py-0.5 font-mono text-muted md:px-3 md:py-1">{s.meta}</span>
                  </div>
                  <h3 className="title-1 md:heading-5 mt-2 text-white md:mt-4">{s.title}</h3>
                  <p className="body-6 mt-1 text-muted md:mt-2">{s.body}</p>
                  {i === STEPS.length - 1 && <LiftChart />}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
