import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'
import { COACHES } from '../lib/data'
import { asset } from '../lib/asset'

export function Coaches() {
  return (
    <section id="coaches" aria-labelledby="coaches-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeader
          titleId="coaches-title"
          eyebrow="Coaches"
          title={
            <>
              Coached by people <br className="hidden md:block" />
              who still lift
            </>
          }
          lead="Three full time coaches, each certified, each still training and competing. You will know them all by name within a month."
        />

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {COACHES.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.1}>
              {/* Outer radius 24 with an 8px inset gives the photo 16 (B3). */}
              <article className="group h-full rounded-3xl border border-white/10 bg-coal p-2 transition-colors duration-300 ease-forge hover:border-white/20">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <img
                    src={asset(`images/${c.image}`)}
                    alt={c.alt}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover grayscale transition-transform duration-700 ease-forge group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 bg-ink/20" aria-hidden="true" />
                  {/* 16 radius photo with a 12px inset gives the stat chip 4 (rounded). */}
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded bg-ink/75 px-3 py-2 backdrop-blur-md">
                    <span className="caption-4 font-mono uppercase tracking-widest text-muted">{c.lift.label}</span>
                    <span className="title-4 font-mono text-white">{c.lift.value}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="title-1 text-white">{c.name}</h3>
                  <p className="body-6 mt-1 text-muted">{c.role}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {c.credentials.map((cred) => (
                      <li key={cred} className="caption-4 rounded-full bg-white/5 px-3 py-1 text-muted">
                        {cred}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
