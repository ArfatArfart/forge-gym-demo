import { Check, X } from '@phosphor-icons/react'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'

const ALONE = [
  'The same three exercises every week',
  'Nobody checks your form until something hurts',
  'Progress stalls somewhere around month two',
  'You skip when motivation dips, and nobody notices',
]

const FORGE = [
  'A 12 week block written by a coach, so every session has a purpose',
  'Form corrected on every working set, in real time',
  'Loads planned to go up week by week, then tested',
  'A class time with nine people expecting to see you',
]

export function Problem() {
  return (
    <section aria-labelledby="problem-title" className="bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeader
          titleId="problem-title"
          eyebrow="The problem"
          title={
            <>
              Gyms sell key cards. <br className="hidden md:block" />
              <span className="text-muted">We sell a plan.</span>
            </>
          }
          lead="Training alone works for a few months. Then the gains flatten, the motivation fades and the membership turns into a monthly donation."
        />

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 md:gap-6">
          <Reveal className="rounded-3xl border border-white/10 bg-coal p-6 md:p-8">
            <p className="title-4 font-mono uppercase tracking-widest text-dim">Training on your own</p>
            <ul className="mt-6 flex flex-col gap-4">
              {ALONE.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/5 text-dim">
                    <X size={12} weight="bold" aria-hidden="true" />
                  </span>
                  <span className="body-3 text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-ember/30 bg-forge p-6 md:p-8">
            <p className="title-4 font-mono uppercase tracking-widest text-ember">Training at Forge</p>
            <ul className="mt-6 flex flex-col gap-4">
              {FORGE.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ember text-ink">
                    <Check size={12} weight="bold" aria-hidden="true" />
                  </span>
                  <span className="body-2 text-white">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
