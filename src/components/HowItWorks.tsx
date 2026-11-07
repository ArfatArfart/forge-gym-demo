import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { CalendarCheck, Clipboard, TrendUp } from '@phosphor-icons/react'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'
import { EASE } from '../lib/motion'

const STEPS = [
  {
    icon: CalendarCheck,
    title: 'Book a free class',
    body: 'Pick any Foundations or Strength class this week. No card needed. Bring water and flat shoes.',
    meta: '30 seconds',
  },
  {
    icon: Clipboard,
    title: 'Get assessed',
    body: 'A coach spends 30 minutes on how you move, what hurts and what you want to be able to lift.',
    meta: '30 minutes',
  },
  {
    icon: TrendUp,
    title: 'Start your 12 week plan',
    body: 'You leave with a written program, a class schedule that fits your week and your first numbers logged.',
    meta: 'Week 1',
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })

  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeader
          titleId="how-title"
          eyebrow="How it works"
          title="From first visit to first program in three steps"
          lead="No sales pitch and no pressure. You train, we talk, and you decide."
        />

        <ol ref={ref} className="relative mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {/* Progress rail (desktop): fills left to right with a transform */}
          <span className="absolute left-0 right-0 top-[52px] hidden h-px bg-white/10 md:block" aria-hidden="true">
            <motion.span
              className="absolute inset-0 origin-left bg-ember"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : undefined}
              transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
            />
          </span>

          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.12} className="relative h-full rounded-3xl border border-white/10 bg-coal p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="relative z-10 flex size-10 items-center justify-center rounded-full bg-ember text-ink">
                    <s.icon size={20} weight="bold" aria-hidden="true" />
                  </span>
                  <span className="caption-3 font-mono uppercase tracking-widest text-dim">Step 0{i + 1}</span>
                </div>
                <h3 className="heading-5 mt-8 text-white">{s.title}</h3>
                <p className="body-6 mt-2 text-muted">{s.body}</p>
                <p className="caption-4 mt-6 inline-flex rounded-full bg-white/5 px-3 py-1 font-mono text-muted">{s.meta}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
