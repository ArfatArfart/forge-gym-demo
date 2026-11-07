import { Star } from '@phosphor-icons/react'
import { Reveal } from './ui/Reveal'
import { Rail } from './ui/Rail'
import { GYM, TESTIMONIALS } from '../lib/data'

export function Testimonials() {
  return (
    <section id="results" aria-labelledby="results-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[680px]">
            <p className="caption-3 font-mono uppercase tracking-widest text-volt">Results</p>
            <h2 id="results-title" className="heading-4 md:heading-2 mt-4 text-white">
              No before and afters. <br />
              <span className="text-muted">Just numbers.</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 self-start rounded-3xl bg-coal px-4 py-3 md:self-auto">
            <span className="heading-4 font-mono text-white">{GYM.rating}</span>
            <span>
              <span className="flex gap-0.5 text-volt" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} weight="fill" />
                ))}
              </span>
              <span className="caption-2 text-muted">{GYM.reviews} Google reviews</span>
            </span>
          </div>
        </Reveal>

        <Reveal className="mt-10 md:mt-16">
          <Rail label="Member results">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="flex h-full flex-col rounded-4xl border border-white/10 bg-coal p-6 md:p-8">
                <p className="heading-2 font-mono text-volt">{t.metric}</p>
                <p className="caption-1 mt-2 text-white">{t.metricLabel}</p>
                <blockquote className="body-3 mt-6 flex-1 text-muted">“{t.quote}”</blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="title-4 flex size-10 items-center justify-center rounded-full bg-volt text-ink" aria-hidden="true">
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
            ))}
          </Rail>
        </Reveal>
      </div>
    </section>
  )
}
