import { Quotes, Star } from '@phosphor-icons/react'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'
import { GYM, TESTIMONIALS } from '../lib/data'

export function Testimonials() {
  return (
    <section id="results" aria-labelledby="results-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            titleId="results-title"
            eyebrow="Results"
            title="Members, measured"
            lead="We do not post before and after photos. We post numbers."
          />
          <Reveal className="flex items-center gap-4 rounded-2xl border border-white/10 bg-coal px-4 py-3">
            <span className="heading-5 font-mono text-white">{GYM.rating}</span>
            <span>
              <span className="flex gap-0.5 text-ember" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} weight="fill" />
                ))}
              </span>
              <span className="caption-2 text-muted">{GYM.reviews} Google reviews</span>
            </span>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-3xl border border-white/10 bg-coal p-6 md:p-8">
                <div>
                  <p className="heading-3 font-mono text-ember">{t.metric}</p>
                  <p className="caption-1 mt-1 text-muted">{t.metricLabel}</p>
                </div>
                <Quotes size={24} weight="fill" className="mt-8 text-white/10" aria-hidden="true" />
                <blockquote className="body-3 mt-2 flex-1 text-white">{t.quote}</blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="title-4 flex size-10 items-center justify-center rounded-full bg-steel text-white" aria-hidden="true">
                    {t.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </span>
                  <span>
                    <span className="title-4 block text-white">{t.name}</span>
                    <span className="caption-5 text-muted">{t.meta}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
