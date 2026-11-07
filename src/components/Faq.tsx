import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus } from '@phosphor-icons/react'
import { FAQS, GYM } from '../lib/data'
import { EASE } from '../lib/motion'
import { Reveal } from './ui/Reveal'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 md:gap-12 md:px-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <p className="caption-3 font-mono uppercase tracking-widest text-volt">FAQ</p>
          <h2 id="faq-title" className="heading-4 md:heading-2 mt-4 text-white">
            Questions before your first class
          </h2>
          <p className="body-6 md:body-3 mt-4 text-muted md:mt-6">
            Still unsure? Call the front desk on{' '}
            <a href="tel:+15035550148" className="text-white underline decoration-white/30 underline-offset-4 transition-colors duration-300 ease-forge hover:decoration-volt">
              {GYM.phone}
            </a>{' '}
            or email{' '}
            <a href={`mailto:${GYM.email}`} className="text-white underline decoration-white/30 underline-offset-4 transition-colors duration-300 ease-forge hover:decoration-volt">
              {GYM.email}
            </a>
            .
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="flex flex-col gap-2">
            {FAQS.map((f, i) => {
              const isOpen = open === i
              return (
                <li key={f.q} className={`rounded-2xl border transition-colors duration-300 ease-forge ${isOpen ? 'border-white/15 bg-coal' : 'border-white/10 bg-ink hover:bg-coal'}`}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="title-3 md:title-2 flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left text-white md:gap-6 md:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                    >
                      {f.q}
                      <Plus
                        size={20}
                        weight="bold"
                        aria-hidden="true"
                        className={`shrink-0 transition-transform duration-500 ease-forge ${isOpen ? 'rotate-45 text-volt' : 'text-muted'}`}
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="px-4 pb-4 md:px-6 md:pb-6"
                    >
                      <p className="body-6 md:body-3 max-w-2xl text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
