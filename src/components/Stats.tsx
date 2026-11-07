import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { CLASSES_PER_WEEK, GYM } from '../lib/data'
import { EASE } from '../lib/motion'
import { Reveal } from './ui/Reveal'

const STATS = [
  { value: GYM.members, decimals: 0, label: 'members training with us every week' },
  { value: GYM.rating, decimals: 1, label: 'average rating across 312 Google reviews' },
  { value: 10, decimals: 0, label: 'athletes per coach, never more' },
  { value: CLASSES_PER_WEEK, decimals: 0, label: 'coached classes on the weekly schedule' },
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
    <section aria-label="Forge in numbers" className="bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-2 bg-ink p-6 md:p-8">
                <dt className="sr-only">{s.label}</dt>
                <dd className="heading-4 md:heading-3 font-mono text-white">
                  <Counter value={s.value} decimals={s.decimals} />
                  <span className="sr-only">{s.value.toFixed(s.decimals)}</span>
                </dd>
                <dd className="body-6 text-muted" aria-hidden="true">
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
