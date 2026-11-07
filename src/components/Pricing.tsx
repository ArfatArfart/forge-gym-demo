import { Check, ShieldCheck } from '@phosphor-icons/react'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'
import { Button } from './ui/Button'
import { PLANS } from '../lib/data'

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeader
          titleId="pricing-title"
          eyebrow="Membership"
          title={
            <>
              One free class, <br className="hidden md:block" />
              then pick your pace
            </>
          }
          lead="Every membership starts with a free trial class and assessment. Prices include everything: classes, open gym and the Forge app."
        />

        <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-3 lg:gap-6">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <article
                className={`relative flex h-full flex-col rounded-3xl border p-6 md:p-8 ${
                  p.featured ? 'border-ember/50 bg-forge' : 'border-white/10 bg-coal'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="heading-6 text-white">{p.name}</h3>
                  {p.featured && (
                    <span className="caption-3 rounded-full bg-ember px-3 py-1 font-mono uppercase tracking-widest text-ink">
                      Most chosen
                    </span>
                  )}
                </div>
                <p className="body-6 mt-2 text-muted">{p.blurb}</p>
                <p className="mt-8 flex items-baseline gap-2">
                  <span className="heading-2 font-mono text-white">${p.price}</span>
                  <span className="caption-2 text-muted">per month</span>
                </p>
                <ul className="mt-8 flex flex-1 flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />
                      <span className="body-6 text-white">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button href="#book" variant={p.featured ? 'primary' : 'secondary'} arrow className="mt-8 w-full">
                  Start with a free class
                </Button>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-6 flex flex-col items-start gap-4 rounded-3xl border border-white/10 bg-coal p-6 md:flex-row md:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-ember">
            <ShieldCheck size={20} weight="duotone" aria-hidden="true" />
          </span>
          <p className="body-6 text-muted">
            <span className="body-4 text-white">No contracts. </span>
            Memberships are month to month and cancel with 30 days notice. Freeze for up to two months a year at no
            cost, and if your first month is not for you, we refund it in full.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
