import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { CLASSES_PER_WEEK, GYM } from '../lib/data'
import { EASE } from '../lib/motion'
import { Reveal } from './ui/Reveal'

const STATS = [
  { value: GYM.members, decimals: 0, suffix: '', label: 'members training every week' },
  { value: GYM.rating, decimals: 1, suffix: '★', label: 'from 312 Google reviews' },
  { value: 10, decimals: 0, suffix: '', label: 'athletes per coach, never more' },
  { value: CLASSES_PER_WEEK, decimals: 0, suffix: '', label: 'coached classes every week' },
]

function Counter({ value, decimals }: { value: number; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduced = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    if (reduced) {
      el.textContent = value.toFixed(decimals)
      return
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = v.toFixed(decimals)
      },
    })
    return () => controls.stop()
  }, [inView, value, decimals, reduced])
  return (
    <span ref={ref} aria-hidden="true">
      {(0).toFixed(decimals)}
    </span>
  )
}

export function Stats() {
  return (
    <section aria-label="Forge in numbers" className="bg-ink pb-8 pt-16 md:pb-12 md:pt-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Reveal>
          <dl className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col justify-between gap-6 rounded-3xl p-4 md:min-h-44 md:p-6 ${i === 0 ? 'bg-volt text-ink' : 'bg-coal text-white'}`}
              >
                <dt className="sr-only">{s.label}</dt>
                <dd className="heading-3 md:heading-2 font-mono">
                  <Counter value={s.value} decimals={s.decimals} />
                  {s.suffix && <span className="heading-5 ml-1 align-top text-volt">{s.suffix}</span>}
                  <span className="sr-only">{s.value.toFixed(s.decimals)}</span>
                </dd>
                <dd className={`body-6 ${i === 0 ? 'text-ink/70' : 'text-muted'}`} aria-hidden="true">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
