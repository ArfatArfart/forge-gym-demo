import { Fragment, useRef, useState } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'

const LINES = ['Strength is not luck.', 'It is a written plan,', 'a coach on every rep,', 'and a number that goes up.']
const WORDS = LINES.map((l) => l.split(' '))
const TOTAL = WORDS.flat().length

/** B11: large tagline whose words light up one at a time while the section is pinned. */
export function TaglineReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [lit, setLit] = useState(0)

  // useScroll is batched to animation frames, so this is not an unthrottled scroll listener.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const n = Math.round(Math.min(Math.max((v - 0.08) / 0.72, 0), 1) * TOTAL)
    setLit((prev) => (prev === n ? prev : n))
  })

  const count = reduced ? TOTAL : lit
  let index = 0

  return (
    <section aria-label="Our approach" className="bg-forge">
      <div ref={ref} className={reduced ? '' : 'relative h-[240vh]'}>
        <div className={reduced ? 'py-24' : 'sticky top-0 flex h-[100svh] items-center'}>
          <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
            <p className="caption-3 font-mono uppercase tracking-widest text-ember">Our approach</p>
            <p className="heading-4 sm:heading-3 lg:heading-2 mt-6 max-w-[680px] text-white">
              <span className="sr-only">{LINES.join(' ')}</span>
              {WORDS.map((line, li) => (
                <span key={li} className="block" aria-hidden="true">
                  {line.map((word, wi) => {
                    const i = index++
                    return (
                      <Fragment key={wi}>
                        <span
                          className="inline-block transition-opacity duration-500 ease-forge"
                          style={{ opacity: i < count ? 1 : 0.28 }}
                        >
                          {word}
                        </span>
                        {wi < line.length - 1 && ' '}
                      </Fragment>
                    )
                  })}
                </span>
              ))}
            </p>
            <p className="caption-2 mt-12 font-mono text-dim">Forge Athletic Club · Coaching strength in Portland since 2019</p>
          </div>
        </div>
      </div>
    </section>
  )
}
