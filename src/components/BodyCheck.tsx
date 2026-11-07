import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { Drop, Barbell, Minus, Plus, Ruler, Scales } from '@phosphor-icons/react'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'
import { Button } from './ui/Button'
import { EASE } from '../lib/motion'

/* ───────────── BMI maths ───────────── */

type Units = 'imperial' | 'metric'
type Zone = { id: string; label: string; short: string; from: number; to: number; text: string; fill: string; program: string; advice: string }

const ZONES: Zone[] = [
  {
    id: 'under',
    label: 'Underweight',
    short: 'Under',
    from: 15,
    to: 18.5,
    text: 'text-sky',
    fill: 'bg-sky',
    program: 'Strength',
    advice: 'Build muscle with Strength three times a week, and your coach will help you eat to grow.',
  },
  {
    id: 'healthy',
    label: 'Healthy weight',
    short: 'Healthy',
    from: 18.5,
    to: 25,
    text: 'text-volt',
    fill: 'bg-volt',
    program: 'Strength or Barbell club',
    advice: 'You have a good base. Strength or Barbell club will turn it into numbers you can be proud of.',
  },
  {
    id: 'over',
    label: 'Overweight',
    short: 'Over',
    from: 25,
    to: 30,
    text: 'text-amber',
    fill: 'bg-amber',
    program: 'Conditioning and Strength',
    advice: 'Conditioning burns the most energy per hour, and Strength keeps the muscle you already have.',
  },
  {
    id: 'obese',
    label: 'Obese',
    short: 'Obese',
    from: 30,
    to: 40,
    text: 'text-danger',
    fill: 'bg-danger',
    program: 'Foundations',
    advice: 'Start with Foundations: low impact, coached from the first rep, and nobody rushes you.',
  },
]
const STROKE: Record<string, string> = { under: '#8ecbff', healthy: '#d4ff3a', over: '#ffb547', obese: '#ff6b5e' }

const MIN = 15
const MAX = 40
const zoneOf = (bmi: number) => ZONES.find((z) => bmi < z.to) ?? ZONES[ZONES.length - 1]

const KG_PER_LB = 0.45359237
const CM_PER_IN = 2.54
const LIMITS = {
  metric: { h: [140, 210, 1], w: [40, 160, 1] },
  imperial: { h: [55, 83, 1], w: [90, 350, 1] }, // inches, pounds
} as const

/* ───────────── Gauge geometry (viewBox 240 x 136, centre 120,124) ───────────── */

