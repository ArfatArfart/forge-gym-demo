import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Barbell, ChartLineUp, Clock, Lightning, UsersThree } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'
import { EASE } from '../lib/motion'
import { asset } from '../lib/asset'
import { HOURS } from '../lib/data'

function CardText({ icon: I, title, children }: { icon: Icon; title: string; children: ReactNode }) {
  return (
    <div>
      <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-ember">
        <I size={20} weight="duotone" aria-hidden="true" />
      </span>
      <h3 className="heading-6 mt-6 text-white">{title}</h3>
      <p className="body-6 mt-2 max-w-md text-muted">{children}</p>
    </div>
  )
}

/* Program progression: 12 weekly bars with deloads at weeks 4 and 8 and a test at 12. */
const WEEKS = [52, 60, 68, 46, 64, 72, 80, 54, 76, 84, 92, 100]

function ProgressionChart() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  return (
    <div ref={ref} className="mt-8 rounded-2xl bg-ink p-4" aria-hidden="true">
      <div className="caption-4 flex items-center justify-between font-mono uppercase tracking-widest text-dim">
        <span>Block 3</span>
        <span className="text-ember">Week 7 of 12</span>
      </div>
      <div className="mt-4 flex h-24 items-end gap-1">
        {WEEKS.map((h, i) => (
          <motion.span
            key={i}
            className={`block flex-1 origin-bottom rounded-sm ${i === 6 ? 'bg-ember' : i < 6 ? 'bg-white/40' : 'bg-white/10'}`}
            style={{ height: `${h}%` }}
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : undefined}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.04 }}
          />
        ))}
      </div>
      <div className="caption-5 mt-2 flex justify-between font-mono text-dim">
        <span>W1</span>
        <span>Deload</span>
        <span>Test</span>
      </div>
    </div>
  )
}

/* Lift tracking: a member's deadlift one rep max over seven months. */
const LIFT = [102.5, 110, 117.5, 115, 125, 132.5, 137.5]
const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']

function LiftChart() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const w = 320
  const h = 120
  const min = 95
  const max = 145
  const pts = LIFT.map((v, i) => [(i / (LIFT.length - 1)) * w, h - ((v - min) / (max - min)) * h] as const)
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]

  return (
    <div ref={ref} className="mt-8 rounded-2xl bg-ink p-4" aria-hidden="true">
      <div className="flex items-baseline justify-between">
        <span className="caption-4 font-mono uppercase tracking-widest text-dim">Deadlift 1RM</span>
        <span className="title-2 font-mono text-ember">+35 kg</span>
      </div>
      <div className="relative mt-4 overflow-hidden">
        <svg viewBox={`-6 -10 ${w + 12} ${h + 20}`} className="block h-auto w-full overflow-visible">
          {[0, 0.5, 1].map((g) => (
            <line key={g} x1={0} x2={w} y1={g * h} y2={g * h} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 5" />
          ))}
          <path d={line} fill="none" stroke="#ff6a1a" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? '#ff6a1a' : '#181818'} stroke="#ff6a1a" strokeWidth={2} />
          ))}
          <text x={last[0] - 8} y={last[1] - 12} textAnchor="end" className="fill-white font-mono" fontSize="12">
            137.5 kg
          </text>
        </svg>
        {/* Reveal cover slides away (transform only), uncovering the line left to right */}
        <motion.span
          className="absolute inset-0 origin-right bg-ink"
          initial={{ scaleX: 1 }}
          animate={inView ? { scaleX: 0 } : undefined}
          transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
        />
      </div>
      <div className="caption-5 mt-2 flex justify-between font-mono text-dim">
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  )
}

