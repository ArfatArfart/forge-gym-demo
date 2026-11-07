import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { ArrowRight } from '@phosphor-icons/react'
import { SectionHeader } from './ui/SectionHeader'
import { LoopVideo } from './ui/LoopVideo'
import { PROGRAMS, coachName, type Program } from '../lib/data'

export function Programs() {
  const stack = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()
  const { scrollYProgress } = useScroll({ target: stack, offset: ['start start', 'end end'] })
  // Only the card on top of the stack plays its footage.
  const [front, setFront] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = Math.min(PROGRAMS.length - 1, Math.max(0, Math.floor(p * PROGRAMS.length)))
    setFront((f) => (f === i ? f : i))
  })

  return (
    <section id="programs" aria-labelledby="programs-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeader
          titleId="programs-title"
          eyebrow="Programs"
          title={
            <>
              Four ways in. <br />
              <span className="text-muted">One goal: stronger.</span>
            </>
          }
          lead="Every program runs on the same 12 week blocks, so you can mix them freely. Your coach tells you which ones fit your goal."
        />

        <div ref={stack} className="mt-12 flex flex-col gap-6 md:mt-16">
          {PROGRAMS.map((p, i) => (
            <ProgramCard key={p.id} p={p} i={i} progress={scrollYProgress} reduced={reduced} front={front === i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Intensity({ value }: { value: number }) {
  return (
    <span className="flex items-end gap-0.5" aria-label={`Intensity ${value} out of 5`} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`w-1 rounded-full ${i < value ? 'bg-volt' : 'bg-white/15'}`} style={{ height: `${8 + i * 3}px` }} />
      ))}
    </span>
  )
}

function ProgramCard({ p, i, progress, reduced, front }: { p: Program; i: number; progress: MotionValue<number>; reduced: boolean; front: boolean }) {
  const n = PROGRAMS.length
  // Cards behind the newest one shrink a little, which gives the stack its depth.
  const scale = useTransform(progress, [i / n, 1], [1, 1 - (n - 1 - i) * 0.04])

  return (
    <div className="sticky" style={{ top: `calc(5.5rem + ${i * 12}px)` }}>
      <motion.article
        style={{ scale: reduced ? 1 : scale }}
        className="grid origin-top overflow-hidden rounded-4xl border border-white/10 bg-coal md:grid-cols-[1fr_1.1fr]"
      >
        <div className="order-2 flex flex-col px-4 pb-4 pt-3 md:order-1 md:p-8 lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <span className="caption-3 font-mono uppercase tracking-widest text-dim">
              0{i + 1} / 0{n}
            </span>
            <span
              className={`caption-3 rounded-full px-3 py-1 ${p.level === 'Beginner friendly' ? 'bg-volt text-ink' : 'bg-white/10 text-white'}`}
            >
              {p.level}
            </span>
          </div>
          <h3 className="heading-6 md:heading-4 lg:heading-3 mt-3 text-white md:mt-8">{p.name}</h3>
          <p className="title-4 md:title-2 mt-1 text-white md:mt-2">{p.promise}</p>
          <p className="caption-1 md:body-6 lg:body-3 mt-2 text-muted md:mt-3">{p.body}</p>

          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-3 md:mt-auto md:gap-4 md:border-0 md:pt-8">
            <div>
              <dt className="caption-4 font-mono uppercase tracking-widest text-dim">Length</dt>
              <dd className="title-4 mt-1 font-mono text-white">{p.duration}</dd>
            </div>
            <div>
              <dt className="caption-4 font-mono uppercase tracking-widest text-dim">Intensity</dt>
              <dd className="mt-2">
                <Intensity value={p.intensity} />
              </dd>
            </div>
            <div>
              <dt className="caption-4 font-mono uppercase tracking-widest text-dim">Coach</dt>
              <dd className="title-4 mt-1 text-white">{coachName(p.coach)}</dd>
            </div>
          </dl>
          <a
            href="#schedule"
            className="caption-1 md:title-4 group -my-3 mt-1 inline-flex items-center gap-2 self-start rounded-full py-3 text-volt md:my-0 md:py-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt md:mt-6"
          >
            {p.times}
            <ArrowRight size={14} weight="bold" className="transition-transform duration-300 ease-forge group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </div>

        {/* Outer radius 32 with an 8px inset gives the footage 24 (B3). */}
        <div className="order-1 p-2 md:order-2">
          {/* Phones show the whole 16:9 shot; side by side layouts fill the column. */}
          <div className="relative aspect-video overflow-hidden rounded-3xl md:aspect-auto md:h-full md:min-h-96">
            <LoopVideo name={p.video} cut="wide" active={front} className="absolute inset-0 size-full object-cover" />
            <span className="absolute inset-0 bg-ink/10" aria-hidden="true" />
          </div>
        </div>
      </motion.article>
    </div>
  )
}
