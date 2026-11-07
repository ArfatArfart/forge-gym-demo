import { Check, ShieldCheck } from '@phosphor-icons/react'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'
import { Rail } from './ui/Rail'
import { Button } from './ui/Button'
import { PLANS } from '../lib/data'

export function Pricing() {
  const featured = PLANS.findIndex((p) => p.featured)
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeader
          titleId="pricing-title"
          eyebrow="Membership"
          title={
            <>
              One free class, <br />
              <span className="text-muted">then pick your pace.</span>
            </>
          }
          lead="Every membership starts with a free trial class and assessment. Classes, open gym and the Forge app are all included."
        />

        <Reveal className="mt-8 md:mt-16">
          <Rail label="Membership plans" grid="md:grid-cols-3" start={featured}>
            {PLANS.map((p) => {
              const hi = p.featured
              return (
                <article
                  key={p.name}
                  className={`flex h-full flex-col rounded-4xl p-5 md:p-8 ${hi ? 'bg-volt text-ink' : 'border border-white/10 bg-coal text-white'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="heading-6">{p.name}</h3>
                    {hi && <span className="caption-3 rounded-full bg-ink px-3 py-1 font-mono uppercase tracking-widest text-volt">Most chosen</span>}
                  </div>
                  <p className={`body-6 mt-2 ${hi ? 'text-ink/70' : 'text-muted'}`}>{p.blurb}</p>
                  <p className="mt-5 flex items-baseline gap-2 md:mt-8">
                    <span className="heading-3 md:heading-2 font-mono">${p.price}</span>
                    <span className={`caption-2 ${hi ? 'text-ink/70' : 'text-muted'}`}>per month</span>
                  </p>
                  <ul className="mt-5 flex flex-1 flex-col gap-2 md:mt-8 md:gap-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${hi ? 'bg-ink text-volt' : 'bg-volt text-ink'}`}>
                          <Check size={12} weight="bold" aria-hidden="true" />
                        </span>
                        <span className="body-6">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    href="#book"
                    arrow
                    variant={hi ? 'dark' : 'secondary'}
                    className="mt-6 w-full md:mt-8"
                  >
                    Start with a free class
                  </Button>
                </article>
              )
            })}
          </Rail>
        </Reveal>

        <Reveal className="mt-4 flex flex-col items-start gap-3 rounded-4xl border border-white/10 bg-coal p-5 md:mt-6 md:flex-row md:items-center md:gap-4 md:p-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-volt text-ink">
            <ShieldCheck size={20} weight="bold" aria-hidden="true" />
          </span>
          <p className="body-6 text-muted">
            <span className="body-4 text-white">No contracts. </span>
            Month to month, cancel with 30 days notice. Freeze for up to two months a year at no cost, and if your first
            month is not for you, we refund it in full.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