const CX = 120
const CY = 124
const R = 102
const toDeg = (bmi: number) => (180 * (Math.min(Math.max(bmi, MIN), MAX) - MIN)) / (MAX - MIN)
const point = (bmi: number, r = R) => {
  const a = (toDeg(bmi) * Math.PI) / 180
  return [CX - r * Math.cos(a), CY - r * Math.sin(a)] as const
}
const arc = (from: number, to: number) => {
  const [x0, y0] = point(from)
  const [x1, y1] = point(to)
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

/* ───────────── Section ───────────── */

export function BodyCheck() {
  const [units, setUnits] = useState<Units>('metric')
  const [cm, setCm] = useState(178)
  const [kg, setKg] = useState(76)

  const m = cm / 100
  const bmi = kg / (m * m)
  const zone = zoneOf(bmi)
  const low = 18.5 * m * m
  const high = 24.9 * m * m

  const fmtW = (k: number) => (units === 'metric' ? `${Math.round(k)} kg` : `${Math.round(k / KG_PER_LB)} lb`)
  const inches = Math.round(cm / CM_PER_IN)
  const heightText = units === 'metric' ? `${Math.round(cm)} cm` : `${Math.floor(inches / 12)} ft ${inches % 12} in`
  const weightText = fmtW(kg)

  const gap = bmi < 18.5 ? { verb: 'Gain', kg: low - kg } : bmi > 24.9 ? { verb: 'Lose', kg: kg - high } : null
  // Protein is set from the nearest healthy weight, so it never scales with excess body fat.
  const proteinG = Math.round(1.6 * Math.min(Math.max(kg, low), high))
  const waterL = (0.035 * kg).toFixed(1)

  const L = LIMITS[units]
  const hVal = units === 'metric' ? Math.round(cm) : inches
  const wVal = units === 'metric' ? Math.round(kg) : Math.round(kg / KG_PER_LB)
  const setH = (v: number) => setCm(units === 'metric' ? v : v * CM_PER_IN)
  const setW = (v: number) => setKg(units === 'metric' ? v : v * KG_PER_LB)

  return (
    <section id="body-check" aria-labelledby="body-check-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeader
          titleId="body-check-title"
          eyebrow="Body check"
          title={
            <>
              Find your starting point. <br />
              <span className="text-muted">Ten seconds, no sign up.</span>
            </>
          }
          lead="Move the sliders to see your BMI, a healthy weight for your height, and what to eat and drink each day."
        />

        <Reveal className="mt-10 md:mt-16">
          {/* Phones: inputs, gauge, advice. Desktop: inputs above advice on the left, gauge on the right. */}
          <div className="grid gap-2 md:gap-4 lg:grid-cols-[1fr_1.1fr] lg:grid-rows-[auto_1fr]">
            {/* Inputs */}
            <div className="flex flex-col gap-6 rounded-4xl border border-white/10 bg-coal p-4 md:p-8 lg:col-start-1 lg:row-start-1">
              <div className="flex items-center justify-between gap-4">
                <p className="title-3 text-white">Your details</p>
                <div role="group" aria-label="Units" className="flex rounded-full bg-steel p-1">
                  {(
                    [
                      ['metric', 'kg · cm'],
                      ['imperial', 'lb · ft'],
                    ] as const
                  ).map(([u, label]) => (
                    <button
                      key={u}
                      type="button"
                      aria-pressed={units === u}
                      onClick={() => setUnits(u)}
                      className={`caption-1 min-h-9 rounded-full px-3 font-mono transition-colors duration-300 ease-forge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                        units === u ? 'bg-volt text-ink' : 'text-muted hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Control
                icon={<Ruler size={18} weight="bold" aria-hidden="true" />}
                label="Height"
                valueText={heightText}
                value={hVal}
                min={L.h[0]}
                max={L.h[1]}
                step={L.h[2]}
                onChange={setH}
                unitLabel={units === 'metric' ? 'centimetre' : 'inch'}
              />
              <Control
                icon={<Scales size={18} weight="bold" aria-hidden="true" />}
                label="Weight"
                valueText={weightText}
                value={wVal}
                min={L.w[0]}
                max={L.w[1]}
                step={L.w[2]}
                onChange={setW}
                unitLabel={units === 'metric' ? 'kilogram' : 'pound'}
              />

              <dl className="grid grid-cols-2 gap-2">
                <Stat label="Healthy weight for you" value={`${fmtW(low).split(' ')[0]} to ${fmtW(high)}`} />
                <Stat
                  label="To reach that range"
                  value={gap ? `${gap.verb} ${fmtW(gap.kg)}` : 'You are in range'}
                  tone={gap ? undefined : 'text-volt'}
                />
                <Stat label="Protein per day" value={`${proteinG} g`} icon={<Barbell size={14} weight="bold" aria-hidden="true" />} />
                <Stat label="Water per day" value={`${waterL} L`} icon={<Drop size={14} weight="bold" aria-hidden="true" />} />
              </dl>
            </div>

            {/* Gauge */}
            <div className="flex flex-col justify-center rounded-4xl border border-white/10 bg-coal p-4 md:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <Gauge bmi={bmi} zone={zone} />
              <p className="caption-2 mt-6 text-dim">
                BMI is a quick screening number, not a diagnosis. It cannot tell muscle from fat, so strong lifters often read high. Your
                coach measures body fat and mobility at your free assessment.
              </p>
            </div>

            {/* Advice */}
            <div className="flex flex-col justify-center rounded-4xl border border-white/10 bg-coal p-4 md:p-8 lg:col-start-1 lg:row-start-2">
              <div>
                <p className="caption-3 font-mono uppercase tracking-widest text-volt">Your coach suggests</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <p className="title-1 mt-2 text-white">{zone.program}</p>
                    <p className="body-6 mt-1 text-muted">{zone.advice}</p>
                  </motion.div>
                </AnimatePresence>
                <Button href="#book" arrow className="mt-6 w-full sm:w-auto">
                  Book a free assessment
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────── Speedometer ───────────── */

function Gauge({ bmi, zone }: { bmi: number; zone: Zone }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const reduced = !!useReducedMotion()
  const spring = { stiffness: 70, damping: 13, mass: 0.9 }
  // The needle rests on the left stop until the gauge scrolls in, then sweeps to the reading.
  const angle = useSpring(reduced ? toDeg(bmi) - 90 : -90, spring)
  const number = useSpring(reduced ? bmi : MIN, { stiffness: 70, damping: 18 })
  const display = useTransform(number, (v) => v.toFixed(1))

  useEffect(() => {
    if (!inView && !reduced) return
    if (reduced) {
      angle.jump(toDeg(bmi) - 90)
      number.jump(bmi)
    } else {
      angle.set(toDeg(bmi) - 90)
      number.set(bmi)
    }
  }, [bmi, inView, reduced, angle, number])

  const ticks = useMemo(() => {
    const out: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = []
    for (let b = MIN; b <= MAX; b += 1) {
      const major = b % 5 === 0
      const [x1, y1] = point(b, R - 13)
      const [x2, y2] = point(b, R - (major ? 22 : 18))
      out.push({ x1, y1, x2, y2, major })
    }
    return out
  }, [])

  const labels = [15, 18.5, 25, 30, 40].map((b) => {
    const [x, y] = point(b, R - 32)
    return { b, x, y }
  })

  return (
    <div>
      <div
        ref={ref}
        role="img"
        aria-label={`BMI ${bmi.toFixed(1)}, ${zone.label.toLowerCase()}`}
        className="relative mx-auto aspect-[240/136] w-full max-w-[460px]"
      >
        <svg viewBox="0 0 240 136" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          {/* Track, then the four zones with hairline gaps between them */}
          <path d={arc(MIN, MAX)} fill="none" stroke="#272727" strokeWidth="16" />
          {ZONES.map((z, i) => (
            <path
              key={z.id}
              d={arc(z.from + (i ? 0.18 : 0), z.to - (i < ZONES.length - 1 ? 0.18 : 0))}
              fill="none"
              stroke={STROKE[z.id]}
              strokeWidth="16"
              style={{ opacity: z.id === zone.id ? 1 : 0.28, transition: 'opacity 400ms cubic-bezier(0.22,1,0.36,1)' }}
            />
          ))}
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.major ? '#a3a3a3' : '#313131'} strokeWidth={t.major ? 1.5 : 1} />
          ))}
          {labels.map((l) => (
            <text
              key={l.b}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#6e6e6e"
              style={{ font: '500 7px "Geist Mono", ui-monospace, monospace' }}
            >
              {l.b}
            </text>
          ))}
        </svg>

        {/* Needle: an HTML layer so it rotates on the compositor */}
        <motion.div
          className="absolute bottom-[8.8%] left-1/2 h-[64%] w-[4.2%]"
          style={{ x: '-50%', rotate: angle, transformOrigin: '50% 100%' }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 10 87" preserveAspectRatio="none" className="size-full">
            <polygon points="5,0 9,82 5,87 1,82" fill="#ffffff" />
          </svg>
        </motion.div>
        <span
          className="absolute bottom-[8.8%] left-1/2 aspect-square w-[7%] -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-coal bg-white"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 flex flex-col items-center text-center" aria-live="polite">
        <p className="caption-3 font-mono uppercase tracking-widest text-muted">Your BMI</p>
        <motion.p className="heading-3 md:heading-2 mt-1 font-mono text-white">{display}</motion.p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={zone.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`title-3 mt-1 ${zone.text}`}
          >
            {zone.label}
          </motion.p>
        </AnimatePresence>
      </div>

      <ul className="mt-6 grid grid-cols-4 gap-1" aria-label="BMI ranges">
        {ZONES.map((z) => (
          <li key={z.id} className={`flex flex-col items-center gap-1 transition-opacity duration-300 ${z.id === zone.id ? 'opacity-100' : 'opacity-50'}`}>
            <span className={`h-1 w-full rounded-full ${z.fill}`} aria-hidden="true" />
            <span className="caption-4 text-white">{z.short}</span>
            <span className="caption-5 font-mono text-dim">
              {z.id === 'under' ? '< 18.5' : z.id === 'obese' ? '30 +' : `${z.from} to ${z.to}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ───────────── Inputs ───────────── */

function Control(props: {
  icon: ReactNode
  label: string
  valueText: string
  value: number
  min: number
  max: number
  step: number
  unitLabel: string
  onChange: (v: number) => void
}) {
  const { icon, label, valueText, value, min, max, step, unitLabel, onChange } = props
  const id = useId()
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  const pct = ((clamp(value) - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="caption-1 flex items-center gap-2 text-muted">
          {icon}
          {label}
        </label>
        <span className="title-2 font-mono text-white">{valueText}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <StepButton label={`Less ${label.toLowerCase()}, one ${unitLabel}`} onClick={() => onChange(clamp(value - step))} disabled={value <= min}>
          <Minus size={16} weight="bold" />
        </StepButton>
        {/* Native range for touch, keyboard and screen readers; the visible track and thumb are drawn over it. */}
        <div className="relative h-11 flex-1">
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={clamp(value)}
            aria-valuetext={valueText}
            onChange={(e) => onChange(Number(e.target.value))}
            className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none opacity-0"
          />
          <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-steel" aria-hidden="true">
            <span className="absolute inset-0 origin-left bg-volt" style={{ transform: `scaleX(${pct / 100})` }} />
          </span>
          <span className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2" aria-hidden="true">
            <span className="block" style={{ transform: `translateX(${pct}%)` }}>
              <span className="block size-6 -translate-x-1/2 rounded-full border-4 border-coal bg-white" />
            </span>
          </span>
          <span className="pointer-events-none absolute inset-0 rounded-full ring-volt peer-focus-visible:ring-2" aria-hidden="true" />
        </div>
        <StepButton label={`More ${label.toLowerCase()}, one ${unitLabel}`} onClick={() => onChange(clamp(value + step))} disabled={value >= max}>
          <Plus size={16} weight="bold" />
        </StepButton>
      </div>
    </div>
  )
}

function StepButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-steel text-white transition-[background-color,transform] duration-200 ease-forge hover:bg-slate active:scale-95 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
    >
      {children}
    </button>
  )
}

function Stat({ label, value, tone, icon }: { label: string; value: string; tone?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-steel p-3 md:p-4">
      <dt className="caption-4 flex items-center gap-1 font-mono uppercase tracking-widest text-dim">
        {icon}
        {label}
      </dt>
      <dd className={`title-3 mt-1 ${tone ?? 'text-white'}`}>{value}</dd>
    </div>
  )
}