function HoursChart() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  return (
    <div ref={ref} className="flex flex-col gap-4" aria-hidden="true">
      {HOURS.map((d, i) => (
        <div key={d.day} className="grid grid-cols-[88px_1fr] items-center gap-4 sm:grid-cols-[96px_1fr_160px]">
          <span className="caption-1 text-white">{d.day}</span>
          <span className="relative h-2 rounded-full bg-white/5">
            <motion.span
              className="absolute inset-y-0 origin-left rounded-full bg-ember"
              style={{ left: `${(d.open / 24) * 100}%`, width: `${((d.close - d.open) / 24) * 100}%` }}
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : undefined}
              transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.1 }}
            />
          </span>
          <span className="caption-2 col-span-2 font-mono text-muted sm:col-span-1 sm:text-right">{d.label}</span>
        </div>
      ))}
      <div className="grid grid-cols-[88px_1fr] gap-4 sm:grid-cols-[96px_1fr_160px]">
        <span />
        <div className="caption-5 flex justify-between font-mono text-dim">
          <span>12 am</span>
          <span>6 am</span>
          <span>12 pm</span>
          <span>6 pm</span>
          <span>12 am</span>
        </div>
      </div>
    </div>
  )
}

const card = 'h-full overflow-hidden rounded-3xl border border-white/10 bg-coal transition-colors duration-300 ease-forge hover:border-white/20'

export function Benefits() {
  return (
    <section id="programs" aria-labelledby="programs-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeader
          titleId="programs-title"
          eyebrow="Why Forge"
          title={
            <>
              Built for people who want <br className="hidden md:block" />
              to see the numbers move
            </>
          }
          lead="Everything here exists to make you stronger and fitter in a way you can measure. No mirrors full of selfies, no machines you will never use."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-6 md:gap-6">
          {/* Coached: photo card. Outer radius 24, inset 8, so the photo gets 16 (B3). */}
          <Reveal className="md:col-span-4">
            <article className={`${card} group flex flex-col p-2`}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl md:aspect-auto md:min-h-80 md:flex-1">
                <img
                  src={asset('images/coached.webp')}
                  alt="A coach kneeling beside a member during a push up, adjusting his hip position"
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover grayscale transition-transform duration-700 ease-forge group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 bg-ink/30" aria-hidden="true" />
                <span className="caption-3 absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 font-mono uppercase tracking-widest text-white backdrop-blur-md">
                  1 coach · 10 athletes max
                </span>
              </div>
              <div className="p-4 md:p-6">
                <CardText icon={UsersThree} title="Coached in every session">
                  A certified coach runs every class, watches every working set and adjusts your weights on the spot. You
                  never have to guess whether you are doing it right.
                </CardText>
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-2">
            <article className={`${card} flex flex-col justify-between p-6`}>
              <CardText icon={Barbell} title="Programming that progresses">
                Each block runs 12 weeks with planned increases, lighter recovery weeks and a testing day at the end.
              </CardText>
              <ProgressionChart />
            </article>
          </Reveal>

          <Reveal className="md:col-span-3">
            <article className={`${card} flex flex-col justify-between p-6 md:p-8`}>
              <CardText icon={ChartLineUp} title="Every lift tracked">
                Log your sets in the Forge app and coaches review your numbers weekly. Priya added 35 kg to her deadlift in
                seven months, and you can see every step of it.
              </CardText>
              <LiftChart />
            </article>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-3">
            <article className={`${card} group flex flex-col p-2`}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <img
                  src={asset('images/conditioning.webp')}
                  alt="An athlete working battle ropes in an open concrete space"
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover grayscale transition-transform duration-700 ease-forge group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 bg-ink/30" aria-hidden="true" />
              </div>
              <div className="p-4 md:p-6">
                <CardText icon={Lightning} title="Conditioning that carries over">
                  Short, hard sessions built around sleds, rowers, bikes and ropes. You get fitter without losing the
                  strength you built on Monday.
                </CardText>
              </div>
            </article>
          </Reveal>

          <Reveal className="md:col-span-6">
            <article className={`${card} grid gap-8 p-6 md:grid-cols-[1fr_1.4fr] md:items-center md:gap-12 md:p-8`}>
              <CardText icon={Clock} title="Open gym, included in every plan">
                Train your own program between classes with every rack, bar and plate available. Members get key fob
                access from 5:30 am on weekdays.
              </CardText>
              <HoursChart />
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
